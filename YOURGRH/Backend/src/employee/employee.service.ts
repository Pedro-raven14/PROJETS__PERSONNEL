import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { hash } from 'bcrypt';

import { employeeDTO } from 'src/dto/employeeDTO';
import { Employee } from 'src/entities/employee.entity';
import { Role } from 'src/entities/role.entity';
import { Permission } from 'src/entities/permission.entity';
import { ParametreRH } from 'src/entities/parametre-rh.entity';
import { paginate, buildResult } from 'src/common/pagination';
import { NotificationService } from 'src/notification/notification.service';

// Permissions attribuées automatiquement selon le rôle si aucune n'est fournie
const PERMISSION_PACKS: Record<string, string[]> = {
  ADMIN: [
    'VIEW_EMPLOYEES',    'CREATE_EMPLOYEE',
    'VIEW_DEPARTMENTS',  'MANAGE_DEPARTMENTS',
    'VIEW_CONTRACTS',    'MANAGE_CONTRACTS',
    'VIEW_LEAVES',       'APPROVE_LEAVE',
    'VIEW_EVALUATIONS',  'MANAGE_EVALUATIONS',
    'VIEW_TRAININGS',    'MANAGE_TRAININGS',
    'VIEW_TEAM',
    'VIEW_SALARY',
    'VIEW_REPORTS',      'VIEW_AI',
  ],
  RH: [
    'VIEW_EMPLOYEES',    'CREATE_EMPLOYEE',
    'VIEW_DEPARTMENTS',  'MANAGE_DEPARTMENTS',
    'VIEW_CONTRACTS',    'MANAGE_CONTRACTS',
    'VIEW_LEAVES',       'APPROVE_LEAVE',
    'VIEW_EVALUATIONS',  'MANAGE_EVALUATIONS',
    'VIEW_TRAININGS',    'MANAGE_TRAININGS',
    'VIEW_SALARY',
    'VIEW_REPORTS',      'VIEW_AI',
  ],
  MANAGER: [
    'VIEW_TEAM',
    'VIEW_LEAVES',       'APPROVE_LEAVE',
    'VIEW_EVALUATIONS',  'MANAGE_EVALUATIONS',
    'VIEW_TRAININGS',
  ],
  EMPLOYEE: [
    'VIEW_TEAM',
  ],
};

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,

    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,

    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,

    @InjectRepository(ParametreRH)
    private readonly parametreRepo: Repository<ParametreRH>,

    private readonly notificationService: NotificationService,
  ) {}

  // --- Helpers privés ---

  private async resolveRole(role: number | string): Promise<Role> {
    const found = typeof role === 'number'
      ? await this.roleRepo.findOne({ where: { roleId: role } })
      : await this.roleRepo.findOne({ where: { nom: role.toUpperCase() } });

    if (!found) throw new NotFoundException(`Rôle "${role}" introuvable`);
    return found;
  }

  private async resolvePermissions(permissions: (number | string)[]): Promise<Permission[]> {
    const ids   = permissions.filter((p) => typeof p === 'number') as number[];
    const names = permissions.filter((p) => typeof p === 'string') as string[];
    const results: Permission[] = [];

    if (ids.length > 0) {
      results.push(...await this.permissionRepo.find({ where: { permissionId: In(ids) } }));
    }
    if (names.length > 0) {
      results.push(...await this.permissionRepo.find({
        where: { nom: In(names.map((n) => n.toUpperCase())) },
      }));
    }

    if (results.length !== permissions.length) {
      throw new NotFoundException('Une ou plusieurs permissions sont introuvables');
    }
    return results;
  }

  private async findById(userId: number): Promise<Employee> {
    const employee = await this.employeeRepo.findOne({
      where: { userId },
      relations: ['role', 'permissions', 'equipe', 'equipe.departement'],
    });
    if (!employee) throw new NotFoundException(`Employé introuvable`);
    return employee;
  }

  // --- CRUD de base ---

  async createEmployee(dto: employeeDTO) {
    const { nom, prenom, email, password, phone, poste, role, permissions } = dto;

    const exists = await this.employeeRepo.findOne({ where: { email } });
    if (exists) throw new ConflictException('Cet email est déjà utilisé au sein de l\'entreprise');

    const resolvedRole = await this.resolveRole(role);
    const isAdmin = resolvedRole.nom.toUpperCase() === 'ADMIN';

    if (isAdmin) {
      const existingAdmin = await this.employeeRepo.findOne({
        where: { role: { nom: 'ADMIN' } },
        relations: ['role'],
      });
      if (existingAdmin) throw new ConflictException('Un administrateur existe déjà dans le système');
    }

    let resolvedPermissions: Permission[] = [];
    if (permissions && permissions.length > 0) {
      resolvedPermissions = await this.resolvePermissions(permissions);
    } else {
      const packNames = PERMISSION_PACKS[resolvedRole.nom.toUpperCase()] ?? [];
      if (packNames.length > 0) {
        resolvedPermissions = await this.permissionRepo.find({ where: { nom: In(packNames) } });
      }
    }

    // Récupérer le solde initial depuis les paramètres RH
    const parametre = await this.parametreRepo.findOne({ where: {} });
    const soldeInitial = parametre?.solde_conges_initial ?? 0;

    const employee = await this.employeeRepo.save(
      this.employeeRepo.create({
        nom, prenom, email,
        password:           await hash(password, 10),
        phone,
        poste:              poste ?? undefined,
        role:               resolvedRole,
        permissions:        resolvedPermissions,
        mustChangePassword: !isAdmin,
        soldeConges:        soldeInitial,
      }),
    );

    const { password: _, ...employeeWithoutPassword } = employee;
    return {
      message:  `L'employé ${employee.prenom} ${employee.nom} a bien été enregistré`,
      employee: employeeWithoutPassword,
    };
  }

  async getAll(page = 1, limit = 10) {
    const { skip, take } = paginate(page, limit);
    const [data, total] = await this.employeeRepo.findAndCount({
      select: ['userId', 'nom', 'prenom', 'email', 'phone', 'poste', 'date_embauche', 'soldeConges', 'mustChangePassword'],
      relations: ['role', 'permissions', 'equipe', 'equipe.departement', 'equipe.manager', 'contrats'],
      skip,
      take,
    });
    return buildResult(data, total, page, limit);
  }

  async getById(userId: number) {
    return this.findById(userId);
  }

  async getEmployeebyMail(email: string) {
    return this.employeeRepo.findOne({
      where: { email },
      relations: ['role', 'permissions'],
    });
  }

  // Modifier uniquement le poste et le solde de congés
  async updateEmployee(userId: number, dto: { poste?: string; soldeConges?: number }) {
    const employee = await this.findById(userId);

    await this.employeeRepo.update(userId, dto);

    // Construire un message de notification lisible
    const changements: string[] = [];
    if (dto.poste !== undefined && dto.poste !== employee.poste) {
      changements.push(`poste → "${dto.poste}"`);
    }
    if (dto.soldeConges !== undefined && dto.soldeConges !== employee.soldeConges) {
      changements.push(`solde de congés → ${dto.soldeConges} jour(s)`);
    }

    if (changements.length > 0) {
      await this.notificationService.create(
        userId,
        `Votre profil a été mis à jour par un administrateur RH : ${changements.join(', ')}.`,
        'MODIFICATION_PROFIL',
      );
    }

    return this.findById(userId);
  }

  // --- Gestion du rôle ---

  async changerRole(userId: number, role: number | string) {
    await this.findById(userId);
    const newRole = await this.resolveRole(role);

    await this.employeeRepo.update(userId, { role: newRole });
    return { message: `Rôle mis à jour vers "${newRole.nom}"` };
  }

  // --- Gestion des permissions ---

  async ajouterPermissions(userId: number, permissions: (number | string)[]) {
    const employee = await this.findById(userId);
    const toAdd = await this.resolvePermissions(permissions);

    // Éviter les doublons
    const existingIds = new Set(employee.permissions.map((p) => p.permissionId));
    const newPerms = toAdd.filter((p) => !existingIds.has(p.permissionId));

    if (newPerms.length === 0) {
      throw new BadRequestException('L\'employé possède déjà toutes ces permissions');
    }

    employee.permissions = [...employee.permissions, ...newPerms];
    await this.employeeRepo.save(employee);
    return { message: `${newPerms.length} permission(s) ajoutée(s)`, permissions: employee.permissions };
  }

  async retirerPermissions(userId: number, permissions: (number | string)[]) {
    const employee = await this.findById(userId);
    const toRemove = await this.resolvePermissions(permissions);
    const toRemoveIds = new Set(toRemove.map((p) => p.permissionId));

    employee.permissions = employee.permissions.filter((p) => !toRemoveIds.has(p.permissionId));
    await this.employeeRepo.save(employee);
    return { message: `Permission(s) retirée(s)`, permissions: employee.permissions };
  }

  async remplacerPermissions(userId: number, permissions: (number | string)[]) {
    const employee = await this.findById(userId);
    employee.permissions = await this.resolvePermissions(permissions);
    await this.employeeRepo.save(employee);
    return { message: `Permissions remplacées`, permissions: employee.permissions };
  }

  // --- Gestion de l'équipe ---

  async retirerDeEquipe(userId: number) {
    const employee = await this.findById(userId);
    if (!employee.equipe) {
      throw new BadRequestException(`L'employé n'appartient à aucune équipe`);
    }
    await this.employeeRepo.update(userId, { equipe: null as any });
    return { message: `Employé retiré de son équipe` };
  }
}

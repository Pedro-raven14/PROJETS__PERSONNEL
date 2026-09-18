import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Equipe } from 'src/entities/equipe.entity';
import { Departement } from 'src/entities/departement.entity';
import { Employee } from 'src/entities/employee.entity';
import { CreateEquipeDto, UpdateEquipeDto } from 'src/dto/equipeDTO';
import { paginate, buildResult } from 'src/common/pagination';

const RELATIONS = ['departement', 'employes', 'employes.role', 'manager'];

@Injectable()
export class EquipeService {
  constructor(
    @InjectRepository(Equipe)
    private readonly equipeRepo: Repository<Equipe>,

    @InjectRepository(Departement)
    private readonly departementRepo: Repository<Departement>,

    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
  ) {}

  async create(dto: CreateEquipeDto) {
    const departement = await this.departementRepo.findOne({ where: { departId: dto.departId } });
    if (!departement) throw new NotFoundException(`Département introuvable`);

    let manager: Employee | null = null;
    if (dto.managerId) {
      manager = await this.employeeRepo.findOne({ where: { userId: dto.managerId } });
      if (!manager) throw new NotFoundException(`Manager introuvable`);
    }

    const equipe = await this.equipeRepo.save(
      this.equipeRepo.create({ nom: dto.nom, departement, manager }),
    );
    return { message: `Équipe ${equipe.nom} créée`, equipe };
  }

  async getAll(page = 1, limit = 10) {
    const { skip, take } = paginate(page, limit);
    const [data, total] = await this.equipeRepo.findAndCount({
      relations: RELATIONS,
      skip,
      take,
    });
    return buildResult(data, total, page, limit);
  }

  // Récupérer toutes les équipes d'un département
  async getByDepartement(departId: number) {
    const departement = await this.departementRepo.findOne({ where: { departId } });
    if (!departement) throw new NotFoundException(`Département introuvable`);

    return this.equipeRepo.find({
      where: { departement: { departId } },
      relations: RELATIONS,
    });
  }

  async getById(equipeId: number) {
    const equipe = await this.equipeRepo.findOne({
      where: { equipeId },
      relations: [...RELATIONS, 'objectifs'],
    });
    if (!equipe) throw new NotFoundException(`Équipe introuvable`);
    return equipe;
  }

  async update(equipeId: number, dto: UpdateEquipeDto) {
    const equipe = await this.getById(equipeId);

    if (dto.departId) {
      const departement = await this.departementRepo.findOne({ where: { departId: dto.departId } });
      if (!departement) throw new NotFoundException(`Département introuvable`);
      equipe.departement = departement;
    }

    if (dto.nom)       equipe.nom       = dto.nom;
    if (dto.rendement !== undefined) equipe.rendement = dto.rendement;

    // Gestion du manager : null pour retirer, number pour assigner
    if (dto.managerId === null) {
      equipe.manager = null;
    } else if (dto.managerId !== undefined) {
      const manager = await this.employeeRepo.findOne({ where: { userId: dto.managerId } });
      if (!manager) throw new NotFoundException(`Manager introuvable`);

      // Vérifier qu'il n'est pas déjà manager d'une autre équipe
      const autreEquipe = await this.equipeRepo.findOne({
        where: { manager: { userId: dto.managerId }, equipeId: Not(equipeId) },
        relations: ['manager'],
      });
      if (autreEquipe) {
        throw new BadRequestException(
          `Cet employé est déjà manager de l'équipe "${autreEquipe.nom}". Un manager ne peut gérer qu'une seule équipe.`
        );
      }

      equipe.manager = manager;
    }

    await this.equipeRepo.save(equipe);
    return this.getById(equipeId);
  }

  // Assigner un employé à une équipe
  // Vérifie qu'il n'est pas déjà dans une autre équipe
  async assignerEmploye(equipeId: number, userId: number) {
    await this.getById(equipeId);
    const employee = await this.employeeRepo.findOne({
      where: { userId },
      relations: ['equipe'],
    });
    if (!employee) throw new NotFoundException(`Employé introuvable`);

    if (employee.equipe && employee.equipe.equipeId !== equipeId) {
      throw new BadRequestException(
        `Cet employé appartient déjà à l'équipe "${employee.equipe.nom}". Retirez-le d'abord.`
      );
    }

    await this.employeeRepo.update(userId, { equipe: { equipeId } } as any);
    return { message: `Employé assigné à l'équipe` };
  }

  // Retirer un employé d'une équipe
  // Bloque si l'employé est le manager actuel de l'équipe
  async retirerEmploye(equipeId: number, userId: number) {
    const equipe = await this.getById(equipeId);
    const estDansEquipe = equipe.employes.some((e) => e.userId === userId);
    if (!estDansEquipe) throw new NotFoundException(`Cet employé n'appartient pas à cette équipe`);

    if (equipe.manager?.userId === userId) {
      throw new BadRequestException(
        `Cet employé est le manager de l'équipe. Désassignez-le d'abord en tant que manager avant de le retirer.`
      );
    }

    await this.employeeRepo.update(userId, { equipe: null as any });
    return { message: `Employé retiré de l'équipe` };
  }

  // Récupérer l'équipe dont l'employé connecté est le manager
  async getMonEquipe(managerId: number) {
    const equipe = await this.equipeRepo.findOne({
      where: { manager: { userId: managerId } },
      relations: [
        'departement',
        'manager',
        'employes',
        'employes.role',
        'employes.permissions',
        'employes.contrats',
        'employes.evaluations',
        'objectifs',
      ],
    });
    return equipe ?? null;
  }

  async delete(equipeId: number) {
    await this.getById(equipeId);
    await this.equipeRepo.delete(equipeId);
    return { message: `Équipe supprimée` };
  }
}

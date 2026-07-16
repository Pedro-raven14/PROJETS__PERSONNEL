import {
  Injectable, NotFoundException, BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HeuresSup } from '../entities/heures-sup.entity';
import { Employee } from '../entities/employee.entity';
import { CreateHeuresSupDto, ValiderHeuresSupDto } from '../dto/heuresSupDTO';

@Injectable()
export class HeuresSupService {
  constructor(
    @InjectRepository(HeuresSup)
    private readonly heuresSupRepo: Repository<HeuresSup>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
  ) {}

  /** L'employé déclare des heures supplémentaires */
  async declarer(employeeId: number, dto: CreateHeuresSupDto): Promise<HeuresSup> {
    const employee = await this.employeeRepo.findOne({ where: { userId: employeeId } });
    if (!employee) throw new NotFoundException('Employé introuvable');

    if (dto.nb_heures <= 0 || dto.nb_heures > 24) {
      throw new BadRequestException('Le nombre d\'heures doit être compris entre 0.5 et 24');
    }

    const declaration = this.heuresSupRepo.create({
      date: dto.date,
      nb_heures: dto.nb_heures,
      motif: dto.motif,
      statut: 'EN_ATTENTE',
      employee,
    });

    return this.heuresSupRepo.save(declaration);
  }

  /** Mes déclarations (employé connecté) */
  async getMesDeclarations(employeeId: number): Promise<HeuresSup[]> {
    return this.heuresSupRepo.find({
      where: { employee: { userId: employeeId } },
      relations: ['validateur'],
      order: { date: 'DESC' },
    });
  }

  /**
   * Déclarations de l'équipe du manager connecté.
   * Retourne toutes les déclarations des membres de son équipe.
   */
  async getDeclarationsEquipe(managerId: number): Promise<HeuresSup[]> {
    const manager = await this.employeeRepo.findOne({
      where: { userId: managerId },
      relations: ['equipe', 'equipe.employes'],
    });
    if (!manager || !manager.equipe) {
      return [];
    }

    const membresIds = manager.equipe.employes.map((e) => e.userId);
    if (membresIds.length === 0) return [];

    return this.heuresSupRepo
      .createQueryBuilder('hs')
      .leftJoinAndSelect('hs.employee', 'emp')
      .leftJoinAndSelect('hs.validateur', 'val')
      .where('emp.userId IN (:...ids)', { ids: membresIds })
      .orderBy('hs.date', 'DESC')
      .getMany();
  }

  /** Toutes les déclarations (RH/Admin) */
  async getAll(): Promise<HeuresSup[]> {
    return this.heuresSupRepo.find({
      relations: ['employee', 'validateur'],
      order: { date: 'DESC' },
    });
  }

  /** Déclarations d'un employé spécifique (RH/Admin) */
  async getByEmployee(userId: number): Promise<HeuresSup[]> {
    return this.heuresSupRepo.find({
      where: { employee: { userId } },
      relations: ['validateur'],
      order: { date: 'DESC' },
    });
  }

  /** Le manager/RH valide ou refuse une déclaration */
  async valider(
    heuresSupId: number,
    validateurId: number,
    dto: ValiderHeuresSupDto,
  ): Promise<HeuresSup> {
    const declaration = await this.heuresSupRepo.findOne({
      where: { heuresSupId },
      relations: ['employee', 'validateur'],
    });
    if (!declaration) throw new NotFoundException('Déclaration introuvable');

    if (declaration.statut !== 'EN_ATTENTE') {
      throw new BadRequestException('Cette déclaration a déjà été traitée');
    }

    if (dto.statut !== 'VALIDEE' && dto.statut !== 'REFUSEE') {
      throw new BadRequestException('Statut invalide — utiliser VALIDEE ou REFUSEE');
    }

    const validateur = await this.employeeRepo.findOne({ where: { userId: validateurId } });
    if (!validateur) throw new NotFoundException('Validateur introuvable');

    declaration.statut = dto.statut;
    declaration.validateur = validateur;

    return this.heuresSupRepo.save(declaration);
  }

  /** L'employé annule sa propre déclaration (seulement si EN_ATTENTE) */
  async annuler(heuresSupId: number, employeeId: number): Promise<void> {
    const declaration = await this.heuresSupRepo.findOne({
      where: { heuresSupId },
      relations: ['employee'],
    });
    if (!declaration) throw new NotFoundException('Déclaration introuvable');

    if (declaration.employee.userId !== employeeId) {
      throw new ForbiddenException('Vous ne pouvez annuler que vos propres déclarations');
    }

    if (declaration.statut !== 'EN_ATTENTE') {
      throw new BadRequestException('Impossible d\'annuler une déclaration déjà traitée');
    }

    await this.heuresSupRepo.remove(declaration);
  }

  /**
   * Calcule le total des heures supplémentaires validées d'un employé
   * sur une période donnée (utilisé par fiche-paie.service.ts).
   */
  async getTotalHeuresValidees(
    employeeId: number,
    debutPeriode: Date,
    finPeriode: Date,
  ): Promise<number> {
    const result = await this.heuresSupRepo
      .createQueryBuilder('hs')
      .select('SUM(hs.nb_heures)', 'total')
      .where('hs.employeeId = :employeeId', { employeeId })
      .andWhere('hs.statut = :statut', { statut: 'VALIDEE' })
      .andWhere('hs.date >= :debut', { debut: debutPeriode.toISOString().split('T')[0] })
      .andWhere('hs.date <= :fin', { fin: finPeriode.toISOString().split('T')[0] })
      .getRawOne();

    return Number(result?.total ?? 0);
  }
}

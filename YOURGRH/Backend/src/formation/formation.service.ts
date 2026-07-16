import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Formation } from 'src/entities/formation.entity';
import { Employee } from 'src/entities/employee.entity';
import { Competence } from 'src/entities/competence.entity';
import { CreateFormationDto, InscrireEmployeDto } from 'src/dto/formationDTO';
import { paginate, buildResult } from 'src/common/pagination';

@Injectable()
export class FormationService {
  constructor(
    @InjectRepository(Formation)
    private readonly formationRepo: Repository<Formation>,

    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,

    @InjectRepository(Competence)
    private readonly competenceRepo: Repository<Competence>,
  ) {}

  async create(dto: CreateFormationDto) {
    const debut = new Date(dto.date_debut);
    const fin   = new Date(dto.date_fin);

    // Compter les jours ouvrés lundi-vendredi uniquement
    let nbJours = 0;
    const current = new Date(debut);
    while (current <= fin) {
      const jour = current.getDay(); // 0=dim, 6=sam
      if (jour !== 0 && jour !== 6) nbJours++;
      current.setDate(current.getDate() + 1);
    }
    const duree = Math.max(1, nbJours) * dto.heures_par_jour;

    // Résoudre les compétences si fournies
    let competences: Competence[] = [];
    if (dto.competenceIds && dto.competenceIds.length > 0) {
      competences = await this.competenceRepo.findBy({ competenceId: In(dto.competenceIds) });
    }

    const formation = this.formationRepo.create({ ...dto, duree, competences });
    await this.formationRepo.save(formation);
    return { message: `Formation "${formation.titre}" créée`, formation };
  }

  async getAll(page = 1, limit = 10) {
    const { skip, take } = paginate(page, limit);
    const [data, total] = await this.formationRepo.findAndCount({
      relations: ['employes', 'competences'],
      skip,
      take,
    });
    return buildResult(data, total, page, limit);
  }

  async getById(formationId: number) {
    const formation = await this.formationRepo.findOne({
      where: { formationId },
      relations: ['employes', 'competences'],
    });
    if (!formation) throw new NotFoundException(`Formation introuvable`);
    return formation;
  }

  async inscrireEmploye(formationId: number, dto: InscrireEmployeDto) {
    const formation = await this.formationRepo.findOne({
      where: { formationId },
      relations: ['employes'],
    });
    if (!formation) throw new NotFoundException(`Formation introuvable`);

    if (formation.employes.length >= formation.capacite) {
      throw new BadRequestException(`La formation est complète`);
    }

    const employee = await this.employeeRepo.findOne({ where: { userId: dto.userId } });
    if (!employee) throw new NotFoundException(`Employé introuvable`);

    const dejaInscrit = formation.employes.some((e) => e.userId === dto.userId);
    if (dejaInscrit) throw new BadRequestException(`L'employé est déjà inscrit à cette formation`);

    formation.employes.push(employee);
    await this.formationRepo.save(formation);
    return { message: `Employé inscrit à la formation` };
  }

  async desinscrireEmploye(formationId: number, userId: number) {
    const formation = await this.formationRepo.findOne({
      where: { formationId },
      relations: ['employes'],
    });
    if (!formation) throw new NotFoundException(`Formation introuvable`);

    const inscrit = formation.employes.some((e) => e.userId === userId);
    if (!inscrit) throw new BadRequestException(`L'employé n'est pas inscrit à cette formation`);

    formation.employes = formation.employes.filter((e) => e.userId !== userId);
    await this.formationRepo.save(formation);
    return { message: `Employé désinscrit de la formation` };
  }

  async getFormationsEmployee(userId: number) {
    return this.formationRepo
      .createQueryBuilder('formation')
      .innerJoin('formation.employes', 'employe', 'employe.userId = :userId', { userId })
      .leftJoinAndSelect('formation.competences', 'competences')
      .getMany();
  }

  async update(formationId: number, dto: Partial<CreateFormationDto>) {
    const formation = await this.formationRepo.findOne({
      where: { formationId },
      relations: ['competences'],
    });
    if (!formation) throw new NotFoundException(`Formation introuvable`);

    // Mettre à jour les compétences si fournies
    if (dto.competenceIds !== undefined) {
      if (dto.competenceIds.length > 0) {
        formation.competences = await this.competenceRepo.findBy({
          competenceId: In(dto.competenceIds),
        });
      } else {
        formation.competences = [];
      }
    }

    // Mettre à jour les autres champs
    const { competenceIds, ...rest } = dto;
    Object.assign(formation, rest);
    await this.formationRepo.save(formation);
    return { message: `Formation mise à jour`, formation };
  }

  async delete(formationId: number) {
    await this.getById(formationId);
    await this.formationRepo.delete(formationId);
    return { message: `Formation supprimée` };
  }
}

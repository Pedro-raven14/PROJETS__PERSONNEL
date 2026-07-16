import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Competence } from 'src/entities/competence.entity';
import { EmployeCompetence } from 'src/entities/employe_competence.entity';
import { Employee } from 'src/entities/employee.entity';
import { AssignerCompetenceDto, CreateCompetenceDto, UpdateNiveauDto } from 'src/dto/competenceDTO';

@Injectable()
export class CompetencesService {
  constructor(
    @InjectRepository(Competence)
    private readonly competenceRepo: Repository<Competence>,

    @InjectRepository(EmployeCompetence)
    private readonly empCompRepo: Repository<EmployeCompetence>,

    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
  ) {}

  // --- Référentiel global des compétences ---

  async creerCompetence(dto: CreateCompetenceDto) {
    const nomNormalise = dto.nom.trim();
    const exists = await this.competenceRepo.findOne({ where: { nom: nomNormalise } });
    if (exists) throw new ConflictException(`La compétence "${nomNormalise}" existe déjà`);

    const competence = await this.competenceRepo.save(
      this.competenceRepo.create({ nom: nomNormalise, categorie: dto.categorie }),
    );
    return { message: `Compétence "${competence.nom}" créée`, competence };
  }

  async getToutesLesCompetences() {
    return this.competenceRepo.find({ order: { nom: 'ASC' } });
  }

  // --- Compétences d'un employé ---

  // Assigner une compétence à un employé
  // Si la compétence n'existe pas dans le référentiel → elle est créée automatiquement
  async assignerCompetence(userId: number, dto: AssignerCompetenceDto) {
    const employee = await this.employeeRepo.findOne({ where: { userId } });
    if (!employee) throw new NotFoundException(`Employé introuvable`);

    const nomNormalise = dto.nom.trim();

    // Trouver ou créer la compétence dans le référentiel
    let competence = await this.competenceRepo.findOne({ where: { nom: nomNormalise } });
    if (!competence) {
      competence = await this.competenceRepo.save(
        this.competenceRepo.create({ nom: nomNormalise, categorie: dto.categorie }),
      );
    }

    // Vérifier si l'employé a déjà cette compétence
    const existante = await this.empCompRepo.findOne({
      where: { employee: { userId }, competence: { competenceId: competence.competenceId } },
    });

    if (existante) {
      // Mettre à jour le niveau
      await this.empCompRepo.update(existante.id, { niveau: dto.niveau });
      return { message: `Niveau mis à jour pour "${competence.nom}"` };
    }

    // Créer la liaison
    await this.empCompRepo.save(
      this.empCompRepo.create({ employee, competence, niveau: dto.niveau }),
    );
    return { message: `Compétence "${competence.nom}" assignée (niveau ${dto.niveau})` };
  }

  // Récupérer toutes les compétences d'un employé
  async getCompetencesEmployee(userId: number) {
    const employee = await this.employeeRepo.findOne({ where: { userId } });
    if (!employee) throw new NotFoundException(`Employé introuvable`);

    return this.empCompRepo.find({
      where: { employee: { userId } },
      relations: ['competence'],
      order: { niveau: 'DESC' },
    });
  }

  // Mettre à jour le niveau d'une compétence d'un employé
  async mettreAJourNiveau(userId: number, competenceId: number, dto: UpdateNiveauDto) {
    const ec = await this.empCompRepo.findOne({
      where: { employee: { userId }, competence: { competenceId } },
      relations: ['competence'],
    });
    if (!ec) throw new NotFoundException(`Compétence introuvable pour cet employé`);

    await this.empCompRepo.update(ec.id, { niveau: dto.niveau });
    return { message: `Niveau mis à jour vers ${dto.niveau}` };
  }

  // Retirer une compétence d'un employé
  async retirerCompetence(userId: number, competenceId: number) {
    const ec = await this.empCompRepo.findOne({
      where: { employee: { userId }, competence: { competenceId } },
    });
    if (!ec) throw new NotFoundException(`Compétence introuvable pour cet employé`);

    await this.empCompRepo.delete(ec.id);
    return { message: `Compétence retirée` };
  }
}

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conge } from 'src/entities/conge.entity';
import { Employee } from 'src/entities/employee.entity';
import { TypeConge } from 'src/entities/typeconge.entity';
import { ParametreRH } from 'src/entities/parametre-rh.entity';
import { NotificationService } from 'src/notification/notification.service';
import { CreateCongeDto, ValiderCongeDto } from 'src/dto/congeDTO';
import { paginate, buildResult } from 'src/common/pagination';

@Injectable()
export class CongesService {
  constructor(
    @InjectRepository(Conge)
    private readonly congeRepo: Repository<Conge>,

    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,

    @InjectRepository(TypeConge)
    private readonly typeCongeRepo: Repository<TypeConge>,

    @InjectRepository(ParametreRH)
    private readonly parametreRepo: Repository<ParametreRH>,

    private readonly notificationService: NotificationService,
  ) {}

  async demanderConge(userId: number, dto: CreateCongeDto) {
    const employee = await this.employeeRepo.findOne({
      where: { userId },
      relations: ['equipe', 'equipe.manager'],
    });
    if (!employee) throw new NotFoundException(`Employé introuvable`);

    const typeConge = await this.typeCongeRepo.findOne({ where: { typeCId: dto.typeCId } });
    if (!typeConge) throw new NotFoundException(`Type de congé introuvable`);

    // Vérifier le délai de préavis (en jours ouvrés)
    const parametre = await this.parametreRepo.findOne({ where: {} });
    const nbJoursPreavis = parametre?.nb_jours_preavis_conge ?? 3;

    const aujourd_hui = new Date();
    aujourd_hui.setHours(0, 0, 0, 0);
    const dateDebut = new Date(dto.date_debut);
    dateDebut.setHours(0, 0, 0, 0);

    // Compter les jours ouvrés (lun-ven) entre aujourd'hui et date_debut
    let joursOuvresAvant = 0;
    const cursor = new Date(aujourd_hui);
    while (cursor < dateDebut) {
      const jour = cursor.getDay();
      if (jour !== 0 && jour !== 6) joursOuvresAvant++;
      cursor.setDate(cursor.getDate() + 1);
    }

    if (joursOuvresAvant < nbJoursPreavis) {
      throw new BadRequestException(
        `La demande doit être soumise au moins ${nbJoursPreavis} jour(s) ouvré(s) avant la date de début. Il reste ${joursOuvresAvant} jour(s) ouvré(s).`
      );
    }

    // Vérifier que le solde est suffisant
    const duree = Math.ceil(
      (new Date(dto.date_fin).getTime() - new Date(dto.date_debut).getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

    if (employee.soldeConges < duree) {
      throw new BadRequestException(
        `Solde insuffisant. Vous avez ${employee.soldeConges} jour(s) disponible(s) mais la demande nécessite ${duree} jour(s).`
      );
    }

    const conge = await this.congeRepo.save(
      this.congeRepo.create({
        ...dto,
        demandeur: employee,
        typeConge,
        statut: 'EN_ATTENTE',
      }),
    );

    // Notifier le manager de l'équipe si l'employé en a un
    const manager = employee.equipe?.manager;
    if (manager) {
      await this.notificationService.create(
        manager.userId,
        `${employee.prenom} ${employee.nom} a soumis une demande de congé (${typeConge.nomType}) du ${new Date(dto.date_debut).toLocaleDateString('fr-FR')} au ${new Date(dto.date_fin).toLocaleDateString('fr-FR')}.`,
        'CONGE',
      );
    }

    return { message: `Demande de congé soumise`, conge };
  }

  async validerConge(congeId: number, validateurId: number, dto: ValiderCongeDto) {
    const conge = await this.congeRepo.findOne({
      where: { congeId },
      relations: ['demandeur', 'typeConge'],
    });
    if (!conge) throw new NotFoundException(`Congé introuvable`);
    if (conge.statut !== 'EN_ATTENTE') {
      throw new BadRequestException(`Ce congé a déjà été traité`);
    }

    const validateur = await this.employeeRepo.findOne({ where: { userId: validateurId } });
    if (!validateur) throw new NotFoundException(`Validateur introuvable`);

    await this.congeRepo.update(congeId, {
      statut:     dto.statut,
      validateur: validateur,
    });

    const demandeur = conge.demandeur;

    if (dto.statut === 'APPROUVE') {
      // Décrémenter le solde uniquement si approuvé
      const duree = Math.ceil(
        (new Date(conge.date_fin).getTime() - new Date(conge.date_debut).getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;
      const nouveauSolde = Math.max(0, demandeur.soldeConges - duree);
      await this.employeeRepo.update(demandeur.userId, { soldeConges: nouveauSolde });

      // Notifier l'employé que sa demande est approuvée
      await this.notificationService.create(
        demandeur.userId,
        `Votre demande de congé (${conge.typeConge?.nomType ?? ''}) du ${new Date(conge.date_debut).toLocaleDateString('fr-FR')} au ${new Date(conge.date_fin).toLocaleDateString('fr-FR')} a été approuvée. Nouveau solde : ${nouveauSolde} jour(s).`,
        'CONGE',
      );
    } else {
      // Notifier l'employé que sa demande est refusée
      await this.notificationService.create(
        demandeur.userId,
        `Votre demande de congé du ${new Date(conge.date_debut).toLocaleDateString('fr-FR')} au ${new Date(conge.date_fin).toLocaleDateString('fr-FR')} a été refusée.`,
        'CONGE',
      );
    }

    return { message: `Congé ${dto.statut === 'APPROUVE' ? 'approuvé' : 'refusé'}` };
  }

  async annulerConge(congeId: number, userId: number) {
    const conge = await this.congeRepo.findOne({
      where: { congeId },
      relations: ['demandeur'],
    });
    if (!conge) throw new NotFoundException(`Congé introuvable`);
    if (conge.demandeur.userId !== userId) {
      throw new BadRequestException(`Vous ne pouvez annuler que vos propres demandes`);
    }
    if (conge.statut !== 'EN_ATTENTE') {
      throw new BadRequestException(`Seules les demandes en attente peuvent être annulées`);
    }

    await this.congeRepo.delete(congeId);
    return { message: `Demande de congé annulée` };
  }

  async getCongesEmployee(userId: number) {
    return this.congeRepo.find({
      where: { demandeur: { userId } },
      relations: ['typeConge', 'validateur'],
    });
  }

  // Congés de tous les membres d'une équipe (pour le manager)
  async getCongesEquipe(managerId: number) {
    // Trouver l'équipe dont cet employé est le manager
    const manager = await this.employeeRepo.findOne({
      where: { userId: managerId },
      relations: ['equipe', 'equipe.employes'],
    });

    if (!manager?.equipe) return [];

    const memberIds = manager.equipe.employes.map((e) => e.userId);
    if (memberIds.length === 0) return [];

    return this.congeRepo.find({
      where: memberIds.map((id) => ({ demandeur: { userId: id } })),
      relations: ['demandeur', 'typeConge', 'validateur'],
      order: { date_debut: 'DESC' },
    });
  }

  async getAll(page = 1, limit = 10) {
    const { skip, take } = paginate(page, limit);
    const [data, total] = await this.congeRepo.findAndCount({
      relations: ['demandeur', 'typeConge', 'validateur'],
      skip,
      take,
    });
    return buildResult(data, total, page, limit);
  }
}

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { FichePaie } from '../entities/fiche-paie.entity';
import { Employee } from '../entities/employee.entity';
import { Contrat } from '../entities/contrat.entity';
import { Conge } from '../entities/conge.entity';
import { ParametreRH } from '../entities/parametre-rh.entity';
import { Notification } from '../entities/notification.entity';
import { HeuresSupService } from '../heures-sup/heures-sup.service';
import { FichePaiePdfService } from './fiche-paie-pdf.service';
import { FichePaieStorageService } from './fiche-paie-storage.service';
import { CreateFichePaieDTO } from '../dto/fichePaieDTO';
import { paginate, buildResult, PaginatedResult } from '../common/pagination';

// Constante légale béninoise : (40h × 52 semaines) ÷ 12 mois
const DIVISEUR_HORAIRE_LEGAL = 173.33;

// Tranches légales béninoises pour les heures supplémentaires
const TAUX_SUP_TRANCHE_1 = 1.12;
const TAUX_SUP_TRANCHE_2 = 1.35;
const HEURES_SUP_TRANCHE_1_MAX = 8;

function calculerMontantHeuresSup(tauxHoraire: number, nbHeuresSup: number): number {
  if (nbHeuresSup <= 0) return 0;

  if (nbHeuresSup <= HEURES_SUP_TRANCHE_1_MAX) {
    return tauxHoraire * TAUX_SUP_TRANCHE_1 * nbHeuresSup;
  } else {
    const montantTranche1 = tauxHoraire * TAUX_SUP_TRANCHE_1 * HEURES_SUP_TRANCHE_1_MAX;
    const montantTranche2 = tauxHoraire * TAUX_SUP_TRANCHE_2 * (nbHeuresSup - HEURES_SUP_TRANCHE_1_MAX);
    return montantTranche1 + montantTranche2;
  }
}

@Injectable()
export class FichePaieService {
  constructor(
    @InjectRepository(FichePaie)
    private readonly fichePaieRepo: Repository<FichePaie>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    @InjectRepository(Contrat)
    private readonly contratRepo: Repository<Contrat>,
    @InjectRepository(Conge)
    private readonly congeRepo: Repository<Conge>,
    @InjectRepository(ParametreRH)
    private readonly parametreRepo: Repository<ParametreRH>,
    @InjectRepository(Notification)
    private readonly notifRepo: Repository<Notification>,
    private readonly heuresSupService: HeuresSupService,
    private readonly pdfService: FichePaiePdfService,
    private readonly storageService: FichePaieStorageService,
  ) {}

  async generer(dto: CreateFichePaieDTO): Promise<FichePaie> {
    const { userId, periode } = dto;

    const employee = await this.employeeRepo.findOne({ where: { userId } });
    if (!employee) throw new NotFoundException('Employé introuvable');

    const existing = await this.fichePaieRepo.findOne({
      where: { periode, employee: { userId } },
    });
    if (existing) {
      throw new BadRequestException(`Une fiche de paie existe déjà pour la période ${periode}`);
    }

    const contrat = await this.contratRepo.findOne({
      where: { employee: { userId }, statut: 'ACTIF' },
    });
    if (!contrat) throw new NotFoundException('Aucun contrat actif trouvé pour cet employé');
    if (!contrat.salaire || Number(contrat.salaire) === 0) {
      throw new BadRequestException('Données salariales manquantes sur le contrat actif');
    }

    const [annee, mois] = periode.split('-').map(Number);
    const debutPeriode = new Date(annee, mois - 1, 1);
    const finPeriode   = new Date(annee, mois, 0);

    const congesApprouves = await this.congeRepo.find({
      where: {
        demandeur: { userId },
        statut: 'APPROUVE',
        date_debut: Between(debutPeriode, finPeriode),
      },
      relations: ['typeConge'],
    });

    let nbJoursAbsence = 0;
    for (const conge of congesApprouves) {
      if (!conge.typeConge?.impacte_salaire) continue;
      const debut = new Date(conge.date_debut);
      const fin   = new Date(conge.date_fin);
      const diff  = Math.ceil((fin.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      nbJoursAbsence += diff;
    }

    const nbHeuresSup = await this.heuresSupService.getTotalHeuresValidees(
      userId,
      debutPeriode,
      finPeriode,
    );

    const salaireBase       = Number(contrat.salaire);
    const tauxHoraire       = salaireBase / DIVISEUR_HORAIRE_LEGAL;
    const salaireJournalier = tauxHoraire * 8;
    const deductionAbsence  = Math.round(salaireJournalier * nbJoursAbsence * 100) / 100;
    const montantHeuresSup  = Math.round(calculerMontantHeuresSup(tauxHoraire, nbHeuresSup) * 100) / 100;
    const salaireNet        = Math.round((salaireBase - deductionAbsence + montantHeuresSup) * 100) / 100;

    const fiche = this.fichePaieRepo.create({
      periode,
      salaire_base:       salaireBase,
      nb_jours_absence:   nbJoursAbsence,
      deduction_absence:  deductionAbsence,
      nb_heures_sup:      nbHeuresSup,
      montant_heures_sup: montantHeuresSup,
      salaire_net:        salaireNet,
      employee,
    });

    const ficheSauvee = await this.fichePaieRepo.save(fiche);

    // Générer et uploader le PDF
    await this.genererEtUploaderPdf(ficheSauvee);

    return this.fichePaieRepo.findOne({
      where: { ficheId: ficheSauvee.ficheId },
      relations: ['employee'],
    }) as Promise<FichePaie>;
  }

  /** Génère le PDF d'une fiche et l'upload sur Supabase Storage */
  private async genererEtUploaderPdf(fiche: FichePaie): Promise<void> {
    try {
      const ficheAvecEmployee = await this.fichePaieRepo.findOne({
        where: { ficheId: fiche.ficheId },
        relations: ['employee'],
      });
      if (!ficheAvecEmployee) return;

      const buffer   = await this.pdfService.genererBuffer(ficheAvecEmployee);
      const fileName = `fiche_${ficheAvecEmployee.ficheId}_${ficheAvecEmployee.employee.userId}_${fiche.periode}.pdf`;
      const url      = await this.storageService.uploadPdf(buffer, fileName);

      await this.fichePaieRepo.update(fiche.ficheId, { documentPath: url });
    } catch (e) {
      // Ne pas bloquer si le PDF échoue — la fiche est quand même sauvegardée
      console.error('Erreur génération PDF fiche de paie :', e);
    }
  }

  /** Notifie TOUS les employés actifs que les fiches de paie sont disponibles */
  async notifierTousEmployes(periode: string): Promise<void> {
    const employes = await this.employeeRepo.find();
    const moisFormate = this.formatPeriode(periode);

    const notifications = employes.map((emp) =>
      this.notifRepo.create({
        message: `Votre fiche de paie pour ${moisFormate} est disponible. Consultez-la dans l'onglet "Salaire & Paie".`,
        type: 'PAIE',
        employee: emp,
      }),
    );

    await this.notifRepo.save(notifications);
  }

  /** Formate "2025-04" → "avril 2025" */
  private formatPeriode(periode: string): string {
    const [annee, mois] = periode.split('-').map(Number);
    const date = new Date(annee, mois - 1, 1);
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }

  async genererTous(periode: string): Promise<{ generes: number; ignores: number; erreurs: string[] }> {
    const contratsActifs = await this.contratRepo.find({
      where: { statut: 'ACTIF' },
      relations: ['employee'],
    });

    if (contratsActifs.length === 0) {
      throw new BadRequestException('Aucun employé avec un contrat actif trouvé');
    }

    let generes = 0;
    let ignores = 0;
    const erreurs: string[] = [];

    for (const contrat of contratsActifs) {
      const userId = contrat.employee.userId;

      const existing = await this.fichePaieRepo.findOne({
        where: { periode, employee: { userId } },
      });
      if (existing) {
        ignores++;
        continue;
      }

      try {
        await this.generer({ userId, periode });
        generes++;
      } catch (e: any) {
        erreurs.push(`${contrat.employee.prenom} ${contrat.employee.nom} : ${e.message}`);
      }
    }

    // Notifier tous les employés si au moins une fiche a été générée
    if (generes > 0) {
      await this.notifierTousEmployes(periode);
    }

    return { generes, ignores, erreurs };
  }

  async getAll(page = 1, limit = 10): Promise<PaginatedResult<FichePaie>> {
    const { skip, take } = paginate(page, limit);
    const [data, total] = await this.fichePaieRepo.findAndCount({
      skip, take,
      relations: ['employee'],
      order: { date_generation: 'DESC' },
    });
    return buildResult(data, total, page, limit);
  }

  async getByEmployee(userId: number, page = 1, limit = 10): Promise<PaginatedResult<FichePaie>> {
    const { skip, take } = paginate(page, limit);
    const [data, total] = await this.fichePaieRepo.findAndCount({
      where: { employee: { userId } },
      skip, take,
      relations: ['employee'],
      order: { date_generation: 'DESC' },
    });
    return buildResult(data, total, page, limit);
  }

  /** Fiches de l'employé connecté */
  async getMesFiches(userId: number, page = 1, limit = 10): Promise<PaginatedResult<FichePaie>> {
    return this.getByEmployee(userId, page, limit);
  }

  async getById(ficheId: number): Promise<FichePaie> {
    const fiche = await this.fichePaieRepo.findOne({
      where: { ficheId },
      relations: ['employee'],
    });
    if (!fiche) throw new NotFoundException('Fiche de paie introuvable');
    return fiche;
  }

  /** Retourne l'URL du PDF (redirect côté controller) */
  async getDocumentUrl(ficheId: number): Promise<string> {
    const fiche = await this.getById(ficheId);
    if (!fiche.documentPath) {
      throw new NotFoundException('Aucun document PDF disponible pour cette fiche');
    }
    return fiche.documentPath;
  }
}

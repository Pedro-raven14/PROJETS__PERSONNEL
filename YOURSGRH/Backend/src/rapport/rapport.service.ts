import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rapport } from 'src/entities/rapport.entity';
import { Employee } from 'src/entities/employee.entity';
import { Contrat } from 'src/entities/contrat.entity';
import { Conge } from 'src/entities/conge.entity';
import { Formation } from 'src/entities/formation.entity';
import { Evaluation } from 'src/entities/evaluation.entity';
import { RapportPdfService, DonneesRapport, StatsEffectifs, StatsConges, StatsFormations, StatsEvaluations } from './rapport-pdf.service';
import { SupabaseRapportService } from './supabase-rapport.service';

export type TypeRapport = 'EFFECTIFS' | 'CONGES' | 'FORMATIONS' | 'EVALUATIONS' | 'COMPLET';

@Injectable()
export class RapportService {
  constructor(
    @InjectRepository(Rapport)
    private readonly rapportRepo: Repository<Rapport>,

    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,

    @InjectRepository(Contrat)
    private readonly contratRepo: Repository<Contrat>,

    @InjectRepository(Conge)
    private readonly congeRepo: Repository<Conge>,

    @InjectRepository(Formation)
    private readonly formationRepo: Repository<Formation>,

    @InjectRepository(Evaluation)
    private readonly evaluationRepo: Repository<Evaluation>,

    private readonly pdfService: RapportPdfService,
    private readonly storageService: SupabaseRapportService,
  ) {}

  // ─── Génération ─────────────────────────────────────────────────────────────

  async generer(type: TypeRapport, genereParId: number) {
    const generePar = await this.employeeRepo.findOne({ where: { userId: genereParId } });
    if (!generePar) throw new NotFoundException(`Employé introuvable`);

    const nomGenerateur = `${generePar.prenom} ${generePar.nom}`;
    const donnees: DonneesRapport = { type, generePar: nomGenerateur };

    // Collecter les données selon le type
    if (type === 'EFFECTIFS' || type === 'COMPLET') {
      donnees.effectifs = await this.collecterEffectifs();
    }
    if (type === 'CONGES' || type === 'COMPLET') {
      donnees.conges = await this.collecterConges();
    }
    if (type === 'FORMATIONS' || type === 'COMPLET') {
      donnees.formations = await this.collecterFormations();
    }
    if (type === 'EVALUATIONS' || type === 'COMPLET') {
      donnees.evaluations = await this.collecterEvaluations();
    }

    // Générer le PDF en mémoire
    const pdfBuffer = await this.pdfService.genererBuffer(donnees);

    // Upload vers Supabase Storage
    const titre = this.labelType(type);
    const fileName = `rapport_${type.toLowerCase()}_${Date.now()}.pdf`;
    const documentPath = await this.storageService.uploadPdf(pdfBuffer, fileName);

    // Sauvegarder en base
    const rapport = await this.rapportRepo.save(
      this.rapportRepo.create({
        titre: `Rapport ${titre} — ${new Date().toLocaleDateString('fr-FR')}`,
        type,
        documentPath,
        generePar,
      }),
    );

    return {
      message: `Rapport "${rapport.titre}" généré avec succès`,
      rapport,
    };
  }

  // ─── Liste ──────────────────────────────────────────────────────────────────

  async getAll() {
    return this.rapportRepo.find({
      relations: ['generePar'],
      order: { date_generation: 'DESC' },
    });
  }

  async getById(rapportId: number) {
    const rapport = await this.rapportRepo.findOne({
      where: { rapportId },
      relations: ['generePar'],
    });
    if (!rapport) throw new NotFoundException(`Rapport introuvable`);
    return rapport;
  }

  async getDocument(rapportId: number): Promise<string> {
    const rapport = await this.getById(rapportId);
    if (!rapport.documentPath) throw new NotFoundException(`Document non disponible`);
    return rapport.documentPath;
  }

  async supprimer(rapportId: number) {
    await this.getById(rapportId);
    await this.rapportRepo.delete(rapportId);
    return { message: `Rapport supprimé` };
  }

  // ─── Stats (pour le frontend sans PDF) ──────────────────────────────────────

  async getStats() {
    const [effectifs, conges, formations, evaluations] = await Promise.all([
      this.collecterEffectifs(),
      this.collecterConges(),
      this.collecterFormations(),
      this.collecterEvaluations(),
    ]);
    return { effectifs, conges, formations, evaluations };
  }

  // ─── Collecteurs de données ──────────────────────────────────────────────────

  private async collecterEffectifs(): Promise<StatsEffectifs> {
    // Total employés
    const totalEmployes = await this.employeeRepo.count();

    // Répartition par département
    const parDepartementRaw = await this.employeeRepo
      .createQueryBuilder('e')
      .leftJoin('e.equipe', 'eq')
      .leftJoin('eq.departement', 'd')
      .select('d.nom', 'nom')
      .addSelect('COUNT(e.userId)', 'total')
      .where('d.nom IS NOT NULL')
      .groupBy('d.nom')
      .orderBy('total', 'DESC')
      .getRawMany();

    const parDepartement = parDepartementRaw.map((r: any) => ({
      nom: r.nom,
      total: Number(r.total),
    }));

    // Répartition par type de contrat actif
    const parTypeContratRaw = await this.contratRepo
      .createQueryBuilder('c')
      .select('c.type', 'type')
      .addSelect('COUNT(c.contratId)', 'total')
      .where('c.statut = :statut', { statut: 'ACTIF' })
      .groupBy('c.type')
      .orderBy('total', 'DESC')
      .getRawMany();

    const parTypeContrat = parTypeContratRaw.map((r: any) => ({
      type: r.type,
      total: Number(r.total),
    }));

    // Répartition par équipe
    const parEquipeRaw = await this.employeeRepo
      .createQueryBuilder('e')
      .leftJoin('e.equipe', 'eq')
      .select('eq.nom', 'nom')
      .addSelect('COUNT(e.userId)', 'total')
      .where('eq.nom IS NOT NULL')
      .groupBy('eq.nom')
      .orderBy('total', 'DESC')
      .getRawMany();

    const parEquipe = parEquipeRaw.map((r: any) => ({
      nom: r.nom,
      total: Number(r.total),
    }));

    return { totalEmployes, parDepartement, parTypeContrat, parEquipe };
  }

  private async collecterConges(): Promise<StatsConges> {
    // Stats globales
    const totalEnAttente = await this.congeRepo.count({ where: { statut: 'EN_ATTENTE' } });
    const totalApprouves = await this.congeRepo.count({ where: { statut: 'APPROUVE' } });
    const totalRefuses   = await this.congeRepo.count({ where: { statut: 'REFUSE' } });

    // Répartition par type de congé
    const parTypeRaw = await this.congeRepo
      .createQueryBuilder('c')
      .leftJoin('c.typeConge', 'tc')
      .select('tc.nomType', 'type')
      .addSelect('COUNT(c.congeId)', 'total')
      .where('tc.nomType IS NOT NULL')
      .groupBy('tc.nomType')
      .orderBy('total', 'DESC')
      .getRawMany();

    const parType = parTypeRaw.map((r: any) => ({
      type: r.type,
      total: Number(r.total),
    }));

    return { totalEnAttente, totalApprouves, totalRefuses, parType };
  }

  private async collecterFormations(): Promise<StatsFormations> {
    const formations = await this.formationRepo.find({ relations: ['employes'] });
    const totalFormations = formations.length;
    const totalInscrits = formations.reduce((acc, f) => acc + (f.employes?.length ?? 0), 0);

    const tauxMoyen = totalFormations === 0 ? 0 : Math.round(
      formations.reduce((acc, f) => {
        const taux = f.capacite > 0 ? (f.employes?.length ?? 0) / f.capacite : 0;
        return acc + taux;
      }, 0) / totalFormations * 100
    );

    const topFormations = formations
      .sort((a, b) => (b.employes?.length ?? 0) - (a.employes?.length ?? 0))
      .slice(0, 8)
      .map(f => ({
        titre:    f.titre,
        inscrits: f.employes?.length ?? 0,
        capacite: f.capacite,
      }));

    return { totalFormations, totalInscrits, tauxMoyen, topFormations };
  }

  private async collecterEvaluations(): Promise<StatsEvaluations> {
    const evaluations = await this.evaluationRepo.find();
    const totalEvaluations = evaluations.length;

    const noteMoyenne = totalEvaluations === 0 ? 0 :
      evaluations.reduce((acc, e) => acc + Number(e.note_globale), 0) / totalEvaluations;

    // Distribution des notes par tranche
    const tranches = [
      { tranche: '0 – 1',   min: 0, max: 1   },
      { tranche: '1 – 2',   min: 1, max: 2   },
      { tranche: '2 – 3',   min: 2, max: 3   },
      { tranche: '3 – 4',   min: 3, max: 4   },
      { tranche: '4 – 5',   min: 4, max: 5.1 },
    ];

    const distribution = tranches.map(t => ({
      tranche: t.tranche,
      total: evaluations.filter(e => Number(e.note_globale) >= t.min && Number(e.note_globale) < t.max).length,
    }));

    return { totalEvaluations, noteMoyenne, distribution };
  }

  // ─── Helper ──────────────────────────────────────────────────────────────────

  private labelType(type: string): string {
    const labels: Record<string, string> = {
      EFFECTIFS:   'Effectifs',
      CONGES:      'Congés',
      FORMATIONS:  'Formations',
      EVALUATIONS: 'Évaluations',
      COMPLET:     'Complet',
    };
    return labels[type] ?? type;
  }
}

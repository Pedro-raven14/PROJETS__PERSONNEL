import { Injectable } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');

const BLUE  = '#4361ee';
const DARK  = '#1e293b';
const GRAY  = '#64748b';
const LIGHT = '#f1f5f9';
const GREEN = '#10b981';
const RED   = '#ef4444';
const ORANGE = '#f59e0b';

export interface StatsEffectifs {
  totalEmployes: number;
  parDepartement: { nom: string; total: number }[];
  parTypeContrat: { type: string; total: number }[];
  parEquipe: { nom: string; total: number }[];
}

export interface StatsConges {
  totalEnAttente: number;
  totalApprouves: number;
  totalRefuses: number;
  parType: { type: string; total: number }[];
}

export interface StatsFormations {
  totalFormations: number;
  totalInscrits: number;
  tauxMoyen: number; // % moyen d'inscription (inscrits/capacite)
  topFormations: { titre: string; inscrits: number; capacite: number }[];
}

export interface StatsEvaluations {
  totalEvaluations: number;
  noteMoyenne: number;
  distribution: { tranche: string; total: number }[];
}

export interface DonneesRapport {
  type: string;
  effectifs?: StatsEffectifs;
  conges?: StatsConges;
  formations?: StatsFormations;
  evaluations?: StatsEvaluations;
  generePar: string;
}

@Injectable()
export class RapportPdfService {

  async genererBuffer(donnees: DonneesRapport): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end',  () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const W = doc.page.width - 100;
      const L = 50;

      // ── En-tête ──────────────────────────────────────────────────────────
      doc.rect(0, 0, doc.page.width, 70).fill(BLUE);
      doc.fillColor('white').fontSize(20).font('Helvetica-Bold')
         .text('YOURSGRH', L, 15, { width: W, align: 'center' });
      doc.fontSize(10).font('Helvetica')
         .text('Gestion des Ressources Humaines', L, 42, { width: W, align: 'center' });

      doc.y = 90;

      // ── Titre rapport ─────────────────────────────────────────────────────
      const titreRapport = this.labelType(donnees.type);
      doc.fillColor(DARK).fontSize(14).font('Helvetica-Bold')
         .text(`RAPPORT ${titreRapport.toUpperCase()}`, L, doc.y, { width: W, align: 'center' });
      doc.moveDown(0.4);

      // Meta
      doc.fillColor(GRAY).fontSize(10).font('Helvetica')
         .text(`Généré le : ${new Date().toLocaleString('fr-FR')}   |   Par : ${donnees.generePar}`, L, doc.y, { width: W, align: 'center' });
      doc.moveDown(1.5);

      // ── Sections selon le type ────────────────────────────────────────────
      if (donnees.effectifs) this.sectionEffectifs(doc, donnees.effectifs, L, W);
      if (donnees.conges)    this.sectionConges(doc, donnees.conges, L, W);
      if (donnees.formations) this.sectionFormations(doc, donnees.formations, L, W);
      if (donnees.evaluations) this.sectionEvaluations(doc, donnees.evaluations, L, W);

      // ── Pied de page ──────────────────────────────────────────────────────
      doc.fontSize(8).fillColor(GRAY).font('Helvetica')
         .text(
           `Document confidentiel — YOURSGRH — ${new Date().toLocaleDateString('fr-FR')}`,
           L, doc.page.height - 35,
           { width: W, align: 'center' },
         );

      doc.end();
    });
  }

  // ─── Section Effectifs ──────────────────────────────────────────────────────
  private sectionEffectifs(doc: any, stats: StatsEffectifs, L: number, W: number) {
    this.titreSection(doc, 'EFFECTIFS', L, W);

    // KPI principal
    this.kpi(doc, 'Total employés', stats.totalEmployes.toString(), BLUE, L, W);
    doc.moveDown(0.8);

    // Répartition par département
    if (stats.parDepartement.length > 0) {
      this.sousTitre(doc, 'Répartition par département', L);
      this.tableau(doc, ['Département', 'Employés'], stats.parDepartement.map(d => [d.nom, String(d.total)]), L, W);
      doc.moveDown(0.8);
    }

    // Répartition par type de contrat
    if (stats.parTypeContrat.length > 0) {
      this.sousTitre(doc, 'Répartition par type de contrat', L);
      this.tableau(doc, ['Type de contrat', 'Contrats actifs'], stats.parTypeContrat.map(c => [c.type, String(c.total)]), L, W);
      doc.moveDown(0.8);
    }

    // Répartition par équipe
    if (stats.parEquipe.length > 0) {
      this.sousTitre(doc, 'Répartition par équipe', L);
      this.tableau(doc, ['Équipe', 'Membres'], stats.parEquipe.map(e => [e.nom, String(e.total)]), L, W);
      doc.moveDown(1);
    }
  }

  // ─── Section Congés ─────────────────────────────────────────────────────────
  private sectionConges(doc: any, stats: StatsConges, L: number, W: number) {
    this.titreSection(doc, 'CONGÉS', L, W);

    // 3 KPIs côte à côte
    const kpiW = (W - 20) / 3;
    const y = doc.y;
    this.kpiInline(doc, 'En attente', stats.totalEnAttente.toString(), ORANGE, L, kpiW, y);
    this.kpiInline(doc, 'Approuvés', stats.totalApprouves.toString(), GREEN, L + kpiW + 10, kpiW, y);
    this.kpiInline(doc, 'Refusés', stats.totalRefuses.toString(), RED, L + (kpiW + 10) * 2, kpiW, y);
    doc.y = y + 60;
    doc.moveDown(0.8);

    if (stats.parType.length > 0) {
      this.sousTitre(doc, 'Répartition par type de congé', L);
      this.tableau(doc, ['Type de congé', 'Demandes'], stats.parType.map(t => [t.type, String(t.total)]), L, W);
      doc.moveDown(1);
    }
  }

  // ─── Section Formations ─────────────────────────────────────────────────────
  private sectionFormations(doc: any, stats: StatsFormations, L: number, W: number) {
    this.titreSection(doc, 'FORMATIONS', L, W);

    const kpiW = (W - 10) / 2;
    const y = doc.y;
    this.kpiInline(doc, 'Formations actives', stats.totalFormations.toString(), BLUE, L, kpiW, y);
    this.kpiInline(doc, 'Total inscrits', stats.totalInscrits.toString(), GREEN, L + kpiW + 10, kpiW, y);
    doc.y = y + 60;
    doc.moveDown(0.4);

    this.kpi(doc, "Taux d'inscription moyen", `${stats.tauxMoyen}%`, BLUE, L, W);
    doc.moveDown(0.8);

    if (stats.topFormations.length > 0) {
      this.sousTitre(doc, 'Détail des formations', L);
      this.tableau(
        doc,
        ['Formation', 'Inscrits', 'Capacité', 'Taux'],
        stats.topFormations.map(f => [
          f.titre.length > 35 ? f.titre.substring(0, 32) + '...' : f.titre,
          String(f.inscrits),
          String(f.capacite),
          f.capacite > 0 ? `${Math.round((f.inscrits / f.capacite) * 100)}%` : '—',
        ]),
        L,
        W,
      );
      doc.moveDown(1);
    }
  }

  // ─── Section Évaluations ────────────────────────────────────────────────────
  private sectionEvaluations(doc: any, stats: StatsEvaluations, L: number, W: number) {
    this.titreSection(doc, 'ÉVALUATIONS', L, W);

    const kpiW = (W - 10) / 2;
    const y = doc.y;
    this.kpiInline(doc, 'Total évaluations', stats.totalEvaluations.toString(), BLUE, L, kpiW, y);
    this.kpiInline(doc, 'Note moyenne', stats.noteMoyenne.toFixed(2) + ' / 5', GREEN, L + kpiW + 10, kpiW, y);
    doc.y = y + 60;
    doc.moveDown(0.8);

    if (stats.distribution.length > 0) {
      this.sousTitre(doc, 'Distribution des notes', L);
      this.tableau(doc, ['Tranche', 'Nombre'], stats.distribution.map(d => [d.tranche, String(d.total)]), L, W);
      doc.moveDown(1);
    }
  }

  // ─── Helpers visuels ────────────────────────────────────────────────────────

  private titreSection(doc: any, titre: string, L: number, W: number) {
    const y = doc.y;
    doc.rect(L, y, W, 22).fill(BLUE);
    doc.fillColor('white').fontSize(11).font('Helvetica-Bold')
       .text(titre, L + 8, y + 6, { width: W - 16 });
    doc.y = y + 28;
  }

  private sousTitre(doc: any, titre: string, L: number) {
    doc.fillColor(DARK).fontSize(10).font('Helvetica-Bold').text(titre, L, doc.y);
    doc.moveDown(0.3);
  }

  private kpi(doc: any, label: string, valeur: string, couleur: string, L: number, W: number) {
    const y = doc.y;
    doc.rect(L, y, W, 36).fill(LIGHT);
    doc.fillColor(GRAY).fontSize(9).font('Helvetica').text(label, L + 8, y + 5, { width: W - 16 });
    doc.fillColor(couleur).fontSize(18).font('Helvetica-Bold').text(valeur, L + 8, y + 16, { width: W - 16 });
    doc.y = y + 42;
  }

  private kpiInline(doc: any, label: string, valeur: string, couleur: string, x: number, w: number, y: number) {
    doc.rect(x, y, w, 52).fill(LIGHT);
    doc.fillColor(GRAY).fontSize(9).font('Helvetica').text(label, x + 8, y + 6, { width: w - 16 });
    doc.fillColor(couleur).fontSize(16).font('Helvetica-Bold').text(valeur, x + 8, y + 22, { width: w - 16 });
  }

  private tableau(doc: any, entetes: string[], lignes: string[][], L: number, W: number) {
    const colW = W / entetes.length;
    let y = doc.y;

    // En-tête
    doc.rect(L, y, W, 18).fill(LIGHT);
    entetes.forEach((h, i) => {
      doc.fillColor(DARK).fontSize(9).font('Helvetica-Bold')
         .text(h, L + i * colW + 4, y + 5, { width: colW - 8 });
    });
    y += 18;

    // Lignes
    lignes.forEach((ligne, idx) => {
      const bg = idx % 2 === 0 ? 'white' : '#f8fafc';
      doc.rect(L, y, W, 16).fill(bg);
      ligne.forEach((cel, i) => {
        doc.fillColor(i === 0 ? DARK : GRAY).fontSize(9).font('Helvetica')
           .text(cel, L + i * colW + 4, y + 4, { width: colW - 8 });
      });
      // Bordure légère
      doc.rect(L, y, W, 16).strokeColor('#e2e8f0').lineWidth(0.5).stroke();
      y += 16;
    });

    doc.y = y + 4;
  }

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

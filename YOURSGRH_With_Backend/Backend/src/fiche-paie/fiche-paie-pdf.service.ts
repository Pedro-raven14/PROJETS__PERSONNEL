import { Injectable } from '@nestjs/common';
import { FichePaie } from '../entities/fiche-paie.entity';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');

const BLUE   = '#4361ee';
const DARK   = '#1e293b';
const GRAY   = '#64748b';
const LIGHT  = '#f1f5f9';
const GREEN  = '#16a34a';
const RED    = '#dc2626';
const BORDER = '#e2e8f0';

const DIVISEUR = 173.33; // constante légale béninoise
const HEURES_JOUR = 8;

function fmt(n: number): string {
  return Number(n)
    .toLocaleString('fr-FR', { useGrouping: true, minimumFractionDigits: 0, maximumFractionDigits: 2 })
    .replace(/\s/g, '\u00a0');
}

@Injectable()
export class FichePaiePdfService {
  genererBuffer(fiche: FichePaie): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const emp = fiche.employee;
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const W = doc.page.width - 100;
      const L = 50;

      // Données calculées
      const salaireBase  = Number(fiche.salaire_base);
      const deduction    = Number(fiche.deduction_absence);
      const montantSup   = Number(fiche.montant_heures_sup);
      const salaireNet   = Number(fiche.salaire_net);
      const nbJoursAbs   = Number(fiche.nb_jours_absence);
      const nbHeuresSup  = Number(fiche.nb_heures_sup);

      const tauxHoraire  = salaireBase / DIVISEUR;
      const salaireJour  = tauxHoraire * HEURES_JOUR;
      const tranche1H    = nbHeuresSup > 0 ? Math.min(nbHeuresSup, 8) : 0;
      const tranche2H    = nbHeuresSup > 8 ? nbHeuresSup - 8 : 0;
      const montantT1    = tauxHoraire * 1.12 * tranche1H;
      const montantT2    = tauxHoraire * 1.35 * tranche2H;

      // ── En-tête ───────────────────────────────────────────────
      doc.rect(0, 0, doc.page.width, 70).fill(BLUE);
      doc.fillColor('white').fontSize(20).font('Helvetica-Bold')
         .text('YOURSGRH', L, 15, { width: W, align: 'center' });
      doc.fontSize(10).font('Helvetica')
         .text('Gestion des Ressources Humaines', L, 42, { width: W, align: 'center' });

      doc.y = 90;

      // ── Titre ─────────────────────────────────────────────────
      doc.fillColor(DARK).fontSize(14).font('Helvetica-Bold')
         .text('BULLETIN DE PAIE', L, doc.y, { width: W, align: 'center' });
      doc.moveDown(0.4);
      doc.fillColor(GRAY).fontSize(11).font('Helvetica')
         .text(`Période : ${fiche.periode}`, L, doc.y, { width: W, align: 'center' });
      doc.moveDown(1.2);

      // ── Informations employé ──────────────────────────────────
      this.sectionHeader(doc, "INFORMATIONS DE L'EMPLOYÉ", L, W);
      this.infoRow(doc, 'Nom complet', `${emp.prenom} ${emp.nom}`, L, W);
      if (emp.poste) this.infoRow(doc, 'Poste',  emp.poste,  L, W);
      this.infoRow(doc, 'Email', emp.email, L, W);
      doc.moveDown(0.8);

      // ── Taux de référence ─────────────────────────────────────
      this.sectionHeader(doc, 'TAUX DE RÉFÉRENCE', L, W);
      this.calcRow(doc, 'Salaire mensuel de base',           `${fmt(salaireBase)} FCFA`,   DARK,  L, W);
      this.calcRow(doc, 'Taux horaire (base ÷ 173,33)',      `${fmt(tauxHoraire)} FCFA/h`, GRAY,  L, W, true);
      this.calcRow(doc, 'Salaire journalier (taux × 8h)',    `${fmt(salaireJour)} FCFA/j`, GRAY,  L, W, true);
      doc.moveDown(0.6);

      // ── Absences ──────────────────────────────────────────────
      this.sectionHeader(doc, 'ABSENCES', L, W);
      if (nbJoursAbs > 0) {
        this.calcRow(doc, `Nombre de jours d'absence`,                      `${nbJoursAbs} jour(s)`,            DARK, L, W);
        this.calcRow(doc, `Déduction (${nbJoursAbs}j × ${fmt(salaireJour)} FCFA)`, `− ${fmt(deduction)} FCFA`, RED,  L, W, true);
      } else {
        this.calcRow(doc, 'Aucune absence ce mois-ci', '0 FCFA déduit', GREEN, L, W);
      }
      doc.moveDown(0.6);

      // ── Heures supplémentaires ────────────────────────────────
      this.sectionHeader(doc, 'HEURES SUPPLÉMENTAIRES', L, W);
      if (nbHeuresSup > 0) {
        this.calcRow(doc, 'Heures déclarées et validées', `${nbHeuresSup}h`, DARK, L, W);
        if (tranche1H > 0) {
          this.calcRow(
            doc,
            `Tranche 1 — ${tranche1H}h × taux × 1,12 (+12%)`,
            `+ ${fmt(montantT1)} FCFA`,
            GREEN, L, W, true,
          );
        }
        if (tranche2H > 0) {
          this.calcRow(
            doc,
            `Tranche 2 — ${tranche2H}h × taux × 1,35 (+35%)`,
            `+ ${fmt(montantT2)} FCFA`,
            GREEN, L, W, true,
          );
        }
        this.calcRow(doc, 'Total heures supplémentaires', `+ ${fmt(montantSup)} FCFA`, GREEN, L, W);
      } else {
        this.calcRow(doc, 'Aucune heure supplémentaire ce mois-ci', '+ 0 FCFA', GRAY, L, W);
      }
      doc.moveDown(0.8);

      // ── Récapitulatif ─────────────────────────────────────────
      this.sectionHeader(doc, 'RÉCAPITULATIF', L, W);
      this.calcRow(doc, 'Salaire de base',                               `${fmt(salaireBase)} FCFA`, DARK,  L, W);
      if (nbJoursAbs > 0) {
        this.calcRow(doc, `− Déduction absences (${nbJoursAbs}j)`,      `− ${fmt(deduction)} FCFA`, RED,   L, W);
      }
      if (nbHeuresSup > 0) {
        this.calcRow(doc, `+ Heures supplémentaires (${nbHeuresSup}h)`, `+ ${fmt(montantSup)} FCFA`, GREEN, L, W);
      }

      // Ligne séparateur
      doc.moveDown(0.3);
      doc.moveTo(L, doc.y).lineTo(L + W, doc.y).strokeColor(BORDER).lineWidth(1).stroke();
      doc.moveDown(0.5);

      // Salaire net — bandeau bleu
      const netY = doc.y;
      doc.rect(L, netY, W, 34).fill(BLUE);
      doc.fillColor('white').fontSize(12).font('Helvetica-Bold')
         .text('SALAIRE NET À PAYER', L + 12, netY + 10, { width: W * 0.55 });
      doc.fillColor('white').fontSize(15).font('Helvetica-Bold')
         .text(fmt(salaireNet) + ' FCFA', L + W * 0.55, netY + 8, { width: W * 0.45 - 12, align: 'right' });
      doc.y = netY + 44;
      doc.moveDown(1.2);

      // ── Informations légales ──────────────────────────────────
      this.sectionHeader(doc, 'INFORMATIONS LÉGALES', L, W);
      doc.fillColor(GRAY).fontSize(8.5).font('Helvetica')
         .text(
           'Ce bulletin est établi conformément au Code du Travail béninois. ' +
           'Le taux horaire est calculé sur 173,33 heures/mois (40h × 52 sem ÷ 12). ' +
           'Heures supplémentaires : +12% pour les heures 41 à 48, +35% au-delà de la 48ème heure.',
           L, doc.y, { width: W, lineGap: 3 },
         );
      doc.moveDown(1);

      // ── Pied de page ──────────────────────────────────────────
      doc.fontSize(7.5).fillColor(GRAY).font('Helvetica')
         .text(
           `Document généré le ${new Date().toLocaleString('fr-FR')} — YOURSGRH`,
           L, doc.page.height - 32,
           { width: W, align: 'center' },
         );

      doc.end();
    });
  }

  private sectionHeader(doc: any, titre: string, L: number, W: number) {
    const y = doc.y;
    doc.rect(L, y, W, 18).fill(LIGHT);
    doc.fillColor(BLUE).fontSize(8.5).font('Helvetica-Bold')
       .text(titre, L + 6, y + 5, { width: W - 12 });
    doc.y = y + 24;
  }

  private infoRow(doc: any, label: string, valeur: string, L: number, W: number) {
    const y = doc.y;
    doc.fillColor(GRAY).fontSize(9.5).font('Helvetica')
       .text(`${label} :`, L + 6, y, { width: 130 });
    doc.fillColor(DARK).fontSize(9.5).font('Helvetica-Bold')
       .text(valeur, L + 140, y, { width: W - 140 });
    doc.y = y + 16;
  }

  private calcRow(
    doc: any,
    label: string,
    valeur: string,
    couleur: string,
    L: number,
    W: number,
    indented = false,
  ) {
    const y      = doc.y;
    const indent = indented ? 14 : 0;
    const prefix = indented ? '↳  ' : '';

    doc.fillColor(GRAY).fontSize(9.5).font('Helvetica')
       .text(`${prefix}${label}`, L + 6 + indent, y, { width: W - 165 - indent });
    doc.fillColor(couleur).fontSize(9.5).font('Helvetica-Bold')
       .text(valeur, L + W - 155, y, { width: 150, align: 'right' });

    // Hauteur dynamique basée sur ce que pdfkit a rendu
    const newY = Math.max(doc.y, y + 16);
    doc.y = newY;
  }
}

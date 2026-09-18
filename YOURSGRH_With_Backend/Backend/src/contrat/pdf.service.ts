import { Injectable } from '@nestjs/common';
import { Contrat } from 'src/entities/contrat.entity';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');

const BLUE  = '#4361ee';
const DARK  = '#1e293b';
const GRAY  = '#64748b';
const LIGHT = '#f1f5f9';

@Injectable()
export class PdfService {

  /** Génère le PDF d'un contrat et retourne un Buffer en mémoire */
  async genererContratBuffer(contrat: Contrat): Promise<Buffer> {
    return this.creerPDFBuffer(contrat, false);
  }

  /** Génère le PDF signé et retourne un Buffer en mémoire */
  async integrerSignatureBuffer(contrat: Contrat, signatureBase64: string): Promise<Buffer> {
    return this.creerPDFBuffer(contrat, true, signatureBase64);
  }

  private creerPDFBuffer(contrat: Contrat, signe: boolean, signatureBase64?: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const emp = contrat.employee;
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];

      // Collecter les chunks en mémoire au lieu d'écrire sur disque
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const W = doc.page.width - 100;
      const L = 50;

      // ── En-tête ───────────────────────────────────────────────
      doc.rect(0, 0, doc.page.width, 70).fill(BLUE);
      doc.fillColor('white').fontSize(20).font('Helvetica-Bold')
         .text('YOURSGRH', L, 15, { width: W, align: 'center' });
      doc.fontSize(10).font('Helvetica')
         .text('Gestion des Ressources Humaines', L, 42, { width: W, align: 'center' });

      doc.y = 90;

      // ── Titre ─────────────────────────────────────────────────
      const titre = signe ? 'CONTRAT DE TRAVAIL - SIGNE' : 'CONTRAT DE TRAVAIL';
      doc.fillColor(DARK).fontSize(14).font('Helvetica-Bold')
         .text(titre, L, doc.y, { width: W, align: 'center' });
      doc.moveDown(1.5);

      // ── Section employé ───────────────────────────────────────
      this.section(doc, "INFORMATIONS DE L'EMPLOYE", L, W);
      this.row(doc, 'Nom complet',  `${emp.prenom} ${emp.nom}`, L, W);
      this.row(doc, 'Email',        emp.email, L, W);
      this.row(doc, 'Telephone',    emp.phone, L, W);
      doc.moveDown(0.8);

      // ── Section contrat ───────────────────────────────────────
      this.section(doc, 'DETAILS DU CONTRAT', L, W);
      this.row(doc, 'Type',         contrat.type, L, W);
      this.row(doc, 'Poste',        contrat.poste, L, W);
      this.row(doc, 'Salaire',      `${Number(contrat.salaire).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} FCFA / mois`, L, W);
      this.row(doc, 'Date debut',   new Date(contrat.date_debut).toLocaleDateString('fr-FR'), L, W);
      this.row(
        doc,
        contrat.date_fin ? 'Date fin' : 'Duree',
        contrat.date_fin ? new Date(contrat.date_fin).toLocaleDateString('fr-FR') : 'Indeterminee (CDI)',
        L, W,
      );
      doc.moveDown(0.8);

      // ── Clauses ───────────────────────────────────────────────
      this.section(doc, 'CLAUSES', L, W);
      doc.fillColor(GRAY).fontSize(10).font('Helvetica')
         .text(
           "L'employe s'engage a respecter le reglement interieur de l'entreprise, " +
           "a maintenir la confidentialite des informations de l'entreprise, " +
           "et a exercer ses fonctions avec diligence et professionnalisme.",
           L, doc.y, { width: W, lineGap: 3 },
         );
      doc.moveDown(1);

      // ── Signature ─────────────────────────────────────────────
      this.section(doc, 'SIGNATURE', L, W);
      doc.fillColor(GRAY).fontSize(10).font('Helvetica')
         .text(
           "En signant ce document, l'employe confirme avoir lu et accepte les termes du contrat.",
           L, doc.y, { width: W },
         );
      doc.moveDown(1);

      if (signe && signatureBase64) {
        doc.fillColor(DARK).fontSize(10).font('Helvetica-Bold')
           .text(`Signe le : ${new Date().toLocaleDateString('fr-FR')}`, L, doc.y);
        doc.moveDown(0.4);
        doc.fillColor(GRAY).font('Helvetica')
           .text(`Par : ${emp.prenom} ${emp.nom}`, L, doc.y);
        doc.moveDown(0.6);
        try {
          const base64Data = signatureBase64.replace(/^data:image\/\w+;base64,/, '');
          const imgBuffer  = Buffer.from(base64Data, 'base64');
          doc.image(imgBuffer, L, doc.y, { width: 180, height: 70 });
          doc.y += 80;
        } catch {
          doc.fillColor(GRAY).font('Helvetica').text('[Signature non disponible]', L, doc.y);
          doc.moveDown(0.5);
        }
      } else {
        doc.fillColor(DARK).fontSize(10).font('Helvetica-Bold')
           .text(`Fait le : ${new Date().toLocaleDateString('fr-FR')}`, L, doc.y);
        doc.moveDown(0.8);
        doc.fillColor(GRAY).font('Helvetica')
           .text("Signature de l'employe :", L, doc.y);
        doc.moveDown(0.4);
        const sigY = doc.y;
        doc.rect(L, sigY, 220, 65).stroke('#cbd5e1');
        doc.y = sigY + 75;
      }

      // ── Pied de page ──────────────────────────────────────────
      doc.fontSize(8).fillColor(GRAY).font('Helvetica')
         .text(
           `Document genere le ${new Date().toLocaleString('fr-FR')} - YOURSGRH`,
           L, doc.page.height - 35,
           { width: W, align: 'center' },
         );

      doc.end();
    });
  }

  private section(doc: any, titre: string, L: number, W: number) {
    const y = doc.y;
    doc.rect(L, y, W, 18).fill(LIGHT);
    doc.fillColor(BLUE).fontSize(9).font('Helvetica-Bold')
       .text(titre, L + 5, y + 5, { width: W - 10 });
    doc.y = y + 24;
  }

  private row(doc: any, label: string, valeur: string, L: number, W: number) {
    const y = doc.y;
    doc.fillColor(GRAY).fontSize(10).font('Helvetica')
       .text(`${label} :`, L + 5, y, { width: 140 });
    doc.fillColor(DARK).fontSize(10).font('Helvetica-Bold')
       .text(valeur, L + 150, y, { width: W - 150 });
    doc.y = y + 18;
  }
}

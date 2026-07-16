import { useRef, useState } from "react";
import { ArrowLeft, Printer, Download, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { API_URL } from "../../../config/api";

type Contrat = {
  contratId: number;
  type: string;
  poste: string;
  salaire: number;
  date_debut: string;
  date_fin?: string;
  statut: string;
  signe: boolean;
  documentPath?: string;
  documentSignePath?: string;
};

type Props = {
  contrat: Contrat;
  employee: { userId: number; prenom: string; nom: string };
  onClose: () => void;
};

const ContratViewer = ({ contrat, employee, onClose }: Props) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeError, setIframeError] = useState(false);

  const token = localStorage.getItem("token");

  // Utiliser le PDF signé si disponible, sinon le PDF brut
  const hasPdf = !!(contrat.documentSignePath || contrat.documentPath);

  // URL du PDF avec le token en query param pour l'authentification
  const pdfUrl = hasPdf
    ? `${API_URL}/contrat/${contrat.contratId}/document?token=${token}`
    : null;

  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.focus();
      iframeRef.current.contentWindow.print();
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `contrat_${employee.nom}_${employee.prenom}_${contrat.type}.pdf`;
    a.click();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 110, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column' }}>

      {/* Barre d'outils */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.75rem 1.5rem', backgroundColor: 'var(--color-card)',
        borderBottom: '1px solid var(--color-border)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={onClose}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-display)', fontSize: '0.875rem', padding: '0.375rem 0.5rem', borderRadius: '0.375rem' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-muted)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
          >
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
            Retour
          </button>

          <div style={{ height: '1.25rem', width: '1px', backgroundColor: 'var(--color-border)' }} />

          <div>
            <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9375rem' }}>
              Contrat {contrat.type} — {employee.prenom} {employee.nom}
            </p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
              {contrat.poste} · {Number(contrat.salaire).toLocaleString('fr-FR', { useGrouping: true }).replace(/\s/g, ' ')} FCFA
              {contrat.signe
                ? <span style={{ color: 'var(--color-success)', marginLeft: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle style={{ width: '12px', height: '12px' }} /> Signé</span>
                : <span style={{ color: 'var(--color-warning)', marginLeft: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><Clock style={{ width: '12px', height: '12px' }} /> En attente de signature</span>
              }
            </p>
          </div>
        </div>

        {hasPdf && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handlePrint}
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)', backgroundColor: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.875rem', color: 'var(--color-foreground)', transition: 'background 0.15s' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-muted)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
            >
              <Printer style={{ width: '15px', height: '15px' }} />
              Imprimer
            </button>
            <button
              onClick={handleDownload}
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', backgroundColor: 'var(--color-primary)', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.875rem', color: 'var(--color-primary-foreground)', transition: 'opacity 0.15s' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.9'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
            >
              <Download style={{ width: '15px', height: '15px' }} />
              Télécharger
            </button>
          </div>
        )}
      </div>

      {/* Contenu PDF */}
      <div style={{ flex: 1, overflow: 'hidden', backgroundColor: '#525659', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {!hasPdf ? (
          <div style={{ textAlign: 'center', color: 'white' }}>
            <AlertCircle style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem', opacity: 0.6 }} />
            <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Aucun document disponible</p>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', opacity: 0.7 }}>
              Le PDF n'a pas encore été généré pour ce contrat
            </p>
          </div>
        ) : iframeError ? (
          <div style={{ textAlign: 'center', color: 'white' }}>
            <AlertCircle style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem', opacity: 0.6 }} />
            <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Impossible d'afficher le PDF</p>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', opacity: 0.7 }}>
              Le fichier est peut-être introuvable sur le serveur
            </p>
            <button
              onClick={handleDownload}
              style={{ marginTop: '1rem', padding: '0.5rem 1.25rem', borderRadius: '0.5rem', border: 'none', backgroundColor: 'var(--color-primary)', color: 'white', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 500 }}
            >
              Télécharger à la place
            </button>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={pdfUrl!}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title={`Contrat ${contrat.type} — ${employee.prenom} ${employee.nom}`}
            onError={() => setIframeError(true)}
          />
        )}
      </div>
    </div>
  );
};

export default ContratViewer;

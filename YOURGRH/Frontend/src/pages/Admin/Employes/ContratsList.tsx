import { useEffect, useState } from "react";
import { X, FileText, Eye, CheckCircle } from "lucide-react";
import axios from "axios";
import { API_URL } from "../../../config/api";
import ContratViewer from "./ContratViewer";

type Contrat = {
  contratId: number;
  type: string;
  poste: string;
  salaire: number;
  date_debut: string;
  date_fin?: string;
  statut: string;
  signe: boolean;
  signeLe?: string;
  documentPath?: string;
  documentSignePath?: string;
};

type Props = {
  employee: { userId: number; prenom: string; nom: string };
  onClose: () => void;
};

const StatutBadge = ({ statut, signe }: { statut: string; signe: boolean }) => {
  const styles: Record<string, React.CSSProperties> = {
    ACTIF:    { backgroundColor: 'color-mix(in srgb, var(--color-success) 12%, transparent)', color: 'var(--color-success)' },
    EXPIRE:   { backgroundColor: 'color-mix(in srgb, var(--color-muted-foreground) 12%, transparent)', color: 'var(--color-muted-foreground)' },
    RESILIE:  { backgroundColor: 'color-mix(in srgb, var(--color-destructive) 12%, transparent)', color: 'var(--color-destructive)' },
  };
  return (
    <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
      <span style={{ padding: '0.125rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600, ...styles[statut] }}>
        {statut}
      </span>
      <span style={{ padding: '0.125rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600, backgroundColor: signe ? 'color-mix(in srgb, var(--color-success) 12%, transparent)' : 'color-mix(in srgb, var(--color-warning) 12%, transparent)', color: signe ? 'var(--color-success)' : 'var(--color-warning)' }}>
        {signe ? <><CheckCircle style={{ width: '11px', height: '11px' }} /> Signé</> : 'Non signé'}
      </span>
    </div>
  );
};

const ContratsList = ({ employee, onClose }: Props) => {
  const token   = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [contrats,  setContrats]  = useState<Contrat[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [selected,  setSelected]  = useState<Contrat | null>(null);

  useEffect(() => {
    axios.get(`${API_URL}/contrat/employee/${employee.userId}`, { headers })
      .then((res) => {
        // Trier : ACTIF en premier, puis par date de début décroissante
        const sorted = [...res.data].sort((a, b) => {
          if (a.statut === 'ACTIF' && b.statut !== 'ACTIF') return -1;
          if (b.statut === 'ACTIF' && a.statut !== 'ACTIF') return 1;
          return new Date(b.date_debut).getTime() - new Date(a.date_debut).getTime();
        });
        setContrats(sorted);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [employee.userId]);

  if (selected) {
    return (
      <ContratViewer
        contrat={selected}
        employee={employee}
        onClose={() => setSelected(null)}
      />
    );
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ backgroundColor: 'var(--color-card)', borderRadius: '0.75rem', padding: '1.5rem', width: '100%', maxWidth: '560px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', maxHeight: '85dvh', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexShrink: 0 }}>
          <div>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 700 }}>
              Contrats
            </h2>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: 'var(--color-muted-foreground)' }}>
              {employee.prenom} {employee.nom} · {contrats.length} contrat(s)
            </p>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-muted-foreground)', padding: '0.25rem', borderRadius: '0.375rem' }}>
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        {/* Liste */}
        <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--color-muted-foreground)', padding: '2rem' }}>Chargement...</p>
          ) : contrats.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <FileText style={{ width: '2.5rem', height: '2.5rem', margin: '0 auto 0.75rem', color: 'var(--color-muted-foreground)' }} />
              <p style={{ color: 'var(--color-muted-foreground)', margin: 0 }}>Aucun contrat pour cet employé</p>
            </div>
          ) : contrats.map((c) => (
            <ContratCard
              key={c.contratId}
              contrat={c}
              onClick={() => setSelected(c)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Carte d'un contrat ---
const ContratCard = ({ contrat, onClick }: { contrat: Contrat; onClick: () => void }) => {
  const [hovered, setHovered] = useState(false);

  const hasPdf = !!(contrat.documentSignePath || contrat.documentPath);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '1rem', borderRadius: '0.625rem',
        border: `1.5px solid ${contrat.statut === 'ACTIF' ? 'var(--color-primary)' : 'var(--color-border)'}`,
        backgroundColor: hovered ? 'var(--color-muted)' : contrat.statut === 'ACTIF' ? 'color-mix(in srgb, var(--color-primary) 4%, transparent)' : 'transparent',
        cursor: 'pointer', transition: 'background 0.15s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
            <FileText style={{ width: '15px', height: '15px', color: contrat.statut === 'ACTIF' ? 'var(--color-primary)' : 'var(--color-muted-foreground)', flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9375rem' }}>
              {contrat.type}
            </span>
            {contrat.statut === 'ACTIF' && (
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-primary)', backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', padding: '0.1rem 0.4rem', borderRadius: '9999px' }}>
                EN COURS
              </span>
            )}
          </div>
          <p style={{ margin: '0 0 0.25rem', fontSize: '0.875rem', color: 'var(--color-foreground)' }}>
            {contrat.poste}
          </p>
          <p style={{ margin: '0 0 0.5rem', fontSize: '0.8125rem', color: 'var(--color-muted-foreground)' }}>
            Du {new Date(contrat.date_debut).toLocaleDateString('fr-FR')}
            {contrat.date_fin ? ` au ${new Date(contrat.date_fin).toLocaleDateString('fr-FR')}` : ' (en cours)'}
            {' · '}
            <strong style={{ color: 'var(--color-foreground)' }}>{Number(contrat.salaire).toLocaleString('fr-FR', { useGrouping: true }).replace(/\s/g, ' ')} FCFA</strong>
          </p>
          <StatutBadge statut={contrat.statut} signe={contrat.signe} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.375rem', marginLeft: '0.75rem', flexShrink: 0 }}>
          {hasPdf ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--color-primary)' }}>
              <Eye style={{ width: '13px', height: '13px' }} /> Voir le PDF
            </span>
          ) : (
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>Pas de PDF</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContratsList;

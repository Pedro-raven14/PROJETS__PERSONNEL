import { useEffect, useState } from "react";
import {
  FileText, Eye, Clock, CheckCircle, Search,
  ArrowLeft, Filter,
} from "lucide-react";
import { PageHeader } from "../../../components/element/PageHeader";
import { contratService } from "../../../lib/mockService";

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
  employee: {
    userId: number;
    nom: string;
    prenom: string;
    email: string;
  };
};

// ── Viewer PDF — non disponible en mode démo ──────────────────────────────────
const PdfViewer = ({ contrat, onClose }: { contrat: Contrat; onClose: () => void }) => (
  <div style={{ position: 'fixed', inset: 0, zIndex: 110, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column' }}>
    <div style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 1.5rem', backgroundColor: 'var(--color-card)', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
      <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-display)', fontSize: '0.875rem', padding: '0.375rem 0.5rem', borderRadius: '0.375rem' }}>
        <ArrowLeft style={{ width: '16px', height: '16px' }} /> Retour
      </button>
      <span style={{ marginLeft: '1rem', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9375rem' }}>
        {contrat.employee.prenom} {contrat.employee.nom} — {contrat.type} ({contrat.poste})
      </span>
    </div>
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#525659' }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <FileText style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem', opacity: 0.6 }} />
        <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>PDF non disponible en mode démo</p>
        <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', opacity: 0.7 }}>Les documents PDF nécessitent le backend</p>
      </div>
    </div>
  </div>
);

// ── Page principale ───────────────────────────────────────────────────────────

const STATUTS = ['Tous', 'ACTIF', 'EXPIRE', 'RESILIE'];

const Contrat = () => {
  const [contrats,        setContrats]        = useState<Contrat[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [search,          setSearch]          = useState("");
  const [filtreStatut,    setFiltreStatut]    = useState("Tous");
  const [filtreSignature, setFiltreSignature] = useState<"tous" | "signes" | "non_signes">("tous");
  const [viewing,         setViewing]         = useState<Contrat | null>(null);
  const [page,            setPage]            = useState(1);
  const LIMIT = 20;

  useEffect(() => {
    try {
      const data: Contrat[] = contratService.getAll(1000) as Contrat[];
      data.sort((a, b) => {
        if (a.statut === 'ACTIF' && b.statut !== 'ACTIF') return -1;
        if (b.statut === 'ACTIF' && a.statut !== 'ACTIF') return 1;
        return new Date(b.date_debut).getTime() - new Date(a.date_debut).getTime();
      });
      setContrats(data);
    } catch { /* silencieux */ } finally {
      setLoading(false);
    }
  }, []);

  // Filtres
  const filtered = contrats.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      c.employee.nom.toLowerCase().includes(q) ||
      c.employee.prenom.toLowerCase().includes(q) ||
      c.type.toLowerCase().includes(q) ||
      c.poste.toLowerCase().includes(q);

    const matchStatut = filtreStatut === 'Tous' || c.statut === filtreStatut;

    const matchSig =
      filtreSignature === 'tous' ||
      (filtreSignature === 'signes' && c.signe) ||
      (filtreSignature === 'non_signes' && !c.signe);

    return matchSearch && matchStatut && matchSig;
  });

  const totalPages = Math.ceil(filtered.length / LIMIT);
  const paginated  = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  const nbNonSignes = contrats.filter((c) => c.statut === 'ACTIF' && !c.signe).length;
  const nbActifs    = contrats.filter((c) => c.statut === 'ACTIF').length;

  // Reset page quand les filtres changent
  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handleStatut = (v: string) => { setFiltreStatut(v); setPage(1); };
  const handleSig    = (v: typeof filtreSignature) => { setFiltreSignature(v); setPage(1); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Gestion des contrats"
        subtitle={`${contrats.length} contrat(s) au total · ${nbActifs} actif(s)`}
      />

      {/* Alerte non signés */}
      {nbNonSignes > 0 && (
        <div style={{
          padding: '0.875rem 1rem', borderRadius: '0.625rem',
          backgroundColor: 'color-mix(in srgb, var(--color-warning) 10%, transparent)',
          border: '1px solid color-mix(in srgb, var(--color-warning) 30%, transparent)',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <Clock style={{ width: '18px', height: '18px', color: 'var(--color-warning)', flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-warning)', fontWeight: 500 }}>
            {nbNonSignes} contrat(s) actif(s) en attente de signature employé.
          </p>
          <button
            onClick={() => { handleSig('non_signes'); handleStatut('ACTIF'); }}
            style={{ marginLeft: 'auto', ...btnOutline, fontSize: '0.75rem', padding: '0.25rem 0.625rem', color: 'var(--color-warning)', borderColor: 'var(--color-warning)' }}
          >
            Voir
          </button>
        </div>
      )}

      {/* Barre de filtres */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
        {/* Recherche */}
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: '180px' }}>
          <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: 'var(--color-muted-foreground)' }} />
          <input
            type="text"
            placeholder="Rechercher un employé, poste, type..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              width: '100%', paddingLeft: '2.25rem', paddingRight: '0.75rem',
              paddingTop: '0.5rem', paddingBottom: '0.5rem',
              borderRadius: '0.5rem', border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-card)', color: 'var(--color-foreground)',
              fontFamily: 'var(--font-body)', fontSize: '0.875rem', outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Filtre statut */}
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
          <Filter style={{ width: '15px', height: '15px', color: 'var(--color-muted-foreground)', alignSelf: 'center' }} />
          {STATUTS.map((s) => (
            <button
              key={s}
              onClick={() => handleStatut(s)}
              style={{
                padding: '0.375rem 0.75rem', borderRadius: '9999px', fontSize: '0.8125rem',
                fontFamily: 'var(--font-display)', fontWeight: 500, cursor: 'pointer',
                border: '1px solid',
                borderColor: filtreStatut === s ? 'var(--color-primary)' : 'var(--color-border)',
                backgroundColor: filtreStatut === s ? 'var(--color-primary)' : 'transparent',
                color: filtreStatut === s ? 'var(--color-primary-foreground)' : 'var(--color-foreground)',
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Filtre signature */}
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          {([['tous', 'Tous'], ['signes', 'Signés'], ['non_signes', 'Non signés']] as const).map(([val, label]) => (
            <button
              key={val}
              onClick={() => handleSig(val)}
              style={{
                padding: '0.375rem 0.75rem', borderRadius: '9999px', fontSize: '0.8125rem',
                fontFamily: 'var(--font-display)', fontWeight: 500, cursor: 'pointer',
                border: '1px solid',
                borderColor: filtreSignature === val ? 'var(--color-accent)' : 'var(--color-border)',
                backgroundColor: filtreSignature === val ? 'var(--color-accent)' : 'transparent',
                color: filtreSignature === val ? 'var(--color-accent-foreground)' : 'var(--color-foreground)',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Compteur résultats */}
      {/* {(search || filtreStatut !== 'Tous' || filtreSignature !== 'tous') && (
        <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-muted-foreground)' }}>
          {filtered.length} résultat(s)
        </p>
      )} */}

      {/* Liste */}
      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--color-muted-foreground)', padding: '2rem' }}>Chargement...</p>
      ) : paginated.length === 0 ? (
        <div className="stat-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <FileText style={{ width: '2.5rem', height: '2.5rem', margin: '0 auto 0.75rem', color: 'var(--color-muted-foreground)' }} />
          <p style={{ margin: 0, color: 'var(--color-muted-foreground)' }}>Aucun contrat trouvé</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {paginated.map((c) => (
            <div
              key={c.contratId}
              style={{
                padding: '0.625rem 1rem',
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderLeft: `3px solid ${c.statut === 'ACTIF' ? 'var(--color-primary)' : 'var(--color-border)'}`,
              }}
            >
              {/* Ligne 1 : nom + type/poste + action */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.3rem' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem' }}>
                  {c.employee.prenom} {c.employee.nom}
                </span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-muted-foreground)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.type} — {c.poste}
                </span>
                {(c.documentPath || c.documentSignePath) && (
                  <button
                    onClick={() => setViewing(c)}
                    style={{ ...btnOutline, padding: '0.2rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}
                  >
                    <Eye style={{ width: '13px', height: '13px' }} /> PDF
                  </button>
                )}
              </div>

              {/* Ligne 2 : dates + salaire + badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)', whiteSpace: 'nowrap' }}>
                  {new Date(c.date_debut).toLocaleDateString('fr-FR')}
                  {c.date_fin ? ` → ${new Date(c.date_fin).toLocaleDateString('fr-FR')}` : ' → en cours'}
                </span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-foreground)', whiteSpace: 'nowrap' }}>
                  {Number(c.salaire).toLocaleString('fr-FR', { useGrouping: true, minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace(/\s/g, ' ')} FCFA
                </span>
                <div style={{ display: 'flex', gap: '0.25rem', marginLeft: 'auto' }}>
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.375rem', borderRadius: '0',
                    backgroundColor: c.statut === 'ACTIF' ? 'color-mix(in srgb, var(--color-success) 12%, transparent)' : 'var(--color-muted)',
                    color: c.statut === 'ACTIF' ? 'var(--color-success)' : 'var(--color-muted-foreground)',
                  }}>
                    {c.statut}
                  </span>
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.375rem', borderRadius: '0',
                    display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
                    backgroundColor: c.signe ? 'color-mix(in srgb, var(--color-success) 12%, transparent)' : 'color-mix(in srgb, var(--color-warning) 12%, transparent)',
                    color: c.signe ? 'var(--color-success)' : 'var(--color-warning)',
                  }}>
                    {c.signe
                      ? <><CheckCircle style={{ width: '10px', height: '10px' }} /> Signé</>
                      : <><Clock style={{ width: '10px', height: '10px' }} /> À signer</>
                    }
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ ...btnOutline, opacity: page === 1 ? 0.4 : 1 }}
          >
            ← Précédent
          </button>
          <span style={{ alignSelf: 'center', fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>
            Page {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{ ...btnOutline, opacity: page === totalPages ? 0.4 : 1 }}
          >
            Suivant →
          </button>
        </div>
      )}

      {/* Viewer PDF */}
      {viewing && <PdfViewer contrat={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
};

const btnPrimary: React.CSSProperties = {
  padding: '0.4rem 0.875rem', borderRadius: '0.5rem', border: 'none',
  backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)',
  fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.8125rem', cursor: 'pointer',
};
const btnOutline: React.CSSProperties = {
  padding: '0.4rem 0.875rem', borderRadius: '0.5rem',
  border: '1px solid var(--color-border)', backgroundColor: 'transparent',
  color: 'var(--color-foreground)', fontFamily: 'var(--font-display)',
  fontWeight: 500, fontSize: '0.8125rem', cursor: 'pointer',
};

export default Contrat;

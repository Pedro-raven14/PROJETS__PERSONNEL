import { useEffect, useState } from "react";
import { Wallet, Plus, Search, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import axios from "axios";
import { PageHeader } from "../../../components/element/PageHeader";
import { Input } from "../../../components/UI/Input";
import { Button } from "../../../components/UI/Button";
import { API_URL } from "../../../config/api";
import { useIsMobile } from "../../../hooks/Use-mobile";
import GenererFichePaie from "./GenererFichePaie";
import DetailFichePaie from "./DetailFichePaie";

type FichePaie = {
  ficheId: number;
  periode: string;
  salaire_base: number;
  nb_jours_absence: number;
  deduction_absence: number;
  salaire_net: number;
  nb_heures_sup: number;
  montant_heures_sup: number;
  date_generation: string;
  employee: { userId: number; nom: string; prenom: string; poste?: string };
};

const fmt = (n: number) =>
  Number(n).toLocaleString("fr-FR", { useGrouping: true }).replace(/\s/g, " ");

const Paie = () => {
  const [fiches, setFiches]         = useState<FichePaie[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);
  const [showGen, setShowGen]       = useState(false);
  const [ficheDetail, setFicheDetail] = useState<FichePaie | null>(null);
  const LIMIT = 10;
  const isMobile = useIsMobile();
  const token = localStorage.getItem("token");

  const fetchFiches = async (p = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/fiche-paie/getall`, {
        params: { page: p, limit: LIMIT },
        headers: { Authorization: `Bearer ${token}` },
      });
      setFiches(res.data.data ?? res.data);
      setTotal(res.data.total ?? 0);
      setTotalPages(res.data.totalPages ?? 1);
      setPage(p);
    } catch {
      // silencieux
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchFiches(1); }, []);

  const filtered = fiches.filter((f) => {
    const nom = `${f.employee?.prenom} ${f.employee?.nom}`.toLowerCase();
    return nom.includes(search.toLowerCase()) || f.periode.includes(search);
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion de la paie"
        subtitle={`${total} fiche(s) de paie générée(s)`}
        actions={
          <Button onClick={() => setShowGen(true)}>
            <Plus style={{ width: '16px', height: '16px', marginRight: '0.5rem' }} />
            Générer une fiche
          </Button>
        }
      />

      {/* Filtre */}
      <div className="stat-card">
        <div style={{ position: 'relative', maxWidth: '360px' }}>
          <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--color-muted-foreground)', pointerEvents: 'none' }} />
          <Input
            placeholder="Rechercher par employé ou période..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>
      </div>

      {/* Tableau desktop / Cartes mobile */}
      <div className="stat-card overflow-hidden" style={{ padding: 0 }}>
        {isMobile ? (
          /* ── Vue carte mobile ── */
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {loading ? (
              <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted-foreground)' }}>Chargement...</p>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <Wallet style={{ width: '2rem', height: '2rem', margin: '0 auto 0.75rem', display: 'block', color: 'var(--color-muted-foreground)' }} />
                <p style={{ color: 'var(--color-muted-foreground)', margin: 0 }}>Aucune fiche de paie trouvée</p>
              </div>
            ) : filtered.map((f, i) => (
              <div key={f.ficheId} style={{ padding: '0.875rem 1rem', borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.375rem' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', fontFamily: 'var(--font-display)' }}>
                      {f.employee?.prenom} {f.employee?.nom}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>{f.periode}</p>
                  </div>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.9375rem' }}>
                    {fmt(f.salaire_net)} FCFA
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
                    <span>Base : {fmt(f.salaire_base)} FCFA</span>
                    {f.nb_jours_absence > 0 && (
                      <span style={{ color: 'var(--color-destructive)' }}>−{f.nb_jours_absence}j abs.</span>
                    )}
                    {f.nb_heures_sup > 0 && (
                      <span style={{ color: 'var(--color-success)' }}>+{f.nb_heures_sup}h sup.</span>
                    )}
                  </div>
                  <button
                    onClick={() => setFicheDetail(f)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', borderRadius: '0.375rem', border: '1px solid var(--color-border)', background: 'transparent', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--color-primary)', fontFamily: 'var(--font-display)', fontWeight: 500 }}
                  >
                    <Eye style={{ width: '12px', height: '12px' }} /> Détail
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ── Vue tableau desktop ── */
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {["Employé", "Période", "Salaire base", "Absences", "Heures sup", "Salaire net", "Généré le", ""].map((h) => (
                    <th key={h} className="table-header" style={{ padding: '0.75rem 1.25rem', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted-foreground)' }}>Chargement...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '3rem', textAlign: 'center' }}>
                      <Wallet style={{ width: '2rem', height: '2rem', margin: '0 auto 0.75rem', display: 'block', color: 'var(--color-muted-foreground)' }} />
                      <p style={{ color: 'var(--color-muted-foreground)', margin: 0 }}>Aucune fiche de paie trouvée</p>
                    </td>
                  </tr>
                ) : filtered.map((f) => (
                  <tr key={f.ficheId} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-muted)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}>
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', fontFamily: 'var(--font-display)' }}>
                        {f.employee?.prenom} {f.employee?.nom}
                      </p>
                      {f.employee?.poste && (
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>{f.employee.poste}</p>
                      )}
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.875rem' }}>{f.periode}</span>
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>
                      {fmt(f.salaire_base)} FCFA
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.875rem' }}>
                      {f.nb_jours_absence > 0 ? (
                        <span style={{ color: 'var(--color-destructive)' }}>
                          {f.nb_jours_absence}j (−{fmt(f.deduction_absence)} FCFA)
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-muted-foreground)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.875rem' }}>
                      {f.nb_heures_sup > 0 ? (
                        <span style={{ color: 'var(--color-success)' }}>
                          {f.nb_heures_sup}h (+{fmt(f.montant_heures_sup)} FCFA)
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-muted-foreground)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.9375rem' }}>
                        {fmt(f.salaire_net)} FCFA
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.8125rem', color: 'var(--color-muted-foreground)' }}>
                      {new Date(f.date_generation).toLocaleDateString('fr-FR')}
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      <button
                        onClick={() => setFicheDetail(f)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.3rem 0.625rem', borderRadius: '0.375rem', border: '1px solid var(--color-border)', background: 'transparent', cursor: 'pointer', fontSize: '0.8125rem', color: 'var(--color-primary)', fontFamily: 'var(--font-display)', fontWeight: 500, whiteSpace: 'nowrap' }}
                      >
                        <Eye style={{ width: '13px', height: '13px' }} /> Voir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', padding: '0.75rem 1.25rem' }}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>
            {filtered.length} résultat(s) sur {total}
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => fetchFiches(page - 1)}>
              <ChevronLeft style={{ width: '14px', height: '14px' }} />
            </Button>
            <span style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem', color: 'var(--color-muted-foreground)' }}>
              {page} / {totalPages}
            </span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => fetchFiches(page + 1)}>
              <ChevronRight style={{ width: '14px', height: '14px' }} />
            </Button>
          </div>
        </div>
      </div>

      {showGen && (
        <GenererFichePaie
          onClose={() => setShowGen(false)}
          onSuccess={() => { setShowGen(false); fetchFiches(1); }}
        />
      )}

      {ficheDetail && (
        <DetailFichePaie
          fiche={ficheDetail}
          onClose={() => setFicheDetail(null)}
        />
      )}
    </div>
  );
};

export default Paie;

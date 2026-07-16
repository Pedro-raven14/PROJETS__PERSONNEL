import { useEffect, useState } from "react";
import { GraduationCap, Plus, Clock, Users, CalendarDays, CheckCircle } from "lucide-react";
import axios from "axios";
import { PageHeader } from "../element/PageHeader";
import { Button } from "../UI/Button";
import { API_URL } from "../../config/api";
import ConsulterFormation from "./ConsulterFormationShared";

type Formation = {
  formationId: number;
  titre: string;
  description: string;
  duree: number;
  heures_par_jour: number;
  niveau: string;
  date_debut: string;
  date_fin: string;
  capacite: number;
  employes: { userId: number; nom: string; prenom: string }[];
};

const niveauBadge: Record<string, string> = {
  "DÉBUTANT":      "badge-success",
  "INTERMÉDIAIRE": "badge-warning",
  "AVANCÉ":        "badge-destructive",
};

type Props = {
  peutCreer?: boolean;
  visionGlobale?: boolean;
  AjoutFormationComponent?: React.ComponentType<{ onClose: () => void; onSuccess: () => void }>;
};

const FormationsBase = ({ peutCreer = false, visionGlobale = false, AjoutFormationComponent }: Props) => {
  const [formations, setFormations]   = useState<Formation[]>([]);
  const [loading, setLoading]         = useState(true);
  const [onglet, setOnglet]           = useState<"catalogue" | "mes-inscriptions">("catalogue");
  const [showAjout, setShowAjout]     = useState(false);
  const [selected, setSelected]       = useState<Formation | null>(null);

  const token = localStorage.getItem("token");
  const me    = (() => { try { return JSON.parse(localStorage.getItem("employee") || "{}"); } catch { return {}; } })();

  const fetchFormations = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/formation/getall?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormations(res.data.data ?? res.data);
    } catch {
      // silencieux
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFormations(); }, []);

  const mesInscriptions = formations.filter(f =>
    f.employes?.some(e => e.userId === me.userId)
  );

  // Vision globale (Admin/RH) : catalogue = toutes les formations
  // Vision normale (Employee/Manager) : catalogue = formations où l'utilisateur n'est pas inscrit
  const catalogue = visionGlobale
    ? formations
    : formations.filter(f => !f.employes?.some(e => e.userId === me.userId));

  const listeAffichee = onglet === "catalogue" ? catalogue : mesInscriptions;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catalogue de formations"
        subtitle={`${formations.length} formation(s) disponible(s)`}
        actions={
          peutCreer && AjoutFormationComponent ? (
            <Button onClick={() => setShowAjout(true)}>
              <Plus style={{ width: '16px', height: '16px', marginRight: '0.5rem' }} />
              Nouvelle formation
            </Button>
          ) : undefined
        }
      />

      {/* Onglets */}
      <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--color-border)' }}>
        {[
          { key: "catalogue",        label: `Catalogue (${catalogue.length})` },
          { key: "mes-inscriptions", label: `Mes inscriptions (${mesInscriptions.length})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setOnglet(key as any)}
            style={{
              padding: '0.5rem 1rem', border: 'none', background: 'transparent',
              cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '0.875rem',
              fontWeight: onglet === key ? 600 : 400,
              color: onglet === key ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
              borderBottom: onglet === key ? '2px solid var(--color-primary)' : '2px solid transparent',
              marginBottom: '-1px', transition: 'color 0.15s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: 'var(--color-muted-foreground)', textAlign: 'center', padding: '2rem' }}>
          Chargement...
        </p>
      ) : listeAffichee.length === 0 ? (
        <div className="stat-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <GraduationCap style={{ width: '2.5rem', height: '2.5rem', margin: '0 auto 1rem', color: 'var(--color-muted-foreground)' }} />
          <p style={{ color: 'var(--color-muted-foreground)', margin: 0 }}>
            {onglet === "catalogue" ? "Aucune formation disponible" : "Vous n'êtes inscrit à aucune formation"}
          </p>
          {peutCreer && AjoutFormationComponent && onglet === "catalogue" && (
            <Button style={{ marginTop: '1rem' }} onClick={() => setShowAjout(true)}>
              Créer la première formation
            </Button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {listeAffichee.map((f) => {
            const inscrits   = f.employes?.length ?? 0;
            const fillRate   = f.capacite > 0 ? Math.round((inscrits / f.capacite) * 100) : 0;
            const complet    = inscrits >= f.capacite;
            const badgeClass = niveauBadge[f.niveau] ?? "badge-muted";
            const estInscrit = f.employes?.some(e => e.userId === me.userId);

            return (
              <div key={f.formationId} className="stat-card" style={{ display: 'flex', flexDirection: 'column' }}>

                {/* Ligne du haut */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '2rem', height: '2rem', borderRadius: '0.5rem', flexShrink: 0,
                    backgroundColor: estInscrit
                      ? 'color-mix(in srgb, var(--color-success) 10%, transparent)'
                      : 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                    color: estInscrit ? 'var(--color-success)' : 'var(--color-primary)',
                  }}>
                    {estInscrit
                      ? <CheckCircle style={{ width: '16px', height: '16px' }} />
                      : <GraduationCap style={{ width: '16px', height: '16px' }} />
                    }
                  </div>
                  <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                    <span className={badgeClass}>{f.niveau || "—"}</span>
                    {complet && !estInscrit && <span className="badge-destructive">Complet</span>}
                    {estInscrit && <span className="badge-success">Inscrit</span>}
                  </div>
                </div>

                {/* Titre */}
                <h3 className="font-display" style={{ margin: '0 0 0.375rem', fontSize: '1rem', fontWeight: 600 }}>
                  {f.titre}
                </h3>

                {/* Description */}
                <p style={{
                  margin: '0 0 1rem', fontSize: '0.8125rem',
                  color: 'var(--color-muted-foreground)', flex: 1,
                  display: '-webkit-box', WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {f.description || "Aucune description"}
                </p>

                {/* Infos */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: 'var(--color-muted-foreground)', marginBottom: '0.875rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock style={{ width: '13px', height: '13px' }} />{f.duree}h totales
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CalendarDays style={{ width: '13px', height: '13px' }} />{f.heures_par_jour}h/jour
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Users style={{ width: '13px', height: '13px' }} />{inscrits}/{f.capacite}
                  </span>
                </div>

                {/* Barre */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--color-muted-foreground)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Users style={{ width: '12px', height: '12px' }} />{inscrits}/{f.capacite} inscrits
                    </span>
                    <span style={{ fontWeight: 600 }}>{fillRate}%</span>
                  </div>
                  <div style={{ height: '6px', borderRadius: '999px', backgroundColor: 'var(--color-border)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: '999px', width: `${fillRate}%`,
                      backgroundColor: fillRate >= 90 ? 'var(--color-destructive)' : 'var(--color-primary)',
                      transition: 'width 0.3s',
                    }} />
                  </div>
                </div>

                {/* Boutons */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => setSelected(f)}
                    style={{
                      flex: 1, padding: '0.4rem 0.75rem', borderRadius: '0.5rem',
                      border: '1px solid var(--color-border)', backgroundColor: 'transparent',
                      color: 'var(--color-foreground)', cursor: 'pointer',
                      fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.8125rem',
                      transition: 'background 0.15s, color 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                      e.currentTarget.style.color = 'var(--color-primary-foreground)';
                      e.currentTarget.style.borderColor = 'var(--color-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--color-foreground)';
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                    }}
                  >
                    Consulter
                  </button>
                  {!estInscrit && (
                    <button
                      onClick={() => setSelected(f)}
                      disabled={complet}
                      style={{
                        flex: 1, padding: '0.4rem 0.75rem', borderRadius: '0.5rem', border: 'none',
                        backgroundColor: complet ? 'var(--color-muted)' : 'var(--color-primary)',
                        color: complet ? 'var(--color-muted-foreground)' : 'var(--color-primary-foreground)',
                        cursor: complet ? 'not-allowed' : 'pointer',
                        fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.8125rem',
                      }}
                    >
                      {complet ? "Complet" : "S'inscrire"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {peutCreer && showAjout && AjoutFormationComponent && (
        <AjoutFormationComponent
          onClose={() => setShowAjout(false)}
          onSuccess={fetchFormations}
        />
      )}

      {selected && (
        <ConsulterFormation
          formation={selected}
          onClose={() => setSelected(null)}
          onSuccess={fetchFormations}
        />
      )}
    </div>
  );
};

export default FormationsBase;

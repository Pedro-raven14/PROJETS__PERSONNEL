import { useEffect, useState } from "react";
import { Sparkles, GraduationCap, Clock, Users, Zap } from "lucide-react";
import axios from "axios";
import { API_URL } from "../../../config/api";
import FormationsBase from "../../../components/shared/FormationsBase";
import ConsulterFormation from "../../../components/shared/ConsulterFormationShared";

type Recommandation = {
  rang: number;
  formationId: number;
  formation: string;
  niveau: string;
  score: number;
  competences_cibles: string[];
};

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
  competences?: { competenceId: number; nom: string }[];
};

const niveauBadge: Record<string, string> = {
  "DÉBUTANT":      "badge-success",
  "INTERMÉDIAIRE": "badge-warning",
  "AVANCÉ":        "badge-destructive",
};

const Formations = () => {
  const [recommandations, setRecommandations] = useState<Recommandation[]>([]);
  const [formationsMap, setFormationsMap]     = useState<Record<number, Formation>>({});
  const [loadingReco, setLoadingReco]         = useState(true);
  const [recoError, setRecoError]             = useState(false);
  const [selected, setSelected]               = useState<Formation | null>(null);
  const [refreshKey, setRefreshKey]           = useState(0);

  const token = localStorage.getItem("token");

  const fetchRecommandations = async () => {
    setLoadingReco(true);
    setRecoError(false);
    try {
      const [recoRes, formRes] = await Promise.all([
        axios.get(`${API_URL}/prediction/recommandations-formations`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/formation/getall?limit=100`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const recos: Recommandation[] = recoRes.data.recommandations || [];
      const formations: Formation[] = formRes.data.data ?? formRes.data;

      const map: Record<number, Formation> = {};
      formations.forEach((f) => { map[f.formationId] = f; });

      setRecommandations(recos);
      setFormationsMap(map);
    } catch {
      setRecoError(true);
    } finally {
      setLoadingReco(false);
    }
  };

  useEffect(() => { fetchRecommandations(); }, [refreshKey]);

  const handleSuccess = () => {
    setSelected(null);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* ── Section recommandations IA ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '2rem', height: '2rem', borderRadius: '0.5rem',
            backgroundColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)',
            color: 'var(--color-primary)',
          }}>
            <Sparkles style={{ width: '16px', height: '16px' }} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700 }}>
              Recommandées pour vous
            </h2>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
              Sélectionnées par l'IA selon votre profil et vos compétences
            </p>
          </div>
        </div>

        {loadingReco ? (
          <div style={{ display: 'flex', gap: '1rem' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{
                flex: 1, height: '120px', borderRadius: '0.75rem',
                backgroundColor: 'var(--color-border)', opacity: 0.5,
                animation: 'pulse 1.5s infinite',
              }} />
            ))}
          </div>
        ) : recoError ? (
          <div style={{
            padding: '1.25rem', borderRadius: '0.75rem',
            border: '1px dashed var(--color-border)',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            color: 'var(--color-muted-foreground)', fontSize: '0.875rem',
          }}>
            <Zap style={{ width: '18px', height: '18px', flexShrink: 0 }} />
            Service IA temporairement indisponible. Les recommandations seront disponibles dès que le service sera de retour.
          </div>
        ) : recommandations.length === 0 ? (
          <div style={{
            padding: '1.25rem', borderRadius: '0.75rem',
            border: '1px dashed var(--color-border)',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            color: 'var(--color-muted-foreground)', fontSize: '0.875rem',
          }}>
            <Zap style={{ width: '18px', height: '18px', flexShrink: 0 }} />
            Aucune recommandation disponible pour le moment. Complétez votre profil de compétences pour obtenir des suggestions personnalisées.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {recommandations.map((reco) => {
              const f = formationsMap[reco.formationId];
              if (!f) return null;
              const inscrits  = f.employes?.length ?? 0;
              const complet   = inscrits >= f.capacite;
              const badgeClass = niveauBadge[reco.niveau] ?? "badge-muted";

              return (
                <div
                  key={reco.formationId}
                  className="stat-card"
                  style={{
                    display: 'flex', flexDirection: 'column', cursor: 'pointer',
                    border: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)',
                    position: 'relative', overflow: 'hidden',
                  }}
                  onClick={() => setSelected(f)}
                >
                  {/* Badge rang */}
                  <div style={{
                    position: 'absolute', top: '0.75rem', right: '0.75rem',
                    display: 'flex', alignItems: 'center', gap: '0.25rem',
                    fontSize: '0.7rem', fontWeight: 700,
                    color: 'var(--color-primary)',
                    backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                    padding: '0.15rem 0.4rem', borderRadius: '999px',
                  }}>
                    <Sparkles style={{ width: '10px', height: '10px' }} />
                    #{reco.rang}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: '1.75rem', height: '1.75rem', borderRadius: '0.375rem', flexShrink: 0,
                      backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                      color: 'var(--color-primary)',
                    }}>
                      <GraduationCap style={{ width: '14px', height: '14px' }} />
                    </div>
                    <span className={badgeClass}>{reco.niveau}</span>
                  </div>

                  <h3 style={{ margin: '0 0 0.375rem', fontSize: '0.9375rem', fontWeight: 600, fontFamily: 'var(--font-display)', paddingRight: '2.5rem' }}>
                    {f.titre}
                  </h3>

                  <p style={{
                    margin: '0 0 0.75rem', fontSize: '0.8rem', color: 'var(--color-muted-foreground)',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1,
                  }}>
                    {f.description || "Aucune description"}
                  </p>

                  {/* Compétences ciblées */}
                  {reco.competences_cibles?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.75rem' }}>
                      {reco.competences_cibles.slice(0, 3).map((c) => (
                        <span key={c} style={{
                          fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '999px',
                          backgroundColor: 'color-mix(in srgb, var(--color-accent) 20%, transparent)',
                          color: 'var(--color-accent-foreground)', fontWeight: 500,
                        }}>
                          {c}
                        </span>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock style={{ width: '12px', height: '12px' }} />{f.duree}h
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Users style={{ width: '12px', height: '12px' }} />{inscrits}/{f.capacite}
                    </span>
                    {complet && <span className="badge-destructive">Complet</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Séparateur ── */}
      <div style={{ borderTop: '1px solid var(--color-border)' }} />

      {/* ── Catalogue complet ── */}
      <FormationsBase
        key={refreshKey}
        peutCreer={false}
        visionGlobale={false}
      />

      {/* Modal détail */}
      {selected && (
        <ConsulterFormation
          formation={selected}
          onClose={() => setSelected(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default Formations;

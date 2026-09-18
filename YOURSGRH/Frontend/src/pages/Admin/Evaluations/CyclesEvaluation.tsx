import { useEffect, useState } from "react";
import { Award, Plus, Eye, Trash2, CalendarDays } from "lucide-react";
import { PageHeader } from "../../../components/element/PageHeader";
import { Button } from "../../../components/UI/Button";
import { cycleEvaluationService } from "../../../lib/mockService";
import AjoutCycle from "./AjoutCycle";
import ConsulterCycle from "./ConsulterCycle";

type Cycle = {
  cycleId: number;
  nom: string;
  date_debut: string;
  date_fin: string;
  criteres: string[];
  evaluations: any[];
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

const getStatut = (debut: string, fin: string) => {
  const now   = new Date();
  const start = new Date(debut);
  const end   = new Date(fin);
  if (now < start) return { label: "À venir",   cls: "badge-muted" };
  if (now > end)   return { label: "Terminé",   cls: "badge-destructive" };
  return              { label: "En cours",   cls: "badge-success" };
};

const CyclesEvaluation = () => {
  const [cycles, setCycles]       = useState<Cycle[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showAjout, setShowAjout] = useState(false);
  const [cycleConsulte, setCycleConsulte] = useState<number | null>(null);

  const fetchCycles = () => {
    setLoading(true);
    try { setCycles(cycleEvaluationService.getAll() as Cycle[]); }
    catch { /* silencieux */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchCycles(); }, []);

  const handleDelete = (cycleId: number) => {
    if (!confirm("Supprimer ce cycle ?")) return;
    cycleEvaluationService.delete(cycleId);
    fetchCycles();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cycles d'évaluation"
        subtitle={`${cycles.length} cycle(s)`}
        actions={
          <Button onClick={() => setShowAjout(true)}>
            <Plus style={{ width: '16px', height: '16px', marginRight: '0.5rem' }} />
            Nouveau cycle
          </Button>
        }
      />

      {loading ? (
        <p style={{ color: 'var(--color-muted-foreground)', textAlign: 'center', padding: '2rem' }}>Chargement...</p>
      ) : cycles.length === 0 ? (
        <div className="stat-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Award style={{ width: '2.5rem', height: '2.5rem', margin: '0 auto 1rem', color: 'var(--color-muted-foreground)' }} />
          <p style={{ color: 'var(--color-muted-foreground)', margin: 0 }}>Aucun cycle d'évaluation créé</p>
          <Button style={{ marginTop: '1rem' }} onClick={() => setShowAjout(true)}>Créer le premier cycle</Button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {cycles.map((c) => {
            const statut = getStatut(c.date_debut, c.date_fin);
            return (
              <div key={c.cycleId} className="stat-card" style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '2rem', height: '2rem', borderRadius: '0.5rem', flexShrink: 0,
                    backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                    color: 'var(--color-primary)',
                  }}>
                    <Award style={{ width: '16px', height: '16px' }} />
                  </div>
                  <span className={statut.cls}>{statut.label}</span>
                </div>

                {/* Nom */}
                <h3 className="font-display" style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 600 }}>
                  {c.nom}
                </h3>

                {/* Dates */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--color-muted-foreground)', marginBottom: '0.75rem' }}>
                  <CalendarDays style={{ width: '13px', height: '13px' }} />
                  {formatDate(c.date_debut)} → {formatDate(c.date_fin)}
                </div>

                {/* Critères */}
                {c.criteres && c.criteres.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.875rem', flex: 1 }}>
                    {c.criteres.map(cr => (
                      <span key={cr} className="badge-muted">{cr}</span>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <p style={{ margin: '0 0 1rem', fontSize: '0.8125rem', color: 'var(--color-muted-foreground)' }}>
                  {c.evaluations?.length ?? 0} évaluation(s) enregistrée(s)
                </p>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => setCycleConsulte(c.cycleId)}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                      padding: '0.4rem 0.75rem', borderRadius: '0.5rem',
                      border: '1px solid var(--color-border)', backgroundColor: 'transparent',
                      color: 'var(--color-foreground)', cursor: 'pointer',
                      fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.8125rem',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary-foreground)'; e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-foreground)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                  >
                    <Eye style={{ width: '13px', height: '13px' }} /> Consulter
                  </button>
                  <button
                    onClick={() => handleDelete(c.cycleId)}
                    style={{
                      padding: '0.4rem 0.625rem', borderRadius: '0.5rem',
                      border: '1px solid var(--color-border)', backgroundColor: 'transparent',
                      color: 'var(--color-destructive)', cursor: 'pointer',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-destructive) 10%, transparent)'; e.currentTarget.style.borderColor = 'var(--color-destructive)'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                  >
                    <Trash2 style={{ width: '13px', height: '13px' }} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAjout && (
        <AjoutCycle onClose={() => setShowAjout(false)} onSuccess={fetchCycles} />
      )}

      {cycleConsulte !== null && (
        <ConsulterCycle
          cycleId={cycleConsulte}
          onClose={() => setCycleConsulte(null)}
        />
      )}
    </div>
  );
};

export default CyclesEvaluation;

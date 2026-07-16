import { useEffect, useState } from "react";
import { Award, CalendarDays, Star, User } from "lucide-react";
import axios from "axios";
import { PageHeader } from "../../../components/element/PageHeader";
import { API_URL } from "../../../config/api";

type Evaluation = {
  evaluationId: number;
  note_globale: number;
  notes_criteres: Record<string, number>;
  commentaire: string;
  date: string;
  cycle: { cycleId: number; nom: string; date_debut: string; date_fin: string };
  evaluateur: { userId: number; nom: string; prenom: string; poste: string } | null;
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

const StarDisplay = ({ value, max = 5 }: { value: number; max?: number }) => (
  <div style={{ display: 'flex', gap: '0.125rem' }}>
    {Array.from({ length: max }).map((_, i) => (
      <Star
        key={i}
        style={{
          width: '14px', height: '14px',
          color: i < Math.round(value) ? 'var(--color-warning)' : 'var(--color-border)',
          fill: i < Math.round(value) ? 'var(--color-warning)' : 'none',
        }}
      />
    ))}
  </div>
);

const EmployeeEvaluation = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading]         = useState(true);

  const token = localStorage.getItem("token");
  const me    = (() => { try { return JSON.parse(localStorage.getItem("employee") || "{}"); } catch { return {}; } })();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${API_URL}/evaluation/employee/${me.userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvaluations(res.data);
      } catch {
        // silencieux
      } finally { setLoading(false); }
    };
    fetch();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes évaluations"
        subtitle={`${evaluations.length} évaluation(s)`}
      />

      {loading ? (
        <p style={{ color: 'var(--color-muted-foreground)', textAlign: 'center', padding: '2rem' }}>Chargement...</p>
      ) : evaluations.length === 0 ? (
        <div className="stat-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Award style={{ width: '2.5rem', height: '2.5rem', margin: '0 auto 1rem', color: 'var(--color-muted-foreground)' }} />
          <p style={{ color: 'var(--color-muted-foreground)', margin: 0 }}>Aucune évaluation disponible pour le moment</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {evaluations.map(ev => (
            <div key={ev.evaluationId} className="stat-card">
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h3 className="font-display" style={{ margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: 600 }}>
                    {ev.cycle.nom}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--color-muted-foreground)' }}>
                    <CalendarDays style={{ width: '13px', height: '13px' }} />
                    {formatDate(ev.cycle.date_debut)} → {formatDate(ev.cycle.date_fin)}
                  </div>
                </div>
                {/* Note globale */}
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-warning)' }}>
                    {Number(ev.note_globale).toFixed(2)}
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-muted-foreground)', fontWeight: 400 }}>/5</span>
                  </p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>Note globale</p>
                </div>
              </div>

              {/* Évaluateur */}
              {ev.evaluateur && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)' }}>
                  <User style={{ width: '14px', height: '14px', color: 'var(--color-muted-foreground)' }} />
                  <span style={{ fontSize: '0.8125rem', color: 'var(--color-muted-foreground)' }}>
                    Évalué par <strong>{ev.evaluateur.prenom} {ev.evaluateur.nom}</strong>
                    {ev.evaluateur.poste && ` — ${ev.evaluateur.poste}`}
                  </span>
                </div>
              )}

              {/* Notes par critère */}
              {ev.notes_criteres && Object.keys(ev.notes_criteres).length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1rem' }}>
                  {Object.entries(ev.notes_criteres).map(([critere, note]) => (
                    <div key={critere} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>{critere}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <StarDisplay value={note} />
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, minWidth: '24px', textAlign: 'right' }}>{note}/5</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Commentaire */}
              {ev.commentaire && (
                <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)', fontSize: '0.875rem', color: 'var(--color-muted-foreground)', fontStyle: 'italic' }}>
                  "{ev.commentaire}"
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeEvaluation;
 
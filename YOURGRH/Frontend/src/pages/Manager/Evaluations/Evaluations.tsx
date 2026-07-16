import { useEffect, useState } from "react";
import { Award, CalendarDays, Star } from "lucide-react";
import axios from "axios";
import { PageHeader } from "../../../components/element/PageHeader";
import { API_URL } from "../../../config/api";
import EvaluerMembre from "./EvaluerMembre";

type Cycle = {
  cycleId: number;
  nom: string;
  date_debut: string;
  date_fin: string;
  criteres: string[];
};

type Membre = {
  userId: number;
  nom: string;
  prenom: string;
  poste: string;
};

type Evaluation = {
  evaluationId: number;
  employee: { userId: number };
  cycle: { cycleId: number };
  note_globale: number;
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

const getStatut = (debut: string, fin: string) => {
  const now = new Date();
  if (now < new Date(debut)) return { label: "À venir",  cls: "badge-muted" };
  if (now > new Date(fin))   return { label: "Terminé",  cls: "badge-destructive" };
  return                            { label: "En cours", cls: "badge-success" };
};

const ManagerEvaluations = () => {
  const [cycles, setCycles]         = useState<Cycle[]>([]);
  const [membres, setMembres]       = useState<Membre[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading]       = useState(true);
  const [cycleSelectionne, setCycleSelectionne] = useState<Cycle | null>(null);
  const [membreSelectionne, setMembreSelectionne] = useState<Membre | null>(null);

  const token = localStorage.getItem("token");
  const me    = (() => { try { return JSON.parse(localStorage.getItem("employee") || "{}"); } catch { return {}; } })();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cyclesRes, equipeRes, evalsRes] = await Promise.all([
        axios.get(`${API_URL}/cycle-evaluation/getall`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/equipe/mon-equipe`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: null })),
        axios.get(`${API_URL}/evaluation/evaluateur/${me.userId}`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })),
      ]);
      setCycles(cyclesRes.data);
      setMembres(equipeRes.data?.employes ?? []);
      setEvaluations(evalsRes.data);
    } catch {
      // silencieux
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const estEvalue = (userId: number, cycleId: number) =>
    evaluations.some(e => e.employee.userId === userId && e.cycle.cycleId === cycleId);

  const getNote = (userId: number, cycleId: number) =>
    evaluations.find(e => e.employee.userId === userId && e.cycle.cycleId === cycleId)?.note_globale;

  return (
    <div className="space-y-6">
      <PageHeader title="Évaluations" subtitle="Évaluez les membres de votre équipe" />

      {loading ? (
        <p style={{ color: 'var(--color-muted-foreground)', textAlign: 'center', padding: '2rem' }}>Chargement...</p>
      ) : cycles.length === 0 ? (
        <div className="stat-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Award style={{ width: '2.5rem', height: '2.5rem', margin: '0 auto 1rem', color: 'var(--color-muted-foreground)' }} />
          <p style={{ color: 'var(--color-muted-foreground)', margin: 0 }}>Aucun cycle d'évaluation en cours</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {cycles.map(cycle => {
            const statut = getStatut(cycle.date_debut, cycle.date_fin);
            const estActif = statut.label === "En cours";
            return (
              <div key={cycle.cycleId} className="stat-card">
                {/* En-tête cycle */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <h3 className="font-display" style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{cycle.nom}</h3>
                      <span className={statut.cls}>{statut.label}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--color-muted-foreground)' }}>
                      <CalendarDays style={{ width: '13px', height: '13px' }} />
                      {formatDate(cycle.date_debut)} → {formatDate(cycle.date_fin)}
                    </div>
                  </div>
                </div>

                {/* Critères */}
                {cycle.criteres?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '1rem' }}>
                    {cycle.criteres.map(cr => <span key={cr} className="badge-muted">{cr}</span>)}
                  </div>
                )}

                {/* Membres */}
                {membres.length === 0 ? (
                  <p style={{ color: 'var(--color-muted-foreground)', fontSize: '0.875rem' }}>Vous n'avez pas d'équipe assignée.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {membres.map(m => {
                      const deja = estEvalue(m.userId, cycle.cycleId);
                      const note = getNote(m.userId, cycle.cycleId);
                      return (
                        <div key={m.userId} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '0.625rem 0.875rem', borderRadius: '0.5rem',
                          backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                              backgroundColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)',
                              color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.7rem', fontWeight: 700,
                            }}>
                              {m.prenom?.[0]}{m.nom?.[0]}
                            </div>
                            <div>
                              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', fontFamily: 'var(--font-display)' }}>
                                {m.prenom} {m.nom}
                              </p>
                              {m.poste && <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>{m.poste}</p>}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {deja && note !== undefined && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-warning)' }}>
                                <Star style={{ width: '13px', height: '13px', fill: 'currentColor' }} />
                                {Number(note).toFixed(1)}/5
                              </div>
                            )}
                            {deja ? (
                              <span className="badge-success">Évalué</span>
                            ) : (
                              <button
                                disabled={!estActif}
                                onClick={() => { setCycleSelectionne(cycle); setMembreSelectionne(m); }}
                                style={{
                                  padding: '0.3rem 0.75rem', borderRadius: '0.5rem', border: 'none',
                                  backgroundColor: estActif ? 'var(--color-primary)' : 'var(--color-muted)',
                                  color: estActif ? 'var(--color-primary-foreground)' : 'var(--color-muted-foreground)',
                                  cursor: estActif ? 'pointer' : 'not-allowed',
                                  fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.8125rem',
                                }}
                              >
                                Évaluer
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {cycleSelectionne && membreSelectionne && (
        <EvaluerMembre
          cycle={cycleSelectionne}
          membre={membreSelectionne}
          evaluateurId={me.userId}
          onClose={() => { setCycleSelectionne(null); setMembreSelectionne(null); }}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
};

export default ManagerEvaluations;

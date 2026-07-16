import { useEffect, useState } from "react";
import { X, Award, CalendarDays, Users, Star, Loader2, Plus } from "lucide-react";
import axios from "axios";
import { AvatarInitials } from "../../../components/element/AvatarInitials";
import { Button } from "../../../components/UI/Button";
import { API_URL } from "../../../config/api";
import AjoutEvaluation from "./AjoutEvaluation";

// ─── Types ────────────────────────────────────────────────────────────────────

type EvaluationDetail = {
  evaluationId: number;
  note_globale: number;
  notes_criteres: Record<string, number>;
  date: string;
  commentaire?: string;
  employee: { userId: number; nom: string; prenom: string; poste?: string };
  evaluateur?: { nom: string; prenom: string };
};

type CycleDetail = {
  cycleId: number;
  nom: string;
  date_debut: string;
  date_fin: string;
  criteres: string[];
  evaluations: EvaluationDetail[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

const noteColor = (note: number) => {
  if (note >= 4)   return "var(--color-success)";
  if (note >= 2.5) return "var(--color-warning)";
  return "var(--color-destructive)";
};

function Etoiles({ note }: { note: number }) {
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={13}
          fill={i <= Math.round(note) ? "var(--color-warning)" : "transparent"}
          color={i <= Math.round(note) ? "var(--color-warning)" : "var(--color-border)"}
        />
      ))}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  cycleId: number;
  onClose: () => void;
};

// ─── Composant ────────────────────────────────────────────────────────────────

const ConsulterCycle = ({ cycleId, onClose }: Props) => {
  const token = localStorage.getItem("token");
  const [cycle, setCycle]           = useState<CycleDetail | null>(null);
  const [loading, setLoading]       = useState(true);
  const [showAjout, setShowAjout]   = useState(false);

  const fetchCycle = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/cycle-evaluation/${cycleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCycle(res.data);
    } catch { /* silencieux */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCycle(); }, [cycleId]);

  const noteMoyenne = cycle && cycle.evaluations.length > 0
    ? (cycle.evaluations.reduce((a, e) => a + Number(e.note_globale), 0) / cycle.evaluations.length).toFixed(2)
    : null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, backgroundColor: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ backgroundColor: "var(--color-card)", borderRadius: "0.75rem", width: "100%", maxWidth: "720px", maxHeight: "90dvh", display: "flex", flexDirection: "column", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>

        {/* Header */}
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
          <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "0.5rem", backgroundColor: "var(--color-primary)18", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)", flexShrink: 0 }}>
            <Award size={16} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "1.0625rem", fontWeight: 700 }}>
              {loading ? "Chargement..." : cycle?.nom}
            </h2>
            {cycle && (
              <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-muted-foreground)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <CalendarDays size={11} />
                {formatDate(cycle.date_debut)} → {formatDate(cycle.date_fin)}
              </p>
            )}
          </div>
          <button onClick={onClose} style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--color-muted-foreground)", padding: "0.25rem" }}>
            <X size={18} />
          </button>
        </div>

        {/* Contenu scrollable */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem 1.5rem" }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
              <Loader2 size={24} style={{ animation: "spin 1s linear infinite", color: "var(--color-primary)" }} />
            </div>
          ) : !cycle ? (
            <p style={{ color: "var(--color-muted-foreground)", textAlign: "center" }}>Cycle introuvable.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

              {/* Stats rapides */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "0.75rem" }}>
                <div style={{ background: "var(--color-background)", border: "1px solid var(--color-border)", borderRadius: "0.625rem", padding: "0.875rem 1rem" }}>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-muted-foreground)" }}>Évaluations</p>
                  <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "var(--color-primary)", fontFamily: "var(--font-display)" }}>{cycle.evaluations.length}</p>
                </div>
                {noteMoyenne && (
                  <div style={{ background: "var(--color-background)", border: "1px solid var(--color-border)", borderRadius: "0.625rem", padding: "0.875rem 1rem" }}>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-muted-foreground)" }}>Note moyenne</p>
                    <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "var(--color-success)", fontFamily: "var(--font-display)" }}>{noteMoyenne}<span style={{ fontSize: "0.875rem", fontWeight: 400, color: "var(--color-muted-foreground)" }}>/5</span></p>
                  </div>
                )}
                <div style={{ background: "var(--color-background)", border: "1px solid var(--color-border)", borderRadius: "0.625rem", padding: "0.875rem 1rem" }}>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-muted-foreground)" }}>Critères</p>
                  <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "#8b5cf6", fontFamily: "var(--font-display)" }}>{cycle.criteres?.length ?? 0}</p>
                </div>
              </div>

              {/* Critères */}
              {cycle.criteres && cycle.criteres.length > 0 && (
                <div>
                  <p style={{ margin: "0 0 0.5rem", fontSize: "0.8125rem", fontWeight: 600 }}>Critères évalués</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                    {cycle.criteres.map(cr => (
                      <span key={cr} style={{ display: "inline-flex", alignItems: "center", padding: "0.2rem 0.6rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 600, backgroundColor: "var(--color-primary)18", color: "var(--color-primary)" }}>
                        {cr}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Liste des évaluations */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <p style={{ margin: 0, fontSize: "0.8125rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <Users size={14} /> Évaluations enregistrées
                  </p>
                  <Button size="sm" onClick={() => setShowAjout(true)} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
                    <Plus size={13} /> Ajouter
                  </Button>
                </div>

                {cycle.evaluations.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "2rem", background: "var(--color-background)", borderRadius: "0.625rem", border: "1px solid var(--color-border)" }}>
                    <Award size={28} style={{ margin: "0 auto 0.5rem", display: "block", color: "var(--color-muted-foreground)" }} />
                    <p style={{ margin: 0, color: "var(--color-muted-foreground)", fontSize: "0.875rem" }}>Aucune évaluation pour ce cycle.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                    {cycle.evaluations.map(ev => (
                      <div key={ev.evaluationId} style={{ border: "1px solid var(--color-border)", borderRadius: "0.625rem", padding: "0.875rem 1rem", background: "var(--color-background)", display: "flex", gap: "0.875rem", alignItems: "flex-start" }}>
                        <AvatarInitials firstName={ev.employee.prenom} lastName={ev.employee.nom} size="sm" />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                            <div>
                              <p style={{ margin: 0, fontWeight: 600, fontSize: "0.875rem", fontFamily: "var(--font-display)" }}>
                                {ev.employee.prenom} {ev.employee.nom}
                              </p>
                              {ev.employee.poste && (
                                <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-muted-foreground)" }}>{ev.employee.poste}</p>
                              )}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <Etoiles note={Number(ev.note_globale)} />
                              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.9375rem", color: noteColor(Number(ev.note_globale)) }}>
                                {Number(ev.note_globale).toFixed(2)}<span style={{ fontSize: "0.75rem", fontWeight: 400, color: "var(--color-muted-foreground)" }}>/5</span>
                              </span>
                            </div>
                          </div>

                          {/* Détail critères */}
                          {ev.notes_criteres && Object.keys(ev.notes_criteres).length > 0 && (
                            <div style={{ marginTop: "0.5rem", display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                              {Object.entries(ev.notes_criteres).map(([crit, note]) => (
                                <span key={crit} style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem", borderRadius: "9999px", backgroundColor: "var(--color-muted)", color: "var(--color-muted-foreground)" }}>
                                  {crit} : <strong style={{ color: noteColor(Number(note)) }}>{Number(note).toFixed(1)}</strong>
                                </span>
                              ))}
                            </div>
                          )}

                          <div style={{ marginTop: "0.375rem", display: "flex", gap: "1rem", fontSize: "0.75rem", color: "var(--color-muted-foreground)" }}>
                            {ev.evaluateur && <span>Par {ev.evaluateur.prenom} {ev.evaluateur.nom}</span>}
                            <span>{formatDate(ev.date)}</span>
                          </div>

                          {ev.commentaire && (
                            <p style={{ margin: "0.375rem 0 0", fontSize: "0.8125rem", color: "var(--color-muted-foreground)", fontStyle: "italic" }}>
                              « {ev.commentaire} »
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--color-border)", flexShrink: 0, display: "flex", justifyContent: "flex-end" }}>
          <Button variant="outline" onClick={onClose}>Fermer</Button>
        </div>
      </div>

      {/* Modal ajout évaluation */}
      {showAjout && cycle && (
        <AjoutEvaluation
          cycleId={cycle.cycleId}
          criteres={cycle.criteres}
          onClose={() => setShowAjout(false)}
          onSuccess={() => { setShowAjout(false); fetchCycle(); }}
        />
      )}
    </div>
  );
};

export default ConsulterCycle;

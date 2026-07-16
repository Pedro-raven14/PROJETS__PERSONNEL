import { useEffect, useState } from "react";
import {
  CalendarDays, FileText, GraduationCap, Award,
  Loader2, CheckCircle, Users,
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../../components/element/PageHeader";
import { AvatarInitials } from "../../../components/element/AvatarInitials";
import { API_URL } from "../../../config/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type Conge = {
  congeId: number; date_debut: string; date_fin: string; statut: string;
  typeConge: { nomType: string };
};
type Contrat = {
  contratId: number; type: string; poste: string; salaire: number;
  date_debut: string; date_fin?: string; statut: string; signe: boolean;
};
type Formation = {
  formationId: number; titre: string; niveau: string;
  date_debut: string; date_fin: string; duree: number;
};
type Evaluation = {
  evaluationId: number; note_globale: number; date: string;
  cycle: { nom: string };
};
type MembreEquipe = {
  userId: number; nom: string; prenom: string; poste?: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtDate = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
const noteColor = (n: number) => {
  if (n >= 4)   return "var(--color-success)";
  if (n >= 2.5) return "var(--color-warning)";
  return "var(--color-destructive)";
};
const statutBadge = (s: string) => {
  if (s === "APPROUVE")   return { bg: "var(--color-success)18",     color: "var(--color-success)",     label: "Approuvé" };
  if (s === "REFUSE")     return { bg: "var(--color-destructive)18", color: "var(--color-destructive)", label: "Refusé" };
  return                          { bg: "var(--color-warning)18",    color: "var(--color-warning)",     label: "En attente" };
};

function StatCard({ icon: Icon, label, value, sub, color = "var(--color-primary)" }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div className="stat-card" style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--color-muted-foreground)" }}>{label}</p>
        <div style={{ width: "2rem", height: "2rem", borderRadius: "0.5rem", backgroundColor: color + "18", display: "flex", alignItems: "center", justifyContent: "center", color }}>
          <Icon size={15} />
        </div>
      </div>
      <p style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "1.75rem", fontWeight: 700, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-muted-foreground)" }}>{sub}</p>}
    </div>
  );
}

// ─── Composant ────────────────────────────────────────────────────────────────

const Dashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const employee = (() => { try { return JSON.parse(localStorage.getItem("employee") || "null"); } catch { return null; } })();
  const headers = { Authorization: `Bearer ${token}` };

  const [conges, setConges]           = useState<Conge[]>([]);
  const [contratActif, setContrat]    = useState<Contrat | null>(null);
  const [formations, setFormations]   = useState<Formation[]>([]);
  const [evaluations, setEvals]       = useState<Evaluation[]>([]);
  const [equipe, setEquipe]           = useState<MembreEquipe[]>([]);
  const [loading, setLoading]         = useState(true);
  const [soldeConges, setSoldeConges] = useState<number>(employee?.soldeConges ?? 0);

  useEffect(() => {
    if (!employee?.userId) return;
    Promise.all([
      axios.get(`${API_URL}/conge/mes-conges`, { headers }),
      axios.get(`${API_URL}/contrat/mes-contrats`, { headers }),
      axios.get(`${API_URL}/formation/employee/${employee.userId}`, { headers }),
      axios.get(`${API_URL}/evaluation/employee/${employee.userId}`, { headers }),
      axios.get(`${API_URL}/employee/getall`, { params: { page: 1, limit: 100 }, headers }),
      axios.get(`${API_URL}/employee/${employee.userId}`, { headers }),
    ]).then(([cRes, ctRes, fRes, eRes, empRes, meRes]) => {
      const mesConges: Conge[] = cRes.data?.data ?? cRes.data ?? [];
      setConges(mesConges.slice(0, 4));

      const mesContrats: Contrat[] = ctRes.data?.data ?? ctRes.data ?? [];
      setContrat(mesContrats.find((c: Contrat) => c.statut === "ACTIF") ?? null);

      const mesFormations: Formation[] = fRes.data?.data ?? fRes.data ?? [];
      setFormations(mesFormations.slice(0, 3));

      const mesEvals: Evaluation[] = eRes.data?.data ?? eRes.data ?? [];
      setEvals(mesEvals.slice(0, 3));

      // Membres de l'équipe (hors soi-même)
      const allEmps: MembreEquipe[] = empRes.data?.data ?? empRes.data ?? [];
      setEquipe(allEmps.filter((e: any) => e.userId !== employee.userId && e.role?.nom === "EMPLOYEE").slice(0, 4));

      // Solde congés frais depuis l'API
      setSoldeConges(meRes.data?.soldeConges ?? 0);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [employee?.userId]);

  const dernEval = evaluations[0];
  const enAttente = conges.filter(c => c.statut === "EN_ATTENTE").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <PageHeader
        title={`Bonjour, ${employee?.prenom ?? ""}  👋`}
        subtitle="Voici un résumé de votre espace personnel"
      />

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
          <Loader2 size={24} style={{ animation: "spin 1s linear infinite", color: "var(--color-primary)" }} />
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>
            <StatCard icon={CalendarDays} label="Solde congés"       value={`${soldeConges}j`} sub="Disponibles" color="var(--color-success)" />
            <StatCard icon={FileText}     label="Contrat actif"       value={contratActif ? contratActif.type : "—"} sub={contratActif?.poste ?? "Aucun contrat"} />
            <StatCard icon={GraduationCap} label="Formations suivies"  value={formations.length}   sub="Inscriptions" color="#8b5cf6" />
            <StatCard icon={Award}        label="Dernière note"        value={dernEval ? `${Number(dernEval.note_globale).toFixed(1)}/5` : "—"} sub={dernEval?.cycle?.nom ?? "Aucune évaluation"} color={dernEval ? noteColor(Number(dernEval.note_globale)) : "var(--color-muted-foreground)"} />
          </div>

          {/* Congés + Contrat */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>

            {/* Mes congés récents */}
            <div className="stat-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <h3 style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 600, fontFamily: "var(--font-display)" }}>Mes congés</h3>
                <button onClick={() => navigate("/employee/leaves")} style={{ background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 500 }}>Voir tout →</button>
              </div>
              {enAttente > 0 && (
                <div style={{ padding: "0.5rem 0.75rem", borderRadius: "0.5rem", backgroundColor: "var(--color-warning)18", border: "1px solid var(--color-warning)40", marginBottom: "0.75rem", fontSize: "0.8125rem", color: "var(--color-warning)", fontWeight: 500 }}>
                  {enAttente} demande(s) en attente de validation
                </div>
              )}
              {conges.length === 0 ? (
                <p style={{ color: "var(--color-muted-foreground)", fontSize: "0.875rem", textAlign: "center", padding: "1rem 0" }}>Aucun congé enregistré</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {conges.map((c: Conge) => {
                    const s = statutBadge(c.statut);
                    return (
                      <div key={c.congeId} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--color-border)" }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: 500, fontSize: "0.8125rem" }}>{c.typeConge?.nomType}</p>
                          <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-muted-foreground)" }}>{fmtDate(c.date_debut)} → {fmtDate(c.date_fin)}</p>
                        </div>
                        <span style={{ display: "inline-flex", padding: "0.15rem 0.5rem", borderRadius: "9999px", fontSize: "0.65rem", fontWeight: 600, backgroundColor: s.bg, color: s.color, flexShrink: 0 }}>{s.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Contrat actif */}
            <div className="stat-card">
              <h3 style={{ margin: "0 0 1rem", fontSize: "0.9375rem", fontWeight: 600, fontFamily: "var(--font-display)" }}>Mon contrat actif</h3>
              {!contratActif ? (
                <p style={{ color: "var(--color-muted-foreground)", fontSize: "0.875rem", textAlign: "center", padding: "1.5rem 0" }}>Aucun contrat actif</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <span style={{ display: "inline-flex", padding: "0.2rem 0.75rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 600, backgroundColor: "var(--color-primary)18", color: "var(--color-primary)" }}>{contratActif.type}</span>
                    {contratActif.signe && <span style={{ display: "inline-flex", alignItems: "center", gap: "0.2rem", padding: "0.2rem 0.6rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 600, backgroundColor: "var(--color-success)18", color: "var(--color-success)" }}><CheckCircle size={10} /> Signé</span>}
                  </div>
                  {[
                    { label: "Poste",       value: contratActif.poste },
                    { label: "Salaire",     value: `${Number(contratActif.salaire).toLocaleString("fr-FR")} FCFA / mois` },
                    { label: "Début",       value: fmtDate(contratActif.date_debut) },
                    { label: "Fin",         value: contratActif.date_fin ? fmtDate(contratActif.date_fin) : "Indéterminée (CDI)" },
                  ].map(row => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", borderBottom: "1px solid var(--color-border)", paddingBottom: "0.5rem" }}>
                      <span style={{ color: "var(--color-muted-foreground)" }}>{row.label}</span>
                      <span style={{ fontWeight: 500 }}>{row.value}</span>
                    </div>
                  ))}
                  <button onClick={() => navigate("/employee/contracts")} style={{ background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 500, textAlign: "left", padding: 0 }}>Voir mes contrats →</button>
                </div>
              )}
            </div>
          </div>

          {/* Formations + Équipe */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>

            {/* Mes formations */}
            <div className="stat-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <h3 style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 600, fontFamily: "var(--font-display)" }}>Mes formations</h3>
                <button onClick={() => navigate("/employee/trainings")} style={{ background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 500 }}>Voir tout →</button>
              </div>
              {formations.length === 0 ? (
                <p style={{ color: "var(--color-muted-foreground)", fontSize: "0.875rem", textAlign: "center", padding: "1rem 0" }}>Aucune formation suivie</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                  {formations.map((f: Formation) => (
                    <div key={f.formationId} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", padding: "0.625rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)" }}>
                      <div style={{ width: "2rem", height: "2rem", borderRadius: "0.5rem", backgroundColor: "#8b5cf618", display: "flex", alignItems: "center", justifyContent: "center", color: "#8b5cf6", flexShrink: 0 }}>
                        <GraduationCap size={13} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: "0.8125rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.titre}</p>
                        <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-muted-foreground)" }}>{f.niveau} · {f.duree}h · jusqu'au {fmtDate(f.date_fin)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mon équipe */}
            <div className="stat-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <h3 style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 600, fontFamily: "var(--font-display)" }}>Mon équipe</h3>
                <button onClick={() => navigate("/employee/team")} style={{ background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 500 }}>Voir →</button>
              </div>
              {equipe.length === 0 ? (
                <div style={{ textAlign: "center", padding: "1rem 0", color: "var(--color-muted-foreground)" }}>
                  <Users size={20} style={{ margin: "0 auto 0.375rem", display: "block" }} />
                  <p style={{ margin: 0, fontSize: "0.875rem" }}>Pas encore dans une équipe</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {equipe.map((m: MembreEquipe) => (
                    <div key={m.userId} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.4rem 0" }}>
                      <AvatarInitials firstName={m.prenom} lastName={m.nom} size="sm" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: "0.8125rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.prenom} {m.nom}</p>
                        <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-muted-foreground)" }}>{m.poste ?? "—"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Évaluations */}
          {evaluations.length > 0 && (
            <div className="stat-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <h3 style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 600, fontFamily: "var(--font-display)" }}>Mes évaluations</h3>
                <button onClick={() => navigate("/employee/evaluations")} style={{ background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 500 }}>Voir tout →</button>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                {evaluations.map((ev: Evaluation) => (
                  <div key={ev.evaluationId} style={{ flex: "1 1 200px", padding: "0.875rem", borderRadius: "0.625rem", border: "1px solid var(--color-border)", display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-muted-foreground)" }}>{ev.cycle?.nom}</p>
                    <p style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, color: noteColor(Number(ev.note_globale)) }}>
                      {Number(ev.note_globale).toFixed(2)}<span style={{ fontSize: "0.875rem", fontWeight: 400, color: "var(--color-muted-foreground)" }}>/5</span>
                    </p>
                    <div style={{ height: "6px", borderRadius: "9999px", backgroundColor: "var(--color-muted)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(Number(ev.note_globale) / 5) * 100}%`, borderRadius: "9999px", backgroundColor: noteColor(Number(ev.note_globale)) }} />
                    </div>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-muted-foreground)" }}>{fmtDate(ev.date)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;

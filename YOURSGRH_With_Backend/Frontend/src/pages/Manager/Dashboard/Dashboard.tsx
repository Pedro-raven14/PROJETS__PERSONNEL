import { useEffect, useState } from "react";
import { Users, CalendarDays, Target, Award, Loader2, CheckCircle, Clock, XCircle } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../../components/element/PageHeader";
import { AvatarInitials } from "../../../components/element/AvatarInitials";
import { API_URL } from "../../../config/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type Membre = { userId: number; nom: string; prenom: string; poste?: string; soldeConges: number };
type Conge = {
  congeId: number; date_debut: string; date_fin: string; statut: string;
  demandeur: { userId: number; nom: string; prenom: string };
  typeConge: { nomType: string };
};
type Objectif = { objectifId: number; titre: string; status: string; points: number; date_fin: string };
type Evaluation = {
  evaluationId: number; note_globale: number; date: string;
  employee: { nom: string; prenom: string; poste?: string };
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtDate = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
const noteColor = (n: number) => {
  if (n >= 4)   return "var(--color-success)";
  if (n >= 2.5) return "var(--color-warning)";
  return "var(--color-destructive)";
};
const statutCongeColor = (s: string) => {
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

  const [membres, setMembres]       = useState<Membre[]>([]);
  const [conges, setConges]         = useState<Conge[]>([]);
  const [objectifs, setObjectifs]   = useState<Objectif[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    if (!employee?.userId) return;
    Promise.all([
      // Équipe du manager → on récupère via l'équipe
      axios.get(`${API_URL}/employee/getall`, { params: { page: 1, limit: 100 }, headers }),
      // Congés à valider
      axios.get(`${API_URL}/conge/getall`, { params: { page: 1, limit: 50 }, headers }),
      // Objectifs (tous — filtrés côté frontend)
      axios.get(`${API_URL}/objectif/getall`, { headers }).catch(() => ({ data: [] })),
      // Évaluations par cet évaluateur
      axios.get(`${API_URL}/evaluation/evaluateur/${employee.userId}`, { headers }).catch(() => ({ data: [] })),
    ]).then(([empRes, congeRes, objRes, evalRes]) => {
      // Membres : ceux qui ont une équipe (approximation — on prend tous sauf managers/RH/admin)
      const allEmps: Membre[] = empRes.data?.data ?? empRes.data ?? [];
      setMembres(allEmps.filter((e: any) => e.role?.nom === "EMPLOYEE").slice(0, 6));

      const allConges: Conge[] = congeRes.data?.data ?? congeRes.data ?? [];
      setConges(allConges.filter((c: Conge) => c.statut === "EN_ATTENTE").slice(0, 5));

      const allObj: Objectif[] = objRes.data?.data ?? objRes.data ?? [];
      setObjectifs(allObj.filter((o: Objectif) => o.status === "EN_COURS").slice(0, 4));

      const allEval: Evaluation[] = evalRes.data?.data ?? evalRes.data ?? [];
      setEvaluations(allEval.slice(0, 4));
    }).catch(() => {}).finally(() => setLoading(false));
  }, [employee?.userId]);

  const objTermines = objectifs.filter(o => o.status === "ATTEINT").length;
  const enAttente = conges.filter(c => c.statut === "EN_ATTENTE").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <PageHeader
        title={`Bonjour, ${employee?.prenom ?? "Manager"} 👋`}
        subtitle="Voici l'état de votre équipe"
      />

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
          <Loader2 size={24} style={{ animation: "spin 1s linear infinite", color: "var(--color-primary)" }} />
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "1rem" }}>
            <StatCard icon={Users}       label="Membres équipe"    value={membres.length}     sub="Employés" />
            <StatCard icon={CalendarDays} label="Congés en attente" value={enAttente}          sub="À valider" color="var(--color-warning)" />
            <StatCard icon={Target}      label="Objectifs en cours" value={objectifs.length}   sub={`${objTermines} atteint(s)`} color="var(--color-success)" />
            <StatCard icon={Award}       label="Évaluations faites" value={evaluations.length} sub="Par vous" color="#8b5cf6" />
          </div>

          {/* Membres + Congés */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>

            {/* Membres de l'équipe */}
            <div className="stat-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <h3 style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 600, fontFamily: "var(--font-display)" }}>Mon équipe</h3>
                <button onClick={() => navigate("/manager/team")} style={{ background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 500 }}>Voir tout →</button>
              </div>
              {membres.length === 0 ? (
                <p style={{ color: "var(--color-muted-foreground)", fontSize: "0.875rem", textAlign: "center", padding: "1.5rem 0" }}>Aucun membre trouvé</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {membres.map((m: Membre) => (
                    <div key={m.userId} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0" }}>
                      <AvatarInitials firstName={m.prenom} lastName={m.nom} size="sm" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: "0.8125rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.prenom} {m.nom}</p>
                        <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-muted-foreground)" }}>{m.poste ?? "—"}</p>
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-muted-foreground)", flexShrink: 0 }}>{m.soldeConges}j</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Congés en attente */}
            <div className="stat-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <h3 style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 600, fontFamily: "var(--font-display)" }}>Congés à valider</h3>
                <button onClick={() => navigate("/manager/leaves")} style={{ background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 500 }}>Voir tout →</button>
              </div>
              {conges.length === 0 ? (
                <div style={{ textAlign: "center", padding: "1.5rem 0", color: "var(--color-muted-foreground)" }}>
                  <CheckCircle size={20} style={{ margin: "0 auto 0.375rem", display: "block", color: "var(--color-success)" }} />
                  <p style={{ margin: 0, fontSize: "0.875rem" }}>Aucun congé en attente</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {conges.map((c: Conge) => {
                    const s = statutCongeColor(c.statut);
                    return (
                      <div key={c.congeId} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.625rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)" }}>
                        <AvatarInitials firstName={c.demandeur.prenom} lastName={c.demandeur.nom} size="sm" />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: "0.8125rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.demandeur.prenom} {c.demandeur.nom}</p>
                          <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-muted-foreground)" }}>{c.typeConge?.nomType} · {fmtDate(c.date_debut)} → {fmtDate(c.date_fin)}</p>
                        </div>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.2rem", padding: "0.15rem 0.5rem", borderRadius: "9999px", fontSize: "0.65rem", fontWeight: 600, backgroundColor: s.bg, color: s.color, flexShrink: 0 }}>
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Objectifs + Évaluations récentes */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>

            {/* Objectifs en cours */}
            <div className="stat-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <h3 style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 600, fontFamily: "var(--font-display)" }}>Objectifs en cours</h3>
                <button onClick={() => navigate("/manager/team")} style={{ background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 500 }}>Voir →</button>
              </div>
              {objectifs.length === 0 ? (
                <p style={{ color: "var(--color-muted-foreground)", fontSize: "0.875rem", textAlign: "center", padding: "1.5rem 0" }}>Aucun objectif en cours</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                  {objectifs.map((obj: Objectif) => (
                    <div key={obj.objectifId} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.625rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)" }}>
                      <div style={{ width: "2rem", height: "2rem", borderRadius: "0.5rem", backgroundColor: "var(--color-success)18", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-success)", flexShrink: 0 }}>
                        <Clock size={13} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: "0.8125rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{obj.titre}</p>
                        <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-muted-foreground)" }}>Échéance : {fmtDate(obj.date_fin)} · {obj.points}pts</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dernières évaluations */}
            <div className="stat-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <h3 style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 600, fontFamily: "var(--font-display)" }}>Évaluations récentes</h3>
                <button onClick={() => navigate("/manager/evaluations")} style={{ background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 500 }}>Voir →</button>
              </div>
              {evaluations.length === 0 ? (
                <div style={{ textAlign: "center", padding: "1.5rem 0", color: "var(--color-muted-foreground)" }}>
                  <XCircle size={20} style={{ margin: "0 auto 0.375rem", display: "block" }} />
                  <p style={{ margin: 0, fontSize: "0.875rem" }}>Aucune évaluation faite</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {evaluations.map((ev: Evaluation) => (
                    <div key={ev.evaluationId} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0", borderBottom: "1px solid var(--color-border)" }}>
                      <AvatarInitials firstName={ev.employee.prenom} lastName={ev.employee.nom} size="sm" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: "0.8125rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.employee.prenom} {ev.employee.nom}</p>
                        <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-muted-foreground)" }}>{fmtDate(ev.date)}</p>
                      </div>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.9375rem", color: noteColor(Number(ev.note_globale)), flexShrink: 0 }}>
                        {Number(ev.note_globale).toFixed(1)}<span style={{ fontSize: "0.7rem", color: "var(--color-muted-foreground)", fontWeight: 400 }}>/5</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;

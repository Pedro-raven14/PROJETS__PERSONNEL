import { useEffect, useState } from "react";
import {
  Users, CalendarDays, Brain,
  GraduationCap, Loader2, AlertTriangle, Award,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../../components/element/PageHeader";
import { AvatarInitials } from "../../../components/element/AvatarInitials";
import { rapportService, congeService, predictionService } from "../../../lib/mockService";

// ─── Types ────────────────────────────────────────────────────────────────────

type Stats = {
  effectifs: {
    totalEmployes: number;
    parDepartement: { nom: string; total: number }[];
    parTypeContrat: { type: string; total: number }[];
  };
  conges: { totalEnAttente: number; totalApprouves: number; totalRefuses: number };
  formations: { totalFormations: number; totalInscrits: number; tauxMoyen: number };
};

type Conge = {
  congeId: number;
  date_debut: string;
  date_fin: string;
  statut: string;
  demandeur: { nom: string; prenom: string; poste?: string };
  typeConge: { nomType: string };
};

type Prediction = {
  userId: number; nom: string; prenom: string; poste: string;
  probabilite_depart: number; niveau_risque: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const COLORS = ["var(--color-primary)", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"];
const niveauColor = (n: string) => {
  const lc = (n ?? "").toLowerCase();
  if (lc.includes("élevé") || lc.includes("eleve")) return "var(--color-destructive)";
  if (lc.includes("modéré") || lc.includes("modere")) return "var(--color-warning)";
  return "var(--color-success)";
};
const fmtDate = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });

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

  const [stats, setStats]       = useState<Stats | null>(null);
  const [conges, setConges]     = useState<Conge[]>([]);
  const [predictions, setPred]  = useState<Prediction[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    try {
      const statsData = rapportService.getStats();
      const all: Conge[] = congeService.getAll(100) as Conge[];
      const enAttente = all.filter((c) => c.statut === "EN_ATTENTE");
      const approuves = all.filter((c) => c.statut === "APPROUVE");
      const refuses   = all.filter((c) => c.statut === "REFUSE");

      if (statsData?.conges) {
        statsData.conges.totalEnAttente = enAttente.length;
        statsData.conges.totalApprouves = approuves.length;
        statsData.conges.totalRefuses   = refuses.length;
      }
      setStats(statsData);
      setConges(enAttente.slice(0, 5));

      const { data: allPreds } = predictionService.getAll();
      const departPreds = allPreds
        .filter((p: any) => p.type === "RISQUE_DEPART" && p.message)
        .sort((a: any, b: any) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime());
      if (departPreds.length > 0) {
        const parsed = JSON.parse(departPreds[0].message);
        const resultats: Prediction[] = parsed.resultats ?? [];
        setPred(resultats.sort((a, b) => (b.probabilite_depart ?? 0) - (a.probabilite_depart ?? 0)).slice(0, 3));
      }
    } catch { /* silencieux */ } finally {
      setLoading(false);
    }
  }, []);

  const congesData = stats ? [
    { label: "En attente", total: stats.conges?.totalEnAttente ?? 0, fill: "var(--color-warning)" },
    { label: "Approuvés",  total: stats.conges?.totalApprouves ?? 0, fill: "var(--color-success)" },
    { label: "Refusés",    total: stats.conges?.totalRefuses   ?? 0, fill: "var(--color-destructive)" },
  ] : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <PageHeader title="Tableau de bord RH" subtitle="Gestion des ressources humaines" />

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
          <Loader2 size={24} style={{ animation: "spin 1s linear infinite", color: "var(--color-primary)" }} />
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
            <StatCard icon={Users}         label="Employés"         value={stats?.effectifs?.totalEmployes ?? 0}                  sub="Effectif total" />
            <StatCard icon={CalendarDays}  label="Congés en attente" value={stats?.conges?.totalEnAttente ?? 0} sub="À valider" color="var(--color-warning)" />
            <StatCard icon={GraduationCap} label="Formations actives" value={stats?.formations?.totalFormations ?? 0}  sub={`${stats?.formations?.tauxMoyen ?? 0}% taux moy.`} color="var(--color-success)" />
            <StatCard icon={Award}         label="Départements"       value={stats?.effectifs?.parDepartement?.length ?? 0}        sub="Actifs" color="#8b5cf6" />
          </div>

          {/* Graphiques */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
            {/* Stats congés */}
            <div className="stat-card">
              <h3 style={{ margin: "0 0 1rem", fontSize: "0.9375rem", fontWeight: 600, fontFamily: "var(--font-display)" }}>Statuts des congés</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={congesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)" }} />
                  <Bar dataKey="total" radius={[4, 4, 0, 0]} name="Congés">
                    {congesData.map((entry: { fill: string }, i: number) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Répartition par département */}
            <div className="stat-card">
              <h3 style={{ margin: "0 0 1rem", fontSize: "0.9375rem", fontWeight: 600, fontFamily: "var(--font-display)" }}>Effectifs par département</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats?.effectifs?.parDepartement ?? []} layout="vertical" margin={{ left: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis dataKey="nom" type="category" tick={{ fontSize: 11 }} width={100} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)" }} />
                  <Bar dataKey="total" radius={[0, 4, 4, 0]} name="Employés">
                    {(stats?.effectifs?.parDepartement ?? []).map((_: { nom: string; total: number }, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Congés en attente + IA */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>

            {/* Congés en attente */}
            <div className="stat-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <h3 style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 600, fontFamily: "var(--font-display)" }}>Congés en attente</h3>
                <button onClick={() => navigate("/rh/leaves")} style={{ background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 500 }}>Voir tout →</button>
              </div>
              {conges.length === 0 ? (
                <p style={{ color: "var(--color-muted-foreground)", fontSize: "0.875rem", textAlign: "center", padding: "1.5rem 0" }}>Aucun congé en attente</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {conges.map((c: Conge) => (
                    <div key={c.congeId} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.625rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)" }}>
                      <AvatarInitials firstName={c.demandeur.prenom} lastName={c.demandeur.nom} size="sm" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: "0.8125rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.demandeur.prenom} {c.demandeur.nom}</p>
                        <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-muted-foreground)" }}>{c.typeConge?.nomType} · {fmtDate(c.date_debut)} → {fmtDate(c.date_fin)}</p>
                      </div>
                      <span style={{ display: "inline-flex", padding: "0.15rem 0.5rem", borderRadius: "9999px", fontSize: "0.65rem", fontWeight: 600, backgroundColor: "var(--color-warning)18", color: "var(--color-warning)", flexShrink: 0 }}>En attente</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Prédictions IA */}
            <div className="stat-card">
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1rem" }}>
                <div style={{ width: "2rem", height: "2rem", borderRadius: "0.5rem", backgroundColor: "var(--color-primary)18", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)" }}>
                  <Brain size={15} />
                </div>
                <h3 style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 600, fontFamily: "var(--font-display)" }}>Risques de départ</h3>
              </div>
              {predictions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "1.5rem", color: "var(--color-muted-foreground)" }}>
                  <AlertTriangle size={20} style={{ margin: "0 auto 0.5rem", display: "block" }} />
                  <p style={{ margin: 0, fontSize: "0.875rem" }}>Aucune analyse disponible</p>
                  <button onClick={() => navigate("/rh/ai")} style={{ marginTop: "0.625rem", background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 500 }}>Lancer une analyse →</button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {predictions.map((pred: Prediction) => {
                    const raw = pred.probabilite_depart ?? 0;
                    const pct = Math.min(100, Math.round(raw > 1 ? raw : raw * 100));
                    const color = niveauColor(pred.niveau_risque);
                    return (
                      <div key={pred.userId} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.625rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)", cursor: "pointer" }}
                        onClick={() => navigate(`/rh/employees/${pred.userId}`)}>
                        <AvatarInitials firstName={pred.prenom} lastName={pred.nom} size="sm" />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: "0.8125rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pred.prenom} {pred.nom}</p>
                          <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-muted-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pred.poste}</p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", flexShrink: 0 }}>
                          <div style={{ width: "60px", height: "5px", borderRadius: "9999px", backgroundColor: "var(--color-muted)", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${pct}%`, borderRadius: "9999px", backgroundColor: color }} />
                          </div>
                          <span style={{ fontSize: "0.75rem", fontWeight: 700, color, minWidth: "32px", textAlign: "right" }}>{pct}%</span>
                        </div>
                      </div>
                    );
                  })}
                  <button onClick={() => navigate("/rh/ai")} style={{ background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 500, textAlign: "left", padding: 0, marginTop: "0.25rem" }}>Voir toutes les prédictions →</button>
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

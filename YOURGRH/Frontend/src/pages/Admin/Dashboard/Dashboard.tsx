import { useEffect, useState } from "react";
import {
  Users, UserCheck, CalendarDays, TrendingDown,
  Brain, Loader2, AlertTriangle,
} from "lucide-react";
import axios from "axios";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../../components/element/PageHeader";
import { AvatarInitials } from "../../../components/element/AvatarInitials";
import { API_URL } from "../../../config/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type Stats = {
  effectifs: {
    totalEmployes: number;
    parDepartement: { nom: string; total: number }[];
    parTypeContrat: { type: string; total: number }[];
    parEquipe: { nom: string; total: number }[];
  };
  conges: {
    totalEnAttente: number;
    totalApprouves: number;
    totalRefuses: number;
    parType: { type: string; total: number }[];
  };
  formations: {
    totalFormations: number;
    totalInscrits: number;
    tauxMoyen: number;
  };
  evaluations: {
    totalEvaluations: number;
    noteMoyenne: number;
  };
};

type Prediction = {
  userId: number;
  nom: string;
  prenom: string;
  poste: string;
  probabilite_depart: number;
  niveau_risque: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PIE_COLORS = ["var(--color-primary)", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];

const niveauColor = (niveau: string) => {
  const n = (niveau ?? "").toLowerCase();
  if (n.includes("élevé") || n.includes("eleve")) return "var(--color-destructive)";
  if (n.includes("modéré") || n.includes("modere") || n.includes("moyen")) return "var(--color-warning)";
  return "var(--color-success)";
};

// ─── StatCard locale ──────────────────────────────────────────────────────────

type StatCardProps = {
  icon: React.ElementType;
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  iconColor?: string;
};

function StatCard({ icon: Icon, label, value, change, changeType = "neutral", iconColor }: StatCardProps) {
  const changeColors = {
    positive: "var(--color-success)",
    negative: "var(--color-destructive)",
    neutral:  "var(--color-muted-foreground)",
  };
  return (
    <div className="stat-card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--color-muted-foreground)" }}>{label}</p>
        <div style={{
          width: "2.25rem", height: "2.25rem", borderRadius: "0.5rem",
          display: "flex", alignItems: "center", justifyContent: "center",
          backgroundColor: iconColor ? "transparent" : "var(--color-primary)18",
          color: iconColor ? undefined : "var(--color-primary)",
          ...(iconColor ? { background: iconColor } : {}),
        }}>
          <Icon size={16} />
        </div>
      </div>
      <div>
        <p style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "1.75rem", fontWeight: 700, lineHeight: 1 }}>{value}</p>
        {change && (
          <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: changeColors[changeType] }}>{change}</p>
        )}
      </div>
    </div>
  );
}


// ─── Composant principal ──────────────────────────────────────────────────────

const Dashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [stats, setStats]           = useState<Stats | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loadingStats, setLoadingStats]   = useState(true);
  const [loadingPred, setLoadingPred]     = useState(true);

  // Charger les stats depuis /rapport/stats
  useEffect(() => {
    axios.get(`${API_URL}/rapport/stats`, { headers })
      .then(res => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setLoadingStats(false));
  }, []);

  // Charger les dernières prédictions risque de départ
  useEffect(() => {
    axios.get(`${API_URL}/prediction/getall?page=1&limit=50`, { headers })
      .then(res => {
        const data = res.data?.data ?? res.data ?? [];
        // Garder uniquement les RISQUE_DEPART, triées par date décroissante
        const departPreds = data
          .filter((p: any) => p.type === "RISQUE_DEPART" && p.message)
          .sort((a: any, b: any) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime());

        // Prendre la DERNIÈRE analyse et afficher tous ses employés
        if (departPreds.length === 0) {
          setPredictions([]);
          return;
        }
        try {
          const parsed = JSON.parse(departPreds[0].message);
          const resultats: Prediction[] = parsed.resultats ?? [];
          // Trier par probabilité décroissante et afficher les 3 premiers
          setPredictions(
            resultats
              .sort((a, b) => (b.probabilite_depart ?? 0) - (a.probabilite_depart ?? 0))
              .slice(0, 3)
          );
        } catch {
          setPredictions([]);
        }
      })
      .catch(() => setPredictions([]))
      .finally(() => setLoadingPred(false));
  }, []);

  // Construire les données de graphique à partir des stats
  const deptData = stats?.effectifs?.parDepartement ?? [];
  const contratData = stats?.effectifs?.parTypeContrat ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <PageHeader title="Tableau de bord" subtitle="Vue d'ensemble des ressources humaines" />

      {/* ── KPI Cards ── */}
      {loadingStats ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
          <Loader2 size={24} style={{ animation: "spin 1s linear infinite", color: "var(--color-primary)" }} />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          <StatCard
            icon={Users}
            label="Total employés"
            value={stats?.effectifs?.totalEmployes ?? 0}
            change="Effectif total"
            changeType="positive"
          />
          <StatCard
            icon={UserCheck}
            label="Contrats actifs"
            value={contratData.reduce((a, c) => a + c.total, 0)}
            change="CDI + CDD en cours"
            changeType="positive"
            iconColor="var(--color-success)18"
          />
          <StatCard
            icon={CalendarDays}
            label="Congés en attente"
            value={stats?.conges?.totalEnAttente ?? 0}
            change="À traiter"
            changeType="neutral"
            iconColor="var(--color-warning)18"
          />
          <StatCard
            icon={TrendingDown}
            label="Départements"
            value={deptData.length}
            change="Actifs"
            changeType="neutral"
            iconColor="var(--color-accent)18"
          />
        </div>
      )}

      {/* ── Graphiques ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem" }}>
        {/* Répartition par type de contrat */}
        <div className="stat-card">
          <h3 style={{ margin: "0 0 1rem", fontSize: "0.9375rem", fontWeight: 600, fontFamily: "var(--font-display)" }}>
            Répartition par type de contrat
          </h3>
          {contratData.length === 0 ? (
            <p style={{ color: "var(--color-muted-foreground)", fontSize: "0.875rem" }}>Aucune donnée disponible</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={contratData}>
                <defs>
                  <linearGradient id="colorContrat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--color-primary)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="type" tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)" }} />
                <Area type="monotone" dataKey="total" stroke="var(--color-primary)" strokeWidth={2} fill="url(#colorContrat)" name="Contrats" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Répartition par département */}
        <div className="stat-card">
          <h3 style={{ margin: "0 0 1rem", fontSize: "0.9375rem", fontWeight: 600, fontFamily: "var(--font-display)" }}>
            Par département
          </h3>
          {deptData.length === 0 ? (
            <p style={{ color: "var(--color-muted-foreground)", fontSize: "0.875rem" }}>Aucune donnée</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={deptData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="total" paddingAngle={3}>
                    {deptData.map((_: { nom: string; total: number }, i: number) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)" }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem 1rem", marginTop: "0.5rem" }}>
                {deptData.map((d: { nom: string; total: number }, i: number) => (
                  <div key={d.nom} style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", color: "var(--color-muted-foreground)" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                    {d.nom} ({d.total})
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Congés + IA ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem" }}>

        {/* Répartition congés par type */}
        <div className="stat-card">
          <h3 style={{ margin: "0 0 1rem", fontSize: "0.9375rem", fontWeight: 600, fontFamily: "var(--font-display)" }}>
            Statuts des congés
          </h3>
          {!stats ? (
            <p style={{ color: "var(--color-muted-foreground)", fontSize: "0.875rem" }}>Chargement...</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[
                { label: "En attente", total: stats?.conges?.totalEnAttente ?? 0, fill: "var(--color-warning)" },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)" }} />
                <Bar dataKey="total" radius={[4, 4, 0, 0]} name="Congés">
                  {[{ fill: "var(--color-warning)" }].map((entry: { fill: string }, i: number) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Prédictions IA */}
        <div className="stat-card" style={{ border: "1px solid var(--color-border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1rem" }}>
            <div style={{ width: "2rem", height: "2rem", borderRadius: "0.5rem", backgroundColor: "var(--color-primary)18", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)", flexShrink: 0 }}>
              <Brain size={16} />
            </div>
            <h3 style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 600, fontFamily: "var(--font-display)" }}>
              Prédictions IA — Risque de départ
            </h3>
          </div>

          {loadingPred ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "1.5rem" }}>
              <Loader2 size={20} style={{ animation: "spin 1s linear infinite", color: "var(--color-primary)" }} />
            </div>
          ) : predictions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "1.5rem", color: "var(--color-muted-foreground)" }}>
              <AlertTriangle size={24} style={{ margin: "0 auto 0.5rem", display: "block" }} />
              <p style={{ margin: 0, fontSize: "0.875rem" }}>Aucune analyse IA disponible.</p>
              <button
                onClick={() => navigate("/admin/ai")}
                style={{ marginTop: "0.75rem", background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", fontSize: "0.875rem", fontWeight: 500 }}
              >
                Lancer une analyse →
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {predictions.map((pred: Prediction) => {
                const raw = pred.probabilite_depart ?? 0;
                // Le backend peut renvoyer soit 0–1 (décimal) soit 0–100 (pourcentage déjà)
                const pct = Math.min(100, Math.round(raw > 1 ? raw : raw * 100));
                const color = niveauColor(pred.niveau_risque);
                return (
                  <div
                    key={pred.userId}
                    onClick={() => navigate(`/admin/employees/${pred.userId}`)}
                    style={{
                      display: "flex", alignItems: "center", gap: "0.875rem",
                      padding: "0.75rem", borderRadius: "0.5rem",
                      border: "1px solid var(--color-border)", cursor: "pointer",
                      transition: "border-color 0.15s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = color)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--color-border)")}
                  >
                    <AvatarInitials firstName={pred.prenom} lastName={pred.nom} size="sm" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "0.875rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {pred.prenom} {pred.nom}
                      </p>
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-muted-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {pred.poste}
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                      <div style={{ width: "80px", height: "6px", borderRadius: "9999px", backgroundColor: "var(--color-muted)", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, borderRadius: "9999px", backgroundColor: color, transition: "width 0.5s ease" }} />
                      </div>
                      <span style={{ fontSize: "0.8125rem", fontWeight: 700, color, minWidth: "36px", textAlign: "right" }}>{pct}%</span>
                    </div>
                  </div>
                );
              })}
              <button
                onClick={() => navigate("/admin/ai")}
                style={{ background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", fontSize: "0.875rem", fontWeight: 500, textAlign: "left", padding: 0, marginTop: "0.25rem" }}
              >
                Voir toutes les prédictions →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

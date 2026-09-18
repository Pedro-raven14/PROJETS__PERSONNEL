import { useEffect, useState } from "react";
import {
  BarChart3, FileText, Users, CalendarDays, GraduationCap,
  Award, Plus, Eye, Trash2, Loader2, AlertTriangle, Download,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { PageHeader } from "../../../components/element/PageHeader";
import { Button } from "../../../components/UI/Button";
import { rapportService } from "../../../lib/mockService";

// ─── Types ─────────────────────────────────────────────────────────────────────

type TypeRapport = "EFFECTIFS" | "CONGES" | "FORMATIONS" | "EVALUATIONS" | "COMPLET";

type RapportItem = {
  rapportId: number;
  titre: string;
  type: TypeRapport;
  date_generation: string;
  documentPath: string;
  generePar?: { nom: string; prenom: string };
};

type Stats = {
  effectifs: {
    totalEmployes: number;
    parDepartement: { nom: string; total: number }[];
    parTypeContrat: { type: string; total: number }[];
    parEquipe:      { nom: string; total: number }[];
  };
  conges: {
    totalEnAttente: number;
    totalApprouves: number;
    totalRefuses:   number;
    parType: { type: string; total: number }[];
  };
  formations: {
    totalFormations: number;
    totalInscrits:   number;
    tauxMoyen:       number;
    topFormations: { titre: string; inscrits: number; capacite: number }[];
  };
  evaluations: {
    totalEvaluations: number;
    noteMoyenne:      number;
    distribution: { tranche: string; total: number }[];
  };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPES: { value: TypeRapport; label: string; icon: React.ReactNode; color: string }[] = [
  { value: "EFFECTIFS",   label: "Effectifs",   icon: <Users        size={15} />, color: "var(--color-primary)"     },
  { value: "CONGES",      label: "Congés",      icon: <CalendarDays size={15} />, color: "var(--color-warning)"     },
  { value: "FORMATIONS",  label: "Formations",  icon: <GraduationCap size={15}/>, color: "var(--color-success)"     },
  { value: "EVALUATIONS", label: "Évaluations", icon: <Award        size={15} />, color: "#8b5cf6"                  },
  { value: "COMPLET",     label: "Complet",     icon: <FileText     size={15} />, color: "var(--color-foreground)"  },
];

const typeColor = (t: TypeRapport) => TYPES.find(x => x.value === t)?.color ?? "var(--color-primary)";
const typeLabel = (t: TypeRapport) => TYPES.find(x => x.value === t)?.label ?? t;

function KpiCard({ label, value, color, icon }: { label: string; value: string | number; color: string; icon: React.ReactNode }) {
  return (
    <div style={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "0.75rem", padding: "1.125rem 1.25rem", display: "flex", alignItems: "center", gap: "0.875rem" }}>
      <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "0.5rem", backgroundColor: color + "18", display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-muted-foreground)" }}>{label}</p>
        <p style={{ margin: 0, fontSize: "1.375rem", fontWeight: 700, fontFamily: "var(--font-display)", color }}>{value}</p>
      </div>
    </div>
  );
}

// ─── Export CSV ──────────────────────────────────────────────────────────────

function exportCSV(stats: Stats, onglet: string) {
  let rows: string[][] = [];
  let filename = "rapport";

  if (onglet === "effectifs") {
    filename = "rapport_effectifs";
    rows = [
      ["Département", "Employés"],
      ...stats.effectifs.parDepartement.map(d => [d.nom, String(d.total)]),
      [],
      ["Type de contrat", "Contrats actifs"],
      ...stats.effectifs.parTypeContrat.map(c => [c.type, String(c.total)]),
    ];
  } else if (onglet === "conges") {
    filename = "rapport_conges";
    rows = [
      ["Statut", "Total"],
      ["En attente", String(stats.conges.totalEnAttente)],
      ["Approuvés",  String(stats.conges.totalApprouves)],
      ["Refusés",    String(stats.conges.totalRefuses)],
      [],
      ["Type de congé", "Demandes"],
      ...stats.conges.parType.map(t => [t.type, String(t.total)]),
    ];
  } else if (onglet === "formations") {
    filename = "rapport_formations";
    rows = [
      ["Formation", "Inscrits", "Capacité", "Taux (%)"],
      ...stats.formations.topFormations.map(f => [
        f.titre,
        String(f.inscrits),
        String(f.capacite),
        f.capacite > 0 ? String(Math.round((f.inscrits / f.capacite) * 100)) : "—",
      ]),
    ];
  } else if (onglet === "evaluations") {
    filename = "rapport_evaluations";
    rows = [
      ["Tranche", "Nombre"],
      ...stats.evaluations.distribution.map(d => [d.tranche, String(d.total)]),
    ];
  }

  const csv = rows.map(r => r.join(";")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}_${new Date().toLocaleDateString("fr-FR").replace(/\//g, "-")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Composant principal ──────────────────────────────────────────────────────

const Rapports = () => {
  const [onglet, setOnglet]         = useState<"effectifs" | "conges" | "formations" | "evaluations">("effectifs");
  const [stats, setStats]           = useState<Stats | null>(null);
  const [rapports, setRapports]     = useState<RapportItem[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [generating, setGenerating] = useState<TypeRapport | null>(null);
  const [erreur, setErreur]         = useState<string | null>(null);

  const fetchStats = () => {
    try { setStats(rapportService.getStats() as Stats); }
    catch { /* silencieux */ } finally { setLoadingStats(false); }
  };

  const fetchRapports = () => {
    try { setRapports(rapportService.getAll() as RapportItem[]); }
    catch { /* silencieux */ }
  };

  useEffect(() => { fetchStats(); fetchRapports(); }, []);

  const generer = (type: TypeRapport) => {
    setGenerating(type); setErreur(null);
    try {
      rapportService.generer(type);
      fetchRapports();
    } catch (e: any) {
      setErreur(e?.message ?? "Erreur lors de la génération du rapport.");
    } finally { setGenerating(null); }
  };

  const supprimer = (id: number) => {
    if (!confirm("Supprimer ce rapport ?")) return;
    rapportService.delete(id);
    setRapports(prev => prev.filter(r => r.rapportId !== id));
  };

  const CHART_COLORS = ["var(--color-primary)", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <PageHeader
        title="Rapports RH"
        subtitle="Statistiques et rapports générés de la plateforme"
      />

      {/* ── Erreur ── */}
      {erreur && (
        <div style={{ padding: "0.875rem 1rem", borderRadius: "0.75rem", backgroundColor: "var(--color-destructive)18", border: "1px solid var(--color-destructive)", color: "var(--color-destructive)", fontSize: "0.875rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <AlertTriangle size={16} /> {erreur}
        </div>
      )}

      {/* ── Boutons générer ── */}
      <div style={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "0.75rem", padding: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <BarChart3 size={18} color="var(--color-primary)" />
          <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, fontFamily: "var(--font-display)" }}>Générer un rapport PDF</h2>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {TYPES.map(t => (
            <Button
              key={t.value}
              variant="outline"
              size="sm"
              onClick={() => generer(t.value)}
              disabled={generating !== null}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", borderColor: t.color, color: t.color }}
            >
              {generating === t.value
                ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                : <><Plus size={14} />{t.icon}</>
              }
              {t.label}
            </Button>
          ))}
        </div>
        <p style={{ margin: "0.75rem 0 0", fontSize: "0.75rem", color: "var(--color-muted-foreground)" }}>
          Le rapport sera généré en PDF et stocké dans la liste ci-dessous.
        </p>
      </div>

      {/* ── Onglets stats ── */}
      <div style={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "0.75rem", overflow: "hidden" }}>
        {/* Onglets */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--color-border)", overflowX: "auto" }}>
          {[
            { key: "effectifs",   label: "Effectifs",   icon: <Users        size={14} /> },
            { key: "conges",      label: "Congés",      icon: <CalendarDays size={14} /> },
            { key: "formations",  label: "Formations",  icon: <GraduationCap size={14}/> },
            { key: "evaluations", label: "Évaluations", icon: <Award        size={14} /> },
          ].map(o => (
            <button
              key={o.key}
              onClick={() => setOnglet(o.key as typeof onglet)}
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.375rem",
                padding: "0.875rem 1.25rem", border: "none", cursor: "pointer",
                fontSize: "0.875rem", fontWeight: onglet === o.key ? 600 : 400,
                background: "transparent", whiteSpace: "nowrap",
                borderBottom: onglet === o.key ? "2px solid var(--color-primary)" : "2px solid transparent",
                color: onglet === o.key ? "var(--color-primary)" : "var(--color-muted-foreground)",
              }}
            >
              {o.icon} {o.label}
            </button>
          ))}
        </div>

        <div style={{ padding: "1.5rem" }}>
          {loadingStats ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
              <Loader2 size={24} style={{ animation: "spin 1s linear infinite", color: "var(--color-primary)" }} />
            </div>
          ) : !stats ? (
            <p style={{ color: "var(--color-muted-foreground)", textAlign: "center" }}>Impossible de charger les statistiques.</p>
          ) : onglet === "effectifs" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* KPI */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.75rem" }}>
                <KpiCard label="Total employés"      value={stats.effectifs.totalEmployes}      color="var(--color-primary)" icon={<Users size={18} />} />
                <KpiCard label="Contrats actifs"     value={stats.effectifs.parTypeContrat.reduce((a, c) => a + c.total, 0)} color="var(--color-success)" icon={<FileText size={18} />} />
                <KpiCard label="Départements actifs" value={stats.effectifs.parDepartement.length}   color="#8b5cf6" icon={<BarChart3 size={18} />} />
              </div>
              {/* Graphiques */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}>
                {stats.effectifs.parDepartement.length > 0 && (
                  <div>
                    <p style={{ margin: "0 0 0.75rem", fontWeight: 600, fontSize: "0.875rem" }}>Par département</p>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={stats.effectifs.parDepartement} margin={{ left: -20 }}>
                        <XAxis dataKey="nom" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                        <Tooltip formatter={(v) => [`${v} employé(s)`, ""]} />
                        <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                          {stats.effectifs.parDepartement.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {stats.effectifs.parTypeContrat.length > 0 && (
                  <div>
                    <p style={{ margin: "0 0 0.75rem", fontWeight: 600, fontSize: "0.875rem" }}>Par type de contrat</p>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={stats.effectifs.parTypeContrat} margin={{ left: -20 }}>
                        <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                        <Tooltip formatter={(v) => [`${v} contrat(s)`, ""]} />
                        <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                          {stats.effectifs.parTypeContrat.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
              <Button variant="outline" size="sm" style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: "0.375rem" }} onClick={() => exportCSV(stats, "effectifs")}>
                <Download size={14} /> Exporter CSV
              </Button>
            </div>

          ) : onglet === "conges" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.75rem" }}>
                <KpiCard label="En attente" value={stats.conges.totalEnAttente} color="var(--color-warning)"     icon={<CalendarDays size={18} />} />
                <KpiCard label="Approuvés"  value={stats.conges.totalApprouves} color="var(--color-success)"    icon={<CalendarDays size={18} />} />
                <KpiCard label="Refusés"    value={stats.conges.totalRefuses}   color="var(--color-destructive)" icon={<CalendarDays size={18} />} />
              </div>
              {stats.conges.parType.length > 0 && (
                <div>
                  <p style={{ margin: "0 0 0.75rem", fontWeight: 600, fontSize: "0.875rem" }}>Par type de congé</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={stats.conges.parType} margin={{ left: -20 }}>
                      <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip formatter={(v) => [`${v} demande(s)`, ""]} />
                      <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                        {stats.conges.parType.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <Button variant="outline" size="sm" style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: "0.375rem" }} onClick={() => exportCSV(stats, "conges")}>
                <Download size={14} /> Exporter CSV
              </Button>
            </div>
          ) : onglet === "formations" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.75rem" }}>
                <KpiCard label="Formations"      value={stats.formations.totalFormations} color="var(--color-success)" icon={<GraduationCap size={18} />} />
                <KpiCard label="Total inscrits"  value={stats.formations.totalInscrits}   color="var(--color-primary)" icon={<Users size={18} />} />
                <KpiCard label="Taux moyen"      value={`${stats.formations.tauxMoyen}%`} color="#8b5cf6"              icon={<BarChart3 size={18} />} />
              </div>
              {stats.formations.topFormations.length > 0 && (
                <div>
                  <p style={{ margin: "0 0 0.75rem", fontWeight: 600, fontSize: "0.875rem" }}>Inscriptions par formation</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={stats.formations.topFormations} layout="vertical" margin={{ left: 10, right: 20 }}>
                      <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                      <YAxis dataKey="titre" type="category" tick={{ fontSize: 10 }} width={140}
                        tickFormatter={(v: string) => v.length > 22 ? v.slice(0, 20) + "…" : v} />
                      <Tooltip formatter={(v) => [`${v} inscrit(s)`, ""]} />
                      <Bar dataKey="inscrits" radius={[0, 4, 4, 0]}>
                        {stats.formations.topFormations.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <Button variant="outline" size="sm" style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: "0.375rem" }} onClick={() => exportCSV(stats, "formations")}>
                <Download size={14} /> Exporter CSV
              </Button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.75rem" }}>
                <KpiCard label="Total évaluations" value={stats.evaluations.totalEvaluations} color="#8b5cf6"              icon={<Award size={18} />} />
                <KpiCard label="Note moyenne"       value={stats.evaluations.noteMoyenne.toFixed(2) + " / 5"} color="var(--color-success)" icon={<Award size={18} />} />
              </div>
              {stats.evaluations.distribution.length > 0 && (
                <div>
                  <p style={{ margin: "0 0 0.75rem", fontWeight: 600, fontSize: "0.875rem" }}>Distribution des notes</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={stats.evaluations.distribution} margin={{ left: -20 }}>
                      <XAxis dataKey="tranche" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip formatter={(v) => [`${v} évaluation(s)`, ""]} />
                      <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                        {stats.evaluations.distribution.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <Button variant="outline" size="sm" style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: "0.375rem" }} onClick={() => exportCSV(stats, "evaluations")}>
                <Download size={14} /> Exporter CSV
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ── Liste des rapports générés ── */}
      <div style={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "0.75rem", overflow: "hidden" }}>
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <FileText size={18} color="var(--color-primary)" />
          <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, fontFamily: "var(--font-display)" }}>
            Rapports générés ({rapports.length})
          </h2>
        </div>

        {rapports.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <FileText style={{ width: "2rem", height: "2rem", margin: "0 auto 0.75rem", display: "block", color: "var(--color-muted-foreground)" }} />
            <p style={{ color: "var(--color-muted-foreground)", margin: 0 }}>Aucun rapport généré pour l'instant.</p>
          </div>
        ) : (
          <div>
            {rapports.map((r, i) => (
              <div
                key={r.rapportId}
                style={{
                  display: "flex", alignItems: "center", gap: "0.75rem",
                  padding: "0.875rem 1.25rem", flexWrap: "wrap",
                  borderBottom: i < rapports.length - 1 ? "1px solid var(--color-border)" : "none",
                }}
              >
                {/* Icône type */}
                <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "0.5rem", backgroundColor: typeColor(r.type) + "18", display: "flex", alignItems: "center", justifyContent: "center", color: typeColor(r.type), flexShrink: 0 }}>
                  <FileText size={15} />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "0.875rem", fontFamily: "var(--font-display)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.titre}
                  </p>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-muted-foreground)" }}>
                    {new Date(r.date_generation).toLocaleString("fr-FR")}
                    {r.generePar && ` · Par ${r.generePar.prenom} ${r.generePar.nom}`}
                  </p>
                </div>

                {/* Badge type */}
                <span style={{ display: "inline-flex", alignItems: "center", padding: "0.2rem 0.6rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 600, backgroundColor: typeColor(r.type) + "18", color: typeColor(r.type), whiteSpace: "nowrap", flexShrink: 0 }}>
                  {typeLabel(r.type)}
                </span>

                {/* Actions */}
                <div style={{ display: "flex", gap: "0.375rem", flexShrink: 0 }}>
                  <button
                    title="Supprimer"
                    onClick={() => supprimer(r.rapportId)}
                    style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "2rem", height: "2rem", borderRadius: "0.375rem", backgroundColor: "var(--color-destructive)18", color: "var(--color-destructive)", border: "none", cursor: "pointer" }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Rapports;

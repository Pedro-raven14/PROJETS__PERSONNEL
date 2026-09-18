import { useEffect, useState } from "react";
import { Check, X, Timer, Clock, CheckCircle, XCircle } from "lucide-react";
import { PageHeader } from "../../../components/element/PageHeader";
import { AvatarInitials } from "../../../components/element/AvatarInitials";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/UI/Tabs";
import { heuresSupService } from "../../../lib/mockService";
import { useIsMobile } from "../../../hooks/Use-mobile";

type HeuresSup = {
  heuresSupId: number;
  date: string;
  nb_heures: number;
  motif?: string;
  statut: "EN_ATTENTE" | "VALIDEE" | "REFUSEE";
  employee: { userId: number; nom: string; prenom: string; poste?: string };
  validateur?: { nom: string; prenom: string } | null;
};

const StatBox = ({ label, value, color, icon: Icon }: { label: string; value: number | string; color: string; icon: any }) => (
  <div className="stat-card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
    <div style={{ width: "3rem", height: "3rem", borderRadius: "0.625rem", backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon style={{ width: "20px", height: "20px", color }} />
    </div>
    <div>
      <p style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700 }}>{value}</p>
      <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--color-muted-foreground)" }}>{label}</p>
    </div>
  </div>
);

const HeuresSupManager = () => {
  const isMobile = useIsMobile();
  const emp = (() => { try { return JSON.parse(localStorage.getItem("employee") || "null"); } catch { return null; } })();

  const [declarations, setDeclarations] = useState<HeuresSup[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [acting,       setActing]       = useState<number | null>(null);

  const fetchData = () => {
    try { setDeclarations(heuresSupService.getMonEquipe(emp?.userId ?? 0) as HeuresSup[]); }
    catch { /* silencieux */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const enAttente     = declarations.filter((d) => d.statut === "EN_ATTENTE");
  const validees      = declarations.filter((d) => d.statut === "VALIDEE");
  const refusees      = declarations.filter((d) => d.statut === "REFUSEE");
  const totalValidees = validees.reduce((sum, d) => sum + Number(d.nb_heures), 0);

  const handleAction = (id: number, statut: "VALIDEE" | "REFUSEE") => {
    setActing(id);
    try {
      heuresSupService.valider(id, statut, emp?.userId ?? 0);
      setDeclarations((prev) => prev.map((d) => d.heuresSupId === id ? { ...d, statut } : d));
    } catch { fetchData(); } finally {
      setActing(null);
    }
  };

  const ListeDeclarations = ({ items, showActions = false }: { items: HeuresSup[]; showActions?: boolean }) => {
    if (items.length === 0) {
      return (
        <div className="stat-card" style={{ textAlign: "center", padding: "2rem", color: "var(--color-muted-foreground)" }}>
          Aucune déclaration
        </div>
      );
    }

    if (isMobile) {
      return (
        <div className="stat-card" style={{ padding: 0, overflow: "hidden" }}>
          {items.map((d, i) => (
            <div key={d.heuresSupId} style={{ padding: "0.875rem 1rem", borderBottom: i < items.length - 1 ? "1px solid var(--color-border)" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.375rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <AvatarInitials firstName={d.employee.prenom} lastName={d.employee.nom} size="sm" />
                  <div>
                    <p style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "0.875rem", fontWeight: 600 }}>
                      {d.employee.prenom} {d.employee.nom}
                    </p>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-muted-foreground)" }}>
                      {new Date(d.date).toLocaleDateString("fr-FR")} · <strong>{Number(d.nb_heures).toFixed(1)} h</strong>
                    </p>
                  </div>
                </div>
                <span className={d.statut === "VALIDEE" ? "badge-status badge-success" : d.statut === "REFUSEE" ? "badge-status badge-destructive" : "badge-status badge-warning"}>
                  {d.statut === "EN_ATTENTE" ? "En attente" : d.statut === "VALIDEE" ? "Validée" : "Refusée"}
                </span>
              </div>
              {d.motif && <p style={{ margin: "0 0 0.375rem", fontSize: "0.75rem", color: "var(--color-muted-foreground)", fontStyle: "italic" }}>{d.motif}</p>}
              {showActions && (
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                  <button
                    disabled={acting === d.heuresSupId}
                    onClick={() => handleAction(d.heuresSupId, "VALIDEE")}
                    style={{ flex: 1, padding: "0.4rem", borderRadius: "0.375rem", border: "1px solid var(--color-success)", background: "color-mix(in srgb, var(--color-success) 8%, transparent)", cursor: "pointer", color: "var(--color-success)", fontSize: "0.8125rem", fontFamily: "var(--font-display)", fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem", opacity: acting === d.heuresSupId ? 0.5 : 1 }}
                  >
                    <Check style={{ width: "14px", height: "14px" }} /> Valider
                  </button>
                  <button
                    disabled={acting === d.heuresSupId}
                    onClick={() => handleAction(d.heuresSupId, "REFUSEE")}
                    style={{ flex: 1, padding: "0.4rem", borderRadius: "0.375rem", border: "1px solid var(--color-destructive)", background: "color-mix(in srgb, var(--color-destructive) 8%, transparent)", cursor: "pointer", color: "var(--color-destructive)", fontSize: "0.8125rem", fontFamily: "var(--font-display)", fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem", opacity: acting === d.heuresSupId ? 0.5 : 1 }}
                  >
                    <X style={{ width: "14px", height: "14px" }} /> Refuser
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="stat-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                <th className="table-header" style={{ padding: "0.75rem 1.25rem", textAlign: "left" }}>Employé</th>
                <th className="table-header" style={{ padding: "0.75rem 1.25rem", textAlign: "left" }}>Date</th>
                <th className="table-header" style={{ padding: "0.75rem 1.25rem", textAlign: "left" }}>Heures</th>
                <th className="table-header" style={{ padding: "0.75rem 1.25rem", textAlign: "left" }}>Motif</th>
                <th className="table-header" style={{ padding: "0.75rem 1.25rem", textAlign: "left" }}>Statut</th>
                {showActions && <th className="table-header" style={{ padding: "0.75rem 1.25rem", textAlign: "right" }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {items.map((d) => (
                <tr key={d.heuresSupId} style={{ borderBottom: "1px solid var(--color-border)", transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-muted)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}>
                  <td style={{ padding: "0.875rem 1.25rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                      <AvatarInitials firstName={d.employee.prenom} lastName={d.employee.nom} size="sm" />
                      <div>
                        <p style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "0.875rem", fontWeight: 600 }}>{d.employee.prenom} {d.employee.nom}</p>
                        {d.employee.poste && <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-muted-foreground)" }}>{d.employee.poste}</p>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "0.875rem 1.25rem", fontSize: "0.875rem", whiteSpace: "nowrap" }}>{new Date(d.date).toLocaleDateString("fr-FR")}</td>
                  <td style={{ padding: "0.875rem 1.25rem", fontSize: "0.875rem", fontWeight: 600 }}>{Number(d.nb_heures).toFixed(1)} h</td>
                  <td style={{ padding: "0.875rem 1.25rem", fontSize: "0.875rem", color: "var(--color-muted-foreground)", maxWidth: "220px" }}>
                    <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.motif || "—"}</span>
                  </td>
                  <td style={{ padding: "0.875rem 1.25rem" }}>
                    <span className={d.statut === "VALIDEE" ? "badge-status badge-success" : d.statut === "REFUSEE" ? "badge-status badge-destructive" : "badge-status badge-warning"}>
                      {d.statut === "EN_ATTENTE" ? "En attente" : d.statut === "VALIDEE" ? "Validée" : "Refusée"}
                    </span>
                  </td>
                  {showActions && (
                    <td style={{ padding: "0.875rem 1.25rem" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.375rem" }}>
                        <button title="Valider" disabled={acting === d.heuresSupId} onClick={() => handleAction(d.heuresSupId, "VALIDEE")}
                          style={{ padding: "0.375rem", borderRadius: "0.375rem", border: "none", background: "transparent", cursor: "pointer", color: "var(--color-success)", opacity: acting === d.heuresSupId ? 0.5 : 1 }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "color-mix(in srgb, var(--color-success) 12%, transparent)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}>
                          <Check style={{ width: "16px", height: "16px" }} />
                        </button>
                        <button title="Refuser" disabled={acting === d.heuresSupId} onClick={() => handleAction(d.heuresSupId, "REFUSEE")}
                          style={{ padding: "0.375rem", borderRadius: "0.375rem", border: "none", background: "transparent", cursor: "pointer", color: "var(--color-destructive)", opacity: acting === d.heuresSupId ? 0.5 : 1 }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "color-mix(in srgb, var(--color-destructive) 12%, transparent)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}>
                          <X style={{ width: "16px", height: "16px" }} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <PageHeader title="Heures supplémentaires" subtitle="Validez les déclarations d'heures supplémentaires de votre équipe" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
        <StatBox label="En attente"       value={enAttente.length}         color="var(--color-warning)"     icon={Clock} />
        <StatBox label="Validées"         value={validees.length}          color="var(--color-success)"     icon={CheckCircle} />
        <StatBox label="Refusées"         value={refusees.length}          color="var(--color-destructive)" icon={XCircle} />
        <StatBox label="Total validé (h)" value={totalValidees.toFixed(1)} color="var(--color-primary)"     icon={Timer} />
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "var(--color-muted-foreground)", padding: "2rem" }}>Chargement...</p>
      ) : (
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">En attente ({enAttente.length})</TabsTrigger>
            <TabsTrigger value="validated">Validées ({validees.length})</TabsTrigger>
            <TabsTrigger value="refused">Refusées ({refusees.length})</TabsTrigger>
            <TabsTrigger value="all">Toutes ({declarations.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="pending"><ListeDeclarations items={enAttente} showActions /></TabsContent>
          <TabsContent value="validated"><ListeDeclarations items={validees} /></TabsContent>
          <TabsContent value="refused"><ListeDeclarations items={refusees} /></TabsContent>
          <TabsContent value="all"><ListeDeclarations items={declarations} /></TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default HeuresSupManager;

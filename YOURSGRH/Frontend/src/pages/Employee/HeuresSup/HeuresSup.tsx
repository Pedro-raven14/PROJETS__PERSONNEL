import { useEffect, useState } from "react";
import { Plus, X, Clock, CheckCircle, XCircle, Trash2, Timer } from "lucide-react";
import { PageHeader } from "../../../components/element/PageHeader";
import { Input } from "../../../components/UI/Input";
import { heuresSupService } from "../../../lib/mockService";

type HeuresSup = {
  heuresSupId: number;
  date: string;
  nb_heures: number;
  motif?: string;
  statut: "EN_ATTENTE" | "VALIDEE" | "REFUSEE";
  validateur?: { nom: string; prenom: string } | null;
};

const MesHeuresSup = () => {
  const emp = (() => { try { return JSON.parse(localStorage.getItem("employee") || "null"); } catch { return null; } })();

  const [declarations, setDeclarations] = useState<HeuresSup[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [showModal,    setShowModal]    = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState("");
  const [date,     setDate]     = useState("");
  const [nbHeures, setNbHeures] = useState("");
  const [motif,    setMotif]    = useState("");

  const fetchData = () => {
    try { setDeclarations(heuresSupService.getMesDeclarations(emp?.userId ?? 0) as HeuresSup[]); }
    catch { /* silencieux */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDeclarer = () => {
    if (!date || !nbHeures) { setError("La date et le nombre d'heures sont obligatoires"); return; }
    const nb = parseFloat(nbHeures);
    if (isNaN(nb) || nb < 0.5 || nb > 24) { setError("Le nombre d'heures doit être compris entre 0.5 et 24"); return; }
    setSaving(true); setError("");
    try {
      heuresSupService.declarer(emp?.userId ?? 0, { date, nb_heures: nb, motif: motif.trim() || undefined });
      setShowModal(false); setDate(""); setNbHeures(""); setMotif("");
      fetchData();
    } catch (e: any) {
      setError(e?.message || "Erreur lors de la déclaration");
    } finally { setSaving(false); }
  };

  const handleAnnuler = (id: number) => {
    if (!confirm("Annuler cette déclaration ?")) return;
    heuresSupService.annuler(id);
    setDeclarations((prev) => prev.filter((d) => d.heuresSupId !== id));
  };

  const enAttente = declarations.filter((d) => d.statut === "EN_ATTENTE").length;
  const validees  = declarations.filter((d) => d.statut === "VALIDEE").length;
  const refusees  = declarations.filter((d) => d.statut === "REFUSEE").length;
  const totalValidees = declarations
    .filter((d) => d.statut === "VALIDEE")
    .reduce((sum, d) => sum + Number(d.nb_heures), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <PageHeader
        title="Mes heures supplémentaires"
        subtitle="Déclarez vos heures supplémentaires pour validation par votre manager"
        actions={
          <button
            onClick={() => { setShowModal(true); setError(""); }}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "none", backgroundColor: "var(--color-primary)", color: "var(--color-primary-foreground)", fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "0.875rem", cursor: "pointer" }}
          >
            <Plus style={{ width: "15px", height: "15px" }} /> Nouvelle déclaration
          </button>
        }
      />

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>
        {[
          { label: "En attente",      value: enAttente,                    color: "var(--color-warning)",     icon: Clock },
          { label: "Validées",        value: validees,                     color: "var(--color-success)",     icon: CheckCircle },
          { label: "Refusées",        value: refusees,                     color: "var(--color-destructive)", icon: XCircle },
          { label: "Total validé (h)", value: totalValidees.toFixed(1),    color: "var(--color-primary)",     icon: Timer },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="stat-card" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.875rem 1rem" }}>
            <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "0.5rem", backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon style={{ width: "16px", height: "16px", color }} />
            </div>
            <div>
              <p style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: 700 }}>{value}</p>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-muted-foreground)" }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Liste */}
      <div className="stat-card">
        <h3 style={{ margin: "0 0 1rem", fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700 }}>
          Mes déclarations
        </h3>
        {loading ? (
          <p style={{ color: "var(--color-muted-foreground)", margin: 0 }}>Chargement...</p>
        ) : declarations.length === 0 ? (
          <p style={{ color: "var(--color-muted-foreground)", margin: 0, fontSize: "0.875rem" }}>Aucune déclaration</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {[...declarations].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((d) => (
              <div
                key={d.heuresSupId}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)", gap: "0.75rem", flexWrap: "wrap" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                  <Timer style={{ width: "15px", height: "15px", color: "var(--color-muted-foreground)", flexShrink: 0 }} />
                  <div>
                    <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 500 }}>
                      {Number(d.nb_heures).toFixed(1)} heure(s) — {new Date(d.date).toLocaleDateString("fr-FR")}
                    </p>
                    {d.motif && (
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-muted-foreground)", fontStyle: "italic" }}>
                        {d.motif}
                      </p>
                    )}
                    {d.validateur && (
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-muted-foreground)" }}>
                        Traité par {d.validateur.prenom} {d.validateur.nom}
                      </p>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span className={
                    d.statut === "VALIDEE"    ? "badge-status badge-success" :
                    d.statut === "REFUSEE"    ? "badge-status badge-destructive" :
                    "badge-status badge-warning"
                  }>
                    {d.statut === "EN_ATTENTE" ? "En attente" : d.statut === "VALIDEE" ? "Validée" : "Refusée"}
                  </span>
                  {d.statut === "EN_ATTENTE" && (
                    <button
                      onClick={() => handleAnnuler(d.heuresSupId)}
                      title="Annuler"
                      style={{ padding: "0.25rem", borderRadius: "0.375rem", border: "none", background: "transparent", cursor: "pointer", color: "var(--color-destructive)" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "color-mix(in srgb, var(--color-destructive) 10%, transparent)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
                    >
                      <Trash2 style={{ width: "13px", height: "13px" }} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal — Nouvelle déclaration */}
      {showModal && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 100, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div style={{ backgroundColor: "var(--color-card)", borderRadius: "0.75rem", padding: "1.5rem", width: "100%", maxWidth: "440px", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", maxHeight: "90dvh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "1.125rem", fontWeight: 700 }}>
                Déclarer des heures supplémentaires
              </h2>
              <button onClick={() => setShowModal(false)} style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--color-muted-foreground)", padding: "0.25rem" }}>
                <X style={{ width: "18px", height: "18px" }} />
              </button>
            </div>

            {error && (
              <div style={{ marginBottom: "1rem", padding: "0.75rem", borderRadius: "0.5rem", backgroundColor: "color-mix(in srgb, var(--color-destructive) 10%, transparent)", color: "var(--color-destructive)", fontSize: "0.875rem" }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.375rem" }}>
                  Date <span style={{ color: "var(--color-destructive)" }}>*</span>
                </label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.375rem" }}>
                  Nombre d'heures <span style={{ color: "var(--color-destructive)" }}>*</span>
                </label>
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="Ex : 2.5"
                  value={nbHeures}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
                    setNbHeures(v);
                  }}
                  min="0.5"
                  max="24"
                  step="0.5"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.375rem" }}>
                  Motif <span style={{ color: "var(--color-muted-foreground)", fontWeight: 400 }}>(optionnel)</span>
                </label>
                <Input
                  placeholder="Description de la tâche effectuée..."
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowModal(false)}
                disabled={saving}
                style={{ padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)", background: "transparent", cursor: "pointer", fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "0.875rem" }}
              >
                Annuler
              </button>
              <button
                onClick={handleDeclarer}
                disabled={saving}
                style={{ padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "none", backgroundColor: "var(--color-primary)", color: "var(--color-primary-foreground)", cursor: "pointer", fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "0.875rem", opacity: saving ? 0.6 : 1 }}
              >
                {saving ? "Envoi..." : "Soumettre"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MesHeuresSup;

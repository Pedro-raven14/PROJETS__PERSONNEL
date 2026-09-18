import { useState } from "react";
import { X, Briefcase, CalendarDays } from "lucide-react";
import { Input } from "../../../components/UI/Input";
import { AvatarInitials } from "../../../components/element/AvatarInitials";
import { employeeService } from "../../../lib/mockService";

type Employee = {
  userId: number;
  nom: string;
  prenom: string;
  email: string;
  phone: string;
  poste?: string;
  soldeConges: number;
};

type Props = {
  employee: Employee;
  onClose: () => void;
  onSuccess: (updated: Employee) => void;
};

const ModifierEmployee = ({ employee, onClose, onSuccess }: Props) => {

  const [poste,       setPoste]       = useState(employee.poste ?? "");
  const [soldeConges, setSoldeConges] = useState(String(employee.soldeConges));
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState("");

  const handleSubmit = () => {
    const solde = Number(soldeConges);
    if (isNaN(solde) || solde < 0) {
      setError("Le solde de congés doit être un nombre positif");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const updated = employeeService.update(employee.userId, {
        poste:       poste.trim() || undefined,
        soldeConges: solde,
      });
      onSuccess(updated);
      onClose();
    } catch (e: any) {
      setError(e?.message || "Erreur lors de la modification");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 100, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ backgroundColor: "var(--color-card)", borderRadius: "0.75rem", padding: "1.5rem", width: "100%", maxWidth: "420px", boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <AvatarInitials firstName={employee.prenom} lastName={employee.nom} size="sm" />
            <div>
              <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700 }}>
                Modifier le profil
              </h2>
              <p style={{ margin: "0.125rem 0 0", fontSize: "0.8125rem", color: "var(--color-muted-foreground)" }}>
                {employee.prenom} {employee.nom}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--color-muted-foreground)", padding: "0.25rem", borderRadius: "0.375rem" }}>
            <X style={{ width: "18px", height: "18px" }} />
          </button>
        </div>

        {/* Info — champs non modifiables */}
        <div style={{ marginBottom: "1.25rem", padding: "0.875rem", borderRadius: "0.625rem", backgroundColor: "color-mix(in srgb, var(--color-muted) 30%, transparent)", border: "1px solid var(--color-border)" }}>
          <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-muted-foreground)", fontWeight: 500, marginBottom: "0.5rem" }}>
            Informations non modifiables
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            {[
              { label: "Nom", value: `${employee.prenom} ${employee.nom}` },
              { label: "Email", value: employee.email },
              { label: "Téléphone", value: employee.phone },
            ].map(row => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
                <span style={{ color: "var(--color-muted-foreground)" }}>{row.label}</span>
                <span style={{ fontWeight: 500 }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Erreur */}
        {error && (
          <div style={{ marginBottom: "1rem", padding: "0.75rem", borderRadius: "0.5rem", backgroundColor: "color-mix(in srgb, var(--color-destructive) 10%, transparent)", color: "var(--color-destructive)", fontSize: "0.875rem" }}>
            {error}
          </div>
        )}

        {/* Champs modifiables */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          {/* Poste */}
          <div>
            <label style={labelStyle}>
              <Briefcase style={{ width: "13px", height: "13px", display: "inline", marginRight: "0.375rem" }} />
              Poste
            </label>
            <Input
              placeholder="ex: Développeur Senior"
              value={poste}
              onChange={(e) => setPoste(e.target.value)}
            />
          </div>

          {/* Solde de congés */}
          <div>
            <label style={labelStyle}>
              <CalendarDays style={{ width: "13px", height: "13px", display: "inline", marginRight: "0.375rem" }} />
              Solde de congés (jours)
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Input
                type="text"
                inputMode="numeric"
                min={0}
                value={soldeConges}
                onChange={(e) => setSoldeConges(e.target.value.replace(/[^0-9]/g, ""))}
                style={{ maxWidth: "100px" }}
              />
              <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--color-muted-foreground)" }}>
                Actuellement : <strong>{employee.soldeConges}</strong> jour(s)
              </p>
            </div>
          </div>
        </div>

        {/* Note notification */}
        <p style={{ margin: "1rem 0 0", fontSize: "0.75rem", color: "var(--color-muted-foreground)", display: "flex", alignItems: "flex-start", gap: "0.375rem" }}>
          <span style={{ color: "var(--color-primary)", fontWeight: 600 }}>ℹ</span>
          L'employé recevra une notification après toute modification.
        </p>

        {/* Actions */}
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem", justifyContent: "flex-end" }}>
          <button onClick={onClose} disabled={saving} style={btnOutline}>Annuler</button>
          <button onClick={handleSubmit} disabled={saving} style={btnPrimary}>
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </button>
        </div>
      </div>
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.375rem",
  color: "var(--color-foreground)",
};
const btnPrimary: React.CSSProperties = {
  padding: "0.5rem 1.25rem", borderRadius: "0.5rem", border: "none",
  backgroundColor: "var(--color-primary)", color: "var(--color-primary-foreground)",
  fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "0.875rem", cursor: "pointer",
};
const btnOutline: React.CSSProperties = {
  padding: "0.5rem 1.25rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)",
  backgroundColor: "transparent", color: "var(--color-foreground)",
  fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "0.875rem", cursor: "pointer",
};

export default ModifierEmployee;

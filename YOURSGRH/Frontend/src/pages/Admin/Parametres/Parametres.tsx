import { useEffect, useState } from "react";
import { Building2, Settings as SettingsIcon, Save, Plus } from "lucide-react";
import { PageHeader } from "../../../components/element/PageHeader";
import { Input } from "../../../components/UI/Input";
import { Button } from "../../../components/UI/Button";
import { parametreService } from "../../../lib/mockService";

type ParametreRH = {
  parametreId?: number;
  nom_entreprise: string;
  adresse_entreprise: string;
  email: string;
  phone: string;
  taux_conges_annuels: number;
  solde_conges_initial: number;
  nb_jours_preavis_conge: number;
};

const DEFAULT: ParametreRH = {
  nom_entreprise: "",
  adresse_entreprise: "",
  email: "",
  phone: "",
  taux_conges_annuels: 30,
  solde_conges_initial: 0,
  nb_jours_preavis_conge: 3,
};

const ONGLETS = [
  { key: "entreprise", label: "Entreprise",    icon: <Building2    style={{ width: "15px", height: "15px" }} /> },
  { key: "rh",         label: "Paramètres RH", icon: <SettingsIcon style={{ width: "15px", height: "15px" }} /> },
];

const Parametres = () => {
  const [onglet, setOnglet] = useState<"entreprise" | "rh">("entreprise");
  const [form, setForm]     = useState<ParametreRH>(DEFAULT);
  const [existe, setExiste] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => { fetchParametre(); }, []);

  const fetchParametre = () => {
    try {
      const data = parametreService.get();
      setForm({ ...DEFAULT, ...data });
      setExiste(true);
    } catch { setExiste(false); }
  };

  const handleSave = () => {
    setError(""); setSuccess(""); setSaving(true);
    if (onglet === "entreprise") {
      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        setError("L'adresse email n'est pas valide"); setSaving(false); return;
      }
      if (form.phone && !/^[+\d][\d\s\-().]{6,19}$/.test(form.phone)) {
        setError("Le numéro de téléphone n'est pas valide"); setSaving(false); return;
      }
    }
    if (onglet === "rh") {
      if (form.taux_conges_annuels < 0) { setError("Le nombre de jours de congés annuels doit être positif"); setSaving(false); return; }
      if (form.solde_conges_initial < 0) { setError("Le solde initial doit être positif"); setSaving(false); return; }
      if (form.nb_jours_preavis_conge < 0) { setError("Le préavis doit être positif"); setSaving(false); return; }
    }
    try {
      if (existe) {
        parametreService.update(form);
      } else {
        parametreService.setup(form);
        setExiste(true);
      }
      setSuccess("Paramètres enregistrés.");
      fetchParametre();
    } catch (err: any) {
      setError(err?.message || "Erreur lors de la sauvegarde");
    } finally { setSaving(false); }
  };

  const set = (key: keyof ParametreRH, value: any) =>
    setForm(f => ({ ...f, [key]: value }));

  const fieldStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "0.375rem" };
  const labelStyle: React.CSSProperties = { fontSize: "0.875rem", fontWeight: 500 };
  const hintStyle: React.CSSProperties = { fontSize: "0.75rem", color: "var(--color-muted-foreground)", marginTop: "0.125rem" };

  const iconBox = (icon: React.ReactNode) => (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      width: "2rem", height: "2rem", borderRadius: "0.5rem",
      backgroundColor: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
      color: "var(--color-primary)",
    }}>{icon}</div>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Paramètres" subtitle="Configuration de la plateforme" />

      {/* Onglets */}
      <div style={{ display: "flex", gap: "0", borderBottom: "1px solid var(--color-border)" }}>
        {ONGLETS.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => { setOnglet(key as any); setError(""); setSuccess(""); }}
            style={{
              display: "flex", alignItems: "center", gap: "0.375rem",
              padding: "0.5rem 1rem", border: "none", background: "transparent",
              cursor: "pointer", fontFamily: "var(--font-display)", fontSize: "0.875rem",
              fontWeight: onglet === key ? 600 : 400,
              color: onglet === key ? "var(--color-primary)" : "var(--color-muted-foreground)",
              borderBottom: onglet === key ? "2px solid var(--color-primary)" : "2px solid transparent",
              marginBottom: "-1px", transition: "color 0.15s",
            }}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      <div className="stat-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

        {/* En-tête */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          {onglet === "entreprise"
            ? iconBox(<Building2 style={{ width: "16px", height: "16px" }} />)
            : iconBox(<SettingsIcon style={{ width: "16px", height: "16px" }} />)
          }
          <h3 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 600 }}>
            {onglet === "entreprise" ? "Informations de l'entreprise" : "Paramètres RH"}
          </h3>
          {!existe && (
            <span className="badge-warning" style={{ marginLeft: "auto" }}>
              <Plus style={{ width: "11px", height: "11px", marginRight: "0.25rem" }} />
              Non configurés
            </span>
          )}
        </div>

        {/* ── Onglet Entreprise ── */}
        {onglet === "entreprise" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Nom de l'entreprise</label>
              <Input placeholder="ex: YOURSGRH SARL" value={form.nom_entreprise}
                onChange={e => set("nom_entreprise", e.target.value)} />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Email</label>
              <Input type="email" placeholder="contact@entreprise.com" value={form.email}
                onChange={e => set("email", e.target.value)} />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Téléphone</label>
              <Input
                placeholder="+229 XX XX XX XX"
                value={form.phone}
                inputMode="tel"
                onChange={e => set("phone", e.target.value.replace(/[^0-9+\s\-().]/g, ""))}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Adresse</label>
              <Input placeholder="Cotonou, Bénin" value={form.adresse_entreprise}
                onChange={e => set("adresse_entreprise", e.target.value)} />
            </div>
          </div>
        )}

        {/* ── Onglet Paramètres RH ── */}
        {onglet === "rh" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Jours de congés annuels</label>
              <Input type="text" inputMode="numeric" min="0" value={form.taux_conges_annuels}
                onChange={e => set("taux_conges_annuels", Number(e.target.value.replace(/[^0-9]/g, "") || 0))} />
              <span style={hintStyle}>Nombre de jours accordés par an à chaque employé</span>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Solde congés initial</label>
              <Input type="text" inputMode="numeric" min="0" value={form.solde_conges_initial}
                onChange={e => set("solde_conges_initial", Number(e.target.value.replace(/[^0-9]/g, "") || 0))} />
              <span style={hintStyle}>Solde attribué à un nouvel employé à son arrivée</span>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Préavis congé (jours)</label>
              <Input type="text" inputMode="numeric" min="0" value={form.nb_jours_preavis_conge}
                onChange={e => set("nb_jours_preavis_conge", Number(e.target.value.replace(/[^0-9]/g, "") || 0))} />
              <span style={hintStyle}>Délai minimum entre la demande et la date de début du congé</span>
            </div>
          </div>
        )}

        {error && (
          <div style={{ padding: "0.75rem", borderRadius: "0.5rem", backgroundColor: "color-mix(in srgb, var(--color-destructive) 10%, transparent)", color: "var(--color-destructive)", fontSize: "0.875rem" }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ padding: "0.75rem", borderRadius: "0.5rem", backgroundColor: "color-mix(in srgb, var(--color-success) 10%, transparent)", color: "var(--color-success)", fontSize: "0.875rem" }}>
            {success}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button onClick={handleSave} disabled={saving}>
            <Save style={{ width: "15px", height: "15px", marginRight: "0.375rem" }} />
            {saving ? "Enregistrement..." : existe ? "Enregistrer" : "Configurer"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Parametres;

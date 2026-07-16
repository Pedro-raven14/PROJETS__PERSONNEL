import { useEffect, useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { Input } from "../../../components/UI/Input";
import { API_URL } from "../../../config/api";
import { emailService } from "../../../services/emailService";

type Role = { roleId: number; nom: string };

type Props = {
  onClose: () => void;
  onSuccess: (newEmployee: { userId: number; prenom: string; nom: string }) => void;
};

const AjoutEmployee = ({ onClose, onSuccess }: Props) => {
  const token   = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // Champs du formulaire
  const [nom,      setNom]      = useState("");
  const [prenom,   setPrenom]   = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [phone,    setPhone]    = useState("");
  const [poste,    setPoste]    = useState("");
  const [roleId,   setRoleId]   = useState<number | "">("");

  const [showPassword, setShowPassword] = useState(false);
  const [roles,        setRoles]        = useState<Role[]>([]);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState("");

  useEffect(() => {
    axios.get(`${API_URL}/role/getall`, { headers })
      .then((res) => setRoles(res.data))
      .catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!nom.trim() || !prenom.trim() || !email.trim() || !password || !phone.trim() || !roleId) {
      setError("Tous les champs obligatoires doivent être remplis");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("L'adresse email n'est pas valide");
      return;
    }
    if (!/^[+\d][\d\s\-().]{6,19}$/.test(phone.trim())) {
      setError("Le numéro de téléphone n'est pas valide (chiffres, +, espaces autorisés)");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const res = await axios.post(
        `${API_URL}/employee/createEmployee`,
        { nom: nom.trim(), prenom: prenom.trim(), email: email.trim(), password, phone: phone.trim(), poste: poste.trim() || undefined, role: roleId },
        { headers },
      );

      // Envoyer l'email de bienvenue avec les identifiants (silencieux si échec)
      emailService.sendUserCredentials({
        email:        email.trim(),
        nom:          nom.trim(),
        prenom:       prenom.trim(),
        passwordTemp: password,
      });

      onSuccess({ userId: res.data.employee.userId, prenom: res.data.employee.prenom, nom: res.data.employee.nom });
    } catch (e: any) {
      const msg = e.response?.data?.message;
      setError(typeof msg === "string" ? msg : "Erreur lors de la création");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ backgroundColor: 'var(--color-card)', borderRadius: '0.75rem', padding: '1.5rem', width: '100%', maxWidth: '520px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', maxHeight: '90dvh', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 700 }}>Nouvel employé</h2>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: 'var(--color-muted-foreground)' }}>
              L'employé devra changer son mot de passe à la première connexion
            </p>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-muted-foreground)', padding: '0.25rem', borderRadius: '0.375rem' }}>
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        {/* Erreur */}
        {error && (
          <div style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'color-mix(in srgb, var(--color-destructive) 10%, transparent)', color: 'var(--color-destructive)', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {/* Formulaire */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Nom / Prénom */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={labelStyle}>Prénom <Req /></label>
              <Input placeholder="Jean" value={prenom} onChange={(e) => setPrenom(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Nom <Req /></label>
              <Input placeholder="Dupont" value={nom} onChange={(e) => setNom(e.target.value)} />
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={labelStyle}>Email <Req /></label>
            <Input type="email" placeholder="jean.dupont@entreprise.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          {/* Mot de passe temporaire */}
          <div>
            <label style={labelStyle}>Mot de passe temporaire <Req /></label>
            <div style={{ position: 'relative' }}>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 8 caractères"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-muted-foreground)', padding: 0 }}
              >
                {showPassword ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
              </button>
            </div>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
              L'employé sera forcé de le changer à la première connexion
            </p>
          </div>

          {/* Téléphone */}
          <div>
            <label style={labelStyle}>Téléphone <Req /></label>
            <Input
              placeholder="+229 01 23 45 67"
              value={phone}
              onChange={(e) => {
                // N'accepte que chiffres, +, espaces, tirets, parenthèses, points
                const v = e.target.value.replace(/[^0-9+\s\-().]/g, "");
                setPhone(v);
              }}
              inputMode="tel"
            />
          </div>

          {/* Poste */}
          <div>
            <label style={labelStyle}>Poste <span style={{ color: 'var(--color-muted-foreground)', fontWeight: 400 }}>(optionnel)</span></label>
            <Input placeholder="ex: Développeur Frontend" value={poste} onChange={(e) => setPoste(e.target.value)} />
          </div>

          {/* Rôle */}
          <div>
            <label style={labelStyle}>Rôle <Req /></label>
            <select
              value={roleId}
              onChange={(e) => setRoleId(e.target.value ? Number(e.target.value) : "")}
              style={{
                width: '100%', height: '2.5rem', padding: '0 0.75rem',
                borderRadius: '0.5rem', border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-background)', color: 'var(--color-foreground)',
                fontSize: '0.875rem', cursor: 'pointer', outline: 'none',
              }}
            >
              <option value="">Sélectionner un rôle</option>
              {roles.map((r) => (
                <option key={r.roleId} value={r.roleId}>{r.nom}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
          <button onClick={onClose} disabled={saving} style={btnOutline}>Annuler</button>
          <button onClick={handleSubmit} disabled={saving} style={btnPrimary}>
            {saving ? "Création..." : "Créer l'employé"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Styles partagés ---
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' };
const Req = () => <span style={{ color: 'var(--color-destructive)' }}> *</span>;
const btnPrimary: React.CSSProperties = { padding: '0.5rem 1.25rem', borderRadius: '0.5rem', border: 'none', backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer' };
const btnOutline: React.CSSProperties = { padding: '0.5rem 1.25rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)', backgroundColor: 'transparent', color: 'var(--color-foreground)', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer' };

export default AjoutEmployee;

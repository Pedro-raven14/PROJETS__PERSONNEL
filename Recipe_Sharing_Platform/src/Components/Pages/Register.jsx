import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../ui/Toast";

const STRENGTH_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e"];
const STRENGTH_LABELS = ["Faible", "Moyen", "Bon", "Fort"];

function getStrength(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

export default function Register() {
  const { signup } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "", username: "", email: "",
    password: "", confirmPassword: "", acceptTerms: false,
  });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const strength = getStrength(form.password);

  function setField(field, value) {
    setForm(p => ({ ...p, [field]: value }));
    setErrors(p => ({ ...p, [field]: "" }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = "Le nom complet est requis.";
    if (!form.username.trim()) errs.username = "Le nom d'utilisateur est requis.";
    else if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username))
      errs.username = "3-20 caractères alphanumériques.";
    if (!form.email.trim()) errs.email = "L'email est requis.";
    if (form.password.length < 8) errs.password = "Minimum 8 caractères.";
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Les mots de passe ne correspondent pas.";
    if (!form.acceptTerms) errs.acceptTerms = "Vous devez accepter les conditions.";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      signup({ fullName: form.fullName.trim(), username: form.username.trim(), email: form.email.trim(), password: form.password });
      addToast("Compte créé ! Bienvenue 🎉");
      navigate("/");
    } catch (err) {
      setErrors({ general: err.message });
    } finally { setLoading(false); }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #fff7ed 0%, #ffffff 50%, #f0fdf4 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "3rem 1rem"
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{
          backgroundColor: "white", borderRadius: "1.5rem",
          boxShadow: "0 20px 60px rgba(0,0,0,0.1)", padding: "2.5rem"
        }} className="auth-card">
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <Link to="/" style={{ textDecoration: "none", display: "inline-block", marginBottom: "1rem" }}>
              <div style={{
                width: 56, height: 56, backgroundColor: "#FF6B35",
                borderRadius: "50%", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "1.75rem",
                margin: "0 auto", boxShadow: "0 4px 14px rgba(255,107,53,0.35)"
              }}>🍳</div>
            </Link>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111827", marginBottom: "0.25rem" }}>
              Créez votre compte
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
              Rejoignez la communauté et partagez vos meilleures recettes
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {errors.general && (
              <div style={{
                backgroundColor: "#fef2f2", border: "1px solid #fecaca",
                color: "#dc2626", borderRadius: "0.75rem",
                padding: "0.75rem 1rem", fontSize: "0.875rem"
              }}>{errors.general}</div>
            )}

            <Field label="Nom complet" error={errors.fullName}>
              <input type="text" value={form.fullName}
                onChange={e => setField("fullName", e.target.value)}
                placeholder="Marie Dupont"
                style={inp(errors.fullName)} />
            </Field>

            <Field label="Nom d'utilisateur" error={errors.username}>
              <input type="text" value={form.username}
                onChange={e => setField("username", e.target.value)}
                placeholder="mariecuisine"
                style={inp(errors.username)} />
            </Field>

            <Field label="Email" error={errors.email}>
              <input type="email" value={form.email}
                onChange={e => setField("email", e.target.value)}
                placeholder="votre@email.com"
                style={inp(errors.email)} />
            </Field>

            {/* Mot de passe */}
            <Field label="Mot de passe" error={errors.password}>
              <div style={{ position: "relative" }}>
                <input type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={e => setField("password", e.target.value)}
                  placeholder="••••••••"
                  style={inp(errors.password, { paddingRight: "3rem" })} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{
                  position: "absolute", right: "0.875rem", top: "50%",
                  transform: "translateY(-50%)", background: "none",
                  border: "none", cursor: "pointer", color: "#9ca3af"
                }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Jauge force */}
              {form.password && (
                <div style={{ marginTop: "0.5rem" }}>
                  <div style={{ display: "flex", gap: "0.25rem" }}>
                    {[0,1,2,3].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 4, borderRadius: 9999,
                        backgroundColor: i < strength ? STRENGTH_COLORS[strength - 1] : "#e5e7eb",
                        transition: "background-color 0.2s"
                      }} />
                    ))}
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>
                    Force : {STRENGTH_LABELS[strength - 1] || "Très faible"}
                  </p>
                </div>
              )}
            </Field>

            {/* Confirmer */}
            <Field label="Confirmer le mot de passe" error={errors.confirmPassword}>
              <div style={{ position: "relative" }}>
                <input type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={e => setField("confirmPassword", e.target.value)}
                  placeholder="••••••••"
                  style={inp(errors.confirmPassword, { paddingRight: "3rem" })} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{
                  position: "absolute", right: "0.875rem", top: "50%",
                  transform: "translateY(-50%)", background: "none",
                  border: "none", cursor: "pointer", color: "#9ca3af"
                }}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            {/* CGU */}
            <div>
              <label style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", cursor: "pointer", fontSize: "0.875rem", color: "#374151" }}>
                <input type="checkbox" checked={form.acceptTerms}
                  onChange={e => setField("acceptTerms", e.target.checked)}
                  style={{ accentColor: "#FF6B35", width: 15, height: 15, marginTop: 2 }} />
                <span>
                  J'accepte les{" "}
                  <a href="#" style={{ color: "#FF6B35" }}>conditions d'utilisation</a>{" "}
                  et la{" "}
                  <a href="#" style={{ color: "#FF6B35" }}>politique de confidentialité</a>
                </span>
              </label>
              {errors.acceptTerms && (
                <p style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: "0.25rem" }}>{errors.acceptTerms}</p>
              )}
            </div>

            <button type="submit" disabled={loading} style={{
              width: "100%", backgroundColor: "#FF6B35", color: "white",
              padding: "0.875rem", borderRadius: "9999px", border: "none",
              cursor: loading ? "not-allowed" : "pointer", fontWeight: 700,
              fontSize: "0.9rem", opacity: loading ? 0.7 : 1,
              boxShadow: "0 4px 14px rgba(255,107,53,0.35)"
            }}>
              {loading ? "Création..." : "Créer mon compte"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: "0.875rem", color: "#6b7280", marginTop: "1.5rem" }}>
            Déjà un compte ?{" "}
            <Link to="/connexion" style={{ color: "#FF6B35", fontWeight: 700, textDecoration: "none" }}>
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.375rem" }}>
        {label}
      </label>
      {children}
      {error && <p style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: "0.25rem" }}>{error}</p>}
    </div>
  );
}

function inp(hasError, extra = {}) {
  return {
    width: "100%", padding: "0.75rem 1rem",
    borderRadius: "0.75rem",
    border: `1px solid ${hasError ? "#f87171" : "#e5e7eb"}`,
    fontSize: "0.875rem", fontFamily: "Inter, sans-serif",
    outline: "none", color: "#1f2937", backgroundColor: "white",
    boxSizing: "border-box", ...extra
  };
}

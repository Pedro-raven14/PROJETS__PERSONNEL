import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../ui/Toast";

export default function Login() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  function setField(field, value) {
    setForm(p => ({ ...p, [field]: value }));
    setErrors(p => ({ ...p, [field]: "" }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!form.email.trim()) errs.email = "L'email est requis.";
    if (!form.password) errs.password = "Le mot de passe est requis.";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await login(form.email, form.password);
      addToast("Connexion réussie ! Bienvenue 🎉");
      navigate("/");
    } catch (err) {
      // err.response.data.message contient le message d'erreur du backend NestJS
      setErrors({ general: err.response?.data?.message || err.message || "Erreur de connexion" });
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
        }}>
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
              Content de vous revoir !
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
              Connectez-vous pour continuer à partager vos recettes
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

            {/* Email */}
            <Field label="Email" error={errors.email}>
              <div style={{ position: "relative" }}>
                <Mail size={15} style={{
                  position: "absolute", left: "0.875rem",
                  top: "50%", transform: "translateY(-50%)", color: "#9ca3af"
                }} />
                <input type="email" value={form.email}
                  onChange={e => setField("email", e.target.value)}
                  placeholder="votre@email.com"
                  style={inputStyle(errors.email, { paddingLeft: "2.5rem" })} />
              </div>
            </Field>

            {/* Mot de passe */}
            <Field label="Mot de passe" error={errors.password}>
              <div style={{ position: "relative" }}>
                <Lock size={15} style={{
                  position: "absolute", left: "0.875rem",
                  top: "50%", transform: "translateY(-50%)", color: "#9ca3af"
                }} />
                <input type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={e => setField("password", e.target.value)}
                  placeholder="••••••••"
                  style={inputStyle(errors.password, { paddingLeft: "2.5rem", paddingRight: "3rem" })} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                  position: "absolute", right: "0.875rem",
                  top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "#9ca3af"
                }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            {/* Se souvenir / oublié */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.875rem", color: "#374151" }}>
                <input type="checkbox" style={{ accentColor: "#FF6B35", width: 15, height: 15 }} />
                Se souvenir de moi
              </label>
              <a href="#" style={{ fontSize: "0.875rem", color: "#FF6B35", fontWeight: 600, textDecoration: "none" }}>
                Mot de passe oublié ?
              </a>
            </div>

            <button type="submit" disabled={loading} style={{
              width: "100%", backgroundColor: "#FF6B35", color: "white",
              padding: "0.875rem", borderRadius: "9999px", border: "none",
              cursor: loading ? "not-allowed" : "pointer", fontWeight: 700,
              fontSize: "0.9rem", opacity: loading ? 0.7 : 1,
              boxShadow: "0 4px 14px rgba(255,107,53,0.35)"
            }}>
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "1.25rem 0" }}>
            <div style={{ flex: 1, height: 1, backgroundColor: "#e5e7eb" }} />
            <span style={{ fontSize: "0.75rem", color: "#9ca3af", fontWeight: 600, whiteSpace: "nowrap" }}>
              OU CONTINUER AVEC
            </span>
            <div style={{ flex: 1, height: 1, backgroundColor: "#e5e7eb" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            {["Google", "Facebook"].map(p => (
              <button key={p} type="button"
                onClick={() => addToast(`Connexion ${p} non disponible en mode démo.`, "info")}
                style={{
                  border: "1px solid #e5e7eb", borderRadius: "9999px",
                  padding: "0.625rem", fontSize: "0.875rem", fontWeight: 500,
                  background: "white", cursor: "pointer", color: "#374151"
                }}>{p}</button>
            ))}
          </div>

          <p style={{ textAlign: "center", fontSize: "0.875rem", color: "#6b7280", marginTop: "1.5rem" }}>
            Pas encore de compte ?{" "}
            <Link to="/inscription" style={{ color: "#FF6B35", fontWeight: 700, textDecoration: "none" }}>
              S'inscrire
            </Link>
          </p>

          <div style={{
            marginTop: "1rem", backgroundColor: "#eff6ff",
            borderRadius: "0.75rem", padding: "0.75rem",
            fontSize: "0.8rem", color: "#3b82f6"
          }}>
            💡 <strong>Note :</strong> Créez un compte ou inscrivez-vous pour commencer à partager vos recettes.
          </div>
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

function inputStyle(hasError, extra = {}) {
  return {
    width: "100%", padding: "0.75rem 1rem",
    borderRadius: "0.75rem",
    border: `1px solid ${hasError ? "#f87171" : "#e5e7eb"}`,
    fontSize: "0.875rem", fontFamily: "Inter, sans-serif",
    outline: "none", color: "#1f2937", backgroundColor: "white",
    boxSizing: "border-box",
    ...extra
  };
}

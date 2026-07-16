import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useBlog } from "../../context/BlogContext";

export default function Connexion() {
  const { login, isAdmin } = useBlog();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Déjà connecté → redirection
  if (isAdmin) {
    navigate("/admin");
    return null;
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simule un délai réseau
    setTimeout(() => {
      const result = login(form.email, form.password);
      if (result.success) {
        navigate("/admin");
      } else {
        setError(result.error);
      }
      setLoading(false);
    }, 600);
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 mb-8">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          M
        </div>
        <span className="font-bold text-xl" style={{ color: "var(--color-text)" }}>
          MyBlog
        </span>
      </Link>

      {/* Carte */}
      <div
        className="w-full max-w-md rounded-2xl p-8"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          boxShadow: "0 8px 32px var(--color-shadow)",
        }}
      >
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--color-text)" }}>
          Connexion
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
          Accès à l'espace d'administration du blog.
        </p>

        {error && (
          <div
            className="mb-4 px-4 py-3 rounded-lg text-sm"
            style={{
              backgroundColor: "rgba(239,68,68,0.1)",
              color: "#ef4444",
              border: "1px solid rgba(239,68,68,0.3)",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--color-text)" }}
            >
              Email
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--color-text-muted)" }}
              />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="admin@myblog.dev"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg text-sm outline-none transition-colors"
                style={{
                  backgroundColor: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text)",
                }}
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--color-text)" }}
            >
              Mot de passe
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--color-text-muted)" }}
              />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required
                className="w-full pl-10 pr-10 py-3 rounded-lg text-sm outline-none transition-colors"
                style={{
                  backgroundColor: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text)",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--color-text-muted)" }}
                aria-label={showPassword ? "Masquer" : "Afficher"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Bouton */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90 mt-2 disabled:opacity-60"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        {/* Liens bas */}
        <div className="flex items-center justify-between mt-5 text-xs" style={{ color: "var(--color-text-muted)" }}>
          <span>Mot de passe oublié ?</span>
          <Link to="/" className="hover:text-[var(--color-text)] transition-colors">
            ← Retour au blog
          </Link>
        </div>

        {/* Info démo */}
        <div
          className="mt-6 px-4 py-3 rounded-lg text-xs text-center"
          style={{
            backgroundColor: "var(--color-bg)",
            color: "var(--color-text-muted)",
            border: "1px solid var(--color-border)",
          }}
        >
          Démo : <strong>admin@myblog.dev</strong> / <strong>admin123</strong>
        </div>
      </div>
    </main>
  );
}

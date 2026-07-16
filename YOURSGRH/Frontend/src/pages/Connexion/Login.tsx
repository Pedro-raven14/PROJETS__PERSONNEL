import { type FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../config/api";

const MAX_TENTATIVES = 3;
const BLOCAGE_SECONDES = 10;

type LoginProps = {
  setAuth: (token: string, user: any) => void;
};

export const Login = ({ setAuth }: LoginProps) => {
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [error, setError]             = useState("");
  const [isLoading, setIsLoading]     = useState(false);
  const [tentatives, setTentatives]   = useState(0);
  const [blocage, setBlocage]         = useState(0); // secondes restantes
  const navigate  = useNavigate();
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  const estBloque = blocage > 0;

  // Décompte du blocage
  useEffect(() => {
    if (blocage <= 0) return;
    timerRef.current = setInterval(() => {
      setBlocage((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setTentatives(0); // réinitialise le compteur après déblocage
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [blocage]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (estBloque) return;

    setError("");

    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    setIsLoading(true);
    try {
      const res   = await axios.post(`${API_URL}/auth/login`, { email, password });
      const token = res.data.access_token;
      const user  = res.data.employee;

      // Succès — réinitialiser le compteur
      setTentatives(0);
      setAuth(token, user);

      if (user.mustChangePassword) { navigate("/change-password"); return; }

      if (user.role === "ADMIN")        navigate("/admin");
      else if (user.role === "RH")      navigate("/rh");
      else if (user.role === "MANAGER") navigate("/manager");
      else                              navigate("/employee");

    } catch {
      const nouvellesTentatives = tentatives + 1;
      setTentatives(nouvellesTentatives);

      if (nouvellesTentatives >= MAX_TENTATIVES) {
        setError(`Trop de tentatives. Formulaire bloqué ${BLOCAGE_SECONDES}s.`);
        setBlocage(BLOCAGE_SECONDES);
      } else {
        const restantes = MAX_TENTATIVES - nouvellesTentatives;
        setError(
          `Identifiants invalides. ${restantes} tentative${restantes > 1 ? "s" : ""} restante${restantes > 1 ? "s" : ""}.`
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="connexion-container min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row lg:min-h-screen">

        {/* Formulaire */}
        <div className="form-section w-full lg:w-1/2 flex items-center justify-center p-6" style={{ minHeight: '100dvh' }}>
          <div className="form-wrapper w-full max-w-112.5 bg-white rounded-xl shadow-lg p-4 border border-[#e9ecef]">

            <div className="text-center mb-4">
              <h1 className="app-title text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-linear-to-r from-[#4361ee] to-[#4cc9f0]">
                YOURSGRH
              </h1>
              <p className="app-subtitle text-gray-600 mt-2">Connectez-vous à votre espace de travail</p>
            </div>

            {/* Message d'erreur / blocage */}
            {error && (
              <div className={`mb-4 text-center font-medium ${estBloque ? "text-[#e85d04]" : "text-[#dc3545]"}`}>
                {error}
              </div>
            )}

            {/* Compteur de blocage */}
            {estBloque && (
              <div style={{
                marginBottom: "1rem",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                backgroundColor: "#fff3e0",
                border: "1px solid #ffb74d",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.75rem",
              }}>
                {/* Cercle animé */}
                <div style={{
                  width: "3rem", height: "3rem", borderRadius: "9999px",
                  border: "3px solid #e85d04", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-display)", fontWeight: 800,
                  fontSize: "1.125rem", color: "#e85d04", flexShrink: 0,
                }}>
                  {blocage}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600, color: "#e85d04" }}>
                    Accès temporairement bloqué
                  </p>
                  <p style={{ margin: 0, fontSize: "0.8125rem", color: "#92400e" }}>
                    Réessayez dans {blocage} seconde{blocage > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Adresse email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => !estBloque && setEmail(e.target.value)}
                  disabled={estBloque}
                  className="w-full px-3 py-2 rounded-lg border-[1.5px] border-[#e9ecef] bg-white focus:outline-none focus:ring-2 focus:ring-[#4361ee]/20"
                  placeholder="votre@email.com"
                  style={{ opacity: estBloque ? 0.5 : 1, cursor: estBloque ? "not-allowed" : "text" }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => !estBloque && setPassword(e.target.value)}
                  disabled={estBloque}
                  className="w-full px-3 py-2 rounded-lg border-[1.5px] border-[#e9ecef] bg-white focus:outline-none focus:ring-2 focus:ring-[#4361ee]/20"
                  placeholder="Votre mot de passe"
                  style={{ opacity: estBloque ? 0.5 : 1, cursor: estBloque ? "not-allowed" : "text" }}
                />
              </div>

              {/* Indicateur de tentatives restantes */}
              {tentatives > 0 && !estBloque && (
                <div style={{ display: "flex", gap: "0.25rem", justifyContent: "center" }}>
                  {Array.from({ length: MAX_TENTATIVES }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: "8px", height: "8px", borderRadius: "9999px",
                        backgroundColor: i < tentatives ? "#dc3545" : "#e9ecef",
                        transition: "background 0.2s",
                      }}
                    />
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || estBloque}
                className="w-full login-btn bg-[#4361ee] hover:bg-[#3a56d4] text-white py-2.5 rounded-lg font-semibold disabled:opacity-60 transition-transform transform hover:-translate-y-0.5"
                style={{ cursor: estBloque ? "not-allowed" : "pointer" }}
              >
                {isLoading ? "Connexion..." : estBloque ? `Patientez ${blocage}s…` : "Se connecter"}
              </button>

              <div className="mt-4 text-center footer-info text-sm text-[#6c757d]">
                <p>© 2025 YOURSGRH. Tous droits réservés.</p>
                <div className="footer-links flex items-center justify-center gap-2 mt-2">
                  <a className="hover:underline">Confidentialité</a>
                  <span>•</span>
                  <a className="hover:underline">Conditions d'utilisation</a>
                  <span>•</span>
                  <a className="hover:underline">Aide</a>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Illustration */}
        <div className="illustration-section hidden lg:block w-full lg:w-1/2 relative">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')",
            }}
          />
          <div className="illustration-overlay absolute inset-0 bg-linear-to-br from-[#4361ee]/85 to-[#4cc9f0]/85 flex items-end p-10">
            <div className="illustration-content max-w-xl text-white">
              <h2 className="illustration-title text-2xl md:text-3xl font-bold mb-4">
                Gestion des Ressources Humaines optimisée
              </h2>
              <p className="illustration-subtitle text-base opacity-90">Rejoignez nous avec YOURSGRH</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function IconFacebook() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  );
}

function IconTwitter() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

export default function Footer() {
  const { currentUser } = useAuth();
  const profileLink = currentUser ? `/profil/${currentUser.username}` : "/connexion";

  const socialLinks = [
    { label: "Facebook", icon: <IconFacebook /> },
    { label: "Instagram", icon: <IconInstagram /> },
    { label: "Twitter", icon: <IconTwitter /> },
  ];

  return (
    <footer style={{ backgroundColor: "#111827", color: "#d1d5db", marginTop: "5rem" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "3rem 1.5rem" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "2rem"
        }}>

          {/* Logo + tagline */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <div style={{
                width: 32, height: 32, backgroundColor: "#FF6B35",
                borderRadius: "50%", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "1rem"
              }}>🍳</div>
              <span style={{ fontWeight: 800, color: "#FF6B35", fontSize: "1.1rem" }}>
                CookShare
              </span>
            </div>
            <p style={{ fontSize: "0.85rem", color: "#9ca3af", lineHeight: 1.6, maxWidth: "16rem" }}>
              Partagez vos meilleures recettes et découvrez les créations de passionnés du monde entier.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 style={{
              color: "white", fontWeight: 700, fontSize: "0.75rem",
              textTransform: "uppercase", letterSpacing: "0.08em",
              marginBottom: "1rem"
            }}>Navigation</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[
                { to: "/recettes", label: "Recettes" },
                { to: "/creer-recette", label: "Créer" },
                { to: profileLink, label: "Profil" },
              ].map(item => (
                <li key={item.to}>
                  <Link to={item.to} style={{
                    color: "#9ca3af", textDecoration: "none",
                    fontSize: "0.875rem", transition: "color 0.15s"
                  }}
                    onMouseEnter={e => e.currentTarget.style.color = "#fb923c"}
                    onMouseLeave={e => e.currentTarget.style.color = "#9ca3af"}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Entreprise */}
          <div>
            <h4 style={{
              color: "white", fontWeight: 700, fontSize: "0.75rem",
              textTransform: "uppercase", letterSpacing: "0.08em",
              marginBottom: "1rem"
            }}>Entreprise</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {["À propos", "Blog", "Contact", "Confidentialité", "Conditions"].map(label => (
                <li key={label}>
                  <a href="#" style={{
                    color: "#9ca3af", textDecoration: "none",
                    fontSize: "0.875rem", transition: "color 0.15s"
                  }}
                    onMouseEnter={e => e.currentTarget.style.color = "#fb923c"}
                    onMouseLeave={e => e.currentTarget.style.color = "#9ca3af"}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Réseaux sociaux */}
          <div>
            <h4 style={{
              color: "white", fontWeight: 700, fontSize: "0.75rem",
              textTransform: "uppercase", letterSpacing: "0.08em",
              marginBottom: "1rem"
            }}>Suivez-nous</h4>
            <div style={{ display: "flex", gap: "0.625rem" }}>
              {socialLinks.map(({ label, icon }) => (
                <a key={label} href="#" aria-label={label} style={{
                  width: 36, height: 36,
                  backgroundColor: "#374151",
                  borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#d1d5db", textDecoration: "none",
                  transition: "background-color 0.15s"
                }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "#FF6B35"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "#374151"}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div style={{
          marginTop: "2.5rem", paddingTop: "1.5rem",
          borderTop: "1px solid #374151",
          textAlign: "center", fontSize: "0.825rem", color: "#6b7280"
        }}>
          © 2026 CookShare. Tous droits réservés. Fait avec ❤️ pour les gourmands.
        </div>
      </div>
    </footer>
  );
}

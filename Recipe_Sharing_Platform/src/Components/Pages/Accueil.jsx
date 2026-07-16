import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ChevronRight } from "lucide-react";
import { getRecipes } from "../../utils/localStorage";
import RecipeCard from "../ui/RecipeCard";
import heroImg from "../../assets/hero.png";

const CATEGORIES = [
  { label: "Tout", emoji: "🍽️" },
  { label: "Petit-déjeuner", emoji: "🥐" },
  { label: "Déjeuner", emoji: "🥗" },
  { label: "Dîner", emoji: "🍲" },
  { label: "Dessert", emoji: "🍰" },
  { label: "Végétalien", emoji: "🌱" },
  { label: "Rapide", emoji: "⚡" },
  { label: "Italien", emoji: "🍝" },
  { label: "Asiatique", emoji: "🍜" },
  { label: "Sain", emoji: "🥦" },
];

export default function Accueil() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("Tout");
  const [recipes, setRecipes] = useState([]);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const all = getRecipes({ status: "published" });
    const sorted = [...all].sort((a, b) => b.rating - a.rating);
    setRecipes(sorted.slice(0, 6));
  }, []);

  function handleSubscribe(e) {
    e.preventDefault();
    if (email.trim()) setSubscribed(true);
  }

  const filteredRecipes = activeCategory === "Tout"
    ? recipes
    : recipes.filter((r) => {
        if (activeCategory === "Végétalien") return (r.tags || []).includes("vegan");
        if (activeCategory === "Rapide") return (r.prepTime + r.cookTime) <= 30;
        if (activeCategory === "Sain") return (r.tags || []).includes("healthy");
        return r.category === activeCategory;
      });

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section style={{
        position: "relative",
        minHeight: 480,
        display: "flex",
        alignItems: "center",
        overflow: "hidden"
      }}>
        {/* Image de fond */}
        <div style={{ position: "absolute", inset: 0 }}>
          <img
            src={heroImg}
            alt="Hero CookShare"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to right, rgba(124,45,18,0.85) 0%, rgba(154,52,18,0.65) 50%, transparent 100%)"
          }} />
        </div>

        <div style={{
          position: "relative", zIndex: 10,
          maxWidth: 1280, margin: "0 auto",
          padding: "4rem 1.5rem", width: "100%"
        }}>
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            backgroundColor: "rgba(255,255,255,0.18)",
            backdropFilter: "blur(8px)",
            color: "white", borderRadius: "9999px",
            padding: "0.4rem 1rem",
            fontSize: "0.875rem", fontWeight: 500, marginBottom: "1.5rem"
          }}>
            🍴 +10 000 recettes partagées
          </div>

          <h1 style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 800, color: "white",
            lineHeight: 1.1, maxWidth: "28rem",
            marginBottom: "1rem",
            letterSpacing: "-0.03em"
          }}>
            Découvrez & partagez des recettes exceptionnelles
          </h1>

          <p style={{
            color: "rgba(255,255,255,0.88)",
            fontSize: "1.1rem", maxWidth: "28rem",
            marginBottom: "2rem", lineHeight: 1.55
          }}>
            Rejoignez une communauté de gourmands passionnés qui partagent leurs créations culinaires chaque jour.
          </p>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Link to="/recettes" style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              backgroundColor: "#FF6B35", color: "white",
              padding: "0.75rem 1.5rem", borderRadius: "9999px",
              fontWeight: 700, fontSize: "0.9rem",
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(255,107,53,0.4)"
            }}>
              Explorer les recettes <ArrowRight size={17} />
            </Link>
            <Link to="/creer-recette" style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              backgroundColor: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(8px)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.3)",
              padding: "0.75rem 1.5rem", borderRadius: "9999px",
              fontWeight: 600, fontSize: "0.9rem",
              textDecoration: "none"
            }}>
              Commencer à partager
            </Link>
          </div>
        </div>
      </section>

      {/* ── Contenu principal ──────────────────────────────────── */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "2.5rem 1.5rem" }}>

        {/* Filtres catégories */}
        <div style={{
          display: "flex", gap: "0.5rem",
          overflowX: "auto", paddingBottom: "0.5rem",
          marginBottom: "2.5rem",
          scrollbarWidth: "none"
        }}>
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat.label;
            return (
              <button
                key={cat.label}
                onClick={() => setActiveCategory(cat.label)}
                style={{
                  display: "inline-flex", alignItems: "center",
                  gap: "0.375rem",
                  padding: "0.5rem 1rem",
                  borderRadius: "9999px",
                  fontSize: "0.875rem", fontWeight: 500,
                  whiteSpace: "nowrap", flexShrink: 0,
                  border: active ? "none" : "1px solid #e5e7eb",
                  backgroundColor: active ? "#FF6B35" : "white",
                  color: active ? "white" : "#4b5563",
                  cursor: "pointer",
                  boxShadow: active ? "0 2px 8px rgba(255,107,53,0.3)" : "none",
                  transition: "all 0.15s"
                }}
              >
                <span>{cat.emoji}</span>
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Section tendances */}
        <section>
          <div style={{
            display: "flex", alignItems: "flex-end",
            justifyContent: "space-between", marginBottom: "1.5rem"
          }}>
            <div>
              <h2 style={{
                fontSize: "1.5rem", fontWeight: 800,
                color: "#111827", marginBottom: "0.25rem"
              }}>
                Recettes tendances 🔥
              </h2>
              <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                Les créations les plus appréciées cette semaine
              </p>
            </div>
            <Link to="/recettes" style={{
              display: "inline-flex", alignItems: "center", gap: "0.25rem",
              color: "#FF6B35", fontSize: "0.875rem", fontWeight: 600,
              textDecoration: "none"
            }}>
              Voir tout <ChevronRight size={15} />
            </Link>
          </div>

          {filteredRecipes.length > 0 ? (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1.5rem"
            }}>
              {filteredRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "4rem 0", color: "#9ca3af" }}>
              <div style={{ fontSize: "3.5rem", marginBottom: "0.75rem" }}>🍽️</div>
              <p style={{ fontSize: "1.1rem", fontWeight: 500 }}>
                Aucune recette dans cette catégorie
              </p>
            </div>
          )}
        </section>
      </div>

      {/* ── Newsletter ──────────────────────────────────────────── */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem 5rem" }}>
        <section style={{
          backgroundColor: "#1f2937",
          borderRadius: "1.5rem",
          padding: "3.5rem 2rem",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📬</div>
          <h2 style={{
            fontSize: "1.875rem", fontWeight: 800,
            color: "white", marginBottom: "0.75rem"
          }}>
            Recevez l'inspiration culinaire chaque semaine
          </h2>
          <p style={{
            color: "#9ca3af", marginBottom: "2rem",
            maxWidth: "28rem", margin: "0 auto 2rem",
            lineHeight: 1.55
          }}>
            Les meilleures recettes, astuces et découvertes directement dans votre boîte mail.
          </p>

          {subscribed ? (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              backgroundColor: "rgba(16,185,129,0.15)", color: "#34d399",
              padding: "0.75rem 1.5rem", borderRadius: "9999px",
              fontWeight: 600
            }}>
              ✅ Merci ! Vous êtes inscrit(e).
            </div>
          ) : (
            <form onSubmit={handleSubscribe} style={{
              display: "flex", gap: "0.75rem",
              maxWidth: "26rem", margin: "0 auto",
              flexWrap: "wrap", justifyContent: "center"
            }}>
              <input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  flex: 1, minWidth: "14rem",
                  padding: "0.75rem 1.125rem",
                  borderRadius: "9999px",
                  backgroundColor: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "white",
                  fontSize: "0.875rem",
                  fontFamily: "Inter, sans-serif",
                  outline: "none"
                }}
              />
              <button type="submit" style={{
                backgroundColor: "#FF6B35",
                color: "white",
                padding: "0.75rem 1.5rem",
                borderRadius: "9999px",
                fontWeight: 700, fontSize: "0.875rem",
                border: "none", cursor: "pointer",
                whiteSpace: "nowrap"
              }}>
                S'abonner
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}

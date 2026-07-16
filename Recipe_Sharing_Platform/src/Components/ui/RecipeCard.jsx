import { Heart, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toggleFavorite, getUserById } from "../../utils/localStorage";
import StarRating from "./StarRating";
import Avatar from "./Avatar";
import { useState } from "react";

export default function RecipeCard({ recipe, onFavoriteChange }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isFav, setIsFav] = useState(
    (recipe.favorites || []).includes(currentUser?.id)
  );
  const [hovered, setHovered] = useState(false);

  const author = getUserById(recipe.authorId);
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
  const cardBg = recipe.bgColor || "#FF6B35";

  function handleFavorite(e) {
    e.stopPropagation();
    if (!currentUser) { navigate("/connexion"); return; }
    const newState = toggleFavorite(recipe.id, currentUser.id);
    setIsFav(newState);
    onFavoriteChange?.();
  }

  return (
    <div
      onClick={() => navigate(`/recettes/${recipe.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: "#fff",
        borderRadius: "1rem",
        overflow: "hidden",
        boxShadow: hovered
          ? "0 12px 28px rgba(0,0,0,0.14)"
          : "0 1px 4px rgba(0,0,0,0.08)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        transition: "all 0.2s ease",
        cursor: "pointer",
      }}
    >
      {/* Zone image / emoji */}
      <div style={{
        position: "relative",
        height: 192,
        backgroundColor: cardBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden"
      }}>
        {recipe.imageBase64 ? (
          <img
            src={recipe.imageBase64}
            alt={recipe.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span style={{
            fontSize: "5.5rem",
            filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.2))",
            userSelect: "none",
            lineHeight: 1
          }}>
            {recipe.emoji || "🍽️"}
          </span>
        )}

        {/* Badge temps */}
        <div style={{
          position: "absolute", bottom: "0.75rem", left: "0.75rem",
          backgroundColor: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(4px)",
          borderRadius: "9999px",
          padding: "0.2rem 0.625rem",
          display: "flex", alignItems: "center", gap: "0.25rem",
          fontSize: "0.75rem", fontWeight: 500, color: "#374151"
        }}>
          <Clock size={11} />
          {totalTime} min
        </div>

        {/* Bouton favori */}
        <button
          onClick={handleFavorite}
          style={{
            position: "absolute", top: "0.75rem", right: "0.75rem",
            width: "2rem", height: "2rem",
            backgroundColor: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(4px)",
            borderRadius: "50%",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
            transition: "transform 0.15s"
          }}
          aria-label="Favoris"
        >
          <Heart
            size={15}
            style={{
              color: isFav ? "#ef4444" : "#9ca3af",
              fill: isFav ? "#ef4444" : "transparent"
            }}
          />
        </button>
      </div>

      {/* Contenu texte */}
      <div style={{ padding: "1rem" }}>
        <h3 style={{
          fontWeight: 600, fontSize: "0.9rem",
          color: "#111827", marginBottom: "0.35rem",
          lineHeight: 1.35,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden"
        }}>
          {recipe.title}
        </h3>

        {recipe.description && (
          <p style={{
            fontSize: "0.8rem", color: "#6b7280",
            marginBottom: "0.75rem", lineHeight: 1.4,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden"
          }}>
            {recipe.description}
          </p>
        )}

        {/* Auteur */}
        <div style={{
          display: "flex", alignItems: "center",
          gap: "0.5rem", marginBottom: "0.625rem"
        }}>
          <Avatar user={author} size="xs" />
          <span style={{ fontSize: "0.78rem", color: "#6b7280" }}>
            {author?.fullName || "Utilisateur"}
          </span>
        </div>

        {/* Note */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
          <StarRating rating={recipe.rating} size={14} />
          <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#374151" }}>
            {recipe.rating > 0 ? recipe.rating.toFixed(1) : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}

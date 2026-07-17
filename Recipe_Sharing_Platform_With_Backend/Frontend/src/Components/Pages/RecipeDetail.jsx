import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Clock, Flame, Users, BarChart2, Heart, Share2, CheckSquare, Square, Trash2, Send, ArrowLeft } from "lucide-react";
import {
  getRecipeById,
  getCommentsByRecipe,
  addComment,
  deleteComment,
  toggleFavorite,
  rateRecipe,
  getUserRating,
  deleteRecipe,
  getRecipes,
} from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../ui/Toast";
import StarRating from "../ui/StarRating";
import Avatar from "../ui/Avatar";
import RecipeCard from "../ui/RecipeCard";

const card = {
  backgroundColor: "white", borderRadius: "1rem",
  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  border: "1px solid #f3f4f6", padding: "1.5rem"
};

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [recipe, setRecipe] = useState(null);
  const [author, setAuthor] = useState(null);
  const [comments, setComments] = useState([]);
  const [related, setRelated] = useState([]);
  const [isFav, setIsFav] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Charger la recette depuis l'API
    getRecipeById(id)
      .then((r) => {
        setRecipe(r);
        setAuthor(r.author || null);
        setIsFav(r.isFavorite || false);
        // Charger les recettes similaires
        return getRecipes({ category: r.category, limit: 4, status: "published" });
      })
      .then((res) => {
        setRelated((res.data || []).filter((x) => x.id !== id).slice(0, 3));
      })
      .catch(() => navigate("/recettes"));

    // Charger les commentaires
    getCommentsByRecipe(id).then(setComments).catch(() => {});

    // Charger la note de l'utilisateur connecté si connecté
    if (currentUser) {
      getUserRating(id)
        .then((res) => setUserRating(res.rating || 0))
        .catch(() => {});
    }
  }, [id, currentUser, navigate]);

  async function handleFavorite() {
    if (!currentUser) { navigate("/connexion"); return; }
    try {
      const result = await toggleFavorite(id);
      setIsFav(result.isFavorite);
      addToast(result.isFavorite ? "Ajouté aux favoris ❤️" : "Retiré des favoris");
    } catch {
      addToast("Erreur lors de la mise à jour des favoris", "error");
    }
  }

  async function handleRate(rating) {
    if (!currentUser) { navigate("/connexion"); return; }
    try {
      await rateRecipe(id, rating);
      setUserRating(rating);
      // Recharger la recette pour avoir la nouvelle moyenne
      const updated = await getRecipeById(id);
      setRecipe(updated);
      addToast("Note enregistrée !");
    } catch {
      addToast("Erreur lors de la notation", "error");
    }
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href)
      .then(() => addToast("Lien copié !"))
      .catch(() => addToast("Impossible de copier", "error"));
  }

  async function handleComment(e) {
    e.preventDefault();
    if (!currentUser) { navigate("/connexion"); return; }
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      await addComment(id, commentText);
      const updated = await getCommentsByRecipe(id);
      setComments(updated);
      setCommentText("");
      addToast("Commentaire publié !");
    } catch {
      addToast("Erreur lors de la publication", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteComment(cid) {
    if (!window.confirm("Supprimer ce commentaire ?")) return;
    try {
      await deleteComment(cid);
      setComments((prev) => prev.filter((c) => c.id !== cid));
    } catch {
      addToast("Erreur lors de la suppression", "error");
    }
  }

  async function handleDeleteRecipe() {
    if (!window.confirm("Supprimer définitivement cette recette ?")) return;
    try {
      await deleteRecipe(id);
      addToast("Recette supprimée.");
      navigate("/recettes");
    } catch {
      addToast("Erreur lors de la suppression", "error");
    }
  }

  if (!recipe) return null;
  const isOwner = currentUser?.id === recipe.authorId;

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "2rem 1.5rem" }}>

      {/* Retour */}
      <button onClick={() => navigate(-1)} style={{
        display: "inline-flex", alignItems: "center", gap: "0.375rem",
        background: "none", border: "none", cursor: "pointer",
        color: "#6b7280", fontSize: "0.875rem", marginBottom: "1.5rem",
        padding: 0
      }}>
        <ArrowLeft size={15} /> Retour
      </button>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div style={{
        position: "relative", width: "100%", height: 360,
        borderRadius: "1.5rem", overflow: "hidden",
        marginBottom: "2rem",
        backgroundColor: recipe.bgColor || "#FF6B35",
        display: "flex", alignItems: "flex-end"
      }}>
        {recipe.imageUrl ? (
          <img src={recipe.imageUrl} alt={recipe.title}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <span style={{ fontSize: "9rem", opacity: 0.65, userSelect: "none" }}>
              {recipe.emoji || "🍽️"}
            </span>
          </div>
        )}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)"
        }} />
        <div style={{ position: "relative", zIndex: 10, padding: "2rem", width: "100%" }}>
          <span style={{
            display: "inline-block", backgroundColor: "#FF6B35", color: "white",
            fontSize: "0.75rem", fontWeight: 600, padding: "0.25rem 0.75rem",
            borderRadius: "9999px", marginBottom: "0.75rem"
          }}>{recipe.category}</span>
          <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)", fontWeight: 800, color: "white", marginBottom: "0.75rem" }}>
            {recipe.title}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Avatar user={author} size="sm" />
              <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.875rem" }}>
                {author?.fullName}
              </span>
            </div>
            <span style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.8rem" }}>
              {new Date(recipe.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <StarRating rating={recipe.rating} size={14} />
              <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.875rem", fontWeight: 600 }}>
                {recipe.rating > 0 ? recipe.rating.toFixed(1) : "—"}
              </span>
              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem" }}>
                ({recipe.ratingsCount} avis)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats bar ──────────────────────────────────────────── */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: "0.75rem", marginBottom: "2rem"
      }}>
        {[
          { icon: <Clock size={20} color="#FF6B35" />, label: "Préparation", value: `${recipe.prepTime} min` },
          { icon: <Flame size={20} color="#ef4444" />, label: "Cuisson", value: `${recipe.cookTime} min` },
          { icon: <Users size={20} color="#00B894" />, label: "Portions", value: `${recipe.servings} pers.` },
          { icon: <BarChart2 size={20} color="#8b5cf6" />, label: "Difficulté", value: recipe.difficulty },
        ].map(stat => (
          <div key={stat.label} style={{
            backgroundColor: "white", borderRadius: "1rem", padding: "1rem",
            display: "flex", alignItems: "center", gap: "0.75rem",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #f3f4f6"
          }}>
            <div style={{
              width: 40, height: 40, backgroundColor: "#f9fafb",
              borderRadius: "0.75rem", display: "flex",
              alignItems: "center", justifyContent: "center"
            }}>{stat.icon}</div>
            <div>
              <p style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{stat.label}</p>
              <p style={{ fontWeight: 700, color: "#111827", fontSize: "0.9rem" }}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Boutons actions ─────────────────────────────────────── */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        <ActionBtn
          onClick={handleFavorite}
          active={isFav}
          activeStyle={{ backgroundColor: "#fef2f2", borderColor: "#fecaca", color: "#ef4444" }}
        >
          <Heart size={15} style={{ fill: isFav ? "#ef4444" : "transparent", color: isFav ? "#ef4444" : "currentColor" }} />
          {isFav ? "Dans les favoris" : "Ajouter aux favoris"}
        </ActionBtn>
        <ActionBtn onClick={handleShare}>
          <Share2 size={15} /> Partager
        </ActionBtn>
        {isOwner && (
          <>
            <Link to={`/modifier-recette/${id}`} style={{
              display: "inline-flex", alignItems: "center", gap: "0.375rem",
              padding: "0.5rem 1.25rem", borderRadius: "9999px",
              border: "1px solid #fed7aa", color: "#ea580c",
              fontSize: "0.875rem", fontWeight: 500, textDecoration: "none"
            }}>✏️ Modifier</Link>
            <ActionBtn onClick={handleDeleteRecipe}
              activeStyle={{ borderColor: "#fecaca", color: "#ef4444" }} active={false}>
              <Trash2 size={15} /> Supprimer
            </ActionBtn>
          </>
        )}
      </div>

      {/* ── Contenu 2 colonnes ─────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }} className="detail-grid">

        {/* Colonne principale */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* Description */}
          {recipe.description && (
            <div style={{
              borderLeft: "4px solid #FF6B35", backgroundColor: "#fff7ed",
              borderRadius: "0 0.75rem 0.75rem 0", padding: "1.25rem"
            }}>
              <p style={{ color: "#374151", lineHeight: 1.65 }}>{recipe.description}</p>
            </div>
          )}

          {/* Ingrédients */}
          <section style={card}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#111827", marginBottom: "0.5rem" }}>
              Ingrédients
            </h2>
            <p style={{ fontSize: "0.8rem", color: "#9ca3af", marginBottom: "1rem" }}>
              Cochez au fur et à mesure 👆
            </p>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {(recipe.ingredients || []).map((ing, idx) => (
                <li key={idx} onClick={() => setCheckedIngredients(p => ({ ...p, [idx]: !p[idx] }))}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.75rem",
                    padding: "0.5rem 0.75rem", borderRadius: "0.75rem",
                    cursor: "pointer",
                    backgroundColor: checkedIngredients[idx] ? "#f0fdf4" : "transparent",
                    transition: "background 0.15s"
                  }}>
                  {checkedIngredients[idx]
                    ? <CheckSquare size={17} color="#22c55e" style={{ flexShrink: 0 }} />
                    : <Square size={17} color="#d1d5db" style={{ flexShrink: 0 }} />}
                  <span style={{
                    fontSize: "0.875rem",
                    textDecoration: checkedIngredients[idx] ? "line-through" : "none",
                    color: checkedIngredients[idx] ? "#9ca3af" : "#374151"
                  }}>
                    <strong style={{ color: "#FF6B35" }}>{ing.quantity} {ing.unit}</strong> {ing.name}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Instructions */}
          <section style={card}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#111827", marginBottom: "1.25rem" }}>
              Instructions
            </h2>
            <ol style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1rem" }}>
              {(recipe.instructions || []).map((step, idx) => (
                <li key={idx} style={{ display: "flex", gap: "1rem" }}>
                  <div style={{
                    width: 32, height: 32, minWidth: 32,
                    backgroundColor: "#FF6B35", color: "white",
                    borderRadius: "50%", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    fontSize: "0.85rem", fontWeight: 700
                  }}>{idx + 1}</div>
                  <p style={{ fontSize: "0.9rem", color: "#374151", lineHeight: 1.65, paddingTop: "0.375rem" }}>
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          {/* Commentaires */}
          <section style={card}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#111827", marginBottom: "1.5rem" }}>
              Commentaires ({comments.length})
            </h2>

            {currentUser ? (
              <form onSubmit={handleComment} style={{
                display: "flex", gap: "0.75rem", marginBottom: "1.5rem",
                alignItems: "center"
              }}>
                <Avatar user={currentUser} size="sm" />
                <input type="text" value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Partagez votre avis..."
                  style={{
                    flex: 1, padding: "0.625rem 1rem",
                    borderRadius: "9999px", border: "1px solid #e5e7eb",
                    fontSize: "0.875rem", fontFamily: "Inter, sans-serif",
                    outline: "none"
                  }} />
                <button type="submit" disabled={!commentText.trim() || submitting} style={{
                  width: 36, height: 36, borderRadius: "50%",
                  backgroundColor: "#FF6B35", color: "white",
                  border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: !commentText.trim() ? 0.5 : 1, flexShrink: 0
                }}>
                  <Send size={14} />
                </button>
              </form>
            ) : (
              <div style={{
                backgroundColor: "#f9fafb", borderRadius: "1rem",
                padding: "1rem", textAlign: "center", marginBottom: "1.5rem",
                fontSize: "0.875rem", color: "#6b7280"
              }}>
                <Link to="/connexion" style={{ color: "#FF6B35", fontWeight: 600 }}>
                  Connectez-vous
                </Link>{" "}pour laisser un commentaire.
              </div>
            )}

            {comments.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {comments.map(comment => {
                  // L'API retourne l'auteur directement dans le commentaire (eager: true)
                  const ca = comment.author;
                  return (
                    <div key={comment.id} style={{ display: "flex", gap: "0.75rem" }}>
                      <Avatar user={ca} size="sm" />
                      <div style={{ flex: 1, backgroundColor: "#f9fafb", borderRadius: "1rem", padding: "0.75rem 1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.375rem" }}>
                          <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "#111827" }}>
                            {ca?.fullName || "Utilisateur"}
                          </span>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                              {new Date(comment.createdAt).toLocaleDateString("fr-FR")}
                            </span>
                            {(currentUser?.id === comment.authorId || isOwner) && (
                              <button onClick={() => handleDeleteComment(comment.id)} style={{
                                background: "none", border: "none", cursor: "pointer", color: "#9ca3af"
                              }}>
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                        <p style={{ fontSize: "0.875rem", color: "#374151" }}>{comment.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ textAlign: "center", color: "#9ca3af", fontSize: "0.875rem" }}>
                Soyez le premier à commenter !
              </p>
            )}
          </section>
        </div>

        {/* Colonne droite */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }} className="detail-sidebar">

          {/* Note */}
          <div style={card}>
            <h3 style={{ fontWeight: 700, color: "#111827", marginBottom: "0.5rem" }}>Donnez votre avis</h3>
            <p style={{ fontSize: "0.8rem", color: "#9ca3af", marginBottom: "0.75rem" }}>
              {userRating > 0 ? `Votre note : ${userRating}/5` : "Notez cette recette :"}
            </p>
            <StarRating rating={userRating} size={28} interactive={!!currentUser} onRate={handleRate} />
            {!currentUser && (
              <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.5rem" }}>
                <Link to="/connexion" style={{ color: "#FF6B35" }}>Connectez-vous</Link> pour noter
              </p>
            )}
          </div>

          {/* Tags */}
          {(recipe.tags || []).length > 0 && (
            <div style={card}>
              <h3 style={{ fontWeight: 700, color: "#111827", marginBottom: "0.75rem" }}>Tags</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {recipe.tags.map(tag => (
                  <Link key={tag} to={`/recettes?q=${tag}`} style={{
                    backgroundColor: "#fff7ed", color: "#ea580c",
                    padding: "0.25rem 0.75rem", borderRadius: "9999px",
                    fontSize: "0.8rem", fontWeight: 500, textDecoration: "none"
                  }}>#{tag}</Link>
                ))}
              </div>
            </div>
          )}

          {/* Auteur */}
          {author && (
            <div style={card}>
              <h3 style={{ fontWeight: 700, color: "#111827", marginBottom: "0.75rem" }}>Auteur</h3>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Avatar user={author} size="md" />
                <div>
                  <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "#111827" }}>{author.fullName}</p>
                  <p style={{ fontSize: "0.8rem", color: "#9ca3af" }}>@{author.username}</p>
                </div>
              </div>
              {author.bio && (
                <p style={{ fontSize: "0.85rem", color: "#6b7280", marginTop: "0.75rem", lineHeight: 1.55 }}>
                  {author.bio}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recettes similaires */}
      {related.length > 0 && (
        <section style={{ marginTop: "3rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111827", marginBottom: "1.5rem" }}>
            Vous aimerez peut-être aussi
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "1.25rem"
          }}>
            {related.map(r => <RecipeCard key={r.id} recipe={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function ActionBtn({ children, onClick, active = false, activeStyle = {} }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: "0.5rem",
      padding: "0.5rem 1.25rem", borderRadius: "9999px",
      border: "1px solid #e5e7eb", background: "white",
      fontSize: "0.875rem", fontWeight: 500, cursor: "pointer",
      color: "#374151", transition: "all 0.15s",
      ...(active ? activeStyle : {})
    }}>{children}</button>
  );
}

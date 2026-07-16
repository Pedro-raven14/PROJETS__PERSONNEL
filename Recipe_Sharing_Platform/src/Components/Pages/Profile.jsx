import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Edit2, Plus, Trash2, Heart, BookOpen, Settings, UserPlus, Users } from "lucide-react";
import {
  getUserByUsername, getRecipesByAuthor, getFavoriteRecipes,
  deleteRecipe,
} from "../../utils/localStorage";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../ui/Toast";
import RecipeCard from "../ui/RecipeCard";
import Avatar from "../ui/Avatar";

const TABS = [
  { id: "recipes",   label: "Mes recettes" },
  { id: "favorites", label: "Favoris" },
  { id: "following", label: "Abonnements" },
  { id: "settings",  label: "Paramètres" },
];

export default function Profile() {
  const { username } = useParams();
  const { currentUser, updateProfile } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState("recipes");
  const [settingsForm, setSettingsForm] = useState({ fullName: "", bio: "", avatar: null });

  const isOwn = currentUser?.username === username;

  useEffect(() => {
    const user = getUserByUsername(username);
    if (!user) { navigate("/"); return; }
    setProfileUser(user);
    setRecipes(getRecipesByAuthor(user.id));

    if (isOwn && currentUser) {
      setFavorites(getFavoriteRecipes(currentUser.id));
      setSettingsForm({
        fullName: currentUser.fullName || "",
        bio: currentUser.bio || "",
        avatar: currentUser.avatar || null,
      });
    }
  }, [username, currentUser, isOwn, navigate]);

  function handleDeleteRecipe(rid) {
    if (!window.confirm("Supprimer cette recette ?")) return;
    deleteRecipe(rid);
    setRecipes(p => p.filter(r => r.id !== rid));
    addToast("Recette supprimée.");
  }

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { addToast("Max 2 Mo.", "error"); return; }
    const reader = new FileReader();
    reader.onload = ev => setSettingsForm(p => ({ ...p, avatar: ev.target.result }));
    reader.readAsDataURL(file);
  }

  function handleSaveSettings(e) {
    e.preventDefault();
    try {
      updateProfile({
        fullName: settingsForm.fullName.trim(),
        bio: settingsForm.bio.trim(),
        avatar: settingsForm.avatar,
      });
      setProfileUser(p => ({
        ...p,
        fullName: settingsForm.fullName,
        bio: settingsForm.bio,
        avatar: settingsForm.avatar,
      }));
      addToast("Profil mis à jour !");
    } catch (err) { addToast(err.message, "error"); }
  }

  if (!profileUser) return null;

  const published = recipes.filter(r => r.status === "published");
  const drafts    = recipes.filter(r => r.status === "draft");

  return (
    <div style={{ backgroundColor: "#F8F9FA", minHeight: "100vh" }}>

      {/* ── Bannière dégradée ──────────────────────────────────── */}
      <div style={{
        height: 200,
        background: "linear-gradient(135deg, #fb923c 0%, #f97316 30%, #fbbf24 60%, #34d399 100%)"
      }} />

      {/* ── Card profil ────────────────────────────────────────── */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 1.5rem" }}>
        <div style={{
          backgroundColor: "white",
          borderRadius: "1rem",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          padding: "1.5rem 2rem",
          marginTop: -64,
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "1.5rem",
          flexWrap: "wrap",
        }}>
          {/* Avatar */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{
              width: 88, height: 88, borderRadius: "50%",
              border: "4px solid white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              overflow: "hidden", flexShrink: 0
            }}>
              <Avatar user={profileUser} size="xl" />
            </div>
            {isOwn && (
              <label style={{
                position: "absolute", bottom: 2, right: 2,
                width: 26, height: 26, backgroundColor: "#FF6B35",
                borderRadius: "50%", display: "flex",
                alignItems: "center", justifyContent: "center",
                cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
              }}>
                <span style={{ color: "white", fontSize: "0.75rem" }}>📷</span>
                <input type="file" accept="image/*"
                  onChange={handleAvatarChange} style={{ display: "none" }} />
              </label>
            )}
          </div>

          {/* Infos */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{
              fontSize: "1.5rem", fontWeight: 800, color: "#111827",
              marginBottom: "0.2rem"
            }}>
              {profileUser.fullName}
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#9ca3af", marginBottom: "0.5rem" }}>
              @{profileUser.username}
            </p>
            {profileUser.bio && (
              <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>{profileUser.bio}</p>
            )}

            {/* Stats */}
            <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.75rem" }}>
              {[
                { count: published.length, label: "Recettes" },
                { count: "1,2K", label: "Abonnés" },
                { count: 89, label: "Abonnements" },
              ].map(stat => (
                <div key={stat.label} style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#111827", lineHeight: 1 }}>
                    {stat.count}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.15rem" }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Boutons actions */}
          <div style={{ display: "flex", gap: "0.625rem", flexShrink: 0, alignItems: "center" }}>
            {isOwn ? (
              <button onClick={() => setActiveTab("settings")} style={{
                display: "inline-flex", alignItems: "center", gap: "0.375rem",
                border: "1px solid #e5e7eb", borderRadius: "9999px",
                padding: "0.5rem 1.125rem", fontSize: "0.875rem", fontWeight: 600,
                background: "white", cursor: "pointer", color: "#374151"
              }}>
                <Edit2 size={13} /> Modifier
              </button>
            ) : (
              <>
                <button style={{
                  display: "inline-flex", alignItems: "center", gap: "0.375rem",
                  border: "1px solid #e5e7eb", borderRadius: "9999px",
                  padding: "0.5rem 1.125rem", fontSize: "0.875rem", fontWeight: 600,
                  background: "white", cursor: "pointer", color: "#374151"
                }}>
                  <Edit2 size={13} /> Modifier
                </button>
                <button style={{
                  display: "inline-flex", alignItems: "center", gap: "0.375rem",
                  backgroundColor: "#FF6B35", color: "white",
                  border: "none", borderRadius: "9999px",
                  padding: "0.5rem 1.25rem", fontSize: "0.875rem", fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 3px 10px rgba(255,107,53,0.3)"
                }}>
                  <UserPlus size={13} /> Suivre
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Onglets ────────────────────────────────────────────── */}
        <div style={{
          display: "flex", gap: 0,
          borderBottom: "2px solid #e5e7eb",
          marginBottom: "1.5rem", backgroundColor: "transparent"
        }}>
          {(isOwn ? TABS : TABS.filter(t => t.id !== "settings")).map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: "0.75rem 1.25rem",
              fontSize: "0.9rem", fontWeight: activeTab === tab.id ? 700 : 500,
              background: "none", border: "none", cursor: "pointer",
              borderBottom: activeTab === tab.id ? "2px solid #FF6B35" : "2px solid transparent",
              marginBottom: -2,
              color: activeTab === tab.id ? "#FF6B35" : "#6b7280",
              transition: "color 0.15s",
              whiteSpace: "nowrap"
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Contenu onglets ─────────────────────────────────────── */}

        {/* Mes recettes */}
        {activeTab === "recipes" && (
          <div style={{ paddingBottom: "5rem", position: "relative" }}>
            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between", marginBottom: "1.25rem"
            }}>
              <span style={{ fontSize: "0.95rem", color: "#6b7280" }}>
                {published.length} recette{published.length !== 1 ? "s" : ""}
                {drafts.length > 0 && (
                  <span style={{ marginLeft: "0.5rem", color: "#9ca3af" }}>
                    · {drafts.length} brouillon{drafts.length !== 1 ? "s" : ""}
                  </span>
                )}
              </span>
            </div>

            {recipes.length === 0 ? (
              <EmptyState emoji="🍽️" title="Aucune recette pour l'instant"
                subtitle="Créez votre première recette !"
                cta={{ to: "/creer-recette", label: "Créer une recette" }} />
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "1.25rem"
              }}>
                {recipes.map(recipe => (
                  <div key={recipe.id} style={{ position: "relative" }}>
                    <RecipeCard recipe={recipe} onFavoriteChange={() => {}} />
                    {recipe.status === "draft" && (
                      <div style={{
                        position: "absolute", top: "0.75rem", left: "0.75rem",
                        backgroundColor: "#1f2937", color: "white",
                        fontSize: "0.7rem", fontWeight: 600,
                        padding: "0.2rem 0.625rem", borderRadius: "9999px",
                        pointerEvents: "none"
                      }}>Brouillon</div>
                    )}
                    {isOwn && (
                      <div style={{
                        position: "absolute", top: "0.75rem", left: "0.75rem",
                        display: "flex", gap: "0.375rem",
                        opacity: 0, transition: "opacity 0.15s"
                      }} className="card-edit-actions">
                        <Link to={`/modifier-recette/${recipe.id}`}
                          onClick={e => e.stopPropagation()}
                          style={{
                            width: 30, height: 30, backgroundColor: "white",
                            borderRadius: "50%", display: "flex",
                            alignItems: "center", justifyContent: "center",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.15)", textDecoration: "none"
                          }}>
                          <Edit2 size={12} color="#ea580c" />
                        </Link>
                        <button onClick={e => { e.stopPropagation(); handleDeleteRecipe(recipe.id); }} style={{
                          width: 30, height: 30, backgroundColor: "white",
                          borderRadius: "50%", border: "none", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
                        }}>
                          <Trash2 size={12} color="#ef4444" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Bouton + flottant */}
            {isOwn && (
              <Link to="/creer-recette" style={{
                position: "fixed", bottom: "2rem", right: "2rem",
                width: 52, height: 52, backgroundColor: "#FF6B35",
                borderRadius: "50%", display: "flex",
                alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 16px rgba(255,107,53,0.45)",
                textDecoration: "none", zIndex: 30
              }}>
                <Plus size={22} color="white" />
              </Link>
            )}
          </div>
        )}

        {/* Favoris */}
        {activeTab === "favorites" && (
          <div style={{ paddingBottom: "3rem" }}>
            <p style={{ fontSize: "0.95rem", color: "#6b7280", marginBottom: "1.25rem" }}>
              {favorites.length} recette{favorites.length !== 1 ? "s" : ""} favorite{favorites.length !== 1 ? "s" : ""}
            </p>
            {favorites.length === 0 ? (
              <EmptyState emoji="❤️" title="Aucune recette favorite"
                subtitle="Explorez et sauvegardez vos recettes préférées !"
                cta={{ to: "/recettes", label: "Explorer les recettes" }} />
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "1.25rem"
              }}>
                {favorites.map(recipe => (
                  <RecipeCard key={recipe.id} recipe={recipe}
                    onFavoriteChange={() => setFavorites(getFavoriteRecipes(currentUser.id))} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Abonnements */}
        {activeTab === "following" && (
          <div style={{ paddingBottom: "3rem" }}>
            <EmptyState emoji="👥" title="Aucun abonnement"
              subtitle="Suivez d'autres cuisiniers pour voir leurs recettes ici." />
          </div>
        )}

        {/* Paramètres */}
        {activeTab === "settings" && isOwn && (
          <form onSubmit={handleSaveSettings} style={{
            maxWidth: 520, paddingBottom: "3rem",
            display: "flex", flexDirection: "column", gap: "1.25rem"
          }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111827" }}>
              Modifier le profil
            </h2>

            {/* Avatar */}
            <div style={{
              backgroundColor: "white", borderRadius: "1rem",
              border: "1px solid #f3f4f6", padding: "1.25rem",
              display: "flex", alignItems: "center", gap: "1rem"
            }}>
              <Avatar user={{ ...profileUser, avatar: settingsForm.avatar }} size="lg" />
              <div>
                <label style={{ fontSize: "0.875rem", color: "#FF6B35", fontWeight: 600, cursor: "pointer", display: "block" }}>
                  Changer la photo
                  <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
                </label>
                {settingsForm.avatar && (
                  <button type="button"
                    onClick={() => setSettingsForm(p => ({ ...p, avatar: null }))}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: "0.8rem", marginTop: "0.25rem", display: "block" }}>
                    Supprimer
                  </button>
                )}
              </div>
            </div>

            {/* Champs */}
            <div style={{
              backgroundColor: "white", borderRadius: "1rem",
              border: "1px solid #f3f4f6", padding: "1.25rem",
              display: "flex", flexDirection: "column", gap: "1rem"
            }}>
              {[
                { label: "Nom complet", field: "fullName", type: "text" },
                { label: "Bio", field: "bio", type: "textarea" },
              ].map(({ label, field, type }) => (
                <div key={field}>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.375rem" }}>
                    {label}
                  </label>
                  {type === "textarea" ? (
                    <textarea value={settingsForm[field]}
                      onChange={e => setSettingsForm(p => ({ ...p, [field]: e.target.value }))}
                      rows={3}
                      style={{
                        width: "100%", padding: "0.625rem 1rem",
                        border: "1px solid #e5e7eb", borderRadius: "0.75rem",
                        fontSize: "0.875rem", fontFamily: "Inter, sans-serif",
                        outline: "none", resize: "none", color: "#1f2937",
                        boxSizing: "border-box"
                      }} />
                  ) : (
                    <input type={type} value={settingsForm[field]}
                      onChange={e => setSettingsForm(p => ({ ...p, [field]: e.target.value }))}
                      style={{
                        width: "100%", padding: "0.625rem 1rem",
                        border: "1px solid #e5e7eb", borderRadius: "0.75rem",
                        fontSize: "0.875rem", fontFamily: "Inter, sans-serif",
                        outline: "none", color: "#1f2937", boxSizing: "border-box"
                      }} />
                  )}
                </div>
              ))}
            </div>

            <button type="submit" style={{
              alignSelf: "flex-start",
              backgroundColor: "#FF6B35", color: "white",
              padding: "0.625rem 2rem", borderRadius: "9999px",
              fontSize: "0.875rem", fontWeight: 700, border: "none", cursor: "pointer",
              boxShadow: "0 4px 12px rgba(255,107,53,0.25)"
            }}>
              Sauvegarder les modifications
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function EmptyState({ emoji, title, subtitle, cta }) {
  return (
    <div style={{ textAlign: "center", padding: "4rem 0" }}>
      <div style={{ fontSize: "3.5rem", marginBottom: "0.75rem" }}>{emoji}</div>
      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#374151", marginBottom: "0.375rem" }}>
        {title}
      </h3>
      <p style={{ fontSize: "0.875rem", color: "#9ca3af", marginBottom: "1rem" }}>{subtitle}</p>
      {cta && (
        <Link to={cta.to} style={{
          display: "inline-block",
          backgroundColor: "#FF6B35", color: "white",
          padding: "0.625rem 1.5rem", borderRadius: "9999px",
          fontSize: "0.875rem", fontWeight: 600, textDecoration: "none"
        }}>
          {cta.label}
        </Link>
      )}
    </div>
  );
}

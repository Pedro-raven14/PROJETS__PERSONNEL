import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import { getRecipes, mapPrepTimeFilter } from "../../utils/api";
import RecipeCard from "../ui/RecipeCard";

const CATEGORIES = ["Petit-déjeuner", "Déjeuner", "Dîner", "Dessert", "Végétalien", "Sans gluten"];
const PREP_TIMES = ["Peu importe", "Moins de 15 min", "15 à 30 min", "30 à 60 min", "Plus de 60 min"];
const DIFFICULTIES = ["Facile", "Moyen", "Difficile"];
const DIETS = ["Végétarien", "Végétalien", "Sans gluten", "Sans lactose"];
const SORT_OPTIONS = [
  { value: "recent", label: "Plus récentes" },
  { value: "popular", label: "Plus populaires" },
  { value: "rating", label: "Mieux notées" },
  { value: "time", label: "Plus rapides" },
];
// La pagination est maintenant gérée côté backend
const PER_PAGE = 9;

export default function RecipesPage() {
  const [searchParams] = useSearchParams();
  const [recipes, setRecipes] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selCategory, setSelCategory] = useState("");
  const [prepTime, setPrepTime] = useState("Peu importe");
  const [difficulty, setDifficulty] = useState("");
  const [selDiet, setSelDiet] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
    setPage(1);
  }, [searchParams]);

  // Un seul useEffect qui charge les recettes à chaque changement de filtre ou de page
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const apiPrepTime = mapPrepTimeFilter(prepTime);
        const response = await getRecipes({
          query,
          category: selCategory,
          prepTime: apiPrepTime,
          difficulty,
          diet: selDiet,
          sortBy,
          page,
          limit: PER_PAGE,
          status: "published",
        });

        if (!cancelled) {
          setRecipes(response.data || []);
          setTotal(response.total || 0);
          setTotalPages(response.totalPages || 0);
        }
      } catch (err) {
        if (!cancelled) setRecipes([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    // Debounce : attend 300ms avant de lancer (utile pour la recherche texte)
    const timer = setTimeout(load, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, selCategory, prepTime, difficulty, selDiet, sortBy, page]);

  const hasFilters = query || selCategory || prepTime !== "Peu importe" || difficulty || selDiet;

  function clearFilters() {
    setQuery(""); setSelCategory(""); setPrepTime("Peu importe");
    setDifficulty(""); setSelDiet(""); setSortBy("recent");
    setPage(1);
  }

  // Quand un filtre change (pas page), on revient à la page 1
  // (géré inline dans chaque onChange via setPage(1))

  /* ── Sidebar filtres ── */
  function Sidebar({ onClose }) {
    return (
      <div style={{
        backgroundColor: "white", borderRadius: "1rem",
        border: "1px solid #e5e7eb", padding: "1.25rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#111827", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <SlidersHorizontal size={16} style={{ color: "#FF6B35" }} /> Filtres
          </span>
          {hasFilters && (
            <button onClick={clearFilters} style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#FF6B35", fontSize: "0.8rem", fontWeight: 600
            }}>Réinitialiser</button>
          )}
        </div>

        {/* Catégorie */}
        <FilterGroup title="Catégorie">
          {CATEGORIES.map(cat => (
            <RadioItem key={cat} label={cat} checked={selCategory === cat}
              onChange={() => { setSelCategory(selCategory === cat ? "" : cat); setPage(1); }} name="cat" />
          ))}
        </FilterGroup>

        {/* Temps */}
        <FilterGroup title="Temps de préparation">
          {PREP_TIMES.map(t => (
            <RadioItem key={t} label={t} checked={prepTime === t}
              onChange={() => { setPrepTime(t); setPage(1); }} name="time" />
          ))}
        </FilterGroup>

        {/* Difficulté */}
        <FilterGroup title="Difficulté">
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {DIFFICULTIES.map(d => (
              <button key={d} onClick={() => { setDifficulty(difficulty === d ? "" : d); setPage(1); }} style={{
                padding: "0.35rem 0.875rem", borderRadius: "9999px",
                fontSize: "0.8rem", fontWeight: 500, cursor: "pointer",
                border: difficulty === d ? "none" : "1px solid #e5e7eb",
                backgroundColor: difficulty === d ? "#FF6B35" : "#f9fafb",
                color: difficulty === d ? "white" : "#374151",
                transition: "all 0.15s"
              }}>{d}</button>
            ))}
          </div>
        </FilterGroup>

        {/* Régimes */}
        <FilterGroup title="Régimes">
          {DIETS.map(d => (
            <RadioItem key={d} label={d} checked={selDiet === d}
              onChange={() => { setSelDiet(selDiet === d ? "" : d); setPage(1); }} name="diet" />
          ))}
        </FilterGroup>

        {onClose && (
          <button onClick={onClose} style={{
            width: "100%", backgroundColor: "#FF6B35", color: "white",
            padding: "0.625rem", borderRadius: "9999px", border: "none",
            cursor: "pointer", fontWeight: 700, fontSize: "0.875rem",
            marginTop: "0.5rem"
          }}>
            Appliquer les filtres
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "2rem 1.5rem" }}>

      {/* En-tête */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.875rem", fontWeight: 800, color: "#111827", marginBottom: "0.25rem" }}>
          Toutes les recettes
        </h1>
        <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
          Trouvez la recette parfaite selon vos envies
        </p>
        {query && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.75rem" }}>
            <span style={{ fontSize: "0.875rem", color: "#374151" }}>Recherche :</span>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "0.375rem",
              backgroundColor: "#fff7ed", color: "#c2410c",
              padding: "0.25rem 0.75rem", borderRadius: "9999px",
              fontSize: "0.85rem", fontWeight: 500
            }}>
              "{query}"
              <button onClick={() => setQuery("")} style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#c2410c", padding: 0, lineHeight: 1
              }}>
                <X size={12} />
              </button>
            </span>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>

        {/* Sidebar desktop */}
        <aside style={{
          width: "220px", flexShrink: 0,
          display: "none"  /* caché par défaut, visible via media query */
        }} className="desktop-sidebar">
          <Sidebar />
        </aside>

        {/* Contenu */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Barre tri */}
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between", marginBottom: "1.25rem",
            flexWrap: "wrap", gap: "0.75rem"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              {/* Filtres mobile */}
              <button onClick={() => setDrawerOpen(true)} style={{
                display: "flex", alignItems: "center", gap: "0.375rem",
                border: "1px solid #e5e7eb", borderRadius: "9999px",
                padding: "0.4rem 0.875rem", fontSize: "0.85rem",
                background: "white", cursor: "pointer", color: "#374151"
              }} className="mobile-filter-btn">
                <SlidersHorizontal size={13} /> Filtres
              </button>
              <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                {loading ? "Chargement..." : `Affichage de ${total} recette${total !== 1 ? "s" : ""}`}
              </span>
            </div>
            <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }} style={{
              border: "1px solid #e5e7eb", borderRadius: "9999px",
              padding: "0.4rem 0.875rem", fontSize: "0.85rem",
              background: "white", cursor: "pointer", color: "#374151",
              fontFamily: "Inter, sans-serif", outline: "none"
            }}>
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Grille */}
          {loading ? (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "1.25rem"
            }}>
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} style={{ borderRadius: "1rem", overflow: "hidden", backgroundColor: "white" }}>
                  <div className="skeleton" style={{ height: 192 }} />
                  <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <div className="skeleton" style={{ height: 16, width: "70%" }} />
                    <div className="skeleton" style={{ height: 12, width: "100%" }} />
                    <div className="skeleton" style={{ height: 12, width: "50%" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : recipes.length > 0 ? (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "1.25rem"
            }}>
              {recipes.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe}
                  onFavoriteChange={() => setPage(p => p)}
                />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "5rem 0" }}>
              <div style={{ fontSize: "3.5rem", marginBottom: "0.75rem" }}>🔍</div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#374151", marginBottom: "0.5rem" }}>
                Aucune recette trouvée
              </h3>
              <p style={{ color: "#9ca3af", marginBottom: "1rem" }}>
                Essayez de modifier vos filtres ou votre recherche.
              </p>
              <button onClick={clearFilters} style={{
                backgroundColor: "#FF6B35", color: "white",
                padding: "0.625rem 1.25rem", borderRadius: "9999px",
                border: "none", cursor: "pointer", fontWeight: 600
              }}>Réinitialiser</button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "center", gap: "0.5rem",
              marginTop: "2.5rem", flexWrap: "wrap"
            }}>
              <PagBtn onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft size={15} /> Précédent
              </PagBtn>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} style={{
                  width: 36, height: 36, borderRadius: "50%",
                  border: page === p ? "none" : "1px solid #e5e7eb",
                  backgroundColor: page === p ? "#FF6B35" : "white",
                  color: page === p ? "white" : "#374151",
                  fontWeight: page === p ? 700 : 400,
                  cursor: "pointer", fontSize: "0.875rem"
                }}>{p}</button>
              ))}
              <PagBtn onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                Suivant <ChevronRight size={15} />
              </PagBtn>
            </div>
          )}
        </div>
      </div>

      {/* Drawer mobile filtres */}
      {drawerOpen && (
        <>
          <div onClick={() => setDrawerOpen(false)} style={{
            position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", zIndex: 40
          }} />
          <div className="animate-fade-in" style={{
            position: "fixed", left: 0, top: 0, bottom: 0,
            width: "17rem", backgroundColor: "white",
            zIndex: 50, overflowY: "auto", padding: "1.25rem",
            boxShadow: "4px 0 20px rgba(0,0,0,0.15)"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <span style={{ fontWeight: 700, fontSize: "1rem" }}>Filtres</span>
              <button onClick={() => setDrawerOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>
            <Sidebar onClose={() => setDrawerOpen(false)} />
          </div>
        </>
      )}
    </div>
  );
}

/* ── Helpers ── */
function FilterGroup({ title, children }) {
  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <h3 style={{
        fontSize: "0.7rem", fontWeight: 700, color: "#9ca3af",
        textTransform: "uppercase", letterSpacing: "0.07em",
        marginBottom: "0.625rem"
      }}>{title}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
        {children}
      </div>
    </div>
  );
}

function RadioItem({ label, checked, onChange, name }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
      <input type="radio" name={name} checked={checked} onChange={onChange}
        style={{ accentColor: "#FF6B35", width: 14, height: 14 }} />
      <span style={{ fontSize: "0.875rem", color: checked ? "#FF6B35" : "#374151", fontWeight: checked ? 500 : 400 }}>
        {label}
      </span>
    </label>
  );
}

function PagBtn({ children, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: "inline-flex", alignItems: "center", gap: "0.25rem",
      padding: "0.4rem 0.875rem", borderRadius: "9999px",
      border: "1px solid #e5e7eb", background: "white",
      color: disabled ? "#d1d5db" : "#374151",
      cursor: disabled ? "not-allowed" : "pointer",
      fontSize: "0.875rem"
    }}>{children}</button>
  );
}

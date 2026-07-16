import { useParams, Link } from "react-router-dom";
import { useBlog } from "../../context/BlogContext";
import ArticleCard from "../ui/ArticleCard";
import Sidebar from "../ui/Sidebar";

export default function CategoryDetail() {
  const { slug } = useParams();
  const { getCategoryBySlug, getArticlesByCategory } = useBlog();

  const category = getCategoryBySlug(slug);

  if (!category) {
    return (
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h1 className="text-2xl font-bold mb-3" style={{ color: "var(--color-text)" }}>
          Catégorie introuvable
        </h1>
        <Link to="/categories" style={{ color: "var(--color-accent)" }}>
          ← Retour aux catégories
        </Link>
      </main>
    );
  }

  const articles = getArticlesByCategory(category.id);

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Fil d'Ariane */}
      <nav className="text-sm mb-6 flex items-center gap-2" style={{ color: "var(--color-text-muted)" }}>
        <Link to="/" className="hover:text-[var(--color-accent)] transition-colors">
          Accueil
        </Link>
        <span>/</span>
        <Link to="/categories" className="hover:text-[var(--color-accent)] transition-colors">
          Catégories
        </Link>
        <span>/</span>
        <span style={{ color: "var(--color-text)" }}>{category.name}</span>
      </nav>

      {/* En-tête */}
      <div className="mb-10">
        <h1 className="text-4xl font-black mb-3" style={{ color: "var(--color-text)" }}>
          {category.name}
        </h1>
        <p className="text-base" style={{ color: "var(--color-text-muted)" }}>
          {category.description}
        </p>
      </div>

      {/* Grille + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10">
        <div>
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div
              className="rounded-xl p-12 text-center"
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              <p className="font-semibold mb-2" style={{ color: "var(--color-text)" }}>
                Aucun article dans cette catégorie
              </p>
              <Link to="/categories" style={{ color: "var(--color-accent)" }}>
                ← Voir toutes les catégories
              </Link>
            </div>
          )}
        </div>
        <Sidebar />
      </div>
    </main>
  );
}

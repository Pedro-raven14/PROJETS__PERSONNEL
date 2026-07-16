import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { useBlog } from "../../context/BlogContext";
import ArticleCard from "../ui/ArticleCard";
import Sidebar from "../ui/Sidebar";

export default function Accueil() {
  const { getPublishedArticles } = useBlog();
  const articles = getPublishedArticles();
  const featured = articles.slice(0, 3);
  const more = articles.slice(3);

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="hero-gradient text-white py-24 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Badge */}
          {featured[0] && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 text-sm font-medium mb-6 bg-white/5 backdrop-blur-sm">
              <Sparkles size={14} style={{ color: "var(--color-accent)" }} />
              <span>Nouveau : {featured[0].title}</span>
            </div>
          )}

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight mb-6 max-w-2xl">
            Bienvenue sur mon blog de développeur
          </h1>
          <p className="text-lg text-white/70 mb-8 max-w-xl leading-relaxed">
            Je partage mes connaissances, un article à la fois. Tutoriels,
            retours d'expérience et notes techniques d'un développeur junior.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--color-accent)" }}
            >
              Parcourir les articles <ArrowRight size={16} />
            </Link>
            <Link
              to="/a-propos"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white/10 hover:bg-white/20 transition-colors border border-white/20 backdrop-blur-sm"
            >
              À propos de moi
            </Link>
          </div>
        </div>
      </section>

      {/* ── Contenu principal ─────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10">
          {/* Articles */}
          <div>
            {/* Articles à la une */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2
                    className="text-2xl font-bold"
                    style={{ color: "var(--color-text)" }}
                  >
                    Articles à la une
                  </h2>
                  <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
                    Les derniers articles publiés sur le blog.
                  </p>
                </div>
                <Link
                  to="/categories"
                  className="hidden sm:inline-flex text-sm font-medium"
                  style={{ color: "var(--color-accent)" }}
                >
                  Toutes les catégories →
                </Link>
              </div>

              {featured.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {featured.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              ) : (
                <EmptyState />
              )}
            </section>

            {/* Plus d'articles */}
            {more.length > 0 && (
              <section>
                <h2
                  className="text-2xl font-bold mb-6"
                  style={{ color: "var(--color-text)" }}
                >
                  Plus d'articles
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {more.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <Sidebar />
        </div>
      </div>
    </main>
  );
}

function EmptyState() {
  return (
    <div
      className="rounded-xl p-12 text-center"
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      <p className="text-lg font-semibold mb-2" style={{ color: "var(--color-text)" }}>
        Aucun article pour l'instant
      </p>
      <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
        Connecte-toi en admin pour publier ton premier article.
      </p>
    </div>
  );
}

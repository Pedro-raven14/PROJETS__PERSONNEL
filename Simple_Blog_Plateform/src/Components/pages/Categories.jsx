import { Link } from "react-router-dom";
import { useBlog } from "../../context/BlogContext";

export default function Categories() {
  const { categories, getArticleCountByCategory } = useBlog();

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* En-tête */}
      <div className="mb-10">
        <h1
          className="text-4xl font-black mb-3"
          style={{ color: "var(--color-text)" }}
        >
          Catégories
        </h1>
        <p className="text-base" style={{ color: "var(--color-text-muted)" }}>
          Explore les articles par thématique. Chaque catégorie regroupe les
          tutoriels et réflexions autour d'un sujet précis.
        </p>
      </div>

      {/* Grille */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => {
          const count = getArticleCountByCategory(cat.id);
          return (
            <CategoryCard key={cat.id} category={cat} count={count} />
          );
        })}
      </div>
    </main>
  );
}

function CategoryCard({ category, count }) {
  return (
    <Link
      to={`/categories/${category.slug}`}
      className="card-hover relative rounded-xl overflow-hidden p-6 flex flex-col gap-3 group"
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      {/* Bulle décorative */}
      <div
        className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-10 group-hover:opacity-20 transition-opacity"
        style={{ backgroundColor: category.color || "var(--color-accent)" }}
      />
      <div
        className="absolute -bottom-8 -right-2 w-20 h-20 rounded-full opacity-5 group-hover:opacity-10 transition-opacity"
        style={{ backgroundColor: category.color || "var(--color-accent)" }}
      />

      {/* Contenu */}
      <div>
        <span
          className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3"
          style={{
            backgroundColor: "var(--color-bg)",
            color: "var(--color-text-muted)",
          }}
        >
          {count} article{count !== 1 ? "s" : ""}
        </span>
        <h2
          className="text-2xl font-black leading-tight"
          style={{ color: "var(--color-text)" }}
        >
          {category.name}
        </h2>
        <p
          className="text-sm mt-2 leading-relaxed"
          style={{ color: "var(--color-text-muted)" }}
        >
          {category.description}
        </p>
      </div>

      <span
        className="text-sm font-semibold mt-1"
        style={{ color: "var(--color-accent)" }}
      >
        Voir les articles →
      </span>
    </Link>
  );
}

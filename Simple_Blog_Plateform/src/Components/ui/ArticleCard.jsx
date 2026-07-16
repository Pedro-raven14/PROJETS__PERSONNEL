import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { useBlog } from "../../context/BlogContext";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ArticleCard({ article }) {
  const { getCategoryById } = useBlog();
  const category = getCategoryById(article.categoryId);

  return (
    <article
      className="card-hover rounded-xl overflow-hidden flex flex-col"
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      {/* Couverture colorée avec nom de catégorie */}
      <div
        className={`relative h-36 bg-gradient-to-br ${article.coverGradient || "from-gray-700 to-gray-500"} flex items-end p-4`}
      >
        {category && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm">
            {category.name}
          </span>
        )}
        <span
          className="absolute inset-0 flex items-center justify-center text-white/20 font-black text-5xl select-none"
        >
          {category?.name || ""}
        </span>
      </div>

      {/* Corps */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <h3
          className="font-bold text-base leading-snug line-clamp-2"
          style={{ color: "var(--color-text)" }}
        >
          {article.title}
        </h3>
        <p
          className="text-sm leading-relaxed line-clamp-2 flex-1"
          style={{ color: "var(--color-text-muted)" }}
        >
          {article.excerpt}
        </p>

        {/* Méta */}
        <div
          className="flex items-center gap-3 text-xs"
          style={{ color: "var(--color-text-muted)" }}
        >
          <div className="flex items-center gap-1">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              {article.authorInitials}
            </div>
            <span>{article.author}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>{formatDate(article.date)}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{article.readTime} min</span>
          </div>
        </div>

        {/* CTA */}
        <Link
          to={`/article/${article.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg text-white w-fit transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--color-accent)" }}
        >
          Lire l'article <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}

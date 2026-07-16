import { useParams, Link } from "react-router-dom";
import { Calendar, Clock, Share2, ExternalLink } from "lucide-react";
import { useBlog } from "../../context/BlogContext";
import CommentSection from "../ui/CommentSection";
import ArticleCard from "../ui/ArticleCard";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Convertit le Markdown simplifié en JSX
function renderContent(content) {
  const lines = content.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Bloc de code
    if (line.startsWith("```")) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <pre key={i}>
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      i++;
      continue;
    }

    // Titres
    if (line.startsWith("## ")) {
      elements.push(<h2 key={i}>{line.slice(3)}</h2>);
      i++;
      continue;
    }
    if (line.startsWith("### ")) {
      elements.push(<h3 key={i}>{line.slice(4)}</h3>);
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      elements.push(<blockquote key={i}>{renderInline(line.slice(2))}</blockquote>);
      i++;
      continue;
    }

    // Ligne vide
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraphe normal
    elements.push(<p key={i}>{renderInline(line)}</p>);
    i++;
  }

  return elements;
}

// Gère le formatage inline : **gras**, `code`, etc.
function renderInline(text) {
  const parts = [];
  let remaining = text;
  let idx = 0;

  while (remaining.length > 0) {
    // Code inline
    const codeMatch = remaining.match(/^(.*?)`([^`]+)`(.*)/s);
    // Gras
    const boldMatch = remaining.match(/^(.*?)\*\*([^*]+)\*\*(.*)/s);

    if (codeMatch && (!boldMatch || codeMatch[1].length <= boldMatch[1].length)) {
      if (codeMatch[1]) parts.push(<span key={idx++}>{codeMatch[1]}</span>);
      parts.push(<code key={idx++}>{codeMatch[2]}</code>);
      remaining = codeMatch[3];
    } else if (boldMatch) {
      if (boldMatch[1]) parts.push(<span key={idx++}>{boldMatch[1]}</span>);
      parts.push(<strong key={idx++}>{boldMatch[2]}</strong>);
      remaining = boldMatch[3];
    } else {
      parts.push(<span key={idx++}>{remaining}</span>);
      break;
    }
  }

  return parts;
}

export default function ArticleDetail() {
  const { slug } = useParams();
  const { getArticleBySlug, getCategoryById, getPublishedArticles } = useBlog();

  const article = getArticleBySlug(slug);

  if (!article || article.status !== "published") {
    return (
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h1 className="text-2xl font-bold mb-3" style={{ color: "var(--color-text)" }}>
          Article introuvable
        </h1>
        <Link to="/" style={{ color: "var(--color-accent)" }}>
          ← Retour à l'accueil
        </Link>
      </main>
    );
  }

  const category = getCategoryById(article.categoryId);
  const allPublished = getPublishedArticles();
  const related = allPublished
    .filter((a) => a.id !== article.id && a.categoryId === article.categoryId)
    .slice(0, 3);

  const shareUrl = encodeURIComponent(window.location.href);
  const shareTitle = encodeURIComponent(article.title);

  return (
    <main>
      {/* ── En-tête article ───────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 pb-0">
        {/* Fil d'Ariane */}
        <nav
          className="text-sm mb-6 flex items-center gap-2 flex-wrap"
          style={{ color: "var(--color-text-muted)" }}
        >
          <Link to="/" className="hover:text-[var(--color-accent)] transition-colors">
            Accueil
          </Link>
          {category && (
            <>
              <span>/</span>
              <Link
                to={`/categories/${category.slug}`}
                className="hover:text-[var(--color-accent)] transition-colors"
              >
                {category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span
            className="truncate max-w-[200px]"
            style={{ color: "var(--color-text)" }}
          >
            {article.title}
          </span>
        </nav>

        {/* Badge catégorie */}
        {category && (
          <Link
            to={`/categories/${category.slug}`}
            className="inline-block text-sm font-semibold px-3 py-1 rounded-full mb-4"
            style={{
              backgroundColor: "var(--color-bg)",
              color: "var(--color-text)",
              border: "1px solid var(--color-border)",
            }}
          >
            {category.name}
          </Link>
        )}

        {/* Titre */}
        <h1
          className="text-3xl sm:text-4xl font-black leading-tight mb-4"
          style={{ color: "var(--color-text)" }}
        >
          {article.title}
        </h1>

        {/* Résumé */}
        <p
          className="text-lg leading-relaxed mb-6"
          style={{ color: "var(--color-text-muted)" }}
        >
          {article.excerpt}
        </p>

        {/* Méta */}
        <div
          className="flex items-center gap-3 text-sm pb-8 flex-wrap"
          style={{ color: "var(--color-text-muted)" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              {article.authorInitials}
            </div>
            <span className="font-medium" style={{ color: "var(--color-text)" }}>
              {article.author}
            </span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{formatDate(article.date)}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{article.readTime} min de lecture</span>
          </div>
        </div>
      </div>

      {/* Image de couverture */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 mb-10">
        <div
          className={`w-full h-56 sm:h-72 rounded-2xl bg-gradient-to-br ${
            article.coverGradient || "from-gray-700 to-gray-500"
          } flex items-center justify-center`}
        >
          <span className="text-white/20 font-black text-6xl select-none">
            {category?.name || ""}
          </span>
        </div>
      </div>

      {/* ── Corps de l'article ────────────────────────────────────────────────── */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 mb-10">
        <div className="article-content">
          {renderContent(article.content)}
        </div>
      </article>

      {/* Séparateur + partage */}
      <div
        className="max-w-3xl mx-auto px-4 sm:px-6 pb-10"
        style={{ borderTop: "1px solid var(--color-border)" }}
      >
        <div className="flex items-center gap-4 pt-6">
          <span className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
            <Share2 size={14} className="inline mr-1" />
            Partager :
          </span>
          <a
            href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-[var(--color-bg)] transition-colors text-xs font-bold"
            style={{ color: "var(--color-text-muted)" }}
            aria-label="Partager sur X (Twitter)"
          >
            X
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-[var(--color-bg)] transition-colors"
            style={{ color: "var(--color-text-muted)" }}
            aria-label="Partager sur LinkedIn"
          >
            <ExternalLink size={16} />
          </a>
        </div>
      </div>

      {/* ── Commentaires ─────────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
        <CommentSection articleId={article.id} />
      </div>

      {/* ── Articles liés ─────────────────────────────────────────────────────── */}
      {related.length > 0 && (
        <section
          className="border-t py-12"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2
              className="text-2xl font-bold mb-6"
              style={{ color: "var(--color-text)" }}
            >
              Articles liés
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {related.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

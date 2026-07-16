import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight } from "lucide-react";
import { useBlog } from "../../context/BlogContext";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Sidebar() {
  const { categories, getPublishedArticles, getArticleCountByCategory } = useBlog();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const recentArticles = getPublishedArticles().slice(0, 4);

  function handleSubscribe(e) {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  }

  return (
    <aside className="flex flex-col gap-6">
      {/* Catégories */}
      <div
        className="rounded-xl p-5"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base" style={{ color: "var(--color-text)" }}>
            Catégories
          </h3>
          <Link
            to="/categories"
            className="text-xs font-medium"
            style={{ color: "var(--color-accent)" }}
          >
            Toutes →
          </Link>
        </div>
        <ul className="flex flex-col gap-1">
          {categories.map((cat) => {
            const count = getArticleCountByCategory(cat.id);
            return (
              <li key={cat.id}>
                <Link
                  to={`/categories/${cat.slug}`}
                  className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-[var(--color-bg)] transition-colors"
                >
                  <span className="text-sm" style={{ color: "var(--color-text)" }}>
                    {cat.name}
                  </span>
                  <span
                    className="text-xs w-6 h-6 flex items-center justify-center rounded-full font-semibold"
                    style={{
                      backgroundColor: "var(--color-bg)",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {count}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Articles récents */}
      <div
        className="rounded-xl p-5"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <h3 className="font-bold text-base mb-4" style={{ color: "var(--color-text)" }}>
          Articles récents
        </h3>
        <ul className="flex flex-col gap-3">
          {recentArticles.map((article) => (
            <li key={article.id}>
              <Link
                to={`/article/${article.slug}`}
                className="block hover:text-[var(--color-accent)] transition-colors"
              >
                <p className="text-sm font-medium leading-snug" style={{ color: "var(--color-text)" }}>
                  {article.title}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                  {formatDate(article.date)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Newsletter */}
      <div
        className="rounded-xl p-5"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
          style={{ backgroundColor: "var(--color-accent)" }}
        >
          <Mail size={18} className="text-white" />
        </div>
        <h3 className="font-bold text-base text-white mb-1">Newsletter</h3>
        <p className="text-sm text-white/70 mb-4">
          Un email par mois, aucun spam. Les articles marquants du mois.
        </p>

        {subscribed ? (
          <p className="text-sm font-semibold" style={{ color: "var(--color-accent)" }}>
            ✓ Merci ! Tu es abonné(e).
          </p>
        ) : (
          <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ton@email.com"
              required
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{
                backgroundColor: "rgba(255,255,255,0.1)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            />
            <button
              type="submit"
              className="w-full py-2 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--color-accent)" }}
            >
              S'abonner <ArrowRight size={14} />
            </button>
          </form>
        )}
      </div>
    </aside>
  );
}

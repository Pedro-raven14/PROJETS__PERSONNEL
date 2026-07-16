import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard, FileText, Tag, MessageSquare,
  LogOut, Plus, Pencil, Trash2, Eye, EyeOff,
} from "lucide-react";
import { useBlog } from "../../../context/BlogContext";
import ArticleForm from "./ArticleForm";

const TABS = [
  { id: "dashboard", label: "Tableau de bord", icon: <LayoutDashboard size={16} /> },
  { id: "articles", label: "Articles", icon: <FileText size={16} /> },
  { id: "categories", label: "Catégories", icon: <Tag size={16} /> },
  { id: "comments", label: "Commentaires", icon: <MessageSquare size={16} /> },
];

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminDashboard() {
  const { isAdmin, logout, articles, comments, categories, deleteArticle, deleteComment, updateArticle } = useBlog();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [editingArticle, setEditingArticle] = useState(null); // null | "new" | article
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  if (!isAdmin) {
    navigate("/connexion");
    return null;
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  function handleDeleteArticle(id) {
    if (deleteConfirm === id) {
      deleteArticle(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  }

  function handleToggleStatus(article) {
    updateArticle(article.id, {
      status: article.status === "published" ? "draft" : "published",
    });
  }

  const publishedCount = articles.filter((a) => a.status === "published").length;
  const draftCount = articles.filter((a) => a.status === "draft").length;

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      {/* ── Sidebar admin ─────────────────────────────────────────────────────── */}
      <aside
        className="w-56 shrink-0 min-h-screen flex flex-col sticky top-0 h-screen overflow-y-auto"
        style={{
          backgroundColor: "var(--color-primary)",
        }}
      >
        {/* Logo */}
        <div className="p-5 flex items-center gap-2 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white font-bold text-sm">
            M
          </div>
          <span className="font-bold text-white text-sm">MyBlog Admin</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 flex flex-col gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setEditingArticle(null); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors ${
                activeTab === tab.id
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:bg-white/8 hover:text-white"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Footer sidebar */}
        <div className="p-3 border-t border-white/10 flex flex-col gap-2">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/60 hover:text-white hover:bg-white/8 transition-colors"
          >
            <Eye size={14} />
            Voir le blog →
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/60 hover:text-white hover:bg-white/8 transition-colors"
          >
            <LogOut size={14} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Contenu principal ─────────────────────────────────────────────────── */}
      <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
        {editingArticle !== null ? (
          <ArticleForm
            article={editingArticle === "new" ? null : editingArticle}
            onClose={() => setEditingArticle(null)}
          />
        ) : (
          <>
            {/* Tableau de bord */}
            {activeTab === "dashboard" && (
              <DashboardTab
                articles={articles}
                publishedCount={publishedCount}
                draftCount={draftCount}
                commentsCount={comments.length}
                onEdit={setEditingArticle}
                onDelete={handleDeleteArticle}
                onToggleStatus={handleToggleStatus}
                deleteConfirm={deleteConfirm}
                formatDate={formatDate}
                getCategoryName={(id) => categories.find((c) => c.id === id)?.name || "—"}
              />
            )}

            {/* Articles */}
            {activeTab === "articles" && (
              <ArticlesTab
                articles={articles}
                onEdit={setEditingArticle}
                onDelete={handleDeleteArticle}
                onToggleStatus={handleToggleStatus}
                deleteConfirm={deleteConfirm}
                formatDate={formatDate}
                getCategoryName={(id) => categories.find((c) => c.id === id)?.name || "—"}
              />
            )}

            {/* Catégories */}
            {activeTab === "categories" && (
              <CategoriesTab categories={categories} articles={articles} />
            )}

            {/* Commentaires */}
            {activeTab === "comments" && (
              <CommentsTab
                comments={comments}
                articles={articles}
                onDelete={deleteComment}
              />
            )}
          </>
        )}
      </main>

      {/* FAB Nouvel article */}
      {activeTab === "articles" && editingArticle === null && (
        <button
          onClick={() => setEditingArticle("new")}
          className="fixed bottom-8 right-8 flex items-center gap-2 px-5 py-3 rounded-full text-white font-semibold shadow-lg transition-opacity hover:opacity-90 z-10"
          style={{ backgroundColor: "var(--color-accent)" }}
        >
          <Plus size={18} />
          Nouvel article
        </button>
      )}
    </div>
  );
}

/* ── Onglet Tableau de bord ─────────────────────────────────────────────────── */
function DashboardTab({ articles, publishedCount, draftCount, commentsCount, onEdit, onDelete, onToggleStatus, deleteConfirm, formatDate, getCategoryName }) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>
          Tableau de bord
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
          Gérer les articles du blog
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="ARTICLES TOTAUX" value={articles.length} badge="Articles totaux" color="var(--color-text)" />
        <StatCard label="PUBLIÉS" value={publishedCount} badge="Publiés" color="var(--color-accent)" />
        <StatCard label="BROUILLONS" value={draftCount} badge="Brouillons" color="var(--color-text-muted)" />
      </div>

      {/* Table */}
      <ArticlesTable
        articles={articles}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleStatus={onToggleStatus}
        deleteConfirm={deleteConfirm}
        formatDate={formatDate}
        getCategoryName={getCategoryName}
      />
    </div>
  );
}

/* ── Onglet Articles ────────────────────────────────────────────────────────── */
function ArticlesTab({ articles, onEdit, onDelete, onToggleStatus, deleteConfirm, formatDate, getCategoryName }) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--color-text)" }}>
        Articles
      </h1>
      <ArticlesTable
        articles={articles}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleStatus={onToggleStatus}
        deleteConfirm={deleteConfirm}
        formatDate={formatDate}
        getCategoryName={getCategoryName}
      />
    </div>
  );
}

/* ── Table partagée ─────────────────────────────────────────────────────────── */
function ArticlesTable({ articles, onEdit, onDelete, onToggleStatus, deleteConfirm, formatDate, getCategoryName }) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div className="p-5 border-b" style={{ borderColor: "var(--color-border)" }}>
        <h2 className="font-bold" style={{ color: "var(--color-text)" }}>
          Tous les articles
        </h2>
        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
          {articles.length} enregistrement{articles.length !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr
              className="text-xs uppercase tracking-wide"
              style={{
                backgroundColor: "var(--color-bg)",
                color: "var(--color-text-muted)",
              }}
            >
              <th className="text-left px-5 py-3 font-semibold">Titre</th>
              <th className="text-left px-5 py-3 font-semibold">Statut</th>
              <th className="text-left px-5 py-3 font-semibold">Catégorie</th>
              <th className="text-left px-5 py-3 font-semibold">Date</th>
              <th className="text-right px-5 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((article) => (
                <tr
                  key={article.id}
                  className="border-t hover:bg-[var(--color-bg)] transition-colors"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <td className="px-5 py-3.5">
                    <Link
                      to={`/article/${article.slug}`}
                      className="font-medium hover:text-[var(--color-accent)] transition-colors"
                      style={{ color: "var(--color-text)" }}
                    >
                      {article.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => onToggleStatus(article)}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full transition-opacity hover:opacity-70"
                      style={
                        article.status === "published"
                          ? { backgroundColor: "rgba(46,204,113,0.15)", color: "var(--color-accent)" }
                          : { backgroundColor: "var(--color-bg)", color: "var(--color-text-muted)" }
                      }
                    >
                      {article.status === "published" ? (
                        <><Eye size={10} /> Publié</>
                      ) : (
                        <><EyeOff size={10} /> Brouillon</>
                      )}
                    </button>
                  </td>
                  <td className="px-5 py-3.5" style={{ color: "var(--color-text-muted)" }}>
                    {getCategoryName(article.categoryId)}
                  </td>
                  <td className="px-5 py-3.5" style={{ color: "var(--color-text-muted)" }}>
                    {formatDate(article.date)}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEdit(article)}
                        className="p-1.5 rounded-lg hover:bg-[var(--color-bg)] transition-colors"
                        style={{ color: "var(--color-text-muted)" }}
                        aria-label="Modifier"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => onDelete(article.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          deleteConfirm === article.id
                            ? "bg-red-100 text-red-600"
                            : "hover:bg-[var(--color-bg)] text-red-400"
                        }`}
                        aria-label={deleteConfirm === article.id ? "Confirmer la suppression" : "Supprimer"}
                        title={deleteConfirm === article.id ? "Cliquer à nouveau pour confirmer" : "Supprimer"}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Onglet Catégories ──────────────────────────────────────────────────────── */
function CategoriesTab({ categories, articles }) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--color-text)" }}>
        Catégories
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const count = articles.filter(
            (a) => a.status === "published" && a.categoryId === cat.id
          ).length;
          return (
            <div
              key={cat.id}
              className="rounded-xl p-5 flex items-start gap-3"
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div
                className="w-3 h-3 rounded-full mt-1.5 shrink-0"
                style={{ backgroundColor: cat.color || "var(--color-accent)" }}
              />
              <div>
                <p className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>
                  {cat.name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                  {count} article{count !== 1 ? "s" : ""}
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                  {cat.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Onglet Commentaires ────────────────────────────────────────────────────── */
function CommentsTab({ comments, articles, onDelete }) {
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  function handleDelete(id) {
    if (deleteConfirm === id) {
      onDelete(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--color-text)" }}>
        Commentaires ({comments.length})
      </h1>
      {comments.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Aucun commentaire.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {comments.map((comment) => {
            const article = articles.find((a) => a.id === comment.articleId);
            return (
              <div
                key={comment.id}
                className="rounded-xl p-4 flex gap-4 items-start"
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  {comment.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div>
                      <span className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>
                        {comment.name}
                      </span>
                      {article && (
                        <span className="text-xs ml-2" style={{ color: "var(--color-text-muted)" }}>
                          sur{" "}
                          <Link
                            to={`/article/${article.slug}`}
                            className="hover:text-[var(--color-accent)] transition-colors"
                          >
                            {article.title}
                          </Link>
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        deleteConfirm === comment.id
                          ? "bg-red-100 text-red-600"
                          : "text-red-400 hover:bg-[var(--color-bg)]"
                      }`}
                      title={deleteConfirm === comment.id ? "Confirmer" : "Supprimer"}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="text-sm" style={{ color: "var(--color-text)" }}>
                    {comment.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Stat Card ──────────────────────────────────────────────────────────────── */
function StatCard({ label, value, badge, color }) {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      <p className="text-xs uppercase tracking-wide mb-2" style={{ color: "var(--color-text-muted)" }}>
        {label}
      </p>
      <p className="text-4xl font-black mb-3" style={{ color }}>
        {value}
      </p>
      <span
        className="text-xs font-semibold px-2.5 py-1 rounded-full"
        style={{ backgroundColor: "var(--color-bg)", color }}
      >
        {badge}
      </span>
    </div>
  );
}

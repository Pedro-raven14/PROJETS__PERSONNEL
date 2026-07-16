import { useState } from "react";
import { MessageSquare, Trash2 } from "lucide-react";
import { useBlog } from "../../context/BlogContext";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function CommentSection({ articleId }) {
  const { getCommentsByArticle, addComment, deleteComment, isAdmin } = useBlog();
  const comments = getCommentsByArticle(articleId);

  const [form, setForm] = useState({ name: "", email: "", content: "" });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Le nom est requis.";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Email invalide.";
    if (!form.content.trim() || form.content.trim().length < 5)
      errs.content = "Le commentaire est trop court.";
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    addComment({ ...form, articleId });
    setForm({ name: "", email: "", content: "" });
    setErrors({});
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  }

  return (
    <div>
      <h2
        className="text-xl font-bold mb-6 flex items-center gap-2"
        style={{ color: "var(--color-text)" }}
      >
        <MessageSquare size={20} />
        Commentaires ({comments.length})
      </h2>

      {/* Formulaire */}
      <div
        className="rounded-xl p-6 mb-8"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        {submitted && (
          <div
            className="mb-4 px-4 py-3 rounded-lg text-sm font-medium"
            style={{
              backgroundColor: "rgba(46,204,113,0.1)",
              color: "var(--color-accent)",
              border: "1px solid var(--color-accent)",
            }}
          >
            ✓ Commentaire publié avec succès !
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Field
              label="Nom"
              id="name"
              placeholder="Ton prénom"
              value={form.name}
              onChange={(v) => setForm((f) => ({ ...f, name: v }))}
              error={errors.name}
            />
            <Field
              label="Email"
              id="email"
              type="email"
              placeholder="ton@email.com"
              value={form.email}
              onChange={(v) => setForm((f) => ({ ...f, email: v }))}
              error={errors.email}
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="content"
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--color-text)" }}
            >
              Commentaire
            </label>
            <textarea
              id="content"
              rows={4}
              placeholder="Ton retour, ta question, tes remarques..."
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none transition-colors"
              style={{
                backgroundColor: "var(--color-bg)",
                border: `1px solid ${errors.content ? "#ef4444" : "var(--color-border)"}`,
                color: "var(--color-text)",
              }}
            />
            {errors.content && (
              <p className="text-xs text-red-500 mt-1">{errors.content}</p>
            )}
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--color-accent)" }}
          >
            Publier le commentaire
          </button>
        </form>
      </div>

      {/* Liste des commentaires */}
      {comments.length > 0 ? (
        <div className="flex flex-col gap-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-xl p-5 flex gap-4"
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              {/* Avatar */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                {comment.initials}
              </div>

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="font-semibold text-sm"
                      style={{ color: "var(--color-text)" }}
                    >
                      {comment.name}
                    </span>
                    <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                      {formatDate(comment.date)}
                    </span>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => deleteComment(comment.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                      aria-label="Supprimer le commentaire"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text)" }}>
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-center py-6" style={{ color: "var(--color-text-muted)" }}>
          Aucun commentaire pour l'instant. Sois le premier !
        </p>
      )}
    </div>
  );
}

function Field({ label, id, type = "text", placeholder, value, onChange, error }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium mb-1.5"
        style={{ color: "var(--color-text)" }}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors"
        style={{
          backgroundColor: "var(--color-bg)",
          border: `1px solid ${error ? "#ef4444" : "var(--color-border)"}`,
          color: "var(--color-text)",
        }}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

import { useState } from "react";
import { X, Save } from "lucide-react";
import { useBlog } from "../../../context/BlogContext";

const GRADIENTS = [
  { label: "Teal", value: "from-teal-700 to-emerald-500" },
  { label: "Bleu", value: "from-blue-700 to-indigo-500" },
  { label: "Rouge", value: "from-red-600 to-orange-500" },
  { label: "Violet", value: "from-purple-700 to-purple-500" },
  { label: "Vert", value: "from-green-700 to-teal-500" },
  { label: "Gris", value: "from-gray-600 to-gray-400" },
];

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function ArticleForm({ article, onClose }) {
  const { addArticle, updateArticle, categories } = useBlog();
  const isEditing = Boolean(article);

  const [form, setForm] = useState({
    title: article?.title || "",
    slug: article?.slug || "",
    excerpt: article?.excerpt || "",
    content: article?.content || "",
    categoryId: article?.categoryId || categories[0]?.id || "",
    author: article?.author || "Alex Dupont",
    date: article?.date || new Date().toISOString().split("T")[0],
    readTime: article?.readTime || 5,
    status: article?.status || "draft",
    coverGradient: article?.coverGradient || GRADIENTS[0].value,
  });
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  function handleTitleChange(value) {
    setForm((f) => ({
      ...f,
      title: value,
      slug: isEditing ? f.slug : slugify(value),
    }));
  }

  function validate() {
    const errs = {};
    if (!form.title.trim()) errs.title = "Le titre est requis.";
    if (!form.slug.trim()) errs.slug = "Le slug est requis.";
    if (!form.excerpt.trim()) errs.excerpt = "L'extrait est requis.";
    if (!form.content.trim()) errs.content = "Le contenu est requis.";
    if (!form.categoryId) errs.categoryId = "La catégorie est requise.";
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    if (isEditing) {
      updateArticle(article.id, form);
    } else {
      addArticle(form);
    }
    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 800);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>
            {isEditing ? "Modifier l'article" : "Nouvel article"}
          </h1>
          {saved && (
            <p className="text-sm mt-1" style={{ color: "var(--color-accent)" }}>
              ✓ Sauvegardé !
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-[var(--color-bg)] transition-colors"
          style={{ color: "var(--color-text-muted)" }}
          aria-label="Fermer"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 max-w-3xl">
        {/* Titre */}
        <FormField
          label="Titre"
          id="title"
          error={errors.title}
        >
          <input
            id="title"
            type="text"
            placeholder="Titre de l'article"
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
            style={inputStyle(errors.title)}
          />
        </FormField>

        {/* Slug */}
        <FormField label="Slug (URL)" id="slug" error={errors.slug}>
          <input
            id="slug"
            type="text"
            placeholder="mon-article"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none font-mono"
            style={inputStyle(errors.slug)}
          />
        </FormField>

        {/* Extrait */}
        <FormField label="Extrait" id="excerpt" error={errors.excerpt}>
          <textarea
            id="excerpt"
            rows={3}
            placeholder="Un résumé court de l'article (2-3 lignes)..."
            value={form.excerpt}
            onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
            style={inputStyle(errors.excerpt)}
          />
        </FormField>

        {/* Contenu */}
        <FormField
          label="Contenu (Markdown simplifié)"
          id="content"
          error={errors.content}
          hint="Utilisez ## pour les titres, > pour les citations, ``` pour le code"
        >
          <textarea
            id="content"
            rows={14}
            placeholder="Rédigez votre article ici...&#10;&#10;## Section&#10;&#10;Contenu..."
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-y font-mono"
            style={inputStyle(errors.content)}
          />
        </FormField>

        {/* Ligne : catégorie + auteur + temps de lecture */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField label="Catégorie" id="category" error={errors.categoryId}>
            <select
              id="category"
              value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={inputStyle(errors.categoryId)}
            >
              <option value="">Choisir...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Auteur" id="author">
            <input
              id="author"
              type="text"
              value={form.author}
              onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={inputStyle()}
            />
          </FormField>

          <FormField label="Temps de lecture (min)" id="readTime">
            <input
              id="readTime"
              type="number"
              min={1}
              max={60}
              value={form.readTime}
              onChange={(e) => setForm((f) => ({ ...f, readTime: parseInt(e.target.value) || 1 }))}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={inputStyle()}
            />
          </FormField>
        </div>

        {/* Ligne : date + couleur de couverture */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Date de publication" id="date">
            <input
              id="date"
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={inputStyle()}
            />
          </FormField>

          <FormField label="Couleur de couverture" id="gradient">
            <select
              id="gradient"
              value={form.coverGradient}
              onChange={(e) => setForm((f) => ({ ...f, coverGradient: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={inputStyle()}
            >
              {GRADIENTS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        {/* Statut */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
            Statut :
          </label>
          <button
            type="button"
            onClick={() =>
              setForm((f) => ({
                ...f,
                status: f.status === "published" ? "draft" : "published",
              }))
            }
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors"
            style={
              form.status === "published"
                ? {
                    backgroundColor: "rgba(46,204,113,0.1)",
                    color: "var(--color-accent)",
                    borderColor: "var(--color-accent)",
                  }
                : {
                    backgroundColor: "var(--color-bg)",
                    color: "var(--color-text-muted)",
                    borderColor: "var(--color-border)",
                  }
            }
          >
            {form.status === "published" ? "✓ Publié" : "○ Brouillon"}
          </button>
        </div>

        {/* Boutons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--color-accent)" }}
          >
            <Save size={16} />
            {isEditing ? "Enregistrer" : "Créer l'article"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold border transition-colors"
            style={{
              color: "var(--color-text)",
              borderColor: "var(--color-border)",
              backgroundColor: "var(--color-surface)",
            }}
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}

function inputStyle(error) {
  return {
    backgroundColor: "var(--color-bg)",
    border: `1px solid ${error ? "#ef4444" : "var(--color-border)"}`,
    color: "var(--color-text)",
  };
}

function FormField({ label, id, error, hint, children }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium mb-1.5"
        style={{ color: "var(--color-text)" }}
      >
        {label}
      </label>
      {children}
      {hint && (
        <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
          {hint}
        </p>
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

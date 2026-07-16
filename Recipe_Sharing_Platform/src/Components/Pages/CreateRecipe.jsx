import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2, Upload, X, GripVertical } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { createRecipe, updateRecipe, getRecipeById } from "../../utils/localStorage";
import { useToast } from "../ui/Toast";

const CATEGORIES = ["Petit-déjeuner", "Déjeuner", "Dîner", "Dessert", "Collation"];
const UNITS = ["g", "kg", "ml", "L", "tasse", "c.à.s", "c.à.c", "unité", "tranche", "pincée", "poignée", "bouquet", "filet", "rouleau", "portion"];
const DIFFICULTIES = ["Facile", "Moyen", "Difficile"];
const emptyIng = () => ({ quantity: "", unit: "g", name: "" });
const emptyStep = () => ({ text: "" });

// Styles réutilisables
const sectionCard = {
  backgroundColor: "white",
  borderRadius: "1rem",
  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  border: "1px solid #f3f4f6",
  padding: "1.5rem",
  display: "flex",
  flexDirection: "column",
  gap: "1.25rem",
};

function inp(hasError, extra = {}) {
  return {
    width: "100%", padding: "0.625rem 1rem",
    border: `1px solid ${hasError ? "#f87171" : "#e5e7eb"}`,
    borderRadius: "0.75rem", fontSize: "0.875rem",
    fontFamily: "Inter, sans-serif", outline: "none",
    color: "#1f2937", backgroundColor: "white",
    boxSizing: "border-box", ...extra,
  };
}

export default function CreateRecipe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: "", category: "", description: "",
    prepTime: "", cookTime: "", servings: "",
    difficulty: "Facile",
    ingredients: [emptyIng()],
    instructions: [emptyStep()],
    imageBase64: null, tags: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (!currentUser) { navigate("/connexion"); return; }
    if (isEdit) {
      const r = getRecipeById(id);
      if (!r) { navigate("/recettes"); return; }
      if (r.authorId !== currentUser.id) {
        addToast("Non autorisé.", "error");
        navigate("/recettes"); return;
      }
      setForm({
        title: r.title || "", category: r.category || "",
        description: r.description || "",
        prepTime: r.prepTime?.toString() || "",
        cookTime: r.cookTime?.toString() || "",
        servings: r.servings?.toString() || "",
        difficulty: r.difficulty || "Facile",
        ingredients: r.ingredients?.length ? r.ingredients : [emptyIng()],
        instructions: r.instructions?.length ? r.instructions.map(t => ({ text: t })) : [emptyStep()],
        imageBase64: r.imageBase64 || null,
        tags: (r.tags || []).join(", "),
      });
      if (r.imageBase64) setImagePreview(r.imageBase64);
    }
  }, [id, currentUser]);

  function setField(field, value) {
    setForm(p => ({ ...p, [field]: value }));
    setErrors(p => ({ ...p, [field]: "" }));
  }

  function updateIng(idx, field, value) {
    const u = [...form.ingredients];
    u[idx] = { ...u[idx], [field]: value };
    setField("ingredients", u);
  }
  function addIng() { setField("ingredients", [...form.ingredients, emptyIng()]); }
  function removeIng(idx) {
    if (form.ingredients.length <= 1) return;
    setField("ingredients", form.ingredients.filter((_, i) => i !== idx));
  }

  function updateStep(idx, val) {
    const u = [...form.instructions];
    u[idx] = { text: val };
    setField("instructions", u);
  }
  function addStep() { setField("instructions", [...form.instructions, emptyStep()]); }
  function removeStep(idx) {
    if (form.instructions.length <= 1) return;
    setField("instructions", form.instructions.filter((_, i) => i !== idx));
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { addToast("Max 5 Mo.", "error"); return; }
    const reader = new FileReader();
    reader.onload = ev => { setImagePreview(ev.target.result); setField("imageBase64", ev.target.result); };
    reader.readAsDataURL(file);
  }

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = "Requis.";
    if (!form.category) e.category = "Requis.";
    if (!form.description.trim()) e.description = "Requis.";
    if (!form.prepTime || isNaN(form.prepTime)) e.prepTime = "Invalide.";
    if (!form.cookTime || isNaN(form.cookTime)) e.cookTime = "Invalide.";
    if (!form.servings || isNaN(form.servings) || Number(form.servings) < 1) e.servings = "Invalide.";
    if (!form.ingredients.some(i => i.name.trim())) e.ingredients = "Au moins un ingrédient requis.";
    if (!form.instructions.some(s => s.text.trim())) e.instructions = "Au moins une étape requise.";
    return e;
  }

  async function handleSubmit(status = "published") {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      addToast("Corrigez les erreurs.", "error");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSubmitting(true);
    try {
      const data = {
        title: form.title.trim(), category: form.category,
        description: form.description.trim(),
        prepTime: Number(form.prepTime), cookTime: Number(form.cookTime),
        servings: Number(form.servings), difficulty: form.difficulty,
        ingredients: form.ingredients.filter(i => i.name.trim()),
        instructions: form.instructions.filter(s => s.text.trim()).map(s => s.text.trim()),
        imageBase64: form.imageBase64,
        tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        authorId: currentUser.id, status,
      };
      if (isEdit) {
        updateRecipe(id, data);
        addToast("Recette mise à jour !");
        navigate(`/recettes/${id}`);
      } else {
        const nr = createRecipe(data);
        addToast("Recette publiée ! 🎉");
        navigate(`/recettes/${nr.id}`);
      }
    } catch (err) {
      addToast(err.message, "error");
    } finally { setSubmitting(false); }
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
      {/* En-tête */}
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#111827", marginBottom: "0.5rem" }}>
          {isEdit ? "Modifier la recette ✏️" : "Créer une nouvelle recette 🍳"}
        </h1>
        <p style={{ color: "#6b7280", fontSize: "0.95rem" }}>
          {isEdit ? "Mettez à jour votre recette" : "Partagez votre création avec la communauté CookShare"}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

        {/* ── Infos de base ───────────────────────────────────── */}
        <Section title="Informations de base">
          <Label text="Titre de la recette *" error={errors.title}>
            <input type="text" value={form.title}
              onChange={e => setField("title", e.target.value)}
              placeholder="ex. Gâteau au chocolat classique"
              style={inp(errors.title)} />
          </Label>

          <Label text="Catégorie *" error={errors.category}>
            <select value={form.category} onChange={e => setField("category", e.target.value)}
              style={inp(errors.category)}>
              <option value="">Choisir une catégorie</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Label>

          <Label text="Description *" error={errors.description}>
            <textarea value={form.description}
              onChange={e => setField("description", e.target.value)}
              placeholder="Brève description de votre recette..."
              rows={3}
              style={{ ...inp(errors.description), resize: "none" }} />
          </Label>

          <Label text="Tags (séparés par des virgules)">
            <input type="text" value={form.tags}
              onChange={e => setField("tags", e.target.value)}
              placeholder="ex. rapide, végétarien, healthy"
              style={inp(false)} />
          </Label>
        </Section>

        {/* ── Temps & portions ────────────────────────────────── */}
        <Section title="Temps & portions">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
            {[
              { label: "Préparation (min)", field: "prepTime" },
              { label: "Cuisson (min)", field: "cookTime" },
              { label: "Portions", field: "servings" },
            ].map(({ label, field }) => (
              <Label key={field} text={label} error={errors[field]}>
                <input type="number" min="0" value={form[field]}
                  onChange={e => setField(field, e.target.value)}
                  style={inp(errors[field])} />
              </Label>
            ))}
          </div>
        </Section>

        {/* ── Difficulté ──────────────────────────────────────── */}
        <Section title="Difficulté">
          <div style={{ display: "flex", gap: "0.75rem" }}>
            {DIFFICULTIES.map(d => (
              <button key={d} type="button" onClick={() => setField("difficulty", d)} style={{
                flex: 1, padding: "0.625rem", borderRadius: "9999px",
                fontSize: "0.875rem", fontWeight: 600, cursor: "pointer",
                border: form.difficulty === d ? "none" : "1px solid #e5e7eb",
                backgroundColor: form.difficulty === d ? "#FF6B35" : "white",
                color: form.difficulty === d ? "white" : "#374151",
                transition: "all 0.15s"
              }}>{d}</button>
            ))}
          </div>
        </Section>

        {/* ── Ingrédients ─────────────────────────────────────── */}
        <Section title="Ingrédients">
          {errors.ingredients && (
            <p style={{ fontSize: "0.8rem", color: "#ef4444" }}>{errors.ingredients}</p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {form.ingredients.map((ing, idx) => (
              <div key={idx} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <GripVertical size={15} color="#d1d5db" style={{ flexShrink: 0 }} />
                <input type="text" value={ing.quantity}
                  onChange={e => updateIng(idx, "quantity", e.target.value)}
                  placeholder="2"
                  style={{ ...inp(false), width: 64, textAlign: "center", flexShrink: 0 }} />
                <select value={ing.unit}
                  onChange={e => updateIng(idx, "unit", e.target.value)}
                  style={{ ...inp(false), width: 100, flexShrink: 0 }}>
                  {UNITS.map(u => <option key={u}>{u}</option>)}
                </select>
                <input type="text" value={ing.name}
                  onChange={e => updateIng(idx, "name", e.target.value)}
                  placeholder="Nom de l'ingrédient"
                  style={{ ...inp(false), flex: 1 }} />
                <button type="button" onClick={() => removeIng(idx)}
                  disabled={form.ingredients.length <= 1}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: form.ingredients.length <= 1 ? "#d1d5db" : "#f87171",
                    flexShrink: 0, padding: "0.25rem"
                  }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addIng} style={{
            display: "inline-flex", alignItems: "center", gap: "0.375rem",
            background: "none", border: "none", cursor: "pointer",
            color: "#00B894", fontSize: "0.875rem", fontWeight: 600,
            padding: "0.25rem 0"
          }}>
            <Plus size={16} /> Ajouter un ingrédient
          </button>
        </Section>

        {/* ── Instructions ────────────────────────────────────── */}
        <Section title="Instructions">
          {errors.instructions && (
            <p style={{ fontSize: "0.8rem", color: "#ef4444" }}>{errors.instructions}</p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {form.instructions.map((step, idx) => (
              <div key={idx} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                <div style={{
                  width: 32, height: 32, minWidth: 32,
                  backgroundColor: "#FF6B35", color: "white",
                  borderRadius: "50%", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  fontSize: "0.85rem", fontWeight: 700, marginTop: "0.375rem"
                }}>{idx + 1}</div>
                <div style={{ flex: 1, display: "flex", gap: "0.5rem" }}>
                  <textarea value={step.text}
                    onChange={e => updateStep(idx, e.target.value)}
                    placeholder={`Décrivez l'étape ${idx + 1}...`}
                    rows={2}
                    style={{ ...inp(false), flex: 1, resize: "none" }} />
                  <button type="button" onClick={() => removeStep(idx)}
                    disabled={form.instructions.length <= 1}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: form.instructions.length <= 1 ? "#d1d5db" : "#f87171",
                      marginTop: "0.25rem", flexShrink: 0
                    }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={addStep} style={{
            display: "inline-flex", alignItems: "center", gap: "0.375rem",
            background: "none", border: "none", cursor: "pointer",
            color: "#00B894", fontSize: "0.875rem", fontWeight: 600,
            padding: "0.25rem 0"
          }}>
            <Plus size={16} /> Ajouter une étape
          </button>
        </Section>

        {/* ── Photo ───────────────────────────────────────────── */}
        <Section title="Photo de la recette">
          {imagePreview ? (
            <div style={{ position: "relative" }}>
              <img src={imagePreview} alt="Aperçu"
                style={{ width: "100%", height: 220, objectFit: "cover", borderRadius: "0.75rem" }} />
              <button type="button" onClick={() => { setImagePreview(null); setField("imageBase64", null); }}
                style={{
                  position: "absolute", top: "0.75rem", right: "0.75rem",
                  width: 32, height: 32, borderRadius: "50%",
                  backgroundColor: "rgba(0,0,0,0.55)", color: "white",
                  border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                <X size={14} />
              </button>
            </div>
          ) : (
            <label style={{ cursor: "pointer", display: "block" }}>
              <input type="file" accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange} style={{ display: "none" }} />
              <div style={{
                border: "2px dashed #e5e7eb", borderRadius: "1rem",
                padding: "3rem 1rem", textAlign: "center",
                transition: "border-color 0.15s"
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#FF6B35"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#e5e7eb"}
              >
                <Upload size={32} color="#FF6B35" style={{ margin: "0 auto 0.75rem" }} />
                <p style={{ fontWeight: 600, color: "#374151", marginBottom: "0.25rem" }}>
                  Glissez une image ou cliquez pour parcourir
                </p>
                <p style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                  JPG, PNG ou WebP · Max 5 Mo
                </p>
              </div>
            </label>
          )}
        </Section>

        {/* ── Boutons ─────────────────────────────────────────── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.5rem" }}>
          <button type="button" onClick={() => handleSubmit("draft")} disabled={submitting}
            style={{
              border: "1px solid #e5e7eb", borderRadius: "9999px",
              padding: "0.625rem 1.5rem", fontSize: "0.875rem",
              fontWeight: 500, cursor: "pointer", background: "white",
              color: "#374151", opacity: submitting ? 0.6 : 1
            }}>
            Enregistrer comme brouillon
          </button>
          <button type="button" onClick={() => handleSubmit("published")} disabled={submitting}
            style={{
              backgroundColor: "#FF6B35", color: "white",
              borderRadius: "9999px", padding: "0.625rem 2rem",
              fontSize: "0.875rem", fontWeight: 700, border: "none",
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.7 : 1,
              boxShadow: "0 4px 14px rgba(255,107,53,0.3)"
            }}>
            {submitting ? "Publication..." : isEdit ? "Mettre à jour" : "Publier la recette"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Sous-composants ── */
function Section({ title, children }) {
  return (
    <div style={{
      backgroundColor: "white", borderRadius: "1rem",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      border: "1px solid #f3f4f6", padding: "1.5rem",
      display: "flex", flexDirection: "column", gap: "1rem"
    }}>
      <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#111827", margin: 0 }}>{title}</h2>
      {children}
    </div>
  );
}

function Label({ text, error, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
      <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>{text}</label>
      {children}
      {error && <p style={{ fontSize: "0.75rem", color: "#ef4444" }}>{error}</p>}
    </div>
  );
}

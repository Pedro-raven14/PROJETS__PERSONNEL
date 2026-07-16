import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  initialArticles,
  initialCategories,
  initialComments,
  adminCredentials,
} from "../data/initialData";

// ─── Context ──────────────────────────────────────────────────────────────────
const BlogContext = createContext(null);

// ─── Clés LocalStorage ────────────────────────────────────────────────────────
const KEYS = {
  articles: "myblog_articles",
  categories: "myblog_categories",
  comments: "myblog_comments",
  theme: "myblog_theme",
  auth: "myblog_auth",
};

// ─── Helper : lecture / écriture localStorage ─────────────────────────────────
function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function BlogProvider({ children }) {
  // --- État ---
  const [articles, setArticles] = useState(() =>
    load(KEYS.articles, initialArticles)
  );
  const [categories, setCategories] = useState(() =>
    load(KEYS.categories, initialCategories)
  );
  const [comments, setComments] = useState(() =>
    load(KEYS.comments, initialComments)
  );
  const [isDark, setIsDark] = useState(() => {
    const stored = load(KEYS.theme, null);
    if (stored !== null) return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [isAdmin, setIsAdmin] = useState(() => load(KEYS.auth, false));

  // --- Persistance automatique ---
  useEffect(() => save(KEYS.articles, articles), [articles]);
  useEffect(() => save(KEYS.categories, categories), [categories]);
  useEffect(() => save(KEYS.comments, comments), [comments]);
  useEffect(() => save(KEYS.theme, isDark), [isDark]);
  useEffect(() => save(KEYS.auth, isAdmin), [isAdmin]);

  // --- Thème sur le <html> ---
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // ─── Actions articles ────────────────────────────────────────────────────────
  const addArticle = useCallback((article) => {
    const newArticle = {
      ...article,
      id: `art-${Date.now()}`,
      date: article.date || new Date().toISOString().split("T")[0],
      authorInitials: article.author
        ? article.author
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "AD",
    };
    setArticles((prev) => [newArticle, ...prev]);
    return newArticle;
  }, []);

  const updateArticle = useCallback((id, updates) => {
    setArticles((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              ...updates,
              authorInitials: (updates.author || a.author)
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2),
            }
          : a
      )
    );
  }, []);

  const deleteArticle = useCallback((id) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
    setComments((prev) => prev.filter((c) => c.articleId !== id));
  }, []);

  const getArticleBySlug = useCallback(
    (slug) => articles.find((a) => a.slug === slug),
    [articles]
  );

  const getPublishedArticles = useCallback(
    () =>
      articles
        .filter((a) => a.status === "published")
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [articles]
  );

  const getArticlesByCategory = useCallback(
    (categoryId) =>
      articles
        .filter((a) => a.status === "published" && a.categoryId === categoryId)
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [articles]
  );

  // ─── Actions commentaires ────────────────────────────────────────────────────
  const addComment = useCallback((comment) => {
    const newComment = {
      ...comment,
      id: `com-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      initials: comment.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
    };
    setComments((prev) => [...prev, newComment]);
    return newComment;
  }, []);

  const getCommentsByArticle = useCallback(
    (articleId) => comments.filter((c) => c.articleId === articleId),
    [comments]
  );

  const deleteComment = useCallback((id) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // ─── Actions catégories ──────────────────────────────────────────────────────
  const getCategoryById = useCallback(
    (id) => categories.find((c) => c.id === id),
    [categories]
  );

  const getCategoryBySlug = useCallback(
    (slug) => categories.find((c) => c.slug === slug),
    [categories]
  );

  const getArticleCountByCategory = useCallback(
    (categoryId) =>
      articles.filter(
        (a) => a.status === "published" && a.categoryId === categoryId
      ).length,
    [articles]
  );

  // ─── Auth ────────────────────────────────────────────────────────────────────
  const login = useCallback((email, password) => {
    if (
      email === adminCredentials.email &&
      password === adminCredentials.password
    ) {
      setIsAdmin(true);
      return { success: true };
    }
    return { success: false, error: "Email ou mot de passe incorrect." };
  }, []);

  const logout = useCallback(() => {
    setIsAdmin(false);
  }, []);

  // ─── Thème ───────────────────────────────────────────────────────────────────
  const toggleTheme = useCallback(() => setIsDark((prev) => !prev), []);

  // ─── Recherche ───────────────────────────────────────────────────────────────
  const searchArticles = useCallback(
    (query) => {
      if (!query.trim()) return [];
      const q = query.toLowerCase();
      return articles.filter(
        (a) =>
          a.status === "published" &&
          (a.title.toLowerCase().includes(q) ||
            a.excerpt.toLowerCase().includes(q) ||
            a.content.toLowerCase().includes(q))
      );
    },
    [articles]
  );

  // ─── Valeur exposée ──────────────────────────────────────────────────────────
  const value = {
    // État
    articles,
    categories,
    comments,
    isDark,
    isAdmin,

    // Articles
    addArticle,
    updateArticle,
    deleteArticle,
    getArticleBySlug,
    getPublishedArticles,
    getArticlesByCategory,

    // Commentaires
    addComment,
    getCommentsByArticle,
    deleteComment,

    // Catégories
    getCategoryById,
    getCategoryBySlug,
    getArticleCountByCategory,

    // Auth
    login,
    logout,

    // Thème
    toggleTheme,

    // Recherche
    searchArticles,
  };

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
}

// ─── Hook utilitaire ──────────────────────────────────────────────────────────
export function useBlog() {
  const ctx = useContext(BlogContext);
  if (!ctx) throw new Error("useBlog doit être utilisé dans un BlogProvider");
  return ctx;
}

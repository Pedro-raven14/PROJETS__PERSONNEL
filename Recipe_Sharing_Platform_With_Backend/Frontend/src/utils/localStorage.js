/**
 * Couche d'abstraction localStorage pour CookShare.
 * Toutes les opérations de données passent par ici.
 * Facilite la migration future vers une vraie base de données.
 */

import {
  DEMO_RECIPES,
  DEMO_USERS,
  DEMO_COMMENTS,
  DEMO_RATINGS,
} from "../data/demoData";

const KEYS = {
  RECIPES: "cookshare_recipes",
  USERS: "cookshare_users",
  COMMENTS: "cookshare_comments",
  RATINGS: "cookshare_ratings",
  CURRENT_USER: "cookshare_current_user",
  INITIALIZED: "cookshare_initialized",
};

// ─── INIT ────────────────────────────────────────────────────────────────────

/**
 * Initialise le localStorage avec les données de démo si c'est la première fois.
 */
export function initializeStorage() {
  if (localStorage.getItem(KEYS.INITIALIZED)) return;

  localStorage.setItem(KEYS.RECIPES, JSON.stringify(DEMO_RECIPES));
  localStorage.setItem(KEYS.USERS, JSON.stringify(DEMO_USERS));
  localStorage.setItem(KEYS.COMMENTS, JSON.stringify(DEMO_COMMENTS));
  localStorage.setItem(KEYS.RATINGS, JSON.stringify(DEMO_RATINGS));
  localStorage.setItem(KEYS.INITIALIZED, "true");
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function getItem(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function generateId(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ─── USERS ───────────────────────────────────────────────────────────────────

export function getUsers() {
  return getItem(KEYS.USERS);
}

export function getUserById(id) {
  return getUsers().find((u) => u.id === id) || null;
}

export function getUserByEmail(email) {
  return getUsers().find((u) => u.email === email.toLowerCase()) || null;
}

export function getUserByUsername(username) {
  return getUsers().find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  ) || null;
}

export function createUser({ fullName, username, email, password }) {
  const users = getUsers();

  if (getUserByEmail(email)) {
    throw new Error("Un compte avec cet email existe déjà.");
  }
  if (getUserByUsername(username)) {
    throw new Error("Ce nom d'utilisateur est déjà pris.");
  }

  const newUser = {
    id: generateId("user"),
    fullName,
    username,
    email: email.toLowerCase(),
    password, // En prod, ce serait un hash
    bio: "",
    avatar: null,
    createdAt: new Date().toISOString(),
  };

  setItem(KEYS.USERS, [...users, newUser]);
  return newUser;
}

export function updateUser(id, updates) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) throw new Error("Utilisateur introuvable.");

  const updated = { ...users[idx], ...updates };
  users[idx] = updated;
  setItem(KEYS.USERS, users);
  return updated;
}

// ─── AUTH ────────────────────────────────────────────────────────────────────

export function login(email, password) {
  const user = getUserByEmail(email);
  if (!user) throw new Error("Aucun compte trouvé avec cet email.");
  if (user.password !== password)
    throw new Error("Mot de passe incorrect.");

  // On ne stocke pas le mot de passe dans la session
  const session = { ...user };
  delete session.password;
  setItem(KEYS.CURRENT_USER, session);
  return session;
}

export function logout() {
  localStorage.removeItem(KEYS.CURRENT_USER);
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(KEYS.CURRENT_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function updateCurrentUserSession(updates) {
  const current = getCurrentUser();
  if (!current) return;
  const updated = { ...current, ...updates };
  setItem(KEYS.CURRENT_USER, updated);
  return updated;
}

// ─── RECIPES ─────────────────────────────────────────────────────────────────

export function getRecipes({ status = "published" } = {}) {
  const recipes = getItem(KEYS.RECIPES);
  return status ? recipes.filter((r) => r.status === status) : recipes;
}

export function getRecipeById(id) {
  return getItem(KEYS.RECIPES).find((r) => r.id === id) || null;
}

export function getRecipesByAuthor(authorId) {
  return getItem(KEYS.RECIPES).filter((r) => r.authorId === authorId);
}

export function createRecipe(data) {
  const recipes = getItem(KEYS.RECIPES);
  const newRecipe = {
    id: generateId("recipe"),
    ...data,
    rating: 0,
    ratingsCount: 0,
    favorites: [],
    createdAt: new Date().toISOString(),
  };
  setItem(KEYS.RECIPES, [...recipes, newRecipe]);
  return newRecipe;
}

export function updateRecipe(id, updates) {
  const recipes = getItem(KEYS.RECIPES);
  const idx = recipes.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error("Recette introuvable.");

  const updated = { ...recipes[idx], ...updates, updatedAt: new Date().toISOString() };
  recipes[idx] = updated;
  setItem(KEYS.RECIPES, recipes);
  return updated;
}

export function deleteRecipe(id) {
  const recipes = getItem(KEYS.RECIPES);
  setItem(KEYS.RECIPES, recipes.filter((r) => r.id !== id));
  // Nettoyer les commentaires et ratings liés
  setItem(KEYS.COMMENTS, getItem(KEYS.COMMENTS).filter((c) => c.recipeId !== id));
  setItem(KEYS.RATINGS, getItem(KEYS.RATINGS).filter((r) => r.recipeId !== id));
}

export function toggleFavorite(recipeId, userId) {
  const recipes = getItem(KEYS.RECIPES);
  const idx = recipes.findIndex((r) => r.id === recipeId);
  if (idx === -1) return null;

  const recipe = recipes[idx];
  const favorites = recipe.favorites || [];
  const isFav = favorites.includes(userId);

  recipes[idx] = {
    ...recipe,
    favorites: isFav
      ? favorites.filter((id) => id !== userId)
      : [...favorites, userId],
  };
  setItem(KEYS.RECIPES, recipes);
  return !isFav;
}

export function getFavoriteRecipes(userId) {
  return getItem(KEYS.RECIPES).filter(
    (r) => r.status === "published" && (r.favorites || []).includes(userId)
  );
}

// ─── COMMENTS ────────────────────────────────────────────────────────────────

export function getCommentsByRecipe(recipeId) {
  return getItem(KEYS.COMMENTS)
    .filter((c) => c.recipeId === recipeId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function addComment(recipeId, authorId, text) {
  const comments = getItem(KEYS.COMMENTS);
  const newComment = {
    id: generateId("comment"),
    recipeId,
    authorId,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };
  setItem(KEYS.COMMENTS, [...comments, newComment]);
  return newComment;
}

export function deleteComment(commentId) {
  const comments = getItem(KEYS.COMMENTS);
  setItem(KEYS.COMMENTS, comments.filter((c) => c.id !== commentId));
}

// ─── RATINGS ─────────────────────────────────────────────────────────────────

export function rateRecipe(recipeId, userId, rating) {
  const ratings = getItem(KEYS.RATINGS);
  const existing = ratings.findIndex(
    (r) => r.recipeId === recipeId && r.userId === userId
  );

  if (existing !== -1) {
    ratings[existing].rating = rating;
  } else {
    ratings.push({ recipeId, userId, rating });
  }
  setItem(KEYS.RATINGS, ratings);

  // Recalculer la moyenne sur la recette
  const recipeRatings = ratings.filter((r) => r.recipeId === recipeId);
  const avg =
    recipeRatings.reduce((sum, r) => sum + r.rating, 0) / recipeRatings.length;
  updateRecipe(recipeId, {
    rating: Math.round(avg * 10) / 10,
    ratingsCount: recipeRatings.length,
  });

  return avg;
}

export function getUserRating(recipeId, userId) {
  const ratings = getItem(KEYS.RATINGS);
  return ratings.find((r) => r.recipeId === recipeId && r.userId === userId)?.rating || 0;
}

// ─── SEARCH & FILTERS ────────────────────────────────────────────────────────

export function searchAndFilterRecipes({
  query = "",
  category = "",
  prepTime = "",
  difficulty = "",
  diet = "",
  sortBy = "recent",
} = {}) {
  let recipes = getRecipes({ status: "published" });

  if (query.trim()) {
    const q = query.toLowerCase();
    recipes = recipes.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        (r.tags || []).some((t) => t.toLowerCase().includes(q)) ||
        (r.ingredients || []).some((i) => i.name.toLowerCase().includes(q))
    );
  }

  if (category && category !== "Tout") {
    recipes = recipes.filter((r) => r.category === category);
  }

  if (prepTime && prepTime !== "Peu importe") {
    recipes = recipes.filter((r) => {
      const total = (r.prepTime || 0) + (r.cookTime || 0);
      switch (prepTime) {
        case "Moins de 15 min": return total < 15;
        case "15 à 30 min": return total >= 15 && total <= 30;
        case "30 à 60 min": return total > 30 && total <= 60;
        case "Plus de 60 min": return total > 60;
        default: return true;
      }
    });
  }

  if (difficulty && difficulty !== "") {
    recipes = recipes.filter((r) => r.difficulty === difficulty);
  }

  if (diet && diet !== "") {
    recipes = recipes.filter((r) => (r.tags || []).includes(diet.toLowerCase()));
  }

  // Tri
  switch (sortBy) {
    case "recent":
      recipes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    case "popular":
      recipes.sort((a, b) => (b.favorites?.length || 0) - (a.favorites?.length || 0));
      break;
    case "rating":
      recipes.sort((a, b) => b.rating - a.rating);
      break;
    case "time":
      recipes.sort(
        (a, b) =>
          (a.prepTime + a.cookTime) - (b.prepTime + b.cookTime)
      );
      break;
    default:
      break;
  }

  return recipes;
}

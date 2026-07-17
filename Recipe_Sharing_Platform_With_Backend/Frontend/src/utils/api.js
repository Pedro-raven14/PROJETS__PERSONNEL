/**
 * ─────────────────────────────────────────────────────────────────────────────
 * API.JS — Couche d'abstraction des appels backend
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Ce fichier remplace localStorage.js. Toutes les fonctions appellent
 * maintenant le backend NestJS via axios plutôt que le localStorage.
 *
 * Le reste du code (composants, AuthContext) n'a presque pas changé
 * car on garde les mêmes noms de fonctions que dans localStorage.js.
 * C'est l'avantage d'avoir une couche d'abstraction dès le départ !
 *
 * Chaque fonction :
 * 1. Fait un appel HTTP via apiClient
 * 2. Retourne les données directement (pas l'objet axios {data, status, ...})
 * 3. Laisse les erreurs remonter (catch fait dans les composants ou AuthContext)
 */

import apiClient from "./apiClient";

// ─── AUTH ─────────────────────────────────────────────────────────────────────

/**
 * Inscription d'un nouvel utilisateur.
 * Le backend retourne : { accessToken, refreshToken, user }
 */
export async function register({ fullName, username, email, password }) {
  const { data } = await apiClient.post("/auth/register", {
    fullName,
    username,
    email,
    password,
  });
  return data; // { accessToken, refreshToken, user }
}

/**
 * Connexion.
 * Retourne : { accessToken, refreshToken, user }
 */
export async function loginApi(email, password) {
  const { data } = await apiClient.post("/auth/login", { email, password });
  return data;
}

/**
 * Déconnexion. Invalide le refresh token côté backend.
 */
export async function logoutApi() {
  try {
    await apiClient.post("/auth/logout");
  } catch {
    // Même si l'appel échoue (ex: token déjà expiré), on nettoie côté client
  }
}

/**
 * Renouveler le token (appelé automatiquement par l'intercepteur axios,
 * mais exposé ici pour usage manuel si nécessaire).
 */
export async function refreshTokenApi(refreshToken) {
  const { data } = await apiClient.post(
    "/auth/refresh",
    {},
    { headers: { Authorization: `Bearer ${refreshToken}` } }
  );
  return data;
}

// ─── USERS ────────────────────────────────────────────────────────────────────

/**
 * Récupérer le profil de l'utilisateur connecté.
 */
export async function getMe() {
  const { data } = await apiClient.get("/users/me");
  return data;
}

/**
 * Modifier son profil.
 */
export async function updateMe({ fullName, bio, avatar }) {
  const { data } = await apiClient.patch("/users/me", { fullName, bio, avatar });
  return data;
}

/**
 * Profil public d'un utilisateur par son username.
 */
export async function getUserByUsernameApi(username) {
  const { data } = await apiClient.get(`/users/${username}`);
  return data;
}

/**
 * Récupérer les recettes favorites de l'utilisateur connecté.
 */
export async function getMyFavorites() {
  const { data } = await apiClient.get("/users/me/favorites");
  return data;
}

// ─── RECIPES ──────────────────────────────────────────────────────────────────

/**
 * Lister les recettes avec filtres optionnels.
 *
 * @param {Object} filters - { query, category, difficulty, prepTime, diet, sortBy, page, limit, status }
 * @returns {{ data, total, page, limit, totalPages }}
 */
export async function getRecipes(filters = {}) {
  // Supprimer les clés avec valeur vide pour ne pas polluer l'URL
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== "" && v !== undefined && v !== null)
  );
  const { data } = await apiClient.get("/recipes", { params });
  return data; // { data: Recipe[], total, page, limit, totalPages }
}

/**
 * Récupérer une recette par son ID.
 */
export async function getRecipeById(id) {
  const { data } = await apiClient.get(`/recipes/${id}`);
  return data;
}

/**
 * Récupérer les recettes d'un utilisateur.
 */
export async function getRecipesByUser(userId) {
  const { data } = await apiClient.get(`/recipes/user/${userId}`);
  return data;
}

/**
 * Créer une nouvelle recette.
 */
export async function createRecipe(recipeData) {
  const { data } = await apiClient.post("/recipes", recipeData);
  return data;
}

/**
 * Modifier une recette.
 */
export async function updateRecipe(id, recipeData) {
  const { data } = await apiClient.patch(`/recipes/${id}`, recipeData);
  return data;
}

/**
 * Supprimer une recette.
 */
export async function deleteRecipe(id) {
  const { data } = await apiClient.delete(`/recipes/${id}`);
  return data;
}

/**
 * Toggle favori (ajoute si absent, retire si présent).
 * @returns {{ isFavorite: boolean }}
 */
export async function toggleFavorite(recipeId) {
  const { data } = await apiClient.post(`/recipes/${recipeId}/favorite`);
  return data; // { isFavorite: boolean }
}

// ─── COMMENTS ─────────────────────────────────────────────────────────────────

/**
 * Récupérer les commentaires d'une recette.
 */
export async function getCommentsByRecipe(recipeId) {
  const { data } = await apiClient.get(`/recipes/${recipeId}/comments`);
  return data;
}

/**
 * Ajouter un commentaire.
 */
export async function addComment(recipeId, text) {
  const { data } = await apiClient.post(`/recipes/${recipeId}/comments`, { text });
  return data;
}

/**
 * Supprimer un commentaire.
 */
export async function deleteComment(commentId) {
  const { data } = await apiClient.delete(`/comments/${commentId}`);
  return data;
}

// ─── RATINGS ──────────────────────────────────────────────────────────────────

/**
 * Noter une recette (crée ou met à jour).
 * @param {string} recipeId
 * @param {number} rating - 1 à 5
 */
export async function rateRecipe(recipeId, rating) {
  const { data } = await apiClient.post(`/recipes/${recipeId}/rate`, { rating });
  return data; // { rating, average, count }
}

/**
 * Récupérer la note de l'utilisateur connecté pour une recette.
 * @returns {{ rating: number, hasRated: boolean }}
 */
export async function getUserRating(recipeId) {
  const { data } = await apiClient.get(`/recipes/${recipeId}/rating/me`);
  return data;
}

// ─── UPLOAD ───────────────────────────────────────────────────────────────────

/**
 * Uploader une image vers Cloudinary via le backend.
 * @param {File} file - Fichier image sélectionné par l'utilisateur
 * @returns {{ url: string }} - URL publique Cloudinary
 */
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await apiClient.post("/upload/image", formData, {
    headers: {
      // Overrider le Content-Type pour multipart/form-data
      // axios le gère automatiquement avec FormData, mais on le précise pour la clarté
      "Content-Type": "multipart/form-data",
    },
  });
  return data; // { url: "https://res.cloudinary.com/..." }
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/**
 * Convertit le format de filtres du frontend vers les params attendus par l'API.
 *
 * Le frontend utilise des labels français ("Moins de 15 min")
 * mais l'API attend des plages ("0-15").
 */
export function mapPrepTimeFilter(prepTime) {
  const map = {
    "Moins de 15 min": "0-15",
    "15 à 30 min": "15-30",
    "30 à 60 min": "30-60",
    "Plus de 60 min": "60+",
    "Peu importe": "",
  };
  return map[prepTime] || "";
}

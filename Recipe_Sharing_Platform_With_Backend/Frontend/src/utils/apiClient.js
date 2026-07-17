/**
 * ─────────────────────────────────────────────────────────────────────────────
 * API CLIENT — apiClient.js
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Instance axios configurée pour toutes les requêtes vers le backend.
 *
 * Pourquoi une instance axios plutôt qu'axios directement ?
 * - baseURL définie une seule fois → pas besoin de répéter l'URL partout
 * - Intercepteurs centralisés → gestion automatique des tokens JWT
 * - Renouvellement automatique du token → transparent pour les composants
 */

import axios from "axios";

// URL du backend. En dev : http://localhost:3000/api
// En prod : changer via la variable d'environnement VITE_API_URL
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/**
 * Instance axios principale avec la base URL configurée.
 * Toutes les requêtes passent par ici.
 */
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── INTERCEPTEUR DE REQUÊTE ──────────────────────────────────────────────────

/**
 * Avant chaque requête, on injecte automatiquement le token JWT
 * dans le header Authorization.
 *
 * Le token est stocké dans localStorage sous la clé "cookshare_access_token".
 * Ainsi, tous les appels API authentifiés fonctionnent sans passer le token
 * manuellement à chaque fois.
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("cookshare_access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── INTERCEPTEUR DE RÉPONSE (gestion du token expiré) ───────────────────────

/**
 * Flag pour éviter plusieurs tentatives de refresh simultanées.
 * Si le token expire et que 5 requêtes partent en même temps,
 * on ne veut pas faire 5 appels refresh.
 */
let isRefreshing = false;
let failedQueue = [];

/**
 * Traite la file d'attente après un refresh réussi ou échoué.
 */
function processQueue(error, token = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

/**
 * Intercepteur de réponse :
 * - Si la réponse est OK → la retourner normalement
 * - Si 401 Unauthorized → tenter de rafraîchir le token automatiquement
 *   → si succès → rejouer la requête originale avec le nouveau token
 *   → si échec → déconnecter l'utilisateur
 *
 * C'est le mécanisme de "silent refresh" : l'utilisateur ne voit pas
 * que le token a été renouvelé, tout est transparent.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si l'erreur est 401 et qu'on n'a pas déjà tenté le refresh pour cette requête
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/login")
    ) {
      if (isRefreshing) {
        // Si un refresh est déjà en cours, mettre la requête en attente
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("cookshare_refresh_token");

      if (!refreshToken) {
        // Pas de refresh token → déconnecter
        clearAuthTokens();
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        // Appeler le endpoint refresh avec le refresh token
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, null, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        });

        // Sauvegarder les nouveaux tokens
        setAuthTokens(data.accessToken, data.refreshToken);
        processQueue(null, data.accessToken);

        // Rejouer la requête originale avec le nouveau token
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh échoué → déconnecter
        processQueue(refreshError, null);
        clearAuthTokens();
        // Déclencher un événement pour que l'AuthContext puisse réagir
        window.dispatchEvent(new CustomEvent("auth:logout"));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── HELPERS TOKENS ───────────────────────────────────────────────────────────

export function setAuthTokens(accessToken, refreshToken) {
  localStorage.setItem("cookshare_access_token", accessToken);
  localStorage.setItem("cookshare_refresh_token", refreshToken);
}

export function clearAuthTokens() {
  localStorage.removeItem("cookshare_access_token");
  localStorage.removeItem("cookshare_refresh_token");
  localStorage.removeItem("cookshare_user");
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem("cookshare_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  localStorage.setItem("cookshare_user", JSON.stringify(user));
}

export default apiClient;

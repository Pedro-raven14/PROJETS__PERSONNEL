/**
 * Configuration centrale d'Axios pour toute l'application.
 *
 * POURQUOI une instance centralisée plutôt qu'import axios directement ?
 * En créant une instance avec axios.create(), on définit UNE SEULE FOIS :
 * - l'URL de base → pas besoin de la répéter dans chaque appel
 * - les headers par défaut (Content-Type, Authorization plus tard...)
 * - les timeouts
 *
 * Si demain on change l'URL de l'API ou on ajoute un token JWT,
 * on ne modifie QUE CE FICHIER — tous les services en bénéficient automatiquement.
 */

import axios from 'axios';

/**
 * L'URL de base est lue depuis la variable d'environnement Vite.
 * En développement : VITE_API_URL=http://localhost:3000 (fichier .env)
 * En production : VITE_API_URL=https://ton-api.railway.app
 *
 * import.meta.env est l'équivalent Vite de process.env pour webpack.
 * Les variables DOIVENT commencer par VITE_ pour être exposées au client.
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Instance Axios configurée.
 *
 * baseURL : préfixe automatiquement toutes les URLs.
 *   apiClient.get('/transactions') → GET http://localhost:3000/transactions
 *
 * headers Content-Type : indique au serveur qu'on envoie du JSON.
 *   NestJS s'attend à 'application/json' pour parser le body des requêtes POST/PATCH.
 *
 * timeout : si l'API ne répond pas en 10s, axios lance une erreur automatiquement.
 *   Évite que le frontend reste bloqué indéfiniment sur un loading.
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 secondes max
});

/**
 * Intercepteur de REQUÊTES (request interceptor).
 *
 * Appelé automatiquement avant CHAQUE requête envoyée.
 * Parfait pour injecter un token JWT quand on ajoutera l'auth :
 *
 * apiClient.interceptors.request.use((config) => {
 *   const token = localStorage.getItem('jwt_token');
 *   if (token) config.headers.Authorization = `Bearer ${token}`;
 *   return config;
 * });
 *
 * Pour l'instant on ne fait rien, mais l'intercepteur est là, prêt.
 */
apiClient.interceptors.request.use(
  (config) => config, // pas de modification pour l'instant
  (error) => Promise.reject(error),
);

/**
 * Intercepteur de RÉPONSES (response interceptor).
 *
 * Appelé automatiquement après chaque réponse reçue.
 * Le premier callback gère les réponses 2xx (succès).
 * Le second callback gère les erreurs HTTP (4xx, 5xx) et les timeouts.
 *
 * ICI on centralise la gestion des erreurs globales :
 * - 401 → rediriger vers la page de login (plus tard avec JWT)
 * - 503 → afficher "serveur indisponible"
 */
apiClient.interceptors.response.use(
  (response) => response, // succès : retourner la réponse telle quelle
  (error) => {
    // On enrichit le message d'erreur pour qu'il soit lisible dans le contexte
    if (error.response) {
      // Le serveur a répondu avec un code d'erreur (400, 404, 500...)
      const { status, data } = error.response;
      const message = data?.message || `Erreur ${status}`;
      return Promise.reject(new Error(Array.isArray(message) ? message.join(', ') : message));
    } else if (error.request) {
      // La requête est partie mais pas de réponse (réseau coupé, serveur éteint)
      return Promise.reject(new Error('Impossible de contacter le serveur. Vérifiez que le backend est démarré.'));
    }
    // Erreur de configuration axios
    return Promise.reject(error);
  },
);

export default apiClient;
export { API_BASE_URL };

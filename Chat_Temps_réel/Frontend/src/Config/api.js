import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/*
  Instance Axios centralisée.

  Pourquoi ne pas juste écrire fetch() directement dans chaque composant ?
  - Parce qu'on aurait à répéter l'URL de base partout
  - Parce qu'on aurait à ajouter manuellement le token JWT à chaque appel
  - Parce qu'on aurait à gérer le 401 partout

  Ici on configure tout une seule fois :
  - baseURL : l'URL du backend (lue depuis .env)
  - intercepteur request : ajoute automatiquement "Authorization: Bearer <token>"
  - intercepteur response : si 401, nettoie localStorage et redirige vers /login
*/

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Avant chaque requête : on lit le token et on l'ajoute dans le header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nebula_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Après chaque réponse : si 401 (token expiré), on déconnecte l'utilisateur
// MAIS seulement si on n'est PAS sur la page de login (évite la boucle de rechargement)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const is401 = error.response?.status === 401;
    const isAuthRoute = error.config?.url?.includes('/auth/');

    /*
      On ne redirige vers /login QUE si :
      1. C'est bien un 401 (token expiré ou invalide)
      2. La requête NE vient PAS d'une route d'auth (/auth/login, /auth/register)
         car sur ces routes, un 401 = mauvais mot de passe → on veut afficher l'erreur
         dans le formulaire, pas recharger la page
    */
    if (is401 && !isAuthRoute) {
      localStorage.removeItem('nebula_token');
      localStorage.removeItem('nebula_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };

import { createContext, useContext, useState, useCallback } from 'react';
import api from '../Config/api';

/*
  Pourquoi un Context ?
  Le token JWT et l'user connecté sont nécessaires dans TOUTE l'application :
  - Container.jsx pour savoir si on peut accéder à /chat
  - Room.jsx pour savoir qui envoie les messages
  - Sidebar.jsx pour afficher le profil en bas
  - ChatArea.jsx pour savoir si un message est "le mien"
  
  Sans Context, on devrait passer ces infos de composant en composant
  via les props (prop drilling), ce qui devient vite ingérable.
  Le Context crée une "réserve globale" accessible de n'importe où.
*/

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  /*
    On initialise depuis localStorage pour persister la session
    même si l'utilisateur rafraîchit la page.
  */
  const [token, setToken] = useState(() => localStorage.getItem('nebula_token'));
  const [user, setUser]   = useState(() => {
    const stored = localStorage.getItem('nebula_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  /*
    useCallback évite de recréer ces fonctions à chaque re-render.
    Elles sont stables en mémoire → pas de re-renders inutiles des enfants.
  */
  const register = useCallback(async (username, password, avatarColor) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/register', { username, password, avatarColor });
      /*
        Le backend retourne { user, token }.
        On stocke les deux dans le state ET dans localStorage.
      */
      localStorage.setItem('nebula_token', data.token);
      localStorage.setItem('nebula_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur lors de l\'inscription.';
      // NestJS peut retourner un tableau de messages de validation
      const errorMsg = Array.isArray(msg) ? msg[0] : msg;
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (username, password) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { username, password });
      localStorage.setItem('nebula_token', data.token);
      localStorage.setItem('nebula_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Identifiants invalides.';
      const errorMsg = Array.isArray(msg) ? msg[0] : msg;
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('nebula_token');
    localStorage.removeItem('nebula_user');
    setToken(null);
    setUser(null);
  }, []);

  const clearError = useCallback(() => setError(''), []);

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{
      token,
      user,
      loading,
      error,
      isAuthenticated,
      register,
      login,
      logout,
      clearError,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

/*
  Hook custom pour consommer le contexte.
  Au lieu d'écrire useContext(AuthContext) partout,
  on écrit useAuth() — plus lisible et on peut ajouter
  une vérification si on oublie le Provider.
*/
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return ctx;
};

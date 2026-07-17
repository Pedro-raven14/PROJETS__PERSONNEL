/**
 * ─────────────────────────────────────────────────────────────────────────────
 * AUTH CONTEXT — AuthContext.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Gère l'état d'authentification global de l'application.
 * Les tokens JWT sont stockés dans localStorage.
 * L'utilisateur courant est en mémoire (state React) + dans localStorage
 * pour survivre aux rechargements de page.
 */

import { createContext, useContext, useState, useEffect } from "react";
import {
  loginApi,
  logoutApi,
  register,
  updateMe,
} from "../utils/api";
import {
  setAuthTokens,
  clearAuthTokens,
  getStoredUser,
  setStoredUser,
} from "../utils/apiClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  /**
   * On initialise l'utilisateur depuis localStorage pour éviter un flash
   * "non connecté" au rechargement de page pendant le chargement.
   */
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(false);

  /**
   * Écouter l'événement global "auth:logout" déclenché par l'intercepteur axios
   * quand le refresh token est expiré ou invalide.
   * Cela permet de déconnecter l'utilisateur automatiquement.
   */
  useEffect(() => {
    const handleAutoLogout = () => {
      setCurrentUser(null);
      clearAuthTokens();
    };

    window.addEventListener("auth:logout", handleAutoLogout);
    return () => window.removeEventListener("auth:logout", handleAutoLogout);
  }, []);

  /**
   * login() — Connexion via email/password.
   * 1. Appelle POST /api/auth/login
   * 2. Sauvegarde les tokens dans localStorage
   * 3. Met à jour l'état React
   */
  async function login(email, password) {
    const response = await loginApi(email, password);
    // response = { accessToken, refreshToken, user }
    setAuthTokens(response.accessToken, response.refreshToken);
    setStoredUser(response.user);
    setCurrentUser(response.user);
    return response.user;
  }

  /**
   * logout() — Déconnexion.
   * 1. Appelle POST /api/auth/logout (invalide le refresh token en base)
   * 2. Nettoie le localStorage
   * 3. Réinitialise l'état React
   */
  async function logout() {
    await logoutApi();
    clearAuthTokens();
    setCurrentUser(null);
  }

  /**
   * signup() — Inscription + auto-connexion.
   * Le backend créé l'utilisateur ET retourne les tokens directement.
   */
  async function signup(data) {
    const response = await register(data);
    setAuthTokens(response.accessToken, response.refreshToken);
    setStoredUser(response.user);
    setCurrentUser(response.user);
    return response.user;
  }

  /**
   * updateProfile() — Modifier son profil.
   * Met à jour en base + met à jour l'état local pour un rendu immédiat.
   */
  async function updateProfile(updates) {
    if (!currentUser) return;
    const updatedUser = await updateMe(updates);
    // Fusionner les changements avec les données existantes
    const merged = { ...currentUser, ...updatedUser };
    setStoredUser(merged);
    setCurrentUser(merged);
    return merged;
  }

  return (
    <AuthContext.Provider
      value={{ currentUser, loading, login, logout, signup, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return ctx;
}

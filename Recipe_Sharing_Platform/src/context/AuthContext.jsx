import { createContext, useContext, useState, useEffect } from "react";
import {
  getCurrentUser,
  login as loginStorage,
  logout as logoutStorage,
  createUser,
  updateUser,
  updateCurrentUserSession,
} from "../utils/localStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    setLoading(false);
  }, []);

  function login(email, password) {
    const user = loginStorage(email, password);
    setCurrentUser(user);
    return user;
  }

  function logout() {
    logoutStorage();
    setCurrentUser(null);
  }

  function signup(data) {
    const user = createUser(data);
    // Auto-login après inscription
    const session = loginStorage(data.email, data.password);
    setCurrentUser(session);
    return session;
  }

  function updateProfile(updates) {
    if (!currentUser) return;
    const updated = updateUser(currentUser.id, updates);
    const session = updateCurrentUserSession(updates);
    setCurrentUser(session);
    return updated;
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

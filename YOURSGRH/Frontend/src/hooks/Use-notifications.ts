import { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { API_URL } from "../config/api";

type NotifContextType = {
  unreadCount: number;
  refresh: () => Promise<void>;
  decrement: (by?: number) => void;
  reset: () => void;
};

export const NotifContext = createContext<NotifContextType>({
  unreadCount: 0,
  refresh: async () => {},
  decrement: () => {},
  reset: () => {},
});

export function useUnreadCount() {
  return useContext(NotifContext);
}

// Hook interne utilisé uniquement dans NotifProvider
export function useNotifState() {
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/notification/non-lues`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data ?? res.data;
      setUnreadCount(Array.isArray(data) ? data.length : 0);
    } catch {
      // silencieux
    }
  }, []);

  // Décrémenter immédiatement (quand on marque une notif comme lue)
  const decrement = useCallback((by = 1) => {
    setUnreadCount((prev) => Math.max(0, prev - by));
  }, []);

  // Remettre à zéro (quand on marque tout comme lu)
  const reset = useCallback(() => setUnreadCount(0), []);

  useEffect(() => {
    refresh();
    // Polling toutes les 15s
    const interval = setInterval(refresh, 15000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { unreadCount, refresh, decrement, reset };
}

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { notificationService } from "../lib/mockService";

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
    try {
      const emp = (() => {
        try { return JSON.parse(localStorage.getItem("employee") || "null"); } catch { return null; }
      })();
      if (!emp?.userId) return;
      const nonLues = notificationService.getNonLues(emp.userId);
      setUnreadCount(nonLues.length);
    } catch {
      // silencieux
    }
  }, []);

  const decrement = useCallback((by = 1) => {
    setUnreadCount((prev) => Math.max(0, prev - by));
  }, []);

  const reset = useCallback(() => setUnreadCount(0), []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 15000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { unreadCount, refresh, decrement, reset };
}

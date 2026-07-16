import { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { API_URL } from "../config/api";

type CongesContextType = {
  pendingCount: number;
  refresh: () => Promise<void>;
  decrement: (by?: number) => void;
};

export const CongesContext = createContext<CongesContextType>({
  pendingCount: 0,
  refresh: async () => {},
  decrement: () => {},
});

export function useCongesPending() {
  return useContext(CongesContext);
}

export function useCongesPendingState() {
  const [pendingCount, setPendingCount] = useState(0);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    // Seulement pour les managers
    const emp = (() => {
      try { return JSON.parse(localStorage.getItem('employee') || 'null'); } catch { return null; }
    })();
    if (emp?.role !== 'MANAGER') return;

    try {
      const res = await axios.get(`${API_URL}/conge/mon-equipe`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: any[] = res.data ?? [];
      setPendingCount(data.filter((c) => c.statut === 'EN_ATTENTE').length);
    } catch { /* silencieux */ }
  }, []);

  const decrement = useCallback((by = 1) => {
    setPendingCount((prev) => Math.max(0, prev - by));
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 60000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { pendingCount, refresh, decrement };
}

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { congeService } from "../lib/mockService";

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
    try {
      const emp = (() => {
        try { return JSON.parse(localStorage.getItem("employee") || "null"); } catch { return null; }
      })();
      if (emp?.role?.nom !== "MANAGER" && emp?.role !== "MANAGER") return;

      const congesEquipe = congeService.getMonEquipe(emp.userId);
      setPendingCount(congesEquipe.filter((c: any) => c.statut === "EN_ATTENTE").length);
    } catch {
      // silencieux
    }
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

import { NotifContext, useNotifState } from "./Use-notifications";

// Provider à placer dans App.tsx pour partager le compteur dans toute l'app
export function NotifProvider({ children }: { children: React.ReactNode }) {
  const state = useNotifState();
  return (
    <NotifContext.Provider value={state}>
      {children}
    </NotifContext.Provider>
  );
}

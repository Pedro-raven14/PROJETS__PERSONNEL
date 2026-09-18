import { CongesContext, useCongesPendingState } from "./Use-conges-attente";

export function CongesProvider({ children }: { children: React.ReactNode }) {
  const state = useCongesPendingState();
  return (
    <CongesContext.Provider value={state}>
      {children}
    </CongesContext.Provider>
  );
}

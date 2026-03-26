import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

const STORAGE_KEY = "atelier-manager-selected-photographer";

export type ManagerSelectedId = "all" | string;

type ManagerContextValue = {
  selectedId: ManagerSelectedId;
  setSelectedId: (id: ManagerSelectedId) => void;
};

const ManagerContext = createContext<ManagerContextValue | null>(null);

function readStored(): ManagerSelectedId {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw === "all" || (raw && raw.startsWith("ph-"))) return raw;
  } catch {
    /* ignore */
  }
  return "all";
}

export function ManagerProvider({ children }: { children: ReactNode }) {
  const [selectedId, setSelectedIdState] = useState<ManagerSelectedId>(readStored);

  const setSelectedId = useCallback((id: ManagerSelectedId) => {
    setSelectedIdState(id);
    try {
      sessionStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({
      selectedId,
      setSelectedId,
    }),
    [selectedId, setSelectedId],
  );

  return <ManagerContext.Provider value={value}>{children}</ManagerContext.Provider>;
}

export function useManagerContext(): ManagerContextValue {
  const ctx = useContext(ManagerContext);
  if (!ctx) throw new Error("useManagerContext must be used within ManagerProvider");
  return ctx;
}

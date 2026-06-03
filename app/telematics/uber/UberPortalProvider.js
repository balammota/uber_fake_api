"use client";

import { createContext, useContext, useMemo, useState } from "react";

const UberPortalContext = createContext(null);

export function UberPortalProvider({ children }) {
  const [user, setUser] = useState(null);

  const value = useMemo(
    () => ({
      user,
      setUser,
      logout: () => setUser(null),
    }),
    [user]
  );

  return <UberPortalContext.Provider value={value}>{children}</UberPortalContext.Provider>;
}

export function useUberPortal() {
  const ctx = useContext(UberPortalContext);
  if (!ctx) throw new Error("useUberPortal must be used within UberPortalProvider");
  return ctx;
}

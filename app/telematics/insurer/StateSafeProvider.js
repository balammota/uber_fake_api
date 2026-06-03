"use client";

import { createContext, useContext, useMemo, useState } from "react";

const StateSafeContext = createContext(null);

export function StateSafeProvider({ children }) {
  const [user, setUser] = useState(null);

  const value = useMemo(
    () => ({
      user,
      setUser,
      logout: () => setUser(null),
    }),
    [user]
  );

  return <StateSafeContext.Provider value={value}>{children}</StateSafeContext.Provider>;
}

export function useStateSafe() {
  const ctx = useContext(StateSafeContext);
  if (!ctx) throw new Error("useStateSafe must be used within StateSafeProvider");
  return ctx;
}

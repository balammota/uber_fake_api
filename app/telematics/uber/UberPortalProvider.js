"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { UBER_PORTAL_USERS } from "@/lib/uber-portal-constants";
import { getInitialTourUser } from "@/lib/telematics-tour-steps";

const UberPortalContext = createContext(null);

export function UberPortalProvider({ children }) {
  const [user, setUser] = useState(() => getInitialTourUser("uber", UBER_PORTAL_USERS));

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

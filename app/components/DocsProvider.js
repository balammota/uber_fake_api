"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_DOC_SECTION,
  findParentLabels,
  sectionFromHash,
} from "@/lib/uber-docs-nav";

const DocsContext = createContext(null);

export function DocsProvider({ children }) {
  const [activeSection, setActiveSection] = useState(DEFAULT_DOC_SECTION);

  const navigate = useCallback((sectionId) => {
    setActiveSection(sectionId);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${sectionId}`);
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, []);

  useEffect(() => {
    const syncFromHash = () => {
      setActiveSection(sectionFromHash(window.location.hash));
      window.scrollTo(0, 0);
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  const value = useMemo(
    () => ({ activeSection, navigate }),
    [activeSection, navigate]
  );

  return <DocsContext.Provider value={value}>{children}</DocsContext.Provider>;
}

export function useDocsNav() {
  const ctx = useContext(DocsContext);
  if (!ctx) throw new Error("useDocsNav must be used within DocsProvider");
  return ctx;
}

export function DocsLink({ section, children, className = "underline" }) {
  const { navigate } = useDocsNav();
  return (
    <button
      type="button"
      onClick={() => navigate(section)}
      className={`cursor-pointer text-left ${className}`}
    >
      {children}
    </button>
  );
}

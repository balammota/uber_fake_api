"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDocsNav } from "@/app/components/DocsProvider";
import { DOCS_NAV, findParentLabels } from "@/lib/uber-docs-nav";

function Chevron({ open }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={`shrink-0 text-[#4B4B4B] transition-transform duration-200 ${
        open ? "rotate-180" : ""
      }`}
    >
      <path
        d="M22 6.9v3.8l-10 7.7-10-7.7V6.9l10 7.7 10-7.7Z"
        fill="currentColor"
      />
    </svg>
  );
}

function collectDefaultOpen(nav) {
  const set = new Set();
  nav.forEach((item) => {
    if (item.defaultOpen) set.add(item.label);
  });
  return set;
}

const navItemClass =
  "flex w-full items-center rounded-sm py-2 pr-2 text-left transition-colors hover:bg-[#F6F6F6]";

function NavLink({ section, label, activeSection, nested = false, onSelect }) {
  const isActive = activeSection === section;

  return (
    <button
      type="button"
      onClick={() => onSelect(section)}
      className={`${navItemClass} ${nested ? "pl-4" : "pl-2"} ${
        isActive ? "bg-[#F6F6F6] text-black" : "text-[#4B4B4B] hover:text-black"
      }`}
    >
      {label}
    </button>
  );
}

function NavGroup({ item, activeSection, openSections, onToggle, onSelect }) {
  const isOpen = openSections.has(item.label);

  return (
    <li>
      <button
        type="button"
        onClick={() => onToggle(item.label)}
        className={`${navItemClass} pl-2 text-[#4B4B4B] hover:text-black`}
        aria-expanded={isOpen}
      >
        <span>{item.label}</span>
        <Chevron open={isOpen} />
      </button>
      {isOpen && item.children && (
        <ul className="mb-1 ml-1 border-l border-[#E5E5E5] pl-2">
          {item.children.map((child) => (
            <li key={child.section}>
              <NavLink
                section={child.section}
                label={child.label}
                activeSection={activeSection}
                nested
                onSelect={onSelect}
              />
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export default function DocsSidebar({ onNavigate }) {
  const { activeSection, navigate } = useDocsNav();
  const [openSections, setOpenSections] = useState(() => collectDefaultOpen(DOCS_NAV));

  useEffect(() => {
    findParentLabels(DOCS_NAV, activeSection).forEach((label) => {
      setOpenSections((prev) => new Set(prev).add(label));
    });
  }, [activeSection]);

  const handleSelect = useCallback(
    (section) => {
      navigate(section);
      onNavigate?.();
    },
    [navigate, onNavigate]
  );

  const onToggle = useCallback((label) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }, []);

  const navItems = useMemo(() => DOCS_NAV, []);

  return (
    <nav role="navigation" aria-label="Documentation" className="docs-sidebar-nav">
      <ul role="list" className="space-y-0.5">
        {navItems.map((item) =>
          item.section ? (
            <li key={item.section}>
              <NavLink
                section={item.section}
                label={item.label}
                activeSection={activeSection}
                onSelect={handleSelect}
              />
            </li>
          ) : (
            <NavGroup
              key={item.label}
              item={item}
              activeSection={activeSection}
              openSections={openSections}
              onToggle={onToggle}
              onSelect={handleSelect}
            />
          )
        )}
      </ul>
    </nav>
  );
}

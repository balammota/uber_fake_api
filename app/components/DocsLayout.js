"use client";

import { useState } from "react";
import DocsContent from "@/app/components/DocsContent";
import { DocsProvider } from "@/app/components/DocsProvider";
import DocsSidebar from "@/app/components/DocsSidebar";
import DocsTopBar from "@/app/components/DocsTopBar";

export default function DocsLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <DocsProvider>
      <div className="min-h-screen bg-white text-black">
        <DocsTopBar
          menuOpen={mobileOpen}
          onMenuToggle={() => setMobileOpen((open) => !open)}
        />

        {mobileOpen && (
          <div className="docs-sidebar-nav fixed inset-x-0 top-[var(--docs-header-height)] z-40 max-h-[calc(100vh-var(--docs-header-height))] overflow-y-auto border-b border-[#E5E5E5] bg-white px-5 py-6 shadow-lg lg:hidden">
            <DocsSidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        )}

        <div className="mx-auto flex max-w-7xl pt-[var(--docs-header-height)]">
          <aside className="docs-sidebar-nav sticky top-[var(--docs-header-height)] hidden h-[calc(100vh-var(--docs-header-height))] w-56 shrink-0 overflow-y-auto px-4 py-10 lg:block xl:w-60">
            <DocsSidebar />
          </aside>

          <div className="min-w-0 flex-1">
            <DocsContent />
          </div>
        </div>
      </div>
    </DocsProvider>
  );
}

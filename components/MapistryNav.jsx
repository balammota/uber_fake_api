"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const MAPISTRY_API_KEY = "test-api-key-mapistry-123";

const NAV_LINKS = [
  { href: "/mapistry/docs", label: "Documentation" },
  { href: "/mapistry/dashboard", label: "Dashboard" },
  { href: "/mapistry/srm", label: "SRM Generator" },
  { href: "/mapistry/simulator", label: "Simulator" },
];

function LeafIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A6.47 6.47 0 0 0 8 20c10 0 12-8 12-12V4l-3 4z" />
    </svg>
  );
}

export default function MapistryNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-[#E5E7EB] bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/mapistry/docs"
          className="flex items-center gap-2 text-[#2D7A4F] transition-opacity hover:opacity-80"
        >
          <LeafIcon />
          <span className="text-lg font-bold tracking-tight text-[#2D7A4F]">
            Mapistry
          </span>
        </Link>

        <nav className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname?.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#E8F5EE] text-[#2D7A4F]"
                    : "text-[#6B7280] hover:bg-[#F7F8F5] hover:text-[#1A1A1A]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <span className="rounded-full border border-[#2D7A4F]/30 bg-[#E8F5EE] px-3 py-1.5 font-mono text-xs text-[#2D7A4F]">
          API Key: {MAPISTRY_API_KEY}
        </span>
      </div>
    </header>
  );
}

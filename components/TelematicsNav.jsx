"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/telematics/uber", label: "Uber Portal" },
  { href: "/telematics/insurer", label: "Insurer Portal" },
  { href: "/", label: "API Docs" },
];

export default function TelematicsNav({ title }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/telematics" className="text-lg font-bold text-white hover:opacity-90">
            {title || "Uber Telematics"}
          </Link>
          <nav className="flex flex-wrap gap-1">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded px-3 py-1.5 text-sm transition-colors ${
                  pathname === link.href
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <Link href="/telematics" className="text-sm text-zinc-400 hover:text-white">
          ← Back to platform
        </Link>
      </div>
    </header>
  );
}

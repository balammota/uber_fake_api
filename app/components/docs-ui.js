"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export const card =
  "rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#111111]";
export const cardBorder = "border-zinc-200 dark:border-zinc-800";
export const codeSurface = "bg-zinc-100 dark:bg-[#0a0a0a]";
export const textPrimary = "text-zinc-900 dark:text-zinc-50";
export const textSecondary = "text-zinc-600 dark:text-zinc-400";
export const textMuted = "text-zinc-500 dark:text-zinc-500";
export const textLabel = "text-zinc-600 dark:text-zinc-500";
export const textCode = "text-zinc-800 dark:text-zinc-300";
export const textAccent = "text-cyan-700 dark:text-cyan-400";
export const textAccentEmerald = "text-emerald-700 dark:text-emerald-400";

function applyTheme(theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem("theme", theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial =
      stored === "light" || stored === "dark"
        ? stored
        : prefersDark
          ? "dark"
          : "light";
    setTheme(initial);
    setMounted(true);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  }

  if (!mounted) {
    return (
      <div
        className={`h-9 w-[7.5rem] rounded-lg border ${cardBorder} bg-zinc-100 dark:bg-zinc-900`}
        aria-hidden
      />
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Activar modo claro" : "Activar modo oscuro"}
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${cardBorder} bg-zinc-100 text-zinc-700 hover:border-cyan-500/50 hover:text-cyan-600 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-cyan-400`}
    >
      {theme === "dark" ? "Claro" : "Oscuro"}
    </button>
  );
}

export function DocsNav({ active }) {
  const isMapistry =
    active === "mapistry" || active === "app" || active === "alerts";

  const linkClass = (name) =>
    name === active
      ? `font-medium ${isMapistry && name !== "uber" ? textAccentEmerald : textAccent}`
      : `${textSecondary} hover:text-zinc-900 dark:hover:text-zinc-50`;

  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <nav className="flex flex-wrap items-center gap-4 text-sm">
        <Link href="/" className={linkClass("uber")}>
          Uber Eats API
        </Link>
        <span className={textMuted}>|</span>
        <Link href="/mapistry/docs" className={linkClass("mapistry")}>
          Mapistry API
        </Link>
        <span className={textMuted}>|</span>
        <Link href="/mapistry/dashboard" className={linkClass("app")}>
          Dashboard
        </Link>
        <span className={textMuted}>|</span>
        <Link href="/mapistry/srm" className={linkClass("alerts")}>
          SRM Generator
        </Link>
      </nav>
      <ThemeToggle />
    </div>
  );
}

export function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`shrink-0 rounded-md border px-2.5 py-1 text-xs transition-colors ${cardBorder} bg-zinc-50 text-zinc-600 hover:border-cyan-500/50 hover:text-cyan-600 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-cyan-400`}
    >
      {copied ? "Copiado" : "Copiar"}
    </button>
  );
}

export function CodeBlock({ code, label }) {
  return (
    <div className="mt-3">
      {label && (
        <p
          className={`mb-1.5 text-xs font-medium uppercase tracking-wider ${textLabel}`}
        >
          {label}
        </p>
      )}
      <div className={`relative rounded-lg border ${cardBorder} ${codeSurface}`}>
        <div
          className={`flex items-center justify-between border-b px-3 py-2 ${cardBorder}`}
        >
          <span className={`font-mono text-xs ${textMuted}`}>json</span>
          <CopyButton text={code} />
        </div>
        <pre
          className={`overflow-x-auto p-4 font-mono text-xs leading-relaxed sm:text-sm ${textCode}`}
        >
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

export function MethodBadge({ method }) {
  const colors =
    method === "GET"
      ? "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-300"
      : method === "DELETE"
        ? "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-400"
        : "border-cyan-500/40 bg-cyan-500/10 text-cyan-700 dark:text-[#06B6D4]";

  return (
    <span
      className={`rounded border px-2 py-0.5 font-mono text-xs font-semibold ${colors}`}
    >
      {method}
    </span>
  );
}

export function InfoBanner({ children }) {
  return (
    <div
      className={`mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm ${textSecondary}`}
    >
      {children}
    </div>
  );
}

export function EndpointCard({ endpoint }) {
  return (
    <article className={`${card} p-5 sm:p-6`}>
      <div className="flex flex-wrap items-center gap-3">
        <MethodBadge method={endpoint.method} />
        <code className={`font-mono text-sm sm:text-base ${textPrimary}`}>
          {endpoint.path}
        </code>
      </div>
      <p className={`mt-3 text-sm ${textSecondary}`}>{endpoint.description}</p>
      {endpoint.header && (
        <div
          className={`mt-3 rounded-lg border px-3 py-2 ${cardBorder} ${codeSurface}`}
        >
          <p className={`text-xs ${textLabel}`}>
            Header:{" "}
            <span className={`font-mono ${textAccent}`}>{endpoint.header}</span>
          </p>
        </div>
      )}
      {endpoint.request && <CodeBlock code={endpoint.request} label="Request body" />}
      <CodeBlock code={endpoint.response} label="Response" />
      {endpoint.errors && <CodeBlock code={endpoint.errors} label="Error responses" />}
    </article>
  );
}

export function CredentialsCard({ title, code, copyText, accentClass = textAccent }) {
  return (
    <div className={card}>
      <div
        className={`flex items-center justify-between border-b px-4 py-3 ${cardBorder}`}
      >
        <span className={`font-mono text-xs font-medium ${accentClass}`}>{title}</span>
        <CopyButton text={copyText} />
      </div>
      <pre
        className={`overflow-x-auto p-4 font-mono text-sm leading-relaxed sm:p-6 ${textCode}`}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function DocsFooter({ text }) {
  return (
    <footer
      className={`mt-16 border-t pt-8 text-center text-xs text-zinc-500 dark:text-zinc-600 ${cardBorder}`}
    >
      {text}
    </footer>
  );
}

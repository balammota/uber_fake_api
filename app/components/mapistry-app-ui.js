"use client";

import Link from "next/link";
import { useState } from "react";

export const MAPISTRY_API_KEY = "test-api-key-mapistry-123";

export function getMapistryApiBase() {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/mapistry`;
  }
  return "https://uber-fake-api.vercel.app/api/mapistry";
}

export async function mapistryFetch(path, options = {}) {
  const base = getMapistryApiBase();
  const url = path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (options.auth !== false) {
    headers["x-api-key"] = MAPISTRY_API_KEY;
  }
  const res = await fetch(url, { ...options, headers });
  const retryAfter = res.headers.get("Retry-After");
  let body = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { message: text };
    }
  }
  return { res, body, retryAfter };
}

export function LeafIcon({ className = "h-6 w-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A6.47 6.47 0 0 0 8 20c10 0 12-8 12-12V4l-3 4z" />
    </svg>
  );
}

export function MapistryAppNav({ active = "sites" }) {
  const link = (section) =>
    `text-sm transition-colors ${
      active === section
        ? "font-medium text-emerald-400"
        : "text-zinc-400 hover:text-zinc-200"
    }`;

  return (
    <header className="border-b border-zinc-800 bg-[#0a0a0a]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-6">
          <Link href="/mapistry/app" className="flex items-center gap-2 text-emerald-400">
            <LeafIcon />
            <span className="text-lg font-semibold text-white">Mapistry</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-4">
            <span className={link("sites")}>Sites</span>
            <span className={link("logs")}>Logs</span>
            <span className={link("entries")}>Entries</span>
            <span className={link("units")}>Units</span>
          </nav>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 font-mono text-xs text-emerald-400">
            API Key: {MAPISTRY_API_KEY}
          </span>
          <Link
            href="/mapistry"
            className="text-sm text-zinc-400 hover:text-emerald-400"
          >
            API Docs
          </Link>
          <Link
            href="/mapistry/alerts"
            className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
          >
            View Alerts →
          </Link>
        </div>
      </div>
    </header>
  );
}

export function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-[#111111] p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-zinc-500">{sub}</p>}
    </div>
  );
}

export function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`rounded-lg border px-4 py-3 text-sm shadow-lg ${
            t.type === "success"
              ? "border-emerald-500/50 bg-emerald-950 text-emerald-200"
              : t.type === "warning"
                ? "border-amber-500/50 bg-amber-950 text-amber-200"
                : "border-red-500/50 bg-red-950 text-red-200"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <span>{t.message}</span>
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              className="text-zinc-400 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function useToasts() {
  const [toasts, setToasts] = useState([]);
  function addToast(message, type = "success") {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }
  function dismiss(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }
  return { toasts, addToast, dismiss };
}

export function LoadingBlock({ message = "Loading..." }) {
  return (
    <div className="flex items-center justify-center py-12 text-sm text-zinc-500">
      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      {message}
    </div>
  );
}

export function ErrorBlock({ message, onRetry }) {
  return (
    <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-center text-sm text-red-300">
      <p>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 text-emerald-400 hover:underline"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyBlock({ message }) {
  return (
    <div className="py-12 text-center text-sm text-zinc-500">{message}</div>
  );
}

export function statusColor(status) {
  if (status >= 500) return "text-red-400";
  if (status === 429) return "text-orange-400";
  if (status >= 400) return "text-yellow-400";
  return "text-emerald-400";
}

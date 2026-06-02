"use client";

import { useState } from "react";

export const MAPISTRY_API_KEY = "test-api-key-mapistry-123";
export const MAPISTRY_BASE_URL = "https://uber-fake-api.vercel.app/api/mapistry";

export function getMapistryApiBase() {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/mapistry`;
  }
  return MAPISTRY_BASE_URL;
}

export async function mapistryFetch(path, options = {}) {
  const base = getMapistryApiBase();
  const url = path.startsWith("http")
    ? path
    : `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (options.auth !== false) {
    headers["x-api-key"] = options.apiKey ?? MAPISTRY_API_KEY;
  }
  const start = performance.now();
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
  return {
    res,
    body,
    retryAfter,
    duration: Math.round(performance.now() - start),
  };
}

export function resolveLogId(siteId, logKey) {
  const siteNum = siteId.replace("site_", "");
  const logNum = String(logKey).replace("log_", "").split("_")[0];
  return `log_${siteNum}_${logNum}`;
}

export function emissionsFromCo2(co2) {
  const c = Number(co2) || 0;
  return {
    co2: c,
    nox: c * 0.0023,
    so2: c * 0.0015,
    pm10: c * 0.0089,
  };
}

export function complianceStatus(co2) {
  if (co2 > 800) return { label: "Exceeds Limit", emoji: "🔴", className: "text-red-600" };
  if (co2 > 600) return { label: "Near Limit", emoji: "🟡", className: "text-amber-600" };
  return { label: "Compliant", emoji: "🟢", className: "text-[#2D7A4F]" };
}

export function statusCodeClass(status) {
  if (status >= 200 && status < 300) return "text-[#2D7A4F]";
  if (status === 429) return "text-orange-600";
  if (status === 401) return "text-red-600";
  if (status >= 400) return "text-amber-600";
  return "text-[#6B7280]";
}

export function CopyButton({ text, className = "" }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`shrink-0 rounded-md border border-[#E5E7EB] bg-white px-2.5 py-1 text-xs font-medium text-[#6B7280] transition-colors hover:border-[#2D7A4F] hover:text-[#2D7A4F] ${className}`}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function MapistryCard({ children, className = "" }) {
  return (
    <div
      className={`rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

export function LoadingState({ message = "Loading..." }) {
  return (
    <div className="flex items-center justify-center py-16 text-sm text-[#6B7280]">
      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-[#2D7A4F] border-t-transparent" />
      {message}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
      <p>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 font-medium text-[#2D7A4F] hover:underline"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export function MethodBadge({ method }) {
  return (
    <span className="rounded border border-[#2D7A4F]/30 bg-[#E8F5EE] px-2 py-0.5 font-mono text-xs font-semibold text-[#2D7A4F]">
      {method}
    </span>
  );
}

export function DarkCodeBlock({ code, label }) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
        <span className="font-mono text-xs text-zinc-500">{label || "javascript"}</span>
        <CopyButton
          text={code}
          className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-[#2D7A4F] hover:text-[#2D7A4F]"
        />
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-zinc-300 sm:text-sm">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <header className="mb-8 border-b border-[#E5E7EB] pb-8">
      <h1 className="text-3xl font-bold tracking-tight text-[#1A1A1A] sm:text-4xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 max-w-2xl text-base text-[#6B7280]">{subtitle}</p>
      )}
      {children}
    </header>
  );
}

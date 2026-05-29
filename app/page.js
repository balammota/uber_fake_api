"use client";

import { useEffect, useState } from "react";

const BASE_URL = "https://uber-fake-api.vercel.app";

const CREDENTIALS = `client_id:     uber-partner
client_secret: secret123
grant_type:    client_credentials
base_url:      ${BASE_URL}`;

const QUICK_START = `const response = await fetch('${BASE_URL}/api/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    client_id: 'uber-partner',
    client_secret: 'secret123',
    grant_type: 'client_credentials'
  })
})
const { access_token } = await response.json()`;

const ENDPOINTS = [
  {
    method: "POST",
    path: "/api/oauth/token",
    description: "Exchange credentials for Bearer token",
    request: `{
  "client_id": "uber-partner",
  "client_secret": "secret123",
  "grant_type": "client_credentials"
}`,
    response: `{
  "access_token": "fake-token-xyz123",
  "expires_in": 2592000,
  "token_type": "Bearer"
}`,
  },
  {
    method: "GET",
    path: "/api/eats/stores",
    description: "Get all stores — requires Bearer token",
    header: "Authorization: Bearer fake-token-xyz123",
    response: `{
  "stores": [
    { "id": "store_1", "name": "Uber Eats CDMX Centro", "status": "active" },
    { "id": "store_2", "name": "Uber Eats Polanco", "status": "active" },
    { "id": "store_3", "name": "Uber Eats Condesa", "status": "inactive" }
  ]
}`,
  },
  {
    method: "GET",
    path: "/api/eats/stores/:store_id",
    description: "Get single store — requires Bearer token",
    header: "Authorization: Bearer fake-token-xyz123",
    response: `{
  "id": "store_1",
  "name": "Uber Eats CDMX Centro",
  "status": "active",
  "address": "Av. Juárez 123, CDMX",
  "rating": 4.8
}`,
  },
  {
    method: "POST",
    path: "/api/eats/stores/:store_id/orders",
    description: "Create order — requires Bearer token",
    header: "Authorization: Bearer fake-token-xyz123",
    request: `{
  "items": [{ "name": "Burger", "quantity": 2, "price": 150 }],
  "total": 300
}`,
    response: `{
  "order_id": "order_xyz789",
  "status": "received",
  "store_id": "store_1",
  "total": 300
}`,
  },
];

const card =
  "rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#111111]";
const cardBorder = "border-zinc-200 dark:border-zinc-800";
const codeSurface = "bg-zinc-100 dark:bg-[#0a0a0a]";

/* Texto: claro = oscuro legible, oscuro = claro legible */
const textPrimary = "text-zinc-900 dark:text-zinc-50";
const textSecondary = "text-zinc-600 dark:text-zinc-400";
const textMuted = "text-zinc-500 dark:text-zinc-500";
const textLabel = "text-zinc-600 dark:text-zinc-500";
const textCode = "text-zinc-800 dark:text-zinc-300";
const textAccent = "text-cyan-700 dark:text-cyan-400";
const textKey = "text-zinc-600 dark:text-zinc-500";

function applyTheme(theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem("theme", theme);
}

function ThemeToggle() {
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
      {theme === "dark" ? (
        <>
          <SunIcon />
          <span>Claro</span>
        </>
      ) : (
        <>
          <MoonIcon />
          <span>Oscuro</span>
        </>
      )}
    </button>
  );
}

function SunIcon() {
  return (
    <svg
      className="h-4 w-4 text-cyan-600 dark:text-cyan-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      className="h-4 w-4 text-cyan-600 dark:text-cyan-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  );
}

function CopyButton({ text }) {
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

function CodeBlock({ code, label }) {
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

function MethodBadge({ method }) {
  const colors =
    method === "GET"
      ? "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-300"
      : "border-cyan-500/40 bg-cyan-500/10 text-cyan-700 dark:text-[#06B6D4]";

  return (
    <span
      className={`rounded border px-2 py-0.5 font-mono text-xs font-semibold ${colors}`}
    >
      {method}
    </span>
  );
}

function EndpointCard({ endpoint }) {
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
    </article>
  );
}

function QuickStartCode() {
  return (
    <div className={`relative ${card}`}>
      <div
        className={`flex items-center justify-between border-b px-4 py-3 ${cardBorder}`}
      >
        <span className={`font-mono text-xs ${textMuted}`}>javascript</span>
        <CopyButton text={QUICK_START} />
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed sm:p-6 sm:text-sm">
        <code>
          <span className="text-violet-700 dark:text-zinc-500">const</span>{" "}
          <span className="text-zinc-800 dark:text-zinc-300">response</span>{" "}
          <span className="text-violet-700 dark:text-zinc-500">=</span>{" "}
          <span className="text-violet-700 dark:text-zinc-500">await</span>{" "}
          <span className="text-cyan-700 dark:text-cyan-400">fetch</span>
          <span className="text-zinc-600 dark:text-zinc-400">(</span>
          <span className="text-amber-800 dark:text-amber-200/90">
            &apos;{BASE_URL}/api/oauth/token&apos;
          </span>
          <span className="text-zinc-600 dark:text-zinc-400">, {"{"}</span>
          {"\n"}
          {"  "}
          <span className="text-zinc-800 dark:text-zinc-300">method</span>
          <span className="text-violet-700 dark:text-zinc-500">:</span>{" "}
          <span className="text-amber-800 dark:text-amber-200/90">&apos;POST&apos;</span>
          <span className="text-violet-700 dark:text-zinc-500">,</span>
          {"\n"}
          {"  "}
          <span className="text-zinc-800 dark:text-zinc-300">headers</span>
          <span className="text-violet-700 dark:text-zinc-500">: {"{"} </span>
          <span className="text-amber-800 dark:text-amber-200/90">
            &apos;Content-Type&apos;
          </span>
          <span className="text-violet-700 dark:text-zinc-500">:</span>{" "}
          <span className="text-amber-800 dark:text-amber-200/90">
            &apos;application/json&apos;
          </span>
          <span className="text-violet-700 dark:text-zinc-500"> {"}"},</span>
          {"\n"}
          {"  "}
          <span className="text-zinc-800 dark:text-zinc-300">body</span>
          <span className="text-violet-700 dark:text-zinc-500">:</span>{" "}
          <span className="text-cyan-700 dark:text-cyan-400">JSON.stringify</span>
          <span className="text-zinc-600 dark:text-zinc-400">({"{"}</span>
          {"\n"}
          {"    "}
          <span className="text-zinc-800 dark:text-zinc-300">client_id</span>
          <span className="text-violet-700 dark:text-zinc-500">:</span>{" "}
          <span className="text-amber-800 dark:text-amber-200/90">
            &apos;uber-partner&apos;
          </span>
          <span className="text-violet-700 dark:text-zinc-500">,</span>
          {"\n"}
          {"    "}
          <span className="text-zinc-800 dark:text-zinc-300">client_secret</span>
          <span className="text-violet-700 dark:text-zinc-500">:</span>{" "}
          <span className="text-amber-800 dark:text-amber-200/90">
            &apos;secret123&apos;
          </span>
          <span className="text-violet-700 dark:text-zinc-500">,</span>
          {"\n"}
          {"    "}
          <span className="text-zinc-800 dark:text-zinc-300">grant_type</span>
          <span className="text-violet-700 dark:text-zinc-500">:</span>{" "}
          <span className="text-amber-800 dark:text-amber-200/90">
            &apos;client_credentials&apos;
          </span>
          {"\n"}
          {"  "}
          <span className="text-zinc-600 dark:text-zinc-400">{"})"}</span>
          {"\n"}
          <span className="text-zinc-600 dark:text-zinc-400">{"})"}</span>
          {"\n"}
          <span className="text-violet-700 dark:text-zinc-500">const</span>{" "}
          <span className="text-zinc-600 dark:text-zinc-400">{"{ access_token }"}</span>{" "}
          <span className="text-violet-700 dark:text-zinc-500">=</span>{" "}
          <span className="text-violet-700 dark:text-zinc-500">await</span>{" "}
          <span className="text-zinc-800 dark:text-zinc-300">response</span>
          <span className="text-zinc-600 dark:text-zinc-400">.</span>
          <span className="text-cyan-700 dark:text-cyan-400">json</span>
          <span className="text-zinc-600 dark:text-zinc-400">()</span>
        </code>
      </pre>
    </div>
  );
}

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 transition-colors sm:px-6 sm:py-16 lg:py-20">
      <div className="mb-8 flex justify-end">
        <ThemeToggle />
      </div>

      <header className={`border-b pb-12 sm:pb-16 ${cardBorder}`}>
        <p className={`mb-3 font-mono text-xs uppercase tracking-widest ${textAccent}`}>
          API Sandbox
        </p>
        <h1
          className={`text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl ${textPrimary}`}
        >
          Uber Fake API
        </h1>
        <p className={`mt-4 max-w-2xl text-base sm:text-lg ${textSecondary}`}>
          Practice OAuth 2.0 integrations against a real API sandbox
        </p>
      </header>

      <section className="mt-12 sm:mt-16">
        <h2 className={`text-lg font-semibold sm:text-xl ${textPrimary}`}>
          Your Sandbox Credentials
        </h2>
        <p className={`mt-1 text-sm ${textSecondary}`}>
          Use these values in your integration tests
        </p>
        <div className={`relative mt-5 ${card}`}>
          <div
            className={`flex items-center justify-between border-b px-4 py-3 ${cardBorder}`}
          >
            <span className={`font-mono text-xs ${textMuted}`}>credentials</span>
            <CopyButton text={CREDENTIALS} />
          </div>
          <pre className={`overflow-x-auto p-4 font-mono text-sm leading-relaxed sm:p-6 ${textCode}`}>
            <code>
              <span className={textKey}>client_id:</span>{" "}
              <span className={textAccent}>uber-partner</span>
              {"\n"}
              <span className={textKey}>client_secret:</span>{" "}
              <span className={textAccent}>secret123</span>
              {"\n"}
              <span className={textKey}>grant_type:</span>{" "}
              <span className={textAccent}>client_credentials</span>
              {"\n"}
              <span className={textKey}>base_url:</span>{" "}
              <span className={textAccent}>{BASE_URL}</span>
            </code>
          </pre>
        </div>
      </section>

      <section className="mt-12 sm:mt-16">
        <h2 className={`text-lg font-semibold sm:text-xl ${textPrimary}`}>
          API Endpoints
        </h2>
        <p className={`mt-1 text-sm ${textSecondary}`}>
          Four routes — OAuth token, stores, store detail, and orders
        </p>
        <div className="mt-6 grid gap-5 lg:grid-cols-2 lg:gap-6">
          {ENDPOINTS.map((endpoint) => (
            <EndpointCard key={endpoint.path} endpoint={endpoint} />
          ))}
        </div>
      </section>

      <section className="mt-12 sm:mt-16">
        <h2 className={`text-lg font-semibold sm:text-xl ${textPrimary}`}>
          Quick Start
        </h2>
        <p className={`mt-1 text-sm ${textSecondary}`}>
          Fetch an access token in a few lines of JavaScript
        </p>
        <div className="mt-5">
          <QuickStartCode />
        </div>
      </section>

      <footer
        className={`mt-16 border-t pt-8 text-center text-xs text-zinc-500 dark:text-zinc-600 ${cardBorder}`}
      >
        Uber Fake API — for integration practice only. Not affiliated with Uber.
      </footer>
    </main>
  );
}

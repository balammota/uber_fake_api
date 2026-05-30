"use client";

import { useEffect, useState } from "react";

const BASE_URL = "https://uber-fake-api.vercel.app";

const SANDBOX_CREDENTIALS = `client_id:     uber-partner-sandbox
client_secret: sandbox-secret123
grant_type:    client_credentials
environment:   sandbox
base_url:      ${BASE_URL}`;

const PROD_CREDENTIALS = `client_id:     uber-partner-prod
client_secret: prod-secret456
grant_type:    client_credentials
environment:   production
base_url:      ${BASE_URL}`;

const LEGACY_CREDENTIALS = `client_id:     uber-partner
client_secret: secret123
grant_type:    client_credentials
(legacy — maps to sandbox)`;

const QUICK_START = `// 1. Get token (expires in 30 seconds)
const tokenRes = await fetch('${BASE_URL}/api/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    client_id: 'uber-partner-sandbox',
    client_secret: 'sandbox-secret123',
    grant_type: 'client_credentials'
  })
})
const { access_token, environment, expires_in } = await tokenRes.json()

// 2. Call protected endpoint (max 5 req/min)
const storesRes = await fetch('${BASE_URL}/api/eats/stores', {
  headers: { Authorization: \`Bearer \${access_token}\` }
})
const { stores } = await storesRes.json()`;

const EATS_ENDPOINTS = [
  {
    method: "GET",
    path: "/api/eats/stores",
    description: "Get all stores — requires valid Bearer token",
    header: "Authorization: Bearer {access_token}",
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
    description: "Get single store — requires valid Bearer token",
    header: "Authorization: Bearer {access_token}",
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
    description: "Create order — requires valid Bearer token",
    header: "Authorization: Bearer {access_token}",
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

const AUTH_ENDPOINT = {
  method: "POST",
  path: "/api/oauth/token",
  description:
    "Exchange credentials for Bearer token (unique per request, expires in 30s)",
  request: `{
  "client_id": "uber-partner-sandbox",
  "client_secret": "sandbox-secret123",
  "grant_type": "client_credentials"
}`,
  response: `{
  "access_token": "fake-token-1712345678901",
  "expires_in": 30,
  "token_type": "Bearer",
  "environment": "sandbox"
}`,
  errors: `401 token_expired — Token has expired, please request a new one
401 unauthorized — Invalid or missing Bearer token
429 rate_limit_exceeded — Too many requests (retry_after: 60)`,
};

const ADS_ENDPOINTS = [
  {
    method: "POST",
    path: "/api/ads/campaigns",
    description: "Create ads campaign — requires Bearer token",
    header: "Authorization: Bearer {access_token}",
    request: `{
  "name": "Summer Promo",
  "budget": 5000,
  "advertiserId": "adv_123",
  "startDate": "2026-06-01",
  "endDate": "2026-08-31"
}`,
    response: `{
  "campaign_id": "campaign_1712345678901",
  "name": "Summer Promo",
  "budget": 5000,
  "status": "active",
  "created_at": 1712345678901
}`,
  },
  {
    method: "GET",
    path: "/api/ads/campaigns",
    description: "List all campaigns in memory",
    header: "Authorization: Bearer {access_token}",
    response: `{
  "campaigns": [...],
  "total": 1
}`,
  },
  {
    method: "GET",
    path: "/api/ads/campaigns/:campaign_id",
    description: "Get single campaign",
    header: "Authorization: Bearer {access_token}",
    response: `{ "campaign_id": "campaign_...", "name": "...", ... }`,
  },
];

const WEBHOOK_ENDPOINTS = [
  {
    method: "POST",
    path: "/api/webhooks/orders",
    description: "Receive order webhook from Uber — no auth",
    request: `{
  "event": "order.created",
  "store_id": "store_1",
  "order_id": "order_xyz",
  "total": 300
}`,
    response: `{
  "received": true,
  "event": "order.created"
}`,
  },
  {
    method: "GET",
    path: "/api/webhooks/orders",
    description: "List all webhooks received in memory — no auth",
    response: `{
  "webhooks": [...],
  "total": 1
}`,
  },
];

const LOGS_ENDPOINT = {
  method: "GET",
  path: "/api/logs",
  description: "Last 50 API requests logged in memory — no auth",
  response: `{
  "logs": [
    {
      "timestamp": 1712345678901,
      "method": "GET",
      "endpoint": "/api/eats/stores",
      "status": 200,
      "token": "fake-token-1712345678901"
    }
  ],
  "total": 1
}`,
};

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

function InfoBanner({ children }) {
  return (
    <div
      className={`mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm ${textSecondary}`}
    >
      {children}
    </div>
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
      {endpoint.errors && <CodeBlock code={endpoint.errors} label="Error responses" />}
    </article>
  );
}

function CredentialsCard({ title, code, copyText }) {
  return (
    <div className={`${card}`}>
      <div
        className={`flex items-center justify-between border-b px-4 py-3 ${cardBorder}`}
      >
        <span className={`font-mono text-xs font-medium ${textAccent}`}>{title}</span>
        <CopyButton text={copyText} />
      </div>
      <pre className={`overflow-x-auto p-4 font-mono text-sm leading-relaxed sm:p-6 ${textCode}`}>
        <code>{code}</code>
      </pre>
    </div>
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
        <InfoBanner>
          <strong className={textPrimary}>Token expiration:</strong> tokens expire in{" "}
          <span className={textAccent}>30 seconds</span> (simulates 30 days in production).
          Request a new token when you receive{" "}
          <code className="font-mono text-xs">token_expired</code>.
        </InfoBanner>
        <InfoBanner>
          <strong className={textPrimary}>Rate limiting:</strong> max{" "}
          <span className={textAccent}>5 requests per minute</span> per token. Check{" "}
          <code className="font-mono text-xs">X-RateLimit-Remaining</code> on responses.
        </InfoBanner>
      </header>

      <section className="mt-12 sm:mt-16">
        <h2 className={`text-lg font-semibold sm:text-xl ${textPrimary}`}>
          Credentials — Sandbox vs Production
        </h2>
        <p className={`mt-1 text-sm ${textSecondary}`}>
          Two environments. Token response includes{" "}
          <code className="font-mono text-xs">environment</code>.
        </p>
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <CredentialsCard
            title="Sandbox"
            code={SANDBOX_CREDENTIALS}
            copyText={SANDBOX_CREDENTIALS}
          />
          <CredentialsCard
            title="Production"
            code={PROD_CREDENTIALS}
            copyText={PROD_CREDENTIALS}
          />
        </div>
        <div className="mt-4">
          <CredentialsCard
            title="Legacy (still supported)"
            code={LEGACY_CREDENTIALS}
            copyText={LEGACY_CREDENTIALS}
          />
        </div>
      </section>

      <section className="mt-12 sm:mt-16">
        <h2 className={`text-lg font-semibold sm:text-xl ${textPrimary}`}>
          OAuth
        </h2>
        <div className="mt-6">
          <EndpointCard endpoint={AUTH_ENDPOINT} />
        </div>
      </section>

      <section className="mt-12 sm:mt-16">
        <h2 className={`text-lg font-semibold sm:text-xl ${textPrimary}`}>
          Uber Eats
        </h2>
        <p className={`mt-1 text-sm ${textSecondary}`}>
          Stores and orders — protected endpoints
        </p>
        <div className="mt-6 grid gap-5 lg:grid-cols-2 lg:gap-6">
          {EATS_ENDPOINTS.map((endpoint) => (
            <EndpointCard key={endpoint.path} endpoint={endpoint} />
          ))}
        </div>
      </section>

      <section className="mt-12 sm:mt-16">
        <h2 className={`text-lg font-semibold sm:text-xl ${textPrimary}`}>
          Ads Campaigns
        </h2>
        <p className={`mt-1 text-sm ${textSecondary}`}>
          Create and list campaigns (in-memory). Minimum budget: 1000.
        </p>
        <div className="mt-6 grid gap-5 lg:grid-cols-2 lg:gap-6">
          {ADS_ENDPOINTS.map((endpoint) => (
            <EndpointCard key={endpoint.path} endpoint={endpoint} />
          ))}
        </div>
      </section>

      <section className="mt-12 sm:mt-16">
        <h2 className={`text-lg font-semibold sm:text-xl ${textPrimary}`}>
          Webhooks
        </h2>
        <p className={`mt-1 text-sm ${textSecondary}`}>
          Simulated Uber server callbacks — no authentication
        </p>
        <div className="mt-6 grid gap-5 lg:grid-cols-2 lg:gap-6">
          {WEBHOOK_ENDPOINTS.map((endpoint) => (
            <EndpointCard key={endpoint.path} endpoint={endpoint} />
          ))}
        </div>
      </section>

      <section className="mt-12 sm:mt-16">
        <h2 className={`text-lg font-semibold sm:text-xl ${textPrimary}`}>
          Request Logs
        </h2>
        <p className={`mt-1 text-sm ${textSecondary}`}>
          Every API call is logged in memory
        </p>
        <div className="mt-6">
          <EndpointCard endpoint={LOGS_ENDPOINT} />
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

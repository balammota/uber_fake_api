"use client";

import Link from "next/link";
import {
  card,
  cardBorder,
  CopyButton,
  CredentialsCard,
  DocsFooter,
  DocsNav,
  EndpointCard,
  InfoBanner,
  textAccent,
  textCode,
  textMuted,
  textPrimary,
  textSecondary,
} from "@/app/components/docs-ui";

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

function QuickStartCode() {
  return (
    <div className={`relative ${card}`}>
      <div
        className={`flex items-center justify-between border-b px-4 py-3 ${cardBorder}`}
      >
        <span className={`font-mono text-xs ${textMuted}`}>javascript</span>
        <CopyButton text={QUICK_START} />
      </div>
      <pre
        className={`overflow-x-auto p-4 font-mono text-xs leading-relaxed sm:p-6 sm:text-sm ${textCode}`}
      >
        <code>{QUICK_START}</code>
      </pre>
    </div>
  );
}

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 transition-colors sm:px-6 sm:py-16 lg:py-20">
      <DocsNav active="uber" />

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

      <section className="mt-8">
        <Link
          href="/mapistry"
          className={`block rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 transition-colors hover:border-emerald-500/50 sm:p-6`}
        >
          <p className="font-mono text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Also available
          </p>
          <p className={`mt-2 text-lg font-semibold ${textPrimary}`}>
            Mapistry Environmental API →
          </p>
          <p className={`mt-1 text-sm ${textSecondary}`}>
            API Key auth, SRM Concrete sites, compliance logs & entries
          </p>
        </Link>
      </section>

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
        <h2 className={`text-lg font-semibold sm:text-xl ${textPrimary}`}>OAuth</h2>
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

      <DocsFooter text="Uber Fake API — for integration practice only. Not affiliated with Uber." />
    </main>
  );
}

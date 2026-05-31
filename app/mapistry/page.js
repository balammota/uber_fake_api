"use client";

import {
  card,
  cardBorder,
  CodeBlock,
  CopyButton,
  CredentialsCard,
  DocsFooter,
  DocsNav,
  EndpointCard,
  InfoBanner,
  textAccentEmerald,
  textCode,
  textMuted,
  textPrimary,
  textSecondary,
} from "@/app/components/docs-ui";

const BASE_URL = "https://uber-fake-api.vercel.app";
const MAPISTRY_BASE = `${BASE_URL}/api/mapistry`;

const MAPISTRY_CREDENTIALS = `x-api-key:  test-api-key-mapistry-123
base_url:   ${MAPISTRY_BASE}`;

const MAPISTRY_QUICK_START = `const response = await fetch('${MAPISTRY_BASE}/sites', {
  headers: {
    'x-api-key': 'test-api-key-mapistry-123'
  }
})
const data = await response.json()
console.log(data.data)`;

const MAPISTRY_ENDPOINTS = [
  {
    method: "GET",
    path: "/api/mapistry/ping",
    description: "Health check — no authentication",
    response: `{ "message": "pong", "timestamp": 1712345678901 }`,
  },
  {
    method: "GET",
    path: "/api/mapistry/sites",
    description: "List SRM Concrete sites — paginated (page[size], page[after])",
    header: "x-api-key: test-api-key-mapistry-123",
    response: `{
  "data": [{ "id": "site_1", "name": "SRM Concrete - CDMX Plant 1", ... }],
  "meta": { "page": { "nextCursor": null, "totalCount": 10 } }
}`,
  },
  {
    method: "GET",
    path: "/api/mapistry/sites/:siteId",
    description: "Get single site",
    header: "x-api-key: test-api-key-mapistry-123",
    response: `{ "id": "site_1", "name": "SRM Concrete - CDMX Plant 1", "state": "Mexico City", ... }`,
  },
  {
    method: "GET",
    path: "/api/mapistry/sites/:siteId/tags",
    description: "Site tags (Region, Type)",
    header: "x-api-key: test-api-key-mapistry-123",
    response: `{
  "data": [
    { "label": "Region", "value": "North America", "siteId": "site_1" },
    { "label": "Type", "value": "Concrete Plant", "siteId": "site_1" }
  ]
}`,
  },
  {
    method: "GET",
    path: "/api/mapistry/sites/:siteId/users",
    description: "Site users",
    header: "x-api-key: test-api-key-mapistry-123",
    response: `{
  "data": [
    { "id": "user_1", "name": "John Inspector", "email": "john@srm.com", "jobTitle": "Environmental Inspector" }
  ]
}`,
  },
  {
    method: "GET",
    path: "/api/mapistry/edp/sites/:siteId/logs",
    description: "Environmental compliance logs for a site (5 per site)",
    header: "x-api-key: test-api-key-mapistry-123",
    response: `{
  "data": [{ "id": "log_1_1", "siteId": "site_1", "name": "Daily Emissions Log", "fields": [...] }],
  "meta": { "page": { "nextCursor": null, "totalCount": 5 } }
}`,
  },
  {
    method: "GET",
    path: "/api/mapistry/edp/sites/:siteId/logs/:logId",
    description: "Single log with field definitions",
    header: "x-api-key: test-api-key-mapistry-123",
    response: `{ "id": "log_1_1", "name": "Daily Emissions Log", "category": "emissions", "fields": [...] }`,
  },
  {
    method: "GET",
    path: "/api/mapistry/edp/sites/:siteId/logs/:logId/entries",
    description: "Log entries — paginated (20 per log)",
    header: "x-api-key: test-api-key-mapistry-123",
    response: `{
  "data": [{ "id": "entry_1_1_1", "logDate": "2025-01-01T08:00", "fieldValues": {...} }],
  "meta": { "page": { "nextCursor": "10", "totalCount": 20 } }
}`,
  },
  {
    method: "POST",
    path: "/api/mapistry/edp/sites/:siteId/logs/:logId/entries",
    description: "Create log entry",
    header: "x-api-key: test-api-key-mapistry-123",
    request: `{
  "logDate": "2025-01-01T08:00",
  "isComplete": true,
  "fieldValues": {
    "field_1": { "value": 450, "units": "kg" },
    "field_2": { "value": "2025-01-01" }
  }
}`,
    response: `{
  "id": "entry_1712345678901",
  "siteId": "site_1",
  "logId": "log_1_1",
  "logDate": "2025-01-01T08:00",
  "isComplete": true,
  "fieldValues": { ... },
  "createdAt": "2025-01-01T08:00:00.000Z"
}`,
  },
  {
    method: "GET",
    path: "/api/mapistry/edp/sites/:siteId/logs/:logId/entries/:entryId",
    description: "Get single log entry",
    header: "x-api-key: test-api-key-mapistry-123",
    response: `{ "id": "entry_1_1_1", "siteId": "site_1", "fieldValues": { ... } }`,
  },
  {
    method: "DELETE",
    path: "/api/mapistry/edp/sites/:siteId/logs/:logId/entries/:entryId",
    description: "Delete log entry — returns 204 No Content",
    header: "x-api-key: test-api-key-mapistry-123",
    response: "(empty body, status 204)",
  },
  {
    method: "GET",
    path: "/api/mapistry/edp/related-units",
    description: "Measurement units (kg, L, ppm, etc.)",
    header: "x-api-key: test-api-key-mapistry-123",
    response: `{
  "data": [
    { "id": "kg", "name": "Kilograms" },
    { "id": "ppm", "name": "Parts Per Million" }
  ]
}`,
  },
];

function QuickStartCode() {
  return (
    <div className={`relative ${card}`}>
      <div
        className={`flex items-center justify-between border-b px-4 py-3 ${cardBorder}`}
      >
        <span className={`font-mono text-xs ${textMuted}`}>javascript</span>
        <CopyButton text={MAPISTRY_QUICK_START} />
      </div>
      <pre
        className={`overflow-x-auto p-4 font-mono text-xs leading-relaxed sm:p-6 sm:text-sm ${textCode}`}
      >
        <code>{MAPISTRY_QUICK_START}</code>
      </pre>
    </div>
  );
}

export default function MapistryPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 transition-colors sm:px-6 sm:py-16 lg:py-20">
      <DocsNav active="mapistry" />

      <header className={`border-b pb-12 sm:pb-16 ${cardBorder}`}>
        <p
          className={`mb-3 font-mono text-xs uppercase tracking-widest ${textAccentEmerald}`}
        >
          Environmental API
        </p>
        <h1
          className={`text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl ${textPrimary}`}
        >
          Mapistry Environmental API
        </h1>
        <p className={`mt-4 max-w-2xl text-base sm:text-lg ${textSecondary}`}>
          Practice API Key authentication and environmental data integrations
        </p>
        <InfoBanner>
          <strong className={textPrimary}>Authentication:</strong> use header{" "}
          <code className="font-mono text-xs">x-api-key</code>, not Bearer tokens.
        </InfoBanner>
        <InfoBanner>
          <strong className={textPrimary}>Rate limiting:</strong> max{" "}
          <span className={textAccentEmerald}>100 requests per minute</span> per API
          key. Check <code className="font-mono text-xs">X-RateLimit-Remaining</code>.
        </InfoBanner>
        <InfoBanner>
          <strong className={textPrimary}>Seed data:</strong> 10 SRM Concrete sites, 5
          logs per site, 20 entries per log (in memory).
        </InfoBanner>
      </header>

      <section className="mt-12 sm:mt-16">
        <h2 className={`text-lg font-semibold sm:text-xl ${textPrimary}`}>
          Credentials
        </h2>
        <div className="mt-5">
          <CredentialsCard
            title="API Key"
            code={MAPISTRY_CREDENTIALS}
            copyText={MAPISTRY_CREDENTIALS}
            accentClass={textAccentEmerald}
          />
        </div>
      </section>

      <section className="mt-12 sm:mt-16">
        <h2 className={`text-lg font-semibold sm:text-xl ${textPrimary}`}>
          Endpoints
        </h2>
        <p className={`mt-1 text-sm ${textSecondary}`}>
          Sites, environmental logs, entries, and related units
        </p>
        <div className="mt-6 grid gap-5 lg:grid-cols-2 lg:gap-6">
          {MAPISTRY_ENDPOINTS.map((endpoint) => (
            <EndpointCard key={endpoint.path} endpoint={endpoint} />
          ))}
        </div>
      </section>

      <section className="mt-12 sm:mt-16">
        <h2 className={`text-lg font-semibold sm:text-xl ${textPrimary}`}>
          Quick Start
        </h2>
        <p className={`mt-1 text-sm ${textSecondary}`}>
          List sites with your API key
        </p>
        <div className="mt-5">
          <QuickStartCode />
        </div>
      </section>

      <DocsFooter text="Mapistry API simulation — for integration practice only." />
    </main>
  );
}

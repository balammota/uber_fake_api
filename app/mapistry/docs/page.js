"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CopyButton,
  DarkCodeBlock,
  MapistryCard,
  MethodBadge,
  MAPISTRY_API_KEY,
  MAPISTRY_BASE_URL,
  PageHeader,
} from "@/app/components/mapistry-ui";

const QUICK_START = `const response = await fetch(
  '${MAPISTRY_BASE_URL}/sites',
  { headers: { 'x-api-key': '${MAPISTRY_API_KEY}' } }
)
const { data } = await response.json()`;

const ENDPOINTS = [
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
    header: "x-api-key",
    response: `{
  "data": [{ "id": "site_1", "name": "SRM Concrete - CDMX Plant 1", ... }],
  "meta": { "page": { "nextCursor": null, "totalCount": 10 } }
}`,
  },
  {
    method: "GET",
    path: "/api/mapistry/sites/stats",
    description: "Aggregate stats — sites, logs, entries, avg CO₂",
    header: "x-api-key",
    response: `{
  "totalSites": 10,
  "activeLogs": 50,
  "totalEntries": 1000,
  "avgCO2": 445.2
}`,
  },
  {
    method: "GET",
    path: "/api/mapistry/sites/:siteId",
    description: "Get single site",
    header: "x-api-key",
    response: `{ "id": "site_1", "name": "SRM Concrete - CDMX Plant 1", "state": "Mexico City" }`,
  },
  {
    method: "GET",
    path: "/api/mapistry/edp/sites/:siteId/logs",
    description: "Environmental compliance logs for a site (5 per site)",
    header: "x-api-key",
    response: `{ "data": [{ "id": "log_1_1", "name": "Daily Emissions Log", ... }] }`,
  },
  {
    method: "GET",
    path: "/api/mapistry/edp/sites/:siteId/logs/:logId/entries",
    description: "Log entries — paginated (20 per log)",
    header: "x-api-key",
    response: `{ "data": [{ "id": "entry_1_1_1", "logDate": "2025-01-01T08:00", ... }] }`,
  },
  {
    method: "POST",
    path: "/api/mapistry/edp/sites/:siteId/logs/:logId/entries",
    description: "Create log entry",
    header: "x-api-key",
    request: `{
  "logDate": "2025-01-01T08:00",
  "isComplete": true,
  "fieldValues": {
    "field_1": { "value": 450, "units": "kg" },
    "field_2": { "value": "2025-01-01" }
  }
}`,
    response: `{ "id": "entry_...", "siteId": "site_1", "logId": "log_1_1", ... }`,
  },
  {
    method: "DELETE",
    path: "/api/mapistry/edp/sites/:siteId/logs/:logId/entries/:entryId",
    description: "Delete log entry — returns 204 No Content",
    header: "x-api-key",
    response: "(empty body, status 204)",
  },
  {
    method: "GET",
    path: "/api/mapistry/edp/related-units",
    description: "Measurement units (kg, L, ppm, etc.)",
    header: "x-api-key",
    response: `{ "data": [{ "id": "kg", "name": "Kilograms" }] }`,
  },
];

function EndpointDocCard({ endpoint }) {
  const [open, setOpen] = useState(false);

  return (
    <MapistryCard className="!p-0 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full flex-wrap items-center gap-3 p-5 text-left transition-colors hover:bg-[#F7F8F5] sm:p-6"
      >
        <MethodBadge method={endpoint.method} />
        <code className="flex-1 font-mono text-sm text-[#1A1A1A]">{endpoint.path}</code>
        <span className="text-xs text-[#6B7280]">{open ? "Hide" : "Examples"}</span>
      </button>
      <div className="border-t border-[#E5E7EB] px-5 pb-5 pt-3 sm:px-6">
        <p className="text-sm text-[#6B7280]">{endpoint.description}</p>
        {endpoint.header && (
          <p className="mt-2 text-xs text-[#6B7280]">
            Header: <span className="font-mono text-[#2D7A4F]">{endpoint.header}</span>
          </p>
        )}
        {open && (
          <div className="mt-4 space-y-3">
            {endpoint.request && (
              <pre className="overflow-x-auto rounded-lg bg-[#F7F8F5] p-4 font-mono text-xs text-[#1A1A1A]">
                {endpoint.request}
              </pre>
            )}
            <pre className="overflow-x-auto rounded-lg bg-[#F7F8F5] p-4 font-mono text-xs text-[#1A1A1A]">
              {endpoint.response}
            </pre>
          </div>
        )}
      </div>
    </MapistryCard>
  );
}

export default function MapistryDocsPage() {
  return (
    <main className="mx-auto max-w-5xl bg-white px-4 py-10 sm:px-6 sm:py-12 lg:py-14">
      <PageHeader
        title="Mapistry API Documentation"
        subtitle="Integrate environmental data from your industrial facilities"
      >
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/mapistry/dashboard"
            className="rounded-lg bg-[#2D7A4F] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#256b44]"
          >
            Get Started
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-[#E5E7EB] bg-white px-5 py-2.5 text-sm font-semibold text-[#1A1A1A] transition-colors hover:border-[#2D7A4F] hover:text-[#2D7A4F]"
          >
            View on GitHub
          </a>
        </div>
      </PageHeader>

      <section className="mb-12">
        <MapistryCard className="border-[#2D7A4F]/20 bg-[#E8F5EE]">
          <h2 className="text-lg font-bold text-[#1A1A1A]">Your API Credentials</h2>
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white px-4 py-3">
              <span className="font-mono text-sm text-[#1A1A1A]">
                x-api-key: <span className="text-[#2D7A4F]">{MAPISTRY_API_KEY}</span>
              </span>
              <CopyButton text={MAPISTRY_API_KEY} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white px-4 py-3">
              <span className="break-all font-mono text-sm text-[#1A1A1A]">
                base_url: {MAPISTRY_BASE_URL}
              </span>
              <CopyButton text={MAPISTRY_BASE_URL} />
            </div>
          </div>
        </MapistryCard>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-bold tracking-tight text-[#1A1A1A]">Endpoints</h2>
        <p className="mt-1 text-sm text-[#6B7280]">
          Sites, environmental logs, entries, and related units
        </p>
        <div className="mt-6 space-y-4">
          {ENDPOINTS.map((ep) => (
            <EndpointDocCard key={ep.path + ep.method} endpoint={ep} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold tracking-tight text-[#1A1A1A]">Quick Start</h2>
        <p className="mt-1 text-sm text-[#6B7280]">List sites with your API key</p>
        <div className="mt-5">
          <DarkCodeBlock code={QUICK_START} />
        </div>
      </section>

      <footer className="mt-16 border-t border-[#E5E7EB] pt-8 text-center text-xs text-[#6B7280]">
        Mapistry API simulation — for integration practice only.
      </footer>
    </main>
  );
}

"use client";

import { TelematicsCard, TelematicsStatCard, TelematicsTable } from "@/app/components/telematics-ui";

const COMPETITORS = [
  {
    provider: "Uber Telematics API",
    source: "Uber trips (CMT)",
    coverage: "5M+ drivers USA",
    freshness: "Daily",
    api: "✅ Yes — this API",
  },
  {
    provider: "Cambridge Mobile Telematics",
    source: "Multiple apps",
    coverage: "Limited",
    freshness: "Daily",
    api: "✅ Yes",
  },
  {
    provider: "DataVault Risk",
    source: "DMV + claims data",
    coverage: "Broad",
    freshness: "Monthly",
    api: "✅ Yes",
  },
  {
    provider: "Cascade Snapshot",
    source: "Own device/app",
    coverage: "Cascade only",
    freshness: "Real-time",
    api: "❌ Internal only",
  },
  {
    provider: "Sprout App",
    source: "Own app",
    coverage: "Sprout only",
    freshness: "Real-time",
    api: "❌ Internal only",
  },
];

const ADVANTAGES = [
  {
    title: "Volume",
    body: "5M+ active drivers — more than any telematics provider",
  },
  {
    title: "Quality",
    body: "8-12 hours/day driving — 10x more data than commuter apps",
  },
  {
    title: "Verified",
    body: "All drivers background-checked and identity-verified",
  },
  {
    title: "No friction",
    body: "No additional app or device — data already collected",
  },
];

export default function MarketAnalyticsTab() {
  const competitorRows = COMPETITORS.map((c) => ({
    key: c.provider,
    cells: [c.provider, c.source, c.coverage, c.freshness, c.api],
  }));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Market Analytics</h2>
        <p className="mt-2 text-zinc-500">UBI market opportunity and competitive positioning</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TelematicsStatCard label="Total UBI Market 2025" value="$62.6B" />
        <TelematicsStatCard label="Projected 2035" value="$567B" />
        <TelematicsStatCard label="CAGR" value="24.8%" />
        <TelematicsStatCard label="Uber's Current Share" value="<0.1%" />
      </div>

      <TelematicsCard title="How Uber Telematics API compares">
        <TelematicsTable
          columns={["Provider", "Data Source", "Coverage", "Freshness", "API Available"]}
          rows={competitorRows}
        />
      </TelematicsCard>

      <section>
        <h3 className="mb-4 text-lg font-semibold text-white">Why Uber data is unique</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {ADVANTAGES.map((a) => (
            <article
              key={a.title}
              className="rounded-lg border border-[#222222] bg-[#111111] p-5"
            >
              <h4 className="font-bold text-white">{a.title}</h4>
              <p className="mt-2 text-sm text-zinc-400">{a.body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

"use client";

import { useMemo } from "react";
import { formatUsd } from "@/lib/telematics-utils";
import { partnerDisplayName } from "@/lib/uber-portal-constants";
import { TelematicsCard, TelematicsStatCard, TelematicsTable } from "@/app/components/telematics-ui";

const PRICING = [
  { tier: "Starter", drivers: "1-100", price: "$5.00", features: "Score + Events" },
  { tier: "Growth", drivers: "101-1000", price: "$4.00", features: "Score + Events + Fleet" },
  { tier: "Enterprise", drivers: "1000+", price: "$3.00", features: "Full access + SLA" },
];

export default function RevenueTab({ partners }) {
  const active = partners.filter((p) => p.status === "active");

  const mrr = useMemo(
    () => active.reduce((a, p) => a + (p.drivers_connected || 0) * 5, 0),
    [active]
  );

  const totalRevenue = useMemo(
    () => active.reduce((a, p) => a + Number(p.revenue_usd || 0), 0),
    [active]
  );

  const avgPerPartner = active.length ? totalRevenue / active.length : 0;
  const arr = mrr * 12;

  const partnerRows = active.map((p) => ({
    key: p.partner_id,
    cells: [
      partnerDisplayName(p.partner_id, p.partner_name),
      p.drivers_connected,
      formatUsd((p.drivers_connected || 0) * 5) + "/mo",
      formatUsd(Number(p.revenue_usd)),
      p.created_at ? new Date(p.created_at).toLocaleDateString() : "—",
      "+12%",
    ],
  }));

  const projections = [
    { label: "Month 1", value: mrr, mult: 1 },
    { label: "Month 3", value: mrr * 1.44, mult: 1.44 },
    { label: "Month 6", value: mrr * 2.49, mult: 2.49 },
    { label: "Month 12", value: mrr * 7.43, mult: 7.43 },
  ];
  const maxProj = Math.max(...projections.map((p) => p.value), 1);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Revenue & Growth</h2>
        <p className="mt-2 text-zinc-500">Partner revenue metrics and projections</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TelematicsStatCard label="MRR" value={`${formatUsd(mrr)}/mo`} />
        <TelematicsStatCard label="Total Revenue to Date" value={formatUsd(totalRevenue)} />
        <TelematicsStatCard label="Revenue per Partner" value={formatUsd(avgPerPartner)} />
        <TelematicsStatCard label="Projected ARR" value={formatUsd(arr)} />
      </div>

      <TelematicsCard title="Revenue by Partner">
        <TelematicsTable
          columns={["Partner", "Drivers", "MRR", "Total Revenue", "Since", "Growth"]}
          rows={partnerRows}
          emptyMessage="No active partners"
        />
      </TelematicsCard>

      <TelematicsCard title="12-Month Revenue Projection">
        <p className="mb-4 text-sm text-zinc-500">Assuming 20% MoM growth from current MRR</p>
        <div className="space-y-4">
          {projections.map((p) => (
            <div key={p.label}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-zinc-400">{p.label}</span>
                <span className="font-medium text-white">{formatUsd(p.value)}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-white"
                  style={{ width: `${Math.max(8, (p.value / maxProj) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </TelematicsCard>

      <TelematicsCard title="Current Pricing">
        <TelematicsTable
          columns={["Tier", "Drivers", "Price per Driver/Month", "Features"]}
          rows={PRICING.map((r) => ({
            key: r.tier,
            cells: [r.tier, r.drivers, r.price, r.features],
          }))}
        />
      </TelematicsCard>
    </div>
  );
}

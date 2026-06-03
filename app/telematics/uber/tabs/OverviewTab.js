"use client";

import { formatUsd } from "@/lib/telematics-utils";
import { partnerDisplayName } from "@/lib/uber-portal-constants";
import {
  countPartnerHealthIssues,
  openAlertsCount,
  overviewAlertsFeed,
} from "@/lib/uber-portal-utils";
import { AlertFeedCard } from "@/app/components/uber-portal-ui";
import { TelematicsStatCard, TelematicsCard } from "@/app/components/telematics-ui";

export default function OverviewTab({ user, partners, drivers, logs, alerts, systemMetrics }) {
  const feed = overviewAlertsFeed(alerts);
  const activePartners = partners.filter((p) => p.status === "active").length;
  const consented = drivers.filter((d) => d.consent_status === "active").length;
  const revenue = partners.reduce((a, p) => a + Number(p.revenue_usd || 0), 0);

  let statCards = [];
  if (user.id === "alejandro") {
    statCards = [
      { label: "Active Partners", value: activePartners },
      { label: "Consented Drivers", value: consented },
      { label: "Partner Health Issues", value: countPartnerHealthIssues(partners, logs) },
      { label: "Open Alerts", value: openAlertsCount(alerts) },
    ];
  } else if (user.id === "aashish") {
    statCards = [
      { label: "API Uptime", value: "99.94%" },
      { label: "Avg Latency", value: "142ms" },
      { label: "Error Rate", value: `${systemMetrics.errorRate}%` },
      { label: "CMT Pipeline", value: "Live — last sync 4 min ago" },
    ];
  } else {
    statCards = [
      { label: "Total Revenue", value: formatUsd(revenue) },
      { label: "Active Partners", value: activePartners },
      { label: "MoM Growth", value: "+23%" },
      { label: "Pipeline Value", value: "$847,000" },
    ];
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((c) => (
          <TelematicsStatCard key={c.label} label={c.label} value={c.value} />
        ))}
      </div>

      <TelematicsCard title="Recent Alerts">
        {feed.length === 0 ? (
          <p className="text-sm text-zinc-500">No recent alerts — all systems nominal</p>
        ) : (
          <div className="space-y-3">
            {feed.map((a) => (
              <AlertFeedCard key={a.id} alert={a} />
            ))}
          </div>
        )}
      </TelematicsCard>

      {user.id === "maya" && (
        <TelematicsCard title="Active Partner Snapshot">
          <ul className="space-y-2 text-sm text-zinc-400">
            {partners
              .filter((p) => p.status === "active")
              .map((p) => (
                <li key={p.partner_id} className="flex justify-between border-b border-zinc-800 py-2 last:border-0">
                  <span className="text-white">{partnerDisplayName(p.partner_id, p.partner_name)}</span>
                  <span>{formatUsd(Number(p.revenue_usd))} revenue</span>
                </li>
              ))}
          </ul>
        </TelematicsCard>
      )}
    </div>
  );
}

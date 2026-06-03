"use client";

import { useMemo, useState } from "react";
import { formatTime, formatUsd } from "@/lib/telematics-utils";
import { partnerDisplayName, UBER_PORTAL_DAILY_LIMIT } from "@/lib/uber-portal-constants";
import { statusCodeClass } from "@/lib/telematics-utils";
import { formatWebhookActivity } from "@/lib/statesafe-utils";
import {
  UberSelect,
  UberSecondaryButton,
} from "@/app/components/uber-portal-ui";
import { Badge, TelematicsCard, TelematicsStatCard, TelematicsTable } from "@/app/components/telematics-ui";

const CHECKLIST = [
  { id: "token", label: "Token valid and not expired" },
  { id: "consent", label: "All drivers have active consent" },
  { id: "rate", label: "Rate limit not exceeded" },
  { id: "webhook", label: "Webhook URL responding with 200" },
  { id: "ids", label: "Partner using correct driver_ids" },
  { id: "scope", label: "Requesting correct scope (telematics.read)" },
];

export default function PartnerDebugTab({
  partners,
  logs,
  webhooks,
  drivers,
  scoreMap,
  selectedPartnerId,
  onSelectPartner,
  onToast,
}) {
  const [checks, setChecks] = useState({});

  const activePartners = partners.filter((p) => p.status === "active");
  const partnerId = selectedPartnerId || activePartners[0]?.partner_id || "";
  const partner = partners.find((p) => p.partner_id === partnerId);

  const partnerLogs = useMemo(
    () => (logs || []).filter((l) => l.partner_id === partnerId).slice(0, 20),
    [logs, partnerId]
  );

  const partnerWebhooks = useMemo(
    () => (webhooks || []).filter((w) => w.partner_id === partnerId).slice(0, 5),
    [webhooks, partnerId]
  );

  const impersonationStats = useMemo(() => {
    const activeCount = drivers.filter((d) => d.consent_status === "active").length;
    const scores = drivers
      .filter((d) => d.consent_status === "active")
      .map((d) => scoreMap.get(d.driver_id)?.score)
      .filter((s) => typeof s === "number");
    const avg = scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
    return { activeCount, avg };
  }, [drivers, scoreMap]);

  function runCheck(id) {
    const results = {
      token: partner?.status === "active",
      consent: drivers.some((d) => d.consent_status === "active"),
      rate: (partner?.api_calls_today || 0) < UBER_PORTAL_DAILY_LIMIT * 0.9,
      webhook: partnerWebhooks.some((w) => w.delivered),
      ids: partnerLogs.every((l) => !l.endpoint.includes("invalid")),
      scope: partnerLogs.filter((l) => l.status_code === 401).length === 0,
    };
    setChecks((prev) => ({ ...prev, [id]: results[id] ? "pass" : "fail" }));
    onToast(`Check complete — ${results[id] ? "passed" : "failed"}`);
  }

  const logRows = partnerLogs.map((l) => ({
    key: l.id,
    cells: [
      formatTime(l.created_at || l.timestamp_ms),
      <span key="e" className="font-mono text-xs">{l.endpoint}</span>,
      <span key="s" className={statusCodeClass(l.status_code)}>{l.status_code}</span>,
      `${l.response_time_ms}ms`,
    ],
  }));

  const displayName = partnerDisplayName(partnerId, partner?.partner_name);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Partner Debug Tools</h2>
        <p className="mt-2 text-zinc-500">Impersonate any partner to debug their integration</p>
      </div>

      <UberSelect
        value={partnerId}
        onChange={(e) => onSelectPartner(e.target.value)}
        className="max-w-md"
      >
        {activePartners.map((p) => (
          <option key={p.partner_id} value={p.partner_id}>
            {partnerDisplayName(p.partner_id, p.partner_name)}
          </option>
        ))}
      </UberSelect>

      <TelematicsCard title="Partner API Health">
        <TelematicsTable
          columns={["Time", "Endpoint", "Status", "Response Time"]}
          rows={logRows}
          emptyMessage="No API calls for this partner yet"
        />
      </TelematicsCard>

      <TelematicsCard title={`What ${displayName} sees right now`}>
        <p className="mb-4 text-sm text-zinc-500">
          This is exactly what {displayName} sees in their dashboard right now
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <TelematicsStatCard label="Active Drivers" value={impersonationStats.activeCount} />
          <TelematicsStatCard label="Avg Portfolio Score" value={impersonationStats.avg || "—"} />
          <TelematicsStatCard
            label="Rate Limit"
            value={`${partner?.api_calls_today || 0} / ${UBER_PORTAL_DAILY_LIMIT.toLocaleString()}`}
          />
        </div>
        <div className="mt-6">
          <p className="mb-2 text-sm font-semibold text-white">Recent Webhooks</p>
          {partnerWebhooks.length === 0 ? (
            <p className="text-sm text-zinc-500">No webhook events</p>
          ) : (
            <ul className="space-y-2 text-sm text-zinc-400">
              {partnerWebhooks.map((w) => {
                const { text } = formatWebhookActivity(w);
                return (
                  <li key={w.id} className="rounded border border-zinc-800 px-3 py-2">
                    {text} — {formatTime(w.created_at)}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <p className="mt-4 text-sm text-zinc-500">
          Total revenue tracked: {formatUsd(Number(partner?.revenue_usd || 0))}
        </p>
      </TelematicsCard>

      <TelematicsCard title="Troubleshooting Checklist">
        <ul className="space-y-3">
          {CHECKLIST.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded border border-zinc-800 px-4 py-3"
            >
              <span className="text-sm text-zinc-300">
                {checks[item.id] === "pass" ? "☑" : checks[item.id] === "fail" ? "☒" : "☐"}{" "}
                {item.label}
              </span>
              <span className="flex items-center gap-2">
                {checks[item.id] === "pass" && (
                  <Badge className="bg-emerald-500/20 text-emerald-400">Pass</Badge>
                )}
                {checks[item.id] === "fail" && (
                  <Badge className="bg-red-500/20 text-red-400">Fail</Badge>
                )}
                <UberSecondaryButton onClick={() => runCheck(item.id)}>Check</UberSecondaryButton>
              </span>
            </li>
          ))}
        </ul>
      </TelematicsCard>
    </div>
  );
}

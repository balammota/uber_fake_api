"use client";

import { STATESAFE_API_TOKEN, STATESAFE_DAILY_LIMIT, STATESAFE_PARTNER_ID } from "@/lib/statesafe-constants";
import { logStatusClass, formatWebhookActivity } from "@/lib/statesafe-utils";
import { formatTime } from "@/lib/telematics-utils";
import { SSCard, SSTable, SSBadge } from "@/app/components/statesafe-ui";

const API_BASE = "https://uber-fake-api.vercel.app/api/telematics";

function webhookCard(webhook) {
  if (webhook.event_type === "score_change") {
    const { improved, text } = formatWebhookActivity(webhook);
    return {
      className: improved
        ? "border-emerald-200 bg-emerald-50"
        : "border-red-200 bg-[#FFF0F2]",
      title: improved ? "Score improved" : "Score dropped",
      body: text,
    };
  }
  if (webhook.event_type === "consent_revoked") {
    return {
      className: "border-red-200 bg-[#FFF0F2]",
      title: "Consent revoked",
      body: `Driver ${webhook.driver_id} revoked data sharing consent`,
    };
  }
  if (webhook.event_type === "consent_expired") {
    return {
      className: "border-amber-200 bg-amber-50",
      title: "Consent expired",
      body: `Driver ${webhook.driver_id} consent has expired`,
    };
  }
  return {
    className: "border-[#E5E7EB] bg-[#F5F5F5]",
    title: webhook.event_type,
    body: webhook.driver_id,
  };
}

export default function DevToolsTab({ logs, webhooks, partner }) {
  const recentLogs = logs.slice(0, 20);
  const recentWebhooks = webhooks.slice(0, 10);
  const callsToday = partner?.api_calls_today ?? 0;
  const callsTotal = partner?.api_calls_total ?? 0;
  const pctUsed = Math.min(100, Math.round((callsToday / STATESAFE_DAILY_LIMIT) * 100));
  const barColor = pctUsed >= 80 ? "bg-[#C8102E]" : "bg-emerald-500";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[#1A1A1A]">Dev Tools</h2>
        <p className="mt-2 text-[#6B7280]">API monitoring and integration diagnostics</p>
      </div>

      <SSCard title="API Connection Status">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[#6B7280]">Base URL</dt>
            <dd className="mt-1 break-all font-mono text-[#333333]">{API_BASE}</dd>
          </div>
          <div>
            <dt className="text-[#6B7280]">Auth</dt>
            <dd className="mt-1 font-mono text-[#333333]">Bearer {STATESAFE_API_TOKEN}</dd>
          </div>
          <div>
            <dt className="text-[#6B7280]">Status</dt>
            <dd className="mt-1 flex items-center gap-2 font-medium text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Connected
            </dd>
          </div>
          <div>
            <dt className="text-[#6B7280]">Partner ID</dt>
            <dd className="mt-1 font-mono text-[#333333]">{STATESAFE_PARTNER_ID}</dd>
          </div>
        </dl>
      </SSCard>

      <SSCard title="API Request Logs">
        {recentLogs.length === 0 ? (
          <p className="text-sm text-[#6B7280]">
            No API calls yet — use Risk Assessment to generate logs
          </p>
        ) : (
          <SSTable
            columns={["Time", "Endpoint", "Method", "Status", "Response Time"]}
            rows={recentLogs.map((log) => ({
              key: log.id,
              cells: [
                formatTime(log.created_at),
                <span key="ep" className="font-mono text-xs">
                  {log.endpoint}
                </span>,
                log.method,
                <span key="st" className={`font-semibold ${logStatusClass(log.status_code)}`}>
                  {log.status_code}
                </span>,
                `${log.response_time_ms}ms`,
              ],
            }))}
          />
        )}
      </SSCard>

      <SSCard title="Webhook Feed">
        {recentWebhooks.length === 0 ? (
          <p className="text-sm text-[#6B7280]">No webhook events yet</p>
        ) : (
          <ul className="space-y-3">
            {recentWebhooks.map((w) => {
              const card = webhookCard(w);
              return (
                <li
                  key={w.id}
                  className={`rounded-lg border p-4 ${card.className}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-[#1A1A1A]">{card.title}</p>
                      <p className="mt-1 text-sm text-[#333333]">{card.body}</p>
                      <p className="mt-2 text-xs text-[#6B7280]">{formatTime(w.created_at)}</p>
                    </div>
                    <SSBadge
                      className={
                        w.delivered
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }
                    >
                      {w.delivered ? "delivered" : "pending"}
                    </SSBadge>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </SSCard>

      <SSCard title="Rate Limit Status">
        <div className="space-y-4">
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-[#333333]">
                API calls today: {callsToday.toLocaleString()} / {STATESAFE_DAILY_LIMIT.toLocaleString()}
              </span>
              <span className="text-[#6B7280]">{pctUsed}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-[#E5E7EB]">
              <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pctUsed}%` }} />
            </div>
          </div>
          <p className="text-sm text-[#333333]">
            Total calls all time: <strong>{callsTotal.toLocaleString()}</strong>
          </p>
          <p className="text-sm text-[#6B7280]">Resets at: midnight UTC</p>
        </div>
      </SSCard>
    </div>
  );
}

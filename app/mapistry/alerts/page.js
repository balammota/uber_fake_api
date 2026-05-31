"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  EmptyBlock,
  ErrorBlock,
  LeafIcon,
  LoadingBlock,
  mapistryFetch,
  StatCard,
  statusColor,
} from "@/app/components/mapistry-app-ui";

const SIMULATED_EMAILS = [
  {
    id: 1,
    subject: "Upload Failed: 3 entries rejected at SRM Dallas Plant",
    time: "2 hours ago",
    body: "Entry at index 2 failed: logDate is required. Entry at index 4 failed: fieldValues is required. Entry at index 7 failed: invalid field type for field_1.",
  },
  {
    id: 2,
    subject: "Rate limit warning: Houston Plant API usage",
    time: "5 hours ago",
    body: "Site site_3 exceeded 80% of hourly API quota. Consider throttling automated uploads.",
  },
  {
    id: 3,
    subject: "Upload Failed: 4 entries rejected at SRM Phoenix Plant",
    time: "1 day ago",
    body: "Multiple validation errors detected in batch upload. Review fieldValues schema before resubmitting.",
  },
  {
    id: 4,
    subject: "Compliance reminder: Denver Plant missing entries",
    time: "2 days ago",
    body: "Daily Emissions Log has no entries for the past 48 hours. Please complete required inspections.",
  },
  {
    id: 5,
    subject: "Upload Failed: 3 entries rejected at SRM CDMX Plant 1",
    time: "3 days ago",
    body: "Entry at index 1 failed: CO2 value out of range. Entry at index 3 failed: logDate is required. Entry at index 5 failed: fieldValues is required.",
  },
];

const ALERT_RULES = [
  {
    icon: "terminal",
    title: "Server Logs",
    description:
      "Every request is logged to the server console with timestamp, method, endpoint, status code, and API key used",
    status: "Active",
  },
  {
    icon: "bell",
    title: "Dashboard Alerts",
    description:
      "Failed requests (4xx, 5xx) and rate limit hits (429) appear here in real time",
    status: "Active",
  },
  {
    icon: "email",
    title: "Email Notifications",
    description:
      "When more than 3 entries fail validation in a single upload, a notification is simulated to admin@srm.com",
    status: "Simulated",
  },
];

function AlertsNav() {
  return (
    <header className="border-b border-zinc-800 bg-[#0a0a0a]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2 text-emerald-400">
          <LeafIcon />
          <span className="text-lg font-semibold text-white">Mapistry</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link href="/mapistry/app" className="text-zinc-400 hover:text-emerald-400">
            ← Back to App
          </Link>
          <Link href="/mapistry" className="text-zinc-400 hover:text-emerald-400">
            API Docs
          </Link>
          <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 font-mono text-xs text-emerald-400">
            API Key: test-api-key-mapistry-123
          </span>
        </div>
      </div>
    </header>
  );
}

function RuleIcon({ type }) {
  if (type === "terminal") {
    return (
      <span className="text-2xl" aria-hidden>
        ⌨️
      </span>
    );
  }
  if (type === "bell") {
    return (
      <span className="text-2xl" aria-hidden>
        🔔
      </span>
    );
  }
  return (
    <span className="text-2xl" aria-hidden>
      ✉️
    </span>
  );
}

function formatTime(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  return new Date(ts).toLocaleString();
}

export default function MapistryAlertsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [clearedAlerts, setClearedAlerts] = useState(false);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { res, body } = await mapistryFetch("/logs", { auth: false });
    if (!res.ok) {
      setError(body?.message || "Failed to load logs");
      setLoading(false);
      return;
    }
    setLogs(body.logs || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadLogs();
    const interval = setInterval(loadLogs, 10000);
    return () => clearInterval(interval);
  }, [loadLogs]);

  const stats = useMemo(() => {
    const total = logs.length;
    const failed = logs.filter((l) => l.status >= 400).length;
    const rateLimited = logs.filter((l) => l.status === 429).length;
    return {
      total,
      failed,
      rateLimited,
      emails: SIMULATED_EMAILS.length,
    };
  }, [logs]);

  const filteredLogs = useMemo(() => {
    if (filter === "success") return logs.filter((l) => l.status >= 200 && l.status < 300);
    if (filter === "failed") return logs.filter((l) => l.status >= 400 && l.status !== 429);
    if (filter === "rate") return logs.filter((l) => l.status === 429);
    return logs;
  }, [logs, filter]);

  const recentAlerts = useMemo(() => {
    if (clearedAlerts) return [];
    return logs
      .filter((l) => l.status >= 400)
      .slice(-10)
      .reverse();
  }, [logs, clearedAlerts]);

  function alertEmoji(status) {
    if (status === 429) return "🟡";
    if (status >= 500) return "🔴";
    return "🔴";
  }

  function alertLabel(status, body) {
    if (status === 401) return "Invalid API key";
    if (status === 404) return "Not found";
    if (status === 429) return "Rate limit exceeded";
    if (status >= 500) return "Server error";
    return body?.error || "Request failed";
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-zinc-300 antialiased">
      <AlertsNav />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Requests" value={stats.total} />
          <StatCard label="Failed Requests" value={stats.failed} />
          <StatCard label="Rate Limit Hits" value={stats.rateLimited} />
          <StatCard label="Simulated Emails Sent" value={stats.emails} />
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white">Alert Rules</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {ALERT_RULES.map((rule) => (
              <div
                key={rule.title}
                className="rounded-xl border border-zinc-800 bg-[#111111] p-5"
              >
                <RuleIcon type={rule.icon} />
                <h3 className="mt-3 font-semibold text-white">{rule.title}</h3>
                <p className="mt-2 text-sm text-zinc-500">{rule.description}</p>
                <span
                  className={`mt-3 inline-block rounded px-2 py-0.5 text-xs ${
                    rule.status === "Active"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-amber-500/20 text-amber-400"
                  }`}
                >
                  {rule.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white">
            Simulated Email Notifications
          </h2>
          <div className="mt-4 space-y-3">
            {SIMULATED_EMAILS.map((email) => (
              <div
                key={email.id}
                className="rounded-xl border border-zinc-800 bg-[#111111] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-zinc-500">
                      From: alerts@mapistry.com → To: admin@srm.com
                    </p>
                    <p className="mt-1 font-medium text-white">{email.subject}</p>
                    <p className="text-xs text-zinc-500">{email.time}</p>
                  </div>
                  <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs text-amber-400">
                    Simulated — not actually sent
                  </span>
                </div>
                <p className="mt-3 text-sm text-zinc-400">{email.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-white">Request Logs</h2>
            <div className="flex flex-wrap gap-2">
              {["all", "success", "failed", "rate"].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`rounded-lg px-3 py-1 text-xs capitalize ${
                    filter === f
                      ? "bg-emerald-600 text-white"
                      : "border border-zinc-700 text-zinc-400"
                  }`}
                >
                  {f === "rate" ? "Rate Limited" : f}
                </button>
              ))}
              <button
                type="button"
                onClick={loadLogs}
                className="rounded-lg border border-zinc-700 px-3 py-1 text-xs text-zinc-400"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-zinc-800 bg-[#111111]">
            {loading ? (
              <LoadingBlock />
            ) : error ? (
              <div className="p-4">
                <ErrorBlock message={error} onRetry={loadLogs} />
              </div>
            ) : filteredLogs.length === 0 ? (
              <EmptyBlock message="No request logs match this filter" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase text-zinc-500">
                    <tr>
                      <th className="px-4 py-3">Time</th>
                      <th className="px-4 py-3">Method</th>
                      <th className="px-4 py-3">Endpoint</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">API Key</th>
                      <th className="px-4 py-3">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...filteredLogs].reverse().map((log) => (
                      <tr key={log.id} className="border-t border-zinc-800">
                        <td className="px-4 py-2 text-xs text-zinc-500">
                          {formatTime(log.timestamp)}
                        </td>
                        <td className="px-4 py-2 font-mono text-xs">
                          {log.method}
                        </td>
                        <td className="px-4 py-2 font-mono text-xs text-zinc-400">
                          {log.endpoint}
                        </td>
                        <td
                          className={`px-4 py-2 font-semibold ${statusColor(log.status)}`}
                        >
                          {log.status}
                        </td>
                        <td className="max-w-[120px] truncate px-4 py-2 font-mono text-xs text-zinc-500">
                          {log.apiKey === "none" ? "—" : log.apiKey.slice(0, 16) + "…"}
                        </td>
                        <td className="px-4 py-2 text-xs">{log.duration}ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-white">Recent Alerts</h2>
            <button
              type="button"
              onClick={() => setClearedAlerts(true)}
              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs hover:border-red-500/50 hover:text-red-400"
            >
              Clear Alerts
            </button>
          </div>
          <div className="mt-4 space-y-2">
            {recentAlerts.length === 0 ? (
              <EmptyBlock message="No recent alerts" />
            ) : (
              recentAlerts.map((log) => (
                <div
                  key={log.id}
                  className="rounded-lg border border-zinc-800 bg-[#111111] px-4 py-3 text-sm"
                >
                  <span className="mr-2">{alertEmoji(log.status)}</span>
                  <span className={`font-semibold ${statusColor(log.status)}`}>
                    {log.status}
                  </span>
                  <span className="text-zinc-500"> — </span>
                  <span className="text-zinc-300">
                    {alertLabel(log.status)} — {log.endpoint}
                  </span>
                  <span className="mt-1 block text-xs text-zinc-500">
                    {formatTime(log.timestamp)}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

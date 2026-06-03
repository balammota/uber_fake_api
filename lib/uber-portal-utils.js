import { partnerDisplayName } from "@/lib/uber-portal-constants";
import { formatTime } from "@/lib/telematics-utils";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export function partnerErrorRateToday(logs, partnerId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const partnerLogs = (logs || []).filter(
    (l) =>
      l.partner_id === partnerId && new Date(l.created_at || l.timestamp_ms) >= today
  );
  if (!partnerLogs.length) return 0;
  const errors = partnerLogs.filter((l) => l.status_code >= 400).length;
  return (errors / partnerLogs.length) * 100;
}

export function partnerErrorRateLastHour(logs, partnerId) {
  const cutoff = Date.now() - HOUR_MS;
  const partnerLogs = (logs || []).filter(
    (l) =>
      l.partner_id === partnerId &&
      new Date(l.created_at || l.timestamp_ms).getTime() >= cutoff
  );
  if (!partnerLogs.length) return { rate: 0, errors: 0, total: 0 };
  const errors = partnerLogs.filter((l) => l.status_code >= 400).length;
  return { rate: (errors / partnerLogs.length) * 100, errors, total: partnerLogs.length };
}

export function globalErrorRate(logs, hours = 24) {
  const cutoff = Date.now() - hours * HOUR_MS;
  const recent = (logs || []).filter(
    (l) => new Date(l.created_at || l.timestamp_ms).getTime() >= cutoff
  );
  if (!recent.length) return 0;
  const errors = recent.filter((l) => l.status_code >= 400).length;
  return Math.round((errors / recent.length) * 1000) / 10;
}

export function avgLatency(logs) {
  const recent = logs || [];
  if (!recent.length) return 142;
  const sum = recent.reduce((a, l) => a + (l.response_time_ms || 0), 0);
  return Math.round(sum / recent.length);
}

export function isApiDegraded(logs) {
  return globalErrorRate(logs, 1) > 5;
}

export function errorBreakdown(logs) {
  const cutoff = Date.now() - DAY_MS;
  const recent = (logs || []).filter(
    (l) =>
      new Date(l.created_at || l.timestamp_ms).getTime() >= cutoff &&
      l.status_code >= 400
  );
  const groups = {
    403: { label: "403 ConsentRequired", count: 0, trend: "→ stable" },
    404: { label: "404 NotFound", count: 0, trend: "↓ down" },
    429: { label: "429 RateLimited", count: 0, trend: "↑ up", warn: true },
    500: { label: "500 Internal", count: 0, trend: "→ stable" },
    401: { label: "401 Unauthorized", count: 0, trend: "→ stable" },
  };
  for (const l of recent) {
    const key = l.status_code;
    if (groups[key]) groups[key].count += 1;
  }
  const total = recent.length || 1;
  return Object.values(groups).map((g) => ({
    ...g,
    pct: Math.round((g.count / total) * 100),
  }));
}

export function latencyClass(ms) {
  if (ms < 200) return "text-emerald-400";
  if (ms <= 500) return "text-amber-400";
  return "text-red-400";
}

export function errorRateClass(rate) {
  if (rate < 1) return "text-emerald-400";
  if (rate <= 5) return "text-amber-400";
  return "text-red-400";
}

export function partnerStatusBadge(status) {
  if (status === "active") return "bg-emerald-500/20 text-emerald-400";
  if (status === "pending") return "bg-amber-500/20 text-amber-400";
  return "bg-red-500/20 text-red-400";
}

export function stageBadgeClass(stage) {
  if (stage === "Live") return "bg-emerald-500/20 text-emerald-400";
  if (stage === "Pending Approval") return "bg-amber-500/20 text-amber-400";
  if (stage === "Technical Review") return "bg-blue-500/20 text-blue-400";
  if (stage === "In Discussion") return "bg-zinc-700 text-zinc-300";
  return "bg-zinc-800 text-zinc-500";
}

export function consentByCity(drivers, scoreMap) {
  const byCity = {};
  for (const d of drivers) {
    if (!byCity[d.city]) {
      byCity[d.city] = { total: 0, active: 0, pending: 0, revoked: 0, scores: [] };
    }
    byCity[d.city].total += 1;
    byCity[d.city][d.consent_status] = (byCity[d.city][d.consent_status] || 0) + 1;
    const sc = scoreMap.get(d.driver_id)?.score;
    if (typeof sc === "number") byCity[d.city].scores.push(sc);
  }
  return Object.entries(byCity)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([city, data]) => ({
      city,
      total: data.total,
      active: data.active || 0,
      pending: data.pending || 0,
      revoked: data.revoked || 0,
      avgScore: data.scores.length
        ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
        : 0,
    }));
}

export function driverPartnerBadges(driverId) {
  const badges = [];
  if (["driver_001", "driver_002", "driver_004", "driver_007", "driver_010"].includes(driverId)) {
    badges.push("StateSafe");
  }
  if (["driver_001", "driver_003", "driver_006", "driver_008"].includes(driverId)) {
    badges.push("Sprout");
  }
  return badges;
}

export function generateAlerts({ partners, logs, webhooks, acknowledged = new Set() }) {
  const alerts = [];
  const now = Date.now();

  for (const p of partners) {
    if (p.status !== "active") continue;
    const { rate, errors, total } = partnerErrorRateLastHour(logs, p.partner_id);
    if (rate > 5 && total > 0) {
      const id = `err-${p.partner_id}`;
      alerts.push({
        id,
        severity: "CRITICAL",
        partner: partnerDisplayName(p.partner_id, p.partner_name),
        partnerId: p.partner_id,
        description: `${partnerDisplayName(p.partner_id, p.partner_name)} — Error rate ${rate.toFixed(1)}% (${errors} errors in last hour). Investigate immediately — partner may be impacted`,
        timestamp: now,
        status: acknowledged.has(id) ? "Acknowledged" : "Active",
      });
    }

    if ((p.api_calls_today || 0) > 8000) {
      const pct = Math.round(((p.api_calls_today || 0) / 10000) * 100);
      const id = `rate-${p.partner_id}`;
      alerts.push({
        id,
        severity: "WARNING",
        partner: partnerDisplayName(p.partner_id, p.partner_name),
        partnerId: p.partner_id,
        description: `${partnerDisplayName(p.partner_id, p.partner_name)} approaching rate limit — ${(p.api_calls_today || 0).toLocaleString()} / 10,000 calls today (${pct}%). Proactively notify partner to implement caching`,
        timestamp: now - 600000,
        status: acknowledged.has(id) ? "Acknowledged" : "Active",
      });
    }

    if ((p.api_calls_today || 0) === 0) {
      const id = `inactive-${p.partner_id}`;
      alerts.push({
        id,
        severity: "INFO",
        partner: partnerDisplayName(p.partner_id, p.partner_name),
        partnerId: p.partner_id,
        description: `${partnerDisplayName(p.partner_id, p.partner_name)} has made zero API calls today — check integration health`,
        timestamp: now - 3600000,
        status: acknowledged.has(id) ? "Acknowledged" : "Active",
      });
    }
  }

  const hourAgo = now - HOUR_MS;
  const revocations = (webhooks || []).filter(
    (w) =>
      w.event_type === "consent_revoked" &&
      new Date(w.created_at).getTime() >= hourAgo
  );
  if (revocations.length >= 3) {
    const id = "consent-spike";
    alerts.push({
      id,
      severity: "WARNING",
      partner: "Multiple",
      description: `${revocations.length} consent revocations in the last hour — possible UX issue on driver side`,
      timestamp: now - 1800000,
      status: acknowledged.has(id) ? "Acknowledged" : "Active",
    });
  }

  const recentLogs = (logs || []).slice(0, 50);
  for (const l of recentLogs) {
    if (l.status_code >= 500) {
      const id = `500-${l.id}`;
      if (!alerts.some((a) => a.id === id)) {
        alerts.push({
          id,
          severity: "CRITICAL",
          partner: partnerDisplayName(l.partner_id, l.partner_id),
          description: `Server error on ${l.endpoint} — status ${l.status_code}`,
          timestamp: new Date(l.created_at || l.timestamp_ms).getTime(),
          status: acknowledged.has(id) ? "Acknowledged" : "Active",
        });
      }
    }
    if (l.status_code === 429) {
      const id = `429-${l.id}`;
      if (!alerts.some((a) => a.severity === "WARNING" && a.description.includes("429"))) {
        alerts.push({
          id,
          severity: "WARNING",
          partner: partnerDisplayName(l.partner_id, l.partner_id),
          description: `Rate limit hit for ${partnerDisplayName(l.partner_id, l.partner_id)} on ${l.endpoint}`,
          timestamp: new Date(l.created_at || l.timestamp_ms).getTime(),
          status: acknowledged.has(id) ? "Acknowledged" : "Active",
        });
      }
    }
  }

  return alerts.sort((a, b) => b.timestamp - a.timestamp);
}

export function overviewAlertsFeed(alerts) {
  return alerts.slice(0, 5).map((a) => ({
    ...a,
    borderClass:
      a.severity === "CRITICAL"
        ? "border-l-red-500"
        : a.severity === "WARNING"
          ? "border-l-amber-500"
          : "border-l-zinc-500",
    icon: a.severity === "CRITICAL" ? "🔴" : a.severity === "WARNING" ? "🟡" : "⚪",
    timeLabel: formatTime(a.timestamp),
  }));
}

export function countPartnerHealthIssues(partners, logs) {
  return partners.filter(
    (p) => p.status === "active" && partnerErrorRateToday(logs, p.partner_id) > 5
  ).length;
}

export function openAlertsCount(alerts) {
  return alerts.filter((a) => a.status === "Active").length;
}

export function filterLogs(logs, { partner, status, endpoint, timeRange }) {
  const now = Date.now();
  const ranges = { hour: HOUR_MS, day: DAY_MS, week: 7 * DAY_MS };
  const cutoff = now - (ranges[timeRange] || ranges.day);

  return (logs || []).filter((l) => {
    const t = new Date(l.created_at || l.timestamp_ms).getTime();
    if (t < cutoff) return false;
    if (partner !== "all" && l.partner_id !== partner) return false;
    if (status === "2xx" && (l.status_code < 200 || l.status_code >= 300)) return false;
    if (status === "4xx" && (l.status_code < 400 || l.status_code >= 500)) return false;
    if (status === "5xx" && l.status_code < 500) return false;
    if (endpoint !== "all" && !l.endpoint.includes(endpoint.replace("/", ""))) return false;
    return true;
  });
}

export function logsToCsv(logs) {
  const header = "Time,Partner,Driver ID,Endpoint,Method,Status,Response Time,Request ID\n";
  const rows = logs.map((l) =>
    [
      formatTime(l.created_at || l.timestamp_ms),
      l.partner_id,
      l.driver_id || "",
      l.endpoint,
      l.method,
      l.status_code,
      l.response_time_ms,
      l.id,
    ].join(",")
  );
  return header + rows.join("\n");
}

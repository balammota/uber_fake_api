export const PROGRESSIVE_PARTNER_ID = "progressive_ins";

export function gradeFromScore(score) {
  if (score >= 93) return "A+";
  if (score >= 85) return "A";
  if (score >= 78) return "B+";
  if (score >= 70) return "B";
  if (score >= 63) return "B-";
  if (score >= 55) return "C+";
  return "D";
}

export function percentileFromScore(score) {
  return Math.min(99, Math.max(40, score + Math.floor(Math.random() * 6) - 2));
}

export function buildScoreRow(driverId, score, prev = {}) {
  const s = Math.min(100, Math.max(0, Math.round(score)));
  const jitter = (n, range = 5) =>
    Math.min(100, Math.max(0, n + Math.floor(Math.random() * (range * 2 + 1)) - range));
  return {
    driver_id: driverId,
    score: s,
    percentile: percentileFromScore(s),
    grade: gradeFromScore(s),
    trips_analyzed: prev.trips_analyzed
      ? prev.trips_analyzed + Math.floor(Math.random() * 40)
      : 400 + Math.floor(Math.random() * 1000),
    miles_analyzed: prev.miles_analyzed
      ? Number(prev.miles_analyzed) + Math.floor(Math.random() * 500)
      : 5000 + Math.floor(Math.random() * 15000),
    speed_compliance: jitter(prev.speed_compliance ?? 75),
    smooth_braking: jitter(prev.smooth_braking ?? 70),
    smooth_acceleration: jitter(prev.smooth_acceleration ?? 72),
    phone_usage: jitter(prev.phone_usage ?? 88, 3),
    night_driving_safety: jitter(prev.night_driving_safety ?? 68),
    period_days: 90,
    recorded_at: new Date().toISOString(),
  };
}

export function latestScoresByDriver(scores) {
  const map = new Map();
  for (const row of scores || []) {
    const prev = map.get(row.driver_id);
    if (!prev || new Date(row.recorded_at) > new Date(prev.recorded_at)) {
      map.set(row.driver_id, row);
    }
  }
  return map;
}

export function latestEventsByDriver(events) {
  const map = new Map();
  for (const row of events || []) {
    const prev = map.get(row.driver_id);
    if (!prev || new Date(row.recorded_at) > new Date(prev.recorded_at)) {
      map.set(row.driver_id, row);
    }
  }
  return map;
}

export function consentBadgeClass(status) {
  if (status === "active") return "bg-emerald-500/20 text-emerald-400";
  if (status === "pending") return "bg-amber-500/20 text-amber-400";
  return "bg-red-500/20 text-red-400";
}

export function partnerStatusClass(status) {
  return status === "active"
    ? "bg-emerald-500/20 text-emerald-400"
    : "bg-red-500/20 text-red-400";
}

export function gradeBadgeClass(grade) {
  if (grade === "A+" || grade === "A") return "bg-emerald-500/20 text-emerald-400";
  if (grade?.startsWith("B")) return "bg-blue-500/20 text-blue-400";
  if (grade === "C+" || grade === "C") return "bg-amber-500/20 text-amber-400";
  return "bg-red-500/20 text-red-400";
}

export function statusCodeClass(code) {
  if (code >= 200 && code < 300) return "text-emerald-400";
  if (code >= 400 && code < 500) return "text-amber-400";
  if (code >= 500) return "text-red-400";
  return "text-zinc-400";
}

export function discountFromScore(score) {
  if (score >= 90) return { label: "25% discount", className: "text-emerald-400" };
  if (score >= 80) return { label: "15% discount", className: "text-emerald-400" };
  if (score >= 70) return { label: "8% discount", className: "text-blue-400" };
  if (score >= 60) return { label: "0% discount", className: "text-amber-400" };
  return { label: "+10% surcharge", className: "text-red-400" };
}

export function recommendationFromScore(score) {
  if (score >= 80) return "Approve — offer 15-25% discount";
  if (score >= 60) return "Standard rate";
  return "Review required — consider surcharge";
}

export function scoreDistribution(scores) {
  const buckets = [
    { range: "0-59", min: 0, max: 59, count: 0, color: "bg-red-500" },
    { range: "60-69", min: 60, max: 69, count: 0, color: "bg-orange-500" },
    { range: "70-79", min: 70, max: 79, count: 0, color: "bg-amber-500" },
    { range: "80-89", min: 80, max: 89, count: 0, color: "bg-blue-500" },
    { range: "90-100", min: 90, max: 100, count: 0, color: "bg-emerald-500" },
  ];
  for (const s of scores) {
    const b = buckets.find((x) => s >= x.min && s <= x.max);
    if (b) b.count += 1;
  }
  return buckets;
}

export function formatUsd(n) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n || 0);
}

export function formatTime(isoOrMs) {
  if (typeof isoOrMs === "number") {
    return new Date(isoOrMs).toLocaleString();
  }
  return new Date(isoOrMs).toLocaleString();
}

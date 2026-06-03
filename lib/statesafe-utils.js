import { formatUsd } from "@/lib/telematics-utils";

export function scoreColorClass(score) {
  if (score >= 90) return "text-emerald-600";
  if (score >= 80) return "text-blue-600";
  if (score >= 70) return "text-amber-600";
  if (score >= 60) return "text-orange-600";
  return "text-[#C8102E]";
}

export function avgScoreColorClass(avg) {
  if (avg > 75) return "text-emerald-600";
  if (avg >= 60) return "text-amber-600";
  return "text-[#C8102E]";
}

export function gradeBadgeStyles(grade) {
  if (grade === "A+" || grade === "A") return "bg-emerald-100 text-emerald-800";
  if (grade?.startsWith("B")) return "bg-blue-100 text-blue-800";
  if (grade === "C+" || grade === "C" || grade === "B-") return "bg-amber-100 text-amber-800";
  return "bg-red-100 text-[#9B0B22]";
}

export function discountBadge(score) {
  if (score >= 90) return { label: "25% discount", className: "bg-emerald-100 text-emerald-800" };
  if (score >= 80) return { label: "15% discount", className: "bg-emerald-100 text-emerald-800" };
  if (score >= 70) return { label: "8% discount", className: "bg-blue-100 text-blue-800" };
  if (score >= 60) return { label: "Standard rate", className: "bg-gray-100 text-gray-700" };
  return { label: "+10% surcharge", className: "bg-red-100 text-[#9B0B22]" };
}

export function riskLevel(score) {
  if (score >= 80) return { label: "Low Risk", className: "text-emerald-700" };
  if (score >= 60) return { label: "Moderate", className: "text-amber-700" };
  return { label: "High Risk", className: "text-[#C8102E]" };
}

export function assessmentRecommendation(score) {
  if (score >= 90)
    return {
      label: "✅ Excellent Driver — Offer 25% discount",
      className: "border-emerald-200 bg-emerald-50 text-emerald-900",
    };
  if (score >= 80)
    return {
      label: "✅ Safe Driver — Offer 15% discount",
      className: "border-emerald-200 bg-emerald-50 text-emerald-900",
    };
  if (score >= 70)
    return {
      label: "🔵 Good Driver — Offer 8% discount",
      className: "border-blue-200 bg-blue-50 text-blue-900",
    };
  if (score >= 60)
    return {
      label: "⚪ Average Driver — Standard rate",
      className: "border-gray-200 bg-gray-50 text-gray-800",
    };
  return {
    label: "⚠️ High Risk — Review required",
    className: "border-red-200 bg-[#FFF0F2] text-[#9B0B22]",
  };
}

export function modalRecommendation(score) {
  if (score >= 80)
    return { label: "Approve — offer discount", className: "border-emerald-200 bg-emerald-50 text-emerald-900" };
  if (score >= 60)
    return { label: "Standard rate", className: "border-amber-200 bg-amber-50 text-amber-900" };
  return { label: "Review required", className: "border-red-200 bg-[#FFF0F2] text-[#9B0B22]" };
}

export function portfolioGradeBuckets(scores) {
  const buckets = [
    { label: "A+ (90-100)", min: 90, max: 100, count: 0, color: "bg-emerald-500" },
    { label: "A (80-89)", min: 80, max: 89, count: 0, color: "bg-blue-500" },
    { label: "B (70-79)", min: 70, max: 79, count: 0, color: "bg-amber-400" },
    { label: "C (60-69)", min: 60, max: 69, count: 0, color: "bg-orange-500" },
    { label: "D (0-59)", min: 0, max: 59, count: 0, color: "bg-[#C8102E]" },
  ];
  for (const s of scores) {
    const b = buckets.find((x) => s >= x.min && s <= x.max);
    if (b) b.count += 1;
  }
  const total = scores.length || 1;
  return buckets.map((b) => ({ ...b, pct: Math.round((b.count / total) * 100) }));
}

export function gradeMatchesFilter(grade, filter) {
  if (filter === "all") return true;
  if (filter === "A+") return grade === "A+";
  if (filter === "A") return grade === "A" || grade === "A+";
  if (filter === "B") return grade?.startsWith("B");
  if (filter === "C") return grade === "C+" || grade === "C" || grade === "C-";
  if (filter === "D") return grade === "D";
  return true;
}

export function computePortfolioStats(drivers, scoreMap) {
  const scores = drivers
    .map((d) => scoreMap.get(d.driver_id)?.score)
    .filter((s) => typeof s === "number");
  const avg = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;
  const eligible = scores.filter((s) => s >= 70).length;
  const savings = Math.max(0, (avg - 50) * 120);
  return {
    activeDrivers: drivers.length,
    avgScore: avg,
    premiumSavings: formatUsd(savings),
    eligibleDiscount: eligible,
    scores,
  };
}

export function logStatusClass(code) {
  if (code >= 200 && code < 300) return "text-emerald-700";
  if (code === 429) return "text-orange-600";
  if (code >= 500) return "text-[#C8102E]";
  if (code >= 400) return "text-amber-700";
  return "text-gray-600";
}

export function formatWebhookActivity(webhook) {
  if (webhook.event_type === "score_change") {
    const improved = (webhook.change ?? 0) > 0;
    return {
      improved,
      text: `${webhook.driver_id} score ${improved ? "improved" : "dropped"} ${webhook.previous_score} → ${webhook.new_score}`,
    };
  }
  return { improved: false, text: `${webhook.event_type} — ${webhook.driver_id}` };
}

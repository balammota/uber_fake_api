export function formatTimeAgo(isoOrDate) {
  if (!isoOrDate) return "Never";
  const diff = Date.now() - new Date(isoOrDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

export const SCENARIO_OPTIONS = [
  { id: "all_well", label: "All drivers performing well", desc: "All scores 80–95" },
  { id: "mixed", label: "Mixed performance — realistic distribution", desc: "Scores across all grades (varies each run)" },
  { id: "high_risk", label: "High risk portfolio", desc: "All scores 40–65" },
  { id: "improvement", label: "Score improvement — reward scenario", desc: "All scores +10–15 vs previous" },
  { id: "degradation", label: "Score degradation — alert trigger", desc: "3 drivers drop 15+ points" },
  { id: "rate_limit_stress", label: "Rate limit stress test", desc: "50 fake API log entries" },
];

export const PARTNER_OPTIONS = [
  { id: "progressive_ins", label: "StateSafe Insurance" },
  { id: "root_insurance", label: "Sprout Insurance" },
];

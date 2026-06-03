export const UBER_PORTAL_DAILY_LIMIT = 10000;

export const PARTNER_DISPLAY_NAMES = {
  progressive_ins: "StateSafe Insurance",
  root_insurance: "Sprout Insurance",
};

export function partnerDisplayName(partnerId, fallback) {
  return PARTNER_DISPLAY_NAMES[partnerId] || fallback || partnerId;
}

export const UBER_PORTAL_USERS = [
  {
    id: "alejandro",
    name: "Alejandro Mota",
    role: "Partner Solutions Lead",
    initials: "AM",
    description: "Partner health, troubleshooting, partner support",
  },
  {
    id: "aashish",
    name: "Aashish Patel",
    role: "Staff Engineer",
    initials: "AP",
    description: "System health, infrastructure, API monitoring",
  },
  {
    id: "maya",
    name: "Maya Chen",
    role: "Business Development",
    initials: "MC",
    description: "Revenue, partner pipeline, market metrics",
  },
];

export const UBER_PORTAL_TABS = [
  { id: "overview", label: "Overview" },
  { id: "partners", label: "Partners" },
  { id: "consent", label: "Driver Consent" },
  { id: "debug", label: "Partner Debug" },
  { id: "health", label: "System Health" },
  { id: "logs", label: "API Logs" },
  { id: "alerts", label: "Alerts" },
  { id: "revenue", label: "Revenue" },
  { id: "pipeline", label: "Partner Pipeline" },
  { id: "market", label: "Market Analytics" },
];

export const UBER_TAB_ACCESS = {
  overview: ["alejandro", "aashish", "maya"],
  partners: ["alejandro"],
  consent: ["alejandro"],
  debug: ["alejandro"],
  health: ["aashish"],
  logs: ["aashish"],
  alerts: ["alejandro", "aashish"],
  revenue: ["maya"],
  pipeline: ["maya"],
  market: ["maya"],
};

export function uberTabsForUser(userId) {
  return UBER_PORTAL_TABS.filter((tab) => UBER_TAB_ACCESS[tab.id]?.includes(userId));
}

export const PENDING_APPLICATIONS = [
  {
    id: "roadshield",
    company: "RoadShield Insurance",
    appliedDaysAgo: 2,
    useCase: "UBI product for rideshare drivers",
    status: "Pending Review",
    partnerId: "roadshield_ins",
  },
  {
    id: "lizard",
    company: "Lizard Digital",
    appliedDaysAgo: 5,
    useCase: "Fleet risk assessment platform",
    status: "Pending Review",
    partnerId: "lizard_digital",
  },
  {
    id: "citrus",
    company: "Citrus Insurance",
    appliedDaysAgo: 7,
    useCase: "AI-powered instant UBI pricing",
    status: "Info Requested",
    partnerId: "citrus_ins",
  },
];

export const PIPELINE_ROWS = [
  {
    company: "StateSafe Insurance",
    stage: "Live",
    drivers: "7 drivers",
    mrr: "$35/mo",
    owner: "Alejandro",
    next: "Expand",
    partnerId: "progressive_ins",
  },
  {
    company: "Sprout Insurance",
    stage: "Live",
    drivers: "5 drivers",
    mrr: "$25/mo",
    owner: "Alejandro",
    next: "Upsell",
    partnerId: "root_insurance",
  },
  {
    company: "RoadShield Insurance",
    stage: "Pending Approval",
    drivers: "500 est",
    mrr: "$2,500/mo",
    owner: "Maya",
    next: "Legal review",
  },
  {
    company: "Lizard Digital",
    stage: "Technical Review",
    drivers: "1000 est",
    mrr: "$4,000/mo",
    owner: "Aashish",
    next: "API sandbox",
  },
  {
    company: "Citrus Insurance",
    stage: "In Discussion",
    drivers: "200 est",
    mrr: "$1,000/mo",
    owner: "Maya",
    next: "Demo scheduled",
  },
  {
    company: "Harbor Mutual",
    stage: "In Discussion",
    drivers: "800 est",
    mrr: "$3,200/mo",
    owner: "Maya",
    next: "First call",
  },
  {
    company: "Harvest Insurance",
    stage: "Prospecting",
    drivers: "600 est",
    mrr: "$2,400/mo",
    owner: "Maya",
    next: "Outreach sent",
  },
  {
    company: "Valor Alliance",
    stage: "Prospecting",
    drivers: "400 est",
    mrr: "$1,600/mo",
    owner: "Maya",
    next: "Research",
  },
];

export const ALERT_RULES = [
  { rule: "Error rate", threshold: "> 5% in 5 min", severity: "CRITICAL", notify: "Yes" },
  { rule: "Rate limit", threshold: "> 80% daily", severity: "WARNING", notify: "Yes" },
  { rule: "Latency", threshold: "> 1000ms avg", severity: "WARNING", notify: "No" },
  { rule: "Partner inactive", threshold: "0 calls in 24h", severity: "INFO", notify: "No" },
  { rule: "Consent revocation spike", threshold: "> 3 in 1 hour", severity: "WARNING", notify: "Yes" },
  { rule: "CMT pipeline delay", threshold: "> 30 min", severity: "CRITICAL", notify: "Yes" },
];

export const ENDPOINT_LATENCY = [
  { endpoint: "GET /score", avg: 89, p95: 234, p99: 412, calls: 847 },
  { endpoint: "GET /events", avg: 112, p95: 298, p99: 534, calls: 423 },
  { endpoint: "GET /summary", avg: 156, p95: 387, p99: 721, calls: 1203 },
  { endpoint: "GET /fleet", avg: 234, p95: 612, p99: 1847, calls: 89 },
  { endpoint: "POST /consent", avg: 78, p95: 198, p99: 334, calls: 34 },
];

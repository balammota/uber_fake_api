export const STATESAFE_PARTNER_ID = "progressive_ins";
export const STATESAFE_API_TOKEN = "fake-token-xyz123";
export const STATESAFE_DAILY_LIMIT = 10000;

export const STATESAFE_USERS = [
  {
    id: "sarah",
    name: "Sarah Mitchell",
    role: "Underwriter",
    initials: "SM",
    description: "Risk assessment and policy pricing",
  },
  {
    id: "james",
    name: "James Rodriguez",
    role: "Developer / IT",
    initials: "JR",
    description: "API integration and technical monitoring",
  },
  {
    id: "lisa",
    name: "Lisa Chen",
    role: "Portfolio Manager",
    initials: "LC",
    description: "Portfolio analytics and business metrics",
  },
];

export const STATESAFE_TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "drivers", label: "Drivers" },
  { id: "risk", label: "Risk Assessment" },
  { id: "analytics", label: "Analytics" },
  { id: "devtools", label: "Dev Tools" },
];

export const TAB_ACCESS = {
  dashboard: ["sarah", "james", "lisa"],
  drivers: ["sarah", "james"],
  risk: ["sarah", "james"],
  analytics: ["james", "lisa"],
  devtools: ["james"],
};

export function tabsForUser(userId) {
  return STATESAFE_TABS.filter((tab) => TAB_ACCESS[tab.id]?.includes(userId));
}

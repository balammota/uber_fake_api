export const TOUR_STORAGE = {
  seen: "telematics_tour_seen",
  active: "telematics_tour_active",
  step: "telematics_tour_step",
  autoUser: "telematics_tour_auto_user",
  uberTab: "telematics_tour_uber_tab",
  insurerTab: "telematics_tour_insurer_tab",
};

export const TOUR_TOTAL_STEPS = 8;

export const TOUR_STEPS = [
  {
    path: "/telematics",
    selector: '[data-tour="platform-cards"]',
    location: "Platform Home",
    title: "The Uber Telematics API Platform",
    description:
      "On the platform home page you'll find four entry points — API Documentation, the Uber Internal Portal, the Insurance Partner Portal, and the API Sandbox where you generate test data. Let's walk through each one.",
  },
  {
    path: "/telematics",
    selector: '[data-tour="docs-card"]',
    location: "Platform Home",
    title: "Start with the Documentation",
    description:
      "Still on the platform home page — this card links to the API docs. They explain every endpoint: authentication, consent flow, driver scores, webhooks, and more. This is what insurance partners receive when they onboard.",
    navigateOnNext: "/telematics/sandbox",
    navigateMessage: "Taking you to the Sandbox...",
  },
  {
    path: "/telematics/sandbox",
    selector: "#generator",
    location: "API Sandbox",
    title: "Generate Test Data Here",
    description:
      "In the API Sandbox, this is your starting point for every demo. Generate synthetic driving scores for all 10 drivers — this simulates Uber's telematics data pipeline processing real trips.",
  },
  {
    path: "/telematics/sandbox",
    selector: '[data-tour="scenario-picker"]',
    location: "API Sandbox",
    title: "Pick a Scenario",
    description:
      "Still in the Sandbox — choose 'Score Degradation' to trigger alerts, or 'All drivers performing well' to show discounts. Each scenario tells a different story. Click Generate before moving on.",
    navigateOnNext: "/telematics/uber/login",
    navigateMessage: "Taking you to the Uber Portal...",
  },
  {
    path: "/telematics/uber/login",
    selector: '[data-tour="uber-login-users"]',
    location: "Uber Internal Portal",
    title: "Uber's Internal View",
    description:
      "In the Uber Internal Portal login, you'll pick a role to enter. Three personas — Partner Solutions, Engineering, and Business Development — each see different data relevant to their function.",
    navigateOnNext: "/telematics/uber",
    navigateMessage: "Loading proactive monitoring...",
    beforeEnter: () => {
      sessionStorage.setItem(
        TOUR_STORAGE.autoUser,
        JSON.stringify({ portal: "uber", userId: "alejandro" })
      );
      sessionStorage.setItem(TOUR_STORAGE.uberTab, "alerts");
    },
  },
  {
    path: "/telematics/uber",
    selector: '[data-tour="nav-alerts"]',
    location: "Uber Internal Portal",
    title: "Proactive — Not Reactive",
    description:
      "Inside the Uber Portal as Alejandro, the Alerts tab shows proactive monitoring. Uber doesn't wait for partners to report problems — error spikes, rate limits, and score changes are detected automatically.",
    navigateOnNext: "/telematics/insurer/login",
    navigateMessage: "Taking you to the Insurer Portal...",
  },
  {
    path: "/telematics/insurer/login",
    selector: '[data-tour="insurer-login-users"]',
    location: "Insurance Partner Portal",
    title: "What StateSafe Insurance Sees",
    description:
      "In the Insurance Partner Portal login (styled as StateSafe Insurance), partners pick a role — Underwriter, Developer, or Portfolio Manager. Each sees only what's relevant to their job.",
    navigateOnNext: "/telematics/insurer",
    navigateMessage: "Opening Risk Assessment...",
    beforeEnter: () => {
      sessionStorage.setItem(
        TOUR_STORAGE.autoUser,
        JSON.stringify({ portal: "insurer", userId: "sarah" })
      );
      sessionStorage.setItem(TOUR_STORAGE.insurerTab, "risk");
    },
  },
  {
    path: "/telematics/insurer",
    selector: '[data-tour="nav-risk"]',
    location: "Insurance Partner Portal",
    title: "The Integration in Action",
    description:
      "Inside the Insurer Portal as Sarah, the Risk Assessment tab is where partners query driver scores. Each call hits the Uber Telematics API in real time — and that request appears instantly in the Uber Portal's API logs.",
  },
];

export function getInitialTourUser(portal, users) {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(TOUR_STORAGE.autoUser);
    if (!raw) return null;
    const { portal: p, userId } = JSON.parse(raw);
    if (p !== portal) return null;
    sessionStorage.removeItem(TOUR_STORAGE.autoUser);
    return users.find((u) => u.id === userId) || null;
  } catch {
    return null;
  }
}

export function applyTourAutoUser(users, setUser, portal) {
  if (typeof window === "undefined") return;
  try {
    const raw = sessionStorage.getItem(TOUR_STORAGE.autoUser);
    if (!raw) return;
    const { portal: p, userId } = JSON.parse(raw);
    if (p !== portal) return;
    const user = users.find((u) => u.id === userId);
    if (user) setUser(user);
    sessionStorage.removeItem(TOUR_STORAGE.autoUser);
  } catch {
    /* ignore */
  }
}

export function readTourTab(key) {
  if (typeof window === "undefined") return null;
  const tab = sessionStorage.getItem(key);
  if (tab) sessionStorage.removeItem(key);
  return tab;
}

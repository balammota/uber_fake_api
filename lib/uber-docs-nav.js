export const DOCS_NAV = [
  { label: "Introduction", section: "introduction" },
  {
    label: "Overview",
    defaultOpen: true,
    children: [
      { label: "Versioning", section: "versioning" },
      { label: "Rate Limiting", section: "rate-limiting" },
      { label: "Error Handling", section: "error-handling" },
      { label: "Data Types", section: "data-types" },
    ],
  },
  {
    label: "Get Started",
    defaultOpen: true,
    children: [
      { label: "Quick Start", section: "quick-start" },
      { label: "Authentication", section: "authentication" },
      { label: "Consent Flow", section: "consent-flow" },
    ],
  },
  {
    label: "Driver Data",
    children: [
      { label: "Driver Score", section: "driver-score" },
      { label: "Driver Events", section: "driver-events" },
      { label: "Driver Summary", section: "driver-summary" },
    ],
  },
  {
    label: "Fleet Management",
    children: [
      { label: "Fleet Query", section: "fleet-query" },
      { label: "Bulk Access", section: "bulk-access" },
    ],
  },
  {
    label: "Webhooks",
    children: [
      { label: "Webhooks Overview", section: "webhooks-overview" },
      { label: "Event Types", section: "webhook-event-types" },
    ],
  },
  {
    label: "Reference",
    children: [
      { label: "Models", section: "reference-models" },
      { label: "Error Codes", section: "error-codes" },
    ],
  },
  { label: "Changelog", section: "changelog" },
];

export const DEFAULT_DOC_SECTION = "introduction";

export const DOC_SECTION_IDS = [
  "introduction",
  "versioning",
  "rate-limiting",
  "error-handling",
  "data-types",
  "quick-start",
  "authentication",
  "consent-flow",
  "driver-score",
  "driver-events",
  "driver-summary",
  "fleet-query",
  "bulk-access",
  "webhooks-overview",
  "webhook-event-types",
  "reference-models",
  "error-codes",
  "changelog",
];

export function isValidDocSection(id) {
  return DOC_SECTION_IDS.includes(id);
}

export function findParentLabels(nav, sectionId) {
  const parents = [];
  nav.forEach((item) => {
    if (item.children?.some((c) => c.section === sectionId)) {
      parents.push(item.label);
    }
  });
  return parents;
}

export function sectionFromHash(hash) {
  const id = (hash || "").replace(/^#/, "");
  return isValidDocSection(id) ? id : DEFAULT_DOC_SECTION;
}

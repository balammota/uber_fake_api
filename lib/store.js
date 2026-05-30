const TOKEN_TTL_MS = 30000;
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_LOGS = 500;

function getStore() {
  if (!globalThis.__uberFakeApiStore) {
    globalThis.__uberFakeApiStore = {
      tokens: new Map(),
      rateLimits: new Map(),
      campaigns: new Map(),
      webhooks: [],
      logs: [],
    };
  }
  return globalThis.__uberFakeApiStore;
}

export const CLIENT_CREDENTIALS = {
  "uber-partner": { secret: "secret123", environment: "sandbox" },
  "uber-partner-sandbox": { secret: "sandbox-secret123", environment: "sandbox" },
  "uber-partner-prod": { secret: "prod-secret456", environment: "production" },
};

export function getTokenTtlMs() {
  return TOKEN_TTL_MS;
}

export function createToken(environment) {
  const store = getStore();
  const token = `fake-token-${Date.now()}`;
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  store.tokens.set(token, { token, expiresAt, environment });
  return { token, expiresAt, environment };
}

export function getTokenEntry(token) {
  const store = getStore();
  const entry = store.tokens.get(token);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.tokens.delete(token);
    return "expired";
  }
  return entry;
}

export function checkAndRecordRateLimit(token) {
  const store = getStore();
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  let timestamps = store.rateLimits.get(token) || [];
  timestamps = timestamps.filter((t) => t > windowStart);

  if (timestamps.length >= RATE_LIMIT_MAX) {
    const resetAt = timestamps[0] + RATE_LIMIT_WINDOW_MS;
    return { allowed: false, remaining: 0, resetAt };
  }

  timestamps.push(now);
  store.rateLimits.set(token, timestamps);
  const remaining = RATE_LIMIT_MAX - timestamps.length;
  const resetAt = timestamps[0] + RATE_LIMIT_WINDOW_MS;

  return { allowed: true, remaining, resetAt };
}

export function createCampaign(data) {
  const store = getStore();
  const campaign_id = `campaign_${Date.now()}`;
  const campaign = {
    campaign_id,
    name: data.name,
    budget: data.budget,
    advertiserId: data.advertiserId,
    startDate: data.startDate,
    endDate: data.endDate,
    status: "active",
    created_at: Date.now(),
  };
  store.campaigns.set(campaign_id, campaign);
  return campaign;
}

export function getAllCampaigns() {
  return Array.from(getStore().campaigns.values());
}

export function getCampaign(campaign_id) {
  return getStore().campaigns.get(campaign_id) || null;
}

export function addWebhook(payload) {
  const store = getStore();
  const entry = {
    ...payload,
    received_at: Date.now(),
  };
  store.webhooks.push(entry);
  return entry;
}

export function getAllWebhooks() {
  return getStore().webhooks;
}

export function addLog(entry) {
  const store = getStore();
  store.logs.push(entry);
  if (store.logs.length > MAX_LOGS) {
    store.logs.splice(0, store.logs.length - MAX_LOGS);
  }
}

export function getRecentLogs(limit = 50) {
  const logs = getStore().logs;
  return logs.slice(-limit);
}

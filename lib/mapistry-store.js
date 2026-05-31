import {
  RELATED_UNITS,
  buildMapistrySeed,
  getSiteTags,
  getSiteUsers,
} from "@/lib/mapistry-data";

const MAX_REQUEST_LOGS = 200;

function getStore() {
  if (!globalThis.__mapistryStore) {
    const seed = buildMapistrySeed();
    globalThis.__mapistryStore = {
      sites: new Map(seed.sites.map((s) => [s.id, s])),
      logs: new Map(seed.logs.map((l) => [`${l.siteId}:${l.id}`, l])),
      entries: new Map(seed.entries.map((e) => [e.id, e])),
      siteMeta: seed.siteMeta,
      rateLimits: new Map(),
      requestLogs: [],
      requestLogCounter: 0,
      seeded: true,
    };
    seedSampleRequestLogs(globalThis.__mapistryStore);
  }
  return globalThis.__mapistryStore;
}

function seedSampleRequestLogs(store) {
  const samples = [
    { method: "GET", endpoint: "/api/mapistry/sites", status: 200, apiKey: "test-api-key-mapistry-123", duration: 42 },
    { method: "GET", endpoint: "/api/mapistry/sites/site_1", status: 200, apiKey: "test-api-key-mapistry-123", duration: 28 },
    { method: "GET", endpoint: "/api/mapistry/sites/site_999", status: 404, apiKey: "test-api-key-mapistry-123", duration: 15 },
    { method: "GET", endpoint: "/api/mapistry/sites", status: 401, apiKey: "invalid-key", duration: 8 },
    { method: "GET", endpoint: "/api/mapistry/edp/sites/site_1/logs/log_1_1/entries", status: 429, apiKey: "test-api-key-mapistry-123", duration: 12 },
    { method: "POST", endpoint: "/api/mapistry/edp/sites/site_2/logs/log_2_1/entries", status: 201, apiKey: "test-api-key-mapistry-123", duration: 67 },
  ];
  const base = Date.now() - 3600000;
  samples.forEach((s, i) => {
    store.requestLogCounter += 1;
    store.requestLogs.push({
      id: `log_${store.requestLogCounter}`,
      timestamp: base + i * 300000,
      ...s,
    });
  });
}

export function addMapistryRequestLog(entry) {
  const store = getStore();
  store.requestLogCounter += 1;
  const log = {
    id: `log_${store.requestLogCounter}`,
    timestamp: Date.now(),
    method: entry.method,
    endpoint: entry.endpoint,
    status: entry.status,
    apiKey: entry.apiKey,
    duration: entry.duration,
  };
  store.requestLogs.push(log);
  if (store.requestLogs.length > MAX_REQUEST_LOGS) {
    store.requestLogs.splice(0, store.requestLogs.length - MAX_REQUEST_LOGS);
  }
  return log;
}

export function getMapistryRequestLogs(limit = 50) {
  const logs = getStore().requestLogs;
  return logs.slice(-limit);
}

export function getSiteStats() {
  const store = getStore();
  const sites = getAllSites();
  const complianceLogs = Array.from(store.logs.values());
  const entries = Array.from(store.entries.values());

  let co2Sum = 0;
  let co2Count = 0;
  entries.forEach((e) => {
    const val = e.fieldValues?.field_1?.value;
    if (typeof val === "number") {
      co2Sum += val;
      co2Count += 1;
    }
  });

  const sitesByCity = {};
  sites.forEach((s) => {
    const city = s.siteCity || "Unknown";
    sitesByCity[city] = (sitesByCity[city] || 0) + 1;
  });

  return {
    totalSites: sites.length,
    activeLogs: complianceLogs.length,
    totalEntries: entries.length,
    avgCO2: co2Count ? Math.round((co2Sum / co2Count) * 10) / 10 : 0,
    sitesByCity,
  };
}

export function getEntryCountForLog(siteId, logId) {
  return getEntriesForLog(siteId, logId)?.length ?? 0;
}

export function getAllSites() {
  return Array.from(getStore().sites.values());
}

export function getSite(siteId) {
  return getStore().sites.get(siteId) || null;
}

export function getSiteTagsForSite(siteId) {
  return getSiteTags(siteId, getStore().siteMeta);
}

export function getSiteUsersForSite(siteId) {
  if (!getSite(siteId)) return null;
  return getSiteUsers(siteId);
}

export function getLogsForSite(siteId) {
  if (!getSite(siteId)) return null;
  return Array.from(getStore().logs.values()).filter((l) => l.siteId === siteId);
}

export function getLog(siteId, logId) {
  return getStore().logs.get(`${siteId}:${logId}`) || null;
}

export function getEntriesForLog(siteId, logId) {
  if (!getLog(siteId, logId)) return null;
  return Array.from(getStore().entries.values()).filter(
    (e) => e.siteId === siteId && e.logId === logId
  );
}

export function getEntry(siteId, logId, entryId) {
  const entry = getStore().entries.get(entryId);
  if (!entry || entry.siteId !== siteId || entry.logId !== logId) return null;
  return entry;
}

export function createEntry(siteId, logId, data) {
  const entryId = `entry_${Date.now()}`;
  const now = new Date().toISOString();
  const entry = {
    id: entryId,
    siteId,
    logId,
    logDate: data.logDate,
    isComplete: data.isComplete ?? true,
    createdBy: "inspector@srm.com",
    updatedBy: "inspector@srm.com",
    createdAt: now,
    updatedAt: now,
    fieldValues: data.fieldValues,
  };
  getStore().entries.set(entryId, entry);
  return entry;
}

export function deleteEntry(siteId, logId, entryId) {
  const entry = getEntry(siteId, logId, entryId);
  if (!entry) return false;
  getStore().entries.delete(entryId);
  return true;
}

export function getRelatedUnits() {
  return RELATED_UNITS;
}

export function checkMapistryRateLimit(apiKey) {
  const store = getStore();
  const windowMs = 60 * 1000;
  const max = 100;
  const now = Date.now();
  const windowStart = now - windowMs;
  let timestamps = store.rateLimits.get(apiKey) || [];
  timestamps = timestamps.filter((t) => t > windowStart);

  if (timestamps.length >= max) {
    const resetAt = timestamps[0] + windowMs;
    return { allowed: false, remaining: 0, resetAt, retryAfter: 60 };
  }

  timestamps.push(now);
  store.rateLimits.set(apiKey, timestamps);
  const remaining = max - timestamps.length;
  const resetAt = timestamps[0] + windowMs;

  return { allowed: true, remaining, resetAt, retryAfter: 0 };
}

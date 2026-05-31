import {
  RELATED_UNITS,
  buildMapistrySeed,
  getSiteTags,
  getSiteUsers,
} from "@/lib/mapistry-data";

function getStore() {
  if (!globalThis.__mapistryStore) {
    const seed = buildMapistrySeed();
    globalThis.__mapistryStore = {
      sites: new Map(seed.sites.map((s) => [s.id, s])),
      logs: new Map(seed.logs.map((l) => [`${l.siteId}:${l.id}`, l])),
      entries: new Map(seed.entries.map((e) => [e.id, e])),
      siteMeta: seed.siteMeta,
      rateLimits: new Map(),
      seeded: true,
    };
  }
  return globalThis.__mapistryStore;
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

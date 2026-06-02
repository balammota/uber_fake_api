import {
  RELATED_UNITS,
  getSiteTags,
  getSiteUsers,
} from "@/lib/mapistry-data";
import { seedMapistryDatabase, isMapistryDatabaseEmpty } from "@/lib/mapistry-seed";
import { createSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

const MAX_REQUEST_LOGS = 200;
const rateLimits = new Map();

let seedPromise = null;

async function getSupabase() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase credentials missing in environment");
  }
  return createSupabaseAdmin();
}

async function ensureSeeded() {
  if (!seedPromise) {
    seedPromise = (async () => {
      const supabase = await getSupabase();
      const empty = await isMapistryDatabaseEmpty(supabase);
      if (empty) {
        await seedMapistryDatabase(supabase);
      }
    })().catch((err) => {
      seedPromise = null;
      throw err;
    });
  }
  return seedPromise;
}

function rowToSite(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    state: row.state,
    siteAddress: row.site_address,
    siteCity: row.site_city,
    siteZip: row.site_zip,
    region: row.region,
  };
}

function rowToLog(row) {
  if (!row) return null;
  return {
    id: row.id,
    siteId: row.site_id,
    name: row.name,
    category: row.category,
    instructions: row.instructions,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    fields: row.fields ?? [],
  };
}

function rowToEntry(row) {
  if (!row) return null;
  return {
    id: row.id,
    siteId: row.site_id,
    logId: row.log_id,
    logDate: row.log_date,
    isComplete: row.is_complete,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    fieldValues: row.field_values ?? {},
  };
}

export async function addMapistryRequestLog(entry) {
  await ensureSeeded();
  const supabase = await getSupabase();
  const id = `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const row = {
    id,
    timestamp_ms: Date.now(),
    method: entry.method,
    endpoint: entry.endpoint,
    status: entry.status,
    api_key: entry.apiKey,
    duration: entry.duration ?? 0,
  };

  const { error } = await supabase.from("mapistry_request_logs").insert(row);
  if (error) {
    console.error("mapistry_request_logs insert:", error.message);
    return { id, timestamp: row.timestamp_ms, ...entry };
  }

  const { data: oldRows } = await supabase
    .from("mapistry_request_logs")
    .select("id")
    .order("timestamp_ms", { ascending: true });

  if (oldRows && oldRows.length > MAX_REQUEST_LOGS) {
    const toDelete = oldRows.slice(0, oldRows.length - MAX_REQUEST_LOGS).map((r) => r.id);
    await supabase.from("mapistry_request_logs").delete().in("id", toDelete);
  }

  return {
    id,
    timestamp: row.timestamp_ms,
    method: entry.method,
    endpoint: entry.endpoint,
    status: entry.status,
    apiKey: entry.apiKey,
    duration: entry.duration,
  };
}

export async function getMapistryRequestLogs(limit = 50) {
  await ensureSeeded();
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("mapistry_request_logs")
    .select("*")
    .order("timestamp_ms", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? [])
    .reverse()
    .map((row) => ({
      id: row.id,
      timestamp: row.timestamp_ms,
      method: row.method,
      endpoint: row.endpoint,
      status: row.status,
      apiKey: row.api_key,
      duration: row.duration,
    }));
}

export async function getSiteStats() {
  await ensureSeeded();
  const supabase = await getSupabase();

  const [
    { count: totalSites },
    { count: activeLogs },
    { count: totalEntries },
    { data: entryRows },
    { data: siteRows },
  ] = await Promise.all([
    supabase.from("mapistry_sites").select("*", { count: "exact", head: true }),
    supabase.from("mapistry_logs").select("*", { count: "exact", head: true }),
    supabase.from("mapistry_entries").select("*", { count: "exact", head: true }),
    supabase.from("mapistry_entries").select("field_values"),
    supabase.from("mapistry_sites").select("site_city"),
  ]);

  let co2Sum = 0;
  let co2Count = 0;
  (entryRows ?? []).forEach((e) => {
    const val = e.field_values?.field_1?.value;
    if (typeof val === "number") {
      co2Sum += val;
      co2Count += 1;
    }
  });

  const sitesByCity = {};
  (siteRows ?? []).forEach((s) => {
    const city = s.site_city || "Unknown";
    sitesByCity[city] = (sitesByCity[city] || 0) + 1;
  });

  return {
    totalSites: totalSites ?? 0,
    activeLogs: activeLogs ?? 0,
    totalEntries: totalEntries ?? 0,
    avgCO2: co2Count ? Math.round((co2Sum / co2Count) * 10) / 10 : 0,
    sitesByCity,
  };
}

export async function getEntryCountForLog(siteId, logId) {
  await ensureSeeded();
  const supabase = await getSupabase();
  const { count, error } = await supabase
    .from("mapistry_entries")
    .select("*", { count: "exact", head: true })
    .eq("site_id", siteId)
    .eq("log_id", logId);

  if (error) throw error;
  return count ?? 0;
}

export async function getAllSites() {
  await ensureSeeded();
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("mapistry_sites")
    .select("*")
    .order("id");

  if (error) throw error;
  return (data ?? []).map(rowToSite);
}

export async function getSite(siteId) {
  await ensureSeeded();
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("mapistry_sites")
    .select("*")
    .eq("id", siteId)
    .maybeSingle();

  if (error) throw error;
  return rowToSite(data);
}

export async function getSiteTagsForSite(siteId) {
  const site = await getSite(siteId);
  if (!site) return null;
  return getSiteTags(siteId, [{ id: siteId, region: site.region }]);
}

export async function getSiteUsersForSite(siteId) {
  if (!(await getSite(siteId))) return null;
  return getSiteUsers(siteId);
}

export async function getLogsForSite(siteId) {
  if (!(await getSite(siteId))) return null;
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("mapistry_logs")
    .select("*")
    .eq("site_id", siteId)
    .order("id");

  if (error) throw error;
  return (data ?? []).map(rowToLog);
}

export async function getLog(siteId, logId) {
  await ensureSeeded();
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("mapistry_logs")
    .select("*")
    .eq("site_id", siteId)
    .eq("id", logId)
    .maybeSingle();

  if (error) throw error;
  return rowToLog(data);
}

export async function getEntriesForLog(siteId, logId) {
  if (!(await getLog(siteId, logId))) return null;
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("mapistry_entries")
    .select("*")
    .eq("site_id", siteId)
    .eq("log_id", logId)
    .order("log_date", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(rowToEntry);
}

export async function getEntry(siteId, logId, entryId) {
  await ensureSeeded();
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("mapistry_entries")
    .select("*")
    .eq("id", entryId)
    .maybeSingle();

  if (error) throw error;
  const entry = rowToEntry(data);
  if (!entry || entry.siteId !== siteId || entry.logId !== logId) return null;
  return entry;
}

export async function createEntry(siteId, logId, data) {
  await ensureSeeded();
  const supabase = await getSupabase();
  const entryId = `entry_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const now = new Date().toISOString();
  const row = {
    id: entryId,
    site_id: siteId,
    log_id: logId,
    log_date: data.logDate,
    is_complete: data.isComplete ?? true,
    created_by: "inspector@srm.com",
    updated_by: "inspector@srm.com",
    created_at: now,
    updated_at: now,
    field_values: data.fieldValues,
  };

  const { data: inserted, error } = await supabase
    .from("mapistry_entries")
    .insert(row)
    .select()
    .single();

  if (error) throw error;
  return rowToEntry(inserted);
}

export async function deleteEntry(siteId, logId, entryId) {
  const entry = await getEntry(siteId, logId, entryId);
  if (!entry) return false;

  const supabase = await getSupabase();
  const { error } = await supabase.from("mapistry_entries").delete().eq("id", entryId);

  if (error) throw error;
  return true;
}

export function getRelatedUnits() {
  return RELATED_UNITS;
}

export function checkMapistryRateLimit(apiKey) {
  const windowMs = 60 * 1000;
  const max = 100;
  const now = Date.now();
  const windowStart = now - windowMs;
  let timestamps = rateLimits.get(apiKey) || [];
  timestamps = timestamps.filter((t) => t > windowStart);

  if (timestamps.length >= max) {
    const resetAt = timestamps[0] + windowMs;
    return { allowed: false, remaining: 0, resetAt, retryAfter: 60 };
  }

  timestamps.push(now);
  rateLimits.set(apiKey, timestamps);
  const remaining = max - timestamps.length;
  const resetAt = timestamps[0] + windowMs;

  return { allowed: true, remaining, resetAt, retryAfter: 0 };
}

/** Manual re-seed (e.g. setup script). */
export async function resetAndSeedMapistry() {
  const supabase = await getSupabase();
  await supabase.from("mapistry_entries").delete().not("id", "is", null);
  await supabase.from("mapistry_logs").delete().not("id", "is", null);
  await supabase.from("mapistry_sites").delete().not("id", "is", null);
  seedPromise = null;
  return seedMapistryDatabase(supabase);
}

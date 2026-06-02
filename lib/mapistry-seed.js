import { buildMapistrySeed } from "@/lib/mapistry-data";

const BATCH = 200;

function siteRow(site) {
  return {
    id: site.id,
    name: site.name,
    state: site.state,
    site_address: site.siteAddress,
    site_city: site.siteCity,
    site_zip: site.siteZip,
    region: site.region ?? null,
  };
}

function logRow(log) {
  return {
    id: log.id,
    site_id: log.siteId,
    name: log.name,
    category: log.category,
    instructions: log.instructions,
    fields: log.fields,
    created_at: log.createdAt,
    updated_at: log.updatedAt,
  };
}

function entryRow(entry) {
  return {
    id: entry.id,
    site_id: entry.siteId,
    log_id: entry.logId,
    log_date: entry.logDate,
    is_complete: entry.isComplete,
    created_by: entry.createdBy,
    updated_by: entry.updatedBy,
    created_at: entry.createdAt,
    updated_at: entry.updatedAt,
    field_values: entry.fieldValues,
  };
}

async function upsertBatches(supabase, table, rows) {
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const { error } = await supabase.from(table).upsert(chunk, { onConflict: "id" });
    if (error) {
      if (error.message?.includes("row-level security")) {
        throw new Error(
          "RLS bloquea el seed. Ejecuta supabase/fix-rls.sql en el SQL Editor de Supabase."
        );
      }
      throw error;
    }
  }
}

async function upsertLogBatches(supabase, rows) {
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const { error } = await supabase
      .from("mapistry_logs")
      .upsert(chunk, { onConflict: "site_id,id" });
    if (error) {
      if (error.message?.includes("row-level security")) {
        throw new Error(
          "RLS bloquea el seed. Ejecuta supabase/fix-rls.sql en el SQL Editor de Supabase."
        );
      }
      throw error;
    }
  }
}

export async function seedMapistryDatabase(supabase) {
  const seed = buildMapistrySeed();
  const siteRows = seed.siteMeta.map((s) => siteRow(s));
  const logRows = seed.logs.map(logRow);
  const entryRows = seed.entries.map(entryRow);

  await upsertBatches(supabase, "mapistry_sites", siteRows);
  await upsertLogBatches(supabase, logRows);
  await upsertBatches(supabase, "mapistry_entries", entryRows);

  const samples = [
    {
      method: "GET",
      endpoint: "/api/mapistry/sites",
      status: 200,
      api_key: "test-api-key-mapistry-123",
      duration: 42,
    },
    {
      method: "POST",
      endpoint: "/api/mapistry/edp/sites/site_2/logs/log_2_1/entries",
      status: 201,
      api_key: "test-api-key-mapistry-123",
      duration: 67,
    },
  ];
  const base = Date.now() - 3600000;
  const requestRows = samples.map((s, i) => ({
    id: `seed_log_${i + 1}`,
    timestamp_ms: base + i * 300000,
    method: s.method,
    endpoint: s.endpoint,
    status: s.status,
    api_key: s.api_key,
    duration: s.duration,
  }));

  const { error: reqErr } = await supabase
    .from("mapistry_request_logs")
    .upsert(requestRows, { onConflict: "id" });
  if (reqErr) throw reqErr;

  return {
    sites: siteRows.length,
    logs: logRows.length,
    entries: entryRows.length,
  };
}

export async function isMapistryDatabaseEmpty(supabase) {
  const { count, error } = await supabase
    .from("mapistry_sites")
    .select("*", { count: "exact", head: true });

  if (error) {
    if (
      error.code === "42P01" ||
      error.code === "PGRST205" ||
      error.message?.includes("does not exist") ||
      error.message?.includes("Could not find")
    ) {
      throw new Error(
        "Las tablas de Mapistry no existen. Ejecuta supabase/schema.sql en el SQL Editor de Supabase."
      );
    }
    if (error.message?.includes("row-level security")) {
      throw new Error(
        "RLS bloquea el acceso. Ejecuta supabase/fix-rls.sql en el SQL Editor de Supabase."
      );
    }
    throw error;
  }

  return (count ?? 0) === 0;
}

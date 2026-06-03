import { createSupabaseAdmin } from "@/lib/supabase";
import { buildScoreRow, gradeFromScore } from "@/lib/telematics-utils";
import {
  ensureDriverPool,
  pickRandomItems,
  SANDBOX_BATCH_SIZE,
  SANDBOX_POOL_SIZE,
  upsertDriverPool,
} from "@/lib/sandbox-driver-pool";
import { MIXED_SCENARIO_SCORES, SEED_EVENTS, SEED_SCORES } from "@/lib/sandbox-seed";

const PROGRESSIVE = "progressive_ins";

function clamp(n) {
  return Math.min(100, Math.max(0, Math.round(n)));
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function latestScoresByDriver(supabase) {
  const { data: scores, error } = await supabase
    .from("telematics_scores")
    .select("*")
    .order("recorded_at", { ascending: false });
  if (error) throw error;
  const map = new Map();
  for (const row of scores || []) {
    if (!map.has(row.driver_id)) map.set(row.driver_id, row);
  }
  return map;
}

async function incrementPartnerCalls(supabase, partnerId, count) {
  const { data: partner } = await supabase
    .from("telematics_partners")
    .select("api_calls_total, api_calls_today")
    .eq("partner_id", partnerId)
    .single();
  await supabase
    .from("telematics_partners")
    .update({
      api_calls_total: (partner?.api_calls_total || 0) + count,
      api_calls_today: (partner?.api_calls_today || 0) + count,
    })
    .eq("partner_id", partnerId);
}

function computeScore(scenario, prevScore, index, driverId, degradationTargets) {
  switch (scenario) {
    case "random":
      return clamp(prevScore + rand(5, 15) * (Math.random() > 0.5 ? 1 : -1));
    case "all_well":
      return rand(80, 95);
    case "mixed": {
      const base = MIXED_SCENARIO_SCORES[index] ?? rand(50, 95);
      return clamp(base + rand(-10, 10));
    }
    case "high_risk":
      return rand(40, 65);
    case "improvement":
      return clamp(prevScore + rand(10, 15));
    case "degradation":
      if (degradationTargets?.has(driverId)) return clamp(prevScore - rand(15, 22));
      return clamp(prevScore + rand(-3, 3));
    default:
      return clamp(prevScore + rand(-5, 5));
  }
}

function buildEventRow(driverId, score) {
  const riskFactor = Math.max(0, 100 - score) / 100;
  const braking = Math.max(0, Math.round(riskFactor * rand(8, 18)));
  const acceleration = Math.max(0, Math.round(riskFactor * rand(6, 14)));
  const speeding = Math.max(0, Math.round(riskFactor * rand(4, 12)));
  const phone = Math.max(0, Math.round(riskFactor * rand(2, 8)));
  return {
    driver_id: driverId,
    harsh_braking: braking,
    harsh_acceleration: acceleration,
    speeding,
    phone_usage: phone,
    night_driving_pct: Number((rand(8, 35) + riskFactor * 20).toFixed(1)),
    per_100_miles_braking: Number((braking * rand(2, 5) * 0.1).toFixed(2)),
    per_100_miles_acceleration: Number((acceleration * rand(2, 5) * 0.1).toFixed(2)),
    per_100_miles_speeding: Number((speeding * rand(2, 4) * 0.1).toFixed(2)),
    period_days: 90,
    recorded_at: new Date().toISOString(),
  };
}

export async function generateRateLimitStressLogs(supabase) {
  await ensureDriverPool(supabase);
  const { data: drivers, error: dErr } = await supabase.from("telematics_drivers").select("driver_id");
  if (dErr) throw dErr;
  const driverIds = (drivers || []).map((d) => d.driver_id);
  if (!driverIds.length) throw new Error("No drivers available");

  const now = Date.now();
  const statuses = [200, 200, 200, 403, 429];
  const endpoints = [
    "/telematics/drivers/driver_001/score",
    "/telematics/drivers/driver_002/summary",
    "/telematics/drivers/driver_003/score",
  ];
  const rows = Array.from({ length: 50 }, (_, i) => {
    const driverId = driverIds[rand(0, driverIds.length - 1)];
    return {
      partner_id: PROGRESSIVE,
      driver_id: driverId,
      endpoint: endpoints[i % endpoints.length].replace(/driver_\d+/, driverId),
      method: "GET",
      status_code: statuses[rand(0, statuses.length - 1)],
      response_time_ms: rand(80, 450),
      timestamp_ms: now - rand(0, 3600000),
      created_at: new Date(now - rand(0, 3600000)).toISOString(),
    };
  });

  const { error } = await supabase.from("telematics_logs").insert(rows);
  if (error) throw error;
  await incrementPartnerCalls(supabase, PROGRESSIVE, 50);
  return { logCount: 50, results: [] };
}

export async function generateSandboxScores(type, scenario) {
  const supabase = createSupabaseAdmin();
  const effectiveScenario = type === "random" ? "random" : scenario;

  if (effectiveScenario === "rate_limit_stress") {
    return generateRateLimitStressLogs(supabase);
  }

  await ensureDriverPool(supabase);

  const { data: allDrivers, error: dErr } = await supabase
    .from("telematics_drivers")
    .select("driver_id")
    .order("driver_id");
  if (dErr) throw dErr;

  const selectedDrivers = pickRandomItems(allDrivers || [], SANDBOX_BATCH_SIZE);
  const degradationTargets =
    effectiveScenario === "degradation"
      ? new Set(pickRandomItems(selectedDrivers, 3).map((d) => d.driver_id))
      : null;

  const latestMap = await latestScoresByDriver(supabase);
  const results = [];
  const webhookScenarios = ["improvement", "degradation", "random"];

  for (let i = 0; i < selectedDrivers.length; i++) {
    const { driver_id } = selectedDrivers[i];
    const latest = latestMap.get(driver_id);
    const prevScore = latest?.score ?? rand(55, 85);
    const newScore = computeScore(effectiveScenario, prevScore, i, driver_id, degradationTargets);
    const change = newScore - prevScore;
    const row = buildScoreRow(driver_id, newScore, latest || {});

    const { error: insErr } = await supabase.from("telematics_scores").insert(row);
    if (insErr) throw insErr;

    const { error: evErr } = await supabase.from("telematics_events").insert(buildEventRow(driver_id, newScore));
    if (evErr) throw evErr;

    let webhookTriggered = false;
    if (webhookScenarios.includes(effectiveScenario) && Math.abs(change) >= 10) {
      await supabase.from("telematics_webhooks").insert({
        driver_id,
        partner_id: PROGRESSIVE,
        event_type: "score_change",
        previous_score: prevScore,
        new_score: newScore,
        change,
        delivered: false,
      });
      webhookTriggered = true;
    }

    results.push({
      driver_id,
      previous_score: prevScore,
      new_score: newScore,
      change,
      grade: gradeFromScore(newScore),
      webhook_triggered: webhookTriggered,
    });
  }

  return {
    results,
    updated: results.length,
    batch_size: SANDBOX_BATCH_SIZE,
  };
}

export async function sandboxConsentAction(action, { driverId, partnerId }) {
  const supabase = createSupabaseAdmin();

  if (action === "reset_all") {
    const { error } = await supabase
      .from("telematics_drivers")
      .update({ consent_status: "active" })
      .neq("driver_id", "");
    if (error) throw error;
    return { message: "All drivers reset to active consent" };
  }

  if (!driverId) throw new Error("driver_id required");

  if (action === "grant") {
    const { error } = await supabase
      .from("telematics_drivers")
      .update({ consent_status: "active", consent_given_at: new Date().toISOString() })
      .eq("driver_id", driverId);
    if (error) throw error;
    await supabase.from("telematics_webhooks").insert({
      driver_id: driverId,
      partner_id: partnerId || PROGRESSIVE,
      event_type: "consent_accepted",
      delivered: false,
    });
    return { message: `Consent granted for ${driverId}` };
  }

  if (action === "revoke") {
    const { error } = await supabase
      .from("telematics_drivers")
      .update({ consent_status: "revoked" })
      .eq("driver_id", driverId);
    if (error) throw error;
    await supabase.from("telematics_webhooks").insert({
      driver_id: driverId,
      partner_id: PROGRESSIVE,
      event_type: "consent_revoked",
      delivered: false,
    });
    return { message: `Consent revoked for ${driverId}` };
  }

  throw new Error("Unknown consent action");
}

function pickStatus(type) {
  if (type === "normal") {
    return Math.random() < 0.9 ? 200 : 404;
  }
  const r = Math.random();
  if (r < 0.4) return r < 0.15 ? 500 : 403;
  return 200;
}

export async function simulateSandboxTraffic(type) {
  const supabase = createSupabaseAdmin();
  await ensureDriverPool(supabase);
  const { data: drivers, error: dErr } = await supabase.from("telematics_drivers").select("driver_id");
  if (dErr) throw dErr;
  const driverIds = (drivers || []).map((d) => d.driver_id);
  if (!driverIds.length) throw new Error("No drivers available");

  const count = type === "error_spike" ? 30 : 20;
  const endpoints = [
    "/telematics/drivers/driver_001/score",
    "/telematics/drivers/driver_002/summary",
    "/telematics/drivers/driver_003/score",
    "/telematics/drivers/driver_004/summary",
  ];

  const rows = Array.from({ length: count }, (_, i) => {
    const driverId = driverIds[rand(0, driverIds.length - 1)];
    return {
      partner_id: PROGRESSIVE,
      driver_id: driverId,
      endpoint: endpoints[i % endpoints.length].replace(/driver_\d+/, driverId),
      method: "GET",
      status_code: pickStatus(type),
      response_time_ms: rand(80, 200),
      timestamp_ms: Date.now() - rand(0, 3600000),
      created_at: new Date(Date.now() - rand(0, 3600000)).toISOString(),
    };
  });

  const { error } = await supabase.from("telematics_logs").insert(rows);
  if (error) throw error;

  if (type === "rate_limit") {
    await supabase
      .from("telematics_partners")
      .update({ api_calls_today: 8500 })
      .eq("partner_id", PROGRESSIVE);
    return { logged: count, message: "Rate limit approach simulated — 8,500 calls today" };
  }

  await incrementPartnerCalls(supabase, PROGRESSIVE, count);
  return {
    logged: count,
    message: `✅ ${count} API calls logged — check Uber Portal → API Logs`,
  };
}

export async function resetSandboxData() {
  const supabase = createSupabaseAdmin();

  await supabase.from("telematics_logs").delete().neq("partner_id", "");
  await supabase.from("telematics_webhooks").delete().neq("driver_id", "");
  await supabase.from("telematics_scores").delete().neq("driver_id", "");
  await supabase.from("telematics_events").delete().neq("driver_id", "");

  await upsertDriverPool(supabase);

  const scoreRows = SEED_SCORES.map((s) => ({
    ...s,
    period_days: 90,
    recorded_at: new Date().toISOString(),
  }));
  const { error: sErr } = await supabase.from("telematics_scores").insert(scoreRows);
  if (sErr) throw sErr;

  const eventRows = SEED_EVENTS.map((e) => ({
    ...e,
    period_days: 90,
    recorded_at: new Date().toISOString(),
  }));
  const { error: eErr } = await supabase.from("telematics_events").insert(eventRows);
  if (eErr) throw eErr;

  await supabase
    .from("telematics_drivers")
    .update({ consent_status: "active" })
    .neq("driver_id", "");

  // Restore demo consent edge cases on the original 10 drivers.
  await supabase.from("telematics_drivers").update({ consent_status: "pending" }).eq("driver_id", "driver_009");
  await supabase.from("telematics_drivers").update({ consent_status: "revoked" }).eq("driver_id", "driver_010");

  const { data: partners } = await supabase.from("telematics_partners").select("partner_id");
  for (const p of partners || []) {
    await supabase
      .from("telematics_partners")
      .update({ api_calls_today: 0 })
      .eq("partner_id", p.partner_id);
  }

  return { message: "Sandbox reset to default state" };
}

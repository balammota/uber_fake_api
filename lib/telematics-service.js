import { createSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import {
  buildScoreRow,
  latestScoresByDriver,
  PROGRESSIVE_PARTNER_ID,
} from "@/lib/telematics-utils";

export async function generateTelematicsScores() {
  const supabase = createSupabaseAdmin();
  const { data: drivers, error: dErr } = await supabase
    .from("telematics_drivers")
    .select("driver_id")
    .eq("consent_status", "active");

  if (dErr) throw dErr;

  let updated = 0;
  let webhooks = 0;

  for (const { driver_id } of drivers || []) {
    const { data: latest } = await supabase
      .from("telematics_scores")
      .select("*")
      .eq("driver_id", driver_id)
      .order("recorded_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const prevScore = latest?.score ?? 70;
    const delta = Math.floor(Math.random() * 23) - 11;
    const newScore = Math.min(100, Math.max(0, prevScore + delta));
    const row = buildScoreRow(driver_id, newScore, latest || {});

    const { error: insErr } = await supabase.from("telematics_scores").insert(row);
    if (insErr) throw insErr;

    updated += 1;

    if (Math.abs(newScore - prevScore) > 10) {
      await supabase.from("telematics_webhooks").insert({
        driver_id,
        partner_id: PROGRESSIVE_PARTNER_ID,
        event_type: "score_change",
        previous_score: prevScore,
        new_score: newScore,
        change: newScore - prevScore,
        delivered: false,
      });
      webhooks += 1;
    }
  }

  return { updated, webhooks };
}

export async function simulateTelematicsApiCalls(origin) {
  const supabase = createSupabaseAdmin();
  const partnerId = PROGRESSIVE_PARTNER_ID;
  let logged = 0;
  let accessToken = null;

  for (let i = 0; i < 5; i++) {
    const ts = Date.now();
    const start = Date.now();
    const tokenRes = await fetch(`${origin}/api/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: "uber-partner-sandbox",
        client_secret: "sandbox-secret123",
        grant_type: "client_credentials",
      }),
    });
    const tokenMs = Date.now() - start;
    let tokenBody = null;
    try {
      tokenBody = await tokenRes.json();
    } catch {
      tokenBody = null;
    }
    if (tokenRes.ok && tokenBody?.access_token) {
      accessToken = tokenBody.access_token;
    }

    await supabase.from("telematics_logs").insert({
      partner_id: partnerId,
      driver_id: null,
      endpoint: "/api/oauth/token",
      method: "POST",
      status_code: tokenRes.status,
      response_time_ms: tokenMs,
      timestamp_ms: ts,
    });
    logged += 1;
  }

  for (let i = 0; i < 5; i++) {
    if (!accessToken) {
      const start = Date.now();
      const tokenRes = await fetch(`${origin}/api/oauth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: "uber-partner-sandbox",
          client_secret: "sandbox-secret123",
          grant_type: "client_credentials",
        }),
      });
      const tokenMs = Date.now() - start;
      try {
        const tokenBody = await tokenRes.json();
        if (tokenRes.ok && tokenBody?.access_token) accessToken = tokenBody.access_token;
      } catch {
        /* ignore */
      }
      void tokenMs;
    }
    const start2 = Date.now();
    const summaryRes = await fetch(`${origin}/api/drivers/summary`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
    const summaryMs = Date.now() - start2;
    await supabase.from("telematics_logs").insert({
      partner_id: partnerId,
      driver_id: null,
      endpoint: "/api/drivers/summary",
      method: "GET",
      status_code: summaryRes.status,
      response_time_ms: summaryMs,
      timestamp_ms: Date.now(),
    });
    logged += 1;
  }

  const { data: partner } = await supabase
    .from("telematics_partners")
    .select("api_calls_total, api_calls_today")
    .eq("partner_id", partnerId)
    .single();

  await supabase
    .from("telematics_partners")
    .update({
      api_calls_total: (partner?.api_calls_total || 0) + logged,
      api_calls_today: (partner?.api_calls_today || 0) + logged,
    })
    .eq("partner_id", partnerId);

  return { logged };
}

export async function queryDriverScore(driverId) {
  const supabase = createSupabaseAdmin();
  const { data: driver, error: dErr } = await supabase
    .from("telematics_drivers")
    .select("*")
    .eq("driver_id", driverId)
    .maybeSingle();

  const responseMs = 45 + Math.floor(Math.random() * 76);

  if (dErr || !driver) {
    await supabase.from("telematics_logs").insert({
      partner_id: PROGRESSIVE_PARTNER_ID,
      driver_id: driverId,
      endpoint: "/score",
      method: "GET",
      status_code: 404,
      response_time_ms: responseMs,
      timestamp_ms: Date.now(),
    });
    return { ok: false, status: 404, message: "Driver not found" };
  }

  if (driver.consent_status !== "active") {
    await supabase.from("telematics_logs").insert({
      partner_id: PROGRESSIVE_PARTNER_ID,
      driver_id: driverId,
      endpoint: "/score",
      method: "GET",
      status_code: 403,
      response_time_ms: responseMs,
      timestamp_ms: Date.now(),
    });
    return {
      ok: false,
      status: 403,
      message: `Consent is ${driver.consent_status}. Driver must have active consent.`,
    };
  }

  const { data: score } = await supabase
    .from("telematics_scores")
    .select("*")
    .eq("driver_id", driverId)
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  await supabase.from("telematics_logs").insert({
    partner_id: PROGRESSIVE_PARTNER_ID,
    driver_id: driverId,
    endpoint: "/score",
    method: "GET",
    status_code: 200,
    response_time_ms: responseMs,
    timestamp_ms: Date.now(),
  });

  const { data: partner } = await supabase
    .from("telematics_partners")
    .select("api_calls_total, api_calls_today")
    .eq("partner_id", PROGRESSIVE_PARTNER_ID)
    .single();

  await supabase
    .from("telematics_partners")
    .update({
      api_calls_total: (partner?.api_calls_total || 0) + 1,
      api_calls_today: (partner?.api_calls_today || 0) + 1,
    })
    .eq("partner_id", PROGRESSIVE_PARTNER_ID);

  return { ok: true, status: 200, driver, score };
}

function formatScorePayload(driverId, scoreRow, periodDays = 90) {
  if (!scoreRow) return null;
  return {
    driver_id: driverId,
    score: scoreRow.score,
    percentile: scoreRow.percentile,
    grade: scoreRow.grade,
    period_days: periodDays,
    trips_analyzed: scoreRow.trips_analyzed,
    miles_analyzed: Number(scoreRow.miles_analyzed),
    last_updated: scoreRow.recorded_at,
    score_breakdown: {
      speed_compliance: scoreRow.speed_compliance,
      smooth_braking: scoreRow.smooth_braking,
      smooth_acceleration: scoreRow.smooth_acceleration,
      phone_usage: scoreRow.phone_usage,
      night_driving_safety: scoreRow.night_driving_safety,
    },
  };
}

function formatEventsPayload(driverId, eventRow, periodDays = 90) {
  const per100 = (count, miles) =>
    miles ? Number(((count / miles) * 100).toFixed(2)) : 0;
  const miles = Number(eventRow?.miles_analyzed || eventRow?.total_miles || 10000) || 10000;

  return {
    driver_id: driverId,
    period_days: periodDays,
    total_trips: eventRow?.trips_analyzed || 0,
    total_miles: miles,
    events: {
      harsh_braking: {
        count: eventRow?.harsh_braking ?? 0,
        per_100_miles: Number(eventRow?.per_100_miles_braking ?? per100(eventRow?.harsh_braking ?? 0, miles)),
      },
      harsh_acceleration: {
        count: eventRow?.harsh_acceleration ?? 0,
        per_100_miles: Number(
          eventRow?.per_100_miles_acceleration ?? per100(eventRow?.harsh_acceleration ?? 0, miles)
        ),
      },
      speeding: {
        count: eventRow?.speeding ?? 0,
        per_100_miles: Number(eventRow?.per_100_miles_speeding ?? per100(eventRow?.speeding ?? 0, miles)),
      },
      phone_usage: {
        count: eventRow?.phone_usage ?? 0,
        per_100_miles: 0.08,
      },
      night_driving_pct: Number(eventRow?.night_driving_pct ?? 0),
    },
  };
}

/** Read-only driver score for GET /api/telematics/drivers/:id/score (no logging). */
export async function getDriverScoreApi(driverId, period = 90) {
  const supabase = createSupabaseAdmin();
  const { data: driver, error: dErr } = await supabase
    .from("telematics_drivers")
    .select("*")
    .eq("driver_id", driverId)
    .maybeSingle();

  if (dErr || !driver) {
    return { ok: false, status: 404, code: "NotFound", message: "Driver not found" };
  }
  if (driver.consent_status !== "active") {
    return {
      ok: false,
      status: 403,
      code: "ConsentRequired",
      message: "This driver has not provided consent for data sharing.",
    };
  }

  const { data: score } = await supabase
    .from("telematics_scores")
    .select("*")
    .eq("driver_id", driverId)
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!score) {
    return { ok: false, status: 404, code: "NotFound", message: "Driver not found" };
  }

  return {
    ok: true,
    status: 200,
    body: formatScorePayload(driverId, score, period),
    driver,
    score,
  };
}

/** Read-only driver summary for GET /api/telematics/drivers/:id/summary (no logging). */
export async function getDriverSummaryApi(driverId) {
  const result = await getDriverScoreApi(driverId);
  if (!result.ok) return result;

  const supabase = createSupabaseAdmin();
  const { data: eventRow } = await supabase
    .from("telematics_events")
    .select("*")
    .eq("driver_id", driverId)
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const scorePayload = result.body;
  return {
    ok: true,
    status: 200,
    body: {
      driver_id: driverId,
      driver_name: result.driver.driver_name,
      city: result.driver.city,
      consent_status: result.driver.consent_status,
      consent_expires: result.driver.consent_expires_at,
      period_days: scorePayload.period_days,
      last_updated: scorePayload.last_updated,
      score: scorePayload.score,
      percentile: scorePayload.percentile,
      grade: scorePayload.grade,
      trips_analyzed: scorePayload.trips_analyzed,
      miles_analyzed: scorePayload.miles_analyzed,
      score_breakdown: scorePayload.score_breakdown,
      events: formatEventsPayload(driverId, {
        ...eventRow,
        trips_analyzed: scorePayload.trips_analyzed,
        miles_analyzed: scorePayload.miles_analyzed,
      }).events,
    },
    driver: result.driver,
    score: result.score,
    events: eventRow,
  };
}

export { isSupabaseConfigured, latestScoresByDriver };

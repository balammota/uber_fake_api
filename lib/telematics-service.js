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

export { isSupabaseConfigured, latestScoresByDriver };

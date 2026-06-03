import { NextResponse } from "next/server";
import { createSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { STATESAFE_PARTNER_ID } from "@/lib/statesafe-constants";

export async function POST(request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  try {
    const { driver_id, endpoint, status_code, response_time_ms } = await request.json();
    const supabase = createSupabaseAdmin();

    const { error: logErr } = await supabase.from("telematics_logs").insert({
      partner_id: STATESAFE_PARTNER_ID,
      driver_id: driver_id || null,
      endpoint,
      method: "GET",
      status_code,
      response_time_ms,
      timestamp_ms: Date.now(),
    });
    if (logErr) throw logErr;

    const { data: partner } = await supabase
      .from("telematics_partners")
      .select("api_calls_total, api_calls_today")
      .eq("partner_id", STATESAFE_PARTNER_ID)
      .single();

    if (partner) {
      const { error: partnerErr } = await supabase
        .from("telematics_partners")
        .update({
          api_calls_total: (partner.api_calls_total || 0) + 1,
          api_calls_today: (partner.api_calls_today || 0) + 1,
        })
        .eq("partner_id", STATESAFE_PARTNER_ID);
      if (partnerErr) throw partnerErr;
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err?.message || "Failed to log API call" }, { status: 500 });
  }
}

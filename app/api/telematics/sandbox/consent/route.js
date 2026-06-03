import { NextResponse } from "next/server";
import { sandboxConsentAction } from "@/lib/sandbox-service";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function POST(request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  try {
    const body = await request.json();
    const result = await sandboxConsentAction(body.action, {
      driverId: body.driver_id,
      partnerId: body.partner_id,
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err?.message || "Consent action failed" }, { status: 500 });
  }
}

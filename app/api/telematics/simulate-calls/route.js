import { NextResponse } from "next/server";
import { simulateTelematicsApiCalls } from "@/lib/telematics-service";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function POST(request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  try {
    const origin = new URL(request.url).origin;
    const result = await simulateTelematicsApiCalls(origin);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err?.message || "Failed to simulate calls" },
      { status: 500 }
    );
  }
}

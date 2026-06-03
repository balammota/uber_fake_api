import { NextResponse } from "next/server";
import { simulateSandboxTraffic } from "@/lib/sandbox-service";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function POST(request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  try {
    const body = await request.json();
    const type = body.type || "normal";
    const result = await simulateSandboxTraffic(type);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err?.message || "Simulation failed" }, { status: 500 });
  }
}

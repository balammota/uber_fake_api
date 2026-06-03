import { NextResponse } from "next/server";
import { resetSandboxData } from "@/lib/sandbox-service";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function POST() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  try {
    const result = await resetSandboxData();
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err?.message || "Reset failed" }, { status: 500 });
  }
}

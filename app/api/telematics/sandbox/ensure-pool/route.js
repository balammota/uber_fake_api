import { NextResponse } from "next/server";
import { ensureDriverPool, SANDBOX_POOL_SIZE } from "@/lib/sandbox-driver-pool";
import { createSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export async function POST() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  try {
    const supabase = createSupabaseAdmin();
    const count = await ensureDriverPool(supabase);
    return NextResponse.json({ ok: true, pool_size: SANDBOX_POOL_SIZE, drivers: count });
  } catch (err) {
    return NextResponse.json({ error: err?.message || "Failed to ensure driver pool" }, { status: 500 });
  }
}

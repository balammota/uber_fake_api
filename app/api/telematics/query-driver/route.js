import { NextResponse } from "next/server";
import { queryDriverScore } from "@/lib/telematics-service";
import { isSupabaseConfigured } from "@/lib/supabase";
import { recommendationFromScore } from "@/lib/telematics-utils";

export async function POST(request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  try {
    const { driver_id } = await request.json();
    if (!driver_id?.trim()) {
      return NextResponse.json({ error: "driver_id is required" }, { status: 400 });
    }
    const result = await queryDriverScore(driver_id.trim());
    if (!result.ok) {
      return NextResponse.json(result, { status: result.status });
    }
    return NextResponse.json({
      ...result,
      recommendation: recommendationFromScore(result.score?.score ?? 0),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err?.message || "Query failed" },
      { status: 500 }
    );
  }
}

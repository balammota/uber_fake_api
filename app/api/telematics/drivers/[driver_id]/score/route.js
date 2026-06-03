import { NextResponse } from "next/server";
import { getDriverScoreApi } from "@/lib/telematics-service";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function GET(request, { params }) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  const driverId = params.driver_id;
  const { searchParams } = new URL(request.url);
  const period = Number(searchParams.get("period") || 90);

  try {
    const result = await getDriverScoreApi(driverId, period);
    if (!result.ok) {
      return NextResponse.json(
        { code: result.code, message: result.message },
        { status: result.status }
      );
    }
    return NextResponse.json(result.body);
  } catch (err) {
    return NextResponse.json(
      { code: "Internal", message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getDriverSummaryApi } from "@/lib/telematics-service";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function GET(_request, { params }) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  try {
    const result = await getDriverSummaryApi(params.driver_id);
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

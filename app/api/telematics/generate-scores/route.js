import { NextResponse } from "next/server";
import { generateTelematicsScores } from "@/lib/telematics-service";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function POST() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  try {
    const result = await generateTelematicsScores();
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err?.message || "Failed to generate scores" },
      { status: 500 }
    );
  }
}

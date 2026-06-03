import { NextResponse } from "next/server";
import { generateSandboxScores } from "@/lib/sandbox-service";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function POST(request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  try {
    const body = await request.json();
    const type = body.type === "scenario" ? "scenario" : "random";
    const scenario = body.scenario || "random";
    const result = await generateSandboxScores(type, scenario);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err?.message || "Generation failed" }, { status: 500 });
  }
}

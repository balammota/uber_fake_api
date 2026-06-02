/**
 * Seed Mapistry tables in Supabase.
 * 1. Run supabase/schema.sql in Supabase SQL Editor first.
 * 2. node --env-file=.env.local scripts/seed-mapistry.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// Dynamic import of seed (ESM from built data - inline minimal seed call)
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or publishable key in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false },
});

// Load seed via dynamic import of compiled module - use fetch to local API instead
async function main() {
  console.log("Seeding via API (dev server must be running) or use SQL + first GET /api/mapistry/sites");
  console.log("Alternatively: npm run dev, then curl -H 'x-api-key: test-api-key-mapistry-123' http://localhost:3000/api/mapistry/sites");
  console.log("\nTo seed from this script, run schema.sql first, then start the app — first API call auto-seeds.");
  const { error: probeError } = await supabase
    .from("mapistry_sites")
    .select("id")
    .limit(1);

  if (probeError) {
    console.error("Error:", probeError.message);
    if (
      probeError.message?.includes("Could not find") ||
      probeError.code === "PGRST205"
    ) {
      console.error("\n→ Las tablas no existen. Ejecuta supabase/schema.sql en el SQL Editor de Supabase.");
    }
    process.exit(1);
  }

  const { count, error } = await supabase
    .from("mapistry_sites")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }

  const n = count ?? 0;
  console.log(`Sites in database: ${n}`);
  if (n === 0) {
    console.log("Database empty — run: npm run dev, then:");
    console.log("  curl -H 'x-api-key: test-api-key-mapistry-123' http://localhost:3000/api/mapistry/sites");
  } else {
    console.log("Database already has seed data.");
  }
}

main();

/** Synthetic driver pool for the telematics sandbox (500 drivers, 10 selected per generation). */

export const SANDBOX_POOL_SIZE = 500;
export const SANDBOX_BATCH_SIZE = 10;

const ORIGINAL_DRIVERS = [
  { driver_id: "driver_001", driver_name: "Carlos Mendoza", city: "Chicago", consent_status: "active" },
  { driver_id: "driver_002", driver_name: "Sarah Johnson", city: "Chicago", consent_status: "active" },
  { driver_id: "driver_003", driver_name: "Miguel Torres", city: "Dallas", consent_status: "active" },
  { driver_id: "driver_004", driver_name: "Emily Chen", city: "Chicago", consent_status: "active" },
  { driver_id: "driver_005", driver_name: "James Wilson", city: "Houston", consent_status: "active" },
  { driver_id: "driver_006", driver_name: "Ana Garcia", city: "Dallas", consent_status: "active" },
  { driver_id: "driver_007", driver_name: "David Kim", city: "Chicago", consent_status: "active" },
  { driver_id: "driver_008", driver_name: "Maria Rodriguez", city: "Houston", consent_status: "active" },
  { driver_id: "driver_009", driver_name: "Robert Smith", city: "Dallas", consent_status: "pending" },
  { driver_id: "driver_010", driver_name: "Lisa Anderson", city: "Chicago", consent_status: "revoked" },
];

const FIRST_NAMES = [
  "Carlos",
  "Sarah",
  "Miguel",
  "Emily",
  "James",
  "Ana",
  "David",
  "Maria",
  "Robert",
  "Lisa",
  "Jordan",
  "Taylor",
  "Alex",
  "Sam",
  "Chris",
  "Pat",
  "Jamie",
  "Morgan",
  "Riley",
  "Casey",
  "Derek",
  "Nina",
  "Omar",
  "Priya",
  "Wei",
];

const LAST_NAMES = [
  "Mendoza",
  "Johnson",
  "Torres",
  "Chen",
  "Wilson",
  "Garcia",
  "Kim",
  "Rodriguez",
  "Smith",
  "Anderson",
  "Brooks",
  "Carter",
  "Diaz",
  "Evans",
  "Foster",
  "Gray",
  "Hayes",
  "Ibrahim",
  "Jackson",
  "Kumar",
  "Lopez",
  "Martinez",
  "Nguyen",
  "Patel",
  "Reed",
];

const CITIES = ["Chicago", "Dallas", "Houston", "Phoenix", "Denver", "Atlanta", "Miami", "Seattle"];

export function driverIdForIndex(index) {
  return `driver_${String(index).padStart(3, "0")}`;
}

function consentForIndex(index) {
  if (index <= 10) return ORIGINAL_DRIVERS[index - 1].consent_status;
  const mod = index % 20;
  if (mod === 0) return "revoked";
  if (mod === 1 || mod === 2) return "pending";
  return "active";
}

export function buildDriverPool(size = SANDBOX_POOL_SIZE) {
  const pool = [];
  for (let i = 1; i <= size; i++) {
    if (i <= ORIGINAL_DRIVERS.length) {
      pool.push({ ...ORIGINAL_DRIVERS[i - 1] });
      continue;
    }
    pool.push({
      driver_id: driverIdForIndex(i),
      driver_name: `${FIRST_NAMES[i % FIRST_NAMES.length]} ${LAST_NAMES[(i * 7) % LAST_NAMES.length]}`,
      city: CITIES[i % CITIES.length],
      consent_status: consentForIndex(i),
    });
  }
  return pool;
}

export function pickRandomItems(items, count) {
  const copy = [...items];
  const picked = [];
  const n = Math.min(count, copy.length);
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    picked.push(copy.splice(idx, 1)[0]);
  }
  return picked;
}

export async function upsertDriverPool(supabase, size = SANDBOX_POOL_SIZE) {
  const pool = buildDriverPool(size);
  const chunkSize = 100;
  for (let i = 0; i < pool.length; i += chunkSize) {
    const chunk = pool.slice(i, i + chunkSize);
    const { error } = await supabase.from("telematics_drivers").upsert(chunk, {
      onConflict: "driver_id",
    });
    if (error) throw error;
  }
  return pool.length;
}

export async function ensureDriverPool(supabase, size = SANDBOX_POOL_SIZE) {
  const { count, error } = await supabase
    .from("telematics_drivers")
    .select("*", { count: "exact", head: true });
  if (error) throw error;
  if ((count || 0) >= size) return count || size;
  return upsertDriverPool(supabase, size);
}

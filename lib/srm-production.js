const SHIFTS = ["day", "night", "afternoon"];

const OPERATOR_NOTES = [
  "Normal operations",
  "Scheduled maintenance completed",
  "Production at full capacity",
  "Minor equipment adjustment",
  "Weather delay — operations resumed",
];

function randomBetween(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function calculateProductionEmissions(row) {
  const cement = Number(row.cement_produced_tons) || 0;
  const fuel = Number(row.fuel_consumed_liters) || 0;
  return {
    co2: Math.round(cement * 842),
    nox: Math.round(fuel * 0.0023 * 100) / 100,
    so2: Math.round(fuel * 0.0015 * 100) / 100,
    pm10: Math.round(cement * 8.9 * 100) / 100,
  };
}

export function generateProductionRow(plant) {
  const today = new Date().toISOString().slice(0, 10);
  const cement = randomBetween(800, 2500);
  const fuel = randomBetween(50000, 150000);
  const electricity = randomBetween(20000, 80000);

  const row = {
    site_id: plant.id,
    site_name: plant.name,
    cement_produced_tons: cement,
    fuel_consumed_liters: fuel,
    electricity_kwh: electricity,
    date: today,
    shift: pickRandom(SHIFTS),
    operator_notes: pickRandom(OPERATOR_NOTES),
  };

  return {
    ...row,
    emissions: calculateProductionEmissions(row),
  };
}

export function generateProductionForPlants(plants) {
  return plants.slice(0, 10).map((plant) => generateProductionRow(plant));
}

export function productionRowToSupabase(row) {
  return {
    site_id: row.site_id,
    site_name: row.site_name,
    cement_produced_tons: row.cement_produced_tons,
    fuel_consumed_liters: row.fuel_consumed_liters,
    electricity_kwh: row.electricity_kwh,
    date: row.date,
    shift: row.shift,
    operator_notes: row.operator_notes,
    uploaded_to_mapistry: false,
    uploaded_at: null,
  };
}

export function formatLastUploaded(isoString) {
  if (!isoString) return null;
  return new Date(isoString).toLocaleString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

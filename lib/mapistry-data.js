const SITE_DEFS = [
  {
    id: "site_1",
    name: "SRM Concrete - CDMX Plant 1",
    state: "Mexico City",
    siteAddress: "Av. Industrial 123",
    siteCity: "CDMX",
    siteZip: "06600",
    region: "North America",
  },
  {
    id: "site_2",
    name: "SRM Concrete - Dallas Plant",
    state: "Texas",
    siteAddress: "4520 Industrial Blvd",
    siteCity: "Dallas",
    siteZip: "75207",
    region: "Southwest",
  },
  {
    id: "site_3",
    name: "SRM Concrete - Houston Plant",
    state: "Texas",
    siteAddress: "8800 Navigation Blvd",
    siteCity: "Houston",
    siteZip: "77011",
    region: "Southwest",
  },
  {
    id: "site_4",
    name: "SRM Concrete - Phoenix Plant",
    state: "Arizona",
    siteAddress: "2100 W Buckeye Rd",
    siteCity: "Phoenix",
    siteZip: "85009",
    region: "Southwest",
  },
  {
    id: "site_5",
    name: "SRM Concrete - Denver Plant",
    state: "Colorado",
    siteAddress: "5500 Washington St",
    siteCity: "Denver",
    siteZip: "80216",
    region: "Mountain",
  },
  {
    id: "site_6",
    name: "SRM Concrete - Atlanta Plant",
    state: "Georgia",
    siteAddress: "1200 Marietta Blvd NW",
    siteCity: "Atlanta",
    siteZip: "30318",
    region: "Southeast",
  },
  {
    id: "site_7",
    name: "SRM Concrete - Chicago Plant",
    state: "Illinois",
    siteAddress: "3400 S Ashland Ave",
    siteCity: "Chicago",
    siteZip: "60608",
    region: "Midwest",
  },
  {
    id: "site_8",
    name: "SRM Concrete - Miami Plant",
    state: "Florida",
    siteAddress: "7800 NW 37th Ave",
    siteCity: "Miami",
    siteZip: "33147",
    region: "Southeast",
  },
  {
    id: "site_9",
    name: "SRM Concrete - Seattle Plant",
    state: "Washington",
    siteAddress: "5900 6th Ave S",
    siteCity: "Seattle",
    siteZip: "98108",
    region: "Pacific Northwest",
  },
  {
    id: "site_10",
    name: "SRM Concrete - Austin Plant",
    state: "Texas",
    siteAddress: "901 Shady Ln",
    siteCity: "Austin",
    siteZip: "78702",
    region: "Southwest",
  },
];

const LOG_DEFS = [
  {
    name: "Daily Emissions Log",
    category: "emissions",
    instructions: "Record daily emissions data",
  },
  {
    name: "Water Usage Log",
    category: "water",
    instructions: "Record daily water consumption",
  },
  {
    name: "Waste Disposal Log",
    category: "waste",
    instructions: "Document waste disposal activities",
  },
  {
    name: "Air Quality Log",
    category: "air_quality",
    instructions: "Monitor ambient air quality readings",
  },
  {
    name: "Safety Inspection Log",
    category: "safety",
    instructions: "Complete daily safety inspection checklist",
  },
];

const STANDARD_FIELDS = [
  {
    id: "field_1",
    name: "CO2 Emissions",
    fieldType: "numeric",
    isRequired: true,
    units: "kg",
  },
  {
    id: "field_2",
    name: "Inspection Date",
    fieldType: "date",
    isRequired: true,
  },
  {
    id: "field_3",
    name: "Inspector Notes",
    fieldType: "text",
    isRequired: false,
  },
  {
    id: "field_4",
    name: "Passed Inspection",
    fieldType: "boolean",
    isRequired: true,
  },
];

export const RELATED_UNITS = [
  { id: "kg", name: "Kilograms" },
  { id: "g", name: "Grams" },
  { id: "lb", name: "Pounds" },
  { id: "L", name: "Liters" },
  { id: "gal", name: "Gallons" },
  { id: "m3", name: "Cubic Meters" },
  { id: "ppm", name: "Parts Per Million" },
];

function buildFieldValues(dayIndex, logIndex) {
  const co2 = 400 + dayIndex * 5 + logIndex * 10;
  const date = `2025-01-${String(Math.min(dayIndex + 1, 28)).padStart(2, "0")}`;
  return {
    field_1: { value: co2, units: "kg" },
    field_2: { value: date },
    field_3: { value: dayIndex % 3 === 0 ? "Minor maintenance noted" : "All systems normal" },
    field_4: { value: dayIndex % 5 !== 0 },
  };
}

export function buildMapistrySeed() {
  const sites = SITE_DEFS.map(({ region, ...site }) => site);
  const logs = [];
  const entries = [];

  SITE_DEFS.forEach((site, siteIdx) => {
    LOG_DEFS.forEach((logDef, logIdx) => {
      const logId = `log_${siteIdx + 1}_${logIdx + 1}`;
      const created = "2025-01-01T00:00:00Z";
      logs.push({
        id: logId,
        siteId: site.id,
        name: logDef.name,
        category: logDef.category,
        instructions: logDef.instructions,
        createdAt: created,
        updatedAt: created,
        fields: STANDARD_FIELDS.map((f) => ({ ...f })),
      });

      for (let e = 0; e < 20; e++) {
        const entryNum = e + 1;
        const entryId = `entry_${siteIdx + 1}_${logIdx + 1}_${entryNum}`;
        const hour = String(8 + (e % 10)).padStart(2, "0");
        const day = String((e % 28) + 1).padStart(2, "0");
        const logDate = `2025-01-${day}T${hour}:00`;
        const iso = `2025-01-${day}T${hour}:00:00Z`;
        entries.push({
          id: entryId,
          siteId: site.id,
          logId,
          logDate,
          isComplete: e % 4 !== 3,
          createdBy: "inspector@srm.com",
          updatedBy: "inspector@srm.com",
          createdAt: iso,
          updatedAt: iso,
          fieldValues: buildFieldValues(e, logIdx),
        });
      }
    });
  });

  return { sites, logs, entries, siteMeta: SITE_DEFS };
}

export function getSiteTags(siteId, siteMeta) {
  const meta = siteMeta.find((s) => s.id === siteId);
  if (!meta) return null;
  return [
    { label: "Region", value: meta.region, siteId },
    { label: "Type", value: "Concrete Plant", siteId },
  ];
}

export function getSiteUsers(siteId) {
  return [
    {
      id: `user_${siteId}_1`,
      name: "John Inspector",
      email: "john@srm.com",
      jobTitle: "Environmental Inspector",
      siteId,
    },
    {
      id: `user_${siteId}_2`,
      name: "Sarah Manager",
      email: "sarah@srm.com",
      jobTitle: "Compliance Manager",
      siteId,
    },
  ];
}

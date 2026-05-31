export const CITIES = ["CDMX", "Guadalajara", "Monterrey", "Puebla"];

const menuTemplates = {
  tacos: [
    { name: "Tacos al pastor (3)", price: 85, category: "tacos", available: true },
    { name: "Tacos de suadero", price: 75, category: "tacos", available: true },
    { name: "Quesadilla grande", price: 95, category: "tacos", available: false },
  ],
  burgers: [
    { name: "Hamburguesa clásica", price: 149, category: "burgers", available: true },
    { name: "Doble cheeseburger", price: 189, category: "burgers", available: true },
    { name: "Papas a la francesa", price: 65, category: "burgers", available: true },
  ],
  pizza: [
    { name: "Pizza pepperoni mediana", price: 219, category: "pizza", available: true },
    { name: "Pizza hawaiana", price: 229, category: "pizza", available: false },
    { name: "Pizza cuatro quesos", price: 249, category: "pizza", available: true },
  ],
  sushi: [
    { name: "Roll California (8 pzas)", price: 165, category: "sushi", available: true },
    { name: "Combo sashimi", price: 320, category: "sushi", available: true },
    { name: "Ramen tonkotsu", price: 185, category: "sushi", available: false },
  ],
  mexican: [
    { name: "Enchiladas verdes", price: 135, category: "mexican", available: true },
    { name: "Mole con arroz", price: 175, category: "mexican", available: true },
    { name: "Agua de jamaica", price: 35, category: "drinks", available: true },
  ],
  seafood: [
    { name: "Ceviche de pescado", price: 155, category: "seafood", available: true },
    { name: "Tostada de atún", price: 125, category: "seafood", available: false },
  ],
  drinks: [
    { name: "Agua de horchata", price: 40, category: "drinks", available: true },
    { name: "Refresco 600ml", price: 35, category: "drinks", available: true },
  ],
};

function buildMenu(keys) {
  const items = [];
  keys.forEach((key) => {
    menuTemplates[key]?.forEach((item) => items.push({ ...item, id: `item_${items.length + 1}` }));
  });
  return items;
}

export const STORES = [
  {
    id: "store_1",
    name: "Taquería El Güero CDMX",
    status: "active",
    city: "CDMX",
    address: "Av. Insurgentes Sur 1248, Col. Del Valle, CDMX",
    rating: 4.8,
    menu: buildMenu(["tacos", "mexican", "drinks"]),
  },
  {
    id: "store_2",
    name: "Burger House Polanco",
    status: "active",
    city: "CDMX",
    address: "Av. Presidente Masaryk 201, Polanco, CDMX",
    rating: 4.6,
    menu: buildMenu(["burgers", "mexican"]),
  },
  {
    id: "store_3",
    name: "Pizzería Napolitana Condesa",
    status: "inactive",
    city: "CDMX",
    address: "Av. Tamaulipas 78, Condesa, CDMX",
    rating: 4.2,
    menu: buildMenu(["pizza", "mexican"]),
  },
  {
    id: "store_4",
    name: "Sushi Bar Roma Norte",
    status: "active",
    city: "CDMX",
    address: "Calle Orizaba 45, Roma Norte, CDMX",
    rating: 4.9,
    menu: buildMenu(["sushi", "seafood"]),
  },
  {
    id: "store_5",
    name: "Cocina de la Abuela Coyoacán",
    status: "active",
    city: "CDMX",
    address: "Av. Miguel Ángel de Quevedo 380, Coyoacán, CDMX",
    rating: 4.7,
    menu: buildMenu(["mexican", "tacos"]),
  },
  {
    id: "store_6",
    name: "Mariscos del Pacífico Santa Fe",
    status: "active",
    city: "CDMX",
    address: "Av. Vasco de Quiroga 3800, Santa Fe, CDMX",
    rating: 4.4,
    menu: buildMenu(["seafood", "mexican", "tacos"]),
  },
  {
    id: "store_7",
    name: "Tacos Don Pepe Centro Histórico",
    status: "inactive",
    city: "CDMX",
    address: "Calle República de Uruguay 34, Centro, CDMX",
    rating: 3.9,
    menu: buildMenu(["tacos"]),
  },
  {
    id: "store_8",
    name: "Green Bowl Juárez",
    status: "active",
    city: "CDMX",
    address: "Av. Juárez 112, Col. Juárez, CDMX",
    rating: 4.5,
    menu: buildMenu(["mexican", "sushi"]),
  },
  {
    id: "store_9",
    name: "Taquería Los Tapatíos",
    status: "active",
    city: "Guadalajara",
    address: "Av. Chapultepec 480, Col. Americana, Guadalajara, Jal.",
    rating: 4.6,
    menu: buildMenu(["tacos", "mexican"]),
  },
  {
    id: "store_10",
    name: "Burger Lab Providencia",
    status: "active",
    city: "Guadalajara",
    address: "Av. Providencia 1234, Guadalajara, Jal.",
    rating: 4.3,
    menu: buildMenu(["burgers", "pizza"]),
  },
  {
    id: "store_11",
    name: "Pizza Express Zapopan",
    status: "inactive",
    city: "Guadalajara",
    address: "Av. López Mateos Sur 2077, Zapopan, Jal.",
    rating: 3.8,
    menu: buildMenu(["pizza"]),
  },
  {
    id: "store_12",
    name: "Sushi Zen Guadalajara",
    status: "active",
    city: "Guadalajara",
    address: "Av. Patria 1891, Jardines de la Patria, Zapopan, Jal.",
    rating: 4.8,
    menu: buildMenu(["sushi", "seafood"]),
  },
  {
    id: "store_13",
    name: "El Norteño Grill Monterrey",
    status: "active",
    city: "Monterrey",
    address: "Av. Constitución 1200, Centro, Monterrey, N.L.",
    rating: 4.7,
    menu: buildMenu(["burgers", "mexican", "tacos"]),
  },
  {
    id: "store_14",
    name: "Tacos Regios San Pedro",
    status: "active",
    city: "Monterrey",
    address: "Calz. del Valle 400, San Pedro Garza García, N.L.",
    rating: 4.9,
    menu: buildMenu(["tacos", "burgers"]),
  },
  {
    id: "store_15",
    name: "Pizzería Roma Monterrey",
    status: "inactive",
    city: "Monterrey",
    address: "Av. Ruiz Cortines 4500, Col. Las Brisas, Monterrey, N.L.",
    rating: 3.5,
    menu: buildMenu(["pizza", "burgers"]),
  },
  {
    id: "store_16",
    name: "Mar y Tierra Cumbres",
    status: "active",
    city: "Monterrey",
    address: "Av. Paseo de los Leones 8201, Cumbres, Monterrey, N.L.",
    rating: 4.5,
    menu: buildMenu(["seafood", "sushi", "mexican"]),
  },
  {
    id: "store_17",
    name: "Cemitas La Poblana",
    status: "active",
    city: "Puebla",
    address: "Av. Juárez 2100, Centro Histórico, Puebla, Pue.",
    rating: 4.8,
    menu: buildMenu(["tacos", "mexican"]),
  },
  {
    id: "store_18",
    name: "Burger Station Angelópolis",
    status: "active",
    city: "Puebla",
    address: "Blvd. del Niño Poblano 2515, Angelópolis, Puebla, Pue.",
    rating: 4.1,
    menu: buildMenu(["burgers", "pizza"]),
  },
  {
    id: "store_19",
    name: "Sushi Puebla Centro",
    status: "inactive",
    city: "Puebla",
    address: "Calle 5 de Mayo 412, Centro, Puebla, Pue.",
    rating: 4.0,
    menu: buildMenu(["sushi"]),
  },
  {
    id: "store_20",
    name: "Antojitos Mexicanos Cholula",
    status: "active",
    city: "Puebla",
    address: "Calle 6 Sur 403, San Andrés Cholula, Pue.",
    rating: 5.0,
    menu: buildMenu(["mexican", "tacos", "burgers"]),
  },
].map((store) => ({
  ...store,
  menu: store.menu.map((item, i) => ({
    ...item,
    id: `${store.id}_item_${i + 1}`,
  })),
}));

export const SEED_CAMPAIGNS = [
  {
    campaign_id: "campaign_seed_1",
    name: "Verano CDMX 2025",
    budget: 85000,
    advertiserId: "adv_uber_mx_01",
    startDate: "2025-06-01",
    endDate: "2025-08-31",
    status: "active",
    created_at: 1717200000000,
  },
  {
    campaign_id: "campaign_seed_2",
    name: "Promo Navidad",
    budget: 100000,
    advertiserId: "adv_retail_gdl",
    startDate: "2025-11-15",
    endDate: "2026-01-06",
    status: "paused",
    created_at: 1714600000000,
  },
  {
    campaign_id: "campaign_seed_3",
    name: "Lanzamiento Tacos Regios",
    budget: 45000,
    advertiserId: "adv_food_mty",
    startDate: "2025-03-01",
    endDate: "2025-05-31",
    status: "completed",
    created_at: 1709400000000,
  },
  {
    campaign_id: "campaign_seed_4",
    name: "Burger Week Nacional",
    budget: 62000,
    advertiserId: "adv_uber_mx_02",
    startDate: "2025-04-10",
    endDate: "2025-04-17",
    status: "active",
    created_at: 1710000000000,
  },
  {
    campaign_id: "campaign_seed_5",
    name: "Pizza 2x1 Puebla",
    budget: 28000,
    advertiserId: "adv_puebla_food",
    startDate: "2025-07-01",
    endDate: "2025-07-31",
    status: "active",
    created_at: 1718000000000,
  },
  {
    campaign_id: "campaign_seed_6",
    name: "Sushi Lovers GDL",
    budget: 35000,
    advertiserId: "adv_gdl_rest",
    startDate: "2025-05-15",
    endDate: "2025-09-15",
    status: "active",
    created_at: 1716000000000,
  },
  {
    campaign_id: "campaign_seed_7",
    name: "Mariscos Fin de Semana",
    budget: 22000,
    advertiserId: "adv_seafood_mx",
    startDate: "2025-08-01",
    endDate: "2025-10-31",
    status: "paused",
    created_at: 1719000000000,
  },
  {
    campaign_id: "campaign_seed_8",
    name: "Día de la Madre 2025",
    budget: 75000,
    advertiserId: "adv_uber_mx_01",
    startDate: "2025-05-01",
    endDate: "2025-05-11",
    status: "completed",
    created_at: 1712000000000,
  },
  {
    campaign_id: "campaign_seed_9",
    name: "Antojitos Poblanos",
    budget: 15000,
    advertiserId: "adv_puebla_food",
    startDate: "2025-09-01",
    endDate: "2025-12-01",
    status: "active",
    created_at: 1720000000000,
  },
  {
    campaign_id: "campaign_seed_10",
    name: "Monterrey Grill Fest",
    budget: 54000,
    advertiserId: "adv_food_mty",
    startDate: "2025-06-20",
    endDate: "2025-07-20",
    status: "active",
    created_at: 1717500000000,
  },
  {
    campaign_id: "campaign_seed_11",
    name: "Envío Gratis CDMX Centro",
    budget: 12000,
    advertiserId: "adv_uber_mx_03",
    startDate: "2025-02-01",
    endDate: "2025-02-28",
    status: "paused",
    created_at: 1706800000000,
  },
  {
    campaign_id: "campaign_seed_12",
    name: "Nuevos Restaurantes Q3",
    budget: 48000,
    advertiserId: "adv_uber_mx_02",
    startDate: "2025-07-01",
    endDate: "2025-09-30",
    status: "active",
    created_at: 1718500000000,
  },
  {
    campaign_id: "campaign_seed_13",
    name: "Combo Familiar Invierno",
    budget: 33000,
    advertiserId: "adv_retail_gdl",
    startDate: "2025-12-01",
    endDate: "2026-02-28",
    status: "paused",
    created_at: 1722000000000,
  },
  {
    campaign_id: "campaign_seed_14",
    name: "Flash Sale Mediodía",
    budget: 8000,
    advertiserId: "adv_uber_mx_03",
    startDate: "2025-01-15",
    endDate: "2025-01-31",
    status: "completed",
    created_at: 1705000000000,
  },
  {
    campaign_id: "campaign_seed_15",
    name: "Top Rated Restaurants",
    budget: 95000,
    advertiserId: "adv_uber_mx_01",
    startDate: "2025-08-15",
    endDate: "2025-11-15",
    status: "active",
    created_at: 1719500000000,
  },
];

const orderItemsPool = [
  [{ name: "Tacos al pastor (3)", quantity: 2, price: 85 }],
  [{ name: "Hamburguesa clásica", quantity: 1, price: 149 }, { name: "Papas a la francesa", quantity: 1, price: 65 }],
  [{ name: "Pizza pepperoni mediana", quantity: 1, price: 219 }],
  [{ name: "Roll California (8 pzas)", quantity: 2, price: 165 }],
  [{ name: "Enchiladas verdes", quantity: 2, price: 135 }],
  [{ name: "Ceviche de pescado", quantity: 1, price: 155 }, { name: "Agua de jamaica", quantity: 2, price: 35 }],
  [{ name: "Doble cheeseburger", quantity: 3, price: 189 }],
  [{ name: "Tacos de suadero", quantity: 4, price: 75 }],
  [{ name: "Combo sashimi", quantity: 1, price: 320 }],
  [{ name: "Mole con arroz", quantity: 2, price: 175 }],
];

export const SEED_ORDERS = [
  { order_id: "order_seed_1", store_id: "store_1", items: orderItemsPool[0], total: 170, status: "delivered" },
  { order_id: "order_seed_2", store_id: "store_2", items: orderItemsPool[1], total: 214, status: "preparing" },
  { order_id: "order_seed_3", store_id: "store_4", items: orderItemsPool[3], total: 330, status: "received" },
  { order_id: "order_seed_4", store_id: "store_5", items: orderItemsPool[4], total: 270, status: "delivered" },
  { order_id: "order_seed_5", store_id: "store_9", items: orderItemsPool[0], total: 255, status: "cancelled" },
  { order_id: "order_seed_6", store_id: "store_10", items: orderItemsPool[1], total: 428, status: "delivered" },
  { order_id: "order_seed_7", store_id: "store_12", items: orderItemsPool[3], total: 495, status: "preparing" },
  { order_id: "order_seed_8", store_id: "store_13", items: orderItemsPool[6], total: 567, status: "received" },
  { order_id: "order_seed_9", store_id: "store_14", items: orderItemsPool[7], total: 300, status: "delivered" },
  { order_id: "order_seed_10", store_id: "store_16", items: orderItemsPool[5], total: 225, status: "delivered" },
  { order_id: "order_seed_11", store_id: "store_17", items: orderItemsPool[4], total: 405, status: "preparing" },
  { order_id: "order_seed_12", store_id: "store_18", items: orderItemsPool[2], total: 219, status: "received" },
  { order_id: "order_seed_13", store_id: "store_20", items: orderItemsPool[9], total: 350, status: "delivered" },
  { order_id: "order_seed_14", store_id: "store_1", items: orderItemsPool[7], total: 600, status: "cancelled" },
  { order_id: "order_seed_15", store_id: "store_6", items: orderItemsPool[5], total: 190, status: "delivered" },
  { order_id: "order_seed_16", store_id: "store_8", items: orderItemsPool[3], total: 165, status: "preparing" },
  { order_id: "order_seed_17", store_id: "store_2", items: orderItemsPool[6], total: 1890, status: "delivered" },
  { order_id: "order_seed_18", store_id: "store_4", items: orderItemsPool[8], total: 320, status: "received" },
  { order_id: "order_seed_19", store_id: "store_9", items: orderItemsPool[1], total: 514, status: "delivered" },
  { order_id: "order_seed_20", store_id: "store_14", items: orderItemsPool[0], total: 1275, status: "preparing" },
  { order_id: "order_seed_21", store_id: "store_17", items: orderItemsPool[7], total: 450, status: "delivered" },
  { order_id: "order_seed_22", store_id: "store_13", items: orderItemsPool[2], total: 658, status: "cancelled" },
  { order_id: "order_seed_23", store_id: "store_20", items: orderItemsPool[6], total: 1134, status: "received" },
  { order_id: "order_seed_24", store_id: "store_5", items: orderItemsPool[4], total: 540, status: "delivered" },
  { order_id: "order_seed_25", store_id: "store_12", items: orderItemsPool[8], total: 320, status: "preparing" },
  { order_id: "order_seed_26", store_id: "store_16", items: orderItemsPool[5], total: 1550, status: "delivered" },
  { order_id: "order_seed_27", store_id: "store_10", items: orderItemsPool[2], total: 438, status: "received" },
  { order_id: "order_seed_28", store_id: "store_18", items: orderItemsPool[1], total: 1070, status: "delivered" },
  { order_id: "order_seed_29", store_id: "store_1", items: orderItemsPool[9], total: 700, status: "cancelled" },
  { order_id: "order_seed_30", store_id: "store_14", items: orderItemsPool[6], total: 2000, status: "delivered" },
].map((o) => ({ ...o, created_at: 1710000000000 + parseInt(o.order_id.replace(/\D/g, ""), 10) * 100000 }));

export function getStoreSummaries() {
  return STORES.map(({ id, name, status, city, rating }) => ({
    id,
    name,
    status,
    city,
    rating,
  }));
}

export function getStoreById(storeId) {
  const store = STORES.find((s) => s.id === storeId);
  if (!store) return null;
  const { menu, ...detail } = store;
  return {
    ...detail,
    menu_items: menu,
    menu_count: menu.length,
  };
}

export function getStoreStats() {
  const active = STORES.filter((s) => s.status === "active");
  const inactive = STORES.filter((s) => s.status === "inactive");
  const avgRating =
    Math.round((STORES.reduce((sum, s) => sum + s.rating, 0) / STORES.length) * 10) / 10;

  return {
    total_stores: STORES.length,
    active_stores: active.length,
    inactive_stores: inactive.length,
    average_rating: avgRating,
    cities: CITIES,
  };
}

export function isValidStoreId(storeId) {
  return STORES.some((s) => s.id === storeId);
}

export function getCampaignStats(campaigns) {
  const active = campaigns.filter((c) => c.status === "active");
  const paused = campaigns.filter((c) => c.status === "paused");
  const completed = campaigns.filter((c) => c.status === "completed");
  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
  const top = [...campaigns].sort((a, b) => b.budget - a.budget)[0];

  return {
    total_campaigns: campaigns.length,
    total_budget: totalBudget,
    active_campaigns: active.length,
    paused_campaigns: paused.length,
    completed_campaigns: completed.length,
    top_campaign: top
      ? { name: top.name, budget: top.budget, status: top.status }
      : null,
  };
}

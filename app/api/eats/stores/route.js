import { handleOptions, jsonResponse, validateBearer } from "@/lib/api-helpers";

const STORES = [
  { id: "store_1", name: "Uber Eats CDMX Centro", status: "active" },
  { id: "store_2", name: "Uber Eats Polanco", status: "active" },
  { id: "store_3", name: "Uber Eats Condesa", status: "inactive" },
];

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request) {
  const authError = validateBearer(request);
  if (authError) return authError;

  return jsonResponse({ stores: STORES });
}

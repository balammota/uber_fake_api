import { handleOptions, jsonResponse, validateBearer } from "@/lib/api-helpers";

const STORE_DETAILS = {
  store_1: {
    id: "store_1",
    name: "Uber Eats CDMX Centro",
    status: "active",
    address: "Av. Juárez 123, CDMX",
    rating: 4.8,
  },
  store_2: {
    id: "store_2",
    name: "Uber Eats Polanco",
    status: "active",
    address: "Av. Presidente Masaryk 200, CDMX",
    rating: 4.6,
  },
  store_3: {
    id: "store_3",
    name: "Uber Eats Condesa",
    status: "inactive",
    address: "Av. Tamaulipas 45, CDMX",
    rating: 4.5,
  },
};

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request, { params }) {
  const authError = validateBearer(request);
  if (authError) return authError;

  const store = STORE_DETAILS[params.store_id];
  if (!store) {
    return jsonResponse(
      {
        error: "not_found",
        message: `Store ${params.store_id} not found`,
      },
      404
    );
  }

  return jsonResponse(store);
}

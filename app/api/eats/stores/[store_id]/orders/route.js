import { handleOptions, jsonResponse, validateBearer } from "@/lib/api-helpers";

const VALID_STORE_IDS = ["store_1", "store_2", "store_3"];

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request, { params }) {
  const authError = validateBearer(request);
  if (authError) return authError;

  if (!VALID_STORE_IDS.includes(params.store_id)) {
    return jsonResponse(
      {
        error: "not_found",
        message: `Store ${params.store_id} not found`,
      },
      404
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(
      { error: "invalid_request", message: "Invalid JSON body" },
      400
    );
  }

  const total = body.total ?? 300;

  return jsonResponse(
    {
      order_id: "order_xyz789",
      status: "received",
      store_id: params.store_id,
      total,
    },
    201
  );
}

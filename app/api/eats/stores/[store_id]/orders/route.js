import { handleOptions, handleProtectedRoute } from "@/lib/api-helpers";

const VALID_STORE_IDS = ["store_1", "store_2", "store_3"];

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request, { params }) {
  return handleProtectedRoute(
    request,
    `/api/eats/stores/${params.store_id}/orders`,
    async (req) => {
      if (!VALID_STORE_IDS.includes(params.store_id)) {
        return {
          body: {
            error: "not_found",
            message: `Store ${params.store_id} not found`,
          },
          status: 404,
        };
      }

      let body;
      try {
        body = await req.json();
      } catch {
        return {
          body: { error: "invalid_request", message: "Invalid JSON body" },
          status: 400,
        };
      }

      const total = body.total ?? 300;

      return {
        body: {
          order_id: "order_xyz789",
          status: "received",
          store_id: params.store_id,
          total,
        },
        status: 201,
      };
    }
  );
}

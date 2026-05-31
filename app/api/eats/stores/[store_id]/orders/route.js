import { handleOptions, handleProtectedRoute } from "@/lib/api-helpers";
import { createOrder, getStoreById, isValidStoreId } from "@/lib/store";

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request, { params }) {
  return handleProtectedRoute(
    request,
    `/api/eats/stores/${params.store_id}/orders`,
    async (req) => {
      if (!isValidStoreId(params.store_id)) {
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

      const items = body.items || [];
      const total = body.total ?? 300;

      const order = createOrder({
        store_id: params.store_id,
        items,
        total,
        status: "received",
      });

      return {
        body: {
          order_id: order.order_id,
          status: order.status,
          store_id: order.store_id,
          total: order.total,
        },
        status: 201,
      };
    }
  );
}

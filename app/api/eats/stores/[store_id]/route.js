import { handleOptions, handleProtectedRoute } from "@/lib/api-helpers";
import { getStoreById } from "@/lib/store";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request, { params }) {
  return handleProtectedRoute(
    request,
    `/api/eats/stores/${params.store_id}`,
    async () => {
      const store = getStoreById(params.store_id);
      if (!store) {
        return {
          body: {
            error: "not_found",
            message: `Store ${params.store_id} not found`,
          },
          status: 404,
        };
      }
      return { body: store };
    }
  );
}

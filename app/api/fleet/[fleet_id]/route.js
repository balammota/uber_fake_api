import { handleOptions, handleProtectedRoute } from "@/lib/api-helpers";
import { getStoreById } from "@/lib/store";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request, { params }) {
  return handleProtectedRoute(
    request,
    `/api/fleet/${params.fleet_id}`,
    async () => {
      const member = getStoreById(params.fleet_id);
      if (!member) {
        return {
          body: {
            error: "not_found",
            message: `Fleet member ${params.fleet_id} not found`,
          },
          status: 404,
        };
      }
      return { body: member };
    }
  );
}

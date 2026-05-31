import {
  handleMapistryOptions,
  handleMapistryProtectedRoute,
} from "@/lib/mapistry-helpers";
import { getSite } from "@/lib/mapistry-store";

export async function OPTIONS() {
  return handleMapistryOptions();
}

export async function GET(request, { params }) {
  return handleMapistryProtectedRoute(
    request,
    `/api/mapistry/sites/${params.siteId}`,
    async () => {
      const site = getSite(params.siteId);
      if (!site) {
        return {
          body: { error: "not_found", message: "Site not found" },
          status: 404,
        };
      }
      return { body: site };
    }
  );
}

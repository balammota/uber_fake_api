import {
  handleMapistryOptions,
  handleMapistryProtectedRoute,
} from "@/lib/mapistry-helpers";
import { getLogsForSite } from "@/lib/mapistry-store";

export async function OPTIONS() {
  return handleMapistryOptions();
}

export async function GET(request, { params }) {
  return handleMapistryProtectedRoute(
    request,
    `/api/mapistry/edp/sites/${params.siteId}/logs`,
    async () => {
      const logs = getLogsForSite(params.siteId);
      if (!logs) {
        return {
          body: { error: "not_found", message: "Site not found" },
          status: 404,
        };
      }
      return {
        body: {
          data: logs,
          meta: { page: { nextCursor: null, totalCount: logs.length } },
        },
      };
    }
  );
}

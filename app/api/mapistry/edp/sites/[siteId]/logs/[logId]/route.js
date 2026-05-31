import {
  handleMapistryOptions,
  handleMapistryProtectedRoute,
} from "@/lib/mapistry-helpers";
import { getLog, getSite } from "@/lib/mapistry-store";

export async function OPTIONS() {
  return handleMapistryOptions();
}

export async function GET(request, { params }) {
  return handleMapistryProtectedRoute(
    request,
    `/api/mapistry/edp/sites/${params.siteId}/logs/${params.logId}`,
    async () => {
      if (!getSite(params.siteId)) {
        return {
          body: { error: "not_found", message: "Site not found" },
          status: 404,
        };
      }
      const log = getLog(params.siteId, params.logId);
      if (!log) {
        return {
          body: { error: "not_found", message: "Log not found" },
          status: 404,
        };
      }
      return { body: log };
    }
  );
}

import {
  handleMapistryOptions,
  handleMapistryProtectedRoute,
} from "@/lib/mapistry-helpers";
import {
  deleteEntry,
  getEntry,
  getLog,
  getSite,
} from "@/lib/mapistry-store";

export async function OPTIONS() {
  return handleMapistryOptions();
}

export async function GET(request, { params }) {
  return handleMapistryProtectedRoute(
    request,
    `/api/mapistry/edp/sites/${params.siteId}/logs/${params.logId}/entries/${params.entryId}`,
    async () => {
      if (!(await getSite(params.siteId))) {
        return {
          body: { error: "not_found", message: "Site not found" },
          status: 404,
        };
      }
      if (!(await getLog(params.siteId, params.logId))) {
        return {
          body: { error: "not_found", message: "Log not found" },
          status: 404,
        };
      }
      const entry = await getEntry(params.siteId, params.logId, params.entryId);
      if (!entry) {
        return {
          body: { error: "not_found", message: "Entry not found" },
          status: 404,
        };
      }
      return { body: entry };
    }
  );
}

export async function DELETE(request, { params }) {
  return handleMapistryProtectedRoute(
    request,
    `/api/mapistry/edp/sites/${params.siteId}/logs/${params.logId}/entries/${params.entryId}`,
    async () => {
      if (!(await getSite(params.siteId))) {
        return {
          body: { error: "not_found", message: "Site not found" },
          status: 404,
        };
      }
      if (!(await getLog(params.siteId, params.logId))) {
        return {
          body: { error: "not_found", message: "Log not found" },
          status: 404,
        };
      }
      const deleted = await deleteEntry(
        params.siteId,
        params.logId,
        params.entryId
      );
      if (!deleted) {
        return {
          body: { error: "not_found", message: "Entry not found" },
          status: 404,
        };
      }
      return { noContent: true, status: 204 };
    }
  );
}

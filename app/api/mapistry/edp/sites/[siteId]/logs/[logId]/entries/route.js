import {
  handleMapistryOptions,
  handleMapistryProtectedRoute,
  paginate,
} from "@/lib/mapistry-helpers";
import {
  createEntry,
  getEntriesForLog,
  getLog,
  getSite,
} from "@/lib/mapistry-store";

export async function OPTIONS() {
  return handleMapistryOptions();
}

export async function GET(request, { params }) {
  return handleMapistryProtectedRoute(
    request,
    `/api/mapistry/edp/sites/${params.siteId}/logs/${params.logId}/entries`,
    async (req) => {
      if (!getSite(params.siteId)) {
        return {
          body: { error: "not_found", message: "Site not found" },
          status: 404,
        };
      }
      if (!getLog(params.siteId, params.logId)) {
        return {
          body: { error: "not_found", message: "Log not found" },
          status: 404,
        };
      }
      const entries = getEntriesForLog(params.siteId, params.logId) || [];
      const result = paginate(entries, req, 10);
      return { body: result };
    }
  );
}

export async function POST(request, { params }) {
  return handleMapistryProtectedRoute(
    request,
    `/api/mapistry/edp/sites/${params.siteId}/logs/${params.logId}/entries`,
    async (req) => {
      if (!getSite(params.siteId)) {
        return {
          body: { error: "not_found", message: "Site not found" },
          status: 404,
        };
      }
      if (!getLog(params.siteId, params.logId)) {
        return {
          body: { error: "not_found", message: "Log not found" },
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

      if (!body.logDate) {
        return {
          body: { error: "invalid_request", message: "logDate is required" },
          status: 400,
        };
      }

      if (!body.fieldValues) {
        return {
          body: { error: "invalid_request", message: "fieldValues is required" },
          status: 400,
        };
      }

      const entry = createEntry(params.siteId, params.logId, {
        logDate: body.logDate,
        isComplete: body.isComplete,
        fieldValues: body.fieldValues,
      });

      return {
        body: {
          id: entry.id,
          siteId: entry.siteId,
          logId: entry.logId,
          logDate: entry.logDate,
          isComplete: entry.isComplete,
          fieldValues: entry.fieldValues,
          createdAt: entry.createdAt,
        },
        status: 201,
      };
    }
  );
}

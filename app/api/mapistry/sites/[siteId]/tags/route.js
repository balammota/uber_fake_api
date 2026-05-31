import {
  handleMapistryOptions,
  handleMapistryProtectedRoute,
} from "@/lib/mapistry-helpers";
import { getSite, getSiteTagsForSite } from "@/lib/mapistry-store";

export async function OPTIONS() {
  return handleMapistryOptions();
}

export async function GET(request, { params }) {
  return handleMapistryProtectedRoute(
    request,
    `/api/mapistry/sites/${params.siteId}/tags`,
    async () => {
      if (!getSite(params.siteId)) {
        return {
          body: { error: "not_found", message: "Site not found" },
          status: 404,
        };
      }
      const tags = getSiteTagsForSite(params.siteId);
      return { body: { data: tags } };
    }
  );
}

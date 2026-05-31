import {
  handleMapistryOptions,
  handleMapistryProtectedRoute,
} from "@/lib/mapistry-helpers";
import { getSiteUsersForSite } from "@/lib/mapistry-store";

export async function OPTIONS() {
  return handleMapistryOptions();
}

export async function GET(request, { params }) {
  return handleMapistryProtectedRoute(
    request,
    `/api/mapistry/sites/${params.siteId}/users`,
    async () => {
      const users = getSiteUsersForSite(params.siteId);
      if (!users) {
        return {
          body: { error: "not_found", message: "Site not found" },
          status: 404,
        };
      }
      return { body: { data: users } };
    }
  );
}

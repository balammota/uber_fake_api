import {
  handleMapistryOptions,
  handleMapistryProtectedRoute,
  paginate,
} from "@/lib/mapistry-helpers";
import { getAllSites } from "@/lib/mapistry-store";

export async function OPTIONS() {
  return handleMapistryOptions();
}

export async function GET(request) {
  return handleMapistryProtectedRoute(request, "/api/mapistry/sites", async (req) => {
    const sites = getAllSites();
    const result = paginate(sites, req, 10);
    return { body: result };
  });
}

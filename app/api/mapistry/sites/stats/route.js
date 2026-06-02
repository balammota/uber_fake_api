import {
  handleMapistryOptions,
  handleMapistryProtectedRoute,
} from "@/lib/mapistry-helpers";
import { getSiteStats } from "@/lib/mapistry-store";

export async function OPTIONS() {
  return handleMapistryOptions();
}

export async function GET(request) {
  return handleMapistryProtectedRoute(request, "/api/mapistry/sites/stats", async () => ({
    body: await getSiteStats(),
  }));
}

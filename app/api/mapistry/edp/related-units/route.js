import {
  handleMapistryOptions,
  handleMapistryProtectedRoute,
} from "@/lib/mapistry-helpers";
import { getRelatedUnits } from "@/lib/mapistry-store";

export async function OPTIONS() {
  return handleMapistryOptions();
}

export async function GET(request) {
  return handleMapistryProtectedRoute(
    request,
    "/api/mapistry/edp/related-units",
    async () => ({
      body: { data: getRelatedUnits() },
    })
  );
}

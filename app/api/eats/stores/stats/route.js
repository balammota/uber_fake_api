import { handleOptions, handleProtectedRoute } from "@/lib/api-helpers";
import { getStoreStats } from "@/lib/store";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request) {
  return handleProtectedRoute(request, "/api/eats/stores/stats", async () => ({
    body: getStoreStats(),
  }));
}

import { handleOptions, handleProtectedRoute } from "@/lib/api-helpers";
import { getStoreSummaries } from "@/lib/store";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request) {
  return handleProtectedRoute(request, "/api/drivers/summary", async () => ({
    body: { drivers: getStoreSummaries() },
  }));
}

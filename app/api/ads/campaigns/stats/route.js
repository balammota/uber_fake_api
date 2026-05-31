import { handleOptions, handleProtectedRoute } from "@/lib/api-helpers";
import { getAdsCampaignStats } from "@/lib/store";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request) {
  return handleProtectedRoute(request, "/api/ads/campaigns/stats", async () => ({
    body: getAdsCampaignStats(),
  }));
}

import { handleOptions, handleProtectedRoute } from "@/lib/api-helpers";
import { getAllCampaigns } from "@/lib/store";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request) {
  return handleProtectedRoute(request, "/api/fleet/bulk", async () => {
    const campaigns = getAllCampaigns();
    return {
      body: {
        campaigns,
        total: campaigns.length,
      },
    };
  });
}

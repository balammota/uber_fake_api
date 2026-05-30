import { handleOptions, handleProtectedRoute } from "@/lib/api-helpers";
import { getCampaign } from "@/lib/store";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request, { params }) {
  return handleProtectedRoute(
    request,
    `/api/ads/campaigns/${params.campaign_id}`,
    async () => {
      const campaign = getCampaign(params.campaign_id);
      if (!campaign) {
        return {
          body: {
            error: "not_found",
            message: `Campaign ${params.campaign_id} not found`,
          },
          status: 404,
        };
      }
      return { body: campaign };
    }
  );
}

import { handleOptions, handleProtectedRoute } from "@/lib/api-helpers";
import { createCampaign, getAllCampaigns } from "@/lib/store";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request) {
  return handleProtectedRoute(request, "/api/ads/campaigns", async () => {
    const campaigns = getAllCampaigns();
    return {
      body: {
        campaigns,
        total: campaigns.length,
      },
    };
  });
}

export async function POST(request) {
  return handleProtectedRoute(request, "/api/ads/campaigns", async (req) => {
    let body;
    try {
      body = await req.json();
    } catch {
      return {
        body: { error: "invalid_request", message: "Invalid JSON body" },
        status: 400,
      };
    }

    const { name, budget, advertiserId, startDate, endDate } = body;

    if (!name || !advertiserId) {
      return {
        body: {
          error: "invalid_request",
          message: "name and advertiserId are required",
        },
        status: 400,
      };
    }

    if (typeof budget !== "number" || budget < 1000) {
      return {
        body: {
          error: "invalid_budget",
          message: "Minimum budget is 1000",
        },
        status: 400,
      };
    }

    const campaign = createCampaign({
      name,
      budget,
      advertiserId,
      startDate,
      endDate,
    });

    return {
      body: {
        campaign_id: campaign.campaign_id,
        name: campaign.name,
        budget: campaign.budget,
        status: campaign.status,
        created_at: campaign.created_at,
      },
      status: 201,
    };
  });
}

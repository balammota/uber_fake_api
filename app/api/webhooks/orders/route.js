import { handleOptions, handlePublicRoute } from "@/lib/api-helpers";
import { addWebhook, getAllWebhooks } from "@/lib/store";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request) {
  return handlePublicRoute(request, "/api/webhooks/orders", async () => {
    const webhooks = getAllWebhooks();
    return {
      body: {
        webhooks,
        total: webhooks.length,
      },
    };
  });
}

export async function POST(request) {
  return handlePublicRoute(request, "/api/webhooks/orders", async (req) => {
    let body;
    try {
      body = await req.json();
    } catch {
      return {
        body: { error: "invalid_request", message: "Invalid JSON body" },
        status: 400,
      };
    }

    addWebhook(body);

    return {
      body: {
        received: true,
        event: body.event,
      },
    };
  });
}

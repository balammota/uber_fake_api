import { handleOptions, handlePublicRoute } from "@/lib/api-helpers";
import { getRecentLogs } from "@/lib/store";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request) {
  return handlePublicRoute(request, "/api/drivers/events", async () => {
    const events = getRecentLogs(50);
    return {
      body: {
        events,
        total: events.length,
      },
    };
  });
}

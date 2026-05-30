import { handleOptions, handlePublicRoute } from "@/lib/api-helpers";
import { getRecentLogs } from "@/lib/store";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request) {
  return handlePublicRoute(request, "/api/logs", async () => {
    const logs = getRecentLogs(50);
    return {
      body: {
        logs,
        total: logs.length,
      },
    };
  });
}

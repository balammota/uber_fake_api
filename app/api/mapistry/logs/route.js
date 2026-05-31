import {
  handleMapistryOptions,
  handleMapistryPublicRoute,
} from "@/lib/mapistry-helpers";
import { getMapistryRequestLogs } from "@/lib/mapistry-store";

export async function OPTIONS() {
  return handleMapistryOptions();
}

export async function GET(request) {
  return handleMapistryPublicRoute(request, "/api/mapistry/logs", async () => {
    const logs = getMapistryRequestLogs(50);
    return {
      body: {
        logs,
        total: logs.length,
      },
    };
  });
}

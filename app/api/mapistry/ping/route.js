import {
  handleMapistryOptions,
  handleMapistryPublicRoute,
} from "@/lib/mapistry-helpers";

export async function OPTIONS() {
  return handleMapistryOptions();
}

export async function GET(request) {
  return handleMapistryPublicRoute(request, "/api/mapistry/ping", async () => ({
    body: { message: "pong", timestamp: Date.now() },
  }));
}

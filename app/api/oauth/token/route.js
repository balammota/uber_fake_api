import { handleOptions, handlePublicRoute } from "@/lib/api-helpers";
import {
  CLIENT_CREDENTIALS,
  createToken,
  getTokenTtlMs,
} from "@/lib/store";

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request) {
  return handlePublicRoute(request, "/api/oauth/token", async (req) => {
    let body;
    try {
      body = await req.json();
    } catch {
      return {
        body: { error: "invalid_request", message: "Invalid JSON body" },
        status: 400,
      };
    }

    const { client_id, client_secret, grant_type } = body;

    if (!grant_type) {
      return {
        body: { error: "invalid_request", message: "grant_type is required" },
        status: 400,
      };
    }

    const client = CLIENT_CREDENTIALS[client_id];
    if (!client || client.secret !== client_secret) {
      return {
        body: {
          error: "invalid_client",
          message: "Invalid client_id or client_secret",
        },
        status: 401,
      };
    }

    const { token, environment } = createToken(client.environment);
    const expiresInSeconds = Math.floor(getTokenTtlMs() / 1000);

    return {
      body: {
        access_token: token,
        expires_in: expiresInSeconds,
        token_type: "Bearer",
        environment,
      },
    };
  });
}

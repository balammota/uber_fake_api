import { handleOptions, jsonResponse } from "@/lib/api-helpers";

const VALID_CLIENT_ID = "uber-partner";
const VALID_CLIENT_SECRET = "secret123";

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(
      { error: "invalid_request", message: "Invalid JSON body" },
      400
    );
  }

  const { client_id, client_secret, grant_type } = body;

  if (!grant_type) {
    return jsonResponse(
      { error: "invalid_request", message: "grant_type is required" },
      400
    );
  }

  if (
    client_id !== VALID_CLIENT_ID ||
    client_secret !== VALID_CLIENT_SECRET
  ) {
    return jsonResponse(
      {
        error: "invalid_client",
        message: "Invalid client_id or client_secret",
      },
      401
    );
  }

  return jsonResponse({
    access_token: "fake-token-xyz123",
    expires_in: 2592000,
    token_type: "Bearer",
  });
}

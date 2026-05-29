const VALID_TOKEN = "fake-token-xyz123";

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};

export function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: CORS_HEADERS });
}

export function handleOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export function validateBearer(request) {
  const auth = request.headers.get("authorization");
  if (!auth || auth !== `Bearer ${VALID_TOKEN}`) {
    return jsonResponse(
      {
        error: "unauthorized",
        message: "Invalid or missing Bearer token",
      },
      401
    );
  }
  return null;
}

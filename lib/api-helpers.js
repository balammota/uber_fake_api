import {
  addLog,
  checkAndRecordRateLimit,
  getTokenEntry,
} from "@/lib/store";

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};

export function jsonResponse(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, ...extraHeaders },
  });
}

export function handleOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

function rateLimitSuccessHeaders(remaining, resetAt) {
  return {
    "X-RateLimit-Limit": "5",
    "X-RateLimit-Remaining": String(Math.max(0, remaining)),
    "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
  };
}

function rateLimitExceededHeaders(resetAt) {
  return {
    "X-RateLimit-Limit": "5",
    "X-RateLimit-Remaining": "0",
    "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
  };
}

export function logRequest(request, endpoint, response, token = "none") {
  addLog({
    timestamp: Date.now(),
    method: request.method,
    endpoint,
    status: response.status,
    token,
  });
  return response;
}

export function authenticateRequest(request) {
  const auth = request.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return {
      ok: false,
      token: "none",
      response: jsonResponse(
        {
          error: "unauthorized",
          message: "Invalid or missing Bearer token",
        },
        401
      ),
    };
  }

  const token = auth.slice(7).trim();
  const entry = getTokenEntry(token);

  if (entry === "expired") {
    return {
      ok: false,
      token,
      response: jsonResponse(
        {
          error: "token_expired",
          message: "Token has expired, please request a new one",
        },
        401
      ),
    };
  }

  if (!entry) {
    return {
      ok: false,
      token: "none",
      response: jsonResponse(
        {
          error: "unauthorized",
          message: "Invalid or missing Bearer token",
        },
        401
      ),
    };
  }

  return { ok: true, token, environment: entry.environment };
}

export function enforceRateLimit(token) {
  const result = checkAndRecordRateLimit(token);

  if (!result.allowed) {
    return {
      ok: false,
      response: jsonResponse(
        {
          error: "rate_limit_exceeded",
          message: "Too many requests",
          retry_after: 60,
        },
        429,
        rateLimitExceededHeaders(result.resetAt)
      ),
    };
  }

  return {
    ok: true,
    remaining: result.remaining,
    resetAt: result.resetAt,
  };
}

export async function handleProtectedRoute(request, endpoint, handler) {
  const auth = authenticateRequest(request);
  if (!auth.ok) {
    return logRequest(request, endpoint, auth.response, auth.token);
  }

  const rate = enforceRateLimit(auth.token);
  if (!rate.ok) {
    return logRequest(request, endpoint, rate.response, auth.token);
  }

  const result = await handler(request, {
    token: auth.token,
    environment: auth.environment,
  });

  const headers = rateLimitSuccessHeaders(rate.remaining, rate.resetAt);
  let response;

  if (result instanceof Response) {
    response = result;
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  } else {
    response = jsonResponse(result.body, result.status ?? 200, {
      ...headers,
      ...(result.headers || {}),
    });
  }

  return logRequest(request, endpoint, response, auth.token);
}

export async function handlePublicRoute(request, endpoint, handler) {
  const result = await handler(request);
  const response =
    result instanceof Response
      ? result
      : jsonResponse(result.body, result.status ?? 200, result.headers || {});

  return logRequest(request, endpoint, response, "none");
}

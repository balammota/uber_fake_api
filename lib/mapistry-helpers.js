import { addLog } from "@/lib/store";
import { checkMapistryRateLimit } from "@/lib/mapistry-store";

export const MAPISTRY_API_KEY = "test-api-key-mapistry-123";

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, x-api-key",
};

export function mapistryJsonResponse(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, ...extraHeaders },
  });
}

export function mapistryEmptyResponse(status = 204, extraHeaders = {}) {
  return new Response(null, {
    status,
    headers: { ...CORS_HEADERS, ...extraHeaders },
  });
}

export function handleMapistryOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

function rateLimitHeaders(remaining, resetAt, retryAfter = 0) {
  const headers = {
    "X-RateLimit-Limit": "100",
    "X-RateLimit-Remaining": String(Math.max(0, remaining)),
    "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
  };
  if (retryAfter > 0) {
    headers["Retry-After"] = String(retryAfter);
  }
  return headers;
}

function logMapistryRequest(request, endpoint, response, apiKey = "none") {
  addLog({
    timestamp: Date.now(),
    method: request.method,
    endpoint,
    status: response.status,
    token: apiKey === "none" ? "none" : `mapistry:${apiKey.slice(0, 12)}...`,
  });
  return response;
}

export function validateMapistryApiKey(request) {
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey || apiKey !== MAPISTRY_API_KEY) {
    return {
      ok: false,
      apiKey: "none",
      response: mapistryJsonResponse(
        {
          error: "unauthorized",
          message: "Invalid or missing API key",
        },
        401
      ),
    };
  }
  return { ok: true, apiKey };
}

export function paginate(items, request, defaultSize = 10) {
  const url = new URL(request.url);
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(url.searchParams.get("page[size]") || String(defaultSize), 10) || defaultSize)
  );
  const after = url.searchParams.get("page[after]");
  const start = after ? parseInt(after, 10) : 0;
  const safeStart = Number.isNaN(start) || start < 0 ? 0 : start;
  const data = items.slice(safeStart, safeStart + pageSize);
  const nextStart = safeStart + pageSize;
  const nextCursor = nextStart < items.length ? String(nextStart) : null;

  return {
    data,
    meta: {
      page: {
        nextCursor,
        totalCount: items.length,
      },
    },
  };
}

export async function handleMapistryPublicRoute(request, endpoint, handler) {
  const result = await handler(request);
  const response =
    result instanceof Response
      ? result
      : mapistryJsonResponse(result.body, result.status ?? 200, result.headers || {});
  return logMapistryRequest(request, endpoint, response);
}

export async function handleMapistryProtectedRoute(request, endpoint, handler) {
  const auth = validateMapistryApiKey(request);
  if (!auth.ok) {
    return logMapistryRequest(request, endpoint, auth.response, auth.apiKey);
  }

  const rate = checkMapistryRateLimit(auth.apiKey);
  if (!rate.allowed) {
    const response = mapistryJsonResponse(
      {
        error: "rate_limit_exceeded",
        message: "Too many requests",
      },
      429,
      rateLimitHeaders(0, rate.resetAt, rate.retryAfter)
    );
    return logMapistryRequest(request, endpoint, response, auth.apiKey);
  }

  const headers = rateLimitHeaders(rate.remaining, rate.resetAt);
  const result = await handler(request);

  let response;
  if (result instanceof Response) {
    response = result;
    Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v));
  } else if (result.noContent) {
    response = mapistryEmptyResponse(result.status ?? 204, {
      ...headers,
      ...(result.headers || {}),
    });
  } else {
    response = mapistryJsonResponse(result.body, result.status ?? 200, {
      ...headers,
      ...(result.headers || {}),
    });
  }

  return logMapistryRequest(request, endpoint, response, auth.apiKey);
}

"use client";

import { DocsLink } from "@/app/components/DocsProvider";
import {
  CredentialsCard,
  DocPage,
  EndpointCard,
  HighlightedCode,
  DocsTable,
  ChangelogBadge,
  ChangelogWarning,
  DocsFeatureCard,
  DocsNextStepCard,
  DocsStepList,
  MethodBadge,
  uberBody,
  uberSubheading,
} from "@/app/components/docs-ui";

const BASE_URL = "https://uber-fake-api.vercel.app";

const SANDBOX_CREDENTIALS = `client_id:     uber-partner-sandbox
client_secret: sandbox-secret123
grant_type:    client_credentials
environment:   sandbox
base_url:      ${BASE_URL}`;

const PROD_CREDENTIALS = `client_id:     uber-partner-prod
client_secret: prod-secret456
grant_type:    client_credentials
environment:   production
base_url:      ${BASE_URL}`;

const LEGACY_CREDENTIALS = `client_id:     uber-partner
client_secret: secret123
grant_type:    client_credentials
(legacy — maps to sandbox)`;

const QS_AUTH_CURL = `curl -X POST https://auth.uber.com/oauth/v2/token \\
  -F "client_id=$CLIENT_ID" \\
  -F "client_secret=$CLIENT_SECRET" \\
  -F "grant_type=client_credentials" \\
  -F "scope=telematics.read"`;

const QS_AUTH_RESPONSE = `{
  "access_token": "KA.eyJ2ZXJzaW9u...",
  "token_type": "Bearer",
  "expires_in": 2592000,
  "scope": "telematics.read"
}`;

const QS_CONSENT_CURL = `curl -X POST https://api.uber.com/telematics/v1/consent \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "driver_id": "driver_abc123",
    "partner_id": "progressive_insurance",
    "scope": ["score", "events", "summary"]
  }'`;

const QS_CONSENT_RESPONSE = `{
  "consent_id": "consent_xyz789",
  "driver_id": "driver_abc123",
  "status": "pending",
  "created_at": "2025-06-01T00:00:00Z"
}`;

const CONSENT_REQUEST_CURL = `curl -X POST https://api.uber.com/telematics/v1/consent \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "driver_id": "driver_abc123",
    "partner_id": "progressive_insurance",
    "scope": ["score", "events", "summary"],
    "expires_at": "2026-06-01T00:00:00Z"
  }'`;

const CONSENT_REQUEST_RESPONSE = `{
  "consent_id": "consent_xyz789",
  "driver_id": "driver_abc123",
  "partner_id": "progressive_insurance",
  "status": "pending",
  "scope": ["score", "events", "summary"],
  "expires_at": "2026-06-01T00:00:00Z",
  "created_at": "2025-06-01T00:00:00Z"
}`;

const CONSENT_CHECK_CURL = `curl https://api.uber.com/telematics/v1/consent/consent_xyz789 \\
  -H "Authorization: Bearer $TOKEN"`;

const CONSENT_CHECK_RESPONSE = `{
  "consent_id": "consent_xyz789",
  "driver_id": "driver_abc123",
  "status": "active",
  "accepted_at": "2025-06-01T08:23:00Z",
  "expires_at": "2026-06-01T00:00:00Z"
}`;

const CONSENT_WEBHOOK_PAYLOAD = `{
  "event": "consent_accepted",
  "consent_id": "consent_xyz789",
  "driver_id": "driver_abc123",
  "partner_id": "progressive_insurance",
  "status": "active",
  "timestamp": "2025-06-01T08:23:00Z"
}`;

const QS_SCORE_CURL = `curl https://api.uber.com/telematics/v1/drivers/driver_abc123/score \\
  -H "Authorization: Bearer $TOKEN"`;

const QS_SCORE_RESPONSE = `{
  "driver_id": "driver_abc123",
  "score": 82,
  "percentile": 91,
  "grade": "A",
  "trips_analyzed": 847,
  "last_updated": "2025-06-01T00:00:00Z"
}`;

const DRIVER_SCORE_CURL = `curl https://api.uber.com/telematics/v1/drivers/driver_abc123/score?period=90 \\
  -H "Authorization: Bearer $TOKEN"`;

const DRIVER_SCORE_RESPONSE = `{
  "driver_id": "driver_abc123",
  "score": 82,
  "percentile": 91,
  "grade": "A",
  "period_days": 90,
  "trips_analyzed": 847,
  "miles_analyzed": 12483,
  "last_updated": "2025-06-01T00:00:00Z",
  "score_breakdown": {
    "speed_compliance": 88,
    "smooth_braking": 79,
    "smooth_acceleration": 84,
    "phone_usage": 95,
    "night_driving_safety": 76
  }
}`;

const DRIVER_SCORE_JS = `async function getDriverScore(driverId, token, period = 90) {
  const response = await fetch(
    \`https://api.uber.com/telematics/v1/drivers/\${driverId}/score?period=\${period}\`,
    { headers: { 'Authorization': \`Bearer \${token}\` } }
  )

  if (response.status === 403) {
    console.log('Driver consent required before querying data')
    return null
  }

  if (!response.ok) {
    throw new Error(\`Status: \${response.status}\`)
  }

  const data = await response.json()
  console.log(\`Score: \${data.score} (\${data.grade}) — \${data.percentile}th percentile\`)
  return data
}`;

const DRIVER_EVENTS_CURL = `curl https://api.uber.com/telematics/v1/drivers/driver_abc123/events?period=90 \\
  -H "Authorization: Bearer $TOKEN"`;

const DRIVER_EVENTS_RESPONSE = `{
  "driver_id": "driver_abc123",
  "period_days": 90,
  "total_trips": 847,
  "total_miles": 12483,
  "events": {
    "harsh_braking": {
      "count": 12,
      "per_100_miles": 0.96,
      "industry_avg": 3.2,
      "vs_average": "-70%"
    },
    "harsh_acceleration": {
      "count": 8,
      "per_100_miles": 0.64,
      "industry_avg": 2.8,
      "vs_average": "-77%"
    },
    "speeding": {
      "count": 3,
      "per_100_miles": 0.24,
      "industry_avg": 1.1,
      "vs_average": "-78%"
    },
    "phone_usage": {
      "count": 1,
      "per_100_miles": 0.08,
      "industry_avg": 0.9,
      "vs_average": "-91%"
    },
    "night_driving_pct": 34
  }
}`;

const DRIVER_EVENTS_JS = `async function getDriverEvents(driverId, token) {
  const response = await fetch(
    \`https://api.uber.com/telematics/v1/drivers/\${driverId}/events\`,
    { headers: { 'Authorization': \`Bearer \${token}\` } }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message)
  }

  const data = await response.json()

  const { events } = data
  console.log(\`Harsh braking: \${events.harsh_braking.count} events\`)
  console.log(\`vs industry avg: \${events.harsh_braking.vs_average}\`)

  return data
}`;

const DRIVER_SUMMARY_CURL = `curl https://api.uber.com/telematics/v1/drivers/driver_abc123/summary \\
  -H "Authorization: Bearer $TOKEN"`;

const DRIVER_SUMMARY_RESPONSE = `{
  "driver_id": "driver_abc123",
  "driver_name": "Carlos Mendoza",
  "city": "Chicago",
  "consent_status": "active",
  "period_days": 90,
  "last_updated": "2025-06-01T00:00:00Z",
  "score": {
    "score": 82,
    "percentile": 91,
    "grade": "A",
    "trips_analyzed": 847,
    "miles_analyzed": 12483,
    "score_breakdown": {
      "speed_compliance": 88,
      "smooth_braking": 79,
      "smooth_acceleration": 84,
      "phone_usage": 95,
      "night_driving_safety": 76
    }
  },
  "events": {
    "harsh_braking": {
      "count": 12,
      "per_100_miles": 0.96,
      "industry_avg": 3.2,
      "vs_average": "-70%"
    },
    "harsh_acceleration": {
      "count": 8,
      "per_100_miles": 0.64,
      "industry_avg": 2.8,
      "vs_average": "-77%"
    },
    "speeding": {
      "count": 3,
      "per_100_miles": 0.24,
      "industry_avg": 1.1,
      "vs_average": "-78%"
    },
    "phone_usage": {
      "count": 1,
      "per_100_miles": 0.08,
      "industry_avg": 0.9,
      "vs_average": "-91%"
    },
    "night_driving_pct": 34
  }
}`;

const DRIVER_SUMMARY_JS = `async function getDriverSummary(driverId, token, period = 90) {
  const response = await fetch(
    \`https://api.uber.com/telematics/v1/drivers/\${driverId}/summary?period=\${period}\`,
    { headers: { 'Authorization': \`Bearer \${token}\` } }
  )

  if (response.status === 403) {
    console.log('Driver consent required before querying data')
    return null
  }

  if (!response.ok) {
    throw new Error(\`Status: \${response.status}\`)
  }

  const data = await response.json()
  console.log(\`\${data.driver_name}: score \${data.score.score} (\${data.score.grade})\`)
  return data
}`;

const FLEET_QUERY_CURL_MIN_SCORE = `curl "https://api.uber.com/telematics/v1/fleet?min_score=80&period=90" \\
  -H "Authorization: Bearer $TOKEN"`;

const FLEET_QUERY_CURL_CITY = `curl "https://api.uber.com/telematics/v1/fleet?city=Chicago&limit=50" \\
  -H "Authorization: Bearer $TOKEN"`;

const FLEET_QUERY_CURL_MAX_SCORE = `curl "https://api.uber.com/telematics/v1/fleet?max_score=59" \\
  -H "Authorization: Bearer $TOKEN"`;

const FLEET_QUERY_RESPONSE = `{
  "drivers": [
    {
      "driver_id": "driver_abc123",
      "score": 82,
      "grade": "A",
      "percentile": 91,
      "city": "Chicago",
      "trips_analyzed": 847,
      "last_updated": "2025-06-01T00:00:00Z"
    },
    {
      "driver_id": "driver_def456",
      "score": 91,
      "grade": "A+",
      "percentile": 97,
      "city": "Chicago",
      "trips_analyzed": 1203,
      "last_updated": "2025-06-01T00:00:00Z"
    }
  ],
  "meta": {
    "total": 847,
    "returned": 2,
    "next_cursor": "cursor_xyz789",
    "has_more": true
  }
}`;

const FLEET_QUERY_PAGINATION_JS = `async function getAllDrivers(token) {
  const allDrivers = []
  let cursor = null

  do {
    const url = cursor
      ? \`https://api.uber.com/telematics/v1/fleet?limit=100&cursor=\${cursor}\`
      : \`https://api.uber.com/telematics/v1/fleet?limit=100\`

    const response = await fetch(url, {
      headers: { 'Authorization': \`Bearer \${token}\` }
    })

    const data = await response.json()
    allDrivers.push(...data.drivers)
    cursor = data.meta.next_cursor

  } while (cursor !== null)

  console.log(\`Total drivers: \${allDrivers.length}\`)
  return allDrivers
}`;

const FLEET_QUERY_ANALYTICS_JS = `async function getPortfolioAnalytics(token) {
  const response = await fetch(
    'https://api.uber.com/telematics/v1/fleet',
    { headers: { 'Authorization': \`Bearer \${token}\` } }
  )

  const { drivers } = await response.json()

  const avgScore = drivers
    .reduce((sum, d) => sum + d.score, 0) / drivers.length

  const highRisk = drivers
    .filter(d => d.score < 60)

  const lowRisk = drivers
    .filter(d => d.score >= 80)

  const scoreDistribution = {
    'A+ (90-100)': drivers.filter(d => d.score >= 90).length,
    'A (80-89)':   drivers.filter(d => d.score >= 80 && d.score < 90).length,
    'B (70-79)':   drivers.filter(d => d.score >= 70 && d.score < 80).length,
    'C (60-69)':   drivers.filter(d => d.score >= 60 && d.score < 70).length,
    'D (0-59)':    drivers.filter(d => d.score < 60).length
  }

  return { avgScore, highRisk, lowRisk, scoreDistribution }
}`;

const BULK_ACCESS_CURL = `curl -X POST https://api.uber.com/telematics/v1/fleet/bulk \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "driver_ids": [
      "driver_abc123",
      "driver_def456",
      "driver_ghi789"
    ],
    "period": 90
  }'`;

const BULK_ACCESS_RESPONSE = `{
  "drivers": [
    {
      "driver_id": "driver_abc123",
      "consent_status": "active",
      "score": 82,
      "percentile": 91,
      "grade": "A",
      "period_days": 90,
      "trips_analyzed": 847,
      "miles_analyzed": 12483,
      "score_breakdown": {
        "speed_compliance": 88,
        "smooth_braking": 79,
        "smooth_acceleration": 84,
        "phone_usage": 95,
        "night_driving_safety": 76
      },
      "events": {
        "harsh_braking": { "count": 12, "per_100_miles": 0.96 },
        "harsh_acceleration": { "count": 8, "per_100_miles": 0.64 },
        "speeding": { "count": 3, "per_100_miles": 0.24 },
        "phone_usage": { "count": 1, "per_100_miles": 0.08 },
        "night_driving_pct": 34
      },
      "last_updated": "2025-06-01T00:00:00Z"
    }
  ],
  "errors": [
    {
      "driver_id": "driver_ghi789",
      "code": "ConsentRequired",
      "message": "Driver has not provided consent"
    }
  ],
  "meta": {
    "requested": 3,
    "returned": 2,
    "failed": 1
  }
}`;

const BULK_ACCESS_JS = `async function getBulkProfiles(driverIds, token) {
  const response = await fetch(
    'https://api.uber.com/telematics/v1/fleet/bulk',
    {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${token}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        driver_ids: driverIds,
        period: 90
      })
    }
  )

  if (!response.ok) {
    throw new Error(\`Status: \${response.status}\`)
  }

  const data = await response.json()

  console.log(\`Requested: \${data.meta.requested}\`)
  console.log(\`Returned: \${data.meta.returned}\`)
  console.log(\`Failed: \${data.meta.failed}\`)

  if (data.errors.length > 0) {
    data.errors.forEach(err => {
      console.log(\`\${err.driver_id} failed: \${err.code}\`)
    })
  }

  const discounts = data.drivers.map(driver => ({
    driver_id: driver.driver_id,
    score: driver.score,
    discount: driver.score >= 90 ? '25%' :
              driver.score >= 80 ? '15%' :
              driver.score >= 70 ? '8%'  :
              driver.score >= 60 ? '0%'  : '+10% surcharge'
  }))

  return discounts
}`;

const WEBHOOKS_SUBSCRIBE_CURL = `curl -X POST https://api.uber.com/telematics/v1/subscribe \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "driver_id": "driver_abc123",
    "webhook_url": "https://your-server.com/webhooks/uber",
    "events": ["score_change", "consent_revoked", "consent_expired"],
    "threshold": 10
  }'`;

const WEBHOOKS_SUBSCRIBE_RESPONSE = `{
  "subscription_id": "sub_xyz789",
  "driver_id": "driver_abc123",
  "webhook_url": "https://your-server.com/webhooks/uber",
  "events": ["score_change", "consent_revoked", "consent_expired"],
  "threshold": 10,
  "status": "active",
  "created_at": "2025-06-01T00:00:00Z"
}`;

const WEBHOOKS_VERIFY_JS = `const crypto = require('crypto')

function verifyWebhook(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  return \`sha256=\${expected}\` === signature
}

app.post('/webhooks/uber', (req, res) => {
  const signature = req.headers['x-uber-signature']
  const isValid = verifyWebhook(
    JSON.stringify(req.body),
    signature,
    process.env.WEBHOOK_SECRET
  )

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' })
  }

  const event = req.body
  console.log('Received event:', event.event)

  res.status(200).json({ received: true })
})`;

const WEBHOOKS_SCORE_CHANGE_PAYLOAD = `{
  "event": "score_change",
  "subscription_id": "sub_xyz789",
  "driver_id": "driver_abc123",
  "previous_score": 82,
  "new_score": 71,
  "change": -11,
  "previous_grade": "A",
  "new_grade": "B+",
  "timestamp": "2025-06-01T00:00:00Z"
}`;

const WEBHOOKS_CONSENT_ACCEPTED_PAYLOAD = `{
  "event": "consent_accepted",
  "consent_id": "consent_xyz789",
  "driver_id": "driver_abc123",
  "partner_id": "progressive_insurance",
  "scope": ["score", "events", "summary"],
  "expires_at": "2026-06-01T00:00:00Z",
  "timestamp": "2025-06-01T08:23:00Z"
}`;

const WEBHOOKS_CONSENT_REVOKED_PAYLOAD = `{
  "event": "consent_revoked",
  "consent_id": "consent_xyz789",
  "driver_id": "driver_abc123",
  "partner_id": "progressive_insurance",
  "reason": "driver_requested",
  "timestamp": "2025-06-01T14:00:00Z"
}`;

const WEBHOOKS_CONSENT_EXPIRED_PAYLOAD = `{
  "event": "consent_expired",
  "consent_id": "consent_xyz789",
  "driver_id": "driver_abc123",
  "partner_id": "progressive_insurance",
  "expired_at": "2026-06-01T00:00:00Z",
  "timestamp": "2026-06-01T00:00:00Z"
}`;

const WEBHOOKS_DRIVER_INACTIVE_PAYLOAD = `{
  "event": "driver_inactive",
  "driver_id": "driver_abc123",
  "last_trip_date": "2025-05-01",
  "days_inactive": 30,
  "current_score": 82,
  "timestamp": "2025-06-01T00:00:00Z"
}`;

const WEBHOOKS_HANDLE_EVENTS_JS = `app.post('/webhooks/uber', async (req, res) => {
  res.status(200).json({ received: true })

  const event = req.body

  switch (event.event) {
    case 'score_change':
      await updateDriverPricing(
        event.driver_id,
        event.new_score,
        event.change
      )
      break

    case 'consent_accepted':
      await fetchInitialDriverProfile(event.driver_id)
      break

    case 'consent_revoked':
    case 'consent_expired':
      await removeDriverFromPortfolio(event.driver_id)
      break

    case 'driver_inactive':
      await flagDriverForReview(event.driver_id)
      break

    default:
      console.log('Unknown event type:', event.event)
  }
})`;

const REFERENCE_ERROR_FORMAT = `{
  "code": "ConsentRequired",
  "message": "Driver has not provided consent for data sharing.",
  "request_id": "req_abc123",
  "documentation_url": "https://developer.uber.com/docs/telematics/error-codes"
}`;

const TELEMATICS_ERROR_HANDLING_JS = `async function handleTelematicsError(error) {
  switch (error.code) {
    case 'TokenExpired':
    case 'Unauthorized':
      await refreshToken()
      return 'retry'

    case 'ConsentRequired':
    case 'ConsentExpired':
      await requestDriverConsent(error.driver_id)
      return 'skip'

    case 'ConsentRevoked':
      await removeDriverFromPortfolio(error.driver_id)
      return 'skip'

    case 'RateLimitExceeded':
      const retryAfter = error.retry_after || 60
      await wait(retryAfter * 1000)
      return 'retry'

    case 'Internal':
    case 'BadGateway':
    case 'ServiceUnavailable':
      return 'retry_with_backoff'

    default:
      console.error('Unhandled error:', error.code, error.message)
      return 'fail'
  }
}`;

const AUTH_ENDPOINT = {
  method: "POST",
  path: "/api/oauth/token",
  description:
    "Exchange credentials for Bearer token (unique per request, expires in 30s)",
  request: `{
  "client_id": "uber-partner-sandbox",
  "client_secret": "sandbox-secret123",
  "grant_type": "client_credentials"
}`,
  response: `{
  "access_token": "fake-token-1712345678901",
  "expires_in": 30,
  "token_type": "Bearer",
  "environment": "sandbox"
}`,
};

const ERROR_RESPONSE_FORMAT = `{
  "code": "ConsentRequired",
  "message": "Driver has not provided consent for data sharing.",
  "request_id": "req_abc123",
  "documentation_url": "https://developer.uber.com/docs/telematics/consent-flow"
}`;

const COMMON_ERROR_ROWS = [
  {
    status: "400",
    code: "BadRequest",
    message: "Invalid request format or parameters",
    fix: "Check required fields and data types",
  },
  {
    status: "401",
    code: "Unauthorized",
    message: "Authentication credentials missing or invalid",
    fix: "Generate a new access token",
  },
  {
    status: "403",
    code: "PermissionDenied",
    message: "Insufficient permissions",
    fix: "Verify your partner account has telematics.read scope",
  },
  {
    status: "403",
    code: "ConsentRequired",
    message: "Driver has not provided consent",
    fix: "Request driver consent before querying their data",
  },
  {
    status: "404",
    code: "NotFound",
    message: "Driver not found or inaccessible",
    fix: "Verify the driver_id is correct and active",
  },
  {
    status: "429",
    code: "RateLimitExceeded",
    message: "Request limit exceeded",
    fix: "Wait for Retry-After period before retrying",
  },
  {
    status: "500",
    code: "Internal",
    message: "Unexpected server error",
    fix: "Retry with exponential backoff",
  },
];

const ERROR_HANDLING_JS = `async function getDriverScore(driverId, token) {
  try {
    const response = await fetch(
      \`https://api.uber.com/telematics/v1/drivers/\${driverId}/score\`,
      { headers: { 'Authorization': \`Bearer \${token}\` } }
    )

    if (!response.ok) {
      const error = await response.json()

      switch (error.code) {
        case 'ConsentRequired':
          console.log('Request driver consent first')
          break
        case 'Unauthorized':
          console.log('Token expired — refresh your token')
          break
        case 'RateLimitExceeded':
          console.log('Rate limited — implement backoff')
          break
        default:
          console.log(\`Error: \${error.message}\`)
      }
      return null
    }

    return response.json()

  } catch(error) {
    console.log('Network error:', error.message)
  }
}`;

const DATA_TYPE_ROWS = [
  { type: "boolean", format: "—", description: "JSON boolean value", example: "true, false" },
  { type: "string", format: "—", description: "Arbitrary text string", example: '"driver_abc123", "A"' },
  {
    type: "string",
    format: "date-time",
    description: "RFC 3339 timestamp in UTC",
    example: '"2025-06-01T08:00:00Z"',
  },
  { type: "string", format: "date", description: "RFC 3339 date", example: '"2025-06-01"' },
  {
    type: "integer",
    format: "—",
    description: "JSON number without fractional part",
    example: "82, 847, 12",
  },
  {
    type: "number",
    format: "double",
    description: "Double-precision floating point",
    example: "0.96, 34.5, 100.0",
  },
  {
    type: "object",
    format: "—",
    description: "JSON object with key-value pairs",
    example: '{"speed_compliance": 88}',
  },
  {
    type: "list",
    format: "—",
    description: "A list of values",
    example: '["score", "events", "summary"]',
  },
];

const DATA_TYPES_EXAMPLE = `{
  "driver_id": "driver_abc123",        // string
  "score": 82,                          // integer
  "percentile": 91.5,                   // number (double)
  "grade": "A",                         // string
  "is_active": true,                    // boolean
  "last_updated": "2025-06-01T08:00:00Z", // string date-time
  "period_start": "2025-03-01",         // string date
  "trips_analyzed": 847,                // integer
  "score_breakdown": {                  // object
    "speed_compliance": 88,
    "smooth_braking": 79
  },
  "consent_scope": ["score", "events"] // list
}`;

const VERSION_INFO = `Current version: v1
Base URL: https://api.uber.com/telematics/v1`;

const RATE_LIMIT_HEADERS = `X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 847
X-RateLimit-Reset: 1735689600`;

const RATE_LIMIT_429 = `HTTP/1.1 429 Too Many Requests
Retry-After: 30
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1735689600

{
  "error": "rate_limit_exceeded",
  "message": "Too many requests. Please retry after 30 seconds.",
  "retry_after": 30,
  "request_id": "req_abc123"
}`;

const RATE_LIMIT_BACKOFF = `const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function fetchWithRetry(url, options, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const response = await fetch(url, options)

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After') || 1
      console.log(\`Rate limited — waiting \${retryAfter}s\`)
      await wait(retryAfter * 1000)
      continue
    }

    return response
  }
}`;

const INTRO_BASE_URL = `https://api.uber.com/telematics/v1

Authentication: OAuth 2.0 — Bearer token
Data format: JSON
Rate limit: 1,000 requests per minute`;

export const DOC_SECTIONS = {
  introduction: () => (
    <DocPage
      hero
      title="Uber Driver Telematics API"
      subtitle="Turn Uber's driving data into smarter insurance products"
    >
      <div className="space-y-12 sm:space-y-14">
        <section>
          <h2 className={uberSubheading}>Overview</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            The Uber Driver Telematics API gives insurance companies programmatic access to
            anonymized driving behavior data from Uber drivers who have explicitly opted in.
          </p>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            Uber already collects rich telematics data from every trip — GPS, accelerometer, and
            gyroscope signals processed by Cambridge Mobile Telematics (CMT) into standardized safety
            scores. This API exposes that data to insurance partners through a secure, consent-based
            interface.
          </p>
        </section>

        <section>
          <h2 className={uberSubheading}>The problem it solves</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            Traditional auto insurance pricing relies on static factors — age, zip code, credit
            score, and accident history. These predict risk at a population level but fail to
            reflect how an individual actually drives.
          </p>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            Usage-Based Insurance (UBI) solves this with telematics — but collecting driving data
            requires hardware devices or dedicated apps that create friction and cost.
          </p>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            Uber drivers already generate millions of hours of high-quality driving data every day.
            This API makes that data available to insurers without any additional hardware or
            enrollment friction.
          </p>
        </section>

        <section>
          <h2 className={uberSubheading}>What you can build</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <DocsFeatureCard title="Usage-Based Insurance Products">
              Price policies based on actual driving behavior instead of demographic proxies
            </DocsFeatureCard>
            <DocsFeatureCard title="Instant Risk Assessment">
              Get a complete driver risk profile in milliseconds — no waiting period, no test drives
            </DocsFeatureCard>
            <DocsFeatureCard title="Portfolio Analytics">
              Analyze risk across your entire book of business with fleet-level queries and
              real-time webhooks
            </DocsFeatureCard>
            <DocsFeatureCard title="Driver Discount Programs">
              Reward safe drivers with personalized discounts — improving retention and attracting
              low-risk customers
            </DocsFeatureCard>
          </div>
        </section>

        <section>
          <h2 className={uberSubheading}>Core capabilities</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            The API is organized around three main areas:
          </p>
          <div className="mt-6 space-y-6">
            <div>
              <p className={`font-bold ${uberBody}`}>Driver Data</p>
              <p className={`mt-2 max-w-3xl ${uberBody}`}>
                <DocsLink section="driver-score">Score</DocsLink>,{" "}
                <DocsLink section="driver-events">Events</DocsLink>, and{" "}
                <DocsLink section="driver-summary">Summary</DocsLink> endpoints give you individual
                driver risk profiles based on up to 90 days of driving history.
              </p>
            </div>
            <div>
              <p className={`font-bold ${uberBody}`}>Fleet Management</p>
              <p className={`mt-2 max-w-3xl ${uberBody}`}>
                <DocsLink section="fleet-query">Fleet Query</DocsLink> and{" "}
                <DocsLink section="bulk-access">Bulk Access</DocsLink> endpoints let you analyze risk
                across your entire portfolio of consented drivers in a single call.
              </p>
            </div>
            <div>
              <p className={`font-bold ${uberBody}`}>Webhooks</p>
              <p className={`mt-2 max-w-3xl ${uberBody}`}>
                <DocsLink section="webhooks-overview">Real-time notifications</DocsLink> when driver
                scores change or consent status updates — no polling required.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className={uberSubheading}>How it works</h2>
          <DocsStepList
            steps={[
              {
                title: "Partner registers",
                description:
                  "Insurance company registers as a Telematics API partner at developer.uber.com and receives client_id and client_secret.",
              },
              {
                title: "Driver opts in",
                description:
                  "Insurance partner requests consent for a driver via the API. Uber sends an in-app notification. Driver accepts or declines. No consent = no data.",
              },
              {
                title: "Partner queries data",
                description:
                  "With active consent, partner calls /score, /events, or /summary to retrieve driving behavior data. Data is returned in milliseconds.",
              },
              {
                title: "Partner prices the policy",
                description:
                  "Partner feeds the data into their own pricing model. Uber does not dictate how the data is used — partners own their underwriting decisions.",
              },
            ]}
          />
        </section>

        <section>
          <h2 className={uberSubheading}>Data source</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            All telematics data is processed by Cambridge Mobile Telematics (CMT) — the same engine
            Uber uses internally for its Driver Safety Score program. CMT processes GPS,
            accelerometer, and gyroscope signals from the driver&apos;s smartphone into standardized
            safety scores and event counts.
          </p>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            This means the data quality and methodology are identical to what Uber uses to manage
            its own driver safety program — not a new or untested system.
          </p>
        </section>

        <section>
          <h2 className={uberSubheading}>Privacy by design</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            Driver consent is required before any data is accessible. Drivers can revoke consent at
            any time from the Uber app. All data is anonymized at the partner level — partners
            receive driver_id identifiers, not names or personal information. Data sharing complies
            with CCPA and GDPR.
          </p>
        </section>

        <section>
          <h2 className={uberSubheading}>Base URL</h2>
          <HighlightedCode code={INTRO_BASE_URL} language="kv" showHeader={false} className="mt-4" />
        </section>

        <section>
          <h2 className={uberSubheading}>Next steps</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
            <DocsNextStepCard description="Set up your environment and make your first API call">
              <DocsLink section="quick-start" className="no-underline hover:opacity-80">
                Quick Start →
              </DocsLink>
            </DocsNextStepCard>
            <DocsNextStepCard description="Implement OAuth 2.0 and get your access tokens">
              <DocsLink section="authentication" className="no-underline hover:opacity-80">
                Authentication →
              </DocsLink>
            </DocsNextStepCard>
            <DocsNextStepCard description="Understand how driver consent works">
              <DocsLink section="consent-flow" className="no-underline hover:opacity-80">
                Consent Flow →
              </DocsLink>
            </DocsNextStepCard>
          </div>
        </section>
      </div>
    </DocPage>
  ),

  versioning: () => (
    <DocPage title="Versioning" subtitle="How we handle API changes">
      <div className="space-y-10 sm:space-y-12">
        <section>
          <h2 className={uberSubheading}>Our versioning approach</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            The Telematics API evolves over time as we add new data points and improve existing
            functionality. We&apos;re committed to giving insurance partners advance notice of any
            changes that might affect your integrations.
          </p>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            We follow semantic versioning principles and maintain backward compatibility whenever
            possible. When we do need to make breaking changes, we provide a 180-day transition
            period to give you time to update your integration.
          </p>
          <HighlightedCode
            code={VERSION_INFO}
            language="kv"
            label="text"
            className="mt-6"
            showHeader={false}
          />
        </section>

        <section>
          <h2 className={uberSubheading}>What constitutes a breaking change</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            Breaking changes are modifications that require you to update your code:
          </p>
          <ul className={`mt-4 max-w-3xl list-disc space-y-2 pl-5 ${uberBody}`}>
            <li>Removing API endpoints or fields</li>
            <li>Changing data types or response formats</li>
            <li>Modifying authentication or consent requirements</li>
            <li>Altering score calculation methodology</li>
            <li>Changing event definitions or thresholds</li>
          </ul>
        </section>

        <section>
          <h2 className={uberSubheading}>What constitutes a non-breaking change</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            These may be released at any time without advance notice:
          </p>
          <ul className={`mt-4 max-w-3xl list-disc space-y-2 pl-5 ${uberBody}`}>
            <li>New optional fields in responses</li>
            <li>Additional endpoints</li>
            <li>New event types in webhooks</li>
            <li>Performance improvements</li>
            <li>New optional query parameters</li>
          </ul>
        </section>

        <section>
          <h2 className={uberSubheading}>When we make changes</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            For breaking changes, here is what you can expect:
          </p>
          <ul className={`mt-4 max-w-3xl list-disc space-y-2 pl-5 ${uberBody}`}>
            <li>180 days advance notice through developer communications</li>
            <li>Parallel support for both old and new versions during transition</li>
            <li>Clear migration guidance with examples and best practices</li>
            <li>Direct outreach to affected insurance partners</li>
          </ul>
        </section>

        <section>
          <h2 className={uberSubheading}>Version history</h2>
          <DocsTable minWidth="32rem">
            <thead>
              <tr>
                <th>Version</th>
                <th>Release Date</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono">v1</td>
                <td>June 2025</td>
                <td>Current</td>
                <td>Initial release</td>
              </tr>
              <tr>
                <td className="font-mono">v2</td>
                <td>TBD</td>
                <td>Planned</td>
                <td>Enhanced event granularity</td>
              </tr>
            </tbody>
          </DocsTable>
          <p className={`mt-6 max-w-3xl ${uberBody}`}>
            Sandbox integrations use{" "}
            <code className="font-mono text-sm">{BASE_URL}</code> — see the{" "}
            <DocsLink section="changelog">Changelog</DocsLink> for sandbox-specific updates.
          </p>
        </section>
      </div>
    </DocPage>
  ),

  "rate-limiting": () => (
    <DocPage title="Rate Limiting" subtitle="How rate limiting works">
      <div className="space-y-10 sm:space-y-12">
        <section>
          <h2 className={uberSubheading}>How rate limiting works</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            To ensure optimal performance for all insurance partners, the Telematics API
            implements rate limiting on a per-partner basis. This means your request limits are
            tied to your insurance partner account, not individual API calls.
          </p>
        </section>

        <section>
          <h2 className={uberSubheading}>Understanding your limits</h2>
          <DocsTable minWidth="28rem">
            <thead>
              <tr>
                <th>Limit Type</th>
                <th>Limit</th>
                <th>Window</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Requests per minute</td>
                <td className="font-mono">1,000</td>
                <td>60 seconds</td>
              </tr>
              <tr>
                <td>Requests per hour</td>
                <td className="font-mono">10,000</td>
                <td>60 minutes</td>
              </tr>
              <tr>
                <td>Requests per day</td>
                <td className="font-mono">100,000</td>
                <td>24 hours</td>
              </tr>
              <tr>
                <td>Bulk requests per minute</td>
                <td className="font-mono">100</td>
                <td>60 seconds</td>
              </tr>
            </tbody>
          </DocsTable>
          <p className={`mt-6 max-w-3xl ${uberBody}`}>
            Rate limits vary by endpoint. Fleet bulk endpoints have stricter limits than
            individual driver endpoints.
          </p>
        </section>

        <section>
          <h2 className={uberSubheading}>Rate limit headers</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            Every API response includes these headers:
          </p>
          <HighlightedCode
            code={RATE_LIMIT_HEADERS}
            language="http"
            className="mt-6"
            showHeader={false}
          />
          <ul className={`mt-6 max-w-3xl list-disc space-y-2 pl-5 ${uberBody}`}>
            <li>
              <code className="font-mono text-sm">X-RateLimit-Limit</code> — maximum requests
              allowed in window
            </li>
            <li>
              <code className="font-mono text-sm">X-RateLimit-Remaining</code> — requests
              remaining in current window
            </li>
            <li>
              <code className="font-mono text-sm">X-RateLimit-Reset</code> — Unix timestamp when
              window resets
            </li>
          </ul>
        </section>

        <section>
          <h2 className={uberSubheading}>When you hit a limit</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            If you exceed your rate limit you will receive a 429 Too Many Requests response. Use
            the <code className="font-mono text-sm">Retry-After</code> header to know exactly how
            long to wait.
          </p>
          <HighlightedCode code={RATE_LIMIT_429} language="http" className="mt-6" showHeader={false} />
        </section>

        <section>
          <h2 className={uberSubheading}>Best practices</h2>
          <ul className={`mt-4 max-w-3xl list-disc space-y-2 pl-5 ${uberBody}`}>
            <li>Cache driver scores locally — scores update once per day maximum</li>
            <li>
              Use the <code className="font-mono text-sm">/summary</code> endpoint to get score +
              events in one call instead of two separate requests
            </li>
            <li>Implement exponential backoff when you receive a 429</li>
            <li>Use webhooks for score changes instead of polling</li>
            <li>
              Use the <code className="font-mono text-sm">/fleet</code> endpoint for bulk queries
              instead of looping individual driver calls
            </li>
          </ul>
          <HighlightedCode
            code={RATE_LIMIT_BACKOFF}
            language="javascript"
            label="javascript"
            className="mt-6"
          />
          <p className={`mt-6 max-w-3xl ${uberBody}`}>
            This sandbox enforces <strong>5 requests per minute</strong> per token for practice —
            responses still include <code className="font-mono text-sm">X-RateLimit-Remaining</code>{" "}
            and <code className="font-mono text-sm">Retry-After</code>.
          </p>
        </section>
      </div>
    </DocPage>
  ),

  "error-handling": () => (
    <DocPage title="Error Handling" subtitle="How errors work">
      <div className="space-y-10 sm:space-y-12">
        <section>
          <h2 className={uberSubheading}>How errors work</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            The Telematics API uses standard HTTP status codes and provides detailed error
            messages to help you understand what went wrong and how to fix it.
          </p>
        </section>

        <section>
          <h2 className={uberSubheading}>HTTP status codes</h2>
          <ul className={`mt-4 max-w-3xl list-disc space-y-2 pl-5 ${uberBody}`}>
            <li>
              <strong>2xx</strong> codes indicate success
            </li>
            <li>
              <strong>4xx</strong> codes indicate an error with the request
            </li>
            <li>
              <strong>5xx</strong> codes indicate an error on our servers
            </li>
          </ul>
        </section>

        <section>
          <h2 className={uberSubheading}>Error response format</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            When an error occurs you will receive a JSON response with details about what
            happened:
          </p>
          <HighlightedCode
            code={ERROR_RESPONSE_FORMAT}
            language="json"
            className="mt-6"
            showHeader={false}
          />
          <ul className={`mt-6 max-w-3xl list-disc space-y-2 pl-5 ${uberBody}`}>
            <li>
              The <code className="font-mono text-sm">code</code> field provides a machine-readable
              identifier.
            </li>
            <li>
              The <code className="font-mono text-sm">message</code> field gives a human-readable
              description.
            </li>
            <li>
              The <code className="font-mono text-sm">request_id</code> field helps Uber support
              debug your issue.
            </li>
          </ul>
        </section>

        <section>
          <h2 className={uberSubheading}>Common error codes</h2>
          <DocsTable minWidth="40rem">
            <thead>
              <tr>
                <th>HTTP Status</th>
                <th>Error Code</th>
                <th>Message</th>
                <th>How to fix</th>
              </tr>
            </thead>
            <tbody>
              {COMMON_ERROR_ROWS.map((row) => (
                <tr key={`${row.status}-${row.code}`}>
                  <td>{row.status}</td>
                  <td>
                    <code>{row.code}</code>
                  </td>
                  <td>{row.message}</td>
                  <td>{row.fix}</td>
                </tr>
              ))}
            </tbody>
          </DocsTable>
          <p className={`mt-6 max-w-3xl ${uberBody}`}>
            See also <DocsLink section="error-codes">Error Codes</DocsLink> and{" "}
            <DocsLink section="consent-flow">Consent Flow</DocsLink>.
          </p>
        </section>

        <section>
          <h2 className={uberSubheading}>Handling errors in code</h2>
          <HighlightedCode
            code={ERROR_HANDLING_JS}
            language="javascript"
            label="javascript"
          />
          <p className={`mt-6 max-w-3xl ${uberBody}`}>
            This sandbox returns <code className="font-mono text-sm">token_expired</code> on
            expired Bearer tokens (30-second TTL for practice).
          </p>
        </section>
      </div>
    </DocPage>
  ),

  "data-types": () => (
    <DocPage title="Data Types" subtitle="How data is represented in the Telematics API">
      <div className="space-y-10 sm:space-y-12">
        <section>
          <h2 className={uberSubheading}>Overview</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            The type and format properties in the Uber Telematics API determine the data type of
            properties in JSON requests and responses. The type property indicates the JSON data
            type, while the format property provides additional information about the underlying
            type.
          </p>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            <strong>Note:</strong> Client libraries may use language-specific types. For example,
            a date-time string in JSON becomes a Date object in JavaScript or DateTime in C#.
          </p>
        </section>

        <section>
          <h2 className={uberSubheading}>Data types reference</h2>
          <DocsTable minWidth="36rem">
            <thead>
              <tr>
                <th>Type</th>
                <th>Format</th>
                <th>Description</th>
                <th>Example</th>
              </tr>
            </thead>
            <tbody>
              {DATA_TYPE_ROWS.map((row) => (
                <tr key={`${row.type}-${row.format}-${row.description}`}>
                  <td>
                    <code>{row.type}</code>
                  </td>
                  <td>{row.format === "—" ? "—" : <code>{row.format}</code>}</td>
                  <td>{row.description}</td>
                  <td className="font-mono text-sm">{row.example}</td>
                </tr>
              ))}
            </tbody>
          </DocsTable>
        </section>

        <section>
          <h2 className={uberSubheading}>Examples in context</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            Here is how these data types appear in a real Telematics API response:
          </p>
          <HighlightedCode
            code={DATA_TYPES_EXAMPLE}
            language="javascript"
            className="mt-6"
            showHeader={false}
          />
        </section>
      </div>
    </DocPage>
  ),

  "quick-start": () => (
    <DocPage title="Quick Start" subtitle="Get up and running with the Telematics API">
      <div className="space-y-10 sm:space-y-12">
        <section>
          <h2 className={uberSubheading}>Insurance Partner Requirements</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            To access driver telematics data through the Uber Telematics API, you must be an
            approved insurance partner. This ensures driver data is only shared with legitimate,
            regulated insurance companies.
          </p>
          <p className={`mt-4 max-w-3xl font-bold ${uberBody}`}>Requirements:</p>
          <ul className={`mt-2 max-w-3xl list-disc space-y-2 pl-5 ${uberBody}`}>
            <li>Active insurance license in your operating jurisdiction</li>
            <li>Signed Uber Data Partnership Agreement</li>
            <li>Approved use case — driver risk assessment and pricing only</li>
            <li>CCPA and GDPR compliance certification</li>
          </ul>
        </section>

        <section>
          <h2 className={uberSubheading}>Step 1 — Create a developer application</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            Register your application in the Uber Developer Dashboard:
          </p>
          <ol className={`mt-4 max-w-3xl list-decimal space-y-3 pl-5 ${uberBody}`}>
            <li>Sign in to developer.uber.com with your Uber partner account</li>
            <li>
              Click &quot;Create App&quot; and fill out the application details:
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>App name: A descriptive name for your integration</li>
                <li>App description: Brief description of your insurance product</li>
                <li>Organization: Your insurance company name</li>
              </ul>
            </li>
            <li>
              Note your <code className="font-mono text-sm">client_id</code> and{" "}
              <code className="font-mono text-sm">client_secret</code> — you will need these to
              authenticate
            </li>
          </ol>
        </section>

        <section>
          <h2 className={uberSubheading}>Step 2 — Request API access</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            Request access to the Telematics API by submitting the Insurance Partner Access form.
          </p>
          <p className={`mt-4 max-w-3xl font-bold ${uberBody}`}>Available scopes:</p>
          <ul className={`mt-2 max-w-3xl list-disc space-y-2 pl-5 ${uberBody}`}>
            <li>
              <code className="font-mono text-sm">telematics.read</code> — Read access to driver
              scores and events
            </li>
            <li>
              <code className="font-mono text-sm">telematics.fleet</code> — Read access to
              fleet-level queries
            </li>
            <li>
              <code className="font-mono text-sm">telematics.webhooks</code> — Subscribe to score
              change notifications
            </li>
            <li>
              <code className="font-mono text-sm">telematics.consent</code> — Request driver consent
            </li>
          </ul>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            Approval typically takes 5-7 business days. You will receive email confirmation when
            your account is approved.
          </p>
        </section>

        <section>
          <h2 className={uberSubheading}>Step 3 — Set up authentication</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            Follow our <DocsLink section="authentication">Authentication</DocsLink> guide to
            implement OAuth 2.0 and get your access tokens.
          </p>
          <HighlightedCode
            code={QS_AUTH_CURL}
            language="bash"
            label="curl"
            className="mt-6"
          />
          <p className={`mt-4 max-w-3xl ${uberBody}`}>Response:</p>
          <HighlightedCode code={QS_AUTH_RESPONSE} language="json" showHeader={false} />
          <p className={`mt-4 max-w-3xl text-sm ${uberBody}`}>
            Sandbox: <code className="font-mono text-sm">POST {BASE_URL}/api/oauth/token</code> with
            JSON body (30-second token TTL for practice).
          </p>
        </section>

        <section>
          <h2 className={uberSubheading}>Step 4 — Request driver consent</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            Before querying any driver data, the driver must explicitly opt in to data sharing.
          </p>
          <HighlightedCode
            code={QS_CONSENT_CURL}
            language="bash"
            label="curl"
            className="mt-6"
          />
          <p className={`mt-4 max-w-3xl ${uberBody}`}>Response 201:</p>
          <HighlightedCode code={QS_CONSENT_RESPONSE} language="json" showHeader={false} />
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            Driver receives in-app notification from Uber. Once accepted, status changes to{" "}
            <code className="font-mono text-sm">active</code>. See{" "}
            <DocsLink section="consent-flow">Consent Flow</DocsLink>.
          </p>
        </section>

        <section>
          <h2 className={uberSubheading}>Step 5 — Query driver data</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            Once consent is active, query the driver score:
          </p>
          <HighlightedCode
            code={QS_SCORE_CURL}
            language="bash"
            label="curl"
            className="mt-6"
          />
          <p className={`mt-4 max-w-3xl ${uberBody}`}>Response 200:</p>
          <HighlightedCode code={QS_SCORE_RESPONSE} language="json" showHeader={false} />
          <p className={`mt-4 max-w-3xl text-sm ${uberBody}`}>
            Sandbox: <code className="font-mono text-sm">GET {BASE_URL}/api/drivers/score</code> with
            Bearer token.
          </p>
        </section>

        <section>
          <h2 className={uberSubheading}>Next steps</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            Now that you are set up, explore the API capabilities:
          </p>
          <ul className={`mt-4 max-w-3xl list-disc space-y-2 pl-5 ${uberBody}`}>
            <li>
              <DocsLink section="driver-score">Driver Data</DocsLink>: Query scores, events, and
              full summaries
            </li>
            <li>
              <DocsLink section="fleet-query">Fleet Management</DocsLink>: Bulk queries for
              portfolio assessment
            </li>
            <li>
              <DocsLink section="webhooks-overview">Webhooks</DocsLink>: Real-time notifications
              when scores change
            </li>
          </ul>
        </section>

        <section>
          <h2 className={uberSubheading}>Getting help</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>If you run into issues:</p>
          <ul className={`mt-4 max-w-3xl list-disc space-y-2 pl-5 ${uberBody}`}>
            <li>
              Review the <DocsLink section="error-handling">Error Handling</DocsLink> guide for
              common problems
            </li>
            <li>Verify driver consent is active before querying data</li>
            <li>Check your OAuth scopes match your API usage</li>
            <li>Confirm your partner account is approved for telematics.read</li>
          </ul>
        </section>
      </div>
    </DocPage>
  ),

  authentication: () => (
    <DocPage
      title="Authentication"
      subtitle="Client credentials OAuth 2.0 and environment-specific keys"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <CredentialsCard title="Sandbox" code={SANDBOX_CREDENTIALS} copyText={SANDBOX_CREDENTIALS} />
        <CredentialsCard title="Production" code={PROD_CREDENTIALS} copyText={PROD_CREDENTIALS} />
      </div>
      <div className="mt-6">
        <CredentialsCard
          title="Legacy (still supported)"
          code={LEGACY_CREDENTIALS}
          copyText={LEGACY_CREDENTIALS}
        />
      </div>
      <div className="mt-8">
        <EndpointCard endpoint={AUTH_ENDPOINT} />
      </div>
    </DocPage>
  ),

  "consent-flow": () => (
    <DocPage title="Consent Flow" subtitle="How driver consent works">
      <div className="space-y-10 sm:space-y-12">
        <section>
          <h2 className={uberSubheading}>Why consent is required</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            Driver data is personal and sensitive. Before any insurance partner can access a
            driver&apos;s telematics data, the driver must explicitly opt in. This is required by
            CCPA, GDPR, and Uber&apos;s own privacy policy.
          </p>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            No consent = no data. A request to any driver endpoint without active consent returns{" "}
            <code className="font-mono text-sm">403 ConsentRequired</code>.
          </p>
        </section>

        <section>
          <h2 className={uberSubheading}>How it works</h2>
          <ol className={`mt-4 max-w-3xl list-decimal space-y-3 pl-5 ${uberBody}`}>
            <li>Insurance partner requests consent for a driver</li>
            <li>Uber sends in-app notification to the driver</li>
            <li>Driver reviews what data will be shared and with whom</li>
            <li>Driver accepts or declines</li>
            <li>Partner receives webhook confirmation</li>
            <li>Partner can now query driver data</li>
          </ol>
        </section>

        <section>
          <h2 className={uberSubheading}>Consent states</h2>
          <DocsTable minWidth="36rem">
            <thead>
              <tr>
                <th>State</th>
                <th>Description</th>
                <th>Can query data?</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono">pending</td>
                <td>Driver has been notified but not responded</td>
                <td>❌ No</td>
              </tr>
              <tr>
                <td className="font-mono">active</td>
                <td>Driver accepted — data sharing enabled</td>
                <td>✅ Yes</td>
              </tr>
              <tr>
                <td className="font-mono">revoked</td>
                <td>Driver withdrew consent</td>
                <td>❌ No</td>
              </tr>
              <tr>
                <td className="font-mono">expired</td>
                <td>Consent period ended</td>
                <td>❌ No</td>
              </tr>
            </tbody>
          </DocsTable>
        </section>

        <section>
          <h2 className={uberSubheading}>Requesting consent</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            <code className="font-mono text-sm">POST /telematics/v1/consent</code>
          </p>
          <HighlightedCode
            code={CONSENT_REQUEST_CURL}
            language="bash"
            label="curl"
            className="mt-6"
          />
          <p className={`mt-4 max-w-3xl ${uberBody}`}>Response 201:</p>
          <HighlightedCode code={CONSENT_REQUEST_RESPONSE} language="json" showHeader={false} />
        </section>

        <section>
          <h2 className={uberSubheading}>Checking consent status</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            <code className="font-mono text-sm">GET /telematics/v1/consent/{"{consent_id}"}</code>
          </p>
          <HighlightedCode
            code={CONSENT_CHECK_CURL}
            language="bash"
            label="curl"
            className="mt-6"
          />
          <p className={`mt-4 max-w-3xl ${uberBody}`}>Response 200:</p>
          <HighlightedCode code={CONSENT_CHECK_RESPONSE} language="json" showHeader={false} />
        </section>

        <section>
          <h2 className={uberSubheading}>Webhook on consent change</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            When a driver accepts, declines, or revokes consent — Uber sends a webhook to your
            registered endpoint automatically.
          </p>
          <p className={`mt-4 max-w-3xl font-bold ${uberBody}`}>Webhook payload:</p>
          <HighlightedCode code={CONSENT_WEBHOOK_PAYLOAD} language="json" showHeader={false} />
          <p className={`mt-6 max-w-3xl font-bold ${uberBody}`}>Possible event values:</p>
          <ul className={`mt-2 max-w-3xl list-disc space-y-2 pl-5 ${uberBody}`}>
            <li>
              <code className="font-mono text-sm">consent_accepted</code> — driver opted in
            </li>
            <li>
              <code className="font-mono text-sm">consent_declined</code> — driver declined
            </li>
            <li>
              <code className="font-mono text-sm">consent_revoked</code> — driver withdrew consent
            </li>
            <li>
              <code className="font-mono text-sm">consent_expired</code> — consent period ended
            </li>
          </ul>
        </section>

        <section>
          <h2 className={uberSubheading}>Revoking consent</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            Drivers can revoke consent at any time from the Uber app. When consent is revoked:
          </p>
          <ul className={`mt-4 max-w-3xl list-disc space-y-2 pl-5 ${uberBody}`}>
            <li>All future API calls for that driver return 403</li>
            <li>
              Historical data already retrieved is not deleted from partner systems — partners are
              responsible for their own data retention policies
            </li>
            <li>Partner receives webhook notification immediately</li>
          </ul>
        </section>

        <section>
          <h2 className={uberSubheading}>Best practices</h2>
          <ul className={`mt-4 max-w-3xl list-disc space-y-2 pl-5 ${uberBody}`}>
            <li>Always check consent status before querying driver data</li>
            <li>Subscribe to consent webhooks to get real-time updates</li>
            <li>Never store driver_id without an associated active consent record</li>
            <li>Set consent expiration to no more than 1 year</li>
            <li>
              Clearly communicate to drivers what data you will access and how you will use it
            </li>
          </ul>
        </section>
      </div>
    </DocPage>
  ),

  "driver-score": () => (
    <DocPage title="Driver Score" subtitle="Aggregated safety score per driver">
      <div className="space-y-10 sm:space-y-12">
        <section>
          <h2 className={uberSubheading}>Overview</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            The Driver Score endpoint returns a single aggregated safety score between 0 and 100
            based on the last 30, 60, or 90 days of driving data. Higher scores indicate safer
            driving behavior.
          </p>
          <p className={`mt-6 max-w-3xl font-bold ${uberBody}`}>Score grades:</p>
          <DocsTable minWidth="40rem">
            <thead>
              <tr>
                <th>Score Range</th>
                <th>Grade</th>
                <th>Risk Level</th>
                <th>Recommended Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono">90-100</td>
                <td>A+</td>
                <td>Very Low</td>
                <td>Offer 25% discount</td>
              </tr>
              <tr>
                <td className="font-mono">80-89</td>
                <td>A</td>
                <td>Low</td>
                <td>Offer 15% discount</td>
              </tr>
              <tr>
                <td className="font-mono">70-79</td>
                <td>B+</td>
                <td>Moderate</td>
                <td>Offer 8% discount</td>
              </tr>
              <tr>
                <td className="font-mono">60-69</td>
                <td>B</td>
                <td>Average</td>
                <td>Standard rate</td>
              </tr>
              <tr>
                <td className="font-mono">50-59</td>
                <td>C</td>
                <td>Elevated</td>
                <td>Review required</td>
              </tr>
              <tr>
                <td className="font-mono">0-49</td>
                <td>D</td>
                <td>High</td>
                <td>Consider surcharge</td>
              </tr>
            </tbody>
          </DocsTable>
        </section>

        <section>
          <h2 className={uberSubheading}>Endpoint</h2>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <MethodBadge method="GET" variant="get" />
            <code className="font-mono text-sm text-black sm:text-base">
              /telematics/v1/drivers/{"{driver_id}"}/score
            </code>
          </div>
          <DocsTable minWidth="36rem">
            <thead>
              <tr>
                <th>Name</th>
                <th>In</th>
                <th>Type</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono">driver_id</td>
                <td>path</td>
                <td>string</td>
                <td>✅</td>
                <td>Uber driver UUID</td>
              </tr>
              <tr>
                <td className="font-mono">period</td>
                <td>query</td>
                <td>integer</td>
                <td>❌</td>
                <td>Days to analyze: 30, 60, or 90. Default: 90</td>
              </tr>
            </tbody>
          </DocsTable>
        </section>

        <section>
          <h2 className={uberSubheading}>Request example</h2>
          <HighlightedCode
            code={DRIVER_SCORE_CURL}
            language="bash"
            label="curl"
            className="mt-4"
          />
        </section>

        <section>
          <h2 className={uberSubheading}>Response</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>Response 200:</p>
          <HighlightedCode code={DRIVER_SCORE_RESPONSE} language="json" showHeader={false} />

          <p className={`mt-8 max-w-3xl font-bold ${uberBody}`}>Response fields:</p>
          <DocsTable minWidth="36rem">
            <thead>
              <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono">driver_id</td>
                <td>string</td>
                <td>Uber driver UUID</td>
              </tr>
              <tr>
                <td className="font-mono">score</td>
                <td>integer</td>
                <td>Overall safety score 0-100</td>
              </tr>
              <tr>
                <td className="font-mono">percentile</td>
                <td>integer</td>
                <td>Percentile vs all Uber drivers</td>
              </tr>
              <tr>
                <td className="font-mono">grade</td>
                <td>string</td>
                <td>Letter grade A+ through D</td>
              </tr>
              <tr>
                <td className="font-mono">period_days</td>
                <td>integer</td>
                <td>Days analyzed — 30, 60, or 90</td>
              </tr>
              <tr>
                <td className="font-mono">trips_analyzed</td>
                <td>integer</td>
                <td>Total trips in the period</td>
              </tr>
              <tr>
                <td className="font-mono">miles_analyzed</td>
                <td>number</td>
                <td>Total miles in the period</td>
              </tr>
              <tr>
                <td className="font-mono">last_updated</td>
                <td>string date-time</td>
                <td>When score was last calculated</td>
              </tr>
              <tr>
                <td className="font-mono">score_breakdown</td>
                <td>object</td>
                <td>Sub-scores per behavior category</td>
              </tr>
            </tbody>
          </DocsTable>

          <p className={`mt-8 max-w-3xl font-bold ${uberBody}`}>Score breakdown fields:</p>
          <DocsTable minWidth="36rem">
            <thead>
              <tr>
                <th>Field</th>
                <th>Description</th>
                <th>Weight</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono">speed_compliance</td>
                <td>Adherence to speed limits</td>
                <td>25%</td>
              </tr>
              <tr>
                <td className="font-mono">smooth_braking</td>
                <td>Avoidance of harsh braking events</td>
                <td>25%</td>
              </tr>
              <tr>
                <td className="font-mono">smooth_acceleration</td>
                <td>Avoidance of harsh acceleration</td>
                <td>20%</td>
              </tr>
              <tr>
                <td className="font-mono">phone_usage</td>
                <td>Phone handling while driving</td>
                <td>20%</td>
              </tr>
              <tr>
                <td className="font-mono">night_driving_safety</td>
                <td>Safety during nighttime hours</td>
                <td>10%</td>
              </tr>
            </tbody>
          </DocsTable>
        </section>

        <section>
          <h2 className={uberSubheading}>Error responses</h2>
          <DocsTable minWidth="32rem">
            <thead>
              <tr>
                <th>Status</th>
                <th>Code</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>403</td>
                <td>
                  <code>ConsentRequired</code>
                </td>
                <td>Driver has not given consent</td>
              </tr>
              <tr>
                <td>404</td>
                <td>
                  <code>NotFound</code>
                </td>
                <td>Driver ID does not exist or is inactive</td>
              </tr>
              <tr>
                <td>429</td>
                <td>
                  <code>RateLimitExceeded</code>
                </td>
                <td>Too many requests — use Retry-After header</td>
              </tr>
              <tr>
                <td>500</td>
                <td>
                  <code>Internal</code>
                </td>
                <td>Server error — retry with exponential backoff</td>
              </tr>
            </tbody>
          </DocsTable>
        </section>

        <section>
          <h2 className={uberSubheading}>Code example</h2>
          <HighlightedCode
            code={DRIVER_SCORE_JS}
            language="javascript"
            label="javascript"
            className="mt-4"
          />
        </section>

        <section>
          <h2 className={uberSubheading}>Notes</h2>
          <ul className={`mt-4 max-w-3xl list-disc space-y-2 pl-5 ${uberBody}`}>
            <li>Scores update once per day maximum — cache responses locally</li>
            <li>
              Percentile compares the driver against all active Uber drivers in the same city over
              the same period
            </li>
            <li>A driver needs at least 10 trips to generate a score</li>
            <li>Drivers with fewer than 10 trips return 404 NotFound</li>
            <li>
              Use the <code className="font-mono text-sm">/summary</code> endpoint to get score +
              events in one call and reduce your API call count
            </li>
          </ul>
        </section>
      </div>
    </DocPage>
  ),

  "driver-events": () => (
    <DocPage title="Driver Events" subtitle="Specific driving behavior data points">
      <div className="space-y-10 sm:space-y-12">
        <section>
          <h2 className={uberSubheading}>Overview</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            The Driver Events endpoint returns detailed counts of specific driving behavior events
            over a given period. While the Score endpoint gives you a single number, Events gives
            you the granular data behind that score — useful for explaining pricing decisions to
            drivers and building more precise risk models.
          </p>
        </section>

        <section>
          <h2 className={uberSubheading}>Endpoint</h2>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <MethodBadge method="GET" variant="get" />
            <code className="font-mono text-sm text-black sm:text-base">
              /telematics/v1/drivers/{"{driver_id}"}/events
            </code>
          </div>
          <DocsTable minWidth="36rem">
            <thead>
              <tr>
                <th>Name</th>
                <th>In</th>
                <th>Type</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono">driver_id</td>
                <td>path</td>
                <td>string</td>
                <td>✅</td>
                <td>Uber driver UUID</td>
              </tr>
              <tr>
                <td className="font-mono">period</td>
                <td>query</td>
                <td>integer</td>
                <td>❌</td>
                <td>Days to analyze: 30, 60, or 90. Default: 90</td>
              </tr>
              <tr>
                <td className="font-mono">event_type</td>
                <td>query</td>
                <td>string</td>
                <td>❌</td>
                <td>Filter by specific event type</td>
              </tr>
            </tbody>
          </DocsTable>
        </section>

        <section>
          <h2 className={uberSubheading}>Request example</h2>
          <HighlightedCode
            code={DRIVER_EVENTS_CURL}
            language="bash"
            label="curl"
            className="mt-4"
          />
        </section>

        <section>
          <h2 className={uberSubheading}>Response</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>Response 200:</p>
          <HighlightedCode code={DRIVER_EVENTS_RESPONSE} language="json" showHeader={false} />
        </section>

        <section>
          <h2 className={uberSubheading}>Event definitions</h2>
          <DocsTable minWidth="44rem">
            <thead>
              <tr>
                <th>Event</th>
                <th>Definition</th>
                <th>How detected</th>
                <th>Industry avg per 100 miles</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono">harsh_braking</td>
                <td>Deceleration exceeding 8 mph/sec</td>
                <td>Accelerometer in driver smartphone</td>
                <td>3.2</td>
              </tr>
              <tr>
                <td className="font-mono">harsh_acceleration</td>
                <td>Acceleration exceeding 8 mph/sec</td>
                <td>Accelerometer in driver smartphone</td>
                <td>2.8</td>
              </tr>
              <tr>
                <td className="font-mono">speeding</td>
                <td>
                  Exceeding speed limit by more than 9 mph for more than 10 seconds
                </td>
                <td>GPS cross-referenced with speed limit data</td>
                <td>1.1</td>
              </tr>
              <tr>
                <td className="font-mono">phone_usage</td>
                <td>
                  Picking up or interacting with unlocked phone while vehicle is in motion
                </td>
                <td>Gyroscope + screen state detection</td>
                <td>0.9</td>
              </tr>
              <tr>
                <td className="font-mono">night_driving_pct</td>
                <td>Percentage of total miles driven between 10pm and 5am</td>
                <td>GPS timestamp analysis</td>
                <td>N/A</td>
              </tr>
            </tbody>
          </DocsTable>
        </section>

        <section>
          <h2 className={uberSubheading}>vs_average field</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            The <code className="font-mono text-sm">vs_average</code> field shows how this driver
            compares to the industry average for that event type:
          </p>
          <ul className={`mt-4 max-w-3xl list-disc space-y-2 pl-5 ${uberBody}`}>
            <li>
              Negative percentage → driver has fewer events than average → safer
            </li>
            <li>
              Positive percentage → driver has more events than average → riskier
            </li>
          </ul>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>Example:</p>
          <p className={`mt-2 max-w-3xl ${uberBody}`}>
            <code className="font-mono text-sm">harsh_braking</code>{" "}
            <code className="font-mono text-sm">vs_average: &quot;-70%&quot;</code> means this driver
            brakes harshly 70% less than the average Uber driver.
          </p>
        </section>

        <section>
          <h2 className={uberSubheading}>Error responses</h2>
          <DocsTable minWidth="32rem">
            <thead>
              <tr>
                <th>Status</th>
                <th>Code</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>403</td>
                <td>
                  <code>ConsentRequired</code>
                </td>
                <td>Driver has not given consent</td>
              </tr>
              <tr>
                <td>404</td>
                <td>
                  <code>NotFound</code>
                </td>
                <td>Driver ID does not exist</td>
              </tr>
              <tr>
                <td>429</td>
                <td>
                  <code>RateLimitExceeded</code>
                </td>
                <td>Too many requests</td>
              </tr>
              <tr>
                <td>500</td>
                <td>
                  <code>Internal</code>
                </td>
                <td>Server error</td>
              </tr>
            </tbody>
          </DocsTable>
        </section>

        <section>
          <h2 className={uberSubheading}>Code example</h2>
          <HighlightedCode
            code={DRIVER_EVENTS_JS}
            language="javascript"
            label="javascript"
            className="mt-4"
          />
        </section>

        <section>
          <h2 className={uberSubheading}>Notes</h2>
          <ul className={`mt-4 max-w-3xl list-disc space-y-2 pl-5 ${uberBody}`}>
            <li>
              Event counts normalize to per_100_miles for fair comparison between drivers with
              different trip volumes
            </li>
            <li>
              industry_avg values are updated quarterly based on all active Uber drivers in the
              same city
            </li>
            <li>
              Use the <code className="font-mono text-sm">/summary</code> endpoint to get score +
              events in one call
            </li>
            <li>
              phone_usage detection requires the driver to have the Uber app active and the screen
              on — it may undercount usage on some device configurations
            </li>
            <li>
              night_driving_pct above 50% increases risk weighting in the overall score calculation
            </li>
          </ul>
        </section>
      </div>
    </DocPage>
  ),

  "driver-summary": () => (
    <DocPage title="Driver Summary" subtitle="Complete driver profile in a single API call">
      <div className="space-y-10 sm:space-y-12">
        <section>
          <h2 className={uberSubheading}>Overview</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            The Driver Summary endpoint combines score, events, and metadata into a single response.
            Use this endpoint instead of calling <code className="font-mono text-sm">/score</code> and{" "}
            <code className="font-mono text-sm">/events</code> separately — it reduces your API call
            count by 50% and counts as a single request against your rate limit.
          </p>
          <p className={`mt-6 max-w-3xl font-bold ${uberBody}`}>
            When to use /summary vs individual endpoints:
          </p>
          <DocsTable minWidth="40rem">
            <thead>
              <tr>
                <th>Use case</th>
                <th>Recommended endpoint</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Building a driver risk profile for underwriting</td>
                <td className="font-mono">/summary</td>
              </tr>
              <tr>
                <td>Checking only the score for a quick decision</td>
                <td className="font-mono">/score</td>
              </tr>
              <tr>
                <td>Analyzing specific event types in detail</td>
                <td className="font-mono">/events</td>
              </tr>
              <tr>
                <td>Monitoring score changes via webhooks</td>
                <td className="font-mono">/score</td>
              </tr>
              <tr>
                <td>Bulk portfolio assessment</td>
                <td className="font-mono">/fleet</td>
              </tr>
            </tbody>
          </DocsTable>
        </section>

        <section>
          <h2 className={uberSubheading}>Endpoint</h2>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <MethodBadge method="GET" variant="get" />
            <code className="font-mono text-sm text-black sm:text-base">
              /telematics/v1/drivers/{"{driver_id}"}/summary
            </code>
          </div>
          <DocsTable minWidth="36rem">
            <thead>
              <tr>
                <th>Name</th>
                <th>In</th>
                <th>Type</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono">driver_id</td>
                <td>path</td>
                <td>string</td>
                <td>✅</td>
                <td>Uber driver UUID</td>
              </tr>
              <tr>
                <td className="font-mono">period</td>
                <td>query</td>
                <td>integer</td>
                <td>❌</td>
                <td>Days to analyze: 30, 60, or 90. Default: 90</td>
              </tr>
            </tbody>
          </DocsTable>
        </section>

        <section>
          <h2 className={uberSubheading}>Request example</h2>
          <HighlightedCode
            code={DRIVER_SUMMARY_CURL}
            language="bash"
            label="curl"
            className="mt-4"
          />
        </section>

        <section>
          <h2 className={uberSubheading}>Response</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>Response 200:</p>
          <HighlightedCode code={DRIVER_SUMMARY_RESPONSE} language="json" showHeader={false} />

          <p className={`mt-8 max-w-3xl font-bold ${uberBody}`}>Response fields:</p>
          <DocsTable minWidth="36rem">
            <thead>
              <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono">driver_id</td>
                <td>string</td>
                <td>Uber driver UUID</td>
              </tr>
              <tr>
                <td className="font-mono">driver_name</td>
                <td>string</td>
                <td>Driver display name</td>
              </tr>
              <tr>
                <td className="font-mono">city</td>
                <td>string</td>
                <td>Primary operating city</td>
              </tr>
              <tr>
                <td className="font-mono">consent_status</td>
                <td>string</td>
                <td>active, pending, revoked, or expired</td>
              </tr>
              <tr>
                <td className="font-mono">period_days</td>
                <td>integer</td>
                <td>Days analyzed — 30, 60, or 90</td>
              </tr>
              <tr>
                <td className="font-mono">last_updated</td>
                <td>string date-time</td>
                <td>When data was last calculated</td>
              </tr>
              <tr>
                <td className="font-mono">score</td>
                <td>object</td>
                <td>Full score payload — same shape as GET /score</td>
              </tr>
              <tr>
                <td className="font-mono">events</td>
                <td>object</td>
                <td>Full events payload — same shape as GET /events</td>
              </tr>
            </tbody>
          </DocsTable>
        </section>

        <section>
          <h2 className={uberSubheading}>Error responses</h2>
          <DocsTable minWidth="32rem">
            <thead>
              <tr>
                <th>Status</th>
                <th>Code</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>403</td>
                <td>
                  <code>ConsentRequired</code>
                </td>
                <td>Driver has not given consent</td>
              </tr>
              <tr>
                <td>404</td>
                <td>
                  <code>NotFound</code>
                </td>
                <td>Driver ID does not exist or is inactive</td>
              </tr>
              <tr>
                <td>429</td>
                <td>
                  <code>RateLimitExceeded</code>
                </td>
                <td>Too many requests — use Retry-After header</td>
              </tr>
              <tr>
                <td>500</td>
                <td>
                  <code>Internal</code>
                </td>
                <td>Server error — retry with exponential backoff</td>
              </tr>
            </tbody>
          </DocsTable>
        </section>

        <section>
          <h2 className={uberSubheading}>Code example</h2>
          <HighlightedCode
            code={DRIVER_SUMMARY_JS}
            language="javascript"
            label="javascript"
            className="mt-4"
          />
        </section>

        <section>
          <h2 className={uberSubheading}>Notes</h2>
          <ul className={`mt-4 max-w-3xl list-disc space-y-2 pl-5 ${uberBody}`}>
            <li>
              Preferred endpoint for underwriting workflows — one call returns everything needed for
              a risk decision
            </li>
            <li>
              The nested <code className="font-mono text-sm">score</code> and{" "}
              <code className="font-mono text-sm">events</code> objects match their standalone
              endpoint responses exactly
            </li>
            <li>Counts as one request against your rate limit, not two</li>
            <li>
              Cache summary responses locally — data updates once per day maximum
            </li>
            <li>
              Requires active driver consent — returns 403 if consent is pending, revoked, or
              expired
            </li>
          </ul>
        </section>
      </div>
    </DocPage>
  ),

  "fleet-query": () => (
    <DocPage title="Fleet Query" subtitle="Query scores for multiple drivers at once">
      <div className="space-y-10 sm:space-y-12">
        <section>
          <h2 className={uberSubheading}>Overview</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            The Fleet Query endpoint returns scores for multiple drivers in a single call. Use this
            for portfolio-level risk assessment — understanding the overall risk profile of all
            drivers you have consent for, without making individual calls for each driver.
          </p>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            Fleet endpoints have stricter rate limits than individual driver endpoints. See{" "}
            <DocsLink section="rate-limiting">Rate Limiting</DocsLink> for details.
          </p>
        </section>

        <section>
          <h2 className={uberSubheading}>Endpoint</h2>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <MethodBadge method="GET" variant="get" />
            <code className="font-mono text-sm text-black sm:text-base">
              /telematics/v1/fleet
            </code>
          </div>
          <DocsTable minWidth="40rem">
            <thead>
              <tr>
                <th>Name</th>
                <th>In</th>
                <th>Type</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono">min_score</td>
                <td>query</td>
                <td>integer</td>
                <td>❌</td>
                <td>Filter drivers with score at or above this value</td>
              </tr>
              <tr>
                <td className="font-mono">max_score</td>
                <td>query</td>
                <td>integer</td>
                <td>❌</td>
                <td>Filter drivers with score at or below this value</td>
              </tr>
              <tr>
                <td className="font-mono">city</td>
                <td>query</td>
                <td>string</td>
                <td>❌</td>
                <td>Filter by city — Chicago, Dallas, Houston, etc.</td>
              </tr>
              <tr>
                <td className="font-mono">period</td>
                <td>query</td>
                <td>integer</td>
                <td>❌</td>
                <td>Days to analyze: 30, 60, or 90. Default: 90</td>
              </tr>
              <tr>
                <td className="font-mono">grade</td>
                <td>query</td>
                <td>string</td>
                <td>❌</td>
                <td>Filter by grade — A+, A, B+, B, C, D</td>
              </tr>
              <tr>
                <td className="font-mono">limit</td>
                <td>query</td>
                <td>integer</td>
                <td>❌</td>
                <td>Max results per page. Default: 100, max: 500</td>
              </tr>
              <tr>
                <td className="font-mono">cursor</td>
                <td>query</td>
                <td>string</td>
                <td>❌</td>
                <td>Pagination cursor from previous response</td>
              </tr>
            </tbody>
          </DocsTable>
        </section>

        <section>
          <h2 className={uberSubheading}>Request examples</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            Get all drivers with score above 80:
          </p>
          <HighlightedCode
            code={FLEET_QUERY_CURL_MIN_SCORE}
            language="bash"
            label="curl"
            className="mt-4"
          />
          <p className={`mt-6 max-w-3xl ${uberBody}`}>Get all drivers in Chicago:</p>
          <HighlightedCode
            code={FLEET_QUERY_CURL_CITY}
            language="bash"
            label="curl"
            className="mt-4"
          />
          <p className={`mt-6 max-w-3xl ${uberBody}`}>Get high-risk drivers for review:</p>
          <HighlightedCode
            code={FLEET_QUERY_CURL_MAX_SCORE}
            language="bash"
            label="curl"
            className="mt-4"
          />
        </section>

        <section>
          <h2 className={uberSubheading}>Response</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>Response 200:</p>
          <HighlightedCode code={FLEET_QUERY_RESPONSE} language="json" showHeader={false} />
        </section>

        <section>
          <h2 className={uberSubheading}>Pagination</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            Fleet results are paginated. Use cursor-based pagination to retrieve all results.
          </p>
          <HighlightedCode
            code={FLEET_QUERY_PAGINATION_JS}
            language="javascript"
            label="javascript"
            className="mt-4"
          />
        </section>

        <section>
          <h2 className={uberSubheading}>Portfolio analytics example</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            Use fleet data with filter and reduce for portfolio analytics:
          </p>
          <HighlightedCode
            code={FLEET_QUERY_ANALYTICS_JS}
            language="javascript"
            label="javascript"
            className="mt-4"
          />
        </section>

        <section>
          <h2 className={uberSubheading}>Error responses</h2>
          <DocsTable minWidth="32rem">
            <thead>
              <tr>
                <th>Status</th>
                <th>Code</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>400</td>
                <td>
                  <code>BadRequest</code>
                </td>
                <td>Invalid filter parameters</td>
              </tr>
              <tr>
                <td>401</td>
                <td>
                  <code>Unauthorized</code>
                </td>
                <td>Invalid or expired token</td>
              </tr>
              <tr>
                <td>429</td>
                <td>
                  <code>RateLimitExceeded</code>
                </td>
                <td>Fleet endpoints limited to 100 requests per minute</td>
              </tr>
              <tr>
                <td>500</td>
                <td>
                  <code>Internal</code>
                </td>
                <td>Server error</td>
              </tr>
            </tbody>
          </DocsTable>
        </section>

        <section>
          <h2 className={uberSubheading}>Notes</h2>
          <ul className={`mt-4 max-w-3xl list-disc space-y-2 pl-5 ${uberBody}`}>
            <li>
              Fleet endpoint only returns drivers who have active consent with your partner account
              — never exposes other partners&apos; drivers
            </li>
            <li>Results are sorted by score descending by default</li>
            <li>
              Use <code className="font-mono text-sm">min_score=80</code> to quickly identify your
              best drivers for discount offers
            </li>
            <li>
              Use <code className="font-mono text-sm">max_score=59</code> to identify drivers
              requiring rate review
            </li>
            <li>
              Cache fleet responses for up to 1 hour — scores update at most once per day
            </li>
            <li>
              For full driver profiles use{" "}
              <code className="font-mono text-sm">/fleet/bulk</code> instead
            </li>
          </ul>
        </section>
      </div>
    </DocPage>
  ),

  "bulk-access": () => (
    <DocPage title="Bulk Access" subtitle="Retrieve full profiles for multiple drivers in one call">
      <div className="space-y-10 sm:space-y-12">
        <section>
          <h2 className={uberSubheading}>Overview</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            The Bulk Access endpoint returns complete driver summaries for up to 100 drivers in a
            single API call. Use this when you need full profiles — score, events, and metadata —
            for a specific list of drivers.
          </p>
          <p className={`mt-6 max-w-3xl font-bold ${uberBody}`}>
            Difference between /fleet and /fleet/bulk:
          </p>
          <DocsTable minWidth="36rem">
            <thead>
              <tr>
                <th aria-label="Feature" />
                <th className="font-mono">/fleet</th>
                <th className="font-mono">/fleet/bulk</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Method</td>
                <td className="font-mono">GET</td>
                <td className="font-mono">POST</td>
              </tr>
              <tr>
                <td>Input</td>
                <td>Query filters</td>
                <td>Explicit list of driver IDs</td>
              </tr>
              <tr>
                <td>Response</td>
                <td>Score + grade only</td>
                <td>Full summary per driver</td>
              </tr>
              <tr>
                <td>Max drivers</td>
                <td>500 per page</td>
                <td>100 per call</td>
              </tr>
              <tr>
                <td>Best for</td>
                <td>Portfolio overview</td>
                <td>Underwriting decisions</td>
              </tr>
            </tbody>
          </DocsTable>
        </section>

        <section>
          <h2 className={uberSubheading}>Endpoint</h2>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <MethodBadge method="POST" variant="post" />
            <code className="font-mono text-sm text-black sm:text-base">
              /telematics/v1/fleet/bulk
            </code>
          </div>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            Request body: JSON object with <code className="font-mono text-sm">driver_ids</code>{" "}
            array. Maximum 100 driver IDs per request.
          </p>
        </section>

        <section>
          <h2 className={uberSubheading}>Request example</h2>
          <HighlightedCode code={BULK_ACCESS_CURL} language="bash" label="curl" className="mt-4" />
        </section>

        <section>
          <h2 className={uberSubheading}>Response</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>Response 200:</p>
          <HighlightedCode code={BULK_ACCESS_RESPONSE} language="json" showHeader={false} />
        </section>

        <section>
          <h2 className={uberSubheading}>Partial success</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            Bulk requests use partial success — if some driver IDs fail, the response still returns
            data for the ones that succeeded. Failed drivers appear in the{" "}
            <code className="font-mono text-sm">errors</code> array.
          </p>
          <p className={`mt-4 max-w-3xl font-bold ${uberBody}`}>
            Common reasons a driver appears in errors:
          </p>
          <ul className={`mt-2 max-w-3xl list-disc space-y-2 pl-5 ${uberBody}`}>
            <li>
              <code className="font-mono text-sm">ConsentRequired</code> — driver has not opted in
            </li>
            <li>
              <code className="font-mono text-sm">ConsentExpired</code> — driver consent has lapsed
            </li>
            <li>
              <code className="font-mono text-sm">NotFound</code> — driver ID does not exist
            </li>
            <li>
              <code className="font-mono text-sm">Insufficient data</code> — driver has fewer than
              10 trips
            </li>
          </ul>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            Always check both <code className="font-mono text-sm">drivers</code> and{" "}
            <code className="font-mono text-sm">errors</code> in the response.
          </p>
        </section>

        <section>
          <h2 className={uberSubheading}>Code example</h2>
          <HighlightedCode
            code={BULK_ACCESS_JS}
            language="javascript"
            label="javascript"
            className="mt-4"
          />
        </section>

        <section>
          <h2 className={uberSubheading}>Error responses</h2>
          <DocsTable minWidth="32rem">
            <thead>
              <tr>
                <th>Status</th>
                <th>Code</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>400</td>
                <td>
                  <code>BadRequest</code>
                </td>
                <td>More than 100 driver IDs submitted</td>
              </tr>
              <tr>
                <td>400</td>
                <td>
                  <code>InvalidRequest</code>
                </td>
                <td>driver_ids array is empty or missing</td>
              </tr>
              <tr>
                <td>401</td>
                <td>
                  <code>Unauthorized</code>
                </td>
                <td>Invalid or expired token</td>
              </tr>
              <tr>
                <td>429</td>
                <td>
                  <code>RateLimitExceeded</code>
                </td>
                <td>Too many requests — bulk endpoint limited to 100 requests per minute</td>
              </tr>
              <tr>
                <td>500</td>
                <td>
                  <code>Internal</code>
                </td>
                <td>Server error</td>
              </tr>
            </tbody>
          </DocsTable>
        </section>

        <section>
          <h2 className={uberSubheading}>Notes</h2>
          <ul className={`mt-4 max-w-3xl list-disc space-y-2 pl-5 ${uberBody}`}>
            <li>
              Maximum 100 driver IDs per request — batch larger lists into multiple calls
            </li>
            <li>
              Each bulk call counts as one request against your rate limit regardless of how many
              drivers are in the batch
            </li>
            <li>
              Partial success is intentional — do not retry the entire batch if only some drivers
              fail
            </li>
            <li>Retry only the failed driver IDs from the errors array</li>
            <li>
              Results are not guaranteed to be in the same order as the input driver_ids array —
              use driver_id to match results to your records
            </li>
            <li>Cache bulk responses for up to 24 hours</li>
          </ul>
        </section>
      </div>
    </DocPage>
  ),

  "webhooks-overview": () => (
    <DocPage
      title="Webhooks Overview"
      subtitle="Real-time notifications when driver data changes"
    >
      <div className="space-y-10 sm:space-y-12">
        <section>
          <h2 className={uberSubheading}>Overview</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            Webhooks let Uber push notifications to your server automatically when important events
            occur — instead of you polling the API repeatedly to check for changes.
          </p>
          <p className={`mt-6 max-w-3xl font-bold ${uberBody}`}>Without webhooks:</p>
          <ul className={`mt-2 max-w-3xl list-none space-y-1 pl-0 font-mono text-sm ${uberBody}`}>
            <li>Your server calls GET /score every hour for 1000 drivers</li>
            <li>→ 24,000 API calls per day just to detect changes</li>
            <li>→ Wastes rate limit budget</li>
            <li>→ Delayed detection — up to 1 hour lag</li>
          </ul>
          <p className={`mt-6 max-w-3xl font-bold ${uberBody}`}>With webhooks:</p>
          <ul className={`mt-2 max-w-3xl list-none space-y-1 pl-0 font-mono text-sm ${uberBody}`}>
            <li>Uber calls your server the moment a score changes</li>
            <li>→ 0 polling calls needed</li>
            <li>→ Instant notification</li>
            <li>→ Score changes trigger immediate pricing updates</li>
          </ul>
        </section>

        <section>
          <h2 className={uberSubheading}>Subscribing to webhooks</h2>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <MethodBadge method="POST" variant="post" />
            <code className="font-mono text-sm text-black sm:text-base">
              /telematics/v1/subscribe
            </code>
          </div>
          <HighlightedCode
            code={WEBHOOKS_SUBSCRIBE_CURL}
            language="bash"
            label="curl"
            className="mt-6"
          />
          <p className={`mt-4 max-w-3xl ${uberBody}`}>Response 201:</p>
          <HighlightedCode code={WEBHOOKS_SUBSCRIBE_RESPONSE} language="json" showHeader={false} />
          <DocsTable minWidth="36rem">
            <thead>
              <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono">driver_id</td>
                <td>string</td>
                <td>Driver to subscribe to</td>
              </tr>
              <tr>
                <td className="font-mono">webhook_url</td>
                <td>string</td>
                <td>Your server endpoint that receives events</td>
              </tr>
              <tr>
                <td className="font-mono">events</td>
                <td>list</td>
                <td>
                  Event types to subscribe to — see{" "}
                  <DocsLink section="webhook-event-types">Event Types</DocsLink>
                </td>
              </tr>
              <tr>
                <td className="font-mono">threshold</td>
                <td>integer</td>
                <td>
                  Minimum score change to trigger score_change event. Default: 5. Set higher to
                  reduce noise.
                </td>
              </tr>
            </tbody>
          </DocsTable>
        </section>

        <section>
          <h2 className={uberSubheading}>Webhook security</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            Every webhook request from Uber includes a signature header so you can verify it came
            from Uber and not a third party.
          </p>
          <HighlightedCode
            code="X-Uber-Signature: sha256=abc123xyz..."
            language="http"
            showHeader={false}
            className="mt-4"
          />
          <p className={`mt-4 max-w-3xl ${uberBody}`}>Verify in your server:</p>
          <HighlightedCode
            code={WEBHOOKS_VERIFY_JS}
            language="javascript"
            label="javascript"
            className="mt-4"
          />
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            Always respond with 200 within 5 seconds. If Uber does not receive a 200, it retries up
            to 3 times with exponential backoff.
          </p>
        </section>

        <section>
          <h2 className={uberSubheading}>Retry policy</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            If your server fails to respond with 200 within 5 seconds:
          </p>
          <DocsTable minWidth="28rem">
            <thead>
              <tr>
                <th>Attempt</th>
                <th>Delay</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1st retry</td>
                <td>30 seconds after first attempt</td>
              </tr>
              <tr>
                <td>2nd retry</td>
                <td>5 minutes after 1st retry</td>
              </tr>
              <tr>
                <td>3rd retry</td>
                <td>1 hour after 2nd retry</td>
              </tr>
              <tr>
                <td>Final failure</td>
                <td>Event marked as undelivered — no further retries</td>
              </tr>
            </tbody>
          </DocsTable>
        </section>

        <section>
          <h2 className={uberSubheading}>Notes</h2>
          <ul className={`mt-4 max-w-3xl list-disc space-y-2 pl-5 ${uberBody}`}>
            <li>
              Always respond with 200 immediately — process the event asynchronously if needed
            </li>
            <li>
              Webhook delivery is not guaranteed — implement occasional polling as a fallback
            </li>
            <li>
              Use threshold to control noise — threshold: 5 means only notify when score changes by
              5+ points
            </li>
            <li>One subscription per driver per partner</li>
            <li>Subscriptions are automatically cancelled when driver consent is revoked</li>
          </ul>
        </section>
      </div>
    </DocPage>
  ),

  "webhook-event-types": () => (
    <DocPage title="Event Types" subtitle="All webhook events the Telematics API can send">
      <div className="space-y-10 sm:space-y-12">
        <section>
          <h2 className={uberSubheading}>Event types overview</h2>
          <DocsTable minWidth="40rem">
            <thead>
              <tr>
                <th>Event</th>
                <th>When triggered</th>
                <th>Recommended action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono">score_change</td>
                <td>Driver score changed by threshold or more</td>
                <td>Update pricing model for this driver</td>
              </tr>
              <tr>
                <td className="font-mono">consent_accepted</td>
                <td>Driver opted in to data sharing</td>
                <td>Query initial score and events</td>
              </tr>
              <tr>
                <td className="font-mono">consent_declined</td>
                <td>Driver declined opt-in request</td>
                <td>Mark driver as unavailable in your system</td>
              </tr>
              <tr>
                <td className="font-mono">consent_revoked</td>
                <td>Driver withdrew consent</td>
                <td>Stop querying driver — remove from active portfolio</td>
              </tr>
              <tr>
                <td className="font-mono">consent_expired</td>
                <td>Driver consent period ended</td>
                <td>Request renewal — send new consent request</td>
              </tr>
              <tr>
                <td className="font-mono">driver_inactive</td>
                <td>Driver has not completed trips in 30 days</td>
                <td>Flag for review — score may become stale</td>
              </tr>
            </tbody>
          </DocsTable>
        </section>

        <section>
          <h2 className={uberSubheading}>score_change</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            Triggered when a driver&apos;s score changes by the threshold amount or more since the
            last calculation.
          </p>
          <p className={`mt-4 max-w-3xl font-bold ${uberBody}`}>Webhook payload:</p>
          <HighlightedCode code={WEBHOOKS_SCORE_CHANGE_PAYLOAD} language="json" showHeader={false} />
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            Positive change = driver improved. Negative change = driver&apos;s behavior worsened. A
            change from grade A to B+ may trigger a pricing review.
          </p>
        </section>

        <section>
          <h2 className={uberSubheading}>consent_accepted</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            Triggered when a driver accepts your consent request. This is the signal to query their
            initial score.
          </p>
          <p className={`mt-4 max-w-3xl font-bold ${uberBody}`}>Webhook payload:</p>
          <HighlightedCode
            code={WEBHOOKS_CONSENT_ACCEPTED_PAYLOAD}
            language="json"
            showHeader={false}
          />
        </section>

        <section>
          <h2 className={uberSubheading}>consent_revoked</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            Triggered immediately when a driver withdraws consent from the Uber app. Stop querying
            this driver immediately.
          </p>
          <p className={`mt-4 max-w-3xl font-bold ${uberBody}`}>Webhook payload:</p>
          <HighlightedCode
            code={WEBHOOKS_CONSENT_REVOKED_PAYLOAD}
            language="json"
            showHeader={false}
          />
          <p className={`mt-6 max-w-3xl font-bold ${uberBody}`}>Possible reason values:</p>
          <DocsTable minWidth="32rem">
            <thead>
              <tr>
                <th>Reason</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono">driver_requested</td>
                <td>Driver manually revoked in Uber app</td>
              </tr>
              <tr>
                <td className="font-mono">consent_expired</td>
                <td>Consent period ended — same as consent_expired event</td>
              </tr>
              <tr>
                <td className="font-mono">partner_removed</td>
                <td>Partner account was deactivated by Uber</td>
              </tr>
              <tr>
                <td className="font-mono">uber_policy</td>
                <td>Uber revoked due to policy violation</td>
              </tr>
            </tbody>
          </DocsTable>
        </section>

        <section>
          <h2 className={uberSubheading}>consent_expired</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            Triggered when a consent record reaches its expires_at date. Request a new consent from
            the driver to continue accessing their data.
          </p>
          <p className={`mt-4 max-w-3xl font-bold ${uberBody}`}>Webhook payload:</p>
          <HighlightedCode
            code={WEBHOOKS_CONSENT_EXPIRED_PAYLOAD}
            language="json"
            showHeader={false}
          />
        </section>

        <section>
          <h2 className={uberSubheading}>driver_inactive</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            Triggered when a driver has not completed any trips in the last 30 days. Their score may
            become stale.
          </p>
          <p className={`mt-4 max-w-3xl font-bold ${uberBody}`}>Webhook payload:</p>
          <HighlightedCode
            code={WEBHOOKS_DRIVER_INACTIVE_PAYLOAD}
            language="json"
            showHeader={false}
          />
        </section>

        <section>
          <h2 className={uberSubheading}>Handling events in code</h2>
          <HighlightedCode
            code={WEBHOOKS_HANDLE_EVENTS_JS}
            language="javascript"
            label="javascript"
            className="mt-4"
          />
        </section>
      </div>
    </DocPage>
  ),

  "reference-models": () => (
    <DocPage title="Models" subtitle="Complete data models for all API objects">
      <div className="space-y-10 sm:space-y-12">
        <section>
          <h2 className={uberSubheading}>DriverScore</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            Returned by GET <code className="font-mono text-sm">/drivers/{"{id}"}/score</code>
          </p>
          <DocsTable minWidth="40rem">
            <thead>
              <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono">driver_id</td>
                <td>string</td>
                <td>✅</td>
                <td>Uber driver UUID</td>
              </tr>
              <tr>
                <td className="font-mono">score</td>
                <td>integer</td>
                <td>✅</td>
                <td>Overall safety score 0-100</td>
              </tr>
              <tr>
                <td className="font-mono">percentile</td>
                <td>integer</td>
                <td>✅</td>
                <td>Percentile vs all Uber drivers in same city</td>
              </tr>
              <tr>
                <td className="font-mono">grade</td>
                <td>string</td>
                <td>✅</td>
                <td>Letter grade — A+, A, B+, B, C+, C, D</td>
              </tr>
              <tr>
                <td className="font-mono">period_days</td>
                <td>integer</td>
                <td>✅</td>
                <td>Days analyzed — 30, 60, or 90</td>
              </tr>
              <tr>
                <td className="font-mono">trips_analyzed</td>
                <td>integer</td>
                <td>✅</td>
                <td>Total trips in the period</td>
              </tr>
              <tr>
                <td className="font-mono">miles_analyzed</td>
                <td>number double</td>
                <td>✅</td>
                <td>Total miles in the period</td>
              </tr>
              <tr>
                <td className="font-mono">last_updated</td>
                <td>string date-time</td>
                <td>✅</td>
                <td>When score was last calculated</td>
              </tr>
              <tr>
                <td className="font-mono">score_breakdown</td>
                <td>ScoreBreakdown</td>
                <td>✅</td>
                <td>Sub-scores per behavior</td>
              </tr>
            </tbody>
          </DocsTable>
        </section>

        <section>
          <h2 className={uberSubheading}>ScoreBreakdown</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            Nested object inside DriverScore and DriverSummary
          </p>
          <DocsTable minWidth="40rem">
            <thead>
              <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Weight</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono">speed_compliance</td>
                <td>integer</td>
                <td>25%</td>
                <td>Adherence to speed limits 0-100</td>
              </tr>
              <tr>
                <td className="font-mono">smooth_braking</td>
                <td>integer</td>
                <td>25%</td>
                <td>Avoidance of harsh braking 0-100</td>
              </tr>
              <tr>
                <td className="font-mono">smooth_acceleration</td>
                <td>integer</td>
                <td>20%</td>
                <td>Avoidance of harsh acceleration 0-100</td>
              </tr>
              <tr>
                <td className="font-mono">phone_usage</td>
                <td>integer</td>
                <td>20%</td>
                <td>Avoidance of phone handling while driving 0-100</td>
              </tr>
              <tr>
                <td className="font-mono">night_driving_safety</td>
                <td>integer</td>
                <td>10%</td>
                <td>Safety during nighttime hours 0-100</td>
              </tr>
            </tbody>
          </DocsTable>
        </section>

        <section>
          <h2 className={uberSubheading}>DrivingEvents</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            Returned by GET <code className="font-mono text-sm">/drivers/{"{id}"}/events</code>
          </p>
          <DocsTable minWidth="40rem">
            <thead>
              <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono">driver_id</td>
                <td>string</td>
                <td>✅</td>
                <td>Uber driver UUID</td>
              </tr>
              <tr>
                <td className="font-mono">period_days</td>
                <td>integer</td>
                <td>✅</td>
                <td>Days analyzed</td>
              </tr>
              <tr>
                <td className="font-mono">total_trips</td>
                <td>integer</td>
                <td>✅</td>
                <td>Total trips in the period</td>
              </tr>
              <tr>
                <td className="font-mono">total_miles</td>
                <td>number double</td>
                <td>✅</td>
                <td>Total miles in the period</td>
              </tr>
              <tr>
                <td className="font-mono">events</td>
                <td>EventCounts</td>
                <td>✅</td>
                <td>Driving event counts and rates</td>
              </tr>
            </tbody>
          </DocsTable>
        </section>

        <section>
          <h2 className={uberSubheading}>EventCounts</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>Nested object inside DrivingEvents</p>
          <DocsTable minWidth="36rem">
            <thead>
              <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono">harsh_braking</td>
                <td>EventDetail</td>
                <td>Harsh braking events</td>
              </tr>
              <tr>
                <td className="font-mono">harsh_acceleration</td>
                <td>EventDetail</td>
                <td>Harsh acceleration events</td>
              </tr>
              <tr>
                <td className="font-mono">speeding</td>
                <td>EventDetail</td>
                <td>Speeding events</td>
              </tr>
              <tr>
                <td className="font-mono">phone_usage</td>
                <td>EventDetail</td>
                <td>Phone handling events</td>
              </tr>
              <tr>
                <td className="font-mono">night_driving_pct</td>
                <td>number double</td>
                <td>Percentage of miles driven at night</td>
              </tr>
            </tbody>
          </DocsTable>
        </section>

        <section>
          <h2 className={uberSubheading}>EventDetail</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>Nested object inside EventCounts</p>
          <DocsTable minWidth="36rem">
            <thead>
              <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono">count</td>
                <td>integer</td>
                <td>Total events in the period</td>
              </tr>
              <tr>
                <td className="font-mono">per_100_miles</td>
                <td>number double</td>
                <td>Events per 100 miles driven</td>
              </tr>
              <tr>
                <td className="font-mono">industry_avg</td>
                <td>number double</td>
                <td>Industry average per 100 miles</td>
              </tr>
              <tr>
                <td className="font-mono">vs_average</td>
                <td>string</td>
                <td>Percentage vs industry average — e.g. &quot;-70%&quot;</td>
              </tr>
            </tbody>
          </DocsTable>
        </section>

        <section>
          <h2 className={uberSubheading}>DriverSummary</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            Returned by GET <code className="font-mono text-sm">/drivers/{"{id}"}/summary</code>
          </p>
          <DocsTable minWidth="40rem">
            <thead>
              <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono">driver_id</td>
                <td>string</td>
                <td>✅</td>
                <td>Uber driver UUID</td>
              </tr>
              <tr>
                <td className="font-mono">consent_status</td>
                <td>string</td>
                <td>✅</td>
                <td>active, pending, revoked, or expired</td>
              </tr>
              <tr>
                <td className="font-mono">consent_expires</td>
                <td>string date-time</td>
                <td>✅</td>
                <td>When consent expires</td>
              </tr>
              <tr>
                <td className="font-mono">score</td>
                <td>integer</td>
                <td>✅</td>
                <td>Overall safety score 0-100</td>
              </tr>
              <tr>
                <td className="font-mono">percentile</td>
                <td>integer</td>
                <td>✅</td>
                <td>Percentile vs all Uber drivers</td>
              </tr>
              <tr>
                <td className="font-mono">grade</td>
                <td>string</td>
                <td>✅</td>
                <td>Letter grade A+ through D</td>
              </tr>
              <tr>
                <td className="font-mono">period_days</td>
                <td>integer</td>
                <td>✅</td>
                <td>Days analyzed</td>
              </tr>
              <tr>
                <td className="font-mono">trips_analyzed</td>
                <td>integer</td>
                <td>✅</td>
                <td>Total trips in the period</td>
              </tr>
              <tr>
                <td className="font-mono">miles_analyzed</td>
                <td>number double</td>
                <td>✅</td>
                <td>Total miles driven</td>
              </tr>
              <tr>
                <td className="font-mono">hours_active</td>
                <td>number double</td>
                <td>✅</td>
                <td>Total hours with app active</td>
              </tr>
              <tr>
                <td className="font-mono">last_updated</td>
                <td>string date-time</td>
                <td>✅</td>
                <td>When data was last calculated</td>
              </tr>
              <tr>
                <td className="font-mono">score_breakdown</td>
                <td>ScoreBreakdown</td>
                <td>✅</td>
                <td>Sub-scores per behavior</td>
              </tr>
              <tr>
                <td className="font-mono">events</td>
                <td>EventCounts</td>
                <td>✅</td>
                <td>Driving event counts and rates</td>
              </tr>
            </tbody>
          </DocsTable>
        </section>

        <section>
          <h2 className={uberSubheading}>ConsentRecord</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            Returned by POST <code className="font-mono text-sm">/consent</code> and GET{" "}
            <code className="font-mono text-sm">/consent/{"{id}"}</code>
          </p>
          <DocsTable minWidth="40rem">
            <thead>
              <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono">consent_id</td>
                <td>string</td>
                <td>✅</td>
                <td>Unique consent UUID</td>
              </tr>
              <tr>
                <td className="font-mono">driver_id</td>
                <td>string</td>
                <td>✅</td>
                <td>Uber driver UUID</td>
              </tr>
              <tr>
                <td className="font-mono">partner_id</td>
                <td>string</td>
                <td>✅</td>
                <td>Insurance partner identifier</td>
              </tr>
              <tr>
                <td className="font-mono">status</td>
                <td>string</td>
                <td>✅</td>
                <td>pending, active, revoked, or expired</td>
              </tr>
              <tr>
                <td className="font-mono">scope</td>
                <td>list string</td>
                <td>✅</td>
                <td>Data types consented to</td>
              </tr>
              <tr>
                <td className="font-mono">expires_at</td>
                <td>string date-time</td>
                <td>✅</td>
                <td>When consent expires</td>
              </tr>
              <tr>
                <td className="font-mono">created_at</td>
                <td>string date-time</td>
                <td>✅</td>
                <td>When consent was requested</td>
              </tr>
              <tr>
                <td className="font-mono">accepted_at</td>
                <td>string date-time</td>
                <td>❌</td>
                <td>When driver accepted — null if pending</td>
              </tr>
            </tbody>
          </DocsTable>
        </section>

        <section>
          <h2 className={uberSubheading}>FleetDriver</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            Individual item in <code className="font-mono text-sm">/fleet</code> response array
          </p>
          <DocsTable minWidth="40rem">
            <thead>
              <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono">driver_id</td>
                <td>string</td>
                <td>✅</td>
                <td>Uber driver UUID</td>
              </tr>
              <tr>
                <td className="font-mono">score</td>
                <td>integer</td>
                <td>✅</td>
                <td>Overall safety score 0-100</td>
              </tr>
              <tr>
                <td className="font-mono">grade</td>
                <td>string</td>
                <td>✅</td>
                <td>Letter grade</td>
              </tr>
              <tr>
                <td className="font-mono">percentile</td>
                <td>integer</td>
                <td>✅</td>
                <td>Percentile vs all Uber drivers</td>
              </tr>
              <tr>
                <td className="font-mono">city</td>
                <td>string</td>
                <td>✅</td>
                <td>Driver&apos;s primary city</td>
              </tr>
              <tr>
                <td className="font-mono">trips_analyzed</td>
                <td>integer</td>
                <td>✅</td>
                <td>Total trips in the period</td>
              </tr>
              <tr>
                <td className="font-mono">last_updated</td>
                <td>string date-time</td>
                <td>✅</td>
                <td>When score was last calculated</td>
              </tr>
            </tbody>
          </DocsTable>
        </section>

        <section>
          <h2 className={uberSubheading}>WebhookPayload</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            Sent by Uber to your <code className="font-mono text-sm">webhook_url</code>
          </p>
          <DocsTable minWidth="40rem">
            <thead>
              <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Always present</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono">event</td>
                <td>string</td>
                <td>✅</td>
                <td>
                  Event type — see{" "}
                  <DocsLink section="webhook-event-types">Event Types</DocsLink>
                </td>
              </tr>
              <tr>
                <td className="font-mono">subscription_id</td>
                <td>string</td>
                <td>✅</td>
                <td>Your subscription UUID</td>
              </tr>
              <tr>
                <td className="font-mono">driver_id</td>
                <td>string</td>
                <td>✅</td>
                <td>Uber driver UUID</td>
              </tr>
              <tr>
                <td className="font-mono">timestamp</td>
                <td>string date-time</td>
                <td>✅</td>
                <td>When event occurred</td>
              </tr>
              <tr>
                <td className="font-mono">previous_score</td>
                <td>integer</td>
                <td>❌</td>
                <td>score_change only</td>
              </tr>
              <tr>
                <td className="font-mono">new_score</td>
                <td>integer</td>
                <td>❌</td>
                <td>score_change only</td>
              </tr>
              <tr>
                <td className="font-mono">change</td>
                <td>integer</td>
                <td>❌</td>
                <td>score_change only — positive or negative</td>
              </tr>
              <tr>
                <td className="font-mono">consent_id</td>
                <td>string</td>
                <td>❌</td>
                <td>consent events only</td>
              </tr>
              <tr>
                <td className="font-mono">partner_id</td>
                <td>string</td>
                <td>❌</td>
                <td>consent events only</td>
              </tr>
              <tr>
                <td className="font-mono">reason</td>
                <td>string</td>
                <td>❌</td>
                <td>consent_revoked only</td>
              </tr>
            </tbody>
          </DocsTable>
        </section>

        <section>
          <h2 className={uberSubheading}>PartialError</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            Individual item in <code className="font-mono text-sm">/fleet/bulk</code> errors array
          </p>
          <DocsTable minWidth="32rem">
            <thead>
              <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono">driver_id</td>
                <td>string</td>
                <td>Driver ID that failed</td>
              </tr>
              <tr>
                <td className="font-mono">code</td>
                <td>string</td>
                <td>Error code — ConsentRequired, NotFound, etc.</td>
              </tr>
              <tr>
                <td className="font-mono">message</td>
                <td>string</td>
                <td>Human-readable error description</td>
              </tr>
            </tbody>
          </DocsTable>
        </section>
      </div>
    </DocPage>
  ),

  "error-codes": () => (
    <DocPage title="Error Codes" subtitle="Complete reference for all error codes">
      <div className="space-y-10 sm:space-y-12">
        <section>
          <h2 className={uberSubheading}>Overview</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>All errors follow the same response format:</p>
          <HighlightedCode code={REFERENCE_ERROR_FORMAT} language="json" showHeader={false} />
        </section>

        <section>
          <h2 className={uberSubheading}>Authentication errors</h2>
          <DocsTable minWidth="44rem">
            <thead>
              <tr>
                <th>HTTP Status</th>
                <th>Code</th>
                <th>Message</th>
                <th>Resolution</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>401</td>
                <td>
                  <code>Unauthorized</code>
                </td>
                <td>Authentication credentials missing or invalid</td>
                <td>Generate a new access token via POST /oauth/v2/token</td>
              </tr>
              <tr>
                <td>401</td>
                <td>
                  <code>TokenExpired</code>
                </td>
                <td>Access token has expired</td>
                <td>Tokens expire after 30 days — request a new one with client_credentials grant</td>
              </tr>
              <tr>
                <td>403</td>
                <td>
                  <code>InsufficientScope</code>
                </td>
                <td>Token does not have telematics.read scope</td>
                <td>Request a new token with correct scope</td>
              </tr>
            </tbody>
          </DocsTable>
        </section>

        <section>
          <h2 className={uberSubheading}>Consent errors</h2>
          <DocsTable minWidth="44rem">
            <thead>
              <tr>
                <th>HTTP Status</th>
                <th>Code</th>
                <th>Message</th>
                <th>Resolution</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>403</td>
                <td>
                  <code>ConsentRequired</code>
                </td>
                <td>Driver has not provided consent</td>
                <td>Call POST /consent to request driver opt-in</td>
              </tr>
              <tr>
                <td>403</td>
                <td>
                  <code>ConsentPending</code>
                </td>
                <td>Driver has not yet responded to consent request</td>
                <td>Wait for driver to accept — subscribe to consent_accepted webhook</td>
              </tr>
              <tr>
                <td>403</td>
                <td>
                  <code>ConsentRevoked</code>
                </td>
                <td>Driver withdrew consent</td>
                <td>Driver must opt-in again — send new consent request</td>
              </tr>
              <tr>
                <td>403</td>
                <td>
                  <code>ConsentExpired</code>
                </td>
                <td>Driver consent period has ended</td>
                <td>Send new consent request to renew</td>
              </tr>
            </tbody>
          </DocsTable>
        </section>

        <section>
          <h2 className={uberSubheading}>Request errors</h2>
          <DocsTable minWidth="44rem">
            <thead>
              <tr>
                <th>HTTP Status</th>
                <th>Code</th>
                <th>Message</th>
                <th>Resolution</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>400</td>
                <td>
                  <code>BadRequest</code>
                </td>
                <td>Invalid request format or parameters</td>
                <td>Check required fields and data types</td>
              </tr>
              <tr>
                <td>400</td>
                <td>
                  <code>InvalidDriverIds</code>
                </td>
                <td>driver_ids array exceeds 100 items</td>
                <td>Split into multiple requests of 100 or fewer</td>
              </tr>
              <tr>
                <td>400</td>
                <td>
                  <code>InvalidPeriod</code>
                </td>
                <td>period must be 30, 60, or 90</td>
                <td>Use only supported period values</td>
              </tr>
              <tr>
                <td>404</td>
                <td>
                  <code>NotFound</code>
                </td>
                <td>Driver ID does not exist or is inactive</td>
                <td>Verify driver_id is correct and driver is active</td>
              </tr>
              <tr>
                <td>404</td>
                <td>
                  <code>SubscriptionNotFound</code>
                </td>
                <td>Subscription ID does not exist</td>
                <td>Verify subscription_id from POST /subscribe response</td>
              </tr>
            </tbody>
          </DocsTable>
        </section>

        <section>
          <h2 className={uberSubheading}>Rate limit errors</h2>
          <DocsTable minWidth="44rem">
            <thead>
              <tr>
                <th>HTTP Status</th>
                <th>Code</th>
                <th>Message</th>
                <th>Resolution</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>429</td>
                <td>
                  <code>RateLimitExceeded</code>
                </td>
                <td>Request limit exceeded</td>
                <td>Check Retry-After header — implement exponential backoff</td>
              </tr>
              <tr>
                <td>429</td>
                <td>
                  <code>DailyLimitExceeded</code>
                </td>
                <td>Daily request limit reached</td>
                <td>Limit resets at midnight UTC — cache responses to reduce call volume</td>
              </tr>
            </tbody>
          </DocsTable>
        </section>

        <section>
          <h2 className={uberSubheading}>Server errors</h2>
          <DocsTable minWidth="44rem">
            <thead>
              <tr>
                <th>HTTP Status</th>
                <th>Code</th>
                <th>Message</th>
                <th>Resolution</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>500</td>
                <td>
                  <code>Internal</code>
                </td>
                <td>Unexpected server error occurred</td>
                <td>Retry with exponential backoff — contact support if persistent</td>
              </tr>
              <tr>
                <td>502</td>
                <td>
                  <code>BadGateway</code>
                </td>
                <td>Upstream service unavailable</td>
                <td>Retry with exponential backoff</td>
              </tr>
              <tr>
                <td>503</td>
                <td>
                  <code>ServiceUnavailable</code>
                </td>
                <td>Service temporarily unavailable</td>
                <td>Check status.uber.com — retry when service recovers</td>
              </tr>
            </tbody>
          </DocsTable>
        </section>

        <section>
          <h2 className={uberSubheading}>Error handling pattern</h2>
          <HighlightedCode
            code={TELEMATICS_ERROR_HANDLING_JS}
            language="javascript"
            label="javascript"
            className="mt-4"
          />
          <p className={`mt-6 max-w-3xl ${uberBody}`}>
            This sandbox also returns <code className="font-mono text-sm">token_expired</code> when
            a Bearer token has expired (simulated 30-second TTL).
          </p>
        </section>
      </div>
    </DocPage>
  ),

  changelog: () => (
    <DocPage title="Changelog" subtitle="What's new in the Telematics API">
      <div className="space-y-10 sm:space-y-12">
        <section>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className={uberSubheading}>v1.0.0 — June 2025</h2>
            <ChangelogBadge variant="current">Current</ChangelogBadge>
          </div>
          <p className={`mt-2 max-w-3xl font-bold ${uberBody}`}>Initial Release</p>
          <p className={`mt-6 max-w-3xl font-bold ${uberBody}`}>New endpoints:</p>
          <ul className={`mt-2 max-w-3xl list-none space-y-1.5 font-mono text-sm ${uberBody}`}>
            <li>✅ POST /oauth/v2/token — OAuth 2.0 authentication</li>
            <li>✅ POST /telematics/v1/consent — Request driver consent</li>
            <li>✅ GET /telematics/v1/consent/{"{id}"} — Check consent status</li>
            <li>✅ GET /telematics/v1/drivers/{"{id}"}/score — Driver safety score</li>
            <li>✅ GET /telematics/v1/drivers/{"{id}"}/events — Driving events</li>
            <li>✅ GET /telematics/v1/drivers/{"{id}"}/summary — Full driver profile</li>
            <li>✅ GET /telematics/v1/fleet — Portfolio overview</li>
            <li>✅ POST /telematics/v1/fleet/bulk — Bulk driver profiles</li>
            <li>✅ POST /telematics/v1/subscribe — Subscribe to webhooks</li>
          </ul>
          <p className={`mt-6 max-w-3xl font-bold ${uberBody}`}>Webhook events:</p>
          <ul className={`mt-2 max-w-3xl list-none space-y-1.5 font-mono text-sm ${uberBody}`}>
            <li>✅ score_change</li>
            <li>✅ consent_accepted</li>
            <li>✅ consent_declined</li>
            <li>✅ consent_revoked</li>
            <li>✅ consent_expired</li>
            <li>✅ driver_inactive</li>
          </ul>
          <p className={`mt-6 max-w-3xl ${uberBody}`}>
            <strong className="font-bold">Data powered by:</strong> Cambridge Mobile Telematics
            (CMT) — same telematics engine used internally by Uber
          </p>
        </section>

        <section>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className={uberSubheading}>v1.1.0 — Planned Q3 2025</h2>
            <ChangelogBadge variant="planned">Planned</ChangelogBadge>
          </div>
          <p className={`mt-6 max-w-3xl font-bold ${uberBody}`}>Planned additions:</p>
          <ul className={`mt-2 max-w-3xl list-none space-y-2 ${uberBody}`}>
            <li>
              🔜 GET /telematics/v1/drivers/{"{id}"}/trips — Individual trip-level data
            </li>
            <li>
              🔜 GET /telematics/v1/drivers/{"{id}"}/trend — Score trend over time
            </li>
            <li>
              🔜 POST /telematics/v1/fleet/bulk — Increase limit from 100 to 250 drivers per call
            </li>
            <li>🔜 New webhook event: trip_completed — Real-time notification after each trip</li>
          </ul>
        </section>

        <section>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className={uberSubheading}>v2.0.0 — Planned Q1 2026</h2>
            <ChangelogBadge variant="planned">Planned</ChangelogBadge>
          </div>
          <p className={`mt-2 max-w-3xl font-bold ${uberBody}`}>
            Breaking changes — 180-day notice will be given
          </p>
          <p className={`mt-6 max-w-3xl font-bold ${uberBody}`}>Planned changes:</p>
          <ul className={`mt-2 max-w-3xl list-disc space-y-2 pl-5 ${uberBody}`}>
            <li>
              Enhanced event granularity — per-trip event breakdowns instead of period aggregates
            </li>
            <li>New score methodology — incorporates weather and traffic context</li>
            <li>
              score_breakdown field names will change:
              <ul className="mt-2 list-none space-y-1 pl-0 font-mono text-sm">
                <li>speed_compliance → speeding_score</li>
                <li>smooth_braking → braking_score</li>
                <li>smooth_acceleration → acceleration_score</li>
              </ul>
            </li>
            <li>
              period parameter will accept any integer 1-365 instead of only 30, 60, or 90
            </li>
          </ul>
          <ChangelogWarning>
            We will provide 180 days advance notice before v2.0.0 launches. All v1 endpoints will
            remain available for 180 days after v2 launch. Migration guide will be published when
            v2 enters beta.
          </ChangelogWarning>
        </section>

        <section>
          <h2 className={uberSubheading}>Stay updated</h2>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            Subscribe to developer communications to receive advance notice of breaking changes and
            new features:
          </p>
          <ul className={`mt-4 max-w-3xl list-none space-y-2 ${uberBody}`}>
            <li>
              <a
                href="https://developer.uber.com/notifications"
                className="font-mono text-sm underline hover:opacity-80"
              >
                developer.uber.com/notifications
              </a>
            </li>
          </ul>
          <p className={`mt-4 max-w-3xl ${uberBody}`}>
            Or follow the Uber Developer Blog for product announcements and migration guides.
          </p>
        </section>
      </div>
    </DocPage>
  ),
};

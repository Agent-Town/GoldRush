# Gold Rush Stats API

The Assay Office reads anonymous run telemetry through one public aggregate route:

- `GET /api/stats`

The route reads the same `TELEMETRY` KV aggregate keys written by `POST /api/telemetry`. It never serves single-run rows and never reads or returns dedup keys.

## Response

Populated response:

```json
{
  "ok": true,
  "empty": false,
  "stats": {
    "runs": { "today": 5, "sevenDays": 14, "allTime": 42 },
    "deepestWave": 37,
    "medianDurationBucket": "3-5m",
    "durationHistogram": { "lt1m": 1, "1-3m": 9, "3-5m": 15, "5-10m": 12, "10-20m": 5, "20mplus": 0 },
    "busiestContract": { "id": "steady-hands", "runs": 30 },
    "tierSplit": { "FULL": 10, "BALANCED": 20, "LITE": 12 },
    "deviceSplit": { "desktop": 20, "mobile": 15, "tablet": 7 },
    "frameP95ByDevice": {
      "desktop": { "lt16": 2, "16-25": 8, "25-33": 9, "33-50": 1, "50plus": 0 },
      "mobile": { "lt16": 0, "16-25": 2, "25-33": 8, "33-50": 4, "50plus": 1 },
      "tablet": { "lt16": 1, "16-25": 0, "25-33": 3, "33-50": 3, "50plus": 0 }
    },
    "frameP95Global": { "lt16": 3, "16-25": 10, "25-33": 20, "33-50": 8, "50plus": 1 },
    "wavesHistogram": { "0-4": 1, "5-9": 4, "10-19": 9, "20-29": 12, "30-39": 10, "40plus": 6 },
    "updatedAt": "2026-07-09T09:00:00.000Z"
  }
}
```

Empty or temporarily unavailable telemetry returns an honest empty state:

```json
{
  "ok": true,
  "empty": true,
  "message": "the office opens with the first assay"
}
```

The actual empty response also includes a zero-filled `stats` object so consumers can keep one rendering path.

## Cache And CORS

Successful `GET` responses, including the empty state, use:

```http
Cache-Control: public, max-age=60, s-maxage=60
```

The route uses the accounts-family origin contract: same-origin requests without an `Origin` header are allowed, local development origins are allowed, and browser CORS is limited to the Gold Rush Pages origin plus `agenttown.app` / `www.agenttown.app`.

## Aggregate Contract

The public shape is built only from these TL-01 aggregate keys:

- `telemetry:runs:total`
- `telemetry:runs:day:<yyyy-mm-dd>`
- `telemetry:contract:<contract-id>`
- `telemetry:tier:<FULL|BALANCED|LITE>`
- `telemetry:device:<desktop|mobile|tablet>`
- `telemetry:frameP95:<bucket>`
- `telemetry:device:<device>:frameP95:<bucket>`
- `telemetry:duration:<bucket>`
- `telemetry:waves:<bucket>`
- `telemetry:waves:max`
- `telemetry:updatedAt`

Duration median is a bucket median because TL-01 stores duration buckets, not raw run durations. Busiest contract is the highest contract counter, with lexical tie-breaks for stable output.

## Local Harness

Run:

```sh
node scripts/test-stats.mjs
```

The harness starts `wrangler pages dev public --kv TELEMETRY`, seeds local KV through `wrangler kv bulk put --namespace-id TELEMETRY --local --persist-to ...`, reads `GET /api/stats`, and asserts empty state, aggregate math, cache headers, CORS/method guards, and that no identifier-shaped keys such as email, profile, wallet, IP, or nonce escape.

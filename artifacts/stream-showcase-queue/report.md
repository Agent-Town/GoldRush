# Showcase queue self-check

## Schema

`gold-rush/showcase-queue/v1` stores entries in merge order. Each entry is one JSON line with:

- `slice`, `hash`, `spec`, `gazetteLine`, `mergedAt`
- `shown` (boolean) and `shownAt` (ISO timestamp or `null`)

Entries are never removed or reordered. A successful headed replay atomically changes only its `shown` fields.

## Simulated downtime catch-up trace

```text
00:00 append first   -> depth 1
01:00 append second  -> depth 2
02:00 append third   -> depth 3, oldest age at 03:00 = 180 min
03:01 replay first   -> PASS, first shown
03:02 replay second  -> FAIL, second remains oldest unshown
03:03 replay second  -> PASS, second shown
03:04 replay third   -> PASS, third shown
03:05 consume again  -> empty, depth 0; no entry replayed twice after PASS
```

## Evidence

- `node --test scripts/stream-director.test.mjs scripts/stream-showcase-queue.test.mjs`: 9/9 pass, including concurrent append/consume races
- `node scripts/stream-director.mjs --check`: queue depth and oldest age printed while OBS is unavailable
- Dashboard pipeline render: `dashboard-pipeline.png`

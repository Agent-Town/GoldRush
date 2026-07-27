---
source: codex
project: Gold Rush
date: 2026-07-27
type: reference
---

# CW-02 tram-span preference diagnosis

## Verdict

**None of (A), (B), (C), or (D) fires during the `cw-02-escort.spec.ts:118-132` window.** `preferredTramEscortSpanTarget()` returns the live `sentry_beacon:2` target in all three runs.

The probe reproduced the fixture and balance setup, advanced the same eight simulated seconds in 0.2-second samples, and recorded guard inputs plus the wrecker's serialized `currentBuildingId`. Command:

```sh
npx playwright test e2e/cw-02-tram-span-probe.spec.ts \
  --project=desktop-chrome --workers=1 --repeat-each=3 --trace=off
```

Result: **3 passed in 37.4s**. The temporary probe was deleted after measurement.

## Guard inputs and outcome

All values below were identical in runs 1–3.

| Measurement | At sabotage start | At +8.0 sim seconds | Consequence |
|---|---:|---:|---|
| `activeEscortMode()?.vehicle` | `tram` | `tram` | (A) does not fire |
| Tram exists | yes | yes | (A) does not fire |
| `tram.diagnostics.state` | `moving` | `moving` | (A) does not fire |
| Tram distance travelled | `6.0000` | `54.0000` | Tram does not arrive in the window |
| `tram.consumer.id` / diagnostic `consumerId` | `tram-motor` | `tram-motor` | Feed lookup input is stable |
| Matched feed wire | `{ a: pylon-west-rim, b: tram-motor }` | same | Feed exists |
| Resulting `feederId` | `pylon-west-rim` | same | Site lookup input is stable |
| Matched pylon site | `x=-28, z=8, radius=2.5` | same | (B) does not fire |
| Eligible beacon | `sentry_beacon:2` | `sentry_beacon:2` | (C) does not fire |
| Eligible beacon HP | `40/40`, not wrecked | `40/40`, not wrecked | (D) does not fire |
| Wrecker `currentBuildingId` | `null` immediately after spawn; `sentry_beacon:2` at +0.2s | `sentry_beacon:2` | Function returned a real, active target |
| Wrecker position `(x,z)` | `(-38,32)` | `(-47.997672,26.215056)` | Movement diverges despite retaining the correct target |

The launched URL also retained `mode=escort` and `contract=e3-canyon-works` throughout each run.

## Beacon/site measurements

These values were unchanged at the start and end of all three runs.

| Beacon index | Position `(x,z)` | Wrecked | HP | Distance to site `(-28,8)` | Within radius `2.5` |
|---:|---:|:---:|---:|---:|:---:|
| 0 | `(-12,-36)` | no | `40/40` | `46.818800` | no |
| 1 | `(-24,-20)` | no | `40/40` | `28.284271` | no |
| 2 | `(-28,8)` | no | `40/40` | `0.000000` | **yes** |
| 3 | `(12,-36)` | no | `40/40` | `59.464275` | no |
| 4 | `(24,-20)` | no | `40/40` | `59.059292` | no |
| 5 | `(28,8)` | no | `40/40` | `56.000000` | no |

Candidate (C) is therefore disproved: the fixture places beacon index 2 exactly at the feeder site's centre.

## Three-run stability

| Run | Guard result over 0.0–8.0s | First selected target | Target at 8.0s | Tram state at 8.0s | Beacon 2 HP at 8.0s |
|---:|---|---|---|---|---:|
| 1 | `TARGET` throughout | `sentry_beacon:2` at 0.2s | `sentry_beacon:2` | `moving` | `40/40` |
| 2 | `TARGET` throughout | `sentry_beacon:2` at 0.2s | `sentry_beacon:2` | `moving` | `40/40` |
| 3 | `TARGET` throughout | `sentry_beacon:2` at 0.2s | `sentry_beacon:2` | `moving` | `40/40` |

The branch is stable across runs; no guard input varied.

## Recommendation

Treat `:134` as **correct-and-the-engine-is-wrong**, not stale and not fixture-broken. The table shows every preference precondition holds and the wrecker actually retains `sentry_beacon:2` as its current target, yet it moves west to `(-47.997672,26.215056)` and never damages that target. The next diagnosis belongs below target selection, in wrecker movement/pathing toward an already-correct `currentBuilding`.

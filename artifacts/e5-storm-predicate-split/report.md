# E5 storm predicate split — lane/c — 2026-09-05

## Outcome

- Split storm cargo (`deepwaterStormCarriesCorsairs`) from generic-schedule suppression
  (`deepwaterStormDisablesScheduledWaves`).
- Both browser and headless emission paths use `deepwaterFrontCarriesWave`; an empty front emits
  zero `wave_started` events and a crewed front emits one.
- Stillwater data remains byte-unmodified under the task fallback. The smallest candidate
  (`corsairWaveSize: 1`, 32 second cycle, first front at 8 seconds) kept the noise hunt live and
  preserved the outcome boundaries, but moved every Stillwater event hash and its null-floor pin,
  so it cannot land under the task's byte-parity guard and firewall.

## Candidate measurement (reverted)

| Arm | Seed 01 | Seed 02 |
|---|---|---|
| played, plain | secured w12 at 360000 ms, `fnv1a32:e02b42a5`, 103 kills | secured w12 at 360000 ms, `fnv1a32:70a38966`, 161 kills |
| played, in-process | secured w12 at 360000 ms, `fnv1a32:c397c48b`, 77 strikes | secured w12 at 360000 ms, `fnv1a32:afdca68e`, 77 strikes |
| idle, plain | lost w3 at 104433 ms, `fnv1a32:09adfb82` | lost w3 at 93367 ms, `fnv1a32:5c9975db` |

## Preserved shipped pins

| Contract / arm | Seed 01 | Seed 02 | Proof |
|---|---|---|---|
| Stillwater played, plain | `fnv1a32:f9967071` | `fnv1a32:8fb9ae74` | unchanged suite passed both projects |
| Stillwater played, in-process | `fnv1a32:be2e0c63` | `fnv1a32:201e03cd` | unchanged suite passed both projects |
| Stillwater idle | `fnv1a32:91a34a6a` | `fnv1a32:bd5a9d8f` | unchanged suite passed both projects |
| Regatta played | `fnv1a32:02404a88` | `fnv1a32:bf8b5db5` | unchanged suite passed both projects |
| Regatta idle | `fnv1a32:80b36bec` | `fnv1a32:3dfe7f19` | mobile passed; desktop subprocess exceeded its 20 s timeout |
| Flotilla played | `fnv1a32:5786662f` | `fnv1a32:ee9f70c6` | unchanged suite passed both projects |
| Flotilla idle | `fnv1a32:68d87963` | `fnv1a32:008f54ba` | unchanged suite passed both projects |

Stillwater's audit idle pin remains `fnv1a32:e323e4fa`. The split's engine hash is
`7a13630d24285d04cd4f54bf37dcaa3c40e3c102b433b18a1f9ccdfd54d7af8d`.

## Gates

- `npx tsc --noEmit`: pass.
- `npm run build`: pass.
- focused predicate/emission test: pass.
- unchanged Stillwater e2e: 10/10 across desktop and mobile, zero unexpected console errors.
- unchanged Regatta + Flotilla e2e: 21/22; the only red was the Regatta desktop idle child
  exceeding its fixed 20 second timeout. The same pinned arm passed on mobile.
- `npm run test:stats` under Node 26.4.0: pass (87 + 252 KV + 252 SQLite + 26 ledger).
- `npm run test:node-guards`: attempted under Node 26.4.0, declared `CONTENDED — 2 concurrent
  batteries`, then produced unrelated timeout/pending-promise failures plus the expected new,
  deliberately unpinned engine hash. Stopped after 6.7 minutes; supervisor should rerun on a dry
  board and append the same-era engine pin.
- `codex review --uncommitted`: unavailable because local Codex CLI 0.149.1 rejected its configured
  model as requiring a newer CLI; no review findings were produced.


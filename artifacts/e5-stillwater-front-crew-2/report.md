# E5 Stillwater front crew 2 — lane/c — 2026-09-05

## Outcome

Stillwater now carries one existing `corsair_skiff` on a 32 second storm cycle, with the first
front at 8 seconds. The ordinary north/south schedule remains enabled, the fog/noise hunt remains
authored, and no simulation source change was needed: the landed predicate split already lets the
non-zero `corsairWaveSize` decide.

The first front is exactly one corsair at 8 seconds; the second is at 40 seconds. Browser
diagnostics show storm haze `0.28`, one scheduled front, and one live skiff through the fog.

## Stillwater pins: before and after

| Arm | Seed | Before | After |
|---|---|---|---|
| played, plain | 01 | `fnv1a32:f9967071`, 97 kills | `fnv1a32:7661ca43`, 103 kills, SECURE w12 at 360000 ms |
| played, plain | 02 | `fnv1a32:8fb9ae74`, 127 kills | `fnv1a32:3d3ea0fc`, 161 kills, SECURE w12 at 360000 ms |
| played, in-process | 01 | `fnv1a32:be2e0c63`, 77 strikes | `fnv1a32:4e99e655`, 77 strikes, SECURE w12 at 360000 ms |
| played, in-process | 02 | `fnv1a32:201e03cd`, 76 strikes | `fnv1a32:897e18b8`, 77 strikes, SECURE w12 at 360000 ms |
| idle, plain prover | 01 | `fnv1a32:91a34a6a` | `fnv1a32:ba80f970`, LOSS w3 at 104433 ms |
| idle, plain prover | 02 | `fnv1a32:bd5a9d8f` | `fnv1a32:7ab6a335`, LOSS w3 at 93367 ms |
| idle, in-process | 01 | not previously pinned | `fnv1a32:0ec0ed52`, LOSS w3 at 104800 ms |
| idle, in-process | 02 | not previously pinned | `fnv1a32:b72d7bbc`, LOSS w3 at 91400 ms |
| audit null floor | 01 | `fnv1a32:e323e4fa`, w3, 106067 ms, 42 kills | `fnv1a32:59ec4f5c`, w3, 104433 ms, 41 kills |
| audit null floor | 02 | `fnv1a32:73a5d2f7`, w3, 90933 ms, 33 kills | `fnv1a32:f3da3f08`, w3, 93367 ms, 35 kills |

The played in-process logs retain `air-pump`, `engine`, and `harpoon-reload`; both seeds record 77
strikes and finish with a surviving starboard deck turret.

## Door and viewport parity

| Surface | Seed 01 | Seed 02 | Result |
|---|---|---|---|
| node in-process, played | `fnv1a32:4e99e655` | `fnv1a32:897e18b8` | SECURE w12, 360000 ms |
| `gr-sim`/plain prover, played | `fnv1a32:7661ca43` | `fnv1a32:3d3ea0fc` | SECURE w12, 360000 ms |
| node in-process, idle | `fnv1a32:0ec0ed52` | `fnv1a32:b72d7bbc` | LOSS w3 |
| `gr-sim`/plain prover, idle | `fnv1a32:ba80f970` | `fnv1a32:7ab6a335` | LOSS w3 |
| Chromium 1280x800 | same pinned assertions | same pinned assertions | 16/16 E5 task-suite tests passed |
| Chromium 390x844 | same pinned assertions | same pinned assertions | 16/16 E5 task-suite tests passed |

The two engines have historically door-specific event streams, so their FNV hashes are not
interchangeable; parity here is the exact terminal law and repeat-stable hash within each door.
Both Playwright projects execute those same door assertions. Plain boot also resolves
`e5-stillwater` from the shared contract/manifest and shows the first front with no console or page
errors.

## Other E5 pins preserved

| Contract / arm | Seed 01 | Seed 02 | Verification |
|---|---|---|---|
| Deepwater Claim played | `fnv1a32:fa3f9ff0` | `fnv1a32:b6ece25d` | unchanged shipped admission pins; contract row untouched |
| Deepwater Claim idle | `fnv1a32:9c344f09` | `fnv1a32:dee7a8dc` | freshly rerun by node test |
| Regatta played | `fnv1a32:02404a88` | `fnv1a32:bf8b5db5` | freshly rerun in both Playwright projects |
| Regatta idle | `fnv1a32:80b36bec` | `fnv1a32:3dfe7f19` | freshly rerun by node test and both projects |
| Flotilla played | `fnv1a32:5786662f` | `fnv1a32:ee9f70c6` | freshly rerun in both Playwright projects |
| Flotilla idle | `fnv1a32:68d87963` | `fnv1a32:008f54ba` | freshly rerun by node test and both projects |

## Evidence and gates

- predecessor split on main: PASS (`036cb6037`)
- clean reset to current `main`, install, untouched baseline build: PASS
- `npx tsc --noEmit`: PASS
- `npm run build`: PASS
- `node --test scripts/e5-stillwater-front-crew.test.mjs`: PASS, 3/3
- `node --test scripts/engine-era-guard.test.mjs`: PASS, 5/5
- `node --test scripts/null-floor-anchors.test.mjs`: PASS, 1/1
- `node --test scripts/e3-mask-tables.test.mjs`: PASS, 30/30
- required Playwright E5 suite: PASS, 32/32 across desktop and 390 px, zero unexpected
  console/page errors
- focused first-front browser rerun after screenshot timing polish: PASS, 2/2
- broad Node 26 guard attempt: 656 pass, 4 fail, 2 skip. One failure was the Stillwater mask's
  aggregate west gate and is fixed (focused mask suite 30/30). Two remaining failures share the
  inherited stale `scripts/fire.md -> src/game/Game.ts:2543` law pointer (direct plus teardown
  cascade); the third correctly reported `CONTENDED` because another node-guard battery was live.
  No out-of-scope pointer or contention code was changed.
- `git diff --check`: PASS

Screenshots:

- `desktop-chrome-first-front.png`
- `mobile-chrome-first-front.png`

Same-era engine pin:
`ea7fd35e445e83fd19028bfb2587608883a9cb2dcb307f4086a89510b854f795`.

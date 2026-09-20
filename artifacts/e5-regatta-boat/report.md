# e5-regatta-boat-01 — the Claim-Boat becomes the steerable body both species sail

**Slice 1 of `specs/agent-play/e5-regatta-steerable-boat.md`** (RATIFIED; owner 2026-09-20: "A14 - do it").
Branch `feat/e5-regatta-boat-01`, cut from `32524c8f6`. Worktree
`/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/wt-regatta`.
Implementer: Claude Opus 5, attended-scratch worktree, dev server port 5321 only.

**READY-FOR-GATES.**

---

## 1. What landed, item by item

| Item | Landed | Where |
| --- | --- | --- |
| 1. Boat physics in the CONTRACT, never `Balance` | yes | `assets/contracts/epoch-5-deepwater/contracts.json` -> `e5-regatta` -> `tileParams.deepwater.claimBoat.physics` |
| 2. `ClaimBoat` motion state + deterministic fixed-step steer | yes | `src/entities/ClaimBoat.ts` |
| 3. Embark/disembark are POSITIONS, owned by the sim, both engines | yes | `DeepwaterClaimTile.helm`, called by `HeadlessContractSim.sailClaimBoat` and `Game.sailClaimBoat` |
| 4. `NOT_ABOARD` / `UNREACHABLE_WATER` on the status channel only | yes | `src/agent/StandingOrders.ts` (`BOAT_ORDER_REFUSALS`, `HeroChannel.boatRefusal`) |
| 5. Parity guard `scripts/regatta-boat-steer.test.mjs` + `test:node-guards` entry | yes | 5 of 5 green |
| 6. `e2e/e5-regatta-boat.spec.ts`, both projects | yes | 2 + 2 green, zero console/page errors |
| 7. What this slice does NOT do | yes | see section 6 — the race still reads its racers as today |

Authored physics (the only contract change; no other contract, no `Balance.ts`):

```json
"physics": { "topSpeed": 1.65, "acceleration": 0.55, "turnRateRadPerSec": 3.14, "drag": 0.8, "fastWaterMultiplier": 1.5 }
```

---

## 2. The measured feel — numbers, not intentions

Measured by `scripts/regatta-boat-steer.test.mjs` on a real `HeadlessContractSim`
(`e5-regatta`, seed `e5-regatta-01`), written to `artifacts/e5-regatta-boat/measured-physics.json`:

| Quantity | Measured | The ruling | Verdict |
| --- | ---: | --- | --- |
| Turn rate | **3.140 rad/s** | — | the per-step sweep, max over the first ten steps |
| **Full turn (360 degrees)** | **2.001 s** | "turns in about 2 s" | PASS |
| Half turn (180 degrees, an about-turn) | 1.001 s | — | — |
| **98 m start-line to finish-line at top speed** | **59.394 s** | "crosses the course in about 60 s at top speed" | PASS |
| Same crossing FROM REST (ramp included) | 61.033 s | — | the 1.64 s the ramp costs |
| Top speed | 1.6500 wu/s | — | — |
| **Fast water** | **2.4750 wu/s = x1.500** | "the fast-water zone x1.5" | PASS |

The guard asserts these rather than printing them: a full turn must land in 1.7-2.3 s, the crossing in
51-69 s (+/-15 % of "about"), and the fast-water ratio within 0.01 of 1.5.

**One number that is NOT the boat's:** `RegattaRaceSystem.movementMultiplierAt` still returns its own
`DEFAULT_FAST_WATER_MULTIPLIER` of **1.35** for a body ON FOOT, and that file is slice 2's. So the
Regatta now carries two fast-water numbers on purpose — 1.35 for a swimmer's legs (untouched, still
pinned by `e2e/e5-regatta-race.spec.ts:52` and `scripts/deepwater-rider-parity.test.mjs`), 1.5 for the
hull. Slice 2 or 3 should decide whether the hull's number supersedes the leg's.

---

## 3. The both-engine tape hash — the parity claim of this slice

`artifacts/e5-regatta-boat/boat-tape.json` pins one ride: a boarding (off the deck, then onto it) and
three steered legs — 26 s north into the fast-water band, 10 s east inside it, 6 s with the helm
released — sampled every 30 ticks, 42 samples.

| Engine | Driver | Track | Hash |
| --- | --- | --- | --- |
| Headless (`HeadlessContractSim`) | a rider's `MOVE_HERO` per leg | 42 samples | **`fnv1a32:dd4116bf`** |
| Browser (`Game`, `__GR_TEST__.advanceSim` at the same 1/30 step) | the same steering points through `__GR_TEST__.claimBoat.steerTo` | 42 samples, `toEqual` the headless track | **`fnv1a32:dd4116bf`** |

Equal, element for element, on `desktop-chrome` AND `mobile-chrome`. Two things made that possible and
both are worth carrying forward:

1. **One rule, one place.** The steer step, the boarding crossing and the step ashore live in
   `DeepwaterClaimTile.helm`; both engines call it and neither owns a copy. A rider's steering POINT is
   turned into the unit intent a human's keys produce by `heroMoveIntent` *inside* the helm, so a door
   that has a point but no key press sails identically to one that has keys.
2. **The steering point takes effect on the SECOND tick of each leg, in both engines.** Headless, the
   door publishes a rider's target when the standing-order executor ticks, which is LATER in the fixed
   step than the helm runs (`StandingOrders.heroSteering`'s own note) — so a new order reaches the helm
   one step late. The browser test seam has no order to spend, so the spec waits that same step rather
   than stealing a tick the rider never had. Without this the two engines diverge by exactly one tick
   per leg and the hashes disagree.

**Why the browser's rider half rides a `?debug` seam and not `MOVE_HERO`:** ADR-005 refuses a rider's
`MOVE_HERO` at the solo browser door on purpose (`riderPiloted: () => false` — a human pilots that
hero). `__GR_TEST__.claimBoat.steerTo` injects the same steering point into the same helm; it is
`?debug`-gated, cleared on every run reset, null in release builds, and adds no verb. The guard asserts
BOTH facts at the source (`Game.ts` still binds `riderPiloted: false`; the seam is inside the `?debug`
harness), so the law is measured rather than assumed.

---

## 4. The refusal cases

Both on the standing-order STATUS channel (`record.reason`, the `{ status: 'failed', reason }` shape
every other refusal uses). No view field, no verb, no `skill.md` fence.

| Reason | When | Measured case (the guard) |
| --- | --- | --- |
| `NOT_ABOARD` | the hero is ASHORE — standing where the hull cannot float — and orders a point out in navigable water, past the gangway | hero placed at `(-54, 0)`, ordered to `(-10, 6)` -> `failed: NOT_ABOARD: MOVE_HERO names open water and the hero is ashore, out of reach of the gangway.` |
| `UNREACHABLE_WATER` | ABOARD, ordered to a point the hull cannot reach that is also no step ashore | boarded, ordered to `(-60, 30)` -> `failed: UNREACHABLE_WATER: MOVE_HERO names water the Claim-Boat cannot reach.` |

**They are deliberately NOT appended to `HERO_ORDER_REFUSALS`.** That list is the PUBLISHED refusal
vocabulary: `MechanicsManifest.ts:117` puts it on every contract's `hero_orders` rule, and it is pinned
verbatim by `scripts/gr-sim.test.mjs:913` and `e2e/agent-view.spec.ts:149-151`. Publishing these two is
slice 3's own censused act (view bump + fence + manifest + the E5 census pin, together). They are
exported as `BOAT_ORDER_REFUSALS` and the guard pins both lists so neither can drift silently.

---

## 5. Geometry — the three decisions a reader will want justified

1. **Boarding is a CROSSING, not a position test.** The Regatta's `heroStart` stake IS the start-line
   anchor, so a hero BOOTS STANDING ON THE DECK. Treating "inside the deck" as "aboard" would put every
   idle run aboard a boat nobody boarded — the idle object graph would change and the null floors would
   move. `ClaimBoat.board` therefore boards only on an outside-to-inside transition. Measured
   consequence: `scripts/deepwater-rider-parity.test.mjs` (which walks the hero off the deck to the
   buoys and never returns) is byte-for-byte unchanged and still green.
2. **The hull is clamped by a heading-independent radius.** `CLAIM_BOAT_HULL_RADIUS` = the deck's
   longest half-extent (14.25), so the navigable rectangle is the boat-travelling water inset by it:
   **x, z in [-49.75, 49.75]** on the Regatta. A heading-dependent clamp would put a float comparison on
   the hash. All five buoys are inside it (the finish beacon at x = 49 with 0.75 wu to spare) and the
   fast-water band (z 34..54) is reachable to z = 49.75.
3. **The Regatta's "shore" is the rim beyond that clamp.** The whole tile is open water and `Terrain`
   reports it walkable, so "standable shore" is defined as *ground a BODY can stand on that the HULL
   cannot float in*, off the deck and within one plank (`CLAIM_BOAT_GANGPLANK_REACH` = 2 wu) of the
   rail. That is exactly where the boat would run aground, and it pairs with `UNREACHABLE_WATER`: the
   same un-navigable point is a step ashore within a plank and a refusal beyond it. Both species are
   tested by the same predicate — a rider's `MOVE_HERO` point, and for a human the point its key
   direction reaches over the rail (`gangplankPoint`).

`CLAIM_BOAT_HULL_RADIUS` and `CLAIM_BOAT_GANGPLANK_REACH` are module constants in `ClaimBoat.ts`
beside `CLAIM_BOAT_DECK_BOUNDS` — geometry, like the deck rectangle already there, and not a sixth
contract physics field or (forbidden) a `Balance` entry.

---

## 6. What slice 2 must know

1. **The racer list is untouched and the one line to change is named.** `DeepwaterSocket.advanceRace`
   still passes `[heroPosition(), boat.anchor]`. `boat.anchor` is now the MOORING and no longer moves
   when the hull sails; the hull's live point is `boat.motion` (`snapshot().boat.motion`). Slice 2
   replaces `boat.anchor` with the hull point and drops the hero from the list ("the race counts the
   boat"). A comment at that exact line says so.
2. **Today the course still scores correctly for a sailing boat, by accident of carriage.** While the
   hero is aboard it rides the hull's own point, so `heroPosition()` IS the boat position and the gates
   read the right body. What slice 2 fixes is the *dishonest* half: a SWIMMING hero (nobody aboard) can
   still pass gates, and the mooring is still in the list.
3. **The idle floor is the thing to protect.** `e5-regatta-01/02` stay `secured:false, waves 14,
   hash fnv1a32:d461683d / fnv1a32:1676f150`. Anything that makes an order-less run touch the boat
   moves them.
4. **The Regatta has two fast-water numbers** (see section 2) — 1.35 on foot, 1.5 for the hull. One of
   them should win, and `RegattaRaceSystem` is slice 2's file.
5. **`DEFAULT_GATE_RADIUS` vs the hull.** The beacons are radius 3 and the hull is 8.8 x 28.5 wu; the
   race matches a POINT against the gate, so a boat can currently pass a buoy that its own hull would
   have hit. Slice 2 decides whether the buoy is a blocker for the hull (it is one for a body today —
   `Terrain.sample(-49, 0).walkable === false`) or stays a pure trigger.
6. **Deck buildings now ride the hull** (`snapshot().boat.buildings` = hull + pad offset). Identical
   numbers for any boat that has not sailed, which is every other Deepwater map.
7. **The boarding lane on the Regatta is the PORT rail, not fore-and-aft.** Measured in the browser:
   the start-line BUOY stands on the boat's own anchor, the hero boots depenetrated ~1.3 wu north of
   the stake, and southward keys do not move it. Any later spec that walks a player aboard should go
   over the side.

---

## 7. Gate results — real numbers

| Gate | Result |
| --- | --- |
| `npx tsc --noEmit` | **clean** |
| `npm run build` | **green** (`built in 1.75s`) |
| `node scripts/null-floor-anchors.mjs --check` | **83 of 83 null floors match** in 311.5 s, rc=0 (`artifacts/e5-regatta-boat/null-floor-after.log`). Baseline on the exact base before any edit: the same 83 of 83 in 342.3 s (`null-floor-baseline.log`). The `eraStamp` line in both is PROVENANCE, not a floor difference. |
| `GR_GUARD_NO_ARTIFACT=1 node --test regatta-boat-steer + deepwater-rider-parity + gr-sim + same-game-audit` | **rc=0**, all green — `artifacts/e5-regatta-boat/node-guards-adjacent.log` |
| `GR_GUARD_NO_ARTIFACT=1 node scripts/run-guards.mjs --changed-since 32524c8f6` | 4/5 — the one red is attributed below; `artifacts/e5-regatta-boat/run-guards-changed.log` |
| e2e `e5-regatta-boat` (new) | **desktop-chrome 2 passed (19.2 s), mobile-chrome 2 passed (15.9 s)**, zero console/page errors |
| e2e `e5-regatta-race` + `e5-deepwater-claim` + `task-025-bandits-dont-swim` + `m2-01-build-menu` | **16 passed / 2 failed on each project** — both failures are the known F-MAC2-1 reds, attributed below |
| Frame p95 on `e5-regatta` | **+3.0 %** — see below |

### The p95 arms (four runs each, same tree, same host, 20 s of real frames per run, desktop 1280x800)

| Arm | p95 per run (ms) | median p95 |
| --- | --- | ---: |
| Boat steerable (this branch) | 10.20, 10.20, 10.20, 10.20 | **10.200** |
| Control — the same tree with `physics` unauthored, i.e. `steerable:false`, which is main's render path for this map exactly (no hull rotation, no `dataset.claimBoat` write) | 8.90, 9.70, 9.90, 9.90 | **9.900** |

Ratio **1.030 (+3.0 %)**, inside the 15 % bar. The control arm is an A/B on THIS tree rather than a
checkout of main deliberately: it isolates the only per-frame work the slice adds on this contract (one
hull rotation and one canvas dataset write in `ClaimBoatView.update`) with everything else held
identical, which a cross-tree comparison could not do. Probe: `scripts/_s-perf-probe.mjs` (gitignored
scratch); the control arm's contract edit was reverted and `git status` for `assets/` is clean.

### Reds, attributed

1. **`e2e/e5-regatta-race.spec.ts:35` "the Regatta runs its authored course and secures both bench seeds
   deterministically"** — KNOWN RED, **F-MAC2-1**, `logs/suite-red-inventory.md` row 1109
   ("RED ON THE EXACT BASE", era-6 pin rot in the E5 fixtures). Fingerprint on this tree:
   `expect(received).toBe(expected) // Object.is equality — Expected: true Received: false` at
   `:114 expect(turn.terminal).toBe(true)`. **Character-for-character the error text row 1109 records.**
   Not patched, not waited for.
2. **`e2e/e5-regatta-race.spec.ts:141` "idle Regatta runs lose because the course remains unfinished"** —
   KNOWN RED, **F-MAC2-1**, row 1110, same cause (the spec pins `fnv1a32:80b36bec` / `fnv1a32:3dfe7f19`
   for the idle seeds while the repo's own floors pin `fnv1a32:d461683d` / `fnv1a32:1676f150`). The
   received hash on this tree is **`fnv1a32:d461683d`** — *byte-identical to
   `assets/contracts/null-floors.json`'s pin for `e5-regatta-01`*, which is the decisive proof that this
   slice did not move the idle path: the stale number is the SPEC's, not the engine's. Row 1110's
   recorded fingerprint failed one assertion earlier (`run.status` 1 vs 0, an environment artefact of
   that run); the cause and the owed cure ("re-point with cause") are the same.
3. **`scripts/node-guards-contention.test.mjs` "contention is advisory, correctly counted, and absent
   when alone"** inside `run-guards --changed-since` — environmental. The guard measures the MACHINE
   board for other running batteries, and the battery logged `CONTENDED — 2 concurrent batteries`:
   a second node-guards battery (the factory's own fires, which run every five minutes) was live.
   **Re-run alone on a quiet board: rc=0, green** (`artifacts/e5-regatta-boat/contention-rerun.log`).
   Nothing else in the ~200-guard battery failed, which is the real signal from that 444 s run.

### The engine hash (the pin is the drain's, not this slice's)

| | `computeEngineHash` (`scripts/engine-era-guard.test.mjs`'s own function) |
| --- | --- |
| Before (`32524c8f6`, main's tip at cut) | `2ad0aa1e14a1b7f639bc9c797ae5e14839d11c7b34b70f3f7ac7ca9479fbf6f4` |
| After (`ab7f02447`, the branch tip) | `5770c93e2457f264a74870d1da3b4d07f72ffe64afe61f884456159009a06a24` |

`assets/engine-era.json` was NOT touched.

---

## 8. Firewall

Touched exactly: `src/entities/ClaimBoat.ts`, `src/world/DeepwaterClaimTile.ts`,
`src/world/ClaimBoatView.ts`, `src/sim/DeepwaterSocket.ts` (a comment naming slice 2's one line),
`src/sim/HeadlessContractSim.ts`, `src/game/Game.ts`, `src/agent/StandingOrders.ts`,
`assets/contracts/epoch-5-deepwater/contracts.json` (`e5-regatta` -> `claimBoat.physics` only),
new `scripts/regatta-boat-steer.test.mjs`, new `e2e/e5-regatta-boat.spec.ts`, `package.json` (the
guard's `test:node-guards` entry), `artifacts/e5-regatta-boat/**`.

Not touched: `src/systems/RegattaRaceSystem.ts`, the storm track, the corsairs, the flotilla, every
other map, the door and `functions/**`, the agent view schema, `public/skill.md`, `src/config/Balance.ts`
(nor `src/game/Balance.ts`), `assets/engine-era.json`, `STATUS.md`, `tasks/**`. No existing e2e
assertion was modified.

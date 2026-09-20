# e5-regatta-boat-02 — the race reads the boat

**Slice 2 of `specs/agent-play/e5-regatta-steerable-boat.md`** (owner 2026-09-20: "A14 - do it"; the
parity law, 2026-09-07: "no, AI and human users have to have the same options and tools, otherwise it
is unfair. fairness is crucial."). Branch `feat/e5-regatta-boat-02`, cut from `05232a3a0`, worktree
`…/scratchpad/wt-regatta2`, dev server port **5325** only. Implementer: Claude Opus 5, attended-scratch
worktree.

**READY-FOR-GATES.**

---

## 1. What landed, item by item

| Item | Landed | Where |
| --- | --- | --- |
| 1. The race counts the boat (law 3) | yes | new `regattaRacer()` in `src/systems/RegattaRaceSystem.ts`, called by `DeepwaterSocket.advanceRace` and `Game.update` on the same field |
| 2. Forfeit on disembark (Q2) | yes | `RegattaRaceSystem.advance` + `forfeited`/`forfeitedAt` in the diagnostics |
| 3. One fast-water number (F-RB1-2) | yes | `DEFAULT_FAST_WATER_MULTIPLIER = 1.35` DELETED; the contract's `claimBoat.physics.fastWaterMultiplier` (1.5) is read instead |
| 4. The buoys | yes | new `src/world/RegattaBuoysView.ts`, mounted in `Game.createScene`; radii widened 3 → 6 with the measured reason below |
| 5. The honest tape | yes | 4 new claims in `scripts/regatta-boat-steer.test.mjs`; a new plain-boot race e2e in `e2e/e5-regatta-boat.spec.ts`, both projects |
| 6. The two stale tests | yes | `e2e/e5-regatta-race.spec.ts` `:35` and `:141` re-written and re-pinned; inventory rows 1109–1110 retired |
| 7. The null floors | yes | exactly the two Regatta floors re-recorded; the other 81 byte-identical |
| 8. Not this slice | respected | view fields, `skill.md`, `MechanicsManifest`, the census pin, the heat |

---

## 2. The course as raced

`RegattaRaceSystem` runs **six gates, not five**: the five authored beacons in order, then the
`heroStart` stake (`claim-boat`, −49 / 0) as the finish line — the mark the boat is moored on at the
start. So the course is out and back: start (−49, 0) → north-west (−28, 38) → mid-course (0, 18) →
north-east (28, 38) → finish beacon (49, 0) → home to (−49, 0). About 254 m of water.

**Boarding passes the start beacon**, because the mark stands on the boat's own mooring. That is the
moment the race becomes the run's to lose (see the forfeit, §3).

A headless rider sails it in **137.97 s** (`artifacts/e5-regatta-boat-02/measured-course.json`); a
human at the keys in ≈140 s of sim time (28.5 s wall at `?timescale=6`).

### The buoy radii: widened 3 → 6, and why

**Kept at their authored positions (Q3, ratified).** The RADIUS moved, in the contract and its
published mirror. The reason is measured, not argued.

Slice 1's ratified rule is that a move intent toward standable ground within a plank of the rail is a
STEP ASHORE, and `ClaimBoat.gangplankPoint` measures that plank **from the hull centre out through
whichever rail the intent leaves by**: over the bow of a 28.5 m hull that is **16.25 m** (14.25 + the
2 m plank); over the beam only **5.81 m** (diagonal) or **6.4 m** (abeam). On a course that is all open
water, "shore" is the water beyond the hull's own clamp (±49.75), so:

| Band | Where a key press puts the racer over the side |
| --- | ---: |
| north, bow-first | z > **33.50** |
| east, bow-first | x > **43.35** |
| east, diagonal | x > **43.94** |

At radius 3 the north marks (z = 38) scored only at z = 35 — **two metres inside the band**. A racer
who points the bow at the mark was put overboard 4.5 m short, which after this slice is a forfeit.
Measured on a real sim with a human-like control loop that re-aims every 0.83 s:

| Authored radius | straight at the mark | bow-aware (a 2 m look-ahead) |
| --- | --- | --- |
| **3** | **FORFEIT at 26.7 s**, 1 of 5 gates, overboard at (−29.3, 33.6) | won at 152.5 s — but only through a **1.4 m lane** the finish-line RIG happens to shadow (the step-ashore point is un-walkable there, so the trap misfires). Scenery, not design. |
| **6** | 4 of 5 gates: the three inner marks now round cleanly | **won at 142.2 s from open water**, leaning on no scenery |
| **8** | 4 of 5, same place | won at 139.2 s |

**6 is not a new number on this map.** It is `DEFAULT_GATE_RADIUS`, already the sixth gate's radius
(the `heroStart` stake), and already published as `gateRadiusFallback: 6` in the mechanics manifest.
The course now has one gate size instead of two. 8 buys a wider control budget at the finish beacon
and nothing else; it would be a new authored number with no principle behind it.

**Residual, stated not hidden:** the finish beacon stands 0.75 m off the hull's own east clamp, so its
scoring circle clears the step-ashore band by only **0.35 m** on the line (x ≤ 43.0 scores; x > 43.35
steps off) and by ±2.02 m of z-offset. That is F-RB2-2's, not the radius's, and no radius fully cures
it — the boat still has to come down the line rather than in from the north.

### Closest approach to each mark, measured

| Mark | headless rider | plain boot, desktop | plain boot, mobile |
| --- | ---: | ---: | ---: |
| north-west | 5.999 | 6.685 | 7.035 |
| mid-course | 5.999 | 6.004 | 7.116 |
| north-east | 5.925 | 6.221 | 6.887 |
| finish beacon | 5.996 | 6.497 | 6.433 |
| home stake (r = 6) | 5.971 | 6.520 | 6.143 |

These are the distances **at the glance before the gate triggered**, not the minimum achievable — the
gate fires on the post-move position, so the true crossing is inside the radius by construction.

---

## 3. The forfeit case (Q2)

> "leaving the boat mid-race forfeits the race" — ratified 2026-09-19.

| | |
| --- | --- |
| **Rule** | once the start beacon is passed, a step with **no racer** sets `forfeited: true` with `forfeitedAt`, and `nextGate` becomes null |
| **Terminal for the run** | re-boarding does NOT resume it; a later gate scores nothing (asserted) |
| **A non-starter is not a forfeit** | a run that never passed the start beacon cannot forfeit — that is the idle run, and it keeps its null floor |
| **Secure rule** | UNCHANGED. `Game.autoSecureWaveForRun` and its headless twin still read `raceCourse && race.finished !== true`; a forfeited race never finishes, so a forfeited run is a non-secure run by the rule that was already there. No clause was added. |
| **Measured** | headless: board → start beacon passes → step ashore one plank off the port rail → `forfeited: true` at the tick; re-board → gates unchanged, `finished: false` |

**What a player will feel, and it is a finding (F-RB2-2, §7):** the disembark rule fires on a KEY
DIRECTION, not on a deliberate act, so a racer holding the wrong key near a rim forfeits without
touching anything. At radius 6 the three inner marks are clear of it; the finish beacon is not.

---

## 4. The single fast-water number

`DEFAULT_FAST_WATER_MULTIPLIER = 1.35` is **deleted**. `RegattaRaceSystem` now reads the contract's
`tileParams.deepwater.claimBoat.physics.fastWaterMultiplier` — **1.5** — the same field
`ClaimBoat.steer` already applied to the hull. `create()` refuses a `raceCourse` whose racing body
authors no physics rather than inventing a default for it, so the number cannot come back by omission.

**Why read it rather than bypass it.** The hull never called `movementMultiplierAt` in the first place
(its bonus is applied inside the helm), so "bypass for the hull" would have meant deleting the on-foot
bonus entirely — silently changing a body's speed to no purpose. Fast water is a property of the
WATER: the zone now reads the same for whatever is in it, and a second Deepwater course can author a
different current without editing a source file.

Measured consequences: the hull runs at 1.6500 × 1.5 = **2.4750 wu/s** in the band (unchanged from
slice 1); a body on foot goes from 6.0 × 1.35 = 8.1 to 6.0 × 1.5 = **9.0 wu/s**.

⛔ **F-RB2-3, for slice 3:** `src/agent/MechanicsManifest.ts:564` hardcodes `fastWaterMultiplier: 1.35`
and is outside this slice's firewall (the manifest, the view bump, the fence and the census pin are
one censused act). **The published rule now states a number the engine does not use.** The rewritten
`e2e/e5-regatta-race.spec.ts:35` asserts the manifest's REAL value so the lie is measured, not hidden.

---

## 5. The two re-pinned tests

Both were red on main as **F-MAC2-1** (`logs/suite-red-inventory.md` rows 1109–1110). Their PREMISE was
replaced, not their numbers patched, and the inventory rows were retired the way that file's own law
allows — **ADDITIVE corrections**, never a rewrite of a snapshot observation (verified:
`node --test scripts/suite-red-inventory.test.mjs` 15/15, and `red-inventory-lookup.mjs` prints both
corrections ahead of the snapshot rows).

| Test | Old pin | New pin |
| --- | --- | --- |
| `:35` *the Regatta is won by the BOAT…* `e5-regatta-01` | `fnv1a32:02404a88` | **`fnv1a32:1bf7c1ff`** |
| `:35` `e5-regatta-02` | `fnv1a32:bf8b5db5` | **`fnv1a32:e8b9b2ff`** |
| `:141` *idle Regatta runs lose because nobody ever boards the boat* `e5-regatta-01` | `fnv1a32:80b36bec` | **`fnv1a32:8050c83f`** |
| `:141` `e5-regatta-02` | `fnv1a32:3dfe7f19` | **`fnv1a32:18093696`** |

`:35` now boards and steers; both seeds `secured: true, waves: 12, kills: 25`, race finished at
233.83 s. `:141` still `secured: false, waves: 14, endReason: wave-ceiling`. Their sibling `:157` is
untouched and green. All three green on BOTH projects (51.4 s).

**Two things the re-write measured and wrote down:**

1. **`submitOrders` REPLACES the standing order list.** A turn that submits nothing wipes the helm —
   the ride stalled dead at x = 8.9 on the run home until the loop stopped skipping turns. Any rider
   tape that steers a boat must re-issue every turn.
2. **A rider cannot see whether it is aboard.** There is no `aboard` field in the view; the ride infers
   it from the race having started. That is slice 3's censused act, and the test says so.

---

## 6. The null floors — before/after, with the cause

| | |
| --- | --- |
| **Before** (`node scripts/null-floor-anchors.mjs --check`) | rc=1, 516.2 s — **81 of 83 match; 2 moved** |
| | `e5-regatta/e5-regatta-01 eventLogHash: pinned="fnv1a32:d461683d" derived="fnv1a32:8050c83f"` |
| | `e5-regatta/e5-regatta-02 eventLogHash: pinned="fnv1a32:1676f150" derived="fnv1a32:18093696"` |
| **Re-record** | 342.8 s, `Wrote 83 null floors` |
| **After** (`--check`) | rc=0, 298.3 s — **83 of 83 null floors match** |
| **Whole-file diff** | exactly three lines: the two hashes above, plus `eraStamp` `72cddd04f` → `05232a3a0`, which is PROVENANCE (the recorder names the tree it measured on) and not a floor |

**The cause, one line and owner-ruled (A14):** an idle run used to pass the START BEACON **for free**.
The mark stands on the Claim-Boat's mooring and the mooring was in the racer list, so a run that did
nothing still scored a gate and carried it in the event log. Slice 2 races the hull only while a body
is aboard, so an order-less run now passes no gate at all. Everything else about those two runs is
unchanged: still `secured: false, waves: 14, timeMs: 320000, gold: 0, kills: 39`.

No other floor moved by a byte — that is the evidence nothing outside this slice changed.

---

## 7. Findings

### F-RB2-1 / -1b / -1c — three guards outside this master's firewall encode the world this slice replaced

Each is reported with a **tested** cure rather than patched, because the master's firewall does not
list them (CLAUDE.md §7.2). **This is the same class F-RB1-5 named at slice 1's drain** — a master that
changes a contract must list the mirrors and pins that track it; here, **a master that changes WHO
RACES must list the guards that encode the old racer.**

| # | Guard | What it asserted | Cure (written and RUN) |
| --- | --- | --- | --- |
| **F-RB2-1** | `scripts/deepwater-rider-parity.test.mjs` | a body **swimming** mark to mark wins the Regatta — the exact dishonest path scope item 1 closes | `…/deepwater-rider-parity.cure.mjs` — board, then steer; fast water measured against the contract's top speed. **Green, both seeds, twice each: secured true, waves 12, kills 23, 30.4 s.** |
| **F-RB2-1b** | `scripts/e5-stillwater-front-crew.test.mjs:76-77` | the pre-slice Regatta idle hashes `d461683d` / `1676f150` | `…/e5-stillwater-front-crew.cure.mjs` — the same two-line re-pin item 7 made to the floors, with the cause. **Green, 3 of 3.** |
| **F-RB2-1c** | `scripts/deck-movement.test.mjs:92-119` | (a) a **swimming** hero passes the first beacon on the movement tick; (b) four `race.advance(…, [nextGate])` calls pass an **array**, the old signature — which now reads `racer.x === undefined` and silently scores nothing, the worst failure shape there is | `…/deck-movement.cure.mjs` — board first and watch the SECOND mark; pass the point itself; plus two new lines asserting the forfeit clause. **Green, 3 of 3.** |

`deepwater-rider-parity` was measured **GREEN on the exact base** (`05232a3a0`): 1 pass / 0 fail in
14.0 s (`baseline-rider-parity.log`); red here with `false !== true` at `:52`
(`after-rider-parity.log`). The other two fail on values this slice changed by hand, so the causal
chain is direct.

### F-RB2-2 (blocking-class, for the owner) — the disembark rule is a trap a racer cannot see

The step-ashore probe reaches **16.25 m over the bow**. On an all-water course the "shore" is the water
beyond the hull's clamp, so **holding a key toward a rim puts the racer over the side** — and after
this slice that forfeits the run's race. It is invisible: no warning, no UI, and the body lands in
14 m of open sea rather than on any shore.

Radius 6 clears the three inner marks (measured: a straight-at-the-mark drive rounds them). It does
**not** clear the finish beacon, which stands 0.75 m off the clamp: its scoring circle clears the band
by 0.35 m on the line. A racer has to come down the line rather than in from the north, and nothing
tells them so.

**Not curable inside this firewall**, and arguably not curable by data at all: the cure is a better
answer to "what is *shore* on a map that is all water", which is slice 1's ratified geometry and an
owner/spec question. Two candidate shapes for whoever takes it: (a) require the step-ashore point to
be ground the hull could never float in *for a reason other than the clamp inset* — on this map none
exists, so disembarking would need a deliberate act; (b) shorten the probe to the BEAM reach in every
direction, so the bow stops volunteering the racer overboard. The guard
`SLICE 2 — the marks score before the bow-probe reaches the rim` pins both bands (33.50 and 43.35) so
the numbers cannot move silently under whatever is chosen.

### F-RB2-3 — the published mechanics rule now states a number the engine does not use

`MechanicsManifest.ts:564` hardcodes `fastWaterMultiplier: 1.35`. Slice 3's censused act. See §4.

### F-RB2-4 (non-blocking, for slice 3 or the owner) — `REANCHOR` is a teleport that lands on two of the six marks

`reanchor` is still a teleport (slice 1 kept the storm rules) and the two authored anchors,
`start-line` (−49, 0) and `finish-line` (49, 0), **stand on the first and last beacons**. Gates must be
passed in order, so the three middle marks cannot be skipped — but the finish beacon and the home
stake can both be taken without sailing to them. Not exercised by this slice's rides (the re-written
`:35` deliberately never reanchors mid-race, and says so), and not measured end-to-end; stated so the
next reader tests it rather than discovers it.

### F-RB2-5 (routine, for the drain) — one law pointer rotted, as this coordinate always does

`scripts/fire.md -> src/game/Game.ts:2692` no longer reads
`collectGold: () => this.collectProspectorGold(),`. The cited content now sits at **`Game.ts:2695`
(+3)**, moved by this slice's three added lines in the field block above it. `scripts/fire.md` is
outside the firewall. **Re-base to `:2695` and `--update` the baseline in the landing commit** — the
same lifecycle slice 1's drain executed (`Game.ts:2671 -> :2692, +21`).

---

## 8. Gate results — real numbers

| Gate | Result |
| --- | --- |
| `npx tsc --noEmit` | **clean** |
| `npm run build` | **green** (`built in 1.81s`) |
| `node scripts/null-floor-anchors.mjs --check` (after) | **rc=0 — 83 of 83 null floors match** (298.3 s) |
| Named guards (`regatta-boat-steer`, `deepwater-rider-parity`, `gr-sim`, `same-game-audit`, `e3-mask-tables`, `claim-boat-asset`) | rc=1 — **ℹ tests 72 · pass 69 · fail 1**; the one red is `deepwater-rider-parity` (F-RB2-1). `regatta-boat-steer` 9 of 9; `e3-mask-tables` + `claim-boat-asset` 32 of 32 after the mirror and pin re-point |
| `node scripts/run-guards.mjs --changed-since 05232a3a0` | **4/5** — `test:power-budget` / `test:task-guards` / `test:citations` / `test:gate-callers` PASS; `test:node-guards` RED, enumerated below |
| Full `npm run test:node-guards` | rc=1 — **ℹ tests 938 · pass 925 · fail 8 · skipped 5** (`node-guards-full.log`) |
| e2e `e5-regatta-boat` (3 tests) | **6 of 6 both projects** — desktop 10.2 / 4.8 / 28.5 s, mobile 10.4 / 4.8 / 29.8 s (1.5 m), zero console/page errors |
| e2e `e5-regatta-race` (3 tests) | **6 of 6 both projects** (51.4 s) — the two F-MAC2-1 reds cured |
| e2e `e5-deepwater-claim` + `e5-flotilla-hulls` + `task-025-bandits-dont-swim` + `m2-01-build-menu` | **32 passed / 4 failed** (2.8 m) — all four failures are `e5-flotilla-hulls` `:6`/`:118`, attributed below |
| Frame p95 on `e5-regatta` | **−0.5 %**, four runs per arm — see below |
| Engine hash | `8eb7e135…` → `e482aab5…` (§9) |

### The eight battery reds, four distinct causes

| Red | Cause | Whose |
| --- | --- | --- |
| `Regatta measures the rider…` | **F-RB2-1** | mine — tested cure supplied |
| `headless public BOAT_BUILD and REANCHOR orders…` | **F-RB2-1c** | mine — tested cure supplied |
| `the other E5 idle rides retain their measured deterministic pins` | **F-RB2-1b** | mine — tested cure supplied |
| `THE REAL TREE: every law-surface pointer…` | **F-RB2-5**, `fire.md -> Game.ts:2692` → `:2695` | mine — drain re-bases |
| `rotation registry stays outside the engine identity corpus` | the engine hash moved `8eb7e135…` → `e482aab5…` | the **drain's pin** cures it (slice 1 precedent: "after the pin … 41/0") |
| `the landed registry names the live engine and stays outside its hash corpus` | same | same |
| `all 152 scripts/*.test.mjs fixture owners remove their temp directories` | **NESTS the above** — the sweep runs every guard as a child and `bench-seeds` failed on the same hash | same |
| `the live board is green under this guard (baseline is honest)` | `desk-declaration-guard` **REFUSES BY DESIGN** in a linked worktree: *"this is a linked worktree and its STATUS.md line-1 is NOT the one main carries … Re-run from the main worktree"* | environmental |

### The e2e reds, attributed

`e2e/e5-flotilla-hulls.spec.ts` `:6` and `:118`, both projects — **KNOWN, F-MAC2-1, inventory rows
1107–1108**, the flotilla rows the master names as "not yours". Fingerprint on this tree, character for
character what those rows record:

```
-   "eventLogHash": "fnv1a32:a9f33e48",     +   "eventLogHash": "fnv1a32:c01dd739",
-   "eventLogHash": "fnv1a32:68d87963",     +   "eventLogHash": "fnv1a32:815739a6",
```

### The p95 arms (four runs each, one tree, same host, 20 s of real frames, desktop 1280×800, `channel: 'chromium'`)

| Arm | p95 per run (ms) | median p95 |
| --- | --- | ---: |
| Buoys mounted (this branch) | 9.30, 9.30, 9.40, 9.60 | **9.350** |
| Control — the same build with the `RegattaBuoysView` mount disabled, which is main's render path for this map exactly | 9.40, 9.20, 9.50, 9.40 | **9.400** |

Ratio **0.995 (−0.5 %)** — the arms are indistinguishable, which is what five static meshes and one
Set build per frame should look like. The A/B is on THIS tree deliberately (slice 1's precedent): it
isolates the only per-frame work the slice adds with everything else held identical, which a
cross-tree comparison on a shared box cannot do. Probe `scripts/_s-rb2-perf.mjs` (gitignored scratch);
the control arm's one-line edit was reverted and `git status src/` is clean.

---

## 9. The engine hash (the pin is the drain's, not this slice's)

| | `computeEngineHash` (`scripts/assay-replay-agent.mjs`, the guard's own function) |
| --- | --- |
| **Before** (`05232a3a0`, the base) | `8eb7e135ef6c707d1ac62414755c65237768332c9cdbda045871d2e3945aa71d` |
| **After** (`a93aa6230 (archive: pruned by the A3 rewrite)`, the branch tip before this report) | `e482aab58b6aa7ef29571fc4edd5f86a43ef5a9ade9307f3155269a5c5b0fde8` |

The BEFORE value equals `assets/engine-era.json`'s pin `#17` exactly, which is how the method was
verified. `assets/engine-era.json` was NOT touched.

**Contract source hash** (pinned by both pilot contracts, re-pointed in the same commit as the data
change): `0251ebc5966d130f90c2e0303303244c5bf970da7d77398a705d518fbeaae857` →
**`6b394081336842b9035e32d7045dba7029b80a69d460a90b4afb97c7b3008c51`**.

---

## 10. What slice 3 must publish

1. **The aboard bit.** There is no `aboard` field in the agent view. A rider currently infers that it
   boarded from the race having started — which only works on a map with a start mark on the mooring.
   Publish `boat.motion` (position, heading, aboard) with the view-version bump law 5 names.
2. **The two refusals.** `NOT_ABOARD` and `UNREACHABLE_WATER` are still outside `HERO_ORDER_REFUSALS`
   (slice 1's deliberate hold). Publishing them is the same censused act.
3. **`MechanicsManifest`, and it is now a correction, not an addition (F-RB2-3).** `:564` publishes
   `fastWaterMultiplier: 1.35`, a number the engine no longer has. Point it at the contract
   (`tileParams.deepwater.claimBoat.physics.fastWaterMultiplier`) rather than re-typing 1.5, and add
   the forfeit clause to the `regatta_race` rule — a rider that cannot read "leaving the boat ends the
   race" will lose runs it does not understand.
4. **The gate radius.** `gateRadiusFallback: 6` is still true and is now every gate's radius; say so.
5. **The E5 census pin**, re-pointed with the cause, and the same-game audit re-measured on the
   Regatta (unchanged by this slice: no verb, no view field, no buildable moved — `same-game-audit` is
   green here).
6. **Carry F-RB2-2 to the owner before the heat.** A racer put overboard by a key press, with no
   warning, will read as a bug in the heat's transcript whether or not it is one.

---

## 11. Firewall

Touched exactly: `src/systems/RegattaRaceSystem.ts`, `src/sim/DeepwaterSocket.ts`, `src/game/Game.ts`
(the race handoff and the buoy-view mount/update/dispose/field only), new `src/world/RegattaBuoysView.ts`,
`assets/contracts/epoch-5-deepwater/contracts.json` (`e5-regatta` → `raceCourse` radii only),
`assets/contracts/epoch-5-deepwater/mask-tables/e5-regatta.json` (the republished mirror),
`assets/pilots/claim-boat-3d/claim-boat-contract.json` and `assets/pilots/flotilla-3d/flotilla-contract.json`
(their `sourceHashes` entry for the contracts file only), `assets/contracts/null-floors.json` (the two
Regatta floors), `e2e/e5-regatta-race.spec.ts`, `e2e/e5-regatta-boat.spec.ts`,
`scripts/regatta-boat-steer.test.mjs`, `logs/suite-red-inventory.md`, `artifacts/e5-regatta-boat-02/**`.

`src/entities/ClaimBoat.ts` was NOT touched: the forfeit state is the RACE's, so it lives in
`RegattaRaceSystem`.

`logs/suite-red-inventory.md` was edited in its **Corrections** section rather than at lines
1109–1110, because that file's own law is ADDITIVE ONLY — *"the tables below record what the snapshot
run observed on its date and are never rewritten"*. The firewall's intent (only those two rows'
redness) is honoured; the mechanism is the file's.

Not touched: the storm track, the corsairs, the flotilla, every other map, the door and `functions/**`,
the agent view schema, `public/skill.md`, `src/config/Balance.ts` (nor `src/game/Balance.ts`),
`assets/engine-era.json`, `STATUS.md`, `tasks/**`, `specs/**`, `reviews/**`. Slice 1's screenshots
under `artifacts/e5-regatta-boat/` were restored by `.png` name after the e2e churned them. No guard
outside the firewall was edited — the three this slice reds carry cures in
`artifacts/e5-regatta-boat-02/*.cure.mjs` instead.

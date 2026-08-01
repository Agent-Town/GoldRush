# ap-07-night-shift-fixtures — admit `e1-night-shift` to GR-SIM, fixtures first

**Slice:** `ap-07-night-shift-fixtures` · **branch:** `lane/m4` @ `467ed904` · **merged to main:** `07854e6b` · **authored and drained:** s1319, 2026-08-01 (same fire).

## Verdict

**ACCEPTED AND MERGED.** Every pre-declared acceptance condition was met, and I reproduced each of them myself rather than reading the report — including both arms of the before/after table, whose outcome hashes came back **byte-identical to the runner's**.

ⓘ **Authored and drained by the same fire.** Stated plainly because it is a conflict of interest: I wrote the bar and then judged against it. Mitigation was to reproduce every certifying measurement independently rather than accept any of the runner's numbers, and to look hardest at the conditions I had written to be easy to fake.

## What it does

`HeadlessContractSim` admitted two contracts and scored both by one generic rule — reach `twist.secureWave` alive. `e1-night-shift` shares that property (`briefing.goals[0]` = *"Survive to DAWN at wave 25."*, `twist.secureWave` 25, **zero `stakeMarkers`**), so it needed no objective driver. But it is the **only** E1 contract carrying `tileParams.prePlacedBuildables` — seven wrecked `lantern_post`, `relightCost: 8` — and the sim read that key **zero times**, while `MechanicsManifest` published those same seven fixtures to the agent as `relight` interactables and the briefing told it to relight them.

Two changes, in the order the master demanded:

1. **Fixtures first** — a generic loop over `this.manifest.tileParams.prePlacedBuildables ?? []` calling `this.build.placeFree(...)` with the same options as `Game.ts::placeContractFixtures()`, placed after `this.build` is constructed.
2. **Then the pin** — `'e1-night-shift'` added to `SUPPORTED_CONTRACTS`.

✅ **No contract branch was introduced.** Verified by reading the merged file: the loop is data-driven and `?? []` leaves the other two contracts untouched. `grep "if (contractId ===" src/sim/HeadlessContractSim.ts` → nothing.

## Acceptance conditions, each reproduced by me

| Condition (pre-declared in the master) | Verdict | My own evidence |
| --- | --- | --- |
| Scope 1 observe-first; **STOP if any seed fails to boot** | ✅ met, no CANCEL | All three frozen seeds exit 0 with well-formed outcomes |
| Scope 4: assertion **derived**, not a hand-typed `7` — *"a hand-typed 7 is a pre-declared REJECT"* | ✅ **PASS** | Read at source: `assert.equal(firstView.now.works.byKind.lantern_post, contract.tileParams.prePlacedBuildables.length)` — reads the contract JSON and derives the count |
| Scope 4: **manufactured RED**, byte-exact revert, GREEN — *"a report without it is a pre-declared REJECT"* | ✅ **PASS, reproduced** | I neutered the loop myself → **`undefined !== 7`, 2 pass / 1 fail**, identical to the report; restore returned sha256 `9f7fb225…f5cf` — **the same hash the runner reported**, so its byte-exact claim is independently confirmed |
| Scope 3: determinism pair byte-identical | ✅ PASS | Runner's pair identical; my own re-run of `e1-night-shift-01` returned hash `fnv1a32:c086ef19`, matching |
| Scope 3: **say plainly whether any outcome moved** | ✅ PASS, and answered honestly | *"Only replay hashes changed: the lanterns are truth-bearing but not load-bearing for idle-policy scoring."* |
| Scope 5: eval-dataset rows held back as a separate slice | ✅ PASS | Reported, not acted on |
| node-guards baseline **derived, not inherited** | ✅ PASS | Runner: 204 → 205. **Mine: 204 on the pre-merge tree, 205 on the merged tree**, both 0 failures |

## Evidence (re-derived on the merged tree, s1319)

| Gate | Result |
| --- | --- |
| `npx tsc --noEmit` | clean |
| `npm run build` | green, `✓ built in 1.61s`, asset-diet green |
| `node --test scripts/gr-sim.test.mjs scripts/bench-seeds.test.mjs` | **5 passed / 0 failed** |
| node-guards (37 files) | **205 passed / 0 failed** (was 204 pre-merge — the +1 is this slice's new test, delta explicable) |
| Manufactured RED (mine) | `undefined !== 7`, 2 pass / 1 fail; byte-exact restore verified by sha256 |
| Playwright | **none run, correctly** — this slice renders nothing. Stated rather than shipping empty artifact dirs. |

**Before/after, independently re-measured by me on this machine — both arms, both hashes matching the runner's exactly:**

| Arm | Wall | `eventLogHash` | Matches runner? |
| --- | ---: | --- | --- |
| fixtures neutered (control) | **2,306 ms** | `fnv1a32:84c22e10` | ✅ identical to its "Before" |
| fixtures placed (shipped) | **19,900 ms** | `fnv1a32:c086ef19` | ✅ identical to its "After" |

Everything else — `secured`, `waves`, `timeMs`, `gold`, `kills`, `calls` — is unchanged between the arms. The lanterns change the replay, not the score, under the idle policy.

## Findings

### F-1319-3 — placing seven fixtures costs **8.6× the entire headless run**, and that lands on AP-07's one reason to exist

**✓ MEASURED BY ME, both arms, same machine, same seed:** 2,306 ms → 19,900 ms = **8.63×** (the runner independently got 2,610 → 21,429 ms = 8.21× — same magnitude, different absolute box load).

This is not a cosmetic regression. `specs/agent-play/README.md` states AP-07's premise verbatim: *"Browser-free = fast parallel rollouts (RL-scale)."* A **~8.6× per-episode cost** for one contract is a direct tax on the only property that makes the headless runner worth having, and night-shift is the contract an RL loop would most want (25 waves, the longest E1 episode).

⚠️ **And it is already close to a hard limit:** `scripts/gr-sim.test.mjs`'s night-shift case sets `timeout: 30_000` against a **19.9 s** run — roughly 10 s of headroom on an idle box. Under any load (a lane running, a gate battery, a second fire) this test is a plausible flake, and it will fail as a *timeout*, which reads like an engine hang rather than a budget overrun.

ⓘ **Cause not yet localised, and I am saying so rather than guessing.** The obvious suspects are `placeFree`'s per-fixture cost inside a headless `BuildSystem`, or seven extra `wrecked` structures widening every subsequent targeting/combat scan across 3,785 ticks. The second would scale with *episode length*, which would make this worse for exactly the longest contracts. **Fire-authorable as a measurement, not a cure:** profile one night-shift run and attribute the delta to placement-time vs per-tick cost, then decide. Not owner-gated.

**Non-blocking:** the shipped behaviour is correct and strictly better than the alternative (an agent briefed about seven objects that do not exist). This is a performance finding against work that fixed a correctness lie.

### F-1319-4 — the census sentence that mis-scoped this rung three times is now corrected

`docs/bench/agent-playability-census.md` grouped *"objective drivers for night-shift, twin-banks, and baron"* into one undifferentiated sentence. Night-shift needed **no** objective driver — only fixture placement. Corrected in scope 5, and the AGENT-READY count moved **2 of 41 → 3 of 41**. ✓ Closed by this merge. *The F-1314-2 class: one undifferentiated noun covering cases with different costs.*

## Merge classification

Base `main`; lane `lane/m4` one commit ahead (`467ed904`), **4 paths, all LANE-ONLY** per `scripts/lane-usable.mjs`. Merged path-scoped; no conflicts, no MAIN-MOVED file.

| File | Class |
| --- | --- |
| `src/sim/HeadlessContractSim.ts` | LANE-ONLY (+7/−1: generic fixture loop, Set +1 member) |
| `scripts/gr-sim.test.mjs` | LANE-ONLY (enumerated-throw updated, night-shift case added) |
| `env/goldrush-verifiers/README.md`, `docs/bench/agent-playability-census.md` | LANE-ONLY (current-truth prose) |

⚠️ **Drained under a live runner.** The lane-b runner had already moved on to a *different* task (`lane-drill-yard.md`, picked up 07:22:50) while this output sat undrained on `lane/m4` — the Mistake #2 exposure. The drain touched only `main`'s tree (`git checkout lane/m4 -- <4 paths>`), never the lane worktree. A `tasks/queue/lane-b/lane-drill-yard.md` deletion appeared in my working tree mid-drain; that is the runner consuming its own queue and was deliberately **not** staged.

## Where does the PLAYER see this?

**Nowhere, and that is correct** — this is engine/bench work with no rendering path. The *agent* is the consumer: a headless night-shift run now contains the seven cold lanterns it is briefed about and manifested with, so `relight` is an operation it can actually perform instead of one addressed to nothing. No gazette headline; a roundup line at most.

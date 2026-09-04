# Review — e4-vehicles-plain-boot

**Slice:** `e4-vehicles-plain-boot` (F-E4-3 corrective; CAPABILITY-LADDER L7)
**Branch:** `lane/c` · **Lane tip:** `686e3c65c` · **Base:** `a55581eed995539cf166051bc1a1c58c4c66d5a2`
**Merge:** `98cc0fc2f2f8e2d26ad46b4eb7ca4a1005f7dab6` (s2497 drain, 2026-09-04)
**Gated in:** detached worktree `gate-s2497` at main `4bcb42dc6` (§3.0b — main's tree held live attended heat-11 dirt)

## Verdict

**MERGE.** Every gate the master named is green on the merged tree. Two suites are red and
both are **control-proven pre-existing on main**; one of them is strictly improved by this
slice and its residue is filed as F-2497-1.

## What it does

`Game.ts` composed `Vehicle` and `FuelSystem` only when `isDevVehiclesEnabled()` — that is
`isDebugEnabled() && params.has('vehicles')` — so a headless rider could GRADE and HAUL on a
map where a browser player met neither road nor Hauler. That is the L7 asymmetry the owner
ruled on 2026-09-02 ("The laws for human and AI players have to be the same").

After this slice every contract whose twist declares `motorFrontier` mounts the Hauler and
the tar in a plain boot, through the same composition the flag used; `?debug&vehicles`
survives only as an override for non-Motor contracts. Confirm grades at a survey stake and
otherwise calls the Hauler, with Upgrade left as the direct grade input. Both semantic
actions are recorded into `RunTape.inputLog.motorActions`, so a human tape of a Motor errand
replays — proven by a recorded plain-boot ride replayed through `scripts/assay-replay.mjs`
inside the spec itself.

## Evidence (merged tree, `--workers=1` per F-1270-1)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean, no output |
| `npm run build` | green, built in **2.83s** |
| `scripts/e4-roads-and-convoys.test.mjs` | **11 pass / 0 fail / 0 cancelled**, 55.0s |
| `e2e/e4-roads-and-convoys.spec.ts` | **8 passed** (desktop-chrome + mobile-chrome 390px), 2.8m |
| — all four Motor reels | `claimed = node = browser`: `e4-long-road 9cdc36d6/4033`, `e4-gusher-county ca739103/7395`, `e4-boneyard 4ef6662b/3670`, `e4-dust-flats` in-suite |
| — plain-boot replay slip | `E4_PLAIN_BOOT_ASSAY_SLIP {"eventLogHash":"fnv1a32:e767879f","ticks":240}`, asserted equal to the tape's own hash and `durationTicks` |
| Console/page errors | **zero** — every plain-boot test asserts `expect(errors).toEqual([])` on both projects |
| `e2e/same-laws-harvest-parity.spec.ts` + `e2e/e4-vehicles-fuel.spec.ts` | green (10 passed in the adjacent batch) |
| Screenshots | `reviews/shots-e4-vehicles-plain-boot/{desktop-chrome,mobile-chrome}.png`, regenerated on the merged tree |
| `scripts/engine-era-guard.test.mjs` | red before the pin, **5/5 pass** after (see Engine identity) |

**Where the player sees this in a plain boot (Mistake #10):** on any Motor Frontier map, at
`/?contract=e4-dust-flats` with no `?debug` — the Hauler stands at `(-20, -8)` and the fuel
tank reads capacity 24. The spec asserts exactly that with the test seam absent
(`expect(plain.testSeam).toBe('undefined')`).

## Known reds — control-proven, not this slice

The control was the **same merged tree with the four lane `src` files reverted to main**
(`git checkout main -- src/game/Game.ts src/game/RunTape.ts src/story/trailGuide.ts
src/encyclopedia/registry.ts`), asserted in place via `git status` before it was believed,
then restored.

| Test | Merged tree | Control (main) | Reading |
|---|---|---|---|
| `e4-dust-flats.spec.ts:31` | fails at `:46`, `dustFlats` diagnostic `undefined` | **identical**, same line, same cause | pre-existing, untouched by this slice |
| `e4-dust-flats.spec.ts:97` | passes `:103`, fails at `:110` (`roads.segments` stays 0) | fails **earlier**, at `:103`, waiting for `vehicle.active` | red both sides; the merge moves the failure **forward** — `:103` is F-E4-3 itself |

Both fail on desktop and mobile identically on both sides. My first reading of `:97` was that
this slice had regressed it; the control refuted that and is the only reason the reading is
right.

## Engine identity

The engine corpus (`ENGINE_SOURCE_INPUTS`) includes the whole of `src`, so this slice rotates
the hash. **The runner's reported hash is not the one that was owed:** it measured
`6ebe281a…` on the lane's own tree, while the merged tree — which also carries s2493's and
s2494's drains — computes `41583818b1b62dcec49f241f0b9a3c7e168776a76be5d54e359e48dacc73e5be`.
That is precisely why the pin is the drain's duty and not the runner's.

Pinned as **era 5 pin 20**, a same-era append rather than an era bump, because existing tapes
are unaffected — measured, not assumed: all four Motor reels replay to their recorded hashes
in both engines on the merged tree. `assets/engine-era.json` is outside the corpus, so the
write is stable (no fixed point; the master's second honesty clause does not fire).

## Findings

- **F-2497-1 (corrective owed, outside this slice's firewall).** `e4-dust-flats.spec.ts:97`
  presses Space expecting a road grade, and this slice moved the non-stake Confirm to "call
  the Hauler" with Upgrade as the direct grade input. The test encodes the old input
  contract. It was already red for a different reason, so this blocks nothing, but the
  residue is real and now the only thing standing between that test and green. The runner was
  right not to touch it — `e2e/e4-dust-flats.spec.ts` is outside its TOUCH-ONLY list — but it
  did not report it either, and a firewall refusal is only a success when it is reported.
- **F-2497-2 (cured in this drain).** `assets/engine-era.json` was internally inconsistent on
  main: s2493's `reel-contract-routing-hazard` drain appended pin 19 and left the top-level
  `engineHash` mirror at pin 18's value. `engine-era-guard` therefore failed at its line-32
  consistency assertion **before reaching `engineEraIncludes`**, so the guard's real question
  had not been asked on main since that drain. Setting the mirror to pin 20 cures it; the
  guard now reaches and passes its coverage check.
- **F-2497-3 (non-blocking, inherited).** `e4-dust-flats.spec.ts:31` — the `dustFlats`
  diagnostic is `undefined` where the test expects a populated object. Predates both trees;
  owner of the defect unidentified. Filed so it stops being re-discovered by each drain that
  runs this suite.
- **Carried from the runner, unchanged, outside this firewall:** standings must admit
  `motorActions`; lockstep must carry Motor actions; `RunSuspend` must capture `MotorSocket`
  state.

## Merge classification

Base `a55581ee`, 8 paths, `main..lane/c` now empty.

- **LANE-ONLY (6)** — main never moved them: `src/game/Game.ts`, `src/game/RunTape.ts`,
  `src/story/trailGuide.ts`, `src/encyclopedia/registry.ts`, and the two new screenshots.
- **BOTH-MOVED (2)**, resolved as unions:
  - `e2e/e4-roads-and-convoys.spec.ts` — main (s2493's routing-hazard drain) had **renamed**
    the first test and widened `collectErrors` to take an errors array; the lane had inserted
    two new helpers (`walkToZ`, `confirm`) directly above that test and left the title at its
    base value. Taking the lane side would have **reverted main's rename**. Resolved by
    keeping main's renamed test and main's `collectErrors`, plus the lane's two helpers.
    Verified structurally rather than by line diff: four test titles and three top-level
    helpers, each read back from the merged file.
  - `tasks/BACKLOG.md` — both sides prepended a row. Kept main's owner-desk row, the lane's
    new row, and **main's** copy of the shared `f-e4-1` row, which is the newer one (it
    carries the `DESK-NOT-OWED` addendum the lane's copy predates).

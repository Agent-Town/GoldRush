# b2-flotilla-hulls — drain review (s2087)

**Slice:** B2 Flotilla Hulls (`e5-flotilla`) · **Branch:** `lane/c` · **Lane tip:** `f63a66ad0`
**Base:** `ed577f17d` (main at lock time) · **Merge:** `19e778135` (two parents: `ed577f17d` + `f63a66ad0`)
**Gate worktree:** `gate-s2087` (detached, §3.0b — undecided content never entered main's tree)

## VERDICT: MERGED — gates green on the merged tree, all four conflicts resolved by measurement.

## What it does

Three district hulls on the Flotilla deck now own integrity independently. Each hull takes damage,
and losing one is **nonfatal** — its deck output is disabled and the hull reads wrecked, while the
run continues. Corsair targeting is **straggler-biased** toward the hull that has drifted from the
centroid. A rider can reshape the formation with a cooldown-gated `REANCHOR` (8s). Losing **all
three** ends the run; wave 12 secures with any hull still alive.

**CO-OP DEBT — recorded, deliberately not built:** one-hull-per-rider assignment. Preserved from
`specs/agent-play/door-completion-sheet.md` B2 and the contract dependency. This is a single-seat
slice; do not infer multiplayer hull ownership from it.

## Evidence (all measured on the MERGED tree, `--workers=1` serial per §3.1)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, built in 2.00s |
| `e2e/e5-flotilla-hulls.spec.ts` + `e2e/er01-e5-census.spec.ts` | **14/14** passed (45.4s), desktop + 390px mobile |
| Adjacent: `e5-deepwater-claim`, `e5-regatta-race`, `e5-boss-dredge-queen`, `e5-water-spike`, `ap16-4-contract-admission` | **30/30** passed (2.1m) |
| `npm run test:node-guards` | **469 tests / 464 pass / 0 fail / 5 skipped**, 547.9s |
| Plain-boot console/page errors | zero (regatta plain-boot probe suppressed 0 known GLTFLoader blob errors) |

The 5 skips are the documented fire-shell cross-engine exclusions (F-1408-2), labelled at the skip
site — a declared non-coverage, not a hidden red.

**This battery discharges a debt the lane's own report left owing.** The lane runner reported its
full node battery was *externally contended* (449/457, remaining failures re-run serially) and wrote
"Supervisor still owes one uncontended full battery." That battery was run here, alone, with no
overlapping suite: **0 fail**.

## Merge classification

**Auto-merged, LANE-TOUCHED only** (main had not moved these): `assets/contracts/bench-seeds.json`,
`assets/contracts/epoch-5-deepwater/contracts.json`, `.../mask-tables/e5-flotilla.json`,
`e2e/e5-flotilla-hulls.spec.ts`, `e2e/er01-e5-census.spec.ts`, `public/skill.md`,
`scripts/door-admission-baseline.json`, `src/game/Game.ts`, `src/sim/DeepwaterSocket.ts`,
`src/sim/HeadlessContractSim.ts`, `src/systems/FlotillaHullSystem.ts`,
`src/world/DeepwaterClaimTile.ts`, `tasks/BACKLOG.md`.

**CONFLICTED — four files, each resolved by a stated rule, none by `--ours`/`--theirs`:**

1. `src/agent/MechanicsManifest.ts` — pure import-block collision. Main added `ProbeRecovery`,
   `SeedCaravanSystem`, `TileStateStore`; the lane added `FLOTILLA_HULL_RULES`. Neither removed
   anything. **Resolution: union of both import sets.**
2. `assets/contracts/null-floors.json` — only the `eraStamp` line conflicted (the lane's new
   `e5-flotilla` floors auto-merged). **Resolution: kept main's `2d71949de`.** Per the attended
   handoff, pinned-vs-derived eraStamp drift is the benign convention — do not churn on it.
3. `scripts/same-game-audit.test.mjs` — the corpus-count pins. **Resolution: both admission
   comment blocks kept in full, and every pin re-measured on the merged tree** (see below).
4. `docs/bench/same-game-audit.md` — 33 conflict hunks in a **generated** report. **Resolution:
   regenerated with `node scripts/same-game-audit.mjs --write-report` on the merged tree.** A
   generated file is never hand-merged.

## F-2087-1 — F-2084-1 RECURRED FOR THE FIFTH TIME IN ONE DAY. NOT A NEW DEFECT; A CONFIRMED SHAPE.

The lane pinned `agent-lacks 361 / equal 839 / not-offered 12` over **1212 rows**, exemptions 5.
Main pinned `402 / 878 / 10` over **1290 rows**, exemptions 6. Both were honest against their own
base and **both are false once the admissions stack** — the lane's base predated A6 (`e8-far-side`),
A7 (`e8-low-orbit`) and A8 (`e9-seed-run`), all three of which had merged that afternoon.

Re-measured on the merged tree by regen and pinned **verbatim**:

- `agent-lacks` **412** · `equal` **908** · `not-offered` **9** · **1329 rows** · exemptions **6**
- `admission.measurements.length` stays **10** — the AP-16-4 table measures the 13-contract
  *legacy-refusal* population, and the Flotilla was never in it.

The Flotilla **moves no exemption**: it was never in `CONTRACT_ADMISSION_EXEMPTIONS`; it was excluded
by empty `harvestAnchors` — the same data-derived door the Dead Band, Far Side and Low Orbit came
through. Its three authored deck anchors admit it. The per-contract shape is identical to all four
layers above it: **+10 agent-lacks, +30 equal, −1 not-offered, +39 rows**, which is what the lane
measured on its own base and what the merged delta reproduces exactly.

⚠️ **The reason this keeps happening is structural, and worth stating plainly for the next drainer:**
the pin is a whole-corpus count, so *any* admission anywhere moves it, and two lanes that admit
different contracts from the same base **write identical numbers and git sees no conflict** where
the count is unchanged. Here the counts differed so git did conflict — but that is luck, not
protection. The existing guard re-derives these counts live and IS what catches it; per F-1460-1 no
second guard should be built for a question one already answers.

## Findings

- **F-2087-1** (above) — recorded, non-blocking. Cured in this drain by regen-and-pin-verbatim.
  No corrective task: the mechanism that catches it already exists and worked.
- **F-2087-2 — RECORDED, NON-BLOCKING.** The `b2-flotilla-hulls` lane row and run report attribute
  its move as "audit 1212 rows (`0/361/839/12`, 5 exemptions)". On the merged tree those absolute
  digits are all stale. The merged comment block states the RE-MEASURED figures; a future reader
  must not "correct" them back toward the lane's. Same shape as F-2084-2, recorded for the same
  reason.
- **CO-OP DEBT** (not a finding, a preserved dependency): one-hull-per-rider assignment remains
  owed to the co-op milestone.

## Where does the PLAYER see this, in a plain boot?

On the Flotilla deck: three hulls with visible integrity, one of which can be lost without ending
the run (its deck output goes dark), and a `REANCHOR` context action to reshape the formation.
Covered by `e2e/e5-flotilla-hulls.spec.ts` and the `er01-e5-census` admission assertion, both of
which run without `?debug`.

# b7-showroom-capture-quota — drain review (s2091)

**Slice:** B7 Showroom capture quota (`e6-showroom`) · **Branch:** `lane/a` · **Lane tip:** `7fd7d44fc`
**Base:** `ac8ba21e7` (main at lock time) · **Merge:** `68784f782` (two parents: `ac8ba21e7` + `7fd7d44fc`)
**Gate worktree:** `gate-s2091` (detached, §3.0b — undecided content never entered main's tree; the
merge was landed on main as ONE atomic ref update, never staged, per F-1589-5)

## VERDICT: MERGED — gates green on the merged tree, four conflicts resolved by measurement.

## What it does

Securing the Showroom now requires **six real CAPTURE events**, in both the browser and the headless
sim. The latch gates the ordinary secure wave *and* the Baron path: a boss kill cannot stand in for a
quota the player never met. Below six captures the run cannot secure at any wave.

`captureQuota` is a **PROPOSAL** value (6) — a conservative minimum with wide margin under the
cap-fix evidence's competent aimed loop. Difficulty and the admission lists are **untouched**, per the
owner's standing ruling of 2026-08-20.

**NO ADMISSION, and the run says so honestly.** Strong public-verb CAPTURE + fortify play exceeded the
quota but died at waves 18/14 on the two bench seeds (306 captures `fnv1a32:e95a0e84` / 194 captures
`fnv1a32:6ee8e7e5`) against secureWave 20. Both idle seeds reached the wave-22/660s probe ceiling with
**zero captures** and remained unsecured under the new latch (`fnv1a32:63ffd412` / `fnv1a32:2413f94f`).
Re-admit when both seeds secure twice.

**The idle floors are the point.** Before this slice idle false-greened at wave 20 — exhausted machines
released their spawn slot but still held an enemy-POOL slot, so all 96 filled with harmless statues.
The quota latch closes that route independently of the pool fix.

## Evidence (all measured on the MERGED tree, `--workers=1` serial per §3.1)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean, 5.5s |
| `npm run build` | green, 23.0s |
| `e2e/e6-showroom-capture-quota.spec.ts` | **6/6** passed (11.2s), desktop + 390px mobile |
| Adjacent — shared secure chain: `e7-relay-rush-front`, `e7-echo-canyon-mirror`, `e8-far-side-probe`, `e9-seed-run-caravan` | **24/24** passed (1.8m) |
| Adjacent — `e2e/er01-e6-census.spec.ts` + `e2e/ap16-4-contract-admission.spec.ts` | **10/10** passed (9.6s) |
| `npm run test:node-guards` | **469 tests / 464 pass / 0 fail / 5 skipped**, 405.3s, run alone |
| Plain-boot console/page errors | **zero**, asserted in-spec, desktop + mobile |
| Same-game audit stack | 453 / 947 / 7 over 1407 rows, door 28 — **identical to main** |

The 5 skips are the documented fire-shell cross-engine exclusions (F-1408-2), labelled at the skip
site — a declared non-coverage, not a hidden red. The battery was run **alone**, with no overlapping
suite, per the F-2090-2 contention finding.

**Why the adjacent list is wider than the master's.** The master scoped its adjacents to the defect
(E6 census + admission). My conflict resolution touched the **shared secure chain** that A5, A6, A8
and the canyon latch all ride — so the cure's blast radius is wider than the defect's, and the
adjacent list was re-scoped to match (the F-1441-3 / "adjacent list is scoped to the defect, not the
cure" hazard). All four sibling objective suites were run for exactly that reason, and all 24 pass.

**No screenshots, and the reason is stated rather than skipped.** The diff adds **zero** rendering
code — no `THREE.*`, no mesh, group, sprite, material or `scene.add` in any added line (grepped, not
assumed). This is a sim + diagnostics latch. The player-visible surface is the secure behaviour
itself, which the plain-boot test exercises with no `?debug` gate (Mistake #10).

## Merge classification

Base `ac8ba21e7`; lane/a was **30 behind**, so main had genuinely moved. Per-file:

**Auto-merged, LANE-TOUCHED only** (main had not moved these): `assets/contracts/epoch-6-atomic/contracts.json`,
`e2e/e6-showroom-capture-quota.spec.ts` (new), `e2e/er01-e6-census.spec.ts`, `src/agent/MechanicsManifest.ts`,
`src/meta/ContractFamilies.ts`, `src/sim/AtomicSocket.ts`, `src/systems/ShowroomCaptureObjective.ts` (new),
`src/vite-env.d.ts`, `tasks/BACKLOG.md`.

**CONFLICTED — four hunks, all resolved by measurement:**

1. **`src/game/Game.ts` ×2** and 2. **`src/sim/HeadlessContractSim.ts` ×2** — BOTH-MOVED. Main added
   A5's `!this.interferenceFront.objectiveAllowsSecure` clause to the secure chain; lane/a added the
   showroom clause (`showroomCaptureObjective` browser-side, `this.atomic?.objectiveAllowsSecure`
   headless-side). These are **independent objective gates on a chain of independent objective
   gates** — each keyed on its own contract feature and true on every contract that declares no such
   feature. **BOTH clauses kept** in all four hunks; neither side was dropped. Main's explanatory
   comments were preserved verbatim; no new prose was invented for lane/a's line, since a merge
   resolution is not an authoring surface.
   *Verified, not assumed:* the four sibling objective suites (24/24) are the control — a wrong graft
   here would have broken relay-rush, echo-canyon, far-side or seed-run, and none moved.

3. **`assets/contracts/null-floors.json`** — resolved to **main's** `eraStamp` (`1817cb273`).
   Measured first: `git diff main...lane/a` on this file is **one line, the `eraStamp` alone**, and
   that stamp is *derived* (`null-floor-anchors.mjs` computes it from `git merge-base HEAD main`).
   This is exactly the drift the attended session of 2026-08-20 ruled benign — "do NOT churn on it".
   No floor value was touched by either side.

4. **`docs/bench/same-game-audit.md`** — **35 conflicts, REGENERATED not hand-picked**, per the
   generated-report law: `node scripts/same-game-audit.mjs --write-report` run on the merged tree.
   *Then verified rather than trusted:* diffing the regenerated report against main's while ignoring
   the citation column shows **exactly one differing line** — the `e6-showroom` held-admission reason,
   which is precisely what b7 earned. Every other change is source-coordinate drift (`Game.ts:6181` →
   `6189` etc.) caused by b7 adding lines above them. Both the `e6-showroom` **and** the `e7-relay-rush`
   rows survive; the regeneration dropped nothing main had added.

## Findings

**F-2091-1 (NON-BLOCKING, recorded — the lane's own report raised it and it is correct).**
Capture progress is absent from run-suspend and multiplayer snapshots: a suspended Showroom run
restores with its capture count lost, so the quota silently re-arms from zero. The lane runner
identified this and **correctly declined to fix it** — `RunSuspend` and Wrangle internals are outside
b7's firewall, and reaching into them would have been the scope violation the firewall exists to
prevent (`CLAUDE.md` §4.5: reporting adjacent problems is good, fixing out of scope is a violation).
Recorded here as an explicit adjacent follow-up, not merged into this slice.
**GATE: a successor is authorable only once the persistence surface is specced** — snapshot schema
changes touch save compatibility, which is not a drive-by.

**Not a finding — recorded so nobody re-chases it.** The lane's own node-guard battery reported
*"heavy external contention; every failing/cancelled leaf passed alone"*. That contention was
**s2090's three orphaned `claimed-spec-harness-guard` children** (F-2090-2), two of which were live
during b7's run. Re-run here alone on an unblocked machine: **0 fail**. The lane's reds were the
machine's, not the slice's — and this battery discharges the debt its report left owing.

## Goal leaf

`b7-showroom-capture-quota` → `status: "merged"`, `mergeHash: 68784f78238bcf625891d9c970ce152749fdf6fa`.

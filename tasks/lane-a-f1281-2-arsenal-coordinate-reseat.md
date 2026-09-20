CODEX: model=gpt-5.6-sol effort=high
# Task lane-a-f1281-2-arsenal-coordinate-reseat: reseat the e2-arsenal turret coordinate onto a MEASURED open tile (lane-a, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-a`.
**FIRE-AUTHORED s1286 (attended review welcome).** One task, firewalled.
⚠️ **THIS IS A TEST-ONLY REPAIR.** You will change exactly one coordinate in one e2e spec. You will NOT touch `src/`. The placement rule that rejects the old coordinate is **correct and load-bearing** — read the WHY before you start.

READ FIRST: `AGENTS.md` · `tasks/BACKLOG.md` **F-1281-2** (now DIAGNOSED — read the green row, it carries the whole measurement) · `reviews/f1281-2-turret-placement-diagnosis.md` (the diagnosis you are discharging — its five door-values are the premise) · `e2e/e2-arsenal.spec.ts` *"Auto-Pan upkeep and boiler battery bands consume the fixed-step pressure store"* — THE SUBJECT · `src/world/Terrain.ts:234-239` (`isBuildable`, the rule — READ ONLY) · `src/world/LandmarkCollision.ts` (blocker geometry — READ ONLY) · `logs/session-scratch/s1284-lane-d/door-probe-desktop-chrome.json` (the measured doors).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/m3 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP. Discard them and PROCEED, listing what you discarded.**
⚠️ **Verify with the instrument, not by eyeball:** `node scripts/lane-freeze-classify.mjs lane/m3` and, for any BOTH-MOVED path, `node scripts/lane-absorbed-lines.mjs lane/m3 <path>`. BOTH-MOVED is a triage bucket, not a loss verdict. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## Why (F-1281-2, diagnosed s1286 — the gate is discharged, the repair is now permitted)

The test *"Auto-Pan upkeep and boiler battery bands consume the fixed-step pressure store"* calls
`window.__GR_TEST__?.placeFree('turret', 0, 10)` and requires `true`. It resolves **`false`** on both
projects at `--workers=1`, and has since **2026-07-19**.

**All five `placeFree` doors were instrumented live in the page (s1284 lane-d).** Four are open:
`countFor('turret')` = `0` against `maxCountFor` = `4`; `snap()` does not move the point;
`overlapsExisting` = `false`; the buildable is present and enabled. The one that closes is
**`matchesPlacement` → `false`**, because `Terrain.isBuildable(0, 10)` is `false`.

**Why it is false, and since when:** `(0, 10)` sits inside the authored landmark
`hill-mine:boiler-house-site` — centre `(0, 12)`, half-extents `3.35875` (radius `2.687` × scale
`1.25`, per `LandmarkCollision.ts:41`), `containsUnpadded: true`. Commit `5e527a28` (2026-07-19)
changed `isBuildable` from `if (sample(x, z).zone !== 'bank')` to
`if (!terrain.walkable || terrain.zone !== 'bank')`, and made landmark footprints non-walkable. The
probe measures `zone: 'bank'` but `walkable: false` — **that one clause is the entire flip.** The
spec is unchanged since `562edc36` (2026-07-12), i.e. the world moved under a fixed coordinate.

🛑 **THE RULE IS NOT THE BUG — DO NOT "FIX" IT.** `reviews/lane-m4-collision-landmark.md` records
landmark solidity closing a **P0** ("never-trap": actors frozen inside repaired structures), shipped
with `e2e/landmark-collision.spec.ts` *"authored footprints stop the hero on The Claim and a county
map while an unfootprinted mount stays walkable"*. **Letting a turret into the solid boiler house
would re-open that P0.** The coordinate is what is stale.

## Scope

0. **ABORT CHECK, FIRST — the premise must be present before you repair it.** Reproduce at
   `--workers=1`: `npx playwright test e2e/e2-arsenal.spec.ts --workers=1 -g "Auto-Pan upkeep and boiler battery bands consume the fixed-step pressure store"`.
   **If it PASSES on both projects, STOP, change nothing, and report F-1281-2 as stale** with your run
   output as the evidence. A green here is a legitimate outcome.

1. **MEASURE an open tile — do not assume one.** ⚠️ **This is the whole difficulty of the task and the
   reason it is not a one-line edit.** The build zone is `base-t1`, `x ∈ [-30, 30]`, `z ∈ [8, 16]`
   (measured, in the probe JSON). The boiler house blocks roughly `x ∈ [-3.36, 3.36]`,
   `z ∈ [8.64, 15.36]` — **but it is not necessarily the only authored footprint on this contract, and
   you must not assume it is.** Enumerate **every** blocker the contract registers (`landmarkBlockersFor`)
   and find a candidate `(x, z)` that satisfies ALL of:
   - inside the `base-t1` build zone;
   - `Terrain.isBuildable(x, z) === true` **and** `Terrain.sample(x, z).walkable === true`;
   - outside every blocker's half-extents **including** the `0.58` collision pad, not merely the
     unpadded box — leave visible margin, so the next terrain edit does not re-stale it;
   - `matchesPlacement` and `overlapsExisting` both measured favourable at that point.
   A scratch harness under `logs/session-scratch/s1286-lane-a/` is fine and expected. **Report the
   candidate's measured values and at least one REJECTED candidate with the reason it lost** — a
   single lucky point with no alternatives shown is not a measurement.
   ⓘ Prefer a point whose margin you can state in a sentence ("nearest blocker edge is N units away").

2. **Reseat the coordinate, and only the coordinate.** Change the `placeFree('turret', 0, 10)` call to
   your measured point. **Keep every pressure-band assertion in that test exactly as it is** — the
   test's subject is the fixed-step pressure store, not placement. If any downstream assertion in the
   same test depends on the turret's position (e.g. a distance or a target), adjust it **only** as far
   as the new coordinate forces, and say so explicitly in your report.
   📝 **Leave a one-line comment at the call site naming the constraint**, e.g.
   `// (x, z) chosen clear of authored landmark footprints — see F-1281-2; do not move onto hill-mine:boiler-house-site.`
   That comment is the guard against the next reseat being another guess.

3. **Prove it, both directions.** The test must pass on **both** projects at `--workers=1`, and you
   must also confirm the OLD coordinate still fails (a one-off probe is fine) — **that is the control
   proving you moved the test rather than weakened the rule.** Paste both results.

4. 🛑 **DO NOT** widen a tolerance, relax a placement rule, add a fixture that pre-clears the tile,
   skip the test, or move the landmark. If you conclude the spec cannot be satisfied by any point in
   the build zone, **that belief IS the finding** — stop and report it with the enumeration that
   supports it.

TOUCH-ONLY: `e2e/e2-arsenal.spec.ts` (**the one `placeFree` coordinate + its explanatory comment, and any assertion the move strictly forces**) · `logs/session-scratch/s1286-lane-a/**` (scratch harness + captured output) · `reviews/f1281-2-arsenal-coordinate-reseat.md` (your report).
NO: **`src/**` — any file, any line**, especially `src/world/Terrain.ts`, `src/world/LandmarkCollision.ts`, `src/systems/BuildSystem.ts` · every other `e2e/**` file, especially `e2e/landmark-collision.spec.ts` · `playwright.config.ts` / `playwright.preview.config.ts` (the `--workers=1` requirement is §3.1 law, not a knob) · contract/terrain descriptors and landmark registries · `package.json` · Economy · CombatSystem · Balance.

## Self-check before READY-FOR-GATES
- `npx tsc --noEmit` clean and `npm run build` green.
- **`git diff main -- src/` must be EMPTY.** Paste that empty diff into your report as the firewall proof.
- `git diff main -- e2e/` touches **only** `e2-arsenal.spec.ts`, and within it only the coordinate, its comment, and any strictly-forced assertion.
- The target test passes **both projects** at `--workers=1`; the full `e2e/e2-arsenal.spec.ts` file is green on both projects at `--workers=1` (it is the adjacent suite of its own change).
- Your review file cites the failing/fixed test **by title**, never by bare `spec:line` (the `citation-title-guard` will red the drain otherwise).

READY-FOR-GATES + report: the chosen `(x, z)` with its five measured door-values and its margin to the nearest blocker · **at least one rejected candidate and why** · the old-coordinate control still failing · the empty `git diff main -- src/` · both-project `--workers=1` output · **or an explicit STOP** if Scope 0 came back green or no point in the zone satisfies the constraints.

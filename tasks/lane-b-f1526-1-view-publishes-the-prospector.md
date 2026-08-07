# Task f1526-1: THE VIEW must publish the Prospector, the body `placeRadius` is measured from (LANE-B, commit prefix "f1526-1:")

**FIRE-AUTHORED (attended review welcome)** — s1526, 2026-08-07.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b` (branch `lane/b`). Commit prefix `f1526-1:`. One task, firewalled. Never touch STATUS.md, reviews/, tasks/queue/, or other lanes.

READ FIRST (open each; do not work from this summary):
- `AGENTS.md`
- `reviews/standing-orders-rehearsal-e2.md` — the ER-02 rehearsal that filed F-ER02-10 and F-ER02-11.
- `src/agent/View.ts` — the cure site. Read the whole `now` builder and all three `record(agent.embodiment)` call sites.
- `src/agent/Embodiment.ts` — `ProspectorEmbodimentSnapshot` (the type) and the `snapshot` getter.
- `src/sim/HeadlessContractSim.ts` — the `private diagnostics()` builder and the `BuildSystem` construction.
- `e2e/agent-view.spec.ts` — where the new assertion goes.

## Why (F-ER02-11 + F-ER02-10, `reviews/standing-orders-rehearsal-e2.md`, 2026-08-06; every fact below RE-VERIFIED on main by s1526, not inherited)

The rehearsal filed two findings that only bite when read together:

- **F-ER02-10**: `placeRadius` is measured from the **Prospector**, not the hero. ✓ VERIFIED: `src/sim/HeadlessContractSim.ts` constructs `BuildSystem` with `this.prospector.position,` as its placement origin, and `src/systems/BuildSystem.ts:943-944` gates placement on `distanceSq <= placeRadius * placeRadius` against that origin (`placeRadius(id)` resolved at `src/systems/BuildSystem.ts:1668-1673`).
- **F-ER02-11 (P0)**: THE VIEW never publishes that body.

So a rider is told to place works within a radius of a point THE VIEW never gives it. That is the whole finding, and it is worse than "a missing field": the data **exists, is computed, and is thrown away**.

✓ VERIFIED mechanism — the position is produced and then dropped:

1. `src/agent/Embodiment.ts` — `ProspectorEmbodimentSnapshot` carries `position: ProspectorPoint & { y: number }` and `target: ProspectorPoint`, and the `snapshot` getter fills both with `round3(...)` values.
2. BOTH doors publish that snapshot into diagnostics: `embodiment: this.prospector.snapshot,` appears exactly once in `src/sim/HeadlessContractSim.ts` (headless) and exactly once in `src/game/Game.ts` (browser), each under the `agent` key.
3. `src/agent/View.ts` receives it and reads it **three** times — `const embodiment = record(agent.embodiment);` occurs 3× — and those three sites read only `embodiment.orders` / `embodiment.standingOrders`, `embodiment.needsRider`, and `embodiment.surprises`. **No site reads `embodiment.position`.**
4. Meanwhile the `now` builder publishes the HERO's position instead: `const hero = point(diagnostics.heroPos);` feeds `hero: { hp: number; maxHp: number; x: number; z: number };` in the `AgentView['now']` type.

Because both doors already supply the data, **one cure in `src/agent/View.ts` fixes the browser and the headless surface at once.** No adapter needs a new field.

## Scope

1. **Add `prospector` to the `AgentView['now']` type** in `src/agent/View.ts`, as `{ x: number; z: number } | null`. Place it adjacent to the existing `hero` field. Do not alter, reorder or rename `hero` — it is a different body and consumers depend on it.

2. **Populate it in the `now` builder** from the embodiment the adapter already supplies: read the `agent` record's `embodiment.position`, and publish `x`/`z` rounded with the SAME `round()` helper the `hero` field uses, so the two bodies are directly comparable at the same precision. Do not publish `y`, `terrainY` or `clearance` — this task publishes a planar position, and the sim is planar (CLAUDE.md §4.6).

3. **Degrade to `null`, never throw, when the embodiment is absent or malformed.** `View.ts` serves more than one adapter and `record()` returns `{}` for a missing key. If `position` is missing or either coordinate is not a finite number, publish `null`. A rider reading `null` learns "this door has no Prospector", which is true and useful; a crash in the view builder would take down every consumer.

4. **Assert it in `e2e/agent-view.spec.ts`.** Add ONE new test that proves the published `now.prospector` equals the Prospector position the same turn's embodiment reports — i.e. that the field tracks the real body rather than being a constant or a copy of `hero`. The test must make the `hero`-vs-`prospector` distinction observable: assert both are present and state in the test name that they are different bodies. Choose browser-side or node-side within that file, whichever you can make deterministic, and **say which you chose and why in your report**.

5. **Report, do not fix, anything you find outside the firewall.** In particular: if a pinned hash in `docs/bench/e2-readiness-census.md` moves, that is a FINDING with before/after numbers — see the self-check.

**NOT in scope, deliberately — do not fold these in:**
- Publishing `placeRadius` or build-zone coordinates in the manifest. That is **F-ER02-16**, a separate finding with a separate cure surface.
- Giving the headless Prospector or hero the ability to MOVE. That is **F-1499-2**, an OWNER design fork ("does a headless rider get a body?"), and a fire may not choose it.
- Any balance value, any order-protocol change (F-ER02-1/2/3 are live work in another lane this hour).

## Firewall

Touch ONLY: `src/agent/View.ts`, `e2e/agent-view.spec.ts`.

NO changes to: `scripts/gr-sim.mjs` (**a live lane task holds this file right now — f1525-1**) · `src/sim/HeadlessContractSim.ts` · `src/game/Game.ts` · `src/agent/Embodiment.ts` · `src/systems/BuildSystem.ts` · any `Balance` value · any EXISTING assertion in `e2e/agent-view.spec.ts` (you add a test; you do not edit the four that are there) · any other file under `src/`, `scripts/`, `e2e/`, `tasks/`, `specs/`, `reviews/`.

If you believe a file outside this list must change, **STOP and report it** — do not stretch the firewall.

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)

The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.**

Then `git -C worktrees/lane-b status --short` → must be clean, with the **FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

**CITATION CHECK — run all four before writing code. Each must return the stated count:**

```
grep -c "const hero = point(diagnostics.heroPos);" src/agent/View.ts            # expect 1
grep -c "hero: { hp: number; maxHp: number; x: number; z: number };" src/agent/View.ts   # expect 1
grep -c "const embodiment = record(agent.embodiment);" src/agent/View.ts        # expect 3
grep -c "embodiment: this.prospector.snapshot," src/sim/HeadlessContractSim.ts  # expect 1
```

**If any returns a different count, STOP and report which one and what it returned — the lane drifted after dispatch, or the premise changed on main. Do not "fix" it by editing the citation, and do not proceed on a premise you could not confirm.**

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` → 0 errors.
- `npm run build` → green; report the module count.
- `e2e/agent-view.spec.ts` green on **desktop-chrome AND mobile-chrome**, `--workers=1` on both (F-1270-1: a fire-shell red at default workers is not evidence). Report pass counts per project. **The expected count is the current 4 tests + your 1 = 5 per project** — if you see any other number, say so explicitly rather than rounding it off.
- Adjacent, unmodified-green, both projects, `--workers=1`: `e2e/agent-seat.spec.ts` · `e2e/m4-10-agent-actions-integrity.spec.ts` · `e2e/er01-e2-census.spec.ts`. The census suite is the one most likely to notice a VIEW change — report its result explicitly.
- `npm run test:node-guards` → report the result. ⚠️ This battery contains a **pinned `gr-sim` Baron test** (`scripts/gr-sim.test.mjs`). **If it moves, that is a FINDING — report before/after numbers. DO NOT re-pin it** (F-1441-3 and the comment at the pin site forbid re-pinning to make a red go away). This task adds a read-only field to a view and has no business changing sim behaviour; a moved pin means the change leaked.
- **Hash watch:** `docs/bench/e2-readiness-census.md` pins `eventLogHash` values for the E2 contracts. Adding a VIEW field should not touch the event log. Confirm from the census suite's own output whether any hash moved; **if one did, that is a FINDING to report, not a file to edit** — the census doc is outside your firewall.
- Zero console/page errors in every run.
- `git diff --name-only` at the end must list exactly the two firewalled files. Paste it.

**No-op guard:** if you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

End your report with **READY-FOR-GATES** plus: the four citation-check counts · which side (browser or node) you put the new test on and why · the pass counts for `agent-view` per project and the three adjacent suites · the `test:node-guards` result **including whether the Baron pin moved** · whether any census hash moved · the `git diff --name-only` output proving the firewall held · and any finding you are reporting rather than fixing.

# Task lane-town-plaza-slot-diagnostics: THE PLAZA PUBLISHES A TRAIL COUNT BUT NOT THE TRAIL — `stamp-mill`'s APPROACH EXISTS IN SOURCE AND REACHES NO RUNTIME CONSUMER
**FIRE-AUTHORED (attended review welcome) — s1108, 2026-07-27. This is the NAMED LIFT that rf-37 STOPped for. It is a prerequisite slice, not a replacement: `tasks/lane-approach-steer-to-arrival.md` is re-queued UNCHANGED once this merges.**

**READ THIS FIRST — THIS IS AN ADDITIVE DIAGNOSTICS PUBLISH, NOT A LAYOUT CHANGE.** You are not adding a building, not moving a slot, not touching the town's appearance or behaviour. You are exposing data that **already exists and is already correct** through the diagnostics surface that e2e reads. If you find yourself editing `townBuildings`, a plaza slot's coordinates, or any render path, **STOP and report** — that is a different slice.

You are Codex (worktrees/lane-a).

CODEX: model=gpt-5.6-sol effort=medium

> ⚠️ The `CODEX:` line above is at **column 0 on its own line** deliberately (F-1088-4). `scripts/lane-runner-v3.sh:65-66` greps `^CODEX:`, so an inline copy is silently ignored and the run falls back to `effort=medium`.

## WHY (the evidence chain, dated)

**rf-37 (`tasks/lane-approach-steer-to-arrival.md`) ran on lane-a at `20260727-065051` and STOPped at its own firewall — lawfully.** Its report (`tasks/runs/20260727-065051-lane-a-lane-approach-steer-to-arrival.md.log`, tail):

> `TownScene.ts` derives diagnostics from `townBuildings`, whose registry **excludes `stamp-mill`**. Runtime-resolved steering is therefore impossible without forbidden `src/**` work. No E2E files changed; no batteries run.

**s1108 verified that STOP rather than inheriting it, and it stands — but its stated reason is one step off, and the difference is the whole fix:**

1. `stamp-mill` **is not missing from the codebase.** It ships at `src/town/townLayout.ts:100`, inside `townPlazaLayout.slots`, **with both fields the cure needs**:
   ```
   { id: 'stamp-mill', position: { x: 4.8, z: 9 }, approach: { x: 3.45, z: 6.5 } },
   ```
2. It **is** genuinely absent from `townBuildings` (`src/town/townLayout.ts:185+`, six entries: tavern, claim_office, schoolhouse, assay_office, general_store, chapel) — so `TownScene.ts:2064` `buildings: townBuildings.map(...)` cannot see it. **The runner was right about `buildings[]`.**
3. **And the plaza block publishes everything about the slots EXCEPT the slots** — `src/town/TownScene.ts:2075-2080`:
   ```
   plaza: {
     clearRadius: townPlazaLayout.clearRadius,
     gate: townPlazaLayout.gate,
     emptyPlots: townBuildings.length - this.visibleBuildings.length,
     trailCount: townPlazaLayout.slots.length + 1,
   },
   ```
   It derives `trailCount` **from `slots.length`** and then throws the slots away. So the approach coordinate is one property access from the runtime and reaches no consumer.

➡️ **That is why rf-37's site 4 (`e2e/072-era-activation.spec.ts:145` `approachStampMill`) cannot be fixed under its firewall:** rf-37 forbids frozen coordinate literals (the F-1101-2 class) *and* forbids `src/**`, and the only runtime-resolved target for the Stamp Mill does not exist yet. **Publish it and rf-37 becomes executable as written, all nine sites.**

## SCOPE (numbered; each item is testable)

1. **`src/town/TownScene.ts:183`** — extend the `TownDiagnostics` type's `plaza` member with a `slots` array. Keep the four existing members exactly as they are. The element shape is `{ id: string; position: { x: number; z: number }; approach: { x: number; z: number } }`.
2. **`src/town/TownScene.ts:2075-2080`** — publish the slots in the `plaza` object literal, additively:
   ```
   slots: townPlazaLayout.slots.map((slot) => ({ id: slot.id, position: slot.position, approach: slot.approach })),
   ```
   **Leave `clearRadius`, `gate`, `emptyPlots` and `trailCount` untouched** — `trailCount` in particular is asserted elsewhere; do not "simplify" it now that `slots` is present.
3. **Add ONE e2e assertion proving the data reaches the runtime.** Put it in `e2e/town-t1-square.spec.ts` (it already boots the town and reads `__GR_TOWN_DIAGNOSTICS__`; verify that with a read before you add). Assert that `plaza.slots` contains an entry with `id === 'stamp-mill'` whose `approach` is a finite `{x,z}` pair. **Assert the ID and the shape, NOT the literal coordinates** — hardcoding `3.45/6.5` into a spec would create exactly the frozen-literal defect (F-1101-2) that rf-37 exists to stop.
4. **Change no behaviour.** No new building, no plaza geometry edit, no render change, no `townBuildings` edit. If item 1 or 2 does not typecheck without a further change, **STOP and report** rather than widening.

## FIREWALL

**TOUCH-ONLY:** `src/town/TownScene.ts` (the two sites named in SCOPE 1-2 ONLY) · `e2e/town-t1-square.spec.ts` (one added assertion)
**NO:** `src/town/townLayout.ts` (the data is already correct — if you think it is wrong, STOP and report) · `src/vite-env.d.ts` (it references the exported `TownDiagnostics` type at `:941`, so it needs no edit — if you believe it does, STOP and report) · any other `e2e/*.spec.ts` (especially the eight rf-37 touches) · `playwright.config.ts` · `tasks/**` · `STATUS.md` · `reviews/**`

Reporting an adjacent problem is good and welcome. Fixing one outside TOUCH-ONLY is a violation.

## PRE-FLIGHT — verify by CONTENT, and run the premise checks AFTER the reset

1. `git log --oneline main..lane/m3` → **must be EMPTY.** s1108 measured `lane/m3` **0 ahead of main** (64 behind). **Any** commit means undrained work: **STOP and report** (LANE-SAFETY LAW — a pre-flight `reset --hard` over unmerged output is how w1-03 and polish-02 were destroyed).
2. Start from fresh main: `git checkout -B lane/m3 main`.
3. **NOW, and only now, the premise checks** — a stale lane answers for its own tree, not for main (F-1090-2):
   - `grep -n "id: 'stamp-mill'" src/town/townLayout.ts` → **must print exactly one hit (`:100`).** If 0, the slot moved: **STOP and report.**
   - `grep -n "trailCount: townPlazaLayout.slots.length" src/town/TownScene.ts` → **must print one hit (`:2079`).** If 0, the plaza block has been rewritten since s1108 measured it: **STOP and report.**
   - `grep -c "slots:" src/town/TownScene.ts` → if this already publishes plaza slots, someone shipped it first: **STOP and report.**

## SELF-CHECK (report COLLECTED COUNT beside pass count — F-1104-5)

Every path below was `ls`-verified by s1108 at authoring time. A positional arg that matches **no** file contributes **zero tests without failing**, so a battery that only says "passed" is unauditable — **report `<passed>/<collected>` for each command.**

```
npx tsc --noEmit
npm run build
npx playwright test e2e/town-t1-square.spec.ts e2e/town-t2-naming.spec.ts e2e/072-era-activation.spec.ts --project=desktop-chrome --workers=1 --reporter=line
npx playwright test e2e/town-t1-square.spec.ts e2e/town-t2-naming.spec.ts e2e/072-era-activation.spec.ts --project=mobile-chrome --workers=1 --reporter=line
```

- **Expected collected count is non-zero on BOTH projects.** If any file collects 0, say so loudly — that is the F-1094-1 silent-zero class, and it means the run proved nothing.
- **Print the published value once** (e.g. `node -e` against the boot probe, or a `console.log` in the added assertion's failure message) so the review carries the actual `stamp-mill` approach pair as evidence rather than a claim.
- ⚠️ **Check for concurrent batteries before running a wide one.** If another lane's Playwright run is live, say so and wait — the runner will still be here (Mistake #12).
- Zero console/page errors in the town boot probe, desktop **and** 390px mobile.
- Screenshots the specs already emit are sufficient; no new artifact paths required.

READY-FOR-GATES + report: the published `stamp-mill` slot entry, the `<passed>/<collected>` for all four commands, and confirmation that `trailCount` still reads `slots.length + 1`.

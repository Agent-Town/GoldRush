# lane-m2-01-fixture-coordinate — make the draw-call guard actually test the draw-call budget

> ⛔ **SHIPPED — DO NOT QUEUE (retired s1115, 2026-07-27).** On main as drain **`df51d877`** (runner `64b0970d`, which is NOT itself on main — tip-graft): "the draw-call guard now actually tests the draw-call budget". ✓ VERIFIED: the draw-call assertion is live at `e2e/m2-01-build-menu.spec.ts:340`. Invisible to filename greps because drain messages drop the `lane-` prefix — see **F-1115-1**.


**FIRE-AUTHORED (attended review welcome)** — s1029, 2026-07-25
**Role:** e2e fixture repair. **Workdir:** `worktrees/lane-a` (lane branch `lane/m3`).

## READ FIRST (paths, not memory)
- `e2e/m2-01-build-menu.spec.ts` — the guard: test at **:322**, helper `placeSelected` at **:83-84**, fixture rows at **:330-335**.
- `reviews/m1-m2-resource-guards.md` — finding **F-1029-2**, which this task closes.
- `tasks/lane-m1-m2-resource-guards.md` — the predecessor; its M2 half was an authorized diagnose-only return.

## WHY (evidence, quoted and dated)
The s1029 drain proved this guard has been **vacuously red — it has never once tested its own
budget.** Verified by the draining fire at file:line, not inferred from a report:

> `m2-01:322` does not fail on the draw-call number. It times out inside `placeSelected`
> (`e2e/m2-01-build-menu.spec.ts:84`), polling
> `window.__THREE_GAME_DIAGNOSTICS__.build.ghostValid` for 5000ms and receiving `false`.
> The assertion at line 338 is **unreachable.**

Codex's diagnosis in the predecessor run (2026-07-25, run log
`tasks/runs/20260725-113439-lane-a-lane-m1-m2-resource-guards.md.log`), verbatim:

> "Its first palisade target at `(-6, 16)` is inside the working-camp collision footprint, so
> `ghostValid` remains false on both projects. Moving only the resource-stress fixture to valid
> terrain at `z=20` produced 184 desktop and 131 mobile calls for six beacons plus twelve
> palisades, below the unchanged 200-call ceiling."

**So the ceiling HOLDS at 184/131 — the fixture is what is wrong.** The predecessor correctly
refused to touch it: test-coordinate edits sat outside its firewall. They are inside yours.

## SCOPE (numbered, each testable)
1. **Reproduce and NAME the failing placement.** Run `m2-01:322` on both projects and determine
   which `placeBuildableAt` call is the one whose `ghostValid` never goes true — report the exact
   `(x, z)` and which row (beacons `z=10` or palisades `z=16`). Do **not** assume it is
   `(-6, 16)`; confirm it. If it is a different coordinate than the predecessor reported, say so
   plainly — that is a finding, not a failure.
2. **Move only the stress fixture onto valid terrain.** Adjust the offending row's coordinates
   (the predecessor measured `z=20` as valid) so every placement in the loop reaches
   `ghostValid === true`. Keep the same *shape* of the fixture: **six beacons and twelve
   palisades**, so the guard still stresses what it was written to stress.
3. **Prove the assertion now executes.** The test must actually reach line 338 and evaluate
   `renderer.calls`. Report the **real measured call count for both projects.**
4. **Do NOT touch the 200 ceiling.** A budget edited to fit the measurement is not a guard. If
   the honest number comes in **above** 200, that is a REAL finding: stop, leave the ceiling at
   200, and report the number with what you saw — a genuine draw-call regression is worth more
   than a green test.
5. Add a one-line comment above the row explaining why the coordinate matters (it sits clear of
   the working-camp collision footprint), so the next person does not "tidy" it back.

## FIREWALL
**TOUCH-ONLY:** `e2e/m2-01-build-menu.spec.ts`.
**NO:** any `src/` file · collision or placement semantics · the 200-call ceiling · any other
spec · `Balance.ts` · the `m1-01` guard (it is green and its numbers are load-bearing).

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)
The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/m3 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

**Pre-proved for you (s1029, so you need not spend budget on it):** `lane/m3`'s tip
`d93b1505` is the resource-guards slice, and s1029 merged its only file
(`src/game/Game.ts`) to main path-scoped in this same drain. It is therefore a **SAFE DUPE** —
confirm with `git diff main lane/m3 -- src e2e` (expect no lane-unique additions) and proceed.

## No-op guard
If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

## Self-check (evidence, not vibes)
`npx tsc --noEmit` + `npm run build` green. `e2e/m2-01-build-menu.spec.ts` **green desktop +
mobile at `--workers=1`** — all 14 tests, with `:322` reaching and passing its real assertion.
Adjacent unmodified-green both projects at `--workers=1`: `e2e/m1-01-claim-jumpers-death.spec.ts`
(its `:96` stress test shares this pattern) and `e2e/m2-05-base-damage-repair.spec.ts` (note:
its `:319` is a KNOWN pre-existing red, F-1029-1 — leave it alone and do not count it against
you). Zero console/page errors. Report the measured draw-call numbers for both projects in a
small table.

End: **READY-FOR-GATES** + report: which coordinate was invalid, what you moved it to, and the
real measured draw-call count per project against the untouched 200 ceiling.

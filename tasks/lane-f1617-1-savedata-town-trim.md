# Task f1617-1: re-land f1615-1 WITH the saveData trim — the prefetch wins, but not on a metered connection (LANE-C, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s1617, from F-1617-4 + F-1617-5 in `reviews/f1615-1-prefetch-wins-mount-laziness.md`.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c.

READ FIRST: AGENTS.md; `reviews/f1615-1-prefetch-wins-mount-laziness.md` (the whole finding — the measurement, the
causal chain, and why the failing assertion is NOT stale); `src/town/TownTavernPilot.ts` (`townPrefetchUrls()`);
`src/assets/AdvanceStream.ts` (line 30 imports `townPrefetchUrls`; the saveData narrowing lets the town target
through); `e2e/advance-stream.spec.ts` (the `saveData keeps tier one and skips bulk contract maps` test — read all
four prefetch assertions and note three of them pass today and must KEEP passing).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits.
For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE →
`git checkout -B lane/c main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT
on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make.
EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`,
and any `.png` — are NEVER "work" and NEVER a STOP. Discard them and PROCEED, listing what you discarded. Then
`npm install --no-audit --no-fund`; `npm run build` green before touching anything. THEN A CLEANLINESS LINE:
`git -C worktrees/lane-c status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a
STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What
still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (measured s1617, both arms, not inherited)

f1615-1 (`lane/a`, tip `914a7e93b`) removes the `stamp-mill`/`dynamo_hall` exclusion from `townPrefetchUrls()` under
the owner's branch-(a) ruling and re-scopes ten `town-*-blender` specs from request-laziness to mount-laziness. All
correct — **except on a metered connection.** `AdvanceStream.ts:219` narrows prefetch to `priority === 1` targets
when `saveDataEnabled()`, and **town is priority-1**, so the two newly-included bulk era-2 GLBs ride straight
through the saveData filter.

| Arm, same shell, `--workers=1`, detached worktree | `e2e/advance-stream.spec.ts` |
|---|---|
| main **without** f1615-1 | **10/10 passed** (32.2 s) |
| main **with** f1615-1 merged | **8 passed / 2 failed** (36.4 s) |

Both failures are the same test on both projects, at `advance-stream.spec.ts:69`, `Expected false · Received true`.
Deterministic, not bimodal. **The assertion is not stale**: its three siblings still pass (no bulk contract
terrain/panorama; tier-one town still warmed; under 20 GLBs). `saveData` is the user's browser asking to conserve
data on a metered connection — deleting that line would spend a stranger's data to fix a desktop prefetch leak.

**Why a RE-LAND and not a patch on lane-a (F-1617-5):** `lane/a` HOLDS f1615-1 undrained, so `lane-usable` reports
**HOLDS**, and the runner's own F-1522-1 dispatch guard (`scripts/lane-runner-v3.sh:96-158`) **refuses to dispatch
any master into a lane holding unabsorbed paths**. f1615-1 cannot merge until this cure lands, and this cure could
not be dispatched to the lane holding it — a genuine deadlock. The house cure is Mistake #15: **RE-LAND on fresh
main with the old branch as salvage-ref.** `lane/a` is that salvage-ref and **must be left untouched**.

## Scope

1. **Re-land f1615-1's functional surface from the salvage-ref, verbatim.** Take the eleven files exactly as they
   stand on `lane/a` — do NOT re-derive them by hand:
   `git checkout lane/a -- src/town/TownTavernPilot.ts e2e/town-assay-office-blender.spec.ts e2e/town-chapel-blender.spec.ts e2e/town-claim-office-blender.spec.ts e2e/town-dynamo-hall-blender.spec.ts e2e/town-general-store-blender.spec.ts e2e/town-plate-blender.spec.ts e2e/town-plaza-props-blender.spec.ts e2e/town-schoolhouse-blender.spec.ts e2e/town-stamp-mill-blender.spec.ts e2e/town-tavern-blender.spec.ts`
   Then verify you got them: `git diff --stat` should show **11 files, +28/-68**, and
   `grep -c "id !== 'stamp-mill'" src/town/TownTavernPilot.ts` → **0**. If either disagrees, **STOP and report the
   numbers** — do not proceed on a partial salvage. Do NOT take `lane/a`'s `.png`/`artifacts/**` evidence; you will
   regenerate your own.
2. **Then add the trim: exclude the two bulk halls under saveData ONLY.** Normal connections keep f1615-1's full
   set, unchanged. Implement it where it reads honestly — either `townPrefetchUrls()` taking an explicit option
   (e.g. `townPrefetchUrls({ saveData })`, defaulting to today's full set) with `AdvanceStream` passing
   `saveDataEnabled()`, or `AdvanceStream` trimming the town target when saveData is on. **Pick ONE and say which
   and why.** Do not reintroduce a hardcoded id filter on the normal path.
3. **The saveData test goes green UNMODIFIED.** `e2e/advance-stream.spec.ts` is the CONTRACT — do NOT edit,
   re-scope, or rename it. If you believe it cannot be satisfied without editing it, **STOP and report why** rather
   than changing the assertion (generator proposes, contract disposes — CLAUDE.md Mistake #14).
4. **A test that would have caught this.** Add one assertion (in a spec you are already touching, not a new file if
   an existing one fits) proving the *positive* direction: on a **normal** connection the two halls ARE prefetched.
   Today only the negative direction is guarded, which is exactly how a change in this direction reached a gate.

## Firewall

Touch ONLY: the eleven files listed in scope 1, plus `src/assets/AdvanceStream.ts`, plus ONE existing e2e spec for
scope 4's assertion.
NO changes to: `e2e/advance-stream.spec.ts` (the contract — scope 3); `AdvanceStream`'s priority model or
contract-map logic; anything under `src/sim/`, `src/systems/`, `src/entities/`; other tasks' fresh work.
**Never check out, reset, amend or delete `lane/a` — it is the salvage-ref for `914a7e93b` and the only copy of that
work outside git's reflog.** Reading from it (scope 1) is expected; writing to it is forbidden.
If you find yourself about to exit without changes, WRITE WHY into your report first.

## Self-check (evidence, not vibes)

`npx tsc --noEmit` + `npm run build` green. Then, all at `--workers=1`:
- `e2e/advance-stream.spec.ts` **10/10, both projects, UNMODIFIED** — paste the list output. **This is the gate**, and
  it is the exact suite that reads 8/10 without your trim, so a green here is the whole point of the task.
- Your scope-4 assertion green, both projects.
- The ten `e2e/town-*-blender.spec.ts` green, both projects — f1615-1's re-scopes must survive the trim. Report the
  tally; if any of the six known bimodal p95 frame-time reds appear, **name them** rather than re-running until green.
- Paste `git status --short` after the runs (F-1616-2 discipline: no tracked `reviews/*.md` may be rewritten).

End: READY-FOR-GATES + report: the scope-1 salvage verification (`11 files, +28/-68`) · which trim shape you chose
and why · the saveData test's 10/10 · proof the normal path still prefetches both halls · the blender tally · and
confirmation that you never wrote to `lane/a`.

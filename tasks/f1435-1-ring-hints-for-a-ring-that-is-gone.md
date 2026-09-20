# f1435-1 — the legacy restore path stops resurrecting a ring that no longer exists (F-1433-3)

**FIRE-AUTHORED (attended review welcome)** — s1435, 2026-08-03. Corrective for a non-blocking finding of the
F-BW-6 drain (`865a7b19`), filed by s1433 and **re-verified against live main by s1435 before authoring**.

**Role:** Codex, lane runner. **Workdir:** `worktrees/lane-c` (branch `lane/e2-arsenal`).

---

## 🚨 DISPATCH PRE-CONDITION — THIS TASK REQUIRES A REFRESHED LANE. DO NOT `cp` IT ONTO A STALE lane-c.

The correctness of this fix **depends on the F-BW-6 kit merge `865a7b19` being present in the lane**. Before the
kit merge, Territory I really did spawn a palisade ring, so `territoryRingPresent` computing `true` was *correct*.
After it, `src/game/Game.ts` only ever assigns the flag `false` and no ring is ever built — which is what makes
the legacy restore default wrong. **On a lane that lacks `865a7b19`, this task would be reasoning against a tree
where the ring still exists, and the "fix" would be a regression.**

A `refresh-lane lane-c` request was filed by s1435 in the same commit as this master. **Before dispatching:**

```
git -C worktrees/lane-c merge-base --is-ancestor 865a7b19c8991d535801ea6cdede2bc0fc73b950 HEAD
```

Exit 0 = the kit merge is in the lane, dispatch is lawful. **Exit 1 = STOP, the refresh has not landed yet** —
leave the task where it is and re-check next fire. (F-1320-2; and the subject-absent STOP class that has already
cost 26,940 + 44,007 + 74,724 tokens across s1298/s1424/s1432.)

## READ FIRST

- `src/game/RunSuspend.ts` — the function `restoreControls`, specifically its `controls ?? { … }` fallback object.
- `src/game/Game.ts` — the declaration `private territoryRingPresent = false;`, its reset assignment, and its
  single consumer, the `if (this.territoryRingPresent) {` block that emits `territory_ring_gap` world-info hints.
- `reviews/lane-territory-ring-to-kit.md` — finding **F-1433-3**, and the s1435 addendum recording the merge.
- `e2e/run-suspend.spec.ts` and `e2e/restore-validation.spec.ts` — the existing restore suites you will extend.

## WHY (the evidence, quoted and dated)

`reviews/lane-territory-ring-to-kit.md`, F-1433-3 (s1433, 2026-08-03):

> Game.ts now only ever assigns it `false`, but `RunSuspend.ts:962` still computes it as
> `meta.tracks.territory >= territoryTier1` on the **legacy no-`controls` restore** path … then renders
> `territory_ring_gap` world-info hints for a ring that no longer exists.

s1435 re-verified this on live main **after** the kit merge, by reading the code rather than trusting the finding:
`restoreControls(game, controls, meta)` builds its fallback with
`territoryRingPresent: meta.tracks.territory >= Balance.meta.territoryTier1` and then assigns
`game.territoryRingPresent = restored.territoryRingPresent`. So any save **lacking a controls block**, restored by
a player whose meta has reached Territory I, turns the flag on — and the hint renderer draws gap markers around a
ring the kit design never builds.

**Narrow, and say so honestly:** current builds always write a controls block, so this is reachable only for older
saves. It produces stale hint markers, not a crash. It is worth fixing because a flag that can only ever be wrong
is worse than no flag.

## SCOPE (numbered, each item testable)

1. In `restoreControls`, change the legacy fallback so `territoryRingPresent` is **`false`**, matching the only
   value `Game.ts` itself ever assigns. Do not touch the `controls`-present path (`:738` / `:2567` round-trip),
   which correctly persists and restores whatever the game recorded.
2. Leave a one-line comment at the changed line naming F-1433-3 and the kit merge `865a7b19`, so a future reader
   knows the T1 track no longer implies a ring.
3. Extend `e2e/run-suspend.spec.ts` with a test that restores a save **with no `controls` block** for a profile
   whose meta has reached Territory I, and asserts the restored game reports `territoryRingPresent === false` and
   renders **zero** `territory_ring_gap` world-info hints.
4. **THE ACCEPTANCE IS A MANUFACTURED RED, NOT A GREEN.** Before you finish, temporarily restore the old
   expression in the fallback and confirm the new test **fails**; then revert and confirm it passes and the file
   is byte-identical to your fixed version. Report both results with the test name and line. A test that passes
   without ever executing its violation path proves nothing (s1299/s1300/s1428/s1435 house standard).

## TOUCH-ONLY

- `src/game/RunSuspend.ts`
- `e2e/run-suspend.spec.ts`

## NO — do not touch, even if it looks wrong

- `src/game/Game.ts` — including the `prebuiltPalisades` flag. **That is F-1433-2, a SEPARATE finding with an
  owner-adjacent history** (it encodes the owner's July "prebuilt palisades are a gold tax via auto-repair"
  ruling). Removing or rewiring it is explicitly out of scope here. Report it, do not fix it.
- The `controls`-present restore path, the validation reasons at `:2530`/`:2549`, or the `ControlsSuspend` type.
- Any economy / palisade-kit code — `865a7b19` just shipped it and it is gated.
- Any test file other than `e2e/run-suspend.spec.ts`.

## SELF-CHECK before you report

- `npx tsc --noEmit` clean.
- `npm run build` green.
- `npx playwright test e2e/run-suspend.spec.ts --workers=1` — **both projects**, and name the pass/fail counts.
- `npx playwright test e2e/restore-validation.spec.ts --workers=1` — **both projects** (adjacent: same restore
  surface). ⚠️ **Known pre-existing reds on clean main, measured by s1435 — do NOT chase them:**
  `restore-validation:656` (both projects) and `run-suspend:193` **desktop**. `run-suspend:193` **mobile** is a
  documented GLTF texture-blob flake (fails at the `expect(errors.consoleErrors).toEqual([])` line while the
  economy assertions above it pass; passes on re-run). If you see a red, say whether it is one of these.
- Zero console/page errors in the new test.
- Report the manufactured-red result from scope item 4 explicitly.

**READY-FOR-GATES** — report: the two files changed, the new test name + line, the manufactured-red evidence
(both directions), all four suite results with counts, and anything you noticed but did not touch.

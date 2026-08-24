# bt-04b-automation-two-params — the landing drain (s2269)

**Slice:** `bt-04b-automation-two-params` + `f2265-2-bt04b-mobile-spec-determinism` (+ `f2268-1` PNG churn)
**Branch:** `lane/a` · **base:** `755c30ace` (main at lock time) · **tip gated:** `926008be4`
**Merge:** `fa00605bac5e165adae3c6ce3210ccd5128ab659`
**Gate worktree:** `.gate-s2269` (detached, §3.0b) · fire shell · `--workers=1` (§3.1)

## VERDICT: MERGE

s2265 held this slice, s2266 re-diagnosed it, s2267 died holding it, s2268 gated it and held again on a
**second** flake instance one test over. This fire discharged the condition s2268 itself set: *"gate the
stack yourself in a fire-shell detached worktree and run the mobile project at least 5×. If it comes back
clean: MERGE IT."* It came back clean 5/5.

## What it does

Two automation tunables (repair boundary, idle boundary) become live parameters the running sim reads on
the next tick rather than at construction. They survive suspend/restore, and old saves receive defaults
instead of `undefined`. The Prospector panel exposes them as operable controls **in a plain boot** — no
`?debug` — which is the Mistake #10 requirement, and `e2e/bt-04b-automation.spec.ts` asserts exactly that.

## Evidence (real numbers, this fire)

| Gate | Result |
|---|---|
| Merge into detached worktree | clean, three-way `ort`, **zero conflicts**, 8 files +220/−10 |
| `npx tsc --noEmit` | **rc=0**, no output |
| `npm run build` | **rc=0**, `✓ built in 2.85s`, asset-diet within ceiling |
| mobile-chrome full file ×5 | **3/3, 3/3, 3/3, 3/3, 3/3** (11.5s · 16.2s · 15.5s · 10.7s · 12.6s) |
| desktop-chrome full file | **3/3** (22.5s) |
| `test:node-guards` (main leg, merged tree) | 540 tests · **532 pass · 3 fail · 5 skipped** · 500.5s |

### The three node-guards reds, each attributed — none belongs to this slice

1. **`law-pointer-guard` — CAUSED BY THIS MERGE, AND CURED IN THE DRAIN COMMIT.** The merge shifts
   `src/game/Game.ts` by one line, so `scripts/fire.md`'s `2477–2478` citation of the
   `placeBuilding`/`panAt` members rots to `2478–2479`. This is the act F-2266-3 pre-registered as owed
   *to the landing drain*; s2268 correctly declined it because it did not merge. Re-based + `--update`
   run; the guard now reads **PASS — every law-surface pointer still lands on the line it was written for.**
2. **`blocker-panel-closed-guard` first test — PRE-EXISTING ON MAIN, NOT MINE.** Control run on unmerged
   `main`: **byte-identical failure**, same census (`panel rows 7 · rows with an F-ID 7 · census closed 176
   · closed-on-panel 0`), same `0 !== 1`. Filed as **F-2269-1** below.
3. **`fixture-teardown` — NOT AN INDEPENDENT RED.** It spawns each guard file as a child and reports the
   child's status; its message names `scripts/blocker-panel-closed-guard.test.mjs child failed` and quotes
   red #2 verbatim. One root cause, two lines in the summary.

### A measurement honesty note on the flake

The combined record for `plain boot exposes operable automation controls` on mobile is now **1 failure in
20 full-file runs (5%)**: s2268's 1-in-5, the implementer's 10 clean, and my 5 clean. **I did not match
the failure's load condition** — s2268's failure landed at loadavg **13.51**, my five runs at **8.89**. So
s2268's live hypothesis (*"reachable only under the constrained fire-shell context"*) is **not refuted by
this fire; it is un-probed at its own parameterisation.** What is discharged is the merge condition, not
the mechanism. Carried forward as a known flake, per §7.5's prohibition on an identical third retry.

## Merge classification

Base `755c30ace`; all eight paths **LANE-TOUCHED only** — `git merge` reported zero conflicts and main
moved none of them during the gate window. `src/game/Balance.ts` is the additive-hunk case the
disjoint-pair rule already excepts (+4, no existing key redefined).

`e2e/bt-04b-automation.spec.ts` · `src/agent/AgentConsent.ts` · `src/game/Balance.ts` · `src/game/Game.ts`
· `src/game/RunSuspend.ts` · `src/ui/ProspectorPanel.ts` · `reviews/shots-bt04b/{desktop,mobile}-chrome.png`

## Findings

- **F-2269-1 (non-blocking, pre-existing, NOT owner-gated).** `scripts/blocker-panel-closed-guard.test.mjs`'s
  first arm — *"reds on the pre-strike ledger that manufactured the owner directive, greens on the struck
  one"* — **no longer reds on its own manufactured defect**: it constructs a pre-strike ledger, expects the
  guard to refuse, and gets `blocker-panel-closed-guard: PASS` (`0 !== 1`). Its five sibling arms are green.
  This is the exact class this factory has spent twenty fires curing: **a control whose defect arm no longer
  constructs its defect looks identical to a guard with teeth.** Proven pre-existing by control on unmerged
  main. Not caused by, and does not bear on, this slice. Corrective owed; not authored this fire.

## Duties discharged by this drain

- F-2266-3 pointer re-base — **done**, `law-pointer-guard` PASS.
- The real `test:node-guards` run s2268 flagged as owed-but-argued — **done**, 500.5s, all three reds named.
- F-2266-2 `SPEC-GONE` citation red — clears by itself now that `e2e/bt-04b-automation.spec.ts` is on main.
- Raw transcript mirrored into git (Retention Law): `artifacts/s2269-bt04b-node-guards.txt`.

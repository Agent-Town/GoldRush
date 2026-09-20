# lane-baron-siege — F-BW-16: the Baron breaks walls or the walls break him

- **Slice:** `lane-baron-siege` (master `tasks/done/20260803-174243-lane-baron-siege.md`)
- **Branch/tip:** `lane/m4` — the slice is commit `30eba6dfe464059d6213ea571bfda089e9ecff50`
- **Base (lane parent):** `30eba6df^` (`lane/m4` is **735 behind** main)
- **Gated in:** detached worktree `worktrees/gate-s1444` at main `f31c1a51` (§3.0b)
- **Drained by:** s1444 fire, 2026-08-04

## VERDICT: MERGE — FULL

⚠️ **PER-COMMIT PATCH, NOT A BRANCH MERGE.** `lane/m4`'s bottom commit `7c4f132f` is the owner-BLOCKED `f1328-1` (`disputed` leaf), so the branch must never be merged at branch level. Only `30eba6df` was cherry-picked (`-n`); the other six ahead-commits were not touched and lane-b stays under DO-NOT-QUEUE.

## What it does

Owner, gate walk 2026-08-03, verbatim: *"I barricaded the north and it got stuck there. It used its rocket twice - once from afar, and I think once more from this position. I would have expected a lot more destruction and difficulty."*

Canon (`lore/characters.md`) gives the Baron *"×4 scale, STRUCTURE-RAMPAGE, sky-rocket volleys"* — the rampage is his identity and barricading him turned it off. Four changes:

1. `src/entities/Enemy.ts` (+9) — in the wrecker pursuit branch, a Baron whose route to the hero is blocked by a palisade **retargets the blocker as its wrecker building** and runs the existing `updateWrecker` melee path. He no longer stands at the wall. The clearance is derived, not hardcoded: `Balance.palisade.avoidancePad + hitRadius - Balance.enemy.touchRadius`.
2. `src/game/Balance.ts` (+4) — a new `baron` block with `blockedVolleyCadenceSeconds: 3.2` and `blockedVolleyTelegraphSeconds: 0.8`. Data-driven, as the master demanded.
3. `src/game/Game.ts` (+25/−6) — `baronBlockingPalisade()` resolves the blocker once per rocket tick and threads it through three call sites: the melee-suppression check now **returns false when a palisade blocks** (so being at a wall no longer silences the rockets), the telegraph and cadence switch to the blocked-state Balance values, and `acquireBaronRocketTarget()` targets the blocking palisade directly.
4. `e2e/f-bw-16-baron-siege.spec.ts` (+139, new) — two tests: *"north barricade makes the Baron melee the blocker and volley the fortification line"* and *"unblocked Baron fight keeps its deterministic baseline"*.

The firewall held: no rocket damage values, no escort roster, no spawn side, no palisade HP.

## Evidence

| Gate | Command | Result |
|---|---|---|
| Typecheck | `npx tsc --noEmit` (gate worktree) | **clean**, no output |
| Battery (6 suites, grep-derived) | run 1, `--workers=1` | 60 passed / **1 failed** (`054-baron-epic.spec.ts:312`, mobile) |
| **Battery, run 2** | identical command, identical tree | **61 passed / 0 failed** |
| Matched control | same 6 suites, **src reverted, new spec kept** so battery load matches | **59 passed / 2 failed** — both failures are the new spec's `:85 expect(wreckState).toBe('swinging')`, i.e. it correctly reds without its fix |
| `054-baron-epic` alone, merged tree | `--workers=1` | **10 passed / 10** |
| `054-baron-epic` alone, clean main | `--workers=1` | **10 passed / 10** |

**The two control reds are the proof the slice works.** On clean main with the new spec present, `f-bw-16-baron-siege.spec.ts:85` fails on both projects asserting `wreckState === 'swinging'` — the Baron does *not* swing at the blocking palisade. With the slice grafted, both pass. That is a manufactured-defect check, not a green read as evidence: the spec's violation path was executed and observed.

Suites were derived **by grep** (`baron|Baron` and `palisade` over `e2e/*.spec.ts`), not from the runner's list: `f-bw-16-baron-siege`, `054-baron-epic`, `055-baron-kill-stop`, `057-baron-rocket-cart`, `e1-baron`, `e2-clarity-and-wreckers`. The master's "22/22 Baron battery green untouched" is satisfied — every pre-existing baron test passed on the merged tree in run 2.

Every playwright invocation passed `--workers=1` (§3.1). The gate worktree ran on the default config's port 5188, `lsof`-verified free, with no lane live (all six queues empty).

## Merge classification

| File | Class | Resolution |
|---|---|---|
| `src/entities/Enemy.ts` | **BOTH-MOVED** (`4473a86c` → `cd190349`) | 3-way auto-merged, no conflict |
| `src/game/Balance.ts` | **BOTH-MOVED** (`8a712cc6` → `ed9c77c2`) | 3-way auto-merged, no conflict |
| `src/game/Game.ts` | **BOTH-MOVED** (`cb38b480` → `10f0001c`) | 3-way auto-merged, no conflict |
| `e2e/f-bw-16-baron-siege.spec.ts` | pure add | clean |

**Zero drift, measured:** graft numstat vs main is `139/0` + `9/0` + `4/0` + `25/6` — **identical to the lane commit's own numstat** on all four paths.

**Main's side verified present, not assumed.** `Game.ts` is the contested file: `lane/m4`'s base is 735 commits behind, and s1444's *own* drain-1 merge had just moved it. Marker probe on the grafted file found `if (__GR_RELEASE_E1__) return false;` and `if (__GR_RELEASE_E1__) return null;` (drain 1, minutes earlier) **and** `baronBlockingPalisade` / `blockedVolleyCadenceSeconds` (this slice) all PRESENT. Line-by-line: **all 220 of main's substantive `Game.ts` additions since the lane base are present in the graft, 0 missing.** All four landed files are **sha256-identical** to the gated tree.

## Findings

- **F-1444-2 🟡 — `054-baron-epic.spec.ts:312` is a NEW, LOAD-SENSITIVE FLAKE, and it is not in `logs/suite-red-inventory.md`.** It failed once (mobile-chrome, `expect(laterGap).toBeGreaterThan(firstGap)`) and then passed in **three** subsequent observations on the same tree, including a byte-identical re-run of the battery that produced it. ⚠️ **The instructive part is how nearly it was misread.** My first control ran `054` **alone** on clean main and passed — which looked like exoneration of main and indictment of the slice, but compared two *different arrangements*: a 6-suite battery against a single suite. The load, not the tree, was the uncontrolled variable. Re-running the control in the **matched** arrangement (same six suites, src reverted, new spec kept so the file count matched) passed too, and re-running the *merged* battery passed. A single red under load, with a passing matched control and a passing re-run, is a flake — but had I stopped after the first mismatched control I would have filed a regression against a slice that does not cause one. **Measure the arrangement you are diagnosing.** There is a plausible mechanism worth watching rather than dismissing: this slice adds a `palisadeRoute` resolution per baron rocket tick and per baron wrecker frame, which is real extra per-frame work, and `:312` is a timing-sensitive distance comparison. If it reds again, that is the first place to look — it should be added to the red inventory with this history if a second sighting occurs.
- **F-1444-3 🟢 — the master asked for "before/after siege probe boards" and no screenshots were produced.** The spec asserts the behavior directly (`wreckState`, volley targeting) and the control run proves it reds without the fix, so the *gate* is satisfied on evidence. But there is no image the owner can look at to judge whether the siege *reads* as ×4 menace on camera, which was the spirit of the owner's complaint (*"I would have expected a lot more destruction and difficulty"*). **Non-blocking, but this is a walk question the next Baron playtest should answer.**
- **F-1444-1 🟡 — no goal leaf** (shared with drain 1 this fire): `drain-block-check` answered **UNKNOWN** on `20260803-174243-lane-baron-siege.md`, rc=0 by default, which is not a clearance (§3.0). Leaf `e1-baron-siege` registered `merged` in the bookkeeping commit. Ninth consecutive fire of goal-leaf debt.

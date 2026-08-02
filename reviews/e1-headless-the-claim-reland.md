# e1-headless-the-claim-reland — RE-LAND of the headless Claim contract sim

**Slice:** `e1-headless-the-claim-reland` (FIRE-AUTHORED s1391) · **Branch:** `lane/e2-arsenal` · **Tip gated:** `66f12233` · **Base:** `f3a50f0b` · **Gated by:** s1392 fire, 2026-08-02

## VERDICT: MERGED — and the gate-side block it was authored to lift is DISCHARGED BY MEASUREMENT, not by argument.

## What it does

Re-lands the headless Claim contract simulation that has sat unmerged on `lane/m4` since s1381, carried on the board as F-1381-4 ("RE-LAND both lane/m4 slices") for eleven fires. It wires `RunManager` into `HeadlessContractSim` so the headless sim posts real `run_started` / `run_secured` / `run_ended` / `hero_died` events through the same manager the browser game uses, instead of the sim's own private `secured`/`dead` booleans. `scripts/gr-sim.test.mjs` grows ~105 lines asserting the driver consumes declared water and posts RunManager secure at wave 10.

This is headless simulation code with **no rendering surface**, so no screenshots are expected — stated here rather than omitted. The three `RunManager.ts` hunks are browser-behaviour-preserving by construction (see the firewall table below), and the four adjacent browser suites confirm it.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc 0** — this is the exact gate F-1381-4 predicted would fail with TS2339 |
| `npm run build` | **rc 0**, built in 1.12s |
| `node --test scripts/gr-sim.test.mjs` (own suite) | **5/5 pass**, 0 fail |
| node-guards battery (38 leaf files) | **228/228 pass**, rc 0 |
| `m3-01-run-scaffold` + `m3-05b-run-ledger` + `m3-05d-unpaid-rush-guard` + `m4-08-agent-attribution` + `m2-05-base-damage-repair`, `--workers=1` | **44/44 pass**, desktop **and** mobile-chrome |
| Staged bytes vs gated tip | all 5 blobs **byte-identical** to `66f12233` |

All gates ran in a **detached worktree** (`gate-s1392`) per §3.0b — the content was undecided at measurement time and never entered main's working tree until the merge decision was made. `--workers=1` throughout (§3.1).

## Merge classification

Base `f3a50f0b`. Main moved **5 files** since that base (`STATUS.md`, `logs/dashboard.html`, `tasks/BACKLOG.md`, `tasks/e1-headless-the-claim-reland.md`, `tasks/goals.json`) — all bookkeeping, **zero overlap** with the slice's 5 source paths. Every slice path is LANE-ONLY. Pure add; no conflicts, no 3-way graft needed.

⚠️ **Note for future readers of the two-dot diff:** `git diff main..lane/e2-arsenal` shows 10 files including `tasks/e1-headless-the-claim-reland.md | 66 ------`. That is **not** a deletion by the lane — it is main-moved content the stale base lacks, the classic phantom-deletion shape. The commit's own `--stat` is the content: 5 files, 154 insertions.

| Path | Class |
|---|---|
| `src/sim/HeadlessContractSim.ts` | LANE-TOUCHED (pure add) |
| `src/game/RunManager.ts` | LANE-TOUCHED (pure add) |
| `scripts/gr-sim.test.mjs` | LANE-TOUCHED (pure add) |
| `assets/contracts/bench-seeds.json` | LANE-TOUCHED (pure add) |
| `env/goldrush-verifiers/README.md` | LANE-TOUCHED (pure add) |

## The two block conditions, measured

`tasks/goals.json` held `e1-headless-the-claim` as `status:"blocked"`, `blockClass:"gate-side"` — a fire-recorded readiness hold, no owner word owed. Its reason gave two conditions. Both are now discharged **by measurement**:

**(1) "any branch-level merge sweeps blocked content into main."** Discharged by construction and verified by ancestry:
- `git merge-base --is-ancestor 7c4f132f 66f12233` → **non-zero: the owner-BLOCKED commit is NOT an ancestor.**
- `git merge-base --is-ancestor cce99524 66f12233` → **non-zero: the salvage-ref itself is NOT an ancestor.**
- The commit touches exactly the 5 declared paths. None of the eight forbidden paths (`e2e/fixtures/e1-mechanics-manifests.json`, `e2e/agent-view.spec.ts`, `e2e/072-era-activation.spec.ts`, `e2e/e1-baron.spec.ts`, `src/town/TownScene.ts`, `src/meta/ContractFamilies.ts`, `src/world/Terrain.ts`, `assets/contracts/epoch-1-frontier/contracts.json`) appears.

The re-land was applied as a **patch**, never as a merge — which is precisely why `lane/m4` stays an untouched salvage-ref for the still-owed sibling.

**(2) "lifting the slice onto clean main fails tsc with TS2339 on `lossCondition`."** Discharged: **tsc rc 0**. The cure is one identifier, exactly as s1391 predicted:

```
git diff cce99524 66f12233 -- <the five paths>
-    const stake = this.manifest.tileParams.stakeMarkers?.find((marker) => marker.lossCondition);
+    const stake = this.manifest.tileParams.stakeMarkers?.find((marker) => marker.heroStart);
```

**That single hunk is the ONLY difference between the salvage-ref and the re-land across all five files.** The translation is shape-for-shape: `ContractStakeMarker` at `src/meta/ContractFamilies.ts:411-416` declares `heroStart: boolean`, in the same position the removed `lossCondition: boolean` held, consumed by the same truthiness predicate. `src/meta/ContractFamilies.ts:1043` carries the validator message "Stake markers use heroStart; lossCondition is no longer accepted", confirming the destination vocabulary.

## Findings

**F-1392-1 🟡 — A DUPLICATE DISPATCH BURNED 41,475 TOKENS AND LEFT A SECOND DONE-MOVE THAT LOOKS LIKE OUTPUT.**
The master was dispatched **twice**: `20260802-140031` (the real run — 129,924 tokens, `READY-FOR-GATES`, produced `66f12233`) and `20260802-140849`, which started **eight minutes later, while the first run's commit already existed on the branch**. Run 2 correctly STOPPED at pre-flight step 2 (`main..HEAD` contains `66f12233 …`) and wrote no repository changes — the master's own Mistake-#2 pre-flight did its job.

But it still produced a **done-move file indistinguishable from real output** (`20260802-140849-e1-headless-the-claim-reland.md`), so triage sees two done-moves for one master. This is the s1391-observed run3d-15b shape repeating (that master also has two logs, the second 37 KB). **The pre-flight is a correct guard against damage, not against dispatch** — nothing prevents the second dispatch, it only prevents it from doing harm, at a cost of 41k tokens each time. Non-blocking for this drain; the real output is unambiguous. Recommend an attended look at why the runner re-dispatched a master whose done-move already existed.

**F-1392-2 🟡 — THE MASTER'S NAMED ADJACENT SUITE WAS THE NARROWEST OF FIVE.**
The master's self-check named exactly one browser suite, `m2-05-base-damage-repair`, as a boot-path control for the `RunManager.ts` hunk. Deriving adjacency by grep instead (`grep -rln "RunManager" src/ e2e/`) surfaces **four** e2e suites that exercise `RunManager` directly and that the master never named: `m3-01-run-scaffold`, `m3-05b-run-ledger`, `m3-05d-unpaid-rush-guard`, `m4-08-agent-attribution`. All four are green here, so nothing was missed — **but they were green by luck of authorship, not by the gate's design.** The `typeof document !== 'undefined'` guard around `RunSuspendController.install()` is exactly the kind of change a run-ledger suite is the right instrument for, and it was outside the declared battery. The adjacent-by-grep law exists for this; recording it so the next fire-authored master widens its own self-check rather than relying on the drain to catch it.

## Bookkeeping

Per §3.0's gate-side clause, this merge is paired with flipping `e1-headless-the-claim` out of `blocked` in the immediately-following commit, recording the evidence above as what satisfied the stated condition. The sibling slice `c876f675` (`e1-claim-geometry-declared`) is **NOT** in this scope and remains owed — it genuinely fails `git apply` at `src/meta/ContractFamilies.ts:1489` and does import blocked content, so the s1381 "re-author against current main" recommendation stands for that half. `lane/m4` remains its untouched salvage-ref.

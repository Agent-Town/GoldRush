# e1-headless-the-claim-reland — RE-LAND the headless-the-claim slice on current main

**FIRE-AUTHORED s1391 (attended review welcome).** Role: Codex runner, lane-c. Workdir: `worktrees/lane-c` (branch `lane/e2-arsenal`).

## READ FIRST

- `reviews/lane-m4-claim-geometry-and-headless.md` — the s1381 gate that produced F-1381-3 and F-1381-4. Read §"Why RE-LAND and not a graft" and the separability list.
- `CLAUDE.md` Mistake #15 (RE-LAND, salvage-ref) and Mistake #2 (never reset over unmerged work).
- Salvage-ref commit: `cce99524` on `lane/m4` — **read-only reference. Do NOT check out, merge, rebase or reset `lane/m4`.** It is the salvage-ref for a second slice that is still owed.

## PRE-FLIGHT (run this exact sequence; STOP on any mismatch and report)

1. `git -C worktrees/lane-c rev-parse --abbrev-ref HEAD` → must print `lane/e2-arsenal`. If not, **STOP**.
2. `git -C worktrees/lane-c log main..HEAD --oneline` → must print **nothing**. If it prints anything, **STOP and report** — the lane may hold undrained work (Mistake #2). Do not reset.
3. `git -C worktrees/lane-c status --short` → expect clean. If tracked source files are dirty, **STOP and report**.
4. `git -C worktrees/lane-c merge-base --is-ancestor 69984c6a HEAD` → must exit **0**. This is the `stakeMarkers.lossCondition` → `heroStart` repo-wide rename (drained s1329). The whole point of this re-land is to land the slice on the *post*-rename vocabulary; if the lane predates it, **STOP and report**.
5. `git -C worktrees/lane-c cat-file -e cce99524` → must exit **0** (the salvage-ref is reachable). If not, **STOP and report**.

## WHY (evidence, quoted and dated — every number below was re-measured by s1391 on 2026-08-02)

`tasks/goals.json` holds `e1-headless-the-claim` as **`status: "blocked"`, `blockClass: "gate-side"`** — a fire-side readiness hold, **not** an owner design fork. Its stated reason gives two conditions, and this master exists to discharge both:

> (1) lane/m4 is founded on the owner-BLOCKED commit 7c4f132f (f1328-1-drill-yard-census-debt), so any branch-level merge or main..lane/m4 diff sweeps blocked content into main. (2) lane/m4 base 46033151 is 270 commits behind main and PREDATES 69984c6a (stakeMarkers.lossCondition -> heroStart, repo-wide, drained s1329); lifting the slice onto clean main fails tsc with TS2339 on lossCondition.

**Condition (1) does not apply to THIS slice.** `reviews/lane-m4-claim-geometry-and-headless.md:36` measured it and s1391 re-verified it: `cce99524` touches **5 files, none of which `7c4f132f` touched**, and none of which `c876f675` touched either. It is textually disjoint from the blocked content in both directions.

**Condition (2) is real, and it is exactly ONE identifier.** s1391 measured both sides:

- `git show cce99524 | git apply --check -` against current main (`32cfc878`) → **applies cleanly**, 270 commits later. The patch itself has not rotted.
- `lossCondition` appears in the `cce99524` versions of the five slice files exactly **once**, in `src/sim/HeadlessContractSim.ts`. The other four files contain it **zero** times.
- Main's own `src/sim/HeadlessContractSim.ts` contains `heroStart` exactly **once** and `lossCondition` **zero** times — i.e. the destination already holds the renamed field in the same place.

The s1381 review's recommendation — *"re-author both masters against current main"* — is correct for the sibling slice `c876f675` (which genuinely fails `git apply` at `src/meta/ContractFamilies.ts:1489` and does import blocked content). **It is over-scoped for this one.** That sibling is NOT in this master's scope and is still owed.

## SCOPE (numbered, each item testable)

1. **Apply the salvage-ref patch.** From `worktrees/lane-c`, apply `cce99524`'s five paths onto current main:
   `assets/contracts/bench-seeds.json` · `env/goldrush-verifiers/README.md` · `scripts/gr-sim.test.mjs` · `src/game/RunManager.ts` · `src/sim/HeadlessContractSim.ts`.
   Use the commit as a **patch**, not a merge (`git show cce99524 | git apply -` or a path-scoped `git checkout cce99524 -- <the five paths>`; either is fine, but **do not** `git merge`, `cherry-pick`, `rebase` or otherwise make `lane/m4` an ancestor). Nothing from `7c4f132f` or `c876f675` may enter the tree — verify with scope item 3.
2. **Translate the one stale identifier.** In `src/sim/HeadlessContractSim.ts`, the applied version references `stakeMarkers.lossCondition`; main renamed that field to `heroStart` at `69984c6a`. Change that single reference to `heroStart`. ⚠️ **Read main's own use of `heroStart` in that same file first and match its shape** — if the rename turns out to be more than a field name (a type change, a different accessor), **STOP and report** rather than inventing an adapter. Do not rename anything else, and do not "tidy" adjacent code.
3. **Prove no blocked content came along.** Report the output of `git diff --name-only main...HEAD` — it must list **exactly the five files above and nothing else**. In particular `e2e/fixtures/e1-mechanics-manifests.json`, `e2e/agent-view.spec.ts`, `e2e/072-era-activation.spec.ts`, `e2e/e1-baron.spec.ts`, `src/town/TownScene.ts`, `src/meta/ContractFamilies.ts`, `src/world/Terrain.ts` and `assets/contracts/epoch-1-frontier/contracts.json` **must NOT appear**. If any does, **STOP and report** — that is the F-1381-3 failure this master exists to avoid.
4. Report the numbers below. **Do not "fix" anything outside items 1–3** — if you find another problem, report it, do not repair it.

## FIREWALL

**TOUCH-ONLY:** `assets/contracts/bench-seeds.json` · `env/goldrush-verifiers/README.md` · `scripts/gr-sim.test.mjs` · `src/game/RunManager.ts` · `src/sim/HeadlessContractSim.ts`.

**NO:** do **not** check out, merge, cherry-pick, rebase, reset or delete `lane/m4` — it is the salvage-ref for the still-owed sibling slice · do **not** bring in `7c4f132f` (owner-BLOCKED) or `c876f675` content in any form · do **not** touch `e2e/fixtures/e1-mechanics-manifests.json`, `e2e/agent-view.spec.ts`, `src/meta/ContractFamilies.ts`, `src/world/Terrain.ts` · do **not** rename any identifier other than the single `lossCondition` reference in scope item 2 · do **not** touch `STATUS.md`, `tasks/BACKLOG.md`, `tasks/goals.json`, `logs/suite-red-inventory.md` or anything under `reviews/` · do **not** reset, rebase or squash `lane/e2-arsenal`.

## SELF-CHECK (run every one, at `--workers=1`, report exact counts — this flag is a correctness requirement of the fire shell, not an optimisation)

1. `npx tsc --noEmit` → rc 0. **This is the gate that F-1381-4 predicted would fail; report it explicitly.**
2. `npm run build` → rc 0.
3. `node --test scripts/gr-sim.test.mjs` → all green; report X/Y. This is the slice's own suite (the patch adds ~105 lines to it).
4. `npm run test:node-guards` → rc 0, report X/Y.
5. `npx playwright test e2e/m2-05-base-damage-repair.spec.ts --workers=1` → expect **14/14** as the boot-path control. (s1391 verified there is **no** headless e2e spec — `ls e2e | grep -i headless` returns nothing — so `scripts/gr-sim.test.mjs` in item 3 is this slice's only direct suite, and m2-05 is here to prove the `RunManager.ts` hunk did not disturb the boot path.)
6. `git diff --name-only main...HEAD` → paste the **full** list (scope item 3).
7. `grep -rn "lossCondition" src/ scripts/ e2e/` → report the count. Expected **0** in the files you touched.

⚠️ **`e2e/night3d-perf.spec.ts:67` is a KNOWN PRE-EXISTING RED on clean main** (F-1390-1; s1391 control-measured ratio **1.6491** on clean main). It is not yours. Do not run it, do not fix it, do not report it as a failure.

This slice is headless simulation code with **no rendering surface**, so no screenshots are expected. Say so in your report rather than omitting it.

Commit path-scoped on `lane/e2-arsenal` with the prefix `e1-headless-reland:`. **Never `git add -A`.**

**READY-FOR-GATES + report:** exact counts for self-checks 1–7; the full `git diff --name-only main...HEAD` list; confirmation that `lane/m4` was never checked out, merged or reset; confirmation that the only identifier changed was the single `lossCondition` → `heroStart` reference; and whether main's `heroStart` shape matched the salvage-ref's use of `lossCondition` one-for-one or needed more (if more — you should have STOPPED).

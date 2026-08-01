# F-1330-1 — the two COUNT-shaped E1 censuses still say 41; the data says 42

**FIRE-AUTHORED s1330 (attended review welcome).**
Role: implementer. Workdir: `worktrees/lane-c` (slot lane-c, branch `lane/e2-arsenal`).

## READ FIRST (paths, in this order)
- `e2e/board-card-images.spec.ts:1-40` — `EPOCHS` is built at `:6` from `listEpochs().map(({ id }) => loadEpoch(id))`, i.e. from the LIVE data, and `:37` asserts the flattened length against a literal.
- `e2e/map-census.spec.ts:25` (`CONTRACTS` built from `listEpochs()/loadEpoch`) and `:63` (the `afterAll` assertion).
- `src/meta/ContractFamilies.ts` — `listEpochs()` / `loadEpoch()`, the source both specs read.
- `tasks/goals.json` leaf `f1328-1-drill-yard-census-debt` — **BLOCKED, and it stays blocked. This task is NOT that task** (see WHY).

## WHY (evidence, dated, measured — not inherited)
`f0bf5251` (`runner(lane-b): lane-drill-yard.md`, 2026-08-01 08:14) added `e1-drill-yard` as E1's 6th contract and the **42nd** overall, per the owner's ratification that morning ("Drill Yard sounds good to me"). Census assertions were not updated with it.

s1330 counted the shipped data directly (every `assets/contracts/epoch-*/contracts.json`):

| epoch | contracts |
|---|---|
| epoch-1-frontier | **6** (`the-claim`, `e1-drill-yard`, `e1-dry-gulch`, `e1-night-shift`, `e1-twin-banks`, `e1-baron`) |
| epochs 2–10 | 4 each |
| **TOTAL** | **42** |

Both remaining sites compare a **live-derived** array against the literal `41`, so both are red by arithmetic — no run needed to know it:

| Site | assertion |
|---|---|
| `e2e/board-card-images.spec.ts:37` | `expect(EPOCHS.flatMap((epoch) => epoch.contracts)).toHaveLength(41)` |
| `e2e/map-census.spec.ts:63` | `expect(CONTRACTS).toHaveLength(41)` |

⚠️ **These two are ALL that remain.** s1330 re-ran the census grep itself rather than inheriting a list — `grep -rn "toHaveLength(41)\|toHaveCount(41)\|toBe(41)\|toEqual(41)\|all 41 \|41 contracts\|41 cards" e2e/ src/ scripts/ specs/` — and the only other live hits are `scripts/law-pointer-baseline.json` (a generated guard baseline, see NO) and `scripts/tmp-s1143-backlog.mjs` (a historical quoted narrative, not an assertion). The id-list-shaped censuses were already cured.

📌 **WHY THIS IS A SEPARATE TASK FROM `f1328-1-drill-yard-census-debt`.** That master's leaf is **blocked** and a fire may not lift it. Its scope was entangled with regenerating `e2e/fixtures/e1-mechanics-manifests.json`, which raises an AP-11 question about the `deriveMechanicsManifest` defect F-1328-4. **This task deliberately touches none of that**: two integer literals, in two files that the blocked work does not touch, curing two reds whatever the owner rules on the fixture. It is the smaller half, carved out so it cannot be held hostage.

## PRE-FLIGHT (LANE-SAFETY invariant)
1. `git -C . status --short` in the lane worktree: dirty tracked blobs must be reachable in git, else **STOP** and report.
2. `git log main..HEAD --oneline` must be **empty**. If it is not, **STOP** — an undrained predecessor lives here and a reset would destroy it.
3. **Premise check, AFTER any reset:** `node -e` count the contracts in `assets/contracts/*/contracts.json`. It must total **42**. If it totals 41, this lane predates `f0bf5251` and the task is **not applicable here — STOP and report the number you got.** (Changing the literal to 42 on a 41-contract tree would manufacture a red.)

## SCOPE (numbered, each testable)
1. `e2e/board-card-images.spec.ts:37` — `toHaveLength(41)` → `toHaveLength(42)`.
2. `e2e/map-census.spec.ts:63` — `toHaveLength(41)` → `toHaveLength(42)`.
3. Nothing else. If you believe a third count-shaped census exists, **report it — do not fix it** (the grep above is the measured denominator; a disagreement is a finding worth more than a silent edit).

## TOUCH-ONLY
- `e2e/board-card-images.spec.ts` (line 37 literal ONLY)
- `e2e/map-census.spec.ts` (line 63 literal ONLY)

## NO (firewall — violations fail the gate)
- **NO** change to `src/meta/ContractFamilies.ts`, `assets/contracts/**`, or anything that alters what contracts exist. The data is correct; the assertions are stale. If you believe the data is wrong, **STOP and report**.
- **NO** touching `e2e/fixtures/e1-mechanics-manifests.json`, `e2e/agent-view.spec.ts`, `e2e/072-era-activation.spec.ts`, `e2e/e1-baron.spec.ts` or `src/town/TownScene.ts`. **Those five are HELD, un-drained, on `lane/m4`** — editing them here manufactures a collision with finished work.
- **NO** touching `scripts/law-pointer-baseline.json`, and **NO** running `node scripts/law-pointer-guard.mjs --update`. ⚠️ That baseline is regenerated from the LIVE ledger, and this lane's ledger is ~37 commits stale — `--update` here would emit a baseline missing every pointer main has added since, and merging it would silently delete them. **The drain re-bases it on main, where the ledger is complete.** (Both lines you are editing are cited pointers; the drift is EXPECTED at merge time and is the drain's job, not yours.)
- **NO** weakening: do not delete either assertion, do not convert to `toBeGreaterThan`. The census is the point.
- **NO** `git add -A`. Path-scoped only.

## SELF-CHECK (run these exact commands, report the numbers)
- `npx tsc --noEmit` — clean.
- `npm run build` — green.
- `npx playwright test e2e/board-card-images.spec.ts --workers=1` — report pass/fail per project. (`--workers=1` is a correctness requirement of the fire/lane gate, not an optimisation.)
- `npx playwright test e2e/map-census.spec.ts --workers=1` — report pass/fail per project. ⓘ This suite is slow (it screenshots every map) and several of its **cells** report `FAIL:` in the written census table without failing a test — that is F-1143-1/2, **pre-existing and out of scope**. What must be green is the `afterAll` length assertion at `:63`. Report the cell failures you see; do not chase them.
- `npm run test:node-guards` — report the count. Expect green **on this lane** (it has no pointer entries for these two lines).
- `grep -rn "toHaveLength(41)\|toHaveCount(41)" e2e/ src/` — must return **zero** hits outside `scripts/`.
- ⚠️ **Report, do not commit, any tracked PNG under `artifacts/` or `reviews/` that your runs modify** (F-1328-3/F-1329-3: gate runs rewrite shipped evidence in place — `map-census` writes a lot of them). Restore with `git checkout --` before committing.

READY-FOR-GATES + report: the contract total your pre-flight measured, per-project pass counts for both suites, the `test:node-guards` count, any `map-census` cell failures observed, and the list of tracked PNGs your runs dirtied and restored.

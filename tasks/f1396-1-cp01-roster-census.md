# F-1396-1 — the ROSTER-shaped E1 census in cp01 still lists five contracts; the data ships six

**FIRE-AUTHORED s1396 (attended review welcome).**
Role: implementer. Workdir: `worktrees/lane-c` (slot lane-c, branch `lane/e2-arsenal`).

## READ FIRST (paths, in this order)
- `e2e/cp01-charter-roundtrip.spec.ts:24` — `const E1_CONTRACTS = listContracts('epoch-1-frontier');` i.e. the array is built from the **LIVE** data — and `:27-35`, the test `'the epoch ships the five expected fixtures'`, which compares it against a hard-coded five-name literal.
- `assets/contracts/epoch-1-frontier/contracts.json` — the live data. Six contracts.
- `reviews/f1396-drill-yard-roster-debt.md` — this task's evidence, measured s1396.
- `tasks/f1330-1-count-shaped-censuses.md` — the ratified precedent for this exact shape (count-shaped half; this is the roster-shaped half).
- `tasks/goals.json` leaf `pc-01-drill-yard` and the blocked leaf behind `7c4f132f` — **both stay blocked. This task is NOT that task** (see WHY).

## WHY (evidence, dated, measured — not inherited)
`f0bf5251` (`runner(lane-b): lane-drill-yard.md`, 2026-08-01T08:14) added `e1-drill-yard` as E1's 6th contract, per the owner's ratification that morning (*"Drill Yard sounds good to me"*). Roster-shaped assertions were not updated with it.

s1396 proved cause by **control run**, not by reading the diff. In a detached worktree at `f0bf5251^` (`467ed904`), same harness, `--workers=1`:

| Spec | at `f0bf5251^` | on main |
|---|---|---|
| `cp01-charter-roundtrip.spec.ts:28` | **GREEN** | **RED**, desktop + mobile |

The failure is pure arithmetic — the received array matches the expected one except for `+ "e1-drill-yard"` at index 1.

⚠️ **Why the earlier sweep missed it, so this one is not repeated:** `f1330-1-count-shaped-censuses` swept with a **count-shaped** denominator (`toHaveLength(41)`, `41 contracts`, …). A roster-shaped literal contains no `41`, so it was structurally invisible to that grep. Both sweeps were honest; the denominators differ.

📌 **WHY THIS IS A SEPARATE TASK FROM THE BLOCKED `7c4f132f` WORK.** Three sibling specs carry the same roster defect — `072-era-activation.spec.ts:241`, `agent-view.spec.ts:263`, `e1-baron.spec.ts:343`, all measured RED on main this fire. **Their fixes already exist inside the owner-BLOCKED `7c4f132f` on `lane/m4`, and a fire may not lift a block (§3.0).** `cp01-charter-roundtrip.spec.ts` is **not** among that commit's five files (verified by `git show --stat 7c4f132f`), so it is the one member of the class that can be cured without touching held work or pre-empting the owner's fixture ruling. It is the smaller half, carved out so it cannot be held hostage.

## PRE-FLIGHT (LANE-SAFETY invariant)
1. `git status --short` in the lane worktree: dirty tracked blobs must be reachable in git, else **STOP** and report.
2. `git log main..HEAD --oneline` must be **empty**. If it is not, **STOP** — an undrained predecessor lives here and a reset would destroy it.
3. **Premise check, AFTER any reset:** count the contracts in `assets/contracts/epoch-1-frontier/contracts.json`. It must be **6**, and `e1-drill-yard` must be present. If it is 5, this lane predates `f0bf5251` and the task is **not applicable here — STOP and report the number you got.** (Adding the sixth name on a five-contract tree would manufacture a red.) ⓘ s1396 verified `git merge-base --is-ancestor f0bf5251 lane/e2-arsenal` = **YES** at authoring time; re-check it rather than trusting this line.

## SCOPE (numbered, each testable)
1. `e2e/cp01-charter-roundtrip.spec.ts:28` ("the epoch ships the five expected fixtures") — at `:28-35`, insert `'e1-drill-yard',` into the expected array so it reads `'the-claim', 'e1-drill-yard', 'e1-dry-gulch', 'e1-night-shift', 'e1-twin-banks', 'e1-baron'`. **The order matters** — it must match the live array's order, which is the order in `contracts.json`; drill-yard sits at **index 1**, immediately after `the-claim`.
2. `e2e/cp01-charter-roundtrip.spec.ts:27` — the test title says `'the epoch ships the five expected fixtures'`. Change **five → six** so the title does not lie about what it asserts. (Precedent: `7c4f132f` makes exactly this title change in `agent-view.spec.ts`.)
3. Nothing else. If you believe another **roster-shaped** census exists outside the four named in WHY, **report it — do not fix it.** A disagreement with the measured denominator is a finding worth more than a silent edit.

## TOUCH-ONLY
- `e2e/cp01-charter-roundtrip.spec.ts` (the literal array at `:28-35` and the title at `:27` — nothing else in the file)

## NO (firewall — violations fail the gate)
- **NO** touching `e2e/072-era-activation.spec.ts`, `e2e/agent-view.spec.ts`, `e2e/e1-baron.spec.ts`, `e2e/fixtures/e1-mechanics-manifests.json`, or `src/town/TownScene.ts`. **Those five are HELD, un-drained, on `lane/m4` behind an owner block** — editing them here manufactures a collision with finished work and pre-empts an owner ruling.
- **NO** change to `src/meta/ContractFamilies.ts`, `assets/contracts/**`, or anything that alters what contracts exist. The data is correct; the assertion is stale. If you believe the data is wrong, **STOP and report**.
- **NO** touching the six ITERATION-LIST roster sites (`panorama-framing`, `release-build`, `terrain-seamless`, `tr-02-splat-ground`, `contract-briefings:258`, `scripts/stream-capture.mjs`). They are **coverage holes, not reds** (F-1396-3), and adding drill-yard to them is an unmeasured behaviour change. Out of scope by design.
- **NO** touching `e2e/cp03-press-loop.spec.ts`. Its red has a **different cause** (`6c009cb8`, F-1396-2) and an unresolved attended fork. Fixing it here would be scope invention.
- **NO** touching `logs/suite-red-inventory.md` (standing order: never hand-edit it).
- **NO** running `node scripts/law-pointer-guard.mjs --update` on this lane — its ledger is stale and `--update` here would emit a baseline missing every pointer main has added since. The drain re-bases it on main.
- **NO** weakening: do not delete the assertion, do not convert it to a length check or a `toContain`. The exhaustive roster IS the point — it is what caught this.
- **NO** `git add -A`. Path-scoped only.

## SELF-CHECK (run these exact commands, report the numbers)
- `npx tsc --noEmit` — clean.
- `npm run build` — green.
- `npx playwright test e2e/cp01-charter-roundtrip.spec.ts --workers=1` — report pass/fail per project. Expect **all green**. (`--workers=1` is a correctness requirement of the fire/lane gate, not an optimisation — F-1270-1.)
- `npx playwright test e2e/drill-yard-manifest.spec.ts e2e/town-t3-board.spec.ts --workers=1` — adjacent, derived by grep (both read the E1 roster). s1396 measured `town-t3-board` + `contract-briefings` at **26/26 green** on main; report any change.
- `npm run test:node-guards` — report the count.
- ⚠️ **Report, do not commit, any tracked PNG under `artifacts/` or `reviews/` that your runs modify** (F-1328-3/F-1329-3: gate runs rewrite shipped evidence in place). Restore with `git checkout --` before committing.

READY-FOR-GATES + report: the contract count your pre-flight measured, whether `e1-drill-yard` was present, per-project pass counts for cp01 and the two adjacent suites, the `test:node-guards` count, and the list of tracked PNGs your runs dirtied and restored.

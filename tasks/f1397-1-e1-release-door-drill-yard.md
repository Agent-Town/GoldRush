# F-1397-2 — the E1 release door boots five of E1's six contracts; `e1-drill-yard` never goes through it

**FIRE-AUTHORED s1397 (attended review welcome).**
Role: implementer. Workdir: `worktrees/lane-c` (slot lane-c, branch `lane/e2-arsenal`).

## READ FIRST (paths, in this order)
- `e2e/release-build.spec.ts:18` — `const CONTRACTS = ['the-claim', 'e1-dry-gulch', 'e1-night-shift', 'e1-twin-banks', 'e1-baron'] as const;`
- `e2e/release-build.spec.ts:100-109` — the loop `for (const contractId of CONTRACTS)` and the test it generates, `` `${contractId} boots through the E1 release door` ``. Read the whole body; it is six lines and you must know exactly what it asserts before you widen its input.
- `assets/contracts/epoch-1-frontier/contracts.json` — the live data. **Six** contracts; `e1-drill-yard` at index 1.
- `reviews/f1396-drill-yard-roster-debt.md` — the evidence chain, incl. the **s1397 DRAIN** section at the end.
- `e2e/drill-yard.spec.ts` and `e2e/drill-yard-manifest.spec.ts` — proof the contract itself is playable and green today.

## WHY (evidence, dated, measured — not inherited)
`f0bf5251` (`runner(lane-b): lane-drill-yard.md`, 2026-08-01) added `e1-drill-yard` as E1's **sixth** contract, per the owner's ratification that morning (*"Drill Yard sounds good to me"*). s1396 found that roster-shaped assertions were not updated with it and filed **F-1396-3**: six *iteration-list* sites that name a contract roster and silently skip the new one. s1396 deliberately left all six **UNMEASURED** and firewalled them out of `f1396-1`, on the correct ground that adding a contract to an iteration list is a **behaviour change that can legitimately red things** — not a free edit.

s1397 re-read all six sites and their constant definitions rather than inheriting the list, and found they are **not one class**:

| Site | Constant | Contents | Shape |
|---|---|---|---|
| `release-build.spec.ts:18` | `CONTRACTS` | the 5 E1 contracts that existed **before** drill-yard | **roster-shaped** |
| `contract-briefings.spec.ts:104` | `UNLOCKED_BOARD_CONTRACTS` | 5 E1 ids, as a `Set` keyed on **unlock state** | unlock-semantic |
| `panorama-framing.spec.ts:13` | `PROOF_CONTRACTS` | `the-claim, e1-dry-gulch, e4-gusher-county` | **sampled** (spans E4) |
| `terrain-seamless.spec.ts:11` | `MAPS` | 4 E1 + `e2-hill-mine` | **sampled** (spans E2) |
| `tr-02-splat-ground.spec.ts:23` | `IDENTITY_CONTRACTS` | 4 E1 | **sampled** |
| `scripts/stream-capture.mjs:15` | `CONTRACTS` | 4 E1 + `e2-hill-mine`, used as `hash(DATE) % len` | **sampled**, cosmetic rotation |

**Only the first is a roster omission.** The three `sampled` sets deliberately mix epochs to exercise terrain/framing variety — widening them changes what those suites measure and is genuinely out of scope. `UNLOCKED_BOARD_CONTRACTS` encodes an **unlock ruling**, and drill-yard's unlock state is exactly the kind of question that bit `cp03` (F-1396-2). `release-build.spec.ts`'s `CONTRACTS` is different in kind: it is the **E1 release door**, its list is precisely E1-minus-drill-yard, and its test seeds `{ unlocked: true }` so unlock gating cannot confound it.

⚠️ **Why this matters now rather than later.** The owner's outstanding #1 ask is to **close launch** (`rf-05-fixed-version`: the vE1.0 tag + the final E1 walk). Tagging vE1.0 while the release gate has never booted one of the six shipping E1 contracts is a launch-readiness gap, and it is cheap to close **before** the tag rather than after.

## PRE-FLIGHT (LANE-SAFETY invariant)
1. `git status --short` in the lane worktree: dirty tracked blobs must be reachable in git, else **STOP** and report.
2. `git log main..HEAD --oneline` must be **empty**. If it is not, **STOP** — an undrained predecessor lives here and a reset would destroy it.
3. **Premise check, AFTER any reset:** count the contracts in `assets/contracts/epoch-1-frontier/contracts.json`. It must be **6** and include `e1-drill-yard`. If it is 5, this lane predates `f0bf5251`: the task is **not applicable here — STOP and report the number you got.** ⓘ s1397 verified `git merge-base --is-ancestor f0bf5251 lane/e2-arsenal` = **YES** at authoring time (lane-c is 17 commits behind main but with **zero run-surface drift** — `node scripts/lane-usable.mjs lane-c`); re-check rather than trusting this line.

## SCOPE (numbered, each testable)
1. **MEASURE FIRST, BEFORE EDITING ANYTHING.** Add `'e1-drill-yard'` to the `CONTRACTS` array at `e2e/release-build.spec.ts:18` — the one consumed at `:100` by `for (const contractId of CONTRACTS) {`. Order: index **1**, immediately after the-claim, matching `contracts.json`. Then run **only** the release-door test:
   `npx playwright test e2e/release-build.spec.ts --workers=1 -g "boots through the E1 release door"`
2. **BRANCH ON THAT RESULT — this is the whole point of the task.**
   - **All green (expected):** keep the edit. Report the per-project pass counts. Proceed to the full self-check.
   - **`e1-drill-yard` RED, others green:** **STOP. Revert the edit. Do NOT try to fix it.** You have found a genuine launch-readiness defect in a shipping contract. Report the **exact** failure text, the console/page errors, and which assertion failed (`waitForContract` timeout vs `__GR_TEST__` leak vs `expectNoConsoleErrors`). That report is worth far more than a green suite — it is a finding the owner needs **before** tagging vE1.0.
   - **Anything else red:** **STOP and report.** A pre-existing red in this suite is not yours to absorb.
3. Nothing else. If you believe another **roster-shaped** (not sampled) census exists, **report it — do not fix it.**

## TOUCH-ONLY
- `e2e/release-build.spec.ts` (the `CONTRACTS` array at `:18` — **nothing else in the file**)

## NO (firewall — violations fail the gate)
- **NO** touching the five **sampled** sites: `e2e/panorama-framing.spec.ts`, `e2e/terrain-seamless.spec.ts`, `e2e/tr-02-splat-ground.spec.ts`, `e2e/contract-briefings.spec.ts`, `scripts/stream-capture.mjs`. Their lists deliberately span epochs or encode unlock rulings (see the WHY table). Widening them is an unmeasured behaviour change and a **separate** slice.
- **NO** touching `e2e/072-era-activation.spec.ts`, `e2e/agent-view.spec.ts`, `e2e/e1-baron.spec.ts`, `e2e/fixtures/e1-mechanics-manifests.json`, `src/town/TownScene.ts`. **Those five are HELD, undrained, on `lane/m4` behind an OWNER BLOCK** (`7c4f132f`). A fire may not lift a block (§3.0), and editing them here manufactures a collision with finished work.
- **NO** touching `e2e/cp03-press-loop.spec.ts`. Its red is a different cause (`6c009cb8`, F-1396-2) and an **unresolved attended fork**.
- **NO** change to `src/**`, `assets/contracts/**`, or anything that alters what contracts exist or how they boot. **If the release door genuinely fails for drill-yard, that is a finding to REPORT, not a bug to fix in this task.** Fixing product code here would silently convert a measurement task into an unreviewed gameplay change.
- **NO** weakening: do not add a skip, a conditional, a longer timeout, or a `try/catch` to make drill-yard pass. If it needs special handling, that IS the finding.
- **NO** touching `logs/suite-red-inventory.md` (standing order: never hand-edit it).
- **NO** running `node scripts/law-pointer-guard.mjs --update` on this lane — its ledger is stale and `--update` here would emit a baseline missing every pointer main has added since.
- **NO** `git add -A`. Path-scoped only.

## SELF-CHECK (run these exact commands, report the numbers)
- `npx tsc --noEmit` — clean.
- `npm run build` — green.
- `npx playwright test e2e/release-build.spec.ts --workers=1` — the **full** suite, not just the `-g` slice. Report pass/fail per project. (`--workers=1` is a correctness requirement of the fire/lane gate, not an optimisation — F-1270-1.)
- `npx playwright test e2e/drill-yard.spec.ts e2e/drill-yard-manifest.spec.ts e2e/cp01-charter-roundtrip.spec.ts --workers=1` — adjacent, derived by grep (all three read the E1 roster or the drill-yard contract). s1397 measured all three **green on main** at the `0195da9f` drain; report any change.
- `npm run test:node-guards` — report the count. (s1397 measured the drain-time battery green; a change here is a finding.)
- ⚠️ **Report, do not commit, any tracked PNG under `artifacts/` or `reviews/` that your runs modify** (F-1328-3/F-1329-3: gate runs rewrite shipped evidence in place). `release-build.spec.ts` is screenshot-heavy — expect this to fire. Restore with `git checkout --` before committing.

READY-FOR-GATES + report: the contract count your pre-flight measured and whether `e1-drill-yard` was present; **which branch of scope item 2 you took**; per-project pass counts for the release-door `-g` run, the full `release-build` suite, and the three adjacent suites; the `test:node-guards` count; and the list of tracked PNGs your runs dirtied and restored.

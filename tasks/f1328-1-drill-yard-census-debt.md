# F-1328-1 — the Drill Yard is the 6th E1 contract, but three census assertions still say five

**FIRE-AUTHORED s1328 (attended review welcome).**
Role: implementer. Workdir: `worktrees/lane-b` (slot lane-b, branch `lane/m4`).

## READ FIRST (paths, in this order)
- `reviews/lane-survive-copy.md` §Findings — F-1328-1, where the blast radius was measured.
- `e2e/agent-view.spec.ts:261-270` ("all five E1 mechanics manifests match their byte-stable fixture") (that test was RENAMED at commit 8fa0133f and is now titled "all six E1 mechanics manifests match their byte-stable fixture" — the count in the old title was the defect) — the failing test.
- `e2e/fixtures/e1-mechanics-manifests.json` — the fixture that needs a 6th entry.
- `e2e/072-era-activation.spec.ts:23` and `:236-241` ("fresh E1 profile stays unchanged and the pre-flip determinism hash is identical") — the second failing census.
- `tasks/BACKLOG.md` — the AP-11 row (2026-07-31): "THE MECHANICS MANIFEST — verbs are grammar, mechanics are DERIVED per-contract vocabulary … NO-UNDECLARED-MECHANICS assayer law (hand-written manifests forbidden so it cannot rot)". **This is the law that governs how you produce the fixture.**
- `src/meta/ContractFamilies.ts` — `listContracts()`, the source of the ordering.

## WHY (evidence, dated)
`f0bf5251` (`runner(lane-b): lane-drill-yard.md`, 2026-08-01 08:14) added `e1-drill-yard` as the **6th** E1 contract and the **42nd** overall, per the owner's ratification that same morning ("Drill Yard sounds good to me"). It did not update any spec that asserts an E1 **census**.

s1328 measured the blast radius while draining an unrelated slice: **7 red assertions across 3 specs.** Four were cured incidentally by `lane-survive-copy` (`contract-briefings.spec.ts` 41→42 and board 5→6). **Two sites remain red on main:**

| Site | assertion | projects red |
|---|---|---|
| `e2e/agent-view.spec.ts:266` | `expect(ids).toEqual(['the-claim','e1-dry-gulch','e1-night-shift','e1-twin-banks','e1-baron'])` | desktop + mobile |
| `e2e/072-era-activation.spec.ts:241` ("fresh E1 profile stays unchanged and the pre-flip determinism hash is identical") | `listContracts().map(id)` `.toEqual(E1_CONTRACTS)` | desktop (mobile skipped) |

Measured failure text at `agent-view.spec.ts:266`, desktop-chrome:
```
- Expected  - 0
+ Received  + 1
  Array [ "the-claim", + "e1-drill-yard", "e1-dry-gulch", "e1-night-shift", "e1-twin-banks", "e1-baron" ]
```
Note the **position**: `e1-drill-yard` sorts second, not last. Order matters — both assertions are `toEqual`, not `toContain`.

⚠️ **The drill-yard drain believed it had already cured this.** Its own gazette item says the disagreement "is now fixed at the source rather than hidden from the tests that count". It was fixed in the manifest and the board, but the census assertions were never re-run. Treat that sentence as a warning, not as evidence.

## SCOPE (numbered, each testable)
1. **Regenerate `e2e/fixtures/e1-mechanics-manifests.json`** to hold **six** entries, in `listContracts()` order, with the `e1-drill-yard` entry **DERIVED** by `deriveMechanicsManifest('e1-drill-yard')` — never hand-written (AP-11 NO-UNDECLARED-MECHANICS). Write a throwaway node script to emit it, byte-identical to what the spec compares against, then delete the script.
2. **Update `e2e/agent-view.spec.ts:266`** to the six-id list, and retitle the test at `:261` ("all five E1 mechanics manifests match their byte-stable fixture") — the word "five" is part of the census.
3. **Update `e2e/072-era-activation.spec.ts:23`** ("fresh E1 profile stays unchanged and the pre-flip determinism hash is identical") — `E1_CONTRACTS` to the six-id list, in the same order.
4. **Search for any further census** before declaring done: `grep -rn "'the-claim', 'e1-" e2e/ src/ scripts/`. Sites that merely **iterate** contracts (`release-build.spec.ts:18`, `tr-02-splat-ground.spec.ts:23`, `terrain-seamless.spec.ts:11`, `stream-capture.mjs:15`) are **sampling lists, NOT censuses — do NOT change them**; they are coverage gaps at most. Only `toEqual`/`toHaveLength`/`toHaveCount` totality assertions are in scope. If you find a totality site not listed above, fix it and REPORT it.
5. **Fix the stale comment** `src/town/TownScene.ts:2783` ("all 41 cards render through ONE path") to 42. Cosmetic, but it is a census claim in prose.

## TOUCH-ONLY
- `e2e/fixtures/e1-mechanics-manifests.json`
- `e2e/agent-view.spec.ts`
- `e2e/072-era-activation.spec.ts`
- `src/town/TownScene.ts` (line 2783 comment ONLY — one word, 41→42)

## NO (firewall — violations fail the gate)
- **NO** change to `src/meta/ContractFamilies.ts`, `assets/contracts/**`, or anything that alters what contracts exist or their order. The data is correct; the assertions are stale. If you believe the data is wrong, STOP and report.
- **NO** hand-authored manifest entries (AP-11). If `deriveMechanicsManifest('e1-drill-yard')` produces something that looks wrong, STOP and report — that is a finding about the derivation, and it is exactly what this fixture exists to catch.
- **NO** weakening of the assertions to make them pass — do not convert `toEqual` to `toContain`, do not delete the census. The census is the point.
- **NO** touching `e2e/contract-briefings.spec.ts` or `e2e/pause-goal-progress.spec.ts` (s1328 already landed those).
- **NO** `git add -A`. Path-scoped only.

## SELF-CHECK (run these exact commands, both projects, report the numbers)
- `npx tsc --noEmit` — clean.
- `npm run build` — green.
- `npx playwright test e2e/agent-view.spec.ts e2e/072-era-activation.spec.ts --workers=1` — **expect the previously-red tests GREEN**; report pass/fail counts per project. (`--workers=1` is a correctness requirement of the fire shell, not an optimisation.)
- `npx playwright test e2e/contract-briefings.spec.ts --workers=1` — adjacent, must stay green (s1328 left it 16/16).
- `npx playwright test --config playwright.release.config.ts --workers=1` — ⚠️ **`release-build.spec.ts` is claimed by `playwright.release.config.ts` via `testMatch` and is EXCLUDED from the default config's collection.** Running it as `npx playwright test e2e/release-build.spec.ts` collects **zero tests and still exits 0** — a silently empty gate. Use the config flag. s1328 left it 26/26.
- `grep -rn "all five E1\|all 41 " e2e/ src/` — must return **zero** live census claims saying five/41.
- ⚠️ **Report, do not commit, any tracked PNG under `artifacts/` or `reviews/` that your test runs modify** (F-1328-3: gate runs rewrite shipped evidence in place). Restore them with `git checkout --` before committing.

READY-FOR-GATES + report: the six-id order you produced, the derived drill-yard manifest's `interactables`/`rules` shape, per-project pass counts for all four suites, and any further census sites found in scope item 4.

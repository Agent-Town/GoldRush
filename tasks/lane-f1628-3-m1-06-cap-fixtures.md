# Task f1628-3: m1-06's fixtures still set Double-Tap Coil to 5 and 6 against a cap of 3 — repair the FIXTURES so each test measures what it names, and change NO threshold (LANE-A, commit prefix "test:")

**FIRE-AUTHORED (attended review welcome)** — s1629, from **F-1628-3** (filed s1628) and a fresh control run measured s1629 at the `f1627-1` drain.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-a.

READ FIRST: `AGENTS.md`; `e2e/m1-06-level-up-choices.spec.ts` — the three failing tests **in full** (`investment weighting prefers owned families without losing discovery`, `owned-family cards show a compact stack pip`, `maxed upgrades leave the offer pool`); `src/game/Progression.ts` around the `setUpgradeStacks` clamp and the offer-pool filter; `reviews/f1627-1-ab-ceiling-coverage.md` for the house standard on proving a claim by manufacturing the defect.

SEQUENCING: verify the subject is still what this master claims, by **content grep, never by line number** (F-1310-1 — coordinates rot; these counts were measured on main at `70a0d83fe` while this master was written, not recalled):

- `grep -c "doubleTapCoilMaxStacks: 3" src/game/Balance.ts` → **must be 2** (the cap is genuinely 3, in both literals).
- `grep -c "setUpgradeStacks({ double_tap_coil: 5 })" e2e/m1-06-level-up-choices.spec.ts` → **must be 3**.
- `grep -c "toHaveText('V')" e2e/m1-06-level-up-choices.spec.ts` → **must be 1**.
- `grep -c "stacks.double_tap_coil).toBe(6)" e2e/m1-06-level-up-choices.spec.ts` → **must be 1**.

If ANY differs, the site has moved under this master — **STOP and report the drift** rather than guessing which line to edit.

⚠️ **THIS LANE MUST BE CURRENT, NOT MERELY CLEAN.** `e2e/m1-06-level-up-choices.spec.ts` is one of the files main has moved that lane-a lacked at authoring time. Prove the lane has the drain this task is built on: `git merge-base --is-ancestor 70a0d83fe HEAD` must succeed. If it does not, **STOP and report "lane stale"** — a green on a stale lane would measure a spec that no longer exists on main (F-1320-2).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/a main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE: `git -C worktrees/lane-a status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

## Why — six reds, ONE cause, and the obvious fix is wrong for one of them

`4154da9eb` (2026-07-26, the `e1-midgame` drain) capped Double-Tap Coil **6 → 3** deliberately, in `Balance.ts` **only**. `e2e/m1-06-level-up-choices.spec.ts` still sets its fixtures to the pre-cap values, so three tests × two projects have been red ever since.

**Fresh control run, s1629, on main at `70a0d83fe`, `--workers=1`: `6 failed / 18 passed, 277.1 s`.** All six failures are the same cause:

| Test | Project(s) | Reported |
|---|---|---|
| `investment weighting…` | both | `expect(received).toBeGreaterThanOrEqual` — Expected `>= 22`, Received **0** |
| `owned-family cards show a compact stack pip` | both | `toHaveText` — Expected `"V"`, **element(s) not found** |
| `maxed upgrades leave the offer pool` | both | `toBe` — Expected `6`, Received **3** |

🔑 **THE MECHANISM, read from the code rather than inferred:** `Progression.ts` clamps on write — `this.stacksValue[id] = Math.min(Math.floor(count), def.maxStacks)` — and filters the offer pool with `(this.stacksValue[def.id] ?? 0) < def.maxStacks`. So `setUpgradeStacks({ double_tap_coil: 5 })`, which the tests use to mean **"invested, but not yet maxed"**, now clamps to **3 = maxed**, and a maxed upgrade is **removed from the offer pool**. That single fact explains all three shapes: the invested arm can never be offered (`investedHits` **0**), the pip's card never renders (`element(s) not found`), and the stack total tops out at 3 where the test expects 6.

⛔ **AND HERE IS THE TRAP THIS TASK EXISTS TO AVOID.** The `>= 22` is **not a written-down threshold** — it is `expect(investedHits).toBeGreaterThanOrEqual(baseHits * 2)`, derived at runtime from the base arm. **Re-pinning it, softening it, or deleting it would destroy the only property the test asserts** (that investment roughly doubles the family's offer rate) while turning the board green — the F-1441-3 class, and the exact failure F-1627-1 was filed for one drain ago: an assertion whose *subject* changes while the count stays put. **The number is fine. The FIXTURE is wrong.** Fix the fixture; leave every assertion's shape alone.

Note also that the pip renders `roman(choice.familyStacks)` and `firerate` has exactly **one** member (`double_tap_coil`), so the family total is that upgrade's own stack count.

ⓘ Three further m1-06 rows in `logs/suite-red-inventory.md` are recorded as timeouts (`:118` mobile, and the mobile/desktop `investment weighting` 30 s expiries). **They did NOT reproduce in the s1629 control** — zero timeouts in 277.1 s. Treat them as shell-load artifacts of the snapshot (F-1627-3 shape), **not** as work for this task.

## Scope (numbered, each independently testable)

1. **`investment weighting prefers owned families without losing discovery`** — change the two "invested" fixtures from `double_tap_coil: 5` to **`double_tap_coil: 2`** (genuinely invested and still offerable under the cap of 3), and the "maxed" fixture from `double_tap_coil: 6` to **`double_tap_coil: 3`**. Leave `powder_charge: 2, wide_ring: 2, quick_fuse: 2` alone — those are already at their own caps. **Do not touch any `expect(...)` in this test.**
2. **`owned-family cards show a compact stack pip`** — change its fixture from `double_tap_coil: 5` to **`double_tap_coil: 2`**, and the expected pip text from `'V'` to **`'II'`**. The card must actually render, which is the point: at 2 of 3 the upgrade is still offerable. Leave the width assertion untouched.
3. **`maxed upgrades leave the offer pool`** — update the expected stack total from `6` to **`3`**. Read the surrounding loop first: if it drives stacks upward by repeatedly picking, its bound may also assume 6; make the test reach the cap and stop, without changing what it asserts (that a maxed id leaves the pool).
4. **Add a one-line comment at each of the three fixtures naming the cap and its origin**, so the next cap change finds them: e.g. `// Double-Tap Coil caps at Balance.upgrades.doubleTapCoilMaxStacks (3 since 4154da9eb); "invested" must stay BELOW it or the upgrade leaves the offer pool.`
5. **Do NOT edit `logs/suite-red-inventory.md`.** Refreshing an exoneration ledger is how a regression gets laundered; the inventory is refreshed by its own instrument, not by hand.

## Firewall

Touch ONLY: `e2e/m1-06-level-up-choices.spec.ts`.

NO changes to: **`src/**` of any kind** — in particular `Balance.ts`, `doubleTapCoilMaxStacks`, `Progression.ts`'s clamp or offer filter (the cap is a ratified balance ruling from `4154da9eb`; if you believe the cap is wrong that is a FINDING, not an edit) · **any `expect(...)` shape, threshold, or comparison operator** (fixtures only, plus the two literal expected VALUES named in scope 2 and 3) · `logs/suite-red-inventory.md` · any other `e2e/*.spec.ts` · `package.json`, `playwright.config.ts`, `playwright.preview.config.ts` · `tasks/**`, `specs/**`, `reviews/**`, `STATUS.md`, `tasks/BACKLOG.md`.

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` clean · `npm run build` green.
- `npx playwright test e2e/m1-06-level-up-choices.spec.ts --workers=1` → **24/24 passing, both projects**. Name the pass/fail counts and the wall time. **`--workers=1` is a correctness requirement of the fire/lane instrument, not an optimisation (§3.1).**
- ⚠️ **If any test still fails, report it — do NOT reach for a threshold.** A remaining red here is information about the game, and this task is forbidden from silencing it.
- `grep -c "setUpgradeStacks({ double_tap_coil: 5 })" e2e/m1-06-level-up-choices.spec.ts` → **must now be 0**. Paste the number.
- `grep -c "doubleTapCoilMaxStacks" src/game/Balance.ts` → **must still be 5** (proof you did not touch the cap; it was 5 on main at authoring). Paste the number.
- `git diff --numstat` must show **exactly one file changed**. Paste it.
- **Prove the repair is real, not cosmetic (the s1629 standard): after it is green, re-run ONE of the three tests with its fixture put back to `5`, confirm it goes RED again, then restore.** Paste both results. A test that passes without its defect ever having been reproduced is not evidence.
- `npm run test:node-guards` is **NOT** required — this task touches no `src/sim/`, `src/systems/` or `src/entities/` path (F-1460-1). Say so in your report rather than silently omitting it.
- Zero console/page errors in every arm (the tests already call `assertNoErrors`; confirm none fired).

If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate (Mistake #1).

End: READY-FOR-GATES + report (1) the suite's pass/fail counts and wall time, both projects; (2) both grep counts verbatim; (3) the `--numstat`; (4) the red-then-green proof from the fixture-reversion probe; (5) confirmation that you changed no `src/**` file, no assertion shape, and no threshold.

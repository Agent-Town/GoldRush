# Task f1630-1: give m1-06's investment-weighting test the 45 s budget its lighter sibling already has (LANE-A, commit prefix "test:")

**FIRE-AUTHORED s1630 (attended review welcome)** — from F-1630-1, measured by this fire at the f1628-3 drain.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-a`.

READ FIRST: `AGENTS.md`; `reviews/f1628-3-m1-06-cap-fixtures.md` (the drain that measured this, §"The surviving red, measured rather than excused"); `e2e/m1-06-level-up-choices.spec.ts`; `playwright.config.ts:49`.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/a main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded. ⚠️ The trap this closes: a run that STOPPED still ran playwright and still regenerated screenshots, so a stopped predecessor leaves tracked dirt that freezes its successor — three consecutive masters (gazette-welcome-drift-observation-frame v1/v2, newsie-drift-shell-divergence-rate) died before measuring anything, the third killed by the exhaust of the first two.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE, WHICH THE LANE TEMPLATE OWED AND DID NOT CARRY UNTIL s1505 (F-1505-1): `git -C worktrees/lane-a status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

SEQUENCING LAW: this task edits a file that was repaired minutes ago. Verify the repair is present before you touch anything:
`git log --oneline | grep -q 'm1-06 cap fixtures follow the three-stack ceiling'` — if that returns nothing, **STOP and report "f1628-3 not landed"**. Do NOT improvise the fixture repair; it is already done and is not your scope. (Do not gate on `git log -N` with a small N — search the whole log by pattern.)

## Why (F-1630-1, measured s1630 in the fire shell at the f1628-3 drain; every number below is from that run)

`e2e/m1-06-level-up-choices.spec.ts:177` — test **"investment weighting prefers owned families without losing discovery"** — is the heaviest test in the suite: it opens **four** browser pages (`browser.newPage()` × 4) and performs **140 roll operations** across them (`rolledOffers(basePage, 40)` at `:194`, `investedPage, 40` at `:195`, `repeatedPage, 40` at `:196`, `maxedPage, 20` at `:197`).

It runs on the **global default budget of 30 s** — `playwright.config.ts:49` sets `timeout: 30_000` and no project overrides it. **Measured: the test needs 27.2 s of that 30 s — 90.7% of budget, 2.8 s of margin.**

Consequences measured, not assumed:
- In the fire shell it **TIMES OUT** (`Test timeout of 30000ms exceeded`), inside the full suite **and solo** — so it is not contention between tests.
- With `--timeout=180000` it **PASSES in 27.2 s**, which proves the assertions are correct and the failure is purely the clock.
- The pre-cure control at the same lifted clock fails the **assertion** proper (`Expected: >= 22 / Received: 0`), which proves the timeout and the old fixture defect are different classes.
- The lane shell ran the same suite **24/24 in 111.71 s**; the fire shell took **216 s** for identical work — the F-1269-1 per-job CPU ceiling, ~2×.

Its sibling **"maxed upgrades leave the offer pool"** (`e2e/m1-06-level-up-choices.spec.ts:236`) already carries `test.setTimeout(45_000)` at `:239` — and that test is *lighter* (one page). The heavy one carries nothing. That asymmetry is the whole defect.

⚠️ **A standing red in a gameplay suite is how an excused-label rot begins (F-1460-1): `test:node-guards` sat red for five fires because its red wore a class label nobody investigated.** This one is 2.8 s wide and cheap to close.

## Scope

1. In `e2e/m1-06-level-up-choices.spec.ts`, inside the test **"investment weighting prefers owned families without losing discovery"** (`:177`), add `test.setTimeout(45_000);` as the **first statement of the test body**, matching the placement its sibling uses at `:239`.
2. Add a one-line comment at that statement naming **why**, in the house style already used three times in this file by f1628-3: the measured cost (4 pages, 140 rolls) and the measured duration (27.2 s of a 30 s default in the fire shell, F-1630-1). Name F-1630-1 so the next reader finds the evidence.
3. **PROVE THE LEVER by manufacturing the failure — a green alone is not evidence about a red (the s1299/s1300 standard).** `test.setTimeout()` could be placed wrong, shadowed, or overridden and still leave a passing test, so demonstrate it actually governs *this* test: temporarily change your new value to a number **below** the duration you measure in step 4 (e.g. `4_000`), run that one test, and confirm it fails with a timeout message naming that value. Then **restore `45_000`** and confirm it passes. Report both arms with their exact reporter lines, and confirm the file is byte-identical to your intended final state afterwards.
4. Measure and report the test's own reported duration in **your** shell (`--reporter=list` prints it per test), for both `desktop-chrome` and `mobile-chrome`. This establishes the lane-shell baseline that F-1630-1 does not have.

## ⚠️ What you CANNOT prove, and must not pretend to — read this before writing your report

**You run in the LANE shell, where this test already passes at the 30 s default.** The runner that produced f1628-3 scored the whole suite 24/24 there. So a "before/after showing the red cured" measurement is **structurally impossible for you**, and if you report one it will be vacuous or invented.

Do **not** attempt to reproduce the timeout by loading the machine — that lever is measured-unreliable for exactly this shape (F-1592-1: external CPU hogs at N=2/4/8/16 moved a frame interval 0.5% against a 6× gap, because the loop was vsync-pinned). If you want the arm anyway, the lever that *does* work is CDP `Emulation.setCPUThrottlingRate` via `page.context().newCDPSession(page)` — but it is **explicitly OUT OF SCOPE here** and you should not spend a run on it.

**The fire-shell acceptance measurement belongs to the DRAIN**, which runs in the shell where the red lives. Your job is: the line lands, the lever demonstrably governs this test (scope 3), nothing regresses, and the lane-shell duration is on the record (scope 4). Say plainly in your report that the fire-shell cure is unverifiable from your shell. That sentence is worth more than a confident number.

## Firewall

Touch ONLY: `e2e/m1-06-level-up-choices.spec.ts` — and within it, ONLY the test body at `:177`, adding one `test.setTimeout(45_000);` statement plus one comment line.

NO changes to:
- ⛔ **`expect(investedHits).toBeGreaterThanOrEqual(baseHits * 2);`** (`:201`) — the derived ratio assertion. It is the only property this test asserts, it is byte-identical to main, and f1628-3's master forbade touching it for the same reason. Re-pinning it to green is the **F-1441-3** class. ⓘ Note for anyone auditing this firewall: that threshold is often cited as `>= 22`, which is its **runtime value, not a source literal** — grepping this file for `22` returns **nothing**. Check it by reading the expression, not by grep.
- ⛔ **The sample sizes at `:194`–`:197` (40/40/40/20).** Making the test faster by rolling fewer offers would shrink the sample the ratio assertion depends on — that is weakening the test disguised as a performance fix. The 140 rolls are the *cost the cure is paying for*, not a problem to solve.
- ⛔ The fixture values `double_tap_coil: 2` / `: 3` and the `toHaveText('II')` expectation — f1628-3 landed these minutes ago with measured evidence; they are correct and are not yours.
- ⛔ Any other test in this file, including the `test.setTimeout(45_000)` already at `:239`.
- ⛔ `playwright.config.ts` — do NOT raise the **global** `timeout: 30_000` at `:49`. That would hand every one of the suite's hundreds of tests a longer leash to hide inside, which is the opposite of this task: one heavy test gets a budget matched to its measured cost, and everything else keeps a tight clock that still catches real hangs.
- ⛔ Any `src/**`, `scripts/**`, `package.json`, sim semantics, or any other spec file.

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` clean; `npm run build` green.
- `npx playwright test e2e/m1-06-level-up-choices.spec.ts --workers=1 --reporter=list` → **24/24, both `desktop-chrome` and `mobile-chrome`**, zero console/page errors. Quote the per-test duration line for **"investment weighting prefers owned families without losing discovery"** on both projects (scope 4).
- The manufactured-failure pair from scope 3, both reporter lines quoted, plus confirmation that `45_000` is restored.
- `git diff --numstat` showing **exactly one file changed**, and the insertion count showing you added a statement and a comment and nothing else.
- `grep -n "setTimeout" e2e/m1-06-level-up-choices.spec.ts` → exactly **two** hits (yours and the pre-existing `:239`).
- `grep -c "baseHits \* 2" e2e/m1-06-level-up-choices.spec.ts` → **1**, and confirm that line is unchanged versus main (`git diff main -- e2e/m1-06-level-up-choices.spec.ts` must not show it).
- Adjacent suites, unmodified-green both projects, named not implied: **none are owed** — this diff touches one test body in one spec file and no `src/**`, so nothing else can observe it. `test:node-guards` is **NOT required** (no `src/sim`, `src/systems`, `src/entities` path — F-1460-1). Say so explicitly rather than omitting it; do not run the 181 s battery for a one-line test change.

**If you find yourself about to exit without changes, WRITE WHY into your report first** — a silent no-op wastes a queue slot and a gate.

End: **READY-FOR-GATES** + report (a) the two lane-shell durations, (b) the manufactured-failure pair proving the lever governs this test, (c) the explicit statement that the fire-shell cure is not verifiable from your shell, and (d) anything you had to adapt, including whether `test.setTimeout` placement behaved as the sibling at `:239` implies.

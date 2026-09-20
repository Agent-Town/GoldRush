# f1630-1 — m1-06 investment-weighting gets the 45 s budget its lighter sibling already has

- **Slice:** `f1630-1-m1-06-weighting-timeout` (fire-authored s1630 from F-1630-1, measured s1630 at the f1628-3 drain)
- **Branch / tip:** `lane/a` @ `6f83b2a2e` (runner commit, 15:30, 108,373 tokens)
- **Base:** `8ee24e530 (archive: pruned by the A3 rewrite)`; merged onto main at `a445f98fb`
- **Merge:** `026f0ceb798ed44741a17a62eaf0bf91d5e8e916` (`--no-ff`, `ort`, one atomic act per F-1589-5)
- **Gated by:** s1631, fire shell, `--workers=1` throughout, detached worktree `gate-s1631` per §3.0b (removed after, `node_modules` symlink unlinked first)
- **Verdict:** ✅ **MERGED.** The cure is correct and proven red→green on a pre-cure control **in the shell where the red lives**. The acceptance measurement the runner could not make is now on the record — and it revises F-1630-1's own headline number upward.

## What it does

Two lines, one file, one test body: `test.setTimeout(45_000)` plus a comment naming F-1630-1, placed as the first statement of **"investment weighting prefers owned families without losing discovery"** (`e2e/m1-06-level-up-choices.spec.ts:179`), exactly matching the placement its lighter sibling "maxed upgrades leave the offer pool" already uses at `:241`.

That asymmetry was the whole defect: the heavy test opens **four** browser pages and performs **140 roll operations**, and ran on the global 30 s default; the one-page sibling already carried 45 s.

**The restraint is again half the deliverable.** The derived ratio assertion `expect(investedHits).toBeGreaterThanOrEqual(baseHits * 2)` (`:203`) is **byte-identical to main**, the sample sizes `40/40/40/20` are untouched, and `playwright.config.ts`'s global `timeout: 30_000` is unchanged. Making the test cheaper by rolling fewer offers would have shrunk the sample the ratio assertion depends on — weakening the test disguised as a performance fix. `grep -n setTimeout` over the merged file returns **exactly two** hits, as specified.

## 🔬 The finding: F-1630-1 understated the cost, and the "2.8 s of margin" framing was wrong

F-1630-1 recorded the test needing **27.2 s of a 30 s default — 90.7 % of budget, 2.8 s of margin**, which reads as *uncomfortably close to the line*.

Measured here on the merged tree, fire shell, default clock, `--workers=1`:

| Project | Target test's own reported duration | vs the 30 s default |
|---|---|---|
| `desktop-chrome` | **36.3 s** | **+21 % OVER** |
| `mobile-chrome` | **31.7 s** | **+6 % OVER** |

**The test was not near the budget, it was over it on both projects.** The 27.2 s figure was one sample of a quantity that varies by roughly ±15 % in this shell, and the pre-cure control confirms the consequence directly: the target **timed out on `mobile-chrome`** (`Test timeout of 30000ms exceeded`) while **passing on `desktop-chrome`** in the same run — the arm that reds is a coin flip, not a property of the project. Any fire that had "confirmed" this red on one project and moved on would have drawn the wrong boundary.

Consequence for the cure's sizing: 45 s leaves **8.7 s of margin on the worst measured arm (80.7 % utilisation)** — genuinely comfortable, where a 35 s or 40 s budget chosen off the 27.2 s figure would have been breached on the first run. The value that landed is right; the reasoning that produced it was luckier than it looked.

## Evidence

All runs in the fire shell, `--workers=1`, in the detached gate worktree `gate-s1631`. Machine confirmed quiet first (`pgrep` — zero live `codex exec` lane runs), so the reds below are the F-1269-1 per-job ceiling, not lane contention.

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean** |
| `npm run build` | **green**, built in **1.52 s**; asset-diet 235 GLBs 592,044,952→92,718,740 B (84 % cut) |
| **Control** (pre-cure main, same tree, same shell, default clock) | **4 failed / 20 passed — 3.8 m** |
| **Merged tree, full suite** | **24 passed / 0 failed — 3.8 m** |
| Desktop-chrome | **12/12 GREEN** |
| Mobile-chrome (390 px viewport) | **12/12 GREEN** |
| Console/page errors | **zero** — every test calls the suite's own `assertNoErrors`; both arms fully green |
| `test:node-guards` | **correctly NOT required** — the diff touches no `src/sim`, `src/systems` or `src/entities` path (F-1460-1). Stated rather than omitted. |
| Adjacent suites | **none owed** — one test body, no `src/**` change, so nothing else can observe this diff |

### ⚠️ Do NOT read this as "one line cured four reds"

The control failed **4** and the merged tree failed **0**, and that arithmetic is a trap. The control's failure set was:

| Control failure | Class |
|---|---|
| `[mobile] :177 investment weighting` — `Test timeout of 30000ms exceeded` | ✅ **the target.** This one the cure addresses. |
| `[desktop] :261 Beacon Dynamo is gated until a beacon stands` | fire-shell drift red |
| `[desktop] :318 resetRun clears progression and HUD XP truth` | fire-shell drift red |
| `[mobile] :86 X opens level-up and freezes sim clocks while enemies are alive` | fire-shell drift red |

**A `test.setTimeout` on one test body cannot affect three other tests** — it is scoped to its own test and the other three carry unchanged budgets. Those three passed in the merged run because this shell's reds are partly stochastic, not because anything fixed them. The control's honest contribution is narrower than its headline: it **reproduced the target's timeout in the shell where the red lives**, which is precisely what the runner said it could not do from the lane shell. Its other three reds are noise that happened to land in the control arm.

This matters beyond bookkeeping: a drain that reported "4 reds → 0 reds" would be claiming a cure it did not perform, and the next fire would size its expectations against a fiction.

## The runner's report, checked rather than trusted

The master forbade a before/after "cure" claim from the lane shell, where the test already passes at 30 s, and the runner obeyed — it stated plainly that *"the fire-shell cure cannot be verified from this lane shell."* That sentence is worth more than a confident number, and it is why this drain's measurement was the deliverable rather than a formality.

The lever proof it *could* make, it made properly (scope 3, the s1299/s1300 standard — a green alone is not evidence about a red):

| Arm | Reported |
|---|---|
| Manufactured failure at `4_000` | `(5.2s)` then `Test timeout of 4000ms exceeded.` |
| Restored `45_000` | desktop `(12.6s)`, mobile `(12.4s)` |

So `test.setTimeout` demonstrably **governs this test** and is not shadowed or misplaced — the failure message names the injected value, which is the only thing that proves the statement is live rather than decorative.

**Lane-shell baseline on the record (scope 4):** target measured `(13.6 s)` desktop / `(10.8 s)` mobile, full suite `24 passed (2.0 m)`. Against this drain's fire-shell `36.3 s` / `31.7 s` and `3.8 m`, the per-job ceiling ratio is **~2.7× desktop / ~2.9× mobile** — consistent with F-1269-1's ~2× and with s1630's 111.71 s vs 216 s suite measurement. The two shells are different instruments; this slice exists only because of the gap.

## Findings

**F-1631-1 (non-blocking, banked as evidence — no corrective owed).** F-1630-1's "27.2 s / 90.7 % of budget / 2.8 s of margin" is a **single sample presented as a property**. Re-measured on the merged tree: 36.3 s desktop / 31.7 s mobile, i.e. the test was over the 30 s budget on both projects, and which project reds varies run to run. The cure's 45 s is correctly sized regardless. The reusable lesson: **when a measurement is used to size a budget, one sample sets the floor, not the value** — quote the arm as well as the number, because "the desktop arm passed" was true in the control and false on the merged tree an hour apart, with no code difference between them.

No blocking findings. Firewall fully honoured; nothing outside the one test body changed.

## Merge classification

Single file, single hunk, additive only.

| File | Class | Resolution |
|---|---|---|
| `e2e/m1-06-level-up-choices.spec.ts` | **LANE-TOUCHED** (+2/−0) | Main had not moved this file since the lane's base `8ee24e530 (archive: pruned by the A3 rewrite)`; `ort` merged with no conflict. Verified post-merge: exactly two `setTimeout` hits, ratio assertion at `:203` unchanged. |

`git log main..lane/a` is now **empty** and `lane-usable lane-a` reads `ahead=0` **USABLE** — the lane is drained and free to refill.

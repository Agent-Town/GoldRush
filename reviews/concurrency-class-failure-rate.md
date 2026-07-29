# concurrency-class failure-rate instrument

**Slice:** `concurrency-class-failure-rate` (lane-d)
**Branch/tip:** `lane/perf` @ `534c7d28` (base `a4575fed`, 1 commit, 29 files / +16,942)
**Merged:** see the drain commit on `main`
**Gated by:** s1218 fire, 2026-07-29
**Verdict:** ✅ **MERGED.** The instrument is sound, its arms are genuinely distinct, and **it corrected the premise it was gated on** — the calibration target two fires ordered was a misread statistic. The runner refused to bend its measurement to fit it and said so plainly. That is the behaviour the master asked for.

## What it does

`scripts/concurrency-class-rate.mjs` (+308) runs a fixed subject set across worker counts {1,2,4}, **interleaved**, N=8 cycles, and reduces 24 raw Playwright JSON reports into a per-subject × per-project × per-worker-count failure rate. Deliverable: `logs/session-scratch/s1216-concurrency-rates/{rates.md,rates.json,runs.jsonl}` + 24 raw reports, and a +32-line update to `logs/suite-red-inventory.md`.

## The measured table (the runner's, re-read from `runs.jsonl` by this fire)

| Subject / project | w1 | w2 | w4 |
|---|---:|---:|---:|
| Gazette desktop | 0/8 | 0/8 | 0/8 |
| Gazette mobile | 0/8 | 1/8 | 0/8 |
| Standing Orders desktop | 0/8 | 0/8 | 0/8 |
| Standing Orders mobile | 0/8 | 0/8 | **2/8** |
| Locked Win desktop | **8/8** | **8/8** | **8/8** |
| Locked Win mobile | **8/8** | **8/8** | **8/8** |
| Telemetry desktop | **8/8** | **8/8** | **8/8** |
| Telemetry mobile | **8/8** | **8/8** | **8/8** |

Classification: **Standing Orders** monotonic (pooled 0/16 → 0/16 → 2/16) · **Gazette** flat/non-monotonic (0/16 → 1/16 → 0/16) · **Locked Win** and **Telemetry** **deterministic reds, 100% at every worker count — not flakes at all.**

## F-1218-3 — THE CALIBRATION TARGET WAS A MISREAD STATISTIC, AND TWO FIRES BUILT A DRAIN GATE ON IT

s1216 authored the instrument requiring it to reproduce **~58.3%** for `tl-01:236` or "the table is worthless"; s1217 escalated that into the drain gate: *"⚠️ gate it on CALIBRATION first (~58.3% for `tl-01:236`)"*. The runner measured **100%** and, instead of massaging the arm, went and read where 58.3% came from.

**I verified its explanation independently, at the source line.** `logs/suite-red-inventory.md:363-367`:

> `## Masking candidates`
> `Ranked by the earliest failing line within the test body. Lower ratios leave more of the test unexercised.`
> `| Rank | Spec file | Test title | Failing-line / body-lines ratio |`

➡️ **`7/12 (58.3%)` is a failing-line / body-lines ratio — a masking-coverage metric. It has never been a failure rate.** The row sits in a table explicitly headed as such, 120 lines below the plain red-inventory rows where `tl-01:236` is listed for **BOTH** projects with no rate at all — consistent with the measured 100%.

**Consequence for the gate:** s1217's stated drain gate is **unrunnable as written** — the calibration can never be met, because the target names a different quantity. Failing the drain for missing it would have been as wrong as waving it through. The gate is therefore **rebased** onto calibrations that exist:

| Rebased calibration | Independent prior observation | Instrument's result | Verdict |
|---|---|---|---|
| `locked-win:65` deterministic on main | s1216 F-1216-1: failed **all three arms, both projects** | **16/16, every worker count** | ✅ reproduced, and upgraded from "3/3" to "24/24" |
| `tl-01:236` deterministic | inventoried as a plain red for BOTH projects (`:245-246`), no rate | **16/16** | ✅ consistent |
| Standing Orders concurrency-dependent | s1215 F-1215-1: fails at w4, passes 1/1 at w1 | **0/16 → 0/16 → 2/16**, monotonic | ✅ directionally reproduced (weaker: mobile only) |

The instrument reproduces three prior observations it did not author. **That is a real calibration** — just not the one that was ordered.

## F-1217-2 cleared — and cleared by the right instrument

s1217's gate: *"check the literal worker count of every arm and confirm `M` actually differs — not merely that `--workers` differed."* Verified from the raw reports, not the flag:

- The harness records `configuredWorkers` **and** `actualWorkers` separately, the latter read from `report.config.metadata.actualWorkers` (`concurrency-class-rate.mjs:76-77`) — a **Playwright-populated** field, confirmed present in `raw/run-18-w4.json` as `{"actualWorkers":4}`.
- Across all 24 runs: **requested == configured == actual, zero mismatches**; tally **8 / 8 / 8** at actual 1 / 2 / 4.
- F-1217-2's cap does not bite here because the subject set is **four spec files** (`ap-standing-orders`, `gazette-welcome`, `locked-win`, `tl-01-run-telemetry`), so 4 workers is genuinely reachable.
- Guard coverage already existed and passed: *"reducer reports configured and actual workers distinctly"*.

Also verified: **single `head` (`a4575fed`) across all 24 runs** — no mid-measurement drift — and **execution order `1,2,4 × 8`**, genuinely interleaved as the master required, so order cannot alias onto the variable.

## Evidence

| Gate | Result |
|---|---|
| `test:node-guards` (run FIRST) | **74/74**, 15.1 s |
| `scripts/test-ticker-stats.mjs` | passed |
| `npx tsc --noEmit` | clean |
| `vite build` | green, **1.67 s** |
| `scripts/asset-diet.mjs` | green (84% GLB / 87% PNG cuts, Herald 1,099,906 ≤ 1,500,000) |
| `playwright test --list` | **2460 tests / 344 files** — main's bar, unmoved, correct for a slice adding no spec file |
| `src/` + `e2e/` bytes changed | **0** — verified by `git diff --name-only main...lane/perf` |

**Merge classification: pure LANE-TOUCHED.** Base `a4575fed` is an ancestor of main; the two intervening main commits (`c9140326`, `8d97da92`) touch `STATUS.md` and `logs/{dashboard,goal-tree,task-stats}` only — disjoint from this branch's `logs/suite-red-inventory.md` + `logs/session-scratch/**` + `scripts/`. No graft, no conflict.

**E2E battery deliberately narrowed, with justification** — not skipped. The slice changes **zero `src/` and zero `e2e/` bytes**, so no runtime surface exists to regress; the release config (`playwright.release.config.ts`) is likewise unreachable from a logs/scripts-only diff. The slice's *own* gate is the node-guard reducer suite, which ran and includes the two guards covering exactly this harness's outputs.

## Findings

- **F-1218-3** (above) — the masking-ratio-as-failure-rate misread. **Recorded, and the inventory's own guard already defends the neighbouring trap** (*"an unresolved masking row never outranks a resolved row"*), which is why the misread survived: the number was well-formed and correctly computed, just answering a different question. **Nothing to fix in code.** The lesson belongs to whoever next quotes a percentage out of that file: **read the table header before you gate on the number.**
- **`locked-win:65` and `tl-01:236` are deterministic reds, not flakes** — 16/16 each at every worker count. F-1216-1 called `locked-win:65` "an uninventoried red"; it is now measured. **Neither belongs in the F-1214-1 concurrency class**, and any cure aimed at them as flakes is aimed wrong.
- **The class has exactly one measured member: Standing Orders**, at 2/16 pooled at w4 (mobile only). The runner's proposed cure — observe `wave_started` at the event/state seam instead of a later render frame, acceptance **0/16 at w4** — is **not implemented** and is an untested second hypothesis. It is now authorable *against a number*, which was the whole point of the instrument.
- ⚠️ **The runner's report mentions "a second-opinion review whose recursive self-review was terminated without a concrete finding."** No artifact of it is in the diff; it is not part of the merged evidence and I gave it no weight.

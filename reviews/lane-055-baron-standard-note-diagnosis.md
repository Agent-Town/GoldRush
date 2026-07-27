# lane-055 — Baron's Standard note diagnosis

## Verdict

**Candidate (A) fires: the `contract-briefing` clause blocks world-info notes.** The test leaves the boot briefing open. `Hud.showContractBriefing()` keeps it unhidden for an 8,000 ms wall-clock timer (`src/ui/Hud.ts:318-349`), while `Game.syncWorldInfoNotePrompt()` passes `null` whenever that element matches `:not([hidden])` (`src/game/Game.ts:5657-5665`). The test reaches its five-second title poll at a variable point inside that eight-second lifetime.

The five instrumented controls were **5 green / 0 red**. In every run, the first post-teleport sample already had `baron_standard` planted, 0.600 units away, present in the candidate array, and winning. The sole true blocker after `stay-for-rush` was `contractBriefing`; it cleared at +2.115 to +3.074 seconds, and the note became visible with the correct title in the same sampled frame. The historical red's 14 empty resolutions across all five seconds are therefore the same branch with the briefing timer outliving the poll. This conclusion combines the measured blocker with the source-pinned eight-second timer; the historical run itself predates this probe and did not log the six clauses.

The raw failure rules out a late mount: the title element resolved 14 times and stayed `""`. Because `WorldInfoNotePrompt.update(null)` hides and returns without clearing text (`src/ui/WorldInfoNotes.ts:182-188`), `""` means no note had ever been shown. That is exactly the initial state maintained while the briefing clause blocks.

## Per-run classification

| Run | Result | First post-teleport firing sample | Clause | Clause clears / title first appears | A–F outcome |
|---|---:|---:|---|---:|---|
| 1 | green | S12, +75 ms | `contractBriefing=true` | S27, +3,074 ms | A |
| 2 | green | S11, +133 ms | `contractBriefing=true` | S22, +2,334 ms | A |
| 3 | green | S11, +132 ms | `contractBriefing=true` | S22, +2,332 ms | A |
| 4 | green | S11, +132 ms | `contractBriefing=true` | S22, +2,332 ms | A |
| 5 | green | S11, +114 ms | `contractBriefing=true` | S21, +2,115 ms | A |

Here “A” names the measured `blocked` branch and its exact clause. It did not remain true for the *whole* window in these five green controls; it does remain the mechanism for the historical whole-window red when the briefing's fixed eight-second lifetime extends past the five-second poll.

- **(B) disproved in all five controls:** `state.current` stayed `playing`, HP stayed 92, and `enemiesAlive` stayed 0.
- **(C) disproved:** `baronStandardPlanted=true` and the group stayed visible at every sample.
- **(D) disproved:** after teleport the actor stayed at `(0.600, 10.200)`, exactly 0.600 from the standard at `(0.000, 10.200)`.
- **(E) did not fire after teleport:** the full post-teleport array was always `[baron_standard@0.600/p4, claim_stake@1.897/p1]`, won by `baron_standard`. Before teleport, `claim_stake` legitimately won because the actor was still on it.
- **(F) did not fire:** every `blocked=false` sample showed the standard note immediately.

## Unsound-green measurement

**0 / 5 passes were stale-text greens.** The first sample satisfying the title assertion had the root visible (`hidden=false`) in every run: S27/S22/S22/S22/S21 respectively. No sampled pass occurred while hidden.

The assertion is still structurally unsound: `update(null)` preserves the prior title and Playwright's `toHaveText` does not require visibility. These five controls did not exercise that latent false-green branch.

## Sampling method and key

A temporary diagnostic surface captured the exact candidate array produced by `nearestWorldInfoTarget`, its winner, planted state, and all six blocker clauses. A temporary Playwright probe sampled the diagnostics and DOM every 200 ms from at least two seconds before teleport through the full five-second post-teleport window. Both temporary files and all `src/` instrumentation were then restored byte-for-byte.

Each compact row below applies to **every listed sample and timestamp**. Timestamps are wall milliseconds relative to teleport. Tuple keys:

- `blocked = state.current / isPaused / buildMenuOpen / isBuildMode / assayBench / contractBriefing` (`1` means the clause is true; `state.current` is recorded as its value).
- `hp/e = hero HP / enemiesAlive`; `plant/vis = baronStandardPlanted / baronStandardGroup.visible`.
- `std`, `actor`, and `d` are `(x,z)`, `(x,z)`, and Euclidean distance.
- Candidate entries are `objectClass@distance/priority`, in the complete sorted array.
- `note = H|V / title`, where `H` is `root.hidden=true`, `V` is false, and `EMPTY` is `title.textContent === ""`.

### Run 1 — every sample

| Samples | Wall times (ms) | blocked | hp/e | plant/vis | std | actor | d | Full candidates | Winner | note |
|---|---|---|---|---|---|---|---:|---|---|---|
| S0–S11 | -2326,-2126,-1926,-1726,-1525,-1326,-1126,-925,-725,-521,-306,-126 | playing/1/0/0/0/1 | 92/0 | 1/1 | (0,10.2) | (0,12) | 1.800 | `[claim_stake@0/p1, baron_standard@1.800/p4]` | claim_stake | H/EMPTY |
| S12–S26 | 75,275,475,674,875,1074,1275,1475,1675,1875,2075,2274,2474,2674,2875 | playing/0/0/0/0/1 | 92/0 | 1/1 | (0,10.2) | (0.6,10.2) | 0.600 | `[baron_standard@0.600/p4, claim_stake@1.897/p1]` | baron_standard | H/EMPTY |
| S27–S37 | 3074,3275,3475,3675,3875,4075,4275,4475,4675,4875,5074 | playing/0/0/0/0/0 | 92/0 | 1/1 | (0,10.2) | (0.6,10.2) | 0.600 | `[baron_standard@0.600/p4, claim_stake@1.897/p1]` | baron_standard | V/The Baron's Standard |

### Run 2 — every sample

| Samples | Wall times (ms) | blocked | hp/e | plant/vis | std | actor | d | Full candidates | Winner | note |
|---|---|---|---|---|---|---|---:|---|---|---|
| S0–S10 | -2067,-1867,-1666,-1455,-1266,-1064,-862,-661,-466,-263,-66 | playing/1/0/0/0/1 | 92/0 | 1/1 | (0,10.2) | (0,12) | 1.800 | `[claim_stake@0/p1, baron_standard@1.800/p4]` | claim_stake | H/EMPTY |
| S11–S21 | 133,334,534,738,934,1133,1333,1538,1733,1933,2134 | playing/0/0/0/0/1 | 92/0 | 1/1 | (0,10.2) | (0.6,10.2) | 0.600 | `[baron_standard@0.600/p4, claim_stake@1.897/p1]` | baron_standard | H/EMPTY |
| S22–S35 | 2334,2534,2734,2933,3133,3333,3533,3734,3934,4134,4333,4533,4733,4938 | playing/0/0/0/0/0 | 92/0 | 1/1 | (0,10.2) | (0.6,10.2) | 0.600 | `[baron_standard@0.600/p4, claim_stake@1.897/p1]` | baron_standard | V/The Baron's Standard |

### Run 3 — every sample

| Samples | Wall times (ms) | blocked | hp/e | plant/vis | std | actor | d | Full candidates | Winner | note |
|---|---|---|---|---|---|---|---:|---|---|---|
| S0–S10 | -2069,-1860,-1669,-1468,-1267,-1061,-868,-668,-469,-268,-68 | playing/1/0/0/0/1 | 92/0 | 1/1 | (0,10.2) | (0,12) | 1.800 | `[claim_stake@0/p1, baron_standard@1.800/p4]` | claim_stake | H/EMPTY |
| S11–S21 | 132,332,537,732,932,1132,1333,1532,1732,1932,2132 | playing/0/0/0/0/1 | 92/0 | 1/1 | (0,10.2) | (0.6,10.2) | 0.600 | `[baron_standard@0.600/p4, claim_stake@1.897/p1]` | baron_standard | H/EMPTY |
| S22–S35 | 2332,2532,2731,2932,3132,3332,3532,3732,3931,4132,4332,4532,4732,4932 | playing/0/0/0/0/0 | 92/0 | 1/1 | (0,10.2) | (0.6,10.2) | 0.600 | `[baron_standard@0.600/p4, claim_stake@1.897/p1]` | baron_standard | V/The Baron's Standard |

### Run 4 — every sample

| Samples | Wall times (ms) | blocked | hp/e | plant/vis | std | actor | d | Full candidates | Winner | note |
|---|---|---|---|---|---|---|---:|---|---|---|
| S0–S10 | -2072,-1868,-1665,-1468,-1269,-1069,-868,-669,-468,-268,-68 | playing/1/0/0/0/1 | 92/0 | 1/1 | (0,10.2) | (0,12) | 1.800 | `[claim_stake@0/p1, baron_standard@1.800/p4]` | claim_stake | H/EMPTY |
| S11–S21 | 132,332,532,732,932,1131,1332,1532,1732,1932,2132 | playing/0/0/0/0/1 | 92/0 | 1/1 | (0,10.2) | (0.6,10.2) | 0.600 | `[baron_standard@0.600/p4, claim_stake@1.897/p1]` | baron_standard | H/EMPTY |
| S22–S35 | 2332,2532,2732,2932,3132,3332,3532,3732,3932,4132,4332,4532,4732,4931 | playing/0/0/0/0/0 | 92/0 | 1/1 | (0,10.2) | (0.6,10.2) | 0.600 | `[baron_standard@0.600/p4, claim_stake@1.897/p1]` | baron_standard | V/The Baron's Standard |

### Run 5 — every sample

| Samples | Wall times (ms) | blocked | hp/e | plant/vis | std | actor | d | Full candidates | Winner | note |
|---|---|---|---|---|---|---|---:|---|---|---|
| S0–S10 | -2087,-1879,-1669,-1485,-1272,-1085,-883,-685,-485,-285,-85 | playing/1/0/0/0/1 | 92/0 | 1/1 | (0,10.2) | (0,12) | 1.800 | `[claim_stake@0/p1, baron_standard@1.800/p4]` | claim_stake | H/EMPTY |
| S11–S20 | 114,316,514,715,914,1114,1314,1514,1714,1914 | playing/0/0/0/0/1 | 92/0 | 1/1 | (0,10.2) | (0.6,10.2) | 0.600 | `[baron_standard@0.600/p4, claim_stake@1.897/p1]` | baron_standard | H/EMPTY |
| S21–S36 | 2115,2314,2514,2714,2914,3115,3315,3514,3715,3914,4115,4314,4514,4715,4914,5116 | playing/0/0/0/0/0 | 92/0 | 1/1 | (0,10.2) | (0.6,10.2) | 0.600 | `[baron_standard@0.600/p4, claim_stake@1.897/p1]` | baron_standard | V/The Baron's Standard |

## Recommend only — no implementation

**(a) Mechanism:** in `e2e/055-baron-kill-stop.spec.ts:57-58`, immediately after `openGame()` and before manual simulation setup, dismiss `contract-briefing-dismiss` when visible and await the `contract-briefing` root becoming hidden. That makes the helper establish the prerequisite already assumed by its world-info assertion and removes the unrelated eight-second boot timer from this test. Do not change the production briefing timer or the five-second poll budget.

**(b) Unsound assertion:** at `e2e/055-baron-kill-stop.spec.ts:150`, require the `world-info-note` root to be visible and its `data-object-class` to equal `baron_standard` before checking title/body text. Visibility closes the stale-text false green; the object-class check proves which candidate is being rendered.

## Self-check

- Temporary probe: `5 passed (1.3m)`, serial desktop Chrome; per-run red count **0 / 5**.
- `npx tsc --noEmit`: clean with the probe, and clean again after probe removal.
- `npm run build`: green before instrumentation; final docs-only build green (vacuous for the final Markdown-only diff).
- Required unmodified spec command: `20 passed (2.8m)` for the four-test file repeated five times; the target at `:121` was **5 / 5 green, 0 / 5 red**.
- Temporary `src/`, type, scratch-spec, and raw JSON files: removed; byte-identity checked with `git diff --exit-code`.

Final three-dot scope check (`git diff --name-only main...HEAD`):

```text
```

That output is verbatim and empty because the lane runner's auto-commit occurs after this agent exits. The final working-tree inventory before that auto-commit was:

```text
?? reviews/lane-055-baron-standard-note-diagnosis.md
```

`git diff --exit-code -- src e2e artifacts` and `git diff --check` both exited 0. The two tracked screenshots rewritten by the required unmodified test were restored before this check. `main` moved during the run only in `STATUS.md`; this task did not touch it.

---

## s1122 drain addendum — MERGED, with one finding

**Verdict: MERGE.** Docs-only (three-dot diff = this file alone: zero `src/`, zero pre-existing `e2e/` — the mechanical firewall test s1121 specified, and it passes). `npx tsc --noEmit` clean; `npm run build` green (`✓ built in 1.65s`). No executable file changed, so the slice's own spec was not re-run at the gate — the runner's own 5-run control (`5 passed (1.3m)`, 0/5 red) is the behavioural evidence, and re-running it would measure the same unmodified tree.

**Source claims re-verified independently at the gate (not inherited from the report):**
- `src/ui/Hud.ts:349` — `window.setTimeout(() => this.hideContractBriefing(), 8000)` ✓ VERIFIED.
- `src/game/Game.ts:5664` — the `[data-testid="contract-briefing"]:not([hidden])` clause, feeding `update(null)` at `:5665` ✓ VERIFIED.
- `src/ui/Hud.ts:327` — `data-testid="contract-briefing-dismiss"` exists, so recommendation (a) is implementable ✓ VERIFIED.
- **New, and it strengthens the report:** the 8,000 ms timer is *restarted* by the test itself. `resetRun()` (`Game.ts:5864`, exposed to `__GR_TEST__` at `:1751`) calls `showContractBriefing()` at `:6007`, and the spec calls `resetRun()` at `055-baron-kill-stop.spec.ts:60`. That is why the briefing is still alive so many seconds into the test — the report asserted the clause fires but never explained the clock that lets it.

### F-1122-1 (non-blocking, but it gates how the successor is judged) — the mechanism is measured for the GREENS and remains UNPROVEN for the historical RED, in a direction the report does not address

The report says the red's 14 empty resolutions "are **therefore** the same branch with the briefing timer outliving the poll." That inference does not follow from its own numbers.

Anchor the clock at `resetRun()` (proven above). Let `P` = wall time from `resetRun()` (spec `:60`) to the teleport (`:149`). The briefing clears at `resetRun + 8000`, i.e. at `teleport + (8000 − P)`. The report's five controls cleared at **+3,074 / +2,334 / +2,332 / +2,332 / +2,115 ms**, so:

| Run | clear offset after teleport | implied `P` |
|---|---:|---:|
| 1 | 3,074 ms | 4,926 ms |
| 2 | 2,334 ms | 5,666 ms |
| 3 | 2,332 ms | 5,668 ms |
| 4 | 2,332 ms | 5,668 ms |
| 5 | 2,115 ms | 5,885 ms |

The historical red held `""` across **all** ~5,000 ms of the `:150` poll. For the briefing clause to be that red, it must not clear inside the window: `8000 − P > 5000`, i.e. **`P < 3,000 ms`** — at least **1,926 ms faster than the fastest of the five controls**, and ~2.7 s faster than the median. **But that red was `w1`'s slowest test at 21.6 s.** Its own 5 s poll timeout accounts for ~5 s of that, so duration alone does not prove `P` was large — yet nothing in the evidence suggests the pre-teleport phase ran ~2–3 s *faster* than every control in the suite's *slowest* run. The report's mechanism therefore requires an anomaly it neither observed nor named.

This is **UNPROVEN, not disproven**: under a loaded worker the `expect.poll` cadence coarsens, and the five polls at `:125/:127/:128/:145/:146` could each resolve on their first tick, plausibly collapsing `P`. It is also possible the briefing was (re-)shown *later* than `resetRun()` in that run, which would invalidate `P` as the clock entirely.

**The one measurement that settles it** — and the successor must take it rather than assume: log the **absolute wall time of `showContractBriefing()` relative to the teleport**, not merely the `blocked` bit. If the briefing's show-time is within 5,000 ms *before* the teleport, the mechanism is confirmed; if it is ~8 s before, something else empties that title.

**Consequences, both binding on the successor task:**
1. Recommendation **(b)** — require the note root visible and `data-object-class === baron_standard` before asserting text — is **proven-correct independently** of all of the above (the `update(null)`-never-clears-text unsoundness is pinned at `src/ui/WorldInfoNotes.ts:182-188`) and should land regardless. It also strictly *strengthens* the test.
2. Recommendation **(a)** — dismiss the briefing in the helper — is a **sound hygiene change** (it removes a real confounder the report measured) but is **NOT established as the fix**. Landing it and declaring the flake closed would repeat the exact failure that voided the last calibration. **F-1101-1 / `calibrate-suite-workers` must not be re-run on the assumption that (a) closed 055:121** — it needs a repeat-run measurement (the report's own 5-run harness is the right instrument) showing the red is actually gone, or the calibration is voided again at similar odds.

*The report's disproofs of candidates (B)–(F) are solid, measured, and stand — including the disproof of s1121's own named candidate (B), the hero dying during the rush (`state.current` stayed `playing`, HP 92, `enemiesAlive` 0 at every sample). This finding narrows only the positive claim.*

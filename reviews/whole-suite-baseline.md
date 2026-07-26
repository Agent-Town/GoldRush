# whole-suite-baseline — the first real attempt to run all 2378 tests

**Slice:** standing warning from s1095 (discharge F-1094-1's residual: `npm test` collects 2378 tests again — but nobody had ever RUN them)
**Fire:** s1101 · **Base:** main `28b16e16` · **Date:** 2026-07-27

## Verdict

🟠 **MIXED, AND THE MIX IS THE POINT.** The whole suite has never been run since collection
was restored. Running it produced ~26% reds — and those reds are **two different things that
look identical in a log**:

- **F-1101-1 — most are the instrument poisoning itself.** `npm test` at its default worker
  count starves its own tests into timeouts. Proven by control: the audio family passes 4/4
  alone.
- **F-1101-2 — a real core survives.** `078-ux-hygiene` fails 3 tests under a single-worker
  control on a quiet machine, with a genuine assertion (not a timeout). That is a live
  regression in focus management, and it has been sitting undetected because nobody could
  run the suite.

Attributing this run without controls would have published ~37 phantom regressions **and**
buried the 3 real ones inside them. Both errors, from one number.

A full baseline (`--workers=4`) is still running detached — see *Handoff*.

### What is NOT yet established (read this before quoting the numbers above)

**The split between the two causes is UNRESOLVED, and the `--workers=4` run does not settle it.**
At ~20 min that rerun sits at **28 red / 116 run (24%)** — statistically indistinguishable from
the 8-worker rate. Two reasons not to conclude "contention was irrelevant" *or* "contention
explains everything":

1. **I contaminated my own rerun.** Both single-worker controls (`051-audio-governor`,
   `078-ux-hygiene`) were executed *while* the w4 baseline was running, against its dev server.
   The w4 red rate is therefore an upper bound measured under extra load I added.
2. **w4 is also much slower** — 116 tests in ~20 min vs 143 in 6 min at w8 — so it is not
   obviously the better instrument either. The right worker count is an open question, not a
   settled recommendation.

What IS proven: the audio family reds are contention (control + corroboration), and the
`078-ux-hygiene` reds are real (control). Everything between those two poles is still
unattributed, and **the honest next step is a clean run on a quiet machine with nothing else
touching it** — not another inference from these logs.

## F-1101-1 — `npm test` at default parallelism is a self-poisoning instrument

**What happens.** `playwright.config.ts` sets no `workers`, so Playwright defaults to
`cores/2` = **8 workers** on this 16-core Mac. Every worker boots a full three.js/WebGL
Chrome against a live vite dev server. The machine cannot carry eight of them.

**Measured, during the s1100-shaped run (`logs/suite-runs/20260727-0348-whole-suite.log`):**

| Signal | Value |
|---|---|
| loadavg (1m) with 8 workers on 16 cores | **34.16** (>2× oversubscribed) |
| chromium processes alive | **71** |
| tests completed at t+1 min / reds | 38 / **3** |
| tests completed at t+6 min / reds | 143 / **37** (~26%) |
| per-test duration, early run | 2–13 s |
| per-test duration, t+6 min | 40–60 s, several at **exactly 30.0 s** (the `timeout: 30_000` ceiling) |

The red count did not grow linearly with tests executed — it **accelerated**, while durations
inflated ~4×. That is starvation, not regression: the suite gets slower as it goes, so
progressively more tests strike the 30 s ceiling.

**The control (the part that makes this a fact, not a theory).** Machine quiesced
(load 35.76 → 10.22, zero leftover chromium), then the reddest spec re-run **alone,
single-worker**:

```
npx playwright test e2e/051-audio-governor.spec.ts --project=desktop-chrome --workers=1

✓ 1 … 20-source sluice mix uses one deduped water loop            (3.6s)
✓ 2 … global voice cap holds and UI displaces low-priority ambience (3.2s)
✓ 3 … gold and hit families share global cooldowns                 (3.4s)   ← RED under contention (11.3s)
✓ 4 … audio-absent stress releases governor slots cleanly          (3.3s)   ← RED under contention (10.4s)
4 passed (15.0s)
```

Both contended reds pass alone, and their durations **collapse from ~11 s to ~3.3 s**. These
tests are fine; the harness was eating them.

**Scope this claim honestly:** the control exonerates the *audio family*, and the `--workers=4`
rerun independently corroborates it (audio absent from its red list). It does **not** exonerate
every red — see F-1101-2, where three survive. The measured effect of contention is that the
red count inflated from a real core to ~37; the exact split is what the running baseline plus
per-red controls will settle.

**Why this matters beyond one run.** Every fire is told to run "the slice's own spec +
adjacent suites". Small batteries stay under the contention threshold, so this defect has been
invisible for the whole life of the drain gate — it only bites at whole-suite scale, which is
precisely the thing s1095 asked for and no one had done. The first fire to do it (s1100) died;
the second (s1101) would have published ~37 phantom regressions into the ledger if it had
trusted the number. This is a **Mistake #4 / claim-verification trap with a 26% false-positive
rate**, armed and waiting for whoever ran the suite next.

**Corrective owed (NOT taken this fire — it is a config change to a gate everyone depends on):**
pin `workers` in `playwright.config.ts` (or a dedicated whole-suite config) so the full-suite
path cannot oversubscribe. Recommendation: `workers: process.env.CI ? 4 : undefined` is the
wrong shape here — CI *is* this Mac. Prefer an explicit `workers: 4` with a comment naming
this finding. Left for an authored master so it gets a gate of its own; a drive-by edit to the
config every drain depends on is not worth the blast radius.

## F-1101-2 — `078-ux-hygiene` has three REAL reds (focus management)

These survive the control that exonerated the audio family, so they are not contention.
Run on the quiesced machine, single worker, against the baseline's dev server
(`GR_CAPTURE_EXTERNAL_SERVER=1`):

```
✘ e2e/078-ux-hygiene.spec.ts:111 › ledger discovery write-back preserves unknown ids
✘ e2e/078-ux-hygiene.spec.ts:130 › ledger Escape closes only the ledger and restores schoolhouse focus
✘ e2e/078-ux-hygiene.spec.ts:151 › contract board focuses Launch on open
1 passed, 3 failed
```

The `:151` failure is a **genuine assertion**, not a ceiling strike — the element is found
immediately and simply never takes focus:

```
> 156 |   await expect(page.getByTestId('contract-launch-the-claim')).toBeFocused();
  waiting for getByTestId('contract-launch-the-claim')
  12 × locator resolved to <button … data-contract-launch="the-claim" data-testid="contract-launch-the-claim">Launch</button>
     - unexpected value "inactive"
```

The button **exists and is correct**; focus never lands on it. All three failures are in the
same family (ledger/board focus + focus restoration), which points at one cause rather than
three. `:111` failed in **1.5 s** in the contended run too — a fast red that was hiding in
plain sight among the slow contention reds, and the reason this was worth chasing.

**Not fixed this fire, and deliberately not diagnosed further:** this is product behaviour in
the town board / ledger UI, it needs a real root-cause pass and a gate of its own, and this
fire's remit was the instrument. Owed: an authored master to root-cause the focus family.
No blind fix — the failing assertion is precise enough that a guess would probably "fix" the
test rather than the behaviour.

## Method note (for the next fire)

**Never attribute a whole-suite red without a single-worker control.** The procedure that
worked, in order:
1. `loadavg` vs `os.cpus().length` — if load > cores, stop reading the reds.
2. Quiesce, confirm zero leftover browser processes.
3. Re-run the individual spec `--workers=1` and compare **both** verdict and per-test duration.
   A duration collapse is as diagnostic as the flip from ✘ to ✓.

## Handoff

A valid baseline is running **detached** (survives fire exits — the fix for what killed s1100):

- pointer file: `logs/suite-runs/CURRENT-RUN.txt` (pid, log, json paths)
- log: `logs/suite-runs/20260727-0405-whole-suite-w4.log`
- json: `logs/suite-runs/20260727-0405-whole-suite-w4.json`
- invocation: `npx playwright test --workers=4 --reporter=list,json`, retries 0 (honest reds)

**The next fire's job:** read the pointer file, tail the log. If the run finished, attribute
each red **individually via the single-worker control above** before writing it down. Reds that
survive the control are real and get F-IDs; reds that vanish are contention and get counted
against F-1101-1's corrective instead.

The superseded contended run is retained as evidence per the RETENTION LAW:
`logs/suite-runs/20260727-0348-whole-suite.log`.

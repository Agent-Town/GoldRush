# Task f2086-1-canyon-connect-census: what does the canyon-works wave-6 deadline actually ASK, and can it be met? (lane-d, prefix "docs:")

**FIRE-AUTHORED (attended review welcome)** — s2086, 2026-08-20.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d.

READ FIRST: AGENTS.md; **`tasks/BACKLOG.md` — the F-E2S-4 row and the F-2070-1 row (find them BY CONTENT, not by line: `grep -Fn "a fire MAY run the census MEASUREMENT" tasks/BACKLOG.md` and `grep -Fn "the census measurement is still UNRUN" tasks/BACKLOG.md`; **each must return AT LEAST ONE hit. Zero means your lane is stale — STOP and report that, do not proceed.** ⚠️ Do NOT test for exactly one: this file's own dispatch row (F-2086-2) quotes both sentences verbatim, so the count is ≥2 on current main and will grow as later findings cite them. A staleness check must be keyed on PRESENCE, never on a corpus count — the authoring fire wrote `-c` equals 1 here, its own ledger commit made that false within the minute, and it caught the rot only by re-running the grep after the splice)**; `artifacts/f2070-canyon-deadline-provenance/REPORT.md` (s2070's provenance measurement — read what it PROVED and what it explicitly did NOT claim); `assets/contracts/epoch-3-voltage/contracts.json` (the canyon-works contract — find the objective by content, `grep -n '"connect"' assets/contracts/epoch-3-voltage/contracts.json`); `specs/epoch-saga/e3-voltage-bundle.md` (the prose clause that is the ORIGIN of the number — `grep -n "the era's teaching contract" specs/epoch-saga/e3-voltage-bundle.md`); `scripts/gr-sim-campaign.mjs` (the instrument: `--player <module> --output <dir> --checkpoint <file>`) and `scripts/gr-sim-campaign.fixture-player.mjs` (a worked example of the order-generator shape).

Pre-flight (LANE-SAFETY): ahead content on main = SAFE DUPE → `git checkout -B lane/d main && git clean -fd`, PROCEED; STOP on un-merged ahead content or foreign edits. F-1266-1 + F-1407-1 exceptions as usual. `npm install --no-audit --no-fund`; `npm run build` green first.

## Why (owner sanction + two dated findings — quoted, not paraphrased)

The owner **deferred** this design fork honestly, verbatim: *"I never played that level ever, I can't really decide on that"*. His deferral came with an explicit standing permission, recorded in the same row: *"a fire MAY run the census MEASUREMENT (fastest possible pylon chain under walk-era economics — a number, zero product change, reversible) so the eventual ruling is informed; the ruling itself waits until the owner has stood on that map."*

**This task is that measurement and NOTHING else.** It changes no product code, takes no fork, and recommends no balance change.

Two findings define the state of the question. **F-E2S-4** (2026-08-09) recorded Sol's gen-2 arm: 10 runs, best optimized route placed **the 6th pylon beacon at 212.77s** against the deadline's **210.03s** close — a **2.77s** miss, with source-inspection showing the miss is irreversible. Sol's own epistemics: *"a bounded negative result, not an F-E2S-3-style proof."* **F-2070-1** (2026-08-19) then refuted the row's *rationale* while leaving that result untouched, and its surviving result is the reason this census matters: **"THE DEADLINE HAS NEVER BEEN CALIBRATED AGAINST ANY ECONOMICS IN ANY ERA"** — nobody ever checked. F-2070-1 also names two things it deliberately left open, and both are yours: *"the census measurement is still UNRUN"*, and *"the row's 330g chain cost is INHERITED, NOT VERIFIED — I did not locate a pylon cost in `src/`"*.

⚠️ **A DISCREPANCY THE AUTHORING FIRE FOUND AND COULD NOT RESOLVE FROM PROSE — RESOLVE IT FIRST, IT MAY DECIDE THE WHOLE QUESTION.** The contract's objective reads `"connect": { "required": 2, "byWave": 6 }` — **two** connections. But F-E2S-4's measurement is phrased around **the 6th pylon beacon**, and the contract lists exactly **six** pylon pairs. If the objective needs 2 connections and Sol measured a 6-pylon chain, then **the 2.77s miss may be a measurement of a harder objective than the contract actually asks**, and the deadline could be comfortably met. It may equally be that `required:2` counts something else. **Read the consumer, do not guess:** find what actually reads `connect` (`grep -rn "connect" src/sim/ src/systems/ src/meta/` and follow it to the code that decides the objective is satisfied). Report which reading is TRUE with the file:line that proves it.

## Scope (each item is a measurement or a citation; none is a product change)

1. **What the objective ASKS.** Resolve the discrepancy above from the CONSUMER code. State plainly: how many connections satisfy `connect`, which pairs count, and what `byWave: 6` is compared against (wave index at completion? elapsed time? the wave's close?). Give file:line for each answer.
2. **What the chain COSTS.** Locate the pylon/beacon cost in `src/` (or in the contract/economy data) and state it. F-2070-1 could not find it and did not re-derive it, so the row's **330g** is an inherited number: either CONFIRM it with a citation or report the real figure. If no such cost exists in code, say so plainly — that is a finding, not a failure.
3. **The census run.** Author a measurement player module at `scripts/f2086-canyon-census-player.mjs` (an order-generator in the `gr-sim-campaign.fixture-player.mjs` shape) that pursues the objective as resolved in (1) as fast as the economics in (2) allow. Run it against `e3-canyon-works` on **at least 2 seeds, 2 runs each**, and record for every run: whether the objective completed, the wave and elapsed time at completion, the deadline close it is measured against, the margin (+/- seconds), and the `eventLogHash`. **Identical seeds must produce identical hashes** — if they do not, the run is not deterministic and the number is not evidence: report that instead of the number.
4. **The report.** Write `artifacts/f2086-canyon-census/census.json` (the raw rows) and `artifacts/f2086-canyon-census/REPORT.md` (the prose, in the house style of `artifacts/f2070-canyon-deadline-provenance/REPORT.md`): what was asked, what was measured, the margin, and — kept strictly separate — what you did NOT establish.

## Firewall

TOUCH-ONLY: `scripts/f2086-canyon-census-player.mjs` (new) · `artifacts/f2086-canyon-census/**` (new) · the done-move of this task file.

NO changes to: **any `src/**`** · **`assets/contracts/**`** (the deadline is the SUBJECT of the measurement — moving it destroys the measurement) · `specs/**` · `e2e/**` · any existing `scripts/*` file · `tasks/BACKLOG.md` · `tasks/goals.json` · `STATUS.md` · `package.json`. **You are measuring a number, not fixing it.** If the census shows the deadline is unmeetable, that is a RESULT to report — the fork belongs to the owner and he has explicitly reserved it.

## Law 2 — honesty outranks completion (binding)

If the objective cannot be pursued honestly — the consumer is ambiguous after real inspection, the harness cannot drive this contract, the runs are non-deterministic, or the cost cannot be located — **STOP and report what you found**. Do NOT invent a routing policy to manufacture a number, and do NOT tune anything to make the deadline reachable. A stop with a clear account is a success here; a number that cannot be trusted is worse than no number. Two recent maps stopped exactly this way and both were right to.

## Self-check (run before reporting)

- `npx tsc --noEmit` clean · `npm run build` green.
- The census command re-run end-to-end, with the actual command line pasted into the report.
- Determinism shown: same seed → same `eventLogHash` across its runs, quoted in `census.json`.
- `git status --short` shows ONLY the TOUCH-ONLY paths. No `src/`, no `assets/`, no spec.
- Confirm in the report that the contract's `connect` block is byte-unchanged (`git diff --quiet assets/contracts/epoch-3-voltage/contracts.json` must be silent).

End: READY-FOR-GATES + report: (a) how many connections the objective actually requires and the file:line proving it, (b) the pylon cost and whether 330g was confirmed or corrected, (c) the margin against the wave-6 close per seed, (d) anything you could not establish.

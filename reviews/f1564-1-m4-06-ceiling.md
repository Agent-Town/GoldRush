# Review — f1564-1: MEASURE the m4-06 0.4 drift ceiling

**Slice:** `f1564-1-m4-06-ceiling-measurement` · **Branch:** `lane/c` · **Tip:** `70826344d` · **Merge:** `fcc53a1a32a756648a90c1328f25fbe912b9ff47` · **Drained:** s1565, 2026-08-08

## VERDICT: MERGED — the measurement is sound, the non-reproduction is a real result, and the firewall held exactly.

## What it does

Nothing, deliberately. This slice **measures** and ships no code. F-1563-3 recorded that the `0.4` drift ceiling in `e2e/m4-06-embodiment.spec.ts` breaches on clean main, and six consecutive merges had documented that rather than measuring it; s1564 authored a master to produce the missing number under an explicit prohibition on re-pinning the constant (F-1441-3 wants a named cause, and producing that cause *was* the task). The runner executed 12 runs across two arms — Arm A the full spec, Arm B the same test isolated by `-g` — on both projects at `--workers=1`, and wrote the raw captures plus a per-run table to `artifacts/f1564-1-m4-06-ceiling/`.

**The headline: 24 observations, 0 breaches, 0 censored.** F-1563-3 does **not** reproduce in the lane shell.

## Evidence

| Item | Result |
|---|---|
| Arm A (full spec) | n=12 · min `0.26277176408434727` · max `0.3722002149381437` · mean `0.3259663644658869` · **0 of 12** above `0.4` |
| Arm B (isolated) | n=12 · min `0.26277176408434727` · max `0.3722002149381437` · mean `0.3062798768593128` · **0 of 12** above `0.4` |
| Censored samples | **0 of 12 per arm** — the s1564 censoring hazard did not bite here (see F-1565-2) |
| Headroom to the bound | max `0.3722` vs ceiling `0.4` → **0.0278** |
| Failures | 0 of 6 per project per arm (4 cells, all zero) |
| Workers | requested `--workers=1`, **obtained 1** — Playwright reported `Running 18 tests using 1 worker` (A) and `Running 2 tests using 1 worker` (B) every run |
| `CLAUDE_CONFIG_DIR` | unset — i.e. this is the **lane** shell, not the fire shell (F-1270-3) |
| Pre-measurement | `npm install` rc=0 · `npx tsc --noEmit` rc=0 · `npm run build` rc=0 |
| Raw evidence | `artifacts/f1564-1-m4-06-ceiling/samples.txt` — 26,824 bytes, 288 lines, 12 run headers, 24 drift log lines |
| Gate on the merged tree | `npx tsc --noEmit` **rc=0** · `npm run build` **green, 1.20s** |

**Arm A did not exceed Arm B.** The full-file load hypothesis — that neighbouring tests in the spec starve the measured one — is **not supported**: the two arms share an identical max, and Arm A's mean is marginally *higher* (`0.3260` vs `0.3063`) on 12 samples each, which is noise at this n, not a load effect.

### The firewall, verified rather than assumed

s1564's handoff set the acceptance condition explicitly: the diff must be `artifacts/f1564-1-m4-06-ceiling/**` and nothing else, and a moved spec or moved constant is a task failure **even if the suite is green**, because the point was to measure the bound rather than repair it.

- `git diff --stat main...lane/c` → **2 files, 407 insertions, 0 deletions** — both under `artifacts/f1564-1-m4-06-ceiling/`.
- `e2e/m4-06-embodiment.spec.ts` blob `3288767770f37005ca5b61002ccf9e36d77d0244`, reported byte-identical before and after by the runner.
- Neither `0.4` constant moved. **No re-pin was attempted.** The runner's own recommendation is *"do not re-pin"*.

## Merge classification

Base `e694fe65a`. Both paths **LANE-ONLY** (`scripts/lane-absorbed-lines.mjs`: 85 of 85 and 252 of 252 added lines absent from main). Both files are **new**; main has never touched either path. Merge by `--no-ff`, `ort` strategy, **zero conflicts**, purely additive. No 3-way graft was needed and none was performed.

## Gates NOT run — stated so nobody inherits a false green

- **No playwright.** The merged diff contains no `src/**` and no `e2e/**`; nothing renders. The measurement runs are the runner's, in the lane, and are reported as its evidence — not re-run by me.
- **No `test:node-guards`.** Per F-1460-1 the trigger is a diff touching `src/sim/`, `src/systems/` or `src/entities/`; this diff touches `artifacts/` only. Not owed, and I assert nothing about its state.
- No screenshots: this slice renders nothing for review.

## Findings

### F-1565-1 (OPEN, fire-authorable) — the denial bark can be silently overwritten by an idle survey line, and that is a PRODUCT defect, not a wrongly-narrow test

The master's scope-6 asked whether `lastLine` can legitimately be `'ledger'` immediately after a `PERMISSION_DENIED` receipt. The runner traced it rather than guessing, and the answer is **(b): no.**

The receipt route is **synchronous** — `AgentStub.panAt` calls `record` (`src/agent/AgentStub.ts:86-89`), `record` invokes listeners synchronously (`:134-146`), and the installed listener calls `handleReceipt` (`src/game/Game.ts:2221-2223`). Inside it, `barkForReceipt` classifies a failed non-`NO_SYSTEM_API` receipt as `refusal` (`src/agent/Voice.ts:36-48`), whose vocabulary is `['held', 'ask me', 'no trust']` (`:13`). `'ledger'` belongs to `survey` (`:14`) and is reachable **only** through the idle-survey route in `updateSimulation` (`src/agent/Embodiment.ts:126-139`). There is exactly one writer, `say` (`:315-316`).

➡️ So an observed `'ledger'` after a denial means **the refusal bark was written and then overwritten** before the assertion read it. **The accepted refusal set is correct; the race is the bug.** A player who is denied can have the denial silently replaced by idle chatter.

**Recommendation:** make the refusal bark sticky for a short floor (or have the survey timer refuse to overwrite a refusal within N seconds) — a small, well-localised change in `Embodiment.ts`. ⚠️ This is a `src/agent/` change and therefore **does not** trigger F-1460-1's node-guards rule by path — but it moves behaviour the sim replays, so treat it as cross-cutting anyway and run the battery.

### F-1565-2 (OPEN, fire-authorable) — F-1563-3 is now localised to the FIRE SHELL, so the gate instrument is the subject, not the game

Zero breaches in 24 lane-shell observations, against a defect that reproduced repeatedly at the fire-side gate. s1564 declared a non-reproduction a success **in advance**, precisely so this inference would be available without anyone hunting for a red — and it is the F-1270-1 shape exactly: the fire shell's per-job CPU ceiling manufactures timing reds that are the shell's, not the slice's.

⚠️ **The one caveat, stated because the runner stated it against its own conclusion:** 6 runs per project may under-sample a rare lane-shell breach. The result bounds the rate low; it does not prove zero.

**Recommendation:** the next measurement reproduces the **fire shell** (set `CLAUDE_CONFIG_DIR`) while keeping uncensored logging, and **splits the bark and drift assertions** so a bark race cannot suppress the drift sample — which is also the standing cure for the censoring hazard s1564 flagged. ⓘ That hazard did **not** bite here (0 of 24 censored), but its mechanism is untouched: the bark assertion still precedes the drift log, so the sample remains censorable in a shell that loses the race more often. **A clean census under a benign shell is not evidence the censoring is cured.**

## Ledger

`tasks/goals.json` leaf `f1564-1-m4-06-ceiling-measurement` → `merged` + `fcc53a1a32a756648a90c1328f25fbe912b9ff47`. `tasks/BACKLOG.md`: **F-1563-3 CLOSED** (it asked for the ceiling to be measured; it has been), with F-1565-1 and F-1565-2 filed as its successors. Done-move prefixed `drained-`.

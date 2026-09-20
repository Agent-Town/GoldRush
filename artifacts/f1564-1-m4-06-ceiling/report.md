# F-1564-1 — M4-06 drift-ceiling measurement

## Result

This lane shell did not reproduce F-1563-3. Both arms completed 6 runs across both projects with no failures, no censored observations, and no `driftAbs` above `0.4`. Arm A's full-file load did not increase the observed maximum above Arm B's isolated control.

## Per-run observations

The Arm column includes the run index while preserving the requested four fields. `pass` means every assertion in the permission-denied test passed. No `fail-bark` row exists, so there is no received `lastLine` to append.

| Arm (run) | Project | Outcome | driftAbs |
|---|---|---|---:|
| A (1) | desktop-chrome | pass | 0.3722002149381437 |
| A (1) | mobile-chrome | pass | 0.31888869531546643 |
| A (2) | desktop-chrome | pass | 0.26277176408434727 |
| A (2) | mobile-chrome | pass | 0.31888869531546643 |
| A (3) | desktop-chrome | pass | 0.3722002149381437 |
| A (3) | mobile-chrome | pass | 0.26277176408434727 |
| A (4) | desktop-chrome | pass | 0.30904530412222725 |
| A (4) | mobile-chrome | pass | 0.30904530412222725 |
| A (5) | desktop-chrome | pass | 0.3722002149381437 |
| A (5) | mobile-chrome | pass | 0.30904530412222725 |
| A (6) | desktop-chrome | pass | 0.3722002149381437 |
| A (6) | mobile-chrome | pass | 0.33233868267175914 |
| B (1) | desktop-chrome | pass | 0.26277176408434727 |
| B (1) | mobile-chrome | pass | 0.3722002149381437 |
| B (2) | desktop-chrome | pass | 0.3026763948510024 |
| B (2) | mobile-chrome | pass | 0.3497942252239167 |
| B (3) | desktop-chrome | pass | 0.26277176408434727 |
| B (3) | mobile-chrome | pass | 0.30904530412222725 |
| B (4) | desktop-chrome | pass | 0.26277176408434727 |
| B (4) | mobile-chrome | pass | 0.3722002149381437 |
| B (5) | desktop-chrome | pass | 0.2833831328784402 |
| B (5) | mobile-chrome | pass | 0.3722002149381437 |
| B (6) | desktop-chrome | pass | 0.26277176408434727 |
| B (6) | mobile-chrome | pass | 0.26277176408434727 |

## Arm statistics

`n` counts project observations: 6 runs × 2 projects per arm. Means cover uncensored samples only.

| Arm | n | Censored | Min | Max | Mean | `driftAbs > 0.4` |
|---|---:|---:|---:|---:|---:|---:|
| A — full spec | 12 | 0 of 12 | 0.26277176408434727 | 0.3722002149381437 | 0.3259663644658869 | 0 of 12 |
| B — isolated | 12 | 0 of 12 | 0.26277176408434727 | 0.3722002149381437 | 0.3062798768593128 | 0 of 12 |

Failure rates, with run denominators:

| Arm | Project | Failures |
|---|---|---:|
| A — full spec | desktop-chrome | 0 of 6 |
| A — full spec | mobile-chrome | 0 of 6 |
| B — isolated | desktop-chrome | 0 of 6 |
| B — isolated | mobile-chrome | 0 of 6 |

## Shell and measurement identity

- `CLAUDE_CONFIG_DIR`: unset.
- Requested workers: `--workers=1`.
- Obtained workers: `1`; Playwright reported `Running 18 tests using 1 worker` in every Arm A run and `Running 2 tests using 1 worker` in every Arm B run.
- Tree measured: clean `main` arrangement at `1eb583277` after the safe lane refresh.
- Arm A command: `npx playwright test e2e/m4-06-embodiment.spec.ts --workers=1`.
- Arm B command: `npx playwright test e2e/m4-06-embodiment.spec.ts --workers=1 -g 'permission-denied receipts do not send the Prospector to the denied target'`.

## Can `lastLine` legitimately be `ledger` immediately after `PERMISSION_DENIED`?

**Answer: (b). `ledger` is a real idle-survey line, but it should not be the line immediately after a denied receipt. Its observed presence there means the denial bark was silently overwritten.**

There is one direct assignment to `lastLine`, through `say`:

> `private say(line: string): void {`  
> `  this.lastLine = line;`

— `src/agent/Embodiment.ts:315-316`

Every route to that writer is visible in the same class:

- Receipt route: `handleReceipt` computes the receipt bark and calls `say`; a denied receipt then returns without assigning movement (`src/agent/Embodiment.ts:110-123`).
- Idle-survey route: `updateSimulation` calls `this.say(agentBark('survey', Math.floor(at)))` when `at >= this.nextSurveyAt` (`src/agent/Embodiment.ts:126-139`).
- Public route: `speak(line)` delegates to `say` (`src/agent/Embodiment.ts:229-231`); its only production caller says `Prospector ready` (`src/game/Game.ts:6480-6491`), not `ledger`.

The receipt route is synchronous. `AgentStub.panAt` records before returning:

> `const receipt = this.surface.tools.pan_at(node);`  
> `this.record(receipt);`  
> `return receipt;`

— `src/agent/AgentStub.ts:86-89`

`record` synchronously invokes each listener (`src/agent/AgentStub.ts:134-146`), and the installed listener immediately calls `this.prospector.handleReceipt(receipt, ...)` (`src/game/Game.ts:2221-2223`). A permission failure therefore reaches `handleReceipt`, whose relevant lines are:

> `const line = barkForReceipt(receipt, this.receiptCount);`  
> `if (line) this.say(line);`  
> `if (!receipt.outcome.ok && receipt.outcome.reason !== 'NO_SYSTEM_API') return;`

— `src/agent/Embodiment.ts:115-117`

`Voice.ts` makes the categories unambiguous:

> `refusal: ['held', 'ask me', 'no trust'],`  
> `survey: ['survey', 'ledger'],`

— `src/agent/Voice.ts:13-14`

And a failed non-`NO_SYSTEM_API` receipt is classified as `refusal` (`src/agent/Voice.ts:36-48`). Thus `ledger` cannot come from the `PERMISSION_DENIED` receipt. It can only become reachable after that synchronous refusal write if an idle simulation update runs and the survey timer is due. The two separate Playwright evaluations at `e2e/m4-06-embodiment.spec.ts:402-403` permit such a browser-frame interleave. The accepted refusal set is correct; the overwrite race is the product defect.

## Recommendation

Treat the `0.4` bound as sound in this lane shell and investigate the fire shell/gate instrument next; do not re-pin. Reproduce the fire shell's CPU ceiling and configuration while retaining uncensored logging, and split the bark and drift assertions so a bark race cannot hide the drift distribution.

This recommendation would be wrong if Arm A's measured **0 of 12 censored**, **0 of 12 above `0.4`**, or **max 0.3722002149381437** is wrong. It may also need revision if 6 runs per project under-sample a rare lane-shell breach, but this task's measured non-reproduction localises the current evidence to the shell difference.

## Verification and retention

- Before measurement: `npm install --no-audit --no-fund` rc=0; `npx tsc --noEmit` rc=0; `npm run build` rc=0.
- Raw evidence: `samples.txt` contains all 12 complete captures with 12 run headers and 24 drift log lines; 26,824 bytes and 288 lines.
- `test:node-guards` was not run and is not owed: this diff touches only `artifacts/`, not `src/sim/`, `src/systems/`, or `src/entities/`.
- No screenshots were required; this slice renders nothing for review. Existing screenshot artifacts rewritten by the full spec were factory churn and were discarded: `artifacts/m4-07/*.png` (4), `artifacts/m4-re-land/*.png` (2), and `artifacts/prospector-presence/*.png` (8).
- `e2e/m4-06-embodiment.spec.ts` remained byte-identical to the clean starting blob: Git blob hash `3288767770f37005ca5b61002ccf9e36d77d0244` before/at start and after measurement.

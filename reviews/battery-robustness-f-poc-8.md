# Drain review — `battery-robustness-f-poc-8`: the node-guards battery bounded against a blocked event loop, the vite-teardown native crash ended at its root, the file watchers retired (attended drain, 2026-09-19)

**Slice/branch/tip:** `fix/battery-robustness` @ `7270b1828` — five commits by a Claude Opus 5 implementer on the owner's Anthropic subscription in a scratch worktree cut from main `de7eacd17`, with its OWN `node_modules` (a real `npm ci`, then the upgrade); master `tasks/battery-robustness-f-poc-8.md`; report `artifacts/battery-robustness/report.md`. **Landed as** `d36c17545` (main merged into the branch's worktree, gated there on the upgraded dependencies, fast-forwarded; then `npm ci` in the primary checkout). The engine hash is unchanged (no `src/`, no contracts).
**Owner words, verbatim:** 2026-09-19 "Anthropic was reset already".

## VERDICT: LANDED — the crash rate went from 19 of 20 runs to 0 of 20 under three times the load; the watchdog bounds a hang the per-test timeout cannot see; the battery is about a quarter shorter

## 1. What landed, measured
| item | before | after |
|---|---|---|
| `rider-parity-retirement.test.mjs` direct runs (20, 120 s cap; crash = signal or rc ≥ 128) | **19 / 20** crashed (SIGBUS + SIGSEGV in the rolldown binding; one `FATAL ERROR: SetAlignedPointerInInternalField` in libuv's `FSReqCallback` — this Homebrew node links the shared libuv) at load 39–45 | **0 / 20** at load 134–141 |
| `open-sea-water.test.mjs` direct runs | 0 / 20 | 0 / 20 |
| vite / `@rolldown/binding-darwin-arm64` | 8.0.13 / 1.0.1 | **8.3.0 / 1.2.9** (`package.json` `^8.3.0`, the lock re-solved) |
| the watchdog (`scripts/run-node-guards.mjs`) | none: a synchronous spin ran 4 h 46 min (F-POC-8) | **TAP-progress watchdog, N = 45 min**: after N with no TAP record, `sample <pid> 3` to the transcript dir, SIGKILL by pid tree from the spawned child (never by pattern), the F-NCB-10 arm re-runs it alone once, `HANG EVIDENCE KEPT`; `GR_NODE_GUARDS_STALL_MS` can only LOWER N (clamped, asserted by execution); dead pids forgotten each tick (pid reuse here is minutes) |
| why 45 and not the master's 10 | the master's "30× the slowest healthy file" premise was false: the slowest healthy unit is `fixture-teardown.test.mjs`'s one synchronous test (880–1,262 s, blocking its own loop — why the 300 s `--test-timeout` never fires on it; 115 guards share the shape); a healthy battery measured **TAP-QUIET MAX 1,085 s (18.1 min)** first-hand | 10 min = 0.55× a healthy silence and would kill a healthy guard every battery (F-1460-1); 45 = 2.5× the largest silence measured, 6.4× tighter than the hang |
| `server.watch: null` | 62 of 71 `createServer` files lacked it (71 − 7 done − 2 that are node:http's, reconciling the "64 of 71") | 62 files / 76 call sites; 0 vite sites lack it |
| full battery wall clock (box never quiet; foreign batteries at start) | 1,306 s (3 foreign; TAP-QUIET MAX 1,085 s) | 1,044 s (3 foreign) → 953 s (9 foreign): **−20 % then −27 %** while the foreign count rose; the last two are the same tree, so ~9 % is run-to-run variance |
| the manufactured hang | — | a `while(true){}` fixture: `TAP-STALL WATCHDOG (F-POC-8): no TAP record for 4s … SIGKILLed … sample: …hang-sample-<pid>.txt` (a 114,887-byte call graph), then the retry stalls and is killed, `failed again (rc=1)`; whole cycle 17 s |
| a live 15-minute-silent healthy child, sampled | — | 0.0 % CPU in `kevent` (a healthy wait) vs the hang's 100 % spin — the discrimination F-POC-8 said it could not make |

**Attribution that matters for the ledger:** the crashing guard already had `watch: null` and already awaited every `ssrLoadModule` before closing, so the teardown-order alternative could not have reached it; a bisect killed a single open → load → close cycle on its own. The upgrade, not the ordering, is the cure.

## 2. Gate table
| gate | implementer (branch, its own node_modules) | drain (main merged in, same worktree) |
|---|---|---|
| tsc / `npm run build` / `GR_RELEASE=e1` | 0 / 0 / 0 on vite 8.3.0 | 0 / 0 / 0 on vite 8.3.0 (the worktree's own `npm ci`) |
| the four runner guards (`node-guards-{signal-retry,timeout,concurrency,contention}`) + the new watchdog guard | green; `contention` environmental (2–9 foreign batteries all session; six spaced retries read 9) | 26/26 — the four runner guards, the new watchdog guard, the era guards and the assay guard |
| full `test:node-guards` × 2 on the tree | run 1: two cancellations (`gr-sim.test.mjs` 90,001 / 30,001 ms budgets under four batteries — green alone at 50.9 s and 3.4 s); runs 2 and 3 clean of signal deaths and TAP stalls | 929 tests: 922 pass / 2 fail / 5 skipped under `CONTENDED — 3 concurrent batteries`: the contention advisory and the fixture sweep's echo of the desk guard's deliberate linked-worktree refusal; NO signal death and NO TAP stall — the first full battery on vite 8.3.0 |
| first-town payload / deploy budget | — | 34,219,619 B on vite 8.3.0 (34,641,316 B on 8.0.13: the new rolldown packs the same first town 421,697 B smaller) |
| engine era | — | unchanged; era guards unchanged, 9/9 |
| the primary checkout after `npm ci` | — | re-installed by the landing (`npm ci`, versions printed in the landing log; the post-landing full battery on main is the proof, recorded in the ledger row that follows) |

## 3. Findings
- **F-BR-1 (cured):** F-NCB-10's root cause is the rolldown native binding shipped with vite 8.0.13; 8.3.0 / 1.2.9 ends it (0 of 40 runs). The F-NCB-10 retry arm stays as the belt.
- **F-BR-2 (cured):** F-POC-8 — a blocked event loop cannot be timed out from inside itself; the runner now watches TAP progress from outside and keeps the sample. Do not raise N.
- **F-BR-3 (measurement):** the master's "30× the slowest healthy file" heuristic was wrong by 2×; measure TAP silence, not test durations, when sizing a watchdog.
- **F-BR-4 (environmental, standing):** `node-guards-contention` asserts an empty board and reddens whenever another battery runs; with three Astra lanes and attended drains on one box it is red most of the day. A fire reads it as advisory; the fixture sweep echoes it.
- **F-BR-5 (ops):** every scratch worktree that symlinks the primary's `node_modules` changes vite under itself when the primary upgrades; the drain sequenced this land after the day's other jobs and re-installs the primary in one step.

## 4. What was touched
`scripts/run-node-guards.mjs` (the watchdog), `scripts/node-guards-watchdog.test.mjs` (new; the manufactured hang), 62 `scripts/*.test.mjs` (`server.watch: null`), `package.json` (vite `^8.3.0`, the stage-1 entry), `package-lock.json`, `artifacts/battery-robustness/**` (the report, the crash runs, the three batteries, the bisect); at the drain this review, `tasks/goals.json`, `tasks/BACKLOG.md`, `STATUS.md`.

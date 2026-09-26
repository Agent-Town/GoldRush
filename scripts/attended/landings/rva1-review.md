## What it does
`river-ending-score-1` landed the River's completed score but held its county post because the assay could not replay a River reel (F-RES1-1) and browser seams followed the URL's seed pin rather than the run's (F-RES1-6). This slice makes the assay replay an `e10-river` reel in the ceremony world (the lever's stamped no-wave Claim, in `scripts/assay-replay.mjs` and the watch path in `src/main.ts`), reads the ceremony's completed score as the verdict's outcome (the worker compares `timeAlive` at 1e-6 against the instrument's microsecond print), and has the headless arm refuse `e10-river` by name. The harvest seams follow the run's seed in form (b): a live seed keeps the constant layout, a pin seeds the seams as it always did, so no live layout moves and every replay lays its own run's seams. Along the way the implementer found and, under a named lift, fixed F-RVA1-1 in its general form: a live solo run moved by raw input axes while its reel recorded them rounded to 1e-3, so any browser reel with a non-cardinal tick (a keyboard diagonal, a phone joystick) drifted 0.001 m and could never verify, since the reel's birth on 2026-07-31; now the live run moves by exactly the axes it records. With those in place `RIVER_STANDING_POSTS_ENABLED` is flipped on in its own final commit: the pan posts one standing carrying the reel, the door stores it pending, the county's own worker verifies it and the Claim Ledger ranks it first. Every existing verified reel, seven replays and all 83 null floors are byte-identical before and after.

## Evidence (the implementer's final battery at `94c0c1a3b`, drain lock, port 5857; base `8f4be3286`; the drain's own gates are appended below)
| Check | Result |
| --- | --- |
| River reels | fresh diagonal-walk reels VERIFIED by the real worker (`eef28ae4` desktop, `10904fbe` phone); the spec's `ef71da37`/`027f7f02` verified through the real door handlers and ranked 1; the four pre-fix reels stay rejected (raw axes never recorded) |
| tampers | gold → "outcome mismatch: gold"; time → "outcome mismatch: timeAlive"; pan tick → eventLogHash mismatch |
| seams | all six River replays lay (-9, 6.7) and (-1.5, -6.4), the live layout; no live layout moves |
| unchanged | heat-15 probe, r1, r2 VERIFIED byte-identical; era-6 agent tape and heat-15 probe identical through the headless arm; seven replays byte-identical base against final; null floors 83 of 83 |
| spec and adjacents | `river-ending-score` 6/6 both projects (one POST at the pan, stored pending, verified, ranked 1; one after a second pan, reload, re-pull); task-025, m2-01, charter-press-totality, live-seed-rotation 54/54 |
| wider set | 50 passed, 18 failed (the same 18 ids red on the base: lantern-true-world x16, pb02-replay-actor x2), 8 skipped |
| guards and batteries | `river-assay.test.mjs` 3/3 (spliced after the runner); the worker's tests 21/21; test:stats rc 0; node-guards 1028 of 1040: the two pre-pin registry rows, the linked-worktree desk guard, ledger-backup-pull x2 and the sweep survivor (no `.env.local`), contention (passes alone) |
| engine hash | `7bfbed8b` (pin #69) → `f6084527…`; 3 of 662 inputs differ (`scripts/assay-replay-agent.mjs`, `src/game/Game.ts`, `src/main.ts`) |
| the human standing | the seed-run standing of 2026-08-20 stops at tick 274 on base and tip: its pauses (F-RVA1-6) and its diagonal ticks (F-RVA1-1); it cannot verify on any engine |

## Merge classification
Base `8f4be3286`; the branch touches `scripts/assay-replay.mjs`, `scripts/assay-worker.mjs`, `scripts/assay-replay-agent.mjs`, `src/main.ts`, `src/game/Game.ts`, `e2e/river-ending-score.spec.ts`, `scripts/river-assay.test.mjs` (new), `package.json` (the roster splice), `artifacts/river-assay-1/**`; main moved on none of them; `git merge-tree` clean. LANE-TOUCHED only. Pinned same-era; the deploy restarts the droplet's assay worker with the new instrument.

## Findings
- **F-RVA1-1 (fixed, general):** live runs consumed raw axes while reels recorded rounded ones; 57 days old; no diagonal-movement reel could verify before.
- **F-RVA1-6 (new, pre-existing, every contract; by the cure):** a pause press is recorded as `set_pause paused:true` and the resume never; a replay stops at the pause; any paused human standing is unassayable today; corrective `tape-pause-fix-1` for Astra queues behind this landing. Decision (attended): the switch stays ON, as the implementer recommends; a paused River run is then no worse than every other contract until the fix lands.
- **F-RVA1-2 (non-blocking):** under manual sim, animation frames step replay sessions while the sim does not; instruments advance in one synchronous call.
- **F-RVA1-3 (observation):** idle agent tapes carry no `agent_orders` and go to the browser arm, unassayable as before.
- **F-RES1-7** still open (a playbook replay that stops early leaves an empty stream).
- Observation: at 390 px the county board clips its Reel column.
- The report file was refused by a hook and committed by the attended session from the final message (`072fe8828`, F-ATT-7).

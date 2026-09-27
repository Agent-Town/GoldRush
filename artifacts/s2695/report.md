# s2695 — Pause replay drain continuation

READY-FOR-GATES — candidate acceptance and pin complete; NOT LANDED or deployed. WHY held: the required post-landing Node command measured 39 minutes, so landing plus that indivisible check is reserved for a fresh fire window. Candidate e7fa70341af6d2d04f84dd0c0cb22473dd80f08e at /Users/robin/.goldrush/fire-s2693/wt-tpf1.

Root cause: a recorded one-way pause stopped run-tape replay permanently. The existing candidate ignores that action during replay only; the fire found no new product defect. Adaptation: reuse s2694's completed Node evidence after proving executable inputs unchanged, then finish the remaining gates without rerunning the capped wrapper.

## Authority and custody

Lock commit f06d75da268e69dda16d629f9d37f4c0e1ace20c; launcher PID 94057, Codex PID 94103. The fresh tasks/.fire.lock directory is this invocation's lock. Attended handover 13z-79 releases tape-pause-fix-1 to fires; primary policy CLEAR. No autonomous dispatch or refill. Drain lock acquired under ~/.goldrush/drain.lock; only the detached candidate is gated. Main was clean except generated logs; unrelated untracked attended landing files were left untouched.

## Verification so far

Current main merged without conflicts into the preserved candidate. evidence-reuse.json proves only 31 bookkeeping/evidence paths changed from s2694's tested candidate; executable and dependency inputs unchanged. Its completed pre-pin Node result and separate npm tail remain applicable. Scratch store clean at landed main 5793a967da46e8f00c0ba16f92f17dc10d36558d.

- Null floors: 83/83 match, rc 0, 335.9 s.
- Halo: 315 cured, 0 held, 760 regenerated-and-cured, 2127 scanned; alpha and opaque RGB unchanged, rc 0, 48.0 s.
- Rotation: r2026w40 opens September 28; skillmd guard 19/19. September 26 ticker exists.
- Runner PID 25494 alive and independent; one done-move and three lane-c commits, no queues/running/orders. Landing/game/API 200 at preflight. Main-slot semaphore verified at scripts/lane-runner-v3.sh:239.
- Private archive visibility verified with gh before due offsite duties. No private mirror data is written into this repository.

Evidence is append-only; all remaining candidate acceptance gates passed.

## s2695 continuation — candidate gates complete; landing held

The preserved tree merged only s2694/main bookkeeping, becoming e7fa70341af6d2d04f84dd0c0cb22473dd80f08e, then received same-era pin #71 in **52cac1459ba53c8c2fb0c56b67cca796b7872fff**. That is the retained candidate at /Users/robin/.goldrush/fire-s2693/wt-tpf1, NOT main. Era remains 6; store remains clean at 5793a967da46e8f00c0ba16f92f17dc10d36558d. The measured engine hash is 2d180e6bad6933ef15db2a006aaa0a1a3be8a97efdf9416cbc4646be71be4f6d. No implementation, assertion, timeout, recorder or simulation rule changed during this fire.

| Gate | Measured result |
| --- | --- |
| Null floors | 83/83 unchanged; rc 0; 335.9 s |
| Halo | rc 0; 48.0 s; 315 cured, 0 held, 760 regenerated-and-cured, 2127 scanned; alpha and opaque RGB unchanged |
| Release suite, owning config | 30/30 passed, both projects; rc 0; 159.1 s |
| Warm-up | 1/1 passed before the browser suite |
| Tape, River, task-025, m1-01, m2-01, live-seed-rotation | 72/72 passed, both projects, workers=1; rc 0; 579.2 s |
| Plain Claim boot | 2/2 passed; desktop 1280x800 and mobile 390x844; no debug parameter; zero console/page errors |
| Fresh pause/resume regression through county worker | Desktop 58d2708a and mobile 00832e01: claimed = replayed, VERIFIED, zero console/page errors |
| Same-era pin measured after acceptance gates | Era 6, pin #71, 2d180e6b; only the replay pause handler moved engine inputs; unchanged store |
| Post-pin engine-era and bench-seeds identities | 9/9 passed, rc 0 |
| Candidate evidence budget | 7.4 MB / 40 MB; whole-tree ceiling remains an existing advisory |

Evidence: artifacts/s2695/remaining-node.txt, release.txt, warmup.txt, browser.txt, pin-identities.txt, pin.json and generated/. The fresh plain-boot JSON and screenshots are under generated/artifacts/sol/open-findings/; both screenshots were inspected. Fresh River proofs and reels are under generated/artifacts/tape-pause-fix-1/spec/. All regenerated tracked files were copied into this fire's evidence before restoring only this fire's test regeneration; new shots were moved intact. Historical lane evidence remains unchanged. No browser reds required a clean-main attribution run. No renderer input changed, so a rendering performance comparison is not applicable.

The s2694 full Node evidence remains valid for these executable inputs: evidence-reuse.json enumerates the 31 incoming bookkeeping/evidence paths, with no executable or dependency changes. Its two pre-pin identity failures are now green in the post-pin check; the complete Node command still MUST run again on main after the fast-forward. That command measured 2349.6 s in s2694, which cannot fit after this increment's gates inside the roughly 35-minute fire budget. The candidate stays in detached custody; main's runtime and registry remain unchanged, goal stays queued, and the done-move remains intact. This is a deliberate fire-window handoff, not a new product finding or a failed gate.

Remaining, in order: recheck policy and merge only classified newer main bookkeeping into the retained candidate; confirm the engine hash and pin are unchanged; update the goal/mergeHash, BACKLOG and review together, rename the done-move, fast-forward and push; run the complete Node command on main directly (never the capped diff wrapper); deploy via the prescribed unwrapped command and verify ASSAYER SYNCED; append the player-visible Gazette item. F-RVA1-6 remains open until landing and deployment.

## Daily duties and closeout

LB-01 attempted at 02:10 UTC, rc 0 but NOT DISCHARGED: September 27 backup did not yet exist on the box. The 34 older mirrors passed exposure checks (1674 keys, no account-class or unrecognised rows), and the private archive already held the series. FM-01 discharged unchanged. No private database entered this repository. RT-01 and TK-01 are already satisfied as verified above. No pending orders, new art, runtime landing, Gazette item, refill or dispatch.

Closeout ledger PASS before the final lock-clearing commit: rc 0, 1263/1263 tests, zero failures/skips; all chained shell legs green; 183.1 s total. The full s2694 predecessor is archived in STATUS and the three-item OWNER'S DESK tail is preserved verbatim.

Main evidence/bookkeeping commit: 157b5162285bbd3ba2a8bb5ad3ecf5b86d9914f4. Lock commit: f06d75da268e69dda16d629f9d37f4c0e1ace20c. Candidate pin commit: 52cac1459ba53c8c2fb0c56b67cca796b7872fff. No main runtime merge occurred.

The owned vite PID 43631 is gone. The drain lock was moved intact to /Users/robin/.goldrush/fire-s2695/drain-lock-released. The launcher retains its own tasks/.fire.lock until this fire exits. The lock-clearing commit is the final write to main; no runtime landing, deploy or further gate is started.

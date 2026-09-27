# s2696 — Pause replay cure lands

READY-FOR-GATES — candidate accepted; landing commit set prepared at `28272092ee10ccf4dc135eb3b01cfcb2b28ed947`. Main full Node, push and deployment results will be appended after measurement.

Root cause: run tapes record a one-way pause. Replay now skips that pacing action; simulation rules and live pause are unchanged. Reused s2693–s2695 gates only after proving no executable or dependency input moved in 81 incoming bookkeeping/evidence paths. No redispatch, assertion edits, timeout changes or extra implementation.

Inherited evidence verified against the retained tree: tsc/build/E1 PASS, payload 34,350,664 B; full Node 1040 tests with 1030 pass, 2 pre-pin identity failures and 8 skips; post-pin identities 9/9; floors 83/83; halo PASS; release 30/30; slice/adjacents 72/72; plain boots 2/2, zero errors. Same-era pin 71 and unchanged landed store remeasured in identity.json. Policy CLEAR and 7.4 MB evidence budget PASS.

Own lock: `75f9a6724`; launcher PID 6539, Codex PID 6589; runner 25494 independent and alive. Attended handover 13z-79 transfers this drain to fires. No new queue dispatch. The done-move is disk-local/ignored and will be renamed on primary immediately after the fast-forward (it is absent from detached git trees).

Remaining in order: fast-forward/push; complete full Node on main; deploy by the unwrapped prescribed command with ASSAYER SYNCED; daily duties; closeout ledger battery before the final lock-clearing commit.

## Landing and daily verification

Fast-forward complete; landing record commit df0f305b94c5113c7e7fa53ddb1c23d9507cf522, ACTIVE refresh 47488c521. Push to origin/main succeeded. Lane-c main..branch is empty; every lane is ahead=0. The ignored done-move was renamed to tasks/done/drained-s2696-20260927-065350-tape-pause-fix-1.md. Full Node started 2026-09-27T02:37:28Z on primary main with Node 26.4.0, file concurrency 1 and the existing watchdog.

VERIFIED: runner PID 25494 alive with PPID 1; queues 0, in-flight 0, pending orders 0; landing/game/API HTTP 200. September 26 ticker exists; r2026w40 opening September 28 is already present. No new art to stage. Main-slot semaphore read at scripts/lane-runner-v3.sh:239.

LB-01 discharged for September 27: today's backup pulled outside the repository, private mirror now has 35 dated files. Strict exposure gate passed before the private archive push. Archive visibility rechecked PRIVATE via gh. FM-01 unchanged/current. No private database or fire-memory contents entered the public working tree. Gazette draft appended for this player-visible cure; publication remains owner-only.

Predecessor s2695 archived byte-for-byte in STATUS; its OWNER'S DESK tail is preserved. No extra drain will start during the indivisible full Node check (the prior measured runtime is 39 minutes).

## Full Node on main — PASS

The exact npm command returned rc 0 in 2524.4 s: primary 1040 tests, 1032 pass, 0 fail, 8 existing skips; final chained test leg 87/87, every intervening shell leg green. All 162 fixture owners passed cleanup in 984.2 s. Maximum TAP silence 980.3 s against the unchanged 2700 s watchdog. Canonical Node 26.4.0 and file concurrency 1. No executable tracked changes were introduced during the run, and the live engine hash was remeasured unchanged.

Observer defect, retained honestly: after recording the successful result, the one-off main-node.mjs assigned the result object to process.exitCode and raised ERR_INVALID_ARG_TYPE (wrapper exit 1). The actual npm child and battery both returned 0, recorded by gate-battery in main-node.txt and main-node-result.json. This is an observer-only reporting error; the full command was neither retried nor waived.

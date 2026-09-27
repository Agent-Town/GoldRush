# s2696 — Pause replay cure lands

READY-FOR-GATES — tape-pause-fix-1 LANDED and DEPLOYED. Main full Node passed; production and all-epochs preview report build 198fae78, and production ASSAYER SYNCED. Closeout ledger result follows below.

Root cause: run tapes record a one-way pause. Replay now skips that pacing action; simulation rules and live pause are unchanged. Reused s2693–s2695 gates only after proving no executable or dependency input moved in 81 incoming bookkeeping/evidence paths. No redispatch, assertion edits, timeout changes or extra implementation.

Inherited evidence verified against the retained tree: tsc/build/E1 PASS, payload 34,350,664 B; full Node 1040 tests with 1030 pass, 2 pre-pin identity failures and 8 skips; post-pin identities 9/9; floors 83/83; halo PASS; release 30/30; slice/adjacents 72/72; plain boots 2/2, zero errors. Same-era pin 71 and unchanged landed store remeasured in identity.json. Policy CLEAR and 7.4 MB evidence budget PASS.

Own lock: `75f9a6724`; launcher PID 6539, Codex PID 6589; runner 25494 independent and alive. Attended handover 13z-79 transfers this drain to fires. No new queue dispatch. The done-move is disk-local/ignored and will be renamed on primary immediately after the fast-forward (it is absent from detached git trees).

Initial checklist: fast-forward/push, main full Node, deploy and sync, and daily duties are now complete. The final ledger battery and lock-clearing commit close this fire.

## Landing and daily verification

Fast-forward complete; landing record commit df0f305b94c5113c7e7fa53ddb1c23d9507cf522, ACTIVE refresh 47488c521. Push to origin/main succeeded. Lane-c main..branch is empty; every lane is ahead=0. The ignored done-move was renamed to tasks/done/drained-s2696-20260927-065350-tape-pause-fix-1.md. Full Node started 2026-09-27T02:37:28Z on primary main with Node 26.4.0, file concurrency 1 and the existing watchdog.

VERIFIED: runner PID 25494 alive with PPID 1; queues 0, in-flight 0, pending orders 0; landing/game/API HTTP 200. September 26 ticker exists; r2026w40 opening September 28 is already present. No new art to stage. Main-slot semaphore read at scripts/lane-runner-v3.sh:239.

LB-01 discharged for September 27: today's backup pulled outside the repository, private mirror now has 35 dated files. Strict exposure gate passed before the private archive push. Archive visibility rechecked PRIVATE via gh. FM-01 unchanged/current. No private database or fire-memory contents entered the public working tree. Gazette draft appended for this player-visible cure; publication remains owner-only.

Predecessor s2695 archived byte-for-byte in STATUS; its OWNER'S DESK tail is preserved. No extra drain will start during the indivisible full Node check (the prior measured runtime is 39 minutes).

## Full Node on main — PASS

The exact npm command returned rc 0 in 2524.4 s: primary 1040 tests, 1032 pass, 0 fail, 8 existing skips; final chained test leg 87/87, every intervening shell leg green. All 162 fixture owners passed cleanup in 984.2 s. Maximum TAP silence 980.3 s against the unchanged 2700 s watchdog. Canonical Node 26.4.0 and file concurrency 1. No executable tracked changes were introduced during the run, and the live engine hash was remeasured unchanged.

Observer defect, retained honestly: after recording the successful result, the one-off main-node.mjs assigned the result object to process.exitCode and raised ERR_INVALID_ARG_TYPE (wrapper exit 1). The actual npm child and battery both returned 0, recorded by gate-battery in main-node.txt and main-node-result.json. This is an observer-only reporting error; the full command was neither retried nor waived.

## Production — DEPLOYED and SYNCED

The unwrapped prescribed deploy was admitted and returned rc 0. Production build **198fae78** was verified at the alias; **ASSAYER SYNCED** (services restarted, mirror 1684 MB). E1 payload **34,350,580 / 52,000,000 B**. Its non-gating browser tripwire initially measured nothing because 5297 was occupied; an unrelated 5298 listener also existed. Neither was stopped. On free port **62736**, the serial replacement passed warm-up 1/1 and desktop/mobile 2/2, both **15,180,965 B** against 30,000,000 B (settled 25,781,287 B), zero watched errors. Original refusal retained in deploy.txt; replacement in transfer-probe.txt; the two regenerated transfer JSONs were copied under generated/asset-diet before restoring historical tracked evidence.

F-RVA1-6 closed in the ledger. No re-assay or player-data mutation was performed. The device-verdict warning is the inherited B1 item and the three-item OWNER'S DESK tail remains unchanged. Gazette draft updated for the deployed result; publication stays owner-only.

## All-epochs preview and final state

The preview build used the retained detached candidate after proving its complete source/assets/public/functions/server/scripts/dependency/build-config input set identical to main. Its prior dist was moved intact to ~/.goldrush/fire-s2696/candidate-prior-dist. Full build rc 0 in 22.1 s; branch deployment rc 0, 32 uploaded files and 3144 reused. This avoids deleting or resyncing an attended staging tree. Preview alias and production alias each returned HTTP 200 and version 198fae78; live-verification.json records both. Preview URL: https://1b46bde7.gold-rush-3in.pages.dev.

The board probe returned 0 real drains, 0 unknown and all subjects merged or closed; all four lane branches are ahead=0. No refill or redispatch under CODEX-WALL. No additional drain was started after the long indivisible main Node command. Its 42-minute runtime carried this fire beyond the nominal window; the check completed rather than being interrupted and handed off again.

Commits: lock 75f9a6724; accepted content merge 28272092ee10ccf4dc135eb3b01cfcb2b28ed947; landing records df0f305b94c5113c7e7fa53ddb1c23d9507cf522; same-era pin 52cac1459ba53c8c2fb0c56b67cca796b7872fff; full main evidence / published build 198fae7800e3a95f7a6d6129d5314a1a79acd825. The final closeout commit writes lock CLEARED and is this fire's last write to main.

REMAINING LIST IN ORDER: closeout ledger battery, then the final lock-clearing commit/push. No implementation, deploy, preview, backup or assay-sync work remains. Existing owner items remain the same three: account-registry deploy day; B1 device verdict; token revocation. Gazette/ticker publication stays owner-only.

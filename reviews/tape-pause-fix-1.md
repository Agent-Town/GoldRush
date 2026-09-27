# Drain review: tape-pause-fix-1 — replay tolerates recorded pauses

**Verdict: ACCEPTED FOR LANDING — candidate gates complete; s2696 records the landing below. Main post-landing full Node and deployment are pending until measured.**

s2693 fire, 2026-09-27. Lane `sol/map-art-campaign-2` at `19dc0195fbf72f69d24334dede5538c709b977a5`; fork `3c35d5bed250427a254ab10f1fe22071da44aad2`; main base `49a0479a0cf0b5d0de0d5ca1f1b06c7809242239`; detached candidate merge `63cd904a9b81c2cc62ced7061be263a7cc624fc5`. Candidate worktree: `/Users/robin/.goldrush/fire-s2693/wt-tpf1`. Scratch art store is clean at its landed main `5793a967da46e8f00c0ba16f92f17dc10d36558d`; no store change is proposed.

## What the candidate does

The shared action handler skips recorded `set_pause` actions only during a run-tape replay. A tape counts active simulation ticks, so replaying its one-way recorded pause used to stop the replay forever. The recorder and multiplayer remain unchanged, and the viewer's pause controls use their separate handler. A player encounters the fix by pausing a normal run and then watching or submitting its reel. The added River row uses plain entry, actual pause/resume, the county worker and zero-console assertions on desktop and 390 px mobile.

The attended session released this drain to the fires in handover 13z-79, superseding 13z-78 and s2692's attended-custody claim. Current policy is CLEAR from the primary repository's live board. The three code/test paths merge without conflicts: `src/game/Game.ts`, `e2e/river-ending-score.spec.ts`, `scripts/same-game-audit.mjs` are LANE-TOUCHED only; main did not move them since the fork. The remaining 47 paths are new lane evidence. The third lane commit is the attended audit-anchor repair, explicitly recorded in 13z-79. No blob over 50 MB was found.

## Fire gates on the detached merged tree

| Check | Result |
| --- | --- |
| Policy, merged checker reading current primary board | CLEAR, queued leaf; `artifacts/s2693/policy-current-main.txt` |
| TypeScript | rc 0, 5.9 s |
| Normal build | rc 0, 21.8 s |
| E1 build | rc 0, 8.2 s |
| E1 content assertion | rc 0 |
| E1 first-town payload | 34,350,664 B, below 52,000,000 B |
| Diff-selected guards | rc 1, 904.1 s; 4/5 groups passed |
| Full node guards inside that wrapper | SIGTERM at its 900 s outer limit; no final counts or complete npm tail |
| Other selected groups | power-budget, task-guards, citations, gate-callers all rc 0; power p95 0.377 ms |
| New evidence budget | 7.4 MB from the lane, below 40 MB; whole-tree ceiling not yet banked, advisory only |
| Null-floor rerun | cancelled after wrapper refusal; no verdict claimed |
| Fire browser/boot gates | not run; remain owed |
| Engine pin | not written; current registry is era 6 pin 70, `f6084527` |

Evidence: `artifacts/s2693/phase1-gates.txt` is append-only and retains failed invocation setup as well as the measured gates. An initial driver invocation refused a release job lacking an explicit battery environment; no tests ran in that invocation. A policy call from the linked tree refused its stale-board arrangement; the exact merged checker was then rerun from primary main and returned CLEAR. These are instrument setup refusals, not product regressions. Normal build and tsc passed independently of that policy refusal. The release jobs were rerun with explicit `GR_RELEASE=e1` and passed.

## Lane acceptance evidence, separately identified

`artifacts/tape-pause-fix-1/report.md` and its committed fixtures record fresh paused River reels VERIFIED on desktop (`abebc77c`) and phone (`2c982352`), the old paused River reel VERIFIED (`a8c5af79`), a three-pause Claim death reel reproducing `8b17af1a` at tick 176, and the historical seed run advancing beyond tick 274 to its end. That historical standing still fails on pre-axes-fix divergence; it is not rescued. Heat-15 and era-6 agent outputs are unchanged, and the lane's 83/83 floors and 42/42 adjacent tests passed. These are the implementer's results, not substitutes for the incomplete fire battery.

## Finding and next gate

**F-2693-1 — RESOLVED by the s2694 direct run below; historical gate-side failure:** the diff wrapper's fixed 15-minute timeout interrupted the still-active fixture sweep. Partial TAP reached 504 completed rows and showed only the two expected pre-pin identity failures: bench-seeds and engine-era-guard compare `2d180e6b` to the old pin. This is not a completed battery and does not establish absence of other failures. No clean-main control was run, so no additional failure is attributed or excused.

Source verified: `scripts/run-guards.mjs` sets `timeout: 15 * 60 * 1000`; `scripts/run-node-guards.mjs` already owns a 300 s per-test bound and a 45-minute TAP-stall watchdog. The existing F-2549-1 recovery applies: run the full node command directly through `gate-battery.mjs`, retaining its watchdog, rather than retrying the capped wrapper. No timeout, assertion or concurrency rule was changed, and no new implementation task or redispatch is needed. The old finding is retained as historical, not silently reopened.

The wrapper left its node-guard descendant alive after returning SIGTERM. Only s2693-owned processes were stopped by numeric PID; the interrupted floor rerun was stopped with them. Their identities and ancestry are in `stopped-gate-processes.json`, and `processes-stopped.txt` proves those PIDs are gone. The drain-lock directory was moved intact to `/Users/robin/.goldrush/fire-s2693/drain-lock-released`; the launcher's fire lock remains its responsibility. Candidate content and all evidence remain on disk.

Resume instructions and the direct full-node job list are in `artifacts/s2693/report.md` and `artifacts/s2693/full-node-next-jobs.json`. F-RVA1-6 remains OPEN until the candidate is fully gated, landed and deployed.

## s2694 continuation — full Node completed, remaining gates held

The preserved candidate merged locked main `0fd459d068438f40f7ecbd0faa1f4d4c93b8a1ab` without conflict, producing `7875d9a8a772df1848c10246e82b58d5c2ae2774`. The incoming paths were STATUS, BACKLOG, the held review and s2693 evidence only; no runtime or test source moved. The scratch store remains clean at `5793a967da46e8f00c0ba16f92f17dc10d36558d`. Dependencies were prepared with `npm ci` in the candidate's own node_modules; the inherited dependency symlink was moved intact to `~/.goldrush/fire-s2694/inherited-node_modules-link`. Tracked candidate files remained clean after the battery.

| Gate | Measured result |
| --- | --- |
| Direct full Node, Node 26.4.0, file concurrency 1 | rc 1; 1040 tests, 1030 pass, 2 fail, 8 skipped, 0 cancelled; 2349.6 s |
| Failure fingerprints | bench-seeds and engine-era-guard: candidate `2d180e6b…` versus existing pin `f6084527…`; no other failures |
| Same identity specs on clean main, Node 26.4.0 | 9/9 pass, rc 0 |
| Fixture cleanup | all 162 owners pass, 940.8 s |
| TAP silence / watchdog | max 935.2 s against unchanged 2700 s bound; no watchdog fired |
| Exact npm chained tail, run separately after pre-pin short circuit | rc 0, 31.3 s; final test leg 87/87 |
| Floor, release, browser and plain-boot gates | not run by s2694; still owed |
| Pin / landing / deployment | none |

Full evidence: `artifacts/s2694/full-node.txt`, `identity-control.txt`, `node-tail.txt` and `report.md`. The first identity-control invocation inherited the default Node PATH; its preserved result is followed by the canonical Node 26.4.0 run, which is the cited control. The complete direct battery resolves F-2693-1's interruption without a timeout increase or an identical wrapper retry. The long in-flight gate exceeded the nominal fire drain window; no second drain or further browser battery was started. F-RVA1-6 remains open until this cure lands and deploys.

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

## s2696 landing

Accepted candidate merge `28272092ee10ccf4dc135eb3b01cfcb2b28ed947` includes main through lock `75f9a6724`. The 81 incoming paths are exclusively STATUS, BACKLOG, this review and s2695 evidence; no executable or dependency input moved. The code diff is the same two-line Game.ts replay guard, added River spec row, and attended same-game-audit anchor correction already gated. Scratch store clean at `5793a967da46e8f00c0ba16f92f17dc10d36558d`; measured engine `2d180e6bad6933ef15db2a006aaa0a1a3be8a97efdf9416cbc4646be71be4f6d`, era 6 pin 71. Policy CLEAR; evidence 7.4 MB of 40 MB. Existing s2693–s2695 acceptance evidence applies byte-for-byte. Goal and ledger updated, done-move renamed, Gazette draft appended in the drain commit set before fast-forward. Main full Node is required next, directly through the battery, not the capped diff wrapper. F-RVA1-6 remains open for deployment until ASSAYER SYNCED.

Fresh evidence: `artifacts/s2696/reuse-proof.json`, `identity.json`, `report.md`.

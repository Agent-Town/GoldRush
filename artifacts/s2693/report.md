# s2693 — Pause replay drain held on an incomplete guard battery

READY-FOR-GATES — candidate preserved, NOT LANDED. This fire made a real detached merge and measured gates; the mandatory full node battery did not finish. No game change, same-era pin, deploy, publication, task dispatch or task re-queue occurred on main.

Lock commit: `49a0479a0`. Candidate: `63cd904a9b81c2cc62ced7061be263a7cc624fc5` at `/Users/robin/.goldrush/fire-s2693/wt-tpf1`. Source lane tip: `19dc0195fbf72f69d24334dede5538c709b977a5`; source fork: `3c35d5bed250427a254ab10f1fe22071da44aad2`; primary base: `49a0479a0cf0b5d0de0d5ca1f1b06c7809242239`; landed scratch store: `5793a967da46e8f00c0ba16f92f17dc10d36558d`. Review: `reviews/tape-pause-fix-1.md`.

## Result

TypeScript, normal build, E1 build and the release assertion passed. First-town payload: 34,350,664 B (<52,000,000). The diff-selected guards passed four of five groups; node guards were interrupted by the wrapper's 900 s limit (outer job 904.1 s) during fixture-teardown. No full counts or tail verdict exists. The partial 504-row TAP shows the two pre-pin registry failures and no other completed failure, which is explicitly not a green. Null-floor rerun was cancelled; browser gates remain unrun. No new product regression has been established, and no base control has attributed one.

This is the measured F-2549-1 wrapper class, verified against current source. The established recovery is a direct full-node command through the battery, with its existing watchdog. See `recovery-precedent.txt`; no new pipeline audit/master or timeout increase was invented. Finding F-2693-1 tracks this candidate's gate hold.

## Verified inherited claims

- This launcher's fire-runner PID 50271 started at 07:22:36 local; Codex PID 50321 is its descendant. The fresh fire-lock directory belongs to this process. Previous s2692 line 1 was cleared; its complete text is archived below the current line.
- Attended custody changed before our drain: handover 13z-79 and ledger commit `991fe4730` explicitly released tape-pause-fix-1 to the fires. s2692's attended-ownership claim is superseded. The policy checker returned CLEAR from main's live board.
- The board is NOT DRY: one done-move, lane-c three unabsorbed commits (including attended anchor repair `19dc0195f`). Other lanes have zero ahead commits. The done-move remains unrenamed and the goal leaf remains queued because nothing landed.
- Runner PID 25494 is alive and independent of this fire. Its semaphore is the ACTIVE-without-lock-CLEARED predicate in `scripts/lane-runner-v3.sh:239`. No restart needed.
- The newest lane run ended READY-FOR-GATES with 143,608 tokens and no quota interruption. The implementer served; this does not authorize fire refills under CODEX-WALL.
- Health at preflight: landing/game/API HTTP 200, zero queued or running tasks and zero pending orders. No assayer order or art-store landing is owed by this increment.
- September 26 ticker already exists. September 27 ticker is due September 28 after 06:00 local. LB/FM September 27 are not due before 02:10 UTC; September 26 private mirror exists at 8,679,424 B, and prior mirror logs record the offsite push and unchanged memory mirror. No mirror was copied into the public repository.
- RT-01 discharged: r2026w40 opens September 28 00:00 UTC; skillmd guard passed 19/19.
- All ten captured s2693-owned gate PIDs are gone (ps rc 1 with header only). Unrelated processes were untouched; the drain-lock directory is archived intact. Runtime source and assertions on main are unchanged; generated factory log dirt remains intact.
- The inherited three-item owner's desk is preserved byte-for-byte. There is no new owner decision.

## Resume, in order

1. Recheck policy from primary main and ownership. Preserve `/Users/robin/.goldrush/fire-s2693/wt-tpf1` and its candidate commit; do not reset the lane or manufacture another done-move. Classify any newer main changes and merge the current locked main into this detached candidate before gates, so its ledger snapshot is current. Keep the scratch store on landed main.
2. Hold the drain lock and run the direct full node command, Node 26.4.0 with the fire's normal serialization, through `gate-battery.mjs`. The already-attempted diff wrapper's other four groups passed; do not repeat its capped full-node child:

```sh
node scripts/gate-battery.mjs --label 'tape-pause-fix-1 full-node continuation' --cwd /Users/robin/.goldrush/fire-s2693/wt-tpf1 --transcript artifacts/s2693/full-node-continuation.txt --env GR_GUARD_NO_ARTIFACT=1 '[["full Node command","npm","run","test:node-guards"]]'
```

Use the installed Node 26.4.0 binary/PATH as this fire did. Read complete counts and chained tail; control any non-pin red on clean main. Do not infer green from the partial TAP.
3. Complete the null floors, release suite under its owning config, task's tape/river suites, task-025, m1-01, m2-01, live-seed-rotation and plain desktop/390 px zero-error boots. Browser runs use `gate-battery` and workers=1, port 5404, one owned server, warmed first. Pin last only after the final tree passes.
4. Land with review/goal/BACKLOG in the drain commit set, rename the done-move, push; rerun full node guards on main. Run production deploy only as prescribed and report assayer SYNCED if it runs. Append the player-visible Gazette item only after a real landing. F-RVA1-6 closes with that cure, not this held review.
5. LB/FM September 27 after 02:10 UTC; next ticker at its normal window. The existing owner's desk remains account-registry ops evening, device verdict rows and token-support revocation response.

## Fire closeout

The mandatory ledger battery will be recorded below before the final clearing commit. All code, build and test commands above are completed or explicitly pending; no future result is claimed.

Closeout adaptation: an accidental unbounded status archive walk exhausted Node 23's default heap and produced no verdict. The script itself identifies `--limit 40 --quiet` as the regression gate; its separate result is in `status-archive-bounded.txt`. No limits were increased and no historical archive was changed.

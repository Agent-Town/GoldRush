# s2747 — audio persistence regression test is landed

**READY-FOR-GATES. One test-only drain landed at 15da41c60515658c4ea93724d66b816fbdcb190d; closing ledger verification remains pending below.**

The lane finished during this fire. Initial triage had no ready drains, so the initial ledger battery ran; triage restarted when the done-move arrived. The test now reaches Settings through a returning-player profile, preserves volume and mute across reload, and checks the live SoundSystem values. The prior test cleared storage into the first-boot card, where Settings does not exist. The task quoted the preceding audio-lock test title; the changed row is settings volume and mute persist across reload. F-AUD-16 is corrected.

## Landing and evidence

- Source commits: 52860648a, f9a1a26e5, 68ad3e06f (Astra lane-b; run log 147,262 tokens). Implementation merge bf65df7de6402fc0efa7ff63746cc65a1171cdcc; review/goal/backlog drain commit 15da41c60515658c4ea93724d66b816fbdcb190d. Review: reviews/audio-integration-first-boot-spec-1.md. The done-move is now tasks/done/drained-s2747-20260928-214502-audio-integration-first-boot-spec-1.md.
- Fresh detached arena prepared with npm ci and a clean git status. Classification: one LANE-TOUCHED spec, NEW source evidence, no main-side spec edits, conflicts or oversized lane blobs. Main was fast-forwarded only after acceptance.
- TypeScript, ordinary build and E1 build rc 0. E1 first-town payload **34,355,296 bytes**, below 52,000,000. Final evidence **28.2 MB**, below 40 MB, including source evidence and preserved regenerated screenshots. Nothing discarded.
- Browser warm-up **1/1**; own and five adjacent suites **62/62** across desktop and mobile, workers=1. Eight plain surfaces at 1280x800 and 390x844 had **zero console and page errors**. JSON/screenshots: plain-boots/.
- Literal diff-selected guards **5/5, rc 0**, **2252.199 seconds**, Node v26.4.0. Full npm Node command **rc 0 in 2249 seconds**, including its chained tail. Observed fixture sweep: **162 owners, zero survivors, no failed children**. Power p95 **0.336 ms**. The wrapper retains passing command verdicts but suppresses passing per-test output; no unrecorded final Node test count is claimed.
- Final candidate and main engine hash both **999203109481b7906b00e957ee739ca015b05a692201f039b4a3062a2f344bd4**, equal to the existing pin; store 5793a967da46e8f00c0ba16f92f17dc10d36558d. No src/assets/functions diff. No pin, deployment or Gazette item: this corrects a test route without a player-visible change.
- Invocation correction retained: strict policy refuses a linked worktree with rc 2; both primary-root policy probes were CLEAR. The candidate static bundle records that refusal beside green tsc/build; the subsequent correct live-board probe controls policy. Ordinary screenshot directories were mistakenly described as failures mid-run, then corrected against the completed **62 passed, rc 0** result. The prepared clean-main control was not run. No product red was excused, assertion weakened or guard limit changed.
- This one drain exceeded the approximate fire duration to finish the already-running required full Node command; no additional drain was taken. ACTIVE was refreshed at db4868b73, and the live launcher's own directory heartbeat was renewed before it could be reaped as stale.

## Re-verified factory and duties

- Final health is **200/200/200**, runner alive, queues/running/pending orders all zero, no staged art. Final board and lane probes are retained. No independent fire dispatch, refill, retry or restart.
- Today's LB-01/FM-01 receipts are already complete; strict external mirror coverage **36/36** through September 28. Both live private archive heads match the s2727 duty receipts. The mirror stays outside the public repo. Yesterday's ticker draft exists with its UTC+07 window and busy-day control; rotation week 40 is present; skillmd **19/19**. Next coverage September 29 after 02:10 UTC; week-41 mint September 30.
- Live origin still reads **0979de76328c5a225f543d620f47c66a9f5c4382**. The 113,467,543-byte historical blob and its introducing ancestor remain reachable. Existing F-2742-1 forbids an unchanged rejected push and requires the owner's attended archive-first repair decision. This landing is local and is not claimed backed up to origin.
- The complete predecessor s2746 line is archived verbatim, and the four-item Owner's Desk tail will be retained byte-for-byte at clearance. Main semaphore: scripts/lane-runner-v3.sh:239. Initial lock commit 0ca633dce; initial bookkeeping 075e97b6c; lock refresh db4868b73; evidence checkpoint db523ec78.

## Remaining list in order

1. Owner decides F-2742-1; attended archive-first repair restores accepted origin backup, including this local landing.
2. Owner listens to the available before/after audio and decides keep or revert; inherited four-item Owner's Desk stays unchanged.
3. September 29 private coverage after 02:10 UTC; September 30 week-41 mint.

## Closing verification

Initial pre-drain ledger: **1263/1263 plus kit 83/83**, rc 0, **348.315 seconds**. The fresh post-landing literal ledger battery follows this report; its completed receipt must precede lock clearance.

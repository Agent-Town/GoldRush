# Drain review (attended landing): `sol-play-proofs-holds-2`, the objectives work and the holds moved to survival and to a phone tap; the fire's native re-ride recorded, not reproduced

**Branch** `sol/map-art-campaign-2` at `6b891fabd` · **merge** `2b59a24ab` · engine hash unchanged (`2d180e6b`, no pin) · drained attended 2026-09-28 04:13Z in a detached chain worktree with the scratch store at `5793a96`; no deploy (scripts/attended/land.sh, config `sph2`).

**Verdict: LANDED.**

**Slice / branch / tip:** `sol-play-proofs-holds-2` (run 16 on disk), lane-c `sol/map-art-campaign-2`, fourteen commits ending at `6b891fabd` (Astra, gpt-6-astra, 359,232 tokens, 02:03Z to 03:06Z 2026-09-28). Attended landing after the s2730 fire stopped at "PARTIAL GATES, ATTRIBUTION PENDING": its non-native gates passed (builds and E1, adjacent and plain boots 42/42) and its native re-ride failed 10/10, the class the 13z-91 rule assigns to the attended session.

**What it does.** The shared native-proof driver (`e2e/native-proofs/driver.ts`) learns three more errands: the Picnic stake hold (the kit placed inside each stake's authored radius, read from the contract at runtime), the Showroom capture (leave the house by its doorway, approach exhausted machines, confirm outside build mode, stop confirming at death), and the Tape Reel demonstration (record a short movement-and-build demonstration on the plain-boot Tape Reel, use it at the next wave; observe the county's refusal on the Dead Band, the fielded mirror on Echo Canyon, the muted use and three lit sites on Relay Rush; keep upgrade keys out of the tape-name field; keep the drawer closed while waiting). Five re-ride specs and the run-16 evidence carry the results. No `src/**` change; no balance change.

**Evidence (real numbers).**

| Check | Result |
|---|---|
| Picnic, desktop / phone (run 16) | HELD on survival: all three stakes held inside their radius, hero died |
| Showroom, desktop / phone (run 16) | 6/6 captures reported on both screens, hero died; the capture loop's post-death confirms fixed in the final commit, not re-ridden (two-ride allowance exhausted) |
| Dead Band, desktop / phone (run 16) | refusal latch proved (`objectiveMet=true` after the signal-suppressed refusal); deaths at waves 19 and 12 |
| Echo Canyon, desktop / phone (run 16) | desktop: mirror proved; phone: never reached Record, the tap on the visible Tape toggle intercepted by the canvas, then the Patent Office overlay, then the death ledger; the unbounded action consumed the 840,000 ms timeout |
| Relay Rush, desktop / phone (run 16) | desktop: 3/3 sites lit and the muted use proved; phone: same Tape control block |
| Flotilla / Regatta equivalence (desktop) | PASS, rows compared to run 12 |
| Rides, errors | zero console and page errors on every ride |
| Evidence budget | 2,691,128 B added, inside the 25 MB task budget and the 40 MB fire ceiling |
| s2730 fire gate on the detached candidate `2a6ccc4e0` | builds/E1 PASS; adjacent and plain boots 42/42; native re-ride 0/10; Showroom captures 0/6 desktop, 1/6 phone against the source's 6/6; unattributed; candidate saved at `save/sol-play-proofs-holds-2-s2730` |
| tsc / build / adjacent specs (incl. `e7-playbook-surface`) / ledger battery | measured by this landing's gates (see the gates log) |

**Merge classification.** Base: main at the chain cut. New files: the re-ride specs' variants and `artifacts/sol/play-proofs/run-16/**`. Lane-touched: `e2e/native-proofs/driver.ts` (the three correctives plus the Tape Reel drawer and text-field guards), `run-15/run-note.md` (table amendment). No `src/**`, `scripts/**`, `functions/**` or `site/**` change, so `hash: unchanged`. Conflicts: none expected; the toolkit records any.

**Findings.**
- **F-SPH2-1 (recorded, non-blocking for this landing).** The s2730 fire's native re-ride of the candidate could not reproduce Showroom's captures (0/6 and 1/6 against run 16's 6/6) and failed all ten native specs, while the same fire's plain boots and builds passed. This is the F-2725-1 class again (real-time rides under the fire shell's per-job CPU ceiling), now with a larger gap than a survival wave: the capture sequence is timing-sensitive. Showroom's capture claim therefore stands as run 16's measurement with the fire's non-reproduction beside it, not as a both-instrument proof. Owed: the next lane task on the Showroom (candidate holds-4) re-rides it desktop in the lane shell as its own control; the fires do not re-ride native specs of this class (13z-91).
- **The phone Tape toggle (instrument today, possibly player-facing).** Audited by `e7-tape-toggle-phone-hit-target-1` on lane-a (`elementFromPoint` at the toggle's centre in a plain boot at 390 px); a player-facing interception becomes an F-TAPE finding with a layering fix in its own engine-pinned landing.
- **F-PPH2: none.** No reproducible plain-boot map defect. Survival ceilings (Picnic, Dead Band, Echo desktop, Relay desktop) stay on the owner's desk under F-PP-CAMPAIGN; no balance change from these deaths.

### E2E attribution (drain, 2026-09-28 ~04:05Z)
Rows allowed for this landing only: `e7-playbook-surface.spec.ts:33:1 › the tape drawer arms at the Signal Era and remains inherited afterward` on both projects. Reason: a PRE-EXISTING main red, not this branch's. Evidence: (1) this branch touches only `e2e/native-proofs/**` and `artifacts/sol/play-proofs/run-16/**`, never `src/**`, `e2e/e7-playbook-surface.spec.ts` or the config; (2) the lane-a audit `e7-tape-toggle-phone-hit-target-1` (Astra, 2026-09-28 03:46Z to 04:02Z) reproduced the same two reds at the same assertion (`e2e/e7-playbook-surface.spec.ts:49`: after the final plain `/?contract=the-claim&nowaves&nolevel&nopause` boot the `playbook-toggle` is absent) against source byte-identical to pre-task main (`git diff --exit-code a7ea93c46 -- src e2e/... playwright.config.ts package.json` exited 0); (3) the red inventory's KNOWN-RED entry for this spec is a different, mobile-only test at line 54 on a 47-day-old snapshot, so this is a NEW unrecorded main red. It is recorded as a finding of its own (F-SPH2-2: the Tape Reel's epoch inheritance) with a corrective task; the landing does not excuse it, it names it.

### Evidence (this drain's gates on the merged tree)
| Check | Result |
| --- | --- |
| tsc / build / e1 | `0 / 0 / 0` |
| law-pointer | `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 137 ℹ fail 0` |
| the ledger battery | `rc=0 ℹ tests 1263 ℹ pass 1260 ℹ fail 0 ℹ skipped 3` |
| e2e both projects, --workers=1 | `rc=1   2 failed   26 passed (2.6m)  03:54Z` |
| full npm run test:node-guards (before the pin) | `rc=0 ℹ tests 1040 ℹ pass 1035 ℹ fail 0 ℹ skipped 5 ℹ tests 87 ℹ pass 87 ℹ fail 0 ℹ skipped 0  04:13Z` |
| engine hash | `merged: 2d180e6bad6933ef15db2a006aaa0a1a3be8a97efdf9416cbc4646be71be4f6d (pinned 2d180e6bad6933ef15db2a006aaa0a1a3be8a97efdf9416cbc4646be71be4f6d)` |

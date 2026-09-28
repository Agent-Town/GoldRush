# sol-play-proofs-10 — Run 14 proof evidence

Source: `sol/map-art-campaign-2`, tip `4cada136986ff342d1a1c8fbb0cb68b786154f7f`. Fires: s2719, s2720 and s2721. Verified candidate: `fcae3063201a05268e70fe666b646bb5d445f9e3` (original source merge `a4ac5b58306b45f2a4c8d90240c6383e00d07d99`) at `/Users/robin/.goldrush/fire-s2719/wt-pp10`.

**Verdict: ACCEPTED QA EVIDENCE, LANDED AND VERIFIED — candidate and post-landing main gates pass.** All four map verdicts remain HELD. This review accepts no new gameplay completion or map defect.

## What this measures

Four new opt-in wrappers and their retained evidence finish the campaign's map inventory. There is no player-visible runtime change: production, contracts, art and the shared native driver are unchanged. The source rides enter through the town Book without a debug or explicit seed query, using the existing progressed-profile fixture and permitted timescale 4. The phone is 390×844 browser emulation, not a physical-device proof.

| Map | Desktop / phone result | Limitation |
| --- | --- | --- |
| Relay Valley | Death at wave 17, 516.800 / 515.200 s | No playbook use or program-lit relay |
| Mare Claim | Death at wave 2, 80.133 s on both | Driver reads `e8SuitAir`; this map declares `e8Atmosphere` |
| Archive World | Death at wave 20, 606.933 / 611.067 s | No restored wing or completed light hold |
| Ember Shore | Objective loss at wave 3, 92.933 s on both; 92 HP | No Stoke; vent warmth depleted while the hero remains alive |

Eight compact rows match the retained raw rows exactly after the documented sample reduction. All eight report zero console/page errors. All eight fail the unchanged secure assertion; no bank, Book-return or reload success is claimed. One default ride per map/project was taken by the source run. No extra native rides were taken in this drain.

The complete table has one row for each of 42 contracts: seven PROVED both screens, three PROVED one screen, two PARTIAL, 29 HELD and one corrected historical defect. Earlier verdicts are an inventory of cited prior runs, not re-proofs by s2719. The scoped qualifications in the source table remain binding.

## Evidence

| Gate | Result | Receipt |
| --- | --- | --- |
| Policy on authoritative main board | CLEAR, rc 0, checked before custody and again after candidate creation | `artifacts/s2719/policy.txt`, `policy-rechecked.txt` |
| Fresh arena | `npm ci` rc 0, clean before merge | `artifacts/s2719/npm-ci.txt`, `arena-clean.txt` |
| TypeScript | PASS, 7.1 s | `artifacts/s2719/build-gates.txt` |
| Normal / E1 builds | PASS, 39.4 / 12.1 s | Same transcript |
| E1 entry payload | 34,350,664 B, below 52,000,000 B | Same transcript |
| Browser warmup | PASS, 1/1, 8.6 s | `artifacts/s2719/browser-gates.txt` |
| task-025, m1-01, m2-01 and plain boots | PASS, 42/42, both projects, 224.9 s | Same transcript |
| New specs with opt-in unset | Eight skipped, rc 0 | Same transcript |
| Plain boots | Eight clean boots, desktop and 390px, no debug query | `artifacts/s2719/plain-boots.json`, `plain-boot-shots/` |
| Raw evidence | Eight of eight rows equivalent; zero browser errors | `artifacts/s2719/native-evidence-audit.json` |
| Campaign inventory | 42 contracts, 42 unique matching rows | `artifacts/s2719/campaign-inventory.json` |
| Source evidence | 1,615,430 B, below 25 MB task and 40 MB landing limits | `artifacts/s2719/evidence-budget.json` |
| Visual inspection | Four loss screens inspected, one per map, waves and counters agree | `artifacts/s2719/visual-inspection.json` |
| Diff-selected guards | Four of five groups PASS; full Node child stopped by the outer 900 s limit | `artifacts/s2719/diff-guards.txt`, `diff-guards-result.json` |
| Partial Node record | 504 top-level passes, no failing record; no final totals or chained tail | `artifacts/s2719/node-before-wrapper-limit.tap` |
| Direct full Node continuation | PASS, rc 0; 1032 pass / 8 existing skips / 0 fail; chained tail 87/87; 3650.374 s | `artifacts/s2720/full-node-candidate.txt`, `node-result.json` |
| Fixture sweep in direct continuation | PASS, 162 owners, 1588.862 s; no fixture survivors | `artifacts/s2720/node-after-fixture.tap` |
| Final engine identity | Main, candidate and current era 6 pin 71 match `2d180e6b…`; no pin made | `artifacts/s2720/engine-final.json` |

The build battery's aggregate rc is 1 because its policy job correctly refuses a frozen linked-worktree board with rc 2. That is an instrument-location refusal, not a policy clearance or a build failure. The required live-board reassertion was rerun at the primary root and returned CLEAR. All four build/payload jobs returned 0. Both receipts are retained.

## Merge classification and adaptations

Common ancestor: `59733b98d6d98e6bfc8713240c470e2e12e11ce8`. Main base: `cb967452967767c95ab5ce31730cb32d700a392b`. All 65 source paths are NEW: four specs and 61 files under `artifacts/sol/play-proofs/run-14/`. No overlap with newer main changes, no conflicts and no blob above 50 MB. Per-file classification: `artifacts/s2719/classification.json`.

The first arena check caught this fire's absolute `assets/pilots` symlink as tracked dirt. Before the merge, the original relative symlink was restored and its sibling destination pointed at the existing clean detached art-store worktree at landed store main `5793a967da46e8f00c0ba16f92f17dc10d36558d`. The clean recheck passed. No store content changed. Both arena receipts remain available.

All npm children use the verified Node 26.4.0 runtime through an explicit `/opt/homebrew/bin` PATH. No timeout, assertion, source or test limit is altered.

## Gate continuation completed by s2720

The original s2719 diff-wrapper receipt remains rc 1: its full Node child was stopped at the fixed 900-second outer limit. The direct continuation uses the exact full npm command and changes no assertion, per-test timeout or watchdog. It passed on synchronized candidate `fcae3063201a05268e70fe666b646bb5d445f9e3`: **1032 pass, eight existing skips, zero failures; chained audits green, final tail 87/87; total 3650.374 s**. The 162-owner fixture sweep passed in 1588.862 s, by itself longer than the outer wrapper's cutoff. Maximum TAP silence was 1587.2 s, below the unchanged 2700 s watchdog. Host one-minute load reached 197.104; process samples show advancing children. No fixture-cleanup red reproduced, and that single pass does not close F-2717-1's failure-path corrective.

Newer main at the start of s2720 contained only documentation/evidence changes, synchronized into the detached candidate before the direct gate. Executable, dependency, art and browser inputs remained unchanged from s2719. The eight raw-record equivalence checks and the evidence budget were rerun and passed. Both store views remain clean at `5793a967d`. No engine pin was added.

Historical s2720 checkpoint — WHY NO LANDING THEN: this one complete gate consumed the fire increment. Main has received no Run 10 source bytes. The next fire must policy-check, synchronize any newer bookkeeping, and reuse the complete candidate receipts only after proving their relevant inputs unchanged. Complete the goal/ledger/review drain commit set, fast-forward main, rename the original done-move and push. Then run the mandatory full Node verification on main directly, without repeating the known 900-second wrapper interruption. Any new executable inputs require fresh applicable gates. Exact continuation and remaining list: `artifacts/s2720/report.md`.

## Follow-up ownership

No proven map defect and no new F-PP10 finding. The attended `sol-play-proofs-holds-3` owns these four objective/air-driver corrections, after holds-1 and holds-2. The source observations do not authorize balance changes. The existing attended queue jobs retain dispatch ownership. At that checkpoint the done-move, source branch and goal remained open until the landing. Lane-a fixture-cleanup attempt 2 became ready during this gate; its attended handoff was preserved separately, without draining it or changing its ownership.

## s2721 landing

Strict policy CLEAR on the authoritative board. Newer main since the completed candidate contains only bookkeeping and evidence, synchronized without conflicts as `57a28a21d8e4a428d089e65dd2684383cb012f8c`; applicable executable, dependency, browser and art inputs are identical to the completed receipts. All 65 source paths remain additive. Store HEAD/main is clean at `5793a967da46e8f00c0ba16f92f17dc10d36558d` in both views. Eight raw equivalence checks pass again, source evidence remains 1,615,430 B. No gate is repeated merely because the bookkeeping commit changed.

The actual source merge is `a4ac5b58306b45f2a4c8d90240c6383e00d07d99`. This drain commit set updates the goal, BACKLOG and this review before fast-forwarding main. The original done-move is renamed on the primary board after the fast-forward. Full Node on main subsequently passed; exact receipt and verdict follow. Dispatch of holds-1/-2/-3 stays with the attended queue jobs. No runtime change or era bump means no Gazette item or deployment is due.

## Post-landing main result

**PASS, rc 0: 1032 passed, eight existing skips, zero failures or cancellations; all chained audits green, final tail 87/87.** Complete command time: **2582.864 seconds**; test-body time: 2548.677 s. The 162-owner fixture cleanup sweep passed in **1029.425 s**, with no survivors. Maximum TAP silence: 1025.3 s under the unchanged 2700 s watchdog. Transcript and direct exit: `artifacts/s2721/full-node-main.txt`, `artifacts/s2721/node-result.json`; execution identity: `node-start.json`. No control or code cure was needed for this green run.

Main was fast-forwarded to `1c13a248793c89ab9a0abec1d03c190e1e520251` and pushed; the original done-move was renamed `drained-s2721-20260928-013750-sol-play-proofs-10.md`. The first fast-forward refused to overwrite the fire's identical untracked evidence copies; those were moved intact to `~/.goldrush/fire-s2721-prelanding-local`, then the fast-forward succeeded. Both receipts remain. During the gate only the UTC ACTIVE heartbeat changed in `d8074251e`; executable inputs stayed fixed.

Final engine hash on main still matches era 6 pin 71: `2d180e6bad6933ef15db2a006aaa0a1a3be8a97efdf9416cbc4646be71be4f6d`. The source lane is absorbed. Holds-1's landing prerequisite is recorded as met, with dispatch still attended-owned. F-2717-1 and lane-a's cleanup corrective remain open for their own drain. The long completed gate consumed this fire increment, so no second drain starts.

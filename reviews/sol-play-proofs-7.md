# sol-play-proofs-7 — landed through the retention corrective

**Current verdict: LANDED as `4615253db` by the attended session, 2026-09-27.** F-2704-1 is resolved. The final merged-tree gates are in [the retention drain review](play-proofs-evidence-retention-1.md). Fire s2706 independently re-verified all 231 original hashes, the private archive tip `65f83e203bbb7d8f67c72f65d18f3db4a0f9582a`, and the complete landed range through `ecc71a4df`: 7,230,021 added evidence bytes against 40,000,000. See `artifacts/s2706/report.md`. The six map verdicts are unchanged; run 8 dispatch is attended-owned.

The following is the preserved historical s2704/s2705 hold report. Its pending-archive and blocked statements describe that earlier state.

# sol-play-proofs-7 — evidence-budget hold

2026-09-27, s2704. Branch `sol/map-art-campaign-2`, tip `0c43f9524443fc86272a530eced87515347aa3d4`, source base `1ddb5f4537cf2765cfc384605e106bf40679c952`.

**Verdict: HELD before merge.** The first strict drain policy check passed. The evidence budget then refused 86,013,547 added bytes against 40,000,000. No candidate content entered main; no build, browser or runtime gate was run by this drain. The six source commits remain intact and the done-move stays open under a gate-side hold.

## What the candidate records

Six new opt-in native-proof specs and the run-11 evidence. Runner-reported result: Drill Yard PASS both screens; Dry Gulch, Night Shift, Hill Mine, Trestle and Moth Season HELD. Twenty-two rides, zero console/page errors, no reproducible map defect and no F-PP7 IDs. The shared driver and production files are unchanged in the diff. There is no player-visible runtime change. These are source-run findings, not newly replayed drain results.

## Evidence

| Check | Measured result |
| --- | --- |
| Strict drain policy, original leaf | CLEAR, rc 0 before the hold was registered |
| Source commits / changed files | 6 commits / 237 files; 231 evidence files and 6 new specs |
| Evidence budget, source base to tip | rc 1; 86,013,547 B added, 40,000,000 B ceiling |
| Offload derivation on source tree | 231/231 files MUST-STAY; 0 files / 0 B movable |
| Scope and merge classification | 237 NEW files, no overlap with main's changed paths at inspection |
| Objects above 50 MB | 0 |
| Runtime, shared-driver changes | 0 |

Commands and results: `artifacts/s2704/evidence-budget-result.json`, `artifacts/s2704/evidence-budget-candidate.txt`, `artifacts/s2704/offload-plan.json`, `artifacts/s2704/classification.json`. Runner source: `tasks/runs/20260927-160815-lane-c-sol-play-proofs-7.md.log` and the lane's `artifacts/sol/play-proofs/run-11/run-note.md` at the pinned tip. Run logs remain local under the Retention Law.

## Finding and disposition

**F-2704-1 — gate-side blocker: proof evidence exceeds the landing budget and the current archive plan cannot move it.** `scripts/evidence-readers.mjs` deliberately promotes native-proof readers and write roots to `artifacts/sol/play-proofs`; the existing driver already pins that subtree, and the new specs additionally import the board-entry helper from it. This is not evidence of a scanner defect. Blind offload would violate its must-stay result; raising the ceiling is not a fire action.

Corrective master `tasks/play-proofs-evidence-retention-1.md`, registered in the same commit, prepares a bounded separation of the frozen record from live inputs and outputs, using the existing archive tools and retaining all bytes. It was authored, not dispatched, at the s2704 review. The attended session then assigned and dispatched it in `6044a45fe`; s2705 verified the live lane-a run `20260927-171529-play-proofs-evidence-retention-1`, which subsequently completed as `6974a5cc7`. The prepared package and local fixture are reviewed in `reviews/play-proofs-evidence-retention-1.md`; the real archive transfer remains pending. Archive execution remains attended-coordinated under the existing ruling; CODEX-WALL remains in force. The strict policy check still refuses the original done-move (rc 1, gate-side); the assignment does not satisfy the archive/byte-budget condition. Once the archive and size conditions are satisfied, lift the original leaf's gate-side hold and perform the ordinary merged-tree drain gates. Run 8 remains held until run 7 lands.

Remaining campaign contracts, in order: e4-long-road, e5-deepwater-claim, e5-flotilla, e5-regatta, e5-stillwater, e6-glow-mesa, e6-half-life-hollow, e6-picnic, e6-showroom, e7-dead-band, e7-echo-canyon, e7-relay-rush, e7-relay-valley, e8-mare-claim, e10-archive-world, e10-ember-shore.

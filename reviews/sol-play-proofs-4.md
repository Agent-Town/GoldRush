# Drain review: `sol-play-proofs-4`, run 4 of the play-proofs campaign: the Claim driver control, then E8 onward (Astra, lane-c)

**Branch** `sol/map-art-campaign-2` at `1e095ebfc` · **merge** `da746bd02` · engine hash unchanged (`c63def1b`, no pin) · drained attended 2026-09-25 13:12Z in a detached chain worktree with the scratch store at `5793a96`; no deploy (scripts/attended/land.sh, config `pp4`).

**Verdict: LANDED.**

### What it does
Run 4 of the play-proofs campaign (Astra on the owner's ChatGPT subscription, lane-c; owner 2026-09-25: "Can you do play proofs using Astra for these maps?") opened with the driver control the run-3 review asked for: the UNCHANGED shared driver secured the Claim on desktop at wave 10 in 300.07 s with 143 HP, six buildings and 299 kills, and all six cells passed (banked score, Book return, a plain reload preserving 7400 score bytes, Book reopened on foot, zero console and page errors). So the method is sound and the eleven earlier holds are what they said they were. The run then spent two honest attempts each (desktop, then phone) on Far Side, Low Orbit and Eclipse, and all three HELD on survival: death waves 12/17, 13/14 and 16/13. Every row booted clean. The driver learned two instrument errors on the way, both corrected in `e2e/native-proofs/driver.ts` (a floaty run coasting out of pan range while the funding helper waited; an arrival check demanding momentum below 0.12 after the position was reached, which burned Eclipse's suit air), and the final driver re-proved Incline on both projects (wave 14/17, 573.73 and 703.07 s, both carts 180/180 HP). Astra's own conclusion, kept verbatim: "These findings do not justify changing map balance. The passed Claim control must not turn a demonstrated orbital driver limit into a map-defect claim." Where the player sees it: nowhere yet; the status doc's second column for the three E8 rows now names the hold and its evidence.

### Measured
Nine rows, all zero console and page errors: the control (PASS), six map attempts (all red at their full-goal assertion, by design left enabled), two Incline regressions (PASS). tsc and build exit 0 in the lane; the env-unset native suite skips 28 rows on both projects; `--list` 3446 tests in 469 files; the bounded adjacent check (`locked-win` "The Claim card names") 2 passed. Four new gated specs (`the-claim`, `e8-far-side`, `e8-low-orbit`, `e8-eclipse`), the shared driver, the run-4 evidence tree, one appended report section and exactly three status-doc cells changed. No `src/`, no contract; the engine hash did not move.

### Merge classification
LANE-TOUCHED: `e2e/native-proofs/driver.ts` and the four new specs; `artifacts/sol/play-proofs/run-4/**` (new); `artifacts/sol/map-art-campaign-2/report.md` (one appended section); `reviews/sol-map-art-current-status-20260909.md` (three second-column cells, resolved by the toolkit's row-keyed three-way merge if main moved them). Nothing else.

### Findings
- **F-PP4-1 Far Side, F-PP4-2 Low Orbit, F-PP4-3 Eclipse (holds, not defects):** two attempts each exhausted on survival; the driver's orbital movement is the demonstrated limit (finding files beside each map's evidence). Not retried until a planned follow-up.
- **F-PP4-4 (campaign, attended):** the shared driver plays GROUND maps; the E8 trio needs an orbital movement model (thrust budgeting, air, arrival tolerance in free fall) before any retry has a changed premise (CLAUDE.md §7.5). A master for that driver is the candidate follow-up; until it exists the campaign proves E9 and E10 first (Astra's own order: Dome Basin next).
- **Yield after four runs:** 14 maps attempted, 2 proved (Incline; the Claim as control), 1 partial (Blackout Ridge), 1 defect (Canyon Works, corrective in flight), 10 holds (the earlier Baron, Twin Banks, Pressure Garden, Fairground, the E4 pair, plus the three E8 maps and Blackout Ridge's remainder).

### Evidence (this drain's gates on the merged tree)
| Check | Result |
| --- | --- |
| tsc / build / e1 | `0 / 0 / 0` |
| law-pointer | `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 137 ℹ fail 0` |
| e2e both projects, --workers=1 | `rc=0   2 skipped   30 passed (2.4m)  12:54Z` |
| full npm run test:node-guards (before the pin) | `rc=0 ℹ tests 1018 ℹ pass 1013 ℹ fail 0 ℹ skipped 5 ℹ tests 82 ℹ pass 82 ℹ fail 0 ℹ skipped 0  13:12Z` |
| engine hash | `merged: c63def1bfc493e243f31b9b115344ec6e3aacd57075554ec6a2ce872dfd90bef (pinned c63def1bfc493e243f31b9b115344ec6e3aacd57075554ec6a2ce872dfd90bef)` |

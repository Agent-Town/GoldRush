# Drain review: `sol-play-proofs-5`, run 5 of the play-proofs campaign: the first three E9 maps (Astra, lane-c)

**Branch** `sol/map-art-campaign-2` at `1c569cc3d` · **merge** `6e4eab345` · engine hash unchanged (`755400f8`, no pin) · drained attended 2026-09-25 23:08Z in a detached chain worktree with the scratch store at `5793a96`; no deploy (scripts/attended/land.sh, config `pp5`).

**Verdict: LANDED.**

### What it does
Run 5 of the play-proofs campaign (Astra on the owner's ChatGPT subscription, lane-c; owner 2026-09-25: "Can you do play proofs using Astra for these maps?") took the first three E9 maps, two honest attempts each, desktop then phone. **Devil's Alley: PASS on the phone** (wave 20 at 600.07 s, banked, Book back, plain reload, clean; all three bays and both yards built) and PARTIAL on desktop (the same wave 20 and all cells, but the east-bay build missed: a missed build, not impossible placement or balance, F-PP5-3). **Dome Basin HELD** (deaths at waves 15 and 13 with the quarry 4 of 4, the gates 3 of 3 and all five named grounds built, eight builds each; F-PP5-1) and **Seed Run HELD** (deaths at waves 13 and 14; the caravan arrives with 236 guard; F-PP5-2): their live objectives work and these defence orders fail survival, so neither establishes a map defect. Six new-map rows with zero console and page errors; the full-objective assertions stay enabled (five exit 1, Devil's Alley phone exits 0). The driver changed again and re-proved Incline on both projects (wave 14 at 577 s, carts 180 of 180). Where the player sees it: the status doc's second column for the three E9 rows names the result and its evidence.

### Measured
Eight final rows, all clean; tsc and build exit 0 in the lane; `--list` 3,452 tests in 469 files; the env-unset native suite skips 34 rows; Incline PASS desktop and phone; exactly three status-doc cells and one appended report section; no `src/`, the engine hash did not move. Campaign yield after five runs: 17 maps attempted, 3 proved (Incline; the Claim as control; Devil's Alley on the phone), 2 partial (Blackout Ridge; Devil's Alley desktop), 1 defect (Canyon Works, its creek bank cured today and its second wall declared), 12 holds on the driver's survival or movement.

### Merge classification
LANE-TOUCHED: `e2e/native-proofs/driver.ts`, three new gated specs (`e9-dome-basin`, `e9-seed-run`, `e9-devils-alley`), `artifacts/sol/play-proofs/run-5/**`, one appended section in `artifacts/sol/map-art-campaign-2/report.md`, three second-column cells in `reviews/sol-map-art-current-status-20260909.md` (the toolkit's row-keyed three-way merge resolves the test-truth landing's concurrent cells on Seed Run and Devil's Alley if it lands first; a same-row conflict is resolved by hand, keeping both measurements).

### Findings
- **F-PP5-1 Dome Basin, F-PP5-2 Seed Run (holds):** survival, not objectives; two attempts exhausted; not retried without a planned follow-up.
- **F-PP5-3 Devil's Alley desktop (partial):** the east-bay build missed; the phone run proves the map.
- **Campaign (attended):** the shared driver reaches waves 13 to 17 on most E8 to E9 maps and dies; the holds measure the driver's survival ceiling, not the maps. Run 6 takes the last three untouched maps (Old Canal, Last Claim, River) and closes the campaign with a table and a recommendation for the owner: a stronger driver or human playtests would settle the holds.

### Evidence (this drain's gates on the merged tree)
| Check | Result |
| --- | --- |
| tsc / build / e1 | `0 / 0 / 0` |
| law-pointer | `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 137 ℹ fail 0` |
| e2e both projects, --workers=1 | `rc=0   2 skipped   30 passed (2.4m)  22:49Z` |
| full npm run test:node-guards (before the pin) | `rc=0 ℹ tests 1025 ℹ pass 1020 ℹ fail 0 ℹ skipped 5 ℹ tests 82 ℹ pass 82 ℹ fail 0 ℹ skipped 0  23:08Z` |
| engine hash | `merged: 755400f89e096800cd8fa08e2bde744d15cca76e74d17f59c87d2f20468b89fa (pinned 755400f89e096800cd8fa08e2bde744d15cca76e74d17f59c87d2f20468b89fa)` |

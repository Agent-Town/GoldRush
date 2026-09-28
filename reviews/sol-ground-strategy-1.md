# Drain review: `sol-ground-strategy-1`, Astra's restore-ground strategy wins Old Canal on the phone and dies 0.3 s short on desktop

**Branch** `sol/map-art-campaign-2` at `3a365b522` · **merge** `c99839bb0` · engine hash unchanged (`7bfbed8b`, no pin) · drained attended 2026-09-26 18:39Z in a detached chain worktree with the scratch store at `5793a96`; no deploy (scripts/attended/land.sh, config `sgs1`).

**Verdict: LANDED.**

## What it does
Astra (gpt-6-astra, lane-c) took its own run-6 recommendation: one stronger ground survival strategy on a held ground map, diagnosis first, no balance changes. The diagnosis (committed before any driver change) reproduced Old Canal's hold on both screens: all eight defenses wrecked by wave 18, the hero dead at wave 18 with three or four gold and one to four repairs, because the default driver never repairs a wreck and its eight-piece cap then blocks every further purchase or funding. The one new strategy, opt-in behind `GR_NATIVE_STRATEGY=restore-ground`, restores purchased defenses instead of abandoning wrecks (every 8 sim seconds, the lowest-HP piece including wrecks below 80 %, from inside the 1.4 repair radius). Result: Old Canal on the phone is the first held ground map the driver has won (wave 20, banked, Book back, byte-identical reload); desktop died at wave 19 after 599.733 s with 33 gold and eleven repairs, the ring lost because the lowest-HP pick kept restoring a freshly destroyed beacon ahead of a turret (F-SGS1-1). The default driver is unchanged: Incline with the flag unset passes both projects at wave 14 as in run 6, and the driver's normalized TypeScript with the flag specialized to false equals the pre-task driver. Twin Banks was not run because the Old Canal gate wanted both projects.

## Evidence (Astra's run 8, base `73b381bce`, two `test:` commits; the drain's own gates are appended below)
| Row | Desktop | Phone 390x844 |
| --- | --- | --- |
| Old Canal diagnostic, default | HELD: wave 18, 544.400 s, 3 gold, 1 repair, 0/8 standing | HELD: wave 18, 540.667 s, 4 gold, 4 repairs, 0/8 standing |
| Old Canal, restore-ground | HELD: wave 19, 599.733 s, 33 gold, 11 repairs, 0/7 standing | gameplay PASS: wave 20, 600.133 s, 120.6 HP, 37 gold, 9 repairs; bank, Book, byte-identical reload |
| Twin Banks, same strategy | not run (gate) | not run (gate) |
| Incline, flag unset (control) | PASS: wave 14, 581.733 s, 83 gold | PASS: wave 14, 579.467 s, 0 gold |
Checks: tsc 0, build 0; env-unset native battery 44 skipped, exit 0 (the default battery unchanged); the unmodified adjacent repair spec (`m2-05-base-damage-repair`, the repair-dwell row) 2 passed; six new native rows with zero console/page errors; exactly one diagnostic and one changed-premise strategy ride per project.

## Merge classification
Base `73b381bce`; the branch touches `e2e/native-proofs/driver.ts` (the strategy behind its flag), the native-proof specs' env-gated rows, `artifacts/sol/play-proofs/run-8/**` (28 MB, largest blob 2.4 MB); no `src/**` or `assets/**`. LANE-TOUCHED only; hash unchanged.

## Findings
- **F-SGS1-1 (the desktop near-miss):** the lowest-HP selection restores a freshly destroyed beacon ahead of a turret and the ring is lost at wave 19, 0.3 s from the terminal; a changed-premise refinement (turret-first, abandon a piece wrecked twice) is the next Astra ride, `sol-ground-strategy-2`.
- **F-SGS1-2:** the phone bank-cell screenshot was not captured in the successful browser context; the reload and the Book are the row's evidence. The next proof captures `contract-best-e9-old-canal` in place.
- Astra, verbatim: "Keep this one strategy opt-in. Only Old Canal phone is newly demonstrated to unlock; no other held map is proven to benefit. Desktop's near-terminal death suggests targeted human/strategy review, not a balance change."

### Evidence (this drain's gates on the merged tree)
| Check | Result |
| --- | --- |
| tsc / build / e1 | `0 / 0 / 0` |
| law-pointer | `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 137 ℹ fail 0` |
| the ledger battery | `rc=0 ℹ tests 1263 ℹ pass 1260 ℹ fail 0 ℹ skipped 3` |
| e2e both projects, --workers=1 | `rc=0   24 passed (1.8m)  18:20Z` |
| full npm run test:node-guards (before the pin) | `rc=1 ℹ tests 1037 ℹ pass 1031 ℹ fail 1 ℹ skipped 5  18:39Z` |
| engine hash | `merged: 7bfbed8b0c6ecfff4ec3aa9457f74866bcc49c119a242631f2ac9b783a246551 (pinned 7bfbed8b0c6ecfff4ec3aa9457f74866bcc49c119a242631f2ac9b783a246551)` |

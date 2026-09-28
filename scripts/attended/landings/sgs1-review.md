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

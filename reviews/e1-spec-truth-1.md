# Drain review: `e1-spec-truth-1`, the six test-side E1 map reds re-pinned to what the game truthfully does (Opus implementer; F-SEF2-5 from the 2026-09-24 read-only investigation, F-TB-2)

**Branch** `test/e1-spec-truth-1` at `113430559` (eight path-scoped commits, prefix test:) · **merge** `348521f4d` · engine hash unchanged (`6a337525`, no pin) · drained attended 2026-09-24 09:04Z in a detached chain worktree; no deploy (no runtime file moved).

**Verdict: LANDED.**

### What it does
Six E1 map tests were asserting a world the game no longer builds, and each is now pinned to a measured truth: the Twin Banks stockpile targets move off the two winch mounts that `5e527a28b` made solid (the old points were inside the padded footprints, ghostValid false after 2 s; the new ones land the ghost exactly on target in 84 ms, the south one at z −15 because the hero's stand point walks into the winch otherwise); the east ford spawn moves one metre east so bandits actually take the ford (0 ford samples in 15 s before, 72 after, reached in under a second); the Night Shift fog ramp pins follow the values the game renders (fogNear/fogFar 18/42 to 34/58, the dark tint re-derived, and the control on main's tip proves the new entry-camera glance does not move them); the suspend race freezes waves at the record before the wave is set; the Baron prefetch asserts the per-body animator architecture instead of the deleted shared one; the mobile sprite-luminance ceiling is per project. The red inventory's two rows re-caused from `451daa5b9` to `7c2744e5a` by reading both diffs, and F-TB-1 gets its own row. Control on clean main against the branch, the same four specs, same hour, both projects, workers 1: 14 failed on main, 7 on the branch; seven project-runs cured, none added. Where the player sees it: nowhere; these are the instruments, and they now measure the game the player has.

### The seven reds that remain, all ruled
Four are F-TB-1 (`e1-twin-banks.spec.ts:64` and `beauty-twin-banks.spec.ts:295`, both projects): the owner ratified the braid on 2026-09-24 ("(5) (b)") and the HM-06 master re-pins them with the water surface, so passing them here would ratify the mask by test. Three are the new F-SEF2-5b (`e1-night-shift.spec.ts:284` both projects, `:402` mobile): the cured assertions unmasked later lines where `spriteLuminance` is a desktop-shaped instrument (samples world (0,0) while the Night Shift hero starts at (0,12), compares sRGB readings against a linear tint luminance, is lighting-invariant on mobile at 0.93262 day and dark, and its pixel patch is not DPR-normalised); curing it re-aims assertions the master did not name, so it is filed with the four numbers and a cure sketch, fire-authorable.

### Two more rows in this drain's e2e arm, attributed by control, not by memory
`beauty-twin-banks.spec.ts:219` ("the reed field is alive in a still frame", desktop) and `e1-twin-banks.spec.ts:218` ("seeded Twin Banks diagnostics are stable", mobile) were red on the merged tree and are outside this branch's edits. Neither was red in the implementer's control at `65e7947cb`; main then landed `8207be490` (the Twin Banks scatter replaced by grounded riparian cards, the file the reed test measures). The drain ran both tests three times on a clean detached checkout of today's main and three times on the merged chain, same hour, one worker: the reed field is red on clean main too (3 of 3 on main, 3 of 3 on the chain), so it is main's, not this branch's. the seeded-diagnostics test failed 0 of 3 on main and 1 of 3 on the chain: instability of the test itself, not this branch's. The red-inventory lookup labels both files KNOWN-RED from the 2026-08-11 snapshot, which excuses nothing by itself (F-1444-2); the control above is the evidence.

### Evidence (this drain's gates on the merged tree)
| Check | Result |
| --- | --- |
| tsc / build / e1 | `0 / 0 / 0` (rc) |
| engine hash | unchanged (`6a337525`, no pin), asserted before and after the battery (test-only branch) |
| law-pointer | `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards (skill.md, same-game audit, view schema, gate callers, citations, no-emdash, the red inventory parse and lookup, claimed specs) | `ℹ pass 141 ℹ fail 0 ` |
| e2e both projects, `--workers=1` (Twin Banks, Night Shift, the Baron, the Twin Banks beauty pass, task-025, m2-01) | `rc=1   9 failed   2 skipped   75 passed (8.6m)  08:45Z`; seven reds are the ruled rows above, two more are attributed by control below |
| the control for the two extra rows (clean main, then the merged chain, three runs each) | • chain base 6d16a5a68 • control start 09:02Z • control (a7cf4cbe9) reed desktop x3:   3 failed | stable mobile x3:   3 passed (15.6s)  • chain (348521f4d) reed desktop x3:   3 failed | stable mobile x3:   1 failed   2 passed (18.8s)  • control verdict inputs: reed main=3 chain=3 | stable main=0 chain=1  |
| full `npm run test:node-guards` | `rc=1 ℹ tests 959 ℹ pass 951 ℹ fail 3 ℹ skipped 5  08:53Z` (the registry rows are the hash class, the fixture sweep the load class, both known) |

### Merge classification
Tests and ledger only: `e2e/e1-twin-banks.spec.ts`, `e2e/e1-night-shift.spec.ts`, `e2e/e1-baron.spec.ts`, `logs/suite-red-inventory.md`, `artifacts/e1-spec-truth-1/**` (the report, the placement probe and its JSON, the ford trace, the Baron diagnostics dump, the control and branch transcripts). No `src/**`, no contract, no floor, no store change; the hash did not move.

### Findings
- **F-SEF2-5 (closed):** the six test-side reds; cured as above.
- **F-TB-2 (closed):** the east ford spawn was never on the ford; cured.
- **F-TB-1 (open by ruling):** the two braid reds wait for `hm-06-twin-banks-braid-water` (lane-c).
- **F-SEF2-5b (open, fire-authorable):** `spriteLuminance` as described; the three Night Shift rows red until it is re-shaped.
- **F-SEF2-5a (open, bookkeeping):** `red-inventory-lookup.mjs` parses only the first corrections table; the F-TB-1 row was filed in the parsed one, and the second table should be folded into it.
- **F-SEF2-5c (open, fire-authorable):** the seeded-diagnostics determinism test (`e1-twin-banks.spec.ts:218` on the merged tree, `:192` on main before this landing) is unstable: the implementer saw it red once on main's tip (desktop, visual y 0.0269 vs 0.3673), this drain saw it red on mobile; the control lines above give the rate. A determinism test that fails by itself needs its instability found (a frame-dependent visual y) before it can be trusted as a gate.
- **F-E1T-1 (open, fire-authorable, main's):** `beauty-twin-banks.spec.ts:219` "the reed field is alive in a still frame": the reed field is red on clean main too (3 of 3 on main, 3 of 3 on the chain), so it is main's, not this branch's. The riparian-cards landing `8207be490` is the first suspect (it replaced the scatter the test measures); the fix is a re-pin of the aliveness assertion to the cards or a card animation, in a corrective of its own.

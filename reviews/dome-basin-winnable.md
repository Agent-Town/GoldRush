# Review: dome-basin-winnable — the reel envelope priced honestly, and Dome Basin's first secure without any lever (scratch worktree, Claude Opus 5 implementer, attended drain 2026-09-06 morning)

**Slice/branch/tip:** `dome-basin-winnable` · `fix/dome-basin-winnable` · commit `4997a2d88` on base `0a120edd3` · merged to main: see the ledger row (first-parent merge; the collisions were the ledger, the guard list and `test-standings`, unioned).
**Verdict:** MERGED. Two things, both measured. (1) The envelope's byte axis is priced honestly: `maxTapeBytes = 16,384 + maxEntries × 160 + ceil(maxTicks / 30) × (2,400 − 160)`, an additive surcharge for order-array play (2,400 B = the corpus's largest entry, 2,162 B over 505 reels and 68,505 entries, +11%; 30 ticks = the engine's own hash cadence), `maxTicks`/`maxEntries` unchanged on every row, so nothing that fitted can stop fitting (guard-asserted over all 36 contracts); Dome Basin's ceiling 592,544 → 1,938,784 B, the derived outer wall `MAX_JSON_BYTES` 802,080 → 2,531,360. (2) Dome Basin secures wave 20 headless with NO game-side lever: three independent policies (tapes `fnv1a32:63b2c6e0`, `d9948f99`, `26e7a0a2`, 230-291 KB compact, all door-ACCEPTED), the winning ingredient being the untried buildable, sentry beacons (six permitted, the heat built none: the wall held 0 wrecked from t = 170 to 522 on twelve palisades, income 1.74 → 2.1 g/s). The smallest available lever (`feral_terraformer` `buildingDamageScale` 1.4 → 1) measured NEGATIVE (the same controller died two waves earlier, F-DBW-4) and was reverted. The margin past the gate is 28.4 s by declining the bank and riding on, short of the master's 60 s bar; reported, not tuned past.

## The premise corrected (F-DBW-1)
Heat 12's "621,674 B in 265 entries" was the tape's DISK size: `scripts/gr-sim.mjs:326` writes `JSON.stringify(tape, null, 2)` and the heat harness compared `fs.statSync(tape).size` to the ceiling, while the door's `validateTape` re-serialises compact. Compact, the w16 tape is 217,452 B and heat 11's "1.7 MB" relay tape 543,868 B: both were ACCEPTED under the old ceiling, then and now. Swept over 505 retained reels: 0 over bytes, 0 over entries, 0 over ticks. The defect was real but projected (a full-clock Relay Valley tape at 138.6 B/tick would reach 2.5 MB using ~1,900 of 3,601 entries), and both heats reported refusals that never happened. Corrective owed: `gr-sim --tape` writes compact or prints the compact size.

## Evidence
| Gate | Where | Result |
|---|---|---|
| Baseline death | worktree | w16 / 499.200 s, `fnv1a32:2b4a09b5` byte-identical; 26 works standing at 395.7 s → 0 at 456.3 s (30 wreckers), hero 0/175 at 499.2 s with 80 gold unspent; three local controller defects (a collision blacklist on its own wrecked frames, a palisade ladder stopped at 44 of 48, a self-imposed budget) |
| Proof | worktree | secured w20 / 600.000 s, outcome `fnv1a32:2381e895`, tape `fnv1a32:63b2c6e0`, 324 entries, 248,830 B compact, `durationTicks` 18001/18002, door ACCEPT; two more secures; `v6a`/`v7a` byte-identical apart from the minted id |
| Margin | worktree | 628.367 s riding on = 28.4 s past the gate (others 22.8 / 8.4 / 2.7 s); hero 94/175, 6 of 25 works standing at the secure: SHORT of 60 s, reported |
| Floors | worktree | `e9-dome-basin-01` w2/82600/`85282db9`, `-02` w2/79567/`bc51140e`, byte-identical to the pin; nothing regenerated |
| Guards | worktree | new `run-tape-envelope-budget` 5/5 (teeth: reverting the two-class sum reds 2 of 5), `test-standings` rc=0, the six named 68/68 |
| tsc / build | worktree | clean / green |
| e2e | worktree, own port 5308, both projects | `tape-01-run-tape` 10/10; `terrain3d-default` + `night3d-perf` 10/10; the E9 batch 30 passed / 4 failed and the census batch 37 passed / 1 skipped / 6 failed, all ten reds PRE-EXISTING by revert-run-reapply on a pristine tree (`e9-arsenal:29`, `:77` 3/3; `terrain3d-registry:196/:272/:345` 1/1); plain boot both viewports zero console errors |
| Engine era | worktree hash `c8d16b36…` | re-measured on the merged tree by the drain and pinned there (`src/playbook` is an engine input) |
| Attended on the merged tree | see the drain commit and the ledger row | tsc, `test-standings` both arms, the envelope guard, build, `tape-01` + `e9-boss-old-digger` at one worker on both projects |

Screenshots: `artifacts/dome-basin-winnable/shots/{desktop,mobile}-dome-basin-plain-boot.png`; tapes and traces under `artifacts/dome-basin-winnable/`.

## Merge classification
Base `0a120edd3`. `src/playbook/PlaybookFormat.ts`, `functions/api/standings.ts` (a comment), `scripts/test-standings.mjs` (the envelope table + one probe derived from `MAX_JSON_BYTES`, the declared firewall note), `package.json`: LANE-TOUCHED, unioned where main moved. `scripts/run-tape-envelope-budget.test.mjs`, `artifacts/dome-basin-winnable/*`: NEW. `tasks/BACKLOG.md`: MAIN-MOVED, unioned. Contract row and `MechanicsManifest` untouched.

## Findings
- **F-DBW-1 (corrective owed, fire-authorable):** `gr-sim --tape` writes pretty-printed JSON and the heat harness sized the file, not the submission; make the tool write compact or print the compact size, and re-read both heats' "refused" claims as never-refused.
- **F-DBW-3:** the heat controller's own three defects cost it four waves; the map was never the wall.
- **F-DBW-4:** a fixed policy is not monotone in a per-contract difficulty dial on a deterministic seed.
- **The margin bar:** 28.4 s against 60 s; the map is winnable by a rider that builds sentry beacons, which is the notebook lesson for heat 13, not a balance change.

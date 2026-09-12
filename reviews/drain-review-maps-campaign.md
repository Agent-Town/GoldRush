# Drain review — `sol/map-art-inventory-20260908` (Astra's map art + playability campaign), gated on a merged tree

**Slice/branch/tip:** `sol/map-art-inventory-20260908` @ `883a3521e` (1,299 files; committed for retention 2026-09-12 from `~/.codex/worktrees/5b60/Gold Rush`, where its 96 GB evidence tree `artifacts/map-art-repairs-20260908` stays on disk, desk A18; pushed to origin).
**Gated on:** `drain/maps-campaign` merge `fce340052` = main `65fc3af29` + `883a3521e`, `git merge --no-ff`, zero conflicts, no MAIN-MOVED ∩ LANE-TOUCHED file (`artifacts/drain-review-maps-campaign/main-moved-overlap.txt` is empty). **Control:** `wt-maps-control` detached at `65fc3af29`.
**Reviewers:** Claude Opus 5 ran the gates and the eyes-on captures in the scratch worktree `wt-maps` (port 5326) until the owner asked for a lean review and it was stopped; the attended session (Fable 5.1, 2026-09-12) ran the replay attribution and wrote the verdict. Every number below comes from a transcript in `artifacts/drain-review-maps-campaign/`.

## VERDICT: HOLD — the branch stays whole on `sol/map-art-inventory-20260908`; its contract-and-door layer goes to the OWNER'S DESK (A20)

The campaign is one inseparable change: 66 `src/` files (`Game.ts`, `HeadlessContractSim.ts`, `Balance.ts`, `Enemy.ts`, `Hero.ts`, the E7/E8/E10 systems, a new `E10ArchiveSystem`, `FlotillaView`, `ClaimBoatView`, the encyclopedia archive, UI), 17 contracts re-parameterised, 24 new guards, 95 terrain GLBs under `assets/pilots/map-rebuild-spike` (inside `ENGINE_SOURCE_INPUTS`), 74 plaza props, 12 flotilla GLBs, 16 raw plates, 15 layer contracts. The replay attribution says landing it retires 13 of the 15 replayable verified county rows. That is an era decision, not a drain's.

## 1. THE REPLAY ATTRIBUTION (ADR-004)

Method: for every contract with a verified top row on the live board, the heat-13 submission tape (`artifacts/gauntlet-heat13-569a41f9/rides/<contract>/submission.json`) was replayed with `scripts/assay-replay.mjs` on the merged tree and on the control; script `artifacts/drain-review-maps-campaign/replay-rows.mjs`, transcripts `replay-merged-attended.log` / `replay-control-attended.log`.

| tree | HOLDS | MOVES | NO REPLAY | rows |
|---|---:|---:|---:|---:|
| control (main `65fc3af29`, engine-identical) | 14 | 0 | 0 | 14 (+ e9-devils-alley: no heat-13 tape on disk) |
| merged (`fce340052`) | **2** (the-claim, e7-relay-valley) | **1** (e1-dry-gulch `e490fcd5` → `036a109a`, its `tileParams` changed) | **12** (`assay replay failed: declared runStart is not installable by this door`) | 15 |

Every one of the twelve un-installable tapes is one whose declared `research.epochId` (`epoch-1-frontier`) differs from the contract's own epoch; both tapes that match their contract's epoch install and hold (`tape-epochids.txt`). The merged door therefore refuses a tape main accepts today — the `src/` site was not located in this lean pass (UNVERIFIED which file; the effect is measured). `e1-twin-banks` fetched no board row in the attended run (transient) and is covered by the reviewer's `live-recorded-hashes.txt` (`3104ad94`, verified, ranked).

**Null floors** (`null-floor-table.txt`): of 30 recorded seeds, 21 hold on both trees; **9 MOVE on the merged tree** (`e1-twin-banks` ×5, `e2-hill-mine` ×2, `e2-trestle` ×2) while the branch's committed floor file still carries main's values — the branch changed those maps' `tileParams` and did not re-measure its own floors, so its floor guard is red on its own tree (F-MAPDR-3).

## 2. Gate table (merged tree, port 5326)

| gate | result |
|---|---|
| `npx tsc --noEmit` | GREEN (rc=0) |
| `node scripts/first-town-payload.mjs` | GREEN — 33,942,058 B (main 33,851,294 B; +90,764 B; gate 35,000,000 B) |
| `npm run build:release` | RED on the merged tree **and on the control**: `assert-release-build` reports eight later-era townsfolk portraits emitted into the e1 release (`townsfolk-appliance-wrangler-e6`, `townsfolk-baron-e10`, `townsfolk-boilerwright-e2`, …) — PRE-EXISTING on main (F-MAPDR-2) |
| `test:mp` / `test:accounts` / `test:stats` | GREEN — 466 / 43+43 / 320+320+26 checks |
| `deploy-contract` | 4/4 PASS |
| `view-schema` / `e3-mask-tables` | 3/3 / 30/30 |
| the branch's new guards the reviewer ran | `e8-party-air` 1/1, `e10-archive-wiring` 1/1, `early-secure-score` 4/4, `deck-menu` 1/1, `e8-air-suspend` 1/1, `deepwater-rider-parity` green; `check-map-landmark-repeat-check` needs `PROBE_BASE` (not run) |
| full `test:node-guards` | NOT RUN to completion before the stop — UNMEASURED; the floor guard is known red (F-MAPDR-3) |
| e2e, both projects, one worker | **104 passed / 18 failed** (8.1 min): 14 `er01-*-census` rows (e10-archive-world, e2-hill-mine, e2-trestle, e2-pressure-garden, e2-incline, e3-canyon-works, e8-mare-claim; both projects) and 4 `task-025-bandits-dont-swim` (mobile). All 14 census reds sit on contracts whose `tileParams`/`twist`/door state the branch changed (`contract-key-changes.txt`) — the contract layer's consequence, not flakes. The task-025 quartet is unattributed (no control run) |
| eyes-on | 20 captures, 10 maps × 2 viewports, `reviews/shots-drain-review-maps-campaign/` (the reviewer's one note before the stop: "The Baron's water reads near-black", unattributed) |

## 3. Per-layer verdict (scope item 6 of `tasks/drain-review-maps-campaign.md`)

| layer | verdict | why |
|---|---|---|
| (a) review documents + small evidence (`reviews/sol-map-art-*.md`, skill.md prose) | HOLD with the branch | they describe a tree that is not main's |
| (b) guards and scripts (24 new, 17 modified) | HOLD | three of the six run are green; they gate `src/` that only exists on this branch |
| (c) art — map-rebuild-spike terrain, plaza props, flotilla, raws, layer contracts | HOLD, splittable later | `assets/pilots/map-rebuild-spike` is in the engine-hash corpus; the rest is outside it and could be carved by a split master when the factory wakes |
| (d) contract data — 17 contracts (`tileParams` on 13, `twist` on 3, briefings on 5) | **OWNER'S DESK (A20)** | retires 13 of 15 replayable live rows; floors not re-measured |
| (e) `src/` — 66 files incl. the door tightening and the sim | **OWNER'S DESK (A20)**, inseparable from (d) | the same change moves the engine hash and the door |

## 4. Findings
- **F-MAPDR-1 (owner):** the branch's door refuses every live tape whose research epoch differs from the contract's own (12 of 15), and its `tileParams` move a 13th. Landing = retiring the county board under a new era and re-riding (heat 14), or not landing. Options on the desk (A20).
- **F-MAPDR-2 (pre-existing on main, fire-authorable):** `npm run build:release` is red on main today — eight later-era townsfolk portraits are emitted into the e1 release (`ctrl-build-release.txt`). Unrelated to this branch.
- **F-MAPDR-3 (branch defect):** the committed null-floor file was not re-measured for the 9 re-parameterised seeds named above; red on its own tree.
- **F-MAPDR-4 (consequence):** 14 census e2e reds follow the contract changes; they are not separately fixable.
- **F-MAPDR-5 (retention):** the 96 GB evidence tree stays on disk in Astra's worktree (A18); nothing from it is needed to reproduce this review.

## 5. What was touched
Nothing on main but this review and its evidence. `drain/maps-campaign` (scratch worktree `wt-maps`) holds the merge `fce340052` and is not pushed; the branch `sol/map-art-inventory-20260908` is unchanged and on origin.

# Drain review — `sol/map-art-inventory-20260908` landed as county era 6, "the Re-surveyed Claims" (attended, 2026-09-14)

**Slice/branch/tip:** `sol/map-art-inventory-20260908` @ `883a3521e` (Astra's map art + playability campaign, 1,299 files, 66 `src/`; committed for retention 2026-09-12; its 96 GB evidence tree stays on disk, A18). **Merged as** `22c84f2f3` = main `9382083d3` + `883a3521e` (`git merge --no-ff`), then the drain's cures on top; landed by fast-forward at the hash the ledger row names. **Master:** `tasks/maps-campaign-land-era6.md`.
**Owner rulings, verbatim:** 2026-09-13 "ah, that is all no problem. we don't have players yet so we can just keep going" · "we then have to make another run in the future but not immediately" · 2026-09-14 "the Re-surveye Claims" is good for me · "Lets get the updated parts of epoch one into the live version. You can use the fires for that but don't use the ChatGPT subscription, only the Anthropic subscription."
**Reviewer:** the attended session (Fable 5.1), on the Anthropic subscription only; the 2026-09-12 HOLD review (`reviews/drain-review-maps-campaign.md`, Opus 5 + attended) supplied the per-layer measurements this land reuses.

## VERDICT: LANDED as era 6 — every era-5 reel retires counted; heat 14 is a later, separate step

## 1. Merge classification (measured with `git merge-tree` before merging)
Every `src/` file auto-merged, including the five the boss-fidelity land had touched the same week (`Game.ts`, `HeadlessContractSim.ts`, `pools.ts`, `RunSuspend.ts`, `BuildSystem.ts`; each hunk pair read). Five non-code conflicts, resolved as the master prescribes: `assets/LEDGER.md` union (both sides, one block); `assets/engine-era.json`, `scripts/fire.md`, `scripts/law-pointer-baseline.json`, `scripts/glb-contract-guard.baseline.json` take main's (the branch's edits to those were for Astra's own trees). Nothing under `artifacts/map-art-repairs-20260908` was added.

## 2. Gate table (merged tree, Node 26 on PATH, fires stopped)
| gate | result |
|---|---|
| `npx tsc --noEmit` | GREEN (rc=0) |
| `npm run build` / `GR_RELEASE=e1 npm run build` | GREEN / GREEN |
| `node scripts/first-town-payload.mjs` on the **release** build (the flavour `scripts/deploy.sh:103` deploys) | **33,947,154 B** of 35,000,000 (1,052,846 B headroom); main read 33,856,285 B, delta +90,869 B. On a normal build the check fails by design: the E1 release plugin (`vite.config.ts:89-124`, enabled only under `GR_RELEASE=e1`) is what emits the declared `_gold-rush-release-e1-ceremony-scripts.js` chunk |
| `scripts/glb-contract-guard.mjs` | RED → GREEN: 62 STALE baseline entries (assets the branch fixed, mostly `map-rebuild-spike/landmarks/*` extras and the plaza props' 2048² textures) deleted by the guard's own list; 423 production GLBs, 5 violations, 5 grandfathered, 0 live |
| `scripts/law-pointer-guard.test.mjs` | RED → GREEN 22/22: one drift, `scripts/fire.md → src/game/Game.ts:2652` → `:2661` (+9, the campaign grew `Game.ts` above the site; re-based by reading, then `--update` touched only that pointer) |
| `scripts/gate-caller-audit.test.mjs` | RED → GREEN 45/45: the branch's 20 server-less guards rooted in the FIRST `run-node-guards.mjs` stage of `test:node-guards` (never the swallowed tail, F-DRB-11); its 3 browser probes (`map-dome-mount-check`, `map-landmark-loading-check`, `map-landmark-repeat-check`, need `PROBE_BASE`) recorded in `gate-caller-baseline.json` under `grandfathered` with the reason |
| `e2e/er01-e2-census.spec.ts` | RED → GREEN 4/4 after two cures: (a) `pressure_generation.coalSeconds` 12 → 36 re-pointed (F-MAPL-1); (b) the E2 `engineDependencies` declarations the branch had dropped were restored (F-MAPL-2) |
| `e2e/er01-e3-census`, `er01-e8-census`, `er01-e10-census` | GREEN 3/3 each on the merged tree (the 2026-09-12 reds were on the old base) |
| `e2e/task-025-bandits-dont-swim.spec.ts` | 9/10 on the first run (mobile "scheduled waves never place enemies in deep river": `watch.samples` read 0); the single test re-run alone on the merged tree: **1/1, 1/1**; control: **1/1 on main** (the primary checkout, its own vite on 5342) → FLAKE under load, not the campaign |
| `e2e/m1-01-claim-jumpers-death`, `m2-01-build-menu`, both projects | **24 passed / 0 failed** (1.9 min) |
| null floors (`scripts/null-floor-anchors.mjs`) | `--check` on the merged tree: **44 differences** (the campaign's tileParams, the door and `coalSeconds` move floors on 44 of 83 seeds, not 9 as on the old base); re-recorded from measurement, 83 floors, 248 s; second record after every contract edit: **byte-identical** to the first record (238 s) — the `engineDependencies` restores do not move a floor |
| the twenty guard files the battery chain skips (F-DRB-11), run by hand | **117 pass / 7 fail** of 124: the two ADR-005 reds main already carries (`relay-rush-reel.test.mjs:151`, `run-tape-envelope-budget.test.mjs:88`) plus five that are this era bump's own consequence, all guards pinned to era-5 reels or to the old contract data — `board-tape-gold.test.mjs` ×3 ("the standing's gold is the purse held at the secure tick" for e3-moth-season, e7-relay-rush, e8-mare-claim: heat-13 tapes that no longer install), `rider-parity-retirement.test.mjs` ("the retired reel reaches wave 20 with its purse and still cannot secure"), and `e10-squall-scheduler.test.mjs` ("no other board contract grows a squall": the Archive World now does, by the campaign's design). None runs in the battery today (F-DRB-11); all five are F-MAPL-4, corrective row opened |
| eyes-on, ten maps × two viewports on the final tree (`reviews/shots-maps-campaign-land-era6/`) | **20 captures, zero console and page errors on all ten maps × two viewports** (`attended-maps-eyes-on.log`; the probe's draw-call and landmark counters read null on this tree, the boot and the body text were captured) |
| full `test:node-guards`, Node 26, all seven stages, on the final tree | <BATTERY> |
| engine era | era 6 "the Re-surveyed Claims" declared in `assets/engine-era.json` (history keeps era 5's summary, one fresh pin with `aliases: []`), hash `0e9bb11725d9375c78085ab187fab3c7b13bf09fba25ab97c5d7e43181e0481d` (measured twice on the final tree, before and after the guard re-points; `engine-era-guard` + `bench-seeds` 9/9) |

## 3. The inverted replay (what the era bump retires)
Every era-5 reel retires by the era itself (`currentLineageRefusal`: "This reel rode era 5; the county accepts era 6"). Independently of the era, the campaign's own effect on the 16 heat-13 tapes replayed on the final tree (`attended-replay-era6.log`):

| contract | tape hash | era-6 replay | verdict |
|---|---|---|---|
| e1-dry-gulch | fnv1a32:e490fcd5 | fnv1a32:036a109a | MOVES |
| e2-incline | fnv1a32:a489588e | NO REPLAY (declared runStart is not installable by this door) | NO REPLAY |
| e2-pressure-garden | fnv1a32:75473887 | NO REPLAY (declared runStart is not installable by this door) | NO REPLAY |
| e3-blackout-ridge | fnv1a32:ade266f4 | NO REPLAY (declared runStart is not installable by this door) | NO REPLAY |
| e3-canyon-works | fnv1a32:21952647 | NO REPLAY (declared runStart is not installable by this door) | NO REPLAY |
| e3-moth-season | fnv1a32:6f7df0c3 | NO REPLAY (declared runStart is not installable by this door) | NO REPLAY |
| e4-gusher-county | fnv1a32:0e24753e | NO REPLAY (declared runStart is not installable by this door) | NO REPLAY |
| e7-dead-band | fnv1a32:b3234ac0 | NO REPLAY (declared runStart is not installable by this door) | NO REPLAY |
| e7-echo-canyon | fnv1a32:d8c34088 | NO REPLAY (declared runStart is not installable by this door) | NO REPLAY |
| e7-relay-rush | fnv1a32:e4238fc2 | NO REPLAY (declared runStart is not installable by this door) | NO REPLAY |
| e7-relay-valley | fnv1a32:41eea3b5 | fnv1a32:41eea3b5 | HOLDS |
| e8-eclipse | fnv1a32:b1e52be6 | NO REPLAY (declared runStart is not installable by this door) | NO REPLAY |
| e8-mare-claim | fnv1a32:5ace32f2 | NO REPLAY (declared runStart is not installable by this door) | NO REPLAY |
| e9-dome-basin | fnv1a32:15d21e4a | NO REPLAY (declared runStart is not installable by this door) | NO REPLAY |
| the-claim | fnv1a32:22ca1b99 | fnv1a32:22ca1b99 | HOLDS |

**2 hold, 1 moves, 12 do not install, 1 has no heat-13 tape (e9-devils-alley).** The HEAT-14 row carries all seventeen contracts as the re-ride agenda.

## 4. Findings
- **F-MAPL-1 (balance, owner veto window):** `src/game/Balance.ts` `boilerHouse.coalSeconds` 12 → 36 — a coal lasts three times longer in every pressure map. Astra's playability pass made the change without a line in its review documents; the E2 census pin was re-pointed to the value the sim advertises. Reverse with one owner word: set it back to 12 and re-point the pin and the floors.
- **F-MAPL-2 (defect, cured):** the branch dropped seven `engineDependencies` declarations from E1/E2/E3 contracts (`dry-gulch-inert-fields`, `elevation-advisory-fields` ×5, `fairground-crowd-flock-consumer`) with no consumer added for six of them (the `slopeMax` readers are the same six lines in the same three files on both trees). Six restored from main; the Fairground one stays removed because the branch ships the crowd consumer and its own guard (`scripts/fairground-dependency.test.mjs`) proves it.
- **F-MAPL-3 (the 2026-09-12 review's reds, attributed):** the 14 census reds were the old base plus F-MAPL-1/-2; the four task-025 mobile reds were a dead vite server (`ERR_CONNECTION_REFUSED` on port 5324), not the campaign.
- **F-MAPDR-2 (pre-existing on main):** `build:release`'s `assert-release-build` — red on main in the 2026-09-12 control run (eight later-era townsfolk portraits emitted into the e1 release); not re-run here and not this land's to cure — the deploy path (`GR_RELEASE=e1 npm run build`, green here) does not run that assertion.
- **F-MAPL-4 (guards pinned to era-5 reels, corrective owed):** five of the twenty hand-run guard files red on the era-6 tree for the era's own reason (see the gate table); the corrective re-points or retires those fixtures together with the F-DRB-11 chain fix, so the battery starts running all twenty. Fire-authorable.
- **F-MAPL-5 (informational, re-pinned):** `e10-archive-world`'s clock moved from an explicit `twist.clockTicks` to a derived `twist.secureWave` with the Archive World's new objective; the county's contract-clock census pin in `scripts/test-standings.mjs` follows the data (42/25/17/0).
- **F-MAPL-6 (re-pointed):** `scripts/engine-era-guard.test.mjs` asserted the three Claude-debut reels (`artifacts/claude-debut-2026083*/`) "stay playable in the current era" — false across any era bump by ADR-004's own rule, and on this engine they do not install at all (the strict door reads their pre-ADR-005 orders as a malformed tape). They are NOT re-stamped; `history`'s era-5 entry now carries the full era-5 lineage (86 pins) and the guard checks the reels' papers against it.
- **HEAT-14 (owner: "in the future but not immediately"):** every board re-rides on era 6 when the owner says so; the BACKLOG row opened at land carries the agenda (the 17 retired rows by contract).

## 5. What was touched beyond the merge
`assets/contracts/{epoch-1-frontier,epoch-2-steamworks,epoch-3-voltage}/contracts.json` (F-MAPL-2 restores; the files re-serialised), `assets/contracts/null-floors.json` (re-recorded), `assets/engine-era.json` (era 6), `e2e/er01-e2-census.spec.ts` (one pin, with cause), `scripts/fire.md` + `scripts/law-pointer-baseline.json` (one pointer), `scripts/glb-contract-guard.baseline.json` (62 stale lines gone), `scripts/gate-caller-baseline.json` (3 reasons), `package.json` (20 guards rooted), `reviews/maps-campaign-land-era6.md`, `reviews/shots-maps-campaign-land-era6/`, `artifacts/maps-campaign-land-era6/`, `tasks/goals.json`, `tasks/BACKLOG.md`; and by the owner's 2026-09-14 word on the fires: `scripts/fire-runner.sh` (`FIRE_ENGINE` default → `claude`, the codex path intact) and `tasks/CODEX-WALL` (up). Also `scripts/engine-era-guard.test.mjs` (era pin 5 → 6; F-MAPL-6) and `scripts/test-standings.mjs` (F-MAPL-5).

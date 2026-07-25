# THE HONEST SAGA REHEARSAL — rig repair + fresh-profile traversal (2026-07-25)

## Verdict

**READY-FOR-GATES.** The repaired rig carried one fresh profile from the founding through the legitimate T6 → E7 door, then exercised the E7–E10 flagship legs and the post-credits River. Every accepted segment reports `console=0 page=0`; failed attempts stopped immediately, were diagnosed from their saved footage/profile, and were rerun on that same fresh profile.

Game runtime: detached current `main` at `76635963`. Rig changes: `lane/m4` worktree, no game/source/assets/e2e edits and no commit. Direct contract boots and documented grinding controls are evidence seams, not claims of an unassisted playthrough.

## Gates passed

| Gate | Verdict | Live evidence |
|---|---|---|
| R1 overlay visibility | PASS | All rig visibility checks use the overlay open class plus `aria-hidden`; no `getClientRects` remains. Boss drivers moved and observed acts. |
| R2 boss identity | PASS | Component targeting uses `variantId + bossComponentId`; E1 uses its legacy `hasBanner` single body. Railcar counts `3 → 2 → 1 → 0`; Yacht’s saved timeout isolated the surviving `wheelhouse`. |
| R3 Stamp Mill | PASS | Science met, stages funded and waited `1/3 → 2/3 → 3/3`, `complete=true`; T1 door then armed E2. |
| R4 Static setup | PASS | E10 used the epoch parameter, manual simulation, and near arrival. Lantern, song, and portrait all preserved; `victory=receded`, `killPath=false`. |
| First claim | PASS | Honest founding run lost at wave 2; bounded, actively moved retry secured wave 10 and banked all four tracks. |
| Boss verbs | PASS | Baron orbit/fort; Railcar wheels→boiler→cabin; Crawler six pylons + mast→tracks→capacitor; Yacht wheels→crane→wheelhouse; Queen claw interrupt→paddles→hold; Homemaker vac→core; Echo novelty; Claw grapples→winch→feet; Digger record→board→swap; Static preserve. |
| T1–T6 chain | PASS | Every door ready, hand played, successor armed once, and active epoch survived reload. No `&era=`. T6 genuinely armed E7; no storage pin. |
| One-profile Book | PASS | Post-T6 board exposes all ten chapter tabs; E1–E7 were reached by the recorded chain. |
| F-REH-05 | RESOLVED | At 2,405 sim seconds: `corsairWaves=100`, `xp=500`, `kills=129`, `hudWave=0`. Deepwater progresses; the generic HUD counter is misleading. P2 draft added. |
| Errors | PASS | Every accepted ledger row: zero console errors, zero page errors. |

## Repair ledger

- R1: replaced false box-generation visibility with the overlay’s real open state.
- R2: shared boss pilot now acquires authored variants/components; all boss loops log act changes and reject timeouts.
- R3: both construction projects wait each defended stage with 90-second deadlines and assert stage 3 completion.
- R4: E10 mirrors the Static reference setup and asserts recession.
- R5: `fileURLToPath(import.meta.url)` prevents spaces in the repository path becoming a literal `Gold%20Rush` sibling.
- R6: `run-all.mjs` exits at the first nonzero child and can resume from a diagnosed index.
- R7: T2 drains queued story cards while keeping the crank held; the actual ceremony recording was recovered from Playwright’s interrupted spool.
- R8: the active-epoch logical key is read through the profile-scoped Storage layer; the retired T6 manual pin was deleted.

## Era ledger

| Era | Gate verdict | What the fresh profile proved |
|---|---|---|
| E1 — Frontier | PASS | Founding/player-facing first claim; honest loss; secured retry; full-HP Baron defeated while damageable and continuously kiting; medal/Claim Office; Stamp Mill 3/3; T1 armed E2. |
| E2 — Steamworks | PASS | Railcar components fell in order; Dynamo Hall 3/3; crank ceremony lit the Elder’s Tree and armed E3; reload persisted. |
| E3 — Voltage | PASS | Six secure-path pylons; Crawler act `0→1→3`, wreck kept; Refinery purchase; valve hold; T3 armed E4; kept image persisted. |
| E4 — Motor | PASS | Live Yacht orbit and loot; wheels beached it, crane and wheelhouse completed act 3; wreck/salvage stayed; T4 haul armed E5. |
| E5 — Deepwater | PASS | Queen claw interrupted once, paddles removed, hold/hulk reached act 3; T5 rhythm + homecoming pass armed E6. Supplemental 40-minute probe disproved no-XP. |
| E6 — Atomic | PASS | Homemaker reached `DONE`, chair/powered-down state; Calculating House mount-plate hold armed E7; E7 survived reload. |
| E7 — Signal | PASS | Relay Valley booted; varied movement landed three novelty strikes; Echo jarred. E7 exit-network milestones were not required for this boss leg and remained false. |
| E8 — Orbital | PASS | Mare vacuum profile active; both grapples, winch, and anchor feet broke; carcass state reached. |
| E9 — Red Fields | PASS | Recorded the player’s basin route, boarded the live Digger, reached the tape deck, swapped that recording, joined fleet; gentle state survived reload. |
| E10 — Deep Sky | PASS | Static engaged, all three meanings preserved, Quiet receded; re-ink and River offer appeared; River charter launched into a playable dawn with the river vista present. |

## F-REH debt disposition

- **F-REH-01 CLOSED:** T6 exists live. `e6-02-t6-the-calculating-house-ceremony.webm` shows the real door, mount-plate hand, one E7 arm, kept image, reload, and E7 town.
- **F-REH-02 CLOSED for this internal saga gate:** Relay Valley and the Echo booted and completed through the current flagship contract.
- **F-REH-03 CLOSED for this internal finale gate:** Last Claim booted with the task-required E10 setup; the preserve/recession/River chain completed.
- **F-REH-04 CLOSED:** the E1–E7 spine is now rehearsal-proven on one profile.
- **F-REH-05 RESOLVED / P2 clarity draft:** XP and Deepwater corsair waves are healthy; the generic HUD remains at wave 0. See `tasks/DRAFT-deepwater-hud-corsair-counter.md`.

## Video ledger

All files are local under `rehearsal-video/`; durations are from `ffprobe`.

| File | Duration | Evidence |
|---|---:|---|
| `e1-01-the-founding-and-first-claim.webm` | 1:25 | First boot, founding, first-claim launch, honest death |
| `e1-01b-the-first-claim-run.webm` | 1:48 | Moving retry, live waves, wave-10 secure and payout |
| `e1-02-the-baron.webm` | 0:58 | Baron arrival, continuous orbit, half-health, defeat card |
| `e1-03a-stamp-mill-stages.webm` | 0:12 | Three funded/defended construction stages |
| `e1-04-t1-the-stamp-mill-ceremony.webm` | 0:05 | Mill, valley, title, E2 arm |
| `e2-01-hill-mine-and-the-railcar.webm` | 1:38 | Railcar components plus Dynamo Hall 3/3 |
| `e2-02-t2-dynamo-ceremony-full-attempt.webm` | 0:58 | Recovered full crank, lamp, Voltage title |
| `e2-02-t2-the-dynamo-ceremony.webm` | 0:04 | E3 reload-persistence proof |
| `e3-01-canyon-works-and-the-crawler.webm` | 0:19 | Six pylons, Crawler acts, wreck |
| `e3-02-t3-the-refinery-ceremony.webm` | 0:16 | Valve hand, kept image, E4 arm/reload |
| `e4-01-dust-flats-and-the-land-yacht.webm` | 0:19 | Orbit, beach, crane/wheelhouse, act-3 wreck |
| `e4-02-t4-the-boat-ceremony.webm` | 0:16 | Haul hand, first wave, E5 arm/reload |
| `e5-01-deepwater-and-the-dredge-queen.webm` | 0:11 | Claw interrupt, paddle removal, Queen act 3 |
| `e5-01b-deepwater-40-sim-minute-probe.webm` | 1:27 | Moving 2,405-second F-REH-05 probe |
| `e5-02-t5-the-deep-reactor-ceremony.webm` | 0:16 | Rhythm pulls, homecoming pass, E6 arm/reload |
| `e6-01-glow-mesa-and-the-homemaker.webm` | 0:17 | Vac/core, DONE, the chair |
| `e6-02-t6-the-calculating-house-ceremony.webm` | 0:15 | **E6→E7 door moment**, mount plate, persisted E7 |
| `e6-03-one-profile-board-chapters.webm` | 0:03 | Ten chapter tabs on the chained profile |
| `e7-01-relay-valley-and-the-echo.webm` | 0:17 | Novelty movement and jar |
| `e8-01-mare-claim-and-the-claw.webm` | 0:14 | Grapples, winch, anchor feet, carcass |
| `e9-01-dome-basin-and-the-old-digger.webm` | 0:13 | Recording, boarding, swap, gentle reload |
| `e10-01-the-last-claim-the-static.webm` | 0:13 | Three preserves, recession, River lever/dawn |

Contact sheet: `reviews/saga-rehearsal-contact-sheet-2026-07-25.jpg` (filename-sorted, left-to-right then top-to-bottom).

## THE TEN MOMENTS

1. `e1-01b-the-first-claim-run.webm @ 1:43` — the first claim holds and the four-track payout lands.
2. `e1-02-the-baron.webm @ 0:51` — a full-HP Baron falls after the continuous orbit.
3. `e1-03a-stamp-mill-stages.webm @ 0:09` — the Stamp Mill reaches 3/3.
4. `e2-02-t2-dynamo-ceremony-full-attempt.webm @ 0:14` — the first lamp burns in the Elder’s Tree.
5. `e3-01-canyon-works-and-the-crawler.webm @ 0:13` — the secured path pins the Crawler and leaves the wreck.
6. `e4-01-dust-flats-and-the-land-yacht.webm @ 0:14` — wheels, crane, wheelhouse: the gang quits the beached Yacht.
7. `e5-01-deepwater-and-the-dredge-queen.webm @ 0:07` — the interrupted claw opens the paddle/hold finish.
8. `e6-02-t6-the-calculating-house-ceremony.webm @ 0:08` — the Prospector’s plate mounts and E7 arms.
9. `e9-01-dome-basin-and-the-old-digger.webm @ 0:08` — the player’s recorded route replaces the old tape.
10. `e10-01-the-last-claim-the-static.webm @ 0:10` — meaning survives; the River lever hands the game on.

## Shortcuts and boundaries

- Cited grinding controls: timescale, `setWave`, max upgrades, earned-resource stand-ins, bounded retry alive-cap, manual simulation for deterministic long probes/E10, direct flagship contract boots.
- Boss outcomes were never written directly. The hero moved during every fight; required components/verbs and authored outcome diagnostics were observed.
- The first failed Yacht retry is retained in `segments.jsonl` and the log; its final accepted video is the repaired 19-second run.
- Release-frontier presentation remains distinct from this internal full-saga rehearsal. This report is the requested evidence gate, not an assertion that every later era is exposed from the current public E1 shell.

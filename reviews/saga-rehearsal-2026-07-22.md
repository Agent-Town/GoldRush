# THE SAGA REHEARSAL — E1→E10 as one game (2026-07-22)
Commission: owner-selected 2026-07-22 (TASK.md, untracked). One profile ("Rehearsal", town **Kettle Creek**), created at boot through the real UI, carried through all ten eras. Verifier session on branch `rehearsal/saga-e1-e10`; solo writer; NO gameplay/src edits — findings become task drafts.

## METHOD (what "honest" means here)
- Every play session drives the REAL game (vite on :5231, Chromium 1280×720 headless, `rehearsal/lib.mjs` + `rehearsal/segments/*` — committed as evidence) and records video to `rehearsal-video/` (LOCAL ONLY, never committed; ledger below lists every file).
- Debug tools shortcut GRINDING only (timescale, science-step seeds between runs, wave-skip toward a boss) — each use is cited inline. Gates are never seeded: ceremonies are played through their doors and hands, bosses fought through their real acts on their real contracts, save persistence exercised by reloads between eras.
- Screenshots land in `reviews/shots-rehearsal/` (committed per era-pair milestone). Contact sheet of all 13 recordings: `reviews/shots-rehearsal/contact-sheet-rehearsal-2026-07-22.png` (saga order, 4×4).
- Known map-quality classes (docs/MAP-QUALITY-REGISTER.md MQ-1..11) are not re-filed unless observed WORSE than registered.
- The full orchestrator output cited below as `run-all.log` stays LOCAL (`*.log` is gitignored) at `rehearsal-video/run-all.log`, beside the videos it narrates.

## HONESTY PREAMBLE — what this run actually proves
The mechanical traversal ran to the end (orchestrator rc=0, all 16 segments attempted, 13 videos, zero console/page errors in every single segment). But the orchestrator continues past segment failures by design, and the interpretation leg found — from `run-all.log` and the footage itself — that **five segments crashed (T1–T5 ceremony legs) and every 10-minute boss loop ran driver-blind** (rig defect R1 below). Where the rig said "timeout", the footage sometimes shows victory (E2, E6), sometimes death inside the first minute (E1, E4, E8), sometimes an endless unengaged run (E3 to wave 94; E5 at wave 0). Every claim below is therefore graded against what the FOOTAGE and diagnostics show, not what the segment names or outcome fields say. A 12-second segment proves the sequence of its acts fires and persists; it does not prove pacing, feel, or player-viability — those are marked as such.

## RIG DEFECTS (rehearsal-side, not game findings — but they void several legs; all ✓ VERIFIED in code)
- **R1 — the paralyzed driver.** Every boss loop gated on `upgradeOpen = !!(card && card.getClientRects().length)`. The closed upgrade overlay hides via `visibility: hidden` (src/ui/theme.css:1319), which still generates client rects — so `upgradeOpen` was ALWAYS true, every iteration pressed a digit key and `continue`d, and the driver never moved, never logged an act, and never reached its own death-check for the entire 10 minutes of every boss segment. All eight "timeout" outcomes are artifacts of this. The fights ran UNPILOTED (hero standing at spawn with `maxUpgrades()`, auto-fire only).
- **R2 — wrong detection field.** E1/E2 watched `enemyPositions()` for `eliteKind === 'baron'/'railcar'`; the entries expose `variantId`, not `eliteKind` (verified against the E9 dump — no such field). The Baron and Railcar were on the field (E1: `baron_rocket:33` in diagnostics; E2: defeat banner on film) and the rig never saw either.
- **R3 — the underbuilt mill.** e1-03a funded the Stamp Mill to stage 1/3 and gave up (its per-stage wait was too short; first `fundMegaproject()` failed while the mill was still locked at science 4). The T1 door correctly renders NOTHING until the mill is complete (TownScene.ts:1366 `if (!megaprojectComplete(...)) return ''`), so part B crashed on a missing `raise-stamp-mill`. **The profile therefore never legitimately left epoch 1**, and every later town-side leg (T2–T5 doors, per-era squares/wardrobe, board chapters) ran against an epoch-1 town and crashed or probed the wrong era. The game behaved per design in every one of these crashes.
- **R4 — the unengaged Static.** The E10 segment skipped the setup its own reference spec uses (e2e/e10-static-boss.spec.ts:3,19–27: `epoch=epoch-10-deepsky`, `setManualSim(true)`, `e10Static.arrivalZ`); all three preserve interacts returned false and the Static stayed at act 0.

## PRE-PLAY STATIC FINDING
**F-REH-01 (P0, release-blocking by construction): the saga has no doors past T5 — it hard-walls entering E7.** ✓ VERIFIED (read the files, traced the arming path):
- Arming works **E1→E6** through five real ceremonies: T1 (Stamp Mill) and T2 (Dynamo crank) are bespoke TownScene doors; T3/T4/T5 are framework ceremonies (`CEREMONY_SCRIPTS` = t3-the-refinery, t4-the-boat, t5-the-deep-reactor) whose completion arms the successor via `CeremonySystem` → `activateEpoch()`. E5's successor is `epoch-6-atomic`, so T5 arms E6 correctly.
- Then it stops. No T6–T10 ceremony scripts exist; the E6 schoolhouse's megaproject door takes the calculating-house purchase and does nothing else. The arming seam refuses independently: E6/E7/E8/E9 manifests all carry **`successor: null`** (re-verified this session over assets/contracts/*/manifest.json), and `activateEpoch()` (ContractFamilies.ts:946–959) refuses a mismatched/null successor. The one special case, E7→E8 (line 948, gated on `e7SignalExitBeatReady()`), is never called by any town UI.
- **Correction of this ledger's earlier draft (honesty over tidiness):** the "live proof at E6" this file previously promised is **VOID**. The e6-02 probe ran on a profile still in epoch 1 (see R3), where `activateEpoch('epoch-7-signal')` returns false for the *wrong* reason (epoch-1's successor is epoch-2) and the schoolhouse legitimately shows no doors (mill incomplete). F-REH-01 stands entirely on the static evidence above, which is sufficient: `successor: null` is in the shipped manifests and nothing in src writes a T6+ arm. A clean live proof needs a profile legitimately at E6 — that is the re-run's job (F-REH-04).
- Consequence: the honest single-profile traversal is possible E1→E6 only (and this run's rig fell earlier still, at T1 — R3). E7→E10 were rehearsed as isolated era-boots. Draft: `tasks/DRAFT-t6-t10-ceremonies.md`.

## NEW SAGA-LEVEL FINDINGS (game-side)
**F-REH-02 (P0): E7 does not exist as a playable era in a plain boot — no claimable contract, boss debug-gated.** ✓ VERIFIED:
- All four epoch-7 contracts (`e7-relay-valley`, `e7-echo-canyon`, `e7-dead-band`, `e7-relay-rush`) ship `harvestAnchors: []`. The contract resolver treats zero anchors as unavailable (ContractFamilies.ts:1125–1133) and falls back to The Claim with the in-fiction line "*<name> is not ready for a direct claim; The Claim opened instead.*" This fired live in the rehearsal: the e7 segment pinned `contract=e7-relay-valley` and the game booted `the-claim` (run-all.log). Ten minutes of E7 footage are actually The Claim.
- THE ECHO exists only behind the `&e7boss` debug flag **on The Claim**: e2e/e7-boss.spec.ts:8 boots `'/?debug&e7boss&epoch=epoch-7-signal&contract=the-claim…'` — its own comment says "production system on the stable Claim without broadening its live contract." `echoBoss` diagnostics were null for the entire rehearsal segment. This is the Debug-Gate Leftover class (Mistake #10): the player sees none of E7 in a plain boot, even if F-REH-01's arming is fixed.
- Draft: `tasks/DRAFT-e7-e10-claimable-eras.md` slice 1.

**F-REH-03 (P0): E10's Last Claim is equally unlandable — every epoch-10 contract has zero anchors; the finale is reachable only through debug flags.** ✓ VERIFIED: `e10-ember-shore`, `e10-archive-world`, `e10-last-claim`, `e10-river` all carry `harvestAnchors: []`; the rehearsal's `contract=e10-last-claim` pin fell back to The Claim the same way. The Static/finale systems ran only because the boot carried `&e10static`. **What DOES work, live:** once triggered, the handing-on chain fired in a real boot — re-ink offered → the river lever clicked → "**The River**" charter briefing → post-credits boot of The Claim at dawn **with the river vista present** (`terrain.vista.river.present: true`, drawCalls 1 — the 064 vista law honored). The post-credits hook is real; the road to it is not. Draft: `tasks/DRAFT-e7-e10-claimable-eras.md` slice 2. (E8/E9 note: their flagships ARE claimable — e8-mare-claim 6 anchors, e8-eclipse 6, e9-dome-basin 4 — but their siblings `e8-far-side`, `e8-low-orbit`, `e9-seed-run`, `e9-devils-alley`, `e9-old-canal` are all anchorless; acceptable if those are board-launch-only by design, worth one owner sentence.)

**F-REH-04 (P1, pipeline + evidence-gap): the saga's E1–E6 spine remains e2e-asserted, not rehearsal-proven.** Because of R1–R3, this run produced NO live proof that T1–T5 ceremonies chain on one profile, that the arsenal inherits era to era, that the town wardrobe changes per era, or that board chapters unlock per the frontier. The commissioned question — "can ten shipped slices be lived as one game?" — is answered NO for today (F-REH-01/02/03), but the E1→E6 half remains OPEN pending a rig-repaired re-run. Draft: `tasks/DRAFT-rehearsal-rig-repair-and-rerun.md`.

**F-REH-05 (P2, ? INFERRED — needs one piloted probe): E5 Deepwater ran 40 sim-minutes at HUD wave 0 with zero engagement.** Footage (e5 video 2:00→9:50): hero + agent idle at the claim stake, level 1, 0/12 XP, wave counter 0 the whole run, while `dredgeQueenBoss` cycled act 1 at its far anchor (949 claw cycles, 474 repositions, 0 interrupts, `act2Locked: true`). An unpiloted hero can't disprove tuning here (act 2 correctly waits on the interrupt verb), but a contract that shows wave 0 and grants zero XP for 40 minutes deserves one piloted look — either waves aren't starting on `e5-deepwater-claim`, or the deepwater wave surface (`corsairWaves`) isn't reflected in the HUD. Folded into the re-run draft's checklist, not its own task.
- Related observation, not filed: E4's `orbitDistance: 883` (≈10× map radius) was read AFTER the run had ended (footage shows overrun at 01:55) — post-death drift, no player-facing claim possible. Re-run will re-read it live.

---

## THE ERA LEDGER
Per era: what was played · gates · F-IDs · timing (wall-clock; sim ran at timescale 4 where cited).

### E1 — THE FOUNDING + THE BARON (partial PASS)
- **Played:** profile "Rehearsal" / town **Kettle Creek** founded through the real menus (prior leg, committed: e1-00..e1-04 shots + e1-01 video, 7:20). First claim run started honestly (its replay crashed browser-side — run.log — leaving first-run securing UNVERIFIED; meta showed science 4 at the next boot, so some runs banked ? INFERRED). The Baron's contract (`e1-baron`, timescale 4, setWave(19) cited): the Baron ARRIVED with his rocket cart (diagnostics: `baron_rocket:33`, cart carried, 1 volley) — and killed the unpiloted hero at wave 20 in the first sim-minute. Footage: run-ledger "THE CLAIM WENT QUIET — TIME HELD 00:44, waves survived 20, 5599 spark damage" from 0:15 on (shot `e1-09-baron-wave-run-overrun.png`), with the announcement "*The Baron sends his regards. The claim won't hold.*"
- **Gates:** founding ✓ · first-claim ? · **Baron fight NOT passed in play** (rig R1/R2; the baron medal for T1 was subsequently seeded, cited in-script). Stamp Mill built to **1/3 stages only** (R3) — T1 door correctly absent; **T1 ceremony NEVER performed**.
- **Timing:** founding 7:20 (prior leg) · baron 10:05 · mill 2:30 · T1 attempt ~1:00 (crash).

### E2 — THE HILL MINE + THE ARMORED RAILCAR (**boss gate PASS, on film**)
- **Played:** `e2-hill-mine` (pressure economy live in diagnostics: coal seams, boilers), setWave(11) cited. The rig was blind (R1/R2) but the footage is unambiguous: **THE ARMORED RAILCAR — DEFEATED, wave 12** → **Claim Secured**, "+STEAMWORKS GRADUATION" and Territory/Science/Hero/Agent stamps on the Claim Office card at 0:58 (shot `e2-02b-railcar-DEFEATED-claim-secured.png`; assay-clerk pages "Steam Wrecker", "Rail Tough" ledgered on film at 0:20–0:50). Meta confirms: science 6→9 across this segment. Afterward the segment funded ANOTHER stamp-mill stage (2/3 now) through the real fund path under escort — visible at ~10:50–11:20.
- **Gates:** railcar acts ✓ (defeated in-fiction at wave 12) · claim secured ✓ · pressure systems present ✓ · **T2 NOT performed** (the town was still epoch-1 per R3 — the dynamo door legitimately absent; segment crashed).
- **F-IDs:** none game-side. Timing: 11:26 + T2 attempt ~0:45 (crash).

### E3 — THE CANYON WORKS + THE DYNAMO CRAWLER (boss arc advanced; run never concluded)
- **Played:** `e3-canyon-works` at night, setWave(13). Unpiloted (R1) — yet the crawler's arc ADVANCED on its own: end diagnostics `act: 3, tracksPinned: true, wreckRemains: true` — the wreck/gift-back state reached. The run itself never ended: footage shows the hero alive at full 175/175 HP in the spotlight through **wave 94** at 9:50 (shot `e3-02b-wave94-endless-night.png`), wrecking-crew "CONNECT 0/2 W6" banner cycling; meta unchanged (science 9→9) — **claim never secured in 40 sim-minutes**.
- **Gates:** crawler acts ✓ (act 3 + wreck by diagnostics) · claim secured ✗ (unpiloted — securing on this contract evidently needs the player's hand; not filed as tuning without a piloted run) · **T3 NOT performed** (epoch-1 town, R3).
- Timing: 10:04 + T3 attempt ~0:40 (crash).

### E4 — THE DUST FLATS + THE LAND-YACHT (hero died; leg void)
- **Played:** `e4-dust-flats`, sentry beacon placed through the real build seam ✓, setWave(13). The unpiloted hero was overrun at 01:55 held / wave 16 (footage 0:60: run-ledger, 146 jumpers). Yacht diagnostics read post-death (act 1, stolenHeads 4, orbitDistance 883 — see F-REH-05 note).
- **Gates:** yacht acts ✗ (not disproven — undriven) · **T4 NOT performed** (epoch-1 town). Timing: 10:07 + ~0:40 (crash).

### E5 — THE DEEPWATER CLAIM + THE DREDGE-QUEEN (anchored, untaxed)
- **Played:** `e5-deepwater-claim` — the queen ANCHORED (act 1 real, anchor −36,−24, 2 live paddles, 6 escort skiffs) and cycled claws for the whole run; `act2Locked: true` with 0 interrupts — act 2 correctly waits for a player verb the rig never performed. HUD wave 0 / level 1 / zero XP for 40 sim-minutes → **F-REH-05 (P2)**.
- **Gates:** queen acts partially observed (act 1 ✓, acts 2–3 ✗ undriven) · **T5 NOT performed** (epoch-1 town). Timing: 10:07 + ~0:40 (crash).

### E6 — THE GLOW MESA + THE HOMEMAKER-9000 (**boss gate PASS, on film**) + THE WALL
- **Played:** `e6-glow-mesa` — wrangle system live (feral_toaster winding down in diagnostics). Footage: **"The Homemaker-9000 — DEFEATED, wave 8"** → **Claim Secured** with "**THE CHORE IS DONE**" and stamps at 0:30 (shot `e6-03b-homemaker-DEFEATED-claim-secured.png`); end diagnostics agree (`act: 3, active: false`, 6 palisade unbuilds in order, 2 tidied markers, 0 player damage — the patience-boss arc exactly as the storybook wants it: it finishes the chore and powers down; the DONE pictogram and the chair on film).
- **THE WALL (e6-02):** VOID as a live F-REH-01 proof (see the correction under F-REH-01 — the probe ran on an epoch-1 town; its `activateEpoch` false and doorless schoolhouse have epoch-1 explanations). Incidental ✓: the research ledger correctly banks post-threshold science ("+12 toward the Steamworks" on film at 0:03). The cited unblock (localStorage epoch pin, exactly what `&era=N` does) then moved the profile to epoch-7 so E7–E10 could be rehearsed at all; shot e6-07 shows the epoch-7 town square post-unblock — the one wardrobe change this run demonstrates, via seam.
- **Gates:** homemaker ✓ · claim secured ✓ · T6 — DOES NOT EXIST (F-REH-01). Timing: 10:08 + 0:04.

### E7 — THE RELAY VALLEY + THE ECHO (NOT REHEARSED — F-REH-02)
- **Played:** nothing of E7. The `e7-relay-valley` pin fell back to The Claim (zero anchors — F-REH-02); `echoBoss` null throughout; ten minutes of The Claim on film. The e7Signal overlay itself booted (`enabled: true`, beacon node registered after a build) — the systems exist; the era doesn't, player-side.
- **Gates:** ALL ✗/unreachable. Timing: 10:06.

### E8 — THE MARE CLAIM + THE SALVAGE KING'S CLAW (arrived; hero died)
- **Played:** `e8-mare-claim` — the ONE interstitial-belt contract that boots directly (6 anchors). Vacuum physics profile verified live (`feelG: 0.6`, lob multipliers 2.4, vacuum true, fixed timestep). The claw's descent BEGAN (end diagnostics: act 2, crown descending, 3 corsairs rappelled) but the unpiloted hero was overrun at 00:53/wave 8 (footage 0:60), so most of the descent played to an empty field.
- **Gates:** physics ✓ · claw acts partial (act 2 by diagnostics) ✗ unconcluded · era reachable only via seam (F-REH-01). Timing: 10:06.

### E9 — THE DOME BASIN + THE OLD DIGGER (**FULL ARC PASS — the model era of this run**)
- **Played, all through real interact seams (teleport = parking only, cited):** recorded OUR canal tape (`basin-canals`, hash fnv1a32:6de38a4b) with real WASD strokes → the Digger started surveying (act 1, 6 legs, unmake sweeps live) → **boarded the live machine** → reached the tape deck → **THE SWAP**: `swapPhase: done, joinedFleet: true, gentle: true`, and the swapped tape IS our recording (hash matches); the old tape archived. HUD on film: "*IT JOINS THE FLEET. The old tape goes to the archive. It re-digs to the reeve's charts now, gently, forever.*" No kill path — `killAttemptsAbsorbed` present by design. **Reload probe ✓:** digger still act 3/gentle after reload (shot e9-05).
- **What 12 seconds prove vs assert:** the whole no-kill arc, its persistence, and its fiction fire in a real boot — proven. Pacing, the fight-adjacent pressure while boarding, and whether a player FINDS the boarding verb — asserted only.
- **Gates:** all E9 boss beats ✓ · era reachable only via seam (F-REH-01). Timing: 0:12.

### E10 — THE LAST CLAIM: THE STATIC + THE RIVER (finale hook PASS; Static NOT exercised)
- **Played:** boot fell back to The Claim (F-REH-03) with `&e10static`. The Static never engaged (act 0; all three preserve interacts false — rig R4, the spec's manualSim/arrivalZ setup was skipped). THE STATIC/preserve-until-recession therefore remains **e2e-asserted, not rehearsal-proven**. The handing-on then played live: `e10Finale.close()` (cited seam standing in for the missing in-town trigger — itself part of F-REH-03) → re-ink offered → **the river lever** → "**The River**" charter briefing → post-credits The Claim at dawn, river vista present and running. Shots e10-01..07.
- **Gates:** Static ✗ (unexercised) · re-ink/offer/lever/post-credits-hook ✓ live. Timing: 0:07.

---

## THE VIDEO LEDGER (all files LOCAL in `rehearsal-video/`, never committed; durations from ffprobe)
| file | length | what happens in it |
|---|---|---|
| e1-01-the-founding-menus.webm | 7:20 | The founding: menus, profile "Rehearsal", Kettle Creek, first town morning, the book, first-claim briefing |
| e1-02-the-baron.webm | 10:06 | Baron contract; wave-19 skip; the Baron's wave kills the unpiloted hero at 0:44 held (from ~0:12); run-ledger + "the Baron sends his regards" for the remainder |
| e1-03a-stamp-mill-stages.webm | 2:31 | Stamp Mill funded to stage 1/3 under fire (rig gave up early — R3) |
| e2-01-hill-mine-and-the-railcar.webm | 11:27 | Hill Mine; **Railcar DEFEATED wave 12 (~0:10–0:20), Claim Secured + STEAMWORKS GRADUATION 0:58**; idle; mill stage 2/3 funded ~10:50 |
| e3-01-canyon-works-and-the-crawler.webm | 10:05 | Night canyon; crawler acts to 3 + wreck (diagnostics); endless run to wave 94 (9:50) |
| e4-01-dust-flats-and-the-land-yacht.webm | 10:07 | Dust flats; beacon built; overrun at 01:55/wave 16 (~0:35 on film); post-death drift |
| e5-01-deepwater-and-the-dredge-queen.webm | 10:07 | The anchored Dredge-Queen cycling claws all run; hero idle at stake; HUD wave 0 (F-REH-05) |
| e6-01-glow-mesa-and-the-homemaker.webm | 10:08 | **Homemaker-9000 DEFEATED wave 8, THE CHORE IS DONE + Claim Secured (~0:25–0:35)**; palisade unbuilds; the chair |
| e6-02-the-wall-at-t6.webm | 0:05 | Epoch-1 schoolhouse probe (wall-proof VOID — see F-REH-01 correction); science-overflow banner; epoch pin unblock |
| e7-01-relay-valley-and-the-echo.webm | 10:06 | F-REH-02 on film: The Claim booted instead of Relay Valley; no Echo |
| e8-01-mare-claim-and-the-claw.webm | 10:06 | Mare Claim vacuum boot; claw descent begins; overrun 00:53/wave 8 (~0:25) |
| e9-01-dome-basin-and-the-old-digger.webm | 0:12 | **The whole Old Digger arc: record → board → tape deck → THE SWAP → IT JOINS THE FLEET** |
| e10-01-the-last-claim-the-static.webm | 0:08 | Static unengaged (R4); re-ink → river lever → The River charter → post-credits dawn river |

---

## THE VERDICT
**Can a player live the whole saga today? NO — and now we know exactly where the road ends.** A player can found Kettle Creek, play E1's claims and reach the Baron; the Railcar and the Homemaker demonstrably fall in real boots; E9's no-kill masterpiece and E10's handing-on both work end-to-end when reached. But the connective tissue is missing in three independent places, each singly fatal:
1. **No door out of E6** (F-REH-01, P0) — T6–T10 ceremonies don't exist; manifests refuse succession.
2. **E7 is hollow** (F-REH-02, P0) — no claimable contract, the Echo debug-gated on The Claim.
3. **E10's finale is unlandable** (F-REH-03, P0) — every deepsky contract anchorless; the Static/finale live behind flags.
And one honesty debt of our own: **this rehearsal's rig failed its half of the bargain** (R1–R4), so the E1→E6 spine — T1–T5 chaining on one profile, arsenal inheritance, per-era wardrobe, board chapters — is still only e2e-asserted (F-REH-04, P1). Fix the three P0s, repair the rig, and re-run: THAT run is the release gate. What this run DID establish beyond doubt: ten eras of content boot and run for ~85 recorded minutes with **zero console and zero page errors**, the one profile survived every reload, and every boss that could act autonomously acted in-fiction (nothing soft-locked, nothing gory, nothing off-canon observed anywhere in 48 screenshots).

## THE TEN MOMENTS (highlight-reel cut list — file @ timestamp)
1. **The founding of Kettle Creek** — e1-01-the-founding-menus.webm @ ~0:20 (profile named, the town named, the first morning).
2. **The claim goes quiet** — e1-02-the-baron.webm @ 0:12–0:20 (the Baron's wave falls on the still hero; the ledger card rises: "TIME HELD 00:44").
3. **The Railcar falls** — e2-01-hill-mine-and-the-railcar.webm @ 0:10–0:20 (wheels to boiler on the north track).
4. **STEAMWORKS GRADUATION** — e2-01-hill-mine-and-the-railcar.webm @ 0:55–1:05 (Claim Secured; the four stamps land).
5. **The mill rises under escort** — e2-01-hill-mine-and-the-railcar.webm @ 10:50–11:20 (stage 2 funded, props going up mid-defense).
6. **Wave 94, canyon night** — e3-01-canyon-works-and-the-crawler.webm @ 9:45–9:55 (the spotlight, the pinned tracks, the endless valley).
7. **The Queen at anchor** — e5-01-deepwater-and-the-dredge-queen.webm @ 5:00 (claws cycling on dark water, the tax uncollected).
8. **THE CHORE IS DONE** — e6-01-glow-mesa-and-the-homemaker.webm @ 0:25–0:35 (the palisades unbuilt in order; the chair; the power-down).
9. **IT JOINS THE FLEET** — e9-01-dome-basin-and-the-old-digger.webm @ 0:06–0:11 (boarding the live machine, the tape deck, THE SWAP).
10. **The river lever, then dawn** — e10-01-the-last-claim-the-static.webm @ 0:04–0:08 (The River charter; the post-credits claim with the river running).

## CORRECTIVE DRAFTS (tasks/, UNQUEUED)
- `tasks/DRAFT-t6-t10-ceremonies.md` — **P0** (F-REH-01): the five missing inter-era ceremonies + successor wiring. (Amended this session: live-proof claim corrected to static-only.)
- `tasks/DRAFT-e7-e10-claimable-eras.md` — **P0** (F-REH-02/03): give E7 and E10 landable flagship contracts; move the Echo and the Static/finale off their debug flags into plain-boot reachability.
- `tasks/DRAFT-rehearsal-rig-repair-and-rerun.md` — **P1** (F-REH-04, pipeline): fix R1–R4, add per-boss act verbs, re-run the traversal; includes the F-REH-05 piloted probe and the clean live wall-proof at a legitimate E6.

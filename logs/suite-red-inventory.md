# Suite Red Inventory

- Total tests run: **2796**
- Total passed: **2156**
- Total failed: **546**
- BOTH: **210**
- MOBILE-ONLY: **64**
- DESKTOP-ONLY: **43**
- Harness: configured workers **3**; actual workers **3**; fully parallel **false**; shard **null**; Playwright **1.61.1**
- Revision: **7e99efcd2ababf3c712217dc075e95a6fa07048f**; dirty **false**
- Run tree: **/Users/robin/Claude/Projects/Gold Rush/worktrees/lane-a/e2e**; status **present**; resolved masking-row test bodies **420/420**

_Bucket sizes count logical tests; totals count desktop/mobile project executions._
_The exact command also ran 8 configured non-target project cases; they are reported separately._
_Classification incomplete for 19 logical tests because the opposite project was skipped or missing; these are listed separately instead of being called passes._

Reduction check: **547** failing project results in raw JSON; **547** rows across the target and other-project failure tables.
Positive control: **PASSED** — one synthetic mobile failure produced one MOBILE-ONLY row with its injected error marker.

## Corrections since the snapshot

_ADDITIVE ONLY. The tables below record what the snapshot run **observed** on its date and are never rewritten — overwriting an observation that was true when taken launders history and hides the drift itself. A correction records a later, dated re-measurement of the same test. `scripts/red-inventory-lookup.mjs` prints every correction matching your query **before** the snapshot rows, because the harm this section exists to prevent happens at the moment a drainer reads the `Project`/`Bucket` columns and classifies a red as NEW._

_⚠️ Therefore the `Project` and `Bucket` columns are **advisory for flaky tests**: they are a single run's observation of a test that may be bimodal, and a bimodal test has no single true project. Where a correction row exists below, it outranks the snapshot._

| Spec file | Test title | Measured | Finding | Correction |
|---|---|---|---|---|
| e2e/e5-regatta-race.spec.ts | the Regatta runs its authored course and secures both bench seeds deterministically | 2026-09-20 | F-MAC2-1 | **RETIRED — THE TEST'S PREMISE IS GONE, NOT ITS PIN.** Snapshot row 1109's red was real and its cause was never a stale number: the ride it asserted could not be sailed by either species (F-RPG-18/19 — the Prospector is not a body anyone positions and every gate is open water no body can stand on). `tasks/e5-regatta-boat-02.md`, slice 2 of `specs/agent-play/e5-regatta-steerable-boat.md` (owner 2026-09-20: "A14 - do it"), replaced the premise: **the race counts the BOAT**. The test now boards the Claim-Boat and steers the five authored marks, and is re-titled *the Regatta is won by the BOAT and secures both bench seeds deterministically*. Hashes re-pinned FROM THE MERGED BEHAVIOUR with a named cause: `fnv1a32:02404a88` -> **`fnv1a32:1bf7c1ff`** (`e5-regatta-01`) and `fnv1a32:bf8b5db5` -> **`fnv1a32:e8b9b2ff`** (`e5-regatta-02`), both `secured: true, waves: 12, kills: 25`. Green on BOTH projects, `--workers=1`, own dev server on 5325: 12.6 s desktop / 12.8 s mobile. A drainer searching for row 1109's title will not find it on the tree — that is this correction, not a missing test. |
| e2e/e5-regatta-race.spec.ts | idle Regatta runs lose because the course remains unfinished | 2026-09-20 | F-MAC2-1 | **RETIRED — RE-PINNED WITH THE CAUSE ROW 1110 ASKED FOR.** The snapshot's stale numbers were the SPEC's, exactly as `reviews/e5-regatta-boat-01.md` F-RB1-3 proved (`:141` received `fnv1a32:d461683d`, which was `assets/contracts/null-floors.json`'s own pin for `e5-regatta-01`). `tasks/e5-regatta-boat-02.md` then moved the idle path ON PURPOSE and in one line: an idle run used to pass the START BEACON for free, because the boat's MOORING stands on that mark and the mooring was in the racer list; slice 2 races the hull only while a body is aboard, so a run that does nothing passes no gate at all. Re-pinned `fnv1a32:80b36bec` -> **`fnv1a32:8050c83f`** and `fnv1a32:3dfe7f19` -> **`fnv1a32:18093696`**, both still `secured: false, waves: 14, endReason: wave-ceiling`; the two Regatta null floors were re-recorded to those same numbers in the same commit and every other floor left byte-identical. Re-titled *idle Regatta runs lose because nobody ever boards the boat*. Green on both projects, 9.5 s / 9.4 s. |
| scripts/town-patrol-monument.test.mjs | town patrols stay outside the pan monument | 2026-09-14 | F-SSL-1 | **DOCUMENTED RED — NOT A REGRESSION, AND NOT AN E2E SPEC: this is the first NODE GUARD row in this file.** Landed and rooted in `package.json` `test:node-guards` (first `run-node-guards.mjs` stage) by `tasks/sprites-split-land.md`, stage 1 of owner ruling A19 ("A19 - that is ok", 2026-09-13), on its master's explicit instruction: *"root it and record it in logs/suite-red-inventory.md as a documented red with the finding, do NOT fix the town data here"*. It is RED ON MAIN BY DESIGN — the guard is correct and the TOWN DATA is wrong. Measured on main `3b3f427a3`, Node 26.4.0, twice: `node --test scripts/town-patrol-monument.test.mjs` rc=1 in 0.36 s, and through the battery runner `GR_GUARD_NO_ARTIFACT=1 node scripts/run-node-guards.mjs scripts/town-patrol-monument.test.mjs` rc=1 in 0.68 s — 0 pass / 1 fail both times, identical assertion: `AssertionError: newsie segment 5 enters the monument (0)` at `scripts/town-patrol-monument.test.mjs:20`. The branch that brought it measured the same failure on its own control tree (`reviews/drain-review-sprites-roster.md` §3 row: *monument = PRE-EXISTING main defect, control fails identically*), so three independent trees agree. **CONSEQUENCE A DRAINER MUST EXPECT: `npm run test:node-guards` now exits non-zero on a clean main until the newsie patrol loop is re-routed.** `scripts/run-node-guards.mjs` has no known-red allowlist (it propagates the child status, `:87`), so there is no way to root the guard and keep the board green — and hiding it in `scripts/gate-caller-baseline.json` instead would have made it an unread verdict, which is the exact failure F-1252-2 built the caller audit to stop. **CORRECTIVE OWED (not done here, out of this master's firewall, which forbids `src/**`): re-route the `newsie` patrol's segment 5 in `src/town/townsfolk.ts` clear of `townPropRing`'s pan-monument footprint in `src/town/townLayout.ts`, then this row retires.** |
| e2e/audio-integration.spec.ts | first-use bursts respect the per-sound pool cap | 2026-08-09 | F-1587-1 | BUCKET IS **BOTH**, NOT DESKTOP-ONLY — and mobile is the WORSE arm. Re-measured on main `8b5a5b24`, one test alone, `--repeat-each=7 --workers=1`, same shell same hour: **desktop-chrome 3/7 failed (42.9%, 32.0 s) · mobile-chrome 6/7 failed (85.7%, 42.4 s)**. s1587 independently measured mobile 4/7 on two trees (merged + pre-merge control), so mobile has now failed 10 of 14 across three independent measurements. A mobile pool-cap failure is NOT a new red. |
| e2e/town-t5-townsfolk.spec.ts | mobile bark card is readable above the stick zone and captures concept comparison | 2026-09-07 | F-CELL-2 | **CURED — GREEN ON BOTH PROJECTS, 2 passed in 10.3 s** (`spec-hygiene-batch`, base `0a34e34cb`, one worker, own dev server on 5307, `--trace=off`). The two 404s the snapshot recorded were **the harness's own, not a missing shipped asset**: both were `GET /favicon.ico` from the synthetic side-by-side document `renderConceptComparison` injects with `page.setContent`, which declared no icon, so Chrome asked for the implicit `/favicon.ico` that this game has never had (`index.html` declares `/favicon-32.png`, `/favicon-16.png`, `/favicon-48.png`; `public/` holds exactly those three). Undiagnosable until now because Chrome's console text carries no url — the url is in the ConsoleMessage's **location**, and a page-level `response` listener never sees these at all. Cured by declaring `<link rel="icon" href="data:,">` on that injected document. The snapshot's coordinates have also rotted: this test is now at **`:290`**, and its sibling red `approach barks identify sampled speakers…` at **`:252`** (was `:241` / `:104`) — this correction re-measures only the row it names, and says nothing about the sibling's redness. |
| scripts/town-patrol-monument.test.mjs | town patrols stay outside the pan monument | 2026-09-17 | F-SSL-1 | **CURED AND ROOTED — GREEN, 1 pass / 0 fail, twice (0.30 s as inherited, 1.71 s with the widened census), Node 26.4.0, worktree cut from main `09c997489`** (`tasks/town-cast-rulings-a13-a17.md`, owner rulings A13/A17). **THE CURE WAS NOT WRITTEN HERE — IT WAS ALREADY ON MAIN AND NOBODY HAD RE-MEASURED IT (Mistake #4, verify-don't-inherit):** `033f69c61` (2026-09-15, the attended retention commit for Astra's uncommitted source half) re-routed the newsie's tavern-trail loop to `[...reverseTrail('tavern').slice(0, -1), ...townTrail('tavern').points.slice(2, -1)]` at 16 s, dropping the two trail points that sat ON the plaza centre; its own comment says "Turn before the monument". Measured today, the newsie's closest approach is **1.159** world units against a 0.680 footprint (the Prospector's loop is the same 1.159; the youngsters' ring road 5.885). The row above stands as what was true on 2026-09-14 and is not rewritten (this section is ADDITIVE ONLY). **CONSEQUENCE FOR A DRAINER, REVERSED: `npm run test:node-guards` no longer carries this red, and the guard is now ROOTED** in its first `run-node-guards.mjs` stage (`package.json`, beside `scripts/town-era-props-node-safety.test.mjs`) with its `scripts/gate-caller-baseline.json` reason deleted, exactly as that reason instructed ("Rooted when the corrective in src/town/townsfolk.ts lands"). `node --test scripts/gate-caller-audit.test.mjs` 45/45 after the root. The census was WIDENED in the same commit: it now measures the PLACED actors through `townActorPlazaPlacement`, so the three plaza-cast loops that never carried a `loop` field in `townsfolk.ts` (tavernkeeper, storekeeper, and the Elder under A13) are measured too; the Elder's new route clears the monument by **7.023**. |

## Failing tests

| Spec file | Test title | Project | Failing file:line | First error line | Duration | Bucket |
|---|---|---|---|---|---:|---|
| e2e/045-megaproject.spec.ts | debug dev megaproject reserves, funds, delays, completes, and persists | desktop-chrome | e2e/045-megaproject.spec.ts:168 | Error: expect(received).toMatchObject(expected) | 22.5 s | BOTH |
| e2e/045-megaproject.spec.ts | debug dev megaproject reserves, funds, delays, completes, and persists | mobile-chrome | e2e/045-megaproject.spec.ts:131 | Error: expect(received).toBe(expected) // Object.is equality | 37.4 s | BOTH |
| e2e/050-audio-mix-and-access.spec.ts | pause overlay volume and mute persist and sync with Settings | mobile-chrome | e2e/050-audio-mix-and-access.spec.ts:49 | Test timeout of 30000ms exceeded. | 60.0 s | MOBILE-ONLY |
| e2e/055-baron-kill-stop.spec.ts | kill-stop leaves the sim hash identical to a nopause control | desktop-chrome | e2e/055-baron-kill-stop.spec.ts:175 | Test timeout of 30000ms exceeded. | 60.0 s | INCOMPLETE |
| e2e/057-baron-rocket-cart.spec.ts | Baron rocket volley targeting is deterministic for the same seed | desktop-chrome | e2e/057-baron-rocket-cart.spec.ts:444 | Test timeout of 30000ms exceeded. | 60.1 s | BOTH |
| e2e/057-baron-rocket-cart.spec.ts | Baron rocket volley targeting is deterministic for the same seed | mobile-chrome | e2e/057-baron-rocket-cart.spec.ts:444 | Test timeout of 30000ms exceeded. | 60.0 s | BOTH |
| e2e/057-baron-rocket-cart.spec.ts | defeating the Baron captures the cart, shows the medal line, and unlocks captured research | desktop-chrome | e2e/057-baron-rocket-cart.spec.ts:359 | Test timeout of 30000ms exceeded. | 60.1 s | BOTH |
| e2e/057-baron-rocket-cart.spec.ts | defeating the Baron captures the cart, shows the medal line, and unlocks captured research | mobile-chrome | e2e/057-baron-rocket-cart.spec.ts:359 | Test timeout of 30000ms exceeded. | 60.0 s | BOTH |
| e2e/058-device-tiers.spec.ts | desktop Chrome tier proofs › tier switch is render-only for a deterministic economy slice | desktop-chrome | e2e/058-device-tiers.spec.ts:209 | Error: expect(received).toEqual(expected) // deep equality | 28.5 s | INCOMPLETE |
| e2e/061-first-claim-onboarding.spec.ts | fresh profile gets first-claim guidance, launch sets the per-profile done flag, and second town entry is quiet | desktop-chrome | e2e/061-first-claim-onboarding.spec.ts:74 | Error: expect(locator).toHaveText(expected) failed | 68.2 s | BOTH |
| e2e/061-first-claim-onboarding.spec.ts | fresh profile gets first-claim guidance, launch sets the per-profile done flag, and second town entry is quiet | mobile-chrome | e2e/061-first-claim-onboarding.spec.ts:74 | Error: expect(locator).toHaveText(expected) failed | 57.9 s | BOTH |
| e2e/061-first-claim-onboarding.spec.ts | mobile first-entry trail and tavern pulse fit at 390px | desktop-chrome | e2e/061-first-claim-onboarding.spec.ts:74 | Error: expect(locator).toHaveText(expected) failed | 56.8 s | BOTH |
| e2e/061-first-claim-onboarding.spec.ts | mobile first-entry trail and tavern pulse fit at 390px | mobile-chrome | e2e/061-first-claim-onboarding.spec.ts:137 | Test timeout of 30000ms exceeded. | 60.1 s | BOTH |
| e2e/061-first-claim-onboarding.spec.ts | name-only exit keeps the first-claim guide pending until launch | desktop-chrome | e2e/061-first-claim-onboarding.spec.ts:74 | Error: expect(locator).toHaveText(expected) failed | 52.0 s | BOTH |
| e2e/061-first-claim-onboarding.spec.ts | name-only exit keeps the first-claim guide pending until launch | mobile-chrome | e2e/061-first-claim-onboarding.spec.ts:149 | Test timeout of 30000ms exceeded. | 60.1 s | BOTH |
| e2e/064-river-continues.spec.ts | river-zone, panning, and sluice sim contracts stay unchanged | desktop-chrome | e2e/064-river-continues.spec.ts:104 | Test timeout of 30000ms exceeded. | 60.0 s | BOTH |
| e2e/064-river-continues.spec.ts | river-zone, panning, and sluice sim contracts stay unchanged | mobile-chrome | e2e/064-river-continues.spec.ts:121 | Error: expect(received).toEqual(expected) // deep equality | 31.2 s | BOTH |
| e2e/065-shots-follow-terrain.spec.ts | flat Claim shots keep the old zero-height bolt plane | desktop-chrome | e2e/065-shots-follow-terrain.spec.ts:129 | Error: expect(received).toBeCloseTo(expected, precision) | 28.1 s | BOTH |
| e2e/065-shots-follow-terrain.spec.ts | flat Claim shots keep the old zero-height bolt plane | mobile-chrome | e2e/065-shots-follow-terrain.spec.ts:129 | Error: expect(received).toBeCloseTo(expected, precision) | 33.8 s | BOTH |
| e2e/066-walk8-engine.spec.ts | Claim Jumper walk8 keeps the old stride duration at higher frame count | desktop-chrome | e2e/066-walk8-engine.spec.ts:210 | Test timeout of 30000ms exceeded. | 60.0 s | BOTH |
| e2e/066-walk8-engine.spec.ts | Claim Jumper walk8 keeps the old stride duration at higher frame count | mobile-chrome | e2e/066-walk8-engine.spec.ts:210 | Test timeout of 30000ms exceeded. | 60.0 s | BOTH |
| e2e/066-walk8-engine.spec.ts | hero walks on the activated walk8 sheet at the ratified cadence | desktop-chrome | e2e/066-walk8-engine.spec.ts:196 | Test timeout of 30000ms exceeded. | 60.0 s | BOTH |
| e2e/066-walk8-engine.spec.ts | hero walks on the activated walk8 sheet at the ratified cadence | mobile-chrome | e2e/066-walk8-engine.spec.ts:196 | Test timeout of 30000ms exceeded. | 60.0 s | BOTH |
| e2e/072-era-activation.spec.ts | the completed Stamp Mill activates E2 once, stages the ceremony, and makes Hill Mine playable after reload | desktop-chrome | e2e/072-era-activation.spec.ts:185 | Error: expect(locator).toHaveAttribute(expected) failed | 74.3 s | BOTH |
| e2e/072-era-activation.spec.ts | the completed Stamp Mill activates E2 once, stages the ceremony, and makes Hill Mine playable after reload | mobile-chrome | e2e/072-era-activation.spec.ts:191 | Error: expect(locator).toHaveCSS(expected) failed | 108.3 s | BOTH |
| e2e/072-era-activation.spec.ts | the E2 ceremony can be skipped without undoing activation | mobile-chrome | e2e/072-era-activation.spec.ts:354 | Test timeout of 30000ms exceeded. | 60.0 s | MOBILE-ONLY |
| e2e/078-ux-hygiene.spec.ts | ledger Escape closes only the ledger and restores schoolhouse focus | mobile-chrome | e2e/078-ux-hygiene.spec.ts:130 | Test timeout of 30000ms exceeded. | 60.0 s | MOBILE-ONLY |
| e2e/agent-view.spec.ts | the seeded rider view stays cache-shaped and grows one honest wave at a time | desktop-chrome | e2e/agent-view.spec.ts:511 | Error: expect(received).toBe(expected) // Object.is equality | 15.8 s | BOTH |
| e2e/agent-view.spec.ts | the seeded rider view stays cache-shaped and grows one honest wave at a time | mobile-chrome | e2e/agent-view.spec.ts:511 | Error: expect(received).toBe(expected) // Object.is equality | 23.9 s | BOTH |
| e2e/ap-standing-orders.spec.ts | plain-boot production orders pan a seam and place a real building | mobile-chrome | e2e/ap-standing-orders.spec.ts:342 | Test timeout of 45000ms exceeded. | 90.0 s | MOBILE-ONLY |
| e2e/audio-integration.spec.ts | legacy audio preferences migrate into profile storage | desktop-chrome | e2e/audio-integration.spec.ts:141 | Error: expect(locator).toHaveValue(expected) failed | 40.6 s | BOTH |
| e2e/audio-integration.spec.ts | legacy audio preferences migrate into profile storage | mobile-chrome | e2e/audio-integration.spec.ts:141 | Error: expect(locator).toHaveValue(expected) failed | 45.0 s | BOTH |
| e2e/audio-integration.spec.ts | settings volume and mute persist across reload | desktop-chrome | e2e/audio-integration.spec.ts:80 | Test timeout of 30000ms exceeded. | 60.0 s | BOTH |
| e2e/audio-integration.spec.ts | settings volume and mute persist across reload | mobile-chrome | e2e/audio-integration.spec.ts:80 | Test timeout of 30000ms exceeded. | 60.1 s | BOTH |
| e2e/beauty-atmos-horizon.spec.ts | the apron paint does not leak to a map with no profile | desktop-chrome | e2e/beauty-atmos-horizon.spec.ts:56 | Error: expect(received).toBe(expected) // Object.is equality | 18.5 s | BOTH |
| e2e/beauty-atmos-horizon.spec.ts | the apron paint does not leak to a map with no profile | mobile-chrome | e2e/beauty-atmos-horizon.spec.ts:56 | Error: expect(received).toBe(expected) // Object.is equality | 28.0 s | BOTH |
| e2e/beauty-baron.spec.ts | shot 6 — the horizon behind the fort: what the panorama says about his operation | desktop-chrome | e2e/beauty-baron.spec.ts:329 | Test timeout of 120000ms exceeded. | 175.9 s | DESKTOP-ONLY |
| e2e/beauty-far-ground.spec.ts | the far ground › e1-dry-gulch: the panorama's foot is above the top edge of the frame, and the apron is painted | mobile-chrome | e2e/beauty-far-ground.spec.ts:139 | Error: expect(locator).toHaveAttribute(expected) failed | 30.8 s | MOBILE-ONLY |
| e2e/beauty-far-ground.spec.ts | the far ground › the apron costs zero draw calls, and ?horizonApron=off is a real A/B | mobile-chrome | e2e/beauty-far-ground.spec.ts:139 | Error: expect(locator).toHaveAttribute(expected) failed | 84.7 s | MOBILE-ONLY |
| e2e/beauty-far-ground.spec.ts | the far ground › the far band actually changes, at the pose where the apron is on camera | desktop-chrome | e2e/beauty-far-ground.spec.ts:88 | Test timeout of 180000ms exceeded. | 238.3 s | DESKTOP-ONLY |
| e2e/beauty-night-shift.spec.ts | night shift beauty board | mobile-chrome | e2e/beauty-night-shift.spec.ts:175 | Test timeout of 900000ms exceeded. | 991.6 s | MOBILE-ONLY |
| e2e/beauty-twin-banks.spec.ts | the beauty pass pays its frame budget, measured against its own build | mobile-chrome | e2e/beauty-twin-banks.spec.ts:215 | Error: expect(received).toBeLessThan(expected) | 53.0 s | MOBILE-ONLY |
| e2e/blast-relief-height.spec.ts | zero-height samples preserve flat impact offset and sim payload determinism | desktop-chrome | e2e/blast-relief-height.spec.ts:115 | Error: expect(received).toBeLessThan(expected) | 17.2 s | BOTH |
| e2e/blast-relief-height.spec.ts | zero-height samples preserve flat impact offset and sim payload determinism | mobile-chrome | e2e/blast-relief-height.spec.ts:115 | Error: expect(received).toBeLessThan(expected) | 20.3 s | BOTH |
| e2e/board-card-images.spec.ts | all contract chapters use their own board-card URL | desktop-chrome | e2e/board-card-images.spec.ts:8 | Test timeout of 30000ms exceeded. | 60.0 s | BOTH |
| e2e/board-card-images.spec.ts | all contract chapters use their own board-card URL | mobile-chrome | e2e/board-card-images.spec.ts:8 | Test timeout of 30000ms exceeded. | 60.0 s | BOTH |
| e2e/board-era-chapters.spec.ts | a fresh profile opens only the Frontier chapter and keeps Ride Together and the Claim Ledger | mobile-chrome | e2e/board-era-chapters.spec.ts:100 | Test timeout of 30000ms exceeded. | 60.0 s | MOBILE-ONLY |
| e2e/board-era-chapters.spec.ts | debug opens every chapter without removing any contract launch surface | mobile-chrome | e2e/board-era-chapters.spec.ts:148 | Test timeout of 30000ms exceeded. | 60.0 s | MOBILE-ONLY |
| e2e/board-era-chapters.spec.ts | the era door exposes chapters through the reached frontier and nothing beyond it | mobile-chrome | e2e/board-era-chapters.spec.ts:127 | Test timeout of 30000ms exceeded. | 60.0 s | MOBILE-ONLY |
| e2e/bt-00-demolish.spec.ts | building context bar keeps both actions inside a mid-size phone viewport | desktop-chrome | e2e/bt-00-demolish.spec.ts:195 | Error: expect(received).toBeGreaterThanOrEqual(expected) | 25.7 s | BOTH |
| e2e/bt-00-demolish.spec.ts | building context bar keeps both actions inside a mid-size phone viewport | mobile-chrome | e2e/bt-00-demolish.spec.ts:195 | Error: expect(received).toBeGreaterThanOrEqual(expected) | 25.8 s | BOTH |
| e2e/bt-00-demolish.spec.ts | demolish scales refund by remaining HP after building damage | desktop-chrome | e2e/bt-00-demolish.spec.ts:277 | Error: expect(received).toBe(expected) // Object.is equality | 50.1 s | BOTH |
| e2e/bt-00-demolish.spec.ts | demolish scales refund by remaining HP after building damage | mobile-chrome | e2e/bt-00-demolish.spec.ts:277 | Error: expect(received).toBe(expected) // Object.is equality | 52.7 s | BOTH |
| e2e/bt-00-demolish.spec.ts | tiered half-HP sluice refund scales from base cost only | mobile-chrome | e2e/bt-00-demolish.spec.ts:261 | Error: expect(received).toMatchObject(expected) | 34.0 s | MOBILE-ONLY |
| e2e/bt-01-tiers.spec.ts | Enter tears down after clicking upgrade instead of re-clicking the focused upgrade button | desktop-chrome | e2e/bt-01-tiers.spec.ts:216 | Error: expect(received).toBeNull() | 40.2 s | BOTH |
| e2e/bt-01-tiers.spec.ts | Enter tears down after clicking upgrade instead of re-clicking the focused upgrade button | mobile-chrome | e2e/bt-01-tiers.spec.ts:216 | Error: expect(received).toBeNull() | 43.1 s | BOTH |
| e2e/bt-01-tiers.spec.ts | insufficient gold leaves tier and gold unchanged | desktop-chrome | e2e/bt-01-tiers.spec.ts:443 | Error: expect(received).toBeNull() | 42.4 s | BOTH |
| e2e/bt-01-tiers.spec.ts | insufficient gold leaves tier and gold unchanged | mobile-chrome | e2e/bt-01-tiers.spec.ts:443 | Error: expect(received).toBeNull() | 44.6 s | BOTH |
| e2e/bt-01-tiers.spec.ts | sluice tier raises pan-out yield and out-earns two tier-1 rates | desktop-chrome | e2e/bt-01-tiers.spec.ts:279 | Error: expect(received).toEqual(expected) // deep equality | 41.6 s | DESKTOP-ONLY |
| e2e/bt-01-tiers.spec.ts | stockpile upgrade names the yard and shows its tier capacity in the build menu | desktop-chrome | e2e/bt-01-tiers.spec.ts:367 | Test timeout of 30000ms exceeded. | 43.1 s | BOTH |
| e2e/bt-01-tiers.spec.ts | stockpile upgrade names the yard and shows its tier capacity in the build menu | mobile-chrome | e2e/bt-01-tiers.spec.ts:367 | Test timeout of 30000ms exceeded. | 49.2 s | BOTH |
| e2e/ceremony-framework.spec.ts | T10 THE CHARTER PRESS: the E10 science ceiling opens the existing River finale and idle opens nothing | mobile-chrome | e2e/ceremony-framework.spec.ts:822 | Error: expect(locator).toHaveCount(expected) failed | 53.0 s | MOBILE-ONLY |
| e2e/ceremony-framework.spec.ts | T7 THE STARSHIP: the umbilical hand alone arms E8 exactly once and the kept era survives reload | mobile-chrome | e2e/ceremony-framework.spec.ts:561 | Error: expect(received).toBe(expected) // Object.is equality | 94.2 s | MOBILE-ONLY |
| e2e/combat-readability.spec.ts | palisade bars stay in the wall frame for rotationSteps 0 and 1 | desktop-chrome | e2e/combat-readability.spec.ts:219 | Test timeout of 30000ms exceeded. | 52.3 s | DESKTOP-ONLY |
| e2e/contract-briefings.spec.ts | board cards show the same briefing data | mobile-chrome | e2e/contract-briefings.spec.ts:369 | Test timeout of 30000ms exceeded. | 60.0 s | MOBILE-ONLY |
| e2e/contract-briefings.spec.ts | briefing card and pause contract fit at 390px | desktop-chrome | e2e/contract-briefings.spec.ts:280 | Error: expect(received).not.toBeNull() | 22.8 s | BOTH |
| e2e/contract-briefings.spec.ts | briefing card and pause contract fit at 390px | mobile-chrome | e2e/contract-briefings.spec.ts:280 | Error: expect(received).not.toBeNull() | 27.4 s | BOTH |
| e2e/contract-briefings.spec.ts | every current contract launch shows manifest briefing goals and rules | desktop-chrome | e2e/contract-briefings.spec.ts:318 | Test timeout of 30000ms exceeded. | 48.1 s | BOTH |
| e2e/contract-briefings.spec.ts | every current contract launch shows manifest briefing goals and rules | mobile-chrome | e2e/contract-briefings.spec.ts:318 | Test timeout of 30000ms exceeded. | 54.9 s | BOTH |
| e2e/cosmetic-grants.spec.ts | a filed complaint grants, equips, and persists the Reporter's Set | desktop-chrome | e2e/cosmetic-grants.spec.ts:91 | Error: expect(locator).toHaveText(expected) failed | 41.0 s | BOTH |
| e2e/cosmetic-grants.spec.ts | a filed complaint grants, equips, and persists the Reporter's Set | mobile-chrome | e2e/cosmetic-grants.spec.ts:91 | Error: expect(locator).toHaveText(expected) failed | 43.4 s | BOTH |
| e2e/cp03-press-loop.spec.ts | the Press loop: edit, stamp, shelve, launch a real run, and return | desktop-chrome | e2e/cp03-press-loop.spec.ts:64 | Error: expect(locator).toHaveText(expected) failed | 78.3 s | BOTH |
| e2e/cp03-press-loop.spec.ts | the Press loop: edit, stamp, shelve, launch a real run, and return | mobile-chrome | e2e/cp03-press-loop.spec.ts:64 | Error: expect(locator).toHaveText(expected) failed | 85.4 s | BOTH |
| e2e/cp04-lever.spec.ts | seeded boot e1-baron/big-build/classic starts clean | desktop-chrome | e2e/cp04-lever.spec.ts:176 | Error: expect(locator).toHaveText(expected) failed | 24.4 s | BOTH |
| e2e/cp04-lever.spec.ts | seeded boot e1-baron/big-build/classic starts clean | mobile-chrome | e2e/cp04-lever.spec.ts:176 | Error: expect(locator).toHaveText(expected) failed | 30.6 s | BOTH |
| e2e/cp04-lever.spec.ts | seeded boot e1-dry-gulch/big-build/busy starts clean | desktop-chrome | e2e/cp04-lever.spec.ts:176 | Error: expect(locator).toHaveText(expected) failed | 22.3 s | BOTH |
| e2e/cp04-lever.spec.ts | seeded boot e1-dry-gulch/big-build/busy starts clean | mobile-chrome | e2e/cp04-lever.spec.ts:176 | Error: expect(locator).toHaveText(expected) failed | 30.5 s | BOTH |
| e2e/cp04-lever.spec.ts | seeded boot e1-dry-gulch/defend/classic starts clean | desktop-chrome | e2e/cp04-lever.spec.ts:176 | Error: expect(locator).toHaveText(expected) failed | 24.1 s | BOTH |
| e2e/cp04-lever.spec.ts | seeded boot e1-dry-gulch/defend/classic starts clean | mobile-chrome | e2e/cp04-lever.spec.ts:176 | Error: expect(locator).toHaveText(expected) failed | 25.5 s | BOTH |
| e2e/cp04-lever.spec.ts | seeded boot e1-night-shift/big-build/gentle starts clean | desktop-chrome | e2e/cp04-lever.spec.ts:176 | Error: expect(locator).toHaveText(expected) failed | 22.5 s | BOTH |
| e2e/cp04-lever.spec.ts | seeded boot e1-night-shift/big-build/gentle starts clean | mobile-chrome | e2e/cp04-lever.spec.ts:176 | Error: expect(locator).toHaveText(expected) failed | 24.2 s | BOTH |
| e2e/cp04-lever.spec.ts | seeded boot e1-night-shift/explore-quiet/busy starts clean | desktop-chrome | e2e/cp04-lever.spec.ts:176 | Error: expect(locator).toHaveText(expected) failed | 22.9 s | BOTH |
| e2e/cp04-lever.spec.ts | seeded boot e1-night-shift/explore-quiet/busy starts clean | mobile-chrome | e2e/cp04-lever.spec.ts:176 | Error: expect(locator).toHaveText(expected) failed | 29.3 s | BOTH |
| e2e/cp04-lever.spec.ts | seeded boot e1-twin-banks/defend/busy starts clean | desktop-chrome | e2e/cp04-lever.spec.ts:176 | Error: expect(locator).toHaveText(expected) failed | 26.0 s | BOTH |
| e2e/cp04-lever.spec.ts | seeded boot e1-twin-banks/defend/busy starts clean | mobile-chrome | e2e/cp04-lever.spec.ts:176 | Error: expect(locator).toHaveText(expected) failed | 23.9 s | BOTH |
| e2e/cp04-lever.spec.ts | seeded boot e1-twin-banks/explore-quiet/gentle starts clean | desktop-chrome | e2e/cp04-lever.spec.ts:176 | Error: expect(locator).toHaveText(expected) failed | 26.3 s | BOTH |
| e2e/cp04-lever.spec.ts | seeded boot e1-twin-banks/explore-quiet/gentle starts clean | mobile-chrome | e2e/cp04-lever.spec.ts:176 | Error: expect(locator).toHaveText(expected) failed | 32.2 s | BOTH |
| e2e/cp04-lever.spec.ts | the Lever is three choices and one press, then launches through the charter seam | desktop-chrome | e2e/cp04-lever.spec.ts:106 | Error: expect(locator).toHaveText(expected) failed | 79.2 s | BOTH |
| e2e/cp04-lever.spec.ts | the Lever is three choices and one press, then launches through the charter seam | mobile-chrome | e2e/cp04-lever.spec.ts:106 | Error: expect(locator).toHaveText(expected) failed | 75.1 s | BOTH |
| e2e/cp05-river.spec.ts | THE RIVER imports, round-trips, re-stamps, and leaves The Claim untouched | desktop-chrome | e2e/cp05-river.spec.ts:57 | Error: expect(received).toBe(expected) // Object.is equality | 10 ms | BOTH |
| e2e/cp05-river.spec.ts | THE RIVER imports, round-trips, re-stamps, and leaves The Claim untouched | mobile-chrome | e2e/cp05-river.spec.ts:57 | Error: expect(received).toBe(expected) // Object.is equality | 10 ms | BOTH |
| e2e/cw-02-escort.spec.ts | board-selected Canyon escort delivers one capacitor crate through a repaired brown-out | desktop-chrome | e2e/cw-02-escort.spec.ts:128 | Error: expect(received).toBe(expected) // Object.is equality | 70.9 s | BOTH |
| e2e/cw-02-escort.spec.ts | board-selected Canyon escort delivers one capacitor crate through a repaired brown-out | mobile-chrome | e2e/cw-02-escort.spec.ts:61 | Test timeout of 90000ms exceeded. | 154.9 s | BOTH |
| e2e/e1-baron.spec.ts | Baron manifest loads and taunts fire at waves 5, 12, and 18 | mobile-chrome | e2e/e1-baron.spec.ts:411 | Test timeout of 30000ms exceeded. | 60.0 s | MOBILE-ONLY |
| e2e/e1-baron.spec.ts | contract board requires science plus two secured claims and always shows an earned medal | desktop-chrome | e2e/e1-baron.spec.ts:343 | Test timeout of 60000ms exceeded. | 101.7 s | BOTH |
| e2e/e1-baron.spec.ts | contract board requires science plus two secured claims and always shows an earned medal | mobile-chrome | e2e/e1-baron.spec.ts:343 | Test timeout of 60000ms exceeded. | 120.0 s | BOTH |
| e2e/e1-baron.spec.ts | wave 20 spawns the Baron with elite stats, banner, escorts, and stable seed data | desktop-chrome | e2e/e1-baron.spec.ts:489 | Test timeout of 30000ms exceeded. | 52.2 s | BOTH |
| e2e/e1-baron.spec.ts | wave 20 spawns the Baron with elite stats, banner, escorts, and stable seed data | mobile-chrome | e2e/e1-baron.spec.ts:489 | Test timeout of 30000ms exceeded. | 54.2 s | BOTH |
| e2e/e1-dry-gulch.spec.ts | seeded Dry Gulch diagnostics are stable | desktop-chrome | e2e/e1-dry-gulch.spec.ts:227 | Error: expect(received).toEqual(expected) // deep equality | 23.5 s | DESKTOP-ONLY |
| e2e/e1-night-shift.spec.ts | a lantern pool makes only its build island readable at true dark | desktop-chrome | e2e/e1-night-shift.spec.ts:450 | Error: {"inside":0.16713960784313725,"outside":0.07644470588235293} | 24.5 s | BOTH |
| e2e/e1-night-shift.spec.ts | a lantern pool makes only its build island readable at true dark | mobile-chrome | e2e/e1-night-shift.spec.ts:450 | Error: {"inside":0.15370745098039215,"outside":0.0660643137254902} | 24.0 s | BOTH |
| e2e/e1-night-shift.spec.ts | cold lantern relight costs survive run suspend and continue | desktop-chrome | e2e/e1-night-shift.spec.ts:171 | TimeoutError: page.waitForFunction: Timeout 15000ms exceeded. | 47.9 s | BOTH |
| e2e/e1-night-shift.spec.ts | cold lantern relight costs survive run suspend and continue | mobile-chrome | e2e/e1-night-shift.spec.ts:171 | TimeoutError: page.waitForFunction: Timeout 15000ms exceeded. | 51.3 s | BOTH |
| e2e/e1-night-shift.spec.ts | lantern post is Night Shift gated and relights a true-dark light ring | desktop-chrome | e2e/e1-night-shift.spec.ts:405 | Error: expect(received).toBeLessThanOrEqual(expected) | 39.5 s | BOTH |
| e2e/e1-night-shift.spec.ts | lantern post is Night Shift gated and relights a true-dark light ring | mobile-chrome | e2e/e1-night-shift.spec.ts:372 | Test timeout of 30000ms exceeded. | 60.0 s | BOTH |
| e2e/e1-night-shift.spec.ts | loads Night Shift contract data and ramps full, dusk, dark, dawn lighting | desktop-chrome | e2e/e1-night-shift.spec.ts:352 | Error: expect(received).toBe(expected) // Object.is equality | 34.4 s | BOTH |
| e2e/e1-night-shift.spec.ts | loads Night Shift contract data and ramps full, dusk, dark, dawn lighting | mobile-chrome | e2e/e1-night-shift.spec.ts:271 | Test timeout of 30000ms exceeded. | 60.0 s | BOTH |
| e2e/e1-night-shift.spec.ts | seeded Night Shift diagnostics and dark render budget are stable | mobile-chrome | e2e/e1-night-shift.spec.ts:622 | Error: expect(received).toBeGreaterThan(expected) | 42.5 s | MOBILE-ONLY |
| e2e/e1-perf-pass.spec.ts | E1 maps publish a pressure census and preserve pressure pixels | desktop-chrome | e2e/e1-perf-pass.spec.ts:226 | Error: e1-night-shift | 75.9 s | BOTH |
| e2e/e1-perf-pass.spec.ts | E1 maps publish a pressure census and preserve pressure pixels | mobile-chrome | e2e/e1-perf-pass.spec.ts:207 | Test timeout of 480000ms exceeded. | 549.1 s | BOTH |
| e2e/e1-twin-banks.spec.ts | builds sluices and stockpiles on both banks against one gold pool | desktop-chrome | e2e/e1-twin-banks.spec.ts:48 | Error: expect(received).toBe(expected) // Object.is equality | 31.2 s | BOTH |
| e2e/e1-twin-banks.spec.ts | builds sluices and stockpiles on both banks against one gold pool | mobile-chrome | e2e/e1-twin-banks.spec.ts:48 | Error: expect(received).toBe(expected) // Object.is equality | 32.1 s | BOTH |
| e2e/e1-twin-banks.spec.ts | routes enemies through both west and east fords | mobile-chrome | e2e/e1-twin-banks.spec.ts:214 | Error: expect(received).toBeGreaterThan(expected) | 21.6 s | MOBILE-ONLY |
| e2e/e2-enemies.spec.ts | same seed keeps the E2 roster wave deterministic | desktop-chrome | e2e/e2-enemies.spec.ts:314 | Test timeout of 30000ms exceeded. | 31.6 s | BOTH |
| e2e/e2-enemies.spec.ts | same seed keeps the E2 roster wave deterministic | mobile-chrome | e2e/e2-enemies.spec.ts:314 | Test timeout of 30000ms exceeded. | 30.9 s | BOTH |
| e2e/e2-enemies.spec.ts | wave pulses spawn Rail Toughs, Steam Wreckers, and Coal Thieves from E2 data | desktop-chrome | e2e/e2-enemies.spec.ts:121 | Error: expect(received).toEqual(expected) // deep equality | 17.8 s | BOTH |
| e2e/e2-enemies.spec.ts | wave pulses spawn Rail Toughs, Steam Wreckers, and Coal Thieves from E2 data | mobile-chrome | e2e/e2-enemies.spec.ts:121 | Error: expect(received).toEqual(expected) // deep equality | 18.6 s | BOTH |
| e2e/e2-hill-mine.spec.ts | Hill Mine 200-enemy stress stays inside envelope | desktop-chrome | e2e/e2-hill-mine.spec.ts:368 | Error: expect(received).toBeLessThanOrEqual(expected) | 26.3 s | INCOMPLETE |
| e2e/e2-hill-mine.spec.ts | Hill Mine render descriptor auto-activates mesh relief and leaves the flat claim fallback alone | desktop-chrome | e2e/e2-hill-mine.spec.ts:166 | Error: expect(received).toBeCloseTo(expected, precision) | 14.2 s | BOTH |
| e2e/e2-hill-mine.spec.ts | Hill Mine render descriptor auto-activates mesh relief and leaves the flat claim fallback alone | mobile-chrome | e2e/e2-hill-mine.spec.ts:166 | Error: expect(received).toBeCloseTo(expected, precision) | 21.3 s | BOTH |
| e2e/e2-hill-mine.spec.ts | Hill Mine terrain simulation is deterministic for a seeded route | mobile-chrome | e2e/e2-hill-mine.spec.ts:318 | Test timeout of 60000ms exceeded. | 64.5 s | MOBILE-ONLY |
| e2e/e2-pressure-in-run.spec.ts | coal feeds boilers, pressure vents, and PRESSURIZE completes | desktop-chrome | e2e/e2-pressure-in-run.spec.ts:74 | Error: expect(received).toBe(expected) // Object.is equality | 42.8 s | BOTH |
| e2e/e2-pressure-in-run.spec.ts | coal feeds boilers, pressure vents, and PRESSURIZE completes | mobile-chrome | e2e/e2-pressure-in-run.spec.ts:74 | Error: expect(received).toBe(expected) // Object.is equality | 43.1 s | BOTH |
| e2e/e2-rail-entity.spec.ts | rails do not change sim hash and stay under the draw-call budget | desktop-chrome | e2e/e2-rail-entity.spec.ts:166 | Test timeout of 30000ms exceeded. | 30.7 s | BOTH |
| e2e/e2-rail-entity.spec.ts | rails do not change sim hash and stay under the draw-call budget | mobile-chrome | e2e/e2-rail-entity.spec.ts:166 | Test timeout of 30000ms exceeded. | 30.0 s | BOTH |
| e2e/e2-stamp-mill.spec.ts | Stamp Mill manifest builds to the door without switching epochs | mobile-chrome | e2e/e2-stamp-mill.spec.ts:200 | Error: expect(locator).toHaveAttribute(expected) failed | 41.5 s | MOBILE-ONLY |
| e2e/e2-t2-dynamo-ceremony.spec.ts | Dynamo Hall builds from gold and pressure, then hold-to-crank activates Voltage exactly once | desktop-chrome | e2e/e2-t2-dynamo-ceremony.spec.ts:89 | Error: expect(received).toBe(expected) // Object.is equality | 53.3 s | BOTH |
| e2e/e2-t2-dynamo-ceremony.spec.ts | Dynamo Hall builds from gold and pressure, then hold-to-crank activates Voltage exactly once | mobile-chrome | e2e/e2-t2-dynamo-ceremony.spec.ts:89 | Error: expect(received).toBe(expected) // Object.is equality | 59.8 s | BOTH |
| e2e/e2-t2-dynamo-ceremony.spec.ts | the T2 door reports missing science and the Voltage ceremony remains skippable | mobile-chrome | e2e/e2-t2-dynamo-ceremony.spec.ts:158 | Test timeout of 30000ms exceeded. | 60.0 s | MOBILE-ONLY |
| e2e/e2-trestle.spec.ts | The Trestle unlocks after Hill Mine and runs the shipped crossing systems | desktop-chrome | e2e/e2-trestle.spec.ts:96 | Error: expect(received).toBeLessThan(expected) | 60.8 s | BOTH |
| e2e/e2-trestle.spec.ts | The Trestle unlocks after Hill Mine and runs the shipped crossing systems | mobile-chrome | e2e/e2-trestle.spec.ts:96 | Error: expect(received).toBeLessThan(expected) | 91.5 s | BOTH |
| e2e/e4-dust-flats.spec.ts | fires the authored storm and peels a convoy off the ORBIT road | desktop-chrome | e2e/e4-dust-flats.spec.ts:46 | Error: expect(received).toMatchObject(expected) | 27.6 s | BOTH |
| e2e/e4-dust-flats.spec.ts | fires the authored storm and peels a convoy off the ORBIT road | mobile-chrome | e2e/e4-dust-flats.spec.ts:31 | Test timeout of 90000ms exceeded. | 158.8 s | BOTH |
| e2e/e4-dust-flats.spec.ts | offers road grading and the hauler in a normal Motor-era run | desktop-chrome | e2e/e4-dust-flats.spec.ts:97 | Test timeout of 90000ms exceeded. | 127.8 s | BOTH |
| e2e/e4-dust-flats.spec.ts | offers road grading and the hauler in a normal Motor-era run | mobile-chrome | e2e/e4-dust-flats.spec.ts:97 | Test timeout of 90000ms exceeded. | 139.0 s | BOTH |
| e2e/e4-dust-flats.spec.ts | publishes a mask table that matches the real Dust Flats contract | mobile-chrome | e2e/e4-dust-flats.spec.ts:75 | Test timeout of 90000ms exceeded. | 139.1 s | MOBILE-ONLY |
| e2e/e5-arsenal.spec.ts | pressure-seals the rig and records cure-arm outcomes through the existing resolver | mobile-chrome | e2e/e5-arsenal.spec.ts:48 | Test timeout of 30000ms exceeded. | 60.0 s | MOBILE-ONLY |
| e2e/e5-boss-dredge-queen.spec.ts | keeps the boss-run frame p95 within 15% of the non-boss tile | desktop-chrome | e2e/e5-boss-dredge-queen.spec.ts:259 | Error: expect(received).toBeLessThanOrEqual(expected) | 52.4 s | DESKTOP-ONLY |
| e2e/e6-boss-homemaker.spec.ts | unbuilds, tidies, makes one chair, and remains kept without ever hurting the player | desktop-chrome | e2e/e6-boss-homemaker.spec.ts:126 | Test timeout of 90000ms exceeded. | 128.8 s | BOTH |
| e2e/e6-boss-homemaker.spec.ts | unbuilds, tidies, makes one chair, and remains kept without ever hurting the player | mobile-chrome | e2e/e6-boss-homemaker.spec.ts:126 | Test timeout of 90000ms exceeded. | 139.2 s | BOTH |
| e2e/e6-decay-framework.spec.ts | same-seed decay registration, pause, and aura ticks are deterministic | mobile-chrome | e2e/e6-decay-framework.spec.ts:69 | Test timeout of 30000ms exceeded. | 30.0 s | MOBILE-ONLY |
| e2e/e7-arsenal.spec.ts | the four additions are absent before Signal and inherited from epoch 7 onward | mobile-chrome | e2e/e7-arsenal.spec.ts:40 | Error: expect(received).toEqual(expected) // deep equality | 30.7 s | MOBILE-ONLY |
| e2e/e7-boss.spec.ts | mirrors the live base, grades novelty, and keeps the Echo in a jar without a kill | desktop-chrome | e2e/e7-boss.spec.ts:116 | Error: expect(received).toMatchObject(expected) | 16.4 s | BOTH |
| e2e/e7-boss.spec.ts | mirrors the live base, grades novelty, and keeps the Echo in a jar without a kill | mobile-chrome | e2e/e7-boss.spec.ts:116 | Error: expect(received).toMatchObject(expected) | 30.9 s | BOTH |
| e2e/e7-playbook-surface.spec.ts | record, name, shelf, and replay use the profile tape store and the slaved rig actor | mobile-chrome | e2e/e7-playbook-surface.spec.ts:54 | Test timeout of 30000ms exceeded. | 60.0 s | MOBILE-ONLY |
| e2e/e7-playbook-surface.spec.ts | the tape drawer arms at the Signal Era and remains inherited afterward | mobile-chrome | e2e/e7-playbook-surface.spec.ts:51 | Error: expect(received).toEqual(expected) // deep equality | 42.8 s | MOBILE-ONLY |
| e2e/e9-arsenal.spec.ts | Cure-Arms free people and power fevered machines down without death events | desktop-chrome | e2e/e9-arsenal.spec.ts:92 | Error: expect(received).toEqual(expected) // deep equality | 17.0 s | BOTH |
| e2e/e9-arsenal.spec.ts | Cure-Arms free people and power fevered machines down without death events | mobile-chrome | e2e/e9-arsenal.spec.ts:92 | Error: expect(received).toEqual(expected) // deep equality | 21.4 s | BOTH |
| e2e/e9-canal-stages.spec.ts | 2. the north-scarp ice band uses harvest dwell and restores its Economy receipt | desktop-chrome | e2e/e9-canal-stages.spec.ts:87 | Error: expect(received).toEqual(expected) // deep equality | 23.2 s | DESKTOP-ONLY |
| e2e/e9-canal-stages.spec.ts | 3. the dust devil telegraphs, follows its authored lane, and shoves without chasing or damage | mobile-chrome | e2e/e9-canal-stages.spec.ts:111 | Error: expect(received).toMatchObject(expected) | 21.7 s | MOBILE-ONLY |
| e2e/ed-01-descriptor-inspector.spec.ts | editor live-applies a descriptor edit and export/import round-trips byte-equal | desktop-chrome | e2e/ed-01-descriptor-inspector.spec.ts:52 | Error: expect(received).toBe(expected) // Object.is equality | 17.2 s | BOTH |
| e2e/ed-01-descriptor-inspector.spec.ts | editor live-applies a descriptor edit and export/import round-trips byte-equal | mobile-chrome | e2e/ed-01-descriptor-inspector.spec.ts:52 | Error: expect(received).toBe(expected) // Object.is equality | 24.8 s | BOTH |
| e2e/ed-02-authored-grid-substrate.spec.ts | session document changes visual height across reload while the sim fingerprint stays identical | mobile-chrome | e2e/ed-02-authored-grid-substrate.spec.ts:93 | Test timeout of 30000ms exceeded. | 43.1 s | MOBILE-ONLY |
| e2e/ed-02-terrain-brush.spec.ts | brush paints, reloads, restores snapshots, and reimports byte-identically | desktop-chrome | e2e/ed-02-terrain-brush.spec.ts:94 | Test timeout of 90000ms exceeded. | 138.1 s | BOTH |
| e2e/ed-02-terrain-brush.spec.ts | brush paints, reloads, restores snapshots, and reimports byte-identically | mobile-chrome | e2e/ed-02-terrain-brush.spec.ts:94 | Test timeout of 90000ms exceeded. | 147.3 s | BOTH |
| e2e/ed-03-placement-validator.spec.ts | placement controls commit valid descriptors and explain atomic rejections in-world | desktop-chrome | e2e/ed-03-placement-validator.spec.ts:197 | Test timeout of 90000ms exceeded. | 128.5 s | BOTH |
| e2e/ed-03-placement-validator.spec.ts | placement controls commit valid descriptors and explain atomic rejections in-world | mobile-chrome | e2e/ed-03-placement-validator.spec.ts:197 | Test timeout of 90000ms exceeded. | 137.5 s | BOTH |
| e2e/ed-05-palette.spec.ts | terrain tint bands use touch-sized pickers and preserve every untouched descriptor byte | desktop-chrome | e2e/ed-05-palette.spec.ts:4 | Test timeout of 90000ms exceeded. | 130.3 s | BOTH |
| e2e/ed-05-palette.spec.ts | terrain tint bands use touch-sized pickers and preserve every untouched descriptor byte | mobile-chrome | e2e/ed-05-palette.spec.ts:4 | Test timeout of 90000ms exceeded. | 139.4 s | BOTH |
| e2e/eight-winds-enemies.spec.ts | diagnostics drive thief northeast and Baron southwest on their correct rows | desktop-chrome | e2e/eight-winds-enemies.spec.ts:39 | Test timeout of 60000ms exceeded. | 105.1 s | DESKTOP-ONLY |
| e2e/enemy-gap-flow.spec.ts | a connected U-wall routes around its distant opening without gnawing | desktop-chrome | e2e/enemy-gap-flow.spec.ts:181 | Error: expect(received).toBe(expected) // Object.is equality | 18.2 s | BOTH |
| e2e/enemy-gap-flow.spec.ts | a connected U-wall routes around its distant opening without gnawing | mobile-chrome | e2e/enemy-gap-flow.spec.ts:181 | Error: expect(received).toBe(expected) // Object.is equality | 20.9 s | BOTH |
| e2e/enemy-gap-flow.spec.ts | a multi-turn route clears successive open walls without gnawing | desktop-chrome | e2e/enemy-gap-flow.spec.ts:154 | Error: expect(received).toBeGreaterThan(expected) | 15.7 s | BOTH |
| e2e/enemy-gap-flow.spec.ts | a multi-turn route clears successive open walls without gnawing | mobile-chrome | e2e/enemy-gap-flow.spec.ts:154 | Error: expect(received).toBeGreaterThan(expected) | 18.0 s | BOTH |
| e2e/er01-e10-census.spec.ts | e10-archive-world census cites the existing Deep Sky debt | desktop-chrome | e2e/er01-e10-census.spec.ts:59 | Error: expect(received).toBeUndefined() | 4.9 s | BOTH |
| e2e/er01-e10-census.spec.ts | e10-archive-world census cites the existing Deep Sky debt | mobile-chrome | e2e/er01-e10-census.spec.ts:59 | Error: expect(received).toBeUndefined() | 4.4 s | BOTH |
| e2e/er01-e10-census.spec.ts | e10-ember-shore census cites the existing Deep Sky debt | desktop-chrome | e2e/er01-e10-census.spec.ts:59 | Error: expect(received).toBeUndefined() | 4.7 s | BOTH |
| e2e/er01-e10-census.spec.ts | e10-ember-shore census cites the existing Deep Sky debt | mobile-chrome | e2e/er01-e10-census.spec.ts:59 | Error: expect(received).toBeUndefined() | 5.8 s | BOTH |
| e2e/er01-e10-census.spec.ts | e10-last-claim census cites the existing Deep Sky debt | desktop-chrome | e2e/er01-e10-census.spec.ts:59 | Error: expect(received).toBeUndefined() | 3.4 s | BOTH |
| e2e/er01-e10-census.spec.ts | e10-last-claim census cites the existing Deep Sky debt | mobile-chrome | e2e/er01-e10-census.spec.ts:59 | Error: expect(received).toBeUndefined() | 4.4 s | BOTH |
| e2e/er01-e10-census.spec.ts | e10-river census cites the existing Deep Sky debt | desktop-chrome | e2e/er01-e10-census.spec.ts:59 | Error: expect(received).toBeUndefined() | 2.5 s | BOTH |
| e2e/er01-e10-census.spec.ts | e10-river census cites the existing Deep Sky debt | mobile-chrome | e2e/er01-e10-census.spec.ts:59 | Error: expect(received).toBeUndefined() | 4.9 s | BOTH |
| e2e/er01-e3-census.spec.ts | e3-blackout-ridge census support is explicit and deterministic | desktop-chrome | e2e/er01-e3-census.spec.ts:183 | Error: expect(received).toMatchObject(expected) | 2.9 s | BOTH |
| e2e/er01-e3-census.spec.ts | e3-blackout-ridge census support is explicit and deterministic | mobile-chrome | e2e/er01-e3-census.spec.ts:183 | Error: expect(received).toMatchObject(expected) | 3.5 s | BOTH |
| e2e/er01-e3-census.spec.ts | e3-canyon-works census support is explicit and deterministic | desktop-chrome | e2e/er01-e3-census.spec.ts:44 | Error: expect(received).toBeUndefined() | 3.7 s | BOTH |
| e2e/er01-e3-census.spec.ts | e3-canyon-works census support is explicit and deterministic | mobile-chrome | e2e/er01-e3-census.spec.ts:44 | Error: expect(received).toBeUndefined() | 4.7 s | BOTH |
| e2e/er01-e5-census.spec.ts | e5-deepwater-claim census refusal is explicit | desktop-chrome | e2e/er01-e5-census.spec.ts:163 | Error: expect(received).toBeUndefined() | 1.9 s | BOTH |
| e2e/er01-e5-census.spec.ts | e5-deepwater-claim census refusal is explicit | mobile-chrome | e2e/er01-e5-census.spec.ts:163 | Error: expect(received).toBeUndefined() | 2.9 s | BOTH |
| e2e/er01-e6-census.spec.ts | e6-glow-mesa census socket runs and still refuses admission | desktop-chrome | e2e/er01-e6-census.spec.ts:112 | Error: expect(received).toBeUndefined() | 1.9 s | BOTH |
| e2e/er01-e6-census.spec.ts | e6-glow-mesa census socket runs and still refuses admission | mobile-chrome | e2e/er01-e6-census.spec.ts:112 | Error: expect(received).toBeUndefined() | 2.6 s | BOTH |
| e2e/er01-e6-census.spec.ts | e6-half-life-hollow census socket runs and still refuses admission | desktop-chrome | e2e/er01-e6-census.spec.ts:112 | Error: expect(received).toBeUndefined() | 2.1 s | BOTH |
| e2e/er01-e6-census.spec.ts | e6-half-life-hollow census socket runs and still refuses admission | mobile-chrome | e2e/er01-e6-census.spec.ts:112 | Error: expect(received).toBeUndefined() | 2.8 s | BOTH |
| e2e/er01-e6-census.spec.ts | e6-picnic census socket runs and still refuses admission | desktop-chrome | e2e/er01-e6-census.spec.ts:112 | Error: expect(received).toBeUndefined() | 2.2 s | BOTH |
| e2e/er01-e6-census.spec.ts | e6-picnic census socket runs and still refuses admission | mobile-chrome | e2e/er01-e6-census.spec.ts:112 | Error: expect(received).toBeUndefined() | 2.9 s | BOTH |
| e2e/er01-e6-census.spec.ts | e6-showroom census socket runs and still refuses admission | desktop-chrome | e2e/er01-e6-census.spec.ts:112 | Error: expect(received).toBeUndefined() | 2.2 s | BOTH |
| e2e/er01-e6-census.spec.ts | e6-showroom census socket runs and still refuses admission | mobile-chrome | e2e/er01-e6-census.spec.ts:112 | Error: expect(received).toBeUndefined() | 3.6 s | BOTH |
| e2e/er01-e7-census.spec.ts | e7-dead-band census refuses the unsocketed Signal mechanics | desktop-chrome | e2e/er01-e7-census.spec.ts:49 | Error: expect(received).toBeUndefined() | 2.2 s | BOTH |
| e2e/er01-e7-census.spec.ts | e7-dead-band census refuses the unsocketed Signal mechanics | mobile-chrome | e2e/er01-e7-census.spec.ts:49 | Error: expect(received).toBeUndefined() | 2.7 s | BOTH |
| e2e/er01-e7-census.spec.ts | e7-echo-canyon census refuses the unsocketed Signal mechanics | desktop-chrome | e2e/er01-e7-census.spec.ts:49 | Error: expect(received).toBeUndefined() | 2.1 s | BOTH |
| e2e/er01-e7-census.spec.ts | e7-echo-canyon census refuses the unsocketed Signal mechanics | mobile-chrome | e2e/er01-e7-census.spec.ts:49 | Error: expect(received).toBeUndefined() | 2.9 s | BOTH |
| e2e/er01-e7-census.spec.ts | e7-relay-rush census refuses the unsocketed Signal mechanics | desktop-chrome | e2e/er01-e7-census.spec.ts:49 | Error: expect(received).toBeUndefined() | 2.3 s | BOTH |
| e2e/er01-e7-census.spec.ts | e7-relay-rush census refuses the unsocketed Signal mechanics | mobile-chrome | e2e/er01-e7-census.spec.ts:49 | Error: expect(received).toBeUndefined() | 2.6 s | BOTH |
| e2e/er01-e7-census.spec.ts | e7-relay-valley census refuses the unsocketed Signal mechanics | desktop-chrome | e2e/er01-e7-census.spec.ts:49 | Error: expect(received).toBeUndefined() | 1.7 s | BOTH |
| e2e/er01-e7-census.spec.ts | e7-relay-valley census refuses the unsocketed Signal mechanics | mobile-chrome | e2e/er01-e7-census.spec.ts:49 | Error: expect(received).toBeUndefined() | 2.8 s | BOTH |
| e2e/er01-e8-census.spec.ts | e8-eclipse census rejects the unsocketed Orbital contract | desktop-chrome | e2e/er01-e8-census.spec.ts:52 | Error: expect(received).toThrow(expected) | 2.0 s | BOTH |
| e2e/er01-e8-census.spec.ts | e8-eclipse census rejects the unsocketed Orbital contract | mobile-chrome | e2e/er01-e8-census.spec.ts:52 | Error: expect(received).toThrow(expected) | 2.3 s | BOTH |
| e2e/er01-e8-census.spec.ts | e8-mare-claim census rejects the unsocketed Orbital contract | desktop-chrome | e2e/er01-e8-census.spec.ts:52 | Error: expect(received).toThrow(expected) | 2.4 s | BOTH |
| e2e/er01-e8-census.spec.ts | e8-mare-claim census rejects the unsocketed Orbital contract | mobile-chrome | e2e/er01-e8-census.spec.ts:52 | Error: expect(received).toThrow(expected) | 3.0 s | BOTH |
| e2e/er01-e9-census.spec.ts | e9-dome-basin census rejects the unsocketed Red Fields mechanic | desktop-chrome | e2e/er01-e9-census.spec.ts:188 | Error: expect(received).toThrow(expected) | 2.5 s | BOTH |
| e2e/er01-e9-census.spec.ts | e9-dome-basin census rejects the unsocketed Red Fields mechanic | mobile-chrome | e2e/er01-e9-census.spec.ts:188 | Error: expect(received).toThrow(expected) | 3.2 s | BOTH |
| e2e/f-bw-16-baron-siege.spec.ts | unblocked Baron fight keeps its deterministic baseline | desktop-chrome | e2e/f-bw-16-baron-siege.spec.ts:131 | Test timeout of 30000ms exceeded. | 31.0 s | BOTH |
| e2e/f-bw-16-baron-siege.spec.ts | unblocked Baron fight keeps its deterministic baseline | mobile-chrome | e2e/f-bw-16-baron-siege.spec.ts:131 | Test timeout of 30000ms exceeded. | 35.0 s | BOTH |
| e2e/f1575-1-drift-tick-budget.spec.ts | maps denied-receipt drift at fixed start phase P=35 | desktop-chrome | e2e/f1575-1-drift-tick-budget.spec.ts:100 | Error: phase 35 was unreachable from tick 84 | 14.6 s | BOTH |
| e2e/f1575-1-drift-tick-budget.spec.ts | maps denied-receipt drift at fixed start phase P=35 | mobile-chrome | e2e/f1575-1-drift-tick-budget.spec.ts:100 | Error: phase 35 was unreachable from tick 109 | 19.6 s | BOTH |
| e2e/f1575-1-drift-tick-budget.spec.ts | maps denied-receipt drift at fixed start phase P=39 | desktop-chrome | e2e/f1575-1-drift-tick-budget.spec.ts:100 | Error: phase 39 was unreachable from tick 95 | 15.2 s | BOTH |
| e2e/f1575-1-drift-tick-budget.spec.ts | maps denied-receipt drift at fixed start phase P=39 | mobile-chrome | e2e/f1575-1-drift-tick-budget.spec.ts:100 | Error: phase 39 was unreachable from tick 90 | 17.3 s | BOTH |
| e2e/f1575-1-drift-tick-budget.spec.ts | maps denied-receipt drift at fixed start phase P=43 | desktop-chrome | e2e/f1575-1-drift-tick-budget.spec.ts:100 | Error: phase 43 was unreachable from tick 84 | 15.8 s | BOTH |
| e2e/f1575-1-drift-tick-budget.spec.ts | maps denied-receipt drift at fixed start phase P=43 | mobile-chrome | e2e/f1575-1-drift-tick-budget.spec.ts:100 | Error: phase 43 was unreachable from tick 103 | 18.6 s | BOTH |
| e2e/f1575-1-drift-tick-budget.spec.ts | maps denied-receipt drift at fixed start phase P=47 | desktop-chrome | e2e/f1575-1-drift-tick-budget.spec.ts:100 | Error: phase 47 was unreachable from tick 84 | 16.3 s | BOTH |
| e2e/f1575-1-drift-tick-budget.spec.ts | maps denied-receipt drift at fixed start phase P=47 | mobile-chrome | e2e/f1575-1-drift-tick-budget.spec.ts:100 | Error: phase 47 was unreachable from tick 97 | 23.3 s | BOTH |
| e2e/feedback-fx.spec.ts | announcement banner fades after the opening claim notice | desktop-chrome | e2e/feedback-fx.spec.ts:33 | Error: expect(locator).toContainText(expected) failed | 23.9 s | BOTH |
| e2e/feedback-fx.spec.ts | announcement banner fades after the opening claim notice | mobile-chrome | e2e/feedback-fx.spec.ts:33 | Error: expect(locator).toContainText(expected) failed | 20.2 s | BOTH |
| e2e/friendly-walls.spec.ts | the family crosses its palisade line while the Fever routes around it | desktop-chrome | e2e/friendly-walls.spec.ts:44 | Error: expect(received).toBeDefined() | 20.7 s | BOTH |
| e2e/friendly-walls.spec.ts | the family crosses its palisade line while the Fever routes around it | mobile-chrome | e2e/friendly-walls.spec.ts:44 | Error: expect(received).toBeDefined() | 29.1 s | BOTH |
| e2e/gazette-first-issue.spec.ts | fresh profile gets the pinned first issue badge and can reopen it | mobile-chrome | e2e/gazette-first-issue.spec.ts:82 | Test timeout of 30000ms exceeded. | 60.0 s | MOBILE-ONLY |
| e2e/gazette-first-issue.spec.ts | mandatory welcome opens issue one only on the first town entry | mobile-chrome | e2e/gazette-first-issue.spec.ts:105 | Test timeout of 30000ms exceeded. | 60.0 s | MOBILE-ONLY |
| e2e/gt-02-slope.spec.ts | slope movement, cliff blocking, and visual height use the sim field | desktop-chrome | e2e/gt-02-slope.spec.ts:44 | Error: expect(received).toBeGreaterThanOrEqual(expected) | 45.6 s | BOTH |
| e2e/gt-02-slope.spec.ts | slope movement, cliff blocking, and visual height use the sim field | mobile-chrome | e2e/gt-02-slope.spec.ts:44 | Error: expect(received).toBeGreaterThanOrEqual(expected) | 50.6 s | BOTH |
| e2e/gt-02-slope.spec.ts | tile param is debug-gated and first-claim fingerprint remains flat | desktop-chrome | e2e/gt-02-slope.spec.ts:169 | Test timeout of 40000ms exceeded. | 68.1 s | BOTH |
| e2e/gt-02-slope.spec.ts | tile param is debug-gated and first-claim fingerprint remains flat | mobile-chrome | e2e/gt-02-slope.spec.ts:169 | Test timeout of 40000ms exceeded. | 77.9 s | BOTH |
| e2e/gt-03-enemy-elevation.spec.ts | basin stress stays in frame envelope while the flat claim remains neutral | desktop-chrome | e2e/gt-03-enemy-elevation.spec.ts:278 | Error: expect(received).toBeLessThanOrEqual(expected) | 24.8 s | INCOMPLETE |
| e2e/gt-03-enemy-elevation.spec.ts | enemies slow on slopes and expose grounded terrain diagnostics | desktop-chrome | e2e/gt-03-enemy-elevation.spec.ts:146 | Error: expect(received).toBeLessThan(expected) | 23.6 s | BOTH |
| e2e/gt-03-enemy-elevation.spec.ts | enemies slow on slopes and expose grounded terrain diagnostics | mobile-chrome | e2e/gt-03-enemy-elevation.spec.ts:147 | Error: expect(received).toBeGreaterThanOrEqual(expected) | 38.6 s | BOTH |
| e2e/gt-04-sightlines.spec.ts | ridge blocks bolt acquisition from both sides | desktop-chrome | e2e/gt-04-sightlines.spec.ts:63 | Error: expect(received).resolves.toBe(expected) // Object.is equality | 13.7 s | BOTH |
| e2e/gt-04-sightlines.spec.ts | ridge blocks bolt acquisition from both sides | mobile-chrome | e2e/gt-04-sightlines.spec.ts:63 | Error: expect(received).resolves.toBe(expected) // Object.is equality | 22.3 s | BOTH |
| e2e/gt-04-sightlines.spec.ts | terrain LOS is deterministic and 200-enemy basin stress stays in envelope | desktop-chrome | e2e/gt-04-sightlines.spec.ts:63 | Error: expect(received).resolves.toBe(expected) // Object.is equality | 8.5 s | INCOMPLETE |
| e2e/gt-05-water-depth.spec.ts | classic claim keeps deep water impassable while carrying equivalent depth data | desktop-chrome | e2e/gt-05-water-depth.spec.ts:333 | Test timeout of 45000ms exceeded. | 90.0 s | BOTH |
| e2e/gt-05-water-depth.spec.ts | classic claim keeps deep water impassable while carrying equivalent depth data | mobile-chrome | e2e/gt-05-water-depth.spec.ts:333 | Test timeout of 45000ms exceeded. | 90.0 s | BOTH |
| e2e/gt-05-water-depth.spec.ts | deep water blocks hero and enemy through the shared resolver | mobile-chrome | e2e/gt-05-water-depth.spec.ts:217 | Error: expect(received).toMatchObject(expected) | 26.3 s | MOBILE-ONLY |
| e2e/gt-05-water-depth.spec.ts | GT water depth simulation is deterministic | desktop-chrome | e2e/gt-05-water-depth.spec.ts:391 | Test timeout of 30000ms exceeded. | 31.6 s | INCOMPLETE |
| e2e/gz-h1-newsie.spec.ts | newsie barks latest headline and opens the Claim Herald | desktop-chrome | e2e/gz-h1-newsie.spec.ts:120 | Error: expect(locator).toHaveText(expected) failed | 43.9 s | DESKTOP-ONLY |
| e2e/landmark-brightness.spec.ts | Night Shift keeps ground light pools without mutating landmark materials | desktop-chrome | e2e/landmark-brightness.spec.ts:96 | Test timeout of 30000ms exceeded. | 52.9 s | DESKTOP-ONLY |
| e2e/landmark-brightness.spec.ts | The Claim keeps daylight landmarks opaque, lit, and under the frame budget | desktop-chrome | e2e/landmark-brightness.spec.ts:91 | Error: expect(received).toBeLessThanOrEqual(expected) | 39.7 s | BOTH |
| e2e/landmark-brightness.spec.ts | The Claim keeps daylight landmarks opaque, lit, and under the frame budget | mobile-chrome | e2e/landmark-brightness.spec.ts:91 | Error: expect(received).toBeLessThanOrEqual(expected) | 37.8 s | BOTH |
| e2e/landmark-collision.spec.ts | later-era modeled plaza props use their authored Town footprints | desktop-chrome | e2e/landmark-collision.spec.ts:167 | Error: expect(received).toBeLessThan(expected) | 27.6 s | BOTH |
| e2e/landmark-collision.spec.ts | later-era modeled plaza props use their authored Town footprints | mobile-chrome | e2e/landmark-collision.spec.ts:167 | Error: expect(received).toBeLessThan(expected) | 34.5 s | BOTH |
| e2e/lane-baron-props-detail.spec.ts | the detailed launcher and powder keg mount without the wrecker stone | desktop-chrome | e2e/lane-baron-props-detail.spec.ts:51 | Error: expect(received).toBeGreaterThan(expected) | 36.3 s | BOTH |
| e2e/lane-baron-props-detail.spec.ts | the detailed launcher and powder keg mount without the wrecker stone | mobile-chrome | e2e/lane-baron-props-detail.spec.ts:51 | Error: expect(received).toBeGreaterThan(expected) | 36.6 s | BOTH |
| e2e/lane-boss-healthbar.spec.ts | boss damage leaves green life over red loss | mobile-chrome | e2e/lane-boss-healthbar.spec.ts:8 | Test timeout of 30000ms exceeded. | 60.0 s | MOBILE-ONLY |
| e2e/m1-02-auto-fire.spec.ts | run reset recycles combat pools without renderer memory growth | desktop-chrome | e2e/m1-02-auto-fire.spec.ts:96 | Error: expect(received).toBe(expected) // Object.is equality | 51.4 s | BOTH |
| e2e/m1-02-auto-fire.spec.ts | run reset recycles combat pools without renderer memory growth | mobile-chrome | e2e/m1-02-auto-fire.spec.ts:96 | Error: expect(received).toBe(expected) // Object.is equality | 56.8 s | BOTH |
| e2e/m1-02-auto-fire.spec.ts | stress pack never exceeds the bolt pool and logs no console errors | desktop-chrome | e2e/m1-02-auto-fire.spec.ts:57 | Error: expect(received).toBeGreaterThan(expected) | 38.7 s | BOTH |
| e2e/m1-02-auto-fire.spec.ts | stress pack never exceeds the bolt pool and logs no console errors | mobile-chrome | e2e/m1-02-auto-fire.spec.ts:57 | Error: expect(received).toBeGreaterThan(expected) | 43.2 s | BOTH |
| e2e/m1-03-wave-pressure.spec.ts | grace holds pressure until sim-t 5, then first trickle arrives | desktop-chrome | e2e/m1-03-wave-pressure.spec.ts:35 | Error: expect(received).toBe(expected) // Object.is equality | 14.8 s | BOTH |
| e2e/m1-03-wave-pressure.spec.ts | grace holds pressure until sim-t 5, then first trickle arrives | mobile-chrome | e2e/m1-03-wave-pressure.spec.ts:35 | Error: expect(received).toBe(expected) // Object.is equality | 18.7 s | BOTH |
| e2e/m1-04-gold-panning-economy.spec.ts | leaving mid-pan decays harvest progress | desktop-chrome | e2e/m1-04-gold-panning-economy.spec.ts:104 | Error: expect(received).toBeLessThan(expected) | 19.5 s | DESKTOP-ONLY |
| e2e/m1-05-sentry-beacon-build.spec.ts | resetRun clears Sentry Beacons, owner kills, and keeps renderer memory stable | mobile-chrome | e2e/m1-05-sentry-beacon-build.spec.ts:129 | Error: expect(received).toBeGreaterThanOrEqual(expected) | 59.7 s | MOBILE-ONLY |
| e2e/m1-05-sentry-beacon-build.spec.ts | Sentry Beacon registers kills through combat with zero input | mobile-chrome | e2e/m1-05-sentry-beacon-build.spec.ts:75 | Error: expect(received).toBeGreaterThanOrEqual(expected) | 59.0 s | MOBILE-ONLY |
| e2e/m1-06-level-up-choices.spec.ts | draft expiry files the first offer and the run continues | desktop-chrome | e2e/m1-06-level-up-choices.spec.ts:132 | Error: expect(received).toBe(expected) // Object.is equality | 28.8 s | DESKTOP-ONLY |
| e2e/m1-06-level-up-choices.spec.ts | first offer is deterministic for a fixed seed and has no duplicates | desktop-chrome | e2e/m1-06-level-up-choices.spec.ts:161 | Test timeout of 30000ms exceeded. | 30.0 s | BOTH |
| e2e/m1-06-level-up-choices.spec.ts | first offer is deterministic for a fixed seed and has no duplicates | mobile-chrome | e2e/m1-06-level-up-choices.spec.ts:161 | Test timeout of 30000ms exceeded. | 31.3 s | BOTH |
| e2e/m1-06-level-up-choices.spec.ts | investment weighting prefers owned families without losing discovery | desktop-chrome | e2e/m1-06-level-up-choices.spec.ts:177 | Test timeout of 45000ms exceeded. | 50.0 s | BOTH |
| e2e/m1-06-level-up-choices.spec.ts | investment weighting prefers owned families without losing discovery | mobile-chrome | e2e/m1-06-level-up-choices.spec.ts:177 | Test timeout of 45000ms exceeded. | 50.0 s | BOTH |
| e2e/m1-07-charm.spec.ts | wave banner rotation avoids immediate repeats | desktop-chrome | e2e/m1-07-charm.spec.ts:148 | Error: expect(received).not.toBe(expected) // Object.is equality | 27.3 s | DESKTOP-ONLY |
| e2e/m2-02-sluice-and-stockpile.spec.ts | R rotates the palisade footprint and the rotated AABB blocks on that axis | mobile-chrome | e2e/m2-02-sluice-and-stockpile.spec.ts:254 | Error: expect(received).toBe(expected) // Object.is equality | 36.7 s | MOBILE-ONLY |
| e2e/m2-03-wave-scheduler.spec.ts | lull window stays spawn-free between scheduled pulses | mobile-chrome | e2e/m2-03-wave-scheduler.spec.ts:178 | Error: expect(received).toBeGreaterThanOrEqual(expected) | 26.6 s | MOBILE-ONLY |
| e2e/m2-03-wave-scheduler.spec.ts | spawn accounting follows the knee budget at waves 8, 10, and 14 | desktop-chrome | e2e/m2-03-wave-scheduler.spec.ts:144 | Error: expect(received).toBeGreaterThanOrEqual(expected) | 30.3 s | BOTH |
| e2e/m2-03-wave-scheduler.spec.ts | spawn accounting follows the knee budget at waves 8, 10, and 14 | mobile-chrome | e2e/m2-03-wave-scheduler.spec.ts:144 | Error: expect(received).toBeGreaterThanOrEqual(expected) | 28.0 s | BOTH |
| e2e/m2-04-gold-stealing.spec.ts | bank cap blocks pickup reclaim until room exists | mobile-chrome | e2e/m2-04-gold-stealing.spec.ts:197 | Error: expect(received).toBe(expected) // Object.is equality | 37.8 s | MOBILE-ONLY |
| e2e/m2-04-gold-stealing.spec.ts | thief routes around a finite palisade line to steal | desktop-chrome | e2e/m2-04-gold-stealing.spec.ts:223 | Error: expect(received).toBe(expected) // Object.is equality | 58.9 s | BOTH |
| e2e/m2-04-gold-stealing.spec.ts | thief routes around a finite palisade line to steal | mobile-chrome | e2e/m2-04-gold-stealing.spec.ts:223 | Error: expect(received).toBe(expected) // Object.is equality | 59.0 s | BOTH |
| e2e/m2-05-base-damage-repair.spec.ts | wreck and repair cycles leave shooter and renderer counts at baseline | desktop-chrome | e2e/m2-05-base-damage-repair.spec.ts:127 | Error: expect(received).toBe(expected) // Object.is equality | 53.8 s | BOTH |
| e2e/m2-05-base-damage-repair.spec.ts | wreck and repair cycles leave shooter and renderer counts at baseline | mobile-chrome | e2e/m2-05-base-damage-repair.spec.ts:127 | Error: expect(received).toBe(expected) // Object.is equality | 49.0 s | BOTH |
| e2e/m2-05b-overwhelm-valves.spec.ts | lullFloor12 only clamps post-wave-12 pulse spacing | desktop-chrome | e2e/m2-05b-overwhelm-valves.spec.ts:246 | TypeError: Cannot read properties of undefined (reading 'lastPulseAt') | 21.1 s | BOTH |
| e2e/m2-05b-overwhelm-valves.spec.ts | lullFloor12 only clamps post-wave-12 pulse spacing | mobile-chrome | e2e/m2-05b-overwhelm-valves.spec.ts:246 | TypeError: Cannot read properties of undefined (reading 'lastPulseAt') | 22.0 s | BOTH |
| e2e/m2-05b-overwhelm-valves.spec.ts | scheduled thief flags never exceed the concurrency cap | desktop-chrome | e2e/m2-05b-overwhelm-valves.spec.ts:183 | Error: expect(received).toBeGreaterThan(expected) | 30.1 s | DESKTOP-ONLY |
| e2e/m2-05b-overwhelm-valves.spec.ts | theft ping shows edge glyph, auto-hides, and debug flags suppress it | desktop-chrome | e2e/m2-05b-overwhelm-valves.spec.ts:252 | Test timeout of 30000ms exceeded. | 54.6 s | BOTH |
| e2e/m2-05b-overwhelm-valves.spec.ts | theft ping shows edge glyph, auto-hides, and debug flags suppress it | mobile-chrome | e2e/m2-05b-overwhelm-valves.spec.ts:252 | Test timeout of 30000ms exceeded. | 57.8 s | BOTH |
| e2e/m2-05b-overwhelm-valves.spec.ts | wave-12 palisade line survives one wrecker pulse and repair stays cheaper than new placement | desktop-chrome | e2e/m2-05b-overwhelm-valves.spec.ts:320 | Error: expect(received).toBe(expected) // Object.is equality | 32.9 s | DESKTOP-ONLY |
| e2e/m2-06-arsenal-blast-charge.spec.ts | stress blast pool never exceeds cap | desktop-chrome | e2e/m2-06-arsenal-blast-charge.spec.ts:228 | Error: expect(received).toBeGreaterThan(expected) | 54.9 s | BOTH |
| e2e/m2-06-arsenal-blast-charge.spec.ts | stress blast pool never exceeds cap | mobile-chrome | e2e/m2-06-arsenal-blast-charge.spec.ts:228 | Error: expect(received).toBeGreaterThan(expected) | 55.2 s | BOTH |
| e2e/m2-06-arsenal-blast-charge.spec.ts | turret line of sight ignores blocked nearest and shoots clear second target | desktop-chrome | e2e/m2-06-arsenal-blast-charge.spec.ts:155 | Error: expect(received).toBe(expected) // Object.is equality | 32.8 s | BOTH |
| e2e/m2-06-arsenal-blast-charge.spec.ts | turret line of sight ignores blocked nearest and shoots clear second target | mobile-chrome | e2e/m2-06-arsenal-blast-charge.spec.ts:155 | Error: expect(received).toBe(expected) // Object.is equality | 26.2 s | BOTH |
| e2e/m2-07-base-self-hold.spec.ts | blast clump TTK at wave 20+ stays within 2x wave-10 | desktop-chrome | e2e/m2-07-base-self-hold.spec.ts:212 | Error: expect(received).toBeGreaterThanOrEqual(expected) | 69.4 s | BOTH |
| e2e/m2-07-base-self-hold.spec.ts | blast clump TTK at wave 20+ stays within 2x wave-10 | mobile-chrome | e2e/m2-07-base-self-hold.spec.ts:371 | Error: expect(received).toBeLessThanOrEqual(expected) | 26.9 s | BOTH |
| e2e/m2-07-base-self-hold.spec.ts | SELF-HOLD reference base keeps half standing through wave-25 pulse cycles | desktop-chrome | e2e/m2-07-base-self-hold.spec.ts:96 | Error: expect(received).toBe(expected) // Object.is equality | 31.2 s | BOTH |
| e2e/m2-07-base-self-hold.spec.ts | SELF-HOLD reference base keeps half standing through wave-25 pulse cycles | mobile-chrome | e2e/m2-07-base-self-hold.spec.ts:96 | Error: expect(received).toBe(expected) // Object.is equality | 32.4 s | BOTH |
| e2e/m2-07-base-self-hold.spec.ts | SELF-HOLD reference base survives two wave-15 pulse cycles without hero intervention | desktop-chrome | e2e/m2-07-base-self-hold.spec.ts:96 | Error: expect(received).toBe(expected) // Object.is equality | 34.6 s | BOTH |
| e2e/m2-07-base-self-hold.spec.ts | SELF-HOLD reference base survives two wave-15 pulse cycles without hero intervention | mobile-chrome | e2e/m2-07-base-self-hold.spec.ts:96 | Error: expect(received).toBe(expected) // Object.is equality | 33.3 s | BOTH |
| e2e/m2-07b-building-incentive-tune.spec.ts | building-targeting bandits share the wave pressure budget | desktop-chrome | e2e/m2-07b-building-incentive-tune.spec.ts:154 | Test timeout of 30000ms exceeded. | 31.1 s | BOTH |
| e2e/m2-07b-building-incentive-tune.spec.ts | building-targeting bandits share the wave pressure budget | mobile-chrome | e2e/m2-07b-building-incentive-tune.spec.ts:154 | Test timeout of 30000ms exceeded. | 32.8 s | BOTH |
| e2e/m2-07b-building-incentive-tune.spec.ts | half-damaged sluice repairs for proportional global cost | desktop-chrome | e2e/m2-07b-building-incentive-tune.spec.ts:133 | Error: expect(received).toBeGreaterThan(expected) | 36.7 s | BOTH |
| e2e/m2-07b-building-incentive-tune.spec.ts | half-damaged sluice repairs for proportional global cost | mobile-chrome | e2e/m2-07b-building-incentive-tune.spec.ts:133 | Error: expect(received).toBeGreaterThan(expected) | 33.8 s | BOTH |
| e2e/m3-05b-run-ledger.spec.ts | Claim Office opens a responsive Run Ledger and a profile reset returns its warm empty state | desktop-chrome | e2e/m3-05b-run-ledger.spec.ts:163 | Error: expect(locator).toHaveText(expected) failed | 24.6 s | BOTH |
| e2e/m3-05b-run-ledger.spec.ts | Claim Office opens a responsive Run Ledger and a profile reset returns its warm empty state | mobile-chrome | e2e/m3-05b-run-ledger.spec.ts:163 | Error: expect(locator).toHaveText(expected) failed | 26.8 s | BOTH |
| e2e/m4-06-embodiment.spec.ts | permission-denied bark survives the first idle survey | desktop-chrome | e2e/m4-06-embodiment.spec.ts:447 | Error: expect(received).toBeLessThan(expected) | 30.4 s | BOTH |
| e2e/m4-06-embodiment.spec.ts | permission-denied bark survives the first idle survey | mobile-chrome | e2e/m4-06-embodiment.spec.ts:447 | Error: expect(received).toBeLessThan(expected) | 22.0 s | BOTH |
| e2e/m4-07-prospector-panel.spec.ts | auto-collect consent halts and resumes behavior, with stacked newest-first receipts | desktop-chrome | e2e/m4-07-prospector-panel.spec.ts:113 | Test timeout of 45000ms exceeded. | 90.0 s | BOTH |
| e2e/m4-07-prospector-panel.spec.ts | auto-collect consent halts and resumes behavior, with stacked newest-first receipts | mobile-chrome | e2e/m4-07-prospector-panel.spec.ts:113 | Test timeout of 45000ms exceeded. | 90.0 s | BOTH |
| e2e/m5-04-offline-queue.spec.ts | booting never posts the default local sample order | desktop-chrome | e2e/m5-04-offline-queue.spec.ts:105 | Error: expect(received).toEqual(expected) // deep equality | 30.0 s | BOTH |
| e2e/m5-04-offline-queue.spec.ts | booting never posts the default local sample order | mobile-chrome | e2e/m5-04-offline-queue.spec.ts:105 | Error: expect(received).toEqual(expected) // deep equality | 23.8 s | BOTH |
| e2e/m5-04-offline-queue.spec.ts | posted orders stay visible across reloads and refresh to verdicts on reopen | mobile-chrome | e2e/m5-04-offline-queue.spec.ts:262 | Error: expect(locator).toContainText(expected) failed | 40.2 s | MOBILE-ONLY |
| e2e/map-beauty-dry-gulch.spec.ts | Dry Gulch relief stays inside FULL and LITE render budgets | desktop-chrome | e2e/map-beauty-dry-gulch.spec.ts:75 | Error: expect(received).toBe(expected) // Object.is equality | 50.1 s | BOTH |
| e2e/map-beauty-dry-gulch.spec.ts | Dry Gulch relief stays inside FULL and LITE render budgets | mobile-chrome | e2e/map-beauty-dry-gulch.spec.ts:75 | Error: expect(received).toBe(expected) // Object.is equality | 43.5 s | BOTH |
| e2e/map-census.spec.ts | e1-dry-gulch census | mobile-chrome | e2e/map-census.spec.ts:35 | Test timeout of 20000ms exceeded. | 33.4 s | MOBILE-ONLY |
| e2e/map-census.spec.ts | e2-pressure-garden mobile spot | desktop-chrome | e2e/map-census.spec.ts:43 | Test timeout of 15000ms exceeded. | 16.7 s | BOTH |
| e2e/map-census.spec.ts | e2-pressure-garden mobile spot | mobile-chrome | e2e/map-census.spec.ts:43 | Test timeout of 15000ms exceeded. | 16.6 s | BOTH |
| e2e/map-census.spec.ts | e3-fairground census | mobile-chrome | e2e/map-census.spec.ts:35 | Test timeout of 20000ms exceeded. | 41.4 s | MOBILE-ONLY |
| e2e/map-census.spec.ts | e4-boneyard census | desktop-chrome | e2e/map-census.spec.ts:35 | Test timeout of 20000ms exceeded. | 43.1 s | BOTH |
| e2e/map-census.spec.ts | e4-boneyard census | mobile-chrome | e2e/map-census.spec.ts:35 | Test timeout of 20000ms exceeded. | 41.5 s | BOTH |
| e2e/map-census.spec.ts | e5-deepwater-claim census | desktop-chrome | e2e/map-census.spec.ts:35 | Test timeout of 20000ms exceeded. | 42.1 s | BOTH |
| e2e/map-census.spec.ts | e5-deepwater-claim census | mobile-chrome | e2e/map-census.spec.ts:35 | Test timeout of 20000ms exceeded. | 46.8 s | BOTH |
| e2e/map-census.spec.ts | e5-deepwater-claim mobile spot | desktop-chrome | e2e/map-census.spec.ts:43 | Test timeout of 15000ms exceeded. | 17.8 s | BOTH |
| e2e/map-census.spec.ts | e5-deepwater-claim mobile spot | mobile-chrome | e2e/map-census.spec.ts:43 | Test timeout of 15000ms exceeded. | 20.0 s | BOTH |
| e2e/map-census.spec.ts | e6-glow-mesa census | desktop-chrome | e2e/map-census.spec.ts:35 | Test timeout of 20000ms exceeded. | 37.3 s | DESKTOP-ONLY |
| e2e/map-census.spec.ts | e6-showroom census | mobile-chrome | e2e/map-census.spec.ts:35 | Test timeout of 20000ms exceeded. | 48.4 s | MOBILE-ONLY |
| e2e/map-census.spec.ts | e7-relay-valley census | desktop-chrome | e2e/map-census.spec.ts:35 | Test timeout of 20000ms exceeded. | 47.1 s | BOTH |
| e2e/map-census.spec.ts | e7-relay-valley census | mobile-chrome | e2e/map-census.spec.ts:35 | Test timeout of 20000ms exceeded. | 50.0 s | BOTH |
| e2e/map-census.spec.ts | the-claim mobile spot | desktop-chrome | e2e/map-census.spec.ts:43 | Test timeout of 15000ms exceeded. | 16.6 s | BOTH |
| e2e/map-census.spec.ts | the-claim mobile spot | mobile-chrome | e2e/map-census.spec.ts:43 | Test timeout of 15000ms exceeded. | 17.0 s | BOTH |
| e2e/menu-safe-params.spec.ts | ?town3dPilot=all boots the start menu, not a run | desktop-chrome | e2e/menu-safe-params.spec.ts:9 | Error: expect(locator).toBeVisible() failed | 27.8 s | BOTH |
| e2e/menu-safe-params.spec.ts | ?town3dPilot=all boots the start menu, not a run | mobile-chrome | e2e/menu-safe-params.spec.ts:9 | Error: expect(locator).toBeVisible() failed | 38.2 s | BOTH |
| e2e/meta-presence.spec.ts | combat hit-pause does not open the claim memory ledger | mobile-chrome | e2e/meta-presence.spec.ts:253 | Error: expect(received).toBe(expected) // Object.is equality | 25.5 s | MOBILE-ONLY |
| e2e/meta-presence.spec.ts | earned meta is visible in run recap, pause ledger, and boosted cards | desktop-chrome | e2e/meta-presence.spec.ts:123 | Error: expect(locator).toBeVisible() failed | 23.4 s | DESKTOP-ONLY |
| e2e/mp-02-lockstep.spec.ts | town Ride Together invalid word stays friendly at 390px | mobile-chrome | e2e/mp-02-lockstep.spec.ts:688 | Test timeout of 30000ms exceeded. | 60.0 s | INCOMPLETE |
| e2e/mp-02-lockstep.spec.ts | two clients advance 500 ticks with identical lockstep hashes | desktop-chrome | e2e/mp-02-lockstep.spec.ts:134 | Test timeout of 60000ms exceeded. | 62.0 s | INCOMPLETE |
| e2e/mp-06-party-overview.spec.ts | party roster shows live shared truth and local camera glance | desktop-chrome | e2e/mp-06-party-overview.spec.ts:48 | TimeoutError: page.waitForFunction: Timeout 15000ms exceeded. | 119.1 s | BOTH |
| e2e/mp-06-party-overview.spec.ts | party roster shows live shared truth and local camera glance | mobile-chrome | e2e/mp-06-party-overview.spec.ts:107 | Error: expect(received).toBeLessThanOrEqual(expected) | 93.4 s | BOTH |
| e2e/mp-arsenal.spec.ts | riders fire different weapons under their stats, share credit, and keep equal hashes | desktop-chrome | e2e/mp-arsenal.spec.ts:34 | Test timeout of 90000ms exceeded. | 90.5 s | DESKTOP-ONLY |
| e2e/mp-balance-harness.spec.ts | seeded rider simulations are deterministic and obey balance invariants | desktop-chrome | e2e/mp-balance-harness.spec.ts:54 | Error: expect(received).toEqual(expected) // deep equality | 30.5 s | BOTH |
| e2e/mp-balance-harness.spec.ts | seeded rider simulations are deterministic and obey balance invariants | mobile-chrome | e2e/mp-balance-harness.spec.ts:54 | Error: expect(received).toEqual(expected) // deep equality | 29.5 s | BOTH |
| e2e/mp-balance-harness.spec.ts | the browser channel requires both debug and mpbalance query gates | mobile-chrome | e2e/mp-balance-harness.spec.ts:135 | Error: expect(received).toEqual(expected) // deep equality | 45.3 s | MOBILE-ONLY |
| e2e/mp-reconnect.spec.ts | a disconnected rider rejoins its held slot at the exact snapshot tick and keeps identical world hashes | desktop-chrome | e2e/mp-reconnect.spec.ts:32 | Test timeout of 75000ms exceeded. | 75.7 s | INCOMPLETE |
| e2e/mu-02-music.spec.ts | title music waits for a gesture and music volume persists | desktop-chrome | e2e/mu-02-music.spec.ts:20 | Test timeout of 30000ms exceeded. | 60.0 s | DESKTOP-ONLY |
| e2e/never-trap.spec.ts | Night Shift enemies always make goal progress around object footprints | desktop-chrome | e2e/never-trap.spec.ts:88 | Test timeout of 30000ms exceeded. | 43.9 s | BOTH |
| e2e/never-trap.spec.ts | Night Shift enemies always make goal progress around object footprints | mobile-chrome | e2e/never-trap.spec.ts:88 | Test timeout of 30000ms exceeded. | 44.4 s | BOTH |
| e2e/night-light-doctrine.spec.ts | honest night lights reveal only carried lamps, watch paint, consent, and shots | mobile-chrome | e2e/night-light-doctrine.spec.ts:16 | Test timeout of 60000ms exceeded. | 117.7 s | MOBILE-ONLY |
| e2e/night3d-perf.spec.ts | daylight matrix and Night Shift pressure stay within the painted 115% p95 gate | desktop-chrome | e2e/night3d-perf.spec.ts:89 | Error: expect(received).toBeLessThanOrEqual(expected) | 76.6 s | BOTH |
| e2e/night3d-perf.spec.ts | daylight matrix and Night Shift pressure stay within the painted 115% p95 gate | mobile-chrome | e2e/night3d-perf.spec.ts:88 | Error: expect(received).toBeLessThanOrEqual(expected) | 73.4 s | BOTH |
| e2e/night3d-perf.spec.ts | Night Shift keeps its lantern read and auto-tiers one sticky step at a time | desktop-chrome | e2e/night3d-perf.spec.ts:98 | Test timeout of 90000ms exceeded. | 148.3 s | BOTH |
| e2e/night3d-perf.spec.ts | Night Shift keeps its lantern read and auto-tiers one sticky step at a time | mobile-chrome | e2e/night3d-perf.spec.ts:98 | Test timeout of 90000ms exceeded. | 146.1 s | BOTH |
| e2e/panorama-framing.spec.ts | e1-night-shift keeps its panorama in world framing across the wide aspect matrix | desktop-chrome | e2e/panorama-framing.spec.ts:18 | Test timeout of 120000ms exceeded. | 179.7 s | BOTH |
| e2e/panorama-framing.spec.ts | e1-night-shift keeps its panorama in world framing across the wide aspect matrix | mobile-chrome | e2e/panorama-framing.spec.ts:81 | Error: expect(locator).toHaveAttribute(expected) failed | 41.0 s | BOTH |
| e2e/panorama-framing.spec.ts | e4-gusher-county keeps its panorama in world framing across the wide aspect matrix | desktop-chrome | e2e/panorama-framing.spec.ts:81 | Error: expect(locator).toHaveAttribute(expected) failed | 42.9 s | BOTH |
| e2e/panorama-framing.spec.ts | e4-gusher-county keeps its panorama in world framing across the wide aspect matrix | mobile-chrome | e2e/panorama-framing.spec.ts:81 | Error: expect(locator).toHaveAttribute(expected) failed | 78.3 s | BOTH |
| e2e/panorama-framing.spec.ts | legacy painted ground stays hidden while sculpt landmarks remain mounted | mobile-chrome | e2e/panorama-framing.spec.ts:35 | Test timeout of 60000ms exceeded. | 116.2 s | MOBILE-ONLY |
| e2e/panorama-framing.spec.ts | write the three 2000x1000 run-camera proof shots | desktop-chrome | e2e/panorama-framing.spec.ts:67 | Test timeout of 90000ms exceeded. | 151.4 s | INCOMPLETE |
| e2e/pb02-replay-actor.spec.ts | PB-02 replay actor › event parity — a second actor reproduces the recorded session | desktop-chrome | e2e/pb02-replay-actor.spec.ts:119 | Error: expect(received).toBe(expected) // Object.is equality | 49.2 s | BOTH |
| e2e/pb02-replay-actor.spec.ts | PB-02 replay actor › event parity — a second actor reproduces the recorded session | mobile-chrome | e2e/pb02-replay-actor.spec.ts:119 | Error: expect(received).toBe(expected) // Object.is equality | 39.5 s | BOTH |
| e2e/perf-02-fullbase-bench.spec.ts | full-base benchmark stays inside draw-call and frame envelopes | desktop-chrome | e2e/perf-02-fullbase-bench.spec.ts:47 | Error: expect(received).toBeNull() | 24.8 s | BOTH |
| e2e/perf-02-fullbase-bench.spec.ts | full-base benchmark stays inside draw-call and frame envelopes | mobile-chrome | e2e/perf-02-fullbase-bench.spec.ts:47 | Error: expect(received).toBeNull() | 31.3 s | BOTH |
| e2e/perf-05-startup.spec.ts | startup reaches playable quickly and defers non-critical textures | desktop-chrome | e2e/perf-05-startup.spec.ts:231 | Error: expect(received).toBeLessThan(expected) | 29.8 s | BOTH |
| e2e/perf-05-startup.spec.ts | startup reaches playable quickly and defers non-critical textures | mobile-chrome | e2e/perf-05-startup.spec.ts:231 | Error: expect(received).toBeLessThan(expected) | 21.3 s | BOTH |
| e2e/polish-02-rivalry-stats.spec.ts | profile-scoped v1 scores migrate to v2 as legacy records for the selected profile | mobile-chrome | e2e/polish-02-rivalry-stats.spec.ts:200 | Error: expect(received).toEqual(expected) // deep equality | 18.2 s | MOBILE-ONLY |
| e2e/polish-03-mobile-hud.spec.ts | mobile HUD controls fit, tap, and avoid overlap at 390px and 430px | mobile-chrome | e2e/polish-03-mobile-hud.spec.ts:197 | Test timeout of 45000ms exceeded. | 90.0 s | INCOMPLETE |
| e2e/press-edit-visibility.spec.ts | raise and pond edits render live, then survive the stamped launch | desktop-chrome | e2e/press-edit-visibility.spec.ts:75 | Error: expect(locator).toHaveText(expected) failed | 36.2 s | BOTH |
| e2e/press-edit-visibility.spec.ts | raise and pond edits render live, then survive the stamped launch | mobile-chrome | e2e/press-edit-visibility.spec.ts:75 | Error: expect(locator).toHaveText(expected) failed | 36.6 s | BOTH |
| e2e/research-chart.spec.ts | survey chart renders node states, traces locked requirements, and persists one pin | desktop-chrome | e2e/research-chart.spec.ts:130 | Test timeout of 30000ms exceeded. | 60.0 s | BOTH |
| e2e/research-chart.spec.ts | survey chart renders node states, traces locked requirements, and persists one pin | mobile-chrome | e2e/research-chart.spec.ts:130 | Test timeout of 30000ms exceeded. | 60.0 s | BOTH |
| e2e/restore-validation.spec.ts | page-load restore materializes run-manager state after manager assignment | desktop-chrome | e2e/restore-validation.spec.ts:32 | Error: expect(received).toEqual(expected) // deep equality | 30.4 s | DESKTOP-ONLY |
| e2e/run-gait-stride.spec.ts | run gait advances by distance and preserves the Baron cadence | desktop-chrome | e2e/run-gait-stride.spec.ts:88 | Test timeout of 60000ms exceeded. | 120.0 s | BOTH |
| e2e/run-gait-stride.spec.ts | run gait advances by distance and preserves the Baron cadence | mobile-chrome | e2e/run-gait-stride.spec.ts:102 | Error: expect(received).toBeLessThan(expected) | 42.4 s | BOTH |
| e2e/run-scene-animation-refresh.spec.ts | run boots on the approved female Hero walk8 and advances frames | desktop-chrome | e2e/run-scene-animation-refresh.spec.ts:5 | Test timeout of 30000ms exceeded. | 60.0 s | BOTH |
| e2e/run-scene-animation-refresh.spec.ts | run boots on the approved female Hero walk8 and advances frames | mobile-chrome | e2e/run-scene-animation-refresh.spec.ts:5 | Test timeout of 30000ms exceeded. | 60.0 s | BOTH |
| e2e/run-suspend.spec.ts | ended runs clear suspend and town board launch confirms abandoning a saved claim | desktop-chrome | e2e/run-suspend.spec.ts:351 | Test timeout of 30000ms exceeded. | 60.0 s | BOTH |
| e2e/run-suspend.spec.ts | ended runs clear suspend and town board launch confirms abandoning a saved claim | mobile-chrome | e2e/run-suspend.spec.ts:351 | Test timeout of 30000ms exceeded. | 53.6 s | BOTH |
| e2e/run-suspend.spec.ts | legacy no-controls restore at Territory I keeps the removed ring and its hints absent | mobile-chrome | e2e/run-suspend.spec.ts:316 | Error: expect(received).toMatchObject(expected) | 22.6 s | MOBILE-ONLY |
| e2e/run3d-boiler-house.spec.ts | all loads once, mirrors Boiler Houses, and unmounts on demolish | desktop-chrome | e2e/run3d-boiler-house.spec.ts:24 | Error: expect(received).resolves.toBe(expected) // Object.is equality | 25.0 s | BOTH |
| e2e/run3d-boiler-house.spec.ts | all loads once, mirrors Boiler Houses, and unmounts on demolish | mobile-chrome | e2e/run3d-boiler-house.spec.ts:24 | Error: expect(received).resolves.toBe(expected) // Object.is equality | 20.0 s | BOTH |
| e2e/run3d-boiler-house.spec.ts | lite and invalid bytes retain the Boiler House sprite fallback | desktop-chrome | e2e/run3d-boiler-house.spec.ts:82 | Error: expect(received).resolves.toBe(expected) // Object.is equality | 12.5 s | BOTH |
| e2e/run3d-boiler-house.spec.ts | lite and invalid bytes retain the Boiler House sprite fallback | mobile-chrome | e2e/run3d-boiler-house.spec.ts:82 | Error: expect(received).resolves.toBe(expected) // Object.is equality | 15.2 s | BOTH |
| e2e/run3d-boiler-house.spec.ts | LITE keeps the Boiler House sprite shell and requests no GLB | desktop-chrome | e2e/run3d-boiler-house.spec.ts:49 | Error: expect(received).resolves.toBe(expected) // Object.is equality | 17.9 s | BOTH |
| e2e/run3d-boiler-house.spec.ts | LITE keeps the Boiler House sprite shell and requests no GLB | mobile-chrome | e2e/run3d-boiler-house.spec.ts:49 | Error: expect(received).resolves.toBe(expected) // Object.is equality | 12.5 s | BOTH |
| e2e/run3d-boiler-house.spec.ts | maximum legal Boiler Houses stay within the 115% frame budget | desktop-chrome | e2e/run3d-boiler-house.spec.ts:24 | Error: expect(received).resolves.toBe(expected) // Object.is equality | 13.9 s | BOTH |
| e2e/run3d-boiler-house.spec.ts | maximum legal Boiler Houses stay within the 115% frame budget | mobile-chrome | e2e/run3d-boiler-house.spec.ts:24 | Error: expect(received).resolves.toBe(expected) // Object.is equality | 19.0 s | BOTH |
| e2e/run3d-gold-seam.spec.ts | flag-off boot keeps gold sprites and requests no GLB | desktop-chrome | e2e/run3d-gold-seam.spec.ts:53 | Test timeout of 30000ms exceeded. | 59.9 s | DESKTOP-ONLY |
| e2e/run3d-gold-seam.spec.ts | pilot loads once, mirrors live seams, and unmounts one depleted seam | desktop-chrome | e2e/run3d-gold-seam.spec.ts:69 | Test timeout of 30000ms exceeded. | 60.0 s | DESKTOP-ONLY |
| e2e/run3d-palisade.spec.ts | 12-instance pilot p95 stays within the 115% frame budget | desktop-chrome | e2e/run3d-palisade.spec.ts:104 | Error: expect(received).toBeLessThanOrEqual(expected) | 52.3 s | DESKTOP-ONLY |
| e2e/run3d-rail-elements.spec.ts | flag-off boot keeps procedural rails and requests no rail-element GLB | desktop-chrome | e2e/run3d-rail-elements.spec.ts:47 | Test timeout of 30000ms exceeded. | 60.0 s | DESKTOP-ONLY |
| e2e/run3d-stockpile.spec.ts | maximum legal stockpiles stay within the 115% frame budget | desktop-chrome | e2e/run3d-stockpile.spec.ts:106 | Error: expect(received).toBeLessThanOrEqual(expected) | 43.1 s | DESKTOP-ONLY |
| e2e/save-slots.spec.ts | manual save creates a curated slot, preserves auto, and loads through the suspend restore path | desktop-chrome | e2e/save-slots.spec.ts:76 | TimeoutError: page.waitForFunction: Timeout 12000ms exceeded. | 52.1 s | BOTH |
| e2e/save-slots.spec.ts | manual save creates a curated slot, preserves auto, and loads through the suspend restore path | mobile-chrome | e2e/save-slots.spec.ts:76 | TimeoutError: page.waitForFunction: Timeout 12000ms exceeded. | 48.5 s | BOTH |
| e2e/scene-swap-camera.spec.ts | town-run-town keeps camera truth at 1440x900 | mobile-chrome | e2e/scene-swap-camera.spec.ts:11 | Test timeout of 60000ms exceeded. | 109.2 s | MOBILE-ONLY |
| e2e/second-rider.spec.ts | the imported companion joins through town, moves, fights, and survives | desktop-chrome | e2e/second-rider.spec.ts:96 | TimeoutError: page.waitForFunction: Timeout 20000ms exceeded. | 96.7 s | BOTH |
| e2e/second-rider.spec.ts | the imported companion joins through town, moves, fights, and survives | mobile-chrome | e2e/second-rider.spec.ts:96 | TimeoutError: page.waitForFunction: Timeout 20000ms exceeded. | 102.0 s | BOTH |
| e2e/sim-fixed-step.spec.ts | 30/60/144 fps render schedules produce the same 300-tick simulation | desktop-chrome | e2e/sim-fixed-step.spec.ts:38 | Test timeout of 120000ms exceeded. | 125.0 s | INCOMPLETE |
| e2e/sim-fixed-step.spec.ts | fixed ticks carry fractional cooldown debt instead of losing volleys | desktop-chrome | e2e/sim-fixed-step.spec.ts:232 | Test timeout of 30000ms exceeded. | 47.3 s | INCOMPLETE |
| e2e/soak-30.spec.ts | scripted auto-play reaches wave 30 inside perf and pool envelopes | desktop-chrome | e2e/soak-30.spec.ts:289 | Error: Missing soak sample for wave 5 | 36.1 s | INCOMPLETE |
| e2e/ss-01-beats.spec.ts | founding, first contract, and Prospector XP beats fire once with portraits | desktop-chrome | e2e/ss-01-beats.spec.ts:88 | Error: expect(locator).toHaveAttribute(expected) failed | 96.6 s | BOTH |
| e2e/ss-01-beats.spec.ts | founding, first contract, and Prospector XP beats fire once with portraits | mobile-chrome | e2e/ss-01-beats.spec.ts:88 | Error: expect(locator).toHaveAttribute(expected) failed | 89.8 s | BOTH |
| e2e/ss-01-beats.spec.ts | story card waits until wave banner clears when both fire same tick | desktop-chrome | e2e/ss-01-beats.spec.ts:88 | Error: expect(locator).toHaveAttribute(expected) failed | 47.6 s | BOTH |
| e2e/ss-01-beats.spec.ts | story card waits until wave banner clears when both fire same tick | mobile-chrome | e2e/ss-01-beats.spec.ts:88 | Error: expect(locator).toHaveAttribute(expected) failed | 34.5 s | BOTH |
| e2e/ss-02-beats.spec.ts | once beats are marked only when displayed and queued beats survive reload | desktop-chrome | e2e/ss-02-beats.spec.ts:200 | Test timeout of 30000ms exceeded. | 48.6 s | BOTH |
| e2e/ss-02-beats.spec.ts | once beats are marked only when displayed and queued beats survive reload | mobile-chrome | e2e/ss-02-beats.spec.ts:217 | Error: expect(received).toEqual(expected) // deep equality | 29.9 s | BOTH |
| e2e/ss-03-beats.spec.ts | SS-03 table uses registered speakers and once-per-profile authored beats | desktop-chrome | e2e/ss-03-beats.spec.ts:53 | Error: expect(received).toEqual(expected) // deep equality | 5 ms | BOTH |
| e2e/ss-03-beats.spec.ts | SS-03 table uses registered speakers and once-per-profile authored beats | mobile-chrome | e2e/ss-03-beats.spec.ts:53 | Error: expect(received).toEqual(expected) // deep equality | 3 ms | BOTH |
| e2e/story-loop.spec.ts | fresh-profile first boot returns to town after the first ending | desktop-chrome | e2e/story-loop.spec.ts:190 | Error: expect(locator).toBeVisible() failed | 106.1 s | BOTH |
| e2e/story-loop.spec.ts | fresh-profile first boot returns to town after the first ending | mobile-chrome | e2e/story-loop.spec.ts:190 | Error: expect(locator).toBeVisible() failed | 104.3 s | BOTH |
| e2e/tailor-wagon.spec.ts | the tailor's wagon owns the profile wardrobe and Settings has no picker | desktop-chrome | e2e/tailor-wagon.spec.ts:124 | Error: Test timeout of 30000ms exceeded | 59.8 s | DESKTOP-ONLY |
| e2e/task-024-blast-aim-presets.spec.ts | difficulty presets apply the hard-mode bundle and persist by profile key | desktop-chrome | e2e/task-024-blast-aim-presets.spec.ts:88 | Test timeout of 30000ms exceeded. | 31.8 s | BOTH |
| e2e/task-024-blast-aim-presets.spec.ts | difficulty presets apply the hard-mode bundle and persist by profile key | mobile-chrome | e2e/task-024-blast-aim-presets.spec.ts:88 | Test timeout of 30000ms exceeded. | 34.5 s | BOTH |
| e2e/task-031-anim-roundness.spec.ts | default frame blending and gait motion are active for hero and bandits | desktop-chrome | e2e/task-031-anim-roundness.spec.ts:202 | Error: expect(received).toBe(expected) // Object.is equality | 36.0 s | BOTH |
| e2e/task-031-anim-roundness.spec.ts | default frame blending and gait motion are active for hero and bandits | mobile-chrome | e2e/task-031-anim-roundness.spec.ts:202 | Error: expect(received).toBe(expected) // Object.is equality | 34.3 s | BOTH |
| e2e/task-031-anim-roundness.spec.ts | zeroed animation knobs preserve hard frameKey cycling | desktop-chrome | e2e/task-031-anim-roundness.spec.ts:242 | Error: expect(received).toBe(expected) // Object.is equality | 34.3 s | BOTH |
| e2e/task-031-anim-roundness.spec.ts | zeroed animation knobs preserve hard frameKey cycling | mobile-chrome | e2e/task-031-anim-roundness.spec.ts:242 | Error: expect(received).toBe(expected) // Object.is equality | 29.6 s | BOTH |
| e2e/task-037-assay-bench-ungate.spec.ts | debug play builds the Assay Office and posts an order at the bench | desktop-chrome | e2e/task-037-assay-bench-ungate.spec.ts:62 | Error: expect(received).toBe(expected) // Object.is equality | 51.7 s | INCOMPLETE |
| e2e/task-037-assay-bench-ungate.spec.ts | mobile touch confirm opens and closes the bench without HUD overlap | mobile-chrome | e2e/task-037-assay-bench-ungate.spec.ts:211 | Error: expect(received).toBe(expected) // Object.is equality | 23.8 s | INCOMPLETE |
| e2e/task-042-anim-smoothness.spec.ts | walk cadence is speed-scaled and restart keeps phase | desktop-chrome | e2e/task-042-anim-smoothness.spec.ts:54 | Test timeout of 30000ms exceeded. | 60.0 s | BOTH |
| e2e/task-042-anim-smoothness.spec.ts | walk cadence is speed-scaled and restart keeps phase | mobile-chrome | e2e/task-042-anim-smoothness.spec.ts:54 | Test timeout of 30000ms exceeded. | 60.1 s | BOTH |
| e2e/task-046-territory-ring-pacing.spec.ts | T1 banks the old ring as a run-scoped palisade kit and spends it before gold | desktop-chrome | e2e/task-046-territory-ring-pacing.spec.ts:76 | Test timeout of 45000ms exceeded. | 90.0 s | DESKTOP-ONLY |
| e2e/task-048-funnel-formation-spread.spec.ts | formation offsets are deterministic for the m6 seed | desktop-chrome | e2e/task-048-funnel-formation-spread.spec.ts:158 | Test timeout of 30000ms exceeded. | 31.1 s | INCOMPLETE |
| e2e/task-053-weapon-cycling-audit.spec.ts | task-053 seeded weapon cycling DPS probe | desktop-chrome | e2e/task-053-weapon-cycling-audit.spec.ts:50 | Test timeout of 120000ms exceeded. | 134.3 s | INCOMPLETE |
| e2e/terrain-seamless.spec.ts | all shipped terrain de-tiles deterministically within FULL and LITE budgets | desktop-chrome | e2e/terrain-seamless.spec.ts:147 | Error: expect(received).toBeLessThan(expected) | 302.0 s | BOTH |
| e2e/terrain-seamless.spec.ts | all shipped terrain de-tiles deterministically within FULL and LITE budgets | mobile-chrome | e2e/terrain-seamless.spec.ts:121 | Test timeout of 300000ms exceeded. | 346.9 s | BOTH |
| e2e/terrain-seed-cache.spec.ts | terrain height samples derive the URL seed once | desktop-chrome | e2e/terrain-seed-cache.spec.ts:47 | Error: expect(received).toEqual(expected) // deep equality | 29.8 s | DESKTOP-ONLY |
| e2e/terrain3d-claim-pilot.spec.ts | contract-valid GLB feeds every visualY consumer and keeps the water agreement | desktop-chrome | e2e/terrain3d-claim-pilot.spec.ts:76 | Test timeout of 60000ms exceeded. | 119.3 s | BOTH |
| e2e/terrain3d-claim-pilot.spec.ts | contract-valid GLB feeds every visualY consumer and keeps the water agreement | mobile-chrome | e2e/terrain3d-claim-pilot.spec.ts:76 | Test timeout of 60000ms exceeded. | 120.0 s | BOTH |
| e2e/terrain3d-default.spec.ts | promoted terrain stays inside the 115% p95 budget | desktop-chrome | e2e/terrain3d-default.spec.ts:145 | Test timeout of 180000ms exceeded. | 245.4 s | BOTH |
| e2e/terrain3d-default.spec.ts | promoted terrain stays inside the 115% p95 budget | mobile-chrome | e2e/terrain3d-default.spec.ts:160 | Error: expect(received).toBeLessThanOrEqual(expected) | 51.1 s | BOTH |
| e2e/terrain3d-registry.spec.ts | all campaign extras resolve their registered terrain and panorama assets | desktop-chrome | e2e/terrain3d-registry.spec.ts:88 | Test timeout of 180000ms exceeded. | 248.2 s | DESKTOP-ONLY |
| e2e/terrain3d-registry.spec.ts | all fifteen contracts stay painted in LITE and on invalid terrain bytes | desktop-chrome | e2e/terrain3d-registry.spec.ts:362 | Error: expect(locator).toHaveAttribute(expected) failed | 27.0 s | BOTH |
| e2e/terrain3d-registry.spec.ts | all fifteen contracts stay painted in LITE and on invalid terrain bytes | mobile-chrome | e2e/terrain3d-registry.spec.ts:362 | Error: expect(locator).toHaveAttribute(expected) failed | 31.4 s | BOTH |
| e2e/terrain3d-registry.spec.ts | all sixteen contracts mount terrain, panorama, and grounded render-only landmarks with matching water | desktop-chrome | e2e/terrain3d-registry.spec.ts:221 | Error: expect(received).toHaveLength(expected) | 51.2 s | BOTH |
| e2e/terrain3d-registry.spec.ts | all sixteen contracts mount terrain, panorama, and grounded render-only landmarks with matching water | mobile-chrome | e2e/terrain3d-registry.spec.ts:217 | Error: expect(received).toBe(expected) // Object.is equality | 58.4 s | BOTH |
| e2e/terrain3d-registry.spec.ts | each registered terrain and panorama stays inside the 115% p95 budget | desktop-chrome | e2e/terrain3d-registry.spec.ts:447 | Test timeout of 180000ms exceeded. | 272.7 s | BOTH |
| e2e/terrain3d-registry.spec.ts | each registered terrain and panorama stays inside the 115% p95 budget | mobile-chrome | e2e/terrain3d-registry.spec.ts:447 | Test timeout of 180000ms exceeded. | 227.2 s | BOTH |
| e2e/terrain3d-registry.spec.ts | four campaign era bands mount with zero console errors | desktop-chrome | e2e/terrain3d-registry.spec.ts:124 | Test timeout of 30000ms exceeded. | 60.0 s | INCOMPLETE |
| e2e/terrain3d-registry.spec.ts | rim and horizon probes keep the terrain meeting gradual and every panorama readable | desktop-chrome | e2e/terrain3d-registry.spec.ts:303 | Error: expect(received).toBeGreaterThan(expected) | 68.8 s | BOTH |
| e2e/terrain3d-registry.spec.ts | rim and horizon probes keep the terrain meeting gradual and every panorama readable | mobile-chrome | e2e/terrain3d-registry.spec.ts:272 | Test timeout of 120000ms exceeded. | 176.7 s | BOTH |
| e2e/terrain3d-registry.spec.ts | terrain2d and the 3D default keep bounds, spawns, fog, masks, and simulation byte-identical per map | desktop-chrome | e2e/terrain3d-registry.spec.ts:328 | Test timeout of 180000ms exceeded. | 181.5 s | BOTH |
| e2e/terrain3d-registry.spec.ts | terrain2d and the 3D default keep bounds, spawns, fog, masks, and simulation byte-identical per map | mobile-chrome | e2e/terrain3d-registry.spec.ts:328 | Test timeout of 180000ms exceeded. | 181.8 s | BOTH |
| e2e/tile-identity-pass.spec.ts | E1 contracts load place descriptors, render identity shots, and stay deterministic | desktop-chrome | e2e/tile-identity-pass.spec.ts:131 | Error: expect(received).toBe(expected) // Object.is equality | 31.3 s | BOTH |
| e2e/tile-identity-pass.spec.ts | E1 contracts load place descriptors, render identity shots, and stay deterministic | mobile-chrome | e2e/tile-identity-pass.spec.ts:131 | Error: expect(received).toBe(expected) // Object.is equality | 24.6 s | BOTH |
| e2e/tl-01-run-telemetry.spec.ts | plain no-debug secure return keeps telemetry invisible to gameplay | desktop-chrome | e2e/tl-01-run-telemetry.spec.ts:236 | Error: expect(locator).toBeVisible() failed | 58.7 s | BOTH |
| e2e/tl-01-run-telemetry.spec.ts | plain no-debug secure return keeps telemetry invisible to gameplay | mobile-chrome | e2e/tl-01-run-telemetry.spec.ts:236 | Error: expect(locator).toBeVisible() failed | 54.9 s | BOTH |
| e2e/tl-03-assay-office-site.spec.ts | renders populated Assay Office aggregates | desktop-chrome | e2e/tl-03-assay-office-site.spec.ts:44 | Error: expect(locator).toHaveText(expected) failed | 7.0 s | BOTH |
| e2e/tl-03-assay-office-site.spec.ts | renders populated Assay Office aggregates | mobile-chrome | e2e/tl-03-assay-office-site.spec.ts:44 | Error: expect(locator).toHaveText(expected) failed | 7.3 s | BOTH |
| e2e/town-assay-office-blender.spec.ts | Assay Office pilot is lazy, contract-valid, visual-only, and stays inside the frame-time gate | desktop-chrome | e2e/town-assay-office-blender.spec.ts:180 | Error: p95 regression: {"calls":-17,"webglCallsPerFrame":-17.11,"trianglesPerFrame":6472,"p95Percent":38.33,"p95Ratio":1.3833} | 67.4 s | DESKTOP-ONLY |
| e2e/town-chapel-blender.spec.ts | Chapel pilot is lazy, contract-valid, visual-only, and stays inside the frame-time gate | desktop-chrome | e2e/town-chapel-blender.spec.ts:184 | Error: p95 regression: {"calls":-14,"webglCallsPerFrame":-14.12,"trianglesPerFrame":6676,"p95Percent":78.99,"p95Ratio":1.7899} | 48.1 s | BOTH |
| e2e/town-chapel-blender.spec.ts | Chapel pilot is lazy, contract-valid, visual-only, and stays inside the frame-time gate | mobile-chrome | e2e/town-chapel-blender.spec.ts:184 | Error: p95 regression: {"calls":-12,"webglCallsPerFrame":-12.18,"trianglesPerFrame":6700,"p95Percent":64.08,"p95Ratio":1.6408} | 58.4 s | BOTH |
| e2e/town-claim-office-blender.spec.ts | Claim Office pilot is lazy, contract-valid, visual-only, and stays inside the frame-time gate | desktop-chrome | e2e/town-claim-office-blender.spec.ts:184 | Error: p95 regression: {"calls":-17,"webglCallsPerFrame":-17.17,"trianglesPerFrame":4632,"p95Percent":62.45,"p95Ratio":1.6245} | 58.0 s | DESKTOP-ONLY |
| e2e/town-dynamo-hall-blender.spec.ts | complete Dynamo Hall loads one bounded painted mesh without changing its interaction | desktop-chrome | e2e/town-dynamo-hall-blender.spec.ts:110 | Error: expect(received).toBeLessThanOrEqual(expected) | 54.0 s | BOTH |
| e2e/town-dynamo-hall-blender.spec.ts | complete Dynamo Hall loads one bounded painted mesh without changing its interaction | mobile-chrome | e2e/town-dynamo-hall-blender.spec.ts:110 | Error: expect(received).toBeLessThanOrEqual(expected) | 66.0 s | BOTH |
| e2e/town-dynamo-hall-blender.spec.ts | owner eye shows the complete Dynamo Hall with every registered 3D building | desktop-chrome | e2e/town-dynamo-hall-blender.spec.ts:140 | Test timeout of 30000ms exceeded. | 60.0 s | BOTH |
| e2e/town-dynamo-hall-blender.spec.ts | owner eye shows the complete Dynamo Hall with every registered 3D building | mobile-chrome | e2e/town-dynamo-hall-blender.spec.ts:140 | Test timeout of 30000ms exceeded. | 60.0 s | BOTH |
| e2e/town-era-switch.spec.ts | E1 mounts base only; E2 mounts its variant, shared anchor plumes, and era accent | mobile-chrome | e2e/town-era-switch.spec.ts:146 | Error: expect(received).toBeLessThanOrEqual(expected) | 26.3 s | MOBILE-ONLY |
| e2e/town-general-store-blender.spec.ts | General Store pilot is lazy, contract-valid, visual-only, and stays inside the frame-time gate | desktop-chrome | e2e/town-general-store-blender.spec.ts:186 | Error: p95 regression: {"calls":-17,"webglCallsPerFrame":-17.13,"trianglesPerFrame":4648,"p95Percent":33.09,"p95Ratio":1.3309} | 60.3 s | BOTH |
| e2e/town-general-store-blender.spec.ts | General Store pilot is lazy, contract-valid, visual-only, and stays inside the frame-time gate | mobile-chrome | e2e/town-general-store-blender.spec.ts:186 | Error: p95 regression: {"calls":-17,"webglCallsPerFrame":-17.25,"trianglesPerFrame":4648,"p95Percent":56.56,"p95Ratio":1.5656} | 63.0 s | BOTH |
| e2e/town-plate-blender.spec.ts | Town plate is lazy, contract-valid, keeps actors planar, and mounts in the owner all-view | mobile-chrome | e2e/town-plate-blender.spec.ts:83 | Error: expect(received).toBeLessThanOrEqual(expected) | 51.2 s | MOBILE-ONLY |
| e2e/town-plaza-props-blender.spec.ts | plaza props stay lazy by default and mount every layout instance with one fetch per family | desktop-chrome | e2e/town-plaza-props-blender.spec.ts:57 | Error: expect(received).toBeLessThanOrEqual(expected) | 46.5 s | BOTH |
| e2e/town-plaza-props-blender.spec.ts | plaza props stay lazy by default and mount every layout instance with one fetch per family | mobile-chrome | e2e/town-plaza-props-blender.spec.ts:57 | Error: expect(received).toBeLessThanOrEqual(expected) | 34.4 s | BOTH |
| e2e/town-schoolhouse-blender.spec.ts | Schoolhouse pilot is lazy, contract-valid, visual-only, and stays inside the frame-time gate | mobile-chrome | e2e/town-schoolhouse-blender.spec.ts:184 | Error: p95 regression: {"calls":-6,"webglCallsPerFrame":-6.21,"trianglesPerFrame":5426,"p95Percent":89.47,"p95Ratio":1.8947} | 55.7 s | MOBILE-ONLY |
| e2e/town-stamp-mill-blender.spec.ts | Stamp Mill pilot is lazy, contract-valid, visual-only, and stays inside the frame-time gate | mobile-chrome | e2e/town-stamp-mill-blender.spec.ts:201 | Error: p95 regression: {"calls":-3,"webglCallsPerFrame":-3.2,"trianglesPerFrame":2772,"p95Percent":15.11,"p95Ratio":1.1511} | 55.0 s | MOBILE-ONLY |
| e2e/town-t1-square.spec.ts | menu enters town square, prompts at four shells, exits, then starts normal run | desktop-chrome | e2e/town-t1-square.spec.ts:66 | Error: expect(locator).toContainText(expected) failed | 53.5 s | BOTH |
| e2e/town-t1-square.spec.ts | menu enters town square, prompts at four shells, exits, then starts normal run | mobile-chrome | e2e/town-t1-square.spec.ts:74 | Test timeout of 30000ms exceeded. | 60.0 s | BOTH |
| e2e/town-t2-naming.spec.ts | founding input is usable at 390px | desktop-chrome | e2e/town-t2-naming.spec.ts:182 | Error: expect(received).toBe(expected) // Object.is equality | 31.4 s | BOTH |
| e2e/town-t2-naming.spec.ts | founding input is usable at 390px | mobile-chrome | e2e/town-t2-naming.spec.ts:182 | Error: expect(received).toBe(expected) // Object.is equality | 35.5 s | BOTH |
| e2e/town-t2-naming.spec.ts | fresh town naming persists, renames, and appears in recap and run ledger | desktop-chrome | e2e/town-t2-naming.spec.ts:83 | Test timeout of 30000ms exceeded. | 60.0 s | BOTH |
| e2e/town-t2-naming.spec.ts | fresh town naming persists, renames, and appears in recap and run ledger | mobile-chrome | e2e/town-t2-naming.spec.ts:83 | Test timeout of 30000ms exceeded. | 60.0 s | BOTH |
| e2e/town-t3-board.spec.ts | board launch loads Dry Gulch and New Claim hashes to the default contract config | desktop-chrome | e2e/town-t3-board.spec.ts:222 | Test timeout of 30000ms exceeded. | 60.0 s | BOTH |
| e2e/town-t3-board.spec.ts | board launch loads Dry Gulch and New Claim hashes to the default contract config | mobile-chrome | e2e/town-t3-board.spec.ts:222 | Test timeout of 30000ms exceeded. | 60.0 s | BOTH |
| e2e/town-t3-board.spec.ts | contract board renders manifest rows, locks, conditions, and per-contract bests | desktop-chrome | e2e/town-t3-board.spec.ts:156 | Test timeout of 60000ms exceeded. | 120.0 s | BOTH |
| e2e/town-t3-board.spec.ts | contract board renders manifest rows, locks, conditions, and per-contract bests | mobile-chrome | e2e/town-t3-board.spec.ts:156 | Test timeout of 60000ms exceeded. | 120.0 s | BOTH |
| e2e/town-t3-board.spec.ts | contract board swipes and keeps tap targets usable at 390px | mobile-chrome | e2e/town-t3-board.spec.ts:326 | Test timeout of 30000ms exceeded. | 60.0 s | MOBILE-ONLY |
| e2e/town-t3-board.spec.ts | post-run overrun returns straight to the town board and records a contract result | mobile-chrome | e2e/town-t3-board.spec.ts:246 | Test timeout of 30000ms exceeded. | 60.0 s | MOBILE-ONLY |
| e2e/town-t4-growth.spec.ts | fresh and seeded territory tiers render only earned town buildings | mobile-chrome | e2e/town-t4-growth.spec.ts:146 | Test timeout of 30000ms exceeded. | 55.4 s | MOBILE-ONLY |
| e2e/town-t4-growth.spec.ts | growth beats fire once per profile | desktop-chrome | e2e/town-t4-growth.spec.ts:123 | Error: expect(locator).toHaveAttribute(expected) failed | 31.2 s | BOTH |
| e2e/town-t4-growth.spec.ts | growth beats fire once per profile | mobile-chrome | e2e/town-t4-growth.spec.ts:123 | Error: expect(locator).toHaveAttribute(expected) failed | 41.6 s | BOTH |
| e2e/town-t4-growth.spec.ts | Stamp Mill town vignette mirrors megaproject stage state | mobile-chrome | e2e/town-t4-growth.spec.ts:183 | Test timeout of 30000ms exceeded. | 60.0 s | MOBILE-ONLY |
| e2e/town-t5-townsfolk.spec.ts | approach barks identify sampled speakers and the Prospector greets by town name | desktop-chrome | e2e/town-t5-townsfolk.spec.ts:104 | Error: expect(received).toBe(expected) // Object.is equality | 51.1 s | BOTH |
| e2e/town-t5-townsfolk.spec.ts | approach barks identify sampled speakers and the Prospector greets by town name | mobile-chrome | e2e/town-t5-townsfolk.spec.ts:104 | Error: expect(received).toBe(expected) // Object.is equality | 59.8 s | BOTH |
| e2e/town-t5-townsfolk.spec.ts | mobile bark card is readable above the stick zone and captures concept comparison | mobile-chrome | e2e/town-t5-townsfolk.spec.ts:241 | Test timeout of 30000ms exceeded. | 60.0 s | MOBILE-ONLY |
| e2e/town-tavern-blender.spec.ts | Tavern pilot is lazy, contract-valid, visual-only, and stays inside the frame-time gate | desktop-chrome | e2e/town-tavern-blender.spec.ts:183 | Error: p95 regression: {"calls":-17,"webglCallsPerFrame":-17.09,"trianglesPerFrame":21768,"p95Percent":108.59} | 78.0 s | BOTH |
| e2e/town-tavern-blender.spec.ts | Tavern pilot is lazy, contract-valid, visual-only, and stays inside the frame-time gate | mobile-chrome | e2e/town-tavern-blender.spec.ts:183 | Error: p95 regression: {"calls":-13,"webglCallsPerFrame":-13.12,"trianglesPerFrame":21816,"p95Percent":104.68} | 87.1 s | BOTH |
| e2e/town-ts-02b-facades.spec.ts | built town mounts 2.5D facade keys and all six surfaces remain walkable | desktop-chrome | e2e/town-ts-02b-facades.spec.ts:78 | Test timeout of 30000ms exceeded. | 60.0 s | BOTH |
| e2e/town-ts-02b-facades.spec.ts | built town mounts 2.5D facade keys and all six surfaces remain walkable | mobile-chrome | e2e/town-ts-02b-facades.spec.ts:78 | Test timeout of 30000ms exceeded. | 60.0 s | BOTH |
| e2e/town-ts-03-prop-ring.spec.ts | TS-03 prop ring renders the arrival props, dry Pan Monument, Pony Express plot, and stays inside draw-call budget | mobile-chrome | e2e/town-ts-03-prop-ring.spec.ts:73 | Test timeout of 30000ms exceeded. | 60.0 s | MOBILE-ONLY |
| e2e/tr-01-continuous-ground.spec.ts | terrainMesh flag swaps in a one-draw continuous ground mesh and preserves fallback probes | desktop-chrome | e2e/tr-01-continuous-ground.spec.ts:69 | Test timeout of 30000ms exceeded. | 55.7 s | BOTH |
| e2e/tr-01-continuous-ground.spec.ts | terrainMesh flag swaps in a one-draw continuous ground mesh and preserves fallback probes | mobile-chrome | e2e/tr-01-continuous-ground.spec.ts:69 | Test timeout of 30000ms exceeded. | 56.5 s | BOTH |
| e2e/tr-01-continuous-ground.spec.ts | terrainMesh stress perf stays inside the draw-call envelope | desktop-chrome | e2e/tr-01-continuous-ground.spec.ts:104 | Test timeout of 30000ms exceeded. | 50.8 s | DESKTOP-ONLY |
| e2e/tr-02-splat-ground.spec.ts | TR-02 splat is smooth, deterministic, identity-driven, and inside perf envelope | desktop-chrome | e2e/tr-02-splat-ground.spec.ts:124 | Error: expect(received).toEqual(expected) // deep equality | 172.3 s | DESKTOP-ONLY |
| e2e/trail-guide-beat-priority.spec.ts | first-run Guide holds through a bark storm, then the newest bark surfaces | desktop-chrome | e2e/trail-guide-beat-priority.spec.ts:68 | Error: expect(locator).toContainText(expected) failed | 43.5 s | BOTH |
| e2e/trail-guide-beat-priority.spec.ts | first-run Guide holds through a bark storm, then the newest bark surfaces | mobile-chrome | e2e/trail-guide-beat-priority.spec.ts:75 | Error: expect(locator).toContainText(expected) failed | 30.5 s | BOTH |
| e2e/trail-guide-plain-boot.spec.ts | plain fresh boot teaches the first claim once | mobile-chrome | e2e/trail-guide-plain-boot.spec.ts:67 | Error: expect(received).toEqual(expected) // deep equality | 113.1 s | MOBILE-ONLY |
| e2e/trail-guide.spec.ts | first build-menu open teaches once, survives reload, and stays off for veterans | desktop-chrome | e2e/trail-guide.spec.ts:53 | Error: expect(locator).toHaveCount(expected) failed | 53.7 s | DESKTOP-ONLY |
| e2e/trail-guide.spec.ts | fresh profile sees the first three trail beats once, in order, and reload stays quiet | desktop-chrome | e2e/trail-guide.spec.ts:52 | Error: expect(locator).toContainText(expected) failed | 32.6 s | DESKTOP-ONLY |
| e2e/ts-01-plaza-ground.spec.ts | plaza descriptor forms a clear ring with baked routes to every slot and the gate | desktop-chrome | e2e/ts-01-plaza-ground.spec.ts:79 | Test timeout of 30000ms exceeded. | 60.0 s | BOTH |
| e2e/ts-01-plaza-ground.spec.ts | plaza descriptor forms a clear ring with baked routes to every slot and the gate | mobile-chrome | e2e/ts-01-plaza-ground.spec.ts:79 | Test timeout of 30000ms exceeded. | 60.0 s | BOTH |
| e2e/ts-04-living-pass.spec.ts | TS-04 actors follow baked trails for a 30s scene capture with no storage or sim writes | desktop-chrome | e2e/ts-04-living-pass.spec.ts:60 | Test timeout of 75000ms exceeded. | 150.0 s | BOTH |
| e2e/ts-04-living-pass.spec.ts | TS-04 actors follow baked trails for a 30s scene capture with no storage or sim writes | mobile-chrome | e2e/ts-04-living-pass.spec.ts:99 | Error: expect(received).toBe(expected) // Object.is equality | 118.7 s | BOTH |
| e2e/ui-era-dressing.spec.ts | registered eras render on the menu and a town surface | desktop-chrome | e2e/ui-era-dressing.spec.ts:65 | Test timeout of 90000ms exceeded. | 163.0 s | BOTH |
| e2e/ui-era-dressing.spec.ts | registered eras render on the menu and a town surface | mobile-chrome | e2e/ui-era-dressing.spec.ts:65 | Test timeout of 90000ms exceeded. | 144.4 s | BOTH |
| e2e/visual.spec.ts | river band slows the hero through diagnostics | desktop-chrome | e2e/visual.spec.ts:226 | Error: expect(received).toBeGreaterThan(expected) | 29.6 s | BOTH |
| e2e/visual.spec.ts | river band slows the hero through diagnostics | mobile-chrome | e2e/visual.spec.ts:230 | Error: expect(received).toBe(expected) // Object.is equality | 30.1 s | BOTH |
| e2e/visual.spec.ts | terrain diagnostics expose claim zones and speeds | desktop-chrome | e2e/visual.spec.ts:118 | Error: expect(received).toMatchObject(expected) | 24.3 s | BOTH |
| e2e/visual.spec.ts | terrain diagnostics expose claim zones and speeds | mobile-chrome | e2e/visual.spec.ts:118 | Error: expect(received).toMatchObject(expected) | 12.6 s | BOTH |
| e2e/vp-02-sprite-animation.spec.ts | damped heading sweep visits every orientation in order | desktop-chrome | e2e/vp-02-sprite-animation.spec.ts:619 | Test timeout of 30000ms exceeded. | 60.0 s | BOTH |
| e2e/vp-02-sprite-animation.spec.ts | damped heading sweep visits every orientation in order | mobile-chrome | e2e/vp-02-sprite-animation.spec.ts:619 | Test timeout of 30000ms exceeded. | 60.0 s | BOTH |
| e2e/vp-02-sprite-animation.spec.ts | east heading uses explicit rotation2 files with unmirrored pixels | desktop-chrome | e2e/vp-02-sprite-animation.spec.ts:566 | Test timeout of 30000ms exceeded. | 60.0 s | BOTH |
| e2e/vp-02-sprite-animation.spec.ts | east heading uses explicit rotation2 files with unmirrored pixels | mobile-chrome | e2e/vp-02-sprite-animation.spec.ts:566 | Test timeout of 30000ms exceeded. | 60.0 s | BOTH |
| e2e/vp-02-sprite-animation.spec.ts | hero rotation contract fires both stride cells for all 8 headings | mobile-chrome | e2e/vp-02-sprite-animation.spec.ts:513 | Error: expect(received).toContain(expected) // indexOf | 57.7 s | MOBILE-ONLY |
| e2e/vp-02-sprite-animation.spec.ts | hero test clip advances on sim time and holds during hit-pause | mobile-chrome | e2e/vp-02-sprite-animation.spec.ts:357 | Error: expect(received).toBe(expected) // Object.is equality | 36.2 s | MOBILE-ONLY |
| e2e/vp-02-sprite-animation.spec.ts | hero walk frameKey alternates while each 8-way heading is held | desktop-chrome | e2e/vp-02-sprite-animation.spec.ts:531 | Test timeout of 45000ms exceeded. | 76.8 s | BOTH |
| e2e/vp-02-sprite-animation.spec.ts | hero walk frameKey alternates while each 8-way heading is held | mobile-chrome | e2e/vp-02-sprite-animation.spec.ts:531 | Test timeout of 45000ms exceeded. | 90.0 s | BOTH |
| e2e/vp-02-sprite-animation.spec.ts | orientation swap crossfades once and adds no draw call at rest | mobile-chrome | e2e/vp-02-sprite-animation.spec.ts:718 | Error: expect(received).toBeLessThanOrEqual(expected) | 57.5 s | MOBILE-ONLY |
| e2e/vp-02-sprite-animation.spec.ts | small boundary wiggle does not oscillate orientation | desktop-chrome | e2e/vp-02-sprite-animation.spec.ts:659 | Test timeout of 30000ms exceeded. | 60.1 s | BOTH |
| e2e/vp-02-sprite-animation.spec.ts | small boundary wiggle does not oscillate orientation | mobile-chrome | e2e/vp-02-sprite-animation.spec.ts:659 | Test timeout of 30000ms exceeded. | 60.0 s | BOTH |
| e2e/vp-02b-rotation-resolver.spec.ts | hero locomotion resolves all 8 contract directions | desktop-chrome | e2e/vp-02b-rotation-resolver.spec.ts:113 | Test timeout of 30000ms exceeded. | 60.0 s | BOTH |
| e2e/vp-02b-rotation-resolver.spec.ts | hero locomotion resolves all 8 contract directions | mobile-chrome | e2e/vp-02b-rotation-resolver.spec.ts:113 | Test timeout of 30000ms exceeded. | 60.0 s | BOTH |
| e2e/vp-02b-rotation-resolver.spec.ts | pure side idle stays side while diagonal idle snaps to a hemisphere | desktop-chrome | e2e/vp-02b-rotation-resolver.spec.ts:165 | Test timeout of 60000ms exceeded. | 120.1 s | DESKTOP-ONLY |
| e2e/vp-02b-rotation-resolver.spec.ts | resolver hysteresis holds across small boundary oscillation | desktop-chrome | e2e/vp-02b-rotation-resolver.spec.ts:129 | Test timeout of 30000ms exceeded. | 58.4 s | BOTH |
| e2e/vp-02b-rotation-resolver.spec.ts | resolver hysteresis holds across small boundary oscillation | mobile-chrome | e2e/vp-02b-rotation-resolver.spec.ts:129 | Test timeout of 30000ms exceeded. | 60.0 s | BOTH |
| e2e/vp-03-terrain-variety.spec.ts | distant bank ground varies without adding draw calls | desktop-chrome | e2e/vp-03-terrain-variety.spec.ts:56 | Test timeout of 30000ms exceeded. | 60.0 s | BOTH |
| e2e/vp-03-terrain-variety.spec.ts | distant bank ground varies without adding draw calls | mobile-chrome | e2e/vp-03-terrain-variety.spec.ts:63 | Error: expect(received).toBe(expected) // Object.is equality | 54.9 s | BOTH |
| e2e/vp-03-terrain-variety.spec.ts | same seed renders deterministic bank ground | desktop-chrome | e2e/vp-03-terrain-variety.spec.ts:68 | Test timeout of 30000ms exceeded. | 33.9 s | BOTH |
| e2e/vp-03-terrain-variety.spec.ts | same seed renders deterministic bank ground | mobile-chrome | e2e/vp-03-terrain-variety.spec.ts:68 | Test timeout of 30000ms exceeded. | 34.6 s | BOTH |
| e2e/w1-01-terrain-relief.spec.ts | terrain mesh has seeded relief and mobile density knob | desktop-chrome | e2e/w1-01-terrain-relief.spec.ts:31 | Test timeout of 30000ms exceeded. | 60.3 s | BOTH |
| e2e/w1-01-terrain-relief.spec.ts | terrain mesh has seeded relief and mobile density knob | mobile-chrome | e2e/w1-01-terrain-relief.spec.ts:31 | Test timeout of 30000ms exceeded. | 60.0 s | BOTH |
| e2e/w1-04-detail.spec.ts | instanced detail scatter exposes density diagnostics and mobile reduction | desktop-chrome | e2e/w1-04-detail.spec.ts:31 | Test timeout of 30000ms exceeded. | 60.0 s | BOTH |
| e2e/w1-04-detail.spec.ts | instanced detail scatter exposes density diagnostics and mobile reduction | mobile-chrome | e2e/w1-04-detail.spec.ts:31 | Test timeout of 30000ms exceeded. | 60.0 s | BOTH |
| e2e/w1-04-detail.spec.ts | scatter is seed-stable across boots and varies by seed | desktop-chrome | e2e/w1-04-detail.spec.ts:81 | Error: expect(received).toEqual(expected) // deep equality | 35.6 s | DESKTOP-ONLY |
| e2e/w1-05-building-shells.spec.ts | buildables render timber shells with fixed local signs and a turning sluice wheel | desktop-chrome | e2e/w1-05-building-shells.spec.ts:58 | Error: expect(received).toBe(expected) // Object.is equality | 54.7 s | BOTH |
| e2e/w1-05-building-shells.spec.ts | buildables render timber shells with fixed local signs and a turning sluice wheel | mobile-chrome | e2e/w1-05-building-shells.spec.ts:58 | Error: expect(received).toBe(expected) // Object.is equality | 46.7 s | BOTH |
| e2e/w1-06-vista.spec.ts | vista diagnostics expose a low-res radius-90 terrain ring | desktop-chrome | e2e/w1-06-vista.spec.ts:39 | Test timeout of 30000ms exceeded. | 60.0 s | BOTH |
| e2e/w1-06-vista.spec.ts | vista diagnostics expose a low-res radius-90 terrain ring | mobile-chrome | e2e/w1-06-vista.spec.ts:39 | Test timeout of 30000ms exceeded. | 60.0 s | BOTH |
| e2e/w1-06-vista.spec.ts | vista seam and W1-01 in-bounds height probes stay stable | mobile-chrome | e2e/w1-06-vista.spec.ts:70 | Error: expect(received).toBe(expected) // Object.is equality | 27.2 s | MOBILE-ONLY |
| e2e/w1-07-natural.spec.ts | ford approach and sim lanes stay visually calm while the sim remains planar | desktop-chrome | e2e/w1-07-natural.spec.ts:91 | Error: expect(received).toBeCloseTo(expected, precision) | 26.0 s | BOTH |
| e2e/w1-07-natural.spec.ts | ford approach and sim lanes stay visually calm while the sim remains planar | mobile-chrome | e2e/w1-07-natural.spec.ts:91 | Error: expect(received).toBeCloseTo(expected, precision) | 30.3 s | BOTH |
| e2e/w1-07-natural.spec.ts | natural claim relief exposes gullies, shelves, bluffs, and pockets | desktop-chrome | e2e/w1-07-natural.spec.ts:47 | Test timeout of 30000ms exceeded. | 60.0 s | BOTH |
| e2e/w1-07-natural.spec.ts | natural claim relief exposes gullies, shelves, bluffs, and pockets | mobile-chrome | e2e/w1-07-natural.spec.ts:47 | Test timeout of 30000ms exceeded. | 60.0 s | BOTH |
| e2e/water-mask-engine.spec.ts | the Claim keeps its legacy water contract byte-for-byte when no mask is authored | desktop-chrome | e2e/water-mask-engine.spec.ts:39 | Error: expect(received).toEqual(expected) // deep equality | 27.1 s | BOTH |
| e2e/water-mask-engine.spec.ts | the Claim keeps its legacy water contract byte-for-byte when no mask is authored | mobile-chrome | e2e/water-mask-engine.spec.ts:39 | Error: expect(received).toEqual(expected) // deep equality | 22.3 s | BOTH |
| e2e/wd02-barks.spec.ts | a debug-driven era milestone reaches Mei once and retires older missed lines | desktop-chrome | e2e/wd02-barks.spec.ts:115 | Error: expect(received).toBe(expected) // Object.is equality | 49.3 s | BOTH |
| e2e/wd02-barks.spec.ts | a debug-driven era milestone reaches Mei once and retires older missed lines | mobile-chrome | e2e/wd02-barks.spec.ts:115 | Error: expect(received).toBe(expected) // Object.is equality | 55.9 s | BOTH |
| e2e/wd04-postscripts.spec.ts | WD-04 fires the reached ceremony postscript exactly once and keeps pre-era entries silent | desktop-chrome | e2e/wd04-postscripts.spec.ts:44 | Error: expect(locator).toHaveCount(expected) failed | 29.8 s | DESKTOP-ONLY |
| e2e/wd04-postscripts.spec.ts | WD-04 stages the final postscript from a successful Charter Press lever pull | desktop-chrome | e2e/wd04-postscripts.spec.ts:122 | Error: expect(received).toEqual(expected) // deep equality | 37.6 s | DESKTOP-ONLY |
| e2e/wire-crawler-3d.spec.ts | mounts the Crawler GLB, flips all three damage morphs, and disposes on kill | desktop-chrome | e2e/renderer-count-artifact.ts:37 | Error: renderer count coldBaseline.textures expected exact 32, got 33 | 51.0 s | BOTH |
| e2e/wire-crawler-3d.spec.ts | mounts the Crawler GLB, flips all three damage morphs, and disposes on kill | mobile-chrome | e2e/renderer-count-artifact.ts:37 | Error: renderer count coldBaseline.textures expected exact 30, got 31 | 59.2 s | BOTH |
| e2e/wire-e2-enemy-walk4.spec.ts | E2 roster uses advancing walk4 art while E1 keeps the jumper walk8 | desktop-chrome | e2e/wire-e2-enemy-walk4.spec.ts:86 | Error: expect(received).toBe(expected) // Object.is equality | 49.6 s | BOTH |
| e2e/wire-e2-enemy-walk4.spec.ts | E2 roster uses advancing walk4 art while E1 keeps the jumper walk8 | mobile-chrome | e2e/wire-e2-enemy-walk4.spec.ts:86 | Error: expect(received).toBe(expected) // Object.is equality | 48.9 s | BOTH |
| e2e/wire-era-anchor-emitters.spec.ts | Voltage arcs and Motor dust mount at their era anchors within the shared budget | desktop-chrome | e2e/wire-era-anchor-emitters.spec.ts:95 | Error: expect(locator).toHaveAttribute(expected) failed | 62.4 s | BOTH |
| e2e/wire-era-anchor-emitters.spec.ts | Voltage arcs and Motor dust mount at their era anchors within the shared budget | mobile-chrome | e2e/wire-era-anchor-emitters.spec.ts:95 | Error: expect(locator).toHaveAttribute(expected) failed | 45.6 s | BOTH |
| e2e/wire-railcar-3d.spec.ts | GLB rides the rail, exposes all three damage morphs, preserves wreckage, and disposes | desktop-chrome | e2e/renderer-count-artifact.ts:37 | Error: renderer count mounted.textures expected exact 42, got 45 | 75.5 s | BOTH |
| e2e/wire-railcar-3d.spec.ts | GLB rides the rail, exposes all three damage morphs, preserves wreckage, and disposes | mobile-chrome | e2e/renderer-count-artifact.ts:37 | Error: renderer count baseline.textures expected exact 37, got 36 | 68.3 s | BOTH |
| e2e/wire-railcar-3d.spec.ts | invalid GLB bytes fall back to the painted billboard | desktop-chrome | e2e/wire-railcar-3d.spec.ts:200 | Test timeout of 30000ms exceeded. | 58.1 s | DESKTOP-ONLY |
| e2e/world-info-notes.spec.ts | 390px world note clears the touch stick zone | desktop-chrome | e2e/world-info-notes.spec.ts:322 | Test timeout of 30000ms exceeded. | 60.0 s | BOTH |
| e2e/world-info-notes.spec.ts | 390px world note clears the touch stick zone | mobile-chrome | e2e/world-info-notes.spec.ts:339 | Error: expect(received).toBeLessThanOrEqual(expected) | 8.7 s | BOTH |
| e2e/world-info-notes.spec.ts | building notes sit with existing assay and upgrade prompts | desktop-chrome | e2e/world-info-notes.spec.ts:196 | Test timeout of 30000ms exceeded. | 60.1 s | BOTH |
| e2e/world-info-notes.spec.ts | building notes sit with existing assay and upgrade prompts | mobile-chrome | e2e/world-info-notes.spec.ts:98 | Error: expect(locator).toBeVisible() failed | 58.2 s | BOTH |
| e2e/world-info-notes.spec.ts | contract-specific world notes cover Dry Gulch water without a phantom territory ring | desktop-chrome | e2e/world-info-notes.spec.ts:236 | Test timeout of 30000ms exceeded. | 56.9 s | DESKTOP-ONLY |
| e2e/world-info-notes.spec.ts | Night Shift lantern post note uses the same registry | desktop-chrome | e2e/world-info-notes.spec.ts:269 | Test timeout of 30000ms exceeded. | 60.0 s | DESKTOP-ONLY |
| e2e/world-info-notes.spec.ts | run-world notes explain seams, stake, ford, prospector, and soften after two approaches | desktop-chrome | e2e/world-info-notes.spec.ts:163 | Test timeout of 30000ms exceeded. | 60.0 s | DESKTOP-ONLY |
| e2e/world-info-notes.spec.ts | town shells use info notes beside opens-soon prompts | desktop-chrome | e2e/world-info-notes.spec.ts:301 | Error: expect(locator).toContainText(expected) failed | 38.1 s | BOTH |
| e2e/world-info-notes.spec.ts | town shells use info notes beside opens-soon prompts | mobile-chrome | e2e/world-info-notes.spec.ts:301 | Error: expect(locator).toContainText(expected) failed | 28.2 s | BOTH |
| e2e/xp-economy-audit.spec.ts | seeded dense kill windows bank every death XP exactly once | desktop-chrome | e2e/xp-economy-audit.spec.ts:53 | Error: expect(received).toBe(expected) // Object.is equality | 45.6 s | BOTH |
| e2e/xp-economy-audit.spec.ts | seeded dense kill windows bank every death XP exactly once | mobile-chrome | e2e/xp-economy-audit.spec.ts:53 | Error: expect(received).toBe(expected) // Object.is equality | 28.2 s | BOTH |

## Other configured projects

| Spec file | Test title | Project | Failing file:line | First error line | Duration |
|---|---|---|---|---|---:|
| e2e/058-device-tiers.spec.ts | desktop WebKit records FULL baseline and LITE wave-20 stress envelope | desktop-webkit | e2e/058-device-tiers.spec.ts:245 | Error: expect(received).toBeLessThanOrEqual(expected) | 55.8 s |

## Incomplete comparisons

| Spec file | Test title | Failed project | Opposite-project status |
|---|---|---|---|
| e2e/055-baron-kill-stop.spec.ts | kill-stop leaves the sim hash identical to a nopause control | desktop-chrome | skipped |
| e2e/058-device-tiers.spec.ts | desktop Chrome tier proofs › tier switch is render-only for a deterministic economy slice | desktop-chrome | skipped |
| e2e/e2-hill-mine.spec.ts | Hill Mine 200-enemy stress stays inside envelope | desktop-chrome | skipped |
| e2e/gt-03-enemy-elevation.spec.ts | basin stress stays in frame envelope while the flat claim remains neutral | desktop-chrome | skipped |
| e2e/gt-04-sightlines.spec.ts | terrain LOS is deterministic and 200-enemy basin stress stays in envelope | desktop-chrome | skipped |
| e2e/gt-05-water-depth.spec.ts | GT water depth simulation is deterministic | desktop-chrome | skipped |
| e2e/mp-02-lockstep.spec.ts | two clients advance 500 ticks with identical lockstep hashes | desktop-chrome | skipped |
| e2e/mp-02-lockstep.spec.ts | town Ride Together invalid word stays friendly at 390px | mobile-chrome | skipped |
| e2e/mp-reconnect.spec.ts | a disconnected rider rejoins its held slot at the exact snapshot tick and keeps identical world hashes | desktop-chrome | skipped |
| e2e/panorama-framing.spec.ts | write the three 2000x1000 run-camera proof shots | desktop-chrome | skipped |
| e2e/polish-03-mobile-hud.spec.ts | mobile HUD controls fit, tap, and avoid overlap at 390px and 430px | mobile-chrome | skipped |
| e2e/sim-fixed-step.spec.ts | 30/60/144 fps render schedules produce the same 300-tick simulation | desktop-chrome | skipped |
| e2e/sim-fixed-step.spec.ts | fixed ticks carry fractional cooldown debt instead of losing volleys | desktop-chrome | skipped |
| e2e/soak-30.spec.ts | scripted auto-play reaches wave 30 inside perf and pool envelopes | desktop-chrome | skipped |
| e2e/task-037-assay-bench-ungate.spec.ts | debug play builds the Assay Office and posts an order at the bench | desktop-chrome | skipped |
| e2e/task-037-assay-bench-ungate.spec.ts | mobile touch confirm opens and closes the bench without HUD overlap | mobile-chrome | skipped |
| e2e/task-048-funnel-formation-spread.spec.ts | formation offsets are deterministic for the m6 seed | desktop-chrome | skipped |
| e2e/task-053-weapon-cycling-audit.spec.ts | task-053 seeded weapon cycling DPS probe | desktop-chrome | skipped |
| e2e/terrain3d-registry.spec.ts | four campaign era bands mount with zero console errors | desktop-chrome | skipped |

## Mobile-only failures

| Spec file | Test title | Failing file:line | First error line | Duration |
|---|---|---|---|---:|
| e2e/050-audio-mix-and-access.spec.ts | pause overlay volume and mute persist and sync with Settings | e2e/050-audio-mix-and-access.spec.ts:49 | Test timeout of 30000ms exceeded. | 60.0 s |
| e2e/072-era-activation.spec.ts | the E2 ceremony can be skipped without undoing activation | e2e/072-era-activation.spec.ts:354 | Test timeout of 30000ms exceeded. | 60.0 s |
| e2e/078-ux-hygiene.spec.ts | ledger Escape closes only the ledger and restores schoolhouse focus | e2e/078-ux-hygiene.spec.ts:130 | Test timeout of 30000ms exceeded. | 60.0 s |
| e2e/ap-standing-orders.spec.ts | plain-boot production orders pan a seam and place a real building | e2e/ap-standing-orders.spec.ts:342 | Test timeout of 45000ms exceeded. | 90.0 s |
| e2e/beauty-far-ground.spec.ts | the far ground › e1-dry-gulch: the panorama's foot is above the top edge of the frame, and the apron is painted | e2e/beauty-far-ground.spec.ts:139 | Error: expect(locator).toHaveAttribute(expected) failed | 30.8 s |
| e2e/beauty-far-ground.spec.ts | the far ground › the apron costs zero draw calls, and ?horizonApron=off is a real A/B | e2e/beauty-far-ground.spec.ts:139 | Error: expect(locator).toHaveAttribute(expected) failed | 84.7 s |
| e2e/beauty-night-shift.spec.ts | night shift beauty board | e2e/beauty-night-shift.spec.ts:175 | Test timeout of 900000ms exceeded. | 991.6 s |
| e2e/beauty-twin-banks.spec.ts | the beauty pass pays its frame budget, measured against its own build | e2e/beauty-twin-banks.spec.ts:215 | Error: expect(received).toBeLessThan(expected) | 53.0 s |
| e2e/board-era-chapters.spec.ts | a fresh profile opens only the Frontier chapter and keeps Ride Together and the Claim Ledger | e2e/board-era-chapters.spec.ts:100 | Test timeout of 30000ms exceeded. | 60.0 s |
| e2e/board-era-chapters.spec.ts | debug opens every chapter without removing any contract launch surface | e2e/board-era-chapters.spec.ts:148 | Test timeout of 30000ms exceeded. | 60.0 s |
| e2e/board-era-chapters.spec.ts | the era door exposes chapters through the reached frontier and nothing beyond it | e2e/board-era-chapters.spec.ts:127 | Test timeout of 30000ms exceeded. | 60.0 s |
| e2e/bt-00-demolish.spec.ts | tiered half-HP sluice refund scales from base cost only | e2e/bt-00-demolish.spec.ts:261 | Error: expect(received).toMatchObject(expected) | 34.0 s |
| e2e/ceremony-framework.spec.ts | T10 THE CHARTER PRESS: the E10 science ceiling opens the existing River finale and idle opens nothing | e2e/ceremony-framework.spec.ts:822 | Error: expect(locator).toHaveCount(expected) failed | 53.0 s |
| e2e/ceremony-framework.spec.ts | T7 THE STARSHIP: the umbilical hand alone arms E8 exactly once and the kept era survives reload | e2e/ceremony-framework.spec.ts:561 | Error: expect(received).toBe(expected) // Object.is equality | 94.2 s |
| e2e/contract-briefings.spec.ts | board cards show the same briefing data | e2e/contract-briefings.spec.ts:369 | Test timeout of 30000ms exceeded. | 60.0 s |
| e2e/e1-baron.spec.ts | Baron manifest loads and taunts fire at waves 5, 12, and 18 | e2e/e1-baron.spec.ts:411 | Test timeout of 30000ms exceeded. | 60.0 s |
| e2e/e1-night-shift.spec.ts | seeded Night Shift diagnostics and dark render budget are stable | e2e/e1-night-shift.spec.ts:622 | Error: expect(received).toBeGreaterThan(expected) | 42.5 s |
| e2e/e1-twin-banks.spec.ts | routes enemies through both west and east fords | e2e/e1-twin-banks.spec.ts:214 | Error: expect(received).toBeGreaterThan(expected) | 21.6 s |
| e2e/e2-hill-mine.spec.ts | Hill Mine terrain simulation is deterministic for a seeded route | e2e/e2-hill-mine.spec.ts:318 | Test timeout of 60000ms exceeded. | 64.5 s |
| e2e/e2-stamp-mill.spec.ts | Stamp Mill manifest builds to the door without switching epochs | e2e/e2-stamp-mill.spec.ts:200 | Error: expect(locator).toHaveAttribute(expected) failed | 41.5 s |
| e2e/e2-t2-dynamo-ceremony.spec.ts | the T2 door reports missing science and the Voltage ceremony remains skippable | e2e/e2-t2-dynamo-ceremony.spec.ts:158 | Test timeout of 30000ms exceeded. | 60.0 s |
| e2e/e4-dust-flats.spec.ts | publishes a mask table that matches the real Dust Flats contract | e2e/e4-dust-flats.spec.ts:75 | Test timeout of 90000ms exceeded. | 139.1 s |
| e2e/e5-arsenal.spec.ts | pressure-seals the rig and records cure-arm outcomes through the existing resolver | e2e/e5-arsenal.spec.ts:48 | Test timeout of 30000ms exceeded. | 60.0 s |
| e2e/e6-decay-framework.spec.ts | same-seed decay registration, pause, and aura ticks are deterministic | e2e/e6-decay-framework.spec.ts:69 | Test timeout of 30000ms exceeded. | 30.0 s |
| e2e/e7-arsenal.spec.ts | the four additions are absent before Signal and inherited from epoch 7 onward | e2e/e7-arsenal.spec.ts:40 | Error: expect(received).toEqual(expected) // deep equality | 30.7 s |
| e2e/e7-playbook-surface.spec.ts | record, name, shelf, and replay use the profile tape store and the slaved rig actor | e2e/e7-playbook-surface.spec.ts:54 | Test timeout of 30000ms exceeded. | 60.0 s |
| e2e/e7-playbook-surface.spec.ts | the tape drawer arms at the Signal Era and remains inherited afterward | e2e/e7-playbook-surface.spec.ts:51 | Error: expect(received).toEqual(expected) // deep equality | 42.8 s |
| e2e/e9-canal-stages.spec.ts | 3. the dust devil telegraphs, follows its authored lane, and shoves without chasing or damage | e2e/e9-canal-stages.spec.ts:111 | Error: expect(received).toMatchObject(expected) | 21.7 s |
| e2e/ed-02-authored-grid-substrate.spec.ts | session document changes visual height across reload while the sim fingerprint stays identical | e2e/ed-02-authored-grid-substrate.spec.ts:93 | Test timeout of 30000ms exceeded. | 43.1 s |
| e2e/gazette-first-issue.spec.ts | fresh profile gets the pinned first issue badge and can reopen it | e2e/gazette-first-issue.spec.ts:82 | Test timeout of 30000ms exceeded. | 60.0 s |
| e2e/gazette-first-issue.spec.ts | mandatory welcome opens issue one only on the first town entry | e2e/gazette-first-issue.spec.ts:105 | Test timeout of 30000ms exceeded. | 60.0 s |
| e2e/gt-05-water-depth.spec.ts | deep water blocks hero and enemy through the shared resolver | e2e/gt-05-water-depth.spec.ts:217 | Error: expect(received).toMatchObject(expected) | 26.3 s |
| e2e/lane-boss-healthbar.spec.ts | boss damage leaves green life over red loss | e2e/lane-boss-healthbar.spec.ts:8 | Test timeout of 30000ms exceeded. | 60.0 s |
| e2e/m1-05-sentry-beacon-build.spec.ts | resetRun clears Sentry Beacons, owner kills, and keeps renderer memory stable | e2e/m1-05-sentry-beacon-build.spec.ts:129 | Error: expect(received).toBeGreaterThanOrEqual(expected) | 59.7 s |
| e2e/m1-05-sentry-beacon-build.spec.ts | Sentry Beacon registers kills through combat with zero input | e2e/m1-05-sentry-beacon-build.spec.ts:75 | Error: expect(received).toBeGreaterThanOrEqual(expected) | 59.0 s |
| e2e/m2-02-sluice-and-stockpile.spec.ts | R rotates the palisade footprint and the rotated AABB blocks on that axis | e2e/m2-02-sluice-and-stockpile.spec.ts:254 | Error: expect(received).toBe(expected) // Object.is equality | 36.7 s |
| e2e/m2-03-wave-scheduler.spec.ts | lull window stays spawn-free between scheduled pulses | e2e/m2-03-wave-scheduler.spec.ts:178 | Error: expect(received).toBeGreaterThanOrEqual(expected) | 26.6 s |
| e2e/m2-04-gold-stealing.spec.ts | bank cap blocks pickup reclaim until room exists | e2e/m2-04-gold-stealing.spec.ts:197 | Error: expect(received).toBe(expected) // Object.is equality | 37.8 s |
| e2e/m5-04-offline-queue.spec.ts | posted orders stay visible across reloads and refresh to verdicts on reopen | e2e/m5-04-offline-queue.spec.ts:262 | Error: expect(locator).toContainText(expected) failed | 40.2 s |
| e2e/map-census.spec.ts | e1-dry-gulch census | e2e/map-census.spec.ts:35 | Test timeout of 20000ms exceeded. | 33.4 s |
| e2e/map-census.spec.ts | e3-fairground census | e2e/map-census.spec.ts:35 | Test timeout of 20000ms exceeded. | 41.4 s |
| e2e/map-census.spec.ts | e6-showroom census | e2e/map-census.spec.ts:35 | Test timeout of 20000ms exceeded. | 48.4 s |
| e2e/meta-presence.spec.ts | combat hit-pause does not open the claim memory ledger | e2e/meta-presence.spec.ts:253 | Error: expect(received).toBe(expected) // Object.is equality | 25.5 s |
| e2e/mp-balance-harness.spec.ts | the browser channel requires both debug and mpbalance query gates | e2e/mp-balance-harness.spec.ts:135 | Error: expect(received).toEqual(expected) // deep equality | 45.3 s |
| e2e/night-light-doctrine.spec.ts | honest night lights reveal only carried lamps, watch paint, consent, and shots | e2e/night-light-doctrine.spec.ts:16 | Test timeout of 60000ms exceeded. | 117.7 s |
| e2e/panorama-framing.spec.ts | legacy painted ground stays hidden while sculpt landmarks remain mounted | e2e/panorama-framing.spec.ts:35 | Test timeout of 60000ms exceeded. | 116.2 s |
| e2e/polish-02-rivalry-stats.spec.ts | profile-scoped v1 scores migrate to v2 as legacy records for the selected profile | e2e/polish-02-rivalry-stats.spec.ts:200 | Error: expect(received).toEqual(expected) // deep equality | 18.2 s |
| e2e/run-suspend.spec.ts | legacy no-controls restore at Territory I keeps the removed ring and its hints absent | e2e/run-suspend.spec.ts:316 | Error: expect(received).toMatchObject(expected) | 22.6 s |
| e2e/scene-swap-camera.spec.ts | town-run-town keeps camera truth at 1440x900 | e2e/scene-swap-camera.spec.ts:11 | Test timeout of 60000ms exceeded. | 109.2 s |
| e2e/town-era-switch.spec.ts | E1 mounts base only; E2 mounts its variant, shared anchor plumes, and era accent | e2e/town-era-switch.spec.ts:146 | Error: expect(received).toBeLessThanOrEqual(expected) | 26.3 s |
| e2e/town-plate-blender.spec.ts | Town plate is lazy, contract-valid, keeps actors planar, and mounts in the owner all-view | e2e/town-plate-blender.spec.ts:83 | Error: expect(received).toBeLessThanOrEqual(expected) | 51.2 s |
| e2e/town-schoolhouse-blender.spec.ts | Schoolhouse pilot is lazy, contract-valid, visual-only, and stays inside the frame-time gate | e2e/town-schoolhouse-blender.spec.ts:184 | Error: p95 regression: {"calls":-6,"webglCallsPerFrame":-6.21,"trianglesPerFrame":5426,"p95Percent":89.47,"p95Ratio":1.8947} | 55.7 s |
| e2e/town-stamp-mill-blender.spec.ts | Stamp Mill pilot is lazy, contract-valid, visual-only, and stays inside the frame-time gate | e2e/town-stamp-mill-blender.spec.ts:201 | Error: p95 regression: {"calls":-3,"webglCallsPerFrame":-3.2,"trianglesPerFrame":2772,"p95Percent":15.11,"p95Ratio":1.1511} | 55.0 s |
| e2e/town-t3-board.spec.ts | contract board swipes and keeps tap targets usable at 390px | e2e/town-t3-board.spec.ts:326 | Test timeout of 30000ms exceeded. | 60.0 s |
| e2e/town-t3-board.spec.ts | post-run overrun returns straight to the town board and records a contract result | e2e/town-t3-board.spec.ts:246 | Test timeout of 30000ms exceeded. | 60.0 s |
| e2e/town-t4-growth.spec.ts | fresh and seeded territory tiers render only earned town buildings | e2e/town-t4-growth.spec.ts:146 | Test timeout of 30000ms exceeded. | 55.4 s |
| e2e/town-t4-growth.spec.ts | Stamp Mill town vignette mirrors megaproject stage state | e2e/town-t4-growth.spec.ts:183 | Test timeout of 30000ms exceeded. | 60.0 s |
| e2e/town-t5-townsfolk.spec.ts | mobile bark card is readable above the stick zone and captures concept comparison | e2e/town-t5-townsfolk.spec.ts:241 | Test timeout of 30000ms exceeded. | 60.0 s |
| e2e/town-ts-03-prop-ring.spec.ts | TS-03 prop ring renders the arrival props, dry Pan Monument, Pony Express plot, and stays inside draw-call budget | e2e/town-ts-03-prop-ring.spec.ts:73 | Test timeout of 30000ms exceeded. | 60.0 s |
| e2e/trail-guide-plain-boot.spec.ts | plain fresh boot teaches the first claim once | e2e/trail-guide-plain-boot.spec.ts:67 | Error: expect(received).toEqual(expected) // deep equality | 113.1 s |
| e2e/vp-02-sprite-animation.spec.ts | hero rotation contract fires both stride cells for all 8 headings | e2e/vp-02-sprite-animation.spec.ts:513 | Error: expect(received).toContain(expected) // indexOf | 57.7 s |
| e2e/vp-02-sprite-animation.spec.ts | hero test clip advances on sim time and holds during hit-pause | e2e/vp-02-sprite-animation.spec.ts:357 | Error: expect(received).toBe(expected) // Object.is equality | 36.2 s |
| e2e/vp-02-sprite-animation.spec.ts | orientation swap crossfades once and adds no draw call at rest | e2e/vp-02-sprite-animation.spec.ts:718 | Error: expect(received).toBeLessThanOrEqual(expected) | 57.5 s |
| e2e/w1-06-vista.spec.ts | vista seam and W1-01 in-bounds height probes stay stable | e2e/w1-06-vista.spec.ts:70 | Error: expect(received).toBe(expected) // Object.is equality | 27.2 s |

## Masking candidates

Ranked by the earliest failing line within the test body. Lower ratios leave more of the test unexercised.
150 of 210 rows ranked; 60 unresolved rows are marked — and listed after them.

| Rank | Spec file | Test title | Failing-line / body-lines ratio |
|---:|---|---|---|
| 1 | e2e/e1-night-shift.spec.ts | cold lantern relight costs survive run suspend and continue | desktop-chrome: e2e/e1-night-shift.spec.ts:171 — 2/39 (5.1%)<br>mobile-chrome: e2e/e1-night-shift.spec.ts:171 — 2/39 (5.1%) |
| 2 | e2e/er01-e3-census.spec.ts | e3-canyon-works census support is explicit and deterministic | desktop-chrome: e2e/er01-e3-census.spec.ts:44 — 33/394 (8.4%)<br>mobile-chrome: e2e/er01-e3-census.spec.ts:44 — 33/394 (8.4%) |
| 3 | e2e/save-slots.spec.ts | manual save creates a curated slot, preserves auto, and loads through the suspend restore path | desktop-chrome: e2e/save-slots.spec.ts:76 — 5/59 (8.5%)<br>mobile-chrome: e2e/save-slots.spec.ts:76 — 5/59 (8.5%) |
| 4 | e2e/gt-02-slope.spec.ts | slope movement, cliff blocking, and visual height use the sim field | desktop-chrome: e2e/gt-02-slope.spec.ts:44 — 5/58 (8.6%)<br>mobile-chrome: e2e/gt-02-slope.spec.ts:44 — 5/58 (8.6%) |
| 5 | e2e/e2-t2-dynamo-ceremony.spec.ts | Dynamo Hall builds from gold and pressure, then hold-to-crank activates Voltage exactly once | desktop-chrome: e2e/e2-t2-dynamo-ceremony.spec.ts:89 — 6/58 (10.3%)<br>mobile-chrome: e2e/e2-t2-dynamo-ceremony.spec.ts:89 — 6/58 (10.3%) |
| 6 | e2e/second-rider.spec.ts | the imported companion joins through town, moves, fights, and survives | desktop-chrome: e2e/second-rider.spec.ts:96 — 5/47 (10.6%)<br>mobile-chrome: e2e/second-rider.spec.ts:96 — 5/47 (10.6%) |
| 7 | e2e/072-era-activation.spec.ts | the completed Stamp Mill activates E2 once, stages the ceremony, and makes Hill Mine playable after reload | desktop-chrome: e2e/072-era-activation.spec.ts:185 — 13/81 (16.0%)<br>mobile-chrome: e2e/072-era-activation.spec.ts:191 — 10/81 (12.3%) |
| 8 | e2e/w1-05-building-shells.spec.ts | buildables render timber shells with fixed local signs and a turning sluice wheel | desktop-chrome: e2e/w1-05-building-shells.spec.ts:58 — 6/40 (15.0%)<br>mobile-chrome: e2e/w1-05-building-shells.spec.ts:58 — 6/40 (15.0%) |
| 9 | e2e/trail-guide-beat-priority.spec.ts | first-run Guide holds through a bark storm, then the newest bark surfaces | desktop-chrome: e2e/trail-guide-beat-priority.spec.ts:68 — 9/60 (15.0%)<br>mobile-chrome: e2e/trail-guide-beat-priority.spec.ts:75 — 16/60 (26.7%) |
| 10 | e2e/ss-03-beats.spec.ts | SS-03 table uses registered speakers and once-per-profile authored beats | desktop-chrome: e2e/ss-03-beats.spec.ts:53 — 1/6 (16.7%)<br>mobile-chrome: e2e/ss-03-beats.spec.ts:53 — 1/6 (16.7%) |
| 11 | e2e/m4-06-embodiment.spec.ts | permission-denied bark survives the first idle survey | desktop-chrome: e2e/m4-06-embodiment.spec.ts:447 — 5/24 (20.8%)<br>mobile-chrome: e2e/m4-06-embodiment.spec.ts:447 — 5/24 (20.8%) |
| 12 | e2e/m2-05-base-damage-repair.spec.ts | wreck and repair cycles leave shooter and renderer counts at baseline | desktop-chrome: e2e/m2-05-base-damage-repair.spec.ts:127 — 9/43 (20.9%)<br>mobile-chrome: e2e/m2-05-base-damage-repair.spec.ts:127 — 9/43 (20.9%) |
| 13 | e2e/mp-06-party-overview.spec.ts | party roster shows live shared truth and local camera glance | desktop-chrome: e2e/mp-06-party-overview.spec.ts:48 — 18/85 (21.2%)<br>mobile-chrome: e2e/mp-06-party-overview.spec.ts:107 — 77/85 (90.6%) |
| 14 | e2e/gt-04-sightlines.spec.ts | ridge blocks bolt acquisition from both sides | desktop-chrome: e2e/gt-04-sightlines.spec.ts:63 — 7/30 (23.3%)<br>mobile-chrome: e2e/gt-04-sightlines.spec.ts:63 — 7/30 (23.3%) |
| 15 | e2e/061-first-claim-onboarding.spec.ts | fresh profile gets first-claim guidance, launch sets the per-profile done flag, and second town entry is quiet | desktop-chrome: e2e/061-first-claim-onboarding.spec.ts:74 — 7/29 (24.1%)<br>mobile-chrome: e2e/061-first-claim-onboarding.spec.ts:74 — 7/29 (24.1%) |
| 16 | e2e/story-loop.spec.ts | fresh-profile first boot returns to town after the first ending | desktop-chrome: e2e/story-loop.spec.ts:190 — 5/18 (27.8%)<br>mobile-chrome: e2e/story-loop.spec.ts:190 — 5/18 (27.8%) |
| 17 | e2e/mp-balance-harness.spec.ts | seeded rider simulations are deterministic and obey balance invariants | desktop-chrome: e2e/mp-balance-harness.spec.ts:54 — 26/89 (29.2%)<br>mobile-chrome: e2e/mp-balance-harness.spec.ts:54 — 26/89 (29.2%) |
| 18 | e2e/run-gait-stride.spec.ts | run gait advances by distance and preserves the Baron cadence | desktop-chrome: e2e/run-gait-stride.spec.ts:88 — ?/46 (callsite outside body)<br>mobile-chrome: e2e/run-gait-stride.spec.ts:102 — 14/46 (30.4%) |
| 19 | e2e/world-info-notes.spec.ts | town shells use info notes beside opens-soon prompts | desktop-chrome: e2e/world-info-notes.spec.ts:301 — 8/26 (30.8%)<br>mobile-chrome: e2e/world-info-notes.spec.ts:301 — 8/26 (30.8%) |
| 20 | e2e/061-first-claim-onboarding.spec.ts | name-only exit keeps the first-claim guide pending until launch | desktop-chrome: e2e/061-first-claim-onboarding.spec.ts:74 — 5/16 (31.3%)<br>mobile-chrome: e2e/061-first-claim-onboarding.spec.ts:149 — ?/16 (callsite outside body) |
| 21 | e2e/ss-01-beats.spec.ts | founding, first contract, and Prospector XP beats fire once with portraits | desktop-chrome: e2e/ss-01-beats.spec.ts:88 — 15/44 (34.1%)<br>mobile-chrome: e2e/ss-01-beats.spec.ts:88 — 15/44 (34.1%) |
| 22 | e2e/wd02-barks.spec.ts | a debug-driven era milestone reaches Mei once and retires older missed lines | desktop-chrome: e2e/wd02-barks.spec.ts:115 — 11/32 (34.4%)<br>mobile-chrome: e2e/wd02-barks.spec.ts:115 — 11/32 (34.4%) |
| 23 | e2e/task-031-anim-roundness.spec.ts | zeroed animation knobs preserve hard frameKey cycling | desktop-chrome: e2e/task-031-anim-roundness.spec.ts:242 — 12/34 (35.3%)<br>mobile-chrome: e2e/task-031-anim-roundness.spec.ts:242 — 12/34 (35.3%) |
| 24 | e2e/feedback-fx.spec.ts | announcement banner fades after the opening claim notice | desktop-chrome: e2e/feedback-fx.spec.ts:33 — 5/14 (35.7%)<br>mobile-chrome: e2e/feedback-fx.spec.ts:33 — 5/14 (35.7%) |
| 25 | e2e/town-t4-growth.spec.ts | growth beats fire once per profile | desktop-chrome: e2e/town-t4-growth.spec.ts:123 — 5/14 (35.7%)<br>mobile-chrome: e2e/town-t4-growth.spec.ts:123 — 5/14 (35.7%) |
| 26 | e2e/e4-dust-flats.spec.ts | fires the authored storm and peels a convoy off the ORBIT road | desktop-chrome: e2e/e4-dust-flats.spec.ts:46 — 15/41 (36.6%)<br>mobile-chrome: e2e/e4-dust-flats.spec.ts:31 — ?/41 (callsite outside body) |
| 27 | e2e/e1-perf-pass.spec.ts | E1 maps publish a pressure census and preserve pressure pixels | desktop-chrome: e2e/e1-perf-pass.spec.ts:226 — 19/51 (37.3%)<br>mobile-chrome: e2e/e1-perf-pass.spec.ts:207 — ?/51 (callsite outside body) |
| 28 | e2e/e1-night-shift.spec.ts | a lantern pool makes only its build island readable at true dark | desktop-chrome: e2e/e1-night-shift.spec.ts:450 — 15/40 (37.5%)<br>mobile-chrome: e2e/e1-night-shift.spec.ts:450 — 15/40 (37.5%) |
| 29 | e2e/bt-00-demolish.spec.ts | demolish scales refund by remaining HP after building damage | desktop-chrome: e2e/bt-00-demolish.spec.ts:277 — 11/29 (37.9%)<br>mobile-chrome: e2e/bt-00-demolish.spec.ts:277 — 11/29 (37.9%) |
| 30 | e2e/contract-briefings.spec.ts | briefing card and pause contract fit at 390px | desktop-chrome: e2e/contract-briefings.spec.ts:280 — 5/13 (38.5%)<br>mobile-chrome: e2e/contract-briefings.spec.ts:280 — 5/13 (38.5%) |
| 31 | e2e/panorama-framing.spec.ts | e1-night-shift keeps its panorama in world framing across the wide aspect matrix | desktop-chrome: e2e/panorama-framing.spec.ts:18 — ?/13 (callsite outside body)<br>mobile-chrome: e2e/panorama-framing.spec.ts:81 — 5/13 (38.5%) |
| 32 | e2e/panorama-framing.spec.ts | e4-gusher-county keeps its panorama in world framing across the wide aspect matrix | desktop-chrome: e2e/panorama-framing.spec.ts:81 — 5/13 (38.5%)<br>mobile-chrome: e2e/panorama-framing.spec.ts:81 — 5/13 (38.5%) |
| 33 | e2e/run3d-boiler-house.spec.ts | maximum legal Boiler Houses stay within the 115% frame budget | desktop-chrome: e2e/run3d-boiler-house.spec.ts:24 — 5/13 (38.5%)<br>mobile-chrome: e2e/run3d-boiler-house.spec.ts:24 — 5/13 (38.5%) |
| 34 | e2e/terrain3d-registry.spec.ts | all sixteen contracts mount terrain, panorama, and grounded render-only landmarks with matching water | desktop-chrome: e2e/terrain3d-registry.spec.ts:221 — 25/54 (46.3%)<br>mobile-chrome: e2e/terrain3d-registry.spec.ts:217 — 21/54 (38.9%) |
| 35 | e2e/ed-01-descriptor-inspector.spec.ts | editor live-applies a descriptor edit and export/import round-trips byte-equal | desktop-chrome: e2e/ed-01-descriptor-inspector.spec.ts:52 — 28/71 (39.4%)<br>mobile-chrome: e2e/ed-01-descriptor-inspector.spec.ts:52 — 28/71 (39.4%) |
| 36 | e2e/menu-safe-params.spec.ts | ?town3dPilot=all boots the start menu, not a run | desktop-chrome: e2e/menu-safe-params.spec.ts:9 — 4/10 (40.0%)<br>mobile-chrome: e2e/menu-safe-params.spec.ts:9 — 4/10 (40.0%) |
| 37 | e2e/run3d-boiler-house.spec.ts | all loads once, mirrors Boiler Houses, and unmounts on demolish | desktop-chrome: e2e/run3d-boiler-house.spec.ts:24 — 6/15 (40.0%)<br>mobile-chrome: e2e/run3d-boiler-house.spec.ts:24 — 6/15 (40.0%) |
| 38 | e2e/m1-03-wave-pressure.spec.ts | grace holds pressure until sim-t 5, then first trickle arrives | desktop-chrome: e2e/m1-03-wave-pressure.spec.ts:35 — 4/10 (40.0%)<br>mobile-chrome: e2e/m1-03-wave-pressure.spec.ts:35 — 4/10 (40.0%) |
| 39 | e2e/blast-relief-height.spec.ts | zero-height samples preserve flat impact offset and sim payload determinism | desktop-chrome: e2e/blast-relief-height.spec.ts:115 — 14/35 (40.0%)<br>mobile-chrome: e2e/blast-relief-height.spec.ts:115 — 14/35 (40.0%) |
| 40 | e2e/visual.spec.ts | terrain diagnostics expose claim zones and speeds | desktop-chrome: e2e/visual.spec.ts:118 — 5/12 (41.7%)<br>mobile-chrome: e2e/visual.spec.ts:118 — 5/12 (41.7%) |
| 41 | e2e/e2-enemies.spec.ts | wave pulses spawn Rail Toughs, Steam Wreckers, and Coal Thieves from E2 data | desktop-chrome: e2e/e2-enemies.spec.ts:121 — 8/19 (42.1%)<br>mobile-chrome: e2e/e2-enemies.spec.ts:121 — 8/19 (42.1%) |
| 42 | e2e/run3d-boiler-house.spec.ts | lite and invalid bytes retain the Boiler House sprite fallback | desktop-chrome: e2e/run3d-boiler-house.spec.ts:82 — 6/14 (42.9%)<br>mobile-chrome: e2e/run3d-boiler-house.spec.ts:82 — 6/14 (42.9%) |
| 43 | e2e/er01-e3-census.spec.ts | e3-blackout-ridge census support is explicit and deterministic | desktop-chrome: e2e/er01-e3-census.spec.ts:183 — 172/394 (43.7%)<br>mobile-chrome: e2e/er01-e3-census.spec.ts:183 — 172/394 (43.7%) |
| 44 | e2e/e1-twin-banks.spec.ts | builds sluices and stockpiles on both banks against one gold pool | desktop-chrome: e2e/e1-twin-banks.spec.ts:48 — 7/16 (43.8%)<br>mobile-chrome: e2e/e1-twin-banks.spec.ts:48 — 7/16 (43.8%) |
| 45 | e2e/m2-07-base-self-hold.spec.ts | SELF-HOLD reference base survives two wave-15 pulse cycles without hero intervention | desktop-chrome: e2e/m2-07-base-self-hold.spec.ts:96 — 23/51 (45.1%)<br>mobile-chrome: e2e/m2-07-base-self-hold.spec.ts:96 — 23/51 (45.1%) |
| 46 | e2e/run3d-boiler-house.spec.ts | LITE keeps the Boiler House sprite shell and requests no GLB | desktop-chrome: e2e/run3d-boiler-house.spec.ts:49 — 5/11 (45.5%)<br>mobile-chrome: e2e/run3d-boiler-house.spec.ts:49 — 5/11 (45.5%) |
| 47 | e2e/perf-05-startup.spec.ts | startup reaches playable quickly and defers non-critical textures | desktop-chrome: e2e/perf-05-startup.spec.ts:231 — 5/11 (45.5%)<br>mobile-chrome: e2e/perf-05-startup.spec.ts:231 — 5/11 (45.5%) |
| 48 | e2e/m3-05b-run-ledger.spec.ts | Claim Office opens a responsive Run Ledger and a profile reset returns its warm empty state | desktop-chrome: e2e/m3-05b-run-ledger.spec.ts:163 — 12/26 (46.2%)<br>mobile-chrome: e2e/m3-05b-run-ledger.spec.ts:163 — 12/26 (46.2%) |
| 49 | e2e/m2-07-base-self-hold.spec.ts | SELF-HOLD reference base keeps half standing through wave-25 pulse cycles | desktop-chrome: e2e/m2-07-base-self-hold.spec.ts:96 — 23/48 (47.9%)<br>mobile-chrome: e2e/m2-07-base-self-hold.spec.ts:96 — 23/48 (47.9%) |
| 50 | e2e/perf-02-fullbase-bench.spec.ts | full-base benchmark stays inside draw-call and frame envelopes | desktop-chrome: e2e/perf-02-fullbase-bench.spec.ts:47 — 12/25 (48.0%)<br>mobile-chrome: e2e/perf-02-fullbase-bench.spec.ts:47 — 12/25 (48.0%) |
| 51 | e2e/e7-boss.spec.ts | mirrors the live base, grades novelty, and keeps the Echo in a jar without a kill | desktop-chrome: e2e/e7-boss.spec.ts:116 — 38/79 (48.1%)<br>mobile-chrome: e2e/e7-boss.spec.ts:116 — 38/79 (48.1%) |
| 52 | e2e/e2-trestle.spec.ts | The Trestle unlocks after Hill Mine and runs the shipped crossing systems | desktop-chrome: e2e/e2-trestle.spec.ts:96 — 36/74 (48.6%)<br>mobile-chrome: e2e/e2-trestle.spec.ts:96 — 36/74 (48.6%) |
| 53 | e2e/town-t1-square.spec.ts | menu enters town square, prompts at four shells, exits, then starts normal run | desktop-chrome: e2e/town-t1-square.spec.ts:66 — 18/36 (50.0%)<br>mobile-chrome: e2e/town-t1-square.spec.ts:74 — ?/36 (callsite outside body) |
| 54 | e2e/task-031-anim-roundness.spec.ts | default frame blending and gait motion are active for hero and bandits | desktop-chrome: e2e/task-031-anim-roundness.spec.ts:202 — 27/52 (51.9%)<br>mobile-chrome: e2e/task-031-anim-roundness.spec.ts:202 — 27/52 (51.9%) |
| 55 | e2e/065-shots-follow-terrain.spec.ts | flat Claim shots keep the old zero-height bolt plane | desktop-chrome: e2e/065-shots-follow-terrain.spec.ts:129 — 11/21 (52.4%)<br>mobile-chrome: e2e/065-shots-follow-terrain.spec.ts:129 — 11/21 (52.4%) |
| 56 | e2e/xp-economy-audit.spec.ts | seeded dense kill windows bank every death XP exactly once | desktop-chrome: e2e/xp-economy-audit.spec.ts:53 — 8/15 (53.3%)<br>mobile-chrome: e2e/xp-economy-audit.spec.ts:53 — 8/15 (53.3%) |
| 57 | e2e/m2-06-arsenal-blast-charge.spec.ts | stress blast pool never exceeds cap | desktop-chrome: e2e/m2-06-arsenal-blast-charge.spec.ts:228 — 16/30 (53.3%)<br>mobile-chrome: e2e/m2-06-arsenal-blast-charge.spec.ts:228 — 16/30 (53.3%) |
| 58 | e2e/m2-07-base-self-hold.spec.ts | blast clump TTK at wave 20+ stays within 2x wave-10 | desktop-chrome: e2e/m2-07-base-self-hold.spec.ts:212 — 14/26 (53.8%)<br>mobile-chrome: e2e/m2-07-base-self-hold.spec.ts:371 — 22/26 (84.6%) |
| 59 | e2e/cp03-press-loop.spec.ts | the Press loop: edit, stamp, shelve, launch a real run, and return | desktop-chrome: e2e/cp03-press-loop.spec.ts:64 — 39/71 (54.9%)<br>mobile-chrome: e2e/cp03-press-loop.spec.ts:64 — 39/71 (54.9%) |
| 60 | e2e/cw-02-escort.spec.ts | board-selected Canyon escort delivers one capacitor crate through a repaired brown-out | desktop-chrome: e2e/cw-02-escort.spec.ts:128 — 67/121 (55.4%)<br>mobile-chrome: e2e/cw-02-escort.spec.ts:61 — ?/121 (callsite outside body) |
| 61 | e2e/visual.spec.ts | river band slows the hero through diagnostics | desktop-chrome: e2e/visual.spec.ts:226 — 14/25 (56.0%)<br>mobile-chrome: e2e/visual.spec.ts:230 — 18/25 (72.0%) |
| 62 | e2e/terrain-seamless.spec.ts | all shipped terrain de-tiles deterministically within FULL and LITE budgets | desktop-chrome: e2e/terrain-seamless.spec.ts:147 — 26/46 (56.5%)<br>mobile-chrome: e2e/terrain-seamless.spec.ts:121 — ?/46 (callsite outside body) |
| 63 | e2e/terrain3d-registry.spec.ts | all fifteen contracts stay painted in LITE and on invalid terrain bytes | desktop-chrome: e2e/terrain3d-registry.spec.ts:362 — 17/30 (56.7%)<br>mobile-chrome: e2e/terrain3d-registry.spec.ts:362 — 17/30 (56.7%) |
| 64 | e2e/ss-02-beats.spec.ts | once beats are marked only when displayed and queued beats survive reload | desktop-chrome: e2e/ss-02-beats.spec.ts:200 — ?/30 (callsite outside body)<br>mobile-chrome: e2e/ss-02-beats.spec.ts:217 — 17/30 (56.7%) |
| 65 | e2e/045-megaproject.spec.ts | debug dev megaproject reserves, funds, delays, completes, and persists | desktop-chrome: e2e/045-megaproject.spec.ts:168 — 104/115 (90.4%)<br>mobile-chrome: e2e/045-megaproject.spec.ts:131 — 67/115 (58.3%) |
| 66 | e2e/tl-01-run-telemetry.spec.ts | plain no-debug secure return keeps telemetry invisible to gameplay | desktop-chrome: e2e/tl-01-run-telemetry.spec.ts:236 — 7/12 (58.3%)<br>mobile-chrome: e2e/tl-01-run-telemetry.spec.ts:236 — 7/12 (58.3%) |
| 67 | e2e/terrain3d-registry.spec.ts | rim and horizon probes keep the terrain meeting gradual and every panorama readable | desktop-chrome: e2e/terrain3d-registry.spec.ts:303 — 31/53 (58.5%)<br>mobile-chrome: e2e/terrain3d-registry.spec.ts:272 — ?/53 (callsite outside body) |
| 68 | e2e/tl-03-assay-office-site.spec.ts | renders populated Assay Office aggregates | desktop-chrome: e2e/tl-03-assay-office-site.spec.ts:44 — 12/20 (60.0%)<br>mobile-chrome: e2e/tl-03-assay-office-site.spec.ts:44 — 12/20 (60.0%) |
| 69 | e2e/wire-era-anchor-emitters.spec.ts | Voltage arcs and Motor dust mount at their era anchors within the shared budget | desktop-chrome: e2e/wire-era-anchor-emitters.spec.ts:95 — 15/25 (60.0%)<br>mobile-chrome: e2e/wire-era-anchor-emitters.spec.ts:95 — 15/25 (60.0%) |
| 70 | e2e/er01-e7-census.spec.ts | e7-dead-band census refuses the unsocketed Signal mechanics | desktop-chrome: e2e/er01-e7-census.spec.ts:49 — 28/46 (60.9%)<br>mobile-chrome: e2e/er01-e7-census.spec.ts:49 — 28/46 (60.9%) |
| 71 | e2e/er01-e7-census.spec.ts | e7-echo-canyon census refuses the unsocketed Signal mechanics | desktop-chrome: e2e/er01-e7-census.spec.ts:49 — 28/46 (60.9%)<br>mobile-chrome: e2e/er01-e7-census.spec.ts:49 — 28/46 (60.9%) |
| 72 | e2e/er01-e7-census.spec.ts | e7-relay-rush census refuses the unsocketed Signal mechanics | desktop-chrome: e2e/er01-e7-census.spec.ts:49 — 28/46 (60.9%)<br>mobile-chrome: e2e/er01-e7-census.spec.ts:49 — 28/46 (60.9%) |
| 73 | e2e/er01-e7-census.spec.ts | e7-relay-valley census refuses the unsocketed Signal mechanics | desktop-chrome: e2e/er01-e7-census.spec.ts:49 — 28/46 (60.9%)<br>mobile-chrome: e2e/er01-e7-census.spec.ts:49 — 28/46 (60.9%) |
| 74 | e2e/water-mask-engine.spec.ts | the Claim keeps its legacy water contract byte-for-byte when no mask is authored | desktop-chrome: e2e/water-mask-engine.spec.ts:39 — 16/26 (61.5%)<br>mobile-chrome: e2e/water-mask-engine.spec.ts:39 — 16/26 (61.5%) |
| 75 | e2e/agent-view.spec.ts | the seeded rider view stays cache-shaped and grows one honest wave at a time | desktop-chrome: e2e/agent-view.spec.ts:511 — 85/137 (62.0%)<br>mobile-chrome: e2e/agent-view.spec.ts:511 — 85/137 (62.0%) |
| 76 | e2e/064-river-continues.spec.ts | river-zone, panning, and sluice sim contracts stay unchanged | desktop-chrome: e2e/064-river-continues.spec.ts:104 — ?/27 (callsite outside body)<br>mobile-chrome: e2e/064-river-continues.spec.ts:121 — 17/27 (63.0%) |
| 77 | e2e/er01-e10-census.spec.ts | e10-archive-world census cites the existing Deep Sky debt | desktop-chrome: e2e/er01-e10-census.spec.ts:59 — 31/49 (63.3%)<br>mobile-chrome: e2e/er01-e10-census.spec.ts:59 — 31/49 (63.3%) |
| 78 | e2e/er01-e10-census.spec.ts | e10-ember-shore census cites the existing Deep Sky debt | desktop-chrome: e2e/er01-e10-census.spec.ts:59 — 31/49 (63.3%)<br>mobile-chrome: e2e/er01-e10-census.spec.ts:59 — 31/49 (63.3%) |
| 79 | e2e/er01-e10-census.spec.ts | e10-last-claim census cites the existing Deep Sky debt | desktop-chrome: e2e/er01-e10-census.spec.ts:59 — 31/49 (63.3%)<br>mobile-chrome: e2e/er01-e10-census.spec.ts:59 — 31/49 (63.3%) |
| 80 | e2e/er01-e10-census.spec.ts | e10-river census cites the existing Deep Sky debt | desktop-chrome: e2e/er01-e10-census.spec.ts:59 — 31/49 (63.3%)<br>mobile-chrome: e2e/er01-e10-census.spec.ts:59 — 31/49 (63.3%) |
| 81 | e2e/061-first-claim-onboarding.spec.ts | mobile first-entry trail and tavern pulse fit at 390px | desktop-chrome: e2e/061-first-claim-onboarding.spec.ts:74 — 6/9 (66.7%)<br>mobile-chrome: e2e/061-first-claim-onboarding.spec.ts:137 — ?/9 (callsite outside body) |
| 82 | e2e/audio-integration.spec.ts | legacy audio preferences migrate into profile storage | desktop-chrome: e2e/audio-integration.spec.ts:141 — 23/34 (67.6%)<br>mobile-chrome: e2e/audio-integration.spec.ts:141 — 23/34 (67.6%) |
| 83 | e2e/m2-07b-building-incentive-tune.spec.ts | half-damaged sluice repairs for proportional global cost | desktop-chrome: e2e/m2-07b-building-incentive-tune.spec.ts:133 — 38/56 (67.9%)<br>mobile-chrome: e2e/m2-07b-building-incentive-tune.spec.ts:133 — 38/56 (67.9%) |
| 84 | e2e/m2-03-wave-scheduler.spec.ts | spawn accounting follows the knee budget at waves 8, 10, and 14 | desktop-chrome: e2e/m2-03-wave-scheduler.spec.ts:144 — 18/26 (69.2%)<br>mobile-chrome: e2e/m2-03-wave-scheduler.spec.ts:144 — 18/26 (69.2%) |
| 85 | e2e/e2-hill-mine.spec.ts | Hill Mine render descriptor auto-activates mesh relief and leaves the flat claim fallback alone | desktop-chrome: e2e/e2-hill-mine.spec.ts:166 — 35/50 (70.0%)<br>mobile-chrome: e2e/e2-hill-mine.spec.ts:166 — 35/50 (70.0%) |
| 86 | e2e/world-info-notes.spec.ts | building notes sit with existing assay and upgrade prompts | desktop-chrome: e2e/world-info-notes.spec.ts:196 — ?/37 (callsite outside body)<br>mobile-chrome: e2e/world-info-notes.spec.ts:98 — 26/37 (70.3%) |
| 87 | e2e/e2-pressure-in-run.spec.ts | coal feeds boilers, pressure vents, and PRESSURIZE completes | desktop-chrome: e2e/e2-pressure-in-run.spec.ts:74 — 50/71 (70.4%)<br>mobile-chrome: e2e/e2-pressure-in-run.spec.ts:74 — 50/71 (70.4%) |
| 88 | e2e/town-t5-townsfolk.spec.ts | approach barks identify sampled speakers and the Prospector greets by town name | desktop-chrome: e2e/town-t5-townsfolk.spec.ts:104 — 12/17 (70.6%)<br>mobile-chrome: e2e/town-t5-townsfolk.spec.ts:104 — 12/17 (70.6%) |
| 89 | e2e/m2-04-gold-stealing.spec.ts | thief routes around a finite palisade line to steal | desktop-chrome: e2e/m2-04-gold-stealing.spec.ts:223 — 12/17 (70.6%)<br>mobile-chrome: e2e/m2-04-gold-stealing.spec.ts:223 — 12/17 (70.6%) |
| 90 | e2e/m2-06-arsenal-blast-charge.spec.ts | turret line of sight ignores blocked nearest and shoots clear second target | desktop-chrome: e2e/m2-06-arsenal-blast-charge.spec.ts:155 — 24/34 (70.6%)<br>mobile-chrome: e2e/m2-06-arsenal-blast-charge.spec.ts:155 — 24/34 (70.6%) |
| 91 | e2e/town-t2-naming.spec.ts | founding input is usable at 390px | desktop-chrome: e2e/town-t2-naming.spec.ts:182 — 13/18 (72.2%)<br>mobile-chrome: e2e/town-t2-naming.spec.ts:182 — 13/18 (72.2%) |
| 92 | e2e/er01-e8-census.spec.ts | e8-eclipse census rejects the unsocketed Orbital contract | desktop-chrome: e2e/er01-e8-census.spec.ts:52 — 38/51 (74.5%)<br>mobile-chrome: e2e/er01-e8-census.spec.ts:52 — 38/51 (74.5%) |
| 93 | e2e/er01-e8-census.spec.ts | e8-mare-claim census rejects the unsocketed Orbital contract | desktop-chrome: e2e/er01-e8-census.spec.ts:52 — 38/51 (74.5%)<br>mobile-chrome: e2e/er01-e8-census.spec.ts:52 — 38/51 (74.5%) |
| 94 | e2e/pb02-replay-actor.spec.ts | PB-02 replay actor › event parity — a second actor reproduces the recorded session | desktop-chrome: e2e/pb02-replay-actor.spec.ts:119 — 41/55 (74.5%)<br>mobile-chrome: e2e/pb02-replay-actor.spec.ts:119 — 41/55 (74.5%) |
| 95 | e2e/e9-arsenal.spec.ts | Cure-Arms free people and power fevered machines down without death events | desktop-chrome: e2e/e9-arsenal.spec.ts:92 — 15/20 (75.0%)<br>mobile-chrome: e2e/e9-arsenal.spec.ts:92 — 15/20 (75.0%) |
| 96 | e2e/night3d-perf.spec.ts | daylight matrix and Night Shift pressure stay within the painted 115% p95 gate | desktop-chrome: e2e/night3d-perf.spec.ts:89 — 22/28 (78.6%)<br>mobile-chrome: e2e/night3d-perf.spec.ts:88 — 21/28 (75.0%) |
| 97 | e2e/terrain3d-default.spec.ts | promoted terrain stays inside the 115% p95 budget | desktop-chrome: e2e/terrain3d-default.spec.ts:145 — ?/20 (callsite outside body)<br>mobile-chrome: e2e/terrain3d-default.spec.ts:160 — 15/20 (75.0%) |
| 98 | e2e/beauty-atmos-horizon.spec.ts | the apron paint does not leak to a map with no profile | desktop-chrome: e2e/beauty-atmos-horizon.spec.ts:56 — 6/8 (75.0%)<br>mobile-chrome: e2e/beauty-atmos-horizon.spec.ts:56 — 6/8 (75.0%) |
| 99 | e2e/vp-03-terrain-variety.spec.ts | distant bank ground varies without adding draw calls | desktop-chrome: e2e/vp-03-terrain-variety.spec.ts:56 — ?/9 (callsite outside body)<br>mobile-chrome: e2e/vp-03-terrain-variety.spec.ts:63 — 7/9 (77.8%) |
| 100 | e2e/gt-03-enemy-elevation.spec.ts | enemies slow on slopes and expose grounded terrain diagnostics | desktop-chrome: e2e/gt-03-enemy-elevation.spec.ts:146 — 21/27 (77.8%)<br>mobile-chrome: e2e/gt-03-enemy-elevation.spec.ts:147 — 22/27 (81.5%) |
| 101 | e2e/town-plaza-props-blender.spec.ts | plaza props stay lazy by default and mount every layout instance with one fetch per family | desktop-chrome: e2e/town-plaza-props-blender.spec.ts:57 — 14/18 (77.8%)<br>mobile-chrome: e2e/town-plaza-props-blender.spec.ts:57 — 14/18 (77.8%) |
| 102 | e2e/bt-01-tiers.spec.ts | Enter tears down after clicking upgrade instead of re-clicking the focused upgrade button | desktop-chrome: e2e/bt-01-tiers.spec.ts:216 — 11/14 (78.6%)<br>mobile-chrome: e2e/bt-01-tiers.spec.ts:216 — 11/14 (78.6%) |
| 103 | e2e/bt-00-demolish.spec.ts | building context bar keeps both actions inside a mid-size phone viewport | desktop-chrome: e2e/bt-00-demolish.spec.ts:195 — 19/24 (79.2%)<br>mobile-chrome: e2e/bt-00-demolish.spec.ts:195 — 19/24 (79.2%) |
| 104 | e2e/er01-e5-census.spec.ts | e5-deepwater-claim census refusal is explicit | desktop-chrome: e2e/er01-e5-census.spec.ts:163 — 109/137 (79.6%)<br>mobile-chrome: e2e/er01-e5-census.spec.ts:163 — 109/137 (79.6%) |
| 105 | e2e/f1575-1-drift-tick-budget.spec.ts | maps denied-receipt drift at fixed start phase P=35 | desktop-chrome: e2e/f1575-1-drift-tick-budget.spec.ts:100 — 39/49 (79.6%)<br>mobile-chrome: e2e/f1575-1-drift-tick-budget.spec.ts:100 — 39/49 (79.6%) |
| 106 | e2e/f1575-1-drift-tick-budget.spec.ts | maps denied-receipt drift at fixed start phase P=39 | desktop-chrome: e2e/f1575-1-drift-tick-budget.spec.ts:100 — 39/49 (79.6%)<br>mobile-chrome: e2e/f1575-1-drift-tick-budget.spec.ts:100 — 39/49 (79.6%) |
| 107 | e2e/f1575-1-drift-tick-budget.spec.ts | maps denied-receipt drift at fixed start phase P=43 | desktop-chrome: e2e/f1575-1-drift-tick-budget.spec.ts:100 — 39/49 (79.6%)<br>mobile-chrome: e2e/f1575-1-drift-tick-budget.spec.ts:100 — 39/49 (79.6%) |
| 108 | e2e/f1575-1-drift-tick-budget.spec.ts | maps denied-receipt drift at fixed start phase P=47 | desktop-chrome: e2e/f1575-1-drift-tick-budget.spec.ts:100 — 39/49 (79.6%)<br>mobile-chrome: e2e/f1575-1-drift-tick-budget.spec.ts:100 — 39/49 (79.6%) |
| 109 | e2e/town-chapel-blender.spec.ts | Chapel pilot is lazy, contract-valid, visual-only, and stays inside the frame-time gate | desktop-chrome: e2e/town-chapel-blender.spec.ts:184 — 40/50 (80.0%)<br>mobile-chrome: e2e/town-chapel-blender.spec.ts:184 — 40/50 (80.0%) |
| 110 | e2e/wire-crawler-3d.spec.ts | mounts the Crawler GLB, flips all three damage morphs, and disposes on kill | desktop-chrome: e2e/renderer-count-artifact.ts:37 — 32/40 (80.0%)<br>mobile-chrome: e2e/renderer-count-artifact.ts:37 — 32/40 (80.0%) |
| 111 | e2e/press-edit-visibility.spec.ts | raise and pond edits render live, then survive the stamped launch | desktop-chrome: e2e/press-edit-visibility.spec.ts:75 — 40/50 (80.0%)<br>mobile-chrome: e2e/press-edit-visibility.spec.ts:75 — 40/50 (80.0%) |
| 112 | e2e/m1-02-auto-fire.spec.ts | stress pack never exceeds the bolt pool and logs no console errors | desktop-chrome: e2e/m1-02-auto-fire.spec.ts:57 — 16/20 (80.0%)<br>mobile-chrome: e2e/m1-02-auto-fire.spec.ts:57 — 16/20 (80.0%) |
| 113 | e2e/er01-e6-census.spec.ts | e6-glow-mesa census socket runs and still refuses admission | desktop-chrome: e2e/er01-e6-census.spec.ts:112 — 84/104 (80.8%)<br>mobile-chrome: e2e/er01-e6-census.spec.ts:112 — 84/104 (80.8%) |
| 114 | e2e/er01-e6-census.spec.ts | e6-half-life-hollow census socket runs and still refuses admission | desktop-chrome: e2e/er01-e6-census.spec.ts:112 — 84/104 (80.8%)<br>mobile-chrome: e2e/er01-e6-census.spec.ts:112 — 84/104 (80.8%) |
| 115 | e2e/er01-e6-census.spec.ts | e6-picnic census socket runs and still refuses admission | desktop-chrome: e2e/er01-e6-census.spec.ts:112 — 84/104 (80.8%)<br>mobile-chrome: e2e/er01-e6-census.spec.ts:112 — 84/104 (80.8%) |
| 116 | e2e/er01-e6-census.spec.ts | e6-showroom census socket runs and still refuses admission | desktop-chrome: e2e/er01-e6-census.spec.ts:112 — 84/104 (80.8%)<br>mobile-chrome: e2e/er01-e6-census.spec.ts:112 — 84/104 (80.8%) |
| 117 | e2e/town-dynamo-hall-blender.spec.ts | complete Dynamo Hall loads one bounded painted mesh without changing its interaction | desktop-chrome: e2e/town-dynamo-hall-blender.spec.ts:110 — 13/16 (81.3%)<br>mobile-chrome: e2e/town-dynamo-hall-blender.spec.ts:110 — 13/16 (81.3%) |
| 118 | e2e/bt-01-tiers.spec.ts | insufficient gold leaves tier and gold unchanged | desktop-chrome: e2e/bt-01-tiers.spec.ts:443 — 13/16 (81.3%)<br>mobile-chrome: e2e/bt-01-tiers.spec.ts:443 — 13/16 (81.3%) |
| 119 | e2e/town-tavern-blender.spec.ts | Tavern pilot is lazy, contract-valid, visual-only, and stays inside the frame-time gate | desktop-chrome: e2e/town-tavern-blender.spec.ts:183 — 39/48 (81.3%)<br>mobile-chrome: e2e/town-tavern-blender.spec.ts:183 — 39/48 (81.3%) |
| 120 | e2e/w1-07-natural.spec.ts | ford approach and sim lanes stay visually calm while the sim remains planar | desktop-chrome: e2e/w1-07-natural.spec.ts:91 — 18/22 (81.8%)<br>mobile-chrome: e2e/w1-07-natural.spec.ts:91 — 18/22 (81.8%) |
| 121 | e2e/e1-night-shift.spec.ts | loads Night Shift contract data and ramps full, dusk, dark, dawn lighting | desktop-chrome: e2e/e1-night-shift.spec.ts:352 — 81/98 (82.7%)<br>mobile-chrome: e2e/e1-night-shift.spec.ts:271 — ?/98 (callsite outside body) |
| 122 | e2e/tile-identity-pass.spec.ts | E1 contracts load place descriptors, render identity shots, and stay deterministic | desktop-chrome: e2e/tile-identity-pass.spec.ts:131 — 10/12 (83.3%)<br>mobile-chrome: e2e/tile-identity-pass.spec.ts:131 — 10/12 (83.3%) |
| 123 | e2e/town-general-store-blender.spec.ts | General Store pilot is lazy, contract-valid, visual-only, and stays inside the frame-time gate | desktop-chrome: e2e/town-general-store-blender.spec.ts:186 — 40/48 (83.3%)<br>mobile-chrome: e2e/town-general-store-blender.spec.ts:186 — 40/48 (83.3%) |
| 124 | e2e/cp04-lever.spec.ts | the Lever is three choices and one press, then launches through the charter seam | desktop-chrome: e2e/cp04-lever.spec.ts:106 — 45/54 (83.3%)<br>mobile-chrome: e2e/cp04-lever.spec.ts:106 — 45/54 (83.3%) |
| 125 | e2e/ts-04-living-pass.spec.ts | TS-04 actors follow baked trails for a 30s scene capture with no storage or sim writes | desktop-chrome: e2e/ts-04-living-pass.spec.ts:60 — ?/46 (callsite outside body)<br>mobile-chrome: e2e/ts-04-living-pass.spec.ts:99 — 39/46 (84.8%) |
| 126 | e2e/enemy-gap-flow.spec.ts | a multi-turn route clears successive open walls without gnawing | desktop-chrome: e2e/enemy-gap-flow.spec.ts:154 — 18/21 (85.7%)<br>mobile-chrome: e2e/enemy-gap-flow.spec.ts:154 — 18/21 (85.7%) |
| 127 | e2e/e1-night-shift.spec.ts | lantern post is Night Shift gated and relights a true-dark light ring | desktop-chrome: e2e/e1-night-shift.spec.ts:405 — 33/38 (86.8%)<br>mobile-chrome: e2e/e1-night-shift.spec.ts:372 — ?/38 (callsite outside body) |
| 128 | e2e/cp04-lever.spec.ts | seeded boot e1-baron/big-build/classic starts clean | desktop-chrome: e2e/cp04-lever.spec.ts:176 — 14/16 (87.5%)<br>mobile-chrome: e2e/cp04-lever.spec.ts:176 — 14/16 (87.5%) |
| 129 | e2e/cp04-lever.spec.ts | seeded boot e1-dry-gulch/big-build/busy starts clean | desktop-chrome: e2e/cp04-lever.spec.ts:176 — 14/16 (87.5%)<br>mobile-chrome: e2e/cp04-lever.spec.ts:176 — 14/16 (87.5%) |
| 130 | e2e/cp04-lever.spec.ts | seeded boot e1-dry-gulch/defend/classic starts clean | desktop-chrome: e2e/cp04-lever.spec.ts:176 — 14/16 (87.5%)<br>mobile-chrome: e2e/cp04-lever.spec.ts:176 — 14/16 (87.5%) |
| 131 | e2e/cp04-lever.spec.ts | seeded boot e1-night-shift/big-build/gentle starts clean | desktop-chrome: e2e/cp04-lever.spec.ts:176 — 14/16 (87.5%)<br>mobile-chrome: e2e/cp04-lever.spec.ts:176 — 14/16 (87.5%) |
| 132 | e2e/cp04-lever.spec.ts | seeded boot e1-night-shift/explore-quiet/busy starts clean | desktop-chrome: e2e/cp04-lever.spec.ts:176 — 14/16 (87.5%)<br>mobile-chrome: e2e/cp04-lever.spec.ts:176 — 14/16 (87.5%) |
| 133 | e2e/cp04-lever.spec.ts | seeded boot e1-twin-banks/defend/busy starts clean | desktop-chrome: e2e/cp04-lever.spec.ts:176 — 14/16 (87.5%)<br>mobile-chrome: e2e/cp04-lever.spec.ts:176 — 14/16 (87.5%) |
| 134 | e2e/cp04-lever.spec.ts | seeded boot e1-twin-banks/explore-quiet/gentle starts clean | desktop-chrome: e2e/cp04-lever.spec.ts:176 — 14/16 (87.5%)<br>mobile-chrome: e2e/cp04-lever.spec.ts:176 — 14/16 (87.5%) |
| 135 | e2e/ss-01-beats.spec.ts | story card waits until wave banner clears when both fire same tick | desktop-chrome: e2e/ss-01-beats.spec.ts:88 — 15/17 (88.2%)<br>mobile-chrome: e2e/ss-01-beats.spec.ts:88 — 15/17 (88.2%) |
| 136 | e2e/cp05-river.spec.ts | THE RIVER imports, round-trips, re-stamps, and leaves The Claim untouched | desktop-chrome: e2e/cp05-river.spec.ts:57 — 30/34 (88.2%)<br>mobile-chrome: e2e/cp05-river.spec.ts:57 — 30/34 (88.2%) |
| 137 | e2e/m2-05b-overwhelm-valves.spec.ts | lullFloor12 only clamps post-wave-12 pulse spacing | desktop-chrome: e2e/m2-05b-overwhelm-valves.spec.ts:246 — 23/26 (88.5%)<br>mobile-chrome: e2e/m2-05b-overwhelm-valves.spec.ts:246 — 23/26 (88.5%) |
| 138 | e2e/world-info-notes.spec.ts | 390px world note clears the touch stick zone | desktop-chrome: e2e/world-info-notes.spec.ts:322 — ?/19 (callsite outside body)<br>mobile-chrome: e2e/world-info-notes.spec.ts:339 — 17/19 (89.5%) |
| 139 | e2e/map-beauty-dry-gulch.spec.ts | Dry Gulch relief stays inside FULL and LITE render budgets | desktop-chrome: e2e/map-beauty-dry-gulch.spec.ts:75 — 17/19 (89.5%)<br>mobile-chrome: e2e/map-beauty-dry-gulch.spec.ts:75 — 17/19 (89.5%) |
| 140 | e2e/cosmetic-grants.spec.ts | a filed complaint grants, equips, and persists the Reporter's Set | desktop-chrome: e2e/cosmetic-grants.spec.ts:91 — 26/29 (89.7%)<br>mobile-chrome: e2e/cosmetic-grants.spec.ts:91 — 26/29 (89.7%) |
| 141 | e2e/m5-04-offline-queue.spec.ts | booting never posts the default local sample order | desktop-chrome: e2e/m5-04-offline-queue.spec.ts:105 — 10/11 (90.9%)<br>mobile-chrome: e2e/m5-04-offline-queue.spec.ts:105 — 10/11 (90.9%) |
| 142 | e2e/landmark-collision.spec.ts | later-era modeled plaza props use their authored Town footprints | desktop-chrome: e2e/landmark-collision.spec.ts:167 — 10/11 (90.9%)<br>mobile-chrome: e2e/landmark-collision.spec.ts:167 — 10/11 (90.9%) |
| 143 | e2e/wire-e2-enemy-walk4.spec.ts | E2 roster uses advancing walk4 art while E1 keeps the jumper walk8 | desktop-chrome: e2e/wire-e2-enemy-walk4.spec.ts:86 — 71/78 (91.0%)<br>mobile-chrome: e2e/wire-e2-enemy-walk4.spec.ts:86 — 71/78 (91.0%) |
| 144 | e2e/enemy-gap-flow.spec.ts | a connected U-wall routes around its distant opening without gnawing | desktop-chrome: e2e/enemy-gap-flow.spec.ts:181 — 21/23 (91.3%)<br>mobile-chrome: e2e/enemy-gap-flow.spec.ts:181 — 21/23 (91.3%) |
| 145 | e2e/friendly-walls.spec.ts | the family crosses its palisade line while the Fever routes around it | desktop-chrome: e2e/friendly-walls.spec.ts:44 — 34/37 (91.9%)<br>mobile-chrome: e2e/friendly-walls.spec.ts:44 — 34/37 (91.9%) |
| 146 | e2e/wire-railcar-3d.spec.ts | GLB rides the rail, exposes all three damage morphs, preserves wreckage, and disposes | desktop-chrome: e2e/renderer-count-artifact.ts:37 — 90/97 (92.8%)<br>mobile-chrome: e2e/renderer-count-artifact.ts:37 — 90/97 (92.8%) |
| 147 | e2e/er01-e9-census.spec.ts | e9-dome-basin census rejects the unsocketed Red Fields mechanic | desktop-chrome: e2e/er01-e9-census.spec.ts:188 — 174/187 (93.0%)<br>mobile-chrome: e2e/er01-e9-census.spec.ts:188 — 174/187 (93.0%) |
| 148 | e2e/lane-baron-props-detail.spec.ts | the detailed launcher and powder keg mount without the wrecker stone | desktop-chrome: e2e/lane-baron-props-detail.spec.ts:51 — 44/47 (93.6%)<br>mobile-chrome: e2e/lane-baron-props-detail.spec.ts:51 — 44/47 (93.6%) |
| 149 | e2e/m1-02-auto-fire.spec.ts | run reset recycles combat pools without renderer memory growth | desktop-chrome: e2e/m1-02-auto-fire.spec.ts:96 — 32/34 (94.1%)<br>mobile-chrome: e2e/m1-02-auto-fire.spec.ts:96 — 32/34 (94.1%) |
| 150 | e2e/landmark-brightness.spec.ts | The Claim keeps daylight landmarks opaque, lit, and under the frame budget | desktop-chrome: e2e/landmark-brightness.spec.ts:91 — 34/36 (94.4%)<br>mobile-chrome: e2e/landmark-brightness.spec.ts:91 — 34/36 (94.4%) |
| — | e2e/board-card-images.spec.ts | all contract chapters use their own board-card URL | desktop-chrome: e2e/board-card-images.spec.ts:8 — ?/43 (callsite outside body)<br>mobile-chrome: e2e/board-card-images.spec.ts:8 — ?/43 (callsite outside body) |
| — | e2e/m4-07-prospector-panel.spec.ts | auto-collect consent halts and resumes behavior, with stacked newest-first receipts | desktop-chrome: e2e/m4-07-prospector-panel.spec.ts:113 — ?/35 (callsite outside body)<br>mobile-chrome: e2e/m4-07-prospector-panel.spec.ts:113 — ?/35 (callsite outside body) |
| — | e2e/057-baron-rocket-cart.spec.ts | Baron rocket volley targeting is deterministic for the same seed | desktop-chrome: e2e/057-baron-rocket-cart.spec.ts:444 — ?/15 (callsite outside body)<br>mobile-chrome: e2e/057-baron-rocket-cart.spec.ts:444 — ?/15 (callsite outside body) |
| — | e2e/town-t3-board.spec.ts | board launch loads Dry Gulch and New Claim hashes to the default contract config | desktop-chrome: e2e/town-t3-board.spec.ts:222 — ?/21 (callsite outside body)<br>mobile-chrome: e2e/town-t3-board.spec.ts:222 — ?/21 (callsite outside body) |
| — | e2e/ed-02-terrain-brush.spec.ts | brush paints, reloads, restores snapshots, and reimports byte-identically | desktop-chrome: e2e/ed-02-terrain-brush.spec.ts:94 — ?/88 (callsite outside body)<br>mobile-chrome: e2e/ed-02-terrain-brush.spec.ts:94 — ?/88 (callsite outside body) |
| — | e2e/m2-07b-building-incentive-tune.spec.ts | building-targeting bandits share the wave pressure budget | desktop-chrome: e2e/m2-07b-building-incentive-tune.spec.ts:154 — ?/9 (callsite outside body)<br>mobile-chrome: e2e/m2-07b-building-incentive-tune.spec.ts:154 — ?/9 (callsite outside body) |
| — | e2e/town-ts-02b-facades.spec.ts | built town mounts 2.5D facade keys and all six surfaces remain walkable | desktop-chrome: e2e/town-ts-02b-facades.spec.ts:78 — ?/16 (callsite outside body)<br>mobile-chrome: e2e/town-ts-02b-facades.spec.ts:78 — ?/16 (callsite outside body) |
| — | e2e/066-walk8-engine.spec.ts | Claim Jumper walk8 keeps the old stride duration at higher frame count | desktop-chrome: e2e/066-walk8-engine.spec.ts:210 — ?/42 (callsite outside body)<br>mobile-chrome: e2e/066-walk8-engine.spec.ts:210 — ?/42 (callsite outside body) |
| — | e2e/gt-05-water-depth.spec.ts | classic claim keeps deep water impassable while carrying equivalent depth data | desktop-chrome: e2e/gt-05-water-depth.spec.ts:333 — ?/55 (callsite outside body)<br>mobile-chrome: e2e/gt-05-water-depth.spec.ts:333 — ?/55 (callsite outside body) |
| — | e2e/town-t3-board.spec.ts | contract board renders manifest rows, locks, conditions, and per-contract bests | desktop-chrome: e2e/town-t3-board.spec.ts:156 — ?/63 (callsite outside body)<br>mobile-chrome: e2e/town-t3-board.spec.ts:156 — ?/63 (callsite outside body) |
| — | e2e/e1-baron.spec.ts | contract board requires science plus two secured claims and always shows an earned medal | desktop-chrome: e2e/e1-baron.spec.ts:343 — ?/43 (callsite outside body)<br>mobile-chrome: e2e/e1-baron.spec.ts:343 — ?/43 (callsite outside body) |
| — | e2e/terrain3d-claim-pilot.spec.ts | contract-valid GLB feeds every visualY consumer and keeps the water agreement | desktop-chrome: e2e/terrain3d-claim-pilot.spec.ts:76 — ?/61 (callsite outside body)<br>mobile-chrome: e2e/terrain3d-claim-pilot.spec.ts:76 — ?/61 (callsite outside body) |
| — | e2e/vp-02-sprite-animation.spec.ts | damped heading sweep visits every orientation in order | desktop-chrome: e2e/vp-02-sprite-animation.spec.ts:619 — ?/17 (callsite outside body)<br>mobile-chrome: e2e/vp-02-sprite-animation.spec.ts:619 — ?/17 (callsite outside body) |
| — | e2e/057-baron-rocket-cart.spec.ts | defeating the Baron captures the cart, shows the medal line, and unlocks captured research | desktop-chrome: e2e/057-baron-rocket-cart.spec.ts:359 — ?/53 (callsite outside body)<br>mobile-chrome: e2e/057-baron-rocket-cart.spec.ts:359 — ?/53 (callsite outside body) |
| — | e2e/task-024-blast-aim-presets.spec.ts | difficulty presets apply the hard-mode bundle and persist by profile key | desktop-chrome: e2e/task-024-blast-aim-presets.spec.ts:88 — ?/39 (callsite outside body)<br>mobile-chrome: e2e/task-024-blast-aim-presets.spec.ts:88 — ?/39 (callsite outside body) |
| — | e2e/map-census.spec.ts | e2-pressure-garden mobile spot | desktop-chrome: e2e/map-census.spec.ts:43 — ?/15 (callsite outside body)<br>mobile-chrome: e2e/map-census.spec.ts:43 — ?/15 (callsite outside body) |
| — | e2e/map-census.spec.ts | e4-boneyard census | desktop-chrome: e2e/map-census.spec.ts:35 — ?/3 (callsite outside body)<br>mobile-chrome: e2e/map-census.spec.ts:35 — ?/3 (callsite outside body) |
| — | e2e/map-census.spec.ts | e5-deepwater-claim census | desktop-chrome: e2e/map-census.spec.ts:35 — ?/3 (callsite outside body)<br>mobile-chrome: e2e/map-census.spec.ts:35 — ?/3 (callsite outside body) |
| — | e2e/map-census.spec.ts | e5-deepwater-claim mobile spot | desktop-chrome: e2e/map-census.spec.ts:43 — ?/15 (callsite outside body)<br>mobile-chrome: e2e/map-census.spec.ts:43 — ?/15 (callsite outside body) |
| — | e2e/map-census.spec.ts | e7-relay-valley census | desktop-chrome: e2e/map-census.spec.ts:35 — ?/3 (callsite outside body)<br>mobile-chrome: e2e/map-census.spec.ts:35 — ?/3 (callsite outside body) |
| — | e2e/terrain3d-registry.spec.ts | each registered terrain and panorama stays inside the 115% p95 budget | desktop-chrome: e2e/terrain3d-registry.spec.ts:447 — ?/22 (callsite outside body)<br>mobile-chrome: e2e/terrain3d-registry.spec.ts:447 — ?/22 (callsite outside body) |
| — | e2e/vp-02-sprite-animation.spec.ts | east heading uses explicit rotation2 files with unmirrored pixels | desktop-chrome: e2e/vp-02-sprite-animation.spec.ts:566 — ?/50 (callsite outside body)<br>mobile-chrome: e2e/vp-02-sprite-animation.spec.ts:566 — ?/50 (callsite outside body) |
| — | e2e/run-suspend.spec.ts | ended runs clear suspend and town board launch confirms abandoning a saved claim | desktop-chrome: e2e/run-suspend.spec.ts:351 — ?/35 (callsite outside body)<br>mobile-chrome: e2e/run-suspend.spec.ts:351 — ?/35 (callsite outside body) |
| — | e2e/contract-briefings.spec.ts | every current contract launch shows manifest briefing goals and rules | desktop-chrome: e2e/contract-briefings.spec.ts:318 — ?/9 (callsite outside body)<br>mobile-chrome: e2e/contract-briefings.spec.ts:318 — ?/9 (callsite outside body) |
| — | e2e/m1-06-level-up-choices.spec.ts | first offer is deterministic for a fixed seed and has no duplicates | desktop-chrome: e2e/m1-06-level-up-choices.spec.ts:161 — ?/13 (callsite outside body)<br>mobile-chrome: e2e/m1-06-level-up-choices.spec.ts:161 — ?/13 (callsite outside body) |
| — | e2e/town-t2-naming.spec.ts | fresh town naming persists, renames, and appears in recap and run ledger | desktop-chrome: e2e/town-t2-naming.spec.ts:83 — ?/54 (callsite outside body)<br>mobile-chrome: e2e/town-t2-naming.spec.ts:83 — ?/54 (callsite outside body) |
| — | e2e/vp-02b-rotation-resolver.spec.ts | hero locomotion resolves all 8 contract directions | desktop-chrome: e2e/vp-02b-rotation-resolver.spec.ts:113 — ?/13 (callsite outside body)<br>mobile-chrome: e2e/vp-02b-rotation-resolver.spec.ts:113 — ?/13 (callsite outside body) |
| — | e2e/vp-02-sprite-animation.spec.ts | hero walk frameKey alternates while each 8-way heading is held | desktop-chrome: e2e/vp-02-sprite-animation.spec.ts:531 — ?/26 (callsite outside body)<br>mobile-chrome: e2e/vp-02-sprite-animation.spec.ts:531 — ?/26 (callsite outside body) |
| — | e2e/066-walk8-engine.spec.ts | hero walks on the activated walk8 sheet at the ratified cadence | desktop-chrome: e2e/066-walk8-engine.spec.ts:196 — ?/11 (callsite outside body)<br>mobile-chrome: e2e/066-walk8-engine.spec.ts:196 — ?/11 (callsite outside body) |
| — | e2e/w1-04-detail.spec.ts | instanced detail scatter exposes density diagnostics and mobile reduction | desktop-chrome: e2e/w1-04-detail.spec.ts:31 — ?/21 (callsite outside body)<br>mobile-chrome: e2e/w1-04-detail.spec.ts:31 — ?/21 (callsite outside body) |
| — | e2e/m1-06-level-up-choices.spec.ts | investment weighting prefers owned families without losing discovery | desktop-chrome: e2e/m1-06-level-up-choices.spec.ts:177 — ?/32 (callsite outside body)<br>mobile-chrome: e2e/m1-06-level-up-choices.spec.ts:177 — ?/32 (callsite outside body) |
| — | e2e/w1-07-natural.spec.ts | natural claim relief exposes gullies, shelves, bluffs, and pockets | desktop-chrome: e2e/w1-07-natural.spec.ts:47 — ?/23 (callsite outside body)<br>mobile-chrome: e2e/w1-07-natural.spec.ts:47 — ?/23 (callsite outside body) |
| — | e2e/never-trap.spec.ts | Night Shift enemies always make goal progress around object footprints | desktop-chrome: e2e/never-trap.spec.ts:88 — ?/70 (callsite outside body)<br>mobile-chrome: e2e/never-trap.spec.ts:88 — ?/70 (callsite outside body) |
| — | e2e/night3d-perf.spec.ts | Night Shift keeps its lantern read and auto-tiers one sticky step at a time | desktop-chrome: e2e/night3d-perf.spec.ts:98 — ?/77 (callsite outside body)<br>mobile-chrome: e2e/night3d-perf.spec.ts:98 — ?/77 (callsite outside body) |
| — | e2e/e4-dust-flats.spec.ts | offers road grading and the hauler in a normal Motor-era run | desktop-chrome: e2e/e4-dust-flats.spec.ts:97 — ?/15 (callsite outside body)<br>mobile-chrome: e2e/e4-dust-flats.spec.ts:97 — ?/15 (callsite outside body) |
| — | e2e/town-dynamo-hall-blender.spec.ts | owner eye shows the complete Dynamo Hall with every registered 3D building | desktop-chrome: e2e/town-dynamo-hall-blender.spec.ts:140 — ?/3 (callsite outside body)<br>mobile-chrome: e2e/town-dynamo-hall-blender.spec.ts:140 — ?/3 (callsite outside body) |
| — | e2e/ed-03-placement-validator.spec.ts | placement controls commit valid descriptors and explain atomic rejections in-world | desktop-chrome: e2e/ed-03-placement-validator.spec.ts:197 — ?/89 (callsite outside body)<br>mobile-chrome: e2e/ed-03-placement-validator.spec.ts:197 — ?/89 (callsite outside body) |
| — | e2e/ts-01-plaza-ground.spec.ts | plaza descriptor forms a clear ring with baked routes to every slot and the gate | desktop-chrome: e2e/ts-01-plaza-ground.spec.ts:79 — ?/27 (callsite outside body)<br>mobile-chrome: e2e/ts-01-plaza-ground.spec.ts:79 — ?/27 (callsite outside body) |
| — | e2e/e2-rail-entity.spec.ts | rails do not change sim hash and stay under the draw-call budget | desktop-chrome: e2e/e2-rail-entity.spec.ts:166 — ?/24 (callsite outside body)<br>mobile-chrome: e2e/e2-rail-entity.spec.ts:166 — ?/24 (callsite outside body) |
| — | e2e/ui-era-dressing.spec.ts | registered eras render on the menu and a town surface | desktop-chrome: e2e/ui-era-dressing.spec.ts:65 — ?/20 (callsite outside body)<br>mobile-chrome: e2e/ui-era-dressing.spec.ts:65 — ?/20 (callsite outside body) |
| — | e2e/vp-02b-rotation-resolver.spec.ts | resolver hysteresis holds across small boundary oscillation | desktop-chrome: e2e/vp-02b-rotation-resolver.spec.ts:129 — ?/18 (callsite outside body)<br>mobile-chrome: e2e/vp-02b-rotation-resolver.spec.ts:129 — ?/18 (callsite outside body) |
| — | e2e/run-scene-animation-refresh.spec.ts | run boots on the approved female Hero walk8 and advances frames | desktop-chrome: e2e/run-scene-animation-refresh.spec.ts:5 — ?/29 (callsite outside body)<br>mobile-chrome: e2e/run-scene-animation-refresh.spec.ts:5 — ?/29 (callsite outside body) |
| — | e2e/e2-enemies.spec.ts | same seed keeps the E2 roster wave deterministic | desktop-chrome: e2e/e2-enemies.spec.ts:314 — ?/4 (callsite outside body)<br>mobile-chrome: e2e/e2-enemies.spec.ts:314 — ?/4 (callsite outside body) |
| — | e2e/vp-03-terrain-variety.spec.ts | same seed renders deterministic bank ground | desktop-chrome: e2e/vp-03-terrain-variety.spec.ts:68 — ?/15 (callsite outside body)<br>mobile-chrome: e2e/vp-03-terrain-variety.spec.ts:68 — ?/15 (callsite outside body) |
| — | e2e/audio-integration.spec.ts | settings volume and mute persist across reload | desktop-chrome: e2e/audio-integration.spec.ts:80 — ?/35 (callsite outside body)<br>mobile-chrome: e2e/audio-integration.spec.ts:80 — ?/35 (callsite outside body) |
| — | e2e/vp-02-sprite-animation.spec.ts | small boundary wiggle does not oscillate orientation | desktop-chrome: e2e/vp-02-sprite-animation.spec.ts:659 — ?/16 (callsite outside body)<br>mobile-chrome: e2e/vp-02-sprite-animation.spec.ts:659 — ?/16 (callsite outside body) |
| — | e2e/bt-01-tiers.spec.ts | stockpile upgrade names the yard and shows its tier capacity in the build menu | desktop-chrome: e2e/bt-01-tiers.spec.ts:367 — ?/45 (callsite outside body)<br>mobile-chrome: e2e/bt-01-tiers.spec.ts:367 — ?/45 (callsite outside body) |
| — | e2e/research-chart.spec.ts | survey chart renders node states, traces locked requirements, and persists one pin | desktop-chrome: e2e/research-chart.spec.ts:130 — ?/62 (callsite outside body)<br>mobile-chrome: e2e/research-chart.spec.ts:130 — ?/62 (callsite outside body) |
| — | e2e/w1-01-terrain-relief.spec.ts | terrain mesh has seeded relief and mobile density knob | desktop-chrome: e2e/w1-01-terrain-relief.spec.ts:31 — ?/14 (callsite outside body)<br>mobile-chrome: e2e/w1-01-terrain-relief.spec.ts:31 — ?/14 (callsite outside body) |
| — | e2e/ed-05-palette.spec.ts | terrain tint bands use touch-sized pickers and preserve every untouched descriptor byte | desktop-chrome: e2e/ed-05-palette.spec.ts:4 — ?/34 (callsite outside body)<br>mobile-chrome: e2e/ed-05-palette.spec.ts:4 — ?/34 (callsite outside body) |
| — | e2e/terrain3d-registry.spec.ts | terrain2d and the 3D default keep bounds, spawns, fog, masks, and simulation byte-identical per map | desktop-chrome: e2e/terrain3d-registry.spec.ts:328 — ?/14 (callsite outside body)<br>mobile-chrome: e2e/terrain3d-registry.spec.ts:328 — ?/14 (callsite outside body) |
| — | e2e/tr-01-continuous-ground.spec.ts | terrainMesh flag swaps in a one-draw continuous ground mesh and preserves fallback probes | desktop-chrome: e2e/tr-01-continuous-ground.spec.ts:69 — ?/32 (callsite outside body)<br>mobile-chrome: e2e/tr-01-continuous-ground.spec.ts:69 — ?/32 (callsite outside body) |
| — | e2e/map-census.spec.ts | the-claim mobile spot | desktop-chrome: e2e/map-census.spec.ts:43 — ?/15 (callsite outside body)<br>mobile-chrome: e2e/map-census.spec.ts:43 — ?/15 (callsite outside body) |
| — | e2e/m2-05b-overwhelm-valves.spec.ts | theft ping shows edge glyph, auto-hides, and debug flags suppress it | desktop-chrome: e2e/m2-05b-overwhelm-valves.spec.ts:252 — ?/38 (callsite outside body)<br>mobile-chrome: e2e/m2-05b-overwhelm-valves.spec.ts:252 — ?/38 (callsite outside body) |
| — | e2e/gt-02-slope.spec.ts | tile param is debug-gated and first-claim fingerprint remains flat | desktop-chrome: e2e/gt-02-slope.spec.ts:169 — ?/35 (callsite outside body)<br>mobile-chrome: e2e/gt-02-slope.spec.ts:169 — ?/35 (callsite outside body) |
| — | e2e/f-bw-16-baron-siege.spec.ts | unblocked Baron fight keeps its deterministic baseline | desktop-chrome: e2e/f-bw-16-baron-siege.spec.ts:131 — ?/7 (callsite outside body)<br>mobile-chrome: e2e/f-bw-16-baron-siege.spec.ts:131 — ?/7 (callsite outside body) |
| — | e2e/e6-boss-homemaker.spec.ts | unbuilds, tidies, makes one chair, and remains kept without ever hurting the player | desktop-chrome: e2e/e6-boss-homemaker.spec.ts:126 — ?/123 (callsite outside body)<br>mobile-chrome: e2e/e6-boss-homemaker.spec.ts:126 — ?/123 (callsite outside body) |
| — | e2e/w1-06-vista.spec.ts | vista diagnostics expose a low-res radius-90 terrain ring | desktop-chrome: e2e/w1-06-vista.spec.ts:39 — ?/17 (callsite outside body)<br>mobile-chrome: e2e/w1-06-vista.spec.ts:39 — ?/17 (callsite outside body) |
| — | e2e/task-042-anim-smoothness.spec.ts | walk cadence is speed-scaled and restart keeps phase | desktop-chrome: e2e/task-042-anim-smoothness.spec.ts:54 — ?/44 (callsite outside body)<br>mobile-chrome: e2e/task-042-anim-smoothness.spec.ts:54 — ?/44 (callsite outside body) |
| — | e2e/e1-baron.spec.ts | wave 20 spawns the Baron with elite stats, banner, escorts, and stable seed data | desktop-chrome: e2e/e1-baron.spec.ts:489 — ?/34 (callsite outside body)<br>mobile-chrome: e2e/e1-baron.spec.ts:489 — ?/34 (callsite outside body) |

## Crashes and timeouts

| Spec file | Test title | Project | Kind | Failing file:line | First error line |
|---|---|---|---|---|---|
| e2e/050-audio-mix-and-access.spec.ts | pause overlay volume and mute persist and sync with Settings | mobile-chrome | TIMEOUT | e2e/050-audio-mix-and-access.spec.ts:49 | Test timeout of 30000ms exceeded. |
| e2e/055-baron-kill-stop.spec.ts | kill-stop leaves the sim hash identical to a nopause control | desktop-chrome | TIMEOUT | e2e/055-baron-kill-stop.spec.ts:175 | Test timeout of 30000ms exceeded. |
| e2e/057-baron-rocket-cart.spec.ts | Baron rocket volley targeting is deterministic for the same seed | desktop-chrome | TIMEOUT | e2e/057-baron-rocket-cart.spec.ts:444 | Test timeout of 30000ms exceeded. |
| e2e/057-baron-rocket-cart.spec.ts | Baron rocket volley targeting is deterministic for the same seed | mobile-chrome | TIMEOUT | e2e/057-baron-rocket-cart.spec.ts:444 | Test timeout of 30000ms exceeded. |
| e2e/057-baron-rocket-cart.spec.ts | defeating the Baron captures the cart, shows the medal line, and unlocks captured research | desktop-chrome | TIMEOUT | e2e/057-baron-rocket-cart.spec.ts:359 | Test timeout of 30000ms exceeded. |
| e2e/057-baron-rocket-cart.spec.ts | defeating the Baron captures the cart, shows the medal line, and unlocks captured research | mobile-chrome | TIMEOUT | e2e/057-baron-rocket-cart.spec.ts:359 | Test timeout of 30000ms exceeded. |
| e2e/061-first-claim-onboarding.spec.ts | mobile first-entry trail and tavern pulse fit at 390px | mobile-chrome | TIMEOUT | e2e/061-first-claim-onboarding.spec.ts:137 | Test timeout of 30000ms exceeded. |
| e2e/061-first-claim-onboarding.spec.ts | name-only exit keeps the first-claim guide pending until launch | mobile-chrome | TIMEOUT | e2e/061-first-claim-onboarding.spec.ts:149 | Test timeout of 30000ms exceeded. |
| e2e/064-river-continues.spec.ts | river-zone, panning, and sluice sim contracts stay unchanged | desktop-chrome | TIMEOUT | e2e/064-river-continues.spec.ts:104 | Test timeout of 30000ms exceeded. |
| e2e/066-walk8-engine.spec.ts | Claim Jumper walk8 keeps the old stride duration at higher frame count | desktop-chrome | TIMEOUT | e2e/066-walk8-engine.spec.ts:210 | Test timeout of 30000ms exceeded. |
| e2e/066-walk8-engine.spec.ts | Claim Jumper walk8 keeps the old stride duration at higher frame count | mobile-chrome | TIMEOUT | e2e/066-walk8-engine.spec.ts:210 | Test timeout of 30000ms exceeded. |
| e2e/066-walk8-engine.spec.ts | hero walks on the activated walk8 sheet at the ratified cadence | desktop-chrome | TIMEOUT | e2e/066-walk8-engine.spec.ts:196 | Test timeout of 30000ms exceeded. |
| e2e/066-walk8-engine.spec.ts | hero walks on the activated walk8 sheet at the ratified cadence | mobile-chrome | TIMEOUT | e2e/066-walk8-engine.spec.ts:196 | Test timeout of 30000ms exceeded. |
| e2e/072-era-activation.spec.ts | the E2 ceremony can be skipped without undoing activation | mobile-chrome | TIMEOUT | e2e/072-era-activation.spec.ts:354 | Test timeout of 30000ms exceeded. |
| e2e/078-ux-hygiene.spec.ts | ledger Escape closes only the ledger and restores schoolhouse focus | mobile-chrome | TIMEOUT | e2e/078-ux-hygiene.spec.ts:130 | Test timeout of 30000ms exceeded. |
| e2e/ap-standing-orders.spec.ts | plain-boot production orders pan a seam and place a real building | mobile-chrome | TIMEOUT | e2e/ap-standing-orders.spec.ts:342 | Test timeout of 45000ms exceeded. |
| e2e/audio-integration.spec.ts | settings volume and mute persist across reload | desktop-chrome | TIMEOUT | e2e/audio-integration.spec.ts:80 | Test timeout of 30000ms exceeded. |
| e2e/audio-integration.spec.ts | settings volume and mute persist across reload | mobile-chrome | TIMEOUT | e2e/audio-integration.spec.ts:80 | Test timeout of 30000ms exceeded. |
| e2e/beauty-baron.spec.ts | shot 6 — the horizon behind the fort: what the panorama says about his operation | desktop-chrome | TIMEOUT | e2e/beauty-baron.spec.ts:329 | Test timeout of 120000ms exceeded. |
| e2e/beauty-far-ground.spec.ts | the far ground › the far band actually changes, at the pose where the apron is on camera | desktop-chrome | TIMEOUT | e2e/beauty-far-ground.spec.ts:88 | Test timeout of 180000ms exceeded. |
| e2e/beauty-night-shift.spec.ts | night shift beauty board | mobile-chrome | TIMEOUT | e2e/beauty-night-shift.spec.ts:175 | Test timeout of 900000ms exceeded. |
| e2e/board-card-images.spec.ts | all contract chapters use their own board-card URL | desktop-chrome | TIMEOUT | e2e/board-card-images.spec.ts:8 | Test timeout of 30000ms exceeded. |
| e2e/board-card-images.spec.ts | all contract chapters use their own board-card URL | mobile-chrome | TIMEOUT | e2e/board-card-images.spec.ts:8 | Test timeout of 30000ms exceeded. |
| e2e/board-era-chapters.spec.ts | a fresh profile opens only the Frontier chapter and keeps Ride Together and the Claim Ledger | mobile-chrome | TIMEOUT | e2e/board-era-chapters.spec.ts:100 | Test timeout of 30000ms exceeded. |
| e2e/board-era-chapters.spec.ts | debug opens every chapter without removing any contract launch surface | mobile-chrome | TIMEOUT | e2e/board-era-chapters.spec.ts:148 | Test timeout of 30000ms exceeded. |
| e2e/board-era-chapters.spec.ts | the era door exposes chapters through the reached frontier and nothing beyond it | mobile-chrome | TIMEOUT | e2e/board-era-chapters.spec.ts:127 | Test timeout of 30000ms exceeded. |
| e2e/bt-01-tiers.spec.ts | stockpile upgrade names the yard and shows its tier capacity in the build menu | desktop-chrome | TIMEOUT | e2e/bt-01-tiers.spec.ts:367 | Test timeout of 30000ms exceeded. |
| e2e/bt-01-tiers.spec.ts | stockpile upgrade names the yard and shows its tier capacity in the build menu | mobile-chrome | TIMEOUT | e2e/bt-01-tiers.spec.ts:367 | Test timeout of 30000ms exceeded. |
| e2e/combat-readability.spec.ts | palisade bars stay in the wall frame for rotationSteps 0 and 1 | desktop-chrome | TIMEOUT | e2e/combat-readability.spec.ts:219 | Test timeout of 30000ms exceeded. |
| e2e/contract-briefings.spec.ts | board cards show the same briefing data | mobile-chrome | TIMEOUT | e2e/contract-briefings.spec.ts:369 | Test timeout of 30000ms exceeded. |
| e2e/contract-briefings.spec.ts | every current contract launch shows manifest briefing goals and rules | desktop-chrome | TIMEOUT | e2e/contract-briefings.spec.ts:318 | Test timeout of 30000ms exceeded. |
| e2e/contract-briefings.spec.ts | every current contract launch shows manifest briefing goals and rules | mobile-chrome | TIMEOUT | e2e/contract-briefings.spec.ts:318 | Test timeout of 30000ms exceeded. |
| e2e/cw-02-escort.spec.ts | board-selected Canyon escort delivers one capacitor crate through a repaired brown-out | mobile-chrome | TIMEOUT | e2e/cw-02-escort.spec.ts:61 | Test timeout of 90000ms exceeded. |
| e2e/e1-baron.spec.ts | Baron manifest loads and taunts fire at waves 5, 12, and 18 | mobile-chrome | TIMEOUT | e2e/e1-baron.spec.ts:411 | Test timeout of 30000ms exceeded. |
| e2e/e1-baron.spec.ts | contract board requires science plus two secured claims and always shows an earned medal | desktop-chrome | TIMEOUT | e2e/e1-baron.spec.ts:343 | Test timeout of 60000ms exceeded. |
| e2e/e1-baron.spec.ts | contract board requires science plus two secured claims and always shows an earned medal | mobile-chrome | TIMEOUT | e2e/e1-baron.spec.ts:343 | Test timeout of 60000ms exceeded. |
| e2e/e1-baron.spec.ts | wave 20 spawns the Baron with elite stats, banner, escorts, and stable seed data | desktop-chrome | TIMEOUT | e2e/e1-baron.spec.ts:489 | Test timeout of 30000ms exceeded. |
| e2e/e1-baron.spec.ts | wave 20 spawns the Baron with elite stats, banner, escorts, and stable seed data | mobile-chrome | TIMEOUT | e2e/e1-baron.spec.ts:489 | Test timeout of 30000ms exceeded. |
| e2e/e1-night-shift.spec.ts | lantern post is Night Shift gated and relights a true-dark light ring | mobile-chrome | TIMEOUT | e2e/e1-night-shift.spec.ts:372 | Test timeout of 30000ms exceeded. |
| e2e/e1-night-shift.spec.ts | loads Night Shift contract data and ramps full, dusk, dark, dawn lighting | mobile-chrome | TIMEOUT | e2e/e1-night-shift.spec.ts:271 | Test timeout of 30000ms exceeded. |
| e2e/e1-perf-pass.spec.ts | E1 maps publish a pressure census and preserve pressure pixels | mobile-chrome | TIMEOUT | e2e/e1-perf-pass.spec.ts:207 | Test timeout of 480000ms exceeded. |
| e2e/e2-enemies.spec.ts | same seed keeps the E2 roster wave deterministic | desktop-chrome | TIMEOUT | e2e/e2-enemies.spec.ts:314 | Test timeout of 30000ms exceeded. |
| e2e/e2-enemies.spec.ts | same seed keeps the E2 roster wave deterministic | mobile-chrome | TIMEOUT | e2e/e2-enemies.spec.ts:314 | Test timeout of 30000ms exceeded. |
| e2e/e2-hill-mine.spec.ts | Hill Mine terrain simulation is deterministic for a seeded route | mobile-chrome | TIMEOUT | e2e/e2-hill-mine.spec.ts:318 | Test timeout of 60000ms exceeded. |
| e2e/e2-rail-entity.spec.ts | rails do not change sim hash and stay under the draw-call budget | desktop-chrome | TIMEOUT | e2e/e2-rail-entity.spec.ts:166 | Test timeout of 30000ms exceeded. |
| e2e/e2-rail-entity.spec.ts | rails do not change sim hash and stay under the draw-call budget | mobile-chrome | TIMEOUT | e2e/e2-rail-entity.spec.ts:166 | Test timeout of 30000ms exceeded. |
| e2e/e2-t2-dynamo-ceremony.spec.ts | the T2 door reports missing science and the Voltage ceremony remains skippable | mobile-chrome | TIMEOUT | e2e/e2-t2-dynamo-ceremony.spec.ts:158 | Test timeout of 30000ms exceeded. |
| e2e/e4-dust-flats.spec.ts | fires the authored storm and peels a convoy off the ORBIT road | mobile-chrome | TIMEOUT | e2e/e4-dust-flats.spec.ts:31 | Test timeout of 90000ms exceeded. |
| e2e/e4-dust-flats.spec.ts | offers road grading and the hauler in a normal Motor-era run | desktop-chrome | TIMEOUT | e2e/e4-dust-flats.spec.ts:97 | Test timeout of 90000ms exceeded. |
| e2e/e4-dust-flats.spec.ts | offers road grading and the hauler in a normal Motor-era run | mobile-chrome | TIMEOUT | e2e/e4-dust-flats.spec.ts:97 | Test timeout of 90000ms exceeded. |
| e2e/e4-dust-flats.spec.ts | publishes a mask table that matches the real Dust Flats contract | mobile-chrome | TIMEOUT | e2e/e4-dust-flats.spec.ts:75 | Test timeout of 90000ms exceeded. |
| e2e/e5-arsenal.spec.ts | pressure-seals the rig and records cure-arm outcomes through the existing resolver | mobile-chrome | TIMEOUT | e2e/e5-arsenal.spec.ts:48 | Test timeout of 30000ms exceeded. |
| e2e/e6-boss-homemaker.spec.ts | unbuilds, tidies, makes one chair, and remains kept without ever hurting the player | desktop-chrome | TIMEOUT | e2e/e6-boss-homemaker.spec.ts:126 | Test timeout of 90000ms exceeded. |
| e2e/e6-boss-homemaker.spec.ts | unbuilds, tidies, makes one chair, and remains kept without ever hurting the player | mobile-chrome | TIMEOUT | e2e/e6-boss-homemaker.spec.ts:126 | Test timeout of 90000ms exceeded. |
| e2e/e6-decay-framework.spec.ts | same-seed decay registration, pause, and aura ticks are deterministic | mobile-chrome | TIMEOUT | e2e/e6-decay-framework.spec.ts:69 | Test timeout of 30000ms exceeded. |
| e2e/e7-playbook-surface.spec.ts | record, name, shelf, and replay use the profile tape store and the slaved rig actor | mobile-chrome | TIMEOUT | e2e/e7-playbook-surface.spec.ts:54 | Test timeout of 30000ms exceeded. |
| e2e/ed-02-authored-grid-substrate.spec.ts | session document changes visual height across reload while the sim fingerprint stays identical | mobile-chrome | TIMEOUT | e2e/ed-02-authored-grid-substrate.spec.ts:93 | Test timeout of 30000ms exceeded. |
| e2e/ed-02-terrain-brush.spec.ts | brush paints, reloads, restores snapshots, and reimports byte-identically | desktop-chrome | TIMEOUT | e2e/ed-02-terrain-brush.spec.ts:94 | Test timeout of 90000ms exceeded. |
| e2e/ed-02-terrain-brush.spec.ts | brush paints, reloads, restores snapshots, and reimports byte-identically | mobile-chrome | TIMEOUT | e2e/ed-02-terrain-brush.spec.ts:94 | Test timeout of 90000ms exceeded. |
| e2e/ed-03-placement-validator.spec.ts | placement controls commit valid descriptors and explain atomic rejections in-world | desktop-chrome | TIMEOUT | e2e/ed-03-placement-validator.spec.ts:197 | Test timeout of 90000ms exceeded. |
| e2e/ed-03-placement-validator.spec.ts | placement controls commit valid descriptors and explain atomic rejections in-world | mobile-chrome | TIMEOUT | e2e/ed-03-placement-validator.spec.ts:197 | Test timeout of 90000ms exceeded. |
| e2e/ed-05-palette.spec.ts | terrain tint bands use touch-sized pickers and preserve every untouched descriptor byte | desktop-chrome | TIMEOUT | e2e/ed-05-palette.spec.ts:4 | Test timeout of 90000ms exceeded. |
| e2e/ed-05-palette.spec.ts | terrain tint bands use touch-sized pickers and preserve every untouched descriptor byte | mobile-chrome | TIMEOUT | e2e/ed-05-palette.spec.ts:4 | Test timeout of 90000ms exceeded. |
| e2e/eight-winds-enemies.spec.ts | diagnostics drive thief northeast and Baron southwest on their correct rows | desktop-chrome | TIMEOUT | e2e/eight-winds-enemies.spec.ts:39 | Test timeout of 60000ms exceeded. |
| e2e/f-bw-16-baron-siege.spec.ts | unblocked Baron fight keeps its deterministic baseline | desktop-chrome | TIMEOUT | e2e/f-bw-16-baron-siege.spec.ts:131 | Test timeout of 30000ms exceeded. |
| e2e/f-bw-16-baron-siege.spec.ts | unblocked Baron fight keeps its deterministic baseline | mobile-chrome | TIMEOUT | e2e/f-bw-16-baron-siege.spec.ts:131 | Test timeout of 30000ms exceeded. |
| e2e/gazette-first-issue.spec.ts | fresh profile gets the pinned first issue badge and can reopen it | mobile-chrome | TIMEOUT | e2e/gazette-first-issue.spec.ts:82 | Test timeout of 30000ms exceeded. |
| e2e/gazette-first-issue.spec.ts | mandatory welcome opens issue one only on the first town entry | mobile-chrome | TIMEOUT | e2e/gazette-first-issue.spec.ts:105 | Test timeout of 30000ms exceeded. |
| e2e/gt-02-slope.spec.ts | tile param is debug-gated and first-claim fingerprint remains flat | desktop-chrome | TIMEOUT | e2e/gt-02-slope.spec.ts:169 | Test timeout of 40000ms exceeded. |
| e2e/gt-02-slope.spec.ts | tile param is debug-gated and first-claim fingerprint remains flat | mobile-chrome | TIMEOUT | e2e/gt-02-slope.spec.ts:169 | Test timeout of 40000ms exceeded. |
| e2e/gt-05-water-depth.spec.ts | classic claim keeps deep water impassable while carrying equivalent depth data | desktop-chrome | TIMEOUT | e2e/gt-05-water-depth.spec.ts:333 | Test timeout of 45000ms exceeded. |
| e2e/gt-05-water-depth.spec.ts | classic claim keeps deep water impassable while carrying equivalent depth data | mobile-chrome | TIMEOUT | e2e/gt-05-water-depth.spec.ts:333 | Test timeout of 45000ms exceeded. |
| e2e/gt-05-water-depth.spec.ts | GT water depth simulation is deterministic | desktop-chrome | TIMEOUT | e2e/gt-05-water-depth.spec.ts:391 | Test timeout of 30000ms exceeded. |
| e2e/landmark-brightness.spec.ts | Night Shift keeps ground light pools without mutating landmark materials | desktop-chrome | TIMEOUT | e2e/landmark-brightness.spec.ts:96 | Test timeout of 30000ms exceeded. |
| e2e/lane-boss-healthbar.spec.ts | boss damage leaves green life over red loss | mobile-chrome | TIMEOUT | e2e/lane-boss-healthbar.spec.ts:8 | Test timeout of 30000ms exceeded. |
| e2e/m1-06-level-up-choices.spec.ts | first offer is deterministic for a fixed seed and has no duplicates | desktop-chrome | TIMEOUT | e2e/m1-06-level-up-choices.spec.ts:161 | Test timeout of 30000ms exceeded. |
| e2e/m1-06-level-up-choices.spec.ts | first offer is deterministic for a fixed seed and has no duplicates | mobile-chrome | TIMEOUT | e2e/m1-06-level-up-choices.spec.ts:161 | Test timeout of 30000ms exceeded. |
| e2e/m1-06-level-up-choices.spec.ts | investment weighting prefers owned families without losing discovery | desktop-chrome | TIMEOUT | e2e/m1-06-level-up-choices.spec.ts:177 | Test timeout of 45000ms exceeded. |
| e2e/m1-06-level-up-choices.spec.ts | investment weighting prefers owned families without losing discovery | mobile-chrome | TIMEOUT | e2e/m1-06-level-up-choices.spec.ts:177 | Test timeout of 45000ms exceeded. |
| e2e/m2-05b-overwhelm-valves.spec.ts | theft ping shows edge glyph, auto-hides, and debug flags suppress it | desktop-chrome | TIMEOUT | e2e/m2-05b-overwhelm-valves.spec.ts:252 | Test timeout of 30000ms exceeded. |
| e2e/m2-05b-overwhelm-valves.spec.ts | theft ping shows edge glyph, auto-hides, and debug flags suppress it | mobile-chrome | TIMEOUT | e2e/m2-05b-overwhelm-valves.spec.ts:252 | Test timeout of 30000ms exceeded. |
| e2e/m2-07b-building-incentive-tune.spec.ts | building-targeting bandits share the wave pressure budget | desktop-chrome | TIMEOUT | e2e/m2-07b-building-incentive-tune.spec.ts:154 | Test timeout of 30000ms exceeded. |
| e2e/m2-07b-building-incentive-tune.spec.ts | building-targeting bandits share the wave pressure budget | mobile-chrome | TIMEOUT | e2e/m2-07b-building-incentive-tune.spec.ts:154 | Test timeout of 30000ms exceeded. |
| e2e/m4-07-prospector-panel.spec.ts | auto-collect consent halts and resumes behavior, with stacked newest-first receipts | desktop-chrome | TIMEOUT | e2e/m4-07-prospector-panel.spec.ts:113 | Test timeout of 45000ms exceeded. |
| e2e/m4-07-prospector-panel.spec.ts | auto-collect consent halts and resumes behavior, with stacked newest-first receipts | mobile-chrome | TIMEOUT | e2e/m4-07-prospector-panel.spec.ts:113 | Test timeout of 45000ms exceeded. |
| e2e/map-census.spec.ts | e1-dry-gulch census | mobile-chrome | TIMEOUT | e2e/map-census.spec.ts:35 | Test timeout of 20000ms exceeded. |
| e2e/map-census.spec.ts | e2-pressure-garden mobile spot | desktop-chrome | TIMEOUT | e2e/map-census.spec.ts:43 | Test timeout of 15000ms exceeded. |
| e2e/map-census.spec.ts | e2-pressure-garden mobile spot | mobile-chrome | TIMEOUT | e2e/map-census.spec.ts:43 | Test timeout of 15000ms exceeded. |
| e2e/map-census.spec.ts | e3-fairground census | mobile-chrome | TIMEOUT | e2e/map-census.spec.ts:35 | Test timeout of 20000ms exceeded. |
| e2e/map-census.spec.ts | e4-boneyard census | desktop-chrome | TIMEOUT | e2e/map-census.spec.ts:35 | Test timeout of 20000ms exceeded. |
| e2e/map-census.spec.ts | e4-boneyard census | mobile-chrome | TIMEOUT | e2e/map-census.spec.ts:35 | Test timeout of 20000ms exceeded. |
| e2e/map-census.spec.ts | e5-deepwater-claim census | desktop-chrome | TIMEOUT | e2e/map-census.spec.ts:35 | Test timeout of 20000ms exceeded. |
| e2e/map-census.spec.ts | e5-deepwater-claim census | mobile-chrome | TIMEOUT | e2e/map-census.spec.ts:35 | Test timeout of 20000ms exceeded. |
| e2e/map-census.spec.ts | e5-deepwater-claim mobile spot | desktop-chrome | TIMEOUT | e2e/map-census.spec.ts:43 | Test timeout of 15000ms exceeded. |
| e2e/map-census.spec.ts | e5-deepwater-claim mobile spot | mobile-chrome | TIMEOUT | e2e/map-census.spec.ts:43 | Test timeout of 15000ms exceeded. |
| e2e/map-census.spec.ts | e6-glow-mesa census | desktop-chrome | TIMEOUT | e2e/map-census.spec.ts:35 | Test timeout of 20000ms exceeded. |
| e2e/map-census.spec.ts | e6-showroom census | mobile-chrome | TIMEOUT | e2e/map-census.spec.ts:35 | Test timeout of 20000ms exceeded. |
| e2e/map-census.spec.ts | e7-relay-valley census | desktop-chrome | TIMEOUT | e2e/map-census.spec.ts:35 | Test timeout of 20000ms exceeded. |
| e2e/map-census.spec.ts | e7-relay-valley census | mobile-chrome | TIMEOUT | e2e/map-census.spec.ts:35 | Test timeout of 20000ms exceeded. |
| e2e/map-census.spec.ts | the-claim mobile spot | desktop-chrome | TIMEOUT | e2e/map-census.spec.ts:43 | Test timeout of 15000ms exceeded. |
| e2e/map-census.spec.ts | the-claim mobile spot | mobile-chrome | TIMEOUT | e2e/map-census.spec.ts:43 | Test timeout of 15000ms exceeded. |
| e2e/mp-02-lockstep.spec.ts | town Ride Together invalid word stays friendly at 390px | mobile-chrome | TIMEOUT | e2e/mp-02-lockstep.spec.ts:688 | Test timeout of 30000ms exceeded. |
| e2e/mp-02-lockstep.spec.ts | two clients advance 500 ticks with identical lockstep hashes | desktop-chrome | TIMEOUT | e2e/mp-02-lockstep.spec.ts:134 | Test timeout of 60000ms exceeded. |
| e2e/mp-arsenal.spec.ts | riders fire different weapons under their stats, share credit, and keep equal hashes | desktop-chrome | TIMEOUT | e2e/mp-arsenal.spec.ts:34 | Test timeout of 90000ms exceeded. |
| e2e/mp-reconnect.spec.ts | a disconnected rider rejoins its held slot at the exact snapshot tick and keeps identical world hashes | desktop-chrome | TIMEOUT | e2e/mp-reconnect.spec.ts:32 | Test timeout of 75000ms exceeded. |
| e2e/mu-02-music.spec.ts | title music waits for a gesture and music volume persists | desktop-chrome | TIMEOUT | e2e/mu-02-music.spec.ts:20 | Test timeout of 30000ms exceeded. |
| e2e/never-trap.spec.ts | Night Shift enemies always make goal progress around object footprints | desktop-chrome | TIMEOUT | e2e/never-trap.spec.ts:88 | Test timeout of 30000ms exceeded. |
| e2e/never-trap.spec.ts | Night Shift enemies always make goal progress around object footprints | mobile-chrome | TIMEOUT | e2e/never-trap.spec.ts:88 | Test timeout of 30000ms exceeded. |
| e2e/night-light-doctrine.spec.ts | honest night lights reveal only carried lamps, watch paint, consent, and shots | mobile-chrome | TIMEOUT | e2e/night-light-doctrine.spec.ts:16 | Test timeout of 60000ms exceeded. |
| e2e/night3d-perf.spec.ts | Night Shift keeps its lantern read and auto-tiers one sticky step at a time | desktop-chrome | TIMEOUT | e2e/night3d-perf.spec.ts:98 | Test timeout of 90000ms exceeded. |
| e2e/night3d-perf.spec.ts | Night Shift keeps its lantern read and auto-tiers one sticky step at a time | mobile-chrome | TIMEOUT | e2e/night3d-perf.spec.ts:98 | Test timeout of 90000ms exceeded. |
| e2e/panorama-framing.spec.ts | e1-night-shift keeps its panorama in world framing across the wide aspect matrix | desktop-chrome | TIMEOUT | e2e/panorama-framing.spec.ts:18 | Test timeout of 120000ms exceeded. |
| e2e/panorama-framing.spec.ts | legacy painted ground stays hidden while sculpt landmarks remain mounted | mobile-chrome | TIMEOUT | e2e/panorama-framing.spec.ts:35 | Test timeout of 60000ms exceeded. |
| e2e/panorama-framing.spec.ts | write the three 2000x1000 run-camera proof shots | desktop-chrome | TIMEOUT | e2e/panorama-framing.spec.ts:67 | Test timeout of 90000ms exceeded. |
| e2e/polish-03-mobile-hud.spec.ts | mobile HUD controls fit, tap, and avoid overlap at 390px and 430px | mobile-chrome | TIMEOUT | e2e/polish-03-mobile-hud.spec.ts:197 | Test timeout of 45000ms exceeded. |
| e2e/research-chart.spec.ts | survey chart renders node states, traces locked requirements, and persists one pin | desktop-chrome | TIMEOUT | e2e/research-chart.spec.ts:130 | Test timeout of 30000ms exceeded. |
| e2e/research-chart.spec.ts | survey chart renders node states, traces locked requirements, and persists one pin | mobile-chrome | TIMEOUT | e2e/research-chart.spec.ts:130 | Test timeout of 30000ms exceeded. |
| e2e/run-gait-stride.spec.ts | run gait advances by distance and preserves the Baron cadence | desktop-chrome | TIMEOUT | e2e/run-gait-stride.spec.ts:88 | Test timeout of 60000ms exceeded. |
| e2e/run-scene-animation-refresh.spec.ts | run boots on the approved female Hero walk8 and advances frames | desktop-chrome | TIMEOUT | e2e/run-scene-animation-refresh.spec.ts:5 | Test timeout of 30000ms exceeded. |
| e2e/run-scene-animation-refresh.spec.ts | run boots on the approved female Hero walk8 and advances frames | mobile-chrome | TIMEOUT | e2e/run-scene-animation-refresh.spec.ts:5 | Test timeout of 30000ms exceeded. |
| e2e/run-suspend.spec.ts | ended runs clear suspend and town board launch confirms abandoning a saved claim | desktop-chrome | TIMEOUT | e2e/run-suspend.spec.ts:351 | Test timeout of 30000ms exceeded. |
| e2e/run-suspend.spec.ts | ended runs clear suspend and town board launch confirms abandoning a saved claim | mobile-chrome | TIMEOUT | e2e/run-suspend.spec.ts:351 | Test timeout of 30000ms exceeded. |
| e2e/run3d-gold-seam.spec.ts | flag-off boot keeps gold sprites and requests no GLB | desktop-chrome | TIMEOUT | e2e/run3d-gold-seam.spec.ts:53 | Test timeout of 30000ms exceeded. |
| e2e/run3d-gold-seam.spec.ts | pilot loads once, mirrors live seams, and unmounts one depleted seam | desktop-chrome | TIMEOUT | e2e/run3d-gold-seam.spec.ts:69 | Test timeout of 30000ms exceeded. |
| e2e/run3d-rail-elements.spec.ts | flag-off boot keeps procedural rails and requests no rail-element GLB | desktop-chrome | TIMEOUT | e2e/run3d-rail-elements.spec.ts:47 | Test timeout of 30000ms exceeded. |
| e2e/scene-swap-camera.spec.ts | town-run-town keeps camera truth at 1440x900 | mobile-chrome | TIMEOUT | e2e/scene-swap-camera.spec.ts:11 | Test timeout of 60000ms exceeded. |
| e2e/sim-fixed-step.spec.ts | 30/60/144 fps render schedules produce the same 300-tick simulation | desktop-chrome | TIMEOUT | e2e/sim-fixed-step.spec.ts:38 | Test timeout of 120000ms exceeded. |
| e2e/sim-fixed-step.spec.ts | fixed ticks carry fractional cooldown debt instead of losing volleys | desktop-chrome | TIMEOUT | e2e/sim-fixed-step.spec.ts:232 | Test timeout of 30000ms exceeded. |
| e2e/ss-02-beats.spec.ts | once beats are marked only when displayed and queued beats survive reload | desktop-chrome | TIMEOUT | e2e/ss-02-beats.spec.ts:200 | Test timeout of 30000ms exceeded. |
| e2e/task-024-blast-aim-presets.spec.ts | difficulty presets apply the hard-mode bundle and persist by profile key | desktop-chrome | TIMEOUT | e2e/task-024-blast-aim-presets.spec.ts:88 | Test timeout of 30000ms exceeded. |
| e2e/task-024-blast-aim-presets.spec.ts | difficulty presets apply the hard-mode bundle and persist by profile key | mobile-chrome | TIMEOUT | e2e/task-024-blast-aim-presets.spec.ts:88 | Test timeout of 30000ms exceeded. |
| e2e/task-042-anim-smoothness.spec.ts | walk cadence is speed-scaled and restart keeps phase | desktop-chrome | TIMEOUT | e2e/task-042-anim-smoothness.spec.ts:54 | Test timeout of 30000ms exceeded. |
| e2e/task-042-anim-smoothness.spec.ts | walk cadence is speed-scaled and restart keeps phase | mobile-chrome | TIMEOUT | e2e/task-042-anim-smoothness.spec.ts:54 | Test timeout of 30000ms exceeded. |
| e2e/task-046-territory-ring-pacing.spec.ts | T1 banks the old ring as a run-scoped palisade kit and spends it before gold | desktop-chrome | TIMEOUT | e2e/task-046-territory-ring-pacing.spec.ts:76 | Test timeout of 45000ms exceeded. |
| e2e/task-048-funnel-formation-spread.spec.ts | formation offsets are deterministic for the m6 seed | desktop-chrome | TIMEOUT | e2e/task-048-funnel-formation-spread.spec.ts:158 | Test timeout of 30000ms exceeded. |
| e2e/task-053-weapon-cycling-audit.spec.ts | task-053 seeded weapon cycling DPS probe | desktop-chrome | TIMEOUT | e2e/task-053-weapon-cycling-audit.spec.ts:50 | Test timeout of 120000ms exceeded. |
| e2e/terrain-seamless.spec.ts | all shipped terrain de-tiles deterministically within FULL and LITE budgets | mobile-chrome | TIMEOUT | e2e/terrain-seamless.spec.ts:121 | Test timeout of 300000ms exceeded. |
| e2e/terrain3d-claim-pilot.spec.ts | contract-valid GLB feeds every visualY consumer and keeps the water agreement | desktop-chrome | TIMEOUT | e2e/terrain3d-claim-pilot.spec.ts:76 | Test timeout of 60000ms exceeded. |
| e2e/terrain3d-claim-pilot.spec.ts | contract-valid GLB feeds every visualY consumer and keeps the water agreement | mobile-chrome | TIMEOUT | e2e/terrain3d-claim-pilot.spec.ts:76 | Test timeout of 60000ms exceeded. |
| e2e/terrain3d-default.spec.ts | promoted terrain stays inside the 115% p95 budget | desktop-chrome | TIMEOUT | e2e/terrain3d-default.spec.ts:145 | Test timeout of 180000ms exceeded. |
| e2e/terrain3d-registry.spec.ts | all campaign extras resolve their registered terrain and panorama assets | desktop-chrome | TIMEOUT | e2e/terrain3d-registry.spec.ts:88 | Test timeout of 180000ms exceeded. |
| e2e/terrain3d-registry.spec.ts | each registered terrain and panorama stays inside the 115% p95 budget | desktop-chrome | TIMEOUT | e2e/terrain3d-registry.spec.ts:447 | Test timeout of 180000ms exceeded. |
| e2e/terrain3d-registry.spec.ts | each registered terrain and panorama stays inside the 115% p95 budget | mobile-chrome | TIMEOUT | e2e/terrain3d-registry.spec.ts:447 | Test timeout of 180000ms exceeded. |
| e2e/terrain3d-registry.spec.ts | four campaign era bands mount with zero console errors | desktop-chrome | TIMEOUT | e2e/terrain3d-registry.spec.ts:124 | Test timeout of 30000ms exceeded. |
| e2e/terrain3d-registry.spec.ts | rim and horizon probes keep the terrain meeting gradual and every panorama readable | mobile-chrome | TIMEOUT | e2e/terrain3d-registry.spec.ts:272 | Test timeout of 120000ms exceeded. |
| e2e/terrain3d-registry.spec.ts | terrain2d and the 3D default keep bounds, spawns, fog, masks, and simulation byte-identical per map | desktop-chrome | TIMEOUT | e2e/terrain3d-registry.spec.ts:328 | Test timeout of 180000ms exceeded. |
| e2e/terrain3d-registry.spec.ts | terrain2d and the 3D default keep bounds, spawns, fog, masks, and simulation byte-identical per map | mobile-chrome | TIMEOUT | e2e/terrain3d-registry.spec.ts:328 | Test timeout of 180000ms exceeded. |
| e2e/town-dynamo-hall-blender.spec.ts | owner eye shows the complete Dynamo Hall with every registered 3D building | desktop-chrome | TIMEOUT | e2e/town-dynamo-hall-blender.spec.ts:140 | Test timeout of 30000ms exceeded. |
| e2e/town-dynamo-hall-blender.spec.ts | owner eye shows the complete Dynamo Hall with every registered 3D building | mobile-chrome | TIMEOUT | e2e/town-dynamo-hall-blender.spec.ts:140 | Test timeout of 30000ms exceeded. |
| e2e/town-t1-square.spec.ts | menu enters town square, prompts at four shells, exits, then starts normal run | mobile-chrome | TIMEOUT | e2e/town-t1-square.spec.ts:74 | Test timeout of 30000ms exceeded. |
| e2e/town-t2-naming.spec.ts | fresh town naming persists, renames, and appears in recap and run ledger | desktop-chrome | TIMEOUT | e2e/town-t2-naming.spec.ts:83 | Test timeout of 30000ms exceeded. |
| e2e/town-t2-naming.spec.ts | fresh town naming persists, renames, and appears in recap and run ledger | mobile-chrome | TIMEOUT | e2e/town-t2-naming.spec.ts:83 | Test timeout of 30000ms exceeded. |
| e2e/town-t3-board.spec.ts | board launch loads Dry Gulch and New Claim hashes to the default contract config | desktop-chrome | TIMEOUT | e2e/town-t3-board.spec.ts:222 | Test timeout of 30000ms exceeded. |
| e2e/town-t3-board.spec.ts | board launch loads Dry Gulch and New Claim hashes to the default contract config | mobile-chrome | TIMEOUT | e2e/town-t3-board.spec.ts:222 | Test timeout of 30000ms exceeded. |
| e2e/town-t3-board.spec.ts | contract board renders manifest rows, locks, conditions, and per-contract bests | desktop-chrome | TIMEOUT | e2e/town-t3-board.spec.ts:156 | Test timeout of 60000ms exceeded. |
| e2e/town-t3-board.spec.ts | contract board renders manifest rows, locks, conditions, and per-contract bests | mobile-chrome | TIMEOUT | e2e/town-t3-board.spec.ts:156 | Test timeout of 60000ms exceeded. |
| e2e/town-t3-board.spec.ts | contract board swipes and keeps tap targets usable at 390px | mobile-chrome | TIMEOUT | e2e/town-t3-board.spec.ts:326 | Test timeout of 30000ms exceeded. |
| e2e/town-t3-board.spec.ts | post-run overrun returns straight to the town board and records a contract result | mobile-chrome | TIMEOUT | e2e/town-t3-board.spec.ts:246 | Test timeout of 30000ms exceeded. |
| e2e/town-t4-growth.spec.ts | fresh and seeded territory tiers render only earned town buildings | mobile-chrome | TIMEOUT | e2e/town-t4-growth.spec.ts:146 | Test timeout of 30000ms exceeded. |
| e2e/town-t4-growth.spec.ts | Stamp Mill town vignette mirrors megaproject stage state | mobile-chrome | TIMEOUT | e2e/town-t4-growth.spec.ts:183 | Test timeout of 30000ms exceeded. |
| e2e/town-t5-townsfolk.spec.ts | mobile bark card is readable above the stick zone and captures concept comparison | mobile-chrome | TIMEOUT | e2e/town-t5-townsfolk.spec.ts:241 | Test timeout of 30000ms exceeded. |
| e2e/town-ts-02b-facades.spec.ts | built town mounts 2.5D facade keys and all six surfaces remain walkable | desktop-chrome | TIMEOUT | e2e/town-ts-02b-facades.spec.ts:78 | Test timeout of 30000ms exceeded. |
| e2e/town-ts-02b-facades.spec.ts | built town mounts 2.5D facade keys and all six surfaces remain walkable | mobile-chrome | TIMEOUT | e2e/town-ts-02b-facades.spec.ts:78 | Test timeout of 30000ms exceeded. |
| e2e/town-ts-03-prop-ring.spec.ts | TS-03 prop ring renders the arrival props, dry Pan Monument, Pony Express plot, and stays inside draw-call budget | mobile-chrome | TIMEOUT | e2e/town-ts-03-prop-ring.spec.ts:73 | Test timeout of 30000ms exceeded. |
| e2e/tr-01-continuous-ground.spec.ts | terrainMesh flag swaps in a one-draw continuous ground mesh and preserves fallback probes | desktop-chrome | TIMEOUT | e2e/tr-01-continuous-ground.spec.ts:69 | Test timeout of 30000ms exceeded. |
| e2e/tr-01-continuous-ground.spec.ts | terrainMesh flag swaps in a one-draw continuous ground mesh and preserves fallback probes | mobile-chrome | TIMEOUT | e2e/tr-01-continuous-ground.spec.ts:69 | Test timeout of 30000ms exceeded. |
| e2e/tr-01-continuous-ground.spec.ts | terrainMesh stress perf stays inside the draw-call envelope | desktop-chrome | TIMEOUT | e2e/tr-01-continuous-ground.spec.ts:104 | Test timeout of 30000ms exceeded. |
| e2e/ts-01-plaza-ground.spec.ts | plaza descriptor forms a clear ring with baked routes to every slot and the gate | desktop-chrome | TIMEOUT | e2e/ts-01-plaza-ground.spec.ts:79 | Test timeout of 30000ms exceeded. |
| e2e/ts-01-plaza-ground.spec.ts | plaza descriptor forms a clear ring with baked routes to every slot and the gate | mobile-chrome | TIMEOUT | e2e/ts-01-plaza-ground.spec.ts:79 | Test timeout of 30000ms exceeded. |
| e2e/ts-04-living-pass.spec.ts | TS-04 actors follow baked trails for a 30s scene capture with no storage or sim writes | desktop-chrome | TIMEOUT | e2e/ts-04-living-pass.spec.ts:60 | Test timeout of 75000ms exceeded. |
| e2e/ui-era-dressing.spec.ts | registered eras render on the menu and a town surface | desktop-chrome | TIMEOUT | e2e/ui-era-dressing.spec.ts:65 | Test timeout of 90000ms exceeded. |
| e2e/ui-era-dressing.spec.ts | registered eras render on the menu and a town surface | mobile-chrome | TIMEOUT | e2e/ui-era-dressing.spec.ts:65 | Test timeout of 90000ms exceeded. |
| e2e/vp-02-sprite-animation.spec.ts | damped heading sweep visits every orientation in order | desktop-chrome | TIMEOUT | e2e/vp-02-sprite-animation.spec.ts:619 | Test timeout of 30000ms exceeded. |
| e2e/vp-02-sprite-animation.spec.ts | damped heading sweep visits every orientation in order | mobile-chrome | TIMEOUT | e2e/vp-02-sprite-animation.spec.ts:619 | Test timeout of 30000ms exceeded. |
| e2e/vp-02-sprite-animation.spec.ts | east heading uses explicit rotation2 files with unmirrored pixels | desktop-chrome | TIMEOUT | e2e/vp-02-sprite-animation.spec.ts:566 | Test timeout of 30000ms exceeded. |
| e2e/vp-02-sprite-animation.spec.ts | east heading uses explicit rotation2 files with unmirrored pixels | mobile-chrome | TIMEOUT | e2e/vp-02-sprite-animation.spec.ts:566 | Test timeout of 30000ms exceeded. |
| e2e/vp-02-sprite-animation.spec.ts | hero walk frameKey alternates while each 8-way heading is held | desktop-chrome | TIMEOUT | e2e/vp-02-sprite-animation.spec.ts:531 | Test timeout of 45000ms exceeded. |
| e2e/vp-02-sprite-animation.spec.ts | hero walk frameKey alternates while each 8-way heading is held | mobile-chrome | TIMEOUT | e2e/vp-02-sprite-animation.spec.ts:531 | Test timeout of 45000ms exceeded. |
| e2e/vp-02-sprite-animation.spec.ts | small boundary wiggle does not oscillate orientation | desktop-chrome | TIMEOUT | e2e/vp-02-sprite-animation.spec.ts:659 | Test timeout of 30000ms exceeded. |
| e2e/vp-02-sprite-animation.spec.ts | small boundary wiggle does not oscillate orientation | mobile-chrome | TIMEOUT | e2e/vp-02-sprite-animation.spec.ts:659 | Test timeout of 30000ms exceeded. |
| e2e/vp-02b-rotation-resolver.spec.ts | hero locomotion resolves all 8 contract directions | desktop-chrome | TIMEOUT | e2e/vp-02b-rotation-resolver.spec.ts:113 | Test timeout of 30000ms exceeded. |
| e2e/vp-02b-rotation-resolver.spec.ts | hero locomotion resolves all 8 contract directions | mobile-chrome | TIMEOUT | e2e/vp-02b-rotation-resolver.spec.ts:113 | Test timeout of 30000ms exceeded. |
| e2e/vp-02b-rotation-resolver.spec.ts | pure side idle stays side while diagonal idle snaps to a hemisphere | desktop-chrome | TIMEOUT | e2e/vp-02b-rotation-resolver.spec.ts:165 | Test timeout of 60000ms exceeded. |
| e2e/vp-02b-rotation-resolver.spec.ts | resolver hysteresis holds across small boundary oscillation | desktop-chrome | TIMEOUT | e2e/vp-02b-rotation-resolver.spec.ts:129 | Test timeout of 30000ms exceeded. |
| e2e/vp-02b-rotation-resolver.spec.ts | resolver hysteresis holds across small boundary oscillation | mobile-chrome | TIMEOUT | e2e/vp-02b-rotation-resolver.spec.ts:129 | Test timeout of 30000ms exceeded. |
| e2e/vp-03-terrain-variety.spec.ts | distant bank ground varies without adding draw calls | desktop-chrome | TIMEOUT | e2e/vp-03-terrain-variety.spec.ts:56 | Test timeout of 30000ms exceeded. |
| e2e/vp-03-terrain-variety.spec.ts | same seed renders deterministic bank ground | desktop-chrome | TIMEOUT | e2e/vp-03-terrain-variety.spec.ts:68 | Test timeout of 30000ms exceeded. |
| e2e/vp-03-terrain-variety.spec.ts | same seed renders deterministic bank ground | mobile-chrome | TIMEOUT | e2e/vp-03-terrain-variety.spec.ts:68 | Test timeout of 30000ms exceeded. |
| e2e/w1-01-terrain-relief.spec.ts | terrain mesh has seeded relief and mobile density knob | desktop-chrome | TIMEOUT | e2e/w1-01-terrain-relief.spec.ts:31 | Test timeout of 30000ms exceeded. |
| e2e/w1-01-terrain-relief.spec.ts | terrain mesh has seeded relief and mobile density knob | mobile-chrome | TIMEOUT | e2e/w1-01-terrain-relief.spec.ts:31 | Test timeout of 30000ms exceeded. |
| e2e/w1-04-detail.spec.ts | instanced detail scatter exposes density diagnostics and mobile reduction | desktop-chrome | TIMEOUT | e2e/w1-04-detail.spec.ts:31 | Test timeout of 30000ms exceeded. |
| e2e/w1-04-detail.spec.ts | instanced detail scatter exposes density diagnostics and mobile reduction | mobile-chrome | TIMEOUT | e2e/w1-04-detail.spec.ts:31 | Test timeout of 30000ms exceeded. |
| e2e/w1-06-vista.spec.ts | vista diagnostics expose a low-res radius-90 terrain ring | desktop-chrome | TIMEOUT | e2e/w1-06-vista.spec.ts:39 | Test timeout of 30000ms exceeded. |
| e2e/w1-06-vista.spec.ts | vista diagnostics expose a low-res radius-90 terrain ring | mobile-chrome | TIMEOUT | e2e/w1-06-vista.spec.ts:39 | Test timeout of 30000ms exceeded. |
| e2e/w1-07-natural.spec.ts | natural claim relief exposes gullies, shelves, bluffs, and pockets | desktop-chrome | TIMEOUT | e2e/w1-07-natural.spec.ts:47 | Test timeout of 30000ms exceeded. |
| e2e/w1-07-natural.spec.ts | natural claim relief exposes gullies, shelves, bluffs, and pockets | mobile-chrome | TIMEOUT | e2e/w1-07-natural.spec.ts:47 | Test timeout of 30000ms exceeded. |
| e2e/wire-railcar-3d.spec.ts | invalid GLB bytes fall back to the painted billboard | desktop-chrome | TIMEOUT | e2e/wire-railcar-3d.spec.ts:200 | Test timeout of 30000ms exceeded. |
| e2e/world-info-notes.spec.ts | 390px world note clears the touch stick zone | desktop-chrome | TIMEOUT | e2e/world-info-notes.spec.ts:322 | Test timeout of 30000ms exceeded. |
| e2e/world-info-notes.spec.ts | building notes sit with existing assay and upgrade prompts | desktop-chrome | TIMEOUT | e2e/world-info-notes.spec.ts:196 | Test timeout of 30000ms exceeded. |
| e2e/world-info-notes.spec.ts | contract-specific world notes cover Dry Gulch water without a phantom territory ring | desktop-chrome | TIMEOUT | e2e/world-info-notes.spec.ts:236 | Test timeout of 30000ms exceeded. |
| e2e/world-info-notes.spec.ts | Night Shift lantern post note uses the same registry | desktop-chrome | TIMEOUT | e2e/world-info-notes.spec.ts:269 | Test timeout of 30000ms exceeded. |
| e2e/world-info-notes.spec.ts | run-world notes explain seams, stake, ford, prospector, and soften after two approaches | desktop-chrome | TIMEOUT | e2e/world-info-notes.spec.ts:163 | Test timeout of 30000ms exceeded. |
| e2e/e5-flotilla-hulls.spec.ts | the Flotilla keeps three losable hulls and secures both bench seeds deterministically | 2026-09-19 | F-MAC2-1 | **RED ON THE EXACT BASE** (`desktop-chrome`): Astra's attribution in `artifacts/sol/map-art-campaign-2/report.md` §Verification — the two render edits removed, the base engine hash verified, the case re-run; era-6 pin rot in the E5 fixtures (the era-6 land re-pointed the census, not these). Re-point with cause owed. Error: expect(received).toMatchObject(expected) -   "eventLogHash": "fnv1a32:a9f33e48", +   "eventLogHash": "fnv1a32:c01dd739", |
| e2e/e5-flotilla-hulls.spec.ts | idle Flotilla runs lose all hulls | 2026-09-19 | F-MAC2-1 | **RED ON THE EXACT BASE** (`desktop-chrome`): Astra's attribution in `artifacts/sol/map-art-campaign-2/report.md` §Verification — the two render edits removed, the base engine hash verified, the case re-run; era-6 pin rot in the E5 fixtures (the era-6 land re-pointed the census, not these). Re-point with cause owed. Error: expect(received).toMatchObject(expected) -   "eventLogHash": "fnv1a32:68d87963", +   "eventLogHash": "fnv1a32:815739a6", |
| e2e/e5-regatta-race.spec.ts | the Regatta runs its authored course and secures both bench seeds deterministically | 2026-09-19 | F-MAC2-1 | **RED ON THE EXACT BASE** (`desktop-chrome`): Astra's attribution in `artifacts/sol/map-art-campaign-2/report.md` §Verification — the two render edits removed, the base engine hash verified, the case re-run; era-6 pin rot in the E5 fixtures (the era-6 land re-pointed the census, not these). Re-point with cause owed. Error: expect(received).toBe(expected) // Object.is equality Expected: true Received: false |
| e2e/e5-regatta-race.spec.ts | idle Regatta runs lose because the course remains unfinished | 2026-09-19 | F-MAC2-1 | **RED ON THE EXACT BASE** (`desktop-chrome`): Astra's attribution in `artifacts/sol/map-art-campaign-2/report.md` §Verification — the two render edits removed, the base engine hash verified, the case re-run; era-6 pin rot in the E5 fixtures (the era-6 land re-pointed the census, not these). Re-point with cause owed. Error: (node:55471) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set. Expected: 0 Received: 1 |
| e2e/e5-stillwater-noise.spec.ts | Stillwater SECURES both bench seeds twice through the PLAIN door | 2026-09-19 | F-MAC2-1 | **RED ON THE EXACT BASE** (`desktop-chrome`): Astra's attribution in `artifacts/sol/map-art-campaign-2/report.md` §Verification — the two render edits removed, the base engine hash verified, the case re-run; era-6 pin rot in the E5 fixtures (the era-6 land re-pointed the census, not these). Re-point with cause owed. Error: expect(received).toMatchObject(expected) -   "eventLogHash": "fnv1a32:7661ca43", -   "kills": 103, +   "eventLogHash": "fnv1a32:e5c6d612", +   "kills": 3 |
| e2e/e5-stillwater-noise.spec.ts | the same play through the in-process door agrees, and the decks survive with margin | 2026-09-19 | F-MAC2-1 | **RED ON THE EXACT BASE** (`desktop-chrome`): Astra's attribution in `artifacts/sol/map-art-campaign-2/report.md` §Verification — the two render edits removed, the base engine hash verified, the case re-run; era-6 pin rot in the E5 fixtures (the era-6 land re-pointed the census, not these). Re-point with cause owed. Error: expect(received).toMatchObject(expected) -   "eventLogHash": "fnv1a32:4e99e655", +   "eventLogHash": "fnv1a32:e5c6d612", -     "strikes": 77, +     "stri |
| e2e/e5-stillwater-noise.spec.ts | idle Stillwater runs stay silent and still lose | 2026-09-19 | F-MAC2-1 | **RED ON THE EXACT BASE** (`desktop-chrome`): Astra's attribution in `artifacts/sol/map-art-campaign-2/report.md` §Verification — the two render edits removed, the base engine hash verified, the case re-run; era-6 pin rot in the E5 fixtures (the era-6 land re-pointed the census, not these). Re-point with cause owed. Error: (node:31955) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set. Expected: 0 Received: null |
| e2e/shared-atlas-dedupe.spec.ts | production WebP atlas load-dispose-load returns to the renderer baseline | 2026-09-20 | F-MAC2B-6 | **RED ON MAIN** (both projects): the assertion at :94 requires the five production names in artifacts/shared-atlas-dedupe/census.json (2026-09-05, -diet-a9d5c9a0) to exist in dist/assets, and every build since the diet fingerprint and the GLB content hashes moved emits other names (-diet-c2bea0ac on main's own full build). Census-rot, not a rendering regression; cure = re-census from the current build (lane-d corrective). Found at the sol-map-art-campaign-2b drain, reviews/sol-map-art-campaign-2b.md. Error: expect(received).toBe(expected) Expected: true Received: false |
| e2e/e1-baron.spec.ts | Baron manifest loads and taunts fire at waves 5, 12, and 18 | 2026-09-20 | F-CORR1-5 | **RED ON MAIN** (both projects, was mobile-only in row 130): `expectBaronPresentationPrefetched` polls 10 s and `baronAnimationLoaded` stays false; reproduced by a control run on main `ce334f4cb` at the sol-map-art-corrections-1 drain (4 failed / 26 passed with e10-static-boss:153). Not the corrections run's. Error: expect(received).toEqual(expected) baronAnimationLoaded true -> false |
| e2e/e10-static-boss.spec.ts | recession hands the secured claim to the existing T10 re-inking finale | 2026-09-20 | F-CORR1-5 | **RED ON MAIN** (both projects): `bank-secured-claim` not visible after recession (toBeVisible 5 s); reproduced by the same control run on main `ce334f4cb`. Error: expect(locator).toBeVisible() failed — element(s) not found |
| e2e/beauty-twin-banks.spec.ts | the braid renders living water without touching the sculpt contract or the frame budget | 2026-09-20 | F-CORR1-7 | **RED ON MAIN** (both projects) since the F-OMA-4 fords landing of 2026-09-19 moved the E1 river band: `__GR_TEST__.terrainSample(0, 0).zone` reads `bank`, the spec pins `river`; reproduced by a control run on main `9ba63431a` (5 failed / 21 passed). Re-point with cause owed. Error: expect(received).toBe(expected) Expected: "river" Received: "bank" |
| e2e/e1-night-shift.spec.ts | loads Night Shift contract data and ramps full, dusk, dark, dawn lighting | 2026-09-20 | F-CORR1-7 | **RED ON MAIN** (both projects): the lighting ramp pins `fogNear 18 / fogFar 42`, the tree says `34 / 58` since the F-OMA-4 landing; same control run. Re-point with cause owed. Error: expect(received).toMatchObject(expected) fogFar 42 -> 58, fogNear 18 -> 34 |
| e2e/e1-night-shift.spec.ts | lantern post is Night Shift gated and relights a true-dark light ring | 2026-09-20 | F-CORR1-7 | **RED ON MAIN** (mobile-chrome): the same centre `terrainSample(0, 0).zone` reads `bank`; same control run. Error: expect(received).toBe(expected) Expected: "river" Received: "bank" |
## Post-snapshot known reds (APPENDED s1196 — NOT part of the measured run above)

_Everything above this line is a single measured snapshot and must not be edited. This section records reds learned AFTER that run, so a later comparison does not read them as new. Each entry states what is measured and what is inferred._

### F-1180-2 — the 3-suite combined battery has a LOAD CEILING. It is a CLASS, not a line.

**Do not attribute a single failure in this battery to whatever slice is in flight until you have re-run the casualty in isolation.**

The battery: `meta-presence.spec.ts` + `run-suspend.spec.ts` + the m3-05x ledger spec, run together as the adjacent-suite check.

| observation | casualty | isolated re-run | source |
|---|---|---|---|
| s1195, runner-side combined run | `e2e/run-suspend.spec.ts:193` | **green 1/1** | s1195 handoff (D) |
| s1195, drain-side combined run of the SAME three suites | `e2e/meta-presence.spec.ts:207` — and `run-suspend` passed clean | **green 8/8** | s1195 handoff (D) |

**Measured:** two runs of the same three suites produced two DIFFERENT casualties, each green alone.
**Inferred:** a real defect does not move between suites; a load ceiling does. So the load-sensitive unit is the **combined battery**, and `run-suspend:193` is merely where it was first seen — which is why F-1180-2 was originally written as if that line were the flake.
**NOT measured, and it matters:** the failure RATE, and whether the casualty is uniform across the battery or biased toward whichever suite runs last. Two observations cannot separate those. A fire wanting to settle it should run the battery N times under recorded load and count casualties per suite — the instrument for that already exists in `scripts/run-guards.mjs`-style rc reporting, and s1192/s1195 both captured `uptime`/`load1m` around their arms.

➡️ **Consequence for a gate:** a 25/26 or 26/27 in this battery with ONE casualty that is green in isolation is a known red, not a regression — say so with the isolated re-run as evidence. A casualty that fails in isolation, or two casualties in one run, is NOT covered by this entry.

---

## Harness provenance (APPENDED 2026-07-29 — measured snapshot metadata)

`logs/suite-red-inventory-compact.json` records the harness that produced the table above: configured workers **2**; actual workers **2**; fully parallel **false**; shard **null**; Playwright **1.61.1**.

This is the same run: its six headline values match the table above at 2388 run / 2006 passed / 303 failed / BOTH 135 / MOBILE-ONLY 17 / DESKTOP-ONLY 11. A comparison run at a different worker count uses a different instrument.

---

## F-1212-2 — `m4-06-embodiment.spec.ts:395` is a ~45% FLAKE ON MAIN, and the drain minimum has a LOAD CEILING at default workers

**Two findings from one drain (s1212, AP-06 standing orders). Both were nearly written up as regressions caused by the slice in flight.**

### (a) The line

`e2e/m4-06-embodiment.spec.ts:395` — *"permission-denied receipts do not send the Prospector to the denied target"*. Absent from the generated table above.

**Measured as a RATE, matched arms, `--repeat-each=5` × 2 projects, `--workers=1`:**

| arm | tree | failures |
|---|---|---|
| control | clean main, graft fully removed (`git checkout HEAD --` + file moved out) | **4/10** |
| treatment | AP-06 graft applied | **5/10** |

Pooled **9/20 = 45%**, both projects. A difference of one at n=10 is noise → **pre-existing, not caused by the slice**. Note the first single-shot control failed **desktop-only** while the first single-shot treatment failed **both** — which, read without a rate, looks exactly like "the merge widened it". It did not. *One observation per arm cannot separate a flake from a regression; only a rate can.*

### (b) The class — default workers reddens the drain minimum

The prescribed battery config is `--workers=1` (`.claude/skills/drain/SKILL.md` §3). Run at **default** concurrency on the same tree:

| config | drain minimum (task-025 + m1-01 + m2-01 + `_s106-prospector-boot-probe`) |
|---|---|
| default workers | **5 failed / 29 passed** — including the plain-boot probe itself |
| `--workers=1` | **34/34** |

The same effect claimed two more scalps the same fire: `m4-07-prospector-panel:113` failed in **both** arms under load and passes clean at `--workers=1`; the release suite returned **25/26** with `release-build.spec.ts:185`, which re-measured **8/8 green** in isolation.

➡️ **Consequence for a gate:** a red in the drain minimum or the release suite produced at default workers is **not evidence of anything** until re-run at `--workers=1`. This is F-1211-1's lesson generalised — *a failing test can manufacture the load that fails its neighbours* — and it is now the second consecutive fire in which every red initially observed turned out to be the observer's own concurrency.

---

## F-1216-1 follow-up — measured concurrency rates (APPENDED s1216)

One tree (`593f998b`), one external Vite server on scratch port 5267, and 8 interleaved cycles in
worker order 1→2→4. Requested/configured/actual workers agree in every arm; all 24 arms carry the same
HEAD. Raw Playwright reports and per-run loadavg are retained in
`logs/session-scratch/s1216-concurrency-rates/`.

| Subject | Project | workers=1 | workers=2 | workers=4 | Classification |
|---|---|---:|---:|---:|---|
| `e2e/gazette-welcome.spec.ts:44` | desktop-chrome | 0/8 (0.0%) | 0/8 (0.0%) | 0/8 (0.0%) | flat |
| `e2e/gazette-welcome.spec.ts:44` | mobile-chrome | 0/8 (0.0%) | 1/8 (12.5%) | 0/8 (0.0%) | non-monotonic |
| `e2e/ap-standing-orders.spec.ts:80` | desktop-chrome | 0/8 (0.0%) | 0/8 (0.0%) | 0/8 (0.0%) | flat |
| `e2e/ap-standing-orders.spec.ts:80` | mobile-chrome | 0/8 (0.0%) | 0/8 (0.0%) | 2/8 (25.0%) | monotonic |
| `e2e/locked-win.spec.ts:65` | desktop-chrome | 8/8 (100.0%) | 8/8 (100.0%) | 8/8 (100.0%) | **deterministic red** |
| `e2e/locked-win.spec.ts:65` | mobile-chrome | 8/8 (100.0%) | 8/8 (100.0%) | 8/8 (100.0%) | **deterministic red** |
| `e2e/tl-01-run-telemetry.spec.ts:229` | desktop-chrome | 8/8 (100.0%) | 8/8 (100.0%) | 8/8 (100.0%) | **deterministic red** |
| `e2e/tl-01-run-telemetry.spec.ts:229` | mobile-chrome | 8/8 (100.0%) | 8/8 (100.0%) | 8/8 (100.0%) | **deterministic red** |

Pooled by subject, Standing Orders is the only monotonic member:
**0/16 → 0/16 → 2/16**. Gazette is **0/16 → 1/16 → 0/16** and its lone failure was at
`:111`, not F-1214-1's `:87` drift assertion. Locked Win and run telemetry are **16/16 at every
worker count**; they are not flakes.

**Calibration correction:** the generated S4 row above that says `7/12 (58.3%)` is in the
**Masking candidates** table. It is `failure-line offset / test-body lines`, computed by
`suite-red-inventory.mjs`, not failures/executions. The actual workers=2 rate measured here is
**8/8 = 100.0% per project, 16/16 pooled**, and every raw failure is at `:236`. The task's proposed
58.3% failure-rate oracle therefore does not exist; changing the new harness to match it would falsify
the measurement.


---

## SUPERSEDED — `ap-standing-orders.spec.ts:80` is CURED, and "25% mobile-only" was never a property (APPENDED s1223)

⚠️ **The s1216 row above (`mobile-chrome … 2/8 (25.0%) … monotonic`) is the origin of the
"25% mobile-only at w4" label that then rode four task masters and three fires as a reason not to
look at this spec.** The row itself is honest — it states its tree, its denominator and its worker
count. What was not honest is what got copied out of it: a rate stripped of its denominator and its
load, re-quoted as a *property of the test*.

**The subject is now CURED** — s1222, `855f4d74`, **test-only** (`git show --name-only` over `src/`,
`functions/`, `assets/` is empty). The spec let the wave countdown EXPIRE before forcing wave 1, so
the `:121` assertion was correctly rejecting the transition. It was a deterministic sequencing bug
whose *visibility* was load-dependent — not a concurrency victim, and `StandingOrders.ts` was never
at fault.

**Pre-cure failure rate is a monotonic function of load, and is SYMMETRIC across projects:**

| Measurement | loadavg | desktop-chrome | mobile-chrome |
|---|---|---:|---:|
| s1216 (this table, dedicated box, w4) | quiet | 0/8 (0.0%) | 2/8 (25.0%) |
| s1223 control (interleaved T–C–T, w4) | 5.4 → 15.7 | **2/4 (50.0%)** | **2/4 (50.0%)** |
| s1222 control (drain load, w4) | ~25 | **4/4 (100.0%)** | **4/4 (100.0%)** |

➡️ **"mobile-only" was a small-sample artifact, and it is quantifiable rather than a matter of
opinion:** at the ~12.5% pooled rate this table measured, a desktop arm drawing 0/8 has probability
0.875⁸ ≈ **34%** — an unremarkable coin-flip, not evidence of a project-specific defect. Both later
measurements, at higher load and with the arms counted separately, put desktop and mobile at
*identical* rates.

**Post-cure:** **64/64 green**, both projects, across two independent fires and trees — s1222
(32/32 at loadavg 25.28) and s1223 (T1 16/16 at loadavg → 14.50; T2 16/16 at loadavg → **29.06**,
the heaviest load this subject has ever been measured under). A failure in this spec is now a **real
regression** and must be reported as one, not written off.

**Method note, and the reason this section exists:** s1223 set out to strike the label from task
prose per s1222's recommendation, and found that recommendation's premise wrong — s1222 recorded
"it is not in `logs/suite-red-inventory.md` (checked)", but the grep was for the task-prose label
`:121` while this file keys the same subject on `:80`. **The number was minted here.** Correcting
only the copies would have left the source able to regenerate them. s1223's own first control arm
was also thrown away rather than used: it reported a tidy 8/8 red that was `ERR_CONNECTION_REFUSED`
from a scratch dev server that had silently died — a contaminated control agreeing with the
conclusion it was supposed to test.

---

## ADDENDUM (s1224, 2026-07-29) — F-1224-3: a baseline red that is in NO table above

**`e2e/wire-e2-enemy-walk4.spec.ts:15` — *"E2 roster uses advancing walk4 art while E1 keeps the
jumper walk8"* — fails on main in BOTH projects and appears nowhere in the generated tables above.**

Measured during the s1224 drain of `e2-rail-tough-only-bind`, with its conditions attached because
a rate without them is not a measurement:

| arm | tree | load | desktop | mobile |
|---|---|---|---:|---:|
| treatment | merged tree (rail-tough bind applied) | 46 tests / 8 workers | **FAIL** | **FAIL** |
| control | pre-merge main `b9918410`, detached worktree, scratch port 5236 | 16 tests / 6 workers | **FAIL** | **FAIL** |

**4/4 across two different trees and two different loads.** The E2 roster/motion half of the spec
passes; the failure is its unrelated **E1** control, which times out after five seconds waiting for
`char.bandit_base.loaded`. The lane runner independently reproduced the same failure on its own
detached current-main control (desktop 1/1) before this drain did.

**Why this is worth a row rather than a shrug:** the s1224 drain spent a full control battery
establishing that this red was not caused by the merge under review — work that was necessary only
because nothing on the board said it was already failing. The next fire to run an E2-adjacent
battery will pay that cost again. **Diagnosis of the E1 loader timeout is a separate slice; this
addendum only records that the red exists, is pre-existing, and is not a regression signal.**

**Not added to the tables above on purpose:** those are the output of a single whole-suite run and
carry a reduction check that counts their own rows. This red should acquire a proper row the next
time `scripts/suite-red-inventory.mjs` is regenerated from a fresh whole-suite run.

---

## Addendum — s1304 (2026-07-31): `e2e/agent-view.spec.ts:268` zero-console rider, MOBILE-ONLY and ORDER-DEPENDENT (F-1304-1)

> ✅ **CURED s1305 at `7d92fe5a` — THIS ROW IS RETIRED. Superseded, not deleted (Retention Law).**
> `watchErrors()` in `e2e/agent-view.spec.ts` now routes exactly the prefix
> `THREE.GLTFLoader: Couldn't load texture blob:` into a separate `suppressed[]` array; every other
> console error and every `pageerror` still reds the test, proven by a permanent in-file mutation control.
> **A future fire must not read this row as a live red.** Review: `reviews/f1304-1-manifest-view-console-rider.md`.
>
> ⚠️ **AND THE CHARACTERISATION BELOW IS WRONG — corrected in place, because the error is more
> instructive than the row (F-1305-1).** The bolded sentence that follows says this condition is
> *"not flaky … deterministic given the run shape."* s1305 ran the identical Arm A command on the
> **byte-identical pre-merge tree** and got **3 green / 1 red in 4 runs** (loads 3.39 / 3.78 / 4.62 / 5.12;
> the red at 4.62, and a green at 5.12 with load deliberately raised by burners to match s1304's 5.07–5.67).
> It is **load-sensitive and stochastic — exactly what F-1180-2 always called it.** "Deterministic" was
> drawn from n=3 at one load level; the fourth sample broke it.
>
> 🔬 **The consequence outlives the row.** The corrective's acceptance bar was *"3 consecutive both-project
> runs green"* — and across **six** certifying runs (the runner's three, s1305's three) the suppressed
> counter read **`0/0` every single time**, i.e. the transient never occurred and the filter never fired.
> **All six greens would have been green with the fix reverted.** The cure is real, but it is proven by the
> mutation control and by the fingerprint matching the predicate — *never* by those greens.
> **When you write an acceptance bar for a stochastic red, gate it on a measured rate, not on a run count.**

| Spec | Test | Project | Callsite | Fingerprint | Class |
|---|---|---|---|---|---|
| ~~e2e/agent-view.spec.ts~~ | ~~the derived manifest rides THE VIEW and every E1 briefing speaks it~~ | ~~mobile-chrome~~ | ~~e2e/agent-view.spec.ts:268 (closing `expect(errors).toEqual([])`)~~ | ~~8 x `THREE.GLTFLoader: Couldn't load texture blob:http://127.0.0.1:5188/<uuid>`~~ | **RETIRED s1305 — cured at `7d92fe5a`** |

**The condition is not "flaky" — it is deterministic given the run shape,** which is why it needs a row
rather than a shrug. Measured by the s1304 drain, same tree, same shell, same hour, every arm
`--workers=1` (F-1270-1), machine load stationary at 5.67 / 5.39 / 5.07:

| Arm | Command | n | Result |
|---|---|---|---|
| A | `npx playwright test e2e/agent-view.spec.ts --workers=1` (both projects) | 3 | **3/3 FAIL**, mobile `:283` only |
| B | same file, `--project=mobile-chrome` | 2 | **2/2 PASS** |
| C | same file both projects, `--grep "briefing speaks it"` | 1 | **PASS** (2/2 instances) |

Arm C names the mechanism: running **both** projects but only this one test passes, so the poison is
the heavy **preceding** `:342` seeded-rider boot (`?debug&nowaves&nolevel&nopause`) in the same worker,
after which the next town entry's texture blobs fail to decode. **`:342` is a pre-existing test that the
AP-11 slice (`d97bc4d5`) never touched** — the new assertion is simply the first one positioned to see it.
The fingerprint is the **F-1180-2** class (`tasks/BACKLOG.md:424`), whose own text predicted that
*"the next full-suite comparison will read it as a NEW red and mis-attribute it"*. This row exists so that
does not happen.

⚠️ **Arm B alone would have justified "flaky, ignore".** An isolated green is a second experiment, not a
control — the only reason this is a named, mechanism-bearing red instead of a shrug is that it was run
three *different* ways rather than three times the same way.

**Retires when** `tasks/lane-a-f1304-1-manifest-view-console-rider.md` merges: that corrective narrows the
rider to ignore exactly this documented transient while proving a foreign console error still reds the test.
➡️ **IT MERGED at `7d92fe5a` (s1305) and this row is retired** — see the CURED banner at the top of this
addendum, and F-1305-1 for why the merge evidence does not say what the acceptance bar thought it said.
It deliberately does **not** attempt the underlying renderer-determinism cure — F-1083-2 (`tasks/BACKLOG.md:1766`)
rules that not fire-authorable.

**Not added to the tables above on purpose:** they are the output of a single whole-suite run and carry a
reduction check that counts their own rows.

---

## F-1424-4 — STOP: the harness rejects the required whole-spec subject (APPENDED s1425)

**No concurrency-rate verdict exists from this attempt.** The instrument passed its own self-test
(`concurrency-class-rate self-check passed`), but that self-test covers only `file:line` subjects. The
required bare-file subject exposes an untested contract mismatch: `normalizeSubject` accepts
`e2e/town-t5-townsfolk.spec.ts`, while `assertComplete` expects that bare key to appear in Playwright's
line-qualified reporter rows.

- Tree: `f82c7156ac62e24efb5f30030336fb12c462c6f1`.
- Lane default probe: `Running 10 tests using 2 workers` (`CLAUDE_CONFIG_DIR` unset;
  `os.cpus().length=16`). Therefore **M=2**, and this shell's real default is parallel rather than serial.
- Requested command: whole spec, workers `1,2,2`, 8 cycles, port 5271. The parser de-duplicated the
  repeated M arm to workers `1,2` and announced `run 1/16`, so the task's requested 24 distinct-arm runs
  are also impossible when M equals the fixed middle arm.
- Observed stop on the first workers=1 run: missing the two bare-file project keys, with all ten actual
  `(test declaration line, project)` rows reported as extras; `executions=10/2`. The server released port
  5271 cleanly.
- Retained evidence: `logs/session-scratch/s1425-town-t5-worker-arms/raw/run-01-w1.json` (14,695 bytes).
  The harness aborted before writing `runs.jsonl`, `rates.json`, or `rates.md`, so there is no arm table,
  classification, pooled `:203` rate, `:104` failure split, or wall-clock-per-arm record to report.

This is the task's explicit **instrument-wrong hard stop**: do not edit
`scripts/concurrency-class-rate.mjs`, do not replace the mandated bare-file subject with line filters,
and do not label the incomplete observation as any pre-declared outcome. The subject at `:203`, its
shared failing helper at `:104`, `playwright.config.ts`, and the harness were not changed.

---

## Refresh attempt — 2026-08-11 (ABORTED; snapshot unchanged)

> ⚠️ **SUPERSEDED (marker appended s1688, 2026-08-12 — F-1688-2; the observation below is preserved
> verbatim per the ADDITIVE-ONLY law and is still true of the attempt it describes).** A later run the
> same day **did** complete: see `## Run conditions` and `## Load-attributable (parallel-only) failures`
> **below this block**, merged at `1981d2b3a (archive: pruned by the A3 rewrite)`. Everything this block calls impossible — the reduction,
> the positive control, the compact-JSON refresh and the serial failure-file classification — was then
> done. ⚠️ **Do not read this block's `### Load-attributable` sub-section as the current verdict:** it
> is the ABORTED attempt's, it still reads *"Not classified"*, and it sits directly above the real one.

The required full-suite producer terminated before completion, after reaching **719 / 2,802** tests.
Playwright did not emit `logs/suite-red-inventory-raw.json`, so no reduction, positive control, compact
JSON refresh, serial failure-file classification, or replacement of the 2026-07-28 observation was
possible. The existing corrections and snapshot tables remain unchanged.

### Run conditions

- Command: `PLAYWRIGHT_JSON_OUTPUT_NAME=logs/suite-red-inventory-raw.json npx playwright test --reporter=json`
- Start: 2026-08-11 02:30:41 +0700; termination observed before the 04:49:28 +0700 check; elapsed approximately **2 h 18 m**.
- Physical cores: **16**.
- Harness: Playwright announced **2,802 tests using 8 workers**. No completed reporter `Harness:` line exists because the JSON report was never written.
- Non-suite load at start (>20% CPU): `fseventsd` **100.0%**, elapsed **67d 05:39:55**; headless Blender (`assets/blender/fries-mcdx/landmark.blend`) **92.8%**, elapsed **02:33:49**.
- Non-suite load at end check (>20% CPU): `fseventsd` **102.2%**, elapsed **67d 07:59:18**; `corespotlightd` **59.4%**, elapsed **67d 07:58:53**; WindowServer **51.0%**, elapsed **67d 07:59:18**; `mds` **48.8%**, elapsed **67d 07:59:18**; `contextstored` **45.0%**, elapsed **67d 07:59:18**; `audioanalyticsd` **25.4%**, elapsed **25d 11:46:30**. Blender was no longer running.
- The run repeatedly emitted browser timeouts, trace-teardown failures, and runtime render demotions under this load. These are incomplete observations and are **not** added to the snapshot tables.

### Load-attributable (parallel-only) failures

**Not classified.** The raw report was not emitted, so the complete failing-file set required for the
mandated serial rerun does not exist.


## Run conditions

- Command: `PLAYWRIGHT_JSON_OUTPUT_NAME=logs/suite-red-inventory-raw.json nice -n 19 npx playwright test --reporter=json --workers=3`.
- Start: **2026-08-11 13:37:35 +0700**; end: **2026-08-11 20:10:27 +0700**; wall clock **6 h 32 m 52 s**.
- Physical cores: **16**.
- Harness: configured workers **3**; actual workers **3**; fully parallel **false**; shard **null**; Playwright **1.61.1**.
- Non-suite load at start (>20% CPU): `fseventsd` **167.2%**, elapsed **67d 16:46:50**; WindowServer **47.8%**, elapsed **67d 16:46:50**; `audioanalyticsd` **24.0%**, elapsed **25d 20:34:02**.
- Non-suite load at end (>20% CPU): WindowServer **52.7%**, elapsed **67d 23:20:06**; Codex Renderer **24.0%**, elapsed **3d 12:31:07**. `fseventsd` and `audioanalyticsd` were below the reporting threshold; Blender was not running at either endpoint.
- Serial attribution: all **199** failing spec files rerun once with `nice -n 19 npx playwright test … --workers=1 --reporter=json`; **1,706** executions, **1,332 passed**, **293 failed**, **54 skipped**, **24 did not run**, wall clock **5.1 h**.
- The task opened pages only through the existing suite and added no page-opening code. No screenshots were requested or produced beyond the suite's own failure and evidence artifacts.

## Load-attributable (parallel-only) failures

**273** parallel failures passed in the required serial rerun; **274** remained red and **0** were unresolved.

- `e2e/045-megaproject.spec.ts` — mobile-chrome — debug dev megaproject reserves, funds, delays, completes, and persists
- `e2e/050-audio-mix-and-access.spec.ts` — mobile-chrome — pause overlay volume and mute persist and sync with Settings
- `e2e/057-baron-rocket-cart.spec.ts` — mobile-chrome — Baron rocket volley targeting is deterministic for the same seed
- `e2e/057-baron-rocket-cart.spec.ts` — mobile-chrome — defeating the Baron captures the cart, shows the medal line, and unlocks captured research
- `e2e/058-device-tiers.spec.ts` — desktop-webkit — desktop WebKit records FULL baseline and LITE wave-20 stress envelope
- `e2e/066-walk8-engine.spec.ts` — desktop-chrome — Claim Jumper walk8 keeps the old stride duration at higher frame count
- `e2e/066-walk8-engine.spec.ts` — mobile-chrome — Claim Jumper walk8 keeps the old stride duration at higher frame count
- `e2e/066-walk8-engine.spec.ts` — desktop-chrome — hero walks on the activated walk8 sheet at the ratified cadence
- `e2e/066-walk8-engine.spec.ts` — mobile-chrome — hero walks on the activated walk8 sheet at the ratified cadence
- `e2e/072-era-activation.spec.ts` — desktop-chrome — the completed Stamp Mill activates E2 once, stages the ceremony, and makes Hill Mine playable after reload
- `e2e/072-era-activation.spec.ts` — mobile-chrome — the completed Stamp Mill activates E2 once, stages the ceremony, and makes Hill Mine playable after reload
- `e2e/072-era-activation.spec.ts` — mobile-chrome — the E2 ceremony can be skipped without undoing activation
- `e2e/078-ux-hygiene.spec.ts` — mobile-chrome — ledger Escape closes only the ledger and restores schoolhouse focus
- `e2e/ap-standing-orders.spec.ts` — mobile-chrome — plain-boot production orders pan a seam and place a real building
- `e2e/beauty-baron.spec.ts` — desktop-chrome — shot 6 — the horizon behind the fort: what the panorama says about his operation
- `e2e/beauty-far-ground.spec.ts` — mobile-chrome — the far ground › e1-dry-gulch: the panorama's foot is above the top edge of the frame, and the apron is painted
- `e2e/beauty-far-ground.spec.ts` — mobile-chrome — the far ground › the apron costs zero draw calls, and ?horizonApron=off is a real A/B
- `e2e/beauty-far-ground.spec.ts` — desktop-chrome — the far ground › the far band actually changes, at the pose where the apron is on camera
- `e2e/beauty-night-shift.spec.ts` — mobile-chrome — night shift beauty board
- `e2e/beauty-twin-banks.spec.ts` — mobile-chrome — the beauty pass pays its frame budget, measured against its own build
- `e2e/blast-relief-height.spec.ts` — mobile-chrome — zero-height samples preserve flat impact offset and sim payload determinism
- `e2e/board-card-images.spec.ts` — desktop-chrome — all contract chapters use their own board-card URL
- `e2e/board-card-images.spec.ts` — mobile-chrome — all contract chapters use their own board-card URL
- `e2e/board-era-chapters.spec.ts` — mobile-chrome — a fresh profile opens only the Frontier chapter and keeps Ride Together and the Claim Ledger
- `e2e/board-era-chapters.spec.ts` — mobile-chrome — debug opens every chapter without removing any contract launch surface
- `e2e/board-era-chapters.spec.ts` — mobile-chrome — the era door exposes chapters through the reached frontier and nothing beyond it
- `e2e/bt-00-demolish.spec.ts` — mobile-chrome — tiered half-HP sluice refund scales from base cost only
- `e2e/bt-01-tiers.spec.ts` — desktop-chrome — sluice tier raises pan-out yield and out-earns two tier-1 rates
- `e2e/bt-01-tiers.spec.ts` — desktop-chrome — stockpile upgrade names the yard and shows its tier capacity in the build menu
- `e2e/bt-01-tiers.spec.ts` — mobile-chrome — stockpile upgrade names the yard and shows its tier capacity in the build menu
- `e2e/ceremony-framework.spec.ts` — mobile-chrome — T10 THE CHARTER PRESS: the E10 science ceiling opens the existing River finale and idle opens nothing
- `e2e/ceremony-framework.spec.ts` — mobile-chrome — T7 THE STARSHIP: the umbilical hand alone arms E8 exactly once and the kept era survives reload
- `e2e/combat-readability.spec.ts` — desktop-chrome — palisade bars stay in the wall frame for rotationSteps 0 and 1
- `e2e/contract-briefings.spec.ts` — mobile-chrome — board cards show the same briefing data
- `e2e/contract-briefings.spec.ts` — desktop-chrome — briefing card and pause contract fit at 390px
- `e2e/contract-briefings.spec.ts` — mobile-chrome — briefing card and pause contract fit at 390px
- `e2e/contract-briefings.spec.ts` — desktop-chrome — every current contract launch shows manifest briefing goals and rules
- `e2e/contract-briefings.spec.ts` — mobile-chrome — every current contract launch shows manifest briefing goals and rules
- `e2e/e1-baron.spec.ts` — mobile-chrome — Baron manifest loads and taunts fire at waves 5, 12, and 18
- `e2e/e1-baron.spec.ts` — desktop-chrome — contract board requires science plus two secured claims and always shows an earned medal
- `e2e/e1-baron.spec.ts` — mobile-chrome — contract board requires science plus two secured claims and always shows an earned medal
- `e2e/e1-baron.spec.ts` — desktop-chrome — wave 20 spawns the Baron with elite stats, banner, escorts, and stable seed data
- `e2e/e1-baron.spec.ts` — mobile-chrome — wave 20 spawns the Baron with elite stats, banner, escorts, and stable seed data
- `e2e/e1-night-shift.spec.ts` — mobile-chrome — seeded Night Shift diagnostics and dark render budget are stable
- `e2e/e1-perf-pass.spec.ts` — mobile-chrome — E1 maps publish a pressure census and preserve pressure pixels
- `e2e/e1-twin-banks.spec.ts` — mobile-chrome — routes enemies through both west and east fords
- `e2e/e2-hill-mine.spec.ts` — desktop-chrome — Hill Mine 200-enemy stress stays inside envelope
- `e2e/e2-hill-mine.spec.ts` — mobile-chrome — Hill Mine terrain simulation is deterministic for a seeded route
- `e2e/e2-pressure-in-run.spec.ts` — desktop-chrome — coal feeds boilers, pressure vents, and PRESSURIZE completes
- `e2e/e2-pressure-in-run.spec.ts` — mobile-chrome — coal feeds boilers, pressure vents, and PRESSURIZE completes
- `e2e/e2-rail-entity.spec.ts` — desktop-chrome — rails do not change sim hash and stay under the draw-call budget
- `e2e/e2-rail-entity.spec.ts` — mobile-chrome — rails do not change sim hash and stay under the draw-call budget
- `e2e/e2-stamp-mill.spec.ts` — mobile-chrome — Stamp Mill manifest builds to the door without switching epochs
- `e2e/e2-t2-dynamo-ceremony.spec.ts` — mobile-chrome — the T2 door reports missing science and the Voltage ceremony remains skippable
- `e2e/e2-trestle.spec.ts` — desktop-chrome — The Trestle unlocks after Hill Mine and runs the shipped crossing systems
- `e2e/e2-trestle.spec.ts` — mobile-chrome — The Trestle unlocks after Hill Mine and runs the shipped crossing systems
- `e2e/e4-dust-flats.spec.ts` — mobile-chrome — publishes a mask table that matches the real Dust Flats contract
- `e2e/e5-arsenal.spec.ts` — mobile-chrome — pressure-seals the rig and records cure-arm outcomes through the existing resolver
- `e2e/e5-boss-dredge-queen.spec.ts` — desktop-chrome — keeps the boss-run frame p95 within 15% of the non-boss tile
- `e2e/e6-decay-framework.spec.ts` — mobile-chrome — same-seed decay registration, pause, and aura ticks are deterministic
- `e2e/e7-arsenal.spec.ts` — mobile-chrome — the four additions are absent before Signal and inherited from epoch 7 onward
- `e2e/e7-boss.spec.ts` — desktop-chrome — mirrors the live base, grades novelty, and keeps the Echo in a jar without a kill
- `e2e/e7-boss.spec.ts` — mobile-chrome — mirrors the live base, grades novelty, and keeps the Echo in a jar without a kill
- `e2e/e7-playbook-surface.spec.ts` — mobile-chrome — record, name, shelf, and replay use the profile tape store and the slaved rig actor
- `e2e/e7-playbook-surface.spec.ts` — mobile-chrome — the tape drawer arms at the Signal Era and remains inherited afterward
- `e2e/e9-canal-stages.spec.ts` — desktop-chrome — 2. the north-scarp ice band uses harvest dwell and restores its Economy receipt
- `e2e/e9-canal-stages.spec.ts` — mobile-chrome — 3. the dust devil telegraphs, follows its authored lane, and shoves without chasing or damage
- `e2e/ed-02-authored-grid-substrate.spec.ts` — mobile-chrome — session document changes visual height across reload while the sim fingerprint stays identical
- `e2e/eight-winds-enemies.spec.ts` — desktop-chrome — diagnostics drive thief northeast and Baron southwest on their correct rows
- `e2e/f-bw-16-baron-siege.spec.ts` — mobile-chrome — unblocked Baron fight keeps its deterministic baseline
- `e2e/f1575-1-drift-tick-budget.spec.ts` — desktop-chrome — maps denied-receipt drift at fixed start phase P=35
- `e2e/f1575-1-drift-tick-budget.spec.ts` — mobile-chrome — maps denied-receipt drift at fixed start phase P=35
- `e2e/f1575-1-drift-tick-budget.spec.ts` — mobile-chrome — maps denied-receipt drift at fixed start phase P=39
- `e2e/f1575-1-drift-tick-budget.spec.ts` — desktop-chrome — maps denied-receipt drift at fixed start phase P=43
- `e2e/f1575-1-drift-tick-budget.spec.ts` — mobile-chrome — maps denied-receipt drift at fixed start phase P=43
- `e2e/f1575-1-drift-tick-budget.spec.ts` — desktop-chrome — maps denied-receipt drift at fixed start phase P=47
- `e2e/f1575-1-drift-tick-budget.spec.ts` — mobile-chrome — maps denied-receipt drift at fixed start phase P=47
- `e2e/gazette-first-issue.spec.ts` — mobile-chrome — fresh profile gets the pinned first issue badge and can reopen it
- `e2e/gazette-first-issue.spec.ts` — mobile-chrome — mandatory welcome opens issue one only on the first town entry
- `e2e/gt-02-slope.spec.ts` — desktop-chrome — tile param is debug-gated and first-claim fingerprint remains flat
- `e2e/gt-02-slope.spec.ts` — mobile-chrome — tile param is debug-gated and first-claim fingerprint remains flat
- `e2e/gt-05-water-depth.spec.ts` — desktop-chrome — classic claim keeps deep water impassable while carrying equivalent depth data
- `e2e/gt-05-water-depth.spec.ts` — mobile-chrome — classic claim keeps deep water impassable while carrying equivalent depth data
- `e2e/gt-05-water-depth.spec.ts` — mobile-chrome — deep water blocks hero and enemy through the shared resolver
- `e2e/gt-05-water-depth.spec.ts` — desktop-chrome — GT water depth simulation is deterministic
- `e2e/gz-h1-newsie.spec.ts` — desktop-chrome — newsie barks latest headline and opens the Claim Herald
- `e2e/landmark-brightness.spec.ts` — desktop-chrome — Night Shift keeps ground light pools without mutating landmark materials
- `e2e/landmark-brightness.spec.ts` — desktop-chrome — The Claim keeps daylight landmarks opaque, lit, and under the frame budget
- `e2e/landmark-brightness.spec.ts` — mobile-chrome — The Claim keeps daylight landmarks opaque, lit, and under the frame budget
- `e2e/landmark-collision.spec.ts` — desktop-chrome — later-era modeled plaza props use their authored Town footprints
- `e2e/landmark-collision.spec.ts` — mobile-chrome — later-era modeled plaza props use their authored Town footprints
- `e2e/lane-baron-props-detail.spec.ts` — desktop-chrome — the detailed launcher and powder keg mount without the wrecker stone
- `e2e/lane-baron-props-detail.spec.ts` — mobile-chrome — the detailed launcher and powder keg mount without the wrecker stone
- `e2e/lane-boss-healthbar.spec.ts` — mobile-chrome — boss damage leaves green life over red loss
- `e2e/m1-02-auto-fire.spec.ts` — desktop-chrome — run reset recycles combat pools without renderer memory growth
- `e2e/m1-02-auto-fire.spec.ts` — mobile-chrome — run reset recycles combat pools without renderer memory growth
- `e2e/m1-02-auto-fire.spec.ts` — desktop-chrome — stress pack never exceeds the bolt pool and logs no console errors
- `e2e/m1-02-auto-fire.spec.ts` — mobile-chrome — stress pack never exceeds the bolt pool and logs no console errors
- `e2e/m1-04-gold-panning-economy.spec.ts` — desktop-chrome — leaving mid-pan decays harvest progress
- `e2e/m1-05-sentry-beacon-build.spec.ts` — mobile-chrome — Sentry Beacon registers kills through combat with zero input
- `e2e/m1-06-level-up-choices.spec.ts` — desktop-chrome — draft expiry files the first offer and the run continues
- `e2e/m1-06-level-up-choices.spec.ts` — desktop-chrome — first offer is deterministic for a fixed seed and has no duplicates
- `e2e/m1-06-level-up-choices.spec.ts` — mobile-chrome — first offer is deterministic for a fixed seed and has no duplicates
- `e2e/m1-06-level-up-choices.spec.ts` — desktop-chrome — investment weighting prefers owned families without losing discovery
- `e2e/m1-06-level-up-choices.spec.ts` — mobile-chrome — investment weighting prefers owned families without losing discovery
- `e2e/m1-07-charm.spec.ts` — desktop-chrome — wave banner rotation avoids immediate repeats
- `e2e/m2-02-sluice-and-stockpile.spec.ts` — mobile-chrome — R rotates the palisade footprint and the rotated AABB blocks on that axis
- `e2e/m2-03-wave-scheduler.spec.ts` — mobile-chrome — lull window stays spawn-free between scheduled pulses
- `e2e/m2-04-gold-stealing.spec.ts` — mobile-chrome — bank cap blocks pickup reclaim until room exists
- `e2e/m2-05-base-damage-repair.spec.ts` — mobile-chrome — wreck and repair cycles leave shooter and renderer counts at baseline
- `e2e/m2-05b-overwhelm-valves.spec.ts` — mobile-chrome — lullFloor12 only clamps post-wave-12 pulse spacing
- `e2e/m2-05b-overwhelm-valves.spec.ts` — desktop-chrome — scheduled thief flags never exceed the concurrency cap
- `e2e/m2-05b-overwhelm-valves.spec.ts` — desktop-chrome — theft ping shows edge glyph, auto-hides, and debug flags suppress it
- `e2e/m2-05b-overwhelm-valves.spec.ts` — mobile-chrome — theft ping shows edge glyph, auto-hides, and debug flags suppress it
- `e2e/m2-06-arsenal-blast-charge.spec.ts` — desktop-chrome — stress blast pool never exceeds cap
- `e2e/m2-07-base-self-hold.spec.ts` — mobile-chrome — SELF-HOLD reference base keeps half standing through wave-25 pulse cycles
- `e2e/m2-07-base-self-hold.spec.ts` — desktop-chrome — SELF-HOLD reference base survives two wave-15 pulse cycles without hero intervention
- `e2e/m2-07-base-self-hold.spec.ts` — mobile-chrome — SELF-HOLD reference base survives two wave-15 pulse cycles without hero intervention
- `e2e/m2-07b-building-incentive-tune.spec.ts` — desktop-chrome — half-damaged sluice repairs for proportional global cost
- `e2e/m2-07b-building-incentive-tune.spec.ts` — mobile-chrome — half-damaged sluice repairs for proportional global cost
- `e2e/m3-05b-run-ledger.spec.ts` — desktop-chrome — Claim Office opens a responsive Run Ledger and a profile reset returns its warm empty state
- `e2e/m3-05b-run-ledger.spec.ts` — mobile-chrome — Claim Office opens a responsive Run Ledger and a profile reset returns its warm empty state
- `e2e/m4-06-embodiment.spec.ts` — desktop-chrome — permission-denied bark survives the first idle survey
- `e2e/m4-06-embodiment.spec.ts` — mobile-chrome — permission-denied bark survives the first idle survey
- `e2e/m4-07-prospector-panel.spec.ts` — desktop-chrome — auto-collect consent halts and resumes behavior, with stacked newest-first receipts
- `e2e/m4-07-prospector-panel.spec.ts` — mobile-chrome — auto-collect consent halts and resumes behavior, with stacked newest-first receipts
- `e2e/m5-04-offline-queue.spec.ts` — mobile-chrome — posted orders stay visible across reloads and refresh to verdicts on reopen
- `e2e/map-beauty-dry-gulch.spec.ts` — desktop-chrome — Dry Gulch relief stays inside FULL and LITE render budgets
- `e2e/map-beauty-dry-gulch.spec.ts` — mobile-chrome — Dry Gulch relief stays inside FULL and LITE render budgets
- `e2e/map-census.spec.ts` — mobile-chrome — e1-dry-gulch census
- `e2e/map-census.spec.ts` — mobile-chrome — e2-pressure-garden mobile spot
- `e2e/map-census.spec.ts` — mobile-chrome — e3-fairground census
- `e2e/map-census.spec.ts` — desktop-chrome — e4-boneyard census
- `e2e/map-census.spec.ts` — mobile-chrome — e4-boneyard census
- `e2e/map-census.spec.ts` — desktop-chrome — e5-deepwater-claim census
- `e2e/map-census.spec.ts` — mobile-chrome — e5-deepwater-claim census
- `e2e/map-census.spec.ts` — desktop-chrome — e5-deepwater-claim mobile spot
- `e2e/map-census.spec.ts` — mobile-chrome — e5-deepwater-claim mobile spot
- `e2e/map-census.spec.ts` — desktop-chrome — e6-glow-mesa census
- `e2e/map-census.spec.ts` — mobile-chrome — e6-showroom census
- `e2e/map-census.spec.ts` — desktop-chrome — e7-relay-valley census
- `e2e/map-census.spec.ts` — mobile-chrome — e7-relay-valley census
- `e2e/map-census.spec.ts` — desktop-chrome — the-claim mobile spot
- `e2e/map-census.spec.ts` — mobile-chrome — the-claim mobile spot
- `e2e/meta-presence.spec.ts` — mobile-chrome — combat hit-pause does not open the claim memory ledger
- `e2e/meta-presence.spec.ts` — desktop-chrome — earned meta is visible in run recap, pause ledger, and boosted cards
- `e2e/mp-02-lockstep.spec.ts` — mobile-chrome — town Ride Together invalid word stays friendly at 390px
- `e2e/mp-06-party-overview.spec.ts` — desktop-chrome — party roster shows live shared truth and local camera glance
- `e2e/mp-06-party-overview.spec.ts` — mobile-chrome — party roster shows live shared truth and local camera glance
- `e2e/mp-arsenal.spec.ts` — desktop-chrome — riders fire different weapons under their stats, share credit, and keep equal hashes
- `e2e/mp-balance-harness.spec.ts` — mobile-chrome — the browser channel requires both debug and mpbalance query gates
- `e2e/mp-reconnect.spec.ts` — desktop-chrome — a disconnected rider rejoins its held slot at the exact snapshot tick and keeps identical world hashes
- `e2e/mu-02-music.spec.ts` — desktop-chrome — title music waits for a gesture and music volume persists
- `e2e/never-trap.spec.ts` — desktop-chrome — Night Shift enemies always make goal progress around object footprints
- `e2e/never-trap.spec.ts` — mobile-chrome — Night Shift enemies always make goal progress around object footprints
- `e2e/night-light-doctrine.spec.ts` — mobile-chrome — honest night lights reveal only carried lamps, watch paint, consent, and shots
- `e2e/night3d-perf.spec.ts` — desktop-chrome — Night Shift keeps its lantern read and auto-tiers one sticky step at a time
- `e2e/night3d-perf.spec.ts` — mobile-chrome — Night Shift keeps its lantern read and auto-tiers one sticky step at a time
- `e2e/panorama-framing.spec.ts` — desktop-chrome — e1-night-shift keeps its panorama in world framing across the wide aspect matrix
- `e2e/panorama-framing.spec.ts` — mobile-chrome — e1-night-shift keeps its panorama in world framing across the wide aspect matrix
- `e2e/panorama-framing.spec.ts` — desktop-chrome — e4-gusher-county keeps its panorama in world framing across the wide aspect matrix
- `e2e/panorama-framing.spec.ts` — mobile-chrome — e4-gusher-county keeps its panorama in world framing across the wide aspect matrix
- `e2e/panorama-framing.spec.ts` — mobile-chrome — legacy painted ground stays hidden while sculpt landmarks remain mounted
- `e2e/panorama-framing.spec.ts` — desktop-chrome — write the three 2000x1000 run-camera proof shots
- `e2e/perf-05-startup.spec.ts` — desktop-chrome — startup reaches playable quickly and defers non-critical textures
- `e2e/perf-05-startup.spec.ts` — mobile-chrome — startup reaches playable quickly and defers non-critical textures
- `e2e/polish-03-mobile-hud.spec.ts` — mobile-chrome — mobile HUD controls fit, tap, and avoid overlap at 390px and 430px
- `e2e/research-chart.spec.ts` — desktop-chrome — survey chart renders node states, traces locked requirements, and persists one pin
- `e2e/research-chart.spec.ts` — mobile-chrome — survey chart renders node states, traces locked requirements, and persists one pin
- `e2e/restore-validation.spec.ts` — desktop-chrome — page-load restore materializes run-manager state after manager assignment
- `e2e/run-gait-stride.spec.ts` — desktop-chrome — run gait advances by distance and preserves the Baron cadence
- `e2e/run-gait-stride.spec.ts` — mobile-chrome — run gait advances by distance and preserves the Baron cadence
- `e2e/run-scene-animation-refresh.spec.ts` — desktop-chrome — run boots on the approved female Hero walk8 and advances frames
- `e2e/run-scene-animation-refresh.spec.ts` — mobile-chrome — run boots on the approved female Hero walk8 and advances frames
- `e2e/run-suspend.spec.ts` — desktop-chrome — ended runs clear suspend and town board launch confirms abandoning a saved claim
- `e2e/run-suspend.spec.ts` — mobile-chrome — ended runs clear suspend and town board launch confirms abandoning a saved claim
- `e2e/run3d-gold-seam.spec.ts` — desktop-chrome — flag-off boot keeps gold sprites and requests no GLB
- `e2e/run3d-gold-seam.spec.ts` — desktop-chrome — pilot loads once, mirrors live seams, and unmounts one depleted seam
- `e2e/run3d-palisade.spec.ts` — desktop-chrome — 12-instance pilot p95 stays within the 115% frame budget
- `e2e/run3d-rail-elements.spec.ts` — desktop-chrome — flag-off boot keeps procedural rails and requests no rail-element GLB
- `e2e/run3d-stockpile.spec.ts` — desktop-chrome — maximum legal stockpiles stay within the 115% frame budget
- `e2e/save-slots.spec.ts` — desktop-chrome — manual save creates a curated slot, preserves auto, and loads through the suspend restore path
- `e2e/save-slots.spec.ts` — mobile-chrome — manual save creates a curated slot, preserves auto, and loads through the suspend restore path
- `e2e/scene-swap-camera.spec.ts` — mobile-chrome — town-run-town keeps camera truth at 1440x900
- `e2e/sim-fixed-step.spec.ts` — desktop-chrome — 30/60/144 fps render schedules produce the same 300-tick simulation
- `e2e/sim-fixed-step.spec.ts` — desktop-chrome — fixed ticks carry fractional cooldown debt instead of losing volleys
- `e2e/ss-01-beats.spec.ts` — desktop-chrome — story card waits until wave banner clears when both fire same tick
- `e2e/ss-01-beats.spec.ts` — mobile-chrome — story card waits until wave banner clears when both fire same tick
- `e2e/ss-02-beats.spec.ts` — desktop-chrome — once beats are marked only when displayed and queued beats survive reload
- `e2e/ss-02-beats.spec.ts` — mobile-chrome — once beats are marked only when displayed and queued beats survive reload
- `e2e/tailor-wagon.spec.ts` — desktop-chrome — the tailor's wagon owns the profile wardrobe and Settings has no picker
- `e2e/task-024-blast-aim-presets.spec.ts` — mobile-chrome — difficulty presets apply the hard-mode bundle and persist by profile key
- `e2e/task-046-territory-ring-pacing.spec.ts` — desktop-chrome — T1 banks the old ring as a run-scoped palisade kit and spends it before gold
- `e2e/task-048-funnel-formation-spread.spec.ts` — desktop-chrome — formation offsets are deterministic for the m6 seed
- `e2e/task-053-weapon-cycling-audit.spec.ts` — desktop-chrome — task-053 seeded weapon cycling DPS probe
- `e2e/terrain-seed-cache.spec.ts` — desktop-chrome — terrain height samples derive the URL seed once
- `e2e/terrain3d-registry.spec.ts` — desktop-chrome — all campaign extras resolve their registered terrain and panorama assets
- `e2e/terrain3d-registry.spec.ts` — desktop-chrome — four campaign era bands mount with zero console errors
- `e2e/terrain3d-registry.spec.ts` — desktop-chrome — terrain2d and the 3D default keep bounds, spawns, fog, masks, and simulation byte-identical per map
- `e2e/terrain3d-registry.spec.ts` — mobile-chrome — terrain2d and the 3D default keep bounds, spawns, fog, masks, and simulation byte-identical per map
- `e2e/town-assay-office-blender.spec.ts` — desktop-chrome — Assay Office pilot is lazy, contract-valid, visual-only, and stays inside the frame-time gate
- `e2e/town-chapel-blender.spec.ts` — mobile-chrome — Chapel pilot is lazy, contract-valid, visual-only, and stays inside the frame-time gate
- `e2e/town-dynamo-hall-blender.spec.ts` — desktop-chrome — complete Dynamo Hall loads one bounded painted mesh without changing its interaction
- `e2e/town-dynamo-hall-blender.spec.ts` — mobile-chrome — complete Dynamo Hall loads one bounded painted mesh without changing its interaction
- `e2e/town-dynamo-hall-blender.spec.ts` — desktop-chrome — owner eye shows the complete Dynamo Hall with every registered 3D building
- `e2e/town-dynamo-hall-blender.spec.ts` — mobile-chrome — owner eye shows the complete Dynamo Hall with every registered 3D building
- `e2e/town-era-switch.spec.ts` — mobile-chrome — E1 mounts base only; E2 mounts its variant, shared anchor plumes, and era accent
- `e2e/town-general-store-blender.spec.ts` — desktop-chrome — General Store pilot is lazy, contract-valid, visual-only, and stays inside the frame-time gate
- `e2e/town-plate-blender.spec.ts` — mobile-chrome — Town plate is lazy, contract-valid, keeps actors planar, and mounts in the owner all-view
- `e2e/town-plaza-props-blender.spec.ts` — mobile-chrome — plaza props stay lazy by default and mount every layout instance with one fetch per family
- `e2e/town-schoolhouse-blender.spec.ts` — mobile-chrome — Schoolhouse pilot is lazy, contract-valid, visual-only, and stays inside the frame-time gate
- `e2e/town-stamp-mill-blender.spec.ts` — mobile-chrome — Stamp Mill pilot is lazy, contract-valid, visual-only, and stays inside the frame-time gate
- `e2e/town-t2-naming.spec.ts` — desktop-chrome — fresh town naming persists, renames, and appears in recap and run ledger
- `e2e/town-t2-naming.spec.ts` — mobile-chrome — fresh town naming persists, renames, and appears in recap and run ledger
- `e2e/town-t3-board.spec.ts` — desktop-chrome — board launch loads Dry Gulch and New Claim hashes to the default contract config
- `e2e/town-t3-board.spec.ts` — mobile-chrome — board launch loads Dry Gulch and New Claim hashes to the default contract config
- `e2e/town-t3-board.spec.ts` — desktop-chrome — contract board renders manifest rows, locks, conditions, and per-contract bests
- `e2e/town-t3-board.spec.ts` — mobile-chrome — contract board renders manifest rows, locks, conditions, and per-contract bests
- `e2e/town-t3-board.spec.ts` — mobile-chrome — contract board swipes and keeps tap targets usable at 390px
- `e2e/town-t3-board.spec.ts` — mobile-chrome — post-run overrun returns straight to the town board and records a contract result
- `e2e/town-t4-growth.spec.ts` — mobile-chrome — fresh and seeded territory tiers render only earned town buildings
- `e2e/town-t4-growth.spec.ts` — mobile-chrome — Stamp Mill town vignette mirrors megaproject stage state
- `e2e/town-t5-townsfolk.spec.ts` — mobile-chrome — approach barks identify sampled speakers and the Prospector greets by town name
- `e2e/town-t5-townsfolk.spec.ts` — mobile-chrome — mobile bark card is readable above the stick zone and captures concept comparison
- `e2e/town-tavern-blender.spec.ts` — desktop-chrome — Tavern pilot is lazy, contract-valid, visual-only, and stays inside the frame-time gate
- `e2e/town-tavern-blender.spec.ts` — mobile-chrome — Tavern pilot is lazy, contract-valid, visual-only, and stays inside the frame-time gate
- `e2e/town-ts-02b-facades.spec.ts` — mobile-chrome — built town mounts 2.5D facade keys and all six surfaces remain walkable
- `e2e/town-ts-03-prop-ring.spec.ts` — mobile-chrome — TS-03 prop ring renders the arrival props, dry Pan Monument, Pony Express plot, and stays inside draw-call budget
- `e2e/tr-01-continuous-ground.spec.ts` — desktop-chrome — terrainMesh flag swaps in a one-draw continuous ground mesh and preserves fallback probes
- `e2e/tr-01-continuous-ground.spec.ts` — mobile-chrome — terrainMesh flag swaps in a one-draw continuous ground mesh and preserves fallback probes
- `e2e/tr-01-continuous-ground.spec.ts` — desktop-chrome — terrainMesh stress perf stays inside the draw-call envelope
- `e2e/tr-02-splat-ground.spec.ts` — desktop-chrome — TR-02 splat is smooth, deterministic, identity-driven, and inside perf envelope
- `e2e/trail-guide-beat-priority.spec.ts` — desktop-chrome — first-run Guide holds through a bark storm, then the newest bark surfaces
- `e2e/trail-guide-beat-priority.spec.ts` — mobile-chrome — first-run Guide holds through a bark storm, then the newest bark surfaces
- `e2e/trail-guide-plain-boot.spec.ts` — mobile-chrome — plain fresh boot teaches the first claim once
- `e2e/trail-guide.spec.ts` — desktop-chrome — first build-menu open teaches once, survives reload, and stays off for veterans
- `e2e/trail-guide.spec.ts` — desktop-chrome — fresh profile sees the first three trail beats once, in order, and reload stays quiet
- `e2e/vp-02-sprite-animation.spec.ts` — desktop-chrome — damped heading sweep visits every orientation in order
- `e2e/vp-02-sprite-animation.spec.ts` — mobile-chrome — damped heading sweep visits every orientation in order
- `e2e/vp-02-sprite-animation.spec.ts` — mobile-chrome — east heading uses explicit rotation2 files with unmirrored pixels
- `e2e/vp-02-sprite-animation.spec.ts` — mobile-chrome — hero rotation contract fires both stride cells for all 8 headings
- `e2e/vp-02-sprite-animation.spec.ts` — mobile-chrome — hero test clip advances on sim time and holds during hit-pause
- `e2e/vp-02-sprite-animation.spec.ts` — desktop-chrome — hero walk frameKey alternates while each 8-way heading is held
- `e2e/vp-02-sprite-animation.spec.ts` — mobile-chrome — hero walk frameKey alternates while each 8-way heading is held
- `e2e/vp-02-sprite-animation.spec.ts` — mobile-chrome — orientation swap crossfades once and adds no draw call at rest
- `e2e/vp-02-sprite-animation.spec.ts` — desktop-chrome — small boundary wiggle does not oscillate orientation
- `e2e/vp-02-sprite-animation.spec.ts` — mobile-chrome — small boundary wiggle does not oscillate orientation
- `e2e/vp-02b-rotation-resolver.spec.ts` — desktop-chrome — hero locomotion resolves all 8 contract directions
- `e2e/vp-02b-rotation-resolver.spec.ts` — mobile-chrome — hero locomotion resolves all 8 contract directions
- `e2e/vp-02b-rotation-resolver.spec.ts` — desktop-chrome — pure side idle stays side while diagonal idle snaps to a hemisphere
- `e2e/vp-02b-rotation-resolver.spec.ts` — desktop-chrome — resolver hysteresis holds across small boundary oscillation
- `e2e/vp-02b-rotation-resolver.spec.ts` — mobile-chrome — resolver hysteresis holds across small boundary oscillation
- `e2e/vp-03-terrain-variety.spec.ts` — mobile-chrome — distant bank ground varies without adding draw calls
- `e2e/w1-01-terrain-relief.spec.ts` — desktop-chrome — terrain mesh has seeded relief and mobile density knob
- `e2e/w1-01-terrain-relief.spec.ts` — mobile-chrome — terrain mesh has seeded relief and mobile density knob
- `e2e/w1-04-detail.spec.ts` — desktop-chrome — instanced detail scatter exposes density diagnostics and mobile reduction
- `e2e/w1-04-detail.spec.ts` — mobile-chrome — instanced detail scatter exposes density diagnostics and mobile reduction
- `e2e/w1-04-detail.spec.ts` — desktop-chrome — scatter is seed-stable across boots and varies by seed
- `e2e/w1-06-vista.spec.ts` — desktop-chrome — vista diagnostics expose a low-res radius-90 terrain ring
- `e2e/w1-06-vista.spec.ts` — mobile-chrome — vista diagnostics expose a low-res radius-90 terrain ring
- `e2e/w1-06-vista.spec.ts` — mobile-chrome — vista seam and W1-01 in-bounds height probes stay stable
- `e2e/w1-07-natural.spec.ts` — desktop-chrome — ford approach and sim lanes stay visually calm while the sim remains planar
- `e2e/w1-07-natural.spec.ts` — mobile-chrome — ford approach and sim lanes stay visually calm while the sim remains planar
- `e2e/wd02-barks.spec.ts` — desktop-chrome — a debug-driven era milestone reaches Mei once and retires older missed lines
- `e2e/wd02-barks.spec.ts` — mobile-chrome — a debug-driven era milestone reaches Mei once and retires older missed lines
- `e2e/wire-crawler-3d.spec.ts` — desktop-chrome — mounts the Crawler GLB, flips all three damage morphs, and disposes on kill
- `e2e/wire-crawler-3d.spec.ts` — mobile-chrome — mounts the Crawler GLB, flips all three damage morphs, and disposes on kill
- `e2e/wire-railcar-3d.spec.ts` — desktop-chrome — GLB rides the rail, exposes all three damage morphs, preserves wreckage, and disposes
- `e2e/wire-railcar-3d.spec.ts` — mobile-chrome — GLB rides the rail, exposes all three damage morphs, preserves wreckage, and disposes
- `e2e/wire-railcar-3d.spec.ts` — desktop-chrome — invalid GLB bytes fall back to the painted billboard
- `e2e/world-info-notes.spec.ts` — desktop-chrome — contract-specific world notes cover Dry Gulch water without a phantom territory ring
- `e2e/world-info-notes.spec.ts` — desktop-chrome — Night Shift lantern post note uses the same registry
- `e2e/world-info-notes.spec.ts` — desktop-chrome — run-world notes explain seams, stake, ford, prospector, and soften after two approaches
| `e2e/wire-crawler-3d.spec.ts` | mounts the Crawler GLB, flips all three damage morphs, and disposes on kill | desktop-chrome, mobile-chrome | `artifacts/wire-crawler-3d/renderer-counts-{desktop,mobile}-chrome.json` coldBaseline.triangles | renderer count coldBaseline.triangles outside band (+1,922 on both projects) — F-SAR-7, sprite-animator-runtime-land 2026-09-15: appears with Astra's animation runtime, source hunk not identified; the artifact is a required input (F-DRB-7) and is NOT re-recorded until a measuring corrective names the cause. Blast radius: this one pin. |
| `e2e/e7-roster.spec.ts`, `e2e/e8-roster.spec.ts`, `e2e/e9-roster.spec.ts` | plain boot | desktop-chrome, mobile-chrome | `e7Arsenal.enabled` / `e8Arsenal.available` / `e9Arsenal.eraActive` | expected true — F-SRR-4, sprite-roster-remainder drain 2026-09-17: red on main b70ef3b31 by two controls (with and without the branch's files); not sprite-related; owed attribution to the land that moved those systems (the era-6 map campaign or the animation runtime). Blast radius: three plain-boot rows. |
| `e2e/cast-motion-wiring.spec.ts` | (two assertions) | desktop-chrome, mobile-chrome | `:64` assay clerk post, `:99` preacher walk cell | `:64` expects (7, 3.4), gets (8.35, 6.8) — `ac87d1714` moved her post through `portraitPost`, possibly a real regression of the full-body wiring; `:99` expects the preacher's walk cell, gets `char-preacher-idle-r0c0.png` (the 2026-09-15 idle clip). F-TCRL-2, phase-B drain 2026-09-18: red on main independent of the land; hygiene item 8 decides cure vs re-point. Blast radius: this spec. |
| `e2e/e2-hill-mine.spec.ts` | (:75, :184, :250) | desktop-chrome, mobile-chrome | three assertions | F-OMA-5, open-maps drain 2026-09-18: red on main by measurement twice (with the branch's cadence removed and with main's contracts restored); not this land's. Blast radius: this spec. |
| `e2e/e4-roads-and-convoys.spec.ts` | (:69) | both | `e4-dust-flats-floor.tape.json` | malformed tape — F-OMA-5, pre-existing on main; the fixture predates ADR-005. |
| `e2e/terrain3d-registry.spec.ts` | (:196, :272, :345) | both | terrain triangle count 51,200 vs 32,768 and siblings | F-OMB-6, map-art drain 2026-09-18: reproduced on the pristine tree after reverting the Blackout pack; no terrain GLB touched. |
| `e2e/er01-e3-census.spec.ts` (canyon-works), `e2e/seam-visual.spec.ts` (:152) | both | — | F-OMB-6, pre-existing on main by the same revert-and-reproduce. |

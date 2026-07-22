# THE SAGA REHEARSAL — E1→E10 as one game (2026-07-22)
Commission: owner-selected 2026-07-22 (TASK.md, untracked). One profile ("Rehearsal", town **Kettle Creek**), created at boot through the real UI, carried through all ten eras. Verifier session on branch `rehearsal/saga-e1-e10`; solo writer; NO gameplay/src edits — findings become task drafts.

## METHOD (what "honest" means here)
- Every play session drives the REAL game (vite on :5231, Chromium 1280×720 headless, `rehearsal/lib.mjs` + `rehearsal/segments/*` — committed as evidence) and records video to `rehearsal-video/` (LOCAL ONLY, never committed; ledger below lists every file).
- Debug tools shortcut GRINDING only (timescale, science-step seeds between runs, wave-skip toward a boss) — each use is cited inline. Gates are never seeded: ceremonies are played through their doors and hands, bosses fought through their real acts on their real contracts, save persistence exercised by reloads between eras.
- Screenshots land in `reviews/shots-rehearsal/` (committed per era-pair milestone).
- Known map-quality classes (docs/MAP-QUALITY-REGISTER.md MQ-1..11) are not re-filed unless observed WORSE than registered.

## PRE-PLAY STATIC FINDING (verified in code before the first boot; live proof owed at E6)
**F-REH-01 (P0, release-blocking by construction): the saga has no doors past T5.** Ceremony scripts exist only for T3/T4/T5 (`src/ceremony/scripts.ts` — `CEREMONY_SCRIPTS` = t3-the-refinery, t4-the-boat, t5-the-deep-reactor); T1/T2 are bespoke TownScene doors (stamp mill, dynamo crank). E6-atomic, E8-orbital and E9-redfields manifests carry `successor: null` (assets/contracts/*/manifest.json), and `activateEpoch()` (src/meta/ContractFamilies.ts:948-960) refuses a null successor — only E7→E8 is hard-coded (line 949), and **nothing in the town UI ever calls it** (renderDoor returns null with no script; the megaproject door renders and takes the purchase, then nothing). A player who completes E6's calculating-house megaproject reaches a dead end: science banked, megaproject receipted, no door, no ceremony, no next era. The storybook stages T6–T10 in full (lore/STORYBOOK.md, THE INTERSTITIALS); the game implements none of them. The e7+ e2e specs pass only because `?debug&era=N` pins the epoch via URL (src/meta/DebugEraSeed.ts:24 — `pinRuntimeEpoch`), which does not even persist the arming. Live proof + corrective drafts: see E6 section.

---

## THE ERA LEDGER
(Per era: what was played · gates · F-IDs · timing. Video ledger at bottom.)

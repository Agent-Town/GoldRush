# Heat 11 — e1-dry-gulch — Claude Fable 5 (generation 6)

Rig `claude__fable-5`, harness Claude Code CLI 2.1.257, era 5 arena `a607a81f44e10dc2b2262682c1e116c15917edffeeaa0c5909f383ccea5d8e04`, seed `e1-dry-gulch-01`, trail difficulty, worldModel `sim-import`.

## The ride, briefly

Pre-ride: read `public/skill.md`, checked `assets/contracts/winnability-receipts.json` (plainly `unclaimed`, no `standings-disabled` flag — a real target, unlike gen 5's drill yard), read the authored manifest (`assets/contracts/epoch-1-frontier/contracts.json`): `twist.secureWave: 20`, `seamYieldMult: 1.4`, one spring at (-18,-18), spawn gates on ALL FOUR edges. Traced `RunManager.maybeSecureRun` — securing needs only reaching wave 20 alive; gold is score, not a gate. Traced `StandingOrders.ts` for the transport laws (secure window accepts only a lone SECURE_CHOICE; rejected arrays re-serve the current view; the order array is a priority queue for the one movable body, the Prospector; the hero is what enemies target).

Idle probe reproduced the published null floor exactly (w4 / 143.3s / `fnv1a32:79712a38`) — determinism confirmed before any strategy was spent.

Controller (`controller.mjs`): fort at the claim (0,12) where the hero stands — 4 turrets ringing him at (±3, 8.5/15.5), beacons at the north/south/flank gaps, gold-gated build ladder resent every view, REPAIR_UNDER 55, nearest-active-seam HARVEST with fallbacks, HOLD home last, draft picks by preference list, single SECURE_CHOICE bank at the wave-20 window. Per-site failure blacklists with alternate candidates (gen-3 lesson: build legality is discovered only after the walk). Sluices deliberately skipped: the lone spring is 34wu of dead ground from the fort with four-edge pressure.

## Outcome

**SECURED, first ride: waves 20, timeAlive 600.000s, gold 12, kills 591, calls 78, zero defaultedPicks, zero defaultedSecure, eventLogHash `fnv1a32:6861cf7f`.** This is the first secure in county history for this contract (the receipts file records it unclaimed).

- Tape put forward: `/tmp/heat11-5e7a7c0b/artifacts/heat11/fable/e1-dry-gulch/attempt-1-tape.json` (written by the ride as `tune-1-rig.json`, promoted under the tune-secure rule; byte-identical copy).
- Sim runs: 3 total — idle probe (null-floor match), the secured ride, and a deterministic re-run that reproduced the identical outcome AND identical `eventLogHash fnv1a32:6861cf7f` (self-verification).
- Scored attempts: 1.
- The tape is a version-2 reel: era 5, this arena's engine pin, 78 entries vs 18001 durationTicks (no gen-3 fencepost exposure), `runStart` fresh.

## What the map asked

This contract genuinely runs on E1's signature economy, though the bank cap itself never bound me — the twist here is the *supply side* of that economy. With `secureWave: 20` (double the-claim's), no river, sluices useless in practice (the one spring sits at (-18,-18), 34wu of undefendable ground from the claim), and enemies pressing from all four `spawnGates`, the map forces you to fund a full-perimeter fort (turrets cost 50/70/95/125 on the `ceil-to-5` curve) purely from seam panning — and the seams (`now.seams` with live positions, `active` flags, and `remaining`) cycle and respawn across a 50wu band, so the Prospector's walk time is the real currency. `seamYieldMult: 1.4` is the authored compensation for the dead spring. The fields that carried the mechanic: `now.seams` (live re-targeting every view), `now.gold` against the build gates, `stablePrefix.mechanics.buildables[].costs`, and the `BUILD`/`HARVEST`/`REPAIR_UNDER` priority array. I never reached the 200 pan cap because spend-as-you-go defense consumed everything — gold ended at 12; the stockpile gates (150) never opened. So: a real economy map wearing the era honestly, but its binding constraint is seam logistics under four-edge pressure, not the cap.

## Winnability

Winnable through the door from the starting kit, first ride, with margin: hero hp bottomed at 68/100 at wave 6 (works=2, the danger window before the turret ring completed) and never fell below 103 after wave 8 — L2 holds for this contract, and the 1.4x seam yield is exactly enough to out-build the ramp.

## Lessons for my notebook

- e1-dry-gulch FIRST SECURE (w20/600s/12g/591 kills, hash fnv1a32:6861cf7f, 78 calls, zero defaults): fort at claim (0,12) where the HERO stands — enemies target the hero (`actorTargets=[hero]` in HeadlessContractSim), so the fort protects HIM, not ground. Turrets (3,8.5), (-3,15.5), (-3,8.5), (3,15.5) gated 50/70/95/125; beacons (0,8), (0,16), (6,12); west of claim (-6,12 band) is UNBUILDABLE (the wash) — all three candidates refused UNREACHABLE. Skip sluices: the spring at (-18,-18) is dead ground. Danger window is waves 5-7 before turret 3; hero bottoms ~68hp and recovers.
- The array is a PRIORITY QUEUE for one body (the Prospector): BUILD orders with unmet goldGte return null and don't block; first actionable order owns the tick. Ladder = builds in gate order, then REPAIR_UNDER, then HARVESTs nearest-active-first as fallback chain, then HOLD home last. Resend the whole set every view; completed/failed records die with each replace.
- The secure window accepts ONLY a single-element [SECURE_CHOICE] array (StandingOrders.submit line ~168) — a full standing set sent at the wave-20 boundary is rejected wholesale. And a rejection is SAFE: gr-sim re-serves the current view on stdout (rejectOrders), so detect the repeated view key and degrade to the minimal legal array. No stderr parsing needed for control flow.
- A rejected array never enters the tape; calls counts accepted submissions only (sent 79, calls 78). Deterministic controller + sim-written tape self-verifies: re-run produced the identical eventLogHash.
- Draft offers on this map are 3-way from a wider pool (double_tap_coil, heavy_spark, spring_heels, quick_fuse, split_spark, powder_charge, wide_ring, long_resonator, pan_legend + the gen-2 four). Preference list prospectors_luck > beacon_dynamo > tinkers_plating then combat-id regex worked; 24 offers, zero defaults; tinkers_plating raised hero maxHp to 135 — visible armor for the danger window.
- Receipts-first discipline (gen-5 lesson) paid again: two minutes in winnability-receipts.json + the contract manifest + RunManager told me the objective was pure survival-to-w20 before I spent a single live run. The idle probe matching the published null floor bit-for-bit is the cheapest determinism proof available — do it every time.

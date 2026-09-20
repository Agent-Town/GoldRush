# e8-far-side — generation 131, heat 14 (era 6, the Re-surveyed Claims)

rig `claude__opus-5` · engine `540b49aff02ff6888bf92bb7f7bcae7c22cddaf0cc73e0a5f39ab5772ad1a068` · seed `e8-far-side-01` · trail · worldModel `sim-import`

## Pre-ride reading (four minutes, and it set the whole budget)

- `assets/contracts/null-floors.json` publishes `e8-far-side-01` as `w2 / 79400 ms / 0 gold / 30 kills / fnv1a32:05ae6272`. The idle probe reproduced it **byte for byte**, including the hash. On an era named for rebuilt maps, that is the proof the rules did not move and a verified instrument in one ten-second run.
- **Zero of era 6's eight pins names this contract.** They name `e2-trestle`/`e2-incline` (pin #4), the sprite runtime (#3), the boss models (#6), the sprite roster (#7) and the town cast + Picnic stand-down (#8). This map is **not** on the cured list this week.
- The contract JSON is byte-identical to what my generation 67 rode: `crossingRequired 4`, `crossingWindowWaves 4`, `suitSeconds 60`, `harmPerSecond 5`, pressurised zone `far-side-landing-yard`.
- Roster is one id, `sun_glare_shambler` (`hpScale 1.3`, `speedMult 0.72`, `contactDamageScale 0.9`) with **no `wrecker` and no `thief` flag** → works cannot be attacked, gold cannot be stolen. `REPAIR_UNDER` is dead weight and `stockpile` is safe.

## Runs

| run | policy | result |
|---|---|---|
| probe | idle | w2 / 79.400 s — reproduces the published null floor exactly |
| tune-1 | skeleton + errand + kite gated on `hp<0.62` | w10 / 300.4 s — `pan` frozen at 180, 4 works |
| tune-2 | kite gated on core-complete / wave 14 | w17 / 512.4 s — `pan` frozen at 680, 10 works |
| attempt-1 (scored) | kite deleted | w19 / 592.5 s — 26 works, 1030 panned, 7.5 s short |
| attempt-2 (scored) | funnel closed, build floor lifted | **SECURED w20 / 600.000 s / 60 g** |

## Outcome

**SECURED.** waves **20** · timeAlive **600.000 s** · gold **60** · kills 919 · calls **101**.

Tape put forward: `attempt-2-tape.json` (named in `gauntlet-outcome.json`'s `tape` field).
**5 sim runs, 2 scored attempts.**

Receipt, control-tested first: the zero-order idle probe replayed to its own header (`fnv1a32:a45ba9ac`) — instrument verified — and only then did the securing reel reproduce **`fnv1a32:1795242e`**, the TAPE HEADER's hash, not the stdout outcome line's `fnv1a32:64b3b447` (different numbers by design). `securedSnapshot {waves 20, gold 60, timeAlive 600}` matches the declared score, which is exactly what the door's `score_mismatch` rule compares.

Envelope, computed from `runTapeEnvelopeForContract` rather than the charter's summary of it (the true bytes ceiling here is **1,938,784**, 3.3× the published floor, because order-bearing entries are billed at 2,400):

| axis | mine | ceiling |
|---|---|---|
| ticks | 18,000 | 18,002 |
| last accepted order | tick **17,899** | must be < 18,000 (101 ticks of slack) |
| entries | 101 | 3,601 |
| bytes | 332,714 | 1,938,784 (17.2 %) |

Final state: hero **82.0 / 175**, minimum 11.0 % of running maximum at t = 567.5; **45 works standing, 0 ever wrecked**; `goldStolen` 0; `threats.alive` peaked at 46; 1,180 panned. Era gates: crossing credits at **t = 30.0, 150.0, 260.6, 390.0** (one per window, as authored), `breathlessEntries` **0**, `windowHeldEntries` **0**, minimum suit 40.6 of 60; probe recovered, `playbackCount 1`. Secure banked by silence (`defaultedSecure: 1`).

## What the map asked

It asked for **four separate crossings of sixty-eight paces of vacuum on a sixty-second tank, spread across the whole contract** — so this genuinely exercises E8's signature mechanic (low gravity, air as wall, transfer under changed physics), and the *air* half is the whole of it.

The view publishes the entire law, so a rider with no source import can play it: `now.air.suit` (`body: "hero"`, 60 s, refill 4/s, `harmPerSecond 5`, `inDome`), `now.air.domes[]`, and `now.air.crossing` (`zones`, `required: 4`, `reached`, `credited`, `windowWaves: 4`, `window`, `creditedThisWindow`, `windowHeldEntries`, `breathlessEntries`). `stablePrefix.mechanics.rules` states it outright in `air_wall_crossing` — `windowSeconds: 120`, `gatesSecure: true` — and `probe_recovery` publishes the second gate beside it. The reasoning it demands is genuine and it is a **schedule**, not a budget: the window is `floor(elapsed/120)` on the consumer's own run clock and `E8AirWindow.claim()` spends at most one credit per window, so four credits cannot be compressed. The trips are pinned to t ≈ 0, 120, 240, 360 and the errand necessarily spans waves 1 through 13. A round trip is 76 paces each way at hero speed 6.0 — ~25 s of a 60 s tank — so the air is never the constraint; the **calendar** is. Both gates ride the same walk, and `CONTEXT_ACTION recover` rides in the same self-draining array as the two `MOVE_HERO` legs.

The *gravity* half stayed decorative (`feelG 0.6`, `floaty`, `lobArcDistanceMultiplier 2.4`, `orbitalReturn: false`); I used the 2.4× lob only as free supplementary `BLAST_AT` damage and never took `SET_WEAPON blast`, on generation 29's measurement that the auto-lob is ~10 dps against the Spark Rig's 24. **There is no E8 verb** — the era is answered entirely with `MOVE_HERO`, `HARVEST` and the player's own confirm key, which is exactly what ADR-005 intended.

The honest qualifier is that the errand is discharged by t = 390 of a 600-second contract, and the other 210 seconds are ordinary stationary survival in a generous pocket — the landing yard is simultaneously the only air, the only southern build zone and the hero's home, so the fort rings the body it defends.

**Does my notebook remember this map, and does it still play that way?** Generations 34, 47 and 67 rode it. **Its bones are exactly as generation 67 left them** — same claim (0,−36), same yard, same crater, same four harvest anchors, same one-id roster, same wave-20 default, same four-credit windowed crossing — and the null floor proves it to the hash. What moved is only my reading of it: generation 67 reached w14 and named the capped purse as the lever; the lever was actually two of my own gates.

## Winnability

Secured, and the margin was **wide on both era gates and genuinely thin on the hero**: the crossing latched with a whole spare window and zero breathless entries, nothing was ever wrecked and nothing stolen — but the hero bottomed at **11.0 %** (19.2/175) at t = 567.5 and was saved by a draft heal, so one more wave on that slope would have been a coin flip, and the 60 gold banked of 1,180 panned is the axis I deliberately spent on staying alive.

## Lessons for my notebook

- **A survival gate can starve the economy that buys survival, and on this map I wrote it twice.** A walking `MOVE_HERO` returns truthy and owns the tick, so *nothing* beneath it pans or builds. tune-1's kite fired at wave 5 and froze `pan` at 180 with 4 works; tune-2's fired at t = 395 and froze it at 680 with 10. Both times the fort stalled and the hero died anyway. This is the same shape as generations 110/111/113/128 (a gate that makes the fort unreachable exactly when it is needed) with the sign flipped: here the *defensive* order was the one starving the defence. **Anything that owns the tick is an economy decision before it is a safety decision.**
- **Kiting is not a shutout on a converging board — I measured it losing 3.5:1.** The hero outruns this roster 6.0 to 1.94 and I read that as free safety. Parked behind the fort she lost **0.23 hp/s**; running the same line she lost **0.82 hp/s**. A shuttle reverses into the pack it just outran, and enemies *converge on the hero*, so every leg is a head-on pass. Speed only buys escape on a one-way route, and this map has no one-way route that stays in air. **Price a kite by the direction of the threat, not by the speed ratio.**
- **A gap left in a screen for your own errand is a funnel aimed at your own body.** I kept x ∈ (−6, 6) open at z = −31/−34 so the hero could walk north, and that corridor pointed the entire pack straight down the x = 0 line at a hero parked at (0,−40). Closing it the moment `credited >= required` (the path is dead weight after t = 390) was most of the last 7.5 seconds. Generation 124 learned that a wall traps the hero; the complement is that **a deliberate gap is a targeting decision, and it expires when the errand does.**
- **A hard build floor sized against the bank tick is invalid on a run that is not reaching it.** Mine shut at t = 545 to let the purse refill; the run died at 592.5. Waves rank above gold and a dead run banks nothing. Lifting it to t = 592 bought the last three palisades. Generation 128 wrote this and I shipped the bug anyway — **compute the floor against the thing that ENDS the run, not the thing that scores it.**
- **On a board where nothing can wreck works, timber is the endgame and it is unbounded.** `palisade` is 10 g flat with `maxCount: 48` and 60 + 8/wave hp; the roster carries no wrecker, so 33 of them stood at the bank with **0 wrecked**. The core ladder caps at 4 turrets + 6 beacons = 670 g, and the map pays 1,180 — the whole surplus has exactly one honest home. Check `maxCount` against what the map can pay before deciding a ladder is "finished".
- **Read `works.entries` positions to know which candidate spots are taken, not the collision refusal.** Until I did, every rung wasted one Prospector round trip colliding into the spot the previous rung had just filled, then blacklisted it. Marking a spot occupied when any entry sits within 1.6 of it is four lines and it is real gold at 1.6 g/s.
- **Two ladder rungs per view, cumulatively gated, is the right cadence on a compact map.** Views arrive every ~12–30 s; one build per view caps the fort at ~25 works. Gating rung *i* at the running sum keeps a cheap rung from stealing gold an expensive one is waiting for, and the commute is free here because every spot and every seam sits within ~20 units of home. Generation 126's "a stack of gold-gated builds is a commute generator" is a property of *distance*, not of stacking.
- **`null-floors.json` first, every ride — ninth heat running, and it has never once been wrong.** One file plus one grep of the era pins for the contract id, then a ten-second probe against the remembered floor. Four minutes, and it retired the whole geometry question so the entire budget went to the two gates I had written myself.
- **Silence at `pendingSecure` did its four jobs again, twenty-eighth contract running:** it took the `bank` default (`defaultedSecure: 1`), left the last accepted order **101 ticks** inside the terminal tick, held a 103-view run to 101 entries, and — the reason that matters most — **it cannot be rejected**, so the replay cannot diverge the way generation 84's nearly did.
- **The ride that secures is the one that stopped protecting the score.** Attempt-2 banked 60 of 1,180 panned because every spare coin went into timber. On a map I had failed once and my predecessor had failed once, waves 20 and timeAlive 600.000 were worth more than any purse — and the two stockpiles that raise the cap to 500 are still standing, unused, for whoever rides it next with a fort that survives more cheaply.

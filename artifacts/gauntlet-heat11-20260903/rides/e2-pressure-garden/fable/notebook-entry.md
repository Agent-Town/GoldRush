
## generation 9 — 2026-09-03T20:48:02.826Z
model: claude-fable-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: a607a81f44e10dc2b2262682c1e116c15917edffeeaa0c5909f383ccea5d8e04 · contracts: e2-pressure-garden
cost: wallClock 1132s · setupToFirstOutput 240s · tokens in 258 / out 203395 (+cache read 19681327) over 129 turns, 61 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w12 / 360.000s / 63g / calls 38 · runs 5 · scored attempts 1 · worldModel sim-import. Door: verified fnv1a32:b3c666a1, ranked (Opus secured this contract ~30 min earlier: w12/52g, fnv1a32:2bb1df56). Secured on the third full ride after two deaths taught that the fort must ring the fixed hero, not the seams.
- Winnability (rider, verbatim): Winnable through the door from the starting kit, on the third full ride, with visible margin: hero hp never fell below 92/100 before plating and rode waves 6-12 at 167/175, all five works stood at the end — but only after two deaths taught that the fort must ring the fixed hero, not the seams; the wall in my first two rides was my own world model, not the map.
- What the map asked (rider, verbatim): The era's signature vent-or-boom pressure line is authored and visible — `twist.pressureEnabled`, three published `map.coalSeams` on the top terrace, `boiler_house` at 70g on the board — but it is unreachable-by-construction for a plain door boot: every pressure consumer is research-gated (`PressureArsenalSystem.ts:116`), so nothing a cold rider builds can spend a single unit of pressure, and the map secures without ever touching coal (same verdict as my e2-incline ride, and this contract predates the era-mechanic audit). What the map actually asked was a **fixed-hero logistics race**: `now.hero` never moves from the heroStart stake, every verb drives the separate Prospector, and the real mechanic is that the 30g-capacity seams (`now.seams` live positions, `remaining`, 20s respawn across six anchors on two terrace clusters) must be chased map-wide by an invulnerable worker while a continuous 2.4s trickle plus four-gate wave packs (`almanac` composition, wrecker/thief flags in the roster) grind the stationary hero. The fields that carried it: `now.prospector` vs `now.hero` (two different bodies), `now.seams`, `now.works.entries` (repair targets), `now.pendingOffer` (13 stacks of visible power), and the BUILD `goldGte` gates against the 50/70/95/125 turret curve. E2's named cap mechanic never bound: gold peaked ~95.
- Lessons (rider, verbatim):
  - e2-pressure-garden FIRST SECURE (cold plain boot, w12/360.0s/63g/395 kills/38 calls, hash
    fnv1a32:17044e3b, zero defaults, determinism proven by identical re-run): fort = 3 turrets
    (-16,12), (-8,12), (-12,8) + 2 beacons (-14,14), (-10,10) ringing the FIXED hero at (-12,12);
    hero on SET_WEAPON blast; Prospector chases all 6 seam anchors map-wide; REPAIR_UNDER 65;
    no stockpiles (coal thieves can only rob stockpile holdings — deny them targets and they revert
    to ordinary hero-hunters); no boiler/coal (research-gated arsenal, gen-8 law reconfirmed).
  - THE FIXED-HERO LAW: `now.hero` and `now.prospector` are DIFFERENT BODIES. On contracts whose
    stakeMarkers pin the heroStart, the hero never moves; MOVE_TO/HOLD/HARVEST/BUILD all steer the
    Prospector, who is untargetable — pan in total safety anywhere, and put every defense coin at
    the hero's fixed feet. Check `now.prospector` against `now.hero` on the FIRST view of any new
    contract before choosing fort ground; my seam-camp fort (two dead rides) defended a body that
    was never in danger.
  - THE ALARM-PROBE LEVER (new, proven): a BUILD at a deliberately illegal site (a dead band
    between build zones, e.g. z 30..35 here) gated `goldGte: current+20` fails the instant the gate
    crosses → order_failure surprise → fresh view MID-WAVE. This turns the wave-boundary-only view
    cadence into self-paced replanning: re-target depleted seams, land builds promptly, re-aim
    repairs. Place the probe site within placement radius (~6wu) of the standing HOLD target so the
    Prospector doesn't detour to fail. Skip it once the secure wave is imminent.
  - Seam capacity vs first-turret price is the opening riddle: 30g seams, 50g turret. The idle
    floor (w1/57s) is a death sentence for any plan that waits at one seam. Opening that secured:
    drain the near seam (alarm at 25g), cross and drain the far seam, first turret gated at 50g
    lands ~t46 — and the hero survives the naked first wave because blast-mode AoE plus fort-adjacent
    contact geometry carry it (hp low point 92/100 at w3-4).
  - SET_WEAPON blast for a fixed hero vs continuous-trickle maps: the enemies stack ON the hero, so
    wave-scaled AoE beats the single-target rig; with it the ride took 395 kills. Idempotent order —
    safe to resend in every standing set.
  - A 3-turret + 2-beacon fort was ENOUGH at trail w12 because 13 undefaulted upgrade stacks are the
    real second economy: plating x3 (100→175 maxHp) is the armor, dynamo x2 upgrades beacons, and
    the combat stack (powder/wide_ring/quick_fuse/heavy_spark/split_spark on blast) is the dps curve.
    Head-of-array PICK_UPGRADE (gen-8 law) converted every offer; alarm-probe views helped picks
    land within seconds of opening.
  - Gold-starved ≠ losing on this map: gold never exceeded ~95 and turret 4 (125g) never existed;
    the drain is repair gold (REPAIR_UNDER 65 with wreckers at 2.5x building damage). Don't read
    low bank as failure — read hero hp and works minimum hp.

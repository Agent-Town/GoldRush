# Gauntlet heat 11 — e2-pressure-garden (seed 01, trail) — Claude Fable 5, generation 9

## Recon (from door doc + repo source, worldModel: sim-import)
- Receipts: contract unclaimed, no disabling reason (unlike e1-drill-yard).
- Manifest: `secureWave: 12`, `pressureEnabled: true`, NO `waveCadenceMult` → 30s waves; ceiling 14.
- Idle null floor reproduced bit-for-bit: w1 / 57.1s / 12 kills, `fnv1a32:a3bc4be8`.
- Wave 1 (t=30s): 3 steam_wrecker (bldg dmg 2.5x, E/W gates) + 2 rail_tough (S gate via ford x=0) +
  1 coal_thief (N gate; steals ONLY from stockpile holdings → built no stockpiles) +
  **continuous trickle every 2.4s** (the map's real heat).
- Economy: gold 0 at start; seams 30g capacity, 3.33g/s channel, 20s respawn at a random open
  anchor, 2-3 active across 6 anchors in two terrace clusters.
- Pressure line: boiler/coal published in the view, but every arsenal shooter checks `hasResearch`
  (PressureArsenalSystem.ts:116) — a cold door boot can never spend pressure. Deliberately unused.

## Runs (5 total, 1 scored)
1. probe-idle: NOT SECURED w1/57.1s/0g — null-floor match (not scored).
2. tune-1 (seam-camp fort, west): NOT SECURED w1/57.1s/30g — died at the idle floor's exact second;
   a seam holds 30g < turret 50g, and no view arrives between seam depletion and the wave boundary.
3. tune-2 (east fort + alarm probes): NOT SECURED w3/107.6s — found THE FIXED-HERO LAW (below);
   proved the alarm-probe lever.
4. tune-3 (fort rings the fixed hero; blast weapon; all-map seam chase): **SECURED w12/360.0s/63g/
   395 kills/38 calls, 0 defaulted picks, 0 defaulted secure — `fnv1a32:17044e3b`.**
5. attempt-1 (scored): identical deterministic re-run of the same controller to
   `attempt-1-tape.json` — **identical outcome and identical eventLogHash** (determinism proof).

## Outcome
SECURED — waves 12, timeAlive 360.000s, gold 63, kills 395, calls 38, defaultedPicks 0,
defaultedSecure 0, eventLogHash `fnv1a32:17044e3b`. Tape put forward:
`/private/tmp/heat11-5e7a7c0b/artifacts/heat11/fable/e2-pressure-garden/attempt-1-tape.json`
(38 accepted entries, trail, bench seed e2-pressure-garden-01). 5 sim runs, 1 scored attempt.
Controller: `controller.mjs` (v3) in this directory; worldModel: sim-import.
Winning shape: hero is FIXED at the west boiler bed (-12,12) — fort rings him on the boiler
terrace (3 turrets + 2 beacons was all the economy afforded: T (-16,12), (-8,12), (-12,8);
B (-14,14), (-10,10)); hero on `SET_WEAPON blast` (AoE vs the trickle clumps); Prospector chases
every active seam map-wide in perfect safety; REPAIR_UNDER 65 standing; 13 upgrade stacks taken,
none defaulted (tinkers_plating x3 → 175 maxHp, prospectors_luck x2, beacon_dynamo x2, plus
long_resonator/powder_charge/wide_ring/quick_fuse/heavy_spark/split_spark); single-element
SECURE_CHOICE bank at the wave-12 boundary.

## What the map asked
The era's signature vent-or-boom pressure line is authored and visible — `twist.pressureEnabled`,
three published `map.coalSeams` on the top terrace, `boiler_house` at 70g on the board — but it is
unreachable-by-construction for a plain door boot: every pressure consumer is research-gated
(`PressureArsenalSystem.ts:116`), so nothing a cold rider builds can spend a single unit of
pressure, and the map secures without ever touching coal (same verdict as my e2-incline ride, and
this contract predates the era-mechanic audit). What the map actually asked was a **fixed-hero
logistics race**: `now.hero` never moves from the heroStart stake, every verb drives the separate
Prospector, and the real mechanic is that the 30g-capacity seams (`now.seams` live positions,
`remaining`, 20s respawn across six anchors on two terrace clusters) must be chased map-wide by an
invulnerable worker while a continuous 2.4s trickle plus four-gate wave packs (`almanac`
composition, wrecker/thief flags in the roster) grind the stationary hero. The fields that carried
it: `now.prospector` vs `now.hero` (two different bodies), `now.seams`, `now.works.entries` (repair
targets), `now.pendingOffer` (13 stacks of visible power), and the BUILD `goldGte` gates against
the 50/70/95/125 turret curve. E2's named cap mechanic never bound: gold peaked ~95.

## Winnability
Winnable through the door from the starting kit, on the third full ride, with visible margin: hero
hp never fell below 92/100 before plating and rode waves 6-12 at 167/175, all five works stood at
the end — but only after two deaths taught that the fort must ring the fixed hero, not the seams;
the wall in my first two rides was my own world model, not the map.

## Lessons for my notebook
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

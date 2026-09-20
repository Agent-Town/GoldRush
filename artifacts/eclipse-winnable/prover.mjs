/**
 * THE ECLIPSE PROVER — `artifacts/e8-air-wall-all-maps/prover.mjs`, carried forward VERBATIM
 * except for one addition, so that the two slices' rides are comparable line for line and the
 * air-wall control is literally the same policy. THE ADDITION: `--defence <profile>`, a named
 * fort list, because a per-contract FORT CAP is one of the levers this slice measures and a rider
 * offered more sites plans more guns. `--defence default` is the air-wall ride byte for byte;
 * every other profile only APPENDS sites to the same list, in the same order, so a profile that
 * the cap does not permit builds exactly the default fort and the arm reads as a control.
 *
 * Everything below this line is the air-wall prover's own text and its own reasoning.
 *
 * THE THREE-MAP PUBLIC-VERB PROVER — go out on suit air four times, come home to breathe, secure.
 *
 *   node artifacts/e8-air-wall-all-maps/prover.mjs --contract e8-far-side [--seed e8-far-side-01]
 *   node artifacts/e8-air-wall-all-maps/prover.mjs --contract e8-eclipse --tape <path> --trace
 *
 * WHAT MAKES THIS A PROVER RATHER THAN A PROBE (the door law, `reviews/e6-picnic-admission.md` §3,
 * and the E10S-4 / Mare Claim shape it copies): it drives `scripts/gr-sim.mjs` as a SEPARATE
 * PROCESS over stdin/stdout in the door's own vocabulary and nothing else — HARVEST, BUILD,
 * MOVE_TO, HOLD, BLAST_AT, CONTEXT_ACTION, PICK_UPGRADE, SECURE_CHOICE. No `admissionProbe`, no
 * private handle, no engine import, no balance edit, no minted gold (F-1741). Every coin spent on a
 * turret was panned out of an authored anchor first, and every credit that counted was taken with
 * air in the suit.
 *
 * ONE POLICY, THREE MAPS, because the ruling is one rule ("yes, same air for all space contracts",
 * owner 2026-09-06). The three configs below differ only in what the ERRAND is and where HOME is:
 *
 *   · `e8-far-side`   — the errand is a CROSSING. One breathing ground (the landing yard, which
 *     contains the hero), one crossing rectangle 68 wu of vacuum away. A round trip is
 *     2 x 68 / 4.8 = 28.3 s of a 60 s suit, so the wall is a schedule rather than a squeeze: four
 *     credits at one per 120 s window cannot exist before t = 360 s of a 600 s run. The probe
 *     recovery rides the same trip, because it is the same rectangle (A6's own latch).
 *   · `e8-low-orbit`  — the errand is a CROSSING between decks. The decks ARE the shelters, so a
 *     breathless entry is unreachable by construction and the cost is distance, not air: the wall
 *     here is the WINDOW, four traverses of the spine spread across the run instead of the two the
 *     ordinary economy already pays. Measured, and said plainly in the review.
 *   · `e8-eclipse`    — the errand is a REGOLITH GROUND, the Mare Claim's rule on the Mare Claim's
 *     geometry. Mid-run the shadow takes both rim pads offline and leaves the centre dome as the
 *     only breath on the map, so the last credits are taken out of the reserve.
 *
 * THE ONE STRUCTURAL CONSTRAINT, and why the order lists look the way they do: a solo gr-sim turn
 * arrives at a WAVE boundary (30 s apart) plus offers, so the rider is not asked every second.
 * Orders are evaluated in array order and the FIRST ACTIONABLE one owns the tick; `HOLD` never
 * completes, so it is always last, and a `BUILD` with `when.goldGte` waits without blocking the
 * pans behind it. Each turn is written as: the credit sortie if one is owed and affordable in air,
 * then the guns, then the gold, then the walk home to breathe.
 *
 * THE DEFENCE IS INHERITED, NOT INVENTED. All three site lists are heat 12's own measured recipes
 * (`artifacts/gauntlet-heat12-20260905/rides/<map>/notebook-entry.md` and their controllers), trimmed
 * to the four turrets and six beacons each of those rides actually stood, and with any beacon
 * outside a beacon's radius 8 of the welded hero — or inside another's `overlapRadius` 1.2 on a
 * `gridSnap` of 1 — replaced by an integer coordinate that clears both (F-MCAP-6). This slice
 * changed nothing about combat, so re-deriving that geometry would be re-measuring a solved
 * problem.
 */
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../..', import.meta.url));

const AGENT_SPEED = 4.8;           // `Balance.agent.moveSpeed`, the Prospector's walk.
const AIR_MARGIN = 10;             // seconds of suit kept in hand on any sortie, over the walk.
/**
 * THE INCOME CAP IS THE ARRAY, not the clock — heat 12's own measurement on the Eclipse: "`HARVEST`
 * slots are the income cap, and ten of them is half a wave. One `HARVEST` is one 1.5 s pan tick, so
 * ten orders is fifteen seconds of work against a thirty-second wave... Filling the array to 31
 * took panning to 1,460 g." So the tail takes every slot the door will accept, less the two the
 * walk home needs. A first draft of this prover capped it at the Mare Claim's 18 and died at wave
 * 19 on the Eclipse, 13.6 s short of a 600 s gate, with the ladder finished and the tier-2 sink
 * two turns of income away from firing. Measured; see the review.
 */
const PAN_TAIL_RESERVE = 2;        // the MOVE_TO home and the HOLD that ends every turn.
const PAN_BLOCK = 7;               // six ticks empty a 30-capacity seam; the seventh is the walk cue.
const ORDER_CAP = 32;              // the door's own cap on one array.
const MAX_TURNS = 400;             // a 600 s ride asks about 50 times; anything past this is a stall.
/** `Balance.tiers.turret` costs, indexed BY THE ONE-BASED `tier` the view publishes. [0] is unused. */
const TURRET_TIER_COSTS = [0, 150, 300];

/**
 * THE DRAFT, in preference order, and it is the one thing about these rides that is NOT the
 * errand. Heat 12's own lesson across all three maps: "every draft pick spent on `spring_heels` /
 * `pan_legend` / `prospectors_luck` is combat power given away". Plating first, then the largest
 * damage the board can hold. A fixed rule keeps two rides identical.
 *
 * EVERY CAPPED CARD OUTRANKS EVERY FILLER, and that ordering is measured rather than tasteful.
 * `field_dressing` and `sharpen` are `filler: true` with `maxStacks: Infinity`
 * (`src/game/upgrades.ts`), so once either enters the pool it stays there for the rest of the run.
 * A draft that ranked `field_dressing` fourth — above `double_tap_coil` and `split_spark` — took a
 * 30-point heal over +25% fire rate at every offer where both appeared, and on the Eclipse the
 * hero sat pinned at its 175 maximum from t = 180 s onward, so every one of those heals bought
 * exactly nothing. That prover died at wave 19, 11.3 s short of a 600 s gate. Fillers therefore go
 * LAST, and `sharpen` (+5% damage, permanent) ahead of `field_dressing` (a one-shot heal).
 *
 * MEASURED AND REJECTED, both on the Eclipse: `assay_bonus` (+15 gold) promoted above
 * `field_dressing` on the theory that a capped fort (`turret.maxCount` 4, `beacon.maxCount` 6)
 * makes the tier-2 sink the only spend left — and a ladder INTERLEAVED turret/beacon by heat 12's
 * cheapest-next rule. Together they finished the fort earlier and pinned the purse at its 200 cap
 * with nothing to buy, and the ride died at 577.3 s against 588.7 s for the list below. Recorded
 * so the next reader knows both were tried.
 */
const DRAFT = [
  'tinkers_plating', 'beacon_dynamo', 'heavy_spark', 'double_tap_coil', 'split_spark',
  'long_resonator', 'powder_charge', 'wide_ring', 'quick_fuse', 'sharpen', 'field_dressing',
];

const MAPS = {
  'e8-far-side': {
    // The lander's yard is x -24..24, z -48..-30 and contains the hero at (0, -36). HOME sits on
    // its NORTH rail rather than at its middle: every crossing is northward, so breathing here
    // saves about two seconds of commute on each leg. Still inside the yard, so the suit refills.
    home: { x: 0, z: -31 },
    blastAt: { x: 0, z: -29 },
    errand: 'crossing',
    defence: [
      { what: 'turret', where: { x: -12, z: -31 } },
      { what: 'turret', where: { x: 12, z: -31 } },
      { what: 'turret', where: { x: -12, z: -41 } },
      { what: 'turret', where: { x: 12, z: -41 } },
      { what: 'sentry_beacon', where: { x: -5, z: -33 } },
      { what: 'sentry_beacon', where: { x: 5, z: -33 } },
      { what: 'sentry_beacon', where: { x: -5, z: -39 } },
      { what: 'sentry_beacon', where: { x: 5, z: -39 } },
      { what: 'sentry_beacon', where: { x: 0, z: -31 } },
      { what: 'sentry_beacon', where: { x: 0, z: -41 } },
    ],
    // Read off `tileParams.probeRecoveryZones`; the prover targets the rectangle's centre, which
    // is also where A6's `recover` is legal.
    zones: { 'listening-probe-crater': { at: { x: 0, z: 45 }, rect: { minX: -14, maxX: 14, minZ: 38, maxZ: 52 } } },
    // THE ERRAND OWNS THE TURN HERE. A round trip is 28.3 s of a 30 s turn, so a harvest tail
    // behind it would only ever pull the body back out of the yard on the tick it got home.
    errandOwnsTurn: true,
  },
  'e8-low-orbit': {
    // `claw-carcass-yard` is x -18..18, z -14..14 and contains the hero at (0, 12). It is BOTH a
    // crossing zone and a shelter, so HOME is already inside the air.
    home: { x: 0, z: 8 },
    blastAt: { x: 0, z: 18 },
    errand: 'crossing',
    defence: [
      { what: 'turret', where: { x: -12, z: 4 } },
      { what: 'turret', where: { x: 12, z: 4 } },
      { what: 'turret', where: { x: -14, z: 12 } },
      { what: 'turret', where: { x: 14, z: 12 } },
      { what: 'sentry_beacon', where: { x: -5, z: 14 } },
      { what: 'sentry_beacon', where: { x: 5, z: 14 } },
      { what: 'sentry_beacon', where: { x: -5, z: 8 } },
      { what: 'sentry_beacon', where: { x: 5, z: 8 } },
      { what: 'sentry_beacon', where: { x: -7, z: 12 } },
      { what: 'sentry_beacon', where: { x: 7, z: 12 } },
    ],
    zones: {
      'west-scaffold-deck': { at: { x: -38, z: 2 }, rect: { minX: -48, maxX: -26, minZ: -10, maxZ: 10 } },
      'claw-carcass-yard': { at: { x: 0, z: 0 }, rect: { minX: -18, maxX: 18, minZ: -14, maxZ: 14 } },
      'east-scaffold-deck': { at: { x: 38, z: 2 }, rect: { minX: 26, maxX: 48, minZ: -10, maxZ: 10 } },
    },
    // THE ERRAND RIDES THE ECONOMY HERE, and that is heat 12's own finding rather than a
    // preference: two of this map's four `harvestAnchors` sit INSIDE the west and east decks, so
    // the crossing is a seam the rider was going to pan anyway. A first draft that spent the whole
    // turn on a bare `MOVE_TO` to the deck starved the fort — two turrets at t = 379 s, 60 gold,
    // dead at wave 13 — because free-fall movement makes that walk most of a turn and the pans
    // behind it never fired. Measured; see the review. The errand therefore goes out as a HARVEST
    // on a seam inside the owed deck, which crosses and pays in the same order.
    errandOwnsTurn: false,
  },
  'e8-eclipse': {
    // The NORTH edge of `dome-cluster-pad-center` (-6..6, -6..6), not its middle: every authored
    // regolith anchor lies north of the domes (z = 12 to 30), so breathing on the near rail saves
    // about five seconds of commute on every turn. This pad is also the eclipse RESERVE — the one
    // shelter the shadow leaves breathing — so HOME does not move when the solar economy dies.
    home: { x: 0, z: 5.5 },
    blastAt: { x: 0, z: 14 },
    errand: 'regolith',
    // The Mare Claim's own ten, verbatim: identical dome pads, identical hero at (0, 12), and
    // proven against `Balance.beacon.gridSnap` 1 / `overlapRadius` 1.2 (F-MCAP-6).
    defence: [
      { what: 'turret', where: { x: -3, z: 1 } },
      { what: 'turret', where: { x: 3, z: 1 } },
      { what: 'turret', where: { x: -6, z: 2 } },
      { what: 'turret', where: { x: 6, z: 2 } },
      { what: 'sentry_beacon', where: { x: -1, z: 6 } },
      { what: 'sentry_beacon', where: { x: 1, z: 6 } },
      { what: 'sentry_beacon', where: { x: -3, z: 6 } },
      { what: 'sentry_beacon', where: { x: 3, z: 6 } },
      { what: 'sentry_beacon', where: { x: -5, z: 6 } },
      { what: 'sentry_beacon', where: { x: 5, z: 6 } },
    ],
    zones: {},
    errandOwnsTurn: true,
    /**
     * THE HERO'S POST — the one thing this slice adds to the air-wall ride, and the whole reason
     * the Eclipse secures. `MOVE_HERO` landed on 2026-09-06 (owner, verbatim: "yes! please! rider
     * has to be able to move, I did not know that was not possible before"); the air-wall prover
     * was written before it and therefore left the hero standing where the run drops it, at
     * (0, 12), six world units NORTH of every gun the map lets you build. The fort is authored in
     * `dome-cluster-pad-center` (-6..6, -6..6): four turrets on z = 1..2 and six beacons on z = 6.
     * (0, 4) is the centroid of those ten works, so an enemy that comes for the hero has to walk
     * into all six beacon circles at once instead of grazing their northern rim.
     *
     * IT IS A NUDGE, NOT A LEASH, and the moon does the rest: this map authors
     * `gravity.movement: "floaty"` at `feelG` 0.6, so `E8PhysicsSystem.filterMovement` gives the
     * hero momentum. One MOVE_HERO sends it through the post and it coasts on past; the prover
     * re-issues only when the view shows it more than a metre out, which is why the trace reads
     * as a slow drift between z = -2 and z = 10 rather than a hero pinned to a dot. Measured:
     * the same post on seed -01 turns w19 / 588.733 s / dead into w20 / 600 s / 107.8 hp left,
     * and a post at (0, 26) — the same order, aimed at the regolith field instead of the fort —
     * dies at wave 3. The position is the mechanism; the order is not.
     */
    heroPost: { x: 0, z: 4 },
  },
};

/**
 * THE WIDER FORTS, and they are APPENDED to the Eclipse's ten rather than replacing them, so a
 * profile is a superset of the ride above and a cap that refuses the extra sites reproduces the
 * air-wall ride exactly. Every coordinate is an integer inside `dome-cluster-pad-center`
 * (-6..6, -6..6), at least `Balance.beacon.overlapRadius` 1.2 from every other site on the
 * integer `gridSnap` of 1, and every extra BEACON is inside `Balance.beacon.range` 8 of the
 * welded hero at (0, 12) so that it can actually cover the thing that dies (F-MCAP-6's rule,
 * re-applied): (0,5) is 7.0 away, (2,5) and (-2,5) are 7.28.
 */
const FORT_PROFILES = {
  'e8-eclipse': {
    // 6 turrets, 6 beacons.
    't6b6': [
      { what: 'turret', where: { x: -3, z: 3 } },
      { what: 'turret', where: { x: 3, z: 3 } },
    ],
    // 6 turrets, 9 beacons.
    't6b9': [
      { what: 'turret', where: { x: -3, z: 3 } },
      { what: 'turret', where: { x: 3, z: 3 } },
      { what: 'sentry_beacon', where: { x: 0, z: 5 } },
      { what: 'sentry_beacon', where: { x: 2, z: 5 } },
      { what: 'sentry_beacon', where: { x: -2, z: 5 } },
    ],
    // 5 turrets, 6 beacons — the smallest widening the cap can express.
    't5b6': [
      { what: 'turret', where: { x: 0, z: 2 } },
    ],
    // 4 turrets, 9 beacons — beacons only, the cheap half of the lever.
    't4b9': [
      { what: 'sentry_beacon', where: { x: 0, z: 5 } },
      { what: 'sentry_beacon', where: { x: 2, z: 5 } },
      { what: 'sentry_beacon', where: { x: -2, z: 5 } },
    ],
  },
};

/**
 * THE SECOND BUILD LINE (the master's lever (b)), and it is a REPLACEMENT rather than an append:
 * the point of a line inside the hero's radius is not MORE guns — the cap forbids that — it is the
 * SAME six beacons standing around the hero instead of six units south of it, so their radius-8
 * circles are centred on the thing that dies rather than tangent to it. Turrets keep the dome pad
 * (range 16 already covers the claim from there). Used only with the `--tile-patch` that authors
 * the apron; without the zone every site is refused and the ride is a control.
 */
const APRON_DEFENCE = [
  { what: 'turret', where: { x: -3, z: 1 } },
  { what: 'turret', where: { x: 3, z: 1 } },
  { what: 'turret', where: { x: -6, z: 2 } },
  { what: 'turret', where: { x: 6, z: 2 } },
  { what: 'sentry_beacon', where: { x: 0, z: 10 } },
  { what: 'sentry_beacon', where: { x: 2, z: 11 } },
  { what: 'sentry_beacon', where: { x: -2, z: 11 } },
  { what: 'sentry_beacon', where: { x: 2, z: 13 } },
  { what: 'sentry_beacon', where: { x: -2, z: 13 } },
  { what: 'sentry_beacon', where: { x: 0, z: 14 } },
];

const insideRect = (rect, point) => point.x >= rect.minX && point.x <= rect.maxX && point.z >= rect.minZ && point.z <= rect.maxZ;

function parseArgs(argv) {
  const out = { contract: null, seeds: null, tape: null, trace: false, runs: 2, defence: null, kite: null };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--trace') out.trace = true;
    else if (argv[i] === '--contract') out.contract = argv[i + 1];
    else if (argv[i] === '--seed') out.seeds = [...(out.seeds ?? []), argv[i + 1]];
    else if (argv[i] === '--tape') out.tape = argv[i + 1];
    else if (argv[i] === '--runs') out.runs = Number(argv[i + 1]);
    else if (argv[i] === '--defence') out.defence = argv[i + 1];
    else if (argv[i] === '--no-kite') out.kite = 'none';
    else if (argv[i] === '--kite') {
      const [x, z] = argv[i + 1].split(',').map(Number);
      out.kite = { x, z };
    }
  }
  if (!out.contract || !MAPS[out.contract]) {
    process.stderr.write(`Usage: --contract <${Object.keys(MAPS).join('|')}> [--seed <id>] [--tape <path>] [--trace] [--defence <profile>] [--kite x,z | --no-kite]\n`);
    process.exit(1);
  }
  if (out.defence && out.defence !== 'default' && out.defence !== 'apron' && !FORT_PROFILES[out.contract]?.[out.defence]) {
    process.stderr.write(`Unknown fort profile ${out.defence}; known: default ${Object.keys(FORT_PROFILES[out.contract] ?? {}).join(' ')}\n`);
    process.exit(1);
  }
  if (!out.seeds) out.seeds = [`${out.contract}-01`];
  return out;
}

const away = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

/**
 * THE CROSSING ERRAND. What is owed is a CREDIT, not a zone: the window credits at most one entry
 * per `crossingWindowWaves`, and a re-entry in a later window credits again. So the target is a
 * zone the run has never stood in while any remain (the latch keeps the zone conjunct), and after
 * that whichever zone is nearest — the cheapest way to bank the count.
 */
function crossingTarget(air, config, body) {
  const crossing = air.crossing;
  if (!crossing || crossing.complete) return null;
  if (crossing.creditedThisWindow > 0) return null;
  const unreached = crossing.zones.filter((id) => !crossing.reached.includes(id) && config.zones[id]);
  const pool = unreached.length > 0 ? unreached : crossing.zones.filter((id) => config.zones[id]);
  // The body is standing in a zone it has already entered this window; the nearest zone would be
  // that one, and re-entering it needs a LEAVE first, so prefer the nearest OTHER zone.
  const ranked = pool
    .map((id) => ({ id, at: config.zones[id].at, rect: config.zones[id].rect }))
    .sort((left, right) => away(body, left.at) - away(body, right.at));
  // The body may be standing in a zone it already entered this window; re-entering that one needs
  // a LEAVE first, so prefer a zone the body is not already inside.
  return ranked.find((zone) => !insideRect(zone.rect, body)) ?? ranked[0] ?? null;
}

/**
 * The whole policy, and it is deliberately small enough to read: everything it decides is a
 * function of the view in front of it. No memory between turns, so a lost gun is rebuilt and a
 * missed window is simply tried again in the next one.
 */
function planOrders(view, prices, config, trace) {
  const now = view.now;
  const air = now.air;
  const gold = now.gold ?? 0;
  const body = now.prospector ?? config.home;
  if (!air) return [{ verb: 'HOLD', pos: config.home }];

  const suit = air.suit.seconds;
  const orders = [];
  // -1. THE HERO STANDS IN ITS OWN FORT. `MOVE_HERO` (owner ruling 2026-09-06, verbatim: "yes!
  //     please! rider has to be able to move, I did not know that was not possible before") is a
  //     public verb of the union like any other, and the ONE obvious use of it on a map whose
  //     whole fort is authored six world-units south of where the hero happens to start is to walk
  //     the hero into the middle of that fort. Issued only while the hero is more than a metre
  //     from the post — an arrived MOVE_HERO completes on the tick and a hero told nothing stays
  //     where it stopped, so this is one order, not a leash. It goes FIRST because it is the only
  //     order here that is worth a tick of the run's opening and worthless later.
  if (config.kite && now.hero) {
    const away2 = Math.hypot(now.hero.x - config.kite.x, now.hero.z - config.kite.z);
    if (away2 > 1) orders.push({ verb: 'MOVE_HERO', pos: config.kite });
  }
  // 0. THE FREE DAMAGE. Heat 12 measured the lobbed blast as supplementary damage worth taking on
  //    every view where `blastReadyInMs` is 0, without ever switching weapon off the Spark Rig.
  //    It costs the Prospector nothing: the blast is the HERO's, and the hero is welded.
  if ((now.blastReadyInMs ?? 1) === 0) orders.push({ verb: 'BLAST_AT', pos: config.blastAt });

  // 1. THE CREDIT. First in the array after the free damage, so it owns the tick the moment the
  //    body is in range: this is the only order on the map whose value expires with the window.
  let plan = 'work';
  let target = null;
  let sortieSeconds = Infinity;
  let owesCredit = false;

  const liveSeams = (now.seams ?? []).filter((seam) => seam.active && seam.x !== null && seam.remaining > 0);

  if (config.errand === 'crossing') {
    const zone = crossingTarget(air, config, body);
    owesCredit = zone !== null;
    target = zone?.id ?? null;
    sortieSeconds = zone ? (away(body, zone.at) + away(zone.at, config.home)) / AGENT_SPEED : Infinity;
    const canAfford = zone !== null && suit >= sortieSeconds + AIR_MARGIN;
    if (owesCredit && canAfford) {
      plan = 'credit';
      // A SEAM INSIDE THE OWED ZONE CROSSES AND PAYS IN ONE ORDER, and where the map authors one
      // that is always the better errand: `HARVEST` walks the body to the seam exactly as
      // `MOVE_TO` would, and the trip earns its own gold instead of costing a turn of income.
      const seam = liveSeams
        .filter((entry) => insideRect(zone.rect, entry))
        .sort((left, right) => away(body, left) - away(body, right))[0] ?? null;
      if (seam) orders.push({ verb: 'HARVEST', seam: seam.id });
      else orders.push({ verb: 'MOVE_TO', pos: zone.at });
      // A6's own latch rides the same trip on the Far Side, because it is the same rectangle:
      // `recover` is legal only while the body stands in the crater, and a completed order in
      // front of it is what puts the body there.
      if (now.probeRecovery && !now.probeRecovery.recovered) {
        orders.push({ verb: 'CONTEXT_ACTION', action: 'recover' });
      }
      if (config.errandOwnsTurn) {
        orders.push({ verb: 'MOVE_TO', pos: config.home }, { verb: 'HOLD', pos: config.home });
        trace?.push(traceRow(now, air, { plan, target, sortieSeconds: round2(sortieSeconds), pans: 0, build: null }));
        return orders.slice(0, ORDER_CAP);
      }
    }
  } else {
    const worked = new Set(air.regolith.worked);
    owesCredit = !air.regolith.complete
      && worked.size < air.regolith.required
      && (air.regolith.creditedThisWindow ?? 0) === 0;
    // A ground that has never been worked is the only thing that can close a window.
    const fresh = liveSeams
      .filter((seam) => seam.anchorIndex !== null && !worked.has(seam.anchorIndex))
      .sort((left, right) => away(body, left) - away(body, right));
    const seam = fresh[0] ?? null;
    target = seam?.id ?? null;
    sortieSeconds = seam ? (away(body, seam) + away(seam, config.home)) / AGENT_SPEED : Infinity;
    if (owesCredit && seam !== null && suit >= sortieSeconds + AIR_MARGIN) {
      plan = 'credit';
      orders.push({ verb: 'HARVEST', seam: seam.id });
    }
  }

  // 2. THE GUNS, before the gold, because the purse caps and a capped purse is a lost margin
  //    (heat 12's own lesson, all three rides). A `when.goldGte` order waits without blocking the
  //    pans behind it, and every site is inside the shelter, so building never costs air.
  const standing = now.works?.byKind ?? {};
  const nextSite = config.defence.find((site) => {
    const sites = config.defence.filter((entry) => entry.what === site.what);
    const up = standing[site.what] ?? 0;
    return up < sites.length && sites[up] === site;
  });
  const ladder = nextSite ? prices[nextSite.what] ?? [] : [];
  const nextPrice = nextSite ? ladder[Math.min(standing[nextSite.what] ?? 0, ladder.length - 1)] ?? null : null;
  if (nextSite && nextPrice !== null) {
    orders.push({ verb: 'BUILD', what: nextSite.what, where: nextSite.where, when: { goldGte: nextPrice } });
  }

  // 2b. THE SINK, and it is the lesson heat 12 paid for on every one of these maps: "a capped
  //     purse is a lost margin, and the sink is the tier upgrade". `works.entries[].tier` is
  //     ONE-BASED, and `CONTEXT_ACTION` does not travel — `HeadlessContractSim.contextAction`
  //     passes the PROSPECTOR's position into `BuildSystem.upgradeBuilding` — so the pair is a
  //     MOVE_TO in front of the action. Every site is inside the shelter, so the walk costs no air.
  const turrets = (now.works?.entries ?? [])
    .filter((entry) => entry.id === 'turret' && !entry.wrecked && entry.tier < TURRET_TIER_COSTS.length)
    .sort((left, right) => left.tier - right.tier || left.index - right.index);
  const upgrade = turrets[0];
  if (upgrade && gold >= TURRET_TIER_COSTS[upgrade.tier]) {
    orders.push({ verb: 'MOVE_TO', pos: upgrade.position });
    orders.push({ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: 'turret', index: upgrade.index } });
  }

  // 3. THE REFILL, and it is a RETURN rather than a wait: if the suit cannot pay for the sortie
  //    this window still owes, the turn is spent inside the shelter and the credit is taken next
  //    turn. A window is four turns wide, so one spent breathing still leaves three. The gun above
  //    still gets built, because its site is inside the shelter that is doing the breathing.
  //
  //    AND IT IS A RETURN, NOT A VIGIL: `target === null` means there is nothing to go out FOR —
  //    on the Eclipse, no unworked ground has a live seam on it this turn, because only two of the
  //    six anchors carry a seam at a time and a depleted one respawns on a random open anchor 20 s
  //    later (`Balance.goldSeam.respawnSeconds`). Breathing through that is how a first draft of
  //    this prover died at wave 18 on 40 gold with four of six beacons standing and the suit
  //    pinned at 60: it sat in the dome waiting for a seam it was refusing to pan. Measured; the
  //    turn falls through to the gold tail instead, which pays AND respawns the seam it drains.
  if (owesCredit && plan !== 'credit' && target !== null) {
    orders.push({ verb: 'MOVE_TO', pos: config.home }, { verb: 'HOLD', pos: config.home });
    trace?.push(traceRow(now, air, {
      plan: 'breathe',
      target,
      sortieSeconds: round2(sortieSeconds),
      pans: 0,
      build: nextSite ? `${nextSite.what}@${nextSite.where.x},${nextSite.where.z}` : null,
    }));
    return orders.slice(0, ORDER_CAP);
  }

  // 4. THE GOLD. Any live seam pays, worked or not, breathless or not — the window gates the
  //    LATCH, never the purse. Nearest first, drained in a BLOCK before walking to the next: heat
  //    12 measured round-robin panning at 1.29 g/s against a block drain's 2.45 g/s, and the fort
  //    that difference buys is what keeps the claim alive long enough to finish the errand.
  const byDistance = [...liveSeams].sort((left, right) => away(body, left) - away(body, right));
  const room = Math.max(0, ORDER_CAP - orders.length - PAN_TAIL_RESERVE);
  // HEAT 12'S OWN TAIL, verbatim in shape: fill every slot the door will accept, in BLOCKS of
  // seven over the ranked seams. A 30-capacity seam is six 5-gold ticks, so the seventh order in a
  // block fails instantly and falls through as the walk cue to the next seam — the block
  // self-sequences, and a seam that RESPAWNS mid-turn (20 s, `Balance.goldSeam.respawnSeconds`) is
  // panned again by the slots that come back round to it. A tail that stopped at six per seam left
  // twelve pans on a two-seam board and half the income on the table.
  const pans = byDistance.length === 0 ? 0 : room;
  for (let slot = 0; slot < pans; slot += 1) {
    orders.push({ verb: 'HARVEST', seam: byDistance[Math.floor(slot / PAN_BLOCK) % byDistance.length].id });
  }

  // 5. HOME, last — UNTIL THE WALL IS BEHIND THE RIDE. While the latch is open the turn ends
  //    inside the shelter, so whatever time the errand left over is spent refilling the suit for
  //    the next window. Once the objective is COMPLETE the suit is inert: this consumer damages
  //    nothing and mints nothing (the Same Laws law), so an empty suit past the latch costs
  //    exactly zero and the commute is pure lost income. MEASURED on the Eclipse, where the walk
  //    home was costing about twelve seconds of a thirty-second turn — 30 gold a turn against the
  //    600 that four tier-2 turrets need — and the run died eleven seconds short of a 600 s gate
  //    with 140 gold in hand and nothing left to spend it on (`turret.maxCount` is 4 and the
  //    beacon line is full, so the tier sink is the ONLY sink left).
  //
  //    AND WHILE THE LATCH IS OPEN THE RULE IS AIR, NOT HABIT. The suit has to cover the walk home
  //    plus the next sortie plus the margin; below that the turn ends in the shelter, above it the
  //    turn ends AT THE SEAM. A pan made breathless still pays — the window gates the LATCH, never
  //    the purse — so the only thing the commute buys is the credit, and buying it four turns
  //    early is four turns of income given away. It also feeds the errand itself: a seam drained
  //    respawns on a RANDOM OPEN anchor 20 s later (`Balance.goldSeam.respawnSeconds`), and on the
  //    Eclipse a window is missed exactly when no UNWORKED anchor happens to be carrying one.
  const walled = air.crossing ? !air.crossing.complete : !air.regolith.complete;
  const homeSeconds = away(body, config.home) / AGENT_SPEED;
  const nextSortie = Number.isFinite(sortieSeconds) ? sortieSeconds : 0;
  const needHome = walled && suit < homeSeconds + nextSortie + AIR_MARGIN;
  const camp = needHome ? config.home : byDistance[0] ?? config.home;
  orders.push({ verb: 'MOVE_TO', pos: { x: camp.x, z: camp.z } }, { verb: 'HOLD', pos: { x: camp.x, z: camp.z } });
  trace?.push(traceRow(now, air, {
    plan,
    target,
    sortieSeconds: round2(sortieSeconds),
    pans,
    build: nextSite ? `${nextSite.what}@${nextSite.where.x},${nextSite.where.z}` : null,
  }));
  return orders.slice(0, ORDER_CAP);
}

const round2 = (value) => (Number.isFinite(value) ? Number(value.toFixed(2)) : null);

function traceRow(now, air, plan) {
  return {
    wave: now.wave,
    runSeconds: now.timers?.runSeconds ?? null,
    gold: now.gold ?? 0,
    suit: air.suit.seconds,
    inDome: air.suit.inDome,
    ...(air.crossing
      ? {
          window: air.crossing.window,
          windowWaves: air.crossing.windowWaves,
          creditedThisWindow: air.crossing.creditedThisWindow,
          credited: air.crossing.credited,
          required: air.crossing.required,
          reached: [...air.crossing.reached],
          held: air.crossing.windowHeldEntries,
          breathless: air.crossing.breathlessEntries,
          complete: air.crossing.complete,
        }
      : {
          window: air.regolith.window,
          windowWaves: air.regolith.windowWaves,
          creditedThisWindow: air.regolith.creditedThisWindow,
          worked: [...air.regolith.worked],
          required: air.regolith.required,
          held: air.regolith.windowHeldPans,
          breathless: air.regolith.breathlessPans,
          complete: air.regolith.complete,
        }),
    ...(air.eclipse ? { solar: air.eclipse.solar, after: `${air.eclipse.groundsWorkedAfter}/${air.eclipse.requiredAfter}` } : {}),
    works: { ...(now.works?.byKind ?? {}) },
    tiers: (now.works?.entries ?? []).filter((entry) => entry.id === 'turret').map((entry) => entry.tier),
    heroHp: now.hero?.hp ?? null,
    heroAt: now.hero ? { x: now.hero.x, z: now.hero.z } : null,
    threats: now.threats?.alive ?? null,
    body: now.prospector ? { x: Number(now.prospector.x.toFixed(1)), z: Number(now.prospector.z.toFixed(1)) } : null,
    lastOrders: (now.orders ?? []).map((record) => [record.order?.verb, record.status, record.reason ?? null]).slice(0, 4),
    ...plan,
  };
}

async function ride(contract, seed, { tape, trace, config }) {
  const args = ['scripts/gr-sim.mjs', '--contract', contract, '--seed', seed];
  if (tape) args.push('--tape', tape);
  const child = spawn(process.execPath, args, { cwd: root, stdio: ['pipe', 'pipe', 'pipe'] });
  const stderr = [];
  child.stderr.on('data', (chunk) => stderr.push(chunk.toString()));
  const lines = createInterface({ input: child.stdout, crlfDelay: Infinity });

  let outcome = null;
  const prices = {};
  let turns = 0;
  let picks = 0;
  for await (const line of lines) {
    if (!line.trim()) continue;
    const message = JSON.parse(line);
    if (message.now === undefined) {
      outcome = message;
      continue;
    }
    turns += 1;
    if (turns > MAX_TURNS) {
      child.kill();
      throw new Error(`ride stalled: ${MAX_TURNS} turns without terminating (see F-MCAP-1)`);
    }
    // Progress on stderr, never stdout: stdout is the report. A ride that stalls is visible here
    // rather than as a silent burn (F-MCAP-2 was found exactly that way).
    if (process.env.GR_PROVER_PROGRESS) {
      const air = message.now.air ?? {};
      const gate = air.crossing
        ? `x ${air.crossing.credited}/${air.crossing.required} w${air.crossing.window}`
        : `r ${(air.regolith?.worked ?? []).length}/${air.regolith?.required} w${air.regolith?.window}`;
      process.stderr.write(`turn ${turns} wave ${message.now.wave} t=${message.now.timers?.runSeconds ?? '?'} gold=${message.now.gold} hp=${message.now.hero?.hp} suit=${air.suit?.seconds} ${gate}\n`);
    }
    // The price ladders come off the door's OWN mechanics manifest, so a rung can never drift from
    // what the run will charge.
    for (const buildable of message.stablePrefix?.mechanics?.buildables ?? []) {
      prices[buildable.id] = buildable.costs;
    }
    // THE SECURE WINDOW IS THE ONE PLACE THE ANSWER RIDES ALONE: `StandingOrders.submit` refuses
    // any submission made while the window is open that is not EXACTLY one SECURE_CHOICE
    // (`src/agent/StandingOrders.ts:205`). Concatenating the plan behind it is refused, the run
    // freezes while the choice is pending, and the refusal presents as an infinite turn loop
    // rather than an error. F-MCAP-1.
    if (message.now.pendingSecure) {
      child.stdin.write(`${JSON.stringify([{ verb: 'SECURE_CHOICE', choice: 'bank' }])}\n`);
      continue;
    }
    const plan = planOrders(message, prices, config, trace);
    const offer = message.now.pendingOffer;
    if (Array.isArray(offer) && offer.length > 0) {
      // REPLACE SEMANTICS: every accepted array replaces the ENTIRE order set, so answering an
      // offer with `[{PICK_UPGRADE}]` alone wipes the errand. The answer always rides IN FRONT OF
      // the same plan the turn would otherwise have sent. Deterministic: the highest card on the
      // fixed DRAFT list this offer contains, else the first offered card.
      picks += 1;
      const ids = offer.map((entry) => (typeof entry === 'string' ? entry : entry.id));
      const id = DRAFT.find((preferred) => ids.includes(preferred)) ?? ids[0];
      child.stdin.write(`${JSON.stringify([{ verb: 'PICK_UPGRADE', id }, ...plan].slice(0, ORDER_CAP))}\n`);
      continue;
    }
    child.stdin.write(`${JSON.stringify(plan)}\n`);
  }
  child.stdin.end();
  const code = await new Promise((resolve) => child.on('close', resolve));
  return { seed, exitCode: code, turns, picks, outcome, stderr: stderr.join('') };
}

const options = parseArgs(process.argv.slice(2));
// `apron` REPLACES the fort list (the second-build-line arm); every other profile APPENDS to it.
const extraDefence = options.defence && options.defence !== 'default' && options.defence !== 'apron'
  ? FORT_PROFILES[options.contract][options.defence]
  : [];
const baseDefence = options.defence === 'apron' ? APRON_DEFENCE : MAPS[options.contract].defence;
// The map's own post is the default; `--kite x,z` moves it and `--no-kite` reproduces the
// air-wall ride, which is how every row of `LADDER.log` names the arm it measured.
const heroPost = options.kite === 'none' ? null : options.kite ?? MAPS[options.contract].heroPost ?? null;
const config = { ...MAPS[options.contract], defence: [...baseDefence, ...extraDefence], kite: heroPost };
const results = [];
for (const seed of options.seeds) {
  for (let run = 1; run <= options.runs; run += 1) {
    const trace = [];
    // The tape belongs to the FIRST ride of the FIRST seed and nothing else: a `--tape` path shared
    // across runs would have the second silently overwrite the first's proof.
    const tapePath = options.tape && run === 1 && seed === options.seeds[0] ? options.tape : null;
    const result = await ride(options.contract, seed, { tape: tapePath, trace, config });
    results.push({ ...result, run, tape: tapePath, trace: options.trace ? trace : trace.slice(-8) });
  }
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const report = {
  contract: options.contract,
  policy: {
    verbs: ['HARVEST', 'BUILD', 'MOVE_TO', 'MOVE_HERO', 'HOLD', 'BLAST_AT', 'CONTEXT_ACTION', 'PICK_UPGRADE', 'SECURE_CHOICE'],
    home: config.home,
    errand: config.errand,
    airMargin: AIR_MARGIN,
    panTailReserve: PAN_TAIL_RESERVE,
    fortProfile: options.defence ?? 'default',
    heroPost,
    defence: config.defence,
  },
  identical: options.seeds.every((seed) => {
    const runs = results.filter((entry) => entry.seed === seed);
    return runs.length > 1 && runs.every((entry) => same(entry.outcome, runs[0].outcome));
  }),
  secured: results.every((entry) => entry.outcome?.secured === true),
  runs: results.map(({ stderr, ...rest }) => ({ ...rest, stderrTail: stderr.split('\n').filter(Boolean).slice(-3) })),
};
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);

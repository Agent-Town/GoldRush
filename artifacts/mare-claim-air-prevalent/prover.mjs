/**
 * THE MARE CLAIM PUBLIC-VERB PROVER — go out on suit air four times, come home to breathe, secure.
 *
 *   node artifacts/mare-claim-air-prevalent/prover.mjs --seed e8-mare-claim-01 [--tape <path>]
 *   node artifacts/mare-claim-air-prevalent/prover.mjs --all > artifacts/mare-claim-air-prevalent/prover.json
 *
 * WHAT MAKES THIS A PROVER RATHER THAN A PROBE (the door law, `reviews/e6-picnic-admission.md` §3,
 * and the E10S-4 shape it copies): it drives `scripts/gr-sim.mjs` as a SEPARATE PROCESS over
 * stdin/stdout in the door's own vocabulary and nothing else — HARVEST, BUILD, MOVE_TO, HOLD,
 * PICK_UPGRADE, SECURE_CHOICE. No `admissionProbe`, no private handle, no engine import, no
 * balance edit, no minted gold (F-1741). Every coin spent on a turret was panned out of an
 * authored regolith anchor first, and every ground that counted was panned with air in the suit.
 *
 * THE MAP, IN THE FOUR NUMBERS THAT DECIDE IT (all read off the view, none chosen here):
 *   - the suit holds 60 s and drains one second per second outside a breathing dome; inside one it
 *     refills at 4/s, so a full charge costs fifteen seconds of standing still;
 *   - the claim needs FOUR of the six authored grounds worked on that air (`regolith.required`);
 *   - at most ONE ground counts per four-wave window (`regolith.windowWaves`), and a window is
 *     120 s, so the earliest a fourth credit can exist is t = 360 s of a 600 s run;
 *   - the dome pads end at z = 6 and every anchor is out on the mare flat 21 to 42 wu away, so a
 *     credit is a round trip of 9 to 18 seconds of walking plus the pan.
 * The run is therefore an ERRAND WITH A CLOCK: breathe, walk out to a ground nobody has worked,
 * pan it, walk back before the air runs out, and spend the intervening turns panning for the guns
 * that keep the claim alive long enough to do it four times.
 *
 * THE ONE STRUCTURAL CONSTRAINT, and why the order lists look the way they do: a solo gr-sim turn
 * arrives at a WAVE boundary (30 s apart) plus offers, so the rider is not asked every second.
 * Orders are evaluated in array order and the FIRST ACTIONABLE one owns the tick; `HOLD` never
 * completes, so it is always last, and a `BUILD` with `when.goldGte` waits without blocking the
 * pans behind it. Each turn is written as: the credit sortie if one is owed and affordable in air,
 * then the guns, then the gold, then the walk home to breathe. Because every turn ends holding
 * inside the centre dome, the suit is charged again by the time the next window opens.
 *
 * THE DEFENCE IS INHERITED, NOT INVENTED. The ten sites are heat 12's own measured recipe
 * (`artifacts/gauntlet-heat12-20260905/rides/e8-mare-claim/notebook-entry.md`: six beacons on the
 * z = 6 line and four turrets behind them, ten builds, zero ever wrecked, because neither roster
 * entry carries `wrecker` or `thief`). This slice changed nothing about combat, so re-deriving
 * that geometry would have been re-measuring a solved problem.
 *
 * The one number that IS re-derived is the beacon spacing, because heat 12's notebook records the
 * SET {0, +/-1.5, +/-3, +/-5} rather than the six it actually placed, and 1.5 does not survive:
 * `Balance.beacon.gridSnap` is 1, so a request at x = -1.5 snaps onto x = -1 and lands inside the
 * `overlapRadius` 1.2 of the beacon at x = 0. Measured here as nine consecutive
 * "FAILED (collision)" rejections that quietly capped this prover at three beacons. Odd integers
 * two apart clear the radius AND stay inside |x| <= 5.29, which is the only part of the z = 6 line
 * within a beacon's radius 8 of the hero welded at (0, 12) — the subtraction heat 12's notebook
 * names as the one that chose all ten of its coordinates.
 */
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../..', import.meta.url));
const CONTRACT = 'e8-mare-claim';
const SEEDS = [`${CONTRACT}-01`, `${CONTRACT}-02`];

/** Read off the contract card; named here only so the intent of each number is legible. */
// The NORTH edge of `dome-cluster-pad-center` (-6..6, -6..6), not its middle: every authored
// regolith anchor lies north of the domes (z = 12 to 30), so breathing on the near rail rather
// than the centre saves about five seconds of commute on every turn of the run. Measured: moving
// this point from (0, -3) to (0, 5.5) is worth roughly ninety seconds of panning across a ride.
const HOME = { x: 0, z: 5.5 };
const AGENT_SPEED = 4.8;           // `Balance.agent.moveSpeed`, the Prospector's walk.
const AIR_MARGIN = 10;             // seconds of suit kept in hand on any credit sortie, over the walk.
const MAX_PANS_PER_TURN = 18;      // a turn is 30 s and a pan tick is 1.5 s; the rest is walking.
const BLAST_AT = { x: 0, z: 14 };  // two metres north of the welded hero, inside the 2.4x lobbed reach.
const ORDER_CAP = 32;              // the door's own cap on one array.
const MAX_TURNS = 400;             // a 600 s ride asks about 50 times; anything past this is a stall.
/** `Balance.tiers.turret` costs, indexed BY THE ONE-BASED `tier` the view publishes. [0] is unused. */
const TURRET_TIER_COSTS = [0, 150, 300];
const PAN_GOLD = 5;                // `Balance.goldSeam.tickGold`; one HARVEST order is one tick.

/**
 * Heat 12's measured ten, in the order that ride built them: guns first, then the beacons that
 * slow what the guns are shooting at. Every site is inside `dome-cluster-pad-center` or on its
 * z = 6 edge, which is the only build ground within a beacon's radius 8 of the welded hero.
 */
const DEFENCE = [
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
];

/**
 * THE DRAFT, in preference order, and it is the one thing about this ride that is NOT the errand.
 * Heat 12's own lesson: "every draft pick spent on `spring_heels` / `pan_legend` /
 * `prospectors_luck` is combat power given away", and its hero finished on 175 max HP where a
 * blind first-offered pick leaves the Prospector's hero on 100. The first draft of this prover
 * took `offer[0]` every time and died at wave 12 with the regolith run ALREADY COMPLETE — the wall
 * was crossed and the claim still fell, which is a defence problem, not an air one.
 *
 * `beacon_dynamo` sits second on the strength of the arithmetic rather than a hunch: +30% fire
 * rate per stack across SIX beacons is the largest damage any single card on this list buys, and
 * this board's beacons are all six inside radius 8 of the welded hero.
 *
 * MEASURED AND REJECTED: an economy-first draft (`pan_legend` and `prospectors_luck` ahead of the
 * guns, on the theory that the wall's dome commute makes gold the scarce resource) hung a gr-sim
 * child at 110% CPU for eighteen minutes without printing a turn. Not investigated further and NOT
 * shipped; recorded here so the next reader knows it was tried, and that the failure was a hang
 * rather than a loss. F-MCAP-2.
 */
const DRAFT = [
  'tinkers_plating', 'beacon_dynamo', 'heavy_spark', 'field_dressing', 'double_tap_coil',
  'split_spark', 'sharpen', 'long_resonator', 'quick_fuse', 'wide_ring', 'powder_charge',
];

function parseArgs(argv) {
  const out = { seeds: null, tape: null, trace: false, all: false };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--all') out.all = true;
    else if (argv[i] === '--trace') out.trace = true;
    else if (argv[i] === '--seed') out.seeds = [argv[i + 1]];
    else if (argv[i] === '--tape') out.tape = argv[i + 1];
  }
  if (!out.seeds) out.seeds = SEEDS;
  return out;
}

const away = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

/**
 * The whole policy, and it is deliberately small enough to read: everything it decides is a
 * function of the view in front of it. No memory between turns, so a lost gun is rebuilt and a
 * missed window is simply tried again in the next one.
 */
function planOrders(view, prices, trace) {
  const now = view.now;
  const air = now.air;
  const gold = now.gold ?? 0;
  const body = now.prospector ?? HOME;
  if (!air) return [{ verb: 'HOLD', pos: HOME }];

  const worked = new Set(air.regolith.worked);
  const suit = air.suit.seconds;
  const owesCredit = !air.regolith.complete
    && worked.size < air.regolith.required
    && (air.regolith.creditedThisWindow ?? 0) === 0;

  const live = (now.seams ?? []).filter((seam) => seam.active && seam.x !== null && seam.remaining > 0);
  // A ground that has never been worked is the only thing that can close a window.
  const fresh = live
    .filter((seam) => seam.anchorIndex !== null && !worked.has(seam.anchorIndex))
    .sort((left, right) => away(body, left) - away(body, right));
  const target = fresh[0] ?? null;
  // The air the sortie costs: the walk out, and the walk back to the dome that refills the suit.
  const sortieSeconds = target ? (away(body, target) + away(target, HOME)) / AGENT_SPEED : Infinity;
  const canAffordSortie = target !== null && suit >= sortieSeconds + AIR_MARGIN;

  const orders = [];
  // 0. THE FREE DAMAGE. Heat 12 measured the 2.4x lobbed blast as supplementary damage worth
  //    taking on every view where `blastReadyInMs` is 0, without ever switching weapon off the
  //    Spark Rig (the auto-lob is ~10 dps against the Rig's 24). It costs the Prospector nothing:
  //    the blast is the HERO's, and the hero on this map is welded to (0, 12).
  if ((now.blastReadyInMs ?? 1) === 0) orders.push({ verb: 'BLAST_AT', pos: BLAST_AT });

  // 1. THE CREDIT. First in the array, so it owns the tick the moment the body is in range: this
  //    is the only order on the map whose value expires with the window.
  if (owesCredit && canAffordSortie) orders.push({ verb: 'HARVEST', seam: target.id });

  // 2. THE GUNS, before the gold, because the purse caps at 200 and a capped purse is a lost
  //    margin (heat 12's own lesson). A `when.goldGte` order waits without blocking the pans, and
  //    every site is inside the centre dome or on its z = 6 edge, so building never costs air.
  const standing = now.works?.byKind ?? {};
  const nextSite = DEFENCE.find((site) => {
    const sites = DEFENCE.filter((entry) => entry.what === site.what);
    const up = standing[site.what] ?? 0;
    return up < sites.length && sites[up] === site;
  });
  const ladder = nextSite ? prices[nextSite.what] ?? [] : [];
  const nextPrice = nextSite ? ladder[Math.min(standing[nextSite.what] ?? 0, ladder.length - 1)] ?? null : null;
  if (nextSite && nextPrice !== null) {
    orders.push({ verb: 'BUILD', what: nextSite.what, where: nextSite.where, when: { goldGte: nextPrice } });
  }

  // 2b. THE SINK, and it is the lesson heat 12 paid for twice: "a capped purse is a lost margin,
  //     and the sink is the tier upgrade". The purse caps at 200 and a turret's second tier costs
  //     150 for +40% damage and +18% fire rate (`Balance.tiers.turret`), so once the ladder is
  //     full every spare 150 gold belongs in a turret rather than in a bucket that overflows.
  //     `works.entries[].tier` is ONE-BASED — indexing the tier table with the tier itself is the
  //     silent no-op that cost heat 12 about 250 gold of income. `CONTEXT_ACTION` carries no
  //     `when` clause, so it is issued only when the purse can already pay.
  const turrets = (now.works?.entries ?? [])
    .filter((entry) => entry.id === 'turret' && !entry.wrecked && entry.tier < TURRET_TIER_COSTS.length)
    .sort((left, right) => left.tier - right.tier || left.index - right.index);
  const upgrade = turrets[0];
  if (upgrade && gold >= TURRET_TIER_COSTS[upgrade.tier]) {
    // The upgrade is REACHED, not commanded from afar: `HeadlessContractSim.contextAction` passes
    // the PROSPECTOR's position into `BuildSystem.upgradeBuilding`, and an out-of-reach call comes
    // back "not legal here" (measured — this prover ate that rejection nine times before the walk
    // was added). The turret sits inside the centre dome, so the walk costs no air either.
    orders.push({ verb: 'MOVE_TO', pos: upgrade.position });
    orders.push({ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: 'turret', index: upgrade.index } });
  }

  // 3. THE REFILL, and it is a RETURN rather than a wait: if the suit cannot pay for the sortie
  //    this window still owes, the turn is spent inside the dome and the credit is taken next
  //    turn. A window is four turns wide, so one spent breathing still leaves three. The gun above
  //    still gets built, because its site is inside the dome that is doing the breathing.
  if (owesCredit && !canAffordSortie) {
    orders.push({ verb: 'MOVE_TO', pos: HOME }, { verb: 'HOLD', pos: HOME });
    trace?.push(traceRow(now, air, {
      plan: 'breathe',
      target: target?.id ?? null,
      sortieSeconds: Number.isFinite(sortieSeconds) ? Number(sortieSeconds.toFixed(2)) : null,
      pans: 0,
      build: nextSite ? `${nextSite.what}@${nextSite.where.x},${nextSite.where.z}` : null,
    }));
    return orders;
  }

  // 4. THE GOLD. Any live seam pays, worked or not, breathless or not — the window gates the
  //    LATCH, never the purse. Nearest first, so the walk is short and the suit lasts.
  const byDistance = [...live].sort((left, right) => away(body, left) - away(body, right));
  let pans = 0;
  for (const seam of byDistance) {
    const take = Math.min(6, Math.ceil(seam.remaining / 5), MAX_PANS_PER_TURN - pans);
    for (let i = 0; i < take; i += 1) orders.push({ verb: 'HARVEST', seam: seam.id });
    pans += Math.max(0, take);
    if (pans >= MAX_PANS_PER_TURN) break;
  }

  // 5. HOME, always last: the turn ends inside the dome, so whatever time the errand left over is
  //    spent refilling the suit for the next window. MEASURED ALTERNATIVE, and it was worse: a
  //    variant that ended deep-suit turns AT THE SEAMS to save the ten-second commute banked more
  //    gold per turn and still died four waves earlier (wave 17 against 19, two grounds against
  //    five), because the guns it bought arrived after the crowd did. The commute is the price of
  //    the air, and paying it is the policy.
  orders.push({ verb: 'MOVE_TO', pos: HOME }, { verb: 'HOLD', pos: HOME });
  trace?.push(traceRow(now, air, {
    plan: owesCredit ? 'credit' : 'work',
    target: target?.id ?? null,
    sortieSeconds: Number.isFinite(sortieSeconds) ? Number(sortieSeconds.toFixed(2)) : null,
    pans,
    build: nextSite ? `${nextSite.what}@${nextSite.where.x},${nextSite.where.z}` : null,
  }));
  return orders.slice(0, ORDER_CAP);
}

function traceRow(now, air, plan) {
  return {
    wave: now.wave,
    runSeconds: now.timers?.runSeconds ?? null,
    gold: now.gold ?? 0,
    suit: air.suit.seconds,
    inDome: air.suit.inDome,
    window: air.regolith.window,
    windowWaves: air.regolith.windowWaves,
    creditedThisWindow: air.regolith.creditedThisWindow,
    worked: [...air.regolith.worked],
    required: air.regolith.required,
    windowHeld: air.regolith.windowHeldPans,
    breathless: air.regolith.breathlessPans,
    complete: air.regolith.complete,
    works: { ...(now.works?.byKind ?? {}) },
    tiers: (now.works?.entries ?? []).filter((entry) => entry.id === 'turret').map((entry) => entry.tier),
    worksAt: (now.works?.entries ?? []).map((entry) => `${entry.id}@${entry.position.x},${entry.position.z}${entry.wrecked ? '!' : ''}`),
    heroHp: now.hero?.hp ?? null,
    threats: now.threats?.alive ?? null,
    body: now.prospector ? { x: Number(now.prospector.x.toFixed(1)), z: Number(now.prospector.z.toFixed(1)) } : null,
    lastOrders: (now.orders ?? []).map((record) => [record.order?.verb, record.status, record.reason ?? null]),
    ...plan,
  };
}

async function ride(seed, { tape, trace }) {
  const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', seed];
  if (tape) args.push('--tape', tape);
  const child = spawn(process.execPath, args, { cwd: root, stdio: ['pipe', 'pipe', 'pipe'] });
  const stderr = [];
  child.stderr.on('data', (chunk) => stderr.push(chunk.toString()));
  const lines = createInterface({ input: child.stdout, crlfDelay: Infinity });

  let outcome = null;
  let prices = {};
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
    // rather than as a silent eighteen-minute burn (F-MCAP-2 was found exactly that way).
    if (process.env.GR_PROVER_PROGRESS) {
      process.stderr.write(`turn ${turns} wave ${message.now.wave} t=${message.now.timers?.runSeconds ?? '?'} gold=${message.now.gold} hp=${message.now.hero?.hp} secure=${JSON.stringify(message.now.pendingSecure ?? null)} offer=${(message.now.pendingOffer ?? []).map((e) => e.id).join('/')} last=${JSON.stringify((message.now.orders ?? []).slice(0, 3).map((r) => [r.order?.verb, r.status, r.reason]))}\n`);
    }
    // The price ladders come off the door's OWN mechanics manifest, so a rung can never drift from
    // what the run will charge.
    for (const buildable of message.stablePrefix?.mechanics?.buildables ?? []) {
      prices[buildable.id] = buildable.costs;
    }
    // REPLACE SEMANTICS, and it cost this prover its first ride: every accepted array replaces the
    // ENTIRE order set, so answering an offer with `[{PICK_UPGRADE}]` alone wipes the errand. The
    // first draft did exactly that, the Prospector stood on its spawn tile from t = 150 s onward,
    // the suit never refilled and the run died at wave 11 with four works standing. The answer
    // always rides IN FRONT OF the same plan the turn would otherwise have sent.
    // THE SECURE WINDOW IS THE ONE PLACE THE ANSWER RIDES ALONE, and it is the exact mirror of the
    // rule above: `StandingOrders.submit` refuses any submission made while the window is open
    // that is not EXACTLY one SECURE_CHOICE (`src/agent/StandingOrders.ts:205`). Concatenating the
    // plan behind it — the very thing an upgrade offer requires — is refused, the previous orders
    // stay in force, and because `HeadlessContractSim.step` freezes the run while the choice is
    // pending, the refusal is not an error but an INFINITE TURN LOOP: this prover printed 14 467
    // identical turns at t = 600 with `expiresInMs` stuck at 20 000 before the cause was found.
    // F-MCAP-1.
    if (message.now.pendingSecure) {
      child.stdin.write(`${JSON.stringify([{ verb: 'SECURE_CHOICE', choice: 'bank' }])}\n`);
      continue;
    }
    const plan = planOrders(message, prices, trace);
    const offer = message.now.pendingOffer;
    if (Array.isArray(offer) && offer.length > 0) {
      // Deterministic: the highest card on the fixed DRAFT list that this offer contains, and the
      // first offered card when it contains none of them. A fixed rule keeps two rides identical.
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
const results = [];
for (const seed of options.seeds) {
  for (const run of [1, 2]) {
    const trace = [];
    // The tape belongs to the FIRST ride of the FIRST seed and nothing else: a `--tape` path shared
    // across seeds would have the second seed silently overwrite the first's proof.
    const tapePath = options.tape && run === 1 && seed === options.seeds[0] ? options.tape : null;
    const result = await ride(seed, { tape: tapePath, trace });
    results.push({ ...result, run, tape: tapePath, trace: options.trace ? trace : trace.slice(-6) });
  }
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const report = {
  contract: CONTRACT,
  policy: {
    verbs: ['HARVEST', 'BUILD', 'MOVE_TO', 'HOLD', 'PICK_UPGRADE', 'SECURE_CHOICE'],
    home: HOME,
    airMargin: AIR_MARGIN,
    maxPansPerTurn: MAX_PANS_PER_TURN,
    defence: DEFENCE,
  },
  identical: options.seeds.every((seed) => {
    const [first, second] = results.filter((entry) => entry.seed === seed);
    return second !== undefined && same(first.outcome, second.outcome);
  }),
  runs: results.map(({ stderr, ...rest }) => ({ ...rest, stderrTail: stderr.split('\n').filter(Boolean).slice(-3) })),
};
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);

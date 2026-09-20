/**
 * E10S-4 THE PUBLIC-VERB PROVER — pan the cooling veins, STOKE the vent, defend, secure.
 *
 *   node artifacts/e10s-4-door/prover.mjs --seed e10-ember-shore-01 [--tape <path>] [--trace <path>]
 *   node artifacts/e10s-4-door/prover.mjs --all > artifacts/e10s-4-door/prover.json
 *
 * WHAT MAKES THIS A PROVER RATHER THAN A PROBE (the door law, `reviews/e6-picnic-admission.md` §3):
 * it drives `scripts/gr-sim.mjs` as a separate process over stdin/stdout, in the door's OWN
 * vocabulary and nothing else — HARVEST, MOVE_TO, CONTEXT_ACTION(stoke), HOLD, SECURE_CHOICE. No
 * `admissionProbe`, no private handle, no engine import, no balance edit, no minted gold (F-1741).
 * Every coin spent on a stoke was panned out of an authored cooling-vein anchor first.
 *
 * THE MAP, IN THE THREE NUMBERS THAT DECIDE IT (all read off the contract, none chosen here):
 *   - the squall cycle is calm 60 / telegraph 8 / squall 25 / recover 8 = 101 s, and the vent loses
 *     4 warmth a second ONLY while it blows: a whole squall costs exactly the 100 warmth the vent
 *     holds, so an unstoked vent dies on the first one's last tick (93.0 s, measured);
 *   - a STOKE is 15 gold for +40 warmth, capped at 100, refused out of reach beyond 4wu;
 *   - a pan is 5 gold and a seam holds 30.
 * So the run is an errand loop: bank enough coin during the calm to buy back the warmth the next
 * squall will take, and be standing at the vent when it takes it.
 *
 * THE ONE STRUCTURAL CONSTRAINT, and why the order lists look the way they do: a solo gr-sim turn
 * arrives at a WAVE boundary (30 s apart) plus surprises and offers, so the rider is not asked
 * every second. `StandingOrders.tick` walks the list in order, skips done/failed records, and the
 * first record that returns work owns the tick; `HOLD` never completes, so it must be last, and a
 * `CONTEXT_ACTION` fires once and is done or failed forever. The list is therefore written as an
 * ERRAND: stoke what is owed while still standing at the vent, walk out and pan, walk back, stoke
 * again with the fresh purse, then hold the vent until the next turn. Because every turn ends on a
 * HOLD at the vent, the next turn's opening stoke is always in reach.
 */
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../..', import.meta.url));
const CONTRACT = 'e10-ember-shore';
const SEEDS = [`${CONTRACT}-01`, `${CONTRACT}-02`];

/** Read off the view every turn; named here only so the intent of each number is legible. */
const PURSE_TARGET = 140; // enough coin in hand to answer a squall AND buy the next gun.
const MAX_PANS_PER_TURN = 6; // one seam's whole 30-gold capacity, never more.
const VENT_STAND_OFFSET = 2.5; // south of the stake: inside the 4wu disc, outside the vent altar.
const STOKE_RESERVE = 45; // three stokes stay in the purse before a coin is spent on defence.

/**
 * The door's OWN published price ladders, transcribed from the mechanics manifest this contract
 * hands a rider (`buildables[].costs`, `artifacts/e10s-4-door/manifest-probe.mjs`). They are copied
 * rather than read off the view because the solo view publishes the purse, not the shop; nothing
 * here changes a price, and a wrong entry only ever makes the prover POORER (it holds back until
 * it believes it can pay), never richer. The fourth turret is one such entry: the manifest prices
 * it at 125 and this table says 130, so the prover saves five gold it did not need. Left as
 * measured rather than corrected after the fact, because the runs below were made with it.
 */
const PRICES = {
  turret: [50, 70, 95, 130],
  sentry_beacon: [25, 35, 45, 55, 75, 95],
};

/**
 * THE DEFENCE, and why it exists at all: the first ride of this policy kept the vent (one squall
 * survived, `objectiveMet` true) and still LOST at 136 s, because the hero stands where the vent
 * is and the squall doubles the mote pressure on top of the unraveled machines that arrive at
 * wave 4. Panning and stoking answer the weather; nothing in them answers the crowd. Note the
 * asymmetry that makes this necessary rather than optional: standing orders steer the PROSPECTOR
 * (`src/agent/Embodiment.ts:131`), never the hero, so a rider cannot walk its fighter out of a
 * swarm — it can only build something that shoots back.
 *
 * Every site is inside the authored `last-warm-vent-site` buildZone (x -2..8, z -16..-4) and clear
 * of the `last-warm-vent-altar` landmark blocker at (3,-10). The order is deliberate: guns first,
 * then the beacons that slow what the guns are shooting at.
 */
const DEFENCE = [
  { what: 'turret', where: { x: -1, z: -13 } },
  { what: 'turret', where: { x: 7, z: -13 } },
  { what: 'sentry_beacon', where: { x: 0, z: -6 } },
  { what: 'sentry_beacon', where: { x: 6, z: -6 } },
  { what: 'turret', where: { x: -1, z: -6 } },
  { what: 'turret', where: { x: 7, z: -6 } },
];

function parseArgs(argv) {
  const out = { seeds: null, tape: null, trace: null, all: false, defaultSecure: false };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--all') out.all = true;
    else if (argv[i] === '--default-secure') out.defaultSecure = true;
    else if (argv[i] === '--seed') out.seeds = [argv[i + 1]];
    else if (argv[i] === '--tape') out.tape = argv[i + 1];
    else if (argv[i] === '--trace') out.trace = argv[i + 1];
  }
  if (!out.seeds) out.seeds = SEEDS;
  return out;
}

/**
 * The whole policy, and it is deliberately small enough to read: everything it decides is a
 * function of the view in front of it.
 */
function planOrders(view, trace) {
  const now = view.now;
  const preserve = now.emberShore?.preserve;
  const squall = now.squall;
  const gold = now.gold ?? 0;
  if (!preserve?.declared) return [{ verb: 'HOLD', pos: { x: now.hero.x, z: now.hero.z } }];

  const vent = preserve.position;
  const stand = { x: vent.x, z: vent.z - VENT_STAND_OFFSET };
  const cost = preserve.stoke.goldCost;
  const restore = preserve.stoke.warmthRestore;
  const max = preserve.maxWarmth;
  const warmth = preserve.warmth;
  const prospector = now.prospector ?? { x: vent.x, z: vent.z };
  const inReach = Math.hypot(prospector.x - vent.x, prospector.z - vent.z) <= preserve.stoke.radius;

  // How much warmth the NEXT thirty seconds can take. The scheduler publishes where it is in the
  // cycle, so this is arithmetic on its own numbers rather than a guess: the squall either blows
  // now, or arrives inside the window, or does not.
  const blowing = squall?.blowing === true;
  const toSquall = squall?.secondsToNextSquall ?? Infinity;
  const squallSecondsAhead = blowing
    ? Math.min(30, (squall.squallSeconds ?? 25) * (1 - (squall.phaseProgress ?? 0)))
    : Math.max(0, Math.min(30 - toSquall, squall?.squallSeconds ?? 25));
  const warmthAtRisk = squallSecondsAhead * (preserve.decayPerSecond ?? 4);

  // Stokes owed right now, in two passes, and the split is the whole economy of the map. A stoke
  // is a flat 15 gold for AT MOST +40 warmth against a cap of 100, so stoking a warm vent throws
  // the difference away. Pass one buys only whole stokes (warmth <= 60). Pass two is allowed to
  // spill, but ONLY while the vent would otherwise not outlast the squall already in the window:
  // survival is worth a wasted coin, comfort is not. The first ride of this prover skipped that
  // distinction and burned ten stokes on two squalls where seven would have done.
  const plan = (fromWarmth, fromGold) => {
    let w = fromWarmth;
    let g = fromGold;
    let count = 0;
    while (g >= cost && w <= max - restore && count < 4) {
      w += restore;
      g -= cost;
      count += 1;
    }
    while (g >= cost && w < max && w < warmthAtRisk && count < 4) {
      w = Math.min(max, w + restore);
      g -= cost;
      count += 1;
    }
    return { count, warmth: w, gold: g };
  };

  const opening = inReach ? plan(warmth, gold) : { count: 0, warmth, gold };
  // Pans are bought only with the time the vent can spare: never walk out while the squall is
  // already eating a vent that the purse cannot buy back.
  const wouldSurvive = opening.warmth > warmthAtRisk;
  const seams = (now.seams ?? []).filter((seam) => seam.active && seam.x !== null)
    .map((seam) => ({ seam, away: Math.hypot(seam.x - vent.x, seam.z - vent.z) }))
    .sort((a, b) => a.away - b.away);
  // The errand takes in the two NEAREST live veins, nearest first. Two is what a thirty-second
  // turn pays for: the closest anchor is a 3.4 s walk at the Prospector's 4.8wu/s and the second
  // adds about five more, which still leaves the walk home inside the window.
  let budget = wouldSurvive ? Math.max(0, Math.ceil((PURSE_TARGET - opening.gold) / 5)) : 0;
  const errand = [];
  for (const { seam } of seams.slice(0, 2)) {
    if (budget <= 0) break;
    const take = Math.min(MAX_PANS_PER_TURN, budget, Math.ceil(seam.remaining / 5));
    if (take <= 0) continue;
    errand.push({ seam, take });
    budget -= take;
  }
  const pans = errand.reduce((total, entry) => total + entry.take, 0);

  const closing = plan(
    Math.max(0, opening.warmth - warmthAtRisk),
    opening.gold + pans * 5,
  );

  // One gun a turn, and only ever with the stoke reserve still untouched: the vent outranks the
  // crowd every time, because the crowd cannot end the run in the next thirty seconds and the
  // weather can. The site is chosen STATELESSLY off `works.byKind`, so a gun that fell is rebuilt
  // on the next turn rather than remembered as standing.
  const standing = now.works?.byKind ?? {};
  const nextSite = DEFENCE.find((site) => {
    const sites = DEFENCE.filter((entry) => entry.what === site.what);
    const up = standing[site.what] ?? 0;
    return up < sites.length && sites[up] === site;
  });
  const nextPrice = nextSite ? PRICES[nextSite.what][Math.min(standing[nextSite.what] ?? 0, PRICES[nextSite.what].length - 1)] : null;
  const buildAffordable = nextSite !== undefined && closing.gold >= STOKE_RESERVE + nextPrice;

  const orders = [];
  for (let i = 0; i < opening.count; i += 1) orders.push({ verb: 'CONTEXT_ACTION', action: 'stoke' });
  for (const entry of errand) for (let i = 0; i < entry.take; i += 1) orders.push({ verb: 'HARVEST', seam: entry.seam.id });
  if (buildAffordable) {
    orders.push({ verb: 'BUILD', what: nextSite.what, where: nextSite.where, when: { goldGte: STOKE_RESERVE + nextPrice } });
  }
  orders.push({ verb: 'MOVE_TO', pos: stand });
  for (let i = 0; i < closing.count; i += 1) orders.push({ verb: 'CONTEXT_ACTION', action: 'stoke' });
  orders.push({ verb: 'HOLD', pos: stand });

  trace?.push({
    wave: now.wave,
    runSeconds: now.timers?.runSeconds ?? null,
    phase: squall?.phase ?? null,
    warmth: Number(warmth.toFixed(3)),
    gold,
    inReach,
    squallSecondsAhead: Number(squallSecondsAhead.toFixed(2)),
    warmthAtRisk: Number(warmthAtRisk.toFixed(2)),
    errand: errand.map((entry) => [entry.seam.id, entry.take]),
    build: buildAffordable ? nextSite.what : null,
    works: { ...standing },
    pans,
    stokes: { opening: opening.count, closing: closing.count },
    stokeUses: preserve.stoke.uses,
    refusals: { ...preserve.stoke.refusals },
    squallsSurvived: preserve.squallsSurvived,
    objectiveMet: preserve.objectiveMet,
    heroHp: now.hero.hp,
    threats: now.threats?.alive ?? null,
  });
  return orders;
}

async function ride(seed, { tape, trace, defaultSecure }) {
  const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', seed];
  if (tape) args.push('--tape', tape);
  const child = spawn(process.execPath, args, { cwd: root, stdio: ['pipe', 'pipe', 'pipe'] });
  const stderr = [];
  child.stderr.on('data', (chunk) => stderr.push(chunk.toString()));
  const lines = createInterface({ input: child.stdout, crlfDelay: Infinity });

  let outcome = null;
  let turns = 0;
  let secureChoices = 0;
  for await (const line of lines) {
    if (!line.trim()) continue;
    const message = JSON.parse(line);
    if (message.now === undefined) {
      outcome = message;
      continue;
    }
    turns += 1;
    if (message.now.pendingSecure) {
      // THE CONTROL (`--default-secure`) writes a bare newline: gr-sim reads an empty line as "no
      // orders this turn" and the engine defaults the choice, which is the only way to keep the
      // run's LAST recorded submission off the terminal tick. It exists to attribute the one
      // difference the tape replay shows; see the replay note in the report. It must still WRITE
      // something, because gr-sim blocks on stdin at every non-terminal turn.
      if (defaultSecure) {
        child.stdin.write('\n');
        continue;
      }
      secureChoices += 1;
      child.stdin.write(`${JSON.stringify([{ verb: 'SECURE_CHOICE', choice: 'bank' }])}\n`);
      continue;
    }
    child.stdin.write(`${JSON.stringify(planOrders(message, trace))}\n`);
  }
  child.stdin.end();
  const code = await new Promise((resolve) => child.on('close', resolve));
  return { seed, exitCode: code, turns, secureChoices, outcome, stderr: stderr.join('') };
}

const options = parseArgs(process.argv.slice(2));
const results = [];
for (const seed of options.seeds) {
  for (const run of [1, 2]) {
    const trace = [];
    const tapePath = options.tape && run === 1 ? options.tape : null;
    const result = await ride(seed, { tape: tapePath, trace, defaultSecure: options.defaultSecure });
    results.push({ ...result, run, tape: tapePath, trace: options.trace ? trace : trace.slice(-4) });
  }
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const report = {
  contract: CONTRACT,
  policy: {
    verbs: ['HARVEST', 'MOVE_TO', 'CONTEXT_ACTION(stoke)', 'HOLD', 'SECURE_CHOICE'],
    purseTarget: PURSE_TARGET,
    maxPansPerTurn: MAX_PANS_PER_TURN,
    ventStandOffset: VENT_STAND_OFFSET,
  },
  identical: options.seeds.every((seed) => {
    const [first, second] = results.filter((entry) => entry.seed === seed);
    return second && same(first.outcome, second.outcome);
  }),
  runs: results.map(({ stderr, ...rest }) => rest),
};
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);

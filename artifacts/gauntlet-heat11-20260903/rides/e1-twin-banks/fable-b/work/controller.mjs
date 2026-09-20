// e1-twin-banks controller — Claude Fable 5, heat 11 (generation 7).
// Deterministic standing-orders policy over the NDJSON door transport.
// Strategy: hero-centred fort on the south stake (enemies target the hero),
// three sluices on the water-adjacency line z=-7 fund the ceil-to-5 turret
// curve; seam panning bootstraps and supplements; single-element SECURE_CHOICE
// bank at the wave-20 window.
import { spawn } from 'node:child_process';
import { createWriteStream, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline';

const DIR = '/private/tmp/heat11-5e7a7c0b/artifacts/heat11/fable/e1-twin-banks-b';
const label = process.argv[2] ?? 'tune-1';
const tapePath = `${DIR}/${label}-tape.json`;

const HOME = { x: 0, z: -13 };
const SLUICES = [ { x: 0, z: -7 }, { x: -4, z: -7 }, { x: 4, z: -7 } ];
const TURRETS = [ { x: 4, z: -9 }, { x: -4, z: -9 }, { x: 4, z: -17 }, { x: -4, z: -17 } ];
const TURRET_COSTS = [50, 70, 95, 125];
const BEACONS = [ { x: 0, z: -9.5, g: 80 }, { x: 0, z: -16.5, g: 95 }, { x: 7, z: -13, g: 110 }, { x: -7, z: -13, g: 125 } ];
// Ford plugs: every north-bank enemy must cross at x=13..19 or x=-19..-13
// (riverBlocksEnemyCrossingAt routes them to the fords). Timber across each
// ford exit makes them chew cheap walls 16wu from the hero.
const PALISADES = [
  { x: 14.8, z: -7.2, rot: 1 }, { x: -14.8, z: -7.2, rot: 1 },
  { x: 17.9, z: -7.2, rot: 1 }, { x: -17.9, z: -7.2, rot: 1 },
];
const UPGRADE_PREF = ['prospectors_luck', 'tinkers_plating', 'beacon_dynamo'];
const COMBAT_RE = /coil|spark|charge|fuse|ring|resonator|tap|plating/i;

const child = spawn('node', ['scripts/gr-sim.mjs',
  '--contract', 'e1-twin-banks', '--seed', 'e1-twin-banks-01',
  '--difficulty', 'trail', '--tape', tapePath,
], { cwd: '/private/tmp/heat11-5e7a7c0b', stdio: ['pipe', 'pipe', 'pipe'] });

const log = createWriteStream(`${DIR}/${label}-log.ndjson`);
child.stderr.pipe(createWriteStream(`${DIR}/${label}-stderr.txt`));

let lastLine = null;
let repeatCount = 0;
let sent = 0;

function countWorks(view, id) {
  const entries = view.now?.works?.entries ?? [];
  return entries.filter((e) => e.id === id).length;
}

function pickUpgrade(offer) {
  for (const want of UPGRADE_PREF) { const hit = offer.find((o) => o.id === want); if (hit) return hit.id; }
  const combat = offer.find((o) => COMBAT_RE.test(o.id) || COMBAT_RE.test(o.name ?? ''));
  return (combat ?? offer[0]).id;
}

function ordersFor(view) {
  const now = view.now;
  // Secure window accepts ONLY a single-element SECURE_CHOICE array (gen-6 law).
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const orders = [];
  if (now.pendingOffer?.length) orders.push({ verb: 'PICK_UPGRADE', id: pickUpgrade(now.pendingOffer) });

  const nSluice = countWorks(view, 'sluice');
  const nTurret = countWorks(view, 'turret');
  const nBeacon = countWorks(view, 'sentry_beacon');
  const nStock = countWorks(view, 'stockpile');

  // Interleaved ladder; affordability-first + array priority yields
  // turret1 -> sluice1 -> turret2 -> sluice2/3 -> turret3 -> turret4 -> beacons/stockpiles.
  // Sequence enforced by INCLUSION, not gates: sluices only join the set once
  // enough turrets stand (tune-3 lesson: a 40g sluice preempts the 50g turret
  // whenever gold crosses 40 first, and the guardless hero dies at wave 3).
  const ladder = [];
  if (nTurret < 4) ladder.push({ verb: 'BUILD', what: 'turret', where: TURRETS[nTurret], when: { goldGte: TURRET_COSTS[nTurret] } });
  if (nSluice < 1 && nTurret >= 1) ladder.push({ verb: 'BUILD', what: 'sluice', where: SLUICES[0], when: { goldGte: 40 } });
  else if (nSluice >= 1 && nSluice < 3 && nTurret >= 2) ladder.push({ verb: 'BUILD', what: 'sluice', where: SLUICES[nSluice], when: { goldGte: 40 } });
  if (nTurret < 3) ladder.push({ verb: 'BUILD', what: 'turret', where: TURRETS[nTurret + 1], when: { goldGte: TURRET_COSTS[nTurret] + TURRET_COSTS[nTurret + 1] } });
  const nPal = countWorks(view, 'palisade');
  if (nPal < 4 && nTurret >= 2) ladder.push({ verb: 'BUILD', what: 'palisade', where: { x: PALISADES[nPal].x, z: PALISADES[nPal].z }, when: { goldGte: 10 }, rotationSteps: PALISADES[nPal].rot });
  if (nBeacon < 4) ladder.push({ verb: 'BUILD', what: 'sentry_beacon', where: { x: BEACONS[nBeacon].x, z: BEACONS[nBeacon].z }, when: { goldGte: BEACONS[nBeacon].g } });
  if (nStock < 2) ladder.push({ verb: 'BUILD', what: 'stockpile', where: nStock === 0 ? { x: 2, z: -11 } : { x: -2, z: -11 }, when: { goldGte: 170 } });
  orders.push(...ladder);

  orders.push({ verb: 'REPAIR_UNDER', pct: 70 });

  // Income engine: the HarvestSystem channels ~3.33g/s PASSIVELY while the
  // prospector STANDS within channelRange of an active seam (verified:
  // HeadlessContractSim.ts:1490 updates harvest with the prospector as target
  // every sim tick; the HARVEST verb itself hand-pans once per accepted array).
  // So: one hand-pan order, then HOLD AT THE SEAM — never at home.
  const wave = now.wave ?? 0;
  const radius = wave >= 8 ? 20 : 40;
  const seams = (now.seams ?? [])
    .filter((s) => s.active && s.x !== null && s.z <= -5)
    .map((s) => ({ id: s.id, x: s.x, z: s.z, d: Math.hypot(s.x - HOME.x, s.z - HOME.z) }))
    .filter((s) => s.d <= radius)
    .sort((a, b) => a.d - b.d);
  if (seams.length > 0) {
    orders.push({ verb: 'HARVEST', seam: seams[0].id });
    orders.push({ verb: 'HOLD', pos: { x: seams[0].x, z: seams[0].z } });
  } else {
    orders.push({ verb: 'HOLD', pos: HOME });
  }
  return orders;
}

const rl = createInterface({ input: child.stdout });
rl.on('line', (line) => {
  log.write(line + '\n');
  let msg;
  try { msg = JSON.parse(line); } catch { return; }
  if (msg.secured !== undefined && msg.eventLogHash !== undefined && msg.schema === undefined) {
    // Terminal outcome line.
    writeFileSync(`${DIR}/${label}-outcome.json`, JSON.stringify({ outcome: msg, tape: tapePath, sent }, null, 1));
    console.log('OUTCOME ' + JSON.stringify(msg));
    return;
  }
  if (msg.schema !== 'goldrush.view.v1') return;

  let orders;
  if (line === lastLine) {
    // Same view re-served => our last array was rejected. Degrade to minimal legal.
    repeatCount += 1;
    orders = msg.now?.pendingSecure
      ? [{ verb: 'SECURE_CHOICE', choice: 'bank' }]
      : [{ verb: 'HOLD', pos: HOME }];
  } else {
    repeatCount = 0;
    orders = ordersFor(msg);
  }
  lastLine = line;
  const payload = JSON.stringify(orders);
  log.write('>> ' + payload + '\n');
  sent += 1;
  child.stdin.write(payload + '\n');
});

child.on('exit', (code) => {
  log.end();
  console.log(`gr-sim exited ${code}; sent ${sent} arrays; repeats ${repeatCount}`);
});

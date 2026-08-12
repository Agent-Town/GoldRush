import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';

const seed = process.argv[2] ?? 'e1-twin-banks-01';
const sim = spawn(process.execPath, [
  'scripts/gr-sim.mjs',
  '--contract', 'e1-twin-banks',
  '--seed', seed,
], { stdio: ['pipe', 'pipe', 'inherit'] });

const buildSpots = [
  { x: -5, z: -8 },
  { x: 5, z: -8 },
  { x: -5, z: -16 },
  { x: 5, z: -16 },
  { x: 0, z: -22 },
  { x: 0, z: -10 },
];

const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

function costFor(view, id, count) {
  const entry = view.stablePrefix.mechanics.buildables?.find((item) => item.id === id);
  return entry?.costs?.[count] ?? Number.POSITIVE_INFINITY;
}

function occupied(view, spot) {
  return view.now.works.entries.some((entry) => distance(entry.position, spot) < 1.5);
}

function nextBuild(view) {
  const palisades = view.now.works.entries.filter((entry) => entry.id === 'palisade').length;
  const turrets = view.now.works.entries.filter((entry) => entry.id === 'turret').length;
  const beacons = view.now.works.entries.filter((entry) => entry.id === 'sentry_beacon').length;
  const id = palisades < 1
    ? 'palisade'
    : beacons < 1
      ? 'sentry_beacon'
      : turrets < 4
        ? 'turret'
        : beacons < 2 ? 'sentry_beacon' : null;
  if (!id) return null;

  const count = id === 'turret' ? turrets : id === 'sentry_beacon' ? beacons : palisades;
  const cost = costFor(view, id, count);
  if (view.now.gold < cost) return null;
  const actor = view.now.hero;
  const spot = buildSpots
    .filter((candidate) => !occupied(view, candidate))
    .sort((a, b) => distance(actor, a) - distance(actor, b))[0];
  if (!spot) return null;
  return { id, cost, spot };
}

function ordersFor(view) {
  if (view.now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
  if (view.now.pendingOffer?.length) return [{ verb: 'PICK_UPGRADE', id: view.now.pendingOffer[0].id }];

  const orders = [];
  if (view.now.works.wrecked > 0 || view.now.works.entries.some((entry) => entry.hp < entry.maxHp * 0.7)) {
    orders.push({ verb: 'REPAIR_UNDER', pct: 70 });
  }

  if (view.now.wave >= 3 && view.now.weapon !== 'blast') orders.push({ verb: 'SET_WEAPON', weapon: 'blast' });
  if (view.now.threats.alive > 0 && view.now.blastReadyInMs === 0) {
    orders.push({ verb: 'BLAST_AT', pos: { x: view.now.hero.x, z: view.now.hero.z } });
  }

  const build = nextBuild(view);
  if (build) {
    orders.push({ verb: 'MOVE_TO', pos: build.spot });
    orders.push({ verb: 'BUILD', what: build.id, where: build.spot, when: { goldGte: build.cost } });
  }

  const seams = view.now.seams
    .filter((entry) => entry.active)
    .sort((a, b) => b.remaining - a.remaining);
  if (seams.length) {
    for (const seam of seams) orders.push({ verb: 'HARVEST', seam: seam.id });
  } else {
    orders.push({ verb: 'HOLD', pos: view.now.prospector ?? { x: view.now.hero.x, z: view.now.hero.z } });
  }
  return orders;
}

const input = createInterface({ input: sim.stdout, crlfDelay: Infinity });
input.on('line', (line) => {
  if (!line.trim()) return;
  const value = JSON.parse(line);
  if (value.schema === 'goldrush.view.v1') {
    const orders = ordersFor(value);
    if (process.argv[3] === 'debug') {
      process.stderr.write(`view wave=${value.now.wave} gold=${value.now.gold} hp=${value.now.hero.hp} prospector=${JSON.stringify(value.now.prospector)} works=${JSON.stringify(value.now.works.byKind)} standing=${value.now.works.standing} threats=${value.now.threats.alive} orders=${JSON.stringify(orders)}\\n`);
    }
    sim.stdin.write(`${JSON.stringify(orders)}\n`);
  } else if (typeof value.secured === 'boolean') {
    process.stdout.write(`${JSON.stringify(value)}\n`);
  }
});

sim.on('exit', (code) => process.exit(code ?? 0));

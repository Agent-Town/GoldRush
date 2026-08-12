import { spawn } from 'node:child_process';
import readline from 'node:readline';

const contract = 'e1-twin-banks';
const seed = 'e1-twin-banks-01';
let home;

const layout = [
  ['sentry_beacon', -3, 1], ['sentry_beacon', 3, 1],
  ['turret', -3, 4], ['turret', 3, 4],
  ['sentry_beacon', -4, -2], ['sentry_beacon', 4, -2],
  ['turret', -3, -4], ['turret', 3, -4],
  ['palisade', -6, 0], ['palisade', -4, 5], ['palisade', 0, 6], ['palisade', 4, 5], ['palisade', 6, 0],
];

function point(value) {
  return value && Number.isFinite(value.x) && Number.isFinite(value.z)
    ? { x: value.x, z: value.z }
    : undefined;
}

function heroPoint(hero) {
  return point(hero?.pos) ?? point(hero?.position) ?? point(hero);
}

function works(now) {
  return Array.isArray(now.works?.entries) ? now.works.entries : [];
}

function count(entries, id) {
  return entries.filter((entry) => entry.id === id || entry.what === id).length;
}

function buildable(view, id) {
  const roster = view.stablePrefix?.mechanics?.buildables;
  return (Array.isArray(roster) ? roster : Object.values(roster ?? {})).find((entry) => entry.id === id || entry.what === id || entry.key === id);
}

function price(view, id, existing) {
  const costs = buildable(view, id)?.costs;
  return Array.isArray(costs) ? costs[Math.min(existing, costs.length - 1)] : undefined;
}

function nextTarget(entries) {
  const scheduled = {};
  return layout.find(([id]) => (scheduled[id] = (scheduled[id] ?? 0) + 1) > count(entries, id));
}

function plan(view) {
  const now = view.now;
  if (!now) return [];
  home ??= heroPoint(now.hero) ?? point(view.stablePrefix?.heroStart) ?? point(view.stablePrefix?.map?.claim) ?? { x: 0, z: 0 };

  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
  const prefix = now.pendingOffer?.length ? [{ verb: 'PICK_UPGRADE', id: now.pendingOffer[0].id }] : [];

  const entries = works(now);
  const target = nextTarget(entries);
  if (target) {
    const [id, dx, dz] = target;
    const cost = price(view, id, count(entries, id));
    if (Number.isFinite(cost) && now.gold >= cost) {
      return [
        ...prefix,
        { verb: 'SET_WEAPON', weapon: 'rig' },
        { verb: 'MOVE_TO', pos: home },
        { verb: 'BUILD', what: id, where: { x: home.x + dx, z: home.z + dz }, when: { goldGte: cost } },
        { verb: 'HOLD', pos: home },
      ];
    }
  }

  const seamLocations = new Map((view.stablePrefix?.map?.seams ?? []).map((candidate) => [candidate.id, candidate]));
  const seam = (now.seams ?? [])
    .filter((candidate) => candidate.active && candidate.remaining > 0)
    .sort((a, b) => {
      const aPos = seamLocations.get(a.id);
      const bPos = seamLocations.get(b.id);
      return Math.hypot(aPos.x - home.x, aPos.z - home.z) - Math.hypot(bPos.x - home.x, bPos.z - home.z);
    })[0];
  if (seam) {
    const nextCost = target ? price(view, target[0], count(entries, target[0])) : 30;
    return [
      ...prefix,
      { verb: 'SET_WEAPON', weapon: 'rig' },
      ...Array.from({ length: Math.min(Math.ceil(seam.remaining / 5), Math.max(1, Math.ceil((nextCost - now.gold) / 5))) }, () => ({ verb: 'HARVEST', seam: seam.id })),
      { verb: 'HOLD', pos: home },
    ];
  }
  return [...prefix, { verb: 'SET_WEAPON', weapon: 'rig' }, { verb: 'HOLD', pos: home }];
}

const sim = spawn(process.execPath, ['scripts/gr-sim.mjs', '--contract', contract, '--seed', seed], {
  cwd: process.cwd(),
  stdio: ['pipe', 'pipe', 'inherit'],
});
let outcome;
readline.createInterface({ input: sim.stdout }).on('line', (line) => {
  const message = JSON.parse(line);
  if (message.schema === 'goldrush.view.v1') {
    sim.stdin.write(`${JSON.stringify(plan(message))}\n`);
  } else {
    outcome = message;
  }
});
sim.on('close', (code) => console.log(JSON.stringify({ code, outcome })));

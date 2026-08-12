import { spawn } from 'node:child_process';
import readline from 'node:readline';

const count = (entries, id) => entries.filter((entry) => entry.id === id).length;
const homeOf = (view) => view.stablePrefix?.claim?.heroStart ?? view.stablePrefix?.heroStart ?? { x: 0, z: 12 };

function upgrade(offer) {
  return [...offer].sort((a, b) => {
    const score = (item) => /damage|fire rate|cooldown|range|blast/i.test(item.effectText ?? '') ? 1 : 0;
    return score(b) - score(a);
  })[0].id;
}

function ordersFor(view) {
  const now = view.now;
  if (now.pendingOffer) return [{ verb: 'PICK_UPGRADE', id: upgrade(now.pendingOffer) }];
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const home = homeOf(view);
  const entries = now.works?.entries ?? [];
  const beacons = count(entries, 'sentry_beacon');
  const turrets = count(entries, 'turret');
  const plan = [
    ['sentry_beacon', { x: home.x - 3, z: home.z - 1 }],
    ['sentry_beacon', { x: home.x + 3, z: home.z - 1 }],
    ['turret', { x: home.x - 3, z: home.z + 2 }],
    ['turret', { x: home.x + 3, z: home.z + 2 }],
    ['sentry_beacon', { x: home.x - 6, z: home.z - 1 }],
    ['sentry_beacon', { x: home.x + 6, z: home.z - 1 }],
    ['turret', { x: home.x - 6, z: home.z + 2 }],
    ['turret', { x: home.x + 6, z: home.z + 2 }],
  ];
  const next = plan.find(([id], index) => count(entries, id) < plan.slice(0, index + 1).filter(([kind]) => kind === id).length);

  if (next) {
    const [what, where] = next;
    const cost = view.stablePrefix.mechanics.buildables.find((item) => item.id === what)?.costs[(what === 'sentry_beacon' ? beacons : turrets)] ?? Infinity;
    if (now.gold >= cost) return [{ verb: 'SET_WEAPON', weapon: 'blast' }, { verb: 'MOVE_TO', pos: home }, { verb: 'BUILD', what, where, when: { goldGte: cost } }, { verb: 'HOLD', pos: home }];
  }

  const seam = [...(Array.isArray(now.seams) ? now.seams : now.seams?.active ?? [])].sort((a, b) => (b.remaining ?? 0) - (a.remaining ?? 0))[0];
  return seam
    ? [{ verb: 'SET_WEAPON', weapon: 'blast' }, ...Array.from({ length: 6 }, () => ({ verb: 'HARVEST', seam: seam.id })), { verb: 'HOLD', pos: home }]
    : [{ verb: 'SET_WEAPON', weapon: 'blast' }, { verb: 'HOLD', pos: home }];
}

const sim = spawn(process.execPath, ['scripts/gr-sim.mjs', '--contract', 'e1-baron', '--seed', 'e1-baron-01'], {
  stdio: ['pipe', 'pipe', 'pipe'],
});

readline.createInterface({ input: sim.stdout }).on('line', (line) => {
  const view = JSON.parse(line);
  if (view.schema === 'goldrush.view.v1') {
    const orders = ordersFor(view);
    if (process.env.TASK_TRACE) process.stderr.write(`${JSON.stringify({ keys: Object.keys(view.now), wave: view.now.wave, gold: view.now.gold, health: view.now.hero?.health, position: view.now.hero?.pos, works: view.now.works?.entries, seams: view.now.seams, orders })}\n`);
    sim.stdin.write(`${JSON.stringify(orders)}\n`);
  }
  else process.stdout.write(`${line}\n`);
});
sim.stderr.pipe(process.stderr);

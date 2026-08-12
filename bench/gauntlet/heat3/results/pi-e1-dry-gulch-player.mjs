#!/usr/bin/env node
import { spawn } from 'node:child_process';
import readline from 'node:readline';

const contract = 'e1-dry-gulch';
const seed = 'e1-dry-gulch-01';
const child = spawn(process.execPath, ['scripts/gr-sim.mjs', '--contract', contract, '--seed', seed], {
  cwd: new URL('.', import.meta.url),
  stdio: ['pipe', 'pipe', 'pipe'],
});
child.stderr.pipe(process.stderr);
let finalOutcome = null;

const sites = [
  ['palisade', { x: 0, z: 10 }],
  ['turret', { x: -4, z: 10 }], ['turret', { x: 4, z: 10 }],
  ['turret', { x: -4, z: 15 }], ['turret', { x: 4, z: 15 }],
  ['sentry_beacon', { x: 0, z: 7 }], ['sentry_beacon', { x: -5, z: 13 }],
  ['sentry_beacon', { x: 5, z: 13 }], ['sentry_beacon', { x: 0, z: 17 }],
  ['palisade', { x: -2, z: 10 }], ['palisade', { x: 2, z: 10 }],
  ['palisade', { x: -2, z: 14 }], ['palisade', { x: 2, z: 14 }],
];

function ordersFor(view) {
  const { now, stablePrefix } = view;
  if (now.pendingOffer?.length) {
    const preference = ['quick_fuse', 'powder_charge', 'wide_ring', 'tinkers_plating', 'heavy_spark', 'split_spark', 'double_tap_coil', 'long_resonator', 'prospectors_luck', 'pan_legend', 'spring_heels'];
    const pick = preference.map(id => now.pendingOffer.find(o => o.id === id)).find(Boolean) ?? now.pendingOffer[0];
    return [{ verb: 'PICK_UPGRADE', id: pick.id }];
  }
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const orders = [];
  if (now.weapon !== 'blast' && (now.wave >= 4 || now.threats?.alive >= 30)) {
    orders.push({ verb: 'SET_WEAPON', weapon: 'blast' });
  }
  const counts = { ...(now.works?.byKind ?? {}) };
  const desired = sites.find(([kind], index) => {
    const priorSameKind = sites.slice(0, index).filter(([k]) => k === kind).length;
    return (counts[kind] ?? 0) <= priorSameKind;
  });
  if (desired) {
    const [what, where] = desired;
    const rule = stablePrefix.mechanics.buildables.find(buildable => buildable.id === what);
    const cost = rule?.costs?.[counts[what] ?? 0] ?? rule?.cost ?? 1_000_000;
    orders.push({ verb: 'MOVE_TO', pos: where });
    orders.push({ verb: 'BUILD', what, where, when: { goldGte: cost } });
  }

  const claim = stablePrefix.map.claim;
  const hero = now.hero;
  const edge = now.threats?.edge;
  const delta = edge === 'north' ? [0, -8] : edge === 'south' ? [0, 8] : edge === 'east' ? [8, 0] : [-8, 0];
  if (now.weapon === 'rig' && now.threats?.alive > 0 && now.blastReadyInMs === 0) {
    orders.push({ verb: 'BLAST_AT', pos: { x: hero.x + delta[0], z: hero.z + delta[1] } });
  }
  const active = now.seams?.filter(s => s.active && s.remaining > 0) ?? [];
  active.sort((a, b) => {
    const map = new Map(stablePrefix.map.seams.map(s => [s.id, s]));
    const pa = map.get(a.id), pb = map.get(b.id);
    return Math.hypot(pa.x - claim.x, pa.z - claim.z) - Math.hypot(pb.x - claim.x, pb.z - claim.z);
  });
  for (const seam of active) orders.push({ verb: 'HARVEST', seam: seam.id });
  orders.push({ verb: 'FALLBACK_IF', threat: { enemiesGte: 16 }, pos: claim });
  orders.push({ verb: 'HOLD', pos: claim });
  return orders.slice(0, 32);
}

const rl = readline.createInterface({ input: child.stdout });
rl.on('line', line => {
  let value;
  try { value = JSON.parse(line); } catch { return; }
  if (value?.schema === 'goldrush.view.v1') {
    child.stdin.write(`${JSON.stringify(ordersFor(value))}\n`);
  } else if (typeof value?.secured === 'boolean') {
    finalOutcome = value;
    process.stdout.write(`${JSON.stringify(value)}\n`);
  }
});
child.on('exit', code => {
  if (code !== 0 || !finalOutcome) process.exitCode = code || 1;
});

import { appendFileSync, writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';

const [contract, seed, tape] = process.argv.slice(2);
if (!contract || !seed || !tape) throw new Error('usage: rider-auto.mjs contract seed tape');
const logPath = `${tape}.jsonl`;
writeFileSync(logPath, '');
const state = { bad: new Set(), turns: 0 };
const child = spawn('node', ['scripts/gr-sim.mjs', '--contract', contract, '--seed', seed, '--tape', tape], {
  cwd: '/tmp/heat2-b42c0fbc', stdio: ['pipe', 'pipe', 'pipe'],
});
child.stderr.on('data', (b) => appendFileSync(logPath, JSON.stringify({ stderr: String(b) }) + '\n'));

function key(p) { return `${Math.round(p.x * 10) / 10},${Math.round(p.z * 10) / 10}`; }
function orderPlan(view) {
  const now = view.now;
  const claim = view.stablePrefix.map.claim;
  const out = [];
  if (now.pendingOffer?.length) {
    const pick = now.pendingOffer.find((o) => /split_spark|double_tap_coil|heavy_spark|long_resonator|tinkers_plating/.test(o.id));
    return [{ verb: 'PICK_UPGRADE', id: (pick ?? now.pendingOffer[0]).id }];
  }
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
  if (contract === 'e1-baron') out.push({ verb: 'SET_WEAPON', weapon: 'blast' });
  const isPressure = view.stablePrefix.mechanics.buildables.some((b) => b.id === 'boiler_house');
  const seams = (now.seams ?? []).filter((s) => s.active && s.remaining >= 5);
  for (const seam of seams) {
    const n = Math.min(['e1-twin-banks', 'e1-baron', 'e2-hill-mine'].includes(contract) ? 4 : 2, Math.floor(seam.remaining / 5));
    for (let i = 0; i < n && out.length < 12; i++) out.push({ verb: 'HARVEST', seam: seam.id });
  }
  const entries = now.works.entries ?? [];
  const has = (p) => entries.some((e) => Math.hypot(e.position.x - p.x, e.position.z - p.z) < 1.5);
  const buildables = new Set(view.stablePrefix.mechanics.buildables.map((b) => b.id));
  const candidates = [];
  const add = (what, p, cost) => {
    if (buildables.has(what) && !state.bad.has(`${what}:${key(p)}`) && !has(p) && !candidates.some((c) => c.what === what && key(c.p) === key(p))) candidates.push({ what, p, cost });
  };
  if (contract === 'e1-dry-gulch') add('sluice', { x: claim.x, z: claim.z }, 40);
  if (contract === 'e1-night-shift') {
    add('lantern_post', { x: claim.x, z: claim.z + 8 }, 15);
    add('lantern_post', { x: claim.x - 10, z: claim.z }, 15);
    add('lantern_post', { x: claim.x + 10, z: claim.z }, 15);
  }
  if (contract === 'e1-twin-banks') {
    add('turret', { x: claim.x, z: claim.z + 24 }, 50);
    add('palisade', { x: claim.x - 6, z: claim.z + 24 }, 10);
    add('palisade', { x: claim.x + 6, z: claim.z + 24 }, 10);
  }
  if (isPressure) {
    add('palisade', { x: claim.x - 6, z: claim.z }, 10);
    add('palisade', { x: claim.x + 6, z: claim.z }, 10);
    add('boiler_house', { x: claim.x, z: claim.z }, 70);
  }
  add('turret', { x: claim.x, z: claim.z + 5 }, 50);
  add('sentry_beacon', { x: claim.x, z: claim.z + 5 }, 25);
  add('palisade', { x: claim.x - 6, z: claim.z }, 10);
  add('palisade', { x: claim.x + 6, z: claim.z }, 10);
  if (contract === 'e1-baron') {
    add('palisade', { x: claim.x - 8, z: claim.z }, 10);
    add('palisade', { x: claim.x + 8, z: claim.z }, 10);
  }
  add('turret', { x: claim.x - 4, z: claim.z - 4 }, 50);
  add('turret', { x: claim.x + 4, z: claim.z - 4 }, 70);
  for (const b of candidates) {
    out.push({ verb: 'MOVE_TO', pos: b.p });
    out.push({ verb: 'BUILD', what: b.what, where: b.p, when: { goldGte: b.cost } });
  }
  if (entries.some((e) => e.hp < e.maxHp)) out.push({ verb: 'MOVE_TO', pos: claim }, { verb: 'REPAIR_UNDER', pct: 70 });
  if (now.threats.alive > 0 && now.blastReadyInMs === 0) out.push({ verb: 'MOVE_TO', pos: claim }, { verb: 'BLAST_AT', pos: claim });
  out.push({ verb: 'MOVE_TO', pos: claim }, { verb: 'HOLD', pos: claim });
  return out.slice(0, 32);
}

const out = createInterface({ input: child.stdout });
out.on('line', (line) => {
  appendFileSync(logPath, line + '\n');
  let view;
  try { view = JSON.parse(line); } catch { return; }
  if (view.schema === 'goldrush.view.v1') {
    for (const o of view.now.orders ?? []) {
      if (o.status === 'failed' && o.order?.verb === 'BUILD' && o.order.where) state.bad.add(`${o.order.what}:${key(o.order.where)}`);
    }
    state.turns++;
    const orders = orderPlan(view);
    process.stdout.write(JSON.stringify({ turn: state.turns, wave: view.now.wave, hp: view.now.hero.hp, gold: view.now.gold, standing: view.now.works.standing, threats: view.now.threats.alive, orders: orders.length }) + '\n');
    child.stdin.write(JSON.stringify(orders) + '\n');
  } else if (Object.hasOwn(view, 'secured')) {
    process.stdout.write(JSON.stringify({ outcome: view }) + '\n');
  }
});
child.on('close', (code, signal) => {
  process.stdout.write(JSON.stringify({ closed: { code, signal }, tape, logPath }) + '\n');
  process.exitCode = code ?? 1;
});

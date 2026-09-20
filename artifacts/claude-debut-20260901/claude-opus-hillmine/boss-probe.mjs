#!/usr/bin/env node
/**
 * READ-ONLY diagnostic. Boots HeadlessContractSim in-process exactly as scripts/gr-sim.mjs does,
 * drives it with the SAME standing-order arrays the rider would send, and prints the railcar's
 * per-component HP each turn. It answers one question the public view cannot: do the turrets ever
 * actually damage the boss, or do they only ever shoot trash?
 *
 * This is analysis, not a ride. No tape is produced and nothing here is submitted.
 */
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';

const location = new URL('http://gr-sim.local/');
location.searchParams.set('debug', '');
location.searchParams.set('contract', 'e2-hill-mine');
location.searchParams.set('seed', process.argv[2] ?? 'e2-hill-mine-01');
globalThis.location = location;
globalThis.window = { location };
const orig = { log: console.log, info: console.info, debug: console.debug };
console.log = console.info = console.debug = () => undefined;

const root = fileURLToPath(new URL('../..', import.meta.url));
const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
const sim = new HeadlessContractSim({ contractId: 'e2-hill-mine', seed: process.argv[2] ?? 'e2-hill-mine-01' });
Object.assign(console, orig);

const TURRETS = (process.argv[3] ?? '-10,-5,5,10').split(',').map((x) => ({ x: Number(x), z: 8 }));
const PREF = ['prospectors_luck', 'pan_legend', 'powder_charge', 'quick_fuse', 'tinkers_plating',
  'wide_ring', 'beacon_dynamo', 'assay_bonus', 'field_dressing'];
const COST = [50, 70, 95, 125];

function plan(view) {
  const n = view.now;
  const out = [];
  if (n.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
  if (n.pendingOffer?.length) {
    const ids = n.pendingOffer.map((o) => o.id);
    out.push({ verb: 'PICK_UPGRADE', id: PREF.find((i) => ids.includes(i)) ?? ids[0] });
  }
  out.push({ verb: 'SET_WEAPON', weapon: n.wave >= 3 ? 'blast' : 'rig' });
  const nT = (n.works?.entries ?? []).filter((e) => e.id === 'turret').length;
  for (let i = nT; i < 4; i += 1) out.push({ verb: 'BUILD', what: 'turret', where: TURRETS[i], when: { goldGte: COST[i] } });
  const dmg = (n.works?.entries ?? []).filter((e) => e.wrecked || e.hp < e.maxHp).length;
  if (n.gold >= 25) for (let i = 0; i < Math.min(dmg, 6); i += 1) out.push({ verb: 'REPAIR_UNDER', pct: 90 });
  const seams = (n.seams ?? []).filter((s) => s.active && s.x !== null);
  let budget = 30 - out.length;
  for (let p = 0; p < 3 && budget > 0; p += 1) {
    for (const s of seams) {
      const k = Math.min(p === 0 ? 10 : 6, budget);
      for (let i = 0; i < k; i += 1) out.push({ verb: 'HARVEST', seam: s.id });
      budget -= k;
    }
  }
  out.push({ verb: 'HOLD', pos: { x: seams[0]?.x ?? -14, z: seams[0]?.z ?? 20 } });
  return out.slice(0, 32);
}

const bossRows = () => (sim.enemies?.all ?? [])
  .filter((e) => e.isAlive && e.bossGroupId)
  .map((e) => `${e.bossComponentId}=${Math.round(e.currentHp)}@${e.position.x.toFixed(0)}`);

let turn = sim.currentTurn();
let lastSeen = null;
const ceiling = 18;
while (!turn.terminal) {
  if (turn.view.now.wave >= ceiling) break;
  sim.submitOrders(plan(turn.view));
  turn = sim.advanceToTurn();
  const rows = bossRows();
  if (rows.length) {
    const line = `w${turn.view.now.wave} t=${turn.view.now.timers.runSeconds}s BOSS ${rows.join(' ')}`;
    if (line !== lastSeen) { console.log(line); lastSeen = line; }
  }
}
console.log('END', JSON.stringify({ wave: turn.view.now.wave, dead: sim.dead, boss: bossRows() }));
await vite.close();
process.exit(0);

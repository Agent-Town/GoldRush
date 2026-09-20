#!/usr/bin/env node
// Canyon Works controller — Claude Opus 5, generation 12.
// Objective chain (read from src/sim/HeadlessContractSim.ts):
//   autoSecureWaveForRun = MAX_SAFE_INTEGER while (baron && !baronBeaten) || (powerGrid.connect && !connectCompletedByDeadline)
//   => must (a) power BOTH galleries while wave <= 6, and (b) kill the Rival Dynamo Crawler (wave 14).
//   syncContractPowerGrid: a pylon relay is online only while a standing unwrecked sentry_beacon
//   sits within 2.5wu of its site. Six sites, six beacons (maxCount 6), costs 25/35/45/55/75/95 = 330g.
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const TAPE = opt('--tape', '/tmp/heat11-5e7a7c0b/artifacts/heat11/opus/e3-canyon-works/tune.json');
const PLAN = opt('--plan', 'A');
const PALISADES = Number(opt('--palisades', '0'));

const SITES = {
  wrim: { x: -28, z: 8 }, erim: { x: 28, z: 8 },
  wswitch: { x: -24, z: -20 }, eswitch: { x: 24, z: -20 },
  wbase: { x: -12, z: -36 }, ebase: { x: 12, z: -36 },
};
// Batch 1 must be the first FOUR purchases (25+35+45+55=160 <= 200 bank cap);
// batch 2 the last two (75+95=170). No other split fits the cap.
const PLANS = {
  A: [['wrim', 'wswitch', 'wbase', 'ebase'], ['eswitch', 'erim']],
  B: [['wrim', 'erim', 'wswitch', 'eswitch'], ['wbase', 'ebase']],
  C: [['wrim', 'wswitch', 'eswitch', 'erim'], ['wbase', 'ebase']],
};
const PRICES = [25, 35, 45, 55, 75, 95];
const UPGRADE_RANK = ['tinkers_plating', 'heavy_spark', 'split_spark', 'quick_hands', 'long_resonator'];

const child = spawn('node', ['scripts/gr-sim.mjs', '--contract', 'e3-canyon-works',
  '--seed', 'e3-canyon-works-01', '--tape', TAPE], { cwd: '/tmp/heat11-5e7a7c0b', stdio: ['pipe', 'pipe', 'pipe'] });

let buf = '';
let outcome = null;
const log = [];
child.stderr.on('data', (d) => { const s = String(d); if (/rejected|error/i.test(s)) log.push('STDERR ' + s.trim().slice(0, 300)); });

function built(now) {
  const done = new Set();
  for (const e of (now.works?.entries ?? [])) {
    if (e.id !== 'sentry_beacon' || e.wrecked || e.hp <= 0) continue;
    for (const [k, s] of Object.entries(SITES)) {
      if (Math.hypot(e.position.x - s.x, e.position.z - s.z) <= 2.5) done.add(k);
    }
  }
  return done;
}

function orders(view) {
  const now = view.now;
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
  const out = [];
  if (now.pendingOffer?.length) {
    const ids = now.pendingOffer.map((o) => o.id);
    const pick = UPGRADE_RANK.find((id) => ids.includes(id)) ?? ids[0];
    out.push({ verb: 'PICK_UPGRADE', id: pick });
  }
  const done = built(now);
  const bought = done.size;
  // cheap chaff first: palisades are RouteBlockers and the hero is a fixed gun on the stake
  if (PALISADES > 0) {
    const ring = [[-5, -38], [5, -38], [0, -37], [-8, -42], [8, -42], [-3, -50], [3, -50], [0, -51]];
    for (let i = 0; i < Math.min(PALISADES, ring.length); i++) {
      out.push({ verb: 'BUILD', what: 'palisade', where: { x: ring[i][0], z: ring[i][1] }, when: { goldGte: 10 } });
    }
  }
  // remaining sites in plan order, skipping ones already standing
  const flat = [...PLANS[PLAN][0], ...PLANS[PLAN][1]].filter((k) => !done.has(k));
  const batches = [];
  if (flat.length) {
    const b1 = flat.slice(0, Math.max(0, 4 - bought));
    const b2 = flat.slice(b1.length);
    if (b1.length) batches.push(b1);
    if (b2.length) batches.push(b2);
  }
  let idx = bought;
  for (const batch of batches) {
    // suffix-sum gating: the batch only opens when its whole cost is banked,
    // then each rung is affordable the instant the previous one is paid.
    const costs = batch.map((_, i) => PRICES[Math.min(PRICES.length - 1, idx + i)]);
    for (let i = 0; i < batch.length; i++) {
      const need = costs.slice(i).reduce((a, b) => a + b, 0);
      const s = SITES[batch[i]];
      out.push({ verb: 'BUILD', what: 'sentry_beacon', where: { x: s.x, z: s.z }, when: { goldGte: need } });
    }
    idx += batch.length;
  }
  // cheap chaff around the stake once the grid is paid for
  if (PALISADES > 0 && done.size >= 6) {
    const ring = [[-6, -38], [6, -38], [0, -36], [-9, -42], [9, -42], [-4, -50], [4, -50]];
    for (let i = 0; i < Math.min(PALISADES, ring.length); i++) {
      out.push({ verb: 'BUILD', what: 'palisade', where: { x: ring[i][0], z: ring[i][1] }, when: { goldGte: 10 } });
    }
  }
  // pan: alternate the live seams so a depleted one never eats the tail of the array
  const live = (now.seams ?? []).filter((s) => s.active && s.x !== null);
  if (live.length) {
    const slots = 32 - out.length;
    for (let i = 0; i < slots; i++) out.push({ verb: 'HARVEST', seam: live[i % live.length].id });
  }
  return out.slice(0, 32);
}

let views = 0;
child.stdout.on('data', (chunk) => {
  buf += chunk;
  let nl;
  while ((nl = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, nl); buf = buf.slice(nl + 1);
    if (!line.trim()) continue;
    let msg; try { msg = JSON.parse(line); } catch { continue; }
    if (msg.schema === 'goldrush.view.v1') {
      views++;
      const n = msg.now;
      log.push(`w${n.wave} t=${n.timers.runSeconds.toFixed(1)} gold=${n.gold} hero=${n.hero.hp}/${n.hero.maxHp} lvl=${n.hero.level} beacons=${built(n).size} connect=${JSON.stringify(n.canyonConnect)} alive=${n.threats.alive} works=${n.works.standing}/${n.works.standing + n.works.wrecked}`);
      child.stdin.write(JSON.stringify(orders(msg)) + '\n');
    } else if (msg.secured !== undefined) {
      outcome = msg;
    }
  }
});

child.on('close', () => {
  const summary = { outcome, views, log };
  fs.writeFileSync(TAPE.replace(/\.json$/, '-log.json'), JSON.stringify(summary, null, 1));
  console.log(log.join('\n'));
  console.log('OUTCOME ' + JSON.stringify(outcome));
});

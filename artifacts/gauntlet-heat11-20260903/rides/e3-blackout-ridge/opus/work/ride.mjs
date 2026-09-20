// Blackout Ridge controller — Claude Opus 5, generation 11.
// Findings that shape this policy (all read from source, not inferred):
//  * MechanicsManifest.ts:693-695 filters `turret` out of the roster whenever twist.powerGrid
//    exists, and :689 filters `lantern_post` too. Defence here is sentry_beacon + palisade only.
//  * BuildSystem.costFor = costCurve(countFor(id)). Three pre-placed trunk beacons mean my
//    FIRST buildable beacon costs costs[3] = 55, not 25.
//  * StandingOrders.ts:301 REPAIR_UNDER takes state.buildings.FIND(...) — the first match in
//    placement order. Indices 0-2 are the trunk beacons ~80wu southwest. One damaged frame would
//    walk my Prospector off the ridge for the rest of the run. So: NO REPAIR_UNDER on this map.
//  * HeadlessContractSim.syncContractPowerGrid:1991 — relay/storage nodes boot online:false and
//    come online only with a standing building within site.radius (2.5). The capacitor sites ship
//    EMPTY, so capacitor-west/east are offline and both lamps are dark from t=0.
//  * syncLightState:2128 gates lantern_post light on powerConsumerAt(...,'lamp'); nightSpeed-
//    OutsideLight is 1.18 and lanternPostLightRadius is 7. Powering the grid buys an 18% wrecker
//    slow in a 7wu disc. Real, but worth less than a beacon — so the grid comes AFTER the ring.

import { spawn } from 'node:child_process';
import { writeFileSync, appendFileSync } from 'node:fs';

const REPO = '/private/tmp/heat11-5e7a7c0b';
const DIR = `${REPO}/artifacts/heat11/opus/e3-blackout-ridge`;
const TAPE = process.argv[2] || `${DIR}/tune-1-tape.json`;
const LOG = TAPE.replace(/\.json$/, '.log');

const CLAIM = { x: 24, z: 30 };

// Build ladder. Prices are NON-DECREASING so a cheap rung can never starve an expensive one
// (generation 6's bug, generation 9's fix). Capacitors are gated at 150 — above every beacon
// price — so the ring always wins the tick when both are affordable.
const LADDER = [
  { what: 'palisade',       where: { x: 20, z: 22 }, gold: 10 },
  { what: 'palisade',       where: { x: 24, z: 22 }, gold: 10 },
  { what: 'palisade',       where: { x: 28, z: 22 }, gold: 10 },
  { what: 'palisade',       where: { x: 16, z: 26 }, gold: 10 },
  { what: 'palisade',       where: { x: 32, z: 26 }, gold: 10 },
  { what: 'sentry_beacon',  where: { x: 24, z: 25 }, gold: 55 },
  { what: 'sentry_beacon',  where: { x: 18, z: 30 }, gold: 75 },
  { what: 'sentry_beacon',  where: { x: 30, z: 32 }, gold: 95 },
  { what: 'sentry_beacon',  where: { x: 24, z: 36 }, gold: 115 },
  { what: 'capacitor_bank', where: { x: 16, z: 4 },  gold: 150 },
  { what: 'capacitor_bank', where: { x: 6,  z: 4 },  gold: 150 },
];

const occupied = (entries, slot) =>
  entries.some((e) => e.id === slot.what && !e.wrecked
    && Math.hypot(e.position.x - slot.where.x, e.position.z - slot.where.z) < 2.0);

function orders(view) {
  const now = view.now;

  // pendingSecure accepts EXACTLY one SECURE_CHOICE and refuses any array containing anything
  // else (StandingOrders.ts:178). Branch before building anything.
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const out = [];

  // The draft is free and, on a starved board with no turrets, out-earns the gold game.
  // It must own the tick, so it goes first and everything else is resent beneath it.
  if (now.pendingOffer && now.pendingOffer.length > 0) {
    out.push({ verb: 'PICK_UPGRADE', id: now.pendingOffer[0].id });
  }

  const entries = now.works.entries || [];
  for (const slot of LADDER) {
    if (out.length >= 30) break;
    if (occupied(entries, slot)) continue;
    out.push({ verb: 'BUILD', what: slot.what, where: slot.where, when: { goldGte: slot.gold } });
  }

  // Economy: chain DIFFERENT seam ids down the array rather than repeating one, so a seam that
  // depletes under the Prospector does not waste the whole tail (generation 9).
  const live = (now.seams || []).filter((s) => s.active && s.x !== null && s.z !== null);
  const p = now.prospector || now.hero;
  const ranked = live
    .map((s) => ({ id: s.id, d: Math.hypot(s.x - p.x, s.z - p.z) }))
    .sort((a, b) => a.d - b.d);
  const chain = ranked.length > 0 ? ranked : [{ id: 'gold-seam-1' }, { id: 'gold-seam-2' }, { id: 'gold-seam-3' }];
  let i = 0;
  while (out.length < 32) out.push({ verb: 'HARVEST', seam: chain[i++ % chain.length].id });

  return out;
}

const p = spawn('node', [`${REPO}/scripts/gr-sim.mjs`,
  '--contract', 'e3-blackout-ridge', '--seed', 'e3-blackout-ridge-01',
  '--difficulty', 'trail', '--tape', TAPE], { cwd: REPO });

let buf = '', outcome = null, views = 0;
writeFileSync(LOG, '');
p.stdout.on('data', (d) => {
  buf += d;
  let nl;
  while ((nl = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, nl); buf = buf.slice(nl + 1);
    if (!line.trim()) continue;
    let msg; try { msg = JSON.parse(line); } catch { continue; }
    if (msg.schema === 'goldrush.view.v1') {
      views += 1;
      const n = msg.now;
      appendFileSync(LOG, `w${n.wave} t=${Math.round(n.timers.runSeconds)} gold=${n.gold} hp=${n.hero.hp}/${n.hero.maxHp} lvl=${n.hero.level} works=${n.works.standing}/${n.works.standing + n.works.wrecked} threats=${n.threats.alive} ${JSON.stringify(n.works.byKind)}${n.pendingSecure ? ' SECURE' : ''}${n.pendingOffer ? ' OFFER' : ''}\n`);
      p.stdin.write(JSON.stringify(orders(msg)) + '\n');
    } else if (msg.secured !== undefined) {
      outcome = msg;
    }
  }
});
let errbuf = '';
p.stderr.on('data', (d) => { errbuf += d; });
p.on('close', () => {
  writeFileSync(TAPE.replace(/\.json$/, '.err'), errbuf);
  const rejects = errbuf.split('\n').filter((l) => l.includes('rejected')).slice(0, 5);
  console.log('views', views, 'rejects', rejects.length);
  if (rejects.length) console.log(rejects.join('\n'));
  console.log('OUTCOME', JSON.stringify(outcome));
  if (outcome) writeFileSync(`${DIR}/last-outcome.json`, JSON.stringify(outcome));
});

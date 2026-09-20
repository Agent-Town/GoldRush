#!/usr/bin/env node
// gen-11 controller for e3-blackout-ridge (trail). Fixed hero at (24,30); no turrets on this
// board; REPAIR_UNDER forbidden (first-match selection would walk the Prospector to the wrecked
// trunk frames 60wu SW). Guns: hero auto-blast + 3 fort sentry beacons. Palisades are the
// repair substitute. Income: channel at the three NE seams.
import { spawn } from 'node:child_process';
import { writeFileSync, appendFileSync } from 'node:fs';

const [contract, seed, tapePath, logPath] = process.argv.slice(2);
if (!contract || !seed || !tapePath) {
  console.error('usage: controller.mjs <contract> <seed> <tapePath> [logPath]');
  process.exit(2);
}
const log = (line) => { if (logPath) appendFileSync(logPath, line + '\n'); };
if (logPath) writeFileSync(logPath, `# ride ${contract} ${seed} -> ${tapePath}\n`);

const HOME = { x: 24, z: 30 };
const BEACONS = [ { x: 28, z: 30 }, { x: 20, z: 30 }, { x: 24, z: 34 } ];
const PALISADES = [ { x: 22, z: 35 }, { x: 26, z: 35 } ];
const SEAM_PROBE = {
  // out-of-zone drain-alarm sites adjacent to each seam anchor (gen-9/10 lever)
  '8,30': { x: 7, z: 30 },
  '30,26': { x: 35.8, z: 26 },
  '18,34': { x: 18, z: 40.5 },
};
const UPGRADE_RANK = [
  /tinkers_plating/,
  /powder_charge|wide_ring|heavy_spark|split_spark|quick_fuse|double_tap_coil|long_resonator/,
  /beacon_dynamo/,
  /prospectors_luck/,
];

const sim = spawn('node', ['scripts/gr-sim.mjs', '--contract', contract, '--seed', seed, '--tape', tapePath], {
  cwd: process.cwd(), stdio: ['pipe', 'pipe', 'pipe'],
});
sim.stderr.on('data', (d) => log('STDERR ' + String(d).trim().split('\n').join('\nSTDERR ')));

let buffer = '';
let lastSimMs = -1;
let stuckCount = 0;
let currentSeam = null;
let beaconPriceIdx = null; // adaptive price index into costs[]
let beaconCosts = [25, 35, 45, 55, 75, 95];
let outcome = null;

const near = (a, b, eps = 1.5) => Math.hypot(a.x - b.x, a.z - b.z) <= eps;

function pickUpgrade(offer) {
  for (const rank of UPGRADE_RANK) {
    const hit = offer.find((o) => rank.test(o.id));
    if (hit) return hit.id;
  }
  return offer[0].id;
}

function planOrders(view) {
  const now = view.now;
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const orders = [];
  if (now.pendingOffer?.length) orders.push({ verb: 'PICK_UPGRADE', id: pickUpgrade(now.pendingOffer) });
  if (now.weapon !== 'blast') orders.push({ verb: 'SET_WEAPON', weapon: 'blast' });

  const entries = now.works?.entries ?? [];
  const standing = entries.filter((e) => !e.wrecked && (e.hp ?? 1) > 0);
  // fort-local works only (trunk frames live in the far SW; never count or touch them)
  const fortBeacons = standing.filter((e) => e.id === 'sentry_beacon' && e.position && e.position.z > 15);
  const fortPalisades = standing.filter((e) => e.id === 'palisade');
  // instance price index: every beacon on the board (standing or wrecked) occupies a slot
  const allBeaconCount = entries.filter((e) => e.id === 'sentry_beacon').length || 3;
  const costs = beaconCosts;
  const idx = Math.min(Math.max(3, allBeaconCount), costs.length - 1);

  // palisade wall: keep both posts standing (10g each, replace-on-death)
  for (const spot of PALISADES) {
    if (!fortPalisades.some((e) => near(e.position, spot))) {
      orders.push({ verb: 'BUILD', what: 'palisade', where: spot, when: { goldGte: 10 } });
    }
  }
  // beacon ladder by inclusion: only the next unbuilt pad rides in the set
  const missing = BEACONS.filter((spot) => !fortBeacons.some((e) => near(e.position, spot)));
  if (missing.length && idx < costs.length) {
    orders.push({ verb: 'BUILD', what: 'sentry_beacon', where: missing[0], when: { goldGte: costs[idx] } });
  }

  // seam choice: keep current while active with gold left, else nearest active to prospector
  const seams = (now.seams ?? []).filter((s) => s.active && s.remaining > 0);
  const pos = now.prospector ?? HOME;
  let seam = currentSeam ? seams.find((s) => s.id === currentSeam) : null;
  if (!seam) {
    seam = seams.slice().sort((a, b) => Math.hypot(a.x - pos.x, a.z - pos.z) - Math.hypot(b.x - pos.x, b.z - pos.z))[0] ?? null;
  }
  currentSeam = seam?.id ?? null;

  // drain-alarm probe: fails the instant the held seam drains -> mid-wave view
  if (seam) {
    const probe = SEAM_PROBE[`${seam.x},${seam.z}`];
    if (probe) {
      const gate = Math.max(1, Math.floor((now.gold ?? 0) + Math.min(12, seam.remaining)));
      orders.push({ verb: 'BUILD', what: 'palisade', where: probe, when: { goldGte: gate } });
    }
    orders.push({ verb: 'HARVEST', seam: seam.id });
    orders.push({ verb: 'HOLD', pos: { x: seam.x, z: seam.z } });
  } else {
    orders.push({ verb: 'HOLD', pos: HOME });
  }
  return orders;
}

function handleLine(line) {
  let msg;
  try { msg = JSON.parse(line); } catch { log('UNPARSED ' + line.slice(0, 200)); return; }
  if (typeof msg.secured === 'boolean' && msg.eventLogHash) {
    outcome = msg;
    log('OUTCOME ' + JSON.stringify(msg));
    console.log(JSON.stringify(msg));
    sim.stdin.end();
    return;
  }
  if (msg.schema !== 'goldrush.view.v1') { log('SKIP ' + line.slice(0, 120)); return; }
  const now = msg.now;
  const simMs = now?.timers?.runSeconds ?? -2;
  if (simMs === lastSimMs) stuckCount += 1; else { stuckCount = 0; lastSimMs = simMs; }

  const hp = now?.hero ? `${now.hero.hp}/${now.hero.maxHp}` : '?';
  const lastWave = (msg.appendLog ?? []).at(-1);
  log(`VIEW w${now?.wave} t${simMs} gold${now?.gold} hero${hp} alive${now?.threats?.alive ?? '?'} seam${currentSeam} stuck${stuckCount}`
    + (lastWave ? ` | w${lastWave.wave} ${lastWave.outcome} kills${lastWave.kills} surprises${JSON.stringify(lastWave.surprises ?? [])}` : ''));

  let orders;
  if (stuckCount >= 3) {
    orders = now?.pendingSecure ? [{ verb: 'SECURE_CHOICE', choice: 'bank' }] : [{ verb: 'HOLD', pos: HOME }];
    log('DEGRADE minimal array');
  } else {
    orders = planOrders(msg);
  }
  log('SEND ' + JSON.stringify(orders));
  sim.stdin.write(JSON.stringify(orders) + '\n');
}

sim.stdout.on('data', (d) => {
  buffer += d;
  let nl;
  while ((nl = buffer.indexOf('\n')) >= 0) {
    const line = buffer.slice(0, nl).trim();
    buffer = buffer.slice(nl + 1);
    if (line) handleLine(line);
  }
});
sim.on('close', (code) => {
  log(`CLOSE code=${code} secured=${outcome?.secured}`);
  process.exit(outcome ? (outcome.secured ? 0 : 1) : 3);
});

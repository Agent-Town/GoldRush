#!/usr/bin/env node
// e1-drill-yard controller — Claude Fable 5, heat 11, generation 5.
// Purpose: an honest active ride of the practice yard. Survive to the wave ceiling,
// pan the river, build what the purse allows, take every upgrade, and SECURE the
// instant a pendingSecure boundary ever appears. Once per ride, probe a lone
// SECURE_CHOICE array to record the county's refusal on stderr (rejected
// submissions never enter the tape, so determinism holds).
//
// Usage: node controller.mjs <tape-path> <log-path>

import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { appendFileSync, writeFileSync } from 'node:fs';

const tapePath = process.argv[2] ?? 'artifacts/heat11/fable/e1-drill-yard/tune-tape.json';
const logPath = process.argv[3] ?? 'artifacts/heat11/fable/e1-drill-yard/tune-log.txt';
writeFileSync(logPath, '');
const log = (line) => appendFileSync(logPath, line + '\n');

const sim = spawn('node', [
  'scripts/gr-sim.mjs',
  '--contract', 'e1-drill-yard',
  '--seed', 'gold-rush',
  '--tape', tapePath,
], { cwd: '/private/tmp/heat11-5e7a7c0b', stdio: ['pipe', 'pipe', 'pipe'] });

sim.stderr.on('data', (chunk) => log('STDERR: ' + String(chunk).trim()));

// The standing order set. REPLACE semantics: resend whole set every submission.
// Hero: fall back across the river when the pack builds, hold the west bank otherwise —
// the walk is the kite, the rig fires the whole way. Prospector: pan the nearest seam.
// One turret at the west bank hold point once the pan purse reaches 50.
const standingSet = () => ([
  { verb: 'HARVEST', seam: 'gold-seam-2' },
  { verb: 'BUILD', what: 'turret', where: { x: -4, z: 9 }, when: { goldGte: 50 } },
  { verb: 'FALLBACK_IF', threat: { enemiesGte: 5 }, pos: { x: 12, z: -2 } },
  { verb: 'HOLD', pos: { x: -6, z: 9 } },
]);

let securedProbeSent = false;
let outcome = null;

const send = (orders) => {
  const line = JSON.stringify(orders);
  log('SENT: ' + line);
  sim.stdin.write(line + '\n');
};

const rl = createInterface({ input: sim.stdout });
rl.on('line', (line) => {
  let msg;
  try { msg = JSON.parse(line); } catch { log('UNPARSED: ' + line); return; }

  if (msg.schema !== 'goldrush.view.v1') {
    // terminal outcome line
    outcome = msg;
    log('OUTCOME: ' + line);
    return;
  }

  const now = msg.now ?? {};
  log(`VIEW wave=${now.wave} t=${now.timers?.runSeconds} gold=${now.gold} heroHp=${now.hero?.hp} alive=${now.threats?.alive}`
    + ` pendingSecure=${JSON.stringify(now.pendingSecure ?? null)} pendingOffer=${(now.pendingOffer ?? []).map(o => o.id).join(',') || 'none'}`);

  // If the county ever opens the secure boundary, bank immediately. This wins the ride.
  if (now.pendingSecure) {
    send([{ verb: 'SECURE_CHOICE', choice: 'bank' }]);
    return;
  }

  // Once, after wave 1 exists, probe a lone SECURE_CHOICE to record the refusal.
  if (!securedProbeSent && (now.wave ?? 0) >= 1) {
    securedProbeSent = true;
    send([{ verb: 'SECURE_CHOICE', choice: 'bank' }]);
    // Follow with the real standing set shortly after; the refusal leaves prior
    // orders in force, and an accepted lone order would be replaced right here.
    setTimeout(() => {
      const set = standingSet();
      if (now.pendingOffer?.length) {
        const pick = now.pendingOffer.find(o => o.id === 'double_tap_coil') ?? now.pendingOffer[0];
        set.unshift({ verb: 'PICK_UPGRADE', id: pick.id });
      }
      send(set);
    }, 300);
    return;
  }

  const set = standingSet();
  if (now.pendingOffer?.length) {
    const pick = now.pendingOffer.find(o => o.id === 'double_tap_coil') ?? now.pendingOffer[0];
    set.unshift({ verb: 'PICK_UPGRADE', id: pick.id });
  }
  send(set);
});

sim.on('close', (code) => {
  log('CLOSE code=' + code);
  if (outcome) {
    console.log(JSON.stringify(outcome));
  } else {
    console.log('NO-OUTCOME');
    process.exitCode = 1;
  }
});

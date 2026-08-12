#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';

const positions = {
  sentry_beacon: [
    { x: 0, z: 13 },
    { x: 0, z: 11 },
    { x: 3, z: 12 },
    { x: -3, z: 12 },
    { x: 0, z: 15 },
    { x: 0, z: 9 },
  ],
  turret: [
    { x: 4, z: 14 },
    { x: -4, z: 14 },
    { x: 4, z: 10 },
    { x: -4, z: 10 },
  ],
};

const costs = {
  sentry_beacon: [25, 35, 45, 55, 75, 95],
  turret: [50, 70, 95, 125],
};

function ordersFor(view) {
  if (view.now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
  if (view.now.pendingOffer?.[0]) return [{ verb: 'PICK_UPGRADE', id: view.now.pendingOffer[0].id }];

  const orders = [];
  for (const kind of ['sentry_beacon', 'turret']) {
    const built = view.now.works.byKind[kind] ?? 0;
    for (let index = built; index < positions[kind].length; index += 1) {
      orders.push({ verb: 'BUILD', what: kind, where: positions[kind][index], when: { goldGte: costs[kind][index] } });
    }
  }

  for (const seam of view.now.seams.filter(({ active, remaining }) => active && remaining > 0)) {
    for (let count = 0; count < 4; count += 1) orders.push({ verb: 'HARVEST', seam: seam.id });
  }

  if (view.now.works.hp > 0 && view.now.works.hp < view.now.works.maxHp * 0.6) {
    orders.push({ verb: 'REPAIR_UNDER', pct: 80 });
  }
  orders.push({ verb: 'HOLD', pos: { x: 0, z: 12 } });
  return orders.slice(0, 32);
}

const child = spawn(process.execPath, [
  'scripts/gr-sim.mjs',
  '--contract',
  'the-claim',
  '--seed',
  'e1-the-claim-02',
], { stdio: ['pipe', 'pipe', 'pipe'] });

let outcome = null;
let stderr = '';
child.stderr.on('data', (chunk) => {
  stderr += chunk;
});

const rl = createInterface({ input: child.stdout, crlfDelay: Infinity });
for await (const line of rl) {
  if (!line.trim()) continue;
  const message = JSON.parse(line);
  if (message.schema === 'goldrush.view.v1') {
    child.stdin.write(`${JSON.stringify(ordersFor(message))}\n`);
  } else {
    outcome = message;
  }
}

const code = await new Promise((resolve) => child.on('close', resolve));
if (code !== 0 || !outcome) {
  process.stderr.write(stderr);
  process.exit(code || 1);
}

process.stderr.write(stderr);
process.stdout.write(`${JSON.stringify(outcome)}\n`);

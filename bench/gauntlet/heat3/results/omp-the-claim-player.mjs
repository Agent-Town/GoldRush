import { spawn } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const SIM_ARGS = ['scripts/gr-sim.mjs', '--contract', 'the-claim', '--seed', 'e1-the-claim-02'];
const POSITIONS = {
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

function ordersFor(view) {
  if (view.now.pendingSecure) {
    return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
  }

  if (view.now.pendingOffer?.length) {
    return [{ verb: 'PICK_UPGRADE', id: view.now.pendingOffer[0].id }];
  }

  const costsByKind = Object.fromEntries(
    view.stablePrefix.mechanics.buildables.map(({ id, costs }) => [id, costs]),
  );
  const orders = [{ verb: 'SET_WEAPON', weapon: 'rig' }];

  for (const kind of ['sentry_beacon', 'turret']) {
    const costs = costsByKind[kind];
    if (!costs) continue;
    const built = view.now.works.byKind[kind] ?? 0;
    for (let index = built; index < Math.min(POSITIONS[kind].length, costs.length); index += 1) {
      orders.push({
        verb: 'BUILD',
        what: kind,
        where: POSITIONS[kind][index],
        when: { goldGte: costs[index] },
      });
    }
  }

  for (const seam of view.now.seams) {
    if (!seam.active || seam.remaining <= 0) continue;
    for (let count = 0; count < 4; count += 1) {
      orders.push({ verb: 'HARVEST', seam: seam.id });
    }
  }

  if (view.now.works.hp > 0 && view.now.works.hp < view.now.works.maxHp * 0.6) {
    orders.push({ verb: 'REPAIR_UNDER', pct: 80 });
  }
  orders.push({ verb: 'HOLD', pos: { x: 0, z: 12 } });
  return orders.slice(0, 32);
}

function isBetter(candidate, incumbent) {
  if (!incumbent) return true;
  if (candidate.secured !== incumbent.secured) return candidate.secured;
  if (candidate.waves !== incumbent.waves) return candidate.waves > incumbent.waves;
  if (candidate.gold !== incumbent.gold) return candidate.gold > incumbent.gold;
  return candidate.kills > incumbent.kills;
}

async function recordOutcome(outcome) {
  let prior = { best: null, runsSoFar: 0 };
  try {
    prior = JSON.parse(await readFile(new URL('outcome.json', import.meta.url), 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const next = {
    best: isBetter(outcome, prior.best) ? outcome : prior.best,
    runsSoFar: (prior.runsSoFar ?? 0) + 1,
  };
  await writeFile(new URL('outcome.json', import.meta.url), `${JSON.stringify(next, null, 2)}\n`);
}

const child = spawn(process.execPath, SIM_ARGS, {
  cwd: ROOT,
  stdio: ['pipe', 'pipe', 'pipe'],
});

let buffer = '';
let outcome;
let stderr = '';

child.stdout.on('data', (chunk) => {
  process.stdout.write(chunk);
  buffer += chunk;
  let newline;
  while ((newline = buffer.indexOf('\n')) >= 0) {
    const line = buffer.slice(0, newline);
    buffer = buffer.slice(newline + 1);
    if (!line) continue;
    const message = JSON.parse(line);
    if (message.schema === 'goldrush.view.v1') {
      child.stdin.write(`${JSON.stringify(ordersFor(message))}\n`);
    } else {
      outcome = message;
    }
  }
});

child.stderr.on('data', (chunk) => {
  stderr += chunk;
  process.stderr.write(chunk);
});

const exitCode = await new Promise((resolve, reject) => {
  child.on('error', reject);
  child.on('close', resolve);
});

if (exitCode !== 0) {
  throw new Error(`gr-sim exited ${exitCode}: ${stderr.trim()}`);
}
if (!outcome) {
  throw new Error('gr-sim exited without a terminal outcome');
}
await recordOutcome(outcome);

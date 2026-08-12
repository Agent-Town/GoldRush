#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { readFile, writeFile, appendFile } from 'node:fs/promises';

const ERA = 'd599cd3e';
const CONTRACT = 'the-claim';
const SEED = 'e1-the-claim-02';

const positions = {
  sentry_beacon: [
    { x: 0, z: 13 }, { x: 0, z: 11 }, { x: 3, z: 12 },
    { x: -3, z: 12 }, { x: 0, z: 15 }, { x: 0, z: 9 },
  ],
  turret: [
    { x: 4, z: 14 }, { x: -4, z: 14 },
    { x: 4, z: 10 }, { x: -4, z: 10 },
  ],
};

const costs = {
  sentry_beacon: [25, 35, 45, 55, 75, 95],
  turret: [50, 70, 95, 125],
};

function ordersFor(view) {
  if (view.now.pendingSecure) {
    return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
  }
  if (view.now.pendingOffer?.length) {
    return [{ verb: 'PICK_UPGRADE', id: view.now.pendingOffer[0].id }];
  }

  const orders = [{ verb: 'SET_WEAPON', weapon: 'rig' }];
  for (const kind of ['sentry_beacon', 'turret']) {
    const built = view.now.works.byKind[kind] ?? 0;
    for (let index = built; index < positions[kind].length; index += 1) {
      orders.push({
        verb: 'BUILD',
        what: kind,
        where: positions[kind][index],
        when: { goldGte: costs[kind][index] },
      });
    }
  }

  for (const seam of view.now.seams.filter(({ active, remaining }) => active && remaining > 0)) {
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

function rank(outcome) {
  return [outcome.secured ? 1 : 0, outcome.waves ?? 0, outcome.kills ?? 0, outcome.gold ?? 0];
}

function isBetter(candidate, incumbent) {
  if (!incumbent) return true;
  const left = rank(candidate);
  const right = rank(incumbent);
  return left.some((value, index) => value !== right[index] && value > right[index]
    && left.slice(0, index).every((prior, priorIndex) => prior === right[priorIndex]));
}

async function record(outcome, views) {
  let previous = { runsSoFar: 0, bestLine: null, runs: [] };
  try {
    previous = JSON.parse(await readFile('outcome.json', 'utf8'));
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }

  const run = {
    run: (previous.runsSoFar ?? 0) + 1,
    era: ERA,
    contract: CONTRACT,
    seed: SEED,
    outcome,
  };
  const bestLine = isBetter(outcome, previous.bestLine?.outcome) ? run : previous.bestLine;
  const document = {
    era: ERA,
    contract: CONTRACT,
    seed: SEED,
    runsSoFar: run.run,
    bestLine,
    runs: [...(previous.runs ?? []), run],
  };
  await writeFile('outcome.json', `${JSON.stringify(document, null, 2)}\n`);

  const first = views[0];
  const works = bestLine.outcome.secured
    ? `secured at wave ${bestLine.outcome.waves}`
    : `fell at wave ${bestLine.outcome.waves}`;
  const posting = first?.stablePrefix?.mechanics?.posting?.waves
    ?.map(({ event, wave }) => `${event}@${wave}`).join(', ') ?? 'unknown posting';
  await appendFile(
    'NOTEBOOK.md',
    `\n## [era ${ERA}] Run ${run.run} — ${SEED}\n\n` +
    `LEARNED: ${works}; ${bestLine.outcome.kills} kills, ${bestLine.outcome.gold} gold remaining, ` +
    `${bestLine.outcome.defaultedPicks} defaulted draft picks, ${bestLine.outcome.defaultedSecure} defaulted secure choices. ` +
    `The live posting was ${posting}. The line explicitly answered every draft, built a compact beacon/turret ring while harvesting, and banked the secure prompt.\n`,
  );
}

const child = spawn(process.execPath, [
  'scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED,
], { stdio: ['pipe', 'pipe', 'inherit'] });

let buffer = '';
const views = [];
let outcome = null;
child.stdout.setEncoding('utf8');
child.stdout.on('data', (chunk) => {
  buffer += chunk;
  let newline;
  while ((newline = buffer.indexOf('\n')) >= 0) {
    const line = buffer.slice(0, newline);
    buffer = buffer.slice(newline + 1);
    if (!line) continue;
    const message = JSON.parse(line);
    if (message.schema === 'goldrush.view.v1') {
      views.push(message);
      if (!message.now.terminal) child.stdin.write(`${JSON.stringify(ordersFor(message))}\n`);
    } else {
      outcome = message;
    }
  }
});

const code = await new Promise((resolve, reject) => {
  child.once('error', reject);
  child.once('close', resolve);
});
if (code !== 0) throw new Error(`gr-sim exited with status ${code}`);
if (!outcome) throw new Error('gr-sim produced no outcome');
await record(outcome, views);
process.stdout.write(`${JSON.stringify(outcome)}\n`);

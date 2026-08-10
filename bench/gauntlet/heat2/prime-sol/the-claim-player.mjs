#!/usr/bin/env node
/**
 * Deterministic standalone rider for The Claim / e1-the-claim-02 / Trail.
 *
 * Usage: node player.mjs
 *
 * It launches the repository's canonical NDJSON simulator, answers every view with
 * a state-derived replacement order array, records the raw run in last-run.ndjson,
 * and atomically updates outcome.json as soon as the terminal outcome arrives.
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUTCOME_PATH = path.join(ROOT, 'outcome.json');
const TRANSCRIPT_PATH = path.join(ROOT, 'last-run.ndjson');

const positions = Object.freeze({
  sentry_beacon: Object.freeze([
    { x: 0, z: 13 }, { x: 0, z: 11 }, { x: 3, z: 12 },
    { x: -3, z: 12 }, { x: 0, z: 15 }, { x: 0, z: 9 },
  ]),
  turret: Object.freeze([
    { x: 4, z: 14 }, { x: -4, z: 14 },
    { x: 4, z: 10 }, { x: -4, z: 10 },
  ]),
});

const costs = Object.freeze({
  sentry_beacon: Object.freeze([25, 35, 45, 55, 75, 95]),
  turret: Object.freeze([50, 70, 95, 125]),
});

/** Pure deterministic policy: one view always maps to one replacement array. */
export function ordersFor(view) {
  const orders = [];

  // This exact build ladder is pinned by scripts/gr-sim.test.mjs for seed 02.
  // Waiting BUILDs precede harvesting; HOLD stays last so it cannot starve them.
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

function readPriorOutcome() {
  try {
    const value = JSON.parse(fs.readFileSync(OUTCOME_PATH, 'utf8'));
    return value && typeof value === 'object' ? value : null;
  } catch {
    return null;
  }
}

function betterThan(candidate, incumbent) {
  if (!incumbent) return true;
  const candidateKey = [candidate.secured ? 1 : 0, candidate.waves ?? -1,
    candidate.timeMs ?? -1, candidate.kills ?? -1, candidate.gold ?? -1];
  const incumbentKey = [incumbent.secured ? 1 : 0, incumbent.waves ?? -1,
    incumbent.timeMs ?? -1, incumbent.kills ?? -1, incumbent.gold ?? -1];
  for (let index = 0; index < candidateKey.length; index += 1) {
    if (candidateKey[index] !== incumbentKey[index]) return candidateKey[index] > incumbentKey[index];
  }
  return false;
}

const prior = readPriorOutcome();
const runsSoFar = Math.max(0, Number.isInteger(prior?.runsSoFar) ? prior.runsSoFar : 0) + 1;
fs.writeFileSync(TRANSCRIPT_PATH, '');

const child = spawn(process.execPath, [
  'scripts/gr-sim.mjs',
  '--contract', 'the-claim',
  '--seed', 'e1-the-claim-02',
  '--difficulty', 'trail',
], { cwd: ROOT, stdio: ['pipe', 'pipe', 'pipe'] });

let buffer = '';
let stderr = '';
let finalOutcome = null;
let lastView = null;

child.stdin.on('error', (error) => {
  // The simulator may close stdin immediately after its terminal view.
  if (error.code !== 'EPIPE') throw error;
});

child.stdout.on('data', (chunk) => {
  buffer += chunk.toString();
  let newline;
  while ((newline = buffer.indexOf('\n')) >= 0) {
    const line = buffer.slice(0, newline);
    buffer = buffer.slice(newline + 1);
    if (!line) continue;
    fs.appendFileSync(TRANSCRIPT_PATH, `${line}\n`);

    const message = JSON.parse(line);
    if (message.schema === 'goldrush.view.v1') {
      lastView = message;
      child.stdin.write(`${JSON.stringify(ordersFor(message))}\n`);
      continue;
    }

    if (typeof message.secured === 'boolean') {
      finalOutcome = message;
      const best = betterThan(message, prior) ? message : prior;
      const recorded = { ...best, runsSoFar };
      const temporary = `${OUTCOME_PATH}.tmp`;
      fs.writeFileSync(temporary, `${JSON.stringify(recorded, null, 2)}\n`);
      fs.renameSync(temporary, OUTCOME_PATH);
      process.stdout.write(`${JSON.stringify(recorded)}\n`);
    }
  }
});

child.stderr.on('data', (chunk) => {
  const text = chunk.toString();
  stderr += text;
  process.stderr.write(text);
});

child.on('error', (error) => {
  process.stderr.write(`player failed to launch gr-sim: ${error.message}\n`);
  process.exitCode = 1;
});

child.on('close', (code) => {
  if (code !== 0 || !finalOutcome) {
    process.stderr.write(`player: gr-sim ended with code ${code}; terminal outcome=${Boolean(finalOutcome)}\n${stderr}`);
    process.exitCode = 1;
    return;
  }
  const now = lastView?.now;
  process.stderr.write(
    `player: ${finalOutcome.secured ? 'SECURED' : 'FAILED'} wave=${finalOutcome.waves}`
      + ` hp=${now?.hero?.hp ?? 'unknown'} gold=${finalOutcome.gold} calls=${finalOutcome.calls}\n`,
  );
});

#!/usr/bin/env node
// F-MCAP-1 (`reviews/mare-claim-air-prevalent.md:34`) — THE LOOP, MEASURED.
//
// Drives `scripts/gr-sim.mjs` (which drives `HeadlessContractSim`) to the secure window on a bench
// seed with the same builder policy `scripts/gr-sim.test.mjs:595` uses to bank the Claim, then
// submits the CONCATENATED plan the air-wall prover submitted — `[SECURE_CHOICE, MOVE_TO ...]` —
// once per turn, and records what the rider can see each time: the turn index, the run clock, the
// pending-secure `expiresInMs`, whether the view moved at all, and every refusal the transport
// prints. The `--turns` sample is bounded so the BEFORE tree (which never advances) still exits.
//
// Usage: node artifacts/secure-choice-refusal/probe.mjs --out <path> [--turns 50] [--until-end]
//   --until-end   keep refusing until gr-sim terminates (the bounded-turn proof; the BEFORE tree
//                 never terminates, so this mode carries its own wall-clock cap).

import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));

const args = process.argv.slice(2);
const readArg = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] : fallback;
};
const outPath = resolve(readArg('out', 'artifacts/secure-choice-refusal/before.json'));
const sampleTurns = Number(readArg('turns', '50'));
const untilEnd = args.includes('--until-end');
const wallCapMs = Number(readArg('cap-ms', untilEnd ? '240000' : '120000'));

// The proven Claim policy (`scripts/gr-sim.test.mjs:590-611`), verbatim in shape.
const positions = {
  sentry_beacon: [{ x: 0, z: 13 }, { x: 0, z: 11 }, { x: 3, z: 12 }, { x: -3, z: 12 }, { x: 0, z: 15 }, { x: 0, z: 9 }],
  turret: [{ x: 4, z: 14 }, { x: -4, z: 14 }, { x: 4, z: 10 }, { x: -4, z: 10 }],
};
const costs = { sentry_beacon: [25, 35, 45, 55, 75, 95], turret: [50, 70, 95, 125] };

function plan(view) {
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

/** The submission F-MCAP-1 measured: the choice with the rider's plan concatenated behind it. */
const CONCATENATED = (view) => [{ verb: 'SECURE_CHOICE', choice: 'bank' }, ...plan(view)].slice(0, 32);

const result = await new Promise((resolvePromise, reject) => {
  const child = spawn(process.execPath,
    ['scripts/gr-sim.mjs', '--contract', 'the-claim', '--seed', 'e1-the-claim-01', '--policy=stdin'],
    { cwd: ROOT, stdio: ['pipe', 'pipe', 'pipe'] });
  let buffer = '';
  let stderr = '';
  let outcome = null;
  const samples = [];
  const refusalLines = [];
  let secureTurns = 0;
  let previousSecureView = null;
  let stoppedRefusing = false;
  const timer = setTimeout(() => {
    child.kill('SIGKILL');
    resolvePromise({ status: null, timedOut: true, samples, refusalLines, outcome, stderr, secureTurns });
  }, wallCapMs);

  child.stdout.on('data', (chunk) => {
    buffer += chunk;
    let newline;
    while ((newline = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, newline);
      buffer = buffer.slice(newline + 1);
      if (!line) continue;
      const message = JSON.parse(line);
      if (message.schema !== 'goldrush.view.v1') { outcome = message; continue; }
      if (!message.now.pendingSecure) {
        child.stdin.write(`${JSON.stringify(plan(message))}\n`);
        continue;
      }
      secureTurns += 1;
      const serialized = JSON.stringify(message);
      samples.push({
        secureTurn: secureTurns,
        runSeconds: message.now.timers.runSeconds,
        wave: message.now.wave,
        expiresInMs: message.now.pendingSecure === true ? null : message.now.pendingSecure.expiresInMs,
        identicalToPreviousSecureView: previousSecureView === null ? null : serialized === previousSecureView,
        orders: message.now.orders.map((record) => ({
          id: record.id,
          verb: record.order?.verb ?? null,
          status: record.status,
          reason: record.reason ?? null,
        })),
        needsRider: message.now.needsRider,
      });
      previousSecureView = serialized;
      if (!stoppedRefusing && (untilEnd || secureTurns <= sampleTurns)) {
        child.stdin.write(`${JSON.stringify(CONCATENATED(message))}\n`);
      } else {
        stoppedRefusing = true;
        child.stdin.write(`${JSON.stringify([{ verb: 'SECURE_CHOICE', choice: 'bank' }])}\n`);
      }
    }
  });
  child.stderr.on('data', (chunk) => {
    stderr += chunk;
    for (const entry of String(chunk).split('\n')) {
      if (entry.startsWith('gr-sim rejected orders:')) refusalLines.push(entry);
    }
  });
  child.on('error', (error) => { clearTimeout(timer); reject(error); });
  child.on('close', (status) => {
    clearTimeout(timer);
    resolvePromise({ status, timedOut: false, samples, refusalLines, outcome, stderr, secureTurns });
  });
});

const first = result.samples[0] ?? null;
const last = result.samples.at(-1) ?? null;
const report = {
  probe: 'secure-choice-refusal',
  finding: 'F-MCAP-1',
  contract: 'the-claim',
  seed: 'e1-the-claim-01',
  submission: '[SECURE_CHOICE, ...the rider plan] — the concatenation the air-wall prover made',
  mode: untilEnd ? 'until-end' : `sample-${sampleTurns}`,
  status: result.status,
  timedOut: result.timedOut,
  secureWindowTurns: result.secureTurns,
  expiresInMsFirst: first?.expiresInMs ?? null,
  expiresInMsLast: last?.expiresInMs ?? null,
  clockMoved: first !== null && last !== null && first.expiresInMs !== last.expiresInMs,
  identicalSecureViews: result.samples.slice(1).every((sample) => sample.identicalToPreviousSecureView === true),
  refusalVisibleInOrders: result.samples.some((sample) =>
    sample.orders.some((record) => typeof record.reason === 'string' && record.reason.includes('SECURE_CHOICE_ONLY'))),
  refusalLineCount: result.refusalLines.length,
  refusalLineFirst: result.refusalLines[0] ?? null,
  outcome: result.outcome,
  // Trimmed so an `--until-end` run (hundreds of turns) still fits well inside the repo's
  // 5 MB-per-commit bar; the counts above are computed over EVERY sample, not the trimmed set.
  samplesRecorded: result.samples.length,
  samples: result.samples.length <= 120
    ? result.samples
    : [...result.samples.slice(0, 60), { elided: result.samples.length - 120 }, ...result.samples.slice(-60)],
};
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);
process.stdout.write(`${JSON.stringify({
  out: outPath,
  status: report.status,
  timedOut: report.timedOut,
  secureWindowTurns: report.secureWindowTurns,
  expiresInMsFirst: report.expiresInMsFirst,
  expiresInMsLast: report.expiresInMsLast,
  clockMoved: report.clockMoved,
  identicalSecureViews: report.identicalSecureViews,
  refusalVisibleInOrders: report.refusalVisibleInOrders,
  refusalLineCount: report.refusalLineCount,
  outcome: report.outcome,
}, null, 2)}\n`);

#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createServer } from 'vite';

const [mode, tapePath, outputPath] = process.argv.slice(2);
if (!['recorder', 'replay'].includes(mode) || !tapePath || !outputPath) {
  throw new Error('usage: probe-orders-log.mjs recorder|replay TAPE OUTPUT');
}

const rawTape = JSON.parse(await readFile(resolve(tapePath), 'utf8'));
const location = new URL(`http://gr-sim.local/?debug&contract=${encodeURIComponent(rawTape.contract)}&seed=${encodeURIComponent(rawTape.seed)}`);
globalThis.location = location;
globalThis.window = { location };

const vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
const quiet = { log: console.log, info: console.info, debug: console.debug };
console.log = console.info = console.debug = () => undefined;

try {
  const [runTape, standingOrders, balance, lockstep] = await Promise.all([
    vite.ssrLoadModule('/src/game/RunTape.ts'),
    vite.ssrLoadModule('/src/agent/StandingOrders.ts'),
    vite.ssrLoadModule('/src/game/Balance.ts'),
    vite.ssrLoadModule('/src/mp/LockstepClient.ts'),
  ]);
  const tape = runTape.validateRunTape(withoutEngineHash(rawTape));
  if (!tape) throw new Error('malformed tape');
  balance.applyDifficultyPreset(balance.normalizeDifficultyPreset(tape.difficulty));
  const sim = await bootDeclaredRun(vite, tape, lockstep.stableHash);
  const submissions = tape.inputLog.entries.flatMap((entry) => entry.a.map((action) => ({ tick: entry.t, orders: action.orders })));
  const receipts = [];
  let consumed = 0;
  let steps = 0;

  if (mode === 'recorder') {
    sim.currentTurn();
    while (!sim.isTerminal && steps < tape.inputLog.durationTicks + 18_000) {
      const tick = Math.round(sim.timeAlive * 30);
      const next = submissions[consumed];
      if (next?.tick === tick) {
        const receipt = sim.submitOrders(next.orders);
        receipts.push({ index: consumed, tick, ok: receipt.outcome.ok, reason: receipt.outcome.reason });
        consumed += 1;
      } else if (next && next.tick < tick) {
        throw new Error(`recorder passed order ${consumed} at tick ${next.tick}; now ${tick}`);
      }
      sim.advanceToTurn();
      steps += 1;
    }
  } else {
    const byTick = Map.groupBy(submissions, ({ tick }) => tick);
    const applied = new Set();
    while (!sim.isTerminal && steps < tape.inputLog.durationTicks + 18_000) {
      const tick = Math.round(sim.timeAlive * 30);
      if (!applied.has(tick)) {
        for (const next of byTick.get(tick) ?? []) {
          const receipt = sim.submitOrders(next.orders);
          receipts.push({ index: consumed, tick, ok: receipt.outcome.ok, reason: receipt.outcome.reason });
          consumed += 1;
        }
        applied.add(tick);
      }
      sim.advanceOneTick();
      steps += 1;
    }
  }

  const snapshot = standingOrders.snapshotStandingOrders();
  const ordersReplaced = snapshot.log
    .filter(({ type }) => type === 'orders_replaced')
    .map(({ at: _at, seq: _seq, ...event }) => event);
  const outcome = sim.outcome();
  const report = {
    mode,
    tape: tapePath,
    claimedHash: tape.eventLogHash,
    producedHash: runTape.agentOrdersEventLogHash(snapshot),
    outcome: { secured: outcome.secured, waves: outcome.waves, gold: outcome.gold, timeAlive: outcome.timeMs / 1000 },
    submitted: submissions.length,
    consumed,
    accepted: receipts.filter(({ ok }) => ok).length,
    rejected: receipts.filter(({ ok }) => !ok),
    ordersReplaced,
  };
  await writeFile(resolve(outputPath), `${JSON.stringify(report, null, 2)}\n`);
  Object.assign(console, quiet);
  process.stdout.write(`${JSON.stringify({ ...report, ordersReplaced: `[${ordersReplaced.length} entries]` })}\n`);
} finally {
  Object.assign(console, quiet);
  await vite.close();
}

function withoutEngineHash(tape) {
  const meta = tape?.meta;
  return meta && typeof meta === 'object' && !Array.isArray(meta)
    && Object.keys(meta).sort().join(',') === 'buildId,engineHash'
    && typeof meta.engineHash === 'string' && /^[a-f0-9]{64}$/.test(meta.engineHash)
    ? { ...tape, meta: { buildId: meta.buildId } }
    : tape;
}

async function bootDeclaredRun(server, tape, stableHash) {
  const { HeadlessContractSim } = await server.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
  const boot = { contractId: tape.contract, seed: tape.seed };
  const declared = stableHash(tape.runStart);
  const virgin = new HeadlessContractSim(boot);
  if (stableHash(virgin.runStart) === declared) return virgin;
  const [{ FakeStorage }, { saveMetaProgress }, { saveResearchState }] = await Promise.all([
    server.ssrLoadModule('/src/sim/FakeStorage.ts'),
    server.ssrLoadModule('/src/game/MetaProgress.ts'),
    server.ssrLoadModule('/src/meta/ResearchTree.ts'),
  ]);
  const storage = new FakeStorage();
  saveMetaProgress(storage, tape.runStart.meta);
  saveResearchState(storage, tape.runStart.research);
  const progressed = new HeadlessContractSim(boot, { storage });
  if (stableHash(progressed.runStart) !== declared) throw new Error('declared runStart is not installable');
  return progressed;
}

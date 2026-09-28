#!/usr/bin/env node
// county-board-open-week-1: the door's rows BEFORE and AFTER this slice, on one ledger and one clock.
// Usage: node door-before-after.mjs <before-root> <after-root> <out.json>
// Loads functions/api/standings.ts from each checkout through vite's SSR loader (as scripts/agent-reels.test.mjs
// does), pins the wall clock mid-week, and asks both doors the same questions over the same in-memory ledger.
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { createServer } from 'vite';

const [beforeRoot, afterRoot, outPath] = process.argv.slice(2);
if (!beforeRoot || !afterRoot || !outPath) throw new Error('Usage: node door-before-after.mjs <before-root> <after-root> <out.json>');
const DAY = 86_400_000;

async function loadDoor(root) {
  const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
  const door = await vite.ssrLoadModule('/functions/api/standings.ts');
  const { default: registry } = await vite.ssrLoadModule('/assets/rotations/rotation-seeds.json');
  const { default: engineEra } = await vite.ssrLoadModule('/assets/engine-era.json');
  const { CONTRACT_BUNDLES } = await vite.ssrLoadModule('/src/playbook/PlaybookFormat.ts');
  return { vite, onRequest: door.onRequest, registry, engineEra, bundles: CONTRACT_BUNDLES };
}

function row(engineEra, { name, anon, waves, seed, rotationId, riders, assay = 'pending', digest = false, submittedAt }) {
  const id = `cbw1-${anon.slice(0, 6)}-${waves}`;
  const outcome = { waves, timeAlive: 120, gold: 40 };
  const progress = { version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: 0 } };
  return {
    secured: true, ...outcome, baseValue: 60, profileName: name, anonId: anon, difficulty: 'trail',
    seed, seedMode: 'live', seedHash: 'a'.repeat(64), inputLogHash: 'b'.repeat(64), submittedAt,
    ...(digest ? { stack: { declaredBy: 'self', model: 'week-test', harness: 'week-rig', harnessVersion: '1', harnessDigest: 'c'.repeat(64) } } : {}),
    ...(riders ? { party: { riderCount: riders.length, riders: riders.map((rider) => ({ name: rider })) } } : {}),
    tape: {
      version: 2, id, createdAt: 1, kept: true, contract: 'the-claim', seed, difficulty: 'trail', simVersion: 1,
      meta: { buildId: 'abcdef12', engineHash: engineEra.engineHash, era: engineEra.era },
      runStart: { meta: progress, research: { version: 1, progress, taken: [], proposalSalt: 0, pinnedTarget: null } },
      inputLog: { version: 1, name: id, contractId: 'the-claim', seed, difficultyPreset: 'trail', stepSeconds: 1 / 30, start: { x: 0, z: 12 }, durationTicks: 1, entries: [], truncated: null, primarySlot: 0, streams: [] },
      eventLogHash: 'fnv1a32:1234abcd',
      outcome: { reason: 'secured', secured: true, ...outcome },
    },
    assay,
    ...(assay === 'pending' ? {} : { assayedAt: submittedAt + 1, assayHash: 'fnv1a32:1234abcd' }),
    ...(rotationId ? { rotationId } : {}),
  };
}

const before = await loadDoor(path.resolve(beforeRoot));
const after = await loadDoor(path.resolve(afterRoot));
const weeks = [...after.registry.rotations].filter((rotation) => rotation.seeds['the-claim']).sort((a, b) => Date.parse(a.opensAt) - Date.parse(b.opensAt));
const latest = weeks.at(-1);
const prior = weeks.at(-2);
const now = Date.parse(latest.opensAt) + 3.5 * DAY;
const ledger = JSON.stringify([
  row(after.engineEra, { name: 'All-Time Rider', anon: '1'.repeat(32), waves: 40, seed: 'gold-rush', submittedAt: now - 9 * DAY, assay: 'verified', digest: true }),
  row(after.engineEra, { name: 'Week Rider', anon: '2'.repeat(32), waves: 12, seed: latest.seeds['the-claim'], rotationId: latest.id, submittedAt: now - DAY, assay: 'verified', digest: true }),
  row(after.engineEra, { name: 'Week Posse', anon: '3'.repeat(32), waves: 15, seed: latest.seeds['the-claim'], rotationId: latest.id, submittedAt: now - DAY, riders: ['Ada', 'Robin'] }),
  row(after.engineEra, { name: 'Refused Week Reel', anon: '4'.repeat(32), waves: 50, seed: latest.seeds['the-claim'], rotationId: latest.id, submittedAt: now - DAY, assay: 'rejected' }),
  row(after.engineEra, { name: 'Last Week Rider', anon: '5'.repeat(32), waves: 30, seed: prior.seeds['the-claim'], rotationId: prior.id, submittedAt: now - 8 * DAY }),
]);
const claim = 'contract=the-claim&epoch=epoch-1-frontier';
// A board the door keeps that no week carries (the Drill Yard is not one: the door keeps no board for it).
const carried = new Set(after.registry.rotations.flatMap((rotation) => Object.keys(rotation.seeds)));
const offWeek = after.bundles.flatMap((bundle) => bundle.contracts.map((contract) => ({ epochId: bundle.epochId, contractId: contract.id })))
  .find(({ contractId }) => contractId !== 'e1-drill-yard' && !carried.has(contractId));
const questions = [
  `?${claim}`,
  `?${claim}&party=2`,
  `?${claim}&difficulty=trail`,
  `?${claim}&season=1`,
  `?${claim}&season=2`,
  `?board=transfer&rotation=${latest.id}`,
  '?view=byStack&epoch=epoch-1-frontier',
  `?${claim}&rotation=${latest.id}`,
  `?${claim}&rotation=open`,
  `?${claim}&party=2&rotation=${latest.id}`,
  `?${claim}&rotation=${prior.id}`,
  `?${claim}&rotation=r1999w01`,
  `?contract=e1-drill-yard&epoch=epoch-1-frontier&rotation=${latest.id}`,
  `?contract=${offWeek.contractId}&epoch=${offWeek.epochId}&rotation=${latest.id}`,
  `?contract=${offWeek.contractId}&epoch=${offWeek.epochId}&rotation=open`,
];

async function ask(door, query) {
  const store = new Map([['standings:s2:epoch-1-frontier:the-claim', ledger]]);
  const kv = { get: async (key) => store.get(key) ?? null, put: async (key, value) => { store.set(key, value); } };
  const response = await door.onRequest({ request: new Request(`http://127.0.0.1/api/standings${query}`), env: { TELEMETRY: kv } });
  return { status: response.status, text: await response.text() };
}

const realNow = Date.now;
Date.now = () => now;
const results = [];
try {
  for (const query of questions) {
    const was = await ask(before, query);
    const is = await ask(after, query);
    const summary = (answer) => {
      const body = JSON.parse(answer.text);
      if (!body.ok) return `${answer.status} ${body.error}`;
      if (body.board === 'transfer') return `${answer.status} transfer ${body.standings.map((s) => `${s.contractId}:${s.board.length}`).join(' ')}`;
      if (Array.isArray(body.board)) return `${answer.status}${body.rotationId ? ` week ${body.rotationId}` : ''} [${body.board.map((r) => `${r.rank}. ${r.profileName}${r.rotationId ? ` @${r.rotationId}` : ''}`).join('; ')}] rejected ${body.rejectedCount}`;
      return `${answer.status} ${Object.keys(body).join(',')}`;
    };
    results.push({ query, before: summary(was), after: summary(is), identical: was.status === is.status && was.text === is.text });
  }
} finally {
  Date.now = realNow;
  await before.vite.close();
  await after.vite.close();
}
writeFileSync(outPath, `${JSON.stringify({ clock: new Date(now).toISOString(), latest: latest.id, prior: prior.id, results }, null, 2)}\n`);
for (const result of results) console.log(`${result.identical ? 'SAME ' : 'MOVED'} ${result.query}\n      before: ${result.before}\n      after:  ${result.after}`);

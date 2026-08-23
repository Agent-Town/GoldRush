import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtemp, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createLedgerServer } from '../server/ledger/serve.mjs';
import { SqliteStorage } from '../server/ledger/storage.mjs';

const secret = 'ledger-worker-contract-secret';
const directory = await mkdtemp(path.join(tmpdir(), 'gold-rush-ledger-worker-'));
const ledgerDirectory = path.join(directory, 'private');
const ledgerPath = path.join(ledgerDirectory, 'ledger.db');
const storage = new SqliteStorage(ledgerPath);
const launchDirectory = process.cwd();
process.chdir(directory);
const server = await createLedgerServer({
  storage,
  env: { ASSAY_WORKER_SECRET: secret, ALLOWED_CORS_ORIGINS: new Set(['https://county.example']) },
}).finally(() => process.chdir(launchDirectory));

try {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  assert.equal((await stat(ledgerDirectory)).mode & 0o777, 0o700);
  assert.equal((await stat(ledgerPath)).mode & 0o777, 0o600);
  await storage.put('ttl-probe', 'alive', { expirationTtl: 1 });
  await storage.put('ttl-write-probe', 'stale', { expirationTtl: 1 });
  assert.equal(await storage.get('ttl-probe'), 'alive');
  await new Promise((resolve) => setTimeout(resolve, 1_050));
  assert.equal(await storage.get('ttl-probe'), null);
  await storage.put('ttl-trigger', 'alive');
  assert.equal(storage.db.prepare('SELECT COUNT(*) AS count FROM kv WHERE key = ?').get('ttl-write-probe').count, 0);
  const cors = await fetch(`${base}/api/standings`, { method: 'OPTIONS', headers: { Origin: 'https://county.example' } });
  assert.equal(cors.status, 204);
  assert.equal(cors.headers.get('access-control-allow-origin'), 'https://county.example');
  assert.equal((await fetch(`${base}/api/session`, { method: 'OPTIONS' })).status, 204);
  assert.equal((await fetch(`${base}/api/standings/assay-queue`, { method: 'OPTIONS', headers: { 'x-assay-key': secret } })).status, 405);
  const oversized = await fetch(`${base}/api/standings`, {
    method: 'POST',
    headers: { Origin: 'https://county.example', 'content-type': 'application/json' },
    body: 'x'.repeat(300_000),
  });
  assert.equal(oversized.status, 413);
  assert.equal(oversized.headers.get('access-control-allow-origin'), 'https://county.example');

  const tape = assayableTape();
  const submitted = await jsonFetch(`${base}/api/standings`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      contractId: 'the-claim',
      epochId: 'epoch-1-frontier',
      score: { secured: true, waves: 3, timeAlive: 12, gold: 7, baseValue: 20 },
      profileName: 'Worker Probe',
      anonId: 'a'.repeat(32),
      difficulty: 'trail',
      seed: 'worker-probe',
      seedMode: 'live',
      seedHash: 'b'.repeat(64),
      inputLogHash: createHash('sha256').update(JSON.stringify(tape.inputLog)).digest('hex'),
      tape,
    }),
  });
  assert.equal(submitted.status, 200);

  const replay = path.join(directory, 'replay.mjs');
  await writeFile(replay, `process.stdout.write(JSON.stringify({eventLogHash:'fnv1a32:1234abcd',outcome:{secured:true,waves:3,timeAlive:12,gold:7}}));\n`);
  await runWorker(base, replay);

  const slip = await jsonFetch(`${base}/api/standings?contract=the-claim&epoch=epoch-1-frontier&verdict=worker-contract`);
  assert.equal(slip.body.assay, 'verified');
  assert.equal(slip.body.ranked, true);
  const queue = await jsonFetch(`${base}/api/standings/assay-queue?limit=100`, { headers: { 'x-assay-key': secret } });
  assert.equal(queue.body.queue.length, 0);
  console.log('ledger worker HTTP contract checks passed (15)');
} finally {
  await new Promise((resolve) => server.close(resolve));
  storage.close();
  await rm(directory, { recursive: true, force: true });
}

function assayableTape() {
  const meta = { version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: 0 } };
  return {
    version: 2,
    id: 'worker-contract',
    createdAt: 1,
    kept: true,
    contract: 'the-claim',
    seed: 'worker-probe',
    difficulty: 'trail',
    simVersion: 1,
    runStart: { meta, research: { version: 1, progress: meta, taken: [], proposalSalt: 0, pinnedTarget: null } },
    inputLog: {
      version: 1,
      name: 'worker-contract',
      contractId: 'the-claim',
      seed: 'worker-probe',
      difficultyPreset: 'trail',
      stepSeconds: 1 / 30,
      start: { x: 0, z: 12 },
      durationTicks: 1,
      entries: [],
      truncated: null,
      primarySlot: 0,
      streams: [],
    },
    eventLogHash: 'fnv1a32:1234abcd',
    outcome: { reason: 'secured', secured: true, waves: 3, timeAlive: 12, gold: 7 },
  };
}

async function runWorker(base, replay) {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['scripts/assay-worker.mjs', '--once'], {
      env: { ...process.env, ASSAY_API_BASE: base, ASSAY_WORKER_SECRET: secret, ASSAY_REPLAY_SCRIPT: replay },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    child.stdout.on('data', (chunk) => { output += chunk; });
    child.stderr.on('data', (chunk) => { output += chunk; });
    child.once('error', reject);
    child.once('close', (code) => code === 0 ? resolve() : reject(new Error(`assay worker exited ${code}: ${output}`)));
  });
}

async function jsonFetch(url, init) {
  const response = await fetch(url, init);
  return { status: response.status, body: await response.json() };
}

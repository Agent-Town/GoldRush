#!/usr/bin/env node

/**
 * THE PROBE'S OWN FLOW, RUN LOCALLY. The 2026-08-22 probe played a securing rider through the plain
 * public door, submitted it to production and was refused ("legacy tape v1 is unverifiable"). This
 * repeats every step of that flow against an in-memory county and the REAL worker + REAL replay
 * seam — nothing is posted to production, which is the attended session's own re-run to make.
 *
 *   1. build the county standing from the tape, field for field as the probe's
 *      `artifacts/assay-e2e-20260822/build-submission.mjs` did (inlined here so this script stands
 *      alone on this branch): the score is READ OFF the tape because `tapeMatchesScore` cross-checks
 *      it, `inputLogHash` is sha256 of the PARSED input log, and a declared harness carries a version
 *   2. POST it to `functions/api/standings.ts` (in-memory KV) — the submit-shape gate
 *   3. read the board: the row ranks and reads `pending`
 *   4. run `scripts/assay-worker.mjs --once` against a local bridge to those same handlers, which
 *      spawns the real `scripts/assay-replay.mjs` — the replay-verification gate
 *   5. read the assay slip by tape id and the ranked board again
 *
 * Usage: node artifacts/assay-e2e-cure/local-e2e.mjs <tape.json>
 */

import { spawn, execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createServer as createHttpServer } from 'node:http';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const tapePath = path.resolve(process.argv[2] ?? 'artifacts/assay-e2e-cure/tape-v2-run1.json');
const submissionPath = path.join(path.dirname(tapePath), 'local-submission.json');
const SECRET = 'local-e2e-secret';
const KEY = 'standings:s2:epoch-1-frontier:the-claim';

const step = (name, detail) => process.stdout.write(`${JSON.stringify({ step: name, ...detail })}\n`);
const sha256 = (value) => createHash('sha256').update(value).digest('hex');

const tape = JSON.parse(readFileSync(tapePath, 'utf8'));
const submission = {
  contractId: tape.contract,
  epochId: 'epoch-1-frontier',
  score: { secured: tape.outcome.secured, waves: tape.outcome.waves, timeAlive: tape.outcome.timeAlive, gold: tape.outcome.gold, baseValue: 0 },
  profileName: 'Assay E2E Probe',
  anonId: sha256('attended-e2e-20260822').slice(0, 32),
  difficulty: tape.difficulty,
  seed: tape.seed,
  seedMode: 'bench',
  seedHash: sha256(tape.seed),
  inputLogHash: sha256(JSON.stringify(tape.inputLog)),
  stack: {
    model: 'anthropic/claude-opus-5',
    harness: 'goldrush-attended-assay-e2e',
    harnessVersion: execFileSync('git', ['rev-parse', '--short=12', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
    config: 'artifacts/assay-e2e-20260822/claim-prover.mjs',
    calls: 0,
  },
  tape,
};
writeFileSync(submissionPath, `${JSON.stringify(submission)}\n`);
step('submission-built', { tapeId: tape.id, tapeVersion: tape.version, claimedHash: tape.eventLogHash, bytes: Buffer.byteLength(JSON.stringify(submission)) });

const values = new Map();
const kv = { get: async (key) => values.get(key) ?? null, put: async (key, value) => void values.set(key, value) };
const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
let bridge;
try {
  const [{ onRequest: board }, { onRequest: queue }, { onRequest: verdict }] = await Promise.all([
    vite.ssrLoadModule('/functions/api/standings.ts'),
    vite.ssrLoadModule('/functions/api/standings/assay-queue.ts'),
    vite.ssrLoadModule('/functions/api/standings/assay-verdict.ts'),
  ]);
  const route = async (handler, method, url, body, key) => {
    const headers = new Headers(body === undefined ? {} : { 'content-type': 'application/json' });
    if (key !== undefined) headers.set('x-assay-key', key);
    const response = await handler({
      request: new Request(`http://127.0.0.1${url}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) }),
      env: { TELEMETRY: kv, ASSAY_WORKER_SECRET: SECRET },
    });
    return { status: response.status, body: await response.json() };
  };

  const posted = await route(board, 'POST', '/api/standings', submission);
  step('submit', { status: posted.status, body: posted.body });
  if (posted.status !== 200 || posted.body.ok !== true) throw new Error('the county refused the submission');

  const pending = await route(board, 'GET', '/api/standings?contract=the-claim&epoch=epoch-1-frontier');
  step('board-before-assay', { rows: pending.body.board.length, assay: pending.body.board[0]?.assay, rejectedCount: pending.body.rejectedCount });

  bridge = createHttpServer(async (request, response) => {
    const key = request.headers['x-assay-key'];
    let body;
    if (request.method === 'POST') {
      let text = '';
      for await (const chunk of request) text += chunk;
      body = JSON.parse(text);
    }
    const handler = request.url.startsWith('/api/standings/assay-queue') ? queue : verdict;
    const result = await route(handler, request.method, request.url, body, key);
    response.writeHead(result.status, { 'content-type': 'application/json' });
    response.end(JSON.stringify(result.body));
  });
  await new Promise((resolve) => bridge.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${bridge.address().port}`;

  const worker = await runWorker(base);
  step('worker', { exit: worker.code, log: worker.stdout.trim().split('\n').filter(Boolean).map((line) => JSON.parse(line)) });
  if (worker.code !== 0) throw new Error(worker.stderr.trim() || 'the worker failed');

  const slip = await route(board, 'GET', `/api/standings?contract=the-claim&epoch=epoch-1-frontier&verdict=${encodeURIComponent(tape.id)}`);
  step('assay-slip', { status: slip.status, body: slip.body });
  const after = await route(board, 'GET', '/api/standings?contract=the-claim&epoch=epoch-1-frontier');
  step('board-after-assay', { rows: after.body.board.length, assay: after.body.board[0]?.assay, rejectedCount: after.body.rejectedCount });

  const stored = JSON.parse(await kv.get(KEY));
  const verdictRow = stored.find((row) => row.tape?.id === tape.id);
  step('verdict', {
    assay: verdictRow.assay,
    claimedHash: tape.eventLogHash,
    assayHash: verdictRow.assayHash,
    assayReason: verdictRow.assayReason ?? null,
    parity: verdictRow.assayHash === tape.eventLogHash,
  });
  if (verdictRow.assay !== 'verified') throw new Error(`the county assayed the run as ${verdictRow.assay}: ${verdictRow.assayReason}`);
  process.stdout.write(`${JSON.stringify({ result: 'VERIFIED', tapeId: tape.id, hash: tape.eventLogHash }, null, 2)}\n`);
} catch (error) {
  process.stderr.write(`local e2e failed: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
} finally {
  bridge?.close();
  await vite.close();
}

function runWorker(base) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['scripts/assay-worker.mjs', '--once'], {
      cwd: root,
      env: { ...process.env, ASSAY_API_BASE: base, ASSAY_WORKER_SECRET: SECRET },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', (code) => resolve({ code, stdout, stderr }));
  });
}

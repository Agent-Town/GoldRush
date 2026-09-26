#!/usr/bin/env node
// river-assay-1 evidence instrument (not a gate, not an engine input). It runs the REAL assay worker,
// `scripts/assay-worker.mjs --once --dry-run`, against a local queue that serves the given reels as county
// rows, each row carrying the score its standing carries, and records the worker's own verdict lines.
// Dry run: the worker posts nothing, so the local queue needs only the GET route; nothing leaves this machine.
//
// Usage (from the checkout root): node artifacts/river-assay-1/instruments/worker-verdicts.mjs <out.json> <label>=<file> ...
//   <file> is a bare reel, a `{ reel }` wrapper, or a door submission (`{ score, tape }`, whose score is used as is).
//   A bare reel gets the score a standing would carry for it: its outcome, baseValue 0.
// The instrument the worker spawns is `scripts/assay-replay.mjs` unless ASSAY_REPLAY_SCRIPT says otherwise, and its
// vite port is GR_ASSAY_REPLAY_PORT from this process's environment.
import { spawn } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';

const [out, ...specs] = process.argv.slice(2);
if (!out || specs.length === 0) throw new Error('usage: worker-verdicts.mjs <out.json> <label>=<file> ...');

const rows = [];
for (const [index, spec] of specs.entries()) {
  const at = spec.indexOf('=');
  const label = spec.slice(0, at);
  const file = spec.slice(at + 1);
  const payload = JSON.parse(await readFile(file, 'utf8'));
  const tape = payload.tape ?? payload.reel ?? payload;
  const score = payload.score ?? {
    secured: tape.outcome.secured,
    waves: tape.outcome.waves,
    timeAlive: tape.outcome.timeAlive,
    gold: tape.outcome.gold,
    baseValue: 0,
  };
  rows.push({
    label,
    file,
    row: {
      locator: { epochId: 'local-dry-run', contractId: tape.contract, tapeId: tape.id, rowId: `${String(index).padStart(32, '0')}:1:1:${'b'.repeat(64)}` },
      tape,
      score,
      submittedAt: index + 1,
    },
  });
}

const server = createServer((request, response) => {
  if (request.method === 'GET' && request.url?.startsWith('/api/standings/assay-queue')) {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ ok: true, queue: rows.map(({ row }) => row) }));
    return;
  }
  response.writeHead(404, { 'content-type': 'application/json' });
  response.end(JSON.stringify({ ok: false, error: 'not_found' }));
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;

const startedAt = new Date().toISOString();
const child = spawn(process.execPath, ['scripts/assay-worker.mjs', '--once', '--dry-run'], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    ASSAY_API_BASE: base,
    ASSAY_WORKER_SECRET: 'local-dry-run',
    ASSAY_BACKOFF_INITIAL_MS: '2000',
    ASSAY_BACKOFF_MAX_MS: '4000',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let stdout = '';
let stderr = '';
child.stdout.on('data', (chunk) => { stdout += chunk; });
child.stderr.on('data', (chunk) => { stderr += chunk; });
const code = await new Promise((resolve) => child.on('close', resolve));
server.close();

const lines = stdout.trim().split('\n').filter(Boolean).map((line) => JSON.parse(line));
const verdicts = lines.filter((line) => line.verdict);
const result = {
  startedAt,
  node: process.versions.node,
  workerExit: code,
  workerStderr: stderr.trim(),
  rows: rows.map(({ label, file, row }) => {
    const line = verdicts.find((entry) => entry.locator?.tapeId === row.tape.id);
    return {
      label,
      file,
      contract: row.tape.contract,
      claimedHash: row.tape.eventLogHash,
      score: row.score,
      verdict: line?.verdict ?? null,
      replayedHash: line?.hashes?.replayed ?? null,
      reason: line?.reason ?? null,
      wallMs: line?.wallMs ?? null,
    };
  }),
  retries: lines.filter((line) => line.event === 'instrument_retry'),
};
await writeFile(out, `${JSON.stringify(result, null, 2)}\n`);
for (const row of result.rows) process.stdout.write(`${row.label}: ${row.verdict} (claimed ${row.claimedHash}, replayed ${row.replayedHash}${row.reason ? `; ${row.reason}` : ''})\n`);
process.exitCode = code === 0 ? 0 : 1;

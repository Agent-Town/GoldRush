#!/usr/bin/env node
/**
 * serve-start-proof.mjs: the droplet ledger door (server/ledger/serve.mjs) STARTS and SERVES, by its
 * real path and through a file symlink (is-main-2, 2026-09-26). Evidence, not a gate; run inside
 * the drain lock beside test:stats, because the door loads vite in middleware mode.
 *
 * usage: node artifacts/is-main-2/serve-start-proof.mjs <tree-root>
 *
 * Per spelling: a fresh sqlite file in a scratch dir, a free port on 127.0.0.1 (the door refuses
 * PORT=0, so one is reserved and released first), the door started with a minimal environment
 * (PATH, HOME, TMPDIR, LEDGER_DB_PATH, PORT), its "listening" line awaited, then two local requests:
 * GET /api/stats (a real handler, the public counters) and GET /no-such-route (the router's own
 * 404). Then SIGTERM to the PID this script started, and its exit is awaited. Nothing leaves the
 * machine: every request is to 127.0.0.1.
 */
import { spawn } from 'node:child_process';
import { mkdtempSync, realpathSync, rmSync, symlinkSync, unlinkSync } from 'node:fs';
import { createServer } from 'node:net';
import { loadavg, tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const ROOT = realpathSync(resolve(process.argv[2] ?? '.'));
const SERVE = join(ROOT, 'server', 'ledger', 'serve.mjs');
const scratch = realpathSync(mkdtempSync(join(tmpdir(), 'im2-serve-proof-')));
const LINK = join(scratch, 'serve.link.mjs');

function freePort() {
  return new Promise((ok, fail) => {
    const probe = createServer();
    probe.once('error', fail);
    probe.listen(0, '127.0.0.1', () => {
      const { port } = probe.address();
      probe.close(() => ok(port));
    });
  });
}

async function startAndServe(label, entry) {
  const port = await freePort();
  const db = join(scratch, `${label}.db`);
  // A minimal environment, nothing inherited beyond what node and vite need: no secret, no sender,
  // no proxy key can reach the door, so every /api/ledger/* route stays dark and nothing is sent.
  const env = { PATH: process.env.PATH, HOME: process.env.HOME, TMPDIR: process.env.TMPDIR ?? tmpdir(), LEDGER_DB_PATH: db, PORT: String(port) };
  const t0 = Date.now();
  const child = spawn(process.execPath, [entry], { cwd: ROOT, env, stdio: ['ignore', 'pipe', 'pipe'] });
  let out = '';
  let err = '';
  child.stdout.on('data', (b) => { out += b; });
  child.stderr.on('data', (b) => { err += b; });
  const exited = new Promise((ok) => child.once('exit', (code, signal) => ok({ code, signal })));
  const listening = await new Promise((ok) => {
    const timer = setTimeout(() => ok(false), 300_000);
    const check = () => { if (out.includes('listening on 127.0.0.1:')) { clearTimeout(timer); ok(true); } };
    child.stdout.on('data', check);
    exited.then(() => { clearTimeout(timer); ok(false); });
  });
  const row = { label, entry, pid: child.pid, port, listening, startMs: Date.now() - t0, requests: [] };
  if (listening) {
    for (const path of ['/api/stats', '/no-such-route']) {
      try {
        const response = await fetch(`http://127.0.0.1:${port}${path}`, { signal: AbortSignal.timeout(60_000) });
        const body = await response.text();
        row.requests.push(`${path} -> ${response.status} ${response.headers.get('content-type')} ${body.slice(0, 160)}`);
      } catch (error) {
        row.requests.push(`${path} -> FAILED ${error.message}`);
      }
    }
    child.kill('SIGTERM');
  }
  const exit = await Promise.race([exited, new Promise((ok) => setTimeout(() => ok(null), 60_000))]);
  if (!exit) child.kill('SIGKILL');
  row.exit = exit ?? 'no exit within 60 s after SIGTERM, SIGKILLed';
  row.stdout = out.trim();
  row.stderr = err.trim();
  return row;
}

console.log(`serve-start-proof: ${SERVE}`);
console.log(`node ${process.version}; 1-min load ${loadavg()[0].toFixed(1)}; ${new Date().toISOString()}`);
let failed = 0;
try {
  symlinkSync(SERVE, LINK);
  for (const [label, entry] of [['real-path', SERVE], ['symlinked', LINK]]) {
    const row = await startAndServe(label, entry);
    const ok = row.listening && row.requests.length === 2 && row.requests.every((r) => !r.includes('FAILED')) && row.exit?.code === 0;
    if (!ok) failed += 1;
    console.log(`\n== ${label}: ${ok ? 'STARTED AND SERVED' : 'FAILED'}`);
    console.log(`   entry     ${row.entry}`);
    console.log(`   pid ${row.pid}, port ${row.port}, listening ${row.listening} after ${row.startMs} ms`);
    for (const r of row.requests) console.log(`   request   ${r}`);
    console.log(`   exit      ${JSON.stringify(row.exit)}`);
    console.log(`   stdout    ${row.stdout || '(none)'}`);
    console.log(`   stderr    ${row.stderr || '(none)'}`);
  }
} finally {
  try { unlinkSync(LINK); } catch { /* gone */ }
  rmSync(scratch, { recursive: true, force: true });
}
console.log(`\n1-min load at end ${loadavg()[0].toFixed(1)}; ${failed ? `${failed} FAILED` : 'both started and served'}`);
process.exitCode = failed ? 1 : 0;

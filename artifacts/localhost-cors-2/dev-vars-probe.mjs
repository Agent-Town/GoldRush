#!/usr/bin/env node
/**
 * dev-vars-probe.mjs (localhost-cors-2): which local runner reads the development switch, measured at runtime
 * rather than only read from wrangler's source. It starts `wrangler pages dev public` at the repo root twice, the
 * way the harnesses do (cwd = root, no --binding for the switch), and sends each a CORS preflight to /api/stats
 * from a localhost origin and from the county origin:
 *   arm A, no .dev.vars in the root: localhost refused (403, no allow-origin), county admitted;
 *   arm B, .dev.vars copied from .dev.vars.example: localhost admitted (204 and allow-origin), county admitted,
 *          and wrangler's own log names the file it read.
 * The copied .dev.vars stays afterwards: it is the gitignored developer file this slice asks for.
 * Loopback only: each server listens on 127.0.0.1 and is stopped by its own pid; nothing leaves the machine.
 * It refuses to run if .dev.vars, .env or .env.local already exists in the root (any of them would change arm A).
 * usage (repo root, under the drain lock): node artifacts/localhost-cors-2/dev-vars-probe.mjs
 */
import { spawn, spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const STATE = path.join(ROOT, 'test-results/localhost-cors-2-dev-vars');
const LOCALHOST = 'http://localhost:5188';
const COUNTY = 'https://agenttown.app';

for (const name of ['.dev.vars', '.env', '.env.local']) {
  if (existsSync(path.join(ROOT, name))) {
    console.log(`REFUSED: ${name} already exists in the repo root, so arm A would not be a fresh checkout`);
    process.exit(3);
  }
}
mkdirSync(STATE, { recursive: true });

function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
    server.on('error', reject);
  });
}

function cleanEnv() {
  const env = { ...process.env };
  for (const key of ['DEV_AUTH', 'RESEND_API_KEY', 'AUTH_CODE_PEPPER', 'ALLOW_LOCALHOST_ORIGINS']) delete env[key];
  return env;
}

async function arm(label) {
  const port = await freePort();
  const child = spawn('wrangler', ['pages', 'dev', 'public', '--compatibility-date', '2026-07-08', '--port', String(port), '--ip', '127.0.0.1',
    '--persist-to', path.join(STATE, label), '--show-interactive-dev-session=false'], { cwd: ROOT, env: cleanEnv(), stdio: ['ignore', 'pipe', 'pipe'] });
  let logs = '';
  child.stdout.on('data', (chunk) => { logs += chunk; });
  child.stderr.on('data', (chunk) => { logs += chunk; });
  const base = `http://127.0.0.1:${port}`;
  try {
    const started = Date.now();
    for (;;) {
      if (child.exitCode !== null) throw new Error(`wrangler exited early:\n${logs}`);
      if (Date.now() - started > 60_000) throw new Error(`wrangler did not become ready:\n${logs}`);
      try {
        const ready = await fetch(`${base}/api/stats`, { headers: { Origin: COUNTY } });
        if (ready.status < 500) break;
      } catch {
        // still starting
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    const ask = async (origin) => {
      const response = await fetch(`${base}/api/stats`, { method: 'OPTIONS', headers: { Origin: origin, 'Access-Control-Request-Method': 'GET' } });
      return { status: response.status, allow: response.headers.get('access-control-allow-origin') };
    };
    const read = logs.split('\n').filter((line) => /Using (secrets|vars) defined in/.test(line)).map((line) => line.replace(/\u001b\[[0-9;]*m/g, '').trim());
    return { pid: child.pid, localhost: await ask(LOCALHOST), county: await ask(COUNTY), read };
  } finally {
    child.kill('SIGTERM');
    await new Promise((resolve) => {
      const timer = setTimeout(resolve, 3000);
      child.once('exit', () => { clearTimeout(timer); resolve(); });
    });
    if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
  }
}

const a = await arm('arm-a-no-dev-vars');
copyFileSync(path.join(ROOT, '.dev.vars.example'), path.join(ROOT, '.dev.vars'));
const b = await arm('arm-b-dev-vars');
const ignored = spawnSync('git', ['-C', ROOT, 'check-ignore', '-v', '.dev.vars'], { encoding: 'utf8' });
const example = spawnSync('git', ['-C', ROOT, 'check-ignore', '-q', '.dev.vars.example'], { encoding: 'utf8' });
const okA = a.localhost.status === 403 && a.localhost.allow === null && a.county.allow === COUNTY && a.read.length === 0;
const okB = b.localhost.status === 204 && b.localhost.allow === LOCALHOST && b.county.allow === COUNTY && b.read.some((line) => line.includes('.dev.vars'));
console.log('dev-vars-probe: wrangler pages dev public at the repo root, preflight OPTIONS /api/stats, loopback only');
console.log(`arm A (no .dev.vars, pid ${a.pid}): localhost ${a.localhost.status} allow=${a.localhost.allow ?? '(none)'}; county ${a.county.status} allow=${a.county.allow ?? '(none)'}; wrangler read: ${a.read.join(' / ') || '(no variables file)'} :: ${okA ? 'ok' : 'MISMATCH'}`);
console.log(`arm B (.dev.vars from .dev.vars.example, pid ${b.pid}): localhost ${b.localhost.status} allow=${b.localhost.allow ?? '(none)'}; county ${b.county.status} allow=${b.county.allow ?? '(none)'}; wrangler read: ${b.read.join(' / ') || '(no variables file)'} :: ${okB ? 'ok' : 'MISMATCH'}`);
console.log(`git check-ignore: ${ignored.stdout.trim() || `rc ${ignored.status}`}; .dev.vars.example ${example.status === 1 ? 'not ignored' : `check-ignore rc ${example.status}`}`);
console.log(okA && okB
  ? 'VERDICT: wrangler pages dev reads the root .dev.vars; without it a localhost page is refused, with it admitted; the county origin is admitted either way.'
  : 'VERDICT: MISMATCH (see the arms above).');
process.exitCode = okA && okB ? 0 : 1;

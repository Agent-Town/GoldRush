import { execFileSync, spawn } from 'node:child_process';
import { createWriteStream, appendFileSync } from 'node:fs';

const ROOT = '/Users/robin/Claude/Projects/Gold Rush';
const DIR = `${ROOT}/gate-s1510`;
const PORT = '5234';
const ref = process.argv[2];

// 1. kill any vite on the port, then checkout
try { execFileSync('pkill', ['-f', `--port ${PORT}`]); } catch {}
await new Promise((r) => setTimeout(r, 1500));

execFileSync('git', ['checkout', '--detach', '--force', ref], { cwd: DIR, stdio: 'inherit' });
const head = execFileSync('git', ['log', '-1', '--format=%H %cI %s'], { cwd: DIR, encoding: 'utf8' }).trim();

// 2. boot vite
const log = createWriteStream(`${ROOT}/logs/session-scratch/s1510-vite-${PORT}.log`, { flags: 'a' });
const vite = spawn('npm', ['run', 'dev', '--', '--port', PORT, '--strictPort', '--host', '127.0.0.1'],
  { cwd: DIR, stdio: ['ignore', 'pipe', 'pipe'] });
vite.stdout.pipe(log); vite.stderr.pipe(log);
await new Promise((r) => setTimeout(r, 5000));

// 3. run only the routing test, workers=1
let rc = 0, out = '';
try {
  out = execFileSync('npx', ['playwright', 'test', 'e2e/landmark-collision.spec.ts',
    '-g', 'enemy blocker routing is deterministic and goes around a county landmark',
    '--workers=1', '--reporter=line'], {
    cwd: DIR, encoding: 'utf8',
    env: { ...process.env, GR_CAPTURE_EXTERNAL_SERVER: '1', GR_CAPTURE_BASE_URL: `http://127.0.0.1:${PORT}` },
  });
} catch (e) { rc = e.status ?? 1; out = `${e.stdout ?? ''}${e.stderr ?? ''}`; }

vite.kill('SIGTERM');
const verdict = rc === 0 ? 'GREEN' : 'RED';
const tail = out.split('\n').filter((l) => /passed|failed|Error:|›/.test(l)).slice(-6).join('\n');
const rec = `\n===== ${ref} => ${verdict} (rc=${rc})\n${head}\n${tail}\n`;
appendFileSync(`${ROOT}/artifacts/s1510-landmark-bisect.txt`, rec);
console.log(rec);
process.exit(0);

// s1507 — the gate battery, run on the MERGED tree inside gate-s1507.
// All playwright with --workers=1 (§3.1: a fire-shell default-workers run is a known-unreliable
// instrument, so its reds would be the shell's, not the slice's).
import { spawnSync } from 'node:child_process';
import { createServer } from 'node:net';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const GATE = join(ROOT, 'gate-s1507');

const env = { ...process.env };
delete env.NODE_TEST_CONTEXT;

function portFree(port) {
  return new Promise((resolve) => {
    const s = createServer();
    s.once('error', () => resolve(false));
    s.once('listening', () => s.close(() => resolve(true)));
    s.listen(port, '127.0.0.1');
  });
}

// Mistake #12 / the 5188-held law: probe before gating, never assume.
const free = await portFree(5188);
console.log(`port 5188 free: ${free}${free ? '' : '  <-- something is listening; gate would read ITS server'}`);
if (!free) { console.log('REFUSING to gate against an unknown server.'); process.exit(2); }

const steps = process.argv.slice(2);
const results = [];

function step(label, cmd, args, opts = {}) {
  const t0 = Date.now();
  const r = spawnSync(cmd, args, {
    cwd: GATE, encoding: 'utf8', env, maxBuffer: 64 * 1024 * 1024, ...opts,
  });
  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  const out = `${r.stdout}${r.stderr}`;
  const tally = /(\d+) passed|(\d+) failed/.test(out)
    ? (out.match(/\d+ (?:passed|failed|flaky|skipped)/g) || []).join(', ')
    : '';
  results.push({ label, rc: r.status, secs, tally });
  console.log(`\n=== ${label} — rc=${r.status} (${secs}s) ${tally}`);
  if (r.status !== 0) {
    const lines = out.split('\n');
    const interesting = lines.filter((l) => /✘|Error|error TS|failed|Expected|Received|✖/.test(l));
    console.log(interesting.slice(0, 40).join('\n') || out.slice(-3000));
  }
  return r.status;
}

for (const s of steps) {
  if (s === 'tsc') step('tsc --noEmit', 'npx', ['tsc', '--noEmit']);
  else if (s === 'build') step('npm run build', 'npm', ['run', 'build']);
  else step(`playwright ${s}`, 'npx', ['playwright', 'test', s, '--workers=1', '--reporter=line']);
}

console.log('\n---- SUMMARY ----');
for (const r of results) console.log(`${String(r.rc).padEnd(2)} ${r.secs.padStart(7)}s  ${r.label}  ${r.tally}`);
console.log(results.every((r) => r.rc === 0) ? 'ALL GREEN' : 'RED PRESENT');

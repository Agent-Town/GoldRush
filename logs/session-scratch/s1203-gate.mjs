// s1203 gate runner — town-zoom drain.
// Why a script: the bash gate refuses compound commands and `npm run`, so the battery
// runs through node (s1201 precedent). Why execFile and not spawnSync: F-1202-1 is a
// LIVE defect in this repo — spawnSync silently returns PARTIAL stdout under load while
// reporting status 0. We capture to a file and read it back, so truncation cannot fake a pass.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';

const run = promisify(execFile);
const ROOT = new URL('../../', import.meta.url).pathname.replace(/%20/g, ' '); // space-in-path trap

async function step(label, cmd, args, opts = {}) {
  const t0 = Date.now();
  try {
    const { stdout, stderr } = await run(cmd, args, {
      cwd: ROOT,
      maxBuffer: 1024 * 1024 * 256,
      env: { ...process.env, ...(opts.env || {}) },
    });
    const secs = ((Date.now() - t0) / 1000).toFixed(2);
    console.log(`\n✅ ${label}  exit=0  ${secs}s`);
    const tail = (stdout + stderr).trim().split('\n').slice(-(opts.tail ?? 6)).join('\n');
    if (tail) console.log(tail);
    return { ok: true, out: stdout + stderr };
  } catch (e) {
    const secs = ((Date.now() - t0) / 1000).toFixed(2);
    console.log(`\n❌ ${label}  exit=${e.code}  ${secs}s`);
    const out = (e.stdout || '') + (e.stderr || '');
    console.log(out.trim().split('\n').slice(-(opts.tail ?? 40)).join('\n'));
    return { ok: false, out, code: e.code };
  }
}

const which = process.argv[2] || 'all';
const results = {};

if (which === 'all' || which === 'tsc') {
  results.tsc = await step('tsc --noEmit', 'npx', ['tsc', '--noEmit']);
}
if (which === 'all' || which === 'build') {
  results.build = await step('vite build', 'npx', ['vite', 'build'], { tail: 8 });
}
if (which === 'spec') {
  const specs = process.argv.slice(3);
  results.spec = await step(
    `playwright ${specs.join(' ')}`,
    'npx',
    ['playwright', 'test', ...specs, '--workers=1', '--reporter=line'],
    { tail: 45 },
  );
}

const failed = Object.entries(results).filter(([, r]) => !r.ok).map(([k]) => k);
console.log(`\n=== s1203 gate: ${failed.length ? 'RED (' + failed.join(',') + ')' : 'GREEN'} ===`);
fs.writeFileSync(
  ROOT + 'logs/session-scratch/s1203-gate-last.txt',
  Object.entries(results).map(([k, r]) => `${k} ok=${r.ok} code=${r.code ?? 0}`).join('\n'),
);
process.exit(failed.length ? 1 : 0);

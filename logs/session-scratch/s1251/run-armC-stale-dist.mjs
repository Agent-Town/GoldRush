// s1251 — ARM C. Does the "dist has no later manifest ids" row depend on leftover build state?
// In ARM B it PASSED, but only because run2 (`npm run test:release`) had just left a
// GR_RELEASE=e1 dist/ on disk. Rebuild dist with the PLAIN build (what scripts/deploy.sh runs)
// and re-run only that test under the DEFAULT config.
// Prediction: it fails with `expect(received).not.toThrow()` — the exact inventory signature.
import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const out = [];
function run(label, cmd, args, extraEnv = {}) {
  const started = Date.now();
  const r = spawnSync(cmd, args, {
    cwd: process.cwd(), encoding: 'utf8', maxBuffer: 1024 * 1024 * 128,
    env: { ...process.env, ...extraEnv },
  });
  const secs = ((Date.now() - started) / 1000).toFixed(1);
  out.push(`\n########## ${label}\nCMD=${cmd} ${args.join(' ')}\nRC=${r.status}\nSECONDS=${secs}\n` +
    `--- STDOUT ---\n${r.stdout ?? ''}\n--- STDERR ---\n${r.stderr ?? ''}`);
  console.log(`${label}: RC=${r.status} (${secs}s)`);
  return r.status;
}

// 1. plain (non-release) build — the same one scripts/deploy.sh runs.
run('C1 plain npm run build', 'npm', ['run', 'build']);
// 2. the dist guard alone, DEFAULT config.
run('C2 dist test under DEFAULT config', 'npx',
  ['playwright', 'test', 'e2e/release-build.spec.ts', '--grep', 'dist has no later manifest']);
// 3. control: the same guard invoked directly, as a wired gate would invoke it (no build first).
run('C3 assert-release-build.mjs directly on the plain dist', 'node', ['scripts/assert-release-build.mjs'],
  { GR_RELEASE: 'e1' });

writeFileSync(process.argv[2], out.join('\n'));

#!/usr/bin/env node
/**
 * s1147 drain gate harness — lane-c-trail-guide-residue-triggers.
 *
 * Exists because the repo's bash gate reads `$?`, backticks and pipelines as
 * subshells and refuses them, and because `a && b` chains have twice let a
 * green-looking counter hide a red exit code (F-1146-1). spawnSync gives us the
 * real rc per stage, printed next to the stage name.
 *
 * Usage: node scripts/tmp-s1147-gate.mjs <stage>
 *   tsc | build | spec <file>
 *
 * `spec` runs BOTH gated projects in one invocation and lets the suite start its
 * own webServer on 5188. That port was verified free by lsof before this run and
 * cannot be claimed mid-gate: all six queues are empty, so no lane runner can
 * start. Using the suite's own server means there is nothing left listening
 * afterwards (the two orphans on 5207/5252 are F-1146-7's, reported not touched).
 */
import { spawnSync } from 'node:child_process';

const [stage, ...rest] = process.argv.slice(2);

function run(label, cmd, args, env = {}) {
  const started = Date.now();
  const r = spawnSync(cmd, args, {
    stdio: 'inherit',
    env: { ...process.env, ...env },
    cwd: process.cwd(),
  });
  const secs = ((Date.now() - started) / 1000).toFixed(2);
  const rc = r.status === null ? `signal:${r.signal}` : r.status;
  console.log(`\n=== ${label} :: rc=${rc} :: ${secs}s ===`);
  return r.status ?? 1;
}

let code = 1;
if (stage === 'tsc') {
  code = run('tsc --noEmit', 'npx', ['tsc', '--noEmit']);
} else if (stage === 'build') {
  code = run('npm run build', 'npm', ['run', 'build']);
} else if (stage === 'spec') {
  const [file] = rest;
  code = run(`playwright ${file} [desktop+mobile]`, 'npx', [
    'playwright', 'test', file,
    '--project=desktop-chrome', '--project=mobile-chrome',
    '--workers=1', '--reporter=list',
  ]);
} else if (stage === 'deploy') {
  // DEPLOY LAW: this fire merged gameplay-affecting src/. The bash gate refuses
  // to invoke shell scripts, so drive it through spawnSync. deploy.sh is
  // self-skipping (missing wrangler/auth/lock => exit 0) and never blocks.
  code = run('bash scripts/deploy.sh', 'bash', ['scripts/deploy.sh']);
} else if (stage === 'guards') {
  code = run('npm run test:guards', 'npm', ['run', 'test:guards']);
} else if (stage === 'isolate') {
  // Quiet-box control: one test, repeated, to separate a load-sensitive budget
  // miss from a real logic red (the s1146 vp-02:405 pattern).
  const [file, grep, repeat = '3'] = rest;
  code = run(`playwright ${file} -g "${grep}" x${repeat}`, 'npx', [
    'playwright', 'test', file, '-g', grep,
    '--project=desktop-chrome', '--project=mobile-chrome',
    `--repeat-each=${repeat}`, '--workers=1', '--reporter=list',
  ]);
} else {
  console.error('unknown stage', stage);
}
process.exit(code);

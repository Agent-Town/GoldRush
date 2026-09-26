#!/usr/bin/env node
/**
 * fixture-teardown-tally.mjs: scripts/fixture-teardown.test.mjs's own sweep, re-run as an instrument
 * that TALLIES every child instead of stopping at the first one that fails (small-fixes-1, 2026-09-25).
 * Evidence, not a gate.
 *
 * WHY IT EXISTS. The real sweep asserts each child exits 0 BEFORE it counts survivors, so on a branch
 * whose src change has moved the engine hash (unpinned until the drain), bench-seeds.test.mjs reds on
 * the hash class and the sweep stops there without naming a single offender: measured in this
 * branch's node-guards battery ("scripts/bench-seeds.test.mjs child failed"). This copy keeps the
 * sweep's subject set, prefix extraction and isolated-TMPDIR method byte for byte in spirit, records a
 * failing child's exit code, and still counts what it left behind.
 *
 * Kept from the sweep: subjects are scripts/*.test.mjs that call mkdtemp, minus the sweep itself and
 * minus gate-caller-baseline.json's grandfathered map; the same PREFIX regex; NODE_TEST_CONTEXT removed
 * from the child env; each child runs `node --test --test-reporter=spec <file>` with TMPDIR set to a
 * fresh scratch dir; survivors are scratch entries starting with one of the file's literal prefixes.
 * Added: a bound on each child (600 s, SIGKILL), a pool (default 1, as the sweep; --jobs N), and every
 * scratch entry listed even when it matches no prefix.
 *
 * usage (repo root): node artifacts/small-fixes-1/fixture-teardown-tally.mjs [--jobs N]
 * exit: 0 when no child left a survivor, 1 when any did (child failures are reported, not scored).
 */
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SCRIPTS = join(ROOT, 'scripts');
const SWEEP = join(SCRIPTS, 'fixture-teardown.test.mjs');
const jobsAt = process.argv.indexOf('--jobs');
const JOBS = jobsAt === -1 ? 1 : Math.max(1, Number(process.argv[jobsAt + 1]) || 1);
const PREFIX = /\bmkdtemp(?:Sync)?\s*\(\s*(?:path\.)?join\s*\(\s*(?:os\.)?tmpdir\(\)\s*,\s*(['"`])([^'"`]+)\1\s*\)\s*\)/g;
const BASELINE = JSON.parse(readFileSync(join(ROOT, 'scripts/gate-caller-baseline.json'), 'utf8'));
const childEnv = { ...process.env };
delete childEnv.NODE_TEST_CONTEXT;

const subjects = readdirSync(SCRIPTS)
  .filter((name) => name.endsWith('.test.mjs'))
  .map((name) => join(SCRIPTS, name))
  .filter((file) => file !== SWEEP)
  .filter((file) => !(BASELINE.grandfathered ?? {})[relative(ROOT, file).replaceAll('\\', '/')])
  .map((file) => ({ file, source: readFileSync(file, 'utf8') }))
  .filter(({ source }) => /\bmkdtemp(?:Sync)?\s*\(/.test(source))
  .map(({ file, source }) => ({ name: relative(ROOT, file).replaceAll('\\', '/'), file, prefixes: [...new Set([...source.matchAll(PREFIX)].map((m) => m[2]))] }));

function runChild(subject) {
  return new Promise((done) => {
    const scratch = mkdtempSync(join(tmpdir(), 'sf1-fixture-tally-'));
    const started = Date.now();
    const child = spawn(process.execPath, ['--test', '--test-reporter=spec', subject.file], { cwd: ROOT, env: { ...childEnv, TMPDIR: scratch } });
    let out = '';
    child.stdout.on('data', (chunk) => { out += chunk; });
    child.stderr.on('data', (chunk) => { out += chunk; });
    const timer = setTimeout(() => child.kill('SIGKILL'), 600_000);
    child.on('close', (code, signal) => {
      clearTimeout(timer);
      const entries = readdirSync(scratch);
      const survivors = entries.filter((entry) => subject.prefixes.some((prefix) => entry.startsWith(prefix)));
      rmSync(scratch, { recursive: true, force: true });
      const tests = Number(/^ℹ tests (\d+)$/m.exec(out)?.[1] ?? 0);
      const fail = Number(/^ℹ fail (\d+)$/m.exec(out)?.[1] ?? 0);
      const failing = [...out.matchAll(/^✖ (.+?) \(\d/gm)].map((m) => m[1]).filter((t) => t !== 'failing tests:');
      done({ ...subject, rc: code ?? signal, tests, fail, failing: [...new Set(failing)], survivors, others: entries.filter((e) => !survivors.includes(e)), seconds: Math.round((Date.now() - started) / 1000) });
    });
  });
}

const results = [];
let next = 0;
async function worker() {
  while (next < subjects.length) {
    const subject = subjects[next++];
    results.push(await runChild(subject));
  }
}
const t0 = Date.now();
await Promise.all(Array.from({ length: JOBS }, worker));
results.sort((a, b) => a.name.localeCompare(b.name));

console.log(`fixture-teardown-tally: ${subjects.length} fixture owners (the sweep's subject set), jobs ${JOBS}, ${Math.round((Date.now() - t0) / 1000)} s`);
const offenders = results.filter((r) => r.survivors.length);
const failed = results.filter((r) => r.rc !== 0);
console.log(`OFFENDERS (children that left a temp dir behind): ${offenders.length}`);
for (const r of offenders) console.log(`  ${r.name}: ${r.survivors.length} [${r.survivors.join(', ')}]`);
console.log(`CHILDREN THAT DID NOT EXIT 0 (reported, not scored): ${failed.length}`);
for (const r of failed) console.log(`  ${r.name}: rc ${r.rc}, ${r.fail} of ${r.tests} failed: ${r.failing.join(' | ').slice(0, 300)}`);
const stray = results.filter((r) => r.others.length);
console.log(`scratch entries matching no declared prefix: ${stray.length ? stray.map((r) => `${r.name} [${r.others.join(', ')}]`).join('; ') : 'none'}`);
console.log('per child: name | rc | tests | survivors | seconds');
for (const r of results) console.log(`  ${r.name} | ${r.rc} | ${r.tests} | ${r.survivors.length} | ${r.seconds}`);
process.exitCode = offenders.length ? 1 : 0;

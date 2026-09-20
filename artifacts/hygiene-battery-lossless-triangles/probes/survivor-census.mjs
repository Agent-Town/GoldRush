// The fixture-teardown sweep's own measurement, but WITHOUT its fail-fast on a child's status:
// every mkdtemp-using guard is run as a child with a private TMPDIR and its survivors counted,
// so a single unrelated red child cannot hide the survivor answer this item is gated on.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SELF = fileURLToPath(import.meta.url);
const SCRIPTS = resolve(dirname(SELF), '../../../scripts');
const ROOT = resolve(SCRIPTS, '..');
const childEnv = { ...process.env };
delete childEnv.NODE_TEST_CONTEXT;
const PREFIX = /\bmkdtemp(?:Sync)?\s*\(\s*(?:path\.)?join\s*\(\s*(?:os\.)?tmpdir\(\)\s*,\s*(['"`])([^'"`]+)\1\s*\)\s*\)/g;
const BASELINE = JSON.parse(readFileSync(join(ROOT, 'scripts/gate-caller-baseline.json'), 'utf8'));
const subjects = readdirSync(SCRIPTS).filter((n) => n.endsWith('.test.mjs')).map((n) => join(SCRIPTS, n))
  .filter((f) => !f.endsWith('fixture-teardown.test.mjs'))
  .filter((f) => !(BASELINE.grandfathered ?? {})[relative(ROOT, f).replaceAll('\\', '/')])
  .map((f) => ({ file: f, source: readFileSync(f, 'utf8') }))
  .filter(({ source }) => /\bmkdtemp(?:Sync)?\s*\(/.test(source));
console.log(`subjects: ${subjects.length}`);
const leaks = []; const reds = [];
for (const { file, source } of subjects) {
  const name = relative(ROOT, file).replaceAll('\\', '/');
  const prefixes = [...new Set([...source.matchAll(PREFIX)].map((m) => m[2]))];
  const scratch = mkdtempSync(join(tmpdir(), 'gold-rush-survivor-census-'));
  try {
    const run = spawnSync(process.execPath, ['--test', '--test-reporter=spec', file],
      { cwd: ROOT, encoding: 'utf8', env: { ...childEnv, TMPDIR: scratch, GR_GUARD_NO_ARTIFACT: '1' } });
    if (run.status !== 0) reds.push(`${name} (status ${run.status}${run.signal ? ' ' + run.signal : ''})`);
    const survivors = readdirSync(scratch).filter((e) => prefixes.some((p) => e.startsWith(p)));
    if (survivors.length) leaks.push(`${name}: ${survivors.length} (${survivors.slice(0, 4).join(', ')})`);
  } finally { rmSync(scratch, { recursive: true, force: true }); }
}
console.log(`\nLEAKING FILES (${leaks.length}):\n${leaks.join('\n') || '  none'}`);
console.log(`\nCHILDREN THAT DID NOT EXIT 0 (${reds.length}):\n${reds.join('\n') || '  none'}`);

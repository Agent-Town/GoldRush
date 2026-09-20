// s1507 / F-1506-1 — the version hypothesis is REFUTED by the lane's own log: the outer run
// reported `tests 2` (per-test granularity), so the lane's node is v24+/v26-class, same as the
// fire's. Yet the guard's INNER child reported `tests 1 / cancelled 1` — the whole fixture file
// cancelled as one unit.
//
// Same binary, two granularities => something in the ARRANGEMENT selects node:test's isolation
// mode. The guard spawns with `cwd: ROOT` (the repo); my first probe used the fixture's own dir.
// This isolates cwd, and nothing else.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));

const FIXTURE = `
import test from 'node:test';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
test('unbounded sibling', async () => { await sleep(3000); });
test('explicitly bounded sibling', { timeout: 10_000 }, async () => { await sleep(3000); });
`;

const env = { ...process.env };
delete env.NODE_TEST_CONTEXT;

const dir = mkdtempSync(join(tmpdir(), 's1507-cwd-'));
const file = join(dir, 'override.test.mjs');
writeFileSync(file, FIXTURE);

console.log('node', process.version);
console.log('ROOT =', ROOT);
console.log('node.config.json present at ROOT?', existsSync(join(ROOT, 'node.config.json')));
console.log();

const arms = [
  ['cwd = repo ROOT  (what the guard does)', ROOT],
  ['cwd = fixture dir (what my first probe did)', dir],
];

for (const [label, cwd] of arms) {
  const child = spawnSync(process.execPath, ['--test', '--test-timeout=1000', file], {
    encoding: 'utf8', env, cwd,
  });
  const out = `${child.stdout}${child.stderr}`;
  const num = (l) => {
    const m = new RegExp(`^\\u2139 ${l} (\\d+)$`, 'm').exec(out);
    return m ? m[1] : '-';
  };
  const won = /✔ explicitly bounded sibling/.test(out);
  console.log(`--- ${label}`);
  console.log(`    rc=${child.status} tests=${num('tests')} pass=${num('pass')} ` +
              `fail=${num('fail')} cancelled=${num('cancelled')}`);
  console.log(`    guard's direction-2 assertion (/✔ explicitly bounded sibling/): ${won ? 'PASS' : 'FAIL'}`);
  console.log();
}

rmSync(dir, { recursive: true, force: true });

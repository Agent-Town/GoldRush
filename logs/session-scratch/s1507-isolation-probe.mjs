// s1507 / F-1506-1 — is the divergence node:test's ISOLATION MODE, and can it be PINNED?
//
// Established: v23.x bounds --test-timeout at FILE granularity (`tests 1`, whole file cancelled,
// per-test {timeout} never consulted); v24+/v26 bounds per-test (`tests 2`). The lane's inner
// child showed the v23-shaped FILE-level result. If isolation is what selects that, then pinning
// it makes every shell agree — which is what a factory GATE requires.
//
// Direction 2 matters as much as direction 1 (the fire-shell-serialisation.test.mjs shape):
// a pin that fixes v23 but breaks v26 is not a cure.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const FIXTURE = `
import test from 'node:test';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
test('unbounded sibling', async () => { await sleep(3000); });
test('explicitly bounded sibling', { timeout: 10_000 }, async () => { await sleep(3000); });
`;

const env = { ...process.env };
delete env.NODE_TEST_CONTEXT;

const bins = [];
const nvmRoot = join(process.env.HOME, '.nvm/versions/node');
if (existsSync(nvmRoot)) {
  for (const v of readdirSync(nvmRoot).sort()) {
    const b = join(nvmRoot, v, 'bin', 'node');
    if (existsSync(b)) bins.push(b);
  }
}
bins.push(process.execPath);

const dir = mkdtempSync(join(tmpdir(), 's1507-iso-'));
const file = join(dir, 'override.test.mjs');
writeFileSync(file, FIXTURE);

const ARMS = [
  ['bare', []],
  ['isolation=none', ['--experimental-test-isolation=none']],
  ['isolation=process', ['--experimental-test-isolation=process']],
];

console.log('Each cell: tests/cancelled — "per-test" = the {timeout:10_000} sibling survived.\n');
console.log('version   | ' + ARMS.map(([n]) => n.padEnd(20)).join('| '));
console.log('----------+-' + ARMS.map(() => '-'.repeat(20)).join('+-'));

for (const bin of bins) {
  const ver = spawnSync(bin, ['--version'], { encoding: 'utf8', env }).stdout.trim();
  if (!ver) continue;
  const cells = ARMS.map(([, flags]) => {
    const child = spawnSync(bin, ['--test', ...flags, '--test-timeout=1000', file], {
      encoding: 'utf8', env, cwd: dir,
    });
    const out = `${child.stdout}${child.stderr}`;
    if (/bad option|not allowed|Unknown|invalid/i.test(out) && child.status === 9) return 'unsupported';
    const t = /^ℹ tests (\d+)$/m.exec(out);
    const won = /✔ explicitly bounded sibling/.test(out);
    if (!t) return `rc=${child.status} (no counts)`;
    return `tests ${t[1]} — ${won ? 'per-test' : 'FILE-LEVEL'}`;
  });
  console.log(`${ver.padEnd(9)} | ` + cells.map((c) => c.padEnd(20)).join('| '));
}

rmSync(dir, { recursive: true, force: true });

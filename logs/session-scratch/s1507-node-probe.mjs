// s1507 / F-1506-1 — is the lane/fire divergence in node-guards-timeout.test.mjs a LOAD flake
// (s1506's UNVERIFIED hypothesis) or a NODE-VERSION semantic difference?
//
// The lane's recorded failure output is the clue: `tests 1 / cancelled 1`, with the FILE itself
// reported as the failing unit at ~1002ms — neither sibling test ever appeared. That is not a
// test finishing 3ms late; that is --test-timeout being applied to a different UNIT.
//
// Method: run the guard's own fixture verbatim under every node on this disk, plus whatever
// `/bin/zsh -lc` (the runner's shell) resolves, and report the unit each one bounds.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readdirSync, existsSync } from 'node:fs';

const FIXTURE = `
import test from 'node:test';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
test('unbounded sibling', async () => { await sleep(3000); });
test('explicitly bounded sibling', { timeout: 10_000 }, async () => { await sleep(3000); });
`;

const env = { ...process.env };
delete env.NODE_TEST_CONTEXT;

// What node does the runner's login shell actually resolve?
const loginNode = spawnSync('/bin/zsh', ['-lc', 'command -v node && node --version'], {
  encoding: 'utf8', env,
});
console.log('=== /bin/zsh -lc (the lane runner shell) ===');
console.log(loginNode.stdout.trim() || `(rc=${loginNode.status}) ${loginNode.stderr.trim()}`);
console.log();

const bins = [process.execPath];
const nvmRoot = join(process.env.HOME, '.nvm/versions/node');
if (existsSync(nvmRoot)) {
  for (const v of readdirSync(nvmRoot).sort()) {
    const b = join(nvmRoot, v, 'bin', 'node');
    if (existsSync(b)) bins.push(b);
  }
}
const loginPath = (loginNode.stdout || '').split('\n')[0].trim();
if (loginPath && existsSync(loginPath) && !bins.includes(loginPath)) bins.push(loginPath);

const dir = mkdtempSync(join(tmpdir(), 's1507-timeout-semantics-'));
const file = join(dir, 'override.test.mjs');
writeFileSync(file, FIXTURE);

console.log('=== node --test --test-timeout=1000 <fixture>, per node build ===');
console.log('version   | rc | tests | pass | fail | cancelled | per-test bound WON?');
console.log('----------+----+-------+------+------+-----------+--------------------');

for (const bin of bins) {
  const ver = spawnSync(bin, ['--version'], { encoding: 'utf8', env }).stdout.trim();
  const child = spawnSync(bin, ['--test', '--test-timeout=1000', file], {
    encoding: 'utf8', env, cwd: dir,
  });
  const out = `${child.stdout}${child.stderr}`;
  const num = (label) => {
    const m = new RegExp(`^\\u2139 ${label} (\\d+)$`, 'm').exec(out);
    return m ? m[1] : '-';
  };
  // The guard's own direction-2 assertion:
  const won = /✔ explicitly bounded sibling/.test(out);
  const lost = /✖ explicitly bounded sibling/.test(out);
  const verdict = won ? 'YES (per-test wins)' : lost ? 'NO (per-test lost)' : 'NEITHER — file cancelled whole';
  console.log(
    `${ver.padEnd(9)} | ${String(child.status).padEnd(2)} | ${num('tests').padEnd(5)} | ` +
    `${num('pass').padEnd(4)} | ${num('fail').padEnd(4)} | ${num('cancelled').padEnd(9)} | ${verdict}`,
  );
}

rmSync(dir, { recursive: true, force: true });

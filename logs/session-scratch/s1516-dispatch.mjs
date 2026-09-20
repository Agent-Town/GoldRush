// s1516 dispatch, F-1424-3 order: master+evidence committed FIRST (done),
// lane refreshed SECOND, the master's own citation keys re-grepped in the lane THIRD, cp LAST.
import { execSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';

const REPO = '/Users/robin/Claude/Projects/Gold Rush';
const LANE = `${REPO}/worktrees/lane-b`;
const sh = (c, cwd = REPO) => execSync(c, { cwd, encoding: 'utf8' }).trim();

// --- guard: refuse to touch the lane unless it is still provably lossless ---
const ahead = sh('git rev-list --count main..lane/b');
const dirt = sh('git -C worktrees/lane-b status --porcelain');
if (ahead !== '0') { console.error(`REFUSE: lane/b is ${ahead} ahead of main`); process.exit(2); }
if (dirt) { console.error('REFUSE: lane/b has dirt:\n' + dirt); process.exit(2); }
console.log(`pre-refresh: ahead=${ahead} dirt=none  behind=${sh('git rev-list --count lane/b..main')}`);

// --- 2. refresh ---
const ff = spawnSync('git', ['-C', LANE, 'merge', '--ff-only', 'main'], { cwd: REPO, encoding: 'utf8' });
console.log('ff-only rc =', ff.status, (ff.stdout || ff.stderr || '').trim().split('\n').slice(-2).join(' | '));
if (ff.status !== 0) process.exit(2);
console.log(`post-refresh: lane/b HEAD=${sh('git -C worktrees/lane-b rev-parse --short HEAD')} behind=${sh('git rev-list --count lane/b..main')}`);

// --- 3. re-grep the master's own keys IN THE LANE (F-1424-3: 0 here means the lane drifted) ---
const KEYS = [
  ['configured workers **', 'scripts/suite-red-inventory.mjs'],
  ['workers: isFireShell ? 1 : undefined,', 'playwright.config.ts'],
  ['reducer reports configured and actual workers distinctly', 'scripts/suite-red-inventory.test.mjs'],
];
let ok = true;
for (const [key, file] of KEYS) {
  const body = fs.readFileSync(`${LANE}/${file}`, 'utf8');
  const n = body.split('\n').filter((l) => l.includes(key)).length;
  console.log(`  key in lane: ${n} <- ${file}  "${key.slice(0, 44)}"`);
  if (n !== 1) ok = false;
}
// the line-50 bar the master asserts
const cfg = fs.readFileSync(`${LANE}/playwright.config.ts`, 'utf8').split('\n');
const line50 = cfg.findIndex((l) => l.includes('workers: isFireShell ? 1 : undefined,')) + 1;
console.log(`  workers line in lane = ${line50} (master requires 50)`);
if (line50 !== 50) ok = false;

console.log(ok ? '\nALL KEYS VERIFIED IN LANE — safe to cp' : '\nKEY MISMATCH — do NOT cp');
process.exit(ok ? 0 : 2);

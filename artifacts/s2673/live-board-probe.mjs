// s2673 — exercise the F-2671-2 cure against the REAL 20.5 MB board, in a copy.
// A fixture proves the logic; this proves the logic survives the actual line 1, with its
// 10k chars, its emoji and its three real desk items. Run in a temp dir so a hole in the
// cure cannot reach the live desk — arm 3 proves atomicity, but the desk is not the place
// to find out that an arm was wrong.
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, readFileSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = mkdtempSync(join(tmpdir(), 's2673-live-'));
mkdirSync(join(dir, 'scripts'));
const tool = join(dir, 'scripts', 'status-line1.mjs');
copyFileSync('scripts/status-line1.mjs', tool);
copyFileSync('STATUS.md', join(dir, 'STATUS.md'));
const status = join(dir, 'STATUS.md');
console.log('board copied:', (statSync(status).size / 1e6).toFixed(1), 'MB');

const run = (args) => {
  const r = spawnSync('node', [tool, ...args], { encoding: 'utf8', cwd: dir });
  return { rc: r.status ?? 1, out: r.stdout ?? '', err: r.stderr ?? '' };
};
const before = readFileSync(status);

// A desk-less lock line — exactly the shape s2671 wrote.
//
// ⚠️ {STAMP}, NOT A HAND-WRITTEN TIME. The first draft of this probe hardcoded 23:50Z while
// the clock read 23:33, so BOTH arms exited 1 on the FUTURE-STAMP guard (F-1039-2) and never
// reached the desk predicate at all. Arm A's "rc 1, board unchanged" was therefore a right
// answer for an unrelated reason, and arm B's red was the same guard firing on the good
// input. The rc alone could not tell them apart — which is why each arm now asserts the
// REASON, and why the probe writes the token instead of a time it computed itself.
const bad = join(dir, 'bad.txt');
writeFileSync(bad, 'ACTIVE {STAMP} (s2674 fire) — taking the lock, desk forgotten.', 'utf8');
const r1 = run(['set', bad]);
console.log('\nA. desk-less `set` against the live line 1');
console.log('   rc:', r1.rc, '(expect 1)');
console.log('   refused for the DESK, not another guard:', /F-2671-2/.test(r1.err), '(expect true)');
console.log('   board byte-identical:', Buffer.compare(readFileSync(status), before) === 0, '(expect true)');
console.log('   reason:', r1.err.split('\n')[0].slice(0, 170));

// The same act, carrying the real tail forward — the prescribed habit.
const line1 = (() => {
  const t = readFileSync(status, 'utf8');
  return t.slice(0, t.indexOf('\n'));
})();
const tail = line1.slice(line1.search(/🔺 \*\*OWNER.{0,2}S DESK —/));
const good = join(dir, 'good.txt');
writeFileSync(good, `ACTIVE {STAMP} (s2674 fire) — taking the lock, tail carried. ${tail}`, 'utf8');
const r2 = run(['set', good]);
const after = readFileSync(status, 'utf8');
console.log('\nB. the same `set` carrying the real tail forward');
console.log('   rc:', r2.rc, '(expect 0)');
console.log('   stderr empty:', r2.err.trim() === '', '(expect true)');
console.log('   line 1 is the NEW one:', after.startsWith('ACTIVE') && after.includes('tail carried'), '(expect true)');
console.log('   desk items on the new board:', (after.slice(0, after.indexOf('\n')).match(/🔺/g) ?? []).length - 1, '(expect 3)');
for (const id of ['F-2642-3', 'b1-device-verdict-rows', 'F-2299-1']) {
  console.log(`   carries ${id}:`, after.slice(0, after.indexOf('\n')).includes(id));
}
console.log('\ntemp board left at:', dir);

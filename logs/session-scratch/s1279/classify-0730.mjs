// s1279 TK-01: classify 2026-07-30 merges by TOUCHED PATHS on main (Mistake #16 guard:
// never classify by commit message). Coverage day = 2026-07-30 local (Bangkok, UTC+07).
import { execFileSync } from 'node:child_process';

const git = (args) => execFileSync('git', args, { maxBuffer: 1e9 }).toString();

const raw = git([
  'log',
  '--after=2026-07-30T00:00:00+07:00',
  '--before=2026-07-31T00:00:00+07:00',
  '--format=%H\x1f%cI\x1f%s',
  'main',
]).trim();

const lines = raw ? raw.split('\n') : [];
console.log('TOTAL COMMITS ON COVERAGE DAY 2026-07-30 (local):', lines.length);

const player = [];
const tools = [];
const book = [];

for (const line of lines) {
  const [h, d, subj] = line.split('\x1f');
  let files = [];
  try {
    files = git(['show', '--name-only', '--format=', h]).trim().split('\n').filter(Boolean);
  } catch { /* empty commit */ }
  const isPlayer = files.some((f) => /^(src\/|public\/|assets\/)/.test(f));
  const isTools = files.some((f) =>
    /^(scripts\/|e2e\/|functions\/|playwright|vite|tsconfig|package|\.claude\/)/.test(f));
  const rec = { h: h.slice(0, 8), t: d.slice(11, 16), subj, n: files.length, files };
  if (isPlayer) player.push(rec);
  else if (isTools) tools.push(rec);
  else book.push(rec);
}

console.log('PLAYER-VISIBLE:', player.length, '| TOOLS/NETS:', tools.length, '| BOOKKEEPING:', book.length);

const dump = (label, arr, withFiles) => {
  console.log('\n=== ' + label + ' ===');
  for (const r of arr) {
    console.log(r.h, r.t, '[' + r.n + 'f]', r.subj.slice(0, 150));
    if (withFiles) console.log('      ', r.files.slice(0, 12).join(' '));
  }
};

dump('PLAYER-VISIBLE', player, true);
dump('TOOLS AND NETS', tools, true);
if (process.env.SHOW_BOOK) dump('BOOKKEEPING', book, false);

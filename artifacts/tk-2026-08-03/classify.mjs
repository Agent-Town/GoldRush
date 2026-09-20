// TK-01 coverage-day classifier — 2026-08-03 local (Bangkok, UTC+07).
// Classifies main's first-parent commits by TOUCHED PATHS, never by headline (Mistake #16 guard).
// Merge commits are diffed against their first parent so the absorbed lane content is counted
// (git log --name-only is blind to merges otherwise).
import { execSync } from 'node:child_process';

const SINCE = '2026-08-03T00:00:00+07:00';
const UNTIL = '2026-08-04T00:00:00+07:00';
const SEP = String.fromCharCode(1);

const raw = execSync(
  `git log --first-parent main --diff-merges=first-parent --since="${SINCE}" --until="${UNTIL}" --format="%x01%h %s" --name-only`,
  { encoding: 'utf8', maxBuffer: 1e9 }
);

const recs = raw.split(SEP).filter((s) => s.trim());
const player = [], factory = [], book = [];

for (const r of recs) {
  const lines = r.split('\n');
  const head = lines[0].split('\\n')[0]; // some headlines carry literal \n
  const files = lines.slice(1).filter((l) => l.trim());
  const pv = files.filter((f) => /^(src|public|assets)\//.test(f));
  const fx = files.filter((f) => /^(scripts|e2e|functions|specs)\//.test(f));
  if (pv.length) player.push({ head, files, pv });
  else if (fx.length) factory.push({ head, files, fx });
  else book.push({ head, files });
}

console.log('first-parent commits:', recs.length);
console.log('PLAYER-PATH:', player.length, ' FACTORY-PATH:', factory.length, ' BOOKKEEPING:', book.length);
console.log('\n=== PLAYER-PATH ===');
for (const p of player) console.log(`${p.head}\n      pv(${p.pv.length}): ${p.pv.slice(0, 8).join(' ')}`);
console.log('\n=== FACTORY-PATH ===');
for (const f of factory) console.log(`${f.head}\n      fx(${f.fx.length}): ${f.fx.slice(0, 6).join(' ')}`);

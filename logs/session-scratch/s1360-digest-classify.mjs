// s1360 — TK-01 digest classifier for coverage day 2026-08-01 (local, +07).
// House method (ticker-digest-2026-07-31.md:3-4): classify by TOUCHED PATHS on main,
// never by commit message (Mistake #16 guard). Read-only; writes nothing.
import { execSync } from 'node:child_process';

const SINCE = '2026-08-01T00:00:00+07:00';
const UNTIL = '2026-08-02T00:00:00+07:00';

const raw = execSync(
  `git log --since="${SINCE}" --until="${UNTIL}" --format=%h%x1f%cI%x1f%s --name-only main`,
  { encoding: 'utf8', maxBuffer: 1e9 }
);

// Parse: a header line contains \x1f; following lines until blank are paths.
const commits = [];
let cur = null;
for (const line of raw.split('\n')) {
  if (line.includes('\x1f')) {
    const [hash, date, subject] = line.split('\x1f');
    cur = { hash, date, subject, paths: [] };
    commits.push(cur);
  } else if (line.trim() && cur) {
    cur.paths.push(line.trim());
  }
}

const isPlayer = (p) => /^(src|public|assets)\//.test(p);
const isFactory = (p) =>
  /^(scripts|functions|e2e|tests?)\//.test(p) ||
  /\.(test|spec)\.(mjs|ts|tsx|js)$/.test(p) ||
  /^(package\.json|playwright\.config\.ts|vite\.config\.ts|tsconfig.*\.json)$/.test(p);

const buckets = { player: [], factory: [], bookkeeping: [], empty: [] };
for (const c of commits) {
  if (c.paths.length === 0) { buckets.empty.push(c); continue; }
  if (c.paths.some(isPlayer)) buckets.player.push(c);
  else if (c.paths.some(isFactory)) buckets.factory.push(c);
  else buckets.bookkeeping.push(c);
}

console.log(`TOTAL commits on main, coverage day 2026-08-01 local: ${commits.length}`);
console.log(`  PLAYER-VISIBLE (src/ public/ assets/): ${buckets.player.length}`);
console.log(`  FACTORY tools/nets:                    ${buckets.factory.length}`);
console.log(`  BOOKKEEPING:                           ${buckets.bookkeeping.length}`);
console.log(`  (no paths / merge-empty):              ${buckets.empty.length}`);
console.log('\n=== PLAYER-VISIBLE, oldest first ===');
for (const c of buckets.player.slice().reverse()) {
  const shown = c.paths.filter(isPlayer);
  console.log(`\n${c.hash}  ${c.date.slice(11, 16)}  ${c.subject.slice(0, 130)}`);
  console.log(`   player paths (${shown.length}/${c.paths.length}): ${shown.slice(0, 8).join(' ')}`);
}

#!/usr/bin/env node
// TK-01 classifier for the 2026-08-05 ticker digest (compiled s1476).
// Classifies main's first-parent walk for the local day by TOUCHED PATHS, never by
// commit messages — Mistake #16 says a message matches every announcement of a thing,
// so only the diff is evidence. Re-derivable: node artifacts/tk-2026-08-05/classify.mjs
import { execSync } from 'node:child_process';

const SINCE = '2026-08-05T00:00:00+07:00';
const UNTIL = '2026-08-06T00:00:00+07:00';

const PLAYER = [/^src\//, /^public\//, /^assets\//];
const FACTORY = [/^scripts\//, /^e2e\//, /^\.claude\//, /^playwright\.config/, /^package\.json$/];

const log = execSync(
  `git log --first-parent --since="${SINCE}" --until="${UNTIL}" --format=%H%x09%P%x09%s`,
).toString().trim().split('\n').filter(Boolean);

let player = 0, factory = 0, bookkeeping = 0, merges = 0;
const playerCommits = [];

for (const line of log) {
  const [sha, parents, subject] = line.split('\t');
  if (parents.trim().split(/\s+/).length > 1) merges++;
  const files = execSync(`git show --pretty=format: --name-only ${sha}`)
    .toString().split('\n').map((f) => f.trim()).filter(Boolean);
  const isPlayer = files.some((f) => PLAYER.some((re) => re.test(f)));
  const isFactory = files.some((f) => FACTORY.some((re) => re.test(f)));
  if (isPlayer) { player++; playerCommits.push(`${sha.slice(0, 8)} ${subject}`); }
  else if (isFactory) factory++;
  else bookkeeping++;
}

console.log(`commits on first-parent walk : ${log.length}`);
console.log(`  merge commits              : ${merges}`);
console.log(`  touched player paths       : ${player}`);
console.log(`  touched factory tools only : ${factory}`);
console.log(`  bookkeeping only           : ${bookkeeping}`);
console.log('\nplayer-path commits:');
for (const c of playerCommits) console.log('  ' + c);

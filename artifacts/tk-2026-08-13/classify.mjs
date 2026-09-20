// TK-01 classifier for 2026-08-13 — copied from the prior day and moved only the window.
// It classifies main's first-parent walk by touched paths, never by commit message.
// Re-derivable: node artifacts/tk-2026-08-13/classify.mjs
import { execFileSync } from 'node:child_process';

const ROOT = '/Users/robin/Claude/Projects/Gold Rush';
const git = (args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' });
const SINCE = '2026-08-13T00:00:00+07:00';
const UNTIL = '2026-08-14T00:00:00+07:00';
const PLAYER = /^(src\/|public\/|assets\/)/;
const FACTORY = /^(scripts\/|e2e\/|functions\/|\.github\/|playwright\.config|package\.json|tsconfig)/;

const lines = git(['log', '--first-parent', '--since', SINCE, '--until', UNTIL,
  '--format=%H|%cI|%P|%s', 'main']).trim().split('\n').filter(Boolean);
const rows = lines.map((line) => {
  const [full, date, parents, ...rest] = line.split('|');
  const isMerge = parents.trim().split(/\s+/).length > 1;
  const args = isMerge
    ? ['show', '--first-parent', '-m', '--name-only', '--format=', full]
    : ['show', '--name-only', '--format=', full];
  const files = [...new Set(git(args).split('\n').map((value) => value.trim()).filter(Boolean))];
  return {
    short: full.slice(0, 8),
    date,
    subject: rest.join('|'),
    isMerge,
    player: files.some((file) => PLAYER.test(file)),
    factory: files.some((file) => FACTORY.test(file)),
  };
});

const merges = rows.filter((row) => row.isMerge);
const player = rows.filter((row) => row.player);
const factory = rows.filter((row) => !row.player && row.factory);
const bookkeeping = rows.filter((row) => !row.player && !row.factory);

console.log(`first-parent commits: ${rows.length}`);
console.log(`merge commits:        ${merges.length}`);
console.log(`player-visible paths: ${player.length}   (src/ public/ assets/)`);
console.log(`factory tools/nets:   ${factory.length}`);
console.log(`bookkeeping only:     ${bookkeeping.length}`);
console.log('\n--- player-visible ---');
for (const row of player) console.log(`${row.short} ${row.date.slice(11, 16)} ${row.subject.slice(0, 95)}`);
console.log('\n--- factory ---');
for (const row of factory) console.log(`${row.short} ${row.date.slice(11, 16)} ${row.subject.slice(0, 95)}`);

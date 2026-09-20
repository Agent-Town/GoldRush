// TK-01 classifier for 2026-08-10 — window moved from the 2026-08-09 one, reused rather than rewritten — classifies by TOUCHED PATHS on main's first-parent walk,
// never by commit message (Mistake #16: messages announce intent, --stat names content).
// Re-derivable: node artifacts/tk-2026-08-10/classify.mjs
import { execFileSync } from 'node:child_process';

const ROOT = '/Users/robin/Claude/Projects/Gold Rush';
const git = (args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' });

const SINCE = '2026-08-10T00:00:00+07:00';
const UNTIL = '2026-08-11T00:00:00+07:00';

const lines = git(['log', '--first-parent', '--since', SINCE, '--until', UNTIL,
  '--format=%H|%h|%cI|%P|%s', 'main']).trim().split('\n').filter(Boolean);

const PLAYER = /^(src\/|public\/|assets\/)/;
const FACTORY = /^(scripts\/|e2e\/|functions\/|\.github\/|playwright\.config|package\.json|tsconfig)/;

const rows = lines.map((l) => {
  const [full, short, date, parents, ...rest] = l.split('|');
  const subject = rest.join('|');
  // --stat against first parent; merges need -m --first-parent to show content
  const isMerge = parents.trim().split(/\s+/).length > 1;
  const args = isMerge
    ? ['show', '--first-parent', '-m', '--name-only', '--format=', full]
    : ['show', '--name-only', '--format=', full];
  let files = [];
  try { files = git(args).split('\n').map((s) => s.trim()).filter(Boolean); } catch {}
  files = [...new Set(files)];
  return {
    short, date, subject, isMerge, files,
    player: files.some((f) => PLAYER.test(f)),
    factory: files.some((f) => FACTORY.test(f)),
  };
});

const merges = rows.filter((r) => r.isMerge);
const player = rows.filter((r) => r.player);
const factory = rows.filter((r) => !r.player && r.factory);
const book = rows.filter((r) => !r.player && !r.factory);

console.log(`first-parent commits: ${rows.length}`);
console.log(`merge commits:        ${merges.length}`);
console.log(`player-visible paths: ${player.length}   (src/ public/ assets/)`);
console.log(`factory tools/nets:   ${factory.length}`);
console.log(`bookkeeping only:     ${book.length}`);
console.log('\n--- player-visible ---');
for (const r of player) console.log(`${r.short} ${r.date.slice(11, 16)} ${r.subject.slice(0, 95)}`);
console.log('\n--- factory ---');
for (const r of factory) console.log(`${r.short} ${r.date.slice(11, 16)} ${r.subject.slice(0, 95)}`);

// TK-01 path classifier for the 2026-08-19 digest (compiled s2076 fire).
// Same shape as artifacts/tk-2026-08-18/classify.mjs: walk first-parent main across the
// local day, classify each commit by the paths it actually touched, and report counts.
// Retained as the digest's evidence — the digest quotes these numbers, it does not assert them.
import { execFileSync } from 'node:child_process';

const REPO = '/Users/robin/Claude/Projects/Gold Rush';
const SINCE = '2026-08-19T00:00:00+07:00';
const UNTIL = '2026-08-20T00:00:00+07:00';

const git = (args) => execFileSync('git', args, { cwd: REPO, encoding: 'utf8' });

const log = git([
  'log', '--first-parent', 'main',
  `--since=${SINCE}`, `--until=${UNTIL}`,
  '--format=%H|%h|%cI|%P|%s',
]).trim().split('\n').filter(Boolean);

const PLAYER = /^(src|public|assets)\//;
const FACTORY = /^(scripts|specs|\.claude|package\.json|package-lock\.json|playwright\.config\.ts|vite\.config\.ts|AGENTS\.md|CLAUDE\.md)/;

const rows = log.map((line) => {
  const [full, short, iso, parents, ...rest] = line.split('|');
  const subject = rest.join('|');
  const files = git(['show', '--pretty=format:', '--name-only', full])
    .trim().split('\n').filter(Boolean);
  const isMerge = parents.trim().split(/\s+/).length > 1;
  return {
    short, iso, subject, isMerge, files,
    player: files.filter((f) => PLAYER.test(f)),
    factory: files.filter((f) => FACTORY.test(f)),
  };
});

const merges = rows.filter((r) => r.isMerge);
const withPlayer = rows.filter((r) => r.player.length > 0);
const withFactory = rows.filter((r) => r.player.length === 0 && r.factory.length > 0);
const bookkeeping = rows.filter((r) => r.player.length === 0 && r.factory.length === 0);

console.log(`window        : ${SINCE} .. ${UNTIL}`);
console.log(`first-parent  : ${rows.length}`);
console.log(`merges        : ${merges.length}`);
console.log(`player-visible: ${withPlayer.length}  (src/ public/ assets/)`);
console.log(`factory       : ${withFactory.length}`);
console.log(`bookkeeping   : ${bookkeeping.length}`);
console.log('');
for (const r of withPlayer) console.log(`PLAYER  ${r.short} ${r.subject}\n        ${r.player.join(' ')}`);
for (const r of merges) console.log(`MERGE   ${r.short} ${r.subject}`);
console.log('');
console.log('factory-touching commits:');
for (const r of withFactory) console.log(`  ${r.short} ${r.subject}\n      ${r.factory.join(' ')}`);

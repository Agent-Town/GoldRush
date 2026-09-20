// TK-01 path classifier for the 2026-08-20 digest (compiled s2111 fire).
// Same shape as artifacts/tk-2026-08-19/classify.mjs, with ONE deliberate change,
// explained here because it changes the numbers the digest quotes:
//
//   The inherited classifier listed a commit's files with `git show --name-only`.
//   For a TRUE merge commit (2+ parents) git prints the COMBINED diff, which is
//   empty for any path that matches one parent — so a merge that lands player code
//   reads as ZERO files and is filed as "bookkeeping". This walk is --first-parent,
//   so the question a digest asks is always "what did this commit bring onto main
//   relative to its first parent" — which is `git diff --name-only <sha>^1 <sha>`.
//   That is correct for merges AND identical to --name-only for ordinary commits.
//
// Both methods are computed and disagreements are reported, so the control is in
// the evidence rather than in a claim. Retained as the digest's evidence — the
// digest quotes these numbers, it does not assert them.
import { execFileSync } from 'node:child_process';

const REPO = '/Users/robin/Claude/Projects/Gold Rush';
const SINCE = '2026-08-20T00:00:00+07:00';
const UNTIL = '2026-08-21T00:00:00+07:00';

const git = (args) => execFileSync('git', args, { cwd: REPO, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

const log = git([
  'log', '--first-parent', 'main',
  `--since=${SINCE}`, `--until=${UNTIL}`,
  '--format=%H|%h|%cI|%P|%s',
]).trim().split('\n').filter(Boolean);

const PLAYER = /^(src|public|assets)\//;
const FACTORY = /^(scripts|specs|\.claude|package\.json|package-lock\.json|playwright\.config\.ts|vite\.config\.ts|AGENTS\.md|CLAUDE\.md)/;

const lines = (s) => s.trim().split('\n').filter(Boolean);

const rows = log.map((line) => {
  const [full, short, iso, parents, ...rest] = line.split('|');
  const subject = rest.join('|');
  const isMerge = parents.trim().split(/\s+/).length > 1;

  // first-parent diff: correct for merges and ordinary commits alike
  const files = lines(git(['diff', '--name-only', `${full}^1`, full]));
  // inherited method, kept only as a control
  const legacy = lines(git(['show', '--pretty=format:', '--name-only', full]));

  return {
    short, iso, subject, isMerge, files, legacy,
    player: files.filter((f) => PLAYER.test(f)),
    factory: files.filter((f) => FACTORY.test(f)),
    legacyPlayer: legacy.filter((f) => PLAYER.test(f)),
  };
});

const merges = rows.filter((r) => r.isMerge);
const withPlayer = rows.filter((r) => r.player.length > 0);
const withFactory = rows.filter((r) => r.player.length === 0 && r.factory.length > 0);
const bookkeeping = rows.filter((r) => r.player.length === 0 && r.factory.length === 0);

console.log(`window        : ${SINCE} .. ${UNTIL}`);
console.log(`first-parent  : ${rows.length}`);
console.log(`merges (2+ parents): ${merges.length}`);
console.log(`player-visible: ${withPlayer.length}  (src/ public/ assets/)`);
console.log(`factory       : ${withFactory.length}`);
console.log(`bookkeeping   : ${bookkeeping.length}`);
console.log('');

const disagree = rows.filter((r) => r.files.length !== r.legacy.length);
console.log(`CONTROL — commits where the inherited --name-only method disagrees: ${disagree.length}`);
for (const r of disagree) {
  console.log(`  ${r.short} merge=${r.isMerge} first-parent=${r.files.length} legacy=${r.legacy.length} player ${r.player.length} vs ${r.legacyPlayer.length}`);
  console.log(`      ${r.subject}`);
}
console.log('');

for (const r of withPlayer) console.log(`PLAYER  ${r.short} ${r.subject}\n        ${r.player.join(' ')}`);
console.log('');
console.log('factory-touching commits:');
for (const r of withFactory) console.log(`  ${r.short} ${r.subject}\n      ${r.factory.join(' ')}`);

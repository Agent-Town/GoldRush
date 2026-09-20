import { execFileSync } from 'node:child_process';

const git = (...a) => execFileSync('git', a, { encoding: 'utf8', maxBuffer: 1 << 28 });

const raw = git(
  'log',
  '--since=2026-07-31T00:00:00+07:00',
  '--until=2026-08-01T00:00:00+07:00',
  '--format=%H|%h|%s',
  'main',
).trim().split('\n').filter(Boolean);

const buckets = { player: [], tools: [], book: [] };

for (const line of raw) {
  const [full, short, ...rest] = line.split('|');
  const subject = rest.join('|');
  let files;
  try {
    files = git('show', '--name-only', '--format=', full).trim().split('\n').filter(Boolean);
  } catch {
    files = [];
  }
  const playerPaths = files.filter(
    (f) => f.startsWith('src/') || f.startsWith('public/') || f.startsWith('assets/'),
  );
  const toolPaths = files.filter(
    (f) => f.startsWith('scripts/') || f.startsWith('e2e/') || f.startsWith('env/') || f.startsWith('functions/'),
  );
  if (playerPaths.length) buckets.player.push({ short, subject, n: files.length, playerPaths });
  else if (toolPaths.length) buckets.tools.push({ short, subject, n: files.length, toolPaths });
  else buckets.book.push({ short, subject });
}

console.log('TOTAL', raw.length);
console.log('PLAYER', buckets.player.length, 'TOOLS', buckets.tools.length, 'BOOK', buckets.book.length);
console.log('\n=== PLAYER-PATH COMMITS ===');
for (const c of buckets.player) {
  console.log(`${c.short} [${c.n} files] ${c.subject}`);
  console.log('   ' + c.playerPaths.slice(0, 8).join(' , '));
}
console.log('\n=== TOOL-PATH COMMITS ===');
for (const c of buckets.tools) console.log(`${c.short} [${c.n}] ${c.subject.slice(0, 130)}`);

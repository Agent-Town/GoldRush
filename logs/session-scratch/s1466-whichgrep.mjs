// s1466: WHICH grep? My control arm used execFileSync('grep') (PATH lookup, no shell), while the
// original measurement went through the Bash tool's zsh (profile + aliases). Same file, opposite
// verdicts => the instrument differed, not the bytes. Identify every grep on this box and test each
// against the SAME pre-cure file.
import { execFileSync, spawnSync } from 'node:child_process';
const file = '/Users/robin/Claude/Projects/Gold Rush/src/game/Game.ts'; // pre-cure, 3 raw NULs

const candidates = [];
try {
  candidates.push(...execFileSync('sh', ['-c', 'type -a grep 2>/dev/null; which -a grep 2>/dev/null'],
    { encoding: 'utf8' }).trim().split('\n'));
} catch {}
console.log('--- shell resolution ---');
console.log(candidates.join('\n') || '(none)');

const bins = ['/usr/bin/grep', '/opt/homebrew/bin/grep', '/opt/homebrew/bin/ggrep', '/usr/local/bin/grep'];
console.log('\n--- behaviour of each binary on the SAME pre-cure file ---');
for (const b of bins) {
  let ver = null;
  try { ver = execFileSync(b, ['--version'], { encoding: 'utf8' }).split('\n')[0]; } catch { continue; }
  const r = spawnSync(b, ['-c', 'import', file], { encoding: 'utf8' });
  const ra = spawnSync(b, ['-ac', 'import', file], { encoding: 'utf8' });
  console.log(`${b}  [${ver}]`);
  console.log(`   grep -c  -> stdout=${JSON.stringify((r.stdout ?? '').trim())} rc=${r.status}`);
  console.log(`   grep -ac -> stdout=${JSON.stringify((ra.stdout ?? '').trim())} rc=${ra.status}`);
}

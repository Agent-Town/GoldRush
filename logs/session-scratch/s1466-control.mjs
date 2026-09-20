// s1466 CONTROL ARM: isolate the ONE variable. Revert src/game/Game.ts in the detached gate
// worktree to main's (pre-cure) version, leaving everything else at the merged state, so the
// rig re-run answers exactly one question: is the red the SLICE's, or the fire shell's?
// (F: "a merge can cause a red in a file it never touched" — a red needs a control run.)
import { execFileSync } from 'node:child_process';
const cwd = '/Users/robin/Claude/Projects/Gold Rush/gate-s1466';
const run = (...a) => execFileSync('git', a, { cwd, encoding: 'utf8' });
const mode = process.argv[2];
if (mode === 'revert') {
  run('checkout', 'main', '--', 'src/game/Game.ts');
  console.log('Game.ts reverted to main (pre-cure). status:');
} else if (mode === 'restore') {
  run('checkout', 'HEAD', '--', 'src/game/Game.ts');
  console.log('Game.ts restored to merged (cured). status:');
} else { console.error('usage: revert|restore'); process.exit(2); }
console.log(run('status', '--porcelain'));
// Prove which version is on disk, by the discriminator itself: is the file grep-readable?
try {
  const n = execFileSync('grep', ['-c', 'import', 'src/game/Game.ts'], { cwd, encoding: 'utf8' }).trim();
  console.log(`plain grep -c import -> ${n}  (readable => CURED version on disk)`);
} catch {
  console.log('plain grep -c import -> (no output, exit 1)  (blind => PRE-CURE version on disk)');
}

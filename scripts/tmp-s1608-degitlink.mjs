// s1608 — remove the gate-s1608 GITLINK that the ART runner's broad `git add` swept into
// main at 5bbdc9182 (mode 160000 -> 74bd342431, my detached gate worktree's merge commit).
// The worktree is already removed, so the entry points at a path that does not exist: it is
// garbage in every future clone. --cached only: nothing on disk is touched.
import { execFileSync } from 'node:child_process'
const ROOT = '/Users/robin/Claude/Projects/Gold Rush'
const git = (...a) => execFileSync('git', ['-C', ROOT, ...a], { encoding: 'utf8' })

console.log('before:', git('ls-files', '-s', 'gate-s1608').trim() || '(absent)')
try {
  git('rm', '--cached', '-f', 'gate-s1608')
} catch (e) {
  console.log('rm --cached rc=' + e.status, (e.stderr || '').slice(0, 400))
  process.exit(1)
}
console.log('after :', git('ls-files', '-s', 'gate-s1608').trim() || '(absent — removed)')
console.log('staged:', git('diff', '--cached', '--name-status').trim() || '(nothing)')

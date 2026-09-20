// s1608 — post-drain hygiene: prefix the done-move with its merge hash (house convention,
// so a later fire can tell drained residue from undrained work at a glance), and drop the
// detached gate worktree. Nothing is deleted from history: the worktree is scratch, and the
// done-move is renamed, not removed (RETENTION LAW).
import { renameSync, existsSync, readdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const ROOT = '/Users/robin/Claude/Projects/Gold Rush'
const SHORT = 'cb7208e64'
const src = `${ROOT}/tasks/done/20260810-002226-f1607-1-hill-mine-railcar-pacing.md`
const dst = `${ROOT}/tasks/done/drained-${SHORT}-20260810-002226-f1607-1-hill-mine-railcar-pacing.md`

if (existsSync(src)) {
  renameSync(src, dst)
  console.log('done-move prefixed ->', dst.split('/').pop())
} else console.log('done-move already prefixed or absent')

try {
  console.log(execFileSync('git', ['-C', ROOT, 'worktree', 'remove', '--force', 'gate-s1608'], { encoding: 'utf8' }) || 'gate worktree removed')
} catch (e) {
  console.log('worktree remove rc=' + e.status, (e.stderr || '').slice(0, 300))
}
console.log('--- tasks/running ---')
console.log(readdirSync(`${ROOT}/tasks/running`).join(' ') || '(empty)')

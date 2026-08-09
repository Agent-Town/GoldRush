// s1608 — install the CONTROL arm for the f1607-1 gate: revert ONLY the one changed file
// to main's version, inside the same gate worktree, same harness, same load profile.
// Reverting just the changed file (rather than gating a separate main checkout) keeps
// every other variable pinned, which is what makes the comparison mean anything.
import { execFileSync } from 'node:child_process'
const WT = '/Users/robin/Claude/Projects/Gold Rush/gate-s1608'
const FILE = 'assets/contracts/epoch-2-steamworks/contracts.json'
const git = (...a) => execFileSync('git', ['-C', WT, ...a], { encoding: 'utf8' })

const mode = process.argv[2]
if (mode === 'control') {
  git('checkout', 'main', '--', FILE)
  console.log('CONTROL armed — contract reverted to main')
} else if (mode === 'restore') {
  git('checkout', 'HEAD', '--', FILE)
  console.log('MERGED arm restored')
} else {
  console.log('usage: control | restore')
  process.exit(2)
}
// prove which arm is live by reading the value, never by trusting the command
const line = execFileSync('grep', ['-n', 'hpScale', `${WT}/${FILE}`], { encoding: 'utf8' })
  .split('\n')
  .filter((l) => /: (30|12\.5),/.test(l))
console.log('hpScale lines now:', line.join(' | '))

// s1608 — merge lane/a into the DETACHED gate worktree (fire.md §3.0b: never gate
// undecided content in main's working tree or index).
import { execFileSync } from 'node:child_process'
const WT = '/Users/robin/Claude/Projects/Gold Rush/gate-s1608'
const git = (...a) => execFileSync('git', ['-C', WT, ...a], { encoding: 'utf8' })
try {
  console.log(git('merge', '--no-ff', 'lane/a', '-m', 'gate: f1607-1 hill-mine railcar pacing'))
} catch (e) {
  console.log('MERGE FAILED rc=' + e.status)
  console.log(e.stdout || '', e.stderr || '')
  process.exit(1)
}
console.log('--- status ---')
console.log(git('status', '--porcelain') || '(clean)')
console.log('--- head ---')
console.log(git('log', '-1', '--format=%h %s'))
console.log('--- contract value ---')
console.log(
  execFileSync('grep', ['-n', 'hpScale', `${WT}/assets/contracts/epoch-2-steamworks/contracts.json`], {
    encoding: 'utf8',
  })
    .split('\n')
    .filter((l) => /: (30|12\.5),/.test(l))
    .join('\n')
)

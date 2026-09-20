// s1420 drain control: verdict parity for f1419-1.
// Both arms run from the SAME gate worktree so `--all`'s worktree denominator is constant;
// only scripts/lane-usable.mjs + scripts/lane-residue.test.mjs differ between arms.
import fs from 'node:fs'
import { spawnSync, execSync } from 'node:child_process'

const root = '/Users/robin/Claude/Projects/Gold Rush'
const wt = root + '/gate-s1420'
const files = ['scripts/lane-usable.mjs', 'scripts/lane-residue.test.mjs']
const post = Object.fromEntries(files.map((p) => [p, fs.readFileSync(wt + '/' + p, 'utf8')]))
const pre = Object.fromEntries(files.map((p) => [p, execSync('git show main:' + p, { cwd: root }).toString()]))

function run(label) {
  const r = spawnSync('node', [wt + '/scripts/lane-usable.mjs', '--all'], { cwd: root, encoding: 'utf8' })
  const v = (r.stdout.match(/=> (USABLE|AHEAD-BUT-ABSORBED|HOLDS|DIRTY|BUSY)/g) || []).map((s) => s.slice(3))
  const lanes = (r.stdout.match(/^lane-[a-d] /gm) || []).length
  console.log(label + '  rc=' + r.status + '  lanes=' + lanes + '  verdicts=' + JSON.stringify(v))
  console.log('     stderr: ' + (r.stderr.trim() ? JSON.stringify(r.stderr.trim().slice(0, 200)) : '(empty)'))
  return { rc: r.status, v: JSON.stringify(v), out: r.stdout }
}

for (const p of files) fs.writeFileSync(wt + '/' + p, pre[p])
const A = run('PRE-SLICE  ')
for (const p of files) fs.writeFileSync(wt + '/' + p, post[p])
const B = run('POST-SLICE ')

console.log('')
console.log('VERDICT PARITY (rc + words identical):', A.rc === B.rc && A.v === B.v)
fs.writeFileSync('/tmp/s1420-pre.txt', A.out)
fs.writeFileSync('/tmp/s1420-post.txt', B.out)

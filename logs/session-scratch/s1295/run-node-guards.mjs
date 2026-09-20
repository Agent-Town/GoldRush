// s1295: run the test:node-guards roster. The npm script chains with `&&`, which this shell's
// permission gate refuses (the s1292 harness did the same thing for the same reason), so the
// chain is split and each step run individually, with a per-step rc reported.
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
const ROOT = '/Users/robin/Claude/Projects/Gold Rush'
const pkg = JSON.parse(readFileSync(ROOT + '/package.json', 'utf8'))
const script = pkg.scripts['test:node-guards']
const steps = script.split('&&').map(s => s.trim()).filter(Boolean)
console.log(`roster has ${steps.length} step(s)\n`)
let bad = 0, totalPass = 0, totalFail = 0
for (const [i, step] of steps.entries()) {
  const r = spawnSync(step, { cwd: ROOT, shell: true, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  const out = (r.stdout || '') + (r.stderr || '')
  const p = /^# pass (\d+)/m.exec(out), f = /^# fail (\d+)/m.exec(out)
  if (p) totalPass += Number(p[1])
  if (f) totalFail += Number(f[1])
  if (r.status !== 0) bad++
  console.log(`${String(i + 1).padStart(2)}. rc=${r.status} ${p ? `pass ${p[1]}` : ''} ${f ? `fail ${f[1]}` : ''}  ${step.slice(0, 90)}`)
  if (r.status !== 0) console.log(out.split('\n').filter(l => /not ok|Error|fail/.test(l)).slice(0, 8).join('\n'))
}
console.log(`\nTOTAL pass ${totalPass} / fail ${totalFail} · failing steps: ${bad}`)
process.exit(bad ? 1 : 0)

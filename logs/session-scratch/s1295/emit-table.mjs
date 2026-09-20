// s1295: render the F-1294-2 control results as the review's evidence table, straight from the
// harness JSON — numbers are never retyped by hand.
import { readFileSync } from 'node:fs'
const d = JSON.parse(readFileSync('/Users/robin/Claude/Projects/Gold Rush/logs/session-scratch/s1295/f1294-2-true-results.json', 'utf8'))
const specs = [...new Set(d.results.map(r => r.spec))]

console.log('| # | Spec | Arm | rc | pass/fail | wall | load (before→after) |')
console.log('|---|---|---|---|---|---|---|')
d.results.forEach((r, i) => {
  console.log(`| ${i + 1} | \`${r.spec}\` | **${r.arm}** | ${r.rc} | ${r.passed}p / ${r.failed}f | ${r.secs}s | ${r.load0} → ${r.load1} |`)
})
console.log('\n| Spec | PRE red | POST red | Verdict |')
console.log('|---|---|---|---|')
for (const s of specs) {
  const pre = d.results.filter(r => r.spec === s && r.arm === 'PRE')
  const post = d.results.filter(r => r.spec === s && r.arm === 'POST')
  const pf = pre.filter(r => r.rc !== 0).length, qf = post.filter(r => r.rc !== 0).length
  console.log(`| \`${s}\` | ${pf}/${pre.length} | ${qf}/${post.length} | ${pf === qf ? '**EQUAL**' : '*** ARM-DEPENDENT ***'} |`)
}
const loads = d.results.map(r => r.load0)
console.log(`\nLoad range across the run: **${Math.min(...loads)} → ${Math.max(...loads)}** (1-min average).`)
console.log(`armDependent = **${d.armDependent}**`)

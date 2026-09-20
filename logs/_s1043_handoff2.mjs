// s1043 handoff v2: install the final line-1 over my own RE-TAKEN lock, and preserve the
// superseded v1 handoff as its own archive bullet (it is a real, committed handoff — the
// Retention Law says supersede it visibly, never quietly overwrite it).
import fs from 'node:fs'
const p = 'STATUS.md'
const L = fs.readFileSync(p, 'utf8').split('\n')
const newLine1 = fs.readFileSync('logs/_s1043_line1_v2.txt', 'utf8').trim()
if (!newLine1.includes('s1043 handoff (v2')) throw new Error('v2 line-1 malformed — refusing')
if (!L[0].startsWith('ACTIVE') || !L[0].includes('RE-TAKEN')) {
  throw new Error('line-1 is not my re-taken lock — refusing: ' + L[0].slice(0, 120))
}
const v1 = fs.readFileSync('logs/_s1043_handoff_v1.txt', 'utf8').trim()

const idx = L.findIndex((l) => l.includes('(line-1 archive):'))
if (idx < 0) throw new Error('no archive bullet found — refusing to guess')
L.splice(idx, 0, `- **s1043 handoff v1 (line-1 archive — SUPERSEDED by the v2 line above, same fire): it called lane-a BUSY and the run finished four minutes later. Kept verbatim because the mistake is the lesson:** ${v1}`, '')
L[0] = newLine1
fs.writeFileSync(p, L.join('\n'))
console.log('v2 line-1 installed, length', newLine1.length)
console.log('archived v1 bullet at line', idx + 1, 'len', v1.length)

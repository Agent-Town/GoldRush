// s1042 handoff: archive the previous line-1 as a bullet, install the new line-1.
// Usage: node logs/_s1042_handoff.mjs logs/_s1042_line1.txt
import fs from 'node:fs'
const p = 'STATUS.md'
const L = fs.readFileSync(p, 'utf8').split('\n')
const newLine1 = fs.readFileSync(process.argv[2], 'utf8').trim()

// The line-1 I am replacing is my OWN ACTIVE lock; the s1041 handoff line is what
// must be archived as a bullet, and it is still line-1's predecessor in git, not in the file.
// So: read the s1041 handoff line from git (HEAD~ of my lock commit) and archive that.
const s1041Line = fs.readFileSync('logs/_s1042_prev_line1.txt', 'utf8').trim()

// find the insertion point: immediately before the first existing "(line-1 archive)" bullet
let idx = L.findIndex((l) => l.includes('(line-1 archive):'))
if (idx < 0) throw new Error('no archive bullet found — refusing to guess')
const bullet = `- **s1041 handoff (line-1 archive):** ${s1041Line}`
L.splice(idx, 0, bullet, '')
L[0] = newLine1
fs.writeFileSync(p, L.join('\n'))
console.log('line-1 installed, length', newLine1.length)
console.log('archived s1041 bullet at line', idx + 1, 'len', s1041Line.length)

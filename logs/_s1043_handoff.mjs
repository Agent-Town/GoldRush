// s1043 handoff: archive s1042's line-1 as a bullet, install the new line-1.
// Usage: node logs/_s1043_handoff.mjs logs/_s1043_line1.txt
import fs from 'node:fs'
const p = 'STATUS.md'
const L = fs.readFileSync(p, 'utf8').split('\n')
const newLine1 = fs.readFileSync(process.argv[2], 'utf8').trim()
if (!newLine1.startsWith('Last updated:') || !newLine1.includes('s1043 handoff')) {
  throw new Error('new line-1 is not an s1043 handoff — refusing')
}
if (!L[0].startsWith('ACTIVE') || !L[0].includes('s1043 fire')) {
  throw new Error('line-1 is not my own ACTIVE lock — refusing to overwrite: ' + L[0].slice(0, 120))
}
const prev = fs.readFileSync('logs/_s1043_prev_line1.txt', 'utf8').trim()

// insertion point: immediately before the first existing "(line-1 archive)" bullet
const idx = L.findIndex((l) => l.includes('(line-1 archive):'))
if (idx < 0) throw new Error('no archive bullet found — refusing to guess')
L.splice(idx, 0, `- **s1042 handoff (line-1 archive):** ${prev}`, '')
L[0] = newLine1
fs.writeFileSync(p, L.join('\n'))
console.log('line-1 installed, length', newLine1.length)
console.log('archived s1042 bullet at line', idx + 1, 'len', prev.length)

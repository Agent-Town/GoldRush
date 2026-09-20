// s1295 lock: archive s1294 handoff line-1 into its placeholder bullet, write the new ACTIVE line-1.
import { readFileSync, writeFileSync } from 'node:fs'
const P = 'STATUS.md'
const lines = readFileSync(P, 'utf8').split('\n')
const prev = lines[0]
if (!prev.startsWith('Last updated:')) throw new Error('line-1 not a Last-updated line: ' + prev.slice(0, 80))
const idx = lines.findIndex(l => l.includes('PLACEHOLDER-S1295-ARCHIVE'))
if (idx < 0) throw new Error('placeholder missing')
lines[idx] = '- **s1294 handoff (line-1 archive):** ' + prev
lines[0] = process.argv[2]
writeFileSync(P, lines.join('\n'))
console.log('OK archived at line', idx + 1)
console.log('new line-1:', lines[0].slice(0, 200))

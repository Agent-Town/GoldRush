// s1590: desk-state-audit cannot read line 1 while a fire holds the lock (F-1566-1), so point it
// at what this fire INHERITED — the previous handoff's archived line-1, prefix stripped.
import { readFileSync, writeFileSync } from 'node:fs'

const lines = readFileSync('STATUS.md', 'utf8').split('\n')
const prefix = '- **s1589 handoff (line-1 archive):** '
const bullet = lines.find((l) => l.startsWith(prefix))
if (!bullet) throw new Error('s1589 archive bullet not found')
writeFileSync('/tmp/s1589-inherited-line1.md', bullet.slice(prefix.length) + '\n')
console.log('extracted', bullet.length - prefix.length, 'chars')

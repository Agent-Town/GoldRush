import { readFileSync, writeFileSync } from 'node:fs'
const P = '/Users/robin/Claude/Projects/Gold Rush/STATUS.md'
const lines = readFileSync(P, 'utf8').split('\n')
const prev = lines[0]
if (!prev.startsWith('Last updated: ACTIVE')) throw new Error('line-1 is not my lock: ' + prev.slice(0, 60))
lines[0] = readFileSync(process.argv[2], 'utf8').trim()
lines.splice(2, 0, '- **s1295 lock (line-1 archive):** ' + prev)
writeFileSync(P, lines.join('\n'))
console.log('handoff written; lock archived at line 3')

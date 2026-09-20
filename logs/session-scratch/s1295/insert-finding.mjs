// s1295: insert F-1295-1 + F-1295-2 into tasks/BACKLOG.md immediately after the F-1294-1 row.
// Guard-safe: open state is the 🟡 lead ONLY (findings-state-guard.mjs:64), and no OTHER F-number
// may fall inside the 90-char subject window (:35) or a citation reads as a state declaration
// (the F-1259-1 hazard s1293 caught in its own edit).
import { readFileSync, writeFileSync } from 'node:fs'
const P = '/Users/robin/Claude/Projects/Gold Rush/tasks/BACKLOG.md'
const lines = readFileSync(P, 'utf8').split('\n')
const anchor = lines.findIndex(l => l.startsWith('🟡 **F-1294-1 (s1294,'))
if (anchor < 0) throw new Error('F-1294-1 anchor row not found')

const rows = readFileSync(process.argv[2], 'utf8').split('\n').filter(l => l.trim().length)
lines.splice(anchor + 1, 0, ...rows)
writeFileSync(P, lines.join('\n'))
console.log(`inserted ${rows.length} row(s) after BACKLOG line ${anchor + 1}`)
for (const r of rows) console.log('  window90:', r.slice(0, 90))

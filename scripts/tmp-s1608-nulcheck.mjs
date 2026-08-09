// s1608 — did my BACKLOG edit write a literal NUL byte? (test:ledger-guards has a nul-audit leaf)
import { readFileSync } from 'node:fs'
const buf = readFileSync('tasks/BACKLOG.md')
let n = 0
const at = []
for (let i = 0; i < buf.length; i++) if (buf[i] === 0) { n++; if (at.length < 5) at.push(i) }
console.log('NUL bytes in tasks/BACKLOG.md:', n, at.length ? 'first offsets ' + at.join(',') : '')
const line2 = readFileSync('tasks/BACKLOG.md', 'utf8').split('\n')[1]
const i = line2.indexOf('escaping fix')
console.log('line2 has "escaping fix":', i)
if (i >= 0) console.log('context:', JSON.stringify(line2.slice(i - 30, i + 14)))

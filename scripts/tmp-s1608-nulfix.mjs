// s1608 — replace the literal NUL my BACKLOG edit wrote with printable escape text.
// Same defect class as 1a2871fd3 (Game.ts composite-key delimiters escaped to restore
// grep), which is the very merge the sentence containing it describes.
// The NUL is CONSTRUCTED, never typed, so this file cannot itself carry one.
import { readFileSync, writeFileSync } from 'node:fs'

const NUL = String.fromCharCode(0)
const ESCAPED = '\\u' + '0000'
const P = 'tasks/BACKLOG.md'

const s = readFileSync(P, 'utf8')
const before = s.split(NUL).length - 1
const out = s.split(NUL).join(ESCAPED)
writeFileSync(P, out, 'utf8')

const check = readFileSync(P, 'utf8')
console.log(`NUL before=${before} after=${check.split(NUL).length - 1}`)
const line2 = check.split('\n')[1]
const i = line2.indexOf('escaping fix')
console.log('context now:', JSON.stringify(line2.slice(i - 34, i + 14)))

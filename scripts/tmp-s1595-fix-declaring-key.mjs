#!/usr/bin/env node
// s1595 — my own banner broke `desk-declaration-guard`: prepending the ⛔ block
// after the marker pushed `F-1364-1` out of the first 90 chars, and that row is
// the DECLARING row for a live desk item. Cure: restate the F-ID immediately
// after the marker so the declaring key stays first, banner second.
import { readFileSync, writeFileSync } from 'node:fs'

const F = 'tasks/BACKLOG.md'
let text = readFileSync(F, 'utf8')

const from = '🟡 ⛔ **CURED — DO NOT AUTHOR FROM THIS ROW (F-1595-1, verified s1595 by COMMIT-PROBE + FILE-PROBE)'
const to = '🟡 **F-1364-1** ⛔ **CURED — DO NOT AUTHOR FROM THIS ROW (F-1595-1, verified s1595 by COMMIT-PROBE + FILE-PROBE)'

const n = text.split(from).length - 1
if (n !== 1) { console.error(`REFUSING: matched ${n} times`); process.exit(2) }
text = text.replace(from, to)
writeFileSync(F, text)

const line = text.split('\n').find(l => l.includes('**F-1364-1** ⛔'))
console.log('first 90 chars now:', JSON.stringify([...line].slice(0, 90).join('')))

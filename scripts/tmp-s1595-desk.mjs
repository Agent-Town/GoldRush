#!/usr/bin/env node
// s1595 — extract the INHERITED line-1 (s1594's archive bullet) so
// desk-state-audit can be pointed at it. It cannot read line 1 while a fire
// holds the lock (F-1566-1), and the question a handoff asks is "what did I
// inherit, and is any of it already answered?"
import { readFileSync, writeFileSync } from 'node:fs'

const lines = readFileSync('STATUS.md', 'utf8').split('\n')
const bullet = lines.find(l => l.startsWith('- **s1594 handoff (line-1 archive):**'))
if (!bullet) { console.error('REFUSING: s1594 archive bullet not found'); process.exit(2) }
const stripped = bullet.replace('- **s1594 handoff (line-1 archive):** ', '')
writeFileSync('logs/session-scratch/s1595-inherited-line1.txt', stripped + '\n')
console.log('wrote', stripped.length, 'chars')

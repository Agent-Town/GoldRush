#!/usr/bin/env node
// s1595 lock: replace STATUS.md line-1 with the ACTIVE lock line and archive the
// previous line-1 as a bullet immediately below it (F-1471-3: the archive must
// reach the file, and it must be the PREVIOUS line-1, not the line we just wrote).
import { readFileSync, writeFileSync } from 'node:fs'

const path = 'STATUS.md'
const raw = readFileSync(path, 'utf8')
const lines = raw.split('\n')
const prev = lines[0]

if (prev.startsWith('ACTIVE')) {
  console.error('REFUSING: line-1 is already an ACTIVE lock — a fire owns main.')
  process.exit(2)
}

const stamp = process.argv[2]
const intent = process.argv[3]
if (!stamp || !intent) {
  console.error('usage: tmp-s1595-lock.mjs <stamp> <intent>')
  process.exit(2)
}

const lock = `ACTIVE ${stamp} (s1595 fire) — ${intent}`
const archive = `- **s1594 handoff (line-1 archive):** ${prev}`
const out = [lock, archive, ...lines.slice(1)].join('\n')
writeFileSync(path, out)
console.log('line-1 ->', lock)
console.log('archived s1594 handoff, length', prev.length)

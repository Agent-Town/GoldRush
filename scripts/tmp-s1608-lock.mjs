// s1608 fire: replace STATUS.md line-1 with the ACTIVE lock, stashing the prior line-1
// for archiving in the handoff commit (§4 requires the previous line-1 end up archived).
import { readFileSync, writeFileSync } from 'node:fs'

const P = 'STATUS.md'
const lines = readFileSync(P, 'utf8').split('\n')
const prior = lines[0]
writeFileSync('/tmp/s1607-line1.txt', prior, 'utf8')
lines[0] =
  'ACTIVE 2026-08-10T00:35Z (s1608 fire) — dry board (lane-a BUSY with f1607-1); auditing for the next authorable slice + owed sweeps'
writeFileSync(P, lines.join('\n'), 'utf8')
console.log('lock written. prior line-1 stashed: %d chars', prior.length)
console.log('prior starts:', prior.slice(0, 80))

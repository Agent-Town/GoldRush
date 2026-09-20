// s1295: flip the agent-rung-honest-gate-v2 leaf to reflect what is actually on main.
// Goal Registration Law: the drain updates status + merge hash in the drain commit. The wrinkle
// here is that the content reached main by an accidental sweep (F-1295-1), not by a drain, so the
// mergeHash recorded is b37c1fc6 — the commit that ACTUALLY carries the bytes — with the irregular
// provenance stated on the leaf rather than laundered into a normal-looking drain.
// Canonical 2-space formatting is preserved (the guard reads this file).
import { readFileSync, writeFileSync } from 'node:fs'
const P = '/Users/robin/Claude/Projects/Gold Rush/tasks/goals.json'
const raw = readFileSync(P, 'utf8')
const g = JSON.parse(raw)

let hit = null
const walk = (n) => {
  if (n && typeof n === 'object') {
    if (!Array.isArray(n) && n.id === 'agent-rung-honest-gate-v2') hit = n
    for (const v of Object.values(n)) walk(v)
  }
}
walk(g)
if (!hit) throw new Error('leaf not found')

const before = { status: hit.status, mergeHash: hit.mergeHash }
hit.status = 'merged'
hit.mergeHash = 'b37c1fc6'
hit.drainNotes_s1295 = process.argv[2]

writeFileSync(P, JSON.stringify(g, null, 2) + '\n')
// re-parse as a self-check
JSON.parse(readFileSync(P, 'utf8'))
console.log('leaf updated. before:', JSON.stringify(before))
console.log('after: status=' + hit.status + ' mergeHash=' + hit.mergeHash)

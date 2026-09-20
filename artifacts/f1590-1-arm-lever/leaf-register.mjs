// s1590: register the f1590-1 leaf beside its predecessor, preserving the file's
// ASCII-escaped JSON encoding (Goal Registration Law — same commit as the master).
import { readFileSync, writeFileSync } from 'node:fs'

const p = 'tasks/goals.json'
const g = JSON.parse(readFileSync(p, 'utf8'))
let done = 0

const GATE = [
  'none - fire-authorable from F-1590-1, filed s1590 at the f1589-4 drain.',
  'Third attempt at F-1587-2, lawful under the changed-premise rule because the LEVER changed on',
  'measured grounds: f1589-4 returned COULD-NOT-ARM and the drain proved both of its prescribed',
  'levers structurally incapable (vite/dist/node/chunks/node.js:31487 gates the message on',
  'cachedMetadata, which deleting the cache removes; :32019-32031 hashes lockfile CONTENT, which an',
  'mtime touch cannot move). The working lever - stale only lockfileHash inside',
  'node_modules/.vite/deps/_metadata.json - was proved by manufacture, artifacts/f1590-1-arm-lever/.',
  'Arm A armed / Arm B disarmed, 3 repetitions each, arm proof required as a hard gate.',
  'Cure is CONDITIONAL on CONFIRMED and must be measured by an Arm C.',
].join(' ')

const NEW = {
  id: 'f1590-1-dep-reoptimize-armed',
  title:
    'F-1590-1: the dep re-optimization A/B on a lever that provably arms - and a cure only if it confirms',
  status: 'queued',
  taskFile: 'lane-b-f1590-1-dep-reoptimize-armed.md',
  gate: GATE,
}

const walk = (n) => {
  if (Array.isArray(n)) {
    const i = n.findIndex((x) => x && x.id === 'f1589-4-dep-reoptimize-stall')
    if (i >= 0 && !done) {
      n.splice(i + 1, 0, NEW)
      done++
      return
    }
    return n.forEach(walk)
  }
  if (n && typeof n === 'object') Object.values(n).forEach(walk)
}
walk(g)
if (!done) throw new Error('anchor leaf f1589-4-dep-reoptimize-stall not found')

// Match the file's existing encoding: every non-ASCII code unit written as \uXXXX.
// Done per UTF-16 code unit (not per codepoint) so surrogate pairs escape as the file already does.
// NOTE: do NOT express this as a regex character range with literal non-ASCII endpoints — a raw
// U+0080 in the source collapses to a bare hyphen in the class and escapes every '-' in the file
// (s1590, caught by a 3088-line diff on what should have been a 6-line insert).
const raw = JSON.stringify(g, null, 2) + '\n'
let escaped = ''
for (let i = 0; i < raw.length; i++) {
  const code = raw.charCodeAt(i)
  escaped += code > 127 ? '\\u' + code.toString(16).padStart(4, '0') : raw[i]
}
writeFileSync(p, escaped)
console.log('registered leaves:', done)

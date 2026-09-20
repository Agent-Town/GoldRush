// s1590 drain bookkeeping: flip the f1589-4 leaf to merged, preserving the file's
// ASCII-escaped JSON encoding so the diff stays two fields wide rather than 900 lines.
import { readFileSync, writeFileSync } from 'node:fs'

const p = 'tasks/goals.json'
const g = JSON.parse(readFileSync(p, 'utf8'))
let found = 0

const NOTES = [
  's1590: MERGED as evidence f9160a0c370125724baf6338796388bd936ed645.',
  'Verdict COULD-NOT-ARM, and that was the only reachable verdict.',
  'F-1590-1: both levers the master prescribed are structurally incapable of printing',
  "vite's re-optimization line - deleting node_modules/.vite removes the cachedMetadata",
  'the message branch requires (vite/dist/node/chunks/node.js:31487), and touching the',
  'lockfile mtime cannot move a CONTENT hash (:32019-32031).',
  'The runner obeyed the firewall exactly (diff scoped to src, e2e, scripts, specs, tasks,',
  'package-lock.json and playwright.config.ts is EMPTY) and reported the negative honestly.',
  'Working lever proved by manufacture this fire (artifacts/f1590-1-arm-lever/): stale only',
  'lockfileHash inside node_modules/.vite/deps/_metadata.json - armed on run 1, converged',
  'control silent, self-healing, and it touches no tracked byte.',
  'F-1589-4 and F-1587-2 both stay OPEN.',
].join(' ')

const walk = (n) => {
  if (Array.isArray(n)) return n.forEach(walk)
  if (n && typeof n === 'object') {
    if (n.id === 'f1589-4-dep-reoptimize-stall') {
      n.status = 'merged'
      n.mergeHash = 'f9160a0c370125724baf6338796388bd936ed645'
      n.drainNotes = NOTES
      found++
    }
    Object.values(n).forEach(walk)
  }
}
walk(g)
if (!found) throw new Error('leaf f1589-4-dep-reoptimize-stall not found')

// ⚠️ BOOBY-TRAPPED AS WRITTEN — kept verbatim as the record, but DO NOT COPY THIS ENCODER.
// The character class below is meant to be [-￿], but a raw U+0080 in the source can
// collapse to a bare hyphen, at which point it escapes every '-' in the file instead. It happened
// to survive here and did NOT survive in the sibling script minutes later (a 3088-line diff on a
// 6-line insert). The safe form is the per-code-unit loop in leaf-register.mjs.
// Match the file's existing encoding: every non-ASCII codepoint written as \uXXXX.
const escaped = (JSON.stringify(g, null, 2) + '\n').replace(
  /[-￿]/g,
  (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'),
)
writeFileSync(p, escaped)
console.log('updated leaves:', found)

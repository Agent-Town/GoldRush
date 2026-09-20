// s1590 drain 2 bookkeeping: flip the f1590-1 leaf to merged, preserving the file's
// ASCII-escaped encoding via the per-code-unit loop (never a regex range with literal non-ASCII).
import { readFileSync, writeFileSync } from 'node:fs'

const p = 'tasks/goals.json'
const g = JSON.parse(readFileSync(p, 'utf8'))
let found = 0

const NOTES = [
  's1590: MERGED as evidence c4115d4e5c98182ea5479696110b80c4c1531455.',
  'Verdict NOT CONFIRMED, and this one is a REFUTATION rather than another absence of evidence:',
  'the trigger was ARMED and the stall still did not appear.',
  'Arm proofs verified by the drain, not inherited - arm-a-1/2/3-server.log each carry',
  '"Re-optimizing dependencies because lockfile has changed" BEFORE the readiness banner',
  '(08:34:14 / 08:34:22 / 08:34:29) while arm-b-1 is silent, so the arms differ in exactly the',
  'intended variable. The mandated convergence run was taken between A3 and B1 and started silent.',
  'Lever self-healed every repetition (lockfileHash-after=6c42fd2c).',
  'Armed 5.6/5.4/5.4 s vs silent controls 5.4/5.5/5.5 s - inside each other noise, against a',
  'defect that would have had to be about 7x the control.',
  'F-1589-4 is REFUTED: the Re-optimizing line in the original f1587-2 artifact was COINCIDENT',
  'with the stall, not causal of it.',
  'The conditional cure permitted by item 5 was correctly NOT taken, because item 4 said',
  'NOT CONFIRMED. Blast radius empty for src, e2e, scripts, specs, tasks, package-lock and',
  'playwright.config, so no battery is owed and none is claimed.',
  'F-1587-2 STAYS OPEN after three attempts. New F-1590-2 (hypothesis, not chased): the stall may',
  'be LOAD-SENSITIVITY of the F-1589-3 class rather than a cold-start defect at all - the 41.8 s',
  'observation happened inside a multi-arm battery, and every reproduction attempt has run the',
  'subject test ALONE, the exact condition under which F-1589-3 also disappears.',
].join(' ')

const walk = (n) => {
  if (Array.isArray(n)) return n.forEach(walk)
  if (n && typeof n === 'object') {
    if (n.id === 'f1590-1-dep-reoptimize-armed') {
      n.status = 'merged'
      n.mergeHash = 'c4115d4e5c98182ea5479696110b80c4c1531455'
      n.drainNotes = NOTES
      found++
    }
    Object.values(n).forEach(walk)
  }
}
walk(g)
if (!found) throw new Error('leaf f1590-1-dep-reoptimize-armed not found')

const raw = JSON.stringify(g, null, 2) + '\n'
let escaped = ''
for (let i = 0; i < raw.length; i++) {
  const code = raw.charCodeAt(i)
  escaped += code > 127 ? '\\u' + code.toString(16).padStart(4, '0') : raw[i]
}
writeFileSync(p, escaped)
console.log('updated leaves:', found)

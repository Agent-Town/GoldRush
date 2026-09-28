// s2668 TK-01 measurement for coverage day 2026-09-23.
// Method per F-2562-2 (NO --since/--until; bucket on each commit's own %cs) and
// F-2623-1 (ask the day of ALL reachable commits too, not only --first-parent).
// The player-path test is IMPORTED from the sweep, never re-typed (F-1261-1).
import { execFileSync } from 'node:child_process'
import { isPlayerPath } from '../../scripts/gazette-backfill-sweep.mjs'

const DAY = process.argv[2] || '2026-09-23'
const git = (args) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 1e9 })

// control: a denominator, so a zero would be an answer and not a failed read
const allFirstParent = git(['log', '--first-parent', '--pretty=%H %cs']).trim().split('\n')
console.log(`control: ${allFirstParent.length} first-parent commits in the whole history`)

const walk = allFirstParent.filter((l) => l.split(' ')[1] === DAY).map((l) => l.split(' ')[0])
const reachable = git(['log', '--pretty=%H %cs']).trim().split('\n')
  .filter((l) => l.split(' ')[1] === DAY).map((l) => l.split(' ')[0])
console.log(`walk (first-parent) on ${DAY}: ${walk.length}`)
console.log(`reachable on ${DAY}:          ${reachable.length}`)

const filesOf = (h) => {
  try {
    return git(['show', '--pretty=format:', '--name-only', '-m', '--first-parent', h])
      .split('\n').map((s) => s.trim()).filter(Boolean)
  } catch { return [] }
}

let changed = 0
const playerFiles = new Set()
const playerCommits = []
for (const h of walk) {
  const files = filesOf(h)
  changed += files.length
  const pf = files.filter(isPlayerPath)
  if (pf.length) { playerCommits.push({ h, pf }); pf.forEach((f) => playerFiles.add(f)) }
}
console.log(`files changed on the walk: ${changed}, player-path files (distinct): ${playerFiles.size}`)
console.log(`walk commits touching a player path: ${playerCommits.length}`)

// F-2623-1: off-walk commits, and are they contained in a walk commit?
const walkSet = new Set(walk)
const offWalk = reachable.filter((h) => !walkSet.has(h))
const offWalkPlayer = offWalk.filter((h) => filesOf(h).some(isPlayerPath))
let contained = 0
const orphaned = []
for (const h of offWalkPlayer) {
  const anc = walk.some((w) => {
    try { execFileSync('git', ['merge-base', '--is-ancestor', h, w]); return true } catch { return false }
  })
  if (anc) contained++
  else orphaned.push(h)
}
console.log(`off-walk on the day: ${offWalk.length}, of which player-path: ${offWalkPlayer.length}`)
console.log(`off-walk player-path contained in a walk commit: ${contained}, orphaned: ${orphaned.length}`)
if (orphaned.length) console.log('ORPHANED: ' + orphaned.join(' '))

console.log('\n--- walk commits touching a player path ---')
for (const { h, pf } of playerCommits) {
  const subj = git(['log', '-1', '--pretty=%h %s', h]).trim()
  console.log(`${subj}\n    ${pf.slice(0, 12).join(' ')}${pf.length > 12 ? ` … (+${pf.length - 12})` : ''}`)
}

const sessions = new Set()
for (const h of walk) {
  const s = git(['log', '-1', '--pretty=%s', h]).trim()
  const m = /\bs(\d{3,5})\b/.exec(s)
  if (m) sessions.add('s' + m[1])
}
console.log(`\nfire-session-prefixed commits on the walk: sessions ${[...sessions].sort().join(', ') || '(none)'}`)
console.log(`day boundary: ${walk[walk.length - 1]}^..${walk[0]}`)

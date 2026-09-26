// s2689: s2688's day.mjs containment half, with the walk PINNED to a root commit.
// Why: main was re-rooted on 2026-09-26 by "drain: merge main into the <x> chain" commits
// (first parent = the chain), so `git log --first-parent` from HEAD no longer walks the
// 2026-09-25 main line and the unpinned script calls the day's own landings "orphaned".
// Pin = s2688's handoff commit 9fee4bc02 (main as s2688 measured it).
import { execFileSync } from 'node:child_process'
import { isPlayerPath } from '../../scripts/gazette-backfill-sweep.mjs'

const DAY = process.argv[2] || '2026-09-25'
const ROOT = process.argv[3] || '9fee4bc02'
const git = (args) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 1e9 })

const allFirstParent = git(['log', '--first-parent', '--pretty=%H %cs', ROOT]).trim().split('\n')
console.log(`root ${ROOT}; control: ${allFirstParent.length} first-parent commits`)
const walk = allFirstParent.filter((l) => l.split(' ')[1] === DAY).map((l) => l.split(' ')[0])
const reachable = git(['log', '--pretty=%H %cs', ROOT]).trim().split('\n')
  .filter((l) => l.split(' ')[1] === DAY).map((l) => l.split(' ')[0])
console.log(`walk (first-parent) on ${DAY}: ${walk.length}`)
console.log(`reachable on ${DAY}:          ${reachable.length}`)

const filesOf = (h) => {
  try {
    return git(['show', '--pretty=format:', '--name-only', '-m', '--first-parent', h])
      .split('\n').map((s) => s.trim()).filter(Boolean)
  } catch { return [] }
}
const walkPlayer = walk.filter((h) => filesOf(h).some(isPlayerPath))
console.log(`walk commits touching a player path: ${walkPlayer.length}`)

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
for (const h of orphaned) console.log('ORPHANED: ' + git(['log', '-1', '--pretty=%h %ci %s', h]).trim().slice(0, 140))

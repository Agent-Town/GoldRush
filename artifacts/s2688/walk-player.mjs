// s2688: the walk half of day.mjs alone (the containment half is slow on a loaded host).
import { execFileSync } from 'node:child_process'
import { isPlayerPath } from '../../scripts/gazette-backfill-sweep.mjs'
const DAY = process.argv[2]
const git = (args) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 1e9 })
const walk = git(['log', '--first-parent', '--pretty=%H %cs %ci %s', '-400']).trim().split('\n')
  .filter((l) => l.split(' ')[1] === DAY)
for (const l of walk) {
  const h = l.split(' ')[0]
  const files = git(['show', '--pretty=format:', '--name-only', '-m', '--first-parent', h]).split('\n').filter(Boolean)
  const pf = files.filter(isPlayerPath)
  if (pf.length) console.log(`${l.slice(0, 10)} ${l.split(' ').slice(3, 4)} ${l.split(' ').slice(5).join(' ').slice(0, 160)}\n    ${pf.join(' ')}`)
}

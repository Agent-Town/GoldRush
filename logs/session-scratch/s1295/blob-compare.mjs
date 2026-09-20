// s1295: is the rung-gate-v2 slice content ALREADY on main?
// Two-dot main..lane omits the four slice paths, which means main's blobs already equal the lane's.
// Verify by blob hash at three refs, and find WHICH commit put them on main.
import { spawnSync } from 'node:child_process'
const sh = (a) => spawnSync('git', a, { encoding: 'utf8' }).stdout.trim()
const PATHS = [
  'src/agent/PermissionLadder.ts',
  'src/agent/ToolSurface.ts',
  'e2e/m4-01-tool-surface.spec.ts',
  'e2e/m4-05-agent-closeout.spec.ts',
]
for (const f of PATHS) {
  const main = sh(['rev-parse', `main:${f}`])
  const lane = sh(['rev-parse', `lane/e2-arsenal:${f}`])
  const base = sh(['rev-parse', `01be00d7:${f}`])
  console.log(f)
  console.log(`  main ${main}`)
  console.log(`  lane ${lane}   ${main === lane ? '== MAIN EQUALS LANE' : '!= differs'}`)
  console.log(`  base ${base}   ${base === main ? '(main still at base)' : '(main moved off base)'}`)
  const log = sh(['log', '--format=%h %cI %s', '-3', 'main', '--', f])
  console.log('  main history:')
  for (const l of log.split('\n').filter(Boolean)) console.log('    ' + l)
  console.log()
}

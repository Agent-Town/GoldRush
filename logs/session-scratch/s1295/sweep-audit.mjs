// s1295: did other concurrent attended commits sweep src/ or e2e/ bytes their messages don't claim?
// b37c1fc6 ("rehearsal round 2 launched") swept the four held rung-gate-v2 slice paths into main.
// Check every main commit since s1294 took its lock for src/e2e content under a non-drain message.
import { spawnSync } from 'node:child_process'
const sh = (a) => spawnSync('git', a, { encoding: 'utf8' }).stdout
const commits = sh(['log', '--format=%h|%cI|%s', '760765d9..main']).trim().split('\n').filter(Boolean)
for (const line of commits.reverse()) {
  const [h, d, ...rest] = line.split('|')
  const subj = rest.join('|')
  const files = sh(['show', '--stat=200', '--format=', '--name-only', h]).trim().split('\n').filter(Boolean)
  const code = files.filter(f => f.startsWith('src/') || f.startsWith('e2e/'))
  const flag = code.length ? '  <<< CARRIES CODE' : ''
  console.log(`${h} ${d}  ${subj.slice(0, 80)}${flag}`)
  for (const f of code) console.log(`        ${f}`)
}

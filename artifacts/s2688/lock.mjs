// s2688: rewrite STATUS line 1 (lock or handoff). Stamp from `date`, never arithmetic.
import fs from 'node:fs'
import { execFileSync } from 'node:child_process'
const mode = process.argv[2]
const stamp = execFileSync('date', ['+%Y-%m-%dT%H:%MZ'], { encoding: 'utf8' }).trim()
const s = fs.readFileSync('STATUS.md', 'utf8')
const i = s.indexOf('\n')
if (mode === 'lock') {
  fs.writeFileSync('artifacts/s2688/prev-line1.txt', s.slice(0, i) + '\n')
  fs.writeFileSync('STATUS.md', `ACTIVE ${stamp} (s2688 fire) — TK-01 digest for 2026-09-25 only; attended live, standing off the drain lock` + s.slice(i))
} else if (mode === 'handoff') {
  const prev = fs.readFileSync('artifacts/s2688/prev-line1.txt', 'utf8').trim()
  const deskAt = prev.lastIndexOf("🔺 **OWNER'S DESK")
  if (deskAt < 0) throw new Error('no desk tail in the predecessor line')
  const body = fs.readFileSync('artifacts/s2688/handoff-body.txt', 'utf8').trim() + ' ' + prev.slice(deskAt)
  const rest = s.slice(i + 1)
  fs.writeFileSync('STATUS.md', `Last updated: ${stamp} s2688 handoff, lock CLEARED — ${body}\n- **s2687 handoff (line-1 archive):** ${prev}\n${rest}`)
}
console.log(stamp)

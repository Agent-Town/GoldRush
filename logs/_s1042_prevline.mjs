// Extract s1041's handoff line-1 (from commit d8a63d0e) for archiving as a bullet.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
const blob = execFileSync('git', ['show', 'd8a63d0e:STATUS.md'], { maxBuffer: 1 << 30, encoding: 'utf8' })
const line1 = blob.split('\n')[0]
if (!line1.startsWith('Last updated:') || !line1.includes('s1041 handoff')) {
  throw new Error('unexpected line-1 at d8a63d0e — refusing: ' + line1.slice(0, 120))
}
fs.writeFileSync('logs/_s1042_prev_line1.txt', line1 + '\n')
console.log('captured s1041 line-1, len', line1.length)

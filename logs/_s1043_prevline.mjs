// Extract s1042's handoff line-1 (from f6c36f87, the parent of my lock commit 3407f1be) for archiving.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
const blob = execFileSync('git', ['show', 'f6c36f87:STATUS.md'], { maxBuffer: 1 << 30, encoding: 'utf8' })
const line1 = blob.split('\n')[0]
if (!line1.startsWith('Last updated:') || !line1.includes('s1042 handoff')) {
  throw new Error('unexpected line-1 at f6c36f87 — refusing: ' + line1.slice(0, 120))
}
fs.writeFileSync('logs/_s1043_prev_line1.txt', line1 + '\n')
console.log('captured s1042 line-1, len', line1.length)

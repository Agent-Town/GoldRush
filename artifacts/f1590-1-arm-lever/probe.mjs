// F-1590-1 probe: does staling `_metadata.json`.lockfileHash arm vite's
// "Re-optimizing dependencies because lockfile has changed" line?
// Written s1590 as the drain-side manufacture-the-defect check for f1589-4's COULD-NOT-ARM.
// Reversible: vite rewrites the metadata itself as part of re-optimizing.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { spawn } from 'node:child_process'
import path from 'node:path'

const root = process.cwd()
const meta = path.join(root, 'node_modules/.vite/deps/_metadata.json')
const port = process.argv[2] || '5234'
const lever = process.argv[3] || 'stale-hash' // stale-hash | control

if (!existsSync(meta)) {
  console.log('PROBE-ABORT: no _metadata.json — cache is cold, the message is unreachable by construction')
  process.exit(3)
}

const before = JSON.parse(readFileSync(meta, 'utf-8'))
console.log(`lever=${lever}`)
console.log(`lockfileHash-before=${before.lockfileHash}`)

if (lever === 'stale-hash') {
  writeFileSync(meta, JSON.stringify({ ...before, lockfileHash: 'deadbeef' }, null, 2))
  console.log('lockfileHash-written=deadbeef')
} else {
  console.log('lockfileHash-written=<unchanged, control arm>')
}

const out = []
const srv = spawn('npx', ['vite', '--port', port, '--strictPort'], { cwd: root })
srv.stdout.on('data', (d) => out.push(d.toString()))
srv.stderr.on('data', (d) => out.push(d.toString()))

setTimeout(() => {
  srv.kill('SIGTERM')
  const log = out.join('')
  console.log('--- server log ---')
  console.log(log.trim())
  console.log('--- verdict ---')
  const armed = /Re-optimizing dependencies because lockfile has changed/.test(log)
  console.log(`optimization-line-present=${armed}`)
  const after = JSON.parse(readFileSync(meta, 'utf-8'))
  console.log(`lockfileHash-after=${after.lockfileHash}`)
  console.log(`self-healed=${after.lockfileHash === before.lockfileHash}`)
  process.exit(armed ? 0 : 1)
}, 9000)

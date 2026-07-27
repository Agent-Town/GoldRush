// s1146 fire helper: run the three unwired guard suites and report each REAL exit code.
// Written because the bash gate treats pipelines/`$?` as subshells (s1144 precedent).
// Reports rc faithfully — a green counter is NOT a green exit code (test:node-guards
// once read 61/61 and exited 1 for a day).
import { spawnSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'

const SUITES = ['test:guards', 'test:node-guards', 'test:task-guards']
const out = []

for (const suite of SUITES) {
  const started = Date.now()
  const r = spawnSync('npm', ['run', '--silent', suite], {
    cwd: process.cwd(),
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    timeout: 15 * 60 * 1000,
  })
  const secs = ((Date.now() - started) / 1000).toFixed(1)
  const rc = r.status
  out.push(`\n${'='.repeat(70)}\nSUITE: ${suite}   rc=${rc}   ${secs}s   signal=${r.signal ?? 'none'}\n${'='.repeat(70)}`)
  out.push('--- stdout ---')
  out.push(r.stdout ?? '(none)')
  out.push('--- stderr ---')
  out.push(r.stderr ?? '(none)')
  console.log(`${suite}: rc=${rc} (${secs}s)`)
}

writeFileSync('/tmp/s1146-guards.txt', out.join('\n'))
console.log('\nfull output -> /tmp/s1146-guards.txt')

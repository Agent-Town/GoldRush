// F-1327-3 probe — does findings-state-guard SEE a double-state whose open row
// leads with 🔴? Proven by manufacturing the defect in both directions, against a
// synthetic --root, so the live ledger is never mutated.
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import path from 'node:path'

const GUARD = path.resolve('scripts/findings-state-guard.mjs')

function run(openMarker) {
  const root = mkdtempSync(path.join(tmpdir(), 's1327-'))
  mkdirSync(path.join(root, 'tasks'), { recursive: true })
  // Same F-ID declared BOTH closed and open. A guard that reads the open row
  // must report double-state = 1.
  const backlog = [
    '# synthetic ledger',
    '',
    '✅ **F-9999-1 (synthetic, CLOSED — shipped at `deadbeef`).** Closure row.',
    '',
    `${openMarker} **F-9999-1 (synthetic, OPEN — still owed, fire-authorable).** Open row.`,
    '',
  ].join('\n')
  writeFileSync(path.join(root, 'tasks', 'BACKLOG.md'), backlog)

  let out, rc = 0
  try {
    out = execFileSync('node', [GUARD, '--root', root], { encoding: 'utf8' })
  } catch (e) {
    out = (e.stdout || '') + (e.stderr || '')
    rc = e.status
  }
  const ds = (out.match(/double-state\s*:\s*(\d+)/) || [])[1]
  return { marker: openMarker, rc, doubleState: ds, caught: ds === '1' }
}

for (const m of ['🟡', '🔴', '🟠', '🔵', '🚨', '🔺']) {
  const r = run(m)
  console.log(
    `open row led by ${r.marker}  ->  double-state=${r.doubleState}  rc=${r.rc}  ` +
      (r.caught ? 'CAUGHT' : '*** MISSED — the contradiction is invisible ***'),
  )
}

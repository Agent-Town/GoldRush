// s1278 — prove the F-1278-2 test is meaningful: revert ONLY the regex widening,
// show the new test reds, restore byte-identically (sha256 both sides).
import { execFileSync, spawnSync } from 'node:child_process'
import crypto from 'node:crypto'
import fs from 'node:fs'

const P = 'scripts/law-pointer-guard.mjs'
const sha = () => crypto.createHash('sha256').update(fs.readFileSync(P)).digest('hex').slice(0, 16)

const before = sha()
console.log('sha BEFORE:', before)

const c = fs.readFileSync(P, 'utf8')
const WIDE = 'json|md))'
if (!c.includes(WIDE)) throw new Error('anchor miss — refusing to mutate')
fs.writeFileSync(P, c.replace(WIDE, 'json))'))
console.log('regex reverted to code-only (the pre-s1278 state)')

const r = spawnSync('node', ['--test', 'scripts/law-pointer-guard.test.mjs'], { encoding: 'utf8' })
const line = (r.stdout.match(/^ℹ (?:pass|fail) \d+$/gm) || []).join('  ')
const redded = /not ok .*F-1278-2|✖.*F-1278-2/.test(r.stdout)
console.log('under OLD regex ->', line, '| new test failed:', redded)

execFileSync('git', ['checkout', '--', P])
const after = sha()
console.log('sha AFTER :', after, after === before ? '(RESTORED BYTE-IDENTICAL)' : '(MISMATCH!)')
if (after !== before) process.exit(1)
if (!redded) {
  console.error('THE TEST IS DECORATION — it passed against the old regex')
  process.exit(1)
}
console.log('VERDICT: the test is meaningful — it reds on the pre-s1278 code and passes on the new.')

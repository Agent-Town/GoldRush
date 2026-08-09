#!/usr/bin/env node
// salvage-census.mjs — bucket every save/* ref by whether main has already absorbed it.
//
// WHY THIS EXISTS (F-1536-2, measured s1536, census taken s1608):
// The SALVAGE LIFECYCLE law says save/<name> = re-land pending (counts as waiting) and
// archive/<name> = landed (never counts). The dashboard's salvage panel polls three
// HARDCODED save/* names (scripts/dashboard-gen.sh:286) and all three are gone, so the
// panel shows nothing, always. F-1536-2 deliberately did NOT make it dynamic, because
// nobody knew which of the 67 live save/* refs were genuinely pending: resolving them
// dynamically would have put 67 rows on the owner's board, most plainly historical.
//
// That was a MEASUREMENT question, not a ruling, and this script answers it. The RENAME
// (save/* -> archive/*) remains the ledger call F-1536-2 reserved.
//
// The question asked here is ONE-DIRECTIONAL and exact:
//   `git rev-list --count main..<ref>` == 0  <=>  <ref> is an ancestor of main
// i.e. every commit on the ref is already reachable from main. That admits no false
// "absorbed" — it is strictly stronger than a content/file-level comparison, which is
// the F-1081-9 lesson (a coarse file-level read froze three lanes, two never at risk).
//
// Exit codes: 0 always (advisory, per the drain-block-check UNKNOWN precedent).
//             --strict exits 1 if any ABSORBED ref is still named save/* (rename owed).
import { execFileSync } from 'node:child_process'

const strict = process.argv.includes('--strict')
const git = (...a) => execFileSync('git', a, { encoding: 'utf8' }).trim()

// The three names dashboard-gen.sh:286 hardcodes — reported separately because their
// deadness is the visible symptom F-1536-2 was filed about.
const HARDCODED = ['save/w1-04-scatter', 'save/demo-profiles-v1', 'save/m4-embodiment-voice-v1']

const refs = git('for-each-ref', '--format=%(refname:short)', 'refs/heads/save/*')
  .split('\n')
  .filter(Boolean)

const rows = []
for (const ref of refs) {
  let ahead
  try {
    ahead = Number(git('rev-list', '--count', `main..${ref}`))
  } catch {
    rows.push({ ref, bucket: 'DEAD', ahead: null, files: 0, age: '?' })
    continue
  }
  const age = git('log', '-1', '--format=%cs', ref)
  let files = 0
  if (ahead > 0) {
    const names = git('diff', '--name-only', `main...${ref}`)
    files = names ? names.split('\n').filter(Boolean).length : 0
  }
  rows.push({ ref, bucket: ahead === 0 ? 'ABSORBED' : 'HOLDS', ahead, files, age })
}

const by = (b) => rows.filter((r) => r.bucket === b)
const absorbed = by('ABSORBED')
const holds = by('HOLDS')

console.log('=== SALVAGE CENSUS (F-1536-2) ===')
console.log(`total save/* refs: ${rows.length}`)
console.log(`  ABSORBED (ancestor of main; archive/* rename owed by law): ${absorbed.length}`)
console.log(`  HOLDS    (content main lacks; genuinely re-land-pending):  ${holds.length}`)
console.log(`  DEAD     (ref does not resolve):                           ${by('DEAD').length}`)
console.log('')
console.log(`--- dashboard-gen.sh:286 hardcoded refs (the visible symptom) ---`)
for (const ref of HARDCODED) {
  let state = 'DEAD (rev-parse fails)'
  try {
    git('rev-parse', '--verify', `${ref}^{commit}`)
    state = 'RESOLVES'
  } catch {}
  console.log(`  ${ref}: ${state}`)
}
console.log('')
console.log('--- HOLDS: the only refs a dynamic salvage panel should ever show ---')
for (const r of holds.sort((a, b) => b.ahead - a.ahead || a.ref.localeCompare(b.ref))) {
  console.log(`  ${r.ref}  ahead=${r.ahead}  files=${r.files}  last=${r.age}`)
}
console.log('')
console.log('--- ABSORBED: archive/* rename owed (oldest first) ---')
for (const r of absorbed.sort((a, b) => a.age.localeCompare(b.age) || a.ref.localeCompare(b.ref))) {
  console.log(`  ${r.ref}  last=${r.age}`)
}

if (strict && absorbed.length > 0) {
  console.log('')
  console.log(`STRICT: ${absorbed.length} absorbed ref(s) still named save/* — archive/* rename owed.`)
  process.exit(1)
}

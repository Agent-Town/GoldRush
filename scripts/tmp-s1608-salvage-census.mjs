// s1608 — F-1536-2 census: bucket every save/* ref by whether main has absorbed it.
//
// The finding reserves the RENAME (save/* -> archive/*) as a ledger call. This script
// does only the MEASUREMENT that call needs, and it asks the one-directional question
// (does this ref hold commits main lacks?) rather than a file-level eyeball — the
// F-1081-9 lesson: a coarse read froze three lanes, two of which were never at risk.
//
// Buckets:
//   ABSORBED   main..ref is empty            -> the SALVAGE LIFECYCLE law already says archive/*
//   HOLDS      main..ref non-empty           -> genuinely re-land-pending, needs a ruling
//   DEAD       ref does not resolve          -> the three the dashboard hardcodes
import { execFileSync } from 'node:child_process'

const git = (...a) => execFileSync('git', a, { encoding: 'utf8' }).trim()

const refs = git('for-each-ref', '--format=%(refname:short)', 'refs/heads/save/*')
  .split('\n')
  .filter(Boolean)

const HARDCODED = ['save/w1-04-scatter', 'save/demo-profiles-v1', 'save/m4-embodiment-voice-v1']

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

// the dashboard's three hardcoded refs, checked separately — they may not be in refs/heads at all
const hardcodedState = HARDCODED.map((ref) => {
  try {
    git('rev-parse', '--verify', `${ref}^{commit}`)
    return `${ref}: RESOLVES`
  } catch {
    return `${ref}: DEAD (rev-parse fails)`
  }
})

const by = (b) => rows.filter((r) => r.bucket === b)
console.log('=== F-1536-2 SALVAGE CENSUS (s1608) ===')
console.log(`total save/* refs: ${rows.length}`)
console.log(`  ABSORBED (main..ref empty, archive/* owed by law): ${by('ABSORBED').length}`)
console.log(`  HOLDS    (content main lacks, needs a ruling):     ${by('HOLDS').length}`)
console.log(`  DEAD:                                              ${by('DEAD').length}`)
console.log('')
console.log('--- dashboard-gen.sh:286 hardcoded refs ---')
hardcodedState.forEach((l) => console.log('  ' + l))
console.log('')
console.log('--- HOLDS (the only ones a dynamic panel should ever show) ---')
by('HOLDS')
  .sort((a, b) => b.ahead - a.ahead)
  .forEach((r) => console.log(`  ${r.ref}  ahead=${r.ahead}  files=${r.files}  last=${r.age}`))
console.log('')
console.log('--- ABSORBED (archive/* rename owed; listed oldest-first) ---')
by('ABSORBED')
  .sort((a, b) => a.age.localeCompare(b.age))
  .forEach((r) => console.log(`  ${r.ref}  last=${r.age}`))

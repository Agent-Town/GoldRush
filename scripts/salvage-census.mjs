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
// ⚠️ WHAT `HOLDS` DOES NOT MEAN (F-2115-1 measured it first; F-2186-1 re-measured on
// a second axis and cured the wording. Read before acting on the number, and before
// building the dynamic panel F-1536-2 deferred.)
// The test above is COMMIT ANCESTRY. It establishes that main lacks these commits. It
// CANNOT establish that anyone intends to re-land them — and the old wording here
// ("genuinely re-land-pending") asserted exactly that, which is why this caveat lives
// at the source of the claim rather than only in the BACKLOG rows that noticed it.
//
// 📊 PRIOR ART, NOT SUPERSEDED: s2115 drove all 16 then-live non-ancestors through
// `lane-freeze-classify.mjs` and found only FOUR held a file main had never seen (all
// art-staging); the other TWELVE were `LANE-ONLY=0` — "LINE RESIDUE, not slices".
// s2186 asked a different question — what CLASS of path does each ref hold? — and the
// two partitions AGREE EXACTLY on the shared 16, which is the control that makes both
// trustworthy. Today's 18 is s2115's 16 plus two refs minted after it ran
// (`art-staging-20260822`, `s2128-handoff`), both backup-class. Counts drift; re-run.
//
// 🆕 WHAT s2186 ADDS BEYOND s2115:
//   - 6 of 18 hold NO source main lacks — only backup-class paths (logs/ artifacts/
//     assets/ salvage/ worktrees/ STATUS.md). `s2128-handoff`'s OWN COMMIT MESSAGE
//     says "BANKED COPY"; `art-diverged-20260726`'s 14 files sit under a literal
//     `salvage/` prefix. The refs declare their intent and the census cannot read it.
//   - THE BUCKET COUNTS REFS, NOT WORK: `ap-06b-adapter-wiring` and
//     `ap-06b-reland-s1218` are ONE piece of work — the identical 38-line held set in
//     src/game/Game.ts and a byte-identical e2e/ap-standing-orders.spec.ts blob.
//   - `s2128-handoff` is a DISCHARGED backup: its held line is on main VERBATIM as the
//     s2128 archive bullet (banked === archived, 7818 chars). Every instrument here
//     still reads HOLDS because main's copy carries the bullet prefix — line-level
//     absorption testing is defeated by a prefix, so a "held line" can be a formatting
//     difference over content that was fully preserved.
// So 18 "pending" is 11 distinct pieces of unlanded source work.
//
// 🚫 AND THE MIS-FILING IS NOT COSMETIC: fire.md §2E says a save/* older than ~3h
// "gets a RE-LAND ruling". Executed literally against `s2128-handoff` that would
// overwrite STATUS.md line-1 with a 58-fire-stale handoff. For a mis-filed ref the
// lifecycle's prescribed action is HARMFUL, not merely wasteful.
//
// NOT CURED IN CODE, deliberately: "backup vs re-land candidate" is a JUDGEMENT, and a
// red guard over a judgement is excused into uselessness inside a week (F-1460-1's
// `cross-engine` fate). What is cured is free — the two output lines no longer claim an
// intent the test never measured. The path-class probe is ~30 s to re-derive; re-run it
// rather than trusting this comment's counts, which were true at s2186 and will drift.
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
console.log(`  HOLDS    (commits main lacks; RE-LAND INTENT NOT ESTABLISHED): ${holds.length}`)
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
console.log('--- HOLDS: candidates for a salvage panel — NOT a vetted pending list ---')
console.log('    (F-2186-1: 6 of 18 hold only backup-class content. Classify before showing.)')
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

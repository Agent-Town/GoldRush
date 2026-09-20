#!/usr/bin/env node
// s1595 — the NARROW merge-hash arm recommended by F-1594-1 and triggered by
// s1594's (C) ("if a fifth tail-only closure appears, build the narrow arm").
//
// THE QUESTION, kept factual so no judgement enters it:
//   a row whose HEADER (first 260 chars — what grep/cut/a skim reads) carries NO
//   closure verb, whose BODY says it was CURED/PATCHED/FIXED at <hash>, and whose
//   <hash> `git merge-base --is-ancestor` places on main.
// That conjunction is three facts, not an opinion. It is deliberately NOT the
// judgement-shaped "does this row look done?" guard, which s1594 measured at
// 1 false positive in 3 hits and declined to mechanise.
//
// Read-only. Prints its denominator (a class-grep reports its hits and never its
// misses, so the denominator is the only honest thing it can say about coverage).
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const HEADER_CHARS = 260

// Markers that already declare a disposition to the skim-reader. A row led by one
// of these cannot advertise a phantom slot, whatever its header words say.
const CLOSED_MARKERS = ['✅', '🟢', '📏', '⛔']

// Past-tense dispositions. A header carrying any of these tells the reader the
// finding's fate. NOTE: "MEASURED" is deliberately ABSENT — it is a verb about the
// INVESTIGATION, not about the DISPOSITION, which is the s1595 sharpening.
const CLOSURE_VERBS = [
  'CURED', 'CORRECTED', 'PATCHED', 'EXECUTED', 'CLOSED', 'RETIRED', 'SHIPPED',
  'DISCHARGED', 'FIXED', 'ABSORBED', 'LANDED', 'MERGED', 'SUPERSEDED',
  'RESOLVED', 'REFUTED', 'REJECTED', 'WITHDRAWN', 'DONE',
]

// "the body says it was cured AT this hash" — the verb must sit within 60 chars
// before the hash, so a hash merely cited as EVIDENCE (F-1364-1's body cites
// 8229d6e0 as the rehearsal verdict) does not match.
const CURE_AT_HASH = /\b(CURED|PATCHED|FIXED|LANDED|MERGED|SHIPPED|CLOSED|RETIRED)\b[^.!?]{0,60}?\b([0-9a-f]{7,40})\b/gi

const ancestorCache = new Map()
function onMain(hash) {
  if (ancestorCache.has(hash)) return ancestorCache.get(hash)
  let ok = false
  try {
    execFileSync('git', ['merge-base', '--is-ancestor', hash, 'main'], { stdio: 'ignore' })
    ok = true
  } catch { ok = false }
  ancestorCache.set(hash, ok)
  return ok
}

const lines = readFileSync('tasks/BACKLOG.md', 'utf8').split('\n')

let rows = 0, openRows = 0, withCureHash = 0
const hits = []

for (let i = 0; i < lines.length; i++) {
  const line = lines[i]
  const body = line.replace(/^-\s*/, '')
  const m = body.match(/\*\*(F-[A-Z0-9-]+)/) || body.match(/\*\*`?([a-z0-9-]+)`?\b/)
  if (!/^[^\w\s]/.test(body) || !body.includes('**')) continue
  const idm = body.match(/\*\*(F-[A-Za-z0-9-]+)/)
  if (!idm) continue
  rows++

  const marker = [...body][0]
  if (CLOSED_MARKERS.includes(marker)) continue

  const header = body.slice(0, HEADER_CHARS)
  const headerDeclares = CLOSURE_VERBS.some(v => header.toUpperCase().includes(v))
  if (headerDeclares) continue
  openRows++

  const tail = body.slice(HEADER_CHARS)
  CURE_AT_HASH.lastIndex = 0
  const found = []
  let mm
  while ((mm = CURE_AT_HASH.exec(tail)) !== null) {
    const hash = mm[2]
    if (/^[0-9]+$/.test(hash)) continue        // pure digits are counts, not hashes
    found.push({ verb: mm[1].toUpperCase(), hash, ctx: mm[0].slice(0, 90) })
  }
  if (!found.length) continue
  withCureHash++

  const onmain = found.filter(f => onMain(f.hash))
  if (!onmain.length) continue

  hits.push({ line: i + 1, id: idm[1], marker, header: header.slice(0, 150), onmain })
}

console.log(`DENOMINATOR: ${rows} F-ID rows scanned in tasks/BACKLOG.md`)
console.log(`  ${openRows} carry an open-ish marker AND no closure verb in the first ${HEADER_CHARS} chars`)
console.log(`  ${withCureHash} of those name a cure-at-hash in the tail`)
console.log(`  ${hits.length} of those hashes are ancestors of main  <-- CANDIDATES\n`)

for (const h of hits) {
  console.log(`--- ${h.id}  (BACKLOG.md:${h.line})  marker ${h.marker}`)
  console.log(`    header: ${h.header}`)
  for (const f of h.onmain) console.log(`    ON MAIN: ${f.hash}  <= "${f.ctx}"`)
  console.log('')
}

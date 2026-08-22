#!/usr/bin/env node
// s1272 — classify a frozen lane's ahead-commits: is every file the lane touched
// already byte-identical in main (duplicate work), or does the lane still hold
// content main has never seen?
//
// Usage: node scripts/lane-freeze-classify.mjs <branch>
//
// For each path touched by <branch>'s ahead-of-main commits we compare three blobs:
//   base  = merge-base(main, branch):path
//   lane  = branch:path
//   main  = main:path
// and report DUPLICATE (lane === main), LANE-ONLY (main never moved it),
// MAIN-ONLY (lane never moved it) or BOTH-MOVED (3-way graft territory).
//
// A missing path at a revision is recorded as the literal null marker ABSENT so
// that "absent at the merge-base" can never masquerade as a moved file
// (the sentinel bug s1271 caught in its own probe).
//
// ⚠️ WHAT THIS SCRIPT DOES NOT MEASURE — READ BEFORE TRUSTING THE HOLDS LINE
// (F-2188-1, measured s2188; the headline used to end "main has not absorbed").
// Every verdict here is BLOB IDENTITY at three revisions. Blob inequality cannot
// establish non-absorption: main can hold every line the lane added AND have moved
// further, which lands the path in BOTH-MOVED. So `unsafe` over-reports, and BOTH of
// its summands do it for different reasons — BOTH-MOVED as described here, LANE-ONLY
// on pure renames (F-2116-2: main never moved the OLD path because it absorbed the
// content under a NEW one; 2 of 49 paths, 4.1%).
//
// MAGNITUDE, measured s2188 over the whole live corpus — 150 refs (131 archive/*
// non-ancestors + 18 save/* + lane/a), every ref bucketed by THIS script and every
// BOTH-MOVED path then put to scripts/lane-absorbed-lines.mjs:
//   810 BOTH-MOVED paths -> ABSORBED 217 · ABSORBED (token) 11 · NOT ABSORBED 291
//                           · BINARY 291 (line evidence impossible) · MISSING 0
//   => 228/810 = 28.1% fully absorbed; of the 519 that are line-DECIDABLE, 43.9%.
// Both detector directions are demonstrated on that same run (the F-2187-1 standard:
// a bare zero is indistinguishable from a broken detector) — it emits ABSORBED for
// 228 named paths, and NOT ABSORBED with the specific missing lines for lane/a's 4.
//
// The direction of the error is FAIL-SAFE — it over-reports holds and can never cause
// a wrongful reset — so this is a COST, not a risk. But it is the s1271 mechanism
// (three lanes frozen for days, two never at risk), and ~44% is how often it is live.
// Do NOT read a HOLDS line as "this work is unabsorbed"; ask lane-absorbed-lines.mjs.

import { execFileSync } from 'node:child_process'

const ABSENT = Symbol('absent')

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 })
}

function blob(rev, path) {
  try {
    return git(['rev-parse', `${rev}:${path}`]).trim()
  } catch {
    return ABSENT
  }
}

function show(b) {
  return b === ABSENT ? 'ABSENT' : b.slice(0, 8)
}

const branch = process.argv[2]
if (!branch) {
  console.error('usage: lane-freeze-classify.mjs <branch>')
  process.exit(2)
}

const ahead = git(['rev-list', `main..${branch}`]).trim().split('\n').filter(Boolean)
if (ahead.length === 0) {
  console.log(`${branch}: ahead=0 — nothing to classify`)
  process.exit(0)
}

const base = git(['merge-base', 'main', branch]).trim()
const paths = new Set()
for (const sha of ahead) {
  const names = git(['show', '--pretty=', '--name-only', sha]).trim()
  for (const p of names.split('\n')) if (p) paths.add(p)
}

const buckets = { DUPLICATE: [], 'LANE-ONLY': [], 'MAIN-ONLY': [], 'BOTH-MOVED': [] }
for (const p of [...paths].sort()) {
  const b = blob(base, p)
  const l = blob(branch, p)
  const m = blob('main', p)
  let verdict
  if (l === m) verdict = 'DUPLICATE'
  else if (m === b) verdict = 'LANE-ONLY'
  else if (l === b) verdict = 'MAIN-ONLY'
  else verdict = 'BOTH-MOVED'
  buckets[verdict].push({ p, b: show(b), l: show(l), m: show(m) })
}

console.log(`${branch}  ahead=${ahead.length}  base=${base.slice(0, 8)}  paths=${paths.size}`)
for (const [k, v] of Object.entries(buckets)) {
  console.log(`  ${k}: ${v.length}`)
  if (k !== 'DUPLICATE') for (const r of v) console.log(`    ${r.p}  base=${r.b} lane=${r.l} main=${r.m}`)
}
const unsafe = buckets['LANE-ONLY'].length + buckets['BOTH-MOVED'].length
if (unsafe === 0) {
  console.log('  => LOSS-FREE (every lane-touched path already in main)')
} else {
  // Say only what blob identity measured. "not absorbed" was a claim this script has
  // no test for, and 28.1% of the paths it named were absorbed (F-2188-1).
  console.log(`  => HOLDS ${unsafe} path(s) NOT BYTE-IDENTICAL to main — NOT an absorption verdict`)
  console.log(
    `     ${buckets['BOTH-MOVED'].length} BOTH-MOVED + ${buckets['LANE-ONLY'].length} LANE-ONLY untested for absorption ` +
      '(F-2188-1: 28.1% of 810 such paths measured FULLY ABSORBED; 43.9% of the line-decidable ones)',
  )
  console.log(`     ask the one-directional question: node scripts/lane-absorbed-lines.mjs ${branch} <path>...`)
}
process.exit(unsafe === 0 ? 0 : 1)

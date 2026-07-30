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
console.log(`  => ${unsafe === 0 ? 'LOSS-FREE (every lane-touched path already in main)' : `HOLDS ${unsafe} path(s) main has not absorbed`}`)
process.exit(unsafe === 0 ? 0 : 1)

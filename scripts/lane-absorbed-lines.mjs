#!/usr/bin/env node
// s1272 — for a BOTH-MOVED path on a frozen lane, decide the question the
// file-level classifier cannot: did MAIN already absorb what the LANE added?
//
// Usage: node scripts/lane-absorbed-lines.mjs <branch> <path> [<path> ...]
//
// Method: take the lane's own delta (merge-base -> lane tip) for the path, keep
// its added lines, and check each one appears verbatim in main's copy of the
// file. All present => main is a superset of the lane's contribution on this
// path and resetting the lane loses nothing. Any missing line is printed.
//
// This is deliberately line-level and deliberately one-directional. It answers
// "is the lane's work safe to discard", NOT "are the files equal" — they are
// not equal by construction (main moved too, which is why the file classified
// BOTH-MOVED in the first place).
//
// Binary paths are reported UNDECIDABLE, never silently passed.

import { execFileSync } from 'node:child_process'
import { residueFor } from './lane-residue.mjs'

function git(args, opts = {}) {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, ...opts })
}

const [branch, ...paths] = process.argv.slice(2)
if (!branch || paths.length === 0) {
  console.error('usage: lane-absorbed-lines.mjs <branch> <path> [<path> ...]')
  process.exit(2)
}

const base = git(['merge-base', 'main', branch]).trim()
let unresolved = 0

for (const path of paths) {
  let diff
  try {
    diff = git(['diff', `${base}:${path}`, `${branch}:${path}`])
  } catch {
    console.log(`${path}: UNDECIDABLE (path absent at base or lane tip)`)
    unresolved++
    continue
  }
  const binary = residueFor({ diff, mainText: '' })
  if (binary.status === 'BINARY') {
    console.log(`${path}: BINARY — line evidence impossible, judge by provenance`)
    unresolved++
    continue
  }

  let mainText
  try {
    mainText = git(['show', `main:${path}`])
  } catch {
    const added = residueFor({ diff, mainText: '' }).added
    console.log(`${path}: MISSING IN MAIN — lane holds ${added.length} added line(s) main has never seen`)
    unresolved++
    continue
  }
  const residue = residueFor({ diff, mainText })
  if (residue.status === 'ABSORBED') {
    console.log(`${path}: ABSORBED — all ${residue.added.length} added line(s) present in main`)
    continue
  }
  if (residue.status === 'ABSORBED_TOKEN') {
    console.log(
      `${path}: ABSORBED (token-level) — ${residue.wholeLineMissing.length} line(s) differ whole-line, ` +
        `but every token they add appears in a single main line (main is a superset)`,
    )
    continue
  }

  console.log(
    `${path}: NOT ABSORBED — ${residue.missing.length}/${residue.added.length} added line(s) absent from main:`,
  )
  for (const l of residue.missing.slice(0, 20)) console.log(`    ${JSON.stringify(l)}`)
  if (residue.missing.length > 20) console.log(`    ... ${residue.missing.length - 20} more`)
  unresolved++
}

process.exit(unresolved === 0 ? 0 : 1)

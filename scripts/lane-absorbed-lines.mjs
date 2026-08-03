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
import { residueForHeld } from './lane-usable.mjs'

const QUIET = { stdio: ['ignore', 'pipe', 'ignore'] }

function git(args, opts = {}) {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, ...opts })
}

export function absorbedLinesForPath(base, branch, path, runGit = git) {
  const residue = residueForHeld({ base, branch }, { path }, runGit)
  if (residue.status === 'UNDECIDABLE') {
    return { lines: [`${path}: UNDECIDABLE (path unreadable at lane tip)`], unresolved: true }
  }
  if (residue.status === 'BINARY') {
    return { lines: [`${path}: BINARY — line evidence impossible, judge by provenance`], unresolved: true }
  }

  try {
    runGit(['cat-file', '-e', `main:${path}`], QUIET)
  } catch {
    return {
      lines: [`${path}: MISSING IN MAIN — lane holds ${residue.added.length} added line(s) main has never seen`],
      unresolved: true,
    }
  }
  if (residue.status === 'ABSORBED') {
    return { lines: [`${path}: ABSORBED — all ${residue.added.length} added line(s) present in main`], unresolved: false }
  }
  if (residue.status === 'ABSORBED_TOKEN') {
    return { lines: [
      `${path}: ABSORBED (token-level) — ${residue.wholeLineMissing.length} line(s) differ whole-line, ` +
        `but every token they add appears in a single main line (main is a superset)`,
    ], unresolved: false }
  }

  const lines = [
    `${path}: NOT ABSORBED — ${residue.missing.length}/${residue.added.length} added line(s) absent from main:`,
    ...residue.missing.slice(0, 20).map((line) => `    ${JSON.stringify(line)}`),
  ]
  if (residue.missing.length > 20) lines.push(`    ... ${residue.missing.length - 20} more`)
  return { lines, unresolved: true }
}

const isMain = /(^|\/)lane-absorbed-lines\.mjs$/.test(process.argv[1] || '')
if (isMain) {
  const [branch, ...paths] = process.argv.slice(2)
  if (!branch || paths.length === 0) {
    console.error('usage: lane-absorbed-lines.mjs <branch> <path> [<path> ...]')
    process.exit(2)
  }

  const base = git(['merge-base', 'main', branch]).trim()
  let unresolved = 0
  for (const path of paths) {
    const result = absorbedLinesForPath(base, branch, path)
    for (const line of result.lines) console.log(line)
    if (result.unresolved) unresolved++
  }
  process.exit(unresolved === 0 ? 0 : 1)
}

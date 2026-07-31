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

function git(args, opts = {}) {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, ...opts })
}

function tokens(line) {
  return line.split(/[\s,"'`;(){}[\]]+/).filter((t) => t.length > 2)
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
  if (/^Binary files/m.test(diff) || /^GIT binary patch/m.test(diff)) {
    console.log(`${path}: BINARY — line evidence impossible, judge by provenance`)
    unresolved++
    continue
  }

  const added = diff
    .split('\n')
    .filter((l) => l.startsWith('+') && !l.startsWith('+++'))
    .map((l) => l.slice(1))
    .filter((l) => l.trim() !== '')

  let mainText
  try {
    mainText = git(['show', `main:${path}`])
  } catch {
    console.log(`${path}: MISSING IN MAIN — lane holds ${added.length} added line(s) main has never seen`)
    unresolved++
    continue
  }
  const mainLines = new Set(mainText.split('\n').map((l) => l.trim()))

  const missing = added.filter((l) => !mainLines.has(l.trim()))
  if (missing.length === 0) {
    console.log(`${path}: ABSORBED — all ${added.length} added line(s) present in main`)
    continue
  }

  // Whole-line equality is too coarse for long single-line records (a package.json
  // script, a CSV row): main can have absorbed every token the lane added and STILL
  // differ on the line, because main added tokens of its own. Fall back to tokens:
  // a lane line is absorbed if some main line contains all of its tokens.
  const mainTokens = mainText.split('\n').map((l) => new Set(tokens(l)))
  const residual = []
  // Guarded deliberately: the fallback only applies to token-RICH lines. A short
  // code line ("return false;") has so few distinct tokens that some unrelated main
  // line will contain them all by chance, which would manufacture a false ABSORBED
  // on exactly the case that matters most. Below the threshold, line-level stands.
  const RICH = 8
  for (const l of missing) {
    const want = tokens(l)
    const covered = want.length >= RICH && mainTokens.some((have) => want.every((t) => have.has(t)))
    if (!covered) residual.push(l)
  }

  if (residual.length === 0) {
    console.log(
      `${path}: ABSORBED (token-level) — ${missing.length} line(s) differ whole-line, ` +
        `but every token they add appears in a single main line (main is a superset)`,
    )
    continue
  }

  console.log(`${path}: NOT ABSORBED — ${residual.length}/${added.length} added line(s) absent from main:`)
  for (const l of residual.slice(0, 20)) console.log(`    ${JSON.stringify(l)}`)
  if (residual.length > 20) console.log(`    ... ${residual.length - 20} more`)
  unresolved++
}

process.exit(unresolved === 0 ? 0 : 1)

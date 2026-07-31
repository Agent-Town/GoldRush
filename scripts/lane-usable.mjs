#!/usr/bin/env node
// s1299 — F-1298-4: answer the REFILL question, which is not the question
// lane-freeze-classify.mjs answers.
//
//   lane-freeze-classify.mjs asks:  "would a reset LOSE anything?"      (safety)
//   this script asks:               "can a master RUN here right now?"  (usability)
//
// s1298 measured lane/m4 LOSS-FREE, refilled it, and the runner STOPped at the
// master's pre-flight in 26,940 tokens with zero edits — because the pre-flight
// asks a different question: "confirm this worktree/branch is clean vs main
// before any reset; if the branch holds unmerged content, STOP and report."
// A lane can be safe-to-reset and unusable at the same time. The binding
// condition for a refill is therefore `git log main..<branch>` EMPTY — the
// classifier's LOSS-FREE verdict is what makes it safe to MAKE it empty, not a
// substitute for it.
//
// Usage:
//   node scripts/lane-usable.mjs <slot|branch>     # one lane
//   node scripts/lane-usable.mjs --all             # the whole fleet
//   node scripts/lane-usable.mjs <slot> --cure     # archive tip + reset to main
//
// Exit codes (single-lane form; --all is an audit and always exits 0):
//   0 USABLE   — main..branch empty, tree clean, no runner pid: refill freely
//   1 CURABLE  — ahead but every touched path is already in main: run --cure
//   2 BLOCKED  — holds content main has never seen, or dirty, or busy: judge it
//   3 misuse
//
// --cure acts ONLY on CURABLE. A lane that HOLDS paths main never absorbed is
// never auto-reset: the held paths are printed so a fire can rule on them by
// hand (they are usually build debris or the logs/ churn of F-1124-2, but that
// is a judgement, and judgements do not belong in a script).

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'

const ABSENT = Symbol('absent')
// The runner itself excludes these from every lane commit (lane-runner-v3.sh:105),
// so dirt confined to them can never be lane content.
const CHURN = ['.wrangler', 'logs/factory-usage.json', 'logs/usage-history.jsonl']

function git(args, opts = {}) {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, ...opts })
}

function tryGit(args, opts = {}) {
  try {
    return { ok: true, out: git(args, opts) }
  } catch (err) {
    return { ok: false, out: String(err?.stderr || err?.message || err) }
  }
}

function blob(rev, path) {
  const r = tryGit(['rev-parse', `${rev}:${path}`], { stdio: ['ignore', 'pipe', 'ignore'] })
  return r.ok ? r.out.trim() : ABSENT
}

// slot -> {slot, branch, worktree}, read from git itself so a renamed branch can
// never desync from the slot it is checked out in (lane slot names are NOT branch
// names: lane-a is lane/m3, lane-b is lane/m4, lane-c is lane/e2-arsenal, lane-d
// is lane/perf — and that mapping has burned fires before).
function fleet() {
  const out = git(['worktree', 'list', '--porcelain'])
  const lanes = []
  let wt = null
  for (const line of out.split('\n')) {
    if (line.startsWith('worktree ')) wt = line.slice(9).trim()
    else if (line.startsWith('branch ') && wt) {
      const branch = line.slice(7).trim().replace(/^refs\/heads\//, '')
      const m = wt.match(/\/worktrees\/([^/]+)$/)
      if (m) lanes.push({ slot: m[1], branch, worktree: wt })
    }
  }
  return lanes.sort((a, b) => a.slot.localeCompare(b.slot))
}

function resolve(name) {
  const all = fleet()
  return all.find((l) => l.slot === name) || all.find((l) => l.branch === name) || null
}

function classify(branch) {
  const ahead = git(['rev-list', `main..${branch}`]).trim().split('\n').filter(Boolean)
  if (ahead.length === 0) return { ahead: 0, held: [], paths: 0 }
  const base = git(['merge-base', 'main', branch]).trim()
  const paths = new Set()
  for (const sha of ahead) {
    for (const p of git(['show', '--pretty=', '--name-only', sha]).trim().split('\n')) {
      if (p) paths.add(p)
    }
  }
  const held = []
  for (const p of [...paths].sort()) {
    const b = blob(base, p)
    const l = blob(branch, p)
    const m = blob('main', p)
    if (l === m) continue // DUPLICATE — main has it byte-identical
    if (l === b) continue // MAIN-ONLY — the lane never moved it
    held.push({ path: p, kind: m === b ? 'LANE-ONLY' : 'BOTH-MOVED' })
  }
  return { ahead: ahead.length, tip: ahead[0], base, paths: paths.size, held }
}

// Tracked dirt and untracked debris are NOT the same hazard and must not share a
// label: `reset --hard` cures the first, `clean -fd` the second, and the runner's
// pre-flight does both. Only tracked dirt can be someone's unsaved work, so only
// tracked dirt blocks. (Caught s1299 by running this script on lane-a, where two
// untracked .pyc files were being reported under the words "tracked dirt".)
function dirt(worktree) {
  const out = git(['status', '--porcelain'], { cwd: worktree }).trim()
  if (!out) return { tracked: [], untracked: [], churn: 0 }
  const tracked = []
  const untracked = []
  let churn = 0
  for (const line of out.split('\n')) {
    const path = line.slice(3).trim()
    if (!path) continue
    if (CHURN.some((c) => path === c || path.startsWith(`${c}/`))) {
      churn += 1
      continue
    }
    if (line.startsWith('??')) untracked.push(path)
    else tracked.push(path)
  }
  return { tracked, untracked, churn }
}

function sessionLabel() {
  try {
    const m = readFileSync('STATUS.md', 'utf8').split('\n')[0].match(/\(s(\d+) fire\)/)
    if (m) return `s${m[1]}`
  } catch {}
  return 'fire'
}

function inspect(lane) {
  const busy = existsSync(`tasks/running/${lane.slot}.pid`)
  const c = classify(lane.branch)
  const d = dirt(lane.worktree)
  let verdict
  if (busy) verdict = 'BUSY'
  else if (d.tracked.length > 0) verdict = 'DIRTY'
  else if (c.ahead === 0) verdict = 'USABLE'
  else if (c.held.length === 0) verdict = 'AHEAD-BUT-ABSORBED'
  else verdict = 'HOLDS'
  return { ...lane, busy, ...c, dirt: d, verdict }
}

const RC = { USABLE: 0, 'AHEAD-BUT-ABSORBED': 1, HOLDS: 2, DIRTY: 2, BUSY: 2 }

function report(r) {
  console.log(
    `${r.slot}  ${r.branch}  ahead=${r.ahead}  paths=${r.paths ?? 0}` +
      `  tracked-dirt=${r.dirt.tracked.length}  untracked=${r.dirt.untracked.length}${r.busy ? '  BUSY' : ''}`,
  )
  for (const h of r.held) console.log(`    HELD ${h.kind}  ${h.path}`)
  for (const p of r.dirt.tracked.slice(0, 10)) console.log(`    TRACKED-DIRT ${p}`)
  for (const p of r.dirt.untracked.slice(0, 10)) console.log(`    untracked (clean -fd) ${p}`)
  if (r.dirt.churn > 0) {
    console.log(`    (${r.dirt.churn} churn-only path(s) ignored: ${CHURN.join(', ')})`)
  }
  const note = {
    USABLE: 'refill freely — a master pre-flight will find main..branch empty',
    'AHEAD-BUT-ABSORBED': 'safe to reset, NOT usable as-is — pre-flight will STOP. Run --cure.',
    HOLDS: 'drain or rule on the held paths first — never auto-reset over them',
    DIRTY: 'TRACKED dirt in the worktree — find its owner before touching this lane',
    BUSY: 'a runner holds this slot — leave it alone',
  }[r.verdict]
  console.log(`  => ${r.verdict}: ${note}`)
}

function cure(r) {
  if (r.verdict !== 'AHEAD-BUT-ABSORBED') {
    console.error(`refusing to cure ${r.slot}: verdict is ${r.verdict}, not AHEAD-BUT-ABSORBED`)
    return 2
  }
  // History first (RETENTION LAW): the tip gets a durable ref BEFORE the reset,
  // so a wrong classification costs a lookup, not a commit.
  const slug = r.branch.replace(/\//g, '-')
  const ref = `archive/${slug}-${sessionLabel()}-absorbed-${r.tip.slice(0, 8)}`
  const a = tryGit(['branch', '-f', ref, r.tip])
  if (!a.ok) {
    console.error(`archive FAILED, no reset attempted: ${a.out}`)
    return 2
  }
  console.log(`  archived tip ${r.tip.slice(0, 8)} -> ${ref}`)
  const rs = tryGit(['reset', '--hard', 'main'], { cwd: r.worktree })
  if (!rs.ok) {
    console.error(`reset FAILED (archive ${ref} stands): ${rs.out}`)
    return 2
  }
  const after = git(['rev-list', `main..${r.branch}`]).trim()
  if (after) {
    console.error(`reset did not empty main..${r.branch} — still ${after.split('\n').length} ahead`)
    return 2
  }
  console.log(`  ${r.branch} reset to main — main..${r.branch} now EMPTY, lane USABLE`)
  return 0
}

const argv = process.argv.slice(2)
const doCure = argv.includes('--cure')
const target = argv.find((a) => !a.startsWith('--'))

if (argv.includes('--all')) {
  for (const lane of fleet()) report(inspect(lane))
  process.exit(0)
}
if (!target) {
  console.error('usage: lane-usable.mjs <slot|branch> [--cure] | --all')
  process.exit(3)
}
const lane = resolve(target)
if (!lane) {
  console.error(`no lane worktree matches "${target}" — known: ${fleet().map((l) => `${l.slot}(${l.branch})`).join(' ')}`)
  process.exit(3)
}
const r = inspect(lane)
report(r)
process.exit(doCure ? cure(r) : RC[r.verdict])

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
// The runner itself excludes these from every lane commit (lane-runner-v3.sh:121
// — re-based s1416 by READING the file; the comment had said :105, and the
// pathspec had drifted 16 lines down. Cite the CODE, the coordinate rots).
// Dirt confined to them can never be lane content.
export const CHURN = ['.wrangler', 'logs/factory-usage.json', 'logs/usage-history.jsonl']

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

// F-1320-2 (s1320, measured by a wasted 53k-token run; the minimum landed s1322).
// This file answers "would a reset LOSE anything?" and "is the tree clean?" — it has never
// answered "is this branch CURRENT?", and being BEHIND main satisfies `main..branch = ∅`
// trivially, so staleness is invisible to the USABLE verdict by construction. s1320 read
// USABLE twice on a lane 153 commits behind main and queued a task that could not run.
//
// The behind-count is printed UNCONDITIONALLY rather than turned into a fourth verdict word,
// and that restraint is measured rather than cautious. Every lane on this board is behind
// main right now — m3=55, m4=19, e2-arsenal=161, perf=8 (s1322) — because lane-runner-v3.sh
// never refreshes a lane on dispatch (:124-129, the only path is an explicit janitor req).
// A verdict keyed on `behind > 0` would therefore red the entire fleet and be flagged past
// within a fire or two, and any threshold above 0 would be a number chosen by taste.
// ⚠️ Whether the lane is stale ENOUGH TO MATTER is a property of the TASK, not of the lane:
// what s1320 actually needed was `git merge-base --is-ancestor <the commit the task depends
// on> <branch>`. A count cannot answer that, so this prints the number that makes a reader
// ASK the question and leaves the question itself where it belongs.
function behindCount(branch) {
  return git(['rev-list', '--count', `${branch}..main`]).trim() || '?'
}

// s1343 — F-1343-2. The comment above is right that staleness-enough-to-matter is a property of
// the TASK, and this does NOT turn it into a verdict word. It fixes a different problem: the
// behind-COUNT conflates bookkeeping with code, and it is the only number the footnote offers.
//
// Measured s1343 on the live fleet: lane-a/c/d each read `behind=59`, which sounds alarming.
// Of those 59 commits, ZERO touched `src/` and zero touched `functions/`; the real drift was
// FIVE files — four e2e specs and package.json. The other 54 commits were STATUS.md, artifacts
// screenshots and ledger rows, which cannot affect whether a master RUNS. "59" and "5 files, no
// game source" call for completely different decisions, and only the second is readable.
//
// The package.json entry is why this is worth printing rather than leaving to the reader:
// lane/m3's `test:ledger-guards` was a STRICT SUBSET of main's (missing test:desk-declaration
// and status-archive-audit), so a task gated on that lane would produce a green that means less
// than main's green — a false-green hazard invisible to every existing probe.
//
// Deliberately narrow: only surfaces that can change whether a task runs or how it is gated.
// docs/, tasks/, artifacts/, reviews/ and logs/ are excluded BY DESIGN, not by oversight.
const RUN_SURFACE = [
  'src', 'e2e', 'functions', 'scripts',
  'package.json', 'package-lock.json', 'playwright.config.ts', 'tsconfig.json', 'vite.config.ts',
]

function surfaceDrift(branch) {
  const out = git(['diff', '--name-only', branch, 'main', '--', ...RUN_SURFACE]).trim()
  return out ? out.split('\n').filter(Boolean) : []
}

function classify(branch) {
  const ahead = git(['rev-list', `main..${branch}`]).trim().split('\n').filter(Boolean)
  if (ahead.length === 0) return { ahead: 0, behind: behindCount(branch), held: [], paths: 0 }
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
  return { ahead: ahead.length, behind: behindCount(branch), tip: ahead[0], base, paths: paths.size, held }
}

// Tracked dirt and untracked debris are NOT the same hazard and must not share a
// label: `reset --hard` cures the first, `clean -fd` the second, and the runner's
// pre-flight does both. Only tracked dirt can be someone's unsaved work, so only
// tracked dirt blocks. (Caught s1299 by running this script on lane-a, where two
// untracked .pyc files were being reported under the words "tracked dirt".)
// F-1416-1 (s1416): the parse takes the porcelain TEXT, never the worktree, so it
// is testable without a repo — the defect below was invisible for 117 sessions
// precisely because no test could reach it.
//
// ⚠️ NEVER `.trim()` porcelain output. Every line is `XY<space>path`, and a
// modified-unstaged line begins with a SPACE (" M path"). Trimming the whole
// buffer strips that space from the FIRST line only, so `slice(3)` then eats the
// first character of that one path — which is why s1415 saw "rtifacts/..." on
// line 1 and "artifacts/..." on line 2 and filed it as cosmetic. It is not
// cosmetic: the mangled path is what the CHURN test at the bottom compares, so
// whenever the alphabetically-first dirty path is a churn path it fails to match
// ("ogs/factory-usage.json" !== "logs/factory-usage.json") and the lane reports a
// FALSE DIRTY. Measured s1416: with the artifact churn discarded, all four lanes
// still read DIRTY on logs/factory-usage.json — a path lane-runner-v3.sh:121
// excludes from every lane commit and which therefore can never be lane content.
export function classifyDirt(porcelain) {
  const tracked = []
  const untracked = []
  const churn = []
  for (const line of porcelain.split('\n')) {
    if (!line) continue
    const path = line.slice(3).trim()
    if (!path) continue
    if (CHURN.some((c) => path === c || path.startsWith(`${c}/`))) {
      churn.push(path)
      continue
    }
    if (line.startsWith('??')) untracked.push(path)
    else tracked.push(path)
  }
  return { tracked, untracked, churn }
}

function dirt(worktree) {
  return classifyDirt(git(['status', '--porcelain'], { cwd: worktree }).replace(/\n+$/, ''))
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
    `${r.slot}  ${r.branch}  ahead=${r.ahead}  behind=${r.behind ?? '?'}  paths=${r.paths ?? 0}` +
      `  tracked-dirt=${r.dirt.tracked.length}  untracked=${r.dirt.untracked.length}${r.busy ? '  BUSY' : ''}`,
  )
  for (const h of r.held) console.log(`    HELD ${h.kind}  ${h.path}`)
  for (const p of r.dirt.tracked.slice(0, 10)) console.log(`    TRACKED-DIRT ${p}`)
  for (const p of r.dirt.untracked.slice(0, 10)) console.log(`    untracked (clean -fd) ${p}`)
  // Print the paths MATCHED, not the CHURN list — the old form printed all three
  // constants beside a count of two, which reads as a mismatch and invites the
  // next reader to distrust the number rather than the label (s1416).
  if (r.dirt.churn.length > 0) {
    console.log(`    (${r.dirt.churn.length} churn-only path(s) ignored: ${r.dirt.churn.join(', ')})`)
  }
  const note = {
    USABLE: 'refill freely — a master pre-flight will find main..branch empty',
    'AHEAD-BUT-ABSORBED': 'safe to reset, NOT usable as-is — pre-flight will STOP. Run --cure.',
    HOLDS: 'drain or rule on the held paths first — never auto-reset over them',
    DIRTY: 'TRACKED dirt in the worktree — find its owner before touching this lane',
    BUSY: 'a runner holds this slot — leave it alone',
  }[r.verdict]
  console.log(`  => ${r.verdict}: ${note}`)
  // Deliberately attached to USABLE alone. On every other verdict the lane is not being
  // refilled this minute, so a staleness footnote would be noise; on USABLE it is the exact
  // moment the F-1320-2 mistake gets made, and the verdict word itself says "refill freely".
  if (r.verdict === 'USABLE' && Number(r.behind) > 0) {
    console.log(
      `     ⚠️  but ${r.branch} is ${r.behind} commit(s) BEHIND main. USABLE does not mean CURRENT.\n` +
        `     Before queueing, name the commit your task depends on and prove the lane has it:\n` +
        `       git merge-base --is-ancestor <sha> ${r.branch}\n` +
        `     If it does not, request a refresh (tasks/janitor/<name>.req: refresh-lane ${r.slot}) — F-1320-2.`,
    )
    // The count above answers "how far behind"; this answers "behind in anything that RUNS" —
    // usually a far smaller and more actionable number (F-1343-2).
    const drift = surfaceDrift(r.branch)
    if (drift.length === 0) {
      console.log(
        `     ✅ ...but NONE of it is run-surface: src/ e2e/ functions/ scripts/ and the configs are\n` +
          `        byte-identical to main. The gap is bookkeeping only — nothing here can stop a task running.`,
      )
    } else {
      console.log(`     📋 run-surface drift: ${drift.length} file(s) main has moved that this lane lacks:`)
      for (const p of drift.slice(0, 8)) console.log(`          ${p}`)
      if (drift.length > 8) console.log(`          … and ${drift.length - 8} more`)
      if (drift.some((p) => p === 'package.json')) {
        console.log(
          `        ⚠️  package.json is among them — this lane's npm GATES may be a strict SUBSET of\n` +
            `        main's, so a green here can mean less than a green on main. Diff it before trusting a gate.`,
        )
      }
    }
  }
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

// Importing this module must not run the CLI — the guard exists so classifyDirt
// can be tested without a repo, and it is keyed on the entry script's NAME so a
// test importing it (process.argv[1] = the test file) never trips it (s1416).
const isMain = /(^|\/)lane-usable\.mjs$/.test(process.argv[1] || '')
if (!isMain) {
  // exported-only use; nothing below runs
} else {

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

}

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
import { existsSync, lstatSync, readFileSync } from 'node:fs'
import { residueFor } from './lane-residue.mjs'

// s2639 — F-2639-1. The two predicates below are DELIBERATE LOCAL COPIES of ones the evidence
// census exports, and the duplication is measured rather than lazy. F-1261-1 says there is one
// implementation of a word in this repo, so the first draft of this cure IMPORTED them — and
// that import is the wrong trade HERE, for a reason specific to this file:
//
//   `lane-runner-v3.sh:294` runs `node scripts/lane-usable.mjs <slot>` as its LANE-SAFETY
//   PROBE, and when that probe returns no verdict the runner DISPATCHES ANYWAY —
//   "LANE-SAFETY PROBE INDETERMINATE ... DISPATCHING master.md FAIL-OPEN, guard NOT enforced"
//   (F-2089-2). A module-load failure is exactly a no-verdict. So every relative import added
//   here widens the surface on which a resetting master gets dispatched over undrained work:
//   the Reset Massacre direction (Mistake #2), reached by a load error rather than a bug.
//
// It is LATENT today and that is stated honestly — the runner `cd`s to the MAIN root, where
// both files exist, so nothing was ever broken. What made the trade clear is the blast radius
// the import actually had: FIVE separate guards construct scratch copies of this file, and
// adding one import reddened four of them plus a bash guard, every one by producing EMPTY
// output. And all four lane branches are 746-1022 commits behind and DO NOT CONTAIN the census
// file at all (measured), so any future caller running this script from a lane checkout would
// hit the same load failure — in the runner's case, fail-open.
//
// F-1261-1's PURPOSE is silent drift, and that is served WITHOUT the import: arms 17-18 of
// `lane-usable-dirt-durability-guard.test.mjs` import the census and assert both copies agree,
// which is the same shape `desk-carryforward-guard` uses for `subjectLedClosure` and the cure
// F-2227-1 prescribes after four copies of one predicate drifted for hundreds of fires. A test
// file is never copied into a fixture, so it may import freely.
export function bucketOf(present, onRemote, onAnyRef) {
  if (!present) return 'AT RISK'
  if (onRemote) return 'SAFE'
  if (onAnyRef) return 'LOCAL-REF-ONLY'
  return 'UNREFERENCED'
}

const FIRE_GATE_IN_ROOT = /^(worktrees\/)?gate-s\d+$/
const FIRE_GATE_OUT_OF_ROOT = /^\/(private\/)?tmp\/gr-(gate-s\d+|s\d+-[a-z-]*gate)/
export function isFactorySide(treePath, root) {
  const rel = treePath === root ? '' : treePath.startsWith(root + '/') ? treePath.slice(root.length + 1) : null
  if (rel === null) return FIRE_GATE_OUT_OF_ROOT.test(treePath)
  if (rel === '') return true
  return /^worktrees\/lane-[a-d]$/.test(rel) || FIRE_GATE_IN_ROOT.test(rel)
}

const ABSENT = Symbol('absent')
// The runner itself excludes these from every lane commit (lane-runner-v3.sh:121
// — re-based s1416 by READING the file; the comment had said :105, and the
// pathspec had drifted 16 lines down. Cite the CODE, the coordinate rots).
// Dirt confined to them can never be lane content.
export const CHURN = ['.wrangler', 'logs/factory-usage.json', 'logs/usage-history.jsonl']

function git(args, opts = {}) {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, ...opts })
}

// s1418 — F-1418-1. The MAIN worktree root, not `--show-toplevel` (which returns the LANE
// worktree's own root when cwd is a lane, i.e. exactly the wrong answer here). The parent of
// `--git-common-dir` is the main repo root from anywhere in the repo or any of its worktrees.
let ROOT_CACHE = null
function repoRoot() {
  if (ROOT_CACHE) return ROOT_CACHE
  const r = tryGit(['rev-parse', '--git-common-dir'])
  if (!r.ok) return (ROOT_CACHE = '.')
  const common = r.out.trim()
  const abs = common.startsWith('/') ? common : `${process.cwd()}/${common}`
  return (ROOT_CACHE = abs.replace(/\/?\.git\/?$/, '') || '.')
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
// never desync from the slot it is checked out in. Lane slot names are NOT branch
// names, and the mapping ROTS: this comment asserted lane-a=lane/m3, lane-b=lane/m4,
// lane-c=lane/e2-arsenal, lane-d=lane/perf until F-1464-3 measured it FALSE (the lanes
// sit on lane/a..lane/d) and s1540 finally cured it HERE — the code below always asked
// git and was never wrong; only this comment was. ASK GIT, never prose. (F-1540-2.)
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
const RUN_SURFACE_BASE = [
  'src', 'e2e', 'functions', 'scripts',
  'package.json', 'package-lock.json', 'playwright.config.ts', 'tsconfig.json', 'vite.config.ts',
]

// s2349 — F-2349-1. The list above is a HARDCODED list of something git and package.json
// already know, and it was drawn when those nine entries were the whole run surface. The repo
// has since grown `server/`, `ops/` and `foundry/`, and gate leaves moved into all three — so
// the list rotted by ADDITION ELSEWHERE, which no guard on this file could ever see.
//
// Measured s2349 over main's own package.json: EIGHT gate leaves live outside the base list,
// two of them leaves of the batteries every fire runs —
//     test:ledger-guards -> foundry/kit/test-init.sh
//     test:node-guards   -> ops/droplet/ledger-backup.test.mjs
//     test:codex-shim    -> server/codex-shim/serve{,.test}.mjs
//     test:preview / test:release / test:release-base -> playwright.{preview,release,release-base}.config.ts
// and `foundry/kit/test-init.sh` GENUINELY DIVERGES on lane/a and lane/b today. That is the
// F-1343-2 package.json hazard one directory over: a lane whose copy of a gate leaf differs
// produces a green that means something other than main's green, and the panel below would
// have scored the difference as bookkeeping.
//
// So DERIVE the additions instead of re-drawing the list by hand — a hand-drawn list is a
// defect awaiting the next new directory. package.json's scripts already name every path the
// gates execute, so they are the authoritative source, and they extend themselves: add a gate
// leaf anywhere and this learns it in the same commit.
//
// Read from `main:package.json`, NOT the worktree's — the question this file asks is "what has
// MAIN moved that this lane lacks?", and a lane's own package.json can be the strict SUBSET that
// F-1343-2 warns about, i.e. exactly the corpus that would under-report its own drift.
//
// DECLARES AND NEVER REFUSES (the F-2218-1 restraint): a root with no package.json is lawful —
// every fixture repo in this file's four guard suites is one — so refusing there would red on
// ordinary work and be excused into uselessness inside a week (F-1460-1). On any failure it
// degrades to the base list, which is the pre-cure behaviour, and SAYS SO.
let SURFACE_CACHE = null
function gatedRoots() {
  if (SURFACE_CACHE) return SURFACE_CACHE
  // stdio MUST be given: execFileSync INHERITS the child's stderr by default even when the
  // throw is caught, and `lane-runner-v3.sh` captures both this tool and `lane-absorbed-lines.mjs`
  // (which imports from this file, so this runs at ITS import too) with `2>&1`, then COUNTS the
  // captured lines. A `fatal: path 'package.json' does not exist in 'main'` therefore lands in a
  // machine-parsed probe and makes the residue line-count disagree with the absorbed-count —
  // which the runner reads as unabsorbed residue and REFUSES a lawful dispatch.
  // Caught s2349 by the mandated last-act battery, and CONTROLLED to prove it was mine: the
  // pre-cure blob passes `lane-dispatch-safety-guard` at rc=0, the cured one failed
  // DISPATCHES-HOLDS-BUT-FULLY-ABSORBED. It was invisible on the live board because
  // `main:package.json` EXISTS here — only the degraded path speaks, and only into a fixture.
  const r = tryGit(['show', 'main:package.json'], { stdio: ['ignore', 'pipe', 'pipe'] })
  if (!r.ok) return (SURFACE_CACHE = { roots: [], source: 'unverifiable' })
  let scripts
  try {
    scripts = JSON.parse(r.out).scripts || {}
  } catch {
    return (SURFACE_CACHE = { roots: [], source: 'unparseable' })
  }
  const roots = new Set()
  for (const body of Object.values(scripts)) {
    for (const tok of String(body).match(/[A-Za-z0-9_.\/-]+\.(?:mjs|cjs|js|ts|sh|json|html|toml)\b/g) || []) {
      if (tok.startsWith('-')) continue
      roots.add(tok.includes('/') ? tok.split('/')[0] : tok)
    }
  }
  const added = [...roots].filter((p) => !RUN_SURFACE_BASE.includes(p)).sort()
  return (SURFACE_CACHE = { roots: added, source: 'main:package.json' })
}

const RUN_SURFACE = [...RUN_SURFACE_BASE, ...gatedRoots().roots]

// s2221 — F-2221-1. These are the ONLY two git calls in this file that carry a PATHSPEC, and a
// pathspec is resolved relative to the process CWD while `--name-only` OUTPUT is repo-relative.
// That asymmetry is the whole defect: run from any subdirectory, `-- src e2e … ` matches nothing,
// git exits 0 with EMPTY STDERR, and both functions return [] — whereupon report() prints
// "✅ …NONE of it is run-surface … byte-identical to main", an affirmative all-clear asserting a
// comparison it never made, and SUPPRESSES the package.json false-green warning at :405 that the
// F-1343-2 comment above calls "a false-green hazard invisible to every existing probe".
// Measured s2221: `--all` from the repo root prints 15 drift sections and 0 greens; from
// scripts/, src/, docs/ or any subdirectory of a LANE WORKTREE it prints 0 drift sections and 15
// greens, at the SAME rc=0. Every other git call here is ref-based (cwd-invariant) or already
// passes its own explicit cwd, so anchoring these two cures the class in this file.
// Anchored to repoRoot() — the F-1418-1 helper, which resolves the MAIN worktree root from
// anywhere in the repo or any of its worktrees. NOT to import.meta.url: this file is diffing
// REFS, so it needs a valid repo root, not the directory the script happens to live in.
function surfaceDrift(branch) {
  const out = git(['diff', '--name-only', branch, 'main', '--', ...RUN_SURFACE], { cwd: repoRoot() }).trim()
  return out ? out.split('\n').filter(Boolean) : []
}

function ledgerDrift(branch) {
  const out = git(['diff', '--name-only', branch, 'main', '--', 'tasks'], { cwd: repoRoot() }).trim()
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

// F-2490-1 (s2490): `-uall` IS LOAD-BEARING — DO NOT REMOVE IT TO SAVE A FLAG.
// `git status --porcelain` COLLAPSES a wholly-untracked directory into ONE entry
// (`?? artifacts/e4-roads-and-convoys/`), so a count taken from it counts ENTRIES,
// not FILES, and the gap is unbounded — one line can stand for a megabyte.
// Measured s2490 across the 99-tree fleet: 215 entries vs 3925 files (18.26x), and
// gr-task-rehearsal alone read `untracked=4` for 2738 real files. That blind spot
// is what let an attended wip-salvage walk past 11 files / 1.0 MB of lane-b gate
// evidence (F-2489-1), one `git clean -fd` from gone — and `clean -fd` deletes
// FILES, so the file count is the only number that answers "what would a refill
// destroy?". `untracked=` therefore counts FILES from here on.
// COST, measured rather than feared: +14% on this tool's git time fleet-wide
// (19.3s -> 22.0s). Keeping BOTH numbers was priced and REJECTED — a second
// back-to-back call is +50% (+10.4s), too dear for a read every fire runs at
// triage, and the entry count is the defective number nobody needs.
// The parse itself is unchanged and stays TEXT-in (F-1416-1), so this flag lives
// in the one seam `lane-usable-dirt-parse.test.mjs` cannot reach — which is why
// `scripts/lane-usable-untracked-files-guard.test.mjs` asserts it separately.
function dirt(worktree) {
  return classifyDirt(
    git(['status', '--porcelain', '--untracked-files=all'], { cwd: worktree }).replace(/\n+$/, ''),
  )
}

function sessionLabel() {
  try {
    const m = readFileSync('STATUS.md', 'utf8').split('\n')[0].match(/\(s(\d+) fire\)/)
    if (m) return `s${m[1]}`
  } catch {}
  return 'fire'
}

// s1418 — F-1418-1. `busy` used to be `existsSync('tasks/running/<slot>.pid')`, which is
// WRONG IN TWO DIRECTIONS and was saved for ~120 sessions only by an accident of cwd.
//
//   (1) cwd-relative. `tasks/running/` is UNTRACKED, so it does not exist inside a lane
//       worktree at all. The runner runs Codex with `cd worktrees/lane-a`, so every master
//       whose pre-flight said `node scripts/lane-usable.mjs lane-a` (8 of them) asked from
//       a directory where the pidfile is structurally invisible — and got USABLE. Correct
//       answer, no mechanism behind it.
//   (2) not self-aware. `lane-runner-v3.sh:131` writes that pidfile IN ORDER TO DISPATCH
//       the run. So a pre-flight that DOES see it is looking at its own reflection: the
//       "runner holding the slot" is the one executing the very task that is asking.
//
// s1417 authored f1417-3 with the pre-flight `... lane-a` **from the repo root** — the one
// clarification that defeats (1) — and the run STOPped on its own dispatch in 30,378 tokens
// with zero edits. The more precise instruction is what broke it.
//
// Fix both at once, because either alone is worse than neither: anchoring the path without
// self-detection would make all 8 working masters start reading BUSY.
//
// FAIL-SAFE BY CONSTRUCTION: the dangerous direction is a false NOT-busy, which would let a
// fire refill an occupied lane and `reset --hard` over live runner output. So anything we
// cannot establish — unreadable pidfile, unparseable pid, `ps` failing — resolves to BUSY.
// Only a pid positively proven to be one of OUR OWN ancestors is discounted.
// ⚠️ pid 1 (launchd) and pid 0 are ancestors of EVERY process, so they must never count as
// "my dispatcher" — the first draft of this function pushed them and consequently reported a
// foreign runner's pidfile as our own reflection, i.e. it failed in the one direction that is
// destructive (a fire refilling an occupied lane resets over live output). Caught by running
// the probe below before trusting it, not by review. Only genuinely intermediate pids count.
function ancestors(pid) {
  const out = []
  let cur = pid
  for (let i = 0; i < 24 && cur > 1; i++) {
    const r = tryGitless(cur)
    if (r === null) return null // ps failed -> caller must fail safe
    if (!r || r === cur) break
    if (r > 1) out.push(r)
    cur = r
  }
  return out
}

function tryGitless(pid) {
  try {
    const out = execFileSync('ps', ['-o', 'ppid=', '-p', String(pid)], { encoding: 'utf8' }).trim()
    if (!out) return 0 // no such process: chain ends, not an error
    const n = Number.parseInt(out, 10)
    return Number.isFinite(n) ? n : null
  } catch {
    return 0 // ps exits non-zero when the pid is gone; that is an ended chain, not a failure
  }
}

// s2366 — F-2366-1. The block above establishes WHO holds the slot and never asks whether
// that holder is ALIVE, so a crashed runner's corpse and a live runner are indistinguishable:
// a dead pid is finite, positive and not one of our ancestors, so it lands on the same
// `return true` a live foreign runner does. MEASURED by manufacturing both (a spawned child
// allowed to exit vs one still running): `isSlotBusy` returns `true` for each, and the report
// prints the same "a runner holds this slot — leave it alone".
//
// `lane-runner-v3.sh` DISAGREES, and it is the authority here because it is the pidfile's
// WRITER: its poll loop tests `kill -0 "$pid"`, and on a dead pid it salvages the run to
// tasks/failed/CRASHED-* and removes the pidfile. So the two readers of one file answer
// differently, and only the runner's answer is true.
//
// REACHABLE exactly when the runner dies mid-run — a reboot (F-2343-1's 37h50m outage), a
// kill -9, a crash — and the self-heal above cannot run, because the thing that performs it
// is the thing that died. The window is "as long as the runner is dead".
//
// 🚫 THE VERDICT IS DELIBERATELY NOT FLIPPED, and the restraint is measured, not timid:
//   (1) The comment above is right that a false NOT-busy is the DESTRUCTIVE direction — it
//       lets a fire refill an occupied lane and `reset --hard` over live output (Mistake #2).
//       A liveness probe that mis-reads one live runner as gone buys that back for nothing.
//   (2) At the only moment this fires, USABLE would be the WORSE answer anyway. A dead holder
//       means the RUNNER is dead, so a fire told "refill freely" queues a master into a lane
//       nothing can consume — F-2343-1's armed trap, where the board looks MORE worked the
//       instant it becomes incapable of working.
// The truthful reading of a dead holder is not "this lane is free", it is "go look at the
// runner" — so this DECLARES the corpse and routes the reader to §2.0c. Same verdict, same
// exit code, one more fact. (F-2218-1's precedent: an unambiguous-but-lawful state declares
// and does not refuse; here an unambiguous-but-DANGEROUS state declares and does not clear.)
//
// Values are STRINGS for F-2212-1's reason: a careless truthiness test coerces every one of
// them to TRUE, i.e. toward BUSY, which is the safe direction.
// `kill` is injectable so the guard can drive EPERM and ESRCH deterministically. It cannot be
// driven any other way: a test cannot make the real process.kill raise EPERM on demand, and an
// EPERM misread as 'stale' is precisely the destructive direction this function exists to avoid.
export function pidLiveness(pid, kill = (p) => process.kill(p, 0)) {
  try {
    kill(pid)
    return 'live'
  } catch (e) {
    // ESRCH is the ONLY positive proof of absence. EPERM means the process EXISTS and is
    // merely not ours — that is ALIVE, and reading it as gone is the destructive direction.
    if (e && e.code === 'ESRCH') return 'stale'
    if (e && e.code === 'EPERM') return 'live'
    return 'unverifiable'
  }
}

// Exported so the guard can drive every branch without a runner. `probe` is injectable for
// the same reason `readPid` and `self` are: the guard must drive both directions determin-
// istically rather than hope the machine supplies them.
export function slotHolder(readPid, self = process.pid, probe = pidLiveness) {
  const raw = readPid()
  if (raw === null || raw === undefined) return 'none' // no pidfile: nobody holds the slot
  const pid = Number.parseInt(String(raw).trim(), 10)
  if (!Number.isFinite(pid) || pid <= 0) return 'unverifiable' // unparseable -> fail safe
  const chain = ancestors(self)
  if (chain === null) return 'unverifiable' // could not establish ancestry -> fail safe
  if (chain.includes(pid)) return 'self' // our own dispatcher does not count as "someone else"
  return probe(pid) // 'live' | 'stale' | 'unverifiable' — all three are BUSY
}

// Exported so the guard can drive both directions without a runner. `self` is the pid the
// caller claims to be (process.pid in production); `readPid` returns the pidfile's contents
// or null when absent. Delegates to slotHolder so there is ONE implementation of the
// question (F-1261-1) — four independent copies of a predicate is how one drifts.
export function isSlotBusy(readPid, self = process.pid) {
  const holder = slotHolder(readPid, self)
  return holder !== 'none' && holder !== 'self'
}

function inspect(lane) {
  // Anchor to the MAIN worktree root so the answer no longer depends on where we were run
  // from. `--git-common-dir`'s parent is the main repo root even when cwd is a lane worktree.
  const readPid = () => {
    const pidfile = `${repoRoot()}/tasks/running/${lane.slot}.pid`
    if (!existsSync(pidfile)) return null
    try {
      return readFileSync(pidfile, 'utf8')
    } catch {
      return 'unreadable' // -> unparseable -> fail safe to BUSY
    }
  }
  const holder = slotHolder(readPid)
  const busy = holder !== 'none' && holder !== 'self'
  const c = classify(lane.branch)
  const d = dirt(lane.worktree)
  let verdict
  if (busy) verdict = 'BUSY'
  else if (d.tracked.length > 0) verdict = 'DIRTY'
  else if (c.ahead === 0) verdict = 'USABLE'
  else if (c.held.length === 0) verdict = 'AHEAD-BUT-ABSORBED'
  else verdict = 'HOLDS'
  return { ...lane, busy, holder, ...c, dirt: d, verdict }
}

const RC = { USABLE: 0, 'AHEAD-BUT-ABSORBED': 1, HOLDS: 2, DIRTY: 2, BUSY: 2 }

export function residueForHeld(r, held, runGit = git) {
  const quiet = { stdio: ['ignore', 'pipe', 'ignore'] }
  let diff
  try {
    diff = runGit(['diff', `${r.base}:${held.path}`, `${r.branch}:${held.path}`], quiet)
  } catch {
    try {
      runGit(['cat-file', '-e', `${r.branch}:${held.path}`], quiet)
      diff = runGit(['diff', '4b825dc642cb6eb9a060e54bf8d69288fbee4904', r.branch, '--', held.path], quiet)
    } catch {
      return residueFor()
    }
  }
  let mainText = ''
  try {
    mainText = runGit(['show', `main:${held.path}`], quiet)
  } catch {}
  return residueFor({ diff, mainText })
}

export function formatHeldResidue(held, residue) {
  const prefix = `    HELD ${held.kind}  ${held.path}`
  if (residue.status === 'BINARY' || residue.status === 'UNDECIDABLE') {
    return [`${prefix}  (${residue.status})`]
  }
  const lines = [`${prefix}  (${residue.missing.length} of ${residue.added.length} added lines absent from main)`]
  for (const missing of residue.missing.slice(0, 3)) {
    const sample = missing.length > 100 ? `${missing.slice(0, 99)}…` : missing
    lines.push(`      ${JSON.stringify(sample)}`)
  }
  return lines
}

// s2639 — F-2569-3, the priced cure F-2569-1 named and F-2610-1 re-affirmed as unclaimed.
//
// The DIRTY banner answers "WHO owns this?" (contention). A fire reading it on a dry board
// is asking "WHAT would a refill LOSE?" (durability). Those are two different questions about
// the same 26 files, and this tool was silent on the second BY CONSTRUCTION — an alarm with
// no remedy, F-2451-1's shape. The fuse is CODE, not conjecture: `lane-runner-v3.sh` refreshes
// a lane with `git reset --hard main`, which DESTROYS modified-tracked content.
//
// It DECLARES and does NOT clear: the verdict word and the exit code are untouched, exactly
// as F-2366-1 chose for BUSY. A false NOT-dirty is the Reset Massacre direction (Mistake #2),
// and F-2610-1's lesson is that conflating the two questions is the defect, not the cure.
//
// The object sets are built LAZILY and memoized, so a fleet with no DIRTY lane pays NOTHING.
// Measured s2639: `rev-list --objects --remotes` 0.91 s + `--all` 1.63 s against a 14.5 s
// `--all` baseline — ~+17%, and only when a lane is actually dirty (1 of 30 rows today).
let OBJSETS = null
function objectSets(runGit = (args, opts) => tryGit(args, { cwd: repoRoot(), ...opts })) {
  if (OBJSETS) return OBJSETS
  const read = (args) => {
    const r = runGit(args, { maxBuffer: 1024 << 20 })
    if (!r.ok) return null
    const s = new Set()
    for (const line of r.out.split('\n')) {
      const sp = line.indexOf(' ')
      const id = sp === -1 ? line : line.slice(0, sp)
      if (id) s.add(id)
    }
    return s
  }
  const remote = read(['rev-list', '--objects', '--remotes'])
  const anyRef = read(['rev-list', '--objects', '--all'])
  return (OBJSETS = { remote, anyRef, ok: remote !== null && anyRef !== null })
}

// Classifies the WORKTREE bytes of each tracked-dirt path — what a `reset --hard` would
// discard — by hashing them FROM MAIN (a linked worktree SHARES main's object database, so
// no copying and no custody question) and asking the SAME four-bucket predicate the evidence
// census uses. Imported, never re-implemented: four independent copies of one predicate is
// how the desk-lock predicate drifted for hundreds of fires (F-2227-1), and F-1261-1 is the
// standing rule that there is one implementation of a word in this repo.
//
// Returns `status: 'unverifiable'` — never a zeroed bucket — when it could not answer, so a
// broken read fails toward NOTICING (F-2212-1's polarity). `skipped` is declared rather than
// silently dropped: a tracked-dirt path can be DELETED in the worktree (`" D path"`) or a
// rename pair (`"old -> new"`), neither of which is a file on disk, and a denominator that
// quietly shrinks is the empty-corpus false green this law has spent twenty fires curing.
// `runGit` is injectable and is used for EVERY git call this function makes — not merely the
// object sets. An options bag that ACCEPTS a runner and then reaches past it for two of its
// three spawns is the vacuous-control trap in its purest form: a guard would inject a stub,
// watch the real repo answer, and attest to a subject it never measured (F-2215-1, and s2638's
// own paid-for note that a fixture setting only `cwd` measures the real repo).
export function dirtDurability(paths, worktree, deps = {}) {
  const {
    runGit = (args, opts) => tryGit(args, { cwd: repoRoot(), ...opts }),
    statFn = lstatSync,
  } = deps
  const sets = deps.sets ?? objectSets(runGit)
  const counts = { 'AT RISK': 0, UNREFERENCED: 0, 'LOCAL-REF-ONLY': 0, SAFE: 0 }
  const atRisk = []
  let bytes = 0
  const readable = []
  const skipped = []
  for (const p of paths) {
    const abs = `${worktree}/${p}`
    try {
      const st = statFn(abs)
      if (!st.isFile()) {
        skipped.push(p)
        continue
      }
      readable.push({ path: p, abs, size: st.size })
    } catch {
      skipped.push(p)
    }
  }
  if (!sets || !sets.ok) {
    return { status: 'unverifiable', reason: 'the object sets could not be read', counts, skipped, hashed: 0, subjects: paths.length, atRisk, bytes }
  }
  if (readable.length === 0) {
    return { status: 'read', counts, skipped, hashed: 0, subjects: paths.length, atRisk, bytes }
  }
  const h = runGit(['hash-object', '--stdin-paths'], {
    input: readable.map((r) => r.abs).join('\n') + '\n',
    maxBuffer: 64 << 20,
  })
  if (!h.ok) {
    return { status: 'unverifiable', reason: 'hash-object refused the batch', counts, skipped, hashed: 0, subjects: paths.length, atRisk, bytes }
  }
  const ids = h.out.split('\n').filter(Boolean)
  // F-2215-1: assert the control produced what it claims BEFORE any zero is believed.
  // A short batch means some path was not hashed, and every unhashed path would otherwise
  // read as "not at risk" — the exact silence this whole lineage exists to catch.
  if (ids.length !== readable.length) {
    return {
      status: 'unverifiable',
      reason: `hashed ${ids.length} of ${readable.length} readable file(s)`,
      counts, skipped, hashed: ids.length, subjects: paths.length, atRisk, bytes,
    }
  }
  // PRESENCE is asked separately and is NOT inferred from reachability. `rev-list --objects`
  // enumerates only REACHABLE objects, so a blob that is in the odb but held by no ref is
  // absent from both sets — and collapsing that into AT RISK would conflate two buckets whose
  // fuses are OPPOSITE: AT RISK dies with the disk, while an UNREFERENCED blob whose file is
  // still on disk cannot be lost to `git gc` at all (F-2566-1). `--batch-check` is one spawn.
  const present = new Set()
  const bc = runGit(['cat-file', '--batch-check=%(objectname) %(objecttype)'], {
    input: ids.join('\n') + '\n',
    maxBuffer: 64 << 20,
  })
  if (!bc.ok) {
    return { status: 'unverifiable', reason: 'cat-file could not answer presence', counts, skipped, hashed: ids.length, subjects: paths.length, atRisk, bytes }
  }
  for (const line of bc.out.split('\n')) {
    if (!line || / missing$/.test(line)) continue
    const [id, type] = line.split(' ')
    if (type === 'blob') present.add(id)
  }
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i]
    const bucket = bucketOf(present.has(id), sets.remote.has(id), sets.anyRef.has(id))
    counts[bucket]++
    if (bucket !== 'SAFE') {
      bytes += readable[i].size
      if (bucket === 'AT RISK') atRisk.push(readable[i].path)
    }
  }
  return { status: 'read', counts, skipped, hashed: ids.length, subjects: paths.length, atRisk, bytes }
}

// Formatting split from the measurement so the guard can exercise the WORDS a fire reads,
// not only the arithmetic — F-2210-1: in advisory mode stdout IS the whole interface, and a
// suite that asserts the numbers while the sentence lies has relocated the blind spot.
export function formatDirtDurability(d) {
  const head = `     💾 would a reset LOSE any of it? ${d.subjects} tracked-dirt path(s)`
  if (d.status === 'unverifiable') {
    return [
      `${head} — ⛔ COULD NOT ANSWER (${d.reason}).`,
      `        Treat as UNKNOWN, never as clean: this says nothing about durability.`,
    ]
  }
  const c = d.counts
  const lines = [
    `${head}, ${d.hashed} hashed from main` +
      (d.skipped.length ? ` (${d.skipped.length} not a file on disk — deleted or a rename pair — and NOT judged)` : '') +
      `:`,
    `        SAFE ${c.SAFE} · LOCAL-REF-ONLY ${c['LOCAL-REF-ONLY']} · UNREFERENCED ${c.UNREFERENCED} · AT RISK ${c['AT RISK']}`,
  ]
  if (c['AT RISK'] > 0) {
    lines.push(
      `        ⚠️  ${c['AT RISK']} file(s) / ${(d.bytes / 1e6).toFixed(1)} MB are in NO object database —`,
      `        a lane refresh runs \`git reset --hard main\`, which DESTROYS them. Salvage to a`,
      `        PARENTLESS save/* ref and PUSH it before anyone touches this lane (F-2484-1's method,`,
      `        F-1055-1: a local-only salvage reads as safe and is not).`,
    )
    for (const p of d.atRisk.slice(0, 5)) lines.push(`          AT RISK ${p}`)
    if (d.atRisk.length > 5) lines.push(`          … and ${d.atRisk.length - 5} more`)
  } else if (c['LOCAL-REF-ONLY'] > 0 || c.UNREFERENCED > 0) {
    lines.push(
      `        ⚠️  nothing is in NO object database, but ${c['LOCAL-REF-ONLY'] + c.UNREFERENCED} file(s) are on no ORIGIN ref —`,
      `        they die with this disk (Mistake #11). Ask the save/* manifests before you salvage:`,
      `        a retention transform may already hold the bytes in another SHAPE (F-2571-1).`,
    )
  } else if (d.hashed > 0) {
    lines.push(
      `        ✅ nothing would be lost — every byte is reachable from an origin ref.`,
    )
  }
  lines.push(
    `        ⓘ  DIRTY is unchanged and is a CONTENTION verdict: it still says FIND THE OWNER.`,
    `        This line answers a DIFFERENT question and is never a licence to reset (F-2610-1).`,
  )
  return lines
}

function report(r) {
  console.log(
    `${r.slot}  ${r.branch}  ahead=${r.ahead}  behind=${r.behind ?? '?'}  paths=${r.paths ?? 0}` +
      `  tracked-dirt=${r.dirt.tracked.length}  untracked=${r.dirt.untracked.length}${r.busy ? '  BUSY' : ''}`,
  )
  for (const h of r.held) {
    for (const line of formatHeldResidue(h, residueForHeld(r, h))) console.log(line)
  }
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
  // F-2366-1. BUSY has three causes and they owe three different acts, so a BUSY row always
  // names which one. Scoped to the BUSY branch on purpose: BUSY is rare (0 of 30 lanes on the
  // day this landed), where an always-on line across a 30-row fleet listing is the noise that
  // decays a declaration into a formality. Within the branch it prints on EVERY cause,
  // including the ordinary one, because a line that appears only on failure re-creates the
  // ambiguity it removes (F-2208-1).
  if (r.verdict === 'BUSY') {
    const why = {
      live: 'holder pid is ALIVE — a real runner is working here. Leave it alone.',
      stale: [
        'holder pid is GONE — this is a CRASHED-RUNNER CORPSE, not live work.',
        'A live runner salvages it to tasks/failed/CRASHED-* on its next poll; if this',
        'persists, the RUNNER is dead too — read the `runner :` line (§2.0c) and restart',
        'per §2.0b. Do NOT hand-remove the pidfile, and do NOT read this as a free lane:',
        'a dead holder means nothing can consume a refill (F-2343-1).',
      ].join('\n     '),
      unverifiable: 'holder pid could NOT be established — failing safe to BUSY. Investigate before refilling.',
    }[r.holder]
    if (why) console.log(`     ${why}`)
  }
  // F-2569-3 (s2639). Scoped to the DIRTY branch for F-2366-1's measured reason: DIRTY is rare
  // (1 of 30 rows today), and an always-on durability read across a 30-row fleet listing is both
  // the noise that decays a declaration into a formality AND ~2.5 s of rev-list nobody asked for.
  // Within the branch it prints on EVERY outcome, including the all-SAFE one, because a line that
  // appears only on failure re-creates the ambiguity it removes (F-2208-1) — and here the
  // all-clear is the common case, so suppressing it would leave the alarm as the only voice.
  //
  // AND IT IS GATED ON OWNERSHIP, NOT MERELY ON THE VERDICT — F-2569-3 scoped its own cure to
  // "four lanes only", and measuring it taught me why. Run across `--all` unscoped it fires on
  // 15 of 28 rows, 14 of them ATTENDED-OWNED `agent-*` worktrees, and reports 248 AT RISK files
  // with a remedy — "salvage before anyone touches this lane" — that is NOT a fire's to execute:
  // F-2561-1 rules those trees a thing to REPORT, never to touch. That is the FALSE URGENCY class
  // F-2566-1/F-2570-1/F-2571-1 each name on a different bucket, manufactured here at scale by a
  // cure meant to remove it. The durability question is "what would a REFILL destroy?", and a fire
  // refills only what it may reset — so the read belongs exactly where `reset --hard` is a fire's
  // own act. Attended rows get a POINTER to the instrument that owns their version of the question
  // (it attributes ownership; this tool cannot), never an alarm.
  if (r.verdict === 'DIRTY') {
    if (isFactorySide(r.worktree, repoRoot())) {
      for (const line of formatDirtDurability(dirtDurability(r.dirt.tracked, r.worktree))) {
        console.log(line)
      }
    } else {
      console.log(
        `     💾 ATTENDED-OWNED tree — durability is not asked here: a fire never resets it, so\n` +
          `        nothing a fire does can lose these bytes. For the durability question over the\n` +
          `        whole registry WITH ownership attribution: node scripts/modified-tracked-evidence-census.mjs`,
      )
    }
  }
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
      const ledger = ledgerDrift(r.branch)
      if (ledger.length === 0) {
        console.log(
          `     ✅ ...but NONE of it is run-surface: the ${RUN_SURFACE.length} compared paths (see the run-surface line above) are\n` +
            `        byte-identical to main. The gap is bookkeeping only — nothing here can stop a task running.`,
        )
      } else {
        console.log(
          `     ✅ ...but NONE of it is run-surface: the ${RUN_SURFACE.length} compared paths (see the run-surface line above) are\n` +
            `        byte-identical to main.`,
        )
        console.log(`     📒 ledger drift: ${ledger.length} file(s) main has moved that this lane lacks:`)
        for (const p of ledger.slice(0, 8)) console.log(`          ${p}`)
        if (ledger.length > 8) console.log(`          … and ${ledger.length - 8} more`)
        console.log(`        ⚠️  A master whose READ-FIRST cites the ledger BY CONTENT will fail its grep in this lane.`)
      }
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

// s2561 — F-2561-1. `--all` is prescribed by scripts/fire.md §2F as THE answer to "a lane
// branch can hold unabsorbed content with no done-move at all", and the law described its
// output as "the COMPLETE worktree set ... the rest are attended-owned worktree-agent-* /
// sol/* / gr-task-* trees". Measured s2561: the registry holds 119 worktrees and fleet()
// reports 30 (26 agent-* + 4 lane-*) — ZERO sol/*, ZERO gr-task-*, i.e. the two populations
// the law named as INCLUDED are precisely the two it excludes. fleet() has two filters and
// each drops a different population: it requires a `branch ` line (so every DETACHED
// worktree is dropped) and a path ending in /worktrees/<name> (so every off-convention path
// is dropped). 89 trees were unreported, 13 of them AHEAD of main.
//
// DECLARED, NOT WIDENED, and the restraint is measured rather than stylistic: resolve()
// matches by BRANCH as well as slot, and cure() runs `git reset --hard main` in the matched
// worktree (:605). Widening fleet() would therefore make `sol/town-blender-v3` and the
// gr-task-* trees curable BY NAME — the Reset Massacre (Mistake #2) aimed at attended work.
// The reader needs to know the denominator, not to be handed a lever over someone else's tree.
//
// The AHEAD count is computed rather than merely the coverage ratio, because a bare "89
// unreported" is an alarm with no remedy (F-2449-1) — the actionable fact is whether any of
// them holds something main has not absorbed. Cost measured s2561: 1.1 s for all 89 against
// a ~20 s `--all`, so it is paid for. Every AHEAD tree today is attended-owned and NOT a
// fire's to drain; the declaration says so, so the number cannot be misread as a missed drain.
export function fleetCoverage() {
  const r = tryGit(['worktree', 'list', '--porcelain'])
  if (!r.ok) return { source: 'unverifiable', registered: 0, unreported: [] }
  const trees = []
  let cur = null
  for (const line of r.out.split('\n')) {
    if (line.startsWith('worktree ')) {
      cur = { path: line.slice(9).trim(), branch: null, head: null }
      trees.push(cur)
    } else if (!cur) continue
    else if (line.startsWith('branch ')) cur.branch = line.slice(7).trim().replace(/^refs\/heads\//, '')
    else if (line.startsWith('HEAD ')) cur.head = line.slice(5).trim()
  }
  const unreported = []
  for (const t of trees) {
    const slotted = /\/worktrees\/([^/]+)$/.test(t.path)
    if (t.branch && slotted) continue // fleet() reports this one
    t.why = !t.branch ? 'detached (no branch line)' : 'path (not /worktrees/<name>)'
    // The drain question, asked in a form that reports BY VALUE for both shapes.
    // DELIBERATELY NOT `merge-base --is-ancestor`: it uses exit 1 as a legitimate verdict
    // ("not an ancestor"), and this file's tryGit collapses a failure to
    // `String(err.stderr || err.message)` — which is NON-EMPTY for exit 1, because node
    // supplies "Command failed: ..." when stderr is bare. So the stderr-is-empty
    // discriminator (F-2212-1) is unavailable HERE even though it is correct in general,
    // and a real "not an ancestor" would have been misfiled as could-not-answer.
    // `rev-list --count main..<rev>` answers the same question with a NUMBER and no
    // overloaded exit code, so a failure is unambiguously a failure (F-2485-1: an error is
    // could-not-answer, never "nothing here").
    const rev = t.branch || t.head
    if (!rev) t.state = 'could-not-answer'
    else {
      const c = tryGit(['rev-list', '--count', `main..${rev}`])
      const n = c.ok ? Number(c.out.trim()) : NaN
      if (!Number.isFinite(n)) t.state = 'could-not-answer'
      else t.state = n > 0 ? `ahead ${n}` : 'absorbed'
    }
    unreported.push(t)
  }
  return { source: 'read', registered: trees.length, unreported }
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

// s2349 — F-2349-1. Printed on EVERY run including the happy path (F-2208-1): the failure state
// of gatedRoots() is a SILENT DEGRADATION back to the nine hardcoded entries, and a declaration
// that appears only on failure re-creates the ambiguity it removes. One line, not per-lane.
{
  const g = gatedRoots()
  const extra = g.roots.length ? ` (+${g.roots.length}: ${g.roots.join(' ')})` : ' (+0)'
  console.log(`run surface: ${RUN_SURFACE_BASE.length} base + gate leaves from ${g.source}${extra}`)
}

if (argv.includes('--all')) {
  const reported = fleet()
  for (const lane of reported) report(inspect(lane))
  // s2561 — F-2561-1. Printed on EVERY --all including the happy path (F-2208-1): the
  // failure state here is a SILENT NARROWING (fleet() reports 30 of 119 registered trees)
  // and a declaration that appears only when something is ahead re-creates the ambiguity
  // it removes. This is the denominator, not a verdict — --all is an audit and still
  // exits 0 in every state (see the header), because an attended worktree ahead of main
  // is a LAWFUL routine state and a red here would be excused into uselessness (F-1460-1).
  const cov = fleetCoverage()
  if (cov.source !== 'read') {
    console.log('')
    console.log('⚠️  worktree coverage: COULD NOT ANSWER — `git worktree list` failed, so the')
    console.log('    rows above are of an UNKNOWN denominator. Do not read them as the fleet.')
  } else {
    const ahead = cov.unreported.filter((t) => t.state.startsWith('ahead'))
    const unk = cov.unreported.filter((t) => t.state === 'could-not-answer')
    console.log('')
    console.log(`worktree coverage: reported ${reported.length} of ${cov.registered} registered — ` +
      `${cov.unreported.length} NOT reported (${ahead.length} ahead of main, ${unk.length} could-not-answer).`)
    if (cov.unreported.length) {
      console.log('    fleet() selects on a `branch` line AND a path ending /worktrees/<name>, so detached')
      console.log('    worktrees and off-convention paths (sol/*, gr-task-*, /tmp arenas) are NOT above.')
      console.log('    Those are ATTENDED-OWNED and NOT yours to drain — an `ahead` count here is a thing')
      console.log('    to REPORT, never to touch. List them: node scripts/lane-usable.mjs --unreported')
    }
  }
  process.exit(0)
}
if (argv.includes('--unreported')) {
  // Read-only BY DESIGN: it deliberately offers no --cure path, because every tree it
  // names belongs to someone else (see the fleetCoverage comment on the Reset Massacre).
  const cov = fleetCoverage()
  if (cov.source !== 'read') {
    console.error('⛔ CANNOT VERIFY — `git worktree list` failed; the unreported set is unknown.')
    process.exit(2)
  }
  console.log(`worktrees the --all fleet does not report: ${cov.unreported.length} of ${cov.registered} registered`)
  for (const t of cov.unreported.sort((a, b) => a.state.localeCompare(b.state))) {
    console.log(`  ${t.state.padEnd(22)} ${(t.branch || `(detached ${String(t.head).slice(0, 8)})`).padEnd(38)} ${t.path}`)
  }
  console.log('')
  console.log('ATTENDED-OWNED. Report an `ahead` row in the handoff; do NOT drain, reset or prune it')
  console.log('(F-2485-1: a stale registration is the only thing keeping a tree in any subject set).')
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

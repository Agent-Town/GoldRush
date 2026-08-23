#!/usr/bin/env node
// s1343 — F-1343-1: a fire that is PERMISSION-DENIED loses its work to prose.
//
// The fire shell cannot write anything under `.claude/` (F-1027-4). When a fire
// needs a change landed there it has, until now, had exactly one place to put it:
// a paragraph inside STATUS.md's line-1 handoff. That is not a queue, nothing
// reads it on a schedule, and nothing ever notices if it is never done.
//
// MEASURED PRECEDENT, not a worry: F-1295-1's cure (never gate undecided content
// in main's working tree) closed its own row with "GATE: none — I have adopted it
// this fire". It was adopted by ONE PROCESS and written into NO law surface for 47
// fires; s1342 found it nowhere in the corpus and had to re-derive it. s1342 then
// hit the identical wall landing the same cure into `.claude/skills/drain/SKILL.md`
// — the surface a drainer actually READS — and its text went into a handoff
// paragraph too. s1343 independently re-hit the same denial. Same disease, three
// times, because the only container available was prose.
//
// WHY THE OWNER'S DESK CANNOT HOLD THESE. The desk's 🔺 is an OWNER-ROUTING axis
// ("does Robin need to see this at all") and BACKLOG's 🟡/✅ is a census-visibility
// axis; `desk-declaration-guard.mjs:26-34` explicitly forbids conflating them, and
// neither expresses the distinction that matters here:
//
//     a RULING   — only Robin can decide it (a design fork, money, canon)
//     an ACTION  — anyone unrestricted can DO it; a fire is merely gated
//
// An ACTION filed as desk prose is indistinguishable from a genuine design fork
// sitting two lines away, so it queues behind decisions it does not need.
//
// TEETH, DELIBERATELY ASYMMETRIC — this is the whole design and it is not timidity:
//   LANDED-but-not-archived  -> rc 1   a FIRE can fix this (stale bookkeeping)
//   malformed / missing target -> rc 1 a FIRE can fix this
//   OPEN (simply not done yet) -> rc 0 only the ATTENDED side can fix it
// Reding the board for an item only Robin can clear would red it permanently, and
// a permanently-red guard is flagged past within a fire or two — the exact fate
// that makes a gate worthless. So OPEN items are PRINTED (every fire runs
// `test:ledger-guards` as its last act, so they are seen every single fire) and
// never block. Pass --strict to make OPEN rc 1 for an attended sweep.
//
// THE ANCHOR IS THE CONTRACT. "Landed" is not a claim anybody makes; it is
// `target` containing `anchor`, verified by READING THE TARGET FILE. This is
// s1342's through-line mechanised: before writing "GATE: none" because you did the
// thing, ask what a reader would have to READ to know you did it. Here the reader
// is a script, and what it reads is the destination file itself.
//
// Usage:
//   node scripts/attended-owed-audit.mjs            # report; rc 1 only on fire-fixable defects
//   node scripts/attended-owed-audit.mjs --strict   # OPEN items also rc 1
//   node scripts/attended-owed-audit.mjs --quiet    # only defects and the summary

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const DIR = 'tasks/attended-owed'
const ARCHIVE = join(DIR, 'archive')

const argv = process.argv.slice(2)
const strict = argv.includes('--strict')
const quiet = argv.includes('--quiet')

// A row is `key: value` in the header block, before the first `---` fence.
// Deliberately a hand-rolled 12-line parser rather than a YAML dep: this file is
// read by a guard that must never fail to LOAD, and the format is four keys.
function parse(text) {
  const fence = text.indexOf('\n---')
  const head = fence === -1 ? text : text.slice(0, fence)
  const body = fence === -1 ? '' : text.slice(fence + 4)
  const meta = {}
  for (const line of head.split('\n')) {
    const m = line.match(/^([a-z][a-z-]*):\s*(.*)$/)
    if (m) meta[m[1]] = m[2].trim()
  }
  return { meta, body }
}

// F-2220-1 — DECLARE THE CORPUS. `DIR` is a bare repo-relative path, so it resolves against
// `process.cwd()`. From a subdirectory the guard-keyed empty below returns [], every counter
// stays 0, and the banner reads `CLEAN — 0 item(s)` at rc=0 — indistinguishable from a board
// with nothing owed, in BOTH modes. Measured s2220 ON THE LIVE BOARD: from the repo root
// `1 item(s): 1 open` (a 21-day-old attended-owed item); from `scripts/`, `CLEAN — 0 item(s)`.
// `--strict` exits 0 there where it should exit 1.
//
// `corpusState` is deliberately a STRING, not a boolean (F-2212-1): a careless truthiness
// test on a failure value reads TRUE, i.e. toward NOTICING rather than toward clearing.
function corpusState() {
  if (existsSync(DIR)) return 'read'
  // Absent is NOT automatically a refusal — but this directory is TRACKED (5 files in main),
  // so absence means we are not looking at a repo root, not that nothing is owed.
  return existsSync('.git') || existsSync('tasks') ? 'absent' : 'unrooted'
}

function items() {
  if (!existsSync(DIR)) return []
  return readdirSync(DIR)
    // `_`-prefixed and README are documentation of the convention, not items in it.
    // Without this the dir's own README parses as a malformed item and reds the guard —
    // caught s1343 before writing the README, by asking what the glob would swallow.
    .filter((f) => f.endsWith('.md') && f !== 'README.md' && !f.startsWith('_'))
    .sort()
    .map((f) => {
      const path = join(DIR, f)
      const { meta, body } = parse(readFileSync(path, 'utf8'))
      return { file: f, path, meta, body }
    })
}

// A refusal is not a report: it reaches STDOUT even under --quiet, because per F-2211-1 a
// caller that classifies stdout reads an empty string as silence. 2 = "could not answer",
// against 1 = "answered, and the answer refuses" — the convention drain-block-check,
// dry-board-probe, master-shipped-classifier and review-evidence-audit already carry.
const corpus = corpusState()
if (corpus !== 'read') {
  console.log(`attended-owed: ⛔ CANNOT VERIFY — corpus ${corpus}: ${DIR} not found from ${process.cwd()}.`)
  console.log('  The CLEAN banner is a claim about every item in a TRACKED directory.')
  console.log('  Re-run from the repository root.')
  process.exit(2)
}

// F-2225-1 (s2225): THE SECOND CORPUS — THE ANCHOR TARGET.
//
// F-2220-1 declared the ITEM corpus above. But no verdict in this file is computed from it:
// every OPEN/LANDED call is decided at the `readFileSync(target)` probe below, from a SECOND
// corpus that was never declared and never tree-checked. That is F-2219-1's shape exactly —
// a tool computing its verdict from two corpora while declaring only one — and here the
// undeclared corpus is the one that decides every answer.
//
// `target` is a bare repo-relative path, so it resolves against process.cwd(). In a LINKED
// WORKTREE it reads that tree's frozen copy of the law surface, and the question this tool
// asks — "has the attended cure landed in the surface a drainer reads?" — is a question about
// MAIN, not about the tree the process happens to sit in.
//
// PROVEN BY MANUFACTURING s2225, ground truth = the cure HAS landed on main, so the correct
// verdict is LANDED-NOT-ARCHIVED at rc=1 (bare mode — exactly how test:ledger-guards invokes
// this tool): root -> LANDED rc=1 · linked worktree branched before the cure -> OPEN rc=0 ·
// reverse control, genuinely not landed -> OPEN rc=0. The stale arm and the clean board were
// BYTE-IDENTICAL on stdout, rc AND verdict — and F-2220-1's corpus declaration read
// affirmatively healthy in the stale arm, because the item dir really was read. A true
// declaration about the wrong corpus is F-2221-1's polarity.
//
// WHY THIS DECLARES WHERE `drain-block-check`'s corpusTree REFUSES — the boundary is measured,
// not stylistic, and it is the first time in this streak the discriminator must NOT refuse:
// §3.0b MANDATES gating undecided content in a detached worktree, and `test:ledger-guards`
// chains this tool, so a fire FOLLOWING THE LAW runs it from a linked worktree as ordinary
// prescribed work. Refusing there would red the mandated drain gate and be excused into
// uselessness inside a week (F-1460-1, the `cross-engine` fate). A linked worktree is LAWFUL
// for this tool in a way a stale board never is for drain-block-check.
//
// Declared on the happy path too (F-2208-1): nothing refuses here, so a line that appeared
// only on failure would re-create the ambiguity it removes. Values are STRINGS for F-2212-1's
// reason. git exit 128 is "not a repository" and is LAWFUL — every fixture-rooted test in this
// family builds a bare mkdtemp root and must keep asserting what it always asserted.
// spawnSync, not execFileSync: it reports by RETURN VALUE and never throws (s2216).
function anchorTree() {
  const opts = { cwd: process.cwd(), encoding: 'utf8', timeout: 10000 }
  const ask = (args) => spawnSync('git', args, opts)
  const gitDir = ask(['rev-parse', '--absolute-git-dir'])
  if (gitDir.status === 128) return 'main' // not a repo: a fixture root
  if (gitDir.status !== 0) return 'tree-unverifiable'
  const common = ask(['rev-parse', '--path-format=absolute', '--git-common-dir'])
  if (common.status !== 0) return 'tree-unverifiable'
  const a = (gitDir.stdout || '').trim()
  const b = (common.stdout || '').trim()
  if (!a || !b) return 'tree-unverifiable'
  // Equal means the MAIN worktree or any subdirectory of it — correct, and must not be flagged.
  return a === b ? 'main' : 'linked-worktree'
}

// The targeted half. Declaring the tree names the hazard but does not close it, so the ONE
// verdict that can be silently wrong is cross-checked against main's blob: an item reads OPEN
// here while main's copy of the target already contains the anchor. That case is unambiguous
// — the paste IS done on main and the bookkeeping IS owed — and it CANNOT fire on the lawful
// detached-gate path, because a merged tree is a superset of main for a file main already
// carries the anchor in. So this catches the manufactured defect without reding the prescribed
// invocation, which a blanket linked-worktree refusal would not.
function anchorOnMain(target, anchor) {
  const r = spawnSync('git', ['show', `main:${target}`], {
    cwd: process.cwd(),
    encoding: 'utf8',
    timeout: 10000,
    maxBuffer: 64 << 20,
  })
  // 128 = not a repo, no `main` ref, or no such path on main. All lawful; none is an answer.
  if (r.status !== 0 || r.error) return 'unverifiable'
  return (r.stdout || '').includes(anchor) ? 'landed-on-main' : 'absent-on-main'
}

const tree = anchorTree()
console.log(
  tree === 'main'
    ? '  anchor targets read from: the main worktree.'
    : tree === 'linked-worktree'
      ? '  ⚠️  anchor targets read from a LINKED WORKTREE — frozen relative to main. A cure main\n' +
        '      already carries reads as OPEN here. Verdicts below are cross-checked against main.'
      : '  ⚠️  anchor-target tree UNVERIFIABLE — git could not answer; verdicts are uncross-checked.',
)

let defects = 0
let open = 0
let landed = 0
let stale = 0
let uncrossChecked = 0
const all = items()

for (const it of all) {
  const { target, anchor } = it.meta
  const label = `${it.file}`

  if (!target || !anchor) {
    console.log(`  ✗ MALFORMED  ${label} — needs both \`target:\` and \`anchor:\` in its header`)
    defects += 1
    continue
  }
  if (!existsSync(target)) {
    console.log(`  ✗ BAD TARGET ${label} — target does not exist: ${target}`)
    defects += 1
    continue
  }

  // The one probe that matters: does the DESTINATION contain the anchor?
  const hit = readFileSync(target, 'utf8').includes(anchor)

  if (hit) {
    landed += 1
    defects += 1
    console.log(
      `  ✗ LANDED-NOT-ARCHIVED ${label}\n` +
        `      ${target} now contains the anchor — the paste is DONE.\n` +
        `      Bookkeeping owed (a fire can do this): mv ${it.path} ${ARCHIVE}/ and commit.`,
    )
    continue
  }

  // F-2225-1: this tree says OPEN. Before believing it, ask main — the tree whose law surface
  // the item is actually about. A disagreement is not a judgement call: the paste is done and
  // the archive bookkeeping is owed, whatever this checkout happens to hold.
  //
  // F-2244-1 (s2244): decide the FAILURE VALUE before the permissive test. `anchorOnMain`
  // returns THREE values and this site used to test `=== 'landed-on-main'`, so 'unverifiable'
  // — the value that means "the cross-check could not run" — swept onto the same branch as
  // 'absent-on-main', which means "it ran and the answer is no". The item then printed a plain
  // ⏳ OPEN at rc=0, byte-identical to a genuinely clean board, while the banner above had
  // already promised "Verdicts below are cross-checked against main". An affirmative promise of
  // a comparison that never happened (F-2221-1's polarity, F-2243-1's mechanism: `===` against
  // ONE member of a multi-valued return is never an exhaustive test).
  const onMain = anchorOnMain(target, anchor)

  if (onMain === 'landed-on-main') {
    stale += 1
    defects += 1
    console.log(
      `  ✗ STALE-TREE-OPEN ${label}\n` +
        `      This tree's ${target} lacks the anchor, but MAIN's copy CONTAINS it.\n` +
        `      The paste is DONE on main; reading OPEN here is an artefact of a frozen checkout.\n` +
        `      Bookkeeping owed (a fire can do this): mv ${it.path} ${ARCHIVE}/ and commit.`,
    )
    continue
  }

  // DECLARES, does not refuse — and fires ONLY from a linked worktree, which is the one place
  // the banner's promise can be false. Both restraints are load-bearing, not timidity:
  //
  //   * 'unverifiable' is LAWFUL in the common cases — git exit 128 is "not a repo", "no main
  //     ref", or "no such path on main" (a target main does not carry YET). Every legacy fixture
  //     in this family builds a non-git or main-less root, so refusing here is the over-general
  //     cure that reds ordinary work and gets excused into uselessness inside a week (F-1460-1).
  //   * from the MAIN worktree the cross-check is structurally INERT — the local file and main's
  //     blob are the same tree — so an unanswerable cross-check there hides nothing, and saying
  //     so would be the noise that decays a declaration into a formality (and would red arm 7,
  //     which asserts a non-git fixture root prints no UNVERIFIABLE at all).
  //
  // What is left is exactly the false promise: a frozen checkout whose cross-check went silent.
  if (onMain === 'unverifiable' && tree === 'linked-worktree') {
    uncrossChecked += 1
    open += 1
    console.log(
      `  ⚠️  OPEN (UNCROSS-CHECKED) ${label}\n` +
        `      This tree lacks the anchor, but git could NOT read main's copy of ${target},\n` +
        `      so "OPEN" here is this frozen checkout's word alone — the cross-check the banner\n` +
        `      above promises did not run. Re-run from the repo root before believing it.`,
    )
    continue
  }

  open += 1
  if (!quiet) {
    const age = Math.floor((Date.now() - statSync(it.path).mtimeMs) / 86400000)
    console.log(
      `  ⏳ OPEN  ${label}  (${age}d)  → ${target}\n` +
        `      ${it.meta.why || '(no why: line)'}\n` +
        `      opened ${it.meta.opened || '?'} · anchor: "${anchor.slice(0, 60)}${anchor.length > 60 ? '…' : ''}"`,
    )
  }
}

const verdict = defects > 0 ? 'DEFECTS' : open > 0 ? 'OPEN ITEMS (attended-side)' : 'CLEAN'
console.log(
  `attended-owed: ${verdict} — ${all.length} item(s): ${open} open, ${landed} landed-not-archived, ` +
    `${stale} stale-tree-open, ${uncrossChecked} uncross-checked, ` +
    `${defects - landed - stale} malformed/bad-target`,
)
if (open > 0 && defects === 0 && !strict) {
  console.log('  (OPEN is not a defect: only the attended side can clear it. --strict to enforce.)')
}

// F-2244-1: BARE mode is deliberately unchanged — an uncross-checked item is not a defect and
// must not red the battery (see the restraint note at the verdict site). --strict separates
// 2 = "could not answer" from 1 = "answered, and the answer refuses", the convention
// drain-block-check, dry-board-probe, master-shipped-classifier and review-evidence-audit all
// carry. An incomplete answer outranks a known-open item: 2 tells an attended sweep the run
// itself is not trustworthy, where 1 only says there is work to do.
process.exit(
  strict && uncrossChecked > 0 ? 2 : defects > 0 || (strict && open > 0) ? 1 : 0,
)

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

let defects = 0
let open = 0
let landed = 0
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
    `${defects - landed} malformed/bad-target`,
)
if (open > 0 && defects === 0 && !strict) {
  console.log('  (OPEN is not a defect: only the attended side can clear it. --strict to enforce.)')
}

process.exit(defects > 0 || (strict && open > 0) ? 1 : 0)

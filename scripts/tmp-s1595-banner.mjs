#!/usr/bin/env node
// s1595 — banner the rows whose HEADER advertises work that no longer exists.
// House convention (matching s1594 `c9d79e8b3`): keep the original leading marker,
// insert the ⛔ banner immediately after it, leave the original wording VERBATIM
// behind it (Retention Law — supersede, never rewrite).
import { readFileSync, writeFileSync } from 'node:fs'

const F = 'tasks/BACKLOG.md'
const lines = readFileSync(F, 'utf8').split('\n')

const JOBS = [
  {
    anchor: '**f1592-3-battery-frame-supply** `tasks/lane-b-f1592-3-battery-frame-supply.md`',
    banner: '⛔ **SHIPPED — DO NOT QUEUE THIS MASTER (F-1595-1, verified s1595 by `git merge-base --is-ancestor`, never by message-grep — Mistake #16): merged s1593 at `b2457017f88fd5cedf2054b95106a6996c267c0a`, an ancestor of main. The header below still reads `FIRE-AUTHORED s1592, AWAITING DISPATCH` and the master is STILL ON DISK, so this row invites a `cp` that would re-derive an already-merged diff — Mistake #8, the 824k flail. The closure is recorded only in this row’s TAIL.**',
  },
  {
    anchor: '**f1591-1-frame-supply-cliff** `tasks/lane-b-f1591-1-frame-supply-cliff.md`',
    banner: '⛔ **SHIPPED — DO NOT QUEUE THIS MASTER (F-1595-1, verified s1595 by `git merge-base --is-ancestor`): merged s1592 at `c213694c0d19ae133c4243a39c6ac329c438fb3e`, an ancestor of main. ⚠️ **THIS IS THE MOST DANGEROUS OF THE THREE**: its header advertises itself as *“the fourth attempt at the still-open F-1587-2”*, and F-1587-2 IS still open on the owner’s desk — so a fire hunting that thread finds a 🔧 master by path, still on disk, and queues attempt 6 by accident. s1594’s handoff warned *“do not manufacture an F-1587-2 attempt 6”* in PROSE; this row is what invites it.**',
  },
  {
    anchor: '**f1589-4-dep-reoptimize-stall** `tasks/lane-b-f1589-4-dep-reoptimize-stall.md`',
    banner: '⛔ **SHIPPED — DO NOT QUEUE THIS MASTER (F-1595-1, verified s1595 by `git merge-base --is-ancestor`): merged s1590 at `12190838aaf3415ad4c4b03e5c377c06af9c9919`, an ancestor of main. Header reads `FIRE-AUTHORED s1589`, master still on disk, closure tail-only — same shape as the two rows above it.**',
  },
  {
    anchor: '**F-1522-4 (s1522) — AUTHORED + QUEUED (lane-d, FIRE-AUTHORED)',
    banner: '⛔ **SHIPPED — DO NOT QUEUE THIS MASTER (F-1595-1, verified s1595 by `git merge-base --is-ancestor`): `f1522-1-dispatch-lane-safety` merged s1523 at `c81c15841`, an ancestor of main. Header reads `AUTHORED + QUEUED`, master still on disk, closure tail-only. The neighbouring ✅ row belongs to a DIFFERENT finding (F-FD3-1) and does not cover this one.**',
  },
  {
    anchor: '**E3 VOLTAGE SOCKET AUTHORED + QUEUED lane-a (s1466, FIRE-AUTHORED',
    banner: '⛔ **SHIPPED — DO NOT QUEUE THIS MASTER (F-1595-1, verified s1595): `e3-voltage-socket` merged s1467 at `3ac90dd8884593701bf865240cb254db133ab4de` (review `reviews/e3-voltage-socket.md`), an ancestor of main; the master is still on disk. ⓘ **MILDEST OF THE FIVE, AND RECORDED AS SUCH:** unlike the other four, this row’s closure DOES sit in a reader’s index — on the ✅ row immediately below it. Bannered anyway because an adjacent line is a weak mitigation for a cp-able shipped master (Mistake #8). ⚠️ **AND THE SCAN THAT FOUND IT WAS RIGHT FOR THE WRONG REASON:** it fired on `merged `0c4168a2``, which is the provenance of the EVIDENCE DOC this row cites (`docs/bench/e3-readiness-census.md`), NOT this master shipping. That is the narrow arm’s one known false-positive class — a hash cited as evidence inside the verb window.**',
  },
  {
    anchor: '**F-1364-1 (s1364, MEASURED — A CONJUNCTIVE OWNER GATE LOST A CONJUNCT',
    banner: '⛔ **CURED — DO NOT AUTHOR FROM THIS ROW (F-1595-1, verified s1595 by COMMIT-PROBE + FILE-PROBE): the transcription cure landed at `6d7f888f`, which `git merge-base --is-ancestor` confirms is on main, and `tasks/goals.json` now carries the owner’s full conjunction plus an explicit `DO NOT AUTHOR OR QUEUE` on BOTH `ap-03-protocol` and `ap-04-teach` — READ THERE, not here. What remains is NOT authorable work: it is the owner’s one-word re-greenlight, already carried on the desk. ⓘ **This row’s header says only `MEASURED`, and that is the whole lesson of F-1595-1 — MEASURED is a verb about the INVESTIGATION, not about the DISPOSITION**, so unlike its three siblings (`CORRECTED` / `EXECUTED` / `PATCHED`) it leaves a header-scanner with no idea the cure shipped.**',
  },
]

let changed = 0
for (const job of JOBS) {
  const idxs = lines.map((l, i) => (l.includes(job.anchor) ? i : -1)).filter(i => i >= 0)
  if (idxs.length !== 1) {
    console.error(`REFUSING: anchor matched ${idxs.length} lines (need exactly 1): ${job.anchor.slice(0, 60)}`)
    process.exit(2)
  }
  const i = idxs[0]
  const m = lines[i].match(/^(-\s*)?(\S+)\s/)
  if (!m) { console.error(`REFUSING: no leading marker on line ${i + 1}`); process.exit(2) }
  const lead = (m[1] || '') + m[2] + ' '
  if (lines[i].includes('⛔ **SHIPPED — DO NOT QUEUE') || lines[i].includes('⛔ **CURED — DO NOT AUTHOR FROM THIS ROW (F-1595-1')) {
    console.log(`already bannered, skipping line ${i + 1}`); continue
  }
  lines[i] = lead + job.banner + ' ' + lines[i].slice(lead.length)
  console.log(`bannered BACKLOG.md:${i + 1}  marker ${m[2]}  (+${job.banner.length} chars)`)
  changed++
}

writeFileSync(F, lines.join('\n'))
console.log(`\n${changed} row(s) bannered; original wording preserved verbatim behind each banner.`)

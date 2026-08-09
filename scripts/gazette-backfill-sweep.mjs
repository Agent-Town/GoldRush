#!/usr/bin/env node
// gazette-backfill-sweep.mjs — which player-visible merges reached NO owner-facing sink?
//
// GZ-01 duty (scripts/fire.md): every real-change merge on main gets a news item. The
// duty was re-keyed s1546 from "the merge you drain" to the MERGE EVENT, so any fire
// backfills any real-change merge whose review exists and whose hash is absent.
//
// ⚠️ THE CHECK MUST BE WIDE OR IT LIES (F-1600-1, measured s1600). The pipeline has TWO
// owner-facing sinks — marketing/outbox/gazette-queue.md AND the daily TK-01 ticker
// digests — and they cite hashes in DISJOINT conventions: digests carry SHORT hashes and
// zero full-40 ones, while gazette-queue.md carries both. So a full-40 grep against
// gazette-queue.md alone is STRUCTURALLY BLIND to every digest, and s1600 measured it
// over-reporting by 44.7% (21 of 47 "absent" were already published).
//
// Therefore: grep the 8-char SHORT hash across the WHOLE of marketing/outbox/.
//
// Advisory by design — exit 0 always. "Player-visible" is a JUDGEMENT, and F-1600-1
// explicitly forbids mechanising this as a red guard: such a guard fires on every
// bookkeeping and infrastructure merge and gets excused into uselessness within a week
// (the `cross-engine` label's fate, F-1460-1). This prints a WARN-level list to judge.
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'

const since = process.argv.find((a) => a.startsWith('--since='))?.slice(8) ?? '2026-08-05'
const git = (...a) => execFileSync('git', a, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })

// Player paths: a change the PLAYER could see. Excludes tests, scripts, tasks, docs,
// reviews, logs, marketing — those are factory surfaces, not the game.
const PLAYER = /^(src\/|assets\/|public\/|functions\/|index\.html)/

const log = git('log', 'main', '--first-parent', `--since=${since}`, '--format=%H%x09%h%x09%cs%x09%s')
  .trim()
  .split('\n')
  .filter(Boolean)

// One grep of the whole outbox, then membership tests — far cheaper than N greps.
const outbox = git('grep', '-rhoE', '[0-9a-f]{7,40}', '--', 'marketing/outbox/')
  .trim()
  .split('\n')
  .filter(Boolean)
// ⚠️ Index citations VERBATIM and test by PREFIX, never by a fixed slice. An earlier
// draft of this script indexed every token by its first 8 chars, which cannot match a
// 7-char citation and would have reported such a merge as a false ABSENT — the same
// shape of blindness (a matcher narrower than the data) that F-1600-1 is about.
const seen = new Set(outbox)
const cited = (full) => {
  for (let L = 7; L <= 40; L++) if (seen.has(full.slice(0, L))) return true
  return false
}

const rows = []
for (const line of log) {
  const [full, short, date, subject] = line.split('\t')
  const files = git('show', '--first-parent', '--name-only', '--format=', full).trim().split('\n').filter(Boolean)
  if (!files.some((f) => PLAYER.test(f))) continue

  // ⚠️ A merge may be published under the LANE-SIDE commit hash rather than the merge's
  // own — the existing roundups do exactly this. Keying only on the merge hash is a
  // matcher narrower than the citation convention, i.e. F-1600-1's mistake in a new
  // place, so also test every commit the merge INTRODUCED.
  let via = null
  let published = cited(full)
  if (published) via = 'merge hash'
  else {
    const introduced = git('rev-list', `${full}^1..${full}`).trim().split('\n').filter(Boolean)
    for (const c of introduced) {
      if (cited(c)) {
        published = true
        via = `contained commit ${c.slice(0, 9)}`
        break
      }
    }
  }
  rows.push({ full, short, date, subject, published, via, n: files.length })
}

const absent = rows.filter((r) => !r.published)
console.log(`=== GZ-01 BACKFILL SWEEP (since ${since}) ===`)
console.log(`player-path-touching first-parent merges: ${rows.length}`)
const viaContained = rows.filter((r) => r.published && r.via !== 'merge hash')
console.log(`  already cited in marketing/outbox/ (either sink): ${rows.length - absent.length}`)
console.log(`    ...of which cited only via a CONTAINED commit:  ${viaContained.length}`)
console.log(`  NOT cited anywhere — candidates to judge:         ${absent.length}`)
console.log('')
console.log('--- candidates (newest first; judge each for player-visibility) ---')
for (const r of absent) {
  console.log(`  ${r.short}  ${r.date}  files=${r.n}  ${r.subject.slice(0, 96)}`)
}

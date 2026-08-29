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
// ⚠️ PARAGRAPH SCOPE IS BLUNT, AND ONE RETRO-MARK'S BLANK LINE IS LOAD-BEARING (F-1613-1,
// measured s1613). The marker in marketing/outbox/gazette-queue.md sits after a blank line
// that SEVERS A SENTENCE mid-clause — on sight a typo in published prose, and it is not.
// That roundup's own two REPORTED hashes (ba78dad5e, 88530e3ef) share a contiguous run of
// prose with the four dismissed ones, so the blank line is the ONLY thing scoping the
// marker to the four. The tidy repair (un-split the sentence, marker at the paragraph end)
// was tested s1613 and reads reported 62 / dismissed 9 — it sweeps 88530e3ef, which that
// same roundup PUBLISHES AS NEWS, into dismissed. DO NOT TIDY THAT PROSE without re-running
// this sweep: nothing will red at you, because this tool is advisory and exits 0 always and
// the classifier's test is fixture-driven and cannot see the live board.
//
// Advisory by design — exit 0 always. "Player-visible" is a JUDGEMENT, and F-1600-1
// explicitly forbids mechanising this as a red guard: such a guard fires on every
// bookkeeping and infrastructure merge and gets excused into uselessness within a week
// (the `cross-engine` label's fate, F-1460-1). This prints a WARN-level list to judge.
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const MARKER = 'NOT PLAYER-VISIBLE'
const cited = (full, text) => {
  const seen = new Set(text.match(/[0-9a-f]{7,40}/g) ?? [])
  for (let L = 7; L <= 40; L++) if (seen.has(full.slice(0, L))) return true
  return false
}

export const classifyCitation = (full, outbox) => {
  if (!cited(full, outbox)) return 'candidate'
  return outbox.split(/\r?\n\s*\r?\n/).some((paragraph) =>
    paragraph.includes(MARKER) && cited(full, paragraph)
  ) ? 'dismissed' : 'reported'
}

export const normalizeSince = (since) => /^\d{4}-\d{2}-\d{2}$/.test(since) ? `${since}T00:00:00` : since

// Player paths: a change the PLAYER could see. Excludes tests, scripts, tasks, docs,
// reviews, logs, marketing — those are factory surfaces, not the game.
//
// ⚠️ THE PATH FILTER IS A CORPUS SELECTOR, AND IT OMITTED THE PUBLIC DOOR FOR 16 DAYS
// (F-2345-1, measured and cured s2345). Two comments above warn that a matcher narrower
// than the data lies — both about HASHES (F-1600-1's 8-char slice, the 7-char prefix
// trap). Nobody re-asked the same question of the PATHS, and `site/` was never in the
// list: the droplet-served landing at https://agenttown.app/, which `health-watch.sh`
// probes as "the public door" and which is the first page any visitor sees. Note also
// that `index.html` is ROOT-ANCHORED, so `site/index.html` did not match it either.
//
// Measured s2345 over 4,133 first-parent merges since 2026-08-05: NINE touch `site/`
// and no other player path, so all nine were skipped before classification and NONE is
// cited in any owner-facing sink — including "replace agenttown.app frontpage with the
// Gold Rush landing", "the landing tells the truth", and the county-wide live board.
//
// SEVERITY, STATED HONESTLY AND DELIBERATELY NOT INFLATED: nothing is broken for the
// player, no gate is wrong, and this tool is ADVISORY by design (exit 0 always). What
// earns it a finding is the DIRECTION — the skipped merges never reach `rows`, so they
// cannot appear as candidates, and the report prints "NOT cited anywhere: 0" as an
// affirmative all-clear over a corpus that excluded the landing page by construction.
// That number is what every dry-board fire reports to the owner as the GZ-01 discharge.
//
// The list is therefore NAMED and DECLARED in the report rather than buried in a
// regex, so the next narrowing is visible at the moment a fire reads the verdict
// (F-2208-1: declare on the happy path too, or the declaration re-creates the
// ambiguity it removes). Widening remains a JUDGEMENT: a path belongs here only if a
// PLAYER could see it. `rehearsal/`, `foundry/`, `ops/`, `server/` and `news/herald.json`
// were each considered s2345 and deliberately EXCLUDED as factory/backend surfaces.
export const PLAYER_PREFIXES = ['src/', 'assets/', 'public/', 'functions/', 'site/', 'index.html']
// Derived from the list above, never a parallel literal: a second copy is how the hash
// matchers in this same file drifted twice (F-1600-1, F-1633-1), and F-1261-1's rule is
// that there is ONE implementation of a predicate in this repo. Exported so its guard
// tests the REAL decision rather than a re-derivation that can agree while being wrong.
const PLAYER = new RegExp(`^(${PLAYER_PREFIXES.map((p) => p.replace(/\./g, '\\.')).join('|')})`)
export const isPlayerPath = (file) => PLAYER.test(file)

const main = () => {
  // Git fills a date-only revision limit with the current clock time, shrinking the
  // same calendar window during the day. Pin date-only inputs to local midnight.
  const since = normalizeSince(process.argv.find((a) => a.startsWith('--since='))?.slice(8) ?? '2026-08-05')
  const git = (...a) => execFileSync('git', a, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })

  const log = git('log', 'main', '--first-parent', `--since=${since}`, '--format=%H%x09%h%x09%cs%x09%s')
    .trim()
    .split('\n')
    .filter(Boolean)

  // One grep of the whole outbox, then membership tests — far cheaper than N greps.
  const outbox = git('grep', '-h', '--break', '^', '--', 'marketing/outbox/')
  // ⚠️ Index citations VERBATIM and test by PREFIX, never by a fixed slice. An earlier
  // draft of this script indexed every token by its first 8 chars, which cannot match a
  // 7-char citation and would have reported such a merge as a false ABSENT — the same
  // shape of blindness (a matcher narrower than the data) that F-1600-1 is about.
  const rows = []
  for (const line of log) {
    const [full, short, date, subject] = line.split('\t')
    const files = git('show', '--first-parent', '--name-only', '--format=', full).trim().split('\n').filter(Boolean)
    if (!files.some((f) => isPlayerPath(f))) continue

    // ⚠️ A merge may be published under the LANE-SIDE commit hash rather than the merge's
    // own — the existing roundups do exactly this. Keying only on the merge hash is a
    // matcher narrower than the citation convention, i.e. F-1600-1's mistake in a new
    // place, so also test every commit the merge INTRODUCED.
    let via = null
    let state = classifyCitation(full, outbox)
    if (state !== 'candidate') via = 'merge hash'
    else {
      const introduced = git('rev-list', `${full}^1..${full}`).trim().split('\n').filter(Boolean)
      for (const c of introduced) {
        const containedState = classifyCitation(c, outbox)
        if (containedState !== 'candidate') {
          state = containedState
          via = `contained commit ${c.slice(0, 9)}`
          break
        }
      }
    }
    rows.push({ full, short, date, subject, state, via, n: files.length })
  }

  const reported = rows.filter((r) => r.state === 'reported')
  const dismissed = rows.filter((r) => r.state === 'dismissed')
  const absent = rows.filter((r) => r.state === 'candidate')
  console.log(`=== GZ-01 BACKFILL SWEEP (since ${since}) ===`)
  // F-2345-1: the verdict below is a universal claim over whatever these prefixes select.
  // Printed ALWAYS, including the happy path — a scan space named only when something goes
  // wrong leaves "0 candidates" indistinguishable from "0 candidates I was allowed to see".
  console.log(`scan space: ${PLAYER_PREFIXES.join(' ')}`)
  console.log(`  (a merge touching NONE of these is never examined — widen the list, not the verdict)`)
  console.log(`examined ${log.length} first-parent merge(s) in the window`)
  console.log(`player-path-touching first-parent merges: ${rows.length}`)
  const viaContained = rows.filter((r) => r.state !== 'candidate' && r.via !== 'merge hash')
  console.log(`  already cited in marketing/outbox/ (either sink): ${reported.length + dismissed.length}`)
  console.log(`    ...of which cited only via a CONTAINED commit:  ${viaContained.length}`)
  console.log(`  reported:                                          ${reported.length}`)
  console.log(`  dismissed (${MARKER}):                  ${dismissed.length}`)
  console.log(`  NOT cited anywhere — candidates to judge:         ${absent.length}`)
  console.log('')
  console.log('--- dismissed (newest first; available to re-judge) ---')
  for (const r of dismissed) console.log(`  ${r.short}  ${r.date}  ${r.subject.slice(0, 96)}`)
  console.log('')
  console.log('--- candidates (newest first; judge each for player-visibility) ---')
  for (const r of absent) {
    console.log(`  ${r.short}  ${r.date}  files=${r.n}  ${r.subject.slice(0, 96)}`)
  }
  if (absent.length) {
    console.log('')
    // F-2157-1: a judgement recorded ONLY in a STATUS.md handoff does not reach this tool,
    // which reads marketing/outbox/ and nothing else. 1968127f5 was judged NOT PLAYER-VISIBLE
    // in ELEVEN consecutive handoffs (s2144..s2155) while cited ZERO times in the outbox, so
    // it came back as a live candidate every fire and each one re-paid the judgement cost --
    // several while telling their successor "do NOT re-judge it". State the discharge here,
    // at the moment the judgement is made, because that is the only surface the judging fire
    // is looking at (the F-1654-1 address problem, one level down).
    console.log('    to DISCHARGE a candidate, write its verdict where THIS TOOL reads:')
    console.log(`      - news      -> a gazette item in marketing/outbox/ citing the hash`)
    console.log(`      - not news  -> a paragraph in marketing/outbox/ containing "${MARKER}" AND the hash`)
    console.log('    a verdict written only into a STATUS.md handoff is INVISIBLE here and')
    console.log('    the candidate returns next fire. Blank lines scope the marker paragraph:')
    console.log('    never cite a REPORTED hash inside one (F-1613-1).')
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()

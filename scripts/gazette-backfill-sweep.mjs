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
// That roundup's own two REPORTED hashes (603c9e5d2, 312b443f1) share a contiguous run of
// prose with the four dismissed ones, so the blank line is the ONLY thing scoping the
// marker to the four. The tidy repair (un-split the sentence, marker at the paragraph end)
// was tested s1613 and reads reported 62 / dismissed 9 — it sweeps 312b443f1, which that
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

// ⚠️ DO NOT "simplify" this away — it is load-bearing and its reason was undocumented until s2562.
// git's approxidate fills a BARE `YYYY-MM-DD` with the CURRENT TIME-OF-DAY, so `--since=2026-09-11`
// means 2026-09-11 at whatever o'clock it happens to be. A bare-date window therefore SLIDES through
// the day and reports a DIFFERENT day's commits depending on when you run it. Measured s2562 by
// prediction, 5/5 subjects: at 16:03 local, `--since=D --until=D+1` returned exactly the commits in
// [D@16:03, D+1@16:03) — so a probe for 2026-09-11 (truly 0 commits) returned September 12's 8.
// Pinning the time kills the slide. F-2391-1 cures the JS side of this trap (build bounds by integer
// y/m/d arithmetic, never Date parsing); this is the OTHER half — what you hand to git.
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

// ⚠️ THE ≤3/WEEK BATCHING RULE IS A *WEEKLY AGGREGATE*, AND NO SINGLE FIRE CAN SEE IT
// (F-2491-1, measured s2491). GZ-01 says "≤3 GAZETTE items/week reach the owner (batch the
// rest into the weekly roundup item)" — but a fire files ONE item, for ITS OWN drain, and
// that act is locally correct every time. The rule's subject is the WEEK, which no actor in
// the loop observes: this sweep counted reported/dismissed/candidates and had no opinion on
// how many headlines the week already held.
//
// Measured s2491 for ISO week 2026-W36: 19 standalone items against a budget of 3, filed by
// eleven separate fires (s2459..s2476) each judging its own merge worth a headline. Fires DO
// batch when they think of it — five ROUNDUP-CLASS items sit in the same window — but the
// counting was a HABIT, not a step, and during a high-drain burst every fire independently
// reached the same locally-correct answer.
//
// SEVERITY, STATED HONESTLY AND DELIBERATELY NOT INFLATED: nothing is broken, this is NOT a
// false green, and no verdict anywhere was wrong. The queue is a QUEUE the owner approves
// FROM, so an over-full queue publishes nothing. What earns it a declaration is the
// DIRECTION: it fails toward MORE owner load, in the one pipeline whose whole purpose is to
// BOUND owner load — the owner's "one morning action" is handed 19 headlines to weigh where
// the rule promises 3.
//
// ADVISORY ONLY, exit 0 always, like every other number this tool prints. A red is wrong
// here for this file's own stated reason: "player-visible" is a JUDGEMENT, so a gate would
// fire on honest work and be excused into uselessness within a week (F-1460-1). The count is
// mechanical, which is exactly why it belongs in the instrument rather than in a sentence.
export const ITEM_BUDGET = 3

// Pure integer calendar arithmetic on y/m/d components — NEVER Date.parse of a date STRING.
// `new Date('2026-09-03')` is UTC midnight while `new Date()` is LOCAL, and this machine is
// UTC+07, so mixing the two collapses a window to zero width and reports 0 for every subject
// alike (F-2391-1). Date.UTC here is used only as a calendar, never as a clock.
export const isoWeekOf = (y, m, d) => {
  const t = new Date(Date.UTC(y, m - 1, d))
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7))
  const yy = t.getUTCFullYear()
  const week = Math.ceil(((t - Date.UTC(yy, 0, 1)) / 86400000 + 1) / 7)
  return `${yy}-W${String(week).padStart(2, '0')}`
}

// A batched item spends no headline slot. TWO forms are in live use and both count: the
// `ROUNDUP-CLASS` annotation line, and a headline that is itself a `## ROUNDUP —`. Counting
// only the first over-reports by one in the 2026-W36 window; the finding survives either
// reading (19 vs 18 against a budget of 3), which is why the looser one is used.
export const isBatchedItem = (para) =>
  /ROUNDUP-CLASS/.test(para) || /^##\s+ROUNDUP\b/.test(para.trimStart())

// A gazette ITEM is a blank-line-scoped paragraph opening `## ` — the same scoping
// `classifyCitation` already relies on, not a second parser (F-1261-1).
export const weeklyItemCensus = (queueText, dateOf, week) => {
  if (!queueText.trim()) {
    return { corpus: 'unreadable', week, standalone: 0, batched: 0, uncited: 0, unresolved: 0, headlines: [] }
  }
  let standalone = 0, batched = 0, uncited = 0, unresolved = 0
  const headlines = []
  for (const para of queueText.split(/\r?\n\s*\r?\n/)) {
    if (!/^##\s/.test(para.trimStart())) continue
    const m = para.match(/merge:?\s*`?([0-9a-f]{7,40})/)
    // Two different holes, reported apart because they owe different acts: an item this
    // parser found no merge token in, versus one citing a hash no ref carries. Collapsing
    // them into one "undated" number describes neither.
    //
    // ⚠️ THE `uncited` BUCKET IS NOT "the pre-2026-08 house format" — that was this comment's
    // claim until s2578 and it is MEASURABLY FALSE: of the 117 uncited items, 27 were filed
    // in 2026-07 and **89 on or after 2026-08-01** (1 undatable). But DO NOT build the
    // obvious fallback, because it was measured and it changes NOTHING and its naive form
    // is WORSE (F-2578-1):
    //   · An item's FILING date (the queue commit that first adds its `## ` line) is a sound
    //     substitute — it agrees with merge-week on 214 of 216 datable items (99.1%), and the
    //     2 divergences are backfills, both already ROUNDUP-batched, so they spend no slot
    //     either way. Fires file their GZ-01 item at drain time, so the two weeks coincide
    //     BY CONSTRUCTION, and the ≤3/week batching rule itself catches the exception.
    //   · Adding that fallback flips the over/under-budget verdict for **0 of 11 weeks**.
    //     W28–W36 are already over by 4–13× (13–40 standalone against a budget of 3); W37
    //     and W38 sit at exactly 3 and contain NO uncited items at all.
    //   · The naive fallback is actively harmful: 29 of the uncited paragraphs are DISMISSALS
    //     (`## SWEEP NOTE …` / `NOT PLAYER-VISIBLE`), which `isBatchedItem` does not match, so
    //     dating them would score all 29 as STANDALONE headlines — +10 phantom in W33 and +15
    //     in W34 — pushing fires to batch news that needed no batching.
    // The hole is also currently EMPTY: zero uncited items have been filed since 2026-09-01,
    // because every fire now cites its merge. Report the number (it is printed); do not cure it.
    if (!m) { uncited++; continue }
    const date = dateOf(m[1])
    if (!date) { unresolved++; continue }
    if (isoWeekOf(...date.split('-').map(Number)) !== week) continue
    if (isBatchedItem(para)) batched++
    else { standalone++; headlines.push(para.trimStart().split('\n')[0].slice(3, 72)) }
  }
  return { corpus: 'read', week, standalone, batched, uncited, unresolved, headlines }
}

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
  console.log(`  (a commit touching NONE of these is never examined — widen the list, not the verdict)`)
  // F-2613-1: the corpus is `git log --first-parent` with NO `--merges` (see the call above), so it is
  // the WHOLE first-parent chain. Measured s2613 over the live window: 5853 commits, of which only 411
  // are merges (7%) and 5442 are single-parent. The old label read "first-parent merge(s)" and
  // under-described the corpus 13x. It was never a coverage defect — the sweep is WIDER than its label —
  // but a fire reasoning from the label concludes direct commits are invisible to GZ-01 and spends a
  // budget hunting a blind spot that does not exist. This fire's own candidate `a57f0934e` (era pin #8)
  // is single-parent and WAS examined, which is the live counter-example.
  console.log(`examined ${log.length} first-parent commit(s) in the window — merges AND single-parent alike; this walks the WHOLE first-parent chain (F-2613-1)`)
  console.log(`player-path-touching first-parent commit(s): ${rows.length}`)
  const viaContained = rows.filter((r) => r.state !== 'candidate' && r.via !== 'merge hash')
  console.log(`  already cited in marketing/outbox/ (either sink): ${reported.length + dismissed.length}`)
  console.log(`    ...of which cited only via a CONTAINED commit:  ${viaContained.length}`)
  console.log(`  reported:                                          ${reported.length}`)
  console.log(`  dismissed (${MARKER}):                  ${dismissed.length}`)
  console.log(`  NOT cited anywhere — candidates to judge:         ${absent.length}`)

  // F-2491-1. Printed ALWAYS, including when the week is under budget — a warning that
  // appears only when something is wrong re-creates the ambiguity it removes (F-2208-1),
  // and this number's whole job is to be in front of a fire at the moment it files.
  const now = new Date()
  const week = isoWeekOf(now.getFullYear(), now.getMonth() + 1, now.getDate())
  const queueText = git('grep', '-h', '--break', '^', '--', 'marketing/outbox/gazette-queue.md')
  // Date citations from the WHOLE history, not from `rows`. `rows` holds only player-path
  // merges inside --since, so dating from it makes the count a FLOOR: an item citing a
  // contained commit, or a merge outside the window, silently becomes "undated" and leaves
  // the week. A week cited entirely that way would report 0 standalone and NOT warn — a
  // false clean of exactly the shape this file's other comments are about. One `git log
  // --all` is 12,563 commits in ~216 ms (measured s2491), so the honest read is also cheap.
  const dateIndex = new Map()
  for (const l of git('log', '--all', '--format=%H%x09%cs').trim().split('\n')) {
    const [h, d] = l.split('\t')
    if (h) dateIndex.set(h, d)
  }
  const byPrefix = new Map()
  for (const [h, d] of dateIndex) {
    const k = h.slice(0, 7)
    if (!byPrefix.has(k)) byPrefix.set(k, [])
    byPrefix.get(k).push([h, d])
  }
  const dateOf = (hash) =>
    (byPrefix.get(hash.slice(0, 7)) ?? []).find(([h]) => h.startsWith(hash))?.[1] ?? null
  const wk = weeklyItemCensus(queueText, dateOf, week)
  console.log('')
  if (wk.corpus !== 'read') {
    console.log(`weekly headline budget: ⛔ CANNOT VERIFY — gazette-queue.md read back empty from this cwd.`)
    console.log(`  This is a corpus failure, not a clean week. Re-run from the repo root.`)
  } else {
    console.log(`weekly headline budget (${wk.week}): ${wk.standalone} standalone, ${wk.batched} batched`)
    console.log(`  GZ-01 allows <=${ITEM_BUDGET} standalone item(s) per week; the rest batch into a ROUNDUP.`)
    console.log(`  (counted in NO week: ${wk.uncited} item(s) carry no merge citation this parser`)
    console.log(`   resolves — the pre-2026-08 house format — and ${wk.unresolved} cite a hash on no ref.)`)
    if (wk.standalone > ITEM_BUDGET) {
      console.log(`  ⚠️  THE WEEK'S ${ITEM_BUDGET} HEADLINE SLOTS ARE SPENT. File as ROUNDUP-CLASS, not as a`)
      console.log(`      new headline — the budget is a WEEKLY aggregate and your one item looks fine alone.`)
      for (const h of wk.headlines.slice(0, 5)) console.log(`        already standing: ${h}`)
      if (wk.headlines.length > 5) console.log(`        ... and ${wk.headlines.length - 5} more`)
    }
  }
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
    // which reads marketing/outbox/ and nothing else. 7b07256cc was judged NOT PLAYER-VISIBLE
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

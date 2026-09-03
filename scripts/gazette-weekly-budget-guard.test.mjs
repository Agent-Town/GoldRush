// F-2491-1 guard — the GZ-01 weekly headline budget declaration in gazette-backfill-sweep.mjs.
//
// WHY THIS EXISTS: the ≤3/week batching rule is a WEEKLY AGGREGATE that no single fire can
// observe. Each fire files one item for its own drain — locally correct every time — and the
// week silently reached 19 standalone items against a budget of 3 (measured s2491, ISO week
// 2026-W36, filed by eleven separate fires). The cure is a declaration in the instrument every
// fire already runs at the moment it files. This guard exists so that declaration cannot
// silently stop declaring.
//
// The CLI arms are the load-bearing ones. F-2209-1 and F-2210-1 both record the same trap in
// this repo: extracting a decision so it can be tested creates a NEW untested seam at the CALL
// SITE, and for an advisory tool (exit 0 always) the whole interface is STDOUT — so asserting
// the pure function while nothing reads the printed line relocates the blind spot and writes a
// green suite attesting to it.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { isoWeekOf, isBatchedItem, weeklyItemCensus, ITEM_BUDGET } from './gazette-backfill-sweep.mjs'

// Anchored to this file, never to process.cwd() — F-2220-1: a cwd-rooted corpus narrows
// silently, and a SUBDIRECTORY is the dangerous cwd because everything still resolves.
const HERE = dirname(fileURLToPath(import.meta.url))
const SWEEP = resolve(HERE, 'gazette-backfill-sweep.mjs')

const item = (headline, hash, extra = '') =>
  `## ${headline}\nA plain line of county news.\nmerge \`${hash}\`${extra ? '\n' + extra : ''}`

test('isoWeekOf: ISO-8601 week boundaries, including the year boundary', () => {
  assert.equal(isoWeekOf(2026, 9, 3), '2026-W36')
  assert.equal(isoWeekOf(2026, 8, 31), '2026-W36', 'Monday opens the week')
  assert.equal(isoWeekOf(2026, 8, 30), '2026-W35', 'Sunday closes the previous week')
  assert.equal(isoWeekOf(2026, 9, 6), '2026-W36', 'Sunday still closes W36')
  assert.equal(isoWeekOf(2026, 9, 7), '2026-W37', 'the next Monday opens W37')
})

test('isoWeekOf: the year-boundary rule, where naive week arithmetic goes wrong', () => {
  assert.equal(isoWeekOf(2027, 1, 1), '2026-W53', 'a Friday belongs to the OLD year\'s last week')
  assert.equal(isoWeekOf(2026, 12, 31), '2026-W53')
})

// ⚠️ THIS ARM DOES NOT DEFEND AGAINST F-2391-1, AND SAYING SO IS THE POINT. The teeth sweep
// (s2491) manufactured the F-2391-1 defect itself — swapping Date.UTC for a parsed date STRING
// — and it reddened NOTHING, because the subject takes y/m/d INTEGERS, so a string parsed at
// local noon lands on the same calendar day. The hazard is unreachable BY CONSTRUCTION, which
// is a property of the signature and not of any assertion here. An arm named for a defence it
// cannot provide is worse than no arm: it makes the next reader stop looking.

test('isBatchedItem recognises BOTH live batching forms, and no others', () => {
  assert.equal(isBatchedItem(item('a', 'abcdef01', 'ROUNDUP-CLASS — slots spent')), true)
  assert.equal(isBatchedItem(item('ROUNDUP — three merges at once', 'abcdef01')), true)
  assert.equal(isBatchedItem(item('A plain headline', 'abcdef01')), false,
    'a plain item must spend a slot, or the budget can never be exceeded')
})

test('weeklyItemCensus counts a standalone item in the target week', () => {
  const q = item('The door learns a new word', 'aaaaaaa1')
  const c = weeklyItemCensus(q, () => '2026-09-03', '2026-W36')
  assert.equal(c.corpus, 'read')
  assert.equal(c.standalone, 1)
  assert.equal(c.batched, 0)
  assert.match(c.headlines[0], /The door learns a new word/)
})

test('weeklyItemCensus excludes items from other weeks', () => {
  const q = item('Last week news', 'aaaaaaa1')
  assert.equal(weeklyItemCensus(q, () => '2026-08-25', '2026-W36').standalone, 0)
})

test('a batched item is counted apart and spends NO headline slot', () => {
  const q = [
    item('Plain one', 'aaaaaaa1'),
    item('Batched one', 'aaaaaaa2', 'ROUNDUP-CLASS — slots spent'),
  ].join('\n\n')
  const c = weeklyItemCensus(q, () => '2026-09-03', '2026-W36')
  assert.equal(c.standalone, 1)
  assert.equal(c.batched, 1)
})

test('an undatable item is declared apart by CAUSE, never silently counted in the week', () => {
  const q = [item('Datable', 'aaaaaaa1'), item('Not datable', 'bbbbbbb2'), '## No merge line at all\nprose'].join('\n\n')
  const c = weeklyItemCensus(q, (h) => (h.startsWith('aaaaaaa') ? '2026-09-03' : null), '2026-W36')
  assert.equal(c.standalone, 1, 'only the datable item is counted')
  assert.equal(c.uncited, 1, 'no merge token at all')
  assert.equal(c.unresolved, 1, 'a hash on no ref — a DIFFERENT hole owing a different act')
})

test('an EMPTY corpus REFUSES rather than reporting a clean week', () => {
  // F-2217-1: a loop over nothing registers no counts and reports success. "0 standalone"
  // and "I could not read the queue" must not be the same answer.
  const c = weeklyItemCensus('   \n  ', () => '2026-09-03', '2026-W36')
  assert.equal(c.corpus, 'unreadable')
  assert.notEqual(c.corpus, 'read')
})

// ---------- CLI arms: the declaration must reach STDOUT, from where the caller stands ----------

const buildFixture = (items) => {
  const root = mkdtempSync(join(tmpdir(), 'gz-budget-'))
  const g = (...a) => execFileSync('git', a, { cwd: root, encoding: 'utf8' })
  g('init', '-q', '-b', 'main')
  g('config', 'user.email', 'g@example.com')
  g('config', 'user.name', 'guard')
  mkdirSync(join(root, 'src'), { recursive: true })
  mkdirSync(join(root, 'marketing', 'outbox'), { recursive: true })
  // The ROOT commit must touch NO player path. The sweep resolves a candidate's contained
  // commits with `rev-list <sha>^1..<sha>`, and a root commit has no ^1 — so a player-path
  // root crashes the tool at git exit 128 with empty stdout. Latent in the real repo (its
  // root predates any --since a fire passes) but trivially reachable in a fixture, and it
  // cost this guard its first run.
  writeFileSync(join(root, 'README.md'), 'seed\n')
  writeFileSync(join(root, 'marketing', 'outbox', 'gazette-queue.md'), 'seed\n')
  g('add', '-A'); g('commit', '-q', '-m', 'seed')

  // one player-path merge, so a citation of it is datable and classifies as reported
  g('checkout', '-q', '-b', 'lane')
  writeFileSync(join(root, 'src', 'a.ts'), 'export const a = 2\n')
  g('add', '-A'); g('commit', '-q', '-m', 'lane work')
  const contained = g('rev-parse', 'HEAD').trim()
  g('checkout', '-q', 'main')
  g('merge', '-q', '--no-ff', 'lane', '-m', 'feat: a player-visible change')
  const full = g('rev-parse', 'HEAD').trim()

  writeFileSync(join(root, 'marketing', 'outbox', 'gazette-queue.md'), items(full, contained))
  g('add', '-A'); g('commit', '-q', '-m', 'gazette')
  return { root, full, contained }
}

const runSweep = (root) => {
  const r = spawnSync('node', [SWEEP, '--since=2020-01-01'], { cwd: root, encoding: 'utf8' })
  return { status: r.status, out: r.stdout ?? '', err: r.stderr ?? '' }
}

test('CLI: the budget declaration prints on the HAPPY path (under budget)', (t) => {
  const { root } = buildFixture((h) => item('One lonely headline', h))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const r = runSweep(root)
  assert.equal(r.status, 0, 'advisory: exit 0 always')
  assert.ok(r.out.length > 0, 'control: the sweep really produced output')  // F-2215-1
  assert.match(r.out, /weekly headline budget \(\d{4}-W\d{2}\)/,
    'F-2208-1: a declaration that appears only on failure re-creates the ambiguity it removes')
  assert.doesNotMatch(r.out, /HEADLINE SLOTS ARE SPENT/, 'reverse control: an under-budget week must not warn')
})

test('CLI: going over budget prints the warning AND names what already stands', (t) => {
  const { root } = buildFixture((h) =>
    Array.from({ length: ITEM_BUDGET + 2 }, (_, i) => item(`Headline number ${i}`, h)).join('\n\n'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const r = runSweep(root)
  assert.equal(r.status, 0, 'advisory even when over budget — a red would be excused away (F-1460-1)')
  assert.ok(r.out.length > 0, 'control: the sweep really produced output')
  assert.match(r.out, /HEADLINE SLOTS ARE SPENT/)
  assert.match(r.out, /already standing: Headline number/, 'the warning must be actionable, not just a count')
})

test('CLI: batched items do NOT trip the warning', (t) => {
  const { root } = buildFixture((h) =>
    Array.from({ length: ITEM_BUDGET + 2 }, (_, i) =>
      item(`Headline number ${i}`, h, 'ROUNDUP-CLASS — slots spent')).join('\n\n'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const r = runSweep(root)
  assert.ok(r.out.length > 0, 'control: the sweep really produced output')
  assert.match(r.out, /weekly headline budget/)
  assert.doesNotMatch(r.out, /HEADLINE SLOTS ARE SPENT/,
    'reverse control: batching is the CURE, so it must never be scored as the defect')
})

test('CLI: items citing a CONTAINED commit still count — the census is not a floor', (t) => {
  // The queue cites lane-side commits, which the existing roundups genuinely do. Dating the
  // census from `rows` (player-path merges inside --since) rather than from the whole history
  // makes every such item "unresolved", drops it out of the week, and reports a clean budget
  // on a week that is entirely spent — a false clean, not a conservative under-count.
  const { root } = buildFixture((_h, contained) =>
    Array.from({ length: ITEM_BUDGET + 2 }, (_, i) => item(`Contained headline ${i}`, contained)).join('\n\n'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const r = runSweep(root)
  assert.ok(r.out.length > 0, 'control: the sweep really produced output')
  assert.match(r.out, /HEADLINE SLOTS ARE SPENT/,
    'a contained-commit citation is still an item that spent a slot')
})

test('CLI: the pre-existing sweep numbers are untouched by this addition', (t) => {
  // Behaviour-neutrality on the arm that already had consumers (F-1274-2).
  const { root } = buildFixture((h) => item('One lonely headline', h))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const r = runSweep(root)
  assert.match(r.out, /=== GZ-01 BACKFILL SWEEP/)
  assert.match(r.out, /reported: +1/, 'the cited merge still classifies as reported')
  assert.match(r.out, /NOT cited anywhere — candidates to judge: +0/)
})

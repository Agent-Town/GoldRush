// s1416 — F-1416-1: guard the porcelain parse in lane-usable.mjs.
//
// THE DEFECT THIS EXISTS FOR: `git status --porcelain` emits `XY<space>path`, and
// an unstaged modification begins with a SPACE (" M path"). The parser used to
// `.trim()` the whole buffer before splitting, which strips that leading space
// from the FIRST line only; `line.slice(3)` then ate the first character of that
// one path. s1415 saw the symptom ("rtifacts/…" on line 1, "artifacts/…" on line
// 2) and filed it as cosmetic. It was not: the mangled string is what the CHURN
// test compares, so when the alphabetically-first dirty path was a churn path it
// failed to match ("ogs/factory-usage.json") and the lane reported a FALSE DIRTY.
// Measured s1416 — all four lanes read DIRTY on logs/factory-usage.json, a path
// lane-runner-v3.sh:121 excludes from every lane commit, so the whole fleet was
// unrefillable on a verdict about a file no lane can author.
//
// Case 1 is the regression. The rest pin the classification contract so a future
// edit cannot trade one mislabel for another.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { classifyDirt, CHURN } from './lane-usable.mjs'

test('the FIRST line keeps its leading space — no character is eaten (F-1416-1)', () => {
  const d = classifyDirt(' M artifacts/accounts-worker/test-accounts.json\n M artifacts/multiplayer-relay/test-multiplayer.json')
  assert.deepEqual(d.tracked, [
    'artifacts/accounts-worker/test-accounts.json',
    'artifacts/multiplayer-relay/test-multiplayer.json',
  ])
})

test('a churn path on the FIRST line is still recognised as churn (the false DIRTY)', () => {
  const d = classifyDirt(' M logs/factory-usage.json\n M src/game/Game.ts')
  assert.deepEqual(d.churn, ['logs/factory-usage.json'])
  assert.deepEqual(d.tracked, ['src/game/Game.ts'])
})

test('every CHURN constant is recognised in first position', () => {
  for (const c of CHURN) {
    const d = classifyDirt(` M ${c}`)
    assert.deepEqual(d.churn, [c], `${c} must classify as churn when it is the first line`)
    assert.deepEqual(d.tracked, [], `${c} must never be reported as tracked dirt`)
  }
})

test('a churn DIRECTORY matches by prefix, not by equality', () => {
  const d = classifyDirt(' M .wrangler/tmp/bundle-1.js\n?? .wrangler/tmp/bundle-2.js')
  assert.deepEqual(d.churn, ['.wrangler/tmp/bundle-1.js', '.wrangler/tmp/bundle-2.js'])
  assert.deepEqual(d.tracked, [])
  assert.deepEqual(d.untracked, [])
})

test('untracked debris and tracked dirt stay in separate buckets (s1299)', () => {
  const d = classifyDirt('?? scratch.pyc\n M src/game/Game.ts')
  assert.deepEqual(d.untracked, ['scratch.pyc'])
  assert.deepEqual(d.tracked, ['src/game/Game.ts'])
})

test('staged and staged+unstaged prefixes parse identically', () => {
  const d = classifyDirt('M  src/a.ts\nMM src/b.ts\nA  src/c.ts')
  assert.deepEqual(d.tracked, ['src/a.ts', 'src/b.ts', 'src/c.ts'])
})

test('a trailing newline produces no phantom entry', () => {
  const d = classifyDirt(' M src/a.ts\n')
  assert.deepEqual(d.tracked, ['src/a.ts'])
  assert.equal(d.untracked.length + d.churn.length, 0)
})

test('empty porcelain is a clean tree', () => {
  const d = classifyDirt('')
  assert.deepEqual(d, { tracked: [], untracked: [], churn: [] })
})

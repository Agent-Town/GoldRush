import assert from 'node:assert/strict'
import { test } from 'node:test'
import { formatHeldResidue, residueForHeld } from './lane-usable.mjs'
import { residueFor } from './lane-residue.mjs'

test('all added lines present in main are absorbed', () => {
  assert.deepEqual(residueFor({ diff: '+const answer = 42', mainText: 'const answer = 42' }), {
    status: 'ABSORBED',
    added: ['const answer = 42'],
    missing: [],
  })
})

test('one absent line is returned as residue', () => {
  const residue = residueFor({ diff: '+present\n+missing', mainText: 'present' })
  assert.equal(residue.status, 'NOT_ABSORBED')
  assert.deepEqual(residue.missing, ['missing'])
})

test('token-rich lane lines can be absorbed by a main superset line', () => {
  const lane = 'alpha beta gamma delta epsilon zeta eta theta'
  const residue = residueFor({ diff: `+${lane}`, mainText: `${lane} iota` })
  assert.equal(residue.status, 'ABSORBED_TOKEN')
  assert.deepEqual(residue.missing, [])
  assert.deepEqual(residue.wholeLineMissing, [lane])
})

test('token-poor lane lines are not absorbed by unrelated main text', () => {
  const lane = '  return false;'
  const mainText = 'function f() {\n  // return false is handled by the caller below\n  return true;\n}'
  const residue = residueFor({ diff: `+${lane}`, mainText })
  assert.equal(residue.status, 'NOT_ABSORBED')
  assert.deepEqual(residue.missing, [lane])
})

test('token fallback starts at exactly eight qualifying tokens', () => {
  const rich = 'alpha beta gamma delta epsilon zeta eta theta'
  const poor = 'alpha beta gamma delta epsilon zeta eta'
  assert.equal(residueFor({ diff: `+${rich}`, mainText: `${rich} iota` }).status, 'ABSORBED_TOKEN')
  const residue = residueFor({ diff: `+${poor}`, mainText: `${poor} iota` })
  assert.equal(residue.status, 'NOT_ABSORBED')
  assert.deepEqual(residue.missing, [poor])
})

test('binary diffs are never counted', () => {
  const residue = residueFor({ diff: 'Binary files a/p.png and b/p.png differ', mainText: '' })
  assert.deepEqual(residue, { status: 'BINARY', added: [], missing: [] })
  assert.deepEqual(formatHeldResidue({ kind: 'BOTH-MOVED', path: 'p.png' }, residue), [
    '    HELD BOTH-MOVED  p.png  (BINARY)',
  ])
})

test('blank and whitespace-only additions are ignored', () => {
  assert.deepEqual(residueFor({ diff: '+\n+   \n+kept', mainText: 'kept' }), {
    status: 'ABSORBED',
    added: ['kept'],
    missing: [],
  })
})

test('missing text is undecidable and never counted', () => {
  const residue = residueFor({ diff: '+held' })
  assert.deepEqual(residue, { status: 'UNDECIDABLE', added: [], missing: [] })
  assert.deepEqual(formatHeldResidue({ kind: 'LANE-ONLY', path: 'gone.ts' }, residue), [
    '    HELD LANE-ONLY  gone.ts  (UNDECIDABLE)',
  ])
})

test('a lane-only new file reports every added line absent from main', () => {
  const calls = []
  const runGit = (args, opts) => {
    calls.push({ args, opts })
    if (args[0] === 'diff' && args[1].includes(':')) throw new Error('absent at base')
    if (args[0] === 'cat-file') return ''
    if (args[0] === 'diff') return 'diff --git a/new.ts b/new.ts\nnew file mode 100644\n--- /dev/null\n+++ b/new.ts\n+first\n+\n+second'
    throw new Error('absent in main')
  }
  const residue = residueForHeld({ base: 'base', branch: 'lane' }, { path: 'new.ts' }, runGit)
  assert.deepEqual(residue, {
    status: 'NOT_ABSORBED',
    added: ['first', 'second'],
    missing: ['first', 'second'],
    wholeLineMissing: ['first', 'second'],
  })
  assert.deepEqual(formatHeldResidue({ kind: 'LANE-ONLY', path: 'new.ts' }, residue), [
    '    HELD LANE-ONLY  new.ts  (2 of 2 added lines absent from main)',
    '      "first"',
    '      "second"',
  ])
  assert.ok(calls.every(({ opts }) => opts.stdio[2] === 'ignore'))
})

test('a lane-only new binary file remains binary and uncounted', () => {
  const runGit = (args) => {
    if (args[0] === 'diff' && args[1].includes(':')) throw new Error('absent at base')
    if (args[0] === 'cat-file') return ''
    if (args[0] === 'diff') return 'Binary files /dev/null and b/new.png differ'
    throw new Error('absent in main')
  }
  const residue = residueForHeld({ base: 'base', branch: 'lane' }, { path: 'new.png' }, runGit)
  assert.deepEqual(residue, { status: 'BINARY', added: [], missing: [] })
  assert.deepEqual(formatHeldResidue({ kind: 'LANE-ONLY', path: 'new.png' }, residue), [
    '    HELD LANE-ONLY  new.png  (BINARY)',
  ])
})

test('an unreadable lane-tip path remains undecidable', () => {
  const runGit = (args) => {
    if (args[0] === 'diff') throw new Error('path absent')
    throw new Error('absent at lane tip')
  }
  assert.deepEqual(
    residueForHeld({ base: 'base', branch: 'lane' }, { path: 'deleted.ts' }, runGit),
    { status: 'UNDECIDABLE', added: [], missing: [] },
  )
})

test('zero residue remains HELD rather than changing the verdict', () => {
  const lines = formatHeldResidue(
    { kind: 'BOTH-MOVED', path: 'absorbed.ts' },
    residueFor({ diff: '+already here', mainText: 'already here' }),
  )
  assert.match(lines[0], /^    HELD BOTH-MOVED/)
  assert.match(lines[0], /\(0 of 1 added lines absent from main\)$/)
})

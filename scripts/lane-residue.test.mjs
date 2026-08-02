import assert from 'node:assert/strict'
import { test } from 'node:test'
import { formatHeldResidue } from './lane-usable.mjs'
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

test('zero residue remains HELD rather than changing the verdict', () => {
  const lines = formatHeldResidue(
    { kind: 'BOTH-MOVED', path: 'absorbed.ts' },
    residueFor({ diff: '+already here', mainText: 'already here' }),
  )
  assert.match(lines[0], /^    HELD BOTH-MOVED/)
  assert.match(lines[0], /\(0 of 1 added lines absent from main\)$/)
})

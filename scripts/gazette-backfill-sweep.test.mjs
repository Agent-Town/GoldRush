import assert from 'node:assert/strict'
import test from 'node:test'
import { classifyCitation, normalizeSince } from './gazette-backfill-sweep.mjs'

const hash = '12345678abcdef12345678abcdef12345678abcd'

test('classifies citation purpose with paragraph scope', () => {
  assert.equal(classifyCitation(hash, 'no citation here'), 'candidate')
  assert.equal(classifyCitation(hash, `reported ${hash.slice(0, 8)}`), 'reported')
  assert.equal(classifyCitation(hash, `NOT PLAYER-VISIBLE ${hash.slice(0, 8)}`), 'dismissed')
  assert.equal(classifyCitation(hash, `NOT PLAYER-VISIBLE because this is factory work\ncontinued at ${hash.slice(0, 8)}`), 'dismissed')
})

test('date-only sweep windows start at midnight instead of the current clock time', () => {
  assert.equal(normalizeSince('2026-08-05'), '2026-08-05T00:00:00')
  assert.equal(normalizeSince('2026-08-05T06:30:00+07:00'), '2026-08-05T06:30:00+07:00')
})

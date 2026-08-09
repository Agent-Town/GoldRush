import assert from 'node:assert/strict'
import test from 'node:test'
import { classifyCitation } from './gazette-backfill-sweep.mjs'

const hash = '12345678abcdef12345678abcdef12345678abcd'

test('classifies citation purpose with paragraph scope', () => {
  assert.equal(classifyCitation(hash, 'no citation here'), 'candidate')
  assert.equal(classifyCitation(hash, `reported ${hash.slice(0, 8)}`), 'reported')
  assert.equal(classifyCitation(hash, `NOT PLAYER-VISIBLE ${hash.slice(0, 8)}`), 'dismissed')
  assert.equal(classifyCitation(hash, `NOT PLAYER-VISIBLE because this is factory work\ncontinued at ${hash.slice(0, 8)}`), 'dismissed')
})

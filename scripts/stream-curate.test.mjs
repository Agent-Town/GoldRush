import assert from 'node:assert/strict';
import test from 'node:test';

import { buildProgram, INTERLEAVE, LOOP_RANGE_SECONDS, summarize } from './stream-curate.mjs';

const classes = [
  ['era-art-card', 15],
  ['finished-game-footage', 22.5],
  ['era-art-reel', 22.5],
  ['ceremony-recording', 9],
];
const fixture = classes.flatMap(([className, duration]) => Array.from({ length: 8 }, (_, index) => ({
  file: `${className}-${index}`,
  title: `${className} ${index}`,
  class: className,
  duration,
  freshness: index,
})));

test('curation is deterministic, interleaved, and within duration mix bounds', () => {
  const first = buildProgram(fixture, '2026-07-14');
  const second = buildProgram(fixture, '2026-07-14');
  assert.deepEqual(first, second);
  assert.notDeepEqual(first, buildProgram(fixture, '2026-07-15'));

  const { total, percentages } = summarize(first);
  assert.ok(total >= LOOP_RANGE_SECONDS[0] && total <= LOOP_RANGE_SECONDS[1]);
  assert.ok(percentages['finished-game-footage'] >= 0.45 && percentages['finished-game-footage'] <= 0.55);
  assert.ok(percentages['era-art-reel'] >= 0.20 && percentages['era-art-reel'] <= 0.30);
  assert.ok(percentages['era-art-card'] >= 0.12 && percentages['era-art-card'] <= 0.20);
  assert.ok(percentages['ceremony-recording'] >= 0.07 && percentages['ceremony-recording'] <= 0.13);
  assert.deepEqual(first.slice(0, INTERLEAVE.length).map((item) => item.class), INTERLEAVE);
  assert.ok(first.every((item, index) => index === 0 || item.class !== first[index - 1].class));
  for (const [className] of classes) {
    assert.equal(new Set(first.filter((item) => item.class === className).map((item) => item.file)).size, 7);
  }
});

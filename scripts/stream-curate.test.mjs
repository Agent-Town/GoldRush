import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { BANNED_FILES, buildProgram, discoverPool, INTERLEAVE } from './stream-curate.mjs';

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

test('curation is deterministic, interleaved, and never repeats thin-pool items', () => {
  const logs = [];
  const first = buildProgram(fixture, '2026-07-14', (line) => logs.push(line));
  const second = buildProgram(fixture, '2026-07-14', () => {});
  assert.deepEqual(first, second);
  assert.notDeepEqual(first, buildProgram(fixture, '2026-07-15', () => {}));

  assert.deepEqual(first.slice(0, INTERLEAVE.length).map((item) => item.class), INTERLEAVE);
  assert.ok(first.every((item, index) => index === 0 || item.class !== first[index - 1].class));
  assert.equal(new Set(first.map((item) => item.file)).size, first.length);
  assert.match(logs.at(-1), /^SHORT program: /);
});

test('intake rejects headless captures and explicit banned files', () => {
  const root = mkdtempSync(join(tmpdir(), 'stream-curate-'));
  try {
    for (const dir of ['marketing/raw/stream', 'marketing/raw/gen', 'assets/raw', 'artifacts/stream-capture']) {
      mkdirSync(join(root, dir), { recursive: true });
    }
    writeFileSync(join(root, 'marketing/raw/stream/claim-2026-07-10.webm'), 'banned before ffprobe');
    for (const file of BANNED_FILES) writeFileSync(join(root, file), 'banned before ffprobe');
    writeFileSync(join(root, 'assets/raw/kit-era-1.png'), 'approved still');

    const logs = [];
    const pool = discoverPool(root, (line) => logs.push(line));
    assert.deepEqual(pool.map((item) => item.file), ['assets/raw/kit-era-1.png']);
    assert.equal(logs.filter((line) => line.includes('(banned stream content)')).length, BANNED_FILES.size + 1);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

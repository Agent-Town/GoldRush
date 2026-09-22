import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { coverage, EVIDENCE, magentaMask, MAPS, sourceHash, unionArea } from './phone-hud-entry-census.mjs';

test('HUD census unions overlapping clipped rectangles without counting them twice', () => {
  assert.equal(unionArea([{ x: -5, y: -5, width: 15, height: 15 }, { x: 5, y: 5, width: 20, height: 20 }], 20, 20), 300);
  assert.equal(unionArea([{ x: 30, y: 30, width: 5, height: 5 }], 20, 20), 0);
});

test('the campaign mask counts coverage and distinguishes offscreen bodies', () => {
  const png = new PNG({ width: 2, height: 1 });
  png.data.set([255, 0, 255, 255, 245, 230, 200, 255]);
  const mask = magentaMask(PNG.sync.write(png));
  assert.deepEqual([...mask.mask], [1, 0]);
  assert.equal(coverage({ mask: new Uint8Array([1, 1]) }, mask).persistentHudCoveragePercent, 50);
  assert.equal(coverage({ mask: new Uint8Array([0, 0]) }, mask).persistentHudCoveragePercent, null);
});

test('baseline census is complete and pins persistent union at each viewport', () => {
  const before = JSON.parse(readFileSync(`${EVIDENCE}/before.json`, 'utf8'));
  assert.equal(before.sourceHash, sourceHash(), 'UI changed: capture and gate the after census before accepting the layout');
  assert.equal(before.rows.length, MAPS.length * 2);
  for (const map of MAPS) for (const width of [390, 1280]) {
    const row = before.rows.find(r => r.map === map && r.width === width);
    assert.ok(row, `${map} ${width} absent`);
    assert.deepEqual(row.errors, []);
    assert.equal(row.testHook, 'undefined');
    assert.ok(row.unionPercent > 0 && row.unionPercent <= (width === 390 ? 30 : 18), `${map} ${width} union ${row.unionPercent}`);
  }
});

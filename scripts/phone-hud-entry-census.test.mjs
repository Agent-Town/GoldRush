import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { coverage, ENTRY_BODIES, EVIDENCE, magentaMask, MAPS, sourceHash, unionArea } from './phone-hud-entry-census.mjs';

// Retain the six run-8 ceilings; pin the four additions from the run-10 census.
// Painted unions are rounded up by at most 0.05 percentage points for raster edges.
// Updating a capture does not update its budget.
const PHONE_UNION_CEILINGS = {
  'e8-low-orbit': 13.45, 'e9-seed-run': 12.15, 'e10-archive-world': 14.60,
  'e7-dead-band': 14.25, 'e7-relay-rush': 13.85, 'e6-glow-mesa': 11.30,
  'e1-night-shift': 11.30, 'e1-twin-banks': 11.30, 'e1-baron': 11.30, 'e2-trestle': 13.35,
};
const DESKTOP_UNION_CEILINGS = {
  'e8-low-orbit': 15.95, 'e9-seed-run': 14.68, 'e10-archive-world': 15.63,
  'e7-dead-band': 15.82, 'e7-relay-rush': 15.82, 'e6-glow-mesa': 13.97,
  'e1-night-shift': 13.97, 'e1-twin-banks': 13.97, 'e1-baron': 13.97, 'e2-trestle': 15.20,
};

test('HUD census unions overlapping clipped rectangles without counting them twice', () => {
  assert.equal(unionArea([{ x: -5, y: -5, width: 15, height: 15 }, { x: 5, y: 5, width: 20, height: 20 }], 20, 20), 300);
  assert.equal(unionArea([{ x: 30, y: 30, width: 5, height: 5 }], 20, 20), 0);
});

test('the campaign mask counts coverage and distinguishes offscreen bodies', () => {
  const png = new PNG({ width: 2, height: 1 });
  png.data.set([255, 0, 255, 255, 245, 230, 200, 255]);
  const mask = magentaMask(PNG.sync.write(png));
  assert.deepEqual([...mask.mask], [1, 0]);
  assert.equal(coverage({ width: 2, height: 1, mask: new Uint8Array([1, 1]) }, mask).persistentHudCoveragePercent, 50);
  assert.equal(coverage({ width: 2, height: 1, mask: new Uint8Array([0, 0]) }, mask).persistentHudCoveragePercent, null);
  assert.throws(() => coverage({ ...mask, width: 1, height: 2 }, mask), /strictly equal/);
});

test('current census pins persistent union, entry coverage and unchanged desktop boxes', () => {
  assert.deepEqual([...MAPS].sort(), Object.keys(PHONE_UNION_CEILINGS).sort(), 'census map omitted or unbudgeted');
  assert.deepEqual([...MAPS].sort(), Object.keys(DESKTOP_UNION_CEILINGS).sort());
  // The original reduction is still measured against the pre-cure run-8 baseline.
  const original = JSON.parse(readFileSync('artifacts/sol/map-art-campaign-2/run-8/phone-hud/before.json', 'utf8'));
  const previous = JSON.parse(readFileSync('artifacts/sol/map-art-campaign-2/run-8/phone-hud/after.json', 'utf8'));
  const before = JSON.parse(readFileSync(`${EVIDENCE}/before.json`, 'utf8'));
  const after = JSON.parse(readFileSync(`${EVIDENCE}/after.json`, 'utf8'));
  assert.equal(after.sourceHash, sourceHash(), 'UI changed: rerun node scripts/phone-hud-entry-census.mjs after; do not raise the budgets');
  assert.equal(before.rows.length, MAPS.length * 2);
  assert.equal(after.rows.length, MAPS.length * 2);
  for (const map of MAPS) for (const width of [390, 1280]) {
    const base = before.rows.find(r => r.map === map && r.width === width);
    const row = after.rows.find(r => r.map === map && r.width === width);
    assert.ok(row, `${map} ${width} absent`);
    assert.equal(row.height, width === 390 ? 844 : 800);
    assert.deepEqual(row.landmarks.map(l => l.focus), base.landmarks.map(l => l.focus), `${map}: entry bodies omitted`);
    if (ENTRY_BODIES[map]) assert.deepEqual(row.landmarks.map(l => l.focus), ENTRY_BODIES[map]);
    assert.deepEqual(base.errors, []);
    assert.deepEqual(row.errors, []);
    assert.equal(row.testHook, 'undefined');
    const first = original.rows.find(r => r.map === map && r.width === width);
    const budget = width === 390
      ? Math.min(PHONE_UNION_CEILINGS[map], first ? first.unionPercent * 2 / 3 : base.unionPercent + .05)
      : Math.min(DESKTOP_UNION_CEILINGS[map], base.unionPercent + .1);
    assert.ok(row.unionPercent > 0 && row.unionPercent <= budget, `${map} ${width} union ${row.unionPercent} exceeds ${budget}`);
    if (first) {
      const prior = previous.rows.find(r => r.map === map && r.width === width);
      assert.equal(row.unionPercent, prior.unionPercent, `${map} ${width}: original six-map union changed`);
      assert.deepEqual(row.panels.map(p => [p.id, p.box]), base.panels.map(p => [p.id, p.box]), `${map}: original six-map layout moved`);
    }
    const prefix = `${EVIDENCE}/${map}/after-${width}`;
    const union = magentaMask(readFileSync(`${prefix}-union-mask.png`));
    assert.equal(union.width, width); assert.equal(union.height, row.height);
    assert.equal(row.unionPercent, (union.mask.length - union.mask.reduce((a, b) => a + b, 0)) * 100 / union.mask.length);
    assert.equal(row.rectangleUnionPercent, unionArea(row.panels.map(p => p.box), width, row.height) * 100 / (width * row.height));
    for (const landmark of row.landmarks) {
      const measured = coverage(magentaMask(readFileSync(`${prefix}-${landmark.focus}-body-mask.png`)), magentaMask(readFileSync(`${prefix}-${landmark.focus}-persistent-mask.png`)));
      assert.deepEqual(measured, { bodyPixels: landmark.bodyPixels, coveredPixels: landmark.coveredPixels, persistentHudCoveragePercent: landmark.persistentHudCoveragePercent });
      const original = base.landmarks.find(l => l.focus === landmark.focus);
      assert.ok(original);
      if (landmark.bodyPixels === 0) {
        assert.equal(original.bodyPixels, 0, `${map} ${landmark.focus} disappeared instead of being cleared`);
        assert.equal(landmark.persistentHudCoveragePercent, null);
      } else if (width === 390) {
        assert.ok(landmark.persistentHudCoveragePercent <= 10, `${map} ${landmark.focus} entry covered ${landmark.persistentHudCoveragePercent}%`);
      }
    }
    if (width === 1280) {
      assert.deepEqual(row.panels.map(p => [p.id, p.box]), base.panels.map(p => [p.id, p.box]), `${map}: desktop layout moved`);
    }
  }
});

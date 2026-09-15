import assert from 'node:assert/strict';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { PNG } from 'pngjs';
// Exercise the actual filter while leaving the extractor's CLI boot out of the test.
const source = fs.readFileSync(new URL('./extract-alpha.mjs', import.meta.url), 'utf8');
const sampleRgba = new Function(source.slice(source.indexOf('function sampleRgba('), source.indexOf('\nlet KEY =')) + '; return sampleRgba;')();

const sample = (pixels, weights = [.25, .25, .25, .25]) => {
  const output = new Uint8Array(4);
  sampleRgba(pixels.flat(), [0, 4, 8, 12], weights, output, 0);
  return [...output];
};
const gold = [180, 120, 40, 255];
const key = [255, 0, 255, 0];
assert.deepEqual(sample([gold, key, key, key]), [180, 120, 40, 64], 'transparent key must not tint the silhouette');
assert.deepEqual(sample([[200, 0, 0, 192], [0, 0, 200, 64], key, key]), [150, 0, 50, 64], 'semi-transparent colours must be weighted by coverage');
assert.deepEqual(sample([gold, gold, gold, gold]), gold, 'opaque art must stay unchanged');
assert.deepEqual(sample([[12, 24, 36, 0], [12, 24, 36, 0], [12, 24, 36, 0], [12, 24, 36, 0]]), [12, 24, 36, 0], 'keep hidden RGB edge extension');
// Factory controls relocate the extractor. Exercise that actual CLI path too.
// F-TCR-5 (attended 2026-09-15): the control directory lives under tmpdir() in the one form the fixture sweep
// (scripts/fixture-teardown.test.mjs) can read, mkdtemp(join(tmpdir(), '…')); it used to be created inside scripts/
// itself, invisible to the sweep and a stray `.rgba-control-*` directory in the repo whenever a run died early.
const directory = fs.mkdtempSync(join(tmpdir(), 'rgba-control-'));
// The control copy of extract-alpha.mjs imports pngjs; under tmpdir() nothing resolves it, so the directory gets a
// link to the repo's node_modules (removed with the directory by the rmSync below).
fs.symlinkSync(path.resolve('node_modules'), path.join(directory, 'node_modules'), 'dir');
try {
  const script = path.join(directory, 'extract-control.mjs');
  fs.writeFileSync(script, source);
  const input = new PNG({ width: 2, height: 2 });
  input.data.set([gold, key, key, key].flat());
  const file = path.join(directory, 'sample.png');
  fs.writeFileSync(file, PNG.sync.write(input));
  execFileSync(process.execPath, [script, '--full-bleed', '--size', '1', '--out', path.join(directory, 'out'), file]);
  assert.deepEqual([...PNG.sync.read(fs.readFileSync(path.join(directory, 'out/sample.png'))).data], [180, 120, 40, 64]);
} finally {
  fs.rmSync(directory, { recursive: true, force: true });
}
console.log('RGBA resampling: key rejection, partial alpha, opaque art, edge extension, and relocated CLI passed');

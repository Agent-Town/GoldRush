import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'grid-centres-'));
try {
  fs.mkdirSync(path.join(dir, 'assets/raw'), { recursive: true });
  fs.symlinkSync(path.join(root, 'scripts'), path.join(dir, 'scripts'));
  const sheet = new PNG({ width: 64, height: 32 });
  for (let i = 0; i < sheet.data.length; i += 4) sheet.data.set([255, 0, 255, 255], i);
  // A fixed body and a boom that rises; the second source is also shifted right.
  for (const [col, dx, top] of [[0, 0, 12], [1, 3, 4]]) {
    for (let y = top; y < 24; y++) for (let x = 10 + dx; x < 18 + dx; x++) {
      sheet.data.set(y >= 18 ? [40, 150, 180, 255] : [140, 100, 50, 255], ((y * 64 + col * 32 + x) * 4));
    }
  }
  fs.writeFileSync(path.join(dir, 'assets/raw/rig.png'), PNG.sync.write(sheet));
  const centres = [[16, 16], [19, 16]];
  const args = ['scripts/extract-alpha.mjs', '--key', 'ff00ff', '--grid', '2x1', '--cell', '32', '--scale', '1', '--grid-centres', JSON.stringify(centres), 'assets/raw/rig.png'];
  execFileSync(process.execPath, args, { cwd: dir });
  const proc = path.join(dir, 'assets/processed');
  const frames = [0, 1].map(c => PNG.sync.read(fs.readFileSync(path.join(proc, `rig-r0c${c}.png`))));
  for (let y = 18; y < 24; y++) for (let x = 10; x < 18; x++) {
    const i = (y * 32 + x) * 4;
    assert.deepEqual([...frames[0].data.subarray(i, i + 4)], [40, 150, 180, 255]);
    assert.deepEqual([...frames[1].data.subarray(i, i + 4)], [40, 150, 180, 255]);
  }
  assert.equal(frames[0].data[(5 * 32 + 12) * 4 + 3], 0);
  assert.equal(frames[1].data[(5 * 32 + 12) * 4 + 3], 255, 'boom rise survives stable chassis alignment');
  const before = new Map(fs.readdirSync(proc).map(f => [f, fs.readFileSync(path.join(proc, f))]));
  execFileSync(process.execPath, ['scripts/anim-pass-reextract.mjs', 'rig'], { cwd: dir });
  for (const [f, bytes] of before) assert.deepEqual(fs.readFileSync(path.join(proc, f)), bytes);
  for (const invalid of ['null', '[]', '[[16,16]]', '[[16,16],[32,16]]', '[[16,16],[0,0]]', '[[16,16],[19,"16"]]']) {
    const bad = [...args]; bad[bad.indexOf('--grid-centres') + 1] = invalid;
    assert.notEqual(spawnSync(process.execPath, bad, { cwd: dir }).status, 0, invalid);
    for (const [f, bytes] of before) assert.deepEqual(fs.readFileSync(path.join(proc, f)), bytes, 'invalid or clipping centres must not overwrite outputs');
  }
  assert.notEqual(spawnSync(process.execPath, [...args, '--grid-origin'], { cwd: dir }).status, 0);
  assert.notEqual(spawnSync(process.execPath, ['scripts/anim-pass-reextract.mjs', '--like', 'rig', 'other'], { cwd: dir }).status, 0);
  console.log('Measured centres retain chassis and boom motion; roundtrip exact; invalid/clipping centres and cross-sheet reuse rejected.');
} finally { fs.rmSync(dir, { recursive: true, force: true }); }

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { PNG } from 'pngjs';
import { fileURLToPath } from 'node:url';

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'goldrush-grid-origin-'));
const extractor = fileURLToPath(new URL('./extract-alpha.mjs', import.meta.url));
try {
  const sheet = new PNG({ width: 64, height: 32 });
  for (let i = 0; i < sheet.data.length; i += 4) sheet.data.set([255, 0, 255, 255], i);
  // The same opaque object rises by 12px within its second cell.
  for (const [col, top] of [[0, 18], [1, 6]]) {
    for (let y = top; y < top + 8; y++) for (let x = 8; x < 16; x++) {
      sheet.data.set([140, 100, 50, 255], ((y * 64 + col * 32 + x) * 4));
    }
  }
  const file = path.join(dir, 'hop.png');
  fs.writeFileSync(file, PNG.sync.write(sheet));
  const box = png => {
    let x0 = png.width, y0 = png.height, x1 = -1, y1 = -1;
    for (let y = 0; y < png.height; y++) for (let x = 0; x < png.width; x++) {
      if (png.data[(y * png.width + x) * 4 + 3] <= 8) continue;
      x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
    }
    assert.ok(x1 >= x0, 'non-empty output');
    return [x0, y0, x1, y1];
  };
  for (const size of [32, 16]) {
    for (const fixed of [false, true]) {
      const out = path.join(dir, `${size}-${fixed}`);
      execFileSync(process.execPath, [extractor, '--key', 'ff00ff', '--grid', '2x1', '--cell', String(size), ...(fixed ? ['--grid-origin'] : []), '--out', out, file]);
      const frames = [0, 1].map(col => PNG.sync.read(fs.readFileSync(path.join(out, `hop-r0c${col}.png`))));
      const [a, b] = frames.map(box);
      const meta = JSON.parse(fs.readFileSync(path.join(out, 'hop.frames.json')));
      assert.equal(meta.origin, fixed ? 'grid' : undefined);
      assert.equal(a[0], b[0]);
      assert.ok(Math.abs((a[1] - b[1]) - (fixed ? 12 * meta.scale : 0)) <= 1, 'authored rise survives only with fixed grid origin');
      assert.ok(Math.abs((a[3] - a[1]) - (b[3] - b[1])) <= 1, 'rigid body height survives');
      for (const f of frames) assert.equal(f.data[3], 0, 'transparent margin');
    }
  }
  const invalid = spawnSync(process.execPath, [extractor, '--grid-origin', '--out', path.join(dir, 'invalid'), file]);
  assert.notEqual(invalid.status, 0, 'grid origin without grid must fail');
  assert.match(invalid.stderr.toString(), /requires keyed --grid/);
  console.log('Grid origin: authored 12px hop retained at native/downscaled sizes; default centring and invalid-mode guard pass');
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}

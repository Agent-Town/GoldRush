import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'goldrush-inspection-grid-'));
const run = (script, args) => execFileSync(process.execPath, [fileURLToPath(new URL(script, import.meta.url)), ...args], { cwd: dir });
try {
  fs.mkdirSync(path.join(dir, 'assets/raw'), { recursive: true });
  for (const remainder of [0, 1]) {
    const stem = `grid-${remainder}`, sheet = new PNG({ width: 36 + remainder, height: 32 + remainder });
    const put = (x, y, rgb) => sheet.data.set([...rgb, 255], (y * sheet.width + x) * 4);
    for (let y = 0; y < sheet.height; y++) for (let x = 0; x < sheet.width; x++) put(x, y, [255, 0, 255]);
    for (let row = 0; row < 2; row++) for (let col = 0; col < 2; col++) {
      // Four identical figures, with single pixels on the actual cell cuts.
      // A rounded proportional grid misassigns those pixels to the previous cell.
      put(col * 18, row * 16 + 1, [70, 40, 20]);
      put(col * 18 + 1, row * 16, [70, 40, 20]);
      for (let y = 3; y < 11; y++) for (let x = 3; x < 11; x++) put(col * 18 + x, row * 16 + y, [70 + x * 7, 40 + y * 8, 20]);
    }
    if (remainder) put(36, 32, [20, 40, 60]); // Outside every shipped cell.
    const raw = `assets/raw/${stem}.png`;
    fs.writeFileSync(path.join(dir, raw), PNG.sync.write(sheet));
    run('./extract-alpha.mjs', ['--key', 'ff00ff', '--grid', '2x2', '--cell', '32', '--scale', '1', raw]);
    run('./anim-pass-inspect.mjs', [stem]);
    const dataDir = path.join(dir, 'reviews/anim-pass-2026-07-25/data');
    const measured = JSON.parse(fs.readFileSync(path.join(dataDir, `${stem}.json`)));
    const extracted = JSON.parse(fs.readFileSync(path.join(dir, `assets/processed/${stem}.frames.json`)));
    assert.deepEqual(measured.cells.map(c => c.bbox), extracted.cells.map(c => c.bbox));
    assert.ok(measured.cells.every(c => c.cellW === 18 && c.cellH === 16));
    assert.equal(measured.divisible.unusedRight, remainder);
    assert.equal(measured.divisible.unusedBottom, remainder);
    assert.deepEqual(measured.boundaries.vertical.map(b => [b.at, b.bleedPx]), [[18, 2]]);
    assert.deepEqual(measured.boundaries.horizontal.map(b => [b.at, b.bleedPx]), [[16, 2]]);
    const proveConsumers = () => {
      run('./anim-pass-dupecheck.mjs', [stem]);
      const proof = JSON.parse(fs.readFileSync(path.join(dataDir, '_dupecheck.json'))).find(s => s.stem === stem);
      assert.equal(proof.results.length, 6);
      assert.ok(proof.results.every(r => r.mad === 0 && r.verdict === 'IDENTICAL'));
      run('./anim-pass-heads.mjs', ['--out', `${stem}.png`, '--tile', '32', '--cols', '4', '--band', '1', ...['0,0', '0,1', '1,0', '1,1'].map(c => `${stem}:${c}`)]);
      const heads = PNG.sync.read(fs.readFileSync(path.join(dir, `reviews/anim-pass-2026-07-25/crops/${stem}.png`)));
      const tile = col => Array.from({ length: 32 }, (_, y) => heads.data.subarray(((4 + y) * heads.width + 4 + col * 36) * 4, ((4 + y) * heads.width + 36 + col * 36) * 4)).map(b => b.toString('hex'));
      for (let col = 1; col < 4; col++) assert.deepEqual(tile(col), tile(0));
    };
    proveConsumers();
    if (remainder) {
      // Historical reports measured rounded proportional cells. Keep an actual
      // old-format cache readable without regenerating or rewriting its evidence.
      for (let row = 0; row < 2; row++) for (let col = 0; col < 2; col++) {
        put(col * 18, row * 16 + 1, [255, 0, 255]);
        put(col * 18 + 1, row * 16, [255, 0, 255]);
      }
      put(36, 32, [255, 0, 255]);
      fs.writeFileSync(path.join(dir, raw), PNG.sync.write(sheet));
      measured.divisible = { cellW: 18.5, cellH: 16.5 };
      measured.cells.forEach(c => Object.assign(c, { bbox: [3 - c.col, 3 - c.row, 10 - c.col, 10 - c.row], w: 8, h: 8 }));
      for (const hasDimensions of [true, false]) {
        if (!hasDimensions) delete measured.divisible;
        fs.writeFileSync(path.join(dataDir, `${stem}.json`), JSON.stringify(measured));
        proveConsumers();
      }
    }
  }
  console.log('Factory grid: inspection matches extraction; duplicate proof/head crops pass divisible, remainder-bearing and historical cached grids.');
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gold-rush-graft-'));
const script = fileURLToPath(new URL('./anim-pass-graft.mjs', import.meta.url));
const sheet = (cols, rows, empty = -1, outlier = false) => {
  const png = new PNG({ width: cols * 20, height: rows * 20 });
  for (let y = 0; y < png.height; y++) for (let x = 0; x < png.width; x++) {
    const cell = Math.floor(y / 20) * cols + Math.floor(x / 20);
    const content = cell !== empty && x % 20 >= 6 && x % 20 < 14 && y % 20 >= 4 && y % 20 < 16;
    png.data.set(content ? [80 + cell * 8, 60, 30, 255] : [255, 0, 255, 255], (y * png.width + x) * 4);
  }
  if (outlier) png.data.set([255, 32, 255, 255], 0);
  return PNG.sync.write(png);
};
try {
  fs.mkdirSync(path.join(dir, 'assets/raw'), { recursive: true });
  const target = path.join(dir, 'assets/raw/target.png'), original = sheet(4, 2);
  fs.writeFileSync(target, original);
  const run = (grid, empty = -1, extra = [], targetRow = '1', outlier = false) => {
    const [cols, rows] = grid.split('x').map(Number);
    fs.writeFileSync(path.join(dir, 'source.png'), sheet(cols, rows, empty, outlier));
    return spawnSync(process.execPath, [script, '--sheet', 'target', '--grid', '4x2', '--row', targetRow, '--match-row', '0', '--src', 'source.png', '--src-grid', grid, ...extra], { cwd: dir, encoding: 'utf8' });
  };
  // Too few/many cells and an empty middle cell must not erase or shift a row.
  for (const [grid, empty] of [['3x1', -1], ['5x1', -1], ['4x1', 1], ['5x1', 1]]) {
    const result = run(grid, empty);
    assert.notEqual(result.status, 0, `${grid}/${empty}: invalid source accepted`);
    assert.match(result.stderr, /Expected exactly 4 non-empty source cells/);
    assert.deepEqual(fs.readFileSync(target), original, 'failed graft changed the target');
  }
  // Existing flattening of a valid 2x2 source into four columns still works.
  const result = run('2x2');
  assert.equal(result.status, 0, result.stderr);
  const before = PNG.sync.read(original), after = PNG.sync.read(fs.readFileSync(target));
  assert.deepEqual([after.width, after.height], [before.width, before.height]);
  assert.deepEqual(after.data.subarray(0, 20 * 80 * 4), before.data.subarray(0, 20 * 80 * 4));
  for (let c = 0; c < 4; c++) {
    const i = (30 * 80 + c * 20 + 10) * 4;
    assert.deepEqual([...after.data.subarray(i, i + 4)], [80 + c * 8, 60, 30, 255]);
  }
  fs.writeFileSync(target, original);
  for (const col of ['-1', '4', '1.5', 'bad', '', ' ']) {
    assert.notEqual(run('1x1', -1, ['--col', col]).status, 0);
    assert.deepEqual(fs.readFileSync(target), original, 'invalid column changed target');
  }
  assert.notEqual(run('1x1', -1, ['--col']).status, 0);
  assert.deepEqual(fs.readFileSync(target), original, 'missing column changed target');
  for (const tol of ['-1', '256', '1.5', 'bad', '', ' ']) {
    assert.notEqual(run('1x1', -1, ['--col', '2', '--tol', tol]).status, 0);
    assert.deepEqual(fs.readFileSync(target), original, 'invalid tolerance changed target');
  }
  assert.notEqual(run('1x1', -1, ['--col', '2', '--tol']).status, 0);
  assert.deepEqual(fs.readFileSync(target), original, 'missing tolerance changed target');
  for (const row of ['-1', '2', 'bad']) {
    assert.notEqual(run('1x1', -1, ['--col', '2'], row).status, 0);
    assert.deepEqual(fs.readFileSync(target), original, 'invalid row changed target');
  }
  for (const [grid, empty] of [['2x1', -1], ['1x1', 0]]) {
    const failed = run(grid, empty, ['--col', '2']);
    assert.notEqual(failed.status, 0);
    assert.match(failed.stderr, /Expected exactly 1 non-empty source cells/);
    assert.deepEqual(fs.readFileSync(target), original, 'invalid cell donor changed target');
  }
  assert.equal(run('1x1', -1, ['--col', '2', '--dry']).status, 0);
  assert.deepEqual(fs.readFileSync(target), original, 'dry graft changed target');
  const single = run('1x1', -1, ['--col', '2']);
  assert.equal(single.status, 0, single.stderr);
  const grafted = PNG.sync.read(fs.readFileSync(target));
  assert.deepEqual([grafted.width, grafted.height], [before.width, before.height]);
  for (let y = 0; y < 40; y++) for (let x = 0; x < 80; x++) {
    if (y >= 20 && x >= 40 && x < 60) continue;
    const i = (y * 80 + x) * 4;
    assert.deepEqual(grafted.data.subarray(i, i + 4), before.data.subarray(i, i + 4), `neighbor ${x},${y}`);
  }
  assert.deepEqual([...grafted.data.subarray((30 * 80 + 50) * 4, (30 * 80 + 50) * 4 + 4)], [80, 60, 30, 255]);
  // A measured key tolerance can ignore a background outlier without resizing art.
  fs.writeFileSync(target, original);
  const tolerant = run('1x1', -1, ['--col', '2', '--tol', '35'], '1', true);
  assert.equal(tolerant.status, 0, tolerant.stderr);
  assert.deepEqual(PNG.sync.read(fs.readFileSync(target)).data, grafted.data, 'background outlier changed the graft geometry or neighbors');
  console.log('Graft: row and single-cell sources validated; invalid/dry calls preserve target; all seven neighboring cells preserved.');
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'sprite-montage-'));
const script = fileURLToPath(new URL('./anim-pass-montage.mjs', import.meta.url));
try {
  const sources = Array.from({ length: 8 }, (_, i) => {
    const png = new PNG({ width: 4, height: 4 });
    for (let p = 0; p < png.data.length; p += 4) png.data.set([i * 30, p, 200, 255], p);
    const file = path.join(cwd, `${i}.png`);
    fs.writeFileSync(file, PNG.sync.write(png));
    return { png, spec: `${file}:1x1:0,0` };
  });
  const run = (extra) => spawnSync(process.execPath, [script, '--out', 'test.png', '--h', '4', '--cols', '4', ...extra, ...sources.map(s => s.spec)], { cwd, encoding: 'utf8' });
  const output = path.join(cwd, 'reviews/eight-winds/crops/test.png');
  for (const [args, gap] of [[[], 6], [['--gap', '0'], 0]]) {
    const result = run(args);
    assert.equal(result.status, 0, result.stderr);
    const out = PNG.sync.read(fs.readFileSync(output));
    assert.equal(out.width, 16 + 5 * gap);
    assert.equal(out.height, 8 + 3 * gap);
    sources.forEach(({ png }, i) => {
      for (let y = 0; y < 4; y++) {
        const offset = ((gap + Math.floor(i / 4) * (4 + gap) + y) * out.width + gap + (i % 4) * (4 + gap)) * 4;
        assert.deepEqual(out.data.subarray(offset, offset + 16), png.data.subarray(y * 16, y * 16 + 16));
      }
    });
  }
  const before = fs.readFileSync(output);
  for (const value of ['-1', '1.5', 'bad', '', '9007199254740992']) {
    assert.notEqual(run(['--gap', value]).status, 0);
    assert.deepEqual(fs.readFileSync(output), before);
  }
  const missing = spawnSync(process.execPath, [script, '--gap'], { cwd });
  assert.notEqual(missing.status, 0);
  assert.deepEqual(fs.readFileSync(output), before);
  console.log('Montage default spacing, exact zero-gap cells and invalid-input preservation pass.');
} finally {
  fs.rmSync(cwd, { recursive: true, force: true });
}

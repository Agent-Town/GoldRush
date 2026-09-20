// Evidence repair: derive crops from saved final screenshots, never another rendered frame.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
const output = new URL('after/', import.meta.url);
const old = new URL('after-crops-from-later-frames/', import.meta.url);
await mkdir(old, { recursive: true });
const rectangles = {
  'desktop-carried': { left: 500, top: 40, width: 280, height: 280 },
  'desktop-telegraph': { left: 320, top: 50, width: 280, height: 280 },
  'desktop-flight': { left: 320, top: 50, width: 280, height: 280 },
  'mobile-carried': { left: 55, top: 40, width: 280, height: 280 },
  'mobile-telegraph': { left: 0, top: 50, width: 280, height: 280 },
  'mobile-flight': { left: 0, top: 50, width: 280, height: 280 },
};
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const evidence = {};
for (const [name, rectangle] of Object.entries(rectangles)) {
  const full = new URL(`${name}.png`, output);
  const crop = new URL(`${name}-props.png`, output);
  const source = await readFile(full);
  await rename(crop, new URL(`${name}-props.png`, old));
  await sharp(source).extract(rectangle).toFile(fileURLToPath(crop));
  const expected = await sharp(source).extract(rectangle).raw().toBuffer();
  const actual = await sharp(await readFile(crop)).raw().toBuffer();
  assert.deepEqual(actual, expected, `${name} must match the saved full screenshot pixel-for-pixel`);
  assert.equal(hash(await readFile(full)), hash(source), 'full screenshot bytes stay unchanged');
  evidence[name] = { rectangle, fullSha256: hash(source), cropSha256: hash(await readFile(crop)), exactPixels: true };
}
await writeFile(new URL('crop-integrity.json', output), JSON.stringify(evidence, null, 2));
for (const viewport of ['desktop', 'mobile']) {
  const path = new URL(`${viewport}.json`, output);
  const data = JSON.parse(await readFile(path, 'utf8'));
  data.crops = Object.fromEntries(['carried', 'telegraph', 'flight'].map(state => [state, rectangles[`${viewport}-${state}`]]));
  await writeFile(path, JSON.stringify(data, null, 2));
}
console.log(`Verified ${Object.keys(evidence).length} exact crops; full screenshots unchanged.`);

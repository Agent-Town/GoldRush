// Board tooling for the hill-mine shift. Same contract as scripts/beauty-board.mjs, adapted to this
// shift's flat `<label>/<project>-<shot>.png` capture layout:
//   optimize <label...>          recompress in place at max PNG effort — same pixels, fewer bytes
//   pair <before> <after> <out>  write <project>-<shot>.png = before | after, side by side, halved
// Pixels are never resampled by optimize: a banding artefact has to survive the trip to the review.
import { mkdirSync, readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const ROOT = path.resolve('artifacts/beauty-e2-hill-mine');
/** Halved: keeps composition, colour and the flow fingerprint legible while staying pushable. */
const PAIR_SCALE = 0.42;
const kb = (bytes) => `${Math.round(bytes / 1024)} kB`;

const [command, ...args] = process.argv.slice(2);
if (command === 'optimize') {
  for (const label of args) {
    const dir = path.join(ROOT, label);
    if (!existsSync(dir)) { console.log(`optimize ${label}: nothing captured`); continue; }
    let saved = 0; let total = 0;
    for (const name of readdirSync(dir).filter((file) => file.endsWith('.png'))) {
      const file = path.join(dir, name);
      const before = statSync(file).size;
      const buffer = await sharp(file).png({ compressionLevel: 9, effort: 10 }).toBuffer();
      if (buffer.length < before) writeFileSync(file, buffer);
      saved += Math.max(0, before - buffer.length);
      total += Math.min(before, buffer.length);
    }
    console.log(`optimize ${label}: ${kb(total)} kept, ${kb(saved)} saved`);
  }
} else if (command === 'pair') {
  const [beforeLabel, afterLabel, outDir] = args;
  mkdirSync(outDir, { recursive: true });
  const afterDir = path.join(ROOT, afterLabel);
  for (const name of readdirSync(afterDir).filter((file) => file.endsWith('.png')).sort()) {
    const left = path.join(ROOT, beforeLabel, name);
    const right = path.join(afterDir, name);
    if (!existsSync(left)) { console.log(`  skip ${name}: no ${beforeLabel} side`); continue; }
    const meta = await sharp(left).metadata();
    const width = Math.round(meta.width * PAIR_SCALE);
    const height = Math.round(meta.height * PAIR_SCALE);
    const [a, b] = await Promise.all([
      sharp(left).resize(width, height).toBuffer(),
      sharp(right).resize(width, height).toBuffer(),
    ]);
    const out = path.join(outDir, `${afterLabel}-${name}`);
    await sharp({ create: { width: width * 2 + 8, height, channels: 3, background: '#2e1b0e' } })
      .composite([{ input: a, left: 0, top: 0 }, { input: b, left: width + 8, top: 0 }])
      .png({ compressionLevel: 9, effort: 10 })
      .toFile(out);
    console.log(`  ${out} (${kb(statSync(out).size)})`);
  }
} else {
  console.error('usage: e2-board.mjs optimize <label...> | pair <before> <after> <outDir>');
  process.exit(2);
}

/**
 * F-SSL-3 — the before/after contact board the review never made.
 *
 * `reviews/sprites-split-land.md` held the two prospector coats on a NUMBER (+4-6 px) with no board
 * beside it, and the desk row asks the owner to "Look once; if it reads as the same person, take."
 * This renders main's row 0 above the taken row 0 for each coat, at the cells' own size, on a flat
 * ground, so the two can be read as one picture. Alpha is composited onto a mid grey — a magenta or
 * white ground reads as part of the figure.
 *
 *   node artifacts/rulings-play-2026-09-19/prospector-contact.mjs
 */
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

const SOURCE = '92f6cc115';
const CELL = 192;
const PAD = 8;
const COLS = 8;
const families = ['char-prospector-complainant-sheet-hover8', 'char-prospector-gilded-sheet-hover8'];

for (const family of families) {
  const rows = [];
  for (const [label, ref] of [['main (held)', 'HEAD'], ['taken (regenerated)', SOURCE]]) {
    const cells = [];
    for (let c = 0; c < COLS; c += 1) {
      const file = `assets/processed/${family}-r0c${c}.png`;
      const buf = execFileSync('git', ['show', `${ref}:${file}`], { maxBuffer: 1 << 28 });
      cells.push(await sharp(buf).resize(CELL, CELL, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer());
    }
    rows.push({ label, cells });
  }
  const width = COLS * (CELL + PAD) + PAD;
  const height = rows.length * (CELL + PAD) + PAD;
  const composite = [];
  rows.forEach((row, r) => row.cells.forEach((cell, c) => composite.push({
    input: cell, left: PAD + c * (CELL + PAD), top: PAD + r * (CELL + PAD),
  })));
  await sharp({ create: { width, height, channels: 3, background: { r: 96, g: 96, b: 100 } } })
    .composite(composite).png()
    .toFile(`artifacts/rulings-play-2026-09-19/contact-${family}.png`);
  console.log(`contact-${family}.png  ${width}x${height}  top row = main (held), bottom row = taken`);
}

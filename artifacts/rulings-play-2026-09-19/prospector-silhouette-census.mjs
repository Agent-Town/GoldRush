/**
 * F-SSL-3 — the silhouette delta, measured cell by cell from the BLOBS rather than from a tree.
 *
 * `reviews/sprites-split-land.md` F-SSL-3 held two prospector regenerations for the owner's eye
 * because "the figure grows 220 -> 226 / 224 px". Owner ruling 2026-09-19, verbatim: "I agree with
 * all your recommendations on the decisions - good work" — the recommendation was "Look once; if it
 * reads as the same person, take."
 *
 * This measures the opaque bounding box of every cell on both sides (main's landed bytes vs the
 * source `sol/code-review-20260908` @ 92f6cc115 that split-land was landing FROM) so "take" carries
 * a number rather than an impression. Alpha threshold 16, the same bar
 * `artifacts/sprites-split-land/edge-confinement-census.mjs` uses for a visible pixel.
 *
 *   node artifacts/rulings-play-2026-09-19/prospector-silhouette-census.mjs [<source-ref>]
 */
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

const SOURCE = process.argv[2] ?? '92f6cc115';
const FAMILIES = ['char-prospector-complainant-sheet-hover8', 'char-prospector-gilded-sheet-hover8'];

const show = (ref, file) => execFileSync('git', ['show', `${ref}:${file}`], { maxBuffer: 1 << 28 });

async function bbox(buffer) {
  const { data, info } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let minX = info.width, maxX = -1, minY = info.height, maxY = -1, opaque = 0;
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      if (data[(y * info.width + x) * info.channels + 3] < 16) continue;
      opaque += 1;
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }
  return maxY < 0
    ? { width: 0, height: 0, footY: null, opaque: 0, cell: info.width }
    : { width: maxX - minX + 1, height: maxY - minY + 1, footY: maxY, opaque, cell: info.width };
}

const rows = [];
for (const family of FAMILIES) {
  const files = execFileSync('git', ['diff', '--name-only', 'HEAD', SOURCE, '--', 'assets/processed'], { encoding: 'utf8' })
    .split('\n').filter((file) => file.includes(family) && file.endsWith('.png')).sort();
  for (const file of files) {
    const before = await bbox(show('HEAD', file));
    const after = await bbox(show(SOURCE, file));
    rows.push({
      file: file.replace('assets/processed/', ''), family,
      before: before.height, after: after.height, dHeight: after.height - before.height,
      dWidth: after.width - before.width, dFootY: after.footY - before.footY,
      dOpaque: after.opaque - before.opaque, cell: before.cell,
      beforeBytes: show('HEAD', file).length, afterBytes: show(SOURCE, file).length,
    });
  }
}

const per = FAMILIES.map((family) => {
  const cells = rows.filter((row) => row.family === family);
  const d = cells.map((row) => row.dHeight);
  return {
    family, cells: cells.length,
    beforeHeights: [Math.min(...cells.map((c) => c.before)), Math.max(...cells.map((c) => c.before))],
    afterHeights: [Math.min(...cells.map((c) => c.after)), Math.max(...cells.map((c) => c.after))],
    dHeight: [Math.min(...d), Math.max(...d)],
    meanDHeight: Number((d.reduce((a, b) => a + b, 0) / d.length).toFixed(2)),
    dWidth: [Math.min(...cells.map((c) => c.dWidth)), Math.max(...cells.map((c) => c.dWidth))],
    dFootY: [Math.min(...cells.map((c) => c.dFootY)), Math.max(...cells.map((c) => c.dFootY))],
    bytes: cells.reduce((sum, c) => sum + c.afterBytes - c.beforeBytes, 0),
    cellSize: cells[0]?.cell ?? null,
  };
});
console.log(JSON.stringify({ source: SOURCE, generatedAt: new Date().toISOString(), summary: per, cells: rows }, null, 1));

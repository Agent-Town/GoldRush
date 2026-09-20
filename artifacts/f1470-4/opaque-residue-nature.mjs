#!/usr/bin/env node
/**
 * Arm B leaves 4 sheets / 23 cells with alpha BYTE-IDENTICAL but 45 fully-opaque
 * pixels whose RGB moves. The F-1470-4 gate reads that as a violation.
 *
 * But the gate's invariant was written (master f1464-1, measured note 2) to catch
 * ONE thing: geometry drift — "the silhouette does not move, and neither does the
 * interior". Alpha is 0 here, so the silhouette provably did not move. So what ARE
 * these 45 pixels?
 *
 * THE QUESTION THAT DECIDES IT: what colour were they BEFORE?
 *   - If they were ordinary art colours drifting by a few units, that is resample
 *     noise and the hold is correct.
 *   - If they were MAGENTA, then these pixels are halo that happens to sit at
 *     alpha 255, and the "violation" is the cure reaching them. Holding the sheet
 *     back to protect them would be preserving the defect the batch exists to fix.
 *
 * Prints every one of the 45 pixels. No sampling, no aggregate hiding the answer.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { PNG } from 'pngjs';

const PROC = 'assets/processed';
const FULL = 'assets/processed-full';
const RAW = 'assets/raw';
const KEY = 'ff00ff';
const GOOD = ['char-hero-sheet-back-f', 'char-hero-sheet-front-f', 'char-hero-sheet-side-f', 'ter-rail-elements'];
const readPng = (f) => PNG.sync.read(fs.readFileSync(f));

function resize(png, maxWidth, maxHeight) {
  const scale = Math.min(1, maxWidth / png.width, maxHeight / png.height);
  const width = Math.max(1, Math.round(png.width * scale));
  const height = Math.max(1, Math.round(png.height * scale));
  if (width === png.width && height === png.height) return png;
  const out = new PNG({ width, height });
  const sx = png.width / width, sy = png.height / height;
  for (let y = 0; y < height; y += 1) {
    const fy = Math.min((y + 0.5) * sy - 0.5, png.height - 1);
    const y0 = Math.max(Math.floor(fy), 0), y1 = Math.min(y0 + 1, png.height - 1), wy = fy - y0;
    for (let x = 0; x < width; x += 1) {
      const fx = Math.min((x + 0.5) * sx - 0.5, png.width - 1);
      const x0 = Math.max(Math.floor(fx), 0), x1 = Math.min(x0 + 1, png.width - 1), wx = fx - x0;
      const outIdx = (width * y + x) << 2;
      for (let c = 0; c < 4; c += 1) {
        const p00 = png.data[((png.width * y0 + x0) << 2) + c], p10 = png.data[((png.width * y0 + x1) << 2) + c];
        const p01 = png.data[((png.width * y1 + x0) << 2) + c], p11 = png.data[((png.width * y1 + x1) << 2) + c];
        out.data[outIdx + c] = Math.round(p00 * (1 - wx) * (1 - wy) + p10 * wx * (1 - wy) + p01 * (1 - wx) * wy + p11 * wx * wy);
      }
    }
  }
  return out;
}

function convention(stem) {
  const fj = JSON.parse(fs.readFileSync(path.join(PROC, `${stem}.frames.json`), 'utf8'));
  const occupied = fj.cells.filter((c) => !c.empty);
  const shipped = readPng(path.join(PROC, occupied[0].file));
  return { stem, grid: fj.grid, declCell: fj.cell, scale: fj.scale, displayCell: shipped.width, occupied };
}

/** How magenta is this colour? 0 = exactly ff00ff. Distance in RGB space. */
const magentaDist = (r, g, b) => Math.hypot(255 - r, 0 - g, 255 - b);
const hex = (r, g, b) => [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');

const rows = [];
for (const stem of GOOD) {
  const conv = convention(stem);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 's1485-nature-'));
  try {
    execFileSync('node', ['scripts/extract-alpha.mjs', '--key', KEY, '--grid', `${conv.grid.cols}x${conv.grid.rows}`,
      '--cell', String(conv.declCell), '--out', tmp, path.join(RAW, `${conv.stem}.png`)], { stdio: 'pipe' });
    for (const cell of conv.occupied) {
      const after = resize(readPng(path.join(tmp, cell.file)), conv.displayCell, conv.displayCell);
      const before = readPng(path.join(PROC, cell.file));
      for (let i = 0; i < before.width * before.height; i++) {
        const o = i << 2;
        if (before.data[o + 3] !== 255) continue;
        const [br, bg, bb] = [before.data[o], before.data[o + 1], before.data[o + 2]];
        const [ar, ag, ab] = [after.data[o], after.data[o + 1], after.data[o + 2]];
        if (br === ar && bg === ag && bb === ab) continue;
        rows.push({
          file: cell.file, x: i % before.width, y: (i / before.width) | 0,
          before: hex(br, bg, bb), after: hex(ar, ag, ab),
          beforeMagentaDist: Math.round(magentaDist(br, bg, bb)),
          afterMagentaDist: Math.round(magentaDist(ar, ag, ab)),
          delta: Math.max(Math.abs(br - ar), Math.abs(bg - ag), Math.abs(bb - ab)),
        });
      }
    }
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
}

console.log(`${rows.length} fully-opaque pixels change RGB across the 4 auto-scale-reproducible sheets.\n`);
console.log('  file                                        x,y      before -> after    magentaDist  maxΔ');
for (const r of rows) {
  console.log(`  ${r.file.padEnd(42)} ${String(r.x + ',' + r.y).padEnd(8)} ${r.before} -> ${r.after}   ${String(r.beforeMagentaDist).padStart(3)} -> ${String(r.afterMagentaDist).padStart(3)}   ${String(r.delta).padStart(3)}`);
}

const wasMagenta = rows.filter((r) => r.beforeMagentaDist < 80);
const gotLessMagenta = rows.filter((r) => r.afterMagentaDist > r.beforeMagentaDist);
console.log(`\n  pixels whose BEFORE colour was near-magenta (dist < 80): ${wasMagenta.length}/${rows.length}`);
console.log(`  pixels that moved AWAY from magenta:                     ${gotLessMagenta.length}/${rows.length}`);
console.log(`  max single-channel delta across all of them:             ${rows.reduce((m, r) => Math.max(m, r.delta), 0)}`);
fs.writeFileSync('artifacts/f1470-4/opaque-residue-nature.json', JSON.stringify(rows, null, 2) + '\n');

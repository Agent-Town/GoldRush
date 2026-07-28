#!/usr/bin/env node
/**
 * anim-pass-reextract.mjs — THE ANIMATION PASS, re-extraction arm (M3).
 *
 * Re-extracts a mended raw sheet and lands its cells EXACTLY the way that sheet
 * already ships. Running `extract-alpha.mjs` alone is not enough and running the
 * global `optimize-assets.mjs` is not safe:
 *
 *  1. `optimize-assets.mjs` reads its source from `assets/processed-full/` and only
 *     refreshes that copy when it is MISSING (optimize-assets.mjs:92-96). So a fresh
 *     extraction written into `assets/processed/` is silently overwritten by a
 *     downscale of the STALE full copy — the mend would vanish with a green log.
 *  2. Passing `--refresh-full` globally would copy today's 256px shipped cells OVER
 *     the 512px masters for all 462 of them. That is not a refresh, it is a loss.
 *  3. The cast does not share one convention: some sheets ship 256px cells with a
 *     512px master preserved, others ship the 512px cell directly with no master at
 *     all (`char-e9-feral_terraformer-sheet-walk8`). A global run would silently
 *     downscale the second group — a live change nobody asked for.
 *
 * So this tool re-extracts ONE sheet at a time and reproduces that sheet's own
 * convention: same declared cell, same shared scale (pinned, so figures cannot
 * size-pop — s37), same shipped pixel size, same presence-or-absence of a master.
 *
 * The downscale is a byte-faithful copy of `optimize-assets.mjs`'s resize/writePng.
 * `--verify-downscale` proves that claim by re-deriving shipped cells from their
 * masters and byte-comparing, excluding only tracked post-extraction mends in
 * `assets/master-divergent.json`.
 *
 * Usage:
 *   node scripts/anim-pass-reextract.mjs --verify-downscale [stem ...]
 *   node scripts/anim-pass-reextract.mjs --like BASE_STEM <new-stem ...>
 *   node scripts/anim-pass-reextract.mjs --raw DIR <stem ...> [--dry]
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { PNG } from 'pngjs';

const PROC = 'assets/processed';
const FULL = 'assets/processed-full';
const MASTER_DIVERGENT = 'assets/master-divergent.json';

const A = process.argv.slice(2);
const VALUED = new Set(['--raw', '--key', '--scale', '--like']);
const OPTS = new Map(); const STEMS = [];
for (let i = 0; i < A.length; i++) {
  const a = A[i];
  if (VALUED.has(a)) OPTS.set(a, A[++i]);
  else if (a.startsWith('--')) OPTS.set(a, true);
  else STEMS.push(a.replace(/\.png$/, '').replace(/^assets\/raw\//, ''));
}
const RAWDIR = OPTS.get('--raw') || 'assets/raw';
const KEY = OPTS.get('--key') || 'ff00ff';
const DRY = OPTS.has('--dry');
const LIKE = OPTS.get('--like');

/* ---- verbatim from optimize-assets.mjs:43-90 (must stay byte-faithful) ---- */
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
function isOpaque(png) { for (let i = 3; i < png.data.length; i += 4) if (png.data[i] !== 255) return false; return true; }
function writePng(png, file) {
  const options = isOpaque(png) ? { colorType: 2, zlib: { level: 9 } } : { zlib: { level: 9 } };
  fs.writeFileSync(file, PNG.sync.write(png, options));
}
/* -------------------------------------------------------------------------- */

const readPng = (f) => PNG.sync.read(fs.readFileSync(f));

/** What this sheet ships today: grid, declared cell, pinned scale, display size, master presence. */
function convention(stem) {
  const fjPath = path.join(PROC, `${stem}.frames.json`);
  if (!fs.existsSync(fjPath)) return { stem, error: 'no frames.json — sheet is not extracted; nothing ships' };
  const fj = JSON.parse(fs.readFileSync(fjPath, 'utf8'));
  const occupied = fj.cells.filter((c) => !c.empty);
  if (!occupied.length) return { stem, error: 'frames.json has no occupied cells' };
  const shipped = readPng(path.join(PROC, occupied[0].file));
  const masters = occupied.filter((c) => fs.existsSync(path.join(FULL, c.file))).length;
  return {
    stem, grid: fj.grid, declCell: fj.cell, scale: fj.scale,
    displayCell: shipped.width, hasMaster: masters === occupied.length, masters, cells: fj.cells.length, occupied: occupied.length,
  };
}

if (OPTS.has('--verify-downscale')) {
  // Control: re-derive shipped cells from their masters. Tracked post-extraction
  // mends must still diverge; everything else must reproduce byte-identically.
  const files = fs.readdirSync(FULL).filter((f) => /-r\d+c\d+\.png$/.test(f) && (!STEMS.length || STEMS.some((s) => f.startsWith(s)))).sort();
  const entries = JSON.parse(fs.readFileSync(MASTER_DIVERGENT, 'utf8')).cells;
  const divergent = new Map();
  let invalid = 0;
  for (const entry of entries) {
    if (divergent.has(entry.file)) { console.log(`  DUPLICATE EXCLUSION ${entry.file}`); invalid++; }
    divergent.set(entry.file, entry);
    if (!fs.existsSync(path.join(PROC, entry.file)) || !fs.existsSync(path.join(FULL, entry.file))) {
      console.log(`  MISSING EXCLUSION FILE ${entry.file}`);
      invalid++;
    }
  }
  let ok = 0, unexplained = 0, expected = 0, stale = 0, skipped = 0;
  for (const f of files) {
    const p = path.join(PROC, f);
    if (!fs.existsSync(p)) { skipped++; continue; }
    const derived = resize(readPng(path.join(FULL, f)), 256, 256);
    const tmp = path.join(os.tmpdir(), `anim-verify-${process.pid}.png`);
    writePng(derived, tmp);
    const matches = Buffer.compare(fs.readFileSync(tmp), fs.readFileSync(p)) === 0;
    if (matches && divergent.has(f)) { stale++; console.log(`  STALE EXCLUSION ${f}`); }
    else if (matches) ok++;
    else if (divergent.has(f)) expected++;
    else { unexplained++; console.log(`  UNEXPLAINED ${f}`); }
    fs.unlinkSync(tmp);
  }
  console.log(`downscale replication: ${ok} byte-identical, ${unexplained} unexplained, ${expected} master-divergent by design (of ${files.length} masters)`);
  if (stale) console.log(`  ${stale} stale exclusion${stale === 1 ? '' : 's'}`);
  if (skipped) console.log(`  ${skipped} with no shipped copy`);
  process.exit(unexplained || stale || invalid ? 1 : 0);
}

if (!STEMS.length) { console.error('usage: node scripts/anim-pass-reextract.mjs --raw DIR <stem ...>'); process.exit(1); }

for (const stem of STEMS) {
  let conv = convention(stem);
  if (conv.error === 'no frames.json — sheet is not extracted; nothing ships' && LIKE) {
    const base = convention(LIKE);
    if (base.error) { console.log(`\n${stem}: --like ${LIKE} failed: ${base.error} — SKIPPED`); continue; }
    conv = { ...base, stem };
  }
  if (conv.error) { console.log(`\n${stem}: ${conv.error} — SKIPPED (raw mend still stands)`); continue; }
  // frames.json rounds scale to 4dp. Re-extracting at the ROUNDED value resamples
  // every cell a hair differently (peak 5/255 on ~30px — invisible, but it dirties
  // the diff and buries the mend). --scale takes the exact double so untouched
  // cells come back byte-identical and the diff IS the mend.
  if (OPTS.has('--scale')) conv.scale = OPTS.get('--scale');
  const rawFile = path.join(RAWDIR, `${stem}.png`);
  if (!fs.existsSync(rawFile)) { console.log(`\n${stem}: no raw at ${rawFile} — SKIPPED`); continue; }
  console.log(`\n=== ${stem}`);
  console.log(`  ships: ${conv.grid.cols}x${conv.grid.rows} grid, declared cell ${conv.declCell}, display ${conv.displayCell}px, scale ${conv.scale}, master ${conv.hasMaster ? `yes (${conv.masters})` : 'NO'}`);
  if (DRY) { console.log('  --dry: nothing written'); continue; }

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'anim-reextract-'));
  execFileSync('node', ['scripts/extract-alpha.mjs', '--key', KEY, '--grid', `${conv.grid.cols}x${conv.grid.rows}`,
    '--cell', String(conv.declCell), '--scale', String(conv.scale), '--out', tmp, rawFile], { stdio: 'pipe' });

  const produced = fs.readdirSync(tmp).filter((f) => f.endsWith('.png')).sort();
  let toMaster = 0, downscaled = 0, direct = 0;
  for (const f of produced) {
    const src = path.join(tmp, f);
    if (conv.hasMaster) {
      fs.copyFileSync(src, path.join(FULL, f)); toMaster++;          // refresh THIS sheet's master
      writePng(resize(readPng(src), conv.displayCell, conv.displayCell), path.join(PROC, f)); downscaled++;
    } else {
      fs.copyFileSync(src, path.join(PROC, f)); direct++;            // sheet ships the full cell, no master today
    }
  }
  fs.copyFileSync(path.join(tmp, `${stem}.frames.json`), path.join(PROC, `${stem}.frames.json`));
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`  wrote ${produced.length - 1} cells: ${toMaster ? `${toMaster} masters refreshed + ${downscaled} downscaled to ${conv.displayCell}px` : `${direct} written direct at ${conv.declCell}px (no master, as today)`} + frames.json`);
}

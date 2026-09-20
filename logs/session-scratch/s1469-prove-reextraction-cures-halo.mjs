#!/usr/bin/env node
/**
 * s1469-prove-reextraction-cures-halo.mjs — F-1464-1 PREMISE CHECK.
 *
 * F-1464-1 asserts a roster-wide re-extraction against the post-`d2e69801`
 * extractor cures the F-1449-1 halo. That is the premise the whole 1,075-file
 * master rests on, and NOBODY HAS EVER RUN IT ON A SUSPECT SHEET — the four
 * negative controls in the finding are sprites that were extracted after the
 * cure, not haloed sprites re-extracted through it. A master authored on an
 * unmeasured premise can burn a lane for nothing.
 *
 * So: re-extract one named suspect sheet (`char-baron-sheet-walk4-a`, the HUD
 * portrait the finding names at 55.63%) into a scratch dir with its OWN shipped
 * convention, and apply the halo-class-sweep predicate to three arms:
 *
 *   A. shipped 256px cell (assets/processed)     — expected: HALOED (the defect)
 *   B. fresh 512px cell                           — expected: 0.00%
 *   C. fresh 512 downscaled to 256 the way
 *      anim-pass-reextract.mjs:172 does           — expected: 0.00%
 *
 * Arm C is the one that matters: it is what would actually ship. Arm B alone
 * would prove the extractor and not the pipeline.
 *
 * Predicate + resize are copied from the instruments they must agree with:
 *   artifacts/f1450-4/halo-class-sweep.mjs:40-56  (modal key under transparency)
 *   scripts/anim-pass-reextract.mjs:59-86         (byte-faithful optimize resize)
 *
 * Writes nothing outside /tmp. Read-only against assets/.
 */
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const KEYS = { ff00ff: 'magenta sheet key', '8a8a8a': 'grey cutout key' };
const SCRATCH = '/tmp/s1469-halo';
const STEM = 'char-baron-sheet-walk4-a';

const readPng = (f) => PNG.sync.read(fs.readFileSync(f));

/* ---- verbatim shape from anim-pass-reextract.mjs:59-81 ---- */
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

/** halo-class-sweep.mjs:40-56 — modal key RGB sitting under fully-transparent pixels. */
function haloShare(png) {
  const counts = new Map();
  let transparent = 0;
  for (let i = 0; i < png.data.length; i += 4) {
    if (png.data[i + 3] !== 0) continue;
    transparent += 1;
    const hex = [png.data[i], png.data[i + 1], png.data[i + 2]]
      .map((v) => v.toString(16).padStart(2, '0')).join('');
    counts.set(hex, (counts.get(hex) || 0) + 1);
  }
  if (!transparent) return { transparent: 0, worst: null, share: 0 };
  let worst = null, share = 0;
  for (const key of Object.keys(KEYS)) {
    const n = counts.get(key) || 0;
    if (n / transparent > share) { share = n / transparent; worst = key; }
  }
  return { transparent, worst, share };
}

const cells = fs.readdirSync(SCRATCH).filter((f) => f.startsWith(`${STEM}-r`) && f.endsWith('.png')).sort();
if (!cells.length) { console.error(`no re-extracted cells in ${SCRATCH} — run extract-alpha first`); process.exit(2); }

const rows = [];
for (const f of cells) {
  const shippedPath = path.join('assets/processed', f);
  if (!fs.existsSync(shippedPath)) continue;
  const a = haloShare(readPng(shippedPath));
  const fresh = readPng(path.join(SCRATCH, f));
  const b = haloShare(fresh);
  const c = haloShare(resize(fresh, 256, 256));
  rows.push({ f, a, b, c });
}

const pct = (r) => `${(r.share * 100).toFixed(2).padStart(6)}%`;
console.log(`cell                                    A shipped256   B fresh512   C fresh->256`);
for (const r of rows) {
  console.log(`${r.f.padEnd(38)} ${pct(r.a)}      ${pct(r.b)}     ${pct(r.c)}`);
}
const over = (arm) => rows.filter((r) => r[arm].share > 0.05).length;
console.log(`\nsuspects (>5%, the sweep's threshold) of ${rows.length} cells:`);
console.log(`  A shipped 256px : ${over('a')}`);
console.log(`  B fresh 512px   : ${over('b')}`);
console.log(`  C fresh -> 256px: ${over('c')}`);
console.log(`\nVERDICT: ${over('a') > 0 && over('c') === 0
  ? 'RE-EXTRACTION CURES THE HALO end-to-end. F-1464-1 premise HOLDS.'
  : 'PREMISE DID NOT HOLD — do not author the batch on this recipe.'}`);

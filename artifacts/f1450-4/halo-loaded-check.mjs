#!/usr/bin/env node
/**
 * halo-loaded-check.mjs — F-1450-4 spin-off, concreteness + instrument control.
 *
 * The bulk sweep says 1075/1314. A bulk number is easy to wave away, so this checks
 * sprites that are PROVABLY loaded by the runtime (grepped out of src/), and includes
 * NEGATIVE CONTROLS — the four sprites cured after d2e69801 — which must read 0.00%.
 * If a control reads non-zero, the probe is wrong and the sweep means nothing.
 */
import fs from 'node:fs';
import { PNG } from 'pngjs';

const CURED_CONTROLS = [
  'assets/processed/prop-baron-banner.png',        // cured s1450 77a22fc5
  'assets/processed/prop-drill-bell-post.png',     // extracted post-cure a7b7eddb
  'assets/processed/prop-drill-faucet-station.png',
  'assets/processed/prop-straw-man-stand.png',
];
const LOADED_SAMPLES = [
  'assets/processed/char-baron-sheet-walk4-a-r0c0.png', // src/ui/Hud.ts:14 (baron portrait)
  'assets/processed/char-prospector-portrait.png',      // src/ui/Hud.ts:13
  'assets/processed/bld-claim-office.png',              // src/ui/BuildButton.ts:11
  'assets/processed/bld-boiler-house.png',              // src/ui/BuildButton.ts:12
  'assets/processed/bld-signal-turret.png',             // src/ui/BuildButton.ts:10
  'assets/processed/ui-title-emblem.png',               // top of the sweep at 99.17%
];

function measure(f) {
  if (!fs.existsSync(f)) return { file: f, missing: true };
  const png = PNG.sync.read(fs.readFileSync(f));
  const { width: w, height: h, data } = png;
  let transparent = 0, key = 0, touchingArt = 0;
  const isKey = (i) => { const x = i << 2; return data[x] === 255 && data[x + 1] === 0 && data[x + 2] === 255; };
  for (let i = 0; i < w * h; i++) {
    if (data[(i << 2) + 3] !== 0) continue;
    transparent++;
    if (!isKey(i)) continue;
    key++;
    // "touching art" = the halo source: a key-coloured transparent texel with a
    // visible neighbour, which is what bilinear filtering averages into the edge.
    const x = i % w, y = (i / w) | 0;
    for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      if (data[((ny * w + nx) << 2) + 3] > 0) { touchingArt++; break; }
    }
  }
  return { file: f, size: `${w}x${h}`, transparent, key, share: transparent ? (key / transparent * 100).toFixed(2) + '%' : 'n/a', touchingArt };
}

const show = (title, list) => {
  console.log(`\n=== ${title} ===`);
  for (const f of list) {
    const r = measure(f);
    if (r.missing) { console.log(`  MISSING  ${f}`); continue; }
    console.log(`  ${String(r.share).padStart(7)}  keyPx ${String(r.key).padStart(7)}  touching-art ${String(r.touchingArt).padStart(6)}  ${r.size.padStart(9)}  ${r.file}`);
  }
};

show('NEGATIVE CONTROLS — cured after d2e69801, MUST read 0.00% / 0 touching', CURED_CONTROLS);
show('PROVABLY LOADED BY THE RUNTIME (paths grepped from src/)', LOADED_SAMPLES);

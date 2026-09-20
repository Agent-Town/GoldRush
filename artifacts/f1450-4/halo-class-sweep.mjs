#!/usr/bin/env node
/**
 * halo-class-sweep.mjs — F-1450-4 class check (VERIFY-DON'T-INHERIT).
 *
 * s1450 asserted the Baron banner was "THE LAST KEYED SPRITE CARRYING THE F-1449-1 HALO".
 * That is an inherited claim about the whole shipped roster, so it gets measured, not
 * trusted. For every PNG under assets/processed/, report the MODAL RGB sitting under
 * fully-transparent pixels. A sprite cured by bleedEdges has real art colour there; an
 * uncured keyed sprite has a flat key colour (ff00ff sprite sheets, 8a8a8a cutouts).
 *
 * Reported as a proportion, because a handful of key-coloured texels in a corner is not
 * the same defect as a whole transparent field of them.
 */
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const DIR = 'assets/processed';
const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.png')) files.push(p);
  }
})(DIR);

const KEYS = { 'ff00ff': 'magenta sheet key', '8a8a8a': 'grey cutout key' };
const hex = (r, g, b) => [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');

const suspects = [];
let scanned = 0, noTransparency = 0;
for (const f of files) {
  let png;
  try { png = PNG.sync.read(fs.readFileSync(f)); } catch { continue; }
  scanned++;
  const { width: w, height: h, data } = png;
  const counts = new Map();
  let transparent = 0;
  for (let i = 0; i < w * h; i++) {
    const idx = i << 2;
    if (data[idx + 3] !== 0) continue;
    transparent++;
    const k = hex(data[idx], data[idx + 1], data[idx + 2]);
    counts.set(k, (counts.get(k) || 0) + 1);
  }
  if (!transparent) { noTransparency++; continue; }
  let modal = null, modalN = 0;
  for (const [k, n] of counts) if (n > modalN) { modal = k; modalN = n; }
  // A sprite is a halo suspect when a KEY colour occupies a real share of its
  // transparent field. 5% is deliberately low — the cured files measure 0.00%.
  for (const key of Object.keys(KEYS)) {
    const n = counts.get(key) || 0;
    const share = n / transparent;
    if (share > 0.05) suspects.push({ file: f, key, keyPx: n, transparent, share: (share * 100).toFixed(2) + '%', modal, kind: KEYS[key] });
  }
}

console.log(`scanned ${scanned} PNGs under ${DIR}/  (${noTransparency} had no transparent pixels at all)`);
if (!suspects.length) {
  console.log('\nHALO SUSPECTS: 0 — s1450\'s "last keyed sprite" claim is CONFIRMED by measurement.');
} else {
  console.log(`\nHALO SUSPECTS: ${suspects.length} — s1450's "last keyed sprite" claim is REFUTED.\n`);
  suspects.sort((a, b) => parseFloat(b.share) - parseFloat(a.share));
  for (const s of suspects) {
    console.log(`  ${s.share.padStart(7)}  ${s.keyPx}/${s.transparent} px ${s.kind}  ${s.file}`);
  }
}
fs.writeFileSync('artifacts/f1450-4/halo-class-sweep.json', JSON.stringify({ scanned, noTransparency, suspects }, null, 2) + '\n');

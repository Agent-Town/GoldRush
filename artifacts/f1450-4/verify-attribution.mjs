#!/usr/bin/env node
/**
 * verify-attribution.mjs — F-1450-4, the confirming half.
 *
 * run-controls.mjs showed matching HISTOGRAMS. Two counts agreeing is not the same
 * set, so this asks the byte-level questions instead:
 *
 *   Q1  Is the alpha channel of (current extractor) identical to (pre-bleed extractor)?
 *       If yes, bleedEdges provably moves zero alpha — the cut-out is bit-for-bit
 *       the same shape, as its docstring claims, PROVEN BY EXECUTION.
 *   Q2  Is the alpha channel of the 2026-07-08 shipped file identical to
 *       "extract at the default 1024, then bilinear-downsample to 384"?
 *       If yes, the partial=1845 is a DOWNSAMPLING artifact and nothing to do with
 *       any extractor revision.
 *   Q3  ARM E — full provenance reconstruction: run the PRE-BLEED extractor at the
 *       default size (the bare `--key ff00ff` recorded at tasks/lane-b-baron-presence.md:9)
 *       and downsample to 384. If that is BYTE-identical to the shipped 2026-07-08 file,
 *       the original production pipeline is reconstructed exactly, not merely modelled.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { PNG } from 'pngjs';

const ROOT = process.cwd();
const WORK = path.join(ROOT, 'artifacts/f1450-4');
const RAW = path.join(ROOT, 'assets/raw/prop-baron-banner.png');
const sha = (f) => execFileSync('shasum', ['-a', '256', f], { encoding: 'utf8' }).split(' ')[0];

function resizeTo(srcFile, dstFile, size) {
  const png = PNG.sync.read(fs.readFileSync(srcFile));
  const out = new PNG({ width: size, height: size });
  const sx = png.width / size, sy = png.height / size;
  for (let y = 0; y < size; y++) {
    const fy = Math.min((y + 0.5) * sy - 0.5, png.height - 1);
    const y0 = Math.max(Math.floor(fy), 0), y1 = Math.min(y0 + 1, png.height - 1);
    const wy = fy - y0;
    for (let x = 0; x < size; x++) {
      const fx = Math.min((x + 0.5) * sx - 0.5, png.width - 1);
      const x0 = Math.max(Math.floor(fx), 0), x1 = Math.min(x0 + 1, png.width - 1);
      const wx = fx - x0;
      const o = (size * y + x) << 2;
      for (let c = 0; c < 4; c++) {
        const p00 = png.data[((png.width * y0 + x0) << 2) + c];
        const p10 = png.data[((png.width * y0 + x1) << 2) + c];
        const p01 = png.data[((png.width * y1 + x0) << 2) + c];
        const p11 = png.data[((png.width * y1 + x1) << 2) + c];
        out.data[o + c] = Math.round(p00 * (1 - wx) * (1 - wy) + p10 * wx * (1 - wy) + p01 * (1 - wx) * wy + p11 * wx * wy);
      }
    }
  }
  fs.writeFileSync(dstFile, PNG.sync.write(out));
}

function channelDiff(fileA, fileB) {
  const a = PNG.sync.read(fs.readFileSync(fileA));
  const b = PNG.sync.read(fs.readFileSync(fileB));
  if (a.width !== b.width || a.height !== b.height) return { error: `size ${a.width}x${a.height} vs ${b.width}x${b.height}` };
  let alphaDiff = 0, rgbDiff = 0, maxAlphaDelta = 0;
  for (let i = 0; i < a.width * a.height; i++) {
    const idx = i << 2;
    const da = Math.abs(a.data[idx + 3] - b.data[idx + 3]);
    if (da) { alphaDiff++; if (da > maxAlphaDelta) maxAlphaDelta = da; }
    if (a.data[idx] !== b.data[idx] || a.data[idx + 1] !== b.data[idx + 1] || a.data[idx + 2] !== b.data[idx + 2]) rgbDiff++;
  }
  return { pixels: a.width * a.height, alphaDiffPixels: alphaDiff, maxAlphaDelta, rgbDiffPixels: rgbDiff };
}

// ---- ARM E: reconstruct the original pipeline exactly ---------------------
const vOld = path.join(WORK, 'variants/extract-old-pre-bleed.mjs');
const eDir = path.join(WORK, 'arms/E-old-default-1024');
fs.mkdirSync(eDir, { recursive: true });
const eLog = execFileSync('node', [vOld, '--key', 'ff00ff', '--out', eDir, RAW], { cwd: ROOT, encoding: 'utf8' }).trim();
const eDown = path.join(WORK, 'arms/E-old-1024-then-384.png');
resizeTo(path.join(eDir, 'prop-baron-banner.png'), eDown, 384);
console.log('ARM E (pre-bleed extractor, DEFAULT size = the recorded bare --key ff00ff):');
console.log('  ' + eLog);

const F = {
  shippedOld: path.join(WORK, 'blobs/shipped-OLD-a1b3f4b0.png'),
  shippedNew: path.join(WORK, 'blobs/shipped-NEW-head.png'),
  A: path.join(WORK, 'arms/A-current/prop-baron-banner.png'),
  B: path.join(WORK, 'arms/B-old-pre-bleed/prop-baron-banner.png'),
  C: path.join(WORK, 'arms/C-bleed-stubbed/prop-baron-banner.png'),
  Ddown: path.join(WORK, 'arms/D-1024-then-384.png'),
  Edown: eDown,
};

console.log('\n=== Q1: does bleedEdges move ANY alpha? (A current vs B pre-bleed, @384) ===');
console.log('  ' + JSON.stringify(channelDiff(F.A, F.B)));

console.log('\n=== Q1b: is the bleed-stub arm identical to the real pre-bleed extractor? (C vs B) ===');
console.log('  ' + JSON.stringify(channelDiff(F.C, F.B)) + `  sha equal: ${sha(F.C) === sha(F.B)}`);

console.log('\n=== Q2: is the 2026-07-08 shipped ALPHA the 1024-then-384 downsample? (shippedOld vs D) ===');
console.log('  ' + JSON.stringify(channelDiff(F.shippedOld, F.Ddown)));

console.log('\n=== Q3: ARM E byte-identity vs the 2026-07-08 shipped file ===');
console.log(`  shipped OLD : ${sha(F.shippedOld)}`);
console.log(`  ARM E       : ${sha(F.Edown)}`);
console.log(`  BYTE-IDENTICAL: ${sha(F.shippedOld) === sha(F.Edown)}`);
console.log('  channel diff: ' + JSON.stringify(channelDiff(F.shippedOld, F.Edown)));

console.log('\n=== reference: A vs shipped NEW (reproduction of s1450) ===');
console.log(`  BYTE-IDENTICAL: ${sha(F.A) === sha(F.shippedNew)}`);

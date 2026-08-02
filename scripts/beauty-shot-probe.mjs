#!/usr/bin/env node
// Beauty-shift shot probe: turns a screenshot into the numbers a beauty review can be judged on.
// Usage: node scripts/beauty-shot-probe.mjs <before.png> [after.png] [--json]
// Reports, per image: peak luma, the warm-peak pixel (max R-B) and where it sits, mean luma,
// chromatic spread, and a coarse luma histogram. With two images it prints the deltas.
// Rendering-only tool: reads PNGs, writes nothing.
import sharp from 'sharp';

const luma = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

async function probe(path) {
  const { data, info } = await sharp(path).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const at = (i) => [data[i], data[i + 1], data[i + 2]];
  let peakLuma = -1; let peakPx = [0, 0, 0]; let peakPos = [0, 0];
  let warmPeak = -1e9; let warmPx = [0, 0, 0]; let warmPos = [0, 0];
  let sumLuma = 0; let sumWarm = 0; let count = 0;
  // The lit ground: mid-luma pixels, i.e. the pools themselves rather than the black field or the
  // blown-out lantern bulbs. This is where "is it amber or is it tan?" is actually decided.
  let litR = 0; let litG = 0; let litB = 0; let litCount = 0;
  const hist = new Array(8).fill(0);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const [r, g, b] = at((y * width + x) * channels);
      const l = luma(r, g, b);
      const warm = r - b;
      if (l > peakLuma) { peakLuma = l; peakPx = [r, g, b]; peakPos = [x, y]; }
      if (warm > warmPeak) { warmPeak = warm; warmPx = [r, g, b]; warmPos = [x, y]; }
      sumLuma += l; sumWarm += warm; count += 1;
      if (l >= 48 && l <= 210) { litR += r; litG += g; litB += b; litCount += 1; }
      hist[Math.min(7, Math.floor(l / 32))] += 1;
    }
  }
  return {
    path,
    size: `${width}x${height}`,
    peakLuma: +peakLuma.toFixed(1),
    peakPx: peakPx.join(','),
    peakPos: peakPos.join(','),
    warmPeak,
    warmPx: warmPx.join(','),
    warmPos: warmPos.join(','),
    meanLuma: +(sumLuma / count).toFixed(2),
    meanWarm: +(sumWarm / count).toFixed(2),
    // share of frame above 12.5% luma — "how much of the picture is lit at all"
    litShare: +((hist.slice(1).reduce((a, b) => a + b, 0) / count) * 100).toFixed(2),
    litGround: litCount === 0 ? '—' : `${Math.round(litR / litCount)},${Math.round(litG / litCount)},${Math.round(litB / litCount)}`,
    litGroundWarm: litCount === 0 ? 0 : +((litR - litB) / litCount).toFixed(2),
    litGroundPixels: litCount,
    hist: hist.map((n) => +((n / count) * 100).toFixed(1)),
  };
}

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const paths = args.filter((a) => !a.startsWith('--'));
if (paths.length === 0) {
  console.error('usage: node scripts/beauty-shot-probe.mjs <before.png> [after.png] [--json]');
  process.exit(2);
}

const results = [];
for (const path of paths) results.push(await probe(path));

if (asJson) {
  console.log(JSON.stringify(results.length === 1 ? results[0] : results, null, 2));
} else {
  for (const r of results) {
    console.log(`\n${r.path}  (${r.size})`);
    console.log(`  peak luma   ${String(r.peakLuma).padStart(6)}  rgb ${r.peakPx.padEnd(12)} at ${r.peakPos}`);
    console.log(`  warm peak   ${String(r.warmPeak).padStart(6)}  rgb ${r.warmPx.padEnd(12)} at ${r.warmPos}   (R-B; amber reads high)`);
    console.log(`  mean luma   ${String(r.meanLuma).padStart(6)}   mean warm ${r.meanWarm}`);
    console.log(`  lit share   ${String(r.litShare).padStart(6)}%  (frame above 12.5% luma)`);
    console.log(`  lit ground  rgb ${String(r.litGround).padEnd(12)} warmth ${r.litGroundWarm}  over ${r.litGroundPixels} px  <-- the pool colour`);
    console.log(`  luma hist   ${r.hist.join(' ')}  (% per 1/8 band, dark->bright)`);
  }
  if (results.length === 2) {
    const [a, b] = results;
    const d = (x, y, unit = '') => `${y - x > 0 ? '+' : ''}${+(y - x).toFixed(2)}${unit}`;
    console.log(`\nDELTA (after - before)`);
    console.log(`  peak luma ${d(a.peakLuma, b.peakLuma)}   warm peak ${d(a.warmPeak, b.warmPeak)}`);
    console.log(`  mean luma ${d(a.meanLuma, b.meanLuma)}   mean warm ${d(a.meanWarm, b.meanWarm)}   lit share ${d(a.litShare, b.litShare, 'pp')}`);
    console.log(`  lit ground ${a.litGround} -> ${b.litGround}   warmth ${d(a.litGroundWarm, b.litGroundWarm)}`);
  }
}

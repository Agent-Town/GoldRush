// Before/after luminance of the pixels that actually changed, per station capture.
//
// The naive crop (the body's projected column) is dominated by the cream HUD cards, so it measures
// the HUD, not the art. Instead: the two runs are the same seed, same station, same paused sim, and
// the ONLY asset that changed between them is the pack, so the pixels whose colour moved ARE the
// landmark. Pixels inside any HUD rect (recorded in checks.json on the same boot) are excluded, so
// the clock ticking from 00:02 to 00:04 cannot contribute.
//
//   node artifacts/open-maps-art-blackout-fairground/measure_luma.mjs <pack>
import { readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const pack = process.argv[2] ?? 'blackout-ridge';
const root = 'artifacts/open-maps-art-blackout-fairground';
const load = (phase) => JSON.parse(readFileSync(`${root}/${phase}/checks.json`, 'utf8'));
const THRESHOLD = 4; // 8-bit channel delta that counts as "this pixel changed"
const PALE = 120;    // the "pale plate" line: a night body should have very few pixels above it

const raw = async (file) => {
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  return { data, info };
};

function summarise(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const at = (q) => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
  return { mean: +(values.reduce((s, v) => s + v, 0) / values.length).toFixed(2),
    p50: +at(0.5).toFixed(2), p90: +at(0.9).toFixed(2), p99: +at(0.99).toFixed(2),
    paleFraction: +(values.filter((v) => v > PALE).length / values.length).toFixed(4) };
}

const before = load('before').filter((r) => r.boot === 'debug' && r.pack === pack);
const after = load('after').filter((r) => r.boot === 'debug' && r.pack === pack);
const rows = [];
for (const b of before) {
  const a = after.find((r) => r.viewport === b.viewport);
  if (!a) continue;
  const hud = [...b.hudRects, ...a.hudRects];
  for (const station of b.stations) {
    const twin = a.stations.find((s) => s.id === station.id);
    if (!twin) continue;
    const B = await raw(`${root}/before/${station.file}`);
    const A = await raw(`${root}/after/${twin.file}`);
    if (B.info.width !== A.info.width || B.info.height !== A.info.height) continue;
    const { width, height, channels } = B.info;
    const inHud = (x, y) => hud.some((r) => x >= r.x - 2 && x <= r.x + r.w + 2 && y >= r.y - 2 && y <= r.y + r.h + 2);
    const beforeL = [], afterL = [], darkB = [], darkA = [], briteB = [], briteA = [];
    for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * channels;
      const d = Math.max(Math.abs(A.data[i] - B.data[i]), Math.abs(A.data[i + 1] - B.data[i + 1]), Math.abs(A.data[i + 2] - B.data[i + 2]));
      if (d < THRESHOLD || inHud(x, y)) continue;
      const lb = 0.2126 * B.data[i] + 0.7152 * B.data[i + 1] + 0.0722 * B.data[i + 2];
      const la = 0.2126 * A.data[i] + 0.7152 * A.data[i + 1] + 0.0722 * A.data[i + 2];
      beforeL.push(lb); afterL.push(la);
      if (la < lb) { darkB.push(lb); darkA.push(la); } else { briteB.push(lb); briteA.push(la); }
    }
    const bs = summarise(beforeL), as = summarise(afterL);
    rows.push({ id: station.id, viewport: b.viewport, changedPixels: beforeL.length,
      changedFraction: +(beforeL.length / (width * height)).toFixed(4), before: bs, after: as,
      darkened: { pixels: darkB.length, before: summarise(darkB), after: summarise(darkA) },
      brightened: { pixels: briteB.length, before: summarise(briteB), after: summarise(briteA) } });
  }
}
writeFileSync(`${root}/work/${pack}-luma.json`, JSON.stringify(rows, null, 2));
for (const r of rows) {
  if (!r.before) { console.log(`${r.id.padEnd(30)} ${r.viewport} NO CHANGED PIXELS`); continue; }
  const d = r.darkened, u = r.brightened;
  console.log(`${r.id.padEnd(30)} ${r.viewport.padEnd(8)} changed ${String(r.changedPixels).padStart(7)}px  ALL mean ${String(r.before.mean).padStart(6)}->${String(r.after.mean).padStart(6)} p90 ${String(r.before.p90).padStart(6)}->${String(r.after.p90).padStart(6)} | PAD-DOWN ${String(d.pixels).padStart(6)}px ${d.before ? d.before.mean : '-'}->${d.after ? d.after.mean : '-'} | METAL-UP ${String(u.pixels).padStart(6)}px ${u.before ? u.before.mean : '-'}->${u.after ? u.after.mean : '-'} p90 ${u.before ? u.before.p90 : '-'}->${u.after ? u.after.p90 : '-'}`);
}

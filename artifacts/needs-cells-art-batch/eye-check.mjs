// The Steam Wrecker's measurable facing signal (LEDGER row 65: "judged by a signal its subject
// supports: the amber porthole eye is present in both south winds and absent in both north").
// A first cut that just counted amber-ish pixels FAILED: the rear plate's lit brass scored 534-624
// against the front plate's 279-332. The lamp is not amber pixels, it is one BIG CONNECTED blob of
// saturated glowing orange, so this measures the largest such component instead.
import sharp from 'sharp';
const LIT = (r, g, b) => r > 225 && g > 120 && g < 215 && b < 95 && r - b > 150;
export async function eyeBlob(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height, ch = info.channels;
  const seen = new Uint8Array(w * h);
  let best = 0;
  for (let y = 0; y < h; y += 1) for (let x = 0; x < w; x += 1) {
    const li = y * w + x;
    if (seen[li]) continue;
    const i = li * ch;
    if (data[i + 3] < 200 || !LIT(data[i], data[i + 1], data[i + 2])) { seen[li] = 1; continue; }
    const stack = [li]; seen[li] = 1; let size = 0;
    while (stack.length) {
      const p = stack.pop(); size += 1;
      const px = p % w, py = (p / w) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = px + dx, ny = py + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const nl = ny * w + nx; if (seen[nl]) continue;
        const ni = nl * ch;
        if (data[ni + 3] < 200 || !LIT(data[ni], data[ni + 1], data[ni + 2])) { seen[nl] = 1; continue; }
        seen[nl] = 1; stack.push(nl);
      }
    }
    if (size > best) best = size;
  }
  return best;
}
const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop());
if (isMain) for (const f of process.argv.slice(2)) console.log(String(await eyeBlob(f)).padStart(6), f.split('/').pop());

// LEDGER row 67 parked the Steam Wrecker's se on a CLUSTER COUNT: "its shipped row remains 2/2/2/2
// clusters" where exactly one teal gauge panel is correct (steam-wrecker.props side:"L"). Same
// machinery, teal instead of amber, blobs >= 40 px so a stray rivet highlight is not a cluster.
const TEAL = (r, g, b) => b > 120 && g > 110 && r < 140 && b - r > 50 && g - r > 30;
export async function tealClusters(file, min = 40) {
  const sharp = (await import('sharp')).default;
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height, ch = info.channels;
  const seen = new Uint8Array(w * h); const sizes = [];
  for (let y = 0; y < h; y += 1) for (let x = 0; x < w; x += 1) {
    const li = y * w + x; if (seen[li]) continue;
    const i = li * ch;
    if (data[i + 3] < 200 || !TEAL(data[i], data[i + 1], data[i + 2])) { seen[li] = 1; continue; }
    const stack = [li]; seen[li] = 1; let size = 0; let sx = 0;
    while (stack.length) {
      const p = stack.pop(); size += 1; sx += p % w;
      const px = p % w, py = (p / w) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = px + dx, ny = py + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const nl = ny * w + nx; if (seen[nl]) continue;
        const ni = nl * ch;
        if (data[ni + 3] < 200 || !TEAL(data[ni], data[ni + 1], data[ni + 2])) { seen[nl] = 1; continue; }
        seen[nl] = 1; stack.push(nl);
      }
    }
    if (size >= min) sizes.push({ size, cx: Math.round(sx / size), side: sx / size < w / 2 ? 'L' : 'R' });
  }
  return sizes;
}

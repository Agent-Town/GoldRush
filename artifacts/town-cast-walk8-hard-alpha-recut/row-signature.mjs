#!/usr/bin/env node
// PER-ROW SIGNATURE: mean figure height and mean opaque RGB per direction row, main vs re-cut.
// A row whose height or colour moves while its siblings hold is a row the branch REPLACED rather
// than re-keyed (the char-schoolteacher-sheet-walk8-a row-2 case, F-RECUT-2).
import fs from 'node:fs';
import { PNG } from 'pngjs';
const S = process.env.SCRATCH;
const read = (f) => {
  const p = PNG.sync.read(fs.readFileSync(f));
  let y0 = 1e9, y1 = -1, r = 0, g = 0, b = 0, n = 0;
  for (let i = 0; i < p.width * p.height; i++) {
    const o = i << 2; if (p.data[o + 3] < 128) continue;
    const y = (i / p.width) | 0; if (y < y0) y0 = y; if (y > y1) y1 = y;
    r += p.data[o]; g += p.data[o + 1]; b += p.data[o + 2]; n++;
  }
  return { h: y1 - y0 + 1, r: r / n, g: g / n, b: b / n, n };
};
for (const fam of process.argv.slice(2)) {
  const re = new RegExp(`^${fam}-r(\\d+)c(\\d+)\\.png$`);
  const cells = fs.readdirSync('assets/processed').filter((f) => re.test(f)).sort();
  const rows = new Map();
  for (const c of cells) { const r = c.match(re)[1]; if (!rows.has(r)) rows.set(r, []); rows.get(r).push(c); }
  const out = [];
  for (const [r, list] of [...rows].sort()) {
    let mh = 0, rh = 0, dc = 0, da = 0;
    for (const c of list) {
      const m = read('assets/processed/' + c), k = read(S + '/recut/' + c);
      mh += m.h; rh += k.h; da += Math.abs(k.n - m.n) / m.n;
      dc += Math.hypot(k.r - m.r, k.g - m.g, k.b - m.b);
    }
    const L = list.length;
    out.push(`r${r}: h ${(mh / L).toFixed(1)}->${(rh / L).toFixed(1)} (${(rh / L - mh / L).toFixed(1)}) meanRGBdist ${(dc / L).toFixed(1)} areaΔ ${((da / L) * 100).toFixed(1)}%`);
  }
  console.log(fam.padEnd(34) + out.join('  |  '));
}

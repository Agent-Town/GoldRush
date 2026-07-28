#!/usr/bin/env node
/**
 * anim-pass-windtable.mjs — THE EIGHT WINDS (2026-07-28), table arm.
 *
 * Emits the review's evidence table from the measurements on disk, so no number
 * in the review is ever hand-typed. Same law as anim-pass-table.mjs: the tables
 * are generated, and a row that cannot be measured says so instead of guessing.
 *
 * Per sibling sheet it joins:
 *   - the composed raw sheet's own dimensions and grid
 *   - extract-alpha's cell metrology at the BASE sheet's pinned scale, against
 *     the base sheet's own height band (the s37 no-size-pop test)
 *   - anim-pass-cut's component ownership (0 crossings = no cell-cut pollution)
 *   - anim-pass-inspect's key purity / halo / clip counts
 *   - anim-pass-dupecheck's hash-flagged vs full-resolution-real duplicate count
 *
 *   node scripts/anim-pass-windtable.mjs [character ...]      (default: all built)
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { PNG } from 'pngjs';

const CAST = JSON.parse(fs.readFileSync('reviews/eight-winds/cast.json', 'utf8')).cast;
const SCRATCH = '.scratch-ew/proc';
const names = process.argv.slice(2).filter((a) => !a.startsWith('--'));

const med = (a) => [...a].sort((x, y) => x - y)[a.length >> 1];
const heightsOf = (j) => j.cells.filter((c) => !c.empty).map((c) => c.bbox[3] - c.bbox[1]);

function rawBand(stem, cols, rows) {
  const png = PNG.sync.read(fs.readFileSync(path.join('assets/raw', `${stem}.png`)));
  const cw = Math.floor(png.width / cols), ch = Math.floor(png.height / rows);
  const hs = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    let y0 = Infinity, y1 = -1;
    for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
      const i = ((png.width * (r * ch + y) + (c * cw + x)) << 2);
      if (Math.max(Math.abs(png.data[i] - 255), png.data[i + 1], Math.abs(png.data[i + 2] - 255)) <= 26) continue;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
    if (y1 >= 0) hs.push(y1 - y0);
  }
  return hs;
}

const rows = [];
for (const [name, c] of Object.entries(CAST)) {
  if (names.length && !names.includes(name)) continue;
  const kind = c.gait === 'hover' ? 'hover' : 'walk';
  const suffix = /-(a|b)$/.exec(c.base)?.[1];
  const [bCols, bRows] = c.grid.split('x').map(Number);
  for (const frames of [c.frames, 8, 4]) {
    const stem = `${c.base.replace(/-sheet-.*$/, '')}-sheet-${kind}diag${frames}${suffix ? `-${suffix}` : ''}`;
    const raw = path.join('assets/raw', `${stem}.png`);
    if (!fs.existsSync(raw)) continue;
    const png = PNG.sync.read(fs.readFileSync(raw));
    const fj = `${SCRATCH}/${stem}.frames.json`;
    let outH = null, scale = null, cells = null;
    if (fs.existsSync(fj)) {
      const j = JSON.parse(fs.readFileSync(fj, 'utf8'));
      outH = heightsOf(j); scale = j.scale; cells = j.cells.filter((x) => !x.empty).length;
    }
    const baseJson = `assets/processed/${c.base}.frames.json`;
    const baseH = fs.existsSync(baseJson)
      ? heightsOf(JSON.parse(fs.readFileSync(baseJson, 'utf8')))
      : rawBand(c.base, bCols, bRows);
    const cut = execFileSync('node', ['scripts/anim-pass-cut.mjs', '--grid', `${frames}x4`, stem]).toString();
    const cross = /(\d+) components · (\d+) cross a cut/.exec(cut);
    execFileSync('node', ['scripts/anim-pass-inspect.mjs', stem], { stdio: 'pipe' });
    const data = JSON.parse(fs.readFileSync(`reviews/anim-pass-2026-07-25/data/${stem}.json`, 'utf8'));
    const dup = execFileSync('node', ['scripts/anim-pass-dupecheck.mjs', stem]).toString();
    const dm = /flagged\s+(\d+)\s+→\s+REAL\s+(\d+)/.exec(dup);
    const drift = outH ? ((med(outH) - med(baseH)) / med(baseH) * 100) : null;
    rows.push({
      stem, base: c.base, dims: `${png.width}x${png.height}`, grid: `${frames}x4`,
      cells, scale,
      band: `${Math.min(...baseH)}-${Math.max(...baseH)} (med ${med(baseH)})`,
      got: outH ? `${Math.min(...outH)}-${Math.max(...outH)} (med ${med(outH)})` : '—',
      drift: drift === null ? '—' : `${drift > 0 ? '+' : ''}${drift.toFixed(1)}%`,
      comps: cross ? cross[1] : '?', cross: cross ? cross[2] : '?',
      bg: data.bgPct?.toFixed?.(2) ?? '—', halo: data.haloPct?.toFixed?.(3) ?? '—',
      trueGrid: data.trueGrid ? `${data.trueGrid.cols}x${data.trueGrid.rows}` : '?', agrees: data.gridAgrees,
      dup: dm ? `${dm[1]}→${dm[2]}` : '0→0',
    });
    break;
  }
}

console.log(`| sibling sheet | base | dims / grid decl·art | cells @scale | base height band | composed heights | drift | components / crossing a cut | key bg% / halo% | dup flagged→real |`);
console.log(`|---|---|---|---|---|---|---|---|---|---|`);
for (const r of rows) {
  console.log(`| \`${r.stem}\` | \`${r.base}\` | ${r.dims} / ${r.grid}·${r.trueGrid}${r.agrees?"":" ⚠"} | ${r.cells}/${Number(r.grid.split('x')[0]) * 4} @${r.scale} | ${r.band} | ${r.got} | **${r.drift}** | ${r.comps} / **${r.cross}** | ${r.bg} / ${r.halo} | ${r.dup} |`);
}
console.error(`\n${rows.length} sibling sheets measured`);

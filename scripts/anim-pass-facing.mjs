#!/usr/bin/env node
/**
 * anim-pass-facing.mjs — THE ANIMATION PASS (2026-07-25), direction-row arm.
 *
 * The contract is row 0 DOWN · 1 LEFT · 2 RIGHT · 3 UP (src/town/TownScene.ts
 * directionRow + assets/layer-contracts/characters.v2.json). This proves or breaks
 * that per sheet WITHOUT semantics, from the 16x16 alpha hashes already measured:
 *
 *   selfMirror(row)  — mean Hamming between each cell and its own mirror.
 *                      A cardinal view (front/back) is near bilaterally symmetric
 *                      -> LOW. A profile is not -> HIGH.
 *   direct(i,j)      — best Hamming between any cell of row i and any of row j.
 *                      LOW = the two rows show the SAME facing (the failure mode:
 *                      a "right" row drawn facing left).
 *   mirror(i,j)      — best Hamming between row i and the MIRROR of row j.
 *                      LOW = the rows are a proper left/right pair.
 *
 * Verdict per 4-row sheet: rows 1 and 2 must be a mirror pair (mirror < direct),
 * and both must be less symmetric than rows 0 and 3.
 *
 * Usage: node scripts/anim-pass-facing.mjs [stem ...]
 */
import fs from 'node:fs';
import path from 'node:path';

const DATA = 'reviews/anim-pass-2026-07-25/data';
const HB = 16;
const bits = (s) => Array.from(s, (c) => (c === '1' ? 1 : 0));
const flip = (a) => { const o = []; for (let r = 0; r < HB; r++) for (let c = 0; c < HB; c++) o.push(a[r * HB + (HB - 1 - c)]); return o; };
const ham = (a, b) => a.reduce((s, v, i) => s + (v !== b[i] ? 1 : 0), 0);

const stems = process.argv.slice(2).length
  ? process.argv.slice(2).map((s) => s.replace(/\.json$/, ''))
  : fs.readdirSync(DATA).filter((f) => f.endsWith('.json') && !f.startsWith('_')).map((f) => f.replace(/\.json$/, '')).sort();

const report = [];
for (const stem of stems) {
  const d = JSON.parse(fs.readFileSync(path.join(DATA, `${stem}.json`), 'utf8'));
  if (!d._hashes || !d.grid) continue;
  const [cols, rows] = d.grid;
  const byRow = new Map();
  for (const h of d._hashes) {
    const m = /^r(\d+)c(\d+)$/.exec(h.id);
    const r = Number(m[1]);
    const cell = d.cells.find((c) => c.row === r && c.col === Number(m[2]));
    if (cell?.empty || !h.norm) continue;
    byRow.set(r, [...(byRow.get(r) ?? []), bits(h.norm)]);
  }
  const self = [];
  for (let r = 0; r < rows; r++) {
    const cs = byRow.get(r) ?? [];
    self.push(cs.length ? +(cs.reduce((s, a) => s + ham(a, flip(a)), 0) / cs.length).toFixed(1) : null);
  }
  const pairs = {};
  for (let i = 0; i < rows; i++) {
    for (let j = i + 1; j < rows; j++) {
      const A = byRow.get(i) ?? [], B = byRow.get(j) ?? [];
      if (!A.length || !B.length) continue;
      let dm = 999, mm = 999;
      for (const a of A) for (const b of B) { dm = Math.min(dm, ham(a, b)); mm = Math.min(mm, ham(a, flip(b))); }
      pairs[`${i}v${j}`] = { direct: dm, mirror: mm };
    }
  }
  let verdict = 'n/a', note = '';
  if (rows === 4 && pairs['1v2']) {
    const { direct, mirror } = pairs['1v2'];
    if (mirror < direct) { verdict = 'LR-PAIR-OK'; note = `rows1/2 mirror ${mirror} < direct ${direct}`; }
    else if (direct < mirror) { verdict = 'LR-SAME-FACING'; note = `rows1/2 direct ${direct} < mirror ${mirror} — row 2 does not face the opposite way`; }
    else { verdict = 'LR-AMBIGUOUS'; note = `direct ${direct} == mirror ${mirror}`; }
    const prof = Math.min(self[1] ?? 0, self[2] ?? 0), card = Math.max(self[0] ?? 0, self[3] ?? 0);
    if (verdict === 'LR-PAIR-OK' && prof <= card) note += ` · WARN profiles (${self[1]}/${self[2]}) no less symmetric than cardinals (${self[0]}/${self[3]})`;
  }
  report.push({ stem, grid: `${cols}x${rows}`, selfMirror: self, pairs, verdict, note });
  console.log(
    `${stem.padEnd(46)} ${`${cols}x${rows}`.padEnd(4)} selfMir[${self.map((v) => String(v ?? '-').padStart(5)).join(' ')}] ` +
    `${verdict.padEnd(15)} ${Object.entries(pairs).map(([k, v]) => `${k}:d${v.direct}/m${v.mirror}`).join(' ')}`,
  );
  if (note) console.log(`${' '.repeat(48)}↳ ${note}`);
}
fs.writeFileSync(path.join(DATA, '_facing.json'), JSON.stringify(report, null, 1) + '\n');

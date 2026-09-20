// Extract one accepted sheet into the family's cell naming and size, iterating the extractor's shared
// --scale until the row's figure-height mean lands on the family's band. The extractor never upscales,
// so the generation must be at least as tall as the target; --scale only ever comes down.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, copyFileSync } from 'node:fs';
import { measureCell } from './measure.mjs';
import { ROWS } from './rows.mjs';

const OUT = 'assets/processed';
const TMP = 'artifacts/needs-cells-art-batch/extract-tmp';
mkdirSync(TMP, { recursive: true });

// stem per row: the family's own naming for a per-direction plate.
export const STEMS = {
  'baron-e': 'char-baron-east8-v1',
  'jumper-n': 'char-jumper-north4-v1',
  'jumper-w': 'char-jumper-west4-v1',
  'wrecker-se': 'char-steamwrecker-se4-v1',
  'wrecker-sw': 'char-steamwrecker-sw4-v1',
  'wrecker-ne': 'char-steamwrecker-ne4-v1',
  'wrecker-nw': 'char-steamwrecker-nw4-v1',
  'thief-se': 'char-coalthief-se4-v1',
  'thief-sw': 'char-coalthief-sw4-v1',
  'thief-ne': 'char-coalthief-ne4-v1',
  'thief-nw': 'char-coalthief-nw4-v1',
  'school-e': 'char-schoolteacher-east4-v1',
};
const cellsOf = (grid) => {
  const [c, r] = grid.split('x').map(Number);
  const out = [];
  for (let y = 0; y < r; y += 1) for (let x = 0; x < c; x += 1) out.push(`r${y}c${x}`);
  return out;
};

export async function extractRow(row, src, { scale = null, out = TMP, stem = null } = {}) {
  const name = stem || STEMS[row.id];
  const target = `${out}/${name}.png`;
  copyFileSync(src, target);
  const args = ['scripts/extract-alpha.mjs', '--key', 'ff00ff', '--grid', row.grid, '--cell', String(row.cell), '--out', out];
  if (scale != null) args.push('--scale', String(scale));
  args.push(target);
  const log = execFileSync('node', args, { encoding: 'utf8' });
  const meta = JSON.parse(readFileSync(`${out}/${name}.frames.json`, 'utf8'));
  const rows = [];
  for (const c of cellsOf(row.grid)) rows.push(await measureCell(`${out}/${c === cellsOf(row.grid)[0] ? '' : ''}${name}-${c}.png`));
  const hs = rows.map((r) => r.height);
  return { name, log: log.trim(), scale: meta.scale, heights: hs,
    mean: +(hs.reduce((a, b) => a + b, 0) / hs.length).toFixed(1), min: Math.min(...hs), max: Math.max(...hs),
    pct: rows.map((r) => r.pctOfCell), rgb: rows[0].rgb };
}

// Two-pass: extract at the extractor's own 86% fit, read the scale it chose, then re-extract at the
// scale that puts the row mean on `aim`.
export async function extractToBand(row, src, opts = {}) {
  const first = await extractRow(row, src, opts);
  const wanted = +(first.scale * (row.aim / first.mean)).toFixed(4);
  if (wanted >= 1) return { ...first, note: 'auto fit already below aim; scale capped at 1', capped: true };
  const second = await extractRow(row, src, { ...opts, scale: wanted });
  return second;
}

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop());
if (isMain && process.argv[2]) {
  const row = ROWS.find((r) => r.id === process.argv[2]);
  const src = process.argv[3];
  const res = await extractToBand(row, src, { out: process.argv[4] || TMP });
  console.log(JSON.stringify(res, null, 1));
}

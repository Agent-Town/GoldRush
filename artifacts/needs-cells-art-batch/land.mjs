// Land one accepted row: sweep detached specks off the plate, extract to the family's band, copy the
// cells + sidecar into assets/processed, and keep the swept plate in assets/raw under a dated name.
import { copyFileSync, mkdirSync, readdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { cleanPlate } from './clean-plate.mjs';
import { extractToBand, STEMS } from './extract.mjs';
import { ROWS } from './rows.mjs';

const DATE = '2026-09-18';
const FAMILY_RAW = { baron: 'char-baron', jumper: 'char-jumper', steamwrecker: 'char-steamwrecker', coalthief: 'char-coalthief', schoolteacher: 'char-schoolteacher' };
const TMP = 'artifacts/needs-cells-art-batch/extract-tmp';

export async function land(rowId, attemptFile) {
  const row = ROWS.find((r) => r.id === rowId);
  const stem = STEMS[rowId];
  const dir = row.id.split('-').slice(-1)[0];
  const raw = `assets/raw/${FAMILY_RAW[row.family]}-needs-cells-${DATE}-${dir}.png`;
  const swept = await cleanPlate(attemptFile, raw, { grid: row.grid });
  mkdirSync(TMP, { recursive: true });
  for (const f of readdirSync(TMP)) if (f.startsWith(stem)) rmSync(`${TMP}/${f}`);
  const res = await extractToBand(row, raw, { out: TMP });
  for (const f of readdirSync(TMP)) {
    if (!f.startsWith(`${stem}-r`) && f !== `${stem}.frames.json`) continue;
    copyFileSync(`${TMP}/${f}`, `assets/processed/${f}`);
  }
  return { row: rowId, raw, stem, swept, ...res };
}

if (process.argv[2]) {
  const out = [];
  const pairs = process.argv.slice(2);
  for (let i = 0; i < pairs.length; i += 2) out.push(await land(pairs[i], pairs[i + 1]));
  console.log(JSON.stringify(out, null, 1));
  writeFileSync('artifacts/needs-cells-art-batch/landed.jsonl',
    out.map((o) => JSON.stringify({ at: new Date().toISOString(), ...o })).join('\n') + '\n', { flag: 'a' });
}

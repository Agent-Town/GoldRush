// Clean the plate, then two-pass extract each row to its family's MEASURED band.
// Everything lands in a tmp tree first; nothing enters assets/processed until it is measured.
import { mkdirSync, rmSync, readdirSync, existsSync } from 'node:fs';
import { cleanPlate } from '../needs-cells-art-batch/clean-plate.mjs';
import { extractToBand } from '../needs-cells-art-batch/extract.mjs';
import { keyPurity } from '../needs-cells-art-batch/measure.mjs';
import { ROWS } from './strips.mjs';

const TMP = 'artifacts/needs-cells-codex-strips/tmp';
const SWEPT = 'artifacts/needs-cells-codex-strips/swept';
mkdirSync(TMP, { recursive: true });
mkdirSync(SWEPT, { recursive: true });

const only = process.argv.slice(2);
const rows = only.length ? ROWS.filter((r) => only.includes(r.id)) : ROWS;
const out = [];
for (const row of rows) {
  const before = await keyPurity(row.src);
  const sweptFile = `${SWEPT}/${row.stem}.png`;
  const swept = await cleanPlate(row.src, sweptFile, { grid: row.grid });
  const after = await keyPurity(sweptFile);
  for (const f of readdirSync(TMP)) if (f.startsWith(row.stem)) rmSync(`${TMP}/${f}`);
  const res = await extractToBand(row, sweptFile, { out: TMP, stem: row.stem });
  out.push({ id: row.id, stem: row.stem, band: row.band, aim: row.aim, swept,
    purity: { before: { exact: before.exact, exactPct: before.exactPct, near: before.near, nearPct: before.nearPct },
              after: { exact: after.exact, exactPct: after.exactPct, near: after.near, nearPct: after.nearPct } },
    scale: res.scale, heights: res.heights, pct: res.pct, mean: res.mean, min: res.min, max: res.max,
    spread: res.max - res.min, note: res.note ?? null, capped: res.capped ?? false });
  const r = out.at(-1);
  console.log(`${row.id.padEnd(11)} scale=${String(r.scale).padEnd(7)} h=[${r.heights.join(', ')}] mean=${r.mean} spread=${r.spread} band=${row.band.join('-')} ${r.capped ? 'CAPPED@1' : ''}`);
}
console.log('\n' + JSON.stringify(out, null, 1));

// Ground-truth measurement of the LIVE registered cells for the two slots this task wires,
// plus the already-landed codex cells. VERIFY-DON'T-INHERIT: every band in the inherited
// notes is re-measured here from the files the contract actually names today.
import { readFileSync } from 'node:fs';
import { measureCell } from '../needs-cells-art-batch/measure.mjs';

const contract = JSON.parse(readFileSync('assets/layer-contracts/characters.v2.json', 'utf8'));
const slot = (id) => contract.slots.find((x) => x.slot === id);
const P = 'assets/processed/';

async function block(slotId, blockName) {
  const b = slot(slotId)[blockName];
  const out = [];
  for (const [dir, d] of Object.entries(b.directions ?? {})) {
    const files = d.frames?.files ?? [];
    if (!files.length) continue;
    const ms = [];
    for (const f of files) ms.push(await measureCell(P + f));
    out.push({
      dir, stem: files[0].replace(/-r\dc\d\.png$/, ''), cell: ms[0].cellH,
      heights: ms.map((m) => m.height),
      pct: ms.map((m) => m.pctOfCell),
      footY: ms.map((m) => m.bbox[3]),
    });
  }
  return { slotId, blockName, aliases: b.aliases ?? {}, mirrors: b.mirrors ?? {}, rows: out };
}

const res = [];
res.push(await block('char.claim_jumper', 'walk4'));
res.push(await block('char.e2.steam_wrecker', 'walk4'));
for (const r of res) {
  console.log(`\n##### ${r.slotId}.${r.blockName}  aliases=${JSON.stringify(r.aliases)} mirrors=${JSON.stringify(r.mirrors)}`);
  for (const row of r.rows) {
    console.log(` ${row.dir.padEnd(3)} cell=${row.cell} ${row.stem.padEnd(34)} h=[${row.heights.join(', ')}] pct=[${row.pct.join(', ')}] footY=[${row.footY.join(', ')}] spread=${Math.max(...row.heights) - Math.min(...row.heights)} footRange=${Math.max(...row.footY) - Math.min(...row.footY)}`);
  }
  const all = r.rows.flatMap((x) => x.heights);
  const allp = r.rows.flatMap((x) => x.pct);
  console.log(` FAMILY BAND (live, registered): ${Math.min(...all)}-${Math.max(...all)} px  |  ${Math.min(...allp)}-${Math.max(...allp)} % of cell`);
}

// s1184 one-shot: salvage the gazette-engraving native 1254² originals into the repo.
// RETENTION LAW (CLAUDE.md §4.10b) — these are the irreplaceable sources of LEDGER row 66,
// living only in Codex's managed image cache, which is GC'd.
// RETAINED (not debris): this file IS the provenance record — it maps each cache blob to the
// asset it became, and its 1254² assertion is the guard that made the salvage self-verifying.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

const DIR = '/Users/robin/.codex/generated_images/019fa936-4860-7533-a367-f88a2202df5f/';
const OUT = 'assets/raw/originals/';

const map = {
  board: 'exec-965be94b-d5a2-44ae-8caf-b39f7d8f4af4.png',
  trail: 'exec-3775ec39-2443-4b54-80dc-5090cae61081.png',
  river: 'exec-9609134d-5e6f-4d3b-9faf-28012761ae99.png',
  schoolhouse: 'exec-713e58e5-c425-4b35-afdd-013c57ee34a5.png',
  ledger: 'exec-041f9ad0-6710-4ce2-b660-f3c94b9ea7de.png',
  boss: 'exec-0cc73bb6-2ae5-4633-b630-645e7b174292.png',
  'town-growth': 'exec-3f713d39-583e-4899-bc58-6c7166dc282c.png',
  'schoolhouse-REJECTED-take1': 'exec-a20863ce-886d-4703-a39d-d61a07759269.png',
};

let total = 0;
for (const [name, src] of Object.entries(map)) {
  const bytes = readFileSync(DIR + src);
  const w = bytes.readUInt32BE(16);
  const h = bytes.readUInt32BE(20);
  if (w !== 1254 || h !== 1254) throw new Error(`${name}: expected 1254x1254, got ${w}x${h}`);
  const dst = `${OUT}herald-native1254-${name}.png`;
  writeFileSync(dst, bytes);
  total += bytes.length;
  const sha = createHash('sha256').update(bytes).digest('hex').slice(0, 16);
  console.log(`${name.padEnd(28)} ${w}x${h}  ${sha}  ${(bytes.length / 1048576).toFixed(2)} MB`);
}
console.log(`TOTAL ${(total / 1048576).toFixed(2)} MB across ${Object.keys(map).length} files`);
console.log('written:', readdirSync(OUT).length);

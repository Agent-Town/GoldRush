// s1507 — query the red inventory with its LOOKUP, never grep. Line 1 is a HEADER (rows parsed,
// totals); the VERDICT is line 2. Reading line 1 as the verdict makes every spec look identical,
// which is how a lookup can be run correctly and read wrongly.
// KNOWN-RED is not exoneration by itself — it must still match the title AND the error shape.
import { spawnSync } from 'node:child_process';

const SPECS = [
  'e2e/072-era-activation.spec.ts',
  'e2e/e2-t2-dynamo-ceremony.spec.ts',
  'e2e/e6-arsenal.spec.ts',
  'e2e/e9-arsenal.spec.ts',
  'e2e/landmark-collision.spec.ts',
  'e2e/town-dynamo-hall-blender.spec.ts',
  'e2e/ui-era-dressing.spec.ts',
  'e2e/wire-era-anchor-emitters.spec.ts',
];

for (const s of SPECS) {
  const r = spawnSync('node', ['scripts/red-inventory-lookup.mjs', s], { encoding: 'utf8' });
  const lines = (r.stdout || r.stderr || '').trim().split('\n').slice(1); // drop the header
  console.log(`\n### ${s}  (rc=${r.status})`);
  console.log(lines.join('\n') || '(no verdict line)');
}

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

// Re-run the lane's probe twice and compare, then check its headline numbers
// against the report's published table.
const run = () => execFileSync('node', ['logs/s1190-rail-tough-wrench-probe.mjs'], { encoding: 'utf8', maxBuffer: 64e6 });
const a = run();
const b = run();
console.log('DETERMINISTIC ACROSS TWO RUNS:', a === b, '| sha256', createHash('sha256').update(a).digest('hex').slice(0, 16));

const r = JSON.parse(a);
console.log('\nTOP-LEVEL KEYS:', Object.keys(r).join(', '));

const flat = (o, p = '') => {
  for (const [k, v] of Object.entries(o ?? {})) {
    const key = p ? `${p}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flat(v, key);
    else if (typeof v === 'number') console.log(`  ${key} = ${v}`);
  }
};
for (const k of Object.keys(r)) {
  if (/offsets|sensitivity/i.test(k)) continue;
  console.log(`\n[${k}]`);
  if (typeof r[k] === 'object') flat(r[k]); else console.log('  ', r[k]);
}

const sens = r.sensitivity ?? r.maskSensitivity ?? [];
if (Array.isArray(sens) && sens.length) {
  const deltas = sens.map((s) => s.delta);
  console.log(`\nSENSITIVITY: ${sens.length} cases | all mirror-dominant (delta<0):`, deltas.every((d) => d < 0));
  console.log(`  delta range ${Math.min(...deltas).toFixed(4)} .. ${Math.max(...deltas).toFixed(4)}`);
}

// Provenance: the report claims these SHA-256s for its retained evidence.
for (const f of [
  'artifacts/eight-winds-rail-tough/probe-results.json',
  'artifacts/eight-winds-rail-tough/wrench-locator-cardinal.png',
  'artifacts/eight-winds-rail-tough/wrench-locator-diagonal.png',
]) {
  console.log(`${createHash('sha256').update(readFileSync(f)).digest('hex')}  ${f}`);
}

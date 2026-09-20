// s1167: where does the 163 MB in suite-red-inventory-raw.json actually live?
import fs from 'node:fs';
const raw = fs.readFileSync(process.argv[2], 'utf8');
const report = JSON.parse(raw);
const weigh = {};
let results = 0;
(function walk(suites) {
  for (const s of suites ?? []) {
    for (const spec of s.specs ?? []) {
      for (const t of spec.tests ?? []) {
        for (const r of t.results ?? []) {
          results++;
          for (const k of Object.keys(r)) {
            weigh[k] = (weigh[k] ?? 0) + JSON.stringify(r[k] ?? null).length;
          }
        }
      }
    }
    walk(s.suites);
  }
})(report.suites);
console.log('total file bytes:', raw.length.toLocaleString());
console.log('result objects  :', results.toLocaleString());
console.log('\nbytes by result key (descending):');
for (const [k, v] of Object.entries(weigh).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k.padEnd(14)} ${String(v).padStart(12)}  ${(100 * v / raw.length).toFixed(1)}%`);
}

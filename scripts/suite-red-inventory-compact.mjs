// Compact a Playwright JSON report for the suite-red-inventory by dropping the
// base64 `attachments` blobs (screenshots/traces/videos) from every result.
//
// WHY (s1167): the raw report from the 2026-07-28 full-suite run is 171,332,868
// bytes, of which 167,436,572 (97.7%) is `attachments` — inlined base64 media.
// That is over GitHub's 100 MB per-file hard limit, so committing it verbatim
// made main UNPUSHABLE (pre-receive hook declined) and broke the Backup Law for
// every subsequent fire.
//
// This is COMPACTION OF A TRACKED FILE, which CLAUDE.md §4.10b explicitly allows
// ("git keeps every version"); it is not deletion of untracked history. The full
// 171 MB original remains on disk in worktrees/lane-d and in the local object
// database at lane/perf e2838ce3.
//
// SAFETY: scripts/suite-red-inventory.mjs never reads `attachments` (verified by
// grep: no reference to attachments/stdout/stderr/annotations). The invariant is
// checked, not assumed — reducing the compacted file must reproduce the report
// byte-for-byte, which the drain verified with `diff`.
import fs from 'node:fs';

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error('usage: node scripts/suite-red-inventory-compact.mjs <raw.json> <compact.json>');
  process.exit(2);
}

const report = JSON.parse(fs.readFileSync(input, 'utf8'));
let stripped = 0;

(function walk(suites) {
  for (const suite of suites ?? []) {
    for (const spec of suite.specs ?? []) {
      for (const test of spec.tests ?? []) {
        for (const result of test.results ?? []) {
          if (Array.isArray(result.attachments) && result.attachments.length) {
            // keep the shape and the names; drop only the payload paths/bodies
            stripped += result.attachments.length;
            result.attachments = result.attachments.map((a) => ({
              name: a.name,
              contentType: a.contentType,
              stripped: true,
            }));
          }
        }
      }
    }
    walk(suite.suites);
  }
})(report.suites);

fs.writeFileSync(output, JSON.stringify(report));
const before = fs.statSync(input).size;
const after = fs.statSync(output).size;
console.log(
  `stripped ${stripped} attachment payloads: ${before.toLocaleString()} -> ${after.toLocaleString()} bytes ` +
    `(${(100 * (1 - after / before)).toFixed(1)}% cut)`,
);

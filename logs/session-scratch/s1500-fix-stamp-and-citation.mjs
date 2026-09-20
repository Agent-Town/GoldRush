import fs from 'node:fs';

// (1) THE STAMP — F-1039-2. I hand-wrote 00:02Z; `date` says 23:11Z. A future-dated stamp
// makes the next fire EXIT SILENTLY for the skew plus 45 minutes.
const p = 'STATUS.md';
const lines = fs.readFileSync(p, 'utf8').split('\n');
const badStamp = 'Last updated: 2026-08-07T00:02Z s1500 handoff';
const goodStamp = 'Last updated: 2026-08-06T23:11Z s1500 handoff';
if (!lines[0].startsWith(badStamp)) { console.error('stamp target not found'); process.exit(2); }
lines[0] = lines[0].replace(badStamp, goodStamp);
fs.writeFileSync(p, lines.join('\n'));
console.log('stamp corrected to a date-derived value:', /^Last updated: 2026-08-06T23:11Z/.test(lines[0]));

// (2) THE CITATION — citation-title-guard wants the test title beside the line number.
const m = 'tasks/lane-f1496-1-drill-yard-fixture-six.md';
const src = fs.readFileSync(m, 'utf8');
const bad = '2. **Update the id assertion at `e2e/agent-view.spec.ts:269`** to the six ids in registry order.';
const good =
  '2. **Update the id assertion at `e2e/agent-view.spec.ts:269`** ("all five E1 mechanics manifests match their byte-stable fixture") to the six ids in registry order.';
if (!src.includes(bad)) { console.error('citation target not found'); process.exit(2); }
fs.writeFileSync(m, src.replace(bad, good));
console.log('citation now carries its test title');

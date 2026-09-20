#!/usr/bin/env node
// F-2065-1 evidence probe — fire outcome census from logs/fire-YYYYMMDD.log.
// Answers: how often do fires die, and does a given death share ONE cause?
//
// Kept in artifacts/ rather than scripts/ deliberately (F-1665-1): scripts/ is the
// lane RUN SURFACE, and a probe that only produced evidence has no business widening
// it or adding an un-rooted gate. Re-run it from the repo root: node this-file.
//
// ⚠️ ANCHORING IS LOAD-BEARING, NOT STYLE. The fire log embeds each fire's whole
// transcript, and fires WRITE ABOUT these markers in their handoffs — so an un-anchored
// `grep -c "FIRE END"` over-counts wildly. Measured s2065 on logs/fire-20260812.log:
// un-anchored reported 427 starts / 1031 ends (more ends than starts, -613 "unterminated");
// anchored on the runner's own emitted line prefix reports 49 / 49. Always anchor.
import fs from 'node:fs';

const START = /^\[fire-runner\] (\d\d:\d\d:\d\d) FIRE START/;
const END = /^\[fire-runner\] (\d\d:\d\d:\d\d) FIRE END rc=(\d+)/;
// Emitted by the CLI itself on its own line; matched anchored for the same reason.
const TRANSPORT = /^API Error: Connection closed mid-response/;

const days = Number(process.argv[2] ?? 10);
const files = fs
  .readdirSync('logs')
  .filter((f) => /^fire-\d{8}\.log$/.test(f))
  .sort()
  .slice(-days);

const rows = [];
for (const f of files) {
  const lines = fs.readFileSync('logs/' + f, 'utf8').split('\n');
  let open = null;
  let transport = false;
  for (const l of lines) {
    const s = l.match(START);
    if (s) {
      open = s[1];
      transport = false;
      continue;
    }
    if (open && TRANSPORT.test(l)) transport = true;
    const e = l.match(END);
    if (e && open) {
      rows.push({ day: f.slice(5, 13), start: open, end: e[1], rc: e[2], transport });
      open = null;
      transport = false;
    }
  }
  // a START with no END is the fire currently running (or one killed without a marker)
  if (open) rows.push({ day: f.slice(5, 13), start: open, end: null, rc: null, transport });
}

const term = rows.filter((r) => r.rc !== null);
const ok = term.filter((r) => r.rc === '0');
const bad = term.filter((r) => r.rc !== '0');

console.log('day        term  rc=0  rc!=0  transport-error');
for (const f of files) {
  const d = f.slice(5, 13);
  const t = term.filter((r) => r.day === d);
  console.log(
    `${d}   ${String(t.length).padStart(4)}  ${String(t.filter((r) => r.rc === '0').length).padStart(4)}  ` +
      `${String(t.filter((r) => r.rc !== '0').length).padStart(5)}  ${String(t.filter((r) => r.transport).length).padStart(15)}`
  );
}
console.log(
  `\nTOTAL terminated ${term.length} — rc=0 ${ok.length} (${((100 * ok.length) / term.length).toFixed(1)}%), rc!=0 ${bad.length}`
);

console.log('\nEVERY non-zero exit, cause-attributed:');
for (const r of bad) console.log(`  ${r.day} ${r.start}->${r.end} rc=${r.rc}  transport-error=${r.transport ? 'YES' : 'no'}`);

const tp = rows.filter((r) => r.transport);
console.log(`\nfires showing the transport error at all: ${tp.length}`);
for (const r of tp) console.log(`  ${r.day} ${r.start}->${r.end ?? 'RUNNING'} rc=${r.rc ?? '-'}`);

const unterm = rows.filter((r) => r.rc === null);
if (unterm.length) {
  console.log('\nunterminated (running now, or died with no END marker):');
  for (const r of unterm) console.log(`  ${r.day} ${r.start}->RUNNING`);
}

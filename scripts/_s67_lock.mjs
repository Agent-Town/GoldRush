import { readFileSync, writeFileSync } from 'node:fs';
const p = 'STATUS.md';
const c = readFileSync(p, 'utf8');
const nl = c.indexOf('\n');
const oldLine1 = c.slice(0, nl);
const rest = c.slice(nl); // begins with \n\n- **s66 (line-1 archive):** ...
const newLine1 = 'Last updated: 2026-07-06T08:07Z ACTIVE (s67 fire) — triage A: commit attended bookkeeping (039 + lane-b-m4-06 + playtest-01 + HANDOVER assayer-loop directive + pending order); then confirm runner conclusively down (037 unpicked ~2h) — no drain possible.';
const archive = '\n\n- **s66 handoff (line-1 archive):** ' + oldLine1;
writeFileSync(p, newLine1 + archive + rest);
console.log('lock set; oldLine1 len', oldLine1.length);

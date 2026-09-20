import fs from 'node:fs';
const p = 'STATUS.md';
const lines = fs.readFileSync(p, 'utf8').split('\n');
const prev = lines[0];
const lock = 'ACTIVE 2026-08-07T01:13Z (s1504 fire) — drain priority (A) f1501-1-drill-yard-briefing from lane/a (e266bf8df, block-check CLEAR); then re-triage.';
lines[0] = lock;
lines.splice(1, 0, `- **s1503 handoff (line-1 archive):** ${prev}`);
fs.writeFileSync(p, lines.join('\n'));
console.log('ok');

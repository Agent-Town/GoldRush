import { readFileSync, writeFileSync } from 'node:fs';

const P = 'STATUS.md';
const lines = readFileSync(P, 'utf8').split('\n');
// Stash the finished handoff prose so the final act can restore it verbatim.
writeFileSync('logs/session-scratch/s1238-handoff-line.txt', lines[0]);
lines[0] =
  'Last updated: ACTIVE 2026-07-30T03:24Z (s1238 fire) — handoff drafted, then the runner shipped guard-fx-02 in 9 min; re-arming the lock to drain it (lane/m3 4b1638a6, +58/-2, one file)';
writeFileSync(P, lines.join('\n'));
console.log('re-armed; handoff prose stashed to logs/session-scratch/s1238-handoff-line.txt');

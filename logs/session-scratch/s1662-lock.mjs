import { readFileSync, writeFileSync } from 'node:fs';
const P = 'STATUS.md';
const raw = readFileSync(P, 'utf8');
const nl = raw.indexOf('\n');
const line1 = raw.slice(0, nl);
writeFileSync('logs/session-scratch/s1661-line1.txt', line1);
const lock = 'ACTIVE 2026-08-11T16:19Z (s1662 fire) — draining f1660-1 (door readmission repair, lane/b, HOLDS 8 paths) in a detached scratch worktree per s1661 NEXT(A); lane-a f1643-2 still live at 2h44m so the battery is serialized/niced against its flake-rate snapshot.';
writeFileSync(P, lock + raw.slice(nl));
console.log('saved', line1.length, 'chars; lock written');

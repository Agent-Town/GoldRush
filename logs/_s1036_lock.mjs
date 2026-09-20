import { readFileSync, writeFileSync } from 'node:fs';

const p = '/Users/robin/Claude/Projects/Gold Rush/STATUS.md';
const lines = readFileSync(p, 'utf8').split('\n');

const prev = lines[0];
if (!prev.startsWith('Last updated:')) {
  console.error('UNEXPECTED line-1 shape; aborting:', prev.slice(0, 80));
  process.exit(1);
}

const active = 'ACTIVE 2026-07-25T09:12Z (s1036 fire) — lane-c geometry-settle came back a ZERO-DIFF no-op (3 min / 91k tok, died after pre-flight); verify it, re-queue once, author lane-a’s perf-05 measurement master';
const archive = '- **s1035 handoff (line-1 archive):** ' + prev;

lines.splice(0, 1, active, archive);
writeFileSync(p, lines.join('\n'));
console.log('line-1 -> ACTIVE; s1035 archived as line-2');

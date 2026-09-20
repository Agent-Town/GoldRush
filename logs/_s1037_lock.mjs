import { readFileSync, writeFileSync } from 'node:fs';

const p = '/Users/robin/Claude/Projects/Gold Rush/STATUS.md';
const lines = readFileSync(p, 'utf8').split('\n');

const prev = lines[0];
if (!prev.startsWith('Last updated:')) {
  console.error('UNEXPECTED line-1 shape; aborting:', prev.slice(0, 80));
  process.exit(1);
}

const active = 'ACTIVE 2026-07-25T09:40Z (s1037 fire) — CODEX-WALL held at 09:23Z: probe it, and whatever it says, author lane-a’s perf-05 measurement master (Claude-side, queue only if the wall lifts)';
const archive = '- **s1036 handoff (line-1 archive):** ' + prev;

lines.splice(0, 1, active, archive);
writeFileSync(p, lines.join('\n'));
console.log('line-1 -> ACTIVE (s1037); s1036 archived as line-2');

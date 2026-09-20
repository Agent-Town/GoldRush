import { readFileSync, writeFileSync } from 'node:fs';

const backlog = 'tasks/BACKLOG.md';
const rowPath = 'logs/session-scratch/s1283/f-1283-1-row.md';
const anchor = '\u{1F7E1} **F-1281-2';

const row = readFileSync(rowPath, 'utf8').trim();
const lines = readFileSync(backlog, 'utf8').split('\n');

if (lines.some((l) => l.includes('F-1283-1'))) {
  console.log('ALREADY PRESENT — no change (idempotent)');
  process.exit(0);
}

const at = lines.findIndex((l) => l.startsWith(anchor));
if (at < 0) throw new Error('anchor not found: ' + anchor);

lines.splice(at, 0, row, '');
writeFileSync(backlog, lines.join('\n'));
console.log('inserted F-1283-1 before line', at + 1);

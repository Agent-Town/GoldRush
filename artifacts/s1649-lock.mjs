import { readFileSync, writeFileSync } from 'node:fs';

const P = 'STATUS.md';
const lines = readFileSync(P, 'utf8').split('\n');
const prev = lines[0];
if (!prev.includes('s1648 handoff')) {
  console.error('REFUSE: line-1 is not s1648 handoff:', prev.slice(0, 120));
  process.exit(2);
}
import { execFileSync } from 'node:child_process';
// Stamp from the command, never from arithmetic (fire.md §1.3).
const stamp = execFileSync('date', ['+%Y-%m-%dT%H:%MZ'], { encoding: 'utf8' }).trim();
const lock = `ACTIVE ${stamp} (s1649 fire) — board DRY (no drains, all queues empty, runner UP 57599); first fire past 06:00 so the TK-01 daily digest for 2026-08-10 is owed, then author from a spec slice into an idle lane.`;
const archive = `- **s1648 handoff (line-1 archive):** ${prev}`;
const out = [lock, archive, ...lines.slice(1)].join('\n');
writeFileSync(P, out);
console.log('OK line1 replaced; archive bullet inserted at line 2');

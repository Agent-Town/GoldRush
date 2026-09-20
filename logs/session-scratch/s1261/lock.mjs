#!/usr/bin/env node
// s1261 — take the lock; save the previous line-1 (s1260's handoff) for archiving at handoff time.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

mkdirSync('logs/session-scratch/s1261', { recursive: true });
const lines = readFileSync('STATUS.md', 'utf8').split('\n');
writeFileSync('logs/session-scratch/s1261/prev-line1.txt', lines[0]);

lines[0] =
  'ACTIVE 2026-07-30T16:13Z (s1261 fire) — s1260 died to ECONNRESET at 15:58 five minutes after authoring its handoff; landed that handoff verbatim. Board proven dry by branch sweep (both lanes false-ahead, zero files added). Now: triage the 5 stopped masters for a changed-premise re-queue + strike the 14 measured-stale findings rows.';

writeFileSync('STATUS.md', lines.join('\n'));
console.log(`locked (${lines[0].length} chars); prev line-1 saved (${lines[1] === '' ? 'blank next' : 'check'})`);

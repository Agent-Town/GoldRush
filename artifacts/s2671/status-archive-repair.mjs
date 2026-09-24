#!/usr/bin/env node
/**
 * s2671 — REPAIR: restore the s2670 handoff line-1 archive bullet.
 *
 * WHAT I DID WRONG, recorded because the next fire will be tempted the same way:
 * I took the lock with `status-line1.mjs set`, which REPLACES line 1 and archives
 * nothing. Every predecessor in this file archived the line it displaced (line 3
 * is "s2670 lock (line-1 archive)", line 5 "s2669 lock", line 6 "s2668 handoff"),
 * so the convention is per-REWRITE, not per-handoff — and `set` silently drops it.
 * s2670's handoff line, 7,974 chars INCLUDING THE OWNER'S DESK TAIL, went with it.
 *
 * Recovered verbatim from 452e79707:STATUS.md (git had it; STATUS did not).
 * The fix for the next fire is the tool, not vigilance: use
 *   node scripts/status-line1.mjs handoff <textfile> <label>
 * which archives the displaced line by construction.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const FILE = new URL('../../STATUS.md', import.meta.url);
const RECOVERED = readFileSync(new URL('./s2670-handoff-line1.txt', import.meta.url), 'utf8').replace(/\n+$/, '');
const BULLET = `- **s2670 handoff (line-1 archive):** ${RECOVERED}`;

const text = readFileSync(FILE, 'utf8');
const lines = text.split('\n');

if (!lines[0].startsWith('ACTIVE 2026-09-24T20:26Z (s2671 fire)')) {
  throw new Error(`REFUSING: line 1 is not this fire's lock: ${lines[0].slice(0, 80)}`);
}
if (!lines[2].startsWith('- **s2670 lock (line-1 archive):**')) {
  throw new Error(`REFUSING: line 3 is not the s2670 lock archive: ${lines[2].slice(0, 80)}`);
}
if (text.includes('- **s2670 handoff (line-1 archive):**')) {
  throw new Error('REFUSING: the s2670 handoff bullet is already present — nothing to repair');
}
if (RECOVERED.includes('\n')) throw new Error('REFUSING: the recovered line is not one line');
if (!RECOVERED.includes("OWNER'S DESK — 3 awaiting a word.")) {
  throw new Error('REFUSING: the recovered line does not carry the desk tail; wrong blob');
}

lines.splice(2, 0, BULLET);
writeFileSync(FILE, lines.join('\n'));

const after = readFileSync(FILE, 'utf8').split('\n');
console.log('line 1 :', after[0].slice(0, 90));
console.log('line 3 :', after[2].slice(0, 90));
console.log('line 4 :', after[3].slice(0, 90));
console.log('desk restored to the archive:', after[2].includes("OWNER'S DESK — 3 awaiting a word."));
console.log('lines  :', after.length, '(was', lines.length - 1, ')');

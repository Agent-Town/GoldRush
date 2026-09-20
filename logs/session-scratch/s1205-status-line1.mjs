#!/usr/bin/env node
// s1205 — rewrite STATUS.md line-1, archiving the previous line-1 as a bullet at line 2.
//
// DIFFERENCE FROM s1204-status-line1.mjs, AND THE WHOLE POINT OF THIS FILE:
// the STAMP IS GENERATED HERE, never authored by the caller. F-1039-2 has now been
// recorded FIVE times (s1038 +46 min, s1046 +56/+50, s1053 +14, s1204 +38) — every
// instance a model hand-computing a time it could have run a command for, and s1204's
// was written by a fire that had just re-read the rule forbidding it. A future-dated
// stamp makes the next fire EXIT SILENTLY (protocol §1.1) for the skew plus 45 minutes.
// s1204's own handoff named the durable fix: "the number cannot be authored by a model
// at all." This is that fix. Pass INTENT TEXT ONLY; the {STAMP} is substituted below.
//
// Usage:
//   node s1205-status-line1.mjs lock    <intent-file>  <session>  <archive-label>
//   node s1205-status-line1.mjs handoff <body-file>    <session>  <archive-label>
//   node s1205-status-line1.mjs refresh <intent-file>  <session>            # no archive; replaces a live ACTIVE line
//
// The file's contents may contain the literal token {STAMP}; if it does not, the stamp
// is prefixed per the house format. Written per the RETENTION LAW (probes are committed).
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const [, , mode, bodyFile, session, archiveLabel] = process.argv;
const MODES = new Set(['lock', 'handoff', 'refresh']);
if (!MODES.has(mode) || !bodyFile || !session) {
  console.error('usage: node s1205-status-line1.mjs <lock|handoff|refresh> <body-file> <session> [archive-label]');
  process.exit(2);
}
if (mode !== 'refresh' && !archiveLabel) {
  console.error('lock/handoff require an <archive-label> for the outgoing line-1');
  process.exit(2);
}

// THE STAMP: from the same command the protocol names, not from arithmetic.
// Local time labelled Z, matching every recent fire (protocol §1.1: continuity over
// correctness here; the label is fixed on a flag day, never as a drive-by).
const stamp = execFileSync('date', ['+%Y-%m-%dT%H:%MZ'], { encoding: 'utf8' }).trim();
if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}Z$/.test(stamp)) {
  console.error(`refusing to write a malformed stamp: ${JSON.stringify(stamp)}`);
  process.exit(2);
}

const body = readFileSync(bodyFile, 'utf8').replace(/\n+$/, '').trim();
if (!body) {
  console.error('refusing to write an empty line-1');
  process.exit(2);
}

let newFirst;
if (body.includes('{STAMP}')) {
  newFirst = body.replaceAll('{STAMP}', stamp);
} else if (mode === 'handoff') {
  newFirst = `Last updated: ${stamp} ${session} handoff, lock CLEARED — ${body}`;
} else {
  newFirst = `ACTIVE ${stamp} (${session} fire) — ${body}`;
}

const STATUS = 'STATUS.md';
const lines = readFileSync(STATUS, 'utf8').split('\n');
const oldFirst = lines[0];

let out;
if (mode === 'refresh') {
  // A refresh REPLACES our own live ACTIVE line; archiving it would litter STATUS.md
  // with one bullet per drain (STATUS bloat is itself a recorded hazard).
  if (!oldFirst.startsWith('ACTIVE')) {
    console.error(`refuse: refresh expects a live ACTIVE line-1, found: ${oldFirst.slice(0, 60)}...`);
    process.exit(2);
  }
  out = [newFirst, ...lines.slice(1)].join('\n');
} else {
  out = [newFirst, `- **${archiveLabel} (line-1 archive):** ${oldFirst}`, ...lines.slice(1)].join('\n');
}
writeFileSync(STATUS, out);

console.log(`[${mode}] stamp=${stamp} (from \`date\`, not arithmetic)`);
console.log(`line-1 = ${newFirst.slice(0, 140)}${newFirst.length > 140 ? '…' : ''}`);
if (mode !== 'refresh') console.log(`archived previous line-1 as "${archiveLabel}" (${oldFirst.length} chars)`);

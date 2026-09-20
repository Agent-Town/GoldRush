#!/usr/bin/env node
// s1277 — would a "co-citation" cross-check have caught F-1088-2, and at what noise cost?
//
// THE MISS THIS MODELS: s1155 closed F-1154-5 + F-1150-3 with one commit and its own headline
// said "found TWICE". It was found THREE times — F-1088-2 recorded the same symptom at s1088.
// The two it caught are adjacent (BACKLOG:457-458); the one it missed is at :1623.
//
// CANDIDATE RULE: an OPEN finding that cites the same source file as a CLOSED finding is a
// candidate stale-open row.
//
// This is a NOISE PROBE, not a guard. Ship nothing until the false-positive rate is known.

import fs from 'node:fs';

const text = fs.readFileSync('tasks/BACKLOG.md', 'utf8');
const SUBJECT_CHARS = 90;
const FINDING = /\bF-\d+-\d+\b/g;
// a cited source file: a basename with a code-ish extension, usually inside backticks
const FILE_RE = /\b([A-Za-z0-9._-]+\.(?:mjs|ts|tsx|js|json|sh))\b/g;

const rows = [];
for (const [i, line] of text.split('\n').entries()) {
  const subject = line.slice(0, SUBJECT_CHARS);
  const lead = line.trimStart();
  const struck =
    /^[^A-Za-z0-9]*~~/.test(lead) || /✅\s*(?:CLOSED|RETIRED)/i.test(subject) || /struck s\d+/i.test(subject);
  if (!lead.startsWith('🟡') && !lead.startsWith('✅') && !struck) continue;
  const state = lead.startsWith('✅') || struck ? 'closed' : 'open';
  const ids = [...new Set(subject.match(FINDING) || [])];
  if (!ids.length) continue;
  const files = [...new Set([...line.matchAll(FILE_RE)].map((m) => m[1]))];
  rows.push({ line: i + 1, state, ids, files });
}

const open = rows.filter((r) => r.state === 'open');
const closed = rows.filter((r) => r.state === 'closed');

// how often is a file cited at all? a file cited by many rows is a hub and pure noise
const closedFileCount = new Map();
for (const r of closed) for (const f of r.files) closedFileCount.set(f, (closedFileCount.get(f) || 0) + 1);

console.log(`rows: ${rows.length}  open: ${open.length}  closed: ${closed.length}`);
console.log(`distinct files cited by closed rows: ${closedFileCount.size}\n`);

let hits = 0;
for (const o of open) {
  const shared = o.files.filter((f) => closedFileCount.has(f));
  if (!shared.length) continue;
  hits += 1;
  const detail = shared
    .map((f) => `${f} (cited by ${closedFileCount.get(f)} closed row${closedFileCount.get(f) > 1 ? 's' : ''})`)
    .join(', ');
  console.log(`L${o.line} ${o.ids.join('/')} -> ${detail}`);
}
console.log(`\nCANDIDATES: ${hits} of ${open.length} open rows would be flagged.`);

// the decisive question: is the noise concentrated in hub files?
const hubs = [...closedFileCount.entries()].filter(([, n]) => n >= 3).sort((a, b) => b[1] - a[1]);
console.log(`\nhub files (cited by >=3 closed rows), the likely noise source:`);
for (const [f, n] of hubs.slice(0, 12)) console.log(`  ${f}: ${n}`);

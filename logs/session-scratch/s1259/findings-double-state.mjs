#!/usr/bin/env node
// s1259 — INDEPENDENT probe of the double-state class the lane-b findings-state-guard
// is being built to gate. Written WITHOUT reading that guard's implementation (it does not
// exist on main yet), from the master's stated discriminator only, so it can disagree with it.
//
// The question this asks that the master's table may not: the master frames the naive parse as
// "F-ID on a ✅ line and on a 🟡 line". This ledger's open-state vocabulary is NOT just 🟡.
// So we enumerate the glyph vocabulary of declaring lines and report double-state under BOTH
// a narrow (🟡-only) and a broad (any non-closed glyph) reading of "open".
//
// Usage: node findings-double-state.mjs [--root <dir>] [--blob <git-rev>]
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const argv = process.argv.slice(2);
const rootIdx = argv.indexOf('--root');
const blobIdx = argv.indexOf('--blob');
const root = rootIdx >= 0 ? argv[rootIdx + 1] : '.';
const blob = blobIdx >= 0 ? argv[blobIdx + 1] : null;

const text = blob
  ? execFileSync('git', ['show', `${blob}:tasks/BACKLOG.md`], { cwd: root, maxBuffer: 1 << 28 }).toString()
  : readFileSync(`${root}/tasks/BACKLOG.md`, 'utf8');

const SUBJECT_ZONE = 140;
const FID = /F-\d{3,4}-\d+/g;

// A line is CLOSED-declaring when its subject zone carries a closure verb/glyph.
const CLOSED_RE = /✅|⛔\s*CLOSED|SHIPPED|CLOSED|RETIRED|ANSWERED|DISCHARGED|struck s\d+/i;
const STRUCK_RE = /~~/;

const lines = text.split('\n');
const decls = new Map(); // fid -> [{line, glyph, cls, zone}]
const glyphTally = new Map();

// leading status glyph = first non-ascii pictograph in the first ~12 chars
const GLYPH_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{1F000}-\u{1F2FF}]/u;

for (let i = 0; i < lines.length; i++) {
  const raw = lines[i];
  const zone = raw.slice(0, SUBJECT_ZONE);
  // A line DECLARES only its LEADING F-ID. The house convention is `<glyph> **F-nnnn-n — subject`;
  // any later F-ID in the zone is a cross-reference to another finding, not a status claim about it.
  // (s1259: measured — admitting every F-ID in the zone inflates the count 60 -> see report.)
  // The house convention is `<bullet><glyph> **F-nnnn-n — subject`: a line declares a finding only
  // when the F-ID OPENS the bolded subject. s1259 measured all three rules on the same file:
  //   any F-ID in the 140-char zone -> 60 double-state (inflated by prose cross-citation)
  //   the zone's FIRST F-ID        -> 41 (still admits `DUTIES ... (F-1068-1)` passing mentions)
  //   the F-ID that OPENS the subject -> the number reported below.
  const decl = zone.match(/^[\s\-*>~`]*(?:<br>|<sub>|<\/sub>|<details>|<summary>)*[\s\-*>~`]*[^\sA-Za-z0-9]{0,4}[\s]*\**\s*~*\s*\**\s*(F-\d{3,4}-\d+)/u);
  const ids = decl ? [decl[1]] : [];
  if (!ids.length) continue;
  const head = raw.slice(0, 14);
  const gm = head.match(GLYPH_RE);
  const glyph = gm ? gm[0] : '(none)';
  const struck = STRUCK_RE.test(zone);
  const closed = struck || CLOSED_RE.test(zone);
  const cls = closed ? (struck ? 'STRUCK' : 'CLOSED') : 'OPEN';
  glyphTally.set(`${glyph} ${cls}`, (glyphTally.get(`${glyph} ${cls}`) ?? 0) + 1);
  for (const id of ids) {
    if (!decls.has(id)) decls.set(id, []);
    decls.get(id).push({ line: i + 1, glyph, cls, zone: zone.slice(0, 110) });
  }
}

console.log(`subject-zone declarations: ${decls.size} distinct F-IDs across ${lines.length} lines`);
console.log('\n--- glyph x class vocabulary of DECLARING lines ---');
for (const [k, v] of [...glyphTally.entries()].sort((a, b) => b[1] - a[1])) console.log(`  ${String(v).padStart(3)}  ${k}`);

const broad = [];
const narrow = [];
for (const [id, rows] of decls) {
  const closed = rows.filter((r) => r.cls !== 'OPEN');
  const open = rows.filter((r) => r.cls === 'OPEN');
  if (!closed.length || !open.length) continue;
  broad.push({ id, closed, open });
  if (open.some((r) => r.glyph === '🟡')) narrow.push(id);
}

// Not every open-looking line beside a closure is the HARMFUL half-retired shape. This ledger
// lawfully retains originals (Retention Law) and records workflow history ("CLAIMED sNNNN:
// authored + queued"). Those SELF-LOCATE: they tell the reader they are not a live status claim.
// The harmful shape is an open declaration that self-locates NOWHERE — the F-1258-4 / F-1152-1 shape.
const BENIGN_RE = /\(original|original entry|original text|original finding|RETENTION LAW|Retention Law|SUPERSEDED|superseded by|CLAIMED s\d+|AUTHORED|QUEUED|ACTIONED|RETIRED|see the .{0,30}above|see L\d+|struck s\d+|~~|RECURRED|was authored/i;
for (const b of broad) {
  b.harmful = b.open.filter((o) => !BENIGN_RE.test(o.zone));
}
const harmful = broad.filter((b) => b.harmful.length);
console.log(`\n=== HARMFUL SHAPE (open declaration that self-locates nowhere): ${harmful.length} of ${broad.length} broad ===`);
for (const { id, closed, harmful: h } of harmful.sort((a, b) => a.id.localeCompare(b.id))) {
  console.log(`\n${id}`);
  for (const c of closed) console.log(`   CLOSED L${c.line} ${c.glyph}  ${c.zone.slice(0, 100)}`);
  for (const o of h) console.log(`   OPEN!  L${o.line} ${o.glyph}  ${o.zone.slice(0, 100)}`);
}

console.log(`\n=== DOUBLE-STATE, BROAD reading (any non-closed glyph counts as open): ${broad.length} ===`);
for (const { id, closed, open } of broad.sort((a, b) => a.id.localeCompare(b.id))) {
  console.log(`\n${id}`);
  for (const c of closed) console.log(`   CLOSED L${c.line} ${c.glyph}  ${c.zone}`);
  for (const o of open) console.log(`   OPEN   L${o.line} ${o.glyph}  ${o.zone}`);
}
console.log(`\n=== DOUBLE-STATE, NARROW reading (open must be 🟡): ${narrow.length} === ${narrow.join(', ')}`);

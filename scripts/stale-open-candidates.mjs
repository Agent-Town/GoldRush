#!/usr/bin/env node
// stale-open-candidates — which OPEN findings might already have been cured?
//
// WHY THIS EXISTS (F-1277-2, s1277)
//   The same defect in `scripts/stream-showcase-queue.test.mjs` was recorded THREE times:
//   F-1088-2 (s1088), F-1150-3 (s1150), F-1154-5 (s1154). One commit (`4abb88a1`) fixed it,
//   and s1155's closure struck two of the three — its own headline reads "ONE DEFECT, FOUND
//   TWICE". The two it caught are adjacent in BACKLOG (L457-L458); the one it missed is 1165
//   lines away. Proximity, not thoroughness, decided that closure's completeness, and
//   F-1088-2 then advertised a cured defect as live guidance for three days.
//
//   `findings-state-guard` cannot catch this class. It keys on the FINDING ID and reds when
//   one ID is declared both open and closed. Here the cure shipped under a DIFFERENT id, so
//   F-1088-2 was never double-stated — it was simply never closed. The signal that was
//   actually available is that the open row and the closed rows cite the SAME FILE.
//
// WHY IT IS ADVISORY AND ALWAYS EXITS 0 — READ BEFORE "FIXING" THAT
//   Measured at introduction: 6 of 15 open rows flagged, 1 confirmed stale. Precision is low
//   because ledger rows cite hub files (playwright.config.ts appears in 16 closed rows,
//   Game.ts in 9). A gate that reds on 40% of open rows, mostly wrongly, is ignored within
//   two fires and is worse than no gate. This turns 115 rows into a hand-checkable shortlist;
//   that is its whole job. A FLAG IS A QUESTION, NOT A VERDICT — F-1276-3 flags here and is
//   legitimately open (deferred on live-process safety).
//
// USAGE
//   node scripts/stale-open-candidates.mjs
//   node scripts/stale-open-candidates.mjs --hub-threshold 3   (demote files this widely cited)
//   node scripts/stale-open-candidates.mjs --all               (do not demote hubs at all)

import fs from 'node:fs';
import path from 'node:path';

function arg(flag, fallback) {
  const i = process.argv.indexOf(flag);
  return i === -1 ? fallback : process.argv[i + 1];
}

const ROOT = arg('--root', process.cwd());
const HUB_THRESHOLD = Number(arg('--hub-threshold', 3));
const SHOW_ALL = process.argv.includes('--all');

const BACKLOG = path.join(ROOT, 'tasks/BACKLOG.md');
if (!fs.existsSync(BACKLOG)) {
  console.error(`stale-open-candidates: no BACKLOG at ${BACKLOG}`);
  process.exit(0); // advisory: never block a drain on our own absence
}

// Same row vocabulary as findings-state-guard, deliberately: a leading 🟡 is open unless
// struck; a leading ✅ or a struck 🟡 is closed. The 90-char subject zone is that guard's
// measured value — widening it reaches prose citations and invents state claims.
const SUBJECT_CHARS = 90;
const FINDING = /\bF-\d+-\d+\b/g;
const FILE_RE = /\b([A-Za-z0-9._-]+\.(?:mjs|ts|tsx|js|json|sh))\b/g;

const rows = [];
for (const [i, line] of fs.readFileSync(BACKLOG, 'utf8').split('\n').entries()) {
  const subject = line.slice(0, SUBJECT_CHARS);
  const lead = line.trimStart();
  const struck =
    /^[^A-Za-z0-9]*~~/.test(lead) ||
    /✅\s*(?:CLOSED|RETIRED)/i.test(subject) ||
    /struck s\d+/i.test(subject);
  if (!lead.startsWith('🟡') && !lead.startsWith('✅') && !struck) continue;
  const ids = [...new Set(subject.match(FINDING) || [])];
  if (!ids.length) continue;
  rows.push({
    line: i + 1,
    state: lead.startsWith('✅') || struck ? 'closed' : 'open',
    ids,
    files: [...new Set([...line.matchAll(FILE_RE)].map((m) => m[1]))],
  });
}

const open = rows.filter((r) => r.state === 'open');
const closed = rows.filter((r) => r.state === 'closed');

const closedByFile = new Map();
for (const r of closed) {
  for (const f of r.files) {
    if (!closedByFile.has(f)) closedByFile.set(f, []);
    closedByFile.get(f).push(r);
  }
}

const candidates = [];
for (const o of open) {
  const shared = o.files
    .filter((f) => closedByFile.has(f))
    .map((f) => ({ file: f, closers: closedByFile.get(f) }))
    .filter((s) => (SHOW_ALL ? true : s.closers.length < HUB_THRESHOLD));
  if (shared.length) candidates.push({ ...o, shared });
}

// tightest evidence first: a file cited by exactly one closed row is the strongest signal
candidates.sort(
  (a, b) =>
    Math.min(...a.shared.map((s) => s.closers.length)) - Math.min(...b.shared.map((s) => s.closers.length)),
);

console.log('stale-open-candidates — open findings whose file already appears in a CLOSED row');
console.log(`  ledger rows : ${rows.length}  (open ${open.length} · closed ${closed.length})`);
console.log(`  hub demotion: files cited by >= ${HUB_THRESHOLD} closed rows${SHOW_ALL ? ' (DISABLED via --all)' : ''}\n`);

if (!candidates.length) {
  console.log('no candidates — every open finding cites files no closed finding touches.');
} else {
  for (const c of candidates) {
    console.log(`BACKLOG:${c.line}  ${c.ids.join(' / ')}`);
    for (const s of c.shared) {
      const who = [...new Set(s.closers.flatMap((r) => r.ids))].join(', ');
      console.log(`    ${s.file} — also cited by ${s.closers.length} closed row(s): ${who}`);
    }
  }
}

console.log(
  `\n${candidates.length} candidate(s) of ${open.length} open rows. ` +
    'ADVISORY ONLY — read the cited code and decide; a flag is a question, not a verdict.',
);
process.exit(0);

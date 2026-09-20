#!/usr/bin/env node
/**
 * s1533 scratch probe — F-1532-1's INVERSE question.
 *
 * desk-declaration-guard asks: does every DESK item have a BACKLOG row?
 * F-1532-1 asks the other direction: does every BACKLOG row that declares an
 * OPEN owner fork appear on the LIVE handoff desk? F-1167-1 did not, for ~10 days.
 *
 * This probe MEASURES the candidate predicate before anyone builds a gate on it
 * (the "run the predicate on the live corpus first" rule). It prints every
 * candidate so the count can be read by a human, not just trusted.
 */
import fs from 'node:fs';

const ROOT = process.cwd();
const backlog = fs.readFileSync(`${ROOT}/tasks/BACKLOG.md`, 'utf8').split('\n');
const status = fs.readFileSync(`${ROOT}/STATUS.md`, 'utf8').split('\n');

const FINDING = /F-[A-Z0-9]{2,4}-\d+|F-\d{3,4}-\d+/g;
const SUBJECT = 90;
const DESK_WORD = /OWNER(?:'S|’S|S)? DESK/;

// --- the live desk. line-1 is my ACTIVE lock right now, so read s1532's
// archived handoff bullet, which IS the desk currently in force.
const deskLine =
  status.find((l) => l.startsWith('- **s1532 handoff (line-1 archive):**')) || '';
const hits = [...deskLine.matchAll(new RegExp(DESK_WORD.source, 'g'))];
const deskTail = hits.length ? deskLine.slice(hits[hits.length - 1].index) : '';
const deskIds = new Set(deskTail.match(FINDING) || []);
console.log('live desk (s1532) ids:', deskIds.size, [...deskIds].join(' '));
console.log('');

// --- candidate BACKLOG rows: the desk word inside the subject zone.
const OPEN_GLYPH = /^(🔺|🟡|🔵|👑|🟣|🟠|🔴|🔻)/;
const CLOSED_GLYPH = /^(✅|🟢|✍️|💾|🩺|🧹|🛑|⏳|~~)/;

const rows = [];
backlog.forEach((line, i) => {
  const body = line.trim().replace(/^[-*]\s+/, '');
  const zone = body.slice(0, SUBJECT);
  if (!DESK_WORD.test(zone)) return;
  const ids = zone.match(FINDING) || [];
  rows.push({
    n: i + 1,
    id: ids[0] || null,
    open: OPEN_GLYPH.test(body),
    closed: CLOSED_GLYPH.test(body),
    struck: body.includes('~~'),
    onDesk: ids[0] ? deskIds.has(ids[0]) : null,
    text: zone,
  });
});

console.log(`rows with a desk word in the first ${SUBJECT} chars: ${rows.length}`);
console.log('');
for (const r of rows) {
  const state = r.open ? 'OPEN ' : r.closed ? 'closed' : '?????';
  const desk = r.id === null ? 'no-id' : r.onDesk ? 'ON-DESK' : 'ABSENT';
  console.log(`${String(r.n).padStart(5)} ${state} ${desk.padEnd(8)} ${r.id || '-'}  ${r.text.slice(0, 70)}`);
}

console.log('');
const openWithId = rows.filter((r) => r.open && r.id && !r.struck);
const absent = openWithId.filter((r) => !r.onDesk);
console.log(`OPEN-glyph rows with an F-ID : ${openWithId.length}`);
console.log(`  of those ABSENT from the desk: ${absent.length}`);
for (const r of absent) console.log(`    BACKLOG:${r.n}  ${r.id}`);

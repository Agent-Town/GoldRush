#!/usr/bin/env node
/**
 * s1533 scratch — for each ledger-declared owner item, WHEN did it last appear
 * on a handoff desk? "Absent today" is cheap; "absent for N fires" is the finding.
 *
 * STATUS.md carries ~1250 archived line-1s, each ending in its own desk tail.
 * Walk them all, extract each desk's F-IDs, and record the highest session
 * number that carried each id.
 */
import fs from 'node:fs';

const ROOT = process.cwd();
const status = fs.readFileSync(`${ROOT}/STATUS.md`, 'utf8').split('\n');

const FINDING = /F-[A-Z0-9]{2,4}-\d+|F-\d{3,4}-\d+/g;
const DESK_WORD = /OWNER(?:'S|’S|S)? DESK/g;

// Every line that is (or was) a line-1: the live line 1 plus every archive bullet.
const lastSeen = new Map(); // id -> session number
let desksRead = 0;
let deskless = 0;

for (const [i, line] of status.entries()) {
  let session = null;
  if (i === 0) session = Infinity; // the live line-1
  else {
    const m = line.match(/^- \*\*s(\d+) (?:handoff \(line-1 archive\)|lock line \(archived\))/);
    if (!m) continue;
    session = Number(m[1]);
  }
  const hits = [...line.matchAll(DESK_WORD)];
  if (!hits.length) { deskless++; continue; }
  desksRead++;
  const tail = line.slice(hits[hits.length - 1].index);
  for (const id of new Set(tail.match(FINDING) || [])) {
    if (!lastSeen.has(id) || lastSeen.get(id) < session) lastSeen.set(id, session);
  }
}

console.log(`archived line-1s with a desk tail: ${desksRead} · without: ${deskless}`);
console.log('');

const CANDIDATES = [
  'F-1279-2', 'F-1285-4', 'F-1284-1', 'F-1242-1', 'F-1225-1', 'F-1180-3',
  'F-1179-4', 'F-1167-3', 'F-1173-2', 'F-1113-5', 'F-1329-1', 'F-1332-2',
  'F-1331-4', 'F-1328-3', 'F-1334-2', 'F-1120-2', 'F-1193-2', 'F-1193-3',
  'F-1204-1', 'F-1208-3', 'F-1209-3', 'F-1254-3', 'F-1182-2', 'F-1335-2',
  'F-1368-1', 'F-1096-2', 'F-1167-1',
];

const NOW = 1532; // the most recent handoff desk
const rows = CANDIDATES.map((id) => ({ id, last: lastSeen.get(id) ?? null }));
rows.sort((a, b) => (b.last ?? -1) - (a.last ?? -1));
for (const r of rows) {
  const gap = r.last === null ? 'NEVER' : `${NOW - r.last} fires ago`;
  console.log(`${r.id.padEnd(10)} last on a desk: ${String(r.last ?? '—').padEnd(6)} (${gap})`);
}

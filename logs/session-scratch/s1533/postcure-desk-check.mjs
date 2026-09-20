#!/usr/bin/env node
/**
 * s1533 scratch, CORRECTED — the first pass counted "desks" from the headerless
 * era (s1415-s1469, F-1472-1), where the tail-slice heuristic scoops an entire
 * NEXT: paragraph and reports 145 F-IDs. That is the very misread F-1471-3 cured.
 *
 * Ask the question only of desks written AFTER the header was mechanised (s1470+),
 * where a desk tail is a real desk.
 */
import fs from 'node:fs';

const status = fs.readFileSync(`${process.cwd()}/STATUS.md`, 'utf8').split('\n');
const FINDING = /F-[A-Z0-9]{2,4}-\d+|F-\d{3,4}-\d+/g;
const DESK_WORD = /OWNER(?:'S|’S|S)? DESK/g;

const seenSince = new Map(); // id -> [sessions]
let desks = 0;
for (const line of status) {
  const m = line.match(/^- \*\*s(\d+) handoff \(line-1 archive\)/);
  if (!m) continue;
  const s = Number(m[1]);
  if (s < 1470) continue;
  const hits = [...line.matchAll(DESK_WORD)];
  if (!hits.length) continue;
  desks++;
  const tail = line.slice(hits[hits.length - 1].index);
  for (const id of new Set(tail.match(FINDING) || [])) {
    if (!seenSince.has(id)) seenSince.set(id, []);
    seenSince.get(id).push(s);
  }
}
console.log(`real desks read (s1470..s1532): ${desks}`);
console.log(`distinct ids ever on one of them: ${seenSince.size}`);
console.log('');

const CANDIDATES = [
  'F-1279-2', 'F-1285-4', 'F-1284-1', 'F-1242-1', 'F-1225-1', 'F-1180-3',
  'F-1179-4', 'F-1167-3', 'F-1173-2', 'F-1113-5', 'F-1329-1', 'F-1332-2',
  'F-1331-4', 'F-1328-3', 'F-1334-2', 'F-1120-2', 'F-1193-2', 'F-1193-3',
  'F-1204-1', 'F-1208-3', 'F-1209-3', 'F-1254-3', 'F-1182-2', 'F-1335-2',
  'F-1368-1', 'F-1096-2', 'F-1167-1',
];

const never = [];
for (const id of CANDIDATES) {
  const hits = seenSince.get(id);
  if (!hits) { never.push(id); continue; }
  const last = Math.max(...hits);
  console.log(`${id.padEnd(10)} on ${String(hits.length).padStart(2)} post-cure desk(s), last s${last}`);
}
console.log('');
console.log(`NEVER on a post-cure desk (s1470..s1532): ${never.length} of ${CANDIDATES.length}`);
for (const id of never) console.log(`  ${id}`);

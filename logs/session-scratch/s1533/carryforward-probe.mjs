#!/usr/bin/env node
/**
 * s1533 scratch — THE CORRECTED QUESTION.
 *
 * First hypothesis (refuted): fires declare owner forks without desking them.
 * FALSE — F-1167-1 rode 40 consecutive desks, F-1120-2 rode 168, F-1328-3 rode 83.
 * Every one was declared AND desked by its own fire.
 *
 * So the defect is DESK CARRY-FORWARD: an item correctly on fire N's desk is
 * silently absent from fire N+1's, with no closure anywhere in the ledger.
 * Measure that directly across the post-cure era (s1470+, where a desk tail is
 * a real desk), and use findings-state-guard's canonical closure vocabulary
 * rather than a second implementation (F-1261-1).
 */
import fs from 'node:fs';
import { scan } from '../../../scripts/findings-state-guard.mjs';

const ROOT = process.cwd();
const status = fs.readFileSync(`${ROOT}/STATUS.md`, 'utf8').split('\n');
const backlogText = fs.readFileSync(`${ROOT}/tasks/BACKLOG.md`, 'utf8');
const closedNow = scan(backlogText, { closedVocabulary: 'wide' });

const FINDING = /F-[A-Z0-9]{2,4}-\d+|F-\d{3,4}-\d+/g;
const DESK_WORD = /OWNER(?:'S|’S|S)? DESK/g;

const desks = [];
for (const line of status) {
  const m = line.match(/^- \*\*s(\d+) handoff \(line-1 archive\)/);
  if (!m) continue;
  const s = Number(m[1]);
  if (s < 1470) continue;
  const hits = [...line.matchAll(DESK_WORD)];
  if (!hits.length) continue;
  const tail = line.slice(hits[hits.length - 1].index);
  desks.push({ s, ids: new Set(tail.match(FINDING) || []) });
}
desks.sort((a, b) => a.s - b.s);

console.log(`post-cure desks: ${desks.length} (s${desks[0].s}..s${desks[desks.length - 1].s})`);
console.log('');

let totalDropped = 0;
let droppedUnclosed = 0;
const orphans = new Map(); // id -> session it was dropped at

for (let i = 1; i < desks.length; i++) {
  const prev = desks[i - 1];
  const cur = desks[i];
  const dropped = [...prev.ids].filter((id) => !cur.ids.has(id));
  if (!dropped.length) continue;
  const unclosed = dropped.filter((id) => !(closedNow.get(id)?.closed.length));
  totalDropped += dropped.length;
  droppedUnclosed += unclosed.length;
  for (const id of unclosed) if (!orphans.has(id)) orphans.set(id, cur.s);
  console.log(
    `s${prev.s} (${prev.ids.size}) -> s${cur.s} (${cur.ids.size}) : dropped ${dropped.length}` +
      `  [${unclosed.length} with NO closure row]  ${unclosed.join(' ')}`,
  );
}

console.log('');
console.log(`total drop events (id-instances): ${totalDropped} · of those unclosed: ${droppedUnclosed}`);
console.log('');
// an orphan that never came back
const live = desks[desks.length - 1].ids;
const stillGone = [...orphans].filter(([id]) => !live.has(id));
console.log(`distinct ids dropped-unclosed and STILL absent from the newest desk: ${stillGone.length}`);
for (const [id, at] of stillGone.sort((a, b) => a[1] - b[1])) {
  console.log(`  ${id.padEnd(10)} dropped at s${at}`);
}

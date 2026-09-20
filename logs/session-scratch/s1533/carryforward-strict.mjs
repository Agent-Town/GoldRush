#!/usr/bin/env node
/**
 * s1533 scratch, STRICTER — the loose pass conflated DESK ITEMS with findings
 * merely CITED inside a desk item's prose ("Narrowed by F-1528-3", "F-ER02-5/6
 * wait on it"). For desk-declaration-guard's question (does each id have a row?)
 * over-counting is harmless — it only adds work. For THIS question (was this item
 * dropped?) over-counting manufactures false drops. Same tail, different
 * denominator, because it is a different question.
 *
 * The desk's own convention introduces each item with a 🔺 marker, so anchor on
 * that: the first F-ID after each 🔺 is an ITEM; everything else in that item's
 * prose is a citation.
 */
import fs from 'node:fs';
import { scan } from '../../../scripts/findings-state-guard.mjs';

const ROOT = process.cwd();
const status = fs.readFileSync(`${ROOT}/STATUS.md`, 'utf8').split('\n');
const closedNow = scan(fs.readFileSync(`${ROOT}/tasks/BACKLOG.md`, 'utf8'), {
  closedVocabulary: 'wide',
});

const FINDING = /F-[A-Z0-9]{2,4}-\d+|F-\d{3,4}-\d+/g;
const DESK_WORD = /OWNER(?:'S|’S|S)? DESK/g;

/** Items on a desk tail: the first F-ID inside each 🔺-introduced segment. */
export function deskItems(tail) {
  const segs = tail.split('🔺').slice(1); // drop the header segment before the first 🔺
  const ids = [];
  for (const seg of segs) {
    const first = (seg.match(FINDING) || [])[0];
    if (first) ids.push(first);
  }
  return new Set(ids);
}

const desks = [];
for (const line of status) {
  const m = line.match(/^- \*\*s(\d+) handoff \(line-1 archive\)/);
  if (!m) continue;
  const s = Number(m[1]);
  if (s < 1470) continue;
  const hits = [...line.matchAll(DESK_WORD)];
  if (!hits.length) continue;
  const tail = line.slice(hits[hits.length - 1].index);
  desks.push({ s, ids: deskItems(tail), loose: new Set(tail.match(FINDING) || []) });
}
desks.sort((a, b) => a.s - b.s);

console.log('s      strict  loose  (strict = 🔺-introduced items)');
for (const d of desks.slice(-14)) {
  console.log(`s${d.s}  ${String(d.ids.size).padStart(5)}  ${String(d.loose.size).padStart(5)}`);
}
console.log('');

const orphans = new Map();
for (let i = 1; i < desks.length; i++) {
  const prev = desks[i - 1], cur = desks[i];
  const dropped = [...prev.ids].filter((id) => !cur.ids.has(id));
  const unclosed = dropped.filter((id) => !(closedNow.get(id)?.closed.length));
  if (unclosed.length) {
    console.log(`s${prev.s}(${prev.ids.size}) -> s${cur.s}(${cur.ids.size}) dropped-unclosed ${unclosed.length}: ${unclosed.join(' ')}`);
  }
  for (const id of unclosed) if (!orphans.has(id)) orphans.set(id, cur.s);
}

const live = desks[desks.length - 1].ids;
const stillGone = [...orphans].filter(([id]) => !live.has(id));
console.log('');
console.log(`STRICT: distinct items dropped-unclosed and still absent: ${stillGone.length}`);
for (const [id, at] of stillGone.sort((a, b) => a[1] - b[1])) console.log(`  ${id.padEnd(10)} dropped at s${at}`);

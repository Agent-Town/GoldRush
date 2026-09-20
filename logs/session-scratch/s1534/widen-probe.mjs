#!/usr/bin/env node
/**
 * s1534 scratch probe — RUN THE PREDICATE BEFORE BUILDING IT.
 *
 * F-1533-2's prescribed cure is to widen desk-declaration-guard's FINDING regex
 * from /F-\d{3,4}-\d+/ to /F-(?:[A-Z0-9]{1,8}-)+\d+/. That regex is the
 * denominator on BOTH sides (desk items AND declaring rows), so widening it can
 * only be judged by running it on the live corpus. This probe does exactly that
 * and prints the diff, item by item, without touching the guard.
 */
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const NARROW = 'F-\\d{3,4}-\\d+';
const WIDE = 'F-(?:[A-Z0-9]{1,8}-)+\\d+';
const SUBJECT_CHARS = 90;
const DESK_WORD = /OWNER(?:'S|’S|S)? DESK/g;

// The LIVE desk is s1533's handoff line-1 (line-1 right now is this fire's lock).
const line1 = execSync('git show HEAD~1:STATUS.md', { cwd: ROOT, maxBuffer: 64e6 })
  .toString()
  .split('\n')[0];

function deskTail(l1) {
  const hits = [...l1.matchAll(DESK_WORD)];
  if (!hits.length) return null;
  return l1.slice(hits[hits.length - 1].index);
}

function ids(text, src) {
  return [...new Set(text.match(new RegExp(src, 'g')) || [])];
}

function declaredIds(backlogText, src) {
  const found = new Map();
  backlogText.split('\n').forEach((line, i) => {
    const body = line.trim().replace(/^[-*]\s+/, '');
    const first = (body.slice(0, SUBJECT_CHARS).match(new RegExp(src, 'g')) || [])[0];
    if (first && !found.has(first)) found.set(first, i + 1);
  });
  return found;
}

const tail = deskTail(line1);
if (!tail) {
  console.error('REFUSING — no desk header on the s1533 handoff line-1');
  process.exit(2);
}
const backlog = fs.readFileSync('tasks/BACKLOG.md', 'utf8');

for (const [label, src] of [['NARROW (today)', NARROW], ['WIDE (proposed)', WIDE]]) {
  const deskIds = ids(tail, src);
  const declared = declaredIds(backlog, src);
  const undeclared = deskIds.filter((id) => !declared.has(id));
  console.log(`\n=== ${label} : ${src} ===`);
  console.log(`desk F-IDs        : ${deskIds.length}`);
  console.log(`with a BACKLOG row: ${deskIds.length - undeclared.length}`);
  console.log(`undeclared        : ${undeclared.length}`);
  if (undeclared.length) console.log('  UNDECLARED:', undeclared.join(', '));
}

// The interesting set: what does WIDE see that NARROW cannot?
const newDesk = ids(tail, WIDE).filter((id) => !ids(tail, NARROW).includes(id));
const declaredWide = declaredIds(backlog, WIDE);
console.log('\n=== ids only WIDE can see on the desk ===');
for (const id of newDesk) {
  const at = declaredWide.get(id);
  console.log(`  ${at ? 'ROW  @' + at : 'NONE           '}  ${id}`);
}

// And what widening does to the BACKLOG side alone (rows whose SUBJECT id changes).
const dN = declaredIds(backlog, NARROW);
const dW = declaredIds(backlog, WIDE);
const shifted = [];
for (const [id, ln] of dW) if (!dN.has(id)) shifted.push(`${id} @${ln}`);
console.log(`\n=== BACKLOG rows newly declaring under WIDE: ${shifted.length} ===`);
console.log(shifted.slice(0, 40).join('\n'));

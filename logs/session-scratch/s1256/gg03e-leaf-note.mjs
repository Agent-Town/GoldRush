#!/usr/bin/env node
// s1256 — put the premise audit ON the gg-03e leaf, where §3.0's first-command-of-every-drain will
// surface it. A finding that lives only in BACKLOG prose is one a cold fire can miss.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '../../..');
const path = resolve(repo, 'tasks/goals.json');
const json = JSON.parse(readFileSync(path, 'utf8'));

let hit = null;
const walk = (node) => {
  for (const kid of node.subgoals ?? node.tasks ?? []) {
    if (kid.id === 'gg-03e-herald-class-map-engravings') hit = kid;
    walk(kid);
  }
};
for (const goal of json.goals) walk(goal);
if (!hit) { console.error('FATAL: gg-03e leaf not found'); process.exit(1); }

hit.status = 'building';
hit.note_s1256 = [
  '⚠️ READ BEFORE DRAINING — THIS MASTER\'S DEFINING "MEASURED" PREMISE IS FALSE, AND THE RUN IS NOT A NO-OP,',
  'so the two have to be judged separately. The master (and this leaf\'s authorNotes) state that heraldReader\'s',
  'class map "resolves to nothing" because "NO file of that name exists". s1256 re-ran it: all SEVEN',
  'assets/processed/herald-engraving-{board,trail,river,schoolhouse,ledger,boss,town-growth}.webp existed on disk',
  'with mtime 2026-07-29T06:18-06:20Z AND are tracked on main (git ls-tree main), landed by 15e00755 — a day',
  'before the claim was written. The published proof command was `ls assets/processed/ | grep gazette`, i.e. a grep',
  'for "gazette" used to answer a question about "herald-engraving": the absence was an artefact of the search',
  'string, not of the tree. So the Herald was NOT silently text-only for every class, and "the missing thing is the',
  'derivatives, not the map" is backwards. WHAT WAS GENUINELY MISSING is the EIGHTH class: no ceremony plate and no',
  'ceremony member on HeraldClass — that part of the master was right. THEREFORE THE DRAIN MUST ASK A DIFFERENT',
  'QUESTION than the master poses: not "did the seven derivatives arrive" but "what did replacing seven WORKING',
  'webps buy us". The run rewrote all seven (board 36904→42198, boss 44702→43668, schoolhouse 48116→31566 — sizes',
  'move in BOTH directions, so this is a re-encode, not a compression pass) and touched scripts/asset-diet.mjs in',
  '6 lines, which the master explicitly forbade in one direction ("do NOT raise either ceiling"). Check that file',
  'FIRST. Provenance: logs/session-scratch/s1256/herald-premise-check.mjs, F-1256-2.',
].join(' ');
writeFileSync(path, JSON.stringify(json, null, 2) + '\n');
console.log(`gg-03e leaf: status=${hit.status}, note_s1256 written (${hit.note_s1256.length} chars)`);

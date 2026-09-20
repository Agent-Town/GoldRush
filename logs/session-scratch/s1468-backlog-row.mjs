// s1468: ledger event + row in the SAME commit — retire F-1467-1's discharged gate,
// append the drain row. Original prose retained (Retention Law): the gate sentence is
// struck by APPENDING a discharge clause, never by deleting it.
import { readFileSync, writeFileSync } from 'node:fs';

const P = 'tasks/BACKLOG.md';
let txt = readFileSync(P, 'utf8');

const OLD = '**GATE: closes when the lane-b measurement lands and F-1464-2 is ruled.**';
const NEW = OLD + ' ✅ **GATE DISCHARGED s1468 — the lane-b measurement LANDED and F-1464-2 IS RULED: merged `8e3c1491` (review `reviews/f1467-alpha-recipe-ab.md`, leaf `f1467-1-alpha-recipe-ab`).** The authored second branch returned an honest **split-shaped** answer rather than a manufactured winner: **visually INDISTINGUISHABLE at play scale on desktop AND 390px at BOTH tiers**, with mixed-sign GPU foreground deltas — and the verdict then rests on the one machine-independent discriminator, thin-feature retention, where two-step wins all three subjects at both tiers. **The permission to say "indistinguishable" is what makes the ruling trustworthy**: the master granted it, the runner took it for the half it applied to, and declined to read a preference into the pixels. 🔎 **s1468 REPRODUCED THE EVIDENCE RATHER THAN INHERITING IT:** the rig writes its screenshots to the tracked `reviews/shots-f1467-alpha-recipe-ab/` (`e2e/f1467-alpha-recipe-ab.rig.ts:6`), so a gate re-run overwrites the very evidence it is judging — and `git status` came back **CLEAN**, i.e. all 12 PNGs re-rendered **byte-identical**. That turns a would-be hygiene hazard into an independent determinism proof of the review\'s numbers. ➡️ **F-1464-1 IS THEREBY UNBLOCKED** and carries its recipe annotation (row above): key-before-final-resample, grid path preserved, **1,073 of 1,075 suspects are grid cells**.';

if (!txt.includes(OLD)) { console.error('GATE SENTENCE NOT FOUND — aborting'); process.exit(1); }
if (txt.includes('GATE DISCHARGED s1468')) { console.error('already discharged'); process.exit(1); }
txt = txt.replace(OLD, NEW);
writeFileSync(P, txt);
console.log('F-1467-1 gate discharged in place (original retained).');

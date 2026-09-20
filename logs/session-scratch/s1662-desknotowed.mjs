// s1662: desk-birth-guard wants F-1660-1 either desked or explicitly declared not-owed.
// It is not owed: the row restores an owner ruling rather than asking a new question,
// its own GATE line says so, and it SHIPPED this fire.
import { readFileSync, writeFileSync } from 'node:fs';
const P = 'STATUS.md';
const raw = readFileSync(P, 'utf8');
const nl = raw.indexOf('\n');
let line1 = raw.slice(0, nl);
if (line1.includes('DESK-NOT-OWED: F-1660-1')) throw new Error('already declared');
if (!line1.startsWith('Last updated:')) throw new Error('line 1 is not the handoff line');
line1 += ' ⚖️ **DESK-NOT-OWED: F-1660-1 — ruled 2026-08-09, and SHIPPED this fire at `25499e0a1`.**'
  + ' The row asks the owner nothing: it RESTORES his own F-E2S-3 ruling (*"de-list now, socket later"*) rather than opening a fork,'
  + ' its own GATE line reads *"none owed to the owner — this restores his own 2026-08-09 ruling, which is the conservative direction"*,'
  + ' and it proceeded under §7.4 as a reversible act inside a ratified spec with a veto window recorded by s1660.'
  + ' **The one half of F-E2S-3 still genuinely owed — the era-true pressure-to-damage socket — is already on the desk above under its own id**,'
  + ' so filing F-1660-1 too would duplicate an open question rather than add one.';
writeFileSync(P, line1 + raw.slice(nl));
console.log('declaration appended; line-1 chars =', line1.length);

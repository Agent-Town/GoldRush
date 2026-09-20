#!/usr/bin/env node
/**
 * validate-on-real-line1s.mjs — the cure, proven on REAL handoffs rather than
 * on hand-built fixtures.
 *
 * A fixture proves the code does what I wrote it to do. This asks the different
 * and harder question: on the actual line-1s this factory has produced, does the
 * new parser resolve the LIVE desk where the old one resolved an archive?
 *
 * Arm 1 — s1471's handoff (bare spelling, 7 desk F-IDs). Old and new should
 *          AGREE here, because s1471's line-1 happened to use the one spelling
 *          the old parser could see. That agreement is the control.
 * Arm 2 — the same line-1 with the desk rewritten in the POSSESSIVE spelling,
 *          which is what 484 of 617 real desks use. Old parser falls through to
 *          the archive; new parser holds on line-1. That divergence IS F-1471-3.
 */
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const { deskIds, declaredIds } = await import(pathToFileURL('scripts/desk-declaration-guard.mjs').href);

// THE BOARD AS IT ACTUALLY STOOD AT s1471 — not today's STATUS.md.
// First attempt used the live file and every arm agreed at 8 F-IDs, which looked
// like the cure was a no-op. It was a broken instrument: s1472 had just restored
// s1471's handoff as archive line 2, so the "fall-through to an archive" landed
// on a COPY of the very desk it was supposed to diverge from. Measure the
// arrangement you are diagnosing — reconstruct the board, do not borrow today's.
const s1471Doc = execFileSync('git', ['show', 'f3f2f01b5:STATUS.md'], {
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
});
const lines = s1471Doc.split('\n');
const s1471 = lines[0];

// The OLD selector, reproduced verbatim from the pre-cure source so the
// comparison is against what actually shipped, not against my memory of it.
function oldDeskIds(text) {
  const line = text.split('\n').find((l) => l.includes('OWNER DESK'));
  if (!line) return null;
  return [...new Set(line.slice(line.indexOf('OWNER DESK')).match(/F-\d{3,4}-\d+/g) || [])];
}

const declared = declaredIds(fs.readFileSync('tasks/BACKLOG.md', 'utf8'));
const undeclared = (ids) => ids.filter((id) => !declared.has(id));

function arm(label, line1) {
  const doc = [line1, ...lines.slice(1)].join('\n');
  const oldIds = oldDeskIds(doc) || [];
  const neu = deskIds(doc);
  const newIds = neu.kind === 'desk' ? neu.ids : [];
  console.log(`\n=== ${label} ===`);
  console.log(`  OLD parser: ${String(oldIds.length).padStart(3)} F-IDs, ${undeclared(oldIds).length} undeclared`);
  console.log(`  NEW parser: kind=${neu.kind}, ${String(newIds.length).padStart(3)} F-IDs, ${undeclared(newIds).length} undeclared`);
  const u = undeclared(newIds);
  if (u.length) console.log(`    → live undeclared: ${u.join(', ')}`);
  return { oldIds, newIds };
}

// Arm 1: the control — s1471 used the bare spelling, so both should agree.
arm('ARM 1 — s1471 handoff line-1 VERBATIM (bare "OWNER DESK")', s1471);

// Arm 2: the same handoff, desk header in the majority spelling.
const possessive = s1471.replace(/OWNER DESK/g, "OWNER'S DESK");
if (possessive === s1471) throw new Error('arm 2 rewrite did nothing — check the spelling');
arm('ARM 2 — the SAME handoff, desk written possessively (484/617 real desks)', possessive);

console.log('\nReference: the whole-file fall-through the old parser reached');
console.log(`  archived desk it resolved to: ${(oldDeskIds(lines.slice(1).join('\n')) || []).length} F-IDs`);

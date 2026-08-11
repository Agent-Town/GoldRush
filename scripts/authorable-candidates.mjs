#!/usr/bin/env node
/**
 * List the goal tree's `planned` leaves — the factory's whole authorable-candidate
 * surface — and say, per leaf, whether a measured refusal is already on record.
 *
 * WHY THIS EXISTS (F-1654-1): four consecutive fires (s1641, s1649, s1650, s1653)
 * each spent an authoring budget proving the same negatives, because a `planned`
 * leaf reads as available work and the measurement that refuted it lived only in a
 * BACKLOG finding. `drain-block-check` is blind here by construction — it resolves
 * `blocked`/`stopped` leaves, and a refill question is not a drain question.
 * `ghost-ladder-row-guard` is blind too — it keys on rows naming a MASTER file, and
 * an unauthored rung has none.
 *
 * Advisory by default, `--strict` gates — the `drain-block-check` UNKNOWN precedent.
 * Most of the corpus is legacy-unpriced, so a strict default would red the whole
 * board instead of answering the question asked.
 *
 * READ THE CLASS, NOT JUST THE PRICE. `owner-gated` needs a word from Robin;
 * `attended-owed` needs an attended session and must NOT be carried to the desk,
 * where it would park forever (the F-1383-1 discriminator, applied to authoring).
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/** Legacy prose spellings a refusal has historically been written under. */
export const PROSE_KEYS = ['blockedReason', 'authorNotes', 'note', 'reason', 'stopNote', 'drainNotes'];
const NOTE_S = /^note_s\d+$/;

export const KNOWN_CLASSES = ['owner-gated', 'attended-owed', 'needs-spec'];

export function plannedLeaves(goals) {
  const found = [];
  JSON.stringify(goals, (key, value) => {
    if (value && typeof value === 'object' && !Array.isArray(value) && value.id && value.status === 'planned') {
      found.push(value);
    }
    return value;
  });
  return found;
}

/**
 * Resolve a leaf's authoring refusal. Structured `authoringBlock` wins; otherwise
 * any legacy prose key counts as PROSE (priced, but unclassified — a human wrote a
 * reason, no instrument can read its class).
 */
export function resolveRefusal(leaf) {
  const block = leaf.authoringBlock;
  if (block && typeof block === 'object' && block.reason) {
    const known = KNOWN_CLASSES.includes(block.class);
    return {
      priced: true,
      structured: true,
      class: known ? block.class : 'unclassified',
      classDeclared: block.class ?? null,
      knownClass: known,
      finding: block.finding ?? null,
      measuredBy: block.measuredBy ?? null,
      reason: String(block.reason),
    };
  }
  const key = [...PROSE_KEYS, ...Object.keys(leaf).filter((k) => NOTE_S.test(k))].find((k) => leaf[k]);
  if (key) {
    return {
      priced: true,
      structured: false,
      class: 'prose-only',
      classDeclared: null,
      knownClass: false,
      finding: null,
      measuredBy: null,
      reason: String(leaf[key]),
      proseKey: key,
    };
  }
  return { priced: false, structured: false, class: 'UNPRICED', knownClass: false, reason: null };
}

export function auditRoot(root) {
  const goals = JSON.parse(fs.readFileSync(path.join(root, 'tasks', 'goals.json'), 'utf8'));
  return plannedLeaves(goals).map((leaf) => ({
    id: leaf.id,
    title: String(leaf.title ?? ''),
    refusal: resolveRefusal(leaf),
  }));
}

export function summarise(rows) {
  const counts = { total: rows.length, priced: 0, unpriced: 0, byClass: {} };
  for (const row of rows) {
    if (row.refusal.priced) counts.priced += 1;
    else counts.unpriced += 1;
    counts.byClass[row.refusal.class] = (counts.byClass[row.refusal.class] ?? 0) + 1;
  }
  return counts;
}

function main() {
  const rootIndex = process.argv.indexOf('--root');
  const root = path.resolve(rootIndex === -1 ? process.cwd() : process.argv[rootIndex + 1]);
  const rows = auditRoot(root);

  console.log('=== authorable-candidates ===');
  for (const row of rows) {
    const { refusal } = row;
    console.log(`\n${refusal.priced ? refusal.class.toUpperCase() : 'UNPRICED'}  ${row.id}`);
    console.log(`  ${row.title.slice(0, 100)}`);
    if (refusal.priced) {
      const cite = [refusal.finding, refusal.measuredBy].filter(Boolean).join(' · ');
      if (cite) console.log(`  cited: ${cite}`);
      if (!refusal.structured) console.log(`  (prose only, key "${refusal.proseKey}" — class unreadable)`);
      if (refusal.classDeclared && !refusal.knownClass) {
        console.log(`  (declared class "${refusal.classDeclared}" is not a known class)`);
      }
      console.log(`  ${refusal.reason.slice(0, 220)}`);
    } else {
      console.log('  no refusal on record — a refilling fire must measure this one itself');
    }
  }

  const counts = summarise(rows);
  const byClass = Object.entries(counts.byClass)
    .sort((a, b) => b[1] - a[1])
    .map(([name, n]) => `${name} ${n}`)
    .join(', ');
  console.log(`\n${counts.total} planned leaf/leaves — ${counts.priced} priced, ${counts.unpriced} unpriced (${byClass}).`);
  console.log('Advisory: a priced leaf is not a closed one, and UNPRICED is a cost estimate, not a verdict.');
  if (process.argv.includes('--strict') && counts.unpriced) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();

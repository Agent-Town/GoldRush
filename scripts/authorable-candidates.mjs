#!/usr/bin/env node
/**
 * List the goal tree's `planned` leaves and say, per leaf, whether a measured
 * refusal is already on record.
 *
 * ⚠️ `planned` IS NOT THE WHOLE CANDIDATE SURFACE, AND THIS HEADER USED TO SAY IT
 * WAS (F-2180-1, filed s2180; cured s2181). The over-claim was the defect: a fire
 * that reads the header is told the question is covered and never looks further.
 * Measured s2181 at the goal tree (874 nodes carrying `id`+`status`):
 *   merged 744 · shipped 57 · superseded 33 · planned 13 · verified-by-owner 11
 *   · stopped 8 · building 5 · blocked 3
 * This tool resolves `planned` (:35). `drain-block-check` resolves `blocked` plus
 * TERMINAL_CLOSED {superseded,void,abandoned,stopped} and TERMINAL_SHIPPED
 * {merged,shipped}. The string `building` appears in NEITHER — so 5 leaves were
 * resolved by no instrument at all, silently, behind a footer that read like a
 * complete census. `verified-by-owner` (11) is likewise in neither set.
 *
 * ➡️ THEREFORE THIS TOOL NOW PRINTS ITS OWN RESIDUE: every status present in the
 * tree that no instrument resolves, with counts and ids. It states the
 * denominator rather than implying one. The residue is ADVISORY and deliberately
 * does NOT trip `--strict` — legacy statuses are not authoring debt, and reding
 * the board on them would repeat the mistake `--strict`'s narrow scope avoids.
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

/**
 * The ONE implementation of "this block carries a readable refusal", DERIVED at
 * both call sites rather than re-typed. Four independent copies of one predicate
 * is how the F-2227-1 lock test in `desk-state-audit.mjs` drifted for hundreds of
 * fires, and s2263 hit the same lesson one tool over in the same file.
 *
 * Deliberately byte-for-byte the test `resolveRefusal` already applied — no
 * `!Array.isArray` tightening, no truthiness cleanup. Re-coding a working
 * predicate while extracting it is a drive-by, and it would silently move the
 * boundary this cure exists to describe.
 */
export function blockIsReadable(block) {
  return Boolean(block && typeof block === 'object' && block.reason);
}

/**
 * F-2264-1 (s2264). `UNPRICED` printed two facts demanding OPPOSITE acts
 * byte-identically, and named the wrong one:
 *
 *   (a) the leaf records NOTHING          -> measure it yourself
 *   (b) the leaf records a refusal this    -> go READ what is there, and repair
 *       reader cannot parse (an
 *       `authoringBlock` with a class /
 *       finding / measuredBy but no
 *       `reason`)
 *
 * Both printed `no refusal on record — a refilling fire must measure this one
 * itself`. PROVEN BY MANUFACTURING: a leaf declaring `{class:'owner-gated',
 * finding:'F-1313-3', measuredBy:'s1336'}` and a leaf declaring nothing at all
 * were byte-identical on stdout.
 *
 * THE POLARITY IS WHY THIS IS WORTH A CLAUSE: §2E reads this tool to decide what
 * a fire may author. Told "nothing is on record, measure it yourself" about a
 * leaf whose block already says `owner-gated`, a fire measures, concludes the
 * work is available, and AUTHORS WORK THE OWNER RESERVED — the one act §2E
 * exists to prevent. The erased evidence is exactly the evidence that forbids it.
 *
 * SEVERITY, HONESTLY: LATENT. Measured s2264 over all 942 leaves — 14 carry an
 * `authoringBlock` and ALL 14 are readable, so zero live instances, and `--strict`
 * already reds on both branches (the conservative direction). No verdict and no
 * gate was wrong. What was wrong is the word and the act it names.
 *
 * DECLARES, DOES NOT REFUSE (F-2218-1), and the VERDICT AND COUNTS ARE
 * DELIBERATELY UNCHANGED — `class` stays `UNPRICED` and `counts.byClass` is
 * untouched, so only the evidence column speaks (s2263's precedent one tool
 * over). Declared on BOTH outcomes including the genuinely-absent one (F-2208-1):
 * a declaration that appears only on the interesting branch re-creates the
 * ambiguity it removes. `blockState` is a STRING for F-2212-1's reason — a
 * careless truthiness test at a call site coerces every value toward NOTICING.
 */
export function blockState(leaf) {
  const block = leaf.authoringBlock;
  return block === null || block === undefined ? 'absent' : 'unreadable';
}

/** Whatever a present-but-unreadable block still declares, for the reader to go read. */
export function blockSalvage(block) {
  const readable = block && typeof block === 'object' && !Array.isArray(block);
  return {
    class: readable ? block.class ?? null : null,
    finding: readable ? block.finding ?? null : null,
    measuredBy: readable ? block.measuredBy ?? null : null,
  };
}

/**
 * The statuses SOME instrument resolves, so the residue below can name what is left.
 *
 * MIRRORED, NOT IMPORTED, AND THAT IS DELIBERATE: `scripts/drain-block-check.mjs`
 * calls `main()` unconditionally at its foot, so importing it would EXECUTE the
 * drain guard as a side effect of asking this question. Restructuring §3.0's
 * primary instrument to be import-safe is a far larger change than this cure
 * earns. A mirrored list is the "hardcoded list git already knows" defect, so it
 * carries the mitigation that defect requires: `authorable-candidates.test.mjs`
 * re-reads drain-block-check's own Set literals and REDS on any drift between
 * them and these — the same shape as the CODEX_FLOOR drift guard in
 * `runner-restart-recipe.test.sh`, and for the same reason.
 */
export const RESOLVED_BY_DRAIN_BLOCK_CHECK = new Set([
  'merged', 'shipped', // TERMINAL_SHIPPED_STATUSES
  'superseded', 'void', 'abandoned', 'stopped', // TERMINAL_CLOSED_STATUSES
  'blocked', // the owner-fork / gate-side arm
]);

/** The status THIS tool resolves. */
export const RESOLVED_HERE = new Set(['planned']);

/** Every node carrying both an `id` and a `status`, which is what both tools key on. */
export function statusCensus(goals) {
  const counts = new Map();
  JSON.stringify(goals, (key, value) => {
    if (value && typeof value === 'object' && !Array.isArray(value) && value.id && value.status) {
      if (!counts.has(value.status)) counts.set(value.status, []);
      counts.get(value.status).push(value.id);
    }
    return value;
  });
  return counts;
}

/**
 * Statuses present in the tree that NEITHER this tool nor `drain-block-check`
 * resolves — the leaves no instrument has an opinion about. Sorted by count
 * descending so the largest silent bucket reads first.
 */
export function unresolvedStatuses(goals) {
  const out = [];
  for (const [status, ids] of statusCensus(goals)) {
    if (RESOLVED_HERE.has(status) || RESOLVED_BY_DRAIN_BLOCK_CHECK.has(status)) continue;
    out.push({ status, count: ids.length, ids });
  }
  return out.sort((a, b) => b.count - a.count || a.status.localeCompare(b.status));
}

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
  if (blockIsReadable(block)) {
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
  // F-2264-1: verdict and counts unchanged; `blockState` says WHICH kind of
  // "no refusal on record" this is, and `blockDeclared` carries the evidence
  // that survived so the reader can go read it instead of re-measuring it.
  return {
    priced: false,
    structured: false,
    class: 'UNPRICED',
    knownClass: false,
    reason: null,
    blockState: blockState(leaf),
    blockDeclared: blockSalvage(block),
  };
}

export function readGoals(root) {
  return JSON.parse(fs.readFileSync(path.join(root, 'tasks', 'goals.json'), 'utf8'));
}

export function auditRoot(root) {
  const goals = readGoals(root);
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
    } else if (refusal.blockState === 'unreadable') {
      // F-2264-1: NOT "nothing on record". Something IS on record and this reader
      // could not parse it, so the owed act is to READ, not to re-measure.
      const declared = [
        refusal.blockDeclared.class && `class "${refusal.blockDeclared.class}"`,
        refusal.blockDeclared.finding,
        refusal.blockDeclared.measuredBy,
      ].filter(Boolean).join(' · ');
      console.log('  authoringBlock is PRESENT but carries no readable "reason"');
      console.log(declared
        ? `  it already declares: ${declared} — READ that before you price this leaf`
        : '  it declares no readable field at all — repair the block, do not re-measure it');
      console.log('  this is NOT "nothing on record": do not author off a measurement of your own');
    } else {
      // The original sentence is CORRECT on this branch and is deliberately kept
      // verbatim — `authorable-candidates.test.mjs` pins it, and a cure that
      // rewrites a true message to make room for a new one is a drive-by.
      console.log('  no refusal on record — a refilling fire must measure this one itself');
      console.log('  (no authoringBlock and no prose key on the leaf — nothing is recorded to read)');
    }
  }

  const counts = summarise(rows);
  const byClass = Object.entries(counts.byClass)
    .sort((a, b) => b[1] - a[1])
    .map(([name, n]) => `${name} ${n}`)
    .join(', ');
  console.log(`\n${counts.total} planned leaf/leaves — ${counts.priced} priced, ${counts.unpriced} unpriced (${byClass}).`);
  console.log('Advisory: a priced leaf is not a closed one, and UNPRICED is a cost estimate, not a verdict.');

  // F-2180-1: state the denominator instead of implying one. See the header.
  const residue = unresolvedStatuses(readGoals(root));
  if (residue.length) {
    const total = residue.reduce((n, r) => n + r.count, 0);
    console.log(`\n--- RESIDUE: ${total} leaf/leaves in ${residue.length} status(es) NO instrument resolves ---`);
    console.log('Neither this tool (`planned`) nor drain-block-check (blocked/terminal) has an opinion on these.');
    for (const { status, count, ids } of residue) {
      console.log(`  ${status}  ${count}`);
      for (const id of ids) console.log(`    · ${id}`);
    }
    console.log('Advisory only — a residue status is not authoring debt, and this does NOT trip --strict.');
  } else {
    console.log('\nRESIDUE: none — every status present in the tree is resolved by some instrument.');
  }

  if (process.argv.includes('--strict') && counts.unpriced) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();

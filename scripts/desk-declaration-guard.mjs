#!/usr/bin/env node
/**
 * desk-declaration-guard.mjs — is every item on the OWNER'S DESK actually ON THE BOARD?
 *
 * WHY THIS EXISTS (F-1334-2, s1334; the class was opened by F-1333-3, s1333):
 * The STATUS.md line-1 handoff ends in an OWNER DESK list — the queue of findings
 * waiting on Robin's word. The dashboard, however, renders tasks/BACKLOG.md. So a
 * desk item with no BACKLOG row is on NO board the owner reads. s1333 found two
 * such findings (s1332's) and backfilled them by hand. s1334 asked the same
 * question of the whole desk instead of the newest fire and measured a RATE:
 * of 35 desk F-IDs, 26 had a declaring row, 7 were mentioned only inside OTHER
 * findings' rows, and 2 were absent from the ledger entirely. F-1328-3 — "says
 * the word", a one-word owner decision — sat invisible for SIX fires while three
 * consecutive handoffs listed it as awaiting that word.
 *
 * A MENTION IS NOT A DECLARATION, AND THAT DISTINCTION IS THE WHOLE GUARD.
 * F-1328-3 is named on four lines of BACKLOG.md and was still invisible: every
 * one of those lines belongs to a DIFFERENT finding that cites it. So the
 * discriminator is "is this ID the FIRST F-ID in the row's 90-char subject zone"
 * — the same zone scripts/findings-state-guard.mjs uses — and not "does the ID
 * appear somewhere". s1334's first draft used the loose test and credited
 * F-1328-3 with two rows it does not have, which is the very conflation the
 * finding is about.
 *
 * WHAT THIS GUARD DELIBERATELY DOES NOT DO (F-1334-1 — a refuted design):
 * F-1333-2 proposed asserting that a 🔺 on the desk implies a 🔺 on the BACKLOG
 * row. DO NOT BUILD THAT. Measured s1334: it fires on 24 of 35 desk items, and
 * its premise is false — the BACKLOG leading glyph is the CENSUS-VISIBILITY axis
 * (findings-state-guard admits a row as a declaration only when it leads 🟡 or
 * ✅; F-1327-3 proved 🔺 → MISSED), while the desk 🔺 is the OWNER-ROUTING axis.
 * Enforcing equality would demand 🔺 on rows that must lead 🟡 to be counted,
 * converting a cosmetic mismatch into census blindness. THIS guard is therefore
 * silent about glyphs entirely. It asks one question on one axis: does the row
 * exist?
 *
 * BASELINE, NOT A CLEAN SWEEP (the F-1259-1 pattern):
 * 9 desk items were undeclared when this shipped. They are grandfathered by NAME
 * below with the measurement that found them, so the guard gates at the count its
 * own vocabulary yields rather than reddening the board on legacy debt. A NEW
 * undeclared desk item exits 1. Retiring a grandfathered one is a bookkeeping
 * win; the guard never forces it.
 *
 * AND THE BASELINE IS 9 BECAUSE THIS GUARD'S VOCABULARY IS WIDER THAN THE PROBE
 * THAT COMMISSIONED IT (s1334, worth more than the number): the scratch probe
 * that measured F-1334-2 anchored on a MARKER — /(🔺|🔻|🟡)\s*\**\s*(F-…)/ — so it
 * counted only desk items introduced by their own glyph and reported a desk of
 * 35. The desk also routes ids in shared runs: "F-1242-1 + F-1193-2",
 * "F-1327-1/F-1329-2", "F-1253-1/2/3", "F-1141-3+F-1164-1". Counting EVERY F-ID
 * in the desk tail gives 43, and the 8 the probe could not see included one more
 * undeclared item, F-1193-2 — which rides inside F-1242-1's row and is invisible
 * for exactly the F-1328-3 reason. The guard found a defect its own author's
 * instrument had missed; ask what your denominator is anchored on.
 *
 * REFUSES RATHER THAN GREENING OVER AN UNREAD SUBJECT (F-1251-2's class):
 * a guard that cannot find the desk list, or finds zero F-IDs in it, must NOT
 * report PASS — that green would mean "I read nothing", which is exactly the
 * vacuous mode that let citation-title-guard sit RED-and-unrun for nine fires.
 * Both conditions exit 2.
 *
 * ...AND "CANNOT FIND THE DESK" WAS NOT THE ONLY WAY TO READ THE WRONG THING.
 * F-1471-3 (s1471, cured s1472). The selector above refused on ZERO desks but
 * had no refusal for finding the WRONG one, and a stale desk is indistinguishable
 * from a fresh one by count alone. Two independent defects, either sufficient:
 *
 *   (1) SPELLING. It matched the bare literal "OWNER DESK". Fires overwhelmingly
 *       write the POSSESSIVE, which does not contain that substring. Measured on
 *       STATUS.md s1472 — bare 243 · "OWNER'S" 484 · curly "OWNER’S" 15 ·
 *       "OWNERS" 9. The majority spelling was invisible to the guard.
 *   (2) ANCHOR. It took the FIRST matching line in the whole file. STATUS.md
 *       carries ~120 archived line-1 bullets, every one ending in its own desk,
 *       so a miss on line-1 fell through to the newest ARCHIVE. s1471 caught it
 *       reading line 106 — the s1414 desk of 2026-08-03, three days stale.
 *
 * IT FAILS OPEN, WHICH IS WHY IT SURVIVED 137 FIRES: archived desks are by
 * construction already declared, so every wrong read reports a clean board.
 * s1472 reproduced it on demand — a line-1 with no desk header at all still
 * returned "desk F-IDs: 145 · undeclared: 0 · PASS". When the LIVE desk finally
 * resolved, 4 undeclared items appeared instantly (F-1461-1/4/5/6), three of
 * them buried in rows marked ✅ SHIPPED: the exact F-1328-3 shape this guard
 * exists to catch, hidden by the guard itself.
 *
 * THE CURE IS NOT "STANDARDISE THE PROSE" (s1471's explicit ruling, kept here
 * because it is the tempting wrong fix): that re-hides the defect behind a
 * convention no mechanism enforces. Match ALL FOUR spellings, and REFUSE unless
 * the matched line is LINE 1. The anchor is the load-bearing half — spelling
 * coverage alone would still silently read an archive the day a fire invents a
 * fifth spelling.
 *
 * A PROSE MENTION IS NOT A DESK EITHER (found s1472 while writing the lock line
 * for this very fire — the old bare-substring selector was hijacked by a lock
 * line merely DESCRIBING the desk). Two rules handle it, and the SECOND was
 * chosen over the obvious one after measuring:
 *   - take the LAST desk word on line-1, not the first. The desk is the TAIL of
 *     the handoff, so a narrative mention upstream loses to the real header.
 *   - require F-IDs in the tail (the pre-existing zero-F-IDs refusal, which now
 *     does real work: a prose mention has no list after it).
 * WHAT WAS NOT DONE, AND WHY, because it is the tempting design: constrain the
 * SEPARATOR after the desk word to ':' or a dash. Measured across all 617
 * historical line-1s that carry a desk word — " — " leads at 237, but ":**" is
 * 43, ".**" is 40, and 73 + 59 + 40 + 22 + 19 are bare parentheticals, with a
 * long tail of " to" / " is" / " as" / " ca". A separator whitelist would have
 * failed CLOSED on hundreds of legitimate headers. Swapping a fail-open for a
 * fail-closed is not a cure; measure the corpus before narrowing a parser.
 *
 * AND THE LARGEST FINDING IS NOT THE PARSER — IT IS THAT THE DESK HEADER IS A
 * LAPSED CONVENTION (F-1472-1, measured s1472). Of 1249 line-1s in STATUS.md,
 * 617 carry a desk word and 632 DO NOT; among the last ~55 fires only about 5
 * wrote one. The rest route owner items as bare "🔺 **F-xxxx-x OPEN**" runs
 * inside a NEXT: (A)/(B)/(C) paragraph, with no header to delimit. So for most
 * of this guard's life there was no live desk for it to find, which is WHY the
 * fall-through to archives went unnoticed for 137 fires: the bug and the lapsed
 * convention hid each other. Hence the ACTIVE-lock case below, and hence the
 * refusal on a headerless HANDOFF — a fire that routes items to Robin in prose
 * is doing the invisible thing this guard exists to prevent, one level up.
 *
 * usage:
 *   node scripts/desk-declaration-guard.mjs             # gate (exit 1 on a new undeclared item)
 *   node scripts/desk-declaration-guard.mjs --report    # never gates; prints the full census
 *   node scripts/desk-declaration-guard.mjs --root <dir> # for fixtures
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

function arg(flag) {
  const i = process.argv.indexOf(flag);
  return i === -1 ? null : process.argv[i + 1];
}
const ROOT = path.resolve(arg('--root') || process.cwd());
const REPORT = process.argv.includes('--report');

/**
 * Grandfathered undeclared desk items — measured on the live board s1334
 * (logs/session-scratch/s1334/desk-visibility-probe.mjs, commit fae9a87d).
 * Each is on the owner's desk with no declaring row in tasks/BACKLOG.md.
 * Removing a name from this list once its row exists is always safe.
 */
const GRANDFATHERED = new Set([
  // EMPTY since s1335 — all nine were given declaring rows carrying a FRESH
  // measurement (not their birth text). The list may only ever SHRINK; see the
  // monotonic-ceiling note in the test. Adding a name here requires a measurement.
]);

/**
 * WIDENED s1534 (F-1533-2 measured it, F-1534-1 priced it) from /F-\d{3,4}-\d+/.
 *
 * The digits-only shape was blind to ALPHA-CODED ids — F-MSD-1, F-MILK-SS-3,
 * F-ER02-5, the whole F-BW-* family — and blind on BOTH SIDES AT ONCE: never
 * counted as desk items, never counted as declarations. The two blindnesses
 * cancelled, so the guard reported PASS while carrying undeclared items. That is
 * the F-1471-3 fail-open shape one axis over.
 *
 * THE COST WAS MEASURED BEFORE THE CHANGE, NOT AFTER (F-1534-1): running this
 * regex against the live board first said 21 desk ids / 5 undeclared where the
 * narrow one said 14 / 0. F-1533-2 had prescribed backfilling THREE rows; the
 * corpus named FIVE, and one of its four accused ids (F-MTS-2) already had a row
 * at BACKLOG.md:155. Widening on the prescription alone would have reddened the
 * battery on two ids nobody had named. All five now have rows.
 *
 * Shape shared with desk-carryforward-guard.mjs, which already validates it
 * against every post-cure desk. It is a strict SUPERSET of the old pattern
 * ([A-Z0-9]{1,8} matches "1533"), so no previously-seen id can be lost.
 */
const FINDING = /F-(?:[A-Z0-9]{1,8}-)+\d+/g;
const SUBJECT_CHARS = 90; // same subject zone as findings-state-guard.mjs

/**
 * All four spellings a fire has actually written, measured on STATUS.md s1472:
 * "OWNER DESK" 243 · "OWNER'S DESK" 484 · "OWNER’S DESK" (curly) 15 ·
 * "OWNERS DESK" 9. Case-sensitive on purpose — the header is always shouted,
 * and lowercasing would admit ordinary prose about the owner's desk.
 */
const DESK_WORD = /OWNER(?:'S|’S|S)? DESK/g;

/** Line-1 is a live lock, not a handoff, when it says ACTIVE and not lock CLEARED. */
export function isLockLine(line1) {
  return /\bACTIVE\b/.test(line1) && !/lock CLEARED/.test(line1);
}

/**
 * The desk list is the tail of STATUS.md LINE 1 — never any other line.
 *
 * Returns:
 *   {kind:'lock'}            line-1 is an ACTIVE lock; the desk is written at
 *                            handoff time, so there is nothing to read YET.
 *   {kind:'none'}            a handoff with no desk header: REFUSAL.
 *   {kind:'desk', ids:[...]} the live desk.
 *
 * The old implementation searched the WHOLE FILE for the bare spelling and took
 * the FIRST hit, so a miss on line-1 silently resolved to an archived handoff
 * bullet (F-1471-3). STATUS.md holds ~1250 archived line-1s, every one ending in
 * its own desk, and archived desks are by construction already declared — so the
 * wrong read always looked clean. Line 1 or nothing.
 */
export function deskIds(statusText) {
  const line1 = statusText.split('\n')[0] || '';
  if (isLockLine(line1)) return { kind: 'lock' };
  const hits = [...line1.matchAll(DESK_WORD)];
  if (!hits.length) return { kind: 'none' };
  const last = hits[hits.length - 1]; // the desk is the TAIL; prose mentions lose
  const tail = line1.slice(last.index);
  return { kind: 'desk', ids: [...new Set(tail.match(FINDING) || [])] };
}

/**
 * An id is DECLARED when some BACKLOG row carries it as the first F-ID of its
 * 90-char subject zone. The markdown list bullet is stripped first so that
 * "- 🟡 **F-x" and "🟡 **F-x" are read identically.
 */
export function declaredIds(backlogText) {
  const found = new Map();
  backlogText.split('\n').forEach((line, i) => {
    const body = line.trim().replace(/^[-*]\s+/, '');
    const first = (body.slice(0, SUBJECT_CHARS).match(FINDING) || [])[0];
    if (first && !found.has(first)) found.set(first, i + 1);
  });
  return found;
}

function main() {
  const statusPath = path.join(ROOT, 'STATUS.md');
  const backlogPath = path.join(ROOT, 'tasks', 'BACKLOG.md');
  for (const p of [statusPath, backlogPath]) {
    if (!fs.existsSync(p)) {
      console.error(`desk-declaration-guard: REFUSING — cannot read ${p}`);
      process.exit(2);
    }
  }

  const desk = deskIds(fs.readFileSync(statusPath, 'utf8'));

  if (desk.kind === 'lock') {
    // NOT a fail-open. A fire holds an ACTIVE lock for its whole run and writes
    // the desk only in its handoff, so mid-fire there is genuinely no desk yet —
    // and `test:node-guards` runs mid-fire in every drain battery. The real gate
    // is `test:ledger-guards`, which every fire runs as its LAST act, AFTER the
    // handoff commit has replaced line-1 with a CLEARED line (F-1300-4's order).
    console.log('=== desk-declaration-guard ===');
    console.log('SKIP — STATUS.md line-1 is a live ACTIVE lock, not a handoff.');
    console.log('  The desk is written at handoff time; test:ledger-guards gates it then.');
    return;
  }

  if (desk.kind === 'none') {
    console.error('desk-declaration-guard: REFUSING — line-1 is a handoff with no desk header.');
    console.error('');
    console.error('  Write the desk as an explicit, greppable segment at the END of line-1,');
    console.error('  e.g. "🔺 **OWNER\'S DESK — <n> awaiting a word.** 🔺 **F-xxxx-x** …".');
    console.error('  Any of OWNER DESK / OWNER\'S DESK / OWNERS DESK is matched.');
    console.error('');
    console.error('  WHY THIS IS A REFUSAL AND NOT A PASS (F-1471-3/F-1472-1): routing items');
    console.error('  to Robin as loose prose leaves nothing any guard can check, which is the');
    console.error('  invisibility the Completeness Law forbids. A pass here would mean "I read');
    console.error('  nothing", and that green is exactly what hid 4 undeclared items for 137');
    console.error('  fires. If the desk is genuinely EMPTY, say so with the header anyway.');
    process.exit(2);
  }

  const ids = desk.ids;
  if (ids.length === 0) {
    console.error('desk-declaration-guard: REFUSING — the desk segment holds zero F-IDs.');
    console.error('  Either the desk format changed or the parser is broken; both need a human.');
    console.error('  (A prose mention of the desk with no list after it lands here too.)');
    process.exit(2);
  }

  const declared = declaredIds(fs.readFileSync(backlogPath, 'utf8'));
  const undeclared = ids.filter((id) => !declared.has(id));
  const fresh = undeclared.filter((id) => !GRANDFATHERED.has(id));
  const retired = [...GRANDFATHERED].filter((id) => declared.has(id));

  console.log('=== desk-declaration-guard ===');
  console.log('desk F-IDs        :', ids.length);
  console.log('with a BACKLOG row:', ids.length - undeclared.length);
  console.log('undeclared        :', undeclared.length, `(grandfathered ${GRANDFATHERED.size})`);
  if (REPORT) {
    for (const id of ids) {
      const at = declared.get(id);
      console.log(`  ${at ? 'ROW  @' + at : GRANDFATHERED.has(id) ? 'none (grandfathered)' : 'NONE'}  ${id}`);
    }
  }
  if (retired.length) {
    console.log(
      `ⓘ ${retired.length} grandfathered item(s) now declared — safe to delete from the list: ${retired.join(', ')}`,
    );
  }

  if (fresh.length) {
    console.error('');
    console.error(`FAIL — ${fresh.length} desk item(s) have no declaring row in tasks/BACKLOG.md:`);
    for (const id of fresh) console.error(`  ${id}`);
    console.error('');
    console.error('The dashboard renders BACKLOG.md, so these are on no board the owner reads');
    console.error('(Completeness Law: "invisible = forgotten"). Give each one a row whose FIRST');
    console.error(`F-ID, within the first ${SUBJECT_CHARS} characters, is that id. A mention inside`);
    console.error('another finding\'s row does NOT count — that is the F-1328-3 shape.');
    process.exit(1);
  }

  console.log('PASS — every non-grandfathered desk item has a declaring row.');
}

// NOT `file://${process.argv[1]}` — this repo's path contains a space, which
// import.meta.url percent-encodes and process.argv[1] does not. That comparison
// is false here, so the guard ran as a no-op and EXITED 0: a silent pass that
// read nothing. Caught s1334 by running it before trusting it.
// The argv[1] presence check is the SIBLING half of that fix (s1533): with no
// argv[1] — `node -e "import(...)"`, some test harnesses — pathToFileURL THROWS,
// so importing this module for its exports crashes instead of yielding them.
// Same defect, same line, cured in desk-carryforward-guard.mjs the same fire.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();

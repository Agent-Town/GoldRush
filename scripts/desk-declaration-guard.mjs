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

const FINDING = /F-\d{3,4}-\d+/g;
const SUBJECT_CHARS = 90; // same subject zone as findings-state-guard.mjs

/** The desk list is the tail of the newest STATUS line carrying "OWNER DESK". */
export function deskIds(statusText) {
  const line = statusText.split('\n').find((l) => l.includes('OWNER DESK'));
  if (!line) return null; // caller decides: this is a refusal, not an empty set
  const tail = line.slice(line.indexOf('OWNER DESK'));
  return [...new Set(tail.match(FINDING) || [])];
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

  const ids = deskIds(fs.readFileSync(statusPath, 'utf8'));
  if (ids === null) {
    console.error('desk-declaration-guard: REFUSING — no "OWNER DESK" segment in STATUS.md.');
    console.error('  A pass here would mean "I read nothing", not "the desk is clean".');
    process.exit(2);
  }
  if (ids.length === 0) {
    console.error('desk-declaration-guard: REFUSING — the OWNER DESK segment holds zero F-IDs.');
    console.error('  Either the desk format changed or the parser is broken; both need a human.');
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
if (import.meta.url === pathToFileURL(process.argv[1]).href) main();

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
import { isMain } from './is-main.mjs';
// F-2241-1: the identical discriminator its sibling desk-carryforward-guard got
// from F-2232-1. That census keyed on legs invoked BARE in test:ledger-guards;
// this leg reaches the same battery through `npm run test:desk-declaration`, so
// it was invisible to the key and never got the cure.
import { corpusTree, frozenTreeCheck } from './corpus-tree.mjs';

function arg(flag) {
  const i = process.argv.indexOf(flag);
  return i === -1 ? null : process.argv[i + 1];
}
const ROOT = path.resolve(arg('--root') || process.cwd());
const REPORT = process.argv.includes('--report');

/**
 * Grandfathered undeclared desk items — measured on the live board s1334
 * (logs/session-scratch/s1334/desk-visibility-probe.mjs, commit 0aedf87f).
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
/** Non-global twin of FINDING — `.match` only reports `.index` when NOT global. */
const FINDING_ONE = /F-(?:[A-Z0-9]{1,8}-)+\d+/;
const SUBJECT_CHARS = 90; // same subject zone as findings-state-guard.mjs

/**
 * THE SECOND KEY SHAPE (F-1534-2 measured it, F-1535-1 priced it).
 *
 * The desk routes items under TWO shapes, and until s1535 this guard knew only
 * one. `desk-carryforward-guard` has always carried both; the divergence hid
 * because on the s1533 desk each guard reported 21 and they were DIFFERENT 21s
 * (carryforward: 17 F-IDs + 4 slugs; this guard: 21 F-IDs, picking up riding ids
 * the other cannot key and dropping all four slugs). Matching totals, disjoint
 * membership — two guards can agree on the count and disagree on the SET.
 *
 * ⚠️ REUSING THE PATTERN IS NOT REUSING THE PARSER, AND THAT IS THE WHOLE
 * DESIGN NOTE. F-1534-2 prescribed "add the SLUG shape reusing the pattern in
 * desk-carryforward-guard.mjs". Taken literally — dropping SLUG into this
 * guard's FLAT tail scan the way FINDING is used — it is WRONG, and s1535
 * measured the cost before building it rather than after:
 *
 *   ARM A (flat, this guard's F-ID reading):  7 slug hits → 3 spurious
 *   ARM B (🔺-segment anchored, KEY_ZONE 120): 4 slug hits → 0 spurious
 *
 * The three ARM A invents are `e2-incline` (a MAP NAME inside F-1529-4's prose)
 * and `calibrate-suite-workers-v2` / `vp-02e-jumper-8way-activation` (aliases of
 * items already keyed by their F-ID: "🔺 **F-1101-1 / `calibrate-…`"). None is a
 * desk item; all three would have demanded a BACKLOG row and RED the battery.
 *
 * WHY THE ASYMMETRY IS CORRECT RATHER THAN AN INCONSISTENCY: an F-ID appearing
 * anywhere in the tail is ALWAYS a real finding, so the flat scan's extra hits
 * are a FEATURE — that is how F-1193-2 was caught riding inside F-1242-1's item
 * (s1334), and narrowing it would lose that. A BACKTICK, by contrast, is this
 * repo's ordinary prose markup for paths, scripts, ids and map names, so the
 * same flat scan on slugs is nearly all noise. Different shapes, different
 * signal-to-noise, therefore different parsers — deliberately.
 *
 * ARM B validated against ground truth: it keys 21 of 21 segments with 0
 * unkeyed, matching the "— 21 awaiting a word" the s1534 desk wrote in its own
 * header. A parser whose denominator nobody checks is how the 145-id misread
 * survived (F-1471-3).
 */
const SLUG = /`([a-z0-9][a-z0-9-]{6,})`/;
/**
 * How far into a 🔺 segment the item's own key may sit — shared with
 * desk-carryforward-guard.mjs. The convention is "🔺 **<key> …", so the key is
 * at the very front; anything further in is that item's PROSE, which routinely
 * cites other findings and other files.
 */
const KEY_ZONE = 120;

/**
 * All FIVE spellings a fire has actually written. Four measured on STATUS.md
 * s1472: "OWNER DESK" 243 · "OWNER'S DESK" 484 · "OWNER’S DESK" (curly) 15 ·
 * "OWNERS DESK" 9. Case-sensitive on purpose — the header is always shouted,
 * and lowercasing would admit ordinary prose about the owner's desk.
 *
 * ⚠️ THE FIFTH IS A BACKTICK, U+0060 — "OWNER`S DESK" (F-1542-1, s1542).
 * s1529 wrote a perfectly well-formed desk of 8 items with a grave accent where
 * the apostrophe goes, and BOTH desk guards went blind to it at once:
 *   - this guard REFUSED (rc=2) with "line-1 is a handoff with no desk header",
 *     which is a false diagnosis — there was a header, and a reader sent to
 *     write one would be fixing a thing that was not broken;
 *   - desk-carryforward-guard read "this desk: 0 items" and reported all 7
 *     inherited items as SILENTLY DROPPED (rc=1) — the guard built to catch
 *     drops accusing a fire of dropping its entire desk.
 * Both fail SAFE in direction (nothing greened over, no owner item lost) and
 * both name the wrong cause, which is the false-first-blocker class: an
 * investigator who believes the message never looks for the backtick.
 *
 * It is invisible in today's STATUS.md because s1530 normalised the character
 * while archiving s1529's line-1 — so grepping the live file can never find
 * this class. It was recovered by replaying the handoff commits (62586985).
 *
 * WHY THE SET KEEPS GROWING RATHER THAN BEING GUESSED: the s1472 cure
 * enumerated the spellings it had measured, which is right, but an enumeration
 * of observed spellings is a floor and not a ceiling. Add the variant when a
 * fire writes one; do NOT relax to a wildcard separator, which would let
 * "OWNER-DESK" (41 occurrences, all prose) supply the tail.
 *
 * EXPORTED, AND SINGLE-SOURCED HERE — F-2322-1, s2322.
 *
 * This literal was hand-copied into desk-birth-guard.mjs and
 * desk-carryforward-guard.mjs, and all three sites carried a written "keep these
 * in step" instruction that nothing enforced. That is the exact shape F-2227-1
 * measured on isLockLine (four copies, one silently retired for hundreds of
 * fires) and F-2228-1 measured on the F-ID pattern (seven copies, three
 * variants) — in these very files.
 *
 * The drift was proven ASYMMETRIC by manufacturing it (s2322), which is why the
 * "keep in step" comments were not enough on their own:
 *   - NARROWING one copy is caught. Each file's own suite asserts it still reads
 *     the backtick spelling, so dropping it reds (measured: rc=1 on two arms).
 *   - WIDENING one copy is INVISIBLE. Adding a sixth spelling to one file alone
 *     left all 14 desk guards and all three bare tools at rc=0 — including the
 *     test named "the three desk parsers stay in step", which asserts only its
 *     OWN copy reads the five spellings and never that the copies agree.
 * The paragraph directly above tells a maintainer to "add the variant when a
 * fire writes one" — i.e. the documented maintenance action points straight into
 * the one direction no guard could see.
 *
 * Unlike FINDING/FINDING_ROW below, there is no two-grammars question here
 * (F-2229-1): all three consumers ask the IDENTICAL question of the IDENTICAL
 * subject — "where on this line does the desk tail begin?" — and all three
 * answered it with a byte-identical literal and a byte-identical LAST-match
 * rule. One question, one declaration.
 *
 * ⚠️ IT IS /g AND THEREFORE STATEFUL. Every consumer must reach it through
 * String.prototype.matchAll, which clones the regex and leaves lastIndex alone.
 * A caller that uses .test() or .exec() on this shared instance advances a
 * lastIndex the OTHER TWO MODULES then read — a cross-module bug that could not
 * exist while the copies were private, i.e. a hazard introduced by this very
 * cure. scripts/desk-word-single-source-guard.test.mjs asserts statelessness
 * across repeated calls precisely to bound it.
 */
export const DESK_WORD = /OWNER(?:'S|’S|S|`S)? DESK/g;

/** Line-1 is a live lock, not a handoff, when it says ACTIVE and not lock CLEARED. */
export function isLockLine(line1) {
  return /\bACTIVE\b/.test(line1) && !/lock CLEARED/.test(line1);
}

/**
 * The header SHAPE — a 🔺 bullet opening in bold, optionally with a second glyph
 * (`🔺🚨 **`). Tested against everything BEFORE the desk word, anchored at the
 * end, so the window can never be mis-sized: 🔺 and 🚨 are two UTF-16 units each
 * and a fixed slice is exactly the kind of off-by-one this file keeps recording.
 */
const HEADER_SHAPE = /🔺[^*🔺]{0,4}\*\*\s*$/u;

/**
 * WHERE ON LINE-1 DOES THE DESK TAIL BEGIN? — one question, ONE declaration.
 *
 * F-2435-1 (measured s2435), curing F-2434-1 (filed s2434).
 *
 * F-1471-3's cure was "the desk is the TAIL; prose mentions lose", implemented as
 * the LAST bare DESK_WORD hit. That is correct for a mention UPSTREAM of the
 * header and it INVERTS for one DOWNSTREAM — i.e. sitting INSIDE the desk body,
 * where "last wins" promotes the fragment to header and silently discards every
 * item above it. A rule that disambiguates by POSITION assumes the noise is all
 * on one side; here the fix for prose-BEFORE became the defect for prose-WITHIN.
 *
 * ⚙️ THE MECHANISM IS THIS FAMILY'S OWN ERROR TEXT, WHICH IS WHY IT RECURS. All
 * seven divergent desks in the corpus are handoffs QUOTING a desk guard's red —
 * "N item(s) left the OWNER'S DESK with no reason given" — or carrying a severed
 * remnant of that sentence spliced into the desk body. A guard's failure message
 * is a PARSER INPUT the moment a fire narrates it, and these three parsers read
 * the surface their own siblings write about.
 *
 * 📊 BEHAVIOUR MEASURED OVER THE WHOLE CORPUS BEFORE LANDING (F-1274-2), not
 * asserted: 1,551 non-lock desk-bearing line-1s in STATUS.md (line 1 plus every
 * archived bullet). 1,544 parse BYTE-IDENTICALLY to the old rule. Exactly 7 move,
 * and every one moves BACKWARD onto the real `🔺 **OWNER'S DESK` header:
 * s2434 · s2433 · s2432 (1 segment recovered each) · s2430 · s2429 · s2428
 * (2 each) · s2274 (0 — a start move with no item behind it). On the desk this
 * fire inherited that recovers `NEW — HEAT 10 NEEDS A RE-RIDE AUTHORIZATION`,
 * the newest item and the one asking the owner for a spend authorization, born
 * into the blind region at s2432 and never once examined.
 *
 * ⚖️ SEVERITY, HONESTLY: the realised cost was ZERO and that was verified, not
 * assumed — the recovered segment carries no F-ID and no backticked slug, and the
 * one id the window gains (`F-2434-1`, from the header sentence itself) IS
 * declared at tasks/BACKLOG.md:1. Nothing undeclared ever slipped past. What
 * earns the cure is the DIRECTION (permissive, in a MANDATED gate) and the
 * RESIDENCE: the blind region is precisely where a fire writes a NEW desk item.
 *
 * 🚦 THE FALLBACK IS LOAD-BEARING AND MUST STAY. When NO hit is header-shaped the
 * rule degrades to plain last-wins, which is what keeps the other 1,544 — and
 * every desk written before the 🔺 convention — parsing exactly as they did. An
 * anchor with no fallback would refuse on lawful historical desks and be excused
 * into uselessness inside a week (F-1460-1, the `cross-engine` fate).
 *
 * Returns the index, or -1 when the line carries no desk word at all.
 */
export function deskTailStart(line) {
  const hits = [...line.matchAll(DESK_WORD)];
  if (!hits.length) return -1;
  const shaped = hits.filter((h) => HEADER_SHAPE.test(line.slice(0, h.index)));
  return (shaped.length ? shaped : hits).at(-1).index;
}

/** The desk tail of a line: everything from the header on, or null if there is none. */
export function deskTail(line) {
  const i = deskTailStart(line);
  return i === -1 ? null : line.slice(i);
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
  const tail = deskTail(line1);
  if (tail === null) return { kind: 'none' };
  return {
    kind: 'desk',
    ids: [...new Set(tail.match(FINDING) || [])],
    slugs: deskSlugs(tail),
    segments: tail.split('🔺').length - 1,
    unexamined: unexaminedSegments(tail),
  };
}

/**
 * THE DENOMINATOR THIS GUARD NEVER CHECKED — F-2256-1.
 *
 * The PASS says "every non-grandfathered desk item has a declaring row". The
 * corpus that claim ranges over is whatever the two parsers above managed to
 * KEY: `ids` (a FLAT scan, so an F-ID anywhere in the tail counts) UNION
 * `slugs` (segment-anchored, first key inside KEY_ZONE). A 🔺 segment that
 * contributes to NEITHER is an owner item this guard never examined — it cannot
 * appear in `undeclared`, so it is structurally incapable of failing the gate.
 *
 * The irony is that the SLUG note above already states the principle — "a parser
 * whose denominator nobody checks is how the 145-id misread survived (F-1471-3)"
 * — and then the denominator is checked NOWHERE in this file. It was validated
 * by hand, once, at s1535, against that day's board.
 *
 * PROVEN BY MANUFACTURING, not by a green (s2256). Ground truth: a desk carrying
 * one item with no declaring row, written exactly as s1585 wrote four of them.
 *   backticked `rf-34-hero-y-restore-roundtrip` -> FAIL rc=1, names it
 *   written BARE (same item, same absent row)   -> PASS rc=0, "desk slugs: 0"
 * and that PASS is BYTE-IDENTICAL on stdout and rc to a genuinely clean board.
 * The "desk slugs: 0" line is TRUE — about a corpus that excluded the item.
 *
 * SEVERITY, STATED HONESTLY AND NOT INFLATED: LATENT on today's board (the live
 * inherited desk reads 27 segments / 27 stated / 0 unexamined). But it has been
 * LIVE 20 times since the s1535 cure — 24 unexamined segments — and 10 of those
 * are REAL owner items: s1585's four owner-forked goal slugs written without
 * backticks, the FIVE-MAP FORK TABLE carried by s2123/s2124/s2125, `F-1533-x`
 * (a placeholder id, so FINDING's trailing \d+ never matches) and MP-07c.
 *
 * WHY THIS DECLARES AND DOES NOT REFUSE, and the restraint is MEASURED rather
 * than stylistic: the other 14 of those 24 are ordinary handoff PROSE riding a
 * 🔺 — "AUDITED with `desk-state-audit --status`…", "Carried from s1580 and
 * re-verified…", and mid-sentence 🔺 glyphs that split a clause. A refusal would
 * red the battery on honest writing and be excused into uselessness inside a
 * week (F-1460-1, the `cross-engine` fate), taking the declaration down with it.
 * 58% noise is not a gate. The sibling desk-carryforward-guard reached the same
 * verdict from its own histogram and reports `liveUnkeyed` advisorily; this is
 * that concept adopted, which is the fourth fire running that the corpus already
 * held the correct pattern and this file had simply never taken it.
 *
 * FINDING_ONE, not FINDING: the global twin carries `lastIndex` between calls,
 * so `.test` in a filter would skip every other segment.
 */
export function unexaminedSegments(tail) {
  return String(tail)
    .split('🔺')
    .slice(1)
    .filter((seg) => !FINDING_ONE.test(seg) && deskSlugs(`🔺${seg}`).length === 0)
    .map((seg) => seg.trim().replace(/\s+/g, ' ').slice(0, KEY_ZONE));
}

/**
 * The SLUG-keyed desk items in a tail: one per 🔺 segment whose key is a
 * backticked slug rather than an F-ID (see the SLUG note above for why this is
 * segment-anchored while the F-ID scan is flat).
 *
 * First-key-wins inside KEY_ZONE, exactly as desk-carryforward-guard does it:
 * "🔺 **F-1101-1 / `calibrate-suite-workers-v2` OPEN**" is an F-ID item that
 * happens to cite its slug, NOT a slug item, so it must not be keyed here.
 */
export function deskSlugs(tail) {
  const out = [];
  for (const seg of String(tail).split('🔺').slice(1)) {
    const head = seg.slice(0, KEY_ZONE);
    const f = head.match(FINDING_ONE);
    const s = head.match(SLUG);
    if (s && (!f || s.index < f.index)) out.push(s[1]);
  }
  return [...new Set(out)];
}

/**
 * A ROW KEY IS A WHOLE TOKEN — F-2229-1.
 *
 * FINDING is unanchored, so on a row about a sub-finding it matches a PREFIX and
 * keys the row under an id that is not in the text: "F-CLAW-2X" is keyed F-CLAW-2,
 * "F-0707-5a" is keyed F-0707-5. That manufactures a declaration for a desk item
 * that has no row of its own, and this guard's own FAIL text is the principle it
 * was breaking: "A mention inside another finding's row does NOT count."
 * PROVEN BY MANUFACTURING (not by a green): desk item F-CLAW-2, whose only BACKLOG
 * row declares F-CLAW-2X — as shipped PASS rc=0, whole-token FAIL rc=1. A false
 * green, in a chained test:ledger-guards leg, in the permissive direction.
 *
 * WHY NOT IMPORT findings-state-guard's cured FINDING, which F-2228-1 anchored and
 * which F-2227-1's rule would tell you to reuse: it rejects the trailing sub-id
 * letter outright, so all FOUR live sub-ids (F-2131-1b, F-GNT-4b, F-0707-5a,
 * F-CLAW-2X) would key NOTHING — trading a permissive miss for a blind one. The
 * ledger asks "what state does this row declare?", where F-1419-2s is prose
 * inflection of F-1419-2 and must not mint an id; this asks "what does this row
 * KEY?", where F-2131-1b is a real finding distinct from its parent F-2131-1 (the
 * row reading "F-2131-1 (OPEN — OWNER DESIGN FORK, declared s2131" — cited by
 * CONTENT, because this very fire's own two BACKLOG rows moved that line by 4).
 * Two questions, two grammars — the sibling is right for its own.
 *
 * WHY THE DESK-TAIL SCAN IS DELIBERATELY LEFT ALONE: widening it the same way was
 * MEASURED and is worse — across all 1457 historical desks it invents three items
 * that have no row (F-1314-5b, F-1285-4s, F-1260-3s), two of them prose inflections,
 * i.e. it reds the battery on ordinary handoff prose (the F-1460-1 fate). Changing
 * only the key side regresses NOTHING: 1095 occurrences / 170 distinct undeclared
 * before and after, and 0 undeclared on the live desk.
 *
 * RESIDUAL, stated rather than hidden: a future desk that routes a sub-id whose
 * PARENT has no row (say F-GNT-4b with no F-GNT-4 row) now reads undeclared, where
 * the two truncations used to cancel out. It has never occurred in 1457 desks, it
 * fails LOUD, and the fire writing the desk fixes it by filing the row it should
 * have filed. The grammar question itself is banked as F-2229-2.
 */
export const FINDING_ROW = /\bF-(?:[A-Z0-9]{1,8}-)+\d+[A-Za-z]?\b/g;
/**
 * Non-global twin of FINDING_ROW — `.match` reports `.index` only when NOT
 * global, and a caller that must decide whether an F-ID or a backticked SLUG
 * comes first needs that index (desk-birth-guard's rowId does exactly this).
 *
 * DERIVED from FINDING_ROW.source rather than written out again: this file
 * already carries a hand-copied FINDING/FINDING_ONE pair, and F-2227-1's
 * measured lesson is that four independent copies of one predicate is HOW it
 * drifted. A derived twin cannot drift from its original by construction.
 *
 * EXPORTED because desk-birth-guard asks the IDENTICAL question about the
 * IDENTICAL subject — "what does this BACKLOG row KEY?" — and F-2229-1 ruled
 * that question's grammar here, with the reasoning above. It is the row-key
 * side only: the desk-TAIL scan stays narrow, for the measured reason at
 * FINDING's own site.
 */
export const FINDING_ROW_ONE = new RegExp(FINDING_ROW.source);

/**
 * An id is DECLARED when some BACKLOG row carries it as the first F-ID of its
 * 90-char subject zone. The markdown list bullet is stripped first so that
 * "- 🟡 **F-x" and "🟡 **F-x" are read identically.
 */
export function declaredIds(backlogText) {
  const found = new Map();
  backlogText.split('\n').forEach((line, i) => {
    const body = line.trim().replace(/^[-*]\s+/, '');
    const first = (body.slice(0, SUBJECT_CHARS).match(FINDING_ROW) || [])[0];
    if (first && !found.has(first)) found.set(first, i + 1);
  });
  return found;
}

/**
 * The same question on the slug axis: a slug is DECLARED when some BACKLOG row
 * carries it as the first backticked slug of its 90-char subject zone. Same zone
 * and same bullet-stripping as declaredIds, so "- 🔺 **`slug`" and "🔺 **`slug`"
 * read identically, and a slug merely CITED deep inside another item's row does
 * not count — the F-1328-3 discriminator, one shape over.
 */
export function declaredSlugs(backlogText) {
  const found = new Map();
  backlogText.split('\n').forEach((line, i) => {
    const body = line.trim().replace(/^[-*]\s+/, '');
    const m = body.slice(0, SUBJECT_CHARS).match(SLUG);
    if (m && !found.has(m[1])) found.set(m[1], i + 1);
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

  // F-2271-1 (s2271): ONE read, both consumers — see the twin block in
  // desk-birth-guard.mjs. This file read STATUS.md twice per verdict: here for the
  // desk, and again at the frozenTreeCheck call below for the freshness cross-check.
  // desk-carryforward-guard.mjs:341 has always had the cured structure; this is the
  // class being finished, not a new idea.
  const statusText = fs.readFileSync(statusPath, 'utf8');
  const desk = deskIds(statusText);

  if (desk.kind === 'lock') {
    // NOT a fail-open. A fire holds an ACTIVE lock for its whole run and writes
    // the desk only in its handoff, so mid-fire there is genuinely no desk yet —
    // and `test:node-guards` runs mid-fire in every drain battery. The real gate
    // is `test:ledger-guards`, which every fire runs as its LAST act, AFTER the
    // handoff commit has replaced line-1 with a CLEARED line (F-1300-4's order).
    console.log('=== desk-declaration-guard ===');
    console.log('corpus tree       :', corpusTree(ROOT));
    console.log('SKIP — STATUS.md line-1 is a live ACTIVE lock, not a handoff.');
    console.log('  The desk is written at handoff time; test:ledger-guards gates it then.');
    return;
  }

  if (desk.kind === 'none') {
    console.error('desk-declaration-guard: REFUSING — line-1 is a handoff with no desk header.');
    console.error('');
    console.error('  Write the desk as an explicit, greppable segment at the END of line-1,');
    console.error('  e.g. "🔺 **OWNER\'S DESK — <n> awaiting a word.** 🔺 **F-xxxx-x** …".');
    console.error('  Any of OWNER DESK / OWNER\'S DESK / OWNERS DESK / OWNER`S DESK is matched.');
    console.error('  (If you believe you DID write one, check the apostrophe: a backtick,');
    console.error('   a stray glyph, or a lowercased header all read as "no desk" — F-1542-1.)');
    console.error('');
    console.error('  WHY THIS IS A REFUSAL AND NOT A PASS (F-1471-3/F-1472-1): routing items');
    console.error('  to Robin as loose prose leaves nothing any guard can check, which is the');
    console.error('  invisibility the Completeness Law forbids. A pass here would mean "I read');
    console.error('  nothing", and that green is exactly what hid 4 undeclared items for 137');
    console.error('  fires. If the desk is genuinely EMPTY, say so with the header anyway.');
    process.exit(2);
  }

  const ids = desk.ids;
  const slugs = desk.slugs ?? [];
  if (ids.length === 0 && slugs.length === 0) {
    console.error('desk-declaration-guard: REFUSING — the desk segment holds zero keyed items.');
    console.error('  Neither an F-ID nor a `backticked-slug` was found after the desk header.');
    console.error('  Either the desk format changed or the parser is broken; both need a human.');
    console.error('  (A prose mention of the desk with no list after it lands here too.)');
    process.exit(2);
  }

  const backlogText = fs.readFileSync(backlogPath, 'utf8');
  const declared = declaredIds(backlogText);
  const declaredSlug = declaredSlugs(backlogText);
  const undeclared = ids.filter((id) => !declared.has(id));
  const undeclaredSlugs = slugs.filter((s) => !declaredSlug.has(s));
  const fresh = [...undeclared, ...undeclaredSlugs].filter((id) => !GRANDFATHERED.has(id));
  const retired = [...GRANDFATHERED].filter((id) => declared.has(id) || declaredSlug.has(id));

  console.log('=== desk-declaration-guard ===');
  console.log('corpus tree       :', corpusTree(ROOT));
  console.log('desk F-IDs        :', ids.length);
  console.log('desk slugs        :', slugs.length);
  // F-2256-1: the DENOMINATOR. Printed ALWAYS, including the happy path — a
  // declaration that appears only on failure re-creates the ambiguity it
  // removes (F-2208-1), and here the failure state is a PASS, so there is no
  // failure for it to appear on. `unexamined 0` is the line that separates
  // "I checked all 27 items" from "I checked the 23 I could see".
  console.log('🔺 desk segments  :', desk.segments);
  console.log('unexamined        :', desk.unexamined.length);
  for (const seg of desk.unexamined) console.log(`   | ${seg}`);
  if (desk.unexamined.length) {
    console.log(
      '   ⓘ ADVISORY, not a failure: each line above is a 🔺 segment carrying neither an F-ID',
    );
    console.log(
      '     nor a front `backticked-slug`, so this guard never examined it. If one is a real',
    );
    console.log(
      '     owner item, key it — otherwise it is prose and the count is expected to be non-zero.',
    );
  }
  console.log('with a BACKLOG row:', ids.length - undeclared.length + (slugs.length - undeclaredSlugs.length));
  console.log(
    'undeclared        :',
    undeclared.length + undeclaredSlugs.length,
    `(grandfathered ${GRANDFATHERED.size})`,
  );
  if (REPORT) {
    for (const id of ids) {
      const at = declared.get(id);
      console.log(`  ${at ? 'ROW  @' + at : GRANDFATHERED.has(id) ? 'none (grandfathered)' : 'NONE'}  ${id}`);
    }
    for (const s of slugs) {
      const at = declaredSlug.get(s);
      console.log(`  ${at ? 'ROW  @' + at : GRANDFATHERED.has(s) ? 'none (grandfathered)' : 'NONE'}  ${s} (slug)`);
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
    console.error(`key, within the first ${SUBJECT_CHARS} characters, is that item — its F-ID for an`);
    console.error('F-keyed item, its `backticked-slug` for a slug-keyed one. A mention inside');
    console.error('another finding\'s row does NOT count — that is the F-1328-3 shape.');
    process.exit(1);
  }

  // F-2241-1: the PASS is the only verdict a frozen tree can make DANGEROUS — a
  // SKIP asserts nothing and a FAIL is already loud. Proven by manufacturing:
  // ground truth = a real undesked item on main; from a worktree branched one
  // commit earlier this printed PASS at rc=0, BYTE-IDENTICAL on stdout, stderr
  // AND rc to a genuinely clean board.
  // F-2271-1: the SAME text the desk above was parsed from. Was a second
  // `fs.readFileSync(statusPath, 'utf8')` here.
  const frozen = frozenTreeCheck(ROOT, statusText, 'desk-declaration-guard');
  if (frozen) {
    console.error('');
    console.error(frozen);
    process.exit(2);
  }

  console.log('PASS — every non-grandfathered desk item has a declaring row.');
}

// NOT `file://${process.argv[1]}` — this repo's path contains a space, which
// import.meta.url percent-encodes and process.argv[1] does not. That comparison
// is false here, so the guard ran as a no-op and EXITED 0: a silent pass that
// read nothing. Caught s1334 by running it before trusting it.
// isMain (./is-main.mjs) carries the SIBLING half of that fix (s1533): with no
// argv[1] (`node -e "import(...)"`, some test harnesses) it answers "not main"
// instead of throwing, so importing this module yields its exports. And it compares
// REAL paths: a symlinked spelling was the same silent pass again (F-LS1-2).
if (isMain(import.meta.url)) main();

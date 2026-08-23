#!/usr/bin/env node
/**
 * desk-birth-guard.mjs — did every OWNER-GATED row filed this window reach a desk
 * AT ALL? (F-1541-2, priced s1542, built s1542.)
 *
 * THE HOLE THIS FILLS, and why the sibling guard cannot see it.
 * desk-carryforward-guard compares desk N -> desk N+1 and asks what was DROPPED.
 * An item that never reached a FIRST desk is therefore invisible to it — not for
 * a while, but in EVERY future fire, because it can only ever be missing from
 * both sides of the comparison. The population this actually bites is attended
 * sessions: they file ledger rows and never compose a desk, so an owner fork
 * filed at 04:08 reaches Robin only if the next fire happens to notice it.
 * s1541 noticed (F-BAL-1, F-AH-1's owner half). This is the mechanism for the
 * fire that doesn't.
 *
 * WHY THIS IS NOT THE CHECK s1533 MEASURED AND REJECTED.
 * s1533 rejected a ledger<->desk cross-check on the finding that "nobody fails to
 * declare — items are declared correctly, desked correctly, carried for dozens of
 * fires, and then dropped", with a 23% false-positive rate from KEY DRIFT
 * (F-1096-2 <-> rf-34-hero-y-restore-roundtrip and friends re-keyed across
 * desks). That failure mode is specific to re-keying an OLD item across many
 * desks. This guard never does that: it looks only at rows BORN in this window,
 * which have no prior desk key to drift from. Different population, different
 * failure mode — and s1533's measurement was taken over fire-authored rows,
 * which is exactly the set that does not exhibit the defect.
 *
 * PRICED BEFORE IT WAS BUILT, as its own finding's GATE demanded (s1542, over the
 * last 25 handoff windows, 96 rows added — artifacts/f1541-2-pricing/):
 *
 *     selector/membership   qualifying   hits   false positives
 *     loose  / forgiving        20         2          0
 *     loose  / strict           20         4          2   <- F-FD3-1, F-ER02-11
 *     tight  / forgiving        15         2          0
 *     tight  / strict           15         2          0   <- BUILT
 *
 * Both hits in the built cell are real and were the two items s1541 had found by
 * hand: F-AH-1's owner half and F-BAL-1. The two false positives in the loose
 * row are rows whose gate merely CONTAINS the word owner while turning on a
 * drain ("GATE: drain when lane-b reports ... owner ...") — which is why the
 * selector below matches an owner ACT, not the word.
 *
 * ⓘ The strict column only became usable this same fire: until F-1542-1, a
 * backtick apostrophe in s1529's header made its desk unreadable and produced a
 * third, phantom hit. A membership test is only as good as the desk parser under
 * it — do not loosen this one to work around a header the parser cannot read;
 * teach the parser the header.
 *
 * USAGE
 *   node scripts/desk-birth-guard.mjs            # gate: exit 1 on an undesked owner row
 *   node scripts/desk-birth-guard.mjs --report   # never gates; prints the window
 *   node scripts/desk-birth-guard.mjs --root <d> # for fixtures (a real git tree)
 *
 * ESCAPE HATCH. A gate can name an owner act and still not be owed to him this
 * fire (it may be superseded, or already sitting on the desk under another key).
 * Say so on line-1 and this passes:
 *
 *     DESK-NOT-OWED: F-1234-5 — <already desked as X | superseded by Y | ruled <when>>
 *
 * It is scoped to 400 characters after the mark, like desk-carryforward-guard's
 * DESK-DROPPED, so one acknowledgement cannot silently cover an unrelated id.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

function arg(flag) {
  const i = process.argv.indexOf(flag);
  return i === -1 ? null : process.argv[i + 1];
}
const ROOT = path.resolve(arg('--root') || process.cwd());
const REPORT = process.argv.includes('--report');

/**
 * Identical literal to desk-declaration-guard.mjs and desk-carryforward-guard.mjs.
 * Five spellings: four measured s1472, the backtick (U+0060) added s1542 after a
 * real handoff wrote it — F-1542-1. Keep all three in step.
 */
const DESK_WORD = /OWNER(?:'S|’S|S|`S)? DESK/g;

/** Same id shapes the sibling guards key on, including the alpha families. */
const FINDING = /F-(?:[A-Z0-9]{1,8}-)+\d+/;
const SLUG = /`([a-z0-9][a-z0-9-]{6,})`/;

/**
 * TWO STACKED PREFIX HAZARDS, BOTH PERMISSIVE — F-2230-1.
 *
 * This guard asks: "did a newly-added owner-gated BACKLOG row's id reach the
 * desk?" It answered with two prefix-tolerant tests in a row, and BOTH fail
 * toward saying yes:
 *
 *   (1) rowId() used FINDING, which is unanchored and rejects the trailing
 *       sub-id letter, so a row about F-CLAW-2X was keyed F-CLAW-2 — an id that
 *       is not in the row. That is F-2229-1's defect, in the sibling file, on
 *       the identical question about the identical subject.
 *   (2) analyse() then satisfied that key with `tail.includes(id)`, a RAW
 *       SUBSTRING test, so ANY desk id sharing the prefix answers for it.
 *
 * PROVEN BY MANUFACTURING, not by a green (5 arms, exported core, each arm
 * asserting it reached kind:'window' with its row recognised as owner-gated):
 *   - desk carries only the PARENT F-CLAW-2, new owner-gated row keys
 *     F-CLAW-2X  -> as shipped NOT FLAGGED; truth is that F-CLAW-2X never
 *     reached the desk.
 *   - desk carries only the longer F-2131-1b, new row keys F-2131-1
 *     -> as shipped NOT FLAGGED, the substring matching inside the longer id.
 * Both are false greens in a chained test:ledger-guards leg (npm run
 * test:desk-birth), in the permissive direction: a finding that needs the
 * owner's word never reaches him, and the guard built to catch that certifies
 * it did. A third arm passed for the WRONG REASON — a genuinely-carried
 * F-CLAW-2X was keyed F-CLAW-2 and rescued by the substring — which is why the
 * arms assert the KEY as well as the verdict.
 *
 * WHY IMPORT RATHER THAN WIDEN THE LITERAL HERE: F-2227-1 measured that four
 * independent copies of this predicate is HOW it drifted, and F-2229-1 already
 * ruled the row-key grammar — including WHY the ledger's anchored form is wrong
 * for it (that one rejects the sub-id letter, so all four live sub-ids would key
 * nothing: a permissive miss traded for a blind one). Same question, same
 * subject, so one implementation.
 *
 * WHY THE DESK SIDE IS A CONTAINMENT FIX AND NOT A WIDER SCAN: s2229 measured
 * that widening the desk-TAIL predicate invents three items with no row across
 * 1457 desks, two of them prose inflections, i.e. it reds the battery on
 * ordinary handoff prose (the F-1460-1 fate). carriesId() never ENUMERATES desk
 * ids, so it cannot mint an item — it can only make a match the guard already
 * found stricter. That asymmetry is the whole reason this side is safe to
 * change where the scan is not.
 */
import { FINDING_ROW_ONE } from './desk-declaration-guard.mjs';

/**
 * Does `text` carry `id` as a WHOLE TOKEN? `.includes` is prefix-tolerant, which
 * is the permissive half of F-2230-1 — F-2131-1 "appears in" F-2131-1b.
 *
 * THE TWO ENDS ARE DELIBERATELY ASYMMETRIC, and the asymmetry was MEASURED, not
 * reasoned: a first draft excluded `-` on BOTH sides and reddened its own
 * ordinary-markup control, because a hyphen-adjacent mention of a genuinely
 * carried id then reads as ABSENT — a FALSE RED on ordinary desk prose, which is
 * how a guard gets excused into uselessness (F-1460-1).
 *   - LEADING: exclude alphanumerics only. An id always starts with "F-", so the
 *     only real hazard is being the tail of a longer word (NF-1234-5); a
 *     preceding hyphen or dash is ordinary punctuation.
 *   - TRAILING: exclude the hyphen TOO, and that half IS load-bearing — ids are
 *     multi-segment, so F-MILK-3 is a strict prefix of the equally valid
 *     F-MILK-3-SS-4. Dropping it re-opens the shadow hazard on the alpha families.
 */
export function carriesId(text, id) {
  const lit = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?<![A-Za-z0-9])${lit}(?![A-Za-z0-9-])`).test(text);
}

/**
 * An OWNER GATE — a gate that turns on an owner ACT, not one that merely says the
 * word. Measured s1542: the loose form ("owner" appears anywhere in the gate)
 * admits rows gated on a DRAIN whose prose happens to mention him, at a 2-in-20
 * false-positive rate; this form scores 0 in 15 over the same corpus.
 */
export const OWNER_GATE =
  /owner(?:'s|’s)?\s+(?:word|answers?|rules?|ruling|picks?|verdict|decision|names?|triage)/i;
const OWNER_GATE_ALT = [
  /\bGATE:\s*\**\s*OWNER\b/i,
  /(?:closes|retires|rules?)\s+(?:on|when)\s+(?:an?\s+)?(?:attended\s+or\s+)?owner/i,
];

/**
 * Negation tokens that turn an owner-verb mention into a DISCLAIMER (F-1551-4).
 * OWNER_GATE has no negation handling, so "no spec, design fork or owner ruling
 * needed" — a row declaring that NO owner act is required — read as asserting one.
 * The tightened s1542 form scored "0 in 15" over its corpus, but that corpus
 * contained no NEGATED gate: every arm tested was a gate that did or did not turn
 * on an owner act, never one that says an owner act is not required.
 */
const NEGATION = /\b(?:none|no|not|never|nor|without)\b/i;

/**
 * True when an owner verb appears in the gate WITHOUT a negation between it and
 * the start of its sentence. Every match is checked, not just the first, so a
 * multi-clause gate ("no owner ruling for the measurement. Owner verdict on the
 * plist edit") keeps its positive clause.
 *
 * Measured on the live BACKLOG corpus s1552 before landing: 61 gates flagged by
 * the old form -> 49 by this one; all 12 cleared were read by hand and every one
 * is a genuine disclaimer; 0 rows are NEWLY flagged.
 */
function hasPositiveOwnerVerb(gateText) {
  for (const m of gateText.matchAll(new RegExp(OWNER_GATE.source, 'gi'))) {
    const before = gateText.slice(0, m.index);
    let sentenceStart = 0;
    for (const ch of ['.', ';', '!', '?']) {
      sentenceStart = Math.max(sentenceStart, before.lastIndexOf(ch) + 1);
    }
    if (!NEGATION.test(before.slice(sentenceStart))) return true;
  }
  return false;
}

export function isOwnerGate(gateText) {
  return hasPositiveOwnerVerb(gateText) || OWNER_GATE_ALT.some((re) => re.test(gateText));
}

/** Line-1 is a live lock, not a handoff, when it says ACTIVE and not lock CLEARED. */
export function isLockLine(line1) {
  return /\bACTIVE\b/.test(line1) && !/lock CLEARED/.test(line1);
}

/** The desk tail of a line: everything after its LAST desk word (prose mentions lose). */
export function deskTail(line) {
  const hits = [...line.matchAll(DESK_WORD)];
  return hits.length ? line.slice(hits[hits.length - 1].index) : null;
}

/** A row's GATE clause — the LAST one, since row prose quotes earlier gates. */
export function gateOf(rowText) {
  const i = rowText.toUpperCase().lastIndexOf('GATE:');
  return i === -1 ? '' : rowText.slice(i);
}

/** A row's own key: the first id shape it introduces, as a WHOLE token (F-2230-1). */
export function rowId(rowText) {
  const f = rowText.match(FINDING_ROW_ONE);
  const s = rowText.match(SLUG);
  if (f && (!s || f.index <= s.index)) return f[0];
  return s ? s[1] : null;
}

/** An explicit "this one is not owed" acknowledgement, scoped like DESK-DROPPED. */
export function notOwed(line1, id) {
  return [...line1.matchAll(/DESK-NOT-OWED/g)].some((m) =>
    carriesId(line1.slice(m.index, m.index + 400), id),
  );
}

/** Rows added to a diff hunk — the ledger's row glyphs, or any row keyed by an F-ID. */
export function addedRows(diffText) {
  return diffText
    .split('\n')
    .filter((l) => l.startsWith('+') && !l.startsWith('+++'))
    .map((l) => l.slice(1))
    .filter((l) => /^\s*(\u{1F53A}|✅|⛔|\u{1F7E1})/u.test(l) || /\*\*F-/.test(l));
}

/**
 * The pure core, so the arms can drive it without a git tree.
 * Returns {kind:'lock'} | {kind:'no-desk'} | {kind:'window', qualifying, missing}
 */
export function analyse(line1, addedRowTexts) {
  if (isLockLine(line1)) return { kind: 'lock' };
  const tail = deskTail(line1);
  if (tail === null) return { kind: 'no-desk' };
  const qualifying = [];
  for (const text of addedRowTexts) {
    if (!isOwnerGate(gateOf(text))) continue;
    const id = rowId(text);
    if (!id) continue;
    qualifying.push({ id, text });
  }
  const missing = qualifying.filter((r) => !carriesId(tail, r.id) && !notOwed(line1, r.id));
  return { kind: 'window', qualifying, missing };
}

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

/**
 * The window is [previous handoff commit .. HEAD]. This guard is a fire's LAST
 * act, so HEAD already carries this fire's handoff; the PREVIOUS handoff is the
 * second entry, not the first.
 */
export function previousHandoffCommit() {
  const log = git(['log', '--format=%H\t%s', '--', 'STATUS.md']).trim().split('\n');
  const handoffs = log
    .map((l) => { const [sha, ...s] = l.split('\t'); return { sha, subj: s.join('\t') }; })
    .filter((c) => /^s\d+ handoff/.test(c.subj));
  return handoffs.length >= 2 ? handoffs[1].sha : null;
}

function main() {
  const statusPath = path.join(ROOT, 'STATUS.md');
  if (!fs.existsSync(statusPath)) {
    console.error(`desk-birth-guard: REFUSING — cannot read ${statusPath}`);
    process.exit(2);
  }
  const line1 = fs.readFileSync(statusPath, 'utf8').split('\n')[0] || '';

  console.log('=== desk-birth-guard ===');

  if (isLockLine(line1)) {
    console.log('SKIP — STATUS.md line-1 is a live ACTIVE lock, not a handoff.');
    console.log('  The desk is written at handoff time; test:ledger-guards gates it then.');
    return;
  }

  const prev = previousHandoffCommit();
  if (!prev) {
    console.error('desk-birth-guard: REFUSING — no PREVIOUS handoff commit could be found.');
    console.error('  The window is [previous handoff .. HEAD]; without its start there is');
    console.error('  no set of newly-filed rows to check, and a pass would mean "I read');
    console.error('  nothing" — the fail-open mode that hid F-1471-3 for 137 fires.');
    process.exit(2);
  }

  let diff = '';
  try {
    diff = git(['diff', `${prev}..HEAD`, '--', 'tasks/BACKLOG.md']);
  } catch (err) {
    console.error(`desk-birth-guard: REFUSING — could not diff the window: ${err.message}`);
    process.exit(2);
  }

  const result = analyse(line1, addedRows(diff));

  if (result.kind === 'no-desk') {
    console.error('desk-birth-guard: REFUSING — line-1 is a handoff with no desk header.');
    console.error('  desk-declaration-guard reports this too, and with more detail; fix it there.');
    process.exit(2);
  }

  console.log(`window start              : ${prev.slice(0, 8)} (previous handoff)`);
  console.log(`owner-gated rows filed    : ${result.qualifying.length}`);
  console.log(`of those, undesked        : ${result.missing.length}`);

  if (REPORT) {
    for (const r of result.qualifying) {
      const mark = result.missing.some((m) => m.id === r.id) ? 'UNDESKED' : '  desked';
      console.log(`  ${mark}  ${r.id}`);
    }
    return;
  }

  if (!result.missing.length) {
    console.log('PASS — every owner-gated row filed this window reached the desk.');
    return;
  }

  console.error('');
  console.error(`FAIL — ${result.missing.length} owner-gated row(s) were filed this window and`);
  console.error('reached no desk. An owner fork on no desk is on no board Robin reads:');
  for (const r of result.missing) {
    console.error(`  ${r.id}`);
    console.error(`      ${gateOf(r.text).replace(/\s+/g, ' ').slice(0, 160)}`);
  }
  console.error('');
  console.error('Put each on the desk at the END of line-1, or say why it is not owed:');
  console.error('');
  console.error('    DESK-NOT-OWED: <id> — <already desked as X | superseded by Y | ruled <when>>');
  console.error('');
  console.error('Attended sessions file rows and never compose a desk (F-1541-2), so the');
  console.error('rows this catches are usually not yours — carry them anyway.');
  process.exit(1);
}

// The house entrypoint form, copied from desk-declaration-guard.mjs rather than
// re-invented — NOT `file://${process.argv[1]}`. This repo's path contains a
// space, which import.meta.url percent-encodes and process.argv[1] does not (the
// s1334 trap: main() silently never ran and the guard "passed" everything). The
// argv[1] presence check is the sibling half (s1533): with no argv[1] —
// `node -e "import(...)"`, some harnesses — pathToFileURL THROWS.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();

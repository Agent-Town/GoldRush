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
// F-2241-1 — see the twin note in desk-declaration-guard.mjs. Reached through
// `npm run test:desk-birth`, so F-2232-1's "five BARE legs" census could not see it.
import { corpusTree, frozenTreeCheck } from './corpus-tree.mjs';

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

/**
 * WHERE the admission was decided — the character offset, inside gateOf()'s text,
 * of the match that made isOwnerGate() true. -1 when it is false.
 *
 * WHY THIS EXISTS (F-2255-1, banked uncured by s2247 and measured here).
 * gateOf() is DOCUMENTED as "a row's GATE clause" and RETURNS the whole row tail
 * — from the last `GATE:` to end-of-line — and a BACKLOG row is one line of up to
 * ~8k characters. So isOwnerGate() reads thousands of characters of unrelated
 * trailing prose looking for a gate, and BACKLOG prose is exactly where past
 * owner rulings get CITED. That is s2247's own lesson one file over: a basis, a
 * record, a refutation and an intent are four different things wearing one shape.
 *
 * MEASURED s2255 over the live ledger, 2,022 addedRows()-shaped rows / 702 with a
 * GATE: / 69 admitted. The deciding match sits at distance p50 0 · p75 15 · p90 76
 * · p95 162, then jumps to a thin tail of 407 / 2,971 / 3,284. Hand-reading those
 * three agrees with the distribution independently: ALL THREE ARE FALSE POSITIVES
 * (F-2247-1, F-1660-1, F-1596-1) — each has a gate clause that literally opens
 * `GATE: none`, and each is admitted by a RECORDED or QUOTED past ruling far away
 * in trailing prose ("OWNER RULING PROPAGATED s1655", "the owner ruling naming all
 * three BY NAME", "the owner ruling quoted verbatim in a comment").
 *
 * WHY THIS ONLY DECLARES AND DOES NOT NARROW — the restraint is the design
 * (F-2218-1, F-2225-1). Bounding gateOf() to a distance would change VERDICTS in
 * the PERMISSIVE direction: a genuine owner gate with a long preamble would stop
 * qualifying, the item would reach no desk, and this guard exists precisely
 * because "an owner fork on no desk is on no board Robin reads". A false RED gets
 * waived with DESK-NOT-OWED in one line; a false GREEN is silent forever. And the
 * cheap cure — a threshold — would be a GUESSED boundary of the kind F-2206-1
 * forbids, on a population of 69. So the distance is REPORTED, always, and the
 * fire decides. Do NOT "improve" this into a cutoff without re-measuring.
 *
 * NOTE the two admissions are deliberately NOT collapsed: OWNER_GATE_ALT's
 * `GATE: OWNER` form legitimately decides at distance 0, and two live rows
 * (F-1608-2, F-1120-2) are admitted there while also carrying a far incidental
 * match. Reporting the NEAREST admission is what keeps those two honest.
 */
export function ownerGateDecidedAt(gateText) {
  let best = -1;
  for (const m of gateText.matchAll(new RegExp(OWNER_GATE.source, 'gi'))) {
    const before = gateText.slice(0, m.index);
    let sentenceStart = 0;
    for (const ch of ['.', ';', '!', '?']) {
      sentenceStart = Math.max(sentenceStart, before.lastIndexOf(ch) + 1);
    }
    if (!NEGATION.test(before.slice(sentenceStart))) {
      best = m.index;
      break;
    }
  }
  for (const re of OWNER_GATE_ALT) {
    const i = gateText.search(re);
    if (i !== -1 && (best === -1 || i < best)) best = i;
  }
  return best;
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
 * The DENOMINATOR of addedRows() — the added lines it did NOT admit, restricted to
 * those that WOULD have qualified (owner gate + a key). F-2259-1, measured s2259.
 *
 * THE CLAIM IS WIDER THAN THE CORPUS. main() prints "owner-gated rows filed : N"
 * and, on the happy path, "every owner-gated row filed this window reached the
 * desk". Both range over whatever addedRows() managed to admit — and that parser
 * takes a line only if it (a) LEADS with one of four glyphs after whitespace, or
 * (b) contains the literal `**F-`. A row contributing to neither cannot enter
 * `qualifying`, so it is structurally incapable of failing this gate.
 *
 * The two tests each cover the other's blind spot, which is why this survived: a
 * row escapes ONLY when it uses BOTH house conventions at once — a markdown
 * bullet before the glyph AND the bracketed `**[F-id]` key. Measured s2259:
 *   "🔺 **F-9999-1** …"      -> admitted (glyph)     "- 🔺 **F-9999-1** …" -> admitted (**F-)
 *   "🔺 **[F-9999-1] …"      -> admitted (glyph)     "- 🔺 **[F-9999-1] …" -> ESCAPED
 * Neither convention is exotic: the live BACKLOG carries 353 bullet-then-glyph
 * rows, 47 bracketed keys, and 38 lines in the escaping shape today. Glyphs
 * outside the admitted four (🔵, 👑, 🟢) escape outright.
 *
 * The header's 2x2 pricing table above prices the SELECTOR (which gates count)
 * against MEMBERSHIP (what the desk carries) — and never the corpus both range
 * over. That is the whole gap.
 *
 * MEASURED over all 2,459 BACKLOG-touching commits: 10 owner-gated keyed rows
 * escaped, of which 5 are real owner items — F-1637-2 and F-1625-4 (BOTH ON
 * ROBIN'S DESK TODAY), F-1617-1, F-BT-2 (🔵) and F-1118-2 (👑).
 *
 * SEVERITY, STATED HONESTLY AND NOT INFLATED: LATENT. Replaying all 1,133 real
 * handoff windows, every one of those rows had already been desked by hand in the
 * same handoff, so the blindness has never actually cost a desk entry. What it
 * costs is the guarantee: the PASS cannot mean what it says.
 *
 * WHY THIS DECLARES AND DOES NOT WIDEN MEMBERSHIP, and the restraint is MEASURED
 * rather than stylistic. The obvious cure — teach the two tests the two house
 * conventions — was replayed over those same 1,133 windows: it admits 168 extra
 * rows across 85 windows and produces exactly THREE new verdicts, ALL THREE
 * FALSE (F-1631-3 "OFF THE OWNER'S DESK — CLOSED … OWES NO WORD", F-1635-3
 * "SUPERSEDED s1636", 325241e2 "DRAINED s1497"). It catches ZERO genuine
 * undesked rows. And this guard's REMEDY is "put it on the desk", so obeying a
 * false red MANUFACTURES owner-desk items out of closure records, onto a desk
 * already at 27 (s2255's rule: the harm is the remedy, not the red).
 *
 * Restricted to the QUALIFYING set, not the corpus (s2230): naming all 168
 * excluded rows would be inflation dressed as diligence.
 */
export function unexaminedRows(diffText) {
  const admitted = new Set(addedRows(diffText));
  return String(diffText)
    .split('\n')
    .filter((l) => l.startsWith('+') && !l.startsWith('+++'))
    .map((l) => l.slice(1))
    .filter((l) => !admitted.has(l) && rowId(l) && isOwnerGate(gateOf(l)))
    .map((l) => l.trim().replace(/\s+/g, ' ').slice(0, 160));
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
    const gate = gateOf(text);
    if (!isOwnerGate(gate)) continue;
    const id = rowId(text);
    if (!id) continue;
    // decidedAt is ADDITIVE and advisory (F-2255-1): no row's membership turns on
    // it. It travels with the row so the FAIL output can say WHERE the admission
    // came from without this function acquiring an opinion about it.
    qualifying.push({ id, text, decidedAt: ownerGateDecidedAt(gate) });
  }
  const missing = qualifying.filter((r) => !carriesId(tail, r.id) && !notOwed(line1, r.id));
  return { kind: 'window', qualifying, missing };
}

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

/**
 * The window is [previous FIRE's handoff commit .. HEAD]. This guard is a fire's
 * LAST act, so HEAD already carries this fire's handoff.
 *
 * F-2260-1 — "the SECOND matching entry" is not "the previous fire's handoff",
 * and the difference is a silently narrowed denominator. A fire that re-runs the
 * battery after a correction emits a second commit whose subject ALSO matches
 * (`sNNNN handoff addendum:` / `handoff amendment:` / `handoff correction:`), so
 * handoffs[1] becomes THIS fire's own earlier handoff and the window collapses to
 * the minutes between the two. The diff then holds almost nothing, `owner-gated
 * rows filed` reads 0, and the guard prints PASS — accurately, about a set it
 * built too small. That is the F-2259-1 shape one level up: there the parser that
 * admitted ROWS was incomplete, here it is the selector that picks the CORPUS
 * those rows are drawn from.
 *
 * MEASURED over all 2,226 matching commits: 83 of 2,136 sessions emit more than
 * one, and replayed at each such fire's FINAL matching commit the window start
 * lands on the SAME fire 83 times out of 83 — never once on the previous fire.
 * It is not a historical curiosity either: 8 of the last 30 fires did it.
 *
 * SEVERITY IS LATENT AND IS NOT INFLATED HERE. Replaying both windows across all
 * 83, the correct window sees more owner-gated rows in 3 and produces ZERO new
 * FAIL verdicts — every row a collapsed window missed had already been desked by
 * hand. So this has never cost a desk entry; what it cost is the guarantee that
 * the PASS means what it says.
 *
 * THE CURE IS AN IDENTITY TEST, NOT A WIDENING — which is the distinction
 * F-2259-1 was decided on. There, teaching the parser more row shapes admitted
 * 168 rows and produced three verdicts, all false, so the denominator was
 * DECLARED and membership left alone. Here the selector is simply naming the
 * wrong commit, and skipping same-session entries restores the window the
 * docstring already claimed without admitting anything new.
 *
 * The returned `session` is the always-on declaration (F-2208-1): the caller
 * prints whose handoff the window starts at, so a reader sees `s2259` against a
 * fire numbered s2260 and a collapse is legible on sight. A bare sha never was.
 */
export function previousHandoffCommit() {
  const log = git(['log', '--format=%H\t%s', '--', 'STATUS.md']).trim().split('\n');
  const handoffs = log
    .map((l) => { const [sha, ...s] = l.split('\t'); return { sha, subj: s.join('\t') }; })
    .filter((c) => /^s\d+ handoff/.test(c.subj));
  if (!handoffs.length) return null;
  const sessionOf = (subj) => (subj.match(/^s(\d+)/) || [])[1] ?? null;
  const mine = sessionOf(handoffs[0].subj);
  for (let i = 1; i < handoffs.length; i++) {
    const session = sessionOf(handoffs[i].subj);
    if (session !== mine) return { sha: handoffs[i].sha, session, skipped: i - 1 };
  }
  return null;
}

function main() {
  const statusPath = path.join(ROOT, 'STATUS.md');
  if (!fs.existsSync(statusPath)) {
    console.error(`desk-birth-guard: REFUSING — cannot read ${statusPath}`);
    process.exit(2);
  }
  // F-2271-1 (s2271): ONE read, both consumers — the structure F-2265-1 landed in
  // authorable-candidates.mjs and the one desk-carryforward-guard.mjs:341 has always
  // used (`statusText` read once, fed to analyse AND to frozenTreeCheck). This file
  // and desk-declaration-guard.mjs were the two members of that family still reading
  // STATUS.md TWICE per verdict: once here for the verdict, and again at the
  // frozenTreeCheck call below for the freshness cross-check.
  //
  // MEASURED s2271, both arms manufactured against corpus-tree.mjs directly:
  //   main worktree     -> statusText DISCARDED (frozenTreeCheck returns at the
  //                        `tree !== 'linked-worktree'` line before the argument is
  //                        used; REAL and GARBAGE text give identical answers)
  //   linked worktree   -> statusText CONSUMED (main's own line-1 -> PROCEED,
  //                        GARBAGE -> REFUSAL; the answers DIFFER)
  //
  // SEVERITY, HONESTLY AND DELIBERATELY NOT INFLATED: this is NOT a false green and
  // no verdict was ever wrong. In the prescribed invocation the second read's value
  // is discarded, and in a linked worktree a mid-run rewrite of a frozen tracked
  // checkout is part of no workflow (lane tasks are firewalled from STATUS.md). The
  // window is real in the CODE and unreachable in the WORKFLOW. What the double read
  // does cost unconditionally is a 12.7 MB file read thrown away on every run.
  //
  // The cure is STRUCTURAL rather than a declaration, for F-2265-1's stated reason:
  // the two consumers now describe one board BY CONSTRUCTION, so there is no
  // divergence left to declare, and a declaration nobody can falsify is the noise
  // that decays a declaration into a formality.
  const statusText = fs.readFileSync(statusPath, 'utf8');
  const line1 = statusText.split('\n')[0] || '';

  console.log('=== desk-birth-guard ===');
  console.log(`corpus tree               : ${corpusTree(ROOT)}`);

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
    diff = git(['diff', `${prev.sha}..HEAD`, '--', 'tasks/BACKLOG.md']);
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

  // F-2260-1: name WHOSE handoff the window starts at, always. A bare sha cannot
  // show a reader that the window collapsed onto this fire's own earlier commit.
  console.log(`window start              : ${prev.sha.slice(0, 8)} (s${prev.session} handoff)`);
  if (prev.skipped) {
    console.log(`   ⓘ skipped ${prev.skipped} same-session handoff commit(s) — this fire's own`);
    console.log('     addendum/amendment. Without this the window would collapse onto them');
    console.log('     and the count below would range over minutes, not the fire (F-2260-1).');
  }
  console.log(`owner-gated rows filed    : ${result.qualifying.length}`);
  // F-2259-1: the DENOMINATOR that count ranges over. Printed ALWAYS, including
  // the happy path — a declaration that appears only on failure re-creates the
  // ambiguity it removes (F-2208-1), and here the failure state is a PASS, so
  // there is no failure for it to appear on. `unexamined 0` is the line that
  // separates "no owner row escaped the parser" from "I never looked".
  const unexamined = unexaminedRows(diff);
  console.log(`unexamined by the parser  : ${unexamined.length}`);
  for (const row of unexamined) console.log(`   | ${row}`);
  if (unexamined.length) {
    console.log('   ⓘ ADVISORY, not a failure: each line above carries an owner gate and a key but');
    console.log('     leads with neither an admitted glyph nor `**F-`, so this guard never examined');
    console.log('     it. Widening membership was measured and manufactures false reds out of');
    console.log('     closure rows (F-2259-1) — read these by hand and desk any that are real.');
  }
  console.log(`of those, undesked        : ${result.missing.length}`);

  if (REPORT) {
    for (const r of result.qualifying) {
      const mark = result.missing.some((m) => m.id === r.id) ? 'UNDESKED' : '  desked';
      console.log(`  ${mark}  ${r.id}`);
    }
    return;
  }

  if (!result.missing.length) {
    // F-2241-1 — the PASS path only; see the twin note in desk-declaration-guard.mjs.
    // Manufactured: ground truth = an owner-gated row filed on main and never
    // desked; from a worktree branched before it, this printed PASS at rc=0 with
    // the same verdict line and rc as a genuinely clean board.
    // F-2271-1: the SAME text the verdict above was computed from. See the block at
    // the first read. Was a second `fs.readFileSync(statusPath, 'utf8')` here.
    const frozen = frozenTreeCheck(ROOT, statusText, 'desk-birth-guard');
    if (frozen) {
      console.error('');
      console.error(frozen);
      process.exit(2);
    }
    console.log('PASS — every owner-gated row filed this window reached the desk.');
    return;
  }

  console.error('');
  console.error(`FAIL — ${result.missing.length} owner-gated row(s) were filed this window and`);
  console.error('reached no desk. An owner fork on no desk is on no board Robin reads:');
  for (const r of result.missing) {
    console.error(`  ${r.id}`);
    console.error(`      ${gateOf(r.text).replace(/\s+/g, ' ').slice(0, 160)}`);
    // F-2255-1 — WHERE the admission was decided. gateOf() returns the whole row
    // tail, so a large offset means the deciding words are trailing prose (usually
    // a past ruling being CITED), not this row's gate. Measured p95 = 162.
    console.error(`      admitted by text at offset ${r.decidedAt} past "GATE:"` +
      (r.decidedAt > 162 ? ' — BEYOND the p95 of 162; read it before desking, this is the false-positive shape' : ''));
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

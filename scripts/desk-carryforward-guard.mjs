#!/usr/bin/env node
/**
 * desk-carryforward-guard.mjs — did this handoff SILENTLY drop an item that the
 * previous handoff had on the OWNER'S DESK?
 *
 * WHY THIS EXISTS (F-1533-1, s1533; the class was opened by F-1532-1, s1532)
 * ------------------------------------------------------------------------
 * s1532 found F-1167-1 sitting `OWNER'S DESK` in tasks/BACKLOG.md for ~10 days
 * without appearing on a single handoff desk, and asked for a guard that
 * cross-checks the ledger against the desk. s1533 measured that proposal before
 * building it and REFUTED it: F-1167-1 was declared AND desked by its own fire,
 * riding 40 consecutive desks (F-1120-2 rode 168, F-1328-3 rode 83) before
 * vanishing. Nobody fails to declare. Items are declared correctly, desked
 * correctly, carried for dozens of fires — and then dropped.
 *
 * So the defect is CARRY-FORWARD, and it is not diffuse attrition. One event
 * dominates the whole post-cure era: s1526 handed over a 17-item desk and s1527
 * wrote a 7-item one. Ten items went out in a single handoff with no closure
 * anywhere and no sentence saying why, among them "13 of 25 campaign maps cannot
 * be opened" (F-MSD-1), the 527.89 MB retention hole (F-1501-3), and F-1522-5,
 * which that very desk called "still the cheapest win on this list".
 *
 * A desk is not a summary a fire recomposes from what is fresh in its context.
 * It is a QUEUE with the owner at the far end, and the only lawful ways off it
 * are a ruling or a closure — never a rewrite.
 *
 * WHAT THIS GUARD DELIBERATELY DOES NOT DO — AND THE MEASUREMENT THAT DECIDED IT
 * -----------------------------------------------------------------------------
 * The obvious design is "every id on desk N is on desk N+1 unless the ledger
 * says closed". DO NOT BUILD THAT AS A BARE ID COMPARISON. Measured s1533 on the
 * one event with ground truth, it reports 13 drops where 10 occurred, because
 * THE SAME DESK ITEM IS CARRIED UNDER DIFFERENT KEYS BY DIFFERENT FIRES:
 *
 *     s1526 "🔺 **F-1096-2** rf-34 hero-Y: (A) merge as-is [rec]..."
 *     s1527 "🔺 **`rf-34-hero-y-restore-roundtrip` OPEN** (the reserved fork...)"
 *
 *     s1526 "🔺 **F-1475-1** e3-fairground diagnostics-only construction path"
 *     s1527 "🔺 **`e3-fairground-socket` OPEN**"
 *
 *     s1526 "🔺 **F-1294-1** calibrate-suite-workers-v2 — worth a v3?"
 *     s1527 "🔺 **F-1101-1 / `calibrate-suite-workers-v2` OPEN"
 *
 * Three of thirteen — a 23% false-positive rate on the single event this guard
 * is built to catch. A gate that cries wolf on a quarter of its hits gets
 * routed around, and then it protects nothing.
 *
 * The cure is NOT a parser that resolves aliases (it cannot: F-1294-1 and
 * F-1101-1 share no substring, and only prose says they are one thread). The
 * cure is to stop asking the PARSER to decide identity and ask the FIRE. A
 * dropped item is fine — silence about it is not. So a drop passes when the fire
 * writes one clause naming it:
 *
 *     DESK-DROPPED: F-1096-2 re-keyed to `rf-34-hero-y-restore-roundtrip`
 *
 * That is a sentence a re-keying fire can write in five seconds and a fire
 * rewriting the desk from context cannot write by accident. It converts the
 * failure mode from SILENCE (unfalsifiable) into a CLAIM (checkable by the next
 * reader). Same reasoning as F-1383-1's blockClass: the field changes no exit
 * code, it changes who is told what happened.
 *
 * A drop ALSO passes when tasks/BACKLOG.md records the id closed. That path uses
 * findings-state-guard's EXPORTED scan() rather than a second implementation of
 * "closed" — F-1261-1 measured a re-implementation disagreeing with the original
 * on 4 of 14 rows, and there is one implementation of that word in this repo.
 * Attribution is subject-first through desk-state-audit: the raw wide census
 * misattributed 21 of 343 closures to ids merely cited by another row.
 *
 * ⓘ The `wide` vocabulary is used deliberately: the commonest closure shape in
 * this ledger is the bullet-led "- ✅ **F-x", which `narrow` cannot see (56 ids
 * closed only by a row the narrow census misses, measured s1291). A guard that
 * reds because it cannot READ a closure would train fires to route around it.
 *
 * REFUSES RATHER THAN GREENING OVER AN UNREAD SUBJECT (F-1251-2's class)
 * ---------------------------------------------------------------------
 * The nasty vacuous mode here is a parse that finds an EMPTY previous desk:
 * every comparison then trivially passes and the guard reports a clean board
 * having read nothing. That is exactly how desk-declaration-guard failed open
 * for 137 fires. So: no previous handoff desk, or a previous desk with zero
 * items, exits 2 and says the parser is broken.
 *
 * MID-FIRE IT SKIPS, exactly like desk-declaration-guard: line-1 is an ACTIVE
 * lock for a fire's whole run and the desk is written at handoff time, so
 * test:node-guards (which runs inside drain batteries) must not gate on it. The
 * real gate is test:ledger-guards, every fire's LAST act, after the handoff
 * commit has replaced line-1 (F-1300-4's order).
 *
 * usage:
 *   node scripts/desk-carryforward-guard.mjs            # gate
 *   node scripts/desk-carryforward-guard.mjs --report   # never gates; prints both desks
 *   node scripts/desk-carryforward-guard.mjs --root <dir>
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { isMain } from './is-main.mjs';
import { subjectLedClosure } from './desk-state-audit.mjs';
// F-2231-1: the whole-token containment test F-2230-1 ruled on, imported rather
// than re-implemented. No new cycle — desk-birth-guard reaches only
// desk-declaration-guard, and the carryforward<->state-audit cycle predates this.
import { carriesId } from './desk-birth-guard.mjs';
// The ledger-shape-1 corpus: `tasks/BACKLOG.md` plus `tasks/backlog/**`, and `STATUS.md` plus
// `archive/status/**`. One implementation of "where the ledger lives", for the F-1261-1 reason.
import { backlogFiles, statusArchiveFiles, corpusDeclaration } from './ledger-corpus.mjs';

function arg(flag) {
  const i = process.argv.indexOf(flag);
  return i === -1 ? null : process.argv[i + 1];
}
const ROOT = path.resolve(arg('--root') || process.cwd());
const REPORT = process.argv.includes('--report');

/**
 * WHICH TREE ARE THESE DESKS FROM? — F-2232-1.
 *
 * Both corpora this guard reads (STATUS.md and tasks/BACKLOG.md) are TRACKED,
 * so a linked worktree hands it a board FROZEN at that lane's commit. The two
 * desks then compare self-consistently against each other (F-2230-2) and the
 * guard prints PASS about a handoff that is not the one on main.
 *
 * PROVEN BY MANUFACTURING, not by a green (s2232): ground truth = main carries a
 * handoff that silently drops F-BBB-1. From the repo root the guard FAILS rc=1
 * and names it; from a worktree branched one commit earlier it prints
 * "PASS — every item on the previous desk is carried, closed, or accounted for."
 * at rc=0 — BYTE-IDENTICAL on stdout AND rc to a genuinely clean board.
 *
 * This is the last of the FIVE tools invoked BARE in test:ledger-guards to get
 * the discriminator: ghost-ladder-row-guard (F-2226-1), attended-owed-audit
 * (F-2225-1) and nul-audit (F-2220-1) have it, and status-archive-audit is
 * tree-invariant by construction (it roots every git call at an absolute REPO).
 *
 * `cwd: ROOT`, NOT process.cwd(): this tool takes an explicit --root, so the
 * question is about the tree the CALLER NAMED. (drain-block-check has no --root
 * and correctly uses process.cwd() instead — copying either sibling verbatim
 * would answer the wrong question. F-2223-1 / F-2224-1.)
 *
 * Exit 128 is git saying "not a repository", which is LAWFUL here and must NOT
 * refuse: every legacy fixture in this family builds a non-git temp root.
 */
// MOVED to ./corpus-tree.mjs s2241 (F-2241-1) and RE-EXPORTED here unchanged, so
// every existing importer and this family's own suite are untouched. Two more
// legs of the SAME battery — desk-declaration-guard and desk-birth-guard — needed
// this identical predicate, and they sit UPSTREAM of this file in the import
// chain, so a leaf module is the only cycle-free home. The macOS realpath note
// and arm 8's provenance travel with the body; see that file.
export { corpusTree } from './corpus-tree.mjs';
import { corpusTree } from './corpus-tree.mjs';

/**
 * Is this frozen tree's line-1 the same one main carries? Only asked when the
 * tree is a linked worktree AND the verdict is about to be a PASS — a SKIP
 * asserts nothing, and a FAIL is already loud, so neither can hide a drop.
 *
 * Deliberately NOT a blanket linked-worktree refusal: §3.0b MANDATES gating in
 * a detached worktree and this guard is chained in that battery, so a fire
 * FOLLOWING THE LAW runs it from a worktree as ordinary prescribed work. That
 * refusal would red the mandated drain gate and be excused into uselessness
 * inside a week (F-1460-1). A merged gate tree carries main's STATUS.md
 * unchanged — lane tasks are firewalled from it — so this cannot fire there.
 */
// MOVED to ./corpus-tree.mjs s2241 (F-2241-1) alongside corpusTree, for the same
// reason: two upstream legs of this battery ask the identical question.
import { frozenTreeCheck } from './corpus-tree.mjs';

/**
 * The desk-word pattern is IMPORTED from desk-declaration-guard.mjs, not copied
 * — F-2322-1, s2322. See the declaration's own site for the five spellings and
 * the measured reason it is single-sourced.
 *
 * What this file used to say, kept because it states the STAKES better than the
 * declaration site does: this guard's failure mode on a missed header is the
 * loudest one in the factory. deskTail() returns null, deskItems(null) returns
 * [], so `live` is empty and EVERY inherited item reads as silently dropped —
 * measured on the real s1529 handoff (62586985): "this desk: 0 items ·
 * dropped: 7", rc=1, against a fire that had in fact carried all 8 forward
 * correctly.
 *
 * The instruction it used to carry — "Keep these two literals identical" —
 * undercounted its own siblings: there were THREE copies, not two. A hand-
 * maintained agreement contract that cannot even count its parties is the
 * argument for single-sourcing, not against it.
 */
import { DESK_WORD } from './desk-declaration-guard.mjs';
/**
 * Finding ids, including the MULTI-SEGMENT alpha shapes the milk pile uses.
 * Caught by this guard's own ground-truth fixture (s1533): the first draft was
 * /F-[A-Z0-9]{2,4}-\d+/, which reads F-MTS-2 and F-ER02-5 but NOT F-MILK-SS-3 —
 * so s1526's 17-item desk parsed as 16 and one real dropped item was invisible
 * to the very guard built to find dropped items.
 */
const FINDING = /F-(?:[A-Z0-9]{1,8}-)+\d+/;
/** A backticked slug item, e.g. `rf-34-hero-y-restore-roundtrip`. */
const SLUG = /`([a-z0-9][a-z0-9-]{6,})`/;
/**
 * How far into a 🔺 segment the item's own key may sit. The convention is
 * "🔺 **<key> …", so the key is always at the very front; anything further in is
 * that item's PROSE, which routinely cites other findings.
 */
const KEY_ZONE = 120;

export function isLockLine(line1) {
  return /\bACTIVE\b/.test(line1) && !/lock CLEARED/.test(line1);
}

/**
 * The desk tail of a line — RE-EXPORTED, never re-implemented (F-2435-1, s2435).
 *
 * This was a byte-identical third copy of the LAST-match rule, and the module
 * comment at the DESK_WORD declaration already named the principle it broke:
 * "all three consumers ask the IDENTICAL question of the IDENTICAL subject —
 * where on this line does the desk tail begin? — One question, one declaration."
 * The TOKEN was single-sourced at s2229; the RULE was not, so F-2434-1's defect
 * lived in three places and a cure in one of them would have left this guard —
 * the very guard whose red text is the fragment that CAUSES the defect — still
 * parsing from inside the desk body.
 */
export { deskTail, deskTailStart } from './desk-declaration-guard.mjs';
import { deskTail } from './desk-declaration-guard.mjs';

/**
 * The items on a desk tail. The desk's own convention introduces each item with
 * 🔺, so anchor on that and take the first F-ID in the segment, else its first
 * backticked slug.
 *
 * VALIDATED AGAINST THE FIRES' OWN COUNTS rather than trusted (s1533): this
 * parser returns 7 for s1527 / 8 for s1529-s1531 / 9 for s1532, matching the
 * "— <n> awaiting a word" each of those fires wrote in its own header. A parser
 * whose denominator nobody checks is how the 145-id misread survived.
 */
export function deskItems(tail) {
  if (!tail) return [];
  const out = [];
  for (const seg of tail.split('🔺').slice(1)) {
    // The key is whichever id shape comes FIRST, inside the segment's opening
    // only. Two bugs this replaces, both found by the ground-truth fixture:
    //   (1) preferring F-IDs BY TYPE mis-keys a slug item whose prose cites a
    //       finding — "🔺 **`f1328-1-…` OPEN** … F-1096-2 …" keyed as F-1096-2,
    //       inventing a drop of f1328-1 and a phantom carry of F-1096-2;
    //   (2) unbounded scanning let a trailing DESK-DROPPED clause supply the
    //       key for the LAST item, so acknowledging a drop silently dropped
    //       something else. A guard whose own escape hatch corrupts its input
    //       is worse than no guard.
    const head = seg.slice(0, KEY_ZONE);
    const f = head.match(FINDING);
    const s = head.match(SLUG);
    if (f && (!s || f.index <= s.index)) out.push(f[0]);
    else if (s) out.push(s[1]);
  }
  return [...new Set(out)];
}

/**
 * The newest ARCHIVED handoff desk — the one this fire must carry forward.
 *
 * `archiveTexts` is the FALL-THROUGH added with the ledger-shape-1 rotation (owner ruling
 * 2026-09-24, item 13a): closed months now live in `archive/status/<YYYY-MM>.md`, and a handoff
 * bullet that has been rotated out is still the predecessor whose desk must be carried. Without
 * it, the FIRST fire of a new month could find no bullet in STATUS.md and hit the
 * `no-previous` cliff below — `process.exit(2)`, "REFUSING — no previous handoff desk could be
 * read" — on a board that is perfectly healthy. `status-rotate-month.mjs` holds back a trailing
 * window of 40 bullets precisely so that state is unreachable; this is the belt to that brace,
 * and it removes the cliff rather than relying on a window never being misconfigured.
 *
 * STATUS.md is searched FIRST and the archives only add candidates — the winner is still the
 * highest session number anywhere, which is the same answer the single-file version gave on
 * every board it ever read. The extra argument is optional, so every existing caller and every
 * hermetic test that passes one string keeps its exact behaviour.
 */
export function previousDesk(statusText, archiveTexts = []) {
  let newest = null;
  for (const text of [statusText, ...archiveTexts]) {
    for (const line of text.split('\n')) {
      const m = line.match(/^- \*\*s(\d+) handoff \(line-1 archive\)/);
      if (!m) continue;
      const tail = deskTail(line);
      if (!tail) continue;
      const candidate = { session: Number(m[1]), items: deskItems(tail), line };
      if (!newest || candidate.session > newest.session) newest = candidate;
    }
  }
  return newest;
}

/**
 * An explicit acknowledgement of a drop, anywhere on line-1.
 *
 * THE CONTAINMENT TEST IS WHOLE-TOKEN — F-2231-1, the third file in this family
 * to carry the same permissive prefix hazard (F-2229-1 in the ledger row key,
 * F-2230-1 in the birth guard's two stacked tests). `.includes` is
 * prefix-tolerant, and here that fails toward EXCUSED: a clause naming a LONGER
 * id answers for a SHORTER one that was dropped in silence, which is precisely
 * the failure this guard exists to catch (F-1533-1: ten items left one desk with
 * no closure and no sentence saying why).
 *
 * PROVEN BY MANUFACTURING, not by a green — three false greens, each arm
 * asserting it reached kind:'desk' with the right id in `dropped`:
 *   - drop F-2131-1, acknowledge only `F-2131-1b` -> NOT FLAGGED. Both are real
 *     ids; F-2131-1b is one of the four live sub-ids F-2230-1 enumerated.
 *   - drop F-1260-3, window merely says "F-1260-3s numbering collision"
 *     -> NOT FLAGGED. A PROSE INFLECTION of the id excuses its own silent drop,
 *     and fires write those constantly.
 *
 * SEVERITY, HONESTLY: LATENT. Replaying all 1,150 keyable archived desks through
 * this exported core, substring and whole-token agree on 24 of 24 real
 * acknowledgements out of 4,448 dropped ids — ZERO disagreements — so every
 * verdict this guard has printed was TRUE. Reachability is narrow but REAL: of
 * the 205 distinct desk ids ever seen, 4 are shadowed by an id-shaped token that
 * really occurs on a desk line (F-2131-1 by F-2131-1a/b, plus F-1260-3 and
 * F-1210-5 by their own prose inflections).
 *
 * WHY IMPORT RATHER THAN WIDEN THE LITERAL: F-2227-1 measured that four
 * independent copies of an id predicate is HOW it drifted, and F-2230-1 already
 * ruled this exact containment question — including the measured asymmetry of
 * its two ends (leading excludes alphanumerics only, or a hyphen-adjacent
 * mention of a carried id reads ABSENT and reds ordinary prose; trailing
 * excludes the hyphen too, since F-MILK-3 is a strict prefix of F-MILK-3-SS-4).
 * Same question, same subject, so one implementation.
 *
 * WHY THE 400-CHAR WINDOW STAYS, AND IT IS A MEASURED REFUSAL RATHER THAN AN
 * OVERSIGHT — F-2231-2. The window admits a CROSS-REFERENCE: an id named inside
 * ANOTHER clause's reason prose excuses its own silent drop (manufactured arm C,
 * modelled verbatim on s2160's real line — "DESK-DROPPED: F-2131-1 — ruled 08-22
 * and executing — F-2131-1b + F-2090-1" — where dropping the separate F-2090-1
 * clause would have left that id excused by a passing mention). Whole-token does
 * NOT cure it, because the id is genuinely present as a whole token.
 *
 * THE OBVIOUS CURE — key on a subject zone just after the mark, the way
 * subjectLedClosure keys a BACKLOG row — IS REFUTED BY MEASUREMENT: 21 of the 24
 * real acknowledgements sit at offset 14 (the `DESK-DROPPED: ` template), but
 * THREE do not, at offsets 51, 67 and 166, and all three are legitimate —
 * s1590's compound "F-1589-5** (cured `39b28e245`) **and F-1589-4**" and s1593's
 * count-first "DESK-DROPPED: 2, both by discharge rather than by re-labelling**
 * — F-1590-1 … and F-1590-2". Narrowing would false-red 12.5% of real
 * acknowledgements, which is how a guard gets excused into uselessness
 * (F-1460-1). And the two shapes are textually IDENTICAL: a cross-reference and
 * a compound acknowledgement are the same bytes, so no parser can separate them
 * — the same conclusion this file's own header reached about aliases. Ask the
 * FIRE, not the parser: the residue is a READING duty, not a mechanism.
 */
export function acknowledged(line1, id) {
  const marks = [...line1.matchAll(/DESK-DROPPED/g)];
  return marks.some((m) => carriesId(line1.slice(m.index, m.index + 400), id));
}

export function analyse(statusText, backlogText, archiveTexts = []) {
  const line1 = statusText.split('\n')[0] || '';
  if (isLockLine(line1)) return { kind: 'lock' };

  const prev = previousDesk(statusText, archiveTexts);
  if (!prev || prev.items.length === 0) return { kind: 'no-previous', prev };

  const liveTail = deskTail(line1);
  const live = deskItems(liveTail);
  const liveDeclaredMatch = liveTail?.match(/DESK\s*[—–-]\s*(\d+)\s+awaiting/);
  const liveDeclared = liveDeclaredMatch ? Number(liveDeclaredMatch[1]) : null;
  const liveUnkeyed = liveTail
    ? liveTail.split('🔺').slice(1)
      .filter((segment) => deskItems(`🔺${segment}`).length === 0)
      .map((segment) => segment.trim().slice(0, KEY_ZONE))
    : [];
  const dropped = prev.items.filter((id) => !live.includes(id));
  const silent = dropped.filter(
    (id) => !acknowledged(line1, id) && !subjectLedClosure(backlogText, id).length,
  );
  // How many items the previous desk SAID it had, vs how many this parser could
  // key. Reported, never gated on — see the note at the print site.
  const declaredMatch = deskTail(prev.line || '')?.match(/DESK\s*[—–-]\s*(\d+)\s+awaiting/);
  const declared = declaredMatch ? Number(declaredMatch[1]) : null;
  const unkeyed = declared === null ? 0 : Math.max(0, declared - prev.items.length);
  return { kind: 'desk', prev, live, liveDeclared, liveUnkeyed, dropped, silent, declared, unkeyed };
}

function main() {
  const statusPath = path.join(ROOT, 'STATUS.md');
  const backlogPath = path.join(ROOT, 'tasks', 'BACKLOG.md');
  for (const p of [statusPath, backlogPath]) {
    if (!fs.existsSync(p)) {
      console.error(`desk-carryforward-guard: REFUSING — cannot read ${p}`);
      process.exit(2);
    }
  }
  const statusText = fs.readFileSync(statusPath, 'utf8');
  // Both corpora widened for the ledger-shape-1 split (owner ruling 2026-09-24, item 13a).
  // The CLOSURE cross-check below (`subjectLedClosure`) is the half that fails OPEN: a dropped
  // desk id whose closure row has moved into `tasks/backlog/**` would read as SILENT, and the
  // guard would red on a fire that did nothing wrong.
  const archiveFiles = statusArchiveFiles(ROOT);
  const backlogCorpus = backlogFiles(ROOT);
  const result = analyse(
    statusText,
    backlogCorpus.map((rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8')).join('\n'),
    archiveFiles.map((rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8')),
  );

  console.log('=== desk-carryforward-guard ===');
  // Printed ALWAYS, including the happy path: a declaration that appears only on
  // failure re-creates the ambiguity it removes (F-2208-1).
  const tree = corpusTree(ROOT);
  console.log('corpus tree               :', tree);
  console.log('status corpus             :', corpusDeclaration(['STATUS.md', ...archiveFiles]));
  console.log('ledger corpus             :', corpusDeclaration(backlogCorpus));

  if (result.kind === 'lock') {
    console.log('SKIP — STATUS.md line-1 is a live ACTIVE lock, not a handoff.');
    console.log('  The desk is written at handoff time; test:ledger-guards gates it then.');
    return;
  }

  if (result.kind === 'no-previous') {
    console.error('desk-carryforward-guard: REFUSING — no previous handoff desk could be read.');
    console.error('  Expected a "- **sNNNN handoff (line-1 archive):**" bullet carrying a desk.');
    console.error('  A pass here would mean "I compared against nothing", which is the');
    console.error('  fail-open mode that hid F-1471-3 for 137 fires.');
    process.exit(2);
  }

  console.log(`previous desk (s${result.prev.session}):`, result.prev.items.length, 'items');
  console.log('this desk                 :', result.live.length, 'items');
  if (result.unkeyed > 0) {
    // ADVISORY, NEVER A REFUSAL: archived desks are immutable history, so a red
    // here would freeze the board. s1533 measured 60 post-cure counted desks:
    // 11 agreed and 49 did not, nearly all by one; that correctly refuted a
    // ZERO-TOLERANCE gate. The s1586 full-corpus histogram over 112 desks is
    // -1:1, 0:48, +1:30, +4:1, +7:7, +8:2, +9:10, +16:4, +18:1, +19:7,
    // +22:1. Its empty 2-3 band separates the +/-1 noise from defects, so the
    // live gate below admits every desk s1533's measurement was protecting.
    console.log(
      `ⓘ the previous desk declares ${result.declared} item(s) but ${result.unkeyed} could not be keyed` +
        ' — key desk items by an F-ID or a `backticked-slug` so they can be carry-checked.',
    );
  }

  // BOTH REFUSALS REPORT IN ONE RUN (F-1588-2, cured s1603)
  // ------------------------------------------------------
  // The count refusal used to `process.exit(1)` right here, BEFORE the drop
  // report below. Nothing escaped the gate — both paths exit 1 — but a desk
  // that was doubly broken diagnosed in two rounds: the drop surfaced only on
  // the NEXT run, after the count was repaired. That is the exact cost this
  // guard exists to avoid (F-1586-1: "a guard that says '24 != 20' and stops
  // has made the fire do the diagnosis twice"). So both are collected and
  // printed, and the exit happens once, at the end.
  const countRefused =
    result.liveDeclared !== null && Math.abs(result.liveDeclared - result.live.length) > 1;

  console.log('dropped                   :', result.dropped.length,
    `(${result.dropped.length - result.silent.length} accounted for)`);
  if (REPORT) {
    console.log('  prev:', result.prev.items.join(' '));
    console.log('  live:', result.live.join(' '));
  }

  const refusals = [];

  if (countRefused) {
    console.error('');
    console.error(
      `desk-carryforward-guard: REFUSING — the live OWNER'S DESK declares ${result.liveDeclared} item(s),` +
        ` but ${result.live.length} can be keyed (tolerance: +/-1).`,
    );
    console.error('Unkeyed segment opening text:');
    for (const segment of result.liveUnkeyed) console.error(`  ${segment}`);
    console.error('Repair: key each item by an F-ID or a `backticked-slug` at the very front of its 🔺 segment.');
    refusals.push('live desk count');
  }

  if (result.silent.length) {
    console.error('');
    console.error(`FAIL — ${result.silent.length} item(s) left the OWNER'S DESK with no reason given:`);
    for (const id of result.silent) console.error(`  ${id}`);
    // WHY THE SEQUENCING WAS NOT SIMPLY WRONG, and what replaces it.
    // ------------------------------------------------------------
    // Exiting early did protect against something F-1588-2 did not name, and a
    // naive merge would have shipped it: an UNKEYED segment is a source of
    // PHANTOM drops. An item can sit on this very desk and still read as
    // dropped, because deskItems() only keys the first KEY_ZONE chars of a
    // segment — measured s1603 on a manufactured desk where "F-8001-1", carried
    // in prose past the zone, was reported dropped while plainly present. The
    // same unkeyed segments therefore break the count AND fake the drops, which
    // is why the two reports must arrive together rather than one silencing the
    // other. Keyed on liveUnkeyed, not on countRefused: the +/-1 tolerance lets
    // a single unkeyed segment through, and one is enough to invent one drop.
    if (result.liveUnkeyed.length) {
      console.error('');
      console.error(`⚠️  ${result.liveUnkeyed.length} segment(s) on the live desk could not be keyed, so this`);
      console.error('   list may name an item that IS carried, in prose the parser cannot read.');
      console.error('   Key those segments first, then re-run: real drops survive that repair.');
    }
    console.error('');
    console.error('The desk is a QUEUE with the owner at the far end. The only lawful exits are');
    console.error('a ruling or a closure. If one of these was RE-KEYED, closed, or genuinely');
    console.error('retired, say so on line-1 and this passes:');
    console.error('');
    console.error(`    DESK-DROPPED: ${result.silent[0]} — <re-keyed to X | closed by <hash> | ruled <when>>`);
    console.error('');
    console.error('Otherwise carry it forward. s1527 dropped ten this way, including');
    console.error('"13 of 25 campaign maps cannot be opened" and the item its own desk called');
    console.error('"the cheapest win on this list" (F-1533-1).');
    refusals.push('silently dropped items');
  }

  if (refusals.length) {
    if (refusals.length > 1) {
      console.error('');
      console.error(`desk-carryforward-guard: ${refusals.length} defects reported above (${refusals.join(' + ')}).`);
      console.error('Both are repaired in one pass — this guard no longer makes you find them one at a time.');
    }
    process.exit(1);
  }

  // F-2232-1: the PASS is the only verdict a frozen tree can make DANGEROUS.
  // 2 = "could not answer" against 1 = "answered, and the answer refuses" — the
  // convention drain-block-check, dry-board-probe, master-shipped-classifier and
  // review-evidence-audit already carry.
  // s2242 (F-2242-1): this site was ALREADY correct — it is the one the other two
  // were re-typed from, wrongly. It moves to the shared decision anyway, because
  // leaving one hand-written copy of the condition leaves the drift surface open,
  // and F-2227-1's prescription is to import the sibling rather than keep a copy.
  const frozen = frozenTreeCheck(ROOT, statusText, 'desk-carryforward-guard');
  if (frozen) {
    console.error('');
    console.error(frozen);
    process.exit(2);
  }

  console.log("PASS — every item on the previous desk is carried, closed, or accounted for.");
}

// NOT `file://${process.argv[1]}` — this repo's path contains a space, which
// import.meta.url percent-encodes and process.argv[1] does not (the s1334 trap:
// that comparison is false here, so the guard ran as a no-op and exited 0).
// isMain (./is-main.mjs) keeps the s1533 half, found while debugging this file: no
// argv[1] (`node -e "import(...)"`) is "not main", never a throw. It compares REAL
// paths too, so a symlinked spelling no longer turns the guard into a no-op (F-LS1-2).
if (isMain(import.meta.url)) main();

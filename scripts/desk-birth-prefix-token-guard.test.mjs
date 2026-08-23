// desk-birth-prefix-token-guard — an owner-gated row's id reaches the desk as a
// WHOLE TOKEN, on BOTH sides of the question.
//
// F-2230-1 (s2230), executing the aim s2229 handed forward and marked UNMEASURED:
// "desk-carryforward-guard:121 and desk-birth-guard:82 both key DESK HEADS rather
// than rows, so the harm direction is not the one I proved and must not be assumed."
// Measured: the carryforward half is SYMMETRIC and sound (both desks are parsed by
// the same predicate and compared with an exact array .includes, so a truncated key
// truncates identically on both sides — 0 collapses across 1402 historical desks).
// The BIRTH half is not, because it compares a parsed key against RAW TEXT.
//
// TWO STACKED PREFIX HAZARDS, BOTH PERMISSIVE:
//   (1) rowId() used the unanchored FINDING, so a row about F-CLAW-2X was keyed
//       F-CLAW-2 — an id that is not in the row (F-2229-1's defect, sibling file,
//       identical question about an identical subject).
//   (2) analyse() then satisfied that key with `tail.includes(id)`, a RAW SUBSTRING
//       test, so any desk id sharing the prefix answered for it.
//
// PROVEN BY MANUFACTURING, not by a green:
//   - desk carries only the PARENT F-CLAW-2; new owner-gated row keys F-CLAW-2X
//     -> as shipped NOT FLAGGED. The sub-finding never reached the owner.
//   - desk carries only the longer F-2131-1b; new row keys F-2131-1
//     -> as shipped NOT FLAGGED, the substring matching inside the longer id.
// Both are false greens in a chained test:ledger-guards leg (npm run test:desk-birth),
// in the permissive direction. A third case passed for the WRONG REASON — a genuinely
// carried F-CLAW-2X was keyed F-CLAW-2 and rescued by the substring — which is why
// these arms assert the KEY as well as the verdict.
//
// SEVERITY, STATED HONESTLY AND NOT INFLATED: LATENT. Restricted to the real
// qualifying set — the 68 owner-gated rows of 1988 in BACKLOG.md — substring and
// whole-token containment disagree on ZERO of 1402 desk tails, so every verdict this
// guard has ever printed was TRUE. (Over ALL rows the disagreement is 351 pairs, but
// that is an upper bound on a set this guard never asks about, and reporting it as
// the severity would be inflation.) Both ingredients have occurred separately — five
// sub-ids have sat on desks, two desks carried an id shadowed by a longer one — but
// never yet together with a row birth. The defect is that the guard could not tell
// you when that stopped being true.
//
// Run: node --test scripts/desk-birth-prefix-token-guard.test.mjs

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const BIRTH = path.join(SCRIPTS, 'desk-birth-guard.mjs');
const DECL = path.join(SCRIPTS, 'desk-declaration-guard.mjs');

const HANDOFF = (desk) =>
  `Last updated: 2026-08-23T11:30Z s9999 handoff, lock CLEARED — nothing landed. ` +
  `🔺 **OWNER'S DESK — 1 awaiting a word.** ${desk}`;
const ROW = (id) => `🔺 **${id}** (an owner design fork worth a word) GATE: owner's word`;

const roots = [];
/**
 * Load the guard, optionally with manufactured defects applied to its source.
 * Each patch ASSERTS ITS EDIT MATCHED: a variant that rewrites an already-absent
 * anchor silently tests nothing, and a green from it is worthless (s2221).
 * The variant is staged with its sibling beside it so the relative import resolves.
 */
async function load(patches = []) {
  if (!patches.length) return import(pathToFileURL(BIRTH).href);
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 's2230-'));
  roots.push(root);
  fs.writeFileSync(path.join(root, 'desk-declaration-guard.mjs'), fs.readFileSync(DECL));
  let src = fs.readFileSync(BIRTH, 'utf8');
  for (const [find, replace] of patches) {
    assert.ok(src.includes(find), `variant anchor not found — the arm would test nothing: ${find}`);
    src = src.replace(find, replace);
  }
  const p = path.join(root, 'desk-birth-guard.mjs');
  fs.writeFileSync(p, src);
  return import(pathToFileURL(p).href);
}
test.after(() => { for (const r of roots) fs.rmSync(r, { recursive: true, force: true }); });

/** The manufactured defects and over-general cures, each named by what it breaks. */
const PRE_CURE = [
  ['const f = rowText.match(FINDING_ROW_ONE);', 'const f = rowText.match(FINDING);'],
  ['!carriesId(tail, r.id)', '!tail.includes(r.id)'],
  ['carriesId(line1.slice(m.index, m.index + 400), id)', 'line1.slice(m.index, m.index + 400).includes(id)'],
];
const LEDGER_ANCHORED = [['const f = rowText.match(FINDING_ROW_ONE);', 'const f = rowText.match(/\\bF-(?:[A-Z0-9]{1,8}-)+\\d+\\b/);']];
const KEY_ONLY = [['!carriesId(tail, r.id)', '!tail.includes(r.id)']];
const NOTOWED_ONLY = [['carriesId(line1.slice(m.index, m.index + 400), id)', 'line1.slice(m.index, m.index + 400).includes(id)']];
const LEADING_HYPHEN = [['(?<![A-Za-z0-9])${lit}', '(?<![A-Za-z0-9-])${lit}']];
const TRAILING_LOOSE = [['${lit}(?![A-Za-z0-9-])', '${lit}(?![A-Za-z0-9])']];
// The two ways a later fire "fixes" a containment complaint without measuring:
// loosen it until nothing reds, or tighten it until nothing passes. Both are
// realistic, and they are what make the control and the absent-id arm reachable
// rather than decoration (s2226).
const ALWAYS_PERMISSIVE = [['export function carriesId(text, id) {', 'export function carriesId(text, id) { return true;']];
const ALWAYS_STRICT = [['export function carriesId(text, id) {', 'export function carriesId(text, id) { return false;']];

/** Drive the exported pure core and assert the arm REACHED the branch being measured. */
function verdict(mod, line1, rows) {
  const r = mod.analyse(line1, rows);
  assert.equal(r.kind, 'window', `arm never reached the verdict path (kind='${r.kind}')`);
  assert.equal(r.qualifying.length, rows.length, 'row was not recognised as owner-gated — arm tests nothing');
  return { flagged: r.missing.length > 0, key: r.qualifying[0].id };
}

// ---------------------------------------------------------------- the cured guard

test('control: an ordinary owner-gated row already on the desk reaches the verdict path and passes', async () => {
  const m = await load();
  const v = verdict(m, HANDOFF(ROW('F-9999-1')), [ROW('F-9999-1')]);
  assert.equal(v.flagged, false);
  assert.equal(v.key, 'F-9999-1');
});

test('THE DEFECT (truncation): a row keyed by a SUB-ID is not answered for by its PARENT', async () => {
  const m = await load();
  const v = verdict(m, HANDOFF('🔺 **F-CLAW-2** (parent, already carried)'), [ROW('F-CLAW-2X')]);
  assert.equal(v.key, 'F-CLAW-2X', 'the row keys itself, not a truncation of itself');
  assert.equal(v.flagged, true, 'F-CLAW-2X never reached the desk — it must be flagged');
});

test('THE DEFECT (shadow): a row keyed by a PARENT is not answered for by a longer SUB-ID', async () => {
  const m = await load();
  const v = verdict(m, HANDOFF('🔺 **F-2131-1b** (a different finding)'), [ROW('F-2131-1')]);
  assert.equal(v.flagged, true, 'F-2131-1 is not on the desk; F-2131-1b is a different item');
});

test('a sub-id genuinely ON the desk keys ITSELF and is not flagged', async () => {
  const m = await load();
  const v = verdict(m, HANDOFF('🔺 **F-CLAW-2X** (carried as itself)'), [ROW('F-CLAW-2X')]);
  assert.equal(v.key, 'F-CLAW-2X');
  assert.equal(v.flagged, false, 'the ledger-anchored grammar would key nothing and red here');
});

test('an id genuinely ABSENT from the desk is still flagged', async () => {
  const m = await load();
  const v = verdict(m, HANDOFF('🔺 **F-8888-1** (unrelated)'), [ROW('F-7777-1')]);
  assert.equal(v.flagged, true);
});

test('ordinary desk markup still satisfies the containment — no over-strict boundary', async () => {
  const m = await load();
  // The hyphen-led form is here because a first draft of carriesId excluded "-" on
  // the LEADING side too and reddened exactly this case: a genuinely carried item
  // read as absent, i.e. a false red on ordinary prose (F-1460-1's fate).
  for (const desk of [
    '🔺 **F-1234-5** (bolded)', '🔺 `F-1234-5` (backticked)',
    '🔺 F-1234-5, mid-sentence.', '🔺 -F-1234-5 (hyphen-led)', '🔺 —F-1234-5 (dash-led)',
  ]) {
    assert.equal(verdict(m, HANDOFF(desk), [ROW('F-1234-5')]).flagged, false, `over-strict on: ${desk}`);
  }
});

test('the TRAILING hyphen exclusion is load-bearing on the multi-segment alpha families', async () => {
  const m = await load();
  // Ids are multi-segment, so F-MILK-3 is a strict PREFIX of the equally valid
  // F-MILK-3-SS-4. A trailing guard that excluded only alphanumerics would let the
  // longer id answer for the shorter one — the shadow hazard on another axis.
  assert.equal(verdict(m, HANDOFF('🔺 **F-MILK-3-SS-4** (a different finding)'), [ROW('F-MILK-3')]).flagged, true);
  assert.equal(verdict(m, HANDOFF('🔺 **F-MILK-3-SS-4** (carried)'), [ROW('F-MILK-3-SS-4')]).flagged, false);
});

// The leak direction here is the one a first draft gets backwards: the hazard is a
// LONGER id inside the acknowledgement excusing a SHORTER row key, because that is
// the direction `.includes` is tolerant in. An acknowledgement of F-CLAW-2 does not
// contain the string F-CLAW-2X, so that pairing discriminates nothing and would be
// decoration in both directions (s2226: an arm no variant reds is not a test).
test('DESK-NOT-OWED of a LONGER id does not excuse a distinct shorter row key', async () => {
  const m = await load();
  const line1 = HANDOFF('🔺 **F-3000-1** (unrelated)') + ' DESK-NOT-OWED F-CLAW-2X is handled elsewhere.';
  assert.equal(verdict(m, line1, [ROW('F-CLAW-2')]).flagged, true);
});

test('DESK-NOT-OWED of the EXACT id still excuses it — the escape hatch survives', async () => {
  const m = await load();
  const line1 = HANDOFF('🔺 **F-3000-1** (unrelated)') + ' DESK-NOT-OWED F-CLAW-2X is handled elsewhere.';
  assert.equal(verdict(m, line1, [ROW('F-CLAW-2X')]).flagged, false);
});

// ------------------------------------------------------- teeth: manufactured defects

test('TEETH: the pre-cure source reds the defect arms and leaves the reverse controls green', async () => {
  const m = await load(PRE_CURE);
  // (1) truncation: keyed by a prefix, then rescued by the parent on the desk.
  const trunc = verdict(m, HANDOFF('🔺 **F-CLAW-2** (parent, already carried)'), [ROW('F-CLAW-2X')]);
  assert.equal(trunc.key, 'F-CLAW-2', 'pre-cure keys the truncation');
  assert.equal(trunc.flagged, false, 'pre-cure false green — this is the defect');
  // (2) shadow: exact key, satisfied by a longer id.
  assert.equal(verdict(m, HANDOFF('🔺 **F-2131-1b** (a different finding)'), [ROW('F-2131-1')]).flagged, false);
  // (3) DESK-NOT-OWED prefix leak — a longer id in the hatch excusing a shorter key.
  const line1 = HANDOFF('🔺 **F-3000-1** (unrelated)') + ' DESK-NOT-OWED F-CLAW-2X is handled elsewhere.';
  assert.equal(verdict(m, line1, [ROW('F-CLAW-2')]).flagged, false);
  // REVERSE CONTROLS still green pre-cure — the defect is permissive, never a false red.
  assert.equal(verdict(m, HANDOFF('🔺 **F-9999-1**'), [ROW('F-9999-1')]).flagged, false);
  assert.equal(verdict(m, HANDOFF('🔺 **F-8888-1**'), [ROW('F-7777-1')]).flagged, true);
});

test('TEETH: the REFUTED ledger-anchored grammar makes a sub-id row VANISH', async () => {
  const m = await load(LEDGER_ANCHORED);
  // F-2229-1 measured that the ledger's cured FINDING rejects the trailing letter.
  // The consequence is sharper than "it keys the parent": the trailing \b fails
  // against the sub-id letter and \d+ cannot backtrack past it, so the row matches
  // NOTHING, rowId returns null, and analyse() drops the row before it is ever
  // asked about. The owner-gated row becomes INVISIBLE to the guard — a permissive
  // miss traded for a blind one, which is exactly why this cure imports the
  // row-key grammar and not the ledger's.
  assert.equal(m.rowId(ROW('F-CLAW-2X')), null, 'the anchored form cannot key a sub-id at all');
  const r = m.analyse(HANDOFF('🔺 **F-CLAW-2X** (carried as itself)'), [ROW('F-CLAW-2X')]);
  assert.equal(r.kind, 'window');
  assert.equal(r.qualifying.length, 0, 'the row vanished from the guard entirely');
});

test('TEETH: curing only the KEY side leaves the shadow hazard live', async () => {
  const m = await load(KEY_ONLY);
  assert.equal(verdict(m, HANDOFF('🔺 **F-CLAW-2** (parent)'), [ROW('F-CLAW-2X')]).flagged, true, 'key side is cured');
  assert.equal(
    verdict(m, HANDOFF('🔺 **F-2131-1b** (a different finding)'), [ROW('F-2131-1')]).flagged,
    false,
    'the partial cure still answers a parent with a longer sub-id',
  );
});

test('TEETH: reverting only the DESK-NOT-OWED site leaves that hatch leaking', async () => {
  const m = await load(NOTOWED_ONLY);
  const line1 = HANDOFF('🔺 **F-3000-1** (unrelated)') + ' DESK-NOT-OWED F-CLAW-2X is handled elsewhere.';
  assert.equal(verdict(m, line1, [ROW('F-CLAW-2')]).flagged, false, 'substring hatch excuses a distinct id');
  // ...while the tail containment it did NOT revert stays cured, so this variant is
  // caught by exactly one arm and not by the shadow arm.
  assert.equal(verdict(m, HANDOFF('🔺 **F-2131-1b**'), [ROW('F-2131-1')]).flagged, true);
});

test('TEETH: excluding the hyphen on the LEADING side reds the ordinary-markup arm', async () => {
  const m = await load(LEADING_HYPHEN);
  // This is not a hypothetical: it is what the first draft of carriesId did, and
  // this arm is how it was caught. The failure is a FALSE RED on a carried item.
  assert.equal(verdict(m, HANDOFF('🔺 -F-1234-5 (hyphen-led)'), [ROW('F-1234-5')]).flagged, true);
  assert.equal(verdict(m, HANDOFF('🔺 **F-1234-5**'), [ROW('F-1234-5')]).flagged, false, 'only the hyphen case moves');
});

test('TEETH: dropping the hyphen from the TRAILING side re-opens the multi-segment shadow', async () => {
  const m = await load(TRAILING_LOOSE);
  assert.equal(verdict(m, HANDOFF('🔺 **F-MILK-3-SS-4**'), [ROW('F-MILK-3')]).flagged, false);
  assert.equal(verdict(m, HANDOFF('🔺 **F-2131-1b**'), [ROW('F-2131-1')]).flagged, true, 'the alpha-suffix shadow stays cured');
});

test('TEETH: a helper loosened until nothing reds is caught by the absent-id arm', async () => {
  const m = await load(ALWAYS_PERMISSIVE);
  assert.equal(verdict(m, HANDOFF('🔺 **F-8888-1**'), [ROW('F-7777-1')]).flagged, false, 'nothing is ever flagged');
});

test('TEETH: a helper tightened until nothing passes is caught by the control', async () => {
  const m = await load(ALWAYS_STRICT);
  assert.equal(verdict(m, HANDOFF(ROW('F-9999-1')), [ROW('F-9999-1')]).flagged, true, 'a carried item is flagged');
});

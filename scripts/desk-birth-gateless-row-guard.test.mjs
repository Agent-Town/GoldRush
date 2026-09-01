#!/usr/bin/env node
/**
 * desk-birth-gateless-row-guard.test.mjs — F-2347-1 (measured s2347, shipped s2348).
 *
 * THE DEFECT. Every admission in desk-birth-guard ran through `gateOf(text)`,
 * which returns '' when a row carries no `GATE:` token — and `isOwnerGate('')` is
 * false UNCONDITIONALLY. So a row that declares in bold that the owner must do
 * something, and simply never writes "GATE:", was not REJECTED by the selector: it
 * never reached the selector. It entered no bucket, no denominator and no FAIL
 * list, and the guard reported PASS about a set the row was never in.
 *
 * IT WAS LIVE, NOT LATENT. F-MAIL-0829 — sign-in code emails down in production
 * since 2026-08-24, whole fix ~5 minutes of the owner's time — was filed at BACKLOG
 * line 1 at 09:53 on 2026-08-29 and reached NO desk. s2346 ran this guard as its
 * last act 21 minutes later, got PASS, and published a 41-item desk without it.
 *
 * THE CURE IS A SECOND ADMISSION ARM, TIGHTENED. A row with NO gate clause that
 * declares an owner ACT (OWNER ACTION|ASK|FIX), negation-guarded, and carries NO
 * closure glyph/word, is admitted. Priced by replaying all 2,221 session windows
 * (1,695 reaching kind:'window') through analyse() itself, keying every row by
 * rowId() and testing membership against that window's own deskTail():
 *     UNTIGHTENED : 13 admitted -> 5 verdicts, 4 of them CLOSURE RECORDS
 *     TIGHTENED   :  1 admitted -> 1 verdict, F-MAIL-0829, 0 false positives
 * and the F-1274-2 control says exactly ONE window in that history moves
 * (s2346: [(none)] -> [F-MAIL-0829]), with no previously-qualifying row lost.
 *
 * WHY THE BROAD CLOSURE FILTER IS SAFE, and it is the structural argument rather
 * than the statistical one: it narrows a set that is EMPTY TODAY. This arm admits
 * nothing before the cure, so every row it suppresses is a miss the guard ALREADY
 * HAS — never a new one. Arms 5-7 pin that the suppression is real and counted.
 *
 * EVERY RED ARM IS PROVEN BY MANUFACTURING THE DEFECT on a scratch copy of the
 * cured file, never by admiring a green (arms 9-12 are the reverse controls).
 */
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { copyGuardSources } from './guard-source-snapshot.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SUBJECT_FILE = 'desk-birth-guard.mjs';
const GUARD = path.join(HERE, SUBJECT_FILE);
const pathToUrl = (p) =>
  new URL(`file://${p.split(path.sep).map(encodeURIComponent).join('/')}`).href;
const { analyse, admissionOf, declaresOwnerAct, closureMarked } = await import(pathToUrl(GUARD));

const scratch = [];
after(() => scratch.forEach((d) => fs.rmSync(d, { recursive: true, force: true })));

const DESK = "🔺 **OWNER'S DESK — 1 awaiting a word.** 🔺 **F-1000-1** an older item";
const HANDOFF = (desk = DESK) =>
  `Last updated: 2026-08-29T12:00Z s9999 handoff, lock CLEARED — a summary. ${desk}`;
const ACT_ROW =
  '📪 **F-9101-1 — SIGN-IN IS DOWN.** 🔑 **OWNER ACTION, ~5 min, the whole fix: verify the domain.**';

// ---------------------------------------------------------------- the defect
test('1 — a gateless row declaring an owner ACT is admitted and, undesked, FAILS', () => {
  const r = analyse(HANDOFF(), [ACT_ROW]);
  assert.equal(r.kind, 'window');
  assert.equal(r.qualifying.length, 1, 'the row must reach the selector at all');
  assert.equal(r.qualifying[0].id, 'F-9101-1', 'keyed by rowId(), not by containment');
  assert.equal(r.qualifying[0].how, 'act', 'admitted by the ACT arm, not the gate arm');
  assert.equal(r.missing.length, 1, 'undesked, so it must be a FAIL verdict');
});

test('2 — the same row, DESKED, is admitted and does NOT fail (reverse control)', () => {
  const r = analyse(HANDOFF(`${DESK} · 🔺 **F-9101-1** sign-in is down`), [ACT_ROW]);
  assert.equal(r.qualifying.length, 1, 'still admitted — the arm has not gone quiet');
  assert.deepEqual(r.missing, [], 'a desked row must never be flagged');
});

test('3 — the row really has no gate clause, so the OLD selector could not see it', () => {
  assert.equal(admissionOf('📪 **F-9102-1 — a plain note with no gate and no owner ask.**'), null);
  // and the shipped gate arm is untouched: a real owner gate still admits
  assert.equal(admissionOf('🔺 **F-9103-1** the fork. GATE: OWNER word on the split.'), 'gate');
});

test('4 — a NEGATED owner ask is not an owner ask (F-1551-4, same sentence scope)', () => {
  assert.equal(declaresOwnerAct('no owner action is needed here'), false);
  assert.equal(declaresOwnerAct('this needs no spec; OWNER ACTION, ~5 min: verify'), true);
});

// ------------------------------------------------- the tightening, and its cost
test('5 — a CLOSURE record declaring an owner act is SUPPRESSED, not flagged', () => {
  const closed = `✅ **F-9104-1 — DISCHARGED s9998.** The OWNER ACTION was taken and it shipped.`;
  assert.equal(admissionOf(closed), null);
  const r = analyse(HANDOFF(), [closed]);
  assert.deepEqual(r.missing, [], 'obeying a false red here MANUFACTURES a desk item (F-2255-1)');
});

test('6 — suppression is COUNTED, never silent (F-2259-1: declare the denominator)', () => {
  const closed = `✅ **F-9104-1 — SHIPPED.** The OWNER ACTION was taken.`;
  const r = analyse(HANDOFF(), [ACT_ROW, closed]);
  assert.equal(r.actAdmitted, 1);
  assert.equal(r.actSuppressed, 1, 'a reader must be able to see what the filter removed');
});

test('7 — closureMarked keys on the vocabulary, glyph or word', () => {
  assert.equal(closureMarked('✅ done'), true);
  assert.equal(closureMarked('SUPERSEDED s1234'), true);
  assert.equal(closureMarked('📪 an open production outage'), false);
});

// ------------------------------------------------------------- the declaration
test('8 — main() DECLARES the arm on the happy path, not only on failure', () => {
  const out = runGuardOn(GUARD, [ACT_ROW], HANDOFF(`${DESK} · 🔺 **F-9101-1** desked`));
  assert.match(out.stdout, /by an owner-ACT declaration, no gate clause : 1/);
  assert.match(out.stdout, /PASS/);
  assert.equal(out.status, 0);
});

// --------------------------------------------------------- manufactured defects
test('9 — PRE-CURE analyse (gate arm only) misses the row entirely', async () => {
  const v = await variant('gate-arm-only');
  const r = v.analyse(HANDOFF(), [ACT_ROW]);
  assert.equal(r.qualifying.length, 0, 'this is the shipped defect: it never reaches the selector');
  assert.deepEqual(r.missing, []);
});

test('10 — REVERSE CONTROL: dropping the closure filter re-admits closure records', async () => {
  const v = await variant('no-closure-filter');
  const closed = '✅ **F-9104-1 — DISCHARGED s9998.** The OWNER ACTION was taken and it shipped.';
  const r = v.analyse(HANDOFF(), [closed]);
  assert.equal(r.missing.length, 1, 'the over-general cure invents an owner item out of a closed thread');
});

test('11 — REVERSE CONTROL: an ACT arm that ignores an existing gate clause over-reaches', async () => {
  // A row WITH a gate the shipped arm has already read and DECLINED must stay
  // declined. Letting the ACT arm re-admit it would silently overrule isOwnerGate.
  const gated = '🔺 **F-9105-1** the owner action was recorded. GATE: drain when lane-b reports.';
  assert.equal(admissionOf(gated), null, 'a declined gate must not be re-admitted by the ACT arm');
  const v = await variant('act-ignores-gate');
  assert.equal(v.admissionOf(gated), 'act', 'the manufactured over-reach really does re-admit it');
});

test('12 — REVERSE CONTROL: the FAIL text for an ACT row must not cite a "GATE:" offset', () => {
  const out = runGuardOn(GUARD, [ACT_ROW], HANDOFF());
  assert.equal(out.status, 1, 'an undesked owner row must red');
  assert.match(out.stderr, /carries NO "GATE:" clause/);
  assert.doesNotMatch(out.stderr, /offset -1 past "GATE:"/,
    'quoting an offset into a token the row does not contain accuses the wrong subject');
});

// ------------------------------------------------------------------- machinery
/** A scratch copy of the cured guard with one defect manufactured into it. */
async function variant(kind) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `desk-birth-${kind}-`));
  scratch.push(dir);
  // F-2420-1: NOT a bare copy loop. Two sibling guards in this battery write and
  // delete transient `tmp-*-shadow-*.mjs` in the REAL scripts/ dir by design, and
  // `node --test` runs the 98 files in parallel — so an entry can vanish between
  // the listing and its copy. Measured s2420: 10/10 crashes inline, 0/10 with the
  // helper. See guard-source-snapshot.mjs for why it skips ENOENT and only ENOENT.
  copyGuardSources(HERE, dir, SUBJECT_FILE);
  const target = path.join(dir, 'desk-birth-guard.mjs');
  const src = fs.readFileSync(target, 'utf8');
  const edits = {
    'gate-arm-only': [
      /  if \(gate !== ''\) return null;\n  if \(!declaresOwnerAct\(rowText\)\) return null;\n  if \(closureMarked\(rowText\)\) return null;\n  return 'act';/,
      '  return null;',
    ],
    'no-closure-filter': [/  if \(closureMarked\(rowText\)\) return null;\n/, ''],
    'act-ignores-gate': [/  if \(gate !== ''\) return null;\n/, ''],
  }[kind];
  const out = src.replace(edits[0], edits[1]);
  // s2221's trap: a variant whose edit matched NOTHING is a vacuous arm that goes
  // green having tested the CURED file. Assert the manufacture succeeded.
  assert.notEqual(out, src, `variant ${kind}: the edit MATCHED NOTHING — the arm would be vacuous`);
  fs.writeFileSync(target, out);
  return await import(pathToUrl(target));
}

/** Run the real guard against a manufactured git window, and return its channels. */
function runGuardOn(guardPath, rows, line1) {
  // realpathSync is LOAD-BEARING, not tidiness. macOS symlinks the tmpdir, so
  // process.argv[1] keeps /var/... while import.meta.url resolves /private/var/...,
  // the module-main guard at the foot of desk-birth-guard.mjs compares FALSE, and
  // main() SILENTLY NEVER RUNS — rc=0, stdout 0 B, stderr 0 B. That is the s1334
  // trap the guard's own entrypoint comment names, and it is indistinguishable
  // from a clean PASS. Measured here before this line existed: arms 8 and 12 both
  // failed against an empty string.
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'desk-birth-window-')));
  scratch.push(dir);
  const git = (...a) => spawnSync('git', a, { cwd: dir, encoding: 'utf8' });
  git('init', '-q', '-b', 'main');
  git('config', 'user.email', 'fire@goldrush.local');
  git('config', 'user.name', 'fire');
  fs.mkdirSync(path.join(dir, 'tasks'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'scripts'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'tasks', 'BACKLOG.md'), '# ledger\n');
  // The start line-1 must DIFFER from the end one, or the end commit does not
  // touch STATUS.md, previousHandoffCommit() sees one entry and returns null.
  fs.writeFileSync(path.join(dir, 'STATUS.md'), `${HANDOFF()} — window start\n`);
  git('add', '-A');
  git('commit', '-qm', 's9998 handoff: the window start');
  fs.appendFileSync(path.join(dir, 'tasks', 'BACKLOG.md'), rows.join('\n') + '\n');
  fs.writeFileSync(path.join(dir, 'STATUS.md'), `${line1}\n`);
  git('add', '-A');
  git('commit', '-qm', 's9999 handoff: the window end');
  copyGuardSources(HERE, path.join(dir, 'scripts'), SUBJECT_FILE); // F-2420-1: same race
  return spawnSync(process.execPath, [path.join(dir, 'scripts', 'desk-birth-guard.mjs')], {
    cwd: dir, encoding: 'utf8',
  });
}

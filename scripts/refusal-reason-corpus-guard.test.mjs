// F-2247-1 + F-2247-2 (s2247) — the CORPUS-vs-CLAIM axis on the two instruments that read a
// refusal's stated reason.
//
// F-2247-1: ruling-propagation-guard prints "no REFUSAL cites a finding the owner has already
// ruled" — a claim defined by ROLE — from a subject test defined by FORMAT: six exact key
// spellings. 17 of the live tree's 44 refusing leaves carried none of them, so the scan joined an
// EMPTY string and could never red on those leaves whatever they said.
//
// F-2247-2: drain-block-check's closure-reason resolver excluded ONE retired spelling by name
// (priorBlockedReason) out of six in the tree, and the survivors ranked FIRST because
// `priorStoppedReason` matches its closure-stem test on "stop" while the live `closureReason`
// does not — so a retired, explicitly-overturned reason outranked the real one.
//
// EVERY red arm below was proven by MANUFACTURING the defect on a scratch copy; the reverse
// controls exist because the obvious over-general cures (scan every note; exclude every key with
// a reason-ish stem) each pass all the defect arms while breaking correct behaviour.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
// `staleRefusals` is imported statically because it predates this cure and a pre-cure copy still
// provides it — so the behavioural arms below RED on the defect instead of dying at module load.
// The three symbols this cure ADDS are resolved lazily for the same reason: a missing export is a
// construction failure, not evidence about the defect, and an arm that cannot load cannot testify.
import { staleRefusals } from './ruling-propagation-guard.mjs';

const lazy = async (name) => (await import('./ruling-propagation-guard.mjs'))[name];

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RULED = 'F-1219-1 RULED — the owner answered this.';

function tree(leaf) {
  return { id: 'root', children: [{ id: 'x', taskFile: 'x.md', ...leaf }] };
}

// ---------------------------------------------------------------- F-2247-1: the widened corpus

test('F-2247-1: a refusal stating its basis under closureReason is READ (pre-cure: unread, green)', () => {
  const goals = tree({ status: 'superseded', closureReason: `blocked pending ${RULED}` });
  const { stale } = staleRefusals(goals, RULED);
  assert.equal(stale.length, 1, 'closureReason (24 uses on the tree) must be in the corpus');
});

test('F-2247-1: a session-stamped variant is the same field, not a new one', () => {
  const goals = tree({ status: 'stopped', stoppedNote_s1263: `held for ${RULED}` });
  const { stale } = staleRefusals(goals, RULED);
  assert.equal(stale.length, 1, 'stoppedNote_s1263 and stoppedNote are one record');
});

test('F-2247-1: a refusal with NO readable basis is counted as unreadable, not as clean', () => {
  const goals = tree({ status: 'stopped', note: 'the why lives only in a narrative field' });
  const { stale, unreadable } = staleRefusals(goals, RULED);
  assert.equal(stale.length, 0);
  assert.equal(unreadable.length, 1, 'an unread refusal is a hole in the denominator');
});

test('F-2247-1: the declaration prints on the HAPPY path — unreadable === 0 (F-2208-1)', async () => {
  // main() reads the live tree through an import.meta.url-anchored ROOT, so NO fixture can drive
  // it to unreadable === 0. Asserting only through the CLI would pass just as well if the line
  // were printed on failure alone — which is precisely how the first draft of this arm scored
  // green against a "declare only on failure" variant. Exercise the decision itself.
  const corpusDeclaration = await lazy('corpusDeclaration');
  assert.ok(corpusDeclaration, 'the cure must export its declaration builder');
  const clean = corpusDeclaration(44, 0);
  assert.match(clean, /44\/44 refusals state their basis under a key this guard reads/);
  assert.doesNotMatch(clean, /DECLARED UNREAD/, 'a clean board says nothing extra');
  const holed = corpusDeclaration(44, 5);
  assert.match(holed, /39\/44/);
  assert.match(holed, /5 DECLARED UNREAD/);
});

test('F-2247-1: the CLI is WIRED to the declaration (the call site, not just the decision)', () => {
  // F-2209-1: extracting a decision to make it testable creates a NEW untested seam — the call
  // site. Assert from where the caller stands, on the observable the caller actually reads.
  const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts/ruling-propagation-guard.mjs')], {
    timeout: 240_000, killSignal: 'SIGKILL',
    cwd: ROOT, encoding: 'utf8',
  });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /\d+\/\d+ refusals state their basis under a key this guard reads/);
});

test('F-2247-1: the PASS sentence states its own scope when anything went unread', async () => {
  const passVerdict = await lazy('passVerdict');
  assert.ok(passVerdict, 'the cure must export its verdict builder');
  assert.match(passVerdict(5), /no READABLE refusal/, 'an unqualified PASS would claim more than it checked');
  assert.match(passVerdict(5), /narrative field this guard does not scan/);
  assert.equal(passVerdict(0), 'PASS — no refusal cites a finding the owner has already ruled.');

  // ...and the CLI must actually use it.
  const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts/ruling-propagation-guard.mjs')], {
    timeout: 240_000, killSignal: 'SIGKILL',
    cwd: ROOT, encoding: 'utf8',
  });
  const pass = r.stdout.split('\n').find((l) => l.startsWith('PASS'));
  assert.ok(pass, 'a verdict line must exist');
  const declared = /·\s*(\d+) DECLARED UNREAD/.exec(r.stdout);
  if (declared && Number(declared[1]) > 0) assert.match(pass, /no READABLE refusal/);
});

// ------------------------------------------------------- F-2247-1: reverse controls on widening

test('REVERSE CONTROL: a narrative note RECORDING a propagation must not red', () => {
  // The over-general cure — scan `note`/`drainNotes`/`authorNotes` too — reds on all three of the
  // live leaves that record a ruling correctly, turning this guard's remedy ("say so without
  // naming the ruled finding") into an order to delete propagation records.
  const goals = tree({
    status: 'stopped',
    stopNote: 'stopped on a structural residual, unrelated to any ruling',
    note: 'Owner rulings 2026-08-20: stake pressure yes (F-1219-1 RULED). Propagated here.',
  });
  const { stale } = staleRefusals(goals, RULED);
  assert.equal(stale.length, 0, 'a propagation RECORD is correct bookkeeping, not a stale refusal');
});

test('REVERSE CONTROL: a RETIRED prior* reason must not red', () => {
  const goals = tree({
    status: 'superseded',
    closureReason: 'SUPERSEDED by v2 — clean.',
    priorStoppedReason: `the old argument rested on ${RULED}`,
  });
  const { stale } = staleRefusals(goals, RULED);
  assert.equal(stale.length, 0, 'a retired reason is history; the ruling overturned it on purpose');
});

test('REVERSE CONTROL: authorNotes states intent, never outcome', () => {
  const goals = tree({
    status: 'stopped',
    stopNote: 'stopped for its own reasons',
    authorNotes: `authored under ${RULED}`,
  });
  const { stale } = staleRefusals(goals, RULED);
  assert.equal(stale.length, 0, 'authoring intent is not a refusal basis (drain-block-check F-1274-2)');
});

test('refusalText excludes retired and authoring keys but keeps live ones', async () => {
  const refusalText = await lazy('refusalText');
  assert.ok(refusalText, 'the cure must export its reason resolver');
  const leaf = {
    closureReason: 'LIVE', priorStoppedReason: 'RETIRED',
    authorNotes: 'INTENT', priorBlockReason_s1110_SUPERSEDED: 'RETIRED2',
  };
  const text = refusalText(leaf);
  assert.match(text, /LIVE/);
  assert.doesNotMatch(text, /RETIRED/);
  assert.doesNotMatch(text, /INTENT/);
});

// ------------------------------------------------- F-2247-2: the sibling's retired-reason ranking

function fixtureRoot(leaf) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 's2247-dbc-'));
  fs.mkdirSync(path.join(dir, 'tasks'), { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'tasks/goals.json'),
    JSON.stringify({ id: 'root', children: [{ id: 'subject', taskFile: 'subject.md', ...leaf }] }),
  );
  fs.writeFileSync(path.join(dir, 'tasks/BACKLOG.md'), '# backlog\n');
  return dir;
}

function askDrainBlockCheck(dir, arg) {
  return spawnSync(process.execPath, [path.join(ROOT, 'scripts/drain-block-check.mjs'), arg], {
    timeout: 240_000, killSignal: 'SIGKILL',
    cwd: dir, encoding: 'utf8',
  });
}

test('F-2247-2: closureReason outranks a retired priorStoppedReason (pre-cure: reversed)', (t) => {
  const dir = fixtureRoot({
    status: 'superseded',
    priorStoppedReason: 'RETIRED-ARGUMENT-THE-RULING-OVERTURNED',
    closureReason: 'LIVE-SUPERSESSION-RECORD',
  });
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const r = askDrainBlockCheck(dir, 'subject.md');
  assert.ok(r.stdout.length > 0, 'control: the tool must actually have produced a verdict');
  assert.match(r.stdout, /LIVE-SUPERSESSION-RECORD/, 'the live record must be the one printed');
  assert.doesNotMatch(r.stdout, /RETIRED-ARGUMENT/, 'printing a retired reason is worse than silence');
});

test('F-2247-2: a _SUPERSEDED-suffixed reason is retired too', (t) => {
  const dir = fixtureRoot({
    status: 'superseded',
    priorBlockReason_s1110_SUPERSEDED: 'RETIRED-ARGUMENT',
    closureReason: 'LIVE-SUPERSESSION-RECORD',
  });
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const r = askDrainBlockCheck(dir, 'subject.md');
  assert.ok(r.stdout.length > 0, 'control: the tool must actually have produced a verdict');
  assert.doesNotMatch(r.stdout, /RETIRED-ARGUMENT/);
});

test('REVERSE CONTROL: excluding the retired CLASS must not swallow a legitimate closure reason', (t) => {
  // The over-general cure — dropping every reason-ish key that is not on the explicit list —
  // makes leaves whose only record is an adhoc spelling report "no reason recorded", which is the
  // false silence s1249 spent a fire refuting.
  const dir = fixtureRoot({ status: 'superseded', supersededNote_s1116: 'ITS-2A-VERDICT-IS-OVERTURNED' });
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const r = askDrainBlockCheck(dir, 'subject.md');
  assert.ok(r.stdout.length > 0, 'control: the tool must actually have produced a verdict');
  assert.match(r.stdout, /ITS-2A-VERDICT-IS-OVERTURNED/, 'an adhoc closure spelling is still a reason');
});

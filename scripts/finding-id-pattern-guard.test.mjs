// finding-id-pattern-guard — there is ONE F-ID pattern in this repo, and it is
// correct in BOTH directions.
//
// F-2228-1 (s2228). The predicate "what is an F-ID?" was implemented SEVEN times
// across live instruments in THREE variants, and both populations were wrong:
//   · four ledger guards read /\bF-\d+-\d+\b/ — structurally BLIND to every
//     lettered id (F-DOOR-6, F-E2S-4, F-ASSAY-E2E-9 ...). A guard that cannot see
//     a row can never red on it, so the miss is in the PERMISSIVE direction.
//   · three desk guards read /F-(?:[A-Z0-9]{1,8}-)+\d+/ with NO trailing \b, so
//     they match INSIDE a longer token ("F-1419-2s CURE" -> F-1419-2).
// Adopting either sibling verbatim is a defect, which is why F-2227-1's rule
// ("import the sibling, do not write a fifth copy") was NECESSARY BUT NOT
// SUFFICIENT here: when copies disagree, deciding they should agree is only half
// the job — you must also decide WHICH is correct, and it may be neither.
//
// This guard therefore asserts BOTH halves: that the copies have collapsed to one
// declaration, and that the surviving one behaves correctly at each end.
//
// Run: node --test scripts/finding-id-pattern-guard.test.mjs

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(SCRIPTS, '..');

const { FINDING } = await import(path.join(SCRIPTS, 'findings-state-guard.mjs'));

// The four ledger guards that historically each kept a private copy.
const CONSUMERS = [
  'findings-state-guard.mjs',
  'blocker-panel-closed-guard.mjs',
  'ruling-propagation-guard.mjs',
  'stale-open-candidates.mjs',
];

const isScratch = (f) => /^_/.test(f) || /^tmp-s\d/.test(f);
const liveScripts = fs
  .readdirSync(SCRIPTS)
  .filter((f) => (f.endsWith('.mjs') || f.endsWith('.js')) && !f.includes('.test.') && !isScratch(f));

test('control: the corpus is non-empty and the consumers all exist', () => {
  // A census that silently reads nothing reports agreement it never observed
  // (F-2215-1). Assert the subject set before believing any verdict about it.
  assert.ok(liveScripts.length > 100, `live script corpus looks empty: ${liveScripts.length}`);
  for (const f of CONSUMERS) {
    assert.ok(fs.existsSync(path.join(SCRIPTS, f)), `consumer missing: ${f}`);
  }
});

// The desk trio keeps its own declaration, DELIBERATELY and for a measured reason
// (F-2228-2, banked not cured): those three switch on the global flag as a semantic
// — desk-declaration-guard.mjs:165 documents that `.match` reports `.index` only
// when NOT global, and uses a global/non-global pair. Collapsing them onto one
// shared /g export is a behaviour change that needs its own measurement, and
// re-coding a working cure in passing is a drive-by. Their pattern is still wrong at
// the tail (no \b, so it matches inside a longer token); that is F-2228-2's subject.
const DESK_TRIO = ['desk-birth-guard.mjs', 'desk-carryforward-guard.mjs', 'desk-declaration-guard.mjs'];

test('no live script outside the ledger family and the declared desk trio declares an F-ID pattern', () => {
  const declarers = liveScripts.filter((f) => {
    const src = fs.readFileSync(path.join(SCRIPTS, f), 'utf8');
    return /^(?:export )?const FINDING\s*=/m.test(src);
  });
  assert.deepEqual(
    declarers.sort(),
    [...DESK_TRIO, 'findings-state-guard.mjs'].sort(),
    'a new private F-ID pattern appeared — that is exactly how F-2228-1 drifted into seven copies',
  );
});

test('every consumer reaches the shared pattern by import, not by copy', () => {
  for (const f of CONSUMERS.filter((c) => c !== 'findings-state-guard.mjs')) {
    const src = fs.readFileSync(path.join(SCRIPTS, f), 'utf8');
    assert.match(
      src,
      /import\s*\{[^}]*\bFINDING\b[^}]*\}\s*from '\.\/findings-state-guard\.mjs'/,
      `${f} must import FINDING rather than redeclare it`,
    );
  }
});

test('the pattern SEES lettered ids — the permissive miss that made this a finding', () => {
  // These are real ids from the live ledger and the owner's desk.
  for (const id of ['F-DOOR-3', 'F-E2S-4', 'F-ASSAY-E2E-9', 'F-PT15-1', 'F-BW-19', 'F-A10-5']) {
    assert.deepEqual(id.match(new RegExp(FINDING.source, 'g')), [id], `blind to ${id}`);
  }
});

test('the pattern still sees plain numeric ids — no regression on the old corpus', () => {
  for (const id of ['F-2228-1', 'F-1024-4', 'F-058-3']) {
    assert.deepEqual(id.match(new RegExp(FINDING.source, 'g')), [id], `lost ${id}`);
  }
});

test('the pattern does NOT match inside a longer token — the desk copy over-matches here', () => {
  // REVERSE CONTROL for the obvious cure "adopt the desk guards' pattern verbatim".
  // BACKLOG:1396 reads "...F-1419-2s CURE...": the desk pattern yields F-1419-2 and
  // manufactures a double-state conflict against the ✅ row at :1388, redding
  // findings-state-guard on a citation that is not a state claim at all.
  const g = new RegExp(FINDING.source, 'g');
  assert.equal('F-1419-2s CURE'.match(g), null, 'matched inside a longer token');
  assert.equal('xF-1419-2'.match(new RegExp(FINDING.source, 'g')), null, 'matched with a leading word char');
});

test('closure is SUBJECT-FIRST: a row that merely CITES an id does not close it', async () => {
  // The half that keeps the widened pattern honest. Without it, BACKLOG:974 —
  // subject F-1543-1, ✅, whose text reads "F-DOOR-3 DISCHARGED BY FOLDING" —
  // declares F-DOOR-3 closed, and blocker-panel-closed-guard reds telling a fire to
  // strike F-DOOR-3 off the owner's panel. F-DOOR-3's own row (:987) is a live 🔺
  // whose tail says the `respawns: true` half "stays OPEN and unassigned".
  const { subjectLedClosure } = await import(path.join(SCRIPTS, 'desk-state-audit.mjs'));
  const backlog = fs.readFileSync(path.join(REPO, 'tasks', 'BACKLOG.md'), 'utf8');

  // POSITIVE CONTROL FIRST: without it, an all-empty result reads as success.
  assert.ok(
    subjectLedClosure(backlog, 'F-1543-1').length > 0,
    'positive control failed — subjectLedClosure sees no closure for a row that IS ✅-closed, so this test proves nothing',
  );
  assert.equal(
    subjectLedClosure(backlog, 'F-DOOR-3').length,
    0,
    'F-DOOR-3 read as closed from a citation — the panel guard would strike a live owner item',
  );
});

test('the panel guard consults subject-first closure, not bare census membership', () => {
  const src = fs.readFileSync(path.join(SCRIPTS, 'blocker-panel-closed-guard.mjs'), 'utf8');
  assert.match(src, /subjectLedClosure\(backlog, id\)/, 'panel guard no longer applies the subject-first test');
});

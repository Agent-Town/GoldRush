// desk-row-key-token-guard — a BACKLOG row is keyed by a WHOLE token, never by a
// truncation of a longer id.
//
// F-2229-1 (s2229), executing the row-key half of F-2228-2, which s2228 banked
// rather than cured. desk-declaration-guard's FINDING is unanchored, so on a row
// about a sub-finding it matched a PREFIX and keyed the row under an id that is not
// in the text: a row declaring F-CLAW-2X was keyed F-CLAW-2, F-0707-5a was keyed
// F-0707-5. That manufactures a declaration for a desk item which has no row of its
// own — and the guard's own FAIL text is the principle it was breaking:
// "A mention inside another finding's row does NOT count."
//
// PROVEN BY MANUFACTURING, not by a green: desk item F-CLAW-2 whose only BACKLOG row
// declares F-CLAW-2X read PASS rc=0 as shipped. A false green, in the permissive
// direction, in a leg chained bare into test:ledger-guards.
//
// AND THE OBVIOUS CURE IS REFUTED BY MEASUREMENT, which is why this guard asserts
// both ends. F-2227-1's rule says import the sibling; F-2228-1 adds that the sibling
// may itself be wrong. Here it is wrong in the OPPOSITE direction: the ledger's cured
// FINDING rejects the trailing sub-id letter outright, so all four live sub-ids
// (F-2131-1b, F-GNT-4b, F-0707-5a, F-CLAW-2X) would key NOTHING — trading a
// permissive miss for a blind one. The two questions genuinely need two grammars:
// the ledger asks "what STATE does this row declare?", where F-1419-2s is prose
// inflection of F-1419-2 and must not mint an id; this asks "what does this row
// KEY?", where F-2131-1b is a finding distinct from its parent F-2131-1.
//
// Run: node --test scripts/desk-row-key-token-guard.test.mjs

import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const GUARD = path.join(SCRIPTS, 'desk-declaration-guard.mjs');
const { declaredIds, deskIds } = await import(GUARD);
const fixtures = [];
after(() => fixtures.forEach((dir) => fs.rmSync(dir, { recursive: true, force: true })));

const HANDOFF = (desk) =>
  `Last updated: 2026-08-23T09:00Z s9998 handoff, lock CLEARED — nothing landed. ` +
  `🔺 **OWNER'S DESK — 1 awaiting a word.** ${desk}`;

function fixture(line1, rows) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 's2229-'));
  fixtures.push(root);
  fs.mkdirSync(path.join(root, 'tasks'));
  fs.writeFileSync(path.join(root, 'STATUS.md'), line1 + '\n\n## rest\n');
  fs.writeFileSync(path.join(root, 'tasks', 'BACKLOG.md'), ['# BACKLOG', ...rows].join('\n') + '\n');
  fs.writeFileSync(path.join(root, 'tasks', 'goals.json'), JSON.stringify({ goals: [] }));
  return root;
}
function runGuard(root) {
  try {
    return { rc: 0, out: execFileSync('node', [GUARD, '--root', root], { timeout: 240_000, killSignal: 'SIGKILL', encoding: 'utf8', maxBuffer: 64 << 20 }) };
  } catch (e) {
    return { rc: e.status ?? 'ERR', out: (e.stdout || '') + (e.stderr || '') };
  }
}

test('control: the guard runs and reaches its verdict path on an ordinary desk', () => {
  // A SKIP is not silence (s2227) and a crashed arm is not a pass (F-2215-1).
  // Assert the arm REACHED the branch before believing anything it says.
  const root = fixture(HANDOFF('🔺 **F-1234-5**'), ['- 🟡 **F-1234-5 OPEN** — an ordinary finding.']);
  const r = runGuard(root);
  assert.ok(r.out.length > 0, 'guard produced no output at all');
  assert.ok(!/SKIP —/.test(r.out), 'guard SKIPPED — it never reached the verdict path');
  assert.match(r.out, /desk F-IDs\s*:\s*1/, 'the desk item was not read');
  assert.equal(r.rc, 0, `an ordinary declared desk item must PASS:\n${r.out}`);
});

test('THE DEFECT: a row about a sub-finding must not declare its PREFIX', () => {
  // Ground truth: F-CLAW-2 has no row of its own. The only row declares F-CLAW-2X.
  const root = fixture(HANDOFF('🔺 **F-CLAW-2**'), [
    '- 🟡 **F-CLAW-2X OPEN** — the Salvage Claw bills its triangles twice per frame.',
  ]);
  const r = runGuard(root);
  assert.equal(r.rc, 1, `an undeclared desk item must FAIL, got rc=${r.rc}:\n${r.out}`);
  assert.match(r.out, /F-CLAW-2\b/, 'the failure must name the undeclared item');
});

test('a real sub-id keys its OWN row — the anchored ledger pattern would key nothing', () => {
  // The reverse control for "just import findings-state-guard's FINDING".
  const keys = declaredIds('- 🟡 **F-CLAW-2X OPEN** — a real sub-finding with its own row.\n');
  assert.ok(keys.has('F-CLAW-2X'), `sub-id row keyed nothing; keys=${[...keys.keys()]}`);
  assert.ok(!keys.has('F-CLAW-2'), 'the row must NOT also be keyed under its prefix');
});

test('all four live sub-ids key themselves, not their prefixes', () => {
  for (const id of ['F-2131-1b', 'F-GNT-4b', 'F-0707-5a', 'F-CLAW-2X']) {
    const keys = declaredIds(`- 🟡 **${id} OPEN** — a live sub-finding.\n`);
    assert.ok(keys.has(id), `${id} did not key itself; keys=${[...keys.keys()]}`);
    assert.ok(
      !keys.has(id.slice(0, -1)),
      `${id} was also keyed under its prefix ${id.slice(0, -1)} — a phantom key`,
    );
  }
});

test('a parent and its sub-finding are DISTINCT keys', () => {
  // F-2131-1 is a real owner design fork ("F-2131-1 (OPEN — OWNER DESIGN FORK,
  // declared s2131" in BACKLOG.md — cited by CONTENT, since the fire that wrote this
  // moved that line by 4 with its own rows); F-2131-1b is a separate finding.
  // Keying the second under the first conflates two owner items.
  const keys = declaredIds(
    ['- 🔺 **F-2131-1 (OPEN — OWNER DESIGN FORK)** — the headless idle floor.',
     '- 🟡 **F-2131-1b OPEN** — a distinct sub-finding.'].join('\n') + '\n',
  );
  assert.ok(keys.has('F-2131-1'), 'the parent lost its key');
  assert.ok(keys.has('F-2131-1b'), 'the sub-finding lost its key');
  assert.notEqual(keys.get('F-2131-1'), keys.get('F-2131-1b'), 'both keys resolved to one row');
});

test('the DESK-TAIL scan stays narrow — prose inflection must not become an item', () => {
  // The reverse control for the over-general cure "widen both sides the same way".
  // Measured across all 1457 historical desks, widening the tail invents three items
  // with no row (F-1314-5b, F-1285-4s, F-1260-3s) — i.e. it reds the battery on
  // ordinary handoff prose, which is the F-1460-1 fate.
  const desk = deskIds(
    HANDOFF("🔺 **F-1234-5** (carried; F-1285-4s cure landed and F-1260-3s is quoted in the row)"),
  );
  assert.equal(desk.kind, 'desk', `the arm never reached the desk branch: kind=${desk.kind}`);
  assert.ok(desk.ids.includes('F-1234-5'), 'the real desk item was dropped');
  for (const phantom of ['F-1285-4s', 'F-1260-3s']) {
    assert.ok(!desk.ids.includes(phantom), `prose inflection ${phantom} was minted as a desk item`);
  }
});

test('first-key-wins inside the subject zone is preserved', () => {
  const keys = declaredIds('- 🟡 **F-1111-1 OPEN** — cites F-2222-2 inside its own subject.\n');
  assert.ok(keys.has('F-1111-1'), 'the row lost its own key');
  assert.ok(!keys.has('F-2222-2'), 'a cited id inside another row became a key (the F-1328-3 shape)');
});

test('an id past the 90-character subject zone is still not a key', () => {
  const pad = 'x'.repeat(95);
  const keys = declaredIds(`- 🟡 ${pad} F-3333-3 OPEN\n`);
  assert.ok(!keys.has('F-3333-3'), 'an id outside the subject zone became a key');
});

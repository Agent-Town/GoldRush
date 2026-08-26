// blocker-panel-classifiable-guard — F-2335-1, s2335.
//
// blocker-panel-closed-guard prints FOUR numbers and, until s2335, gated on ONE.
// `closed-on-panel: 0` means "no closed finding is on the panel" only if the
// rows were CLASSIFIABLE. If the panel's own display transform or the FINDING
// pattern stops yielding ids, every row falls through the loop's `continue`,
// `violations` stays empty, and the guard prints PASS having classified nothing.
//
// That is s2334's rung: a consumer that SELECTS subjects and DELEGATES their
// classification cannot reach any refusal built into the child when the
// classifiable set comes back empty.
//
// Each arm below was PROVEN BY MANUFACTURING THE DEFECT, not by reading a green.
// The reverse controls (arms 3, 4, 5) exist to catch the over-general cures:
//   · refuse whenever rowsWithId === 0            -> reds arm 3 (an EMPTY panel is lawful)
//   · refuse on any row whose id is unreadable    -> reds arm 4 (an id-less row is lawful)
//   · let the refusal gate in --report            -> reds arm 5 (advisory must never block)
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const SCRIPT = path.join(import.meta.dirname, 'blocker-panel-closed-guard.mjs');
const ROOT = path.resolve(import.meta.dirname, '..');
const PANEL = path.join(ROOT, 'scripts', 'dashboard-gen.sh');

// The fixture carries the REAL dashboard-gen.sh (the existing suite's rule): the
// guard executes the panel's own pipeline, so a hand-written stub tests nothing.
function fixture(t, backlog, panel = fs.readFileSync(PANEL, 'utf8')) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gold-rush-classifiable-'));
  fs.mkdirSync(path.join(dir, 'tasks'));
  fs.mkdirSync(path.join(dir, 'scripts'));
  fs.writeFileSync(path.join(dir, 'tasks', 'BACKLOG.md'), backlog);
  fs.writeFileSync(path.join(dir, 'scripts', 'dashboard-gen.sh'), panel);
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

function run(root, ...args) {
  return spawnSync(process.execPath, [SCRIPT, '--root', root, ...args], {
    encoding: 'utf8',
    timeout: 120_000,
  });
}

// Narrow the BLOCKED panel's own truncation past the id. `cut -c1-100` appears
// only on the blocked transform; the OWNER panel below it uses `cut -c1-105`.
function narrowed() {
  const panel = fs.readFileSync(PANEL, 'utf8');
  assert.ok(panel.includes('cut -c1-100'), 'fixture premise: the blocked transform truncates at 100');
  return panel.replace('cut -c1-100', 'cut -c1-4');
}

// A closure APPENDED below an open-looking panel row — the F-1290-1 structure
// the parent guard exists to catch.
const CLOSED_ON_PANEL = [
  '## ledger',
  '- ⚠️ **F-9001-1 — the thing is broken.** GATE: someone must author the corrective.',
  '',
  '- ✅ **F-9001-1 UPDATE (s900 drain — shipped and re-verified).** It was fixed here.',
].join('\n');

// ARM 2 first in reading order: it establishes that arm 1's board really does
// carry a detectable defect, so arm 1 is measuring blindness and not an empty board.
test('GROUND TRUTH — with the panel intact, the closed-on-panel finding IS caught', (t) => {
  const result = run(fixture(t, CLOSED_ON_PANEL));
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stdout, /F-9001-1\s+closed at BACKLOG:/);
  assert.match(result.stdout, /rows with an F-ID : 1/);
});

test('THE DEFECT — the same board, with the panel truncating past the id, must REFUSE not PASS', (t) => {
  const result = run(fixture(t, CLOSED_ON_PANEL, narrowed()));
  // pre-cure this arm read: rc=0, "closed-on-panel : 0", PASS.
  assert.match(result.stdout, /panel rows        : 1/, 'premise: a row WAS selected');
  assert.match(result.stdout, /rows with an F-ID : 0/, 'premise: and none was classifiable');
  assert.equal(result.status, 2, `expected 2 = "could not answer"\n${result.stdout}${result.stderr}`);
  assert.match(result.stderr, /REFUSING/);
  assert.match(result.stderr, /dashboard-gen\.sh/, 'the refusal must name what to re-anchor');
});

test('REVERSE CONTROL — an EMPTY panel is lawful and must not refuse', (t) => {
  // No row carries the "GATE: " selector, so grep exits 1 and selected is [].
  // A cure keyed on a bare `rowsWithId === 0` reds here.
  const backlog = ['## ledger', '- 🟡 **F-9002-1 — genuinely open.** No gate word on this row.'].join('\n');
  const result = run(fixture(t, backlog));
  assert.match(result.stdout, /panel rows        : 0/);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /PASS/);
});

test('REVERSE CONTROL — a panel row naming no F-ID is lawful while another row carries one', (t) => {
  // The guard's own header: "it cannot see a stale row whose text names no
  // F-ID". Live board s2335: 33 rows, 32 with an id. A ratio-based or
  // any-unreadable-row cure reds here.
  const backlog = [
    '## ledger',
    '- ⚠️ **F-9004-1 — real finding.** GATE: author the corrective.',
    '- 🔺 OPTIONS (owner call, one word): (a) hold the anchor GATE: pending a word.',
  ].join('\n');
  const result = run(fixture(t, backlog));
  assert.match(result.stdout, /panel rows        : 2/);
  assert.match(result.stdout, /rows with an F-ID : 1/);
  assert.equal(result.status, 0, result.stdout + result.stderr);
});

test('REVERSE CONTROL — --report stays advisory even on the unclassifiable board', (t) => {
  // An advisory reader must never block a drain by this guard's own blindness.
  const result = run(fixture(t, CLOSED_ON_PANEL, narrowed()), '--report');
  assert.equal(result.status, 0, result.stdout + result.stderr);
});

test('the live root is unaffected — the cure is behaviour-neutral where it matters', () => {
  const result = run(ROOT);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /blocker-panel-closed-guard: PASS/);
});

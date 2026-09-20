import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { scan } from './findings-state-guard.mjs';

const SCRIPT = path.join(import.meta.dirname, 'blocker-panel-closed-guard.mjs');
const ROOT = path.resolve(import.meta.dirname, '..');
const PANEL = path.join(ROOT, 'scripts', 'dashboard-gen.sh');

// The fixture carries the REAL dashboard-gen.sh: the guard's whole point is that
// it executes the panel's own rule, so a hand-written stub would test nothing.
function fixture(t, backlog, panel = fs.readFileSync(PANEL, 'utf8')) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gold-rush-blocker-panel-'));
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

function offenders(output) {
  return [...output.matchAll(/^(F-\d+-\d+)\s+closed at BACKLOG:/gm)].map((match) => match[1]);
}

// REAL HISTORY. The live panel selects 2844a908's e3-fairground row, whose displayed
// subject zone names F-1534-2, and F-1534-2's closure is subject-led by F-1534-2
// itself at BACKLOG:11. The live root has no such pairing and must stay green.
test('reds on a real ledger with a subject-led closed finding on the panel, greens on the live root', (t) => {
  const before = execFileSync('git', ['show', '2844a9083e8fbfcf96c4981ccee02a53461ec66c:tasks/BACKLOG.md'], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  const historical = run(fixture(t, before));
  assert.equal(historical.status, 1, historical.stdout + historical.stderr);
  assert.deepEqual(offenders(historical.stdout), ['F-1534-2']);

  const current = run(ROOT);
  assert.equal(current.status, 0, current.stdout + current.stderr);
  assert.deepEqual(offenders(current.stdout), []);
});

test('a cited id does not borrow the subject id closure on the old real ledger', (t) => {
  // F-1030-2 is only the second id on the closure row led by F-1040-1, so
  // F-2228-1 must keep it out of the offender list.
  const backlog = execFileSync('git', ['show', '87649873:tasks/BACKLOG.md'], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  const result = run(fixture(t, backlog));
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.deepEqual(offenders(result.stdout), []);
});

test('a closure APPENDED below the panel row does not clear the panel — which is the whole defect', (t) => {
  const backlog = [
    '## ledger',
    '- ⚠️ **F-9001-1 — the thing is broken.** GATE: someone must author the corrective.',
    '',
    '- ✅ **F-9001-1 UPDATE (s900 drain — shipped and re-verified).** It was fixed here.',
  ].join('\n');
  const result = run(fixture(t, backlog));
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.deepEqual(offenders(result.stdout), ['F-9001-1']);
});

test('striking the ORIGINAL line clears the panel — the fix the guard prescribes actually works', (t) => {
  const backlog = [
    '## ledger',
    '- ~~⚠️ **F-9001-1 — the thing is broken.** GATE: someone must author the corrective.~~ (struck s901)',
    '',
    '- ✅ **F-9001-1 UPDATE (s900 drain — shipped and re-verified).** It was fixed here.',
  ].join('\n');
  const result = run(fixture(t, backlog));
  assert.equal(result.status, 0, result.stdout + result.stderr);
});

test('an open finding on the panel is left alone', (t) => {
  const backlog = [
    '## ledger',
    '- 🟡 **F-9002-1 — genuinely open.** GATE: author after the spec lands.',
  ].join('\n');
  const result = run(fixture(t, backlog));
  assert.equal(result.status, 0, result.stdout + result.stderr);
});

test('REFUSES rather than passes when the panel moves out from under it', (t) => {
  const panel = fs.readFileSync(PANEL, 'utf8').split('\n')
    .filter((line) => !(line.startsWith('done < <(') && line.includes('GATE:')))
    .join('\n');
  const backlog = '- ⚠️ **F-9001-1 — broken.** GATE: author it.\n- ✅ **F-9001-1 — fixed.**\n';
  const result = run(fixture(t, backlog, panel));
  assert.equal(result.status, 2, result.stdout + result.stderr);
  assert.match(result.stderr, /REFUSING/);
});

// The census every fire reports (151/125/26 at s1291) is denominated in the
// narrow vocabulary. Widening it is a triage decision, not a drive-by: this
// asserts the opt-in stayed opt-in.
test('the wide closure vocabulary is opt-in and does not leak into the default census', () => {
  const backlog = '- ✅ **F-9003-1 — closed by a bullet-led row.** It shipped.\n';
  assert.equal(scan(backlog).size, 0, 'narrow must not count a bullet-led closure');
  const wide = scan(backlog, { closedVocabulary: 'wide' });
  assert.deepEqual(wide.get('F-9003-1')?.closed, [1]);
  assert.deepEqual(wide.get('F-9003-1')?.open, []);
});

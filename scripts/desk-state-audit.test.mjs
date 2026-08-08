import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { scan } from './findings-state-guard.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const AUDITOR = path.join(HERE, 'desk-state-audit.mjs');
const STATUS = (items) => `Last updated: s1 handoff, lock CLEARED — OWNER'S DESK — ${items.map((item) => `🔺 **${item}**`).join(' ')}`;

function fixture(t, items, backlog = '', goals = { goals: [] }) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'desk-state-audit-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.writeFileSync(path.join(dir, 'STATUS.md'), STATUS(items));
  fs.writeFileSync(path.join(dir, 'BACKLOG.md'), backlog);
  fs.writeFileSync(path.join(dir, 'goals.json'), JSON.stringify(goals));
  return dir;
}

function run(dir, ...flags) {
  return spawnSync(process.execPath, [AUDITOR,
    '--status', path.join(dir, 'STATUS.md'),
    '--backlog', path.join(dir, 'BACKLOG.md'),
    '--goals', path.join(dir, 'goals.json'), '--json', ...flags], { encoding: 'utf8' });
}

function item(result, id) {
  return JSON.parse(result.stdout).items.find((entry) => entry.id === id);
}

test('subject-led closure is CLOSED and strict exits 1', (t) => {
  const dir = fixture(t, ['F-1544-1'], '- ✅ **F-1544-1 CLOSED — shipped.**');
  const normal = run(dir);
  assert.equal(normal.status, 0, normal.stderr);
  assert.deepEqual(item(normal, 'F-1544-1').evidence, [1]);
  assert.equal(item(normal, 'F-1544-1').verdict, 'CLOSED');
  assert.equal(run(dir, '--strict').status, 1);
});

test('incidental citation in another closed subject is not CLOSED', (t) => {
  const dir = fixture(t, ['F-1541-2'], '- ✅ **F-1542-1 CLOSED — fixes F-1541-2 completely.**');
  const result = run(dir, '--strict');
  assert.equal(result.status, 0, result.stderr);
  assert.notEqual(item(result, 'F-1541-2').verdict, 'CLOSED');
  assert.equal(item(result, 'F-1541-2').verdict, 'UNRECORDED');
});

test('a subject-led triangle row is OPEN-DESK-ONLY', (t) => {
  const dir = fixture(t, ['F-BAL-1'], '🔺 **F-BAL-1 — owner decision needed.**');
  const result = run(dir);
  assert.equal(item(result, 'F-BAL-1').verdict, 'OPEN-DESK-ONLY');
  assert.deepEqual(item(result, 'F-BAL-1').evidence, [1]);
});

test('all required finding shapes are desk items and alpha closures use scan', (t) => {
  const ids = ['F-1544-1', 'F-BAL-1', 'F-E2S-3', 'F-MILK-SS-3'];
  const backlog = ids.map((id) => `- ✅ **${id} CLOSED — shipped.**`).join('\n');
  const result = run(fixture(t, ids, backlog));
  for (const id of ids) assert.equal(item(result, id).verdict, 'CLOSED', id);
});

test('an absent finding is UNRECORDED', (t) => {
  const result = run(fixture(t, ['F-E2S-3']));
  assert.equal(item(result, 'F-E2S-3').verdict, 'UNRECORDED');
});

test('subject-led open and closed rows classify BOTH', (t) => {
  const backlog = ['- ✅ **F-1252-1 CLOSED — code shipped.**', '🟡 **F-1252-1 — scope fork remains.**'].join('\n');
  const result = run(fixture(t, ['F-1252-1'], backlog));
  assert.equal(item(result, 'F-1252-1').verdict, 'BOTH');
  assert.deepEqual(item(result, 'F-1252-1').evidence, [1, 2]);
});

test('ACTIVE line 1 skips with exit 0', (t) => {
  const dir = fixture(t, []);
  fs.writeFileSync(path.join(dir, 'STATUS.md'), 'ACTIVE 2026-08-08T00:00Z (s1 fire) — working');
  const result = run(dir);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /^SKIP — line-1 is a lock line, no desk to audit/);
});

test('goal slugs resolve merged and blocked states', (t) => {
  const goals = { goals: [{ tasks: [
    { id: 'rf-34-hero-y-restore-roundtrip', status: 'merged' },
    { id: 'e3-fairground-socket', status: 'blocked', blockClass: 'owner-fork' },
  ] }] };
  const result = run(fixture(t, ['`rf-34-hero-y-restore-roundtrip`', '`e3-fairground-socket`'], '', goals));
  assert.equal(item(result, 'rf-34-hero-y-restore-roundtrip').verdict, 'CLOSED');
  assert.equal(item(result, 'e3-fairground-socket').verdict, 'OPEN');
  assert.equal(item(result, 'e3-fairground-socket').blockClass, 'owner-fork');
});

test('running the auditor does not mutate the shared scan census', (t) => {
  const backlog = ['🟡 **F-9000-1 — open.**', '- ✅ **F-9000-2 CLOSED.**', '🔺 **F-MILK-SS-3 — desk.**'].join('\n');
  const census = () => {
    const states = scan(backlog, { closedVocabulary: 'wide' });
    return JSON.stringify({
      size: states.size,
      closed: [...states.values()].filter((state) => state.closed.length).length,
      open: [...states.values()].filter((state) => state.open.length).length,
    });
  };
  const before = census();
  assert.equal(run(fixture(t, ['F-MILK-SS-3'], backlog)).status, 0);
  assert.equal(census(), before);
});

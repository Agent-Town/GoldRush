/**
 * desk-declaration-guard.test.mjs — F-1334-2's guard, proven by MANUFACTURING the
 * violation rather than by observing a green.
 *
 * A passing guard never executes its violation path, so its PASS says nothing
 * about its FAIL (the s1299/s1300/s1301 standard). Every assertion below that
 * matters drives the guard to a specific exit code on a fixture built for it.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GUARD = path.join(HERE, 'desk-declaration-guard.mjs');
const REPO = path.resolve(HERE, '..');

function fixture(statusText, backlogText) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'desk-guard-'));
  fs.writeFileSync(path.join(dir, 'STATUS.md'), statusText);
  fs.mkdirSync(path.join(dir, 'tasks'));
  fs.writeFileSync(path.join(dir, 'tasks', 'BACKLOG.md'), backlogText);
  return dir;
}

function run(dir, ...extra) {
  return spawnSync(process.execPath, [GUARD, '--root', dir, ...extra], { encoding: 'utf8' });
}

const DESK = (ids) =>
  'Last updated: s1 handoff — work happened. 🔺 **OWNER DESK — one new.** ' +
  ids.map((i) => `🔺 **${i}**`).join(' · ') +
  '\n- **s0 handoff (line-1 archive):** older text\n';

test('a desk item WITH a declaring row passes', () => {
  const dir = fixture(DESK(['F-9001-1']), '- 🟡 **F-9001-1 (s1, MEASURED — a thing).** details\n');
  const r = run(dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /PASS/);
});

test('MANUFACTURED: a desk item with NO row anywhere exits 1 and names the id', () => {
  const dir = fixture(DESK(['F-9002-1']), '- 🟡 **F-8888-1 (s1) — unrelated.** details\n');
  const r = run(dir);
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stderr, /F-9002-1/);
});

test('MANUFACTURED: the F-1328-3 shape — MENTIONED inside another finding row is NOT declared', () => {
  // The id appears, and appears EARLY, but the row belongs to a different finding.
  const dir = fixture(
    DESK(['F-9003-1']),
    '- 🟡 **F-9003-9 (s2, THIRD SIGHTING — F-9003-1 REPRODUCES EXACTLY).** details\n',
  );
  const r = run(dir);
  assert.equal(r.status, 1, 'a mention must not satisfy the guard');
  assert.match(r.stderr, /F-9003-1/);
});

test('a row whose id sits past the 90-char subject zone does NOT declare it', () => {
  const pad = '✅ **SHIPPED s1 at `deadbeef` — ' + 'x'.repeat(120) + '** ';
  const dir = fixture(DESK(['F-9004-1']), '- ' + pad + '**F-9004-1** details\n');
  assert.equal(run(dir).status, 1);
});

test('the leading GLYPH is irrelevant — F-1334-1 refuted marker equality', () => {
  // Same row, four different markers: all four must PASS. This guard is silent
  // about glyphs by design; a 🟡 row must not be flagged merely for not being 🔺.
  for (const glyph of ['🟡', '🔺', '🔴', '✅']) {
    const dir = fixture(DESK(['F-9005-1']), `- ${glyph} **F-9005-1 (s1) — a thing.** details\n`);
    assert.equal(run(dir).status, 0, `glyph ${glyph} should not affect the verdict`);
  }
});

test('the markdown list bullet is stripped: bulleted and unbulleted rows read alike', () => {
  for (const prefix of ['- ', '']) {
    const dir = fixture(DESK(['F-9006-1']), `${prefix}🟡 **F-9006-1 (s1) — a thing.** details\n`);
    assert.equal(run(dir).status, 0, `prefix "${prefix}" should declare`);
  }
});

test('REFUSES (exit 2) rather than greening when there is no OWNER DESK segment', () => {
  const dir = fixture('Last updated: s1 handoff — no desk here.\n', '- 🟡 **F-1-1** x\n');
  const r = run(dir);
  assert.equal(r.status, 2, 'an unread subject must refuse, never PASS');
  assert.match(r.stderr, /REFUSING/);
});

test('REFUSES (exit 2) when the desk segment holds zero F-IDs', () => {
  const dir = fixture('s1 handoff 🔺 **OWNER DESK — nothing today.**\n', '- 🟡 **F-1-1** x\n');
  const r = run(dir);
  assert.equal(r.status, 2);
  assert.match(r.stderr, /zero F-IDs/);
});

test('REFUSES (exit 2) when BACKLOG.md is missing', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'desk-guard-'));
  fs.writeFileSync(path.join(dir, 'STATUS.md'), DESK(['F-1-1']));
  assert.equal(run(dir).status, 2);
});

test('the entrypoint actually RUNS — a space in the repo path must not no-op it', () => {
  // s1334: the first draft compared import.meta.url to `file://${process.argv[1]}`.
  // This repo lives under ".../Claude/Projects/Gold Rush"; import.meta.url encodes
  // that space as %20 and argv[1] does not, so main() never ran and the guard
  // EXITED 0 having read nothing. Reproduce the hazard explicitly.
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'desk guard with spaces-'));
  fs.writeFileSync(path.join(dir, 'STATUS.md'), DESK(['F-9007-1']));
  fs.mkdirSync(path.join(dir, 'tasks'));
  fs.writeFileSync(path.join(dir, 'tasks', 'BACKLOG.md'), '- 🟡 **F-0-0** unrelated\n');
  const r = run(dir);
  assert.notEqual(r.status, 0, 'guard must not silently pass');
  assert.match(r.stdout + r.stderr, /desk-declaration-guard/, 'guard must produce output');
});

test('the live board is green under this guard (baseline is honest)', () => {
  const r = run(REPO);
  assert.equal(r.status, 0, r.stdout + r.stderr);
});

test('every grandfathered id is still on the desk — the list must not rot', () => {
  // A grandfathered id that has left the desk is dead weight that hides nothing;
  // worse, it would silently absolve a future re-listing of the same finding.
  const src = fs.readFileSync(GUARD, 'utf8');
  const listed = [...src.matchAll(/^\s*'(F-\d{3,4}-\d+)',/gm)].map((m) => m[1]);
  assert.ok(listed.length >= 9, 'expected the measured s1334 baseline');
  const status = fs.readFileSync(path.join(REPO, 'STATUS.md'), 'utf8');
  const deskLine = status.split('\n').find((l) => l.includes('OWNER DESK'));
  const onDesk = new Set(deskLine.slice(deskLine.indexOf('OWNER DESK')).match(/F-\d{3,4}-\d+/g) || []);
  const stale = listed.filter((id) => !onDesk.has(id));
  assert.deepEqual(stale, [], `grandfathered ids no longer on the desk: ${stale.join(', ')}`);
});

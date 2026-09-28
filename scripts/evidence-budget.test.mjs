// THE EVIDENCE BUDGET: the shape of the banked file, and the two comparisons that use it.
//
// The awkward part of this guard is that on THIS branch the ceiling is deliberately unbanked - the
// attended drain banks it after the first offload - so a lazy test would assert nothing and pass
// forever. Both halves are therefore pinned:
//   the LIVE tree  : the baseline's SHAPE, and the total REPORTED (printed, so the drain can read the
//                    number it is about to bank), with the unbanked state required to state WHO banks it.
//   FIXTURES       : the comparator itself, over a banked ceiling, in both directions. Without these
//                    the unbanked live state could hide a comparator that never reds - which is
//                    F-2487-1 exactly: a cure validated only in the state that cannot exercise it.

import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { BASELINE_PATH, DEFAULT_LIMIT_BYTES, EVIDENCE_PREFIXES, measureLanding, measureTotal, readBaseline } from './evidence-budget.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPT = join(ROOT, 'scripts/evidence-budget.mjs');
const BOUND = { encoding: 'utf8', timeout: 240_000, killSignal: 'SIGKILL' };

const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const run = (root, ...args) => spawnSync(process.execPath, [SCRIPT, '--root', root, ...args], BOUND);

// ─── THE BANKED FILE'S SHAPE ───────────────────────────────────────────────────────────────────

test('the baseline file exists, parses, and carries every field the tool reads', () => {
  const raw = JSON.parse(readFileSync(join(ROOT, BASELINE_PATH), 'utf8'));
  assert.ok(typeof raw.note === 'string' && raw.note.length > 40, 'the file says what it is for');
  assert.ok(Number.isInteger(raw.perLandingLimitBytes) && raw.perLandingLimitBytes > 0);
  assert.ok(Array.isArray(raw.prefixes) && raw.prefixes.length > 0);
  assert.deepEqual(raw.prefixes, EVIDENCE_PREFIXES, 'the prefixes in the file and in the tool are one list');
  assert.ok(raw.totalArtifacts && typeof raw.totalArtifacts === 'object');
  for (const key of ['ceilingBytes', 'bankedBytes', 'bankedFiles', 'commit', 'measuredAt', 'setBy']) {
    assert.ok(key in raw.totalArtifacts, `totalArtifacts.${key} is missing`);
  }
});

test('the per-landing ceiling is the owner ruling 14a default until someone rules otherwise', () => {
  assert.equal(readBaseline(ROOT).perLandingLimitBytes, DEFAULT_LIMIT_BYTES);
});

test('the tree total is REPORTED, and the unbanked state names who banks it', () => {
  const baseline = readBaseline(ROOT);
  const total = measureTotal(ROOT);
  assert.ok(total.files > 0 && total.bytes > 0, 'a zero total is a failed read, never an answer');
  // Printed, not merely asserted: this is the number the drain writes into the baseline, and a guard
  // that knows it but does not say it makes the drain re-derive it by hand.
  console.log(`      tracked under artifacts/: ${total.files} file(s) ${(total.bytes / 1e6).toFixed(1)} MB`
    + ` · ceiling ${Number.isInteger(baseline.totalArtifacts.ceilingBytes) ? `${(baseline.totalArtifacts.ceilingBytes / 1e6).toFixed(1)} MB` : 'NOT BANKED YET'}`);
  if (Number.isInteger(baseline.totalArtifacts.ceilingBytes)) {
    assert.ok(total.bytes <= baseline.totalArtifacts.ceilingBytes,
      `the tracked evidence tree is ${(total.bytes / 1e6).toFixed(1)} MB against a banked ceiling of `
      + `${(baseline.totalArtifacts.ceilingBytes / 1e6).toFixed(1)} MB. Run node scripts/evidence-offload.mjs --plan.`);
    assert.ok(Number.isInteger(baseline.totalArtifacts.bankedBytes) && /^[0-9a-f]{40}$/.test(baseline.totalArtifacts.commit ?? ''),
      'a banked ceiling must name the measurement and the commit it was measured on');
  } else {
    assert.match(String(baseline.totalArtifacts.setBy), /drain/i,
      'an unbanked ceiling must say WHO banks it and WHEN, or it is a TODO nobody owns');
    assert.equal(run(ROOT, '--total').status, 0, 'and it must not refuse a drain while unbanked');
  }
});

test('--total on the live tree prints the number and passes while unbanked', () => {
  const result = run(ROOT, '--total');
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /total\s+: \d+ file\(s\) [\d.]+ MB tracked under artifacts\//);
  assert.match(result.stdout, /ceiling\s+: (NOT BANKED YET|[\d.]+ MB)/);
});

// ─── THE COMPARATOR, ON FIXTURES, IN BOTH DIRECTIONS ───────────────────────────────────────────

/** A repo with two commits: a base, then a landing that adds the evidence bytes a case asks for. */
function landing(t, { adds = {}, deletes = [], baseline = null } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'evidence-budget-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const write = (file, body) => {
    mkdirSync(join(root, dirname(file)), { recursive: true });
    writeFileSync(join(root, file), body);
  };
  write('artifacts/seed/old.png', 'x'.repeat(1000));
  write('reviews/shots-seed/old.png', 'y'.repeat(1000));
  write('src/main.ts', 'export const x = 1;\n');
  if (baseline) write('scripts/fixture-baseline.json', `${JSON.stringify(baseline, null, 1)}\n`);
  git(root, 'init', '-q', '-b', 'main');
  git(root, 'config', 'user.email', 'fixture@example.com');
  git(root, 'config', 'user.name', 'fixture');
  git(root, 'add', '-A');
  git(root, 'commit', '-qm', 'base');
  const base = git(root, 'rev-parse', 'HEAD').trim();
  for (const [file, body] of Object.entries(adds)) write(file, body);
  for (const file of deletes) git(root, 'rm', '-q', '--', file);
  git(root, 'add', '-A');
  // `--allow-empty`: several cases want a REPO with a baseline and no landing at all (the --total
  // arms), and a fixture that refuses to build for lack of a diff would fail for the wrong reason.
  git(root, 'commit', '-q', '--allow-empty', '-m', 'the landing');
  return { root, base, tip: git(root, 'rev-parse', 'HEAD').trim() };
}

test('a landing inside the ceiling passes; one byte over it reds', (t) => {
  const under = landing(t, { adds: { 'artifacts/new/shot.png': 'z'.repeat(900) } });
  assert.equal(run(under.root, under.base, under.tip, '--limit', '1000').status, 0);
  const over = landing(t, { adds: { 'artifacts/new/shot.png': 'z'.repeat(1001) } });
  const red = run(over.root, over.base, over.tip, '--limit', '1000');
  assert.equal(red.status, 1);
  assert.match(red.stdout, /OVER BUDGET/);
  assert.match(red.stdout, /evidence-offload\.mjs --plan/, 'the refusal says what to do about it');
});

test('a path outside the evidence prefixes is not counted at all', (t) => {
  const { root, base, tip } = landing(t, { adds: { 'src/huge.ts': 'q'.repeat(100_000) } });
  const result = run(root, base, tip, '--limit', '1000', '--json');
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.equal(JSON.parse(result.stdout).added, 0);
});

test('`reviews/shots-*` counts and the rest of reviews/ does not', (t) => {
  const { root, base, tip } = landing(t, {
    adds: { 'reviews/shots-new/a.png': 'p'.repeat(600), 'reviews/slice-01.md': 'm'.repeat(50_000) },
  });
  assert.equal(JSON.parse(run(root, base, tip, '--json').stdout).added, 600);
});

test('a deletion is reported but never credited against the ceiling', (t) => {
  const { root, base, tip } = landing(t, {
    adds: { 'artifacts/new/shot.png': 'z'.repeat(900) },
    deletes: ['artifacts/seed/old.png'],
  });
  const board = JSON.parse(run(root, base, tip, '--json').stdout);
  assert.equal(board.added, 900);
  assert.equal(board.removed, 1000);
  assert.equal(board.net, -100);
  assert.equal(run(root, base, tip, '--limit', '800').status, 1,
    'deleting a kilobyte must not buy room for a kilobyte of new screenshots');
});

test('growth of a MODIFIED evidence file counts, and shrinkage does not go negative', (t) => {
  const grew = landing(t, { adds: { 'artifacts/seed/old.png': 'x'.repeat(1700) } });
  assert.equal(JSON.parse(run(grew.root, grew.base, grew.tip, '--json').stdout).added, 700);
  const shrank = landing(t, { adds: { 'artifacts/seed/old.png': 'x'.repeat(400) } });
  const board = JSON.parse(run(shrank.root, shrank.base, shrank.tip, '--json').stdout);
  assert.equal(board.added, 0);
  assert.equal(board.removed, 600);
});

test('a banked tree ceiling reds when the tree is over it, and passes when it is under', (t) => {
  const bank = (ceilingBytes) => ({
    note: 'fixture baseline for the comparator arm of scripts/evidence-budget.test.mjs',
    perLandingLimitBytes: 40_000_000,
    prefixes: EVIDENCE_PREFIXES,
    totalArtifacts: { ceilingBytes, bankedBytes: ceilingBytes, bankedFiles: 1, commit: 'c'.repeat(40), measuredAt: '2026-09-25', setBy: 'the fixture' },
  });
  const tight = landing(t, { baseline: bank(10) });
  const red = run(tight.root, '--total', '--baseline', 'scripts/fixture-baseline.json');
  assert.equal(red.status, 1, red.stdout + red.stderr);
  assert.match(red.stdout, /OVER BUDGET/);
  const loose = landing(t, { baseline: bank(10_000_000) });
  const green = run(loose.root, '--total', '--baseline', 'scripts/fixture-baseline.json');
  assert.equal(green.status, 0, green.stdout + green.stderr);
  assert.match(green.stdout, /PASS — /);
});

test('an unbanked ceiling is advisory: it reports and never refuses', (t) => {
  const { root } = landing(t, {
    baseline: {
      note: 'fixture', perLandingLimitBytes: 40_000_000, prefixes: EVIDENCE_PREFIXES,
      totalArtifacts: { ceilingBytes: null, bankedBytes: null, bankedFiles: null, commit: null, measuredAt: null, setBy: 'the drain' },
    },
  });
  const result = run(root, '--total', '--baseline', 'scripts/fixture-baseline.json');
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /NOT BANKED YET/);
  assert.match(result.stdout, /PASS \(advisory\)/);
});

test('a missing or malformed baseline falls back to the declared defaults rather than crashing', (t) => {
  const { root, base, tip } = landing(t);
  const missing = readBaseline(root, 'scripts/no-such-baseline.json');
  assert.equal(missing.perLandingLimitBytes, DEFAULT_LIMIT_BYTES);
  assert.equal(missing.totalArtifacts.ceilingBytes, null);
  mkdirSync(join(root, 'scripts'), { recursive: true });
  writeFileSync(join(root, 'scripts/broken.json'), '{ not json');
  assert.equal(readBaseline(root, 'scripts/broken.json').perLandingLimitBytes, DEFAULT_LIMIT_BYTES);
  assert.equal(run(root, base, tip, '--baseline', 'scripts/broken.json').status, 0);
});

test('a bad range or a bad limit exits 2, never 1: "could not measure" is not "refused"', (t) => {
  const { root, base } = landing(t);
  assert.equal(run(root, base, 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeef').status, 2);
  assert.equal(run(root, '--limit', 'lots', base, 'HEAD').status, 2);
});

test('measureLanding and measureTotal are usable without the CLI, so a drain can script them', (t) => {
  const { root, base, tip } = landing(t, { adds: { 'artifacts/new/shot.png': 'z'.repeat(2500) } });
  assert.equal(measureLanding(root, base, tip).added, 2500);
  const total = measureTotal(root);
  // `artifacts/` alone: the seeded `reviews/shots-seed/old.png` is a LANDING quantity, not part of
  // the tree total the offload banks a ceiling for.
  assert.equal(total.files, 2, 'the seeded artifacts path plus the new one');
  assert.equal(total.bytes, 1000 + 2500);
});

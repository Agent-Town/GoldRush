// GUARD FOR THE NULL-FLOOR COMPARISON'S CLASSIFICATION BY KIND (F-2589-1, s2589).
//
// The subject separates three things `--check` used to add together: a floor that MOVED (rc=1, the
// real gameplay alarm), an artifact that is NOT COMPARABLE at all (rc=2), and a pin that is merely
// OLDER than the tree (rc=0, declared and never counted). On main the third is GUARANTEED — the
// commit landing a regenerated pin invalidates that pin's own stamp — so before the cure the check
// could never exit 0 there, measured 58 of 58 across the artifact's history.
//
// THE ARM THAT MATTERS MOST IS THE REVERSE CONTROL: the obvious over-general cure is "stop counting
// metadata", and it silences a REAL floor movement — a gameplay-determinism regression — while
// every arm about eraStamp stays green. Arms 3/4/5 exist so that cure cannot pass.
//
// Every arm runs END-TO-END through the CLI's `--compare` mode as well as through the pure
// classifier, because extracting a decision relocates the blind spot to the CALL SITE (F-2209-1),
// and because in the mode people actually run, STDOUT is the interface (F-2210-1).

import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { classifyNullFloors, exitCodeFor, reportNullFloors } from './null-floor-compare.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CLI = path.join(ROOT, 'scripts/null-floor-anchors.mjs');

const PAIR = { secured: false, waves: 3, timeMs: 91600, gold: 120, kills: 41, eventLogHash: 'fnv1a32:01e5173c' };

function artifact(over = {}) {
  return {
    schema: 'goldrush.nullfloor.v1',
    eraStamp: 'aaaaaaaaa',
    policy: 'idle',
    floors: { 'e1-twin-banks': { '01': { ...PAIR } }, 'e2-incline': { '01': { ...PAIR } } },
    ...over,
  };
}

// Runs the real CLI against two artifacts on disk. No sim, no git — the decision only.
function runCli(pinned, derived) {
  const dir = mkdtempSync(path.join(tmpdir(), 'nf-compare-'));
  try {
    const a = path.join(dir, 'pinned.json');
    const b = path.join(dir, 'derived.json');
    writeFileSync(a, JSON.stringify(pinned, null, 2));
    writeFileSync(b, JSON.stringify(derived, null, 2));
    const r = spawnSync(process.execPath, [CLI, '--compare', a, b], {
      cwd: ROOT, encoding: 'utf8', timeout: 240_000, killSignal: 'SIGKILL',
    });
    // A control whose failure mode is silence cannot be told from the silence it measures
    // (F-2215-1): assert the arm actually RAN before reading what it says.
    assert.equal(r.error, undefined, 'the CLI must run');
    assert.ok(r.status !== null, 'the CLI must exit rather than time out');
    return r;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function rendered(result) {
  let out = '';
  let err = '';
  reportNullFloors(result, { label: 'fixture', out: (t) => { out += t; }, err: (t) => { err += t; } });
  return { out, err };
}

test('1. a pin older than the tree is a MATCH: rc 0, and eraStamp is not counted as a floor difference', () => {
  const result = classifyNullFloors(artifact(), artifact({ eraStamp: 'bbbbbbbbb' }));
  assert.equal(result.verdict, 'match');
  assert.equal(result.floorDrift, 0, 'a provenance difference is NOT a floor difference');
  assert.equal(exitCodeFor(result), 0);

  const r = runCli(artifact(), artifact({ eraStamp: 'bbbbbbbbb' }));
  assert.equal(r.status, 0, 'the CLI must exit 0 — this is the state main is structurally always in');
});

test('2. the MATCH verdict names the matched count on STDOUT, where the caller reads it', () => {
  const r = runCli(artifact(), artifact({ eraStamp: 'bbbbbbbbb' }));
  assert.match(r.stdout, /2 of 2 null floors match/, 'the fact that every floor held must be readable');
  assert.match(r.stdout, /PROVENANCE ONLY, not a floor difference/);
  assert.doesNotMatch(r.stdout, /null-floor difference/, 'a match must not use the alarm wording');
});

test('3. REVERSE CONTROL — a real floor movement still REDS at rc 1', () => {
  const moved = artifact();
  moved.floors['e1-twin-banks']['01'].waves = 4;
  const result = classifyNullFloors(artifact(), moved);
  assert.equal(result.verdict, 'floors-moved');
  assert.equal(result.floorDrift, 1);
  assert.equal(exitCodeFor(result), 1);

  const r = runCli(artifact(), moved);
  assert.equal(r.status, 1, 'silencing a determinism regression is the destructive direction');
  assert.match(r.stderr, /waves: pinned="?3"? derived="?4"?/);
  assert.match(r.stderr, /1 null-floor difference found/);
});

test('4. REVERSE CONTROL — a floor movement reds EVEN WHEN the stamp agrees', () => {
  // Without this arm, an over-general cure could key "is this real?" on the stamp instead of on
  // the floors and still pass arm 3.
  const moved = artifact();
  moved.floors['e2-incline']['01'].eventLogHash = 'fnv1a32:deadbeef';
  const r = runCli(artifact(), moved);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /1 of 2 null floors match/, 'the partial match must still be stated');
});

test('5. REVERSE CONTROL — an added or dropped contract/seed pair is still a floor difference', () => {
  const dropped = artifact();
  delete dropped.floors['e2-incline'];
  const result = classifyNullFloors(artifact(), dropped);
  assert.equal(result.verdict, 'floors-moved');
  assert.equal(exitCodeFor(result), 1);
  assert.equal(runCli(artifact(), dropped).status, 1);
});

test('6. schema or policy mismatch REFUSES at rc 2 — "could not answer", never a floor verdict', () => {
  for (const field of ['schema', 'policy']) {
    const result = classifyNullFloors(artifact(), artifact({ [field]: 'something-else' }));
    assert.equal(result.verdict, 'not-comparable', `${field} must make the pin incomparable`);
    assert.equal(exitCodeFor(result), 2, `${field}: 2 = could not answer, distinct from 1 = it refuses`);
    const r = runCli(artifact(), artifact({ [field]: 'something-else' }));
    assert.equal(r.status, 2);
  }
});

test('7. the refusal reaches STDOUT as well as stderr (F-2211-1)', () => {
  const r = runCli(artifact(), artifact({ policy: 'harvest' }));
  assert.match(r.stdout, /NOT COMPARABLE/, 'a caller classifying stdout reads an empty string as silence');
  assert.match(r.stderr, /policy: pinned="idle" derived="harvest"/);
});

test('8. a NOT-COMPARABLE artifact must not be reported with a floor count', () => {
  const moved = artifact({ schema: 'goldrush.nullfloor.v2' });
  moved.floors['e1-twin-banks']['01'].waves = 9;
  const { out, err } = rendered(classifyNullFloors(artifact(), moved));
  assert.doesNotMatch(out, /null floors match/, 'no floor verdict was reached, so none may be stated');
  assert.doesNotMatch(err, /null-floor difference/);
});

test('9. the provenance line prints on the HAPPY path too (F-2208-1)', () => {
  const { out } = rendered(classifyNullFloors(artifact(), artifact()));
  assert.match(out, /eraStamp: pinned and tree agree at "aaaaaaaaa"/,
    'a declaration that appears only on failure re-creates the ambiguity it removes');
});

test('10. eraStamp is PROVENANCE and schema/policy are COMPARABILITY — the split is the cure', async () => {
  const mod = await import('./null-floor-compare.mjs');
  assert.deepEqual(mod.PROVENANCE_FIELDS, ['eraStamp']);
  assert.deepEqual(mod.COMPARABILITY_FIELDS, ['schema', 'policy']);
  assert.ok(!mod.COMPARABILITY_FIELDS.includes('eraStamp'),
    'putting eraStamp back among the comparability fields restores the unsatisfiable check');
});

test('11. --compare refuses a malformed invocation rather than guessing', () => {
  const r = spawnSync(process.execPath, [CLI, '--compare', 'only-one-path.json'], {
    cwd: ROOT, encoding: 'utf8', timeout: 240_000, killSignal: 'SIGKILL',
  });
  assert.notEqual(r.status, 0, 'a wrong argument count must not fall through to the sim');
  assert.match(r.stderr, /Usage:/);
});

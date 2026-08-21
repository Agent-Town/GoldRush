import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('./battery-manifest.mjs', import.meta.url));

function fixture(t, name, contents) {
  const dir = mkdtempSync(join(tmpdir(), 'battery-manifest-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const logPath = join(dir, `${name}.log`);
  const jsonPath = join(dir, `${name}.json`);
  writeFileSync(logPath, contents);
  const parsed = spawnSync(process.execPath, [script, '--from-log', logPath], { encoding: 'utf8' });
  assert.equal(parsed.status, 0, parsed.stderr);
  writeFileSync(jsonPath, parsed.stdout);
  return jsonPath;
}

function log(rows, totals) {
  return `${rows.join('\n')}\nℹ tests ${totals.tests}\nℹ suites ${totals.suites ?? 0}\nℹ pass ${totals.pass}\nℹ fail ${totals.fail ?? 0}\nℹ cancelled ${totals.cancelled ?? 0}\nℹ skipped ${totals.skipped ?? 0}\n`;
}

function compare(a, b) {
  const result = spawnSync(process.execPath, [script, '--diff', a, b], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
}

test('two named additions account for a two-test tally delta', (t) => {
  const before = fixture(t, 'before', log(['# file: scripts/a.test.mjs', '✔ stays (1ms)'], { tests: 1, pass: 1 }));
  const after = fixture(t, 'after', log([
    '# file: scripts/a.test.mjs', '✔ stays (1ms)', '✔ first addition (1ms)',
    '# file: scripts/b.test.mjs', '✔ second addition (1ms)',
  ], { tests: 3, pass: 3 }));
  const output = compare(before, after);
  assert.match(output, /ADDED\n  scripts\/a\.test\.mjs :: first addition\n  scripts\/b\.test\.mjs :: second addition/);
  assert.match(output, /RESIDUE: accounted for \(totals\.tests delta \+2; named delta \+2\)/);
});

test('identical manifests have an empty diff', (t) => {
  const manifest = fixture(t, 'same', log(['# file: scripts/a.test.mjs', '✔ stays (1ms)'], { tests: 1, pass: 1 }));
  const output = compare(manifest, manifest);
  assert.match(output, /ADDED\n  \(none\)\nREMOVED\n  \(none\)\nSTATUS-CHANGED\n  \(none\)/);
  assert.match(output, /RESIDUE: accounted for/);
});

test('a file-level collection failure leaves an unaccounted tally residue', (t) => {
  const before = fixture(t, 'collected', log(['# file: scripts/a.test.mjs', '✔ stays (1ms)'], { tests: 1, pass: 1 }));
  const after = fixture(t, 'empty', log([
    '# file: scripts/a.test.mjs', '✔ stays (1ms)', '✖ scripts/empty.test.mjs (1ms)',
  ], { tests: 2, pass: 1, fail: 1 }));
  assert.match(compare(before, after), /RESIDUE: UNACCOUNTED \(totals\.tests delta \+1; named delta \+0; residue \+1\)/);
});

test('a status flip is visible when the tally is unchanged', (t) => {
  const before = fixture(t, 'green', log(['✔ scripts/a.test.mjs :: changes (1ms)'], { tests: 1, pass: 1 }));
  const after = fixture(t, 'red', log(['✖ scripts/a.test.mjs :: changes (1ms)'], { tests: 1, pass: 0, fail: 1 }));
  assert.match(compare(before, after), /STATUS-CHANGED\n  scripts\/a\.test\.mjs :: changes pass -> fail/);
});

test('stdin and --from-log emit the same deterministic manifest', (t) => {
  const contents = log([
    '✔ stdin and --from-log emit the same deterministic manifest (1ms)',
    '﹣ scripts/a.test.mjs :: skipped (1ms) # SKIP',
    '# file: scripts/nested.test.mjs',
    '▶ fixture suite',
    '  ▶ parent test',
    '    ✔ child test (1ms)',
    '  ✔ parent test (2ms)',
    '✔ fixture suite (3ms)',
  ], {
    tests: 4, suites: 1, pass: 3, skipped: 1,
  });
  const fromLog = fixture(t, 'deterministic', contents);
  const stdin = spawnSync(process.execPath, [script], { input: contents, encoding: 'utf8' });
  assert.equal(stdin.status, 0, stdin.stderr);
  assert.equal(stdin.stdout, readFileSync(fromLog, 'utf8'));
  assert.deepEqual(JSON.parse(stdin.stdout).tests, [
    { file: 'scripts/a.test.mjs', name: 'skipped', status: 'skip' },
    { file: 'scripts/battery-manifest.test.mjs', name: 'stdin and --from-log emit the same deterministic manifest', status: 'pass' },
    { file: 'scripts/nested.test.mjs', name: 'child test', status: 'pass' },
    { file: 'scripts/nested.test.mjs', name: 'parent test', status: 'pass' },
  ]);

  const partial = fixture(t, 'partial', log([
    '✔ a distant HARVEST walks before it pays (1ms)',
    '✖ scripts/gr-sim.test.mjs (2ms)',
  ], { tests: 2, pass: 1, fail: 1 }));
  assert.deepEqual(JSON.parse(readFileSync(partial, 'utf8')).tests, [
    { file: 'scripts/gr-sim.test.mjs', name: 'a distant HARVEST walks before it pays', status: 'pass' },
  ]);

  const titles = fixture(t, 'titles', log([
    '✔ scripts/a.test.mjs :: handles issue #123 (1ms)',
    '✔ scripts/a.test.mjs :: literal scripts/foo.test.mjs (1ms)',
    '﹣ scripts/a.test.mjs :: skip #456 remains named (1ms) # SKIP',
  ], { tests: 3, pass: 2, skipped: 1 }));
  assert.deepEqual(JSON.parse(readFileSync(titles, 'utf8')).tests, [
    { file: 'scripts/a.test.mjs', name: 'handles issue #123', status: 'pass' },
    { file: 'scripts/a.test.mjs', name: 'literal scripts/foo.test.mjs', status: 'pass' },
    { file: 'scripts/a.test.mjs', name: 'skip #456 remains named', status: 'skip' },
  ]);

  const unopenedSuite = fixture(t, 'unopened-suite', log([
    '# file: scripts/a.test.mjs',
    '﹣ skipped suite (1ms) # SKIP',
  ], { tests: 0, suites: 1, pass: 0 }));
  assert.deepEqual(JSON.parse(readFileSync(unopenedSuite, 'utf8')).tests, []);
});

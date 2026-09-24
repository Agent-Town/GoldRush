// THE MUST-STAY SET IS A DERIVATION, AND THIS IS ITS CONTROL.
//
// Two populations are asserted here and they answer different questions:
//   1. THE REAL TREE against the hand-measured reader map (`docs/ledger-shape-reader-map-2026-09-24.md`
//      §A4). The map is the CONTROL, never an input: if the scan stops deriving one of its Class 1
//      subtrees, something in the code moved and the offload would take a reader with it.
//   2. HERMETIC FIXTURES for the two bugs this scanner had before it worked, both of which were
//      SILENT: a regex tokeniser desynchronised by an apostrophe in a prose comment (which lost
//      exactly the four §A4 subtrees whose readers sit below one), and a truncation regex that could
//      not cross a newline (which minted a must-stay pattern named `fs.writeFileSync('artifacts`).
//      A scan that loses readers quietly is worse than no scan: it licenses the move.

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';

import {
  FILE_EXACT_SUBTREES, MAP_CLASS1_SUBTREES, codeLiterals, deriveMustStay, literalToPattern,
  mustStayPredicate, normaliseLiteral, patternToRegExp, subtreeRootOf,
} from './evidence-readers.mjs';

const CAMPAIGN = 'artifacts/sol/map-art-campaign-2';

/** A whole small repo, so the derivation is measured on a tree this test built and nothing else. */
function fixture(t, files) {
  const root = mkdtempSync(join(tmpdir(), 'evidence-readers-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const [file, body] of Object.entries(files)) {
    mkdirSync(join(root, dirname(file)), { recursive: true });
    writeFileSync(join(root, file), body);
  }
  const git = (...args) => execFileSync('git', args, { cwd: root, stdio: 'ignore' });
  git('init', '-q');
  git('config', 'user.email', 'fixture@example.com');
  git('config', 'user.name', 'fixture');
  git('add', '-A');
  git('commit', '-qm', 'fixture');
  return root;
}

// ─── THE REAL TREE ─────────────────────────────────────────────────────────────────────────────

const live = deriveMustStay();
const stays = mustStayPredicate(live);

test('every Class 1 subtree the reader map §A4 names is must-stay on the live tree', () => {
  const missing = MAP_CLASS1_SUBTREES.filter((subtree) => !stays(subtree));
  assert.deepEqual(missing, [], `§A4 Class 1 subtrees the scan no longer protects: ${missing.join(', ')}`);
});

test('the campaign is FILE-EXACT: its readers stay, the rest of it moves', () => {
  // The reader map names `run-6/the-claim/capture-config.json`, which no longer exists on the tree.
  // The predicate is a PATTERN, not an expansion, so a map captured tomorrow under any name is
  // covered - which is the only reason this pin can be honest about a path that is absent today.
  assert.equal(stays(`${CAMPAIGN}/run-6/the-claim/capture-config.json`), true);
  assert.equal(stays(`${CAMPAIGN}/run-6/e10-river/capture-config.json`), true);
  assert.equal(stays(`${CAMPAIGN}/run-8/phone-hud/before.json`), true);
  assert.equal(stays(`${CAMPAIGN}/run-8/phone-hud/after.json`), true);
  assert.equal(stays(`${CAMPAIGN}/report.md`), true, 'the drain resolves this file by key with md-3way.cjs');
  assert.equal(stays(`${CAMPAIGN}/run-3/anything.png`), false);
  assert.equal(stays(CAMPAIGN), false, 'promoting the campaign would forfeit 5.8 GB, the whole point of the offload');
  assert.equal(FILE_EXACT_SUBTREES.has(CAMPAIGN), true, 'and that exception is declared BY NAME with a reason');
});

test('run-3 carries no must-stay file at all, so it is movable whole', () => {
  const run3 = live.artifacts.filter((f) => f.startsWith(`${CAMPAIGN}/run-3/`));
  assert.ok(run3.length > 100, `expected a populated run-3, saw ${run3.length} file(s)`);
  assert.deepEqual(run3.filter(stays), []);
});

test('every report.md under artifacts/ stays, wherever it sits', () => {
  const reports = live.artifacts.filter((f) => f.endsWith('/report.md'));
  assert.ok(reports.length > 100, `expected the report corpus, saw ${reports.length}`);
  assert.deepEqual(reports.filter((f) => !stays(f)), []);
});

test('the derivation leaves a movable majority: the offload has to be worth running', () => {
  const movable = live.artifacts.filter((f) => !stays(f));
  assert.ok(movable.length > live.artifacts.length / 2,
    `only ${movable.length} of ${live.artifacts.length} tracked evidence files are movable`);
});

test('no must-stay pattern is a stray fragment of source code', () => {
  const junk = live.patterns.filter((p) => !/^artifacts\/[A-Za-z0-9_.*-]/.test(p.pattern) || /\s/.test(p.pattern));
  assert.deepEqual(junk.map((p) => p.pattern), []);
});

// ─── HERMETIC: THE TWO SILENT BUGS ─────────────────────────────────────────────────────────────

test("a reader below a prose apostrophe is still found (the regex tokeniser lost four subtrees here)", (t) => {
  const root = fixture(t, {
    'scripts/probe.test.mjs': [
      '// A fire\'s own duty: the apostrophe above opened a string for the old scanner and',
      '// the next one closed it, swallowing every literal in between.',
      "import { readFileSync } from 'node:fs';",
      "const tape = JSON.parse(readFileSync('artifacts/kept-tree/winning-tape.json', 'utf8'));",
      'export default tape;',
    ].join('\n'),
    'artifacts/kept-tree/winning-tape.json': '{}\n',
    'artifacts/moves/shot.png': 'x\n',
  });
  const derivation = deriveMustStay(root);
  const predicate = mustStayPredicate(derivation);
  assert.equal(predicate('artifacts/kept-tree'), true);
  assert.equal(predicate('artifacts/kept-tree/winning-tape.json'), true);
  assert.equal(predicate('artifacts/moves'), false);
});

test('a multi-line embedded source literal mints no pattern (the truncation regex could not cross a newline)', (t) => {
  const root = fixture(t, {
    'scripts/stub.test.mjs': [
      'const stub = `#!/usr/bin/env node',
      "const dir = 'artifacts/embedded';",
      "      fs.writeFileSync('artifacts/embedded/out.json', '{}');",
      '`;',
      'export default stub;',
    ].join('\n'),
    'artifacts/embedded/out.json': '{}\n',
    'artifacts/moves/shot.png': 'x\n',
  });
  const derivation = deriveMustStay(root);
  for (const pattern of derivation.patterns) {
    assert.match(pattern.pattern, /^artifacts\/[A-Za-z0-9_.*-]/, `stray pattern: ${JSON.stringify(pattern.pattern)}`);
    assert.doesNotMatch(pattern.pattern, /\s/, `stray pattern: ${JSON.stringify(pattern.pattern)}`);
  }
});

test('a template substitution becomes a one-segment wildcard, never a whole-tree wildcard', (t) => {
  const root = fixture(t, {
    'scripts/census.mjs': [
      "import { readFileSync } from 'node:fs';",
      'export const read = (map) => readFileSync(`artifacts/campaign/run-6/${map}/capture-config.json`, "utf8");',
    ].join('\n'),
    'artifacts/campaign/run-6/alpha/capture-config.json': '{}\n',
    'artifacts/campaign/run-6/alpha/board.png': 'x\n',
    'artifacts/campaign/run-3/board.png': 'x\n',
  });
  const derivation = deriveMustStay(root, { fileExact: new Map([['artifacts/campaign', 'fixture: file-exact like the real campaign']]) });
  const predicate = mustStayPredicate(derivation);
  assert.equal(predicate('artifacts/campaign/run-6/alpha/capture-config.json'), true);
  assert.equal(predicate('artifacts/campaign/run-6/beta/capture-config.json'), true, 'a map captured tomorrow is covered');
  assert.equal(predicate('artifacts/campaign/run-6/alpha/board.png'), false);
  assert.equal(predicate('artifacts/campaign/run-3/board.png'), false);
  // And the DEFAULT, on the same tree: a subtree nobody declared file-exact promotes WHOLE, which
  // is what keeps a 30 MB run's siblings from being severed by a form the scan did not name.
  const promoted = mustStayPredicate(deriveMustStay(root));
  assert.equal(promoted('artifacts/campaign/run-3/board.png'), true);
  assert.equal(promoted('artifacts/campaign'), true);
});

test("an author-task `artifacts/<id>/report.md` law line pins report files, NEVER the whole tree", (t) => {
  const root = fixture(t, {
    '.claude/skills/author-task/SKILL.md': 'Write the report under `artifacts/<id>/report.md` when the run ends.\n',
    'artifacts/some-slice/report.md': '# report\n',
    'artifacts/some-slice/shot.png': 'x\n',
  });
  const derivation = deriveMustStay(root);
  const predicate = mustStayPredicate(derivation);
  assert.equal(predicate('artifacts/some-slice/report.md'), true);
  assert.equal(predicate('artifacts/some-slice/shot.png'), false,
    'promoting `artifacts/*` would make every file must-stay and the offload a no-op');
  assert.equal(predicate('artifacts/some-slice'), false);
});

test('a write target with nothing tracked under it still stays (artifacts/ledger-backups is exactly this)', (t) => {
  const root = fixture(t, {
    'scripts/mirror.mjs': "import { mkdirSync } from 'node:fs';\nmkdirSync('artifacts/never-committed/', { recursive: true });\n",
    'artifacts/moves/shot.png': 'x\n',
  });
  const derivation = deriveMustStay(root);
  assert.equal(mustStayPredicate(derivation)('artifacts/never-committed'), true);
  assert.ok(derivation.unresolved.some((u) => u.pattern === 'artifacts/never-committed'),
    'and it is REPORTED as resolving to nothing, so nobody reads it as a measured 0');
});

// ─── THE UNITS THE PREDICATE IS BUILT FROM ─────────────────────────────────────────────────────

test('normaliseLiteral keeps a path and drops everything a path cannot contain', () => {
  assert.equal(normaliseLiteral('../artifacts/e5-regatta-boat-03/'), 'artifacts/e5-regatta-boat-03');
  assert.equal(normaliseLiteral('/artifacts/shared-atlas-dedupe/browser-harness.ts'), 'artifacts/shared-atlas-dedupe/browser-harness.ts');
  assert.equal(normaliseLiteral("x = 'artifacts/a/b.json'; y"), 'artifacts/a/b.json');
  assert.equal(normaliseLiteral('artifacts/a/b.json\n more text'), 'artifacts/a/b.json');
  assert.equal(normaliseLiteral('dist/assets'), null);
  assert.equal(normaliseLiteral('artifacts'), null);
});

test('literalToPattern and patternToRegExp keep a wildcard inside one segment', () => {
  assert.equal(literalToPattern('artifacts/a/${run}/x.json'), 'artifacts/a/*/x.json');
  assert.equal(literalToPattern('artifacts/<id>/report.md'), 'artifacts/*/report.md');
  const re = patternToRegExp('artifacts/a/*/x.json');
  assert.equal(re.test('artifacts/a/one/x.json'), true);
  assert.equal(re.test('artifacts/a/one/two/x.json'), false);
});

test('subtreeRootOf treats sol/ as a namespace, not a subtree', () => {
  assert.equal(subtreeRootOf('artifacts/heat13/a/b.png'), 'artifacts/heat13');
  assert.equal(subtreeRootOf('artifacts/sol/map-art-campaign-2/run-3/a.png'), CAMPAIGN);
});

test('codeLiterals reads a template expression whole and ignores comments', () => {
  const found = codeLiterals('probe.mjs', [
    "// don't read this: 'artifacts/in-a-comment/x.json'",
    'const p = `artifacts/a/${run}/x.json`;',
  ].join('\n'));
  assert.deepEqual(found.map((f) => f.value), ['artifacts/a/*/x.json']);
});

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('./law-pointer-guard.mjs', import.meta.url));
const DRAIN_GUARD = fileURLToPath(new URL('./drain-block-check.mjs', import.meta.url));
const REAL_ROOT = fileURLToPath(new URL('..', import.meta.url));

// The guard's whole job is to notice that a cited line moved. Every test below therefore
// MOVES something and asserts the guard reds — a guard never proven able to fail is decoration.
function fixture(t, { law, target, goals = { version: 1, goals: [] } }) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gold-rush-law-pointer-'));
  fs.mkdirSync(path.join(dir, 'scripts'), { recursive: true });
  // Every law surface must exist: a MISSING surface is itself a red (see the last test),
  // so the fixture stubs the ones this case is not exercising.
  fs.mkdirSync(path.join(dir, '.claude', 'skills', 'drain'), { recursive: true });
  fs.mkdirSync(path.join(dir, '.claude', 'skills', 'author-task'), { recursive: true });
  fs.mkdirSync(path.join(dir, '.claude', 'skills', 'playtest-intake'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'AGENTS.md'), 'stub\n');
  fs.writeFileSync(path.join(dir, 'scripts', 'fire.md'), 'stub\n');
  for (const s of ['drain', 'author-task', 'playtest-intake']) {
    fs.writeFileSync(path.join(dir, '.claude', 'skills', s, 'SKILL.md'), 'stub\n');
  }
  fs.writeFileSync(path.join(dir, 'CLAUDE.md'), law);
  fs.writeFileSync(path.join(dir, 'scripts', 'target.sh'), target);
  fs.copyFileSync(DRAIN_GUARD, path.join(dir, 'scripts', 'drain-block-check.mjs'));
  fs.mkdirSync(path.join(dir, 'tasks'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'tasks', 'goals.json'), JSON.stringify(goals));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

function run(dir, ...args) {
  return spawnSync('node', [SCRIPT, '--root', dir, ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

const TARGET = ['#!/bin/bash', 'echo one', '# THE EPITAPH: do not restore the prune', 'echo three', ''].join('\n');
const LAW_OK = 'The prune epitaph lives at `scripts/target.sh:3` — go LOOK.\n';

test('a correctly-pointed law passes once baselined', (t) => {
  const dir = fixture(t, { law: LAW_OK, target: TARGET });
  assert.equal(run(dir, '--update').status, 0);
  const r = run(dir);
  assert.equal(r.status, 0, r.stdout);
  assert.match(r.stdout, /PASS/);
});

test('CODE-SIDE ROT: the cited line moves under a fixed coordinate -> POINTER DRIFT (the fire.md :315 shape)', (t) => {
  const dir = fixture(t, { law: LAW_OK, target: TARGET });
  assert.equal(run(dir, '--update').status, 0);
  // Insert a line above the epitaph: the pointer still says :3, but :3 is now something else.
  const lines = TARGET.split('\n');
  lines.splice(1, 0, 'echo inserted');
  fs.writeFileSync(path.join(dir, 'scripts', 'target.sh'), lines.join('\n'));
  const r = run(dir);
  assert.equal(r.status, 1, 'guard must FAIL when the ground moves under a pointer');
  assert.match(r.stdout, /POINTER DRIFT/);
  assert.match(r.stdout, /THE EPITAPH/, 'the red must show what the line USED to say');
});

test('LAW-SIDE ROT: the law is edited to a stale coordinate -> red until re-verified (the F-1276-2 shape)', (t) => {
  const dir = fixture(t, { law: LAW_OK, target: TARGET });
  assert.equal(run(dir, '--update').status, 0);
  fs.writeFileSync(path.join(dir, 'CLAUDE.md'), LAW_OK.replace('target.sh:3', 'target.sh:2'));
  const r = run(dir);
  assert.equal(r.status, 1, 'a repointed law claim is a new claim and must be re-verified');
  assert.match(r.stdout, /NEW POINTER/);
});

test('a pointer past EOF is caught as OUT OF RANGE, not silently skipped', (t) => {
  const dir = fixture(t, { law: 'See `scripts/target.sh:900`.\n', target: TARGET });
  const r = run(dir);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /OUT OF RANGE/);
});

test('a pointer to a file that does not exist fails rather than being ignored', (t) => {
  const dir = fixture(t, { law: 'See `scripts/ghost.mjs:12`.\n', target: TARGET });
  const r = run(dir);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /UNRESOLVABLE/);
});

test('prose that is not a file:line is not mistaken for a pointer', (t) => {
  const dir = fixture(t, { law: 'Per §3.1 and F-1270-1 (s1270), see 2026-07-25 and pid 35584.\n', target: TARGET });
  const r = run(dir);
  assert.equal(r.status, 0, r.stdout);
  assert.match(r.stdout, /pointers\s+:\s+0/);
});

test('a MISSING law surface is itself a red — the law cannot be checked if it is gone', (t) => {
  const dir = fixture(t, { law: LAW_OK, target: TARGET });
  fs.rmSync(path.join(dir, 'AGENTS.md'));
  const r = run(dir);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /LAW SURFACE MISSING/);
});

test('THE REAL TREE: every law-surface pointer in this repo currently holds', () => {
  const r = run(REAL_ROOT);
  assert.equal(r.status, 0, `law-pointer-guard is RED on the real tree:\n${r.stdout}`);
});

// s1278 (F-1278-2): law surfaces cite EACH OTHER by coordinate — `scripts/fire.md` points at
// `.claude/skills/drain/SKILL.md:33`, the --workers=1 command §3.1 calls load-bearing. Until s1278
// the pattern matched code extensions only, so those pointers were invisible and had to be checked
// by hand (s1275 did exactly that — for the guard that exists to make hand checks unnecessary).
test('MARKDOWN TARGET: a law surface citing another .md by coordinate is checked, not skipped (F-1278-2)', (t) => {
  const dir = fixture(t, { law: 'The flag lives at `docs/target.md:3` — go LOOK.\n', target: TARGET });
  const md = ['# doc', 'intro', 'THE FLAG: --workers=1 is load-bearing', 'tail', ''].join('\n');
  fs.mkdirSync(path.join(dir, 'docs'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'docs', 'target.md'), md);
  assert.equal(run(dir, '--update').status, 0);
  assert.equal(run(dir).status, 0, 'a baselined .md pointer must pass');
  // Move the cited line: an .md pointer must rot-detect exactly like a code pointer does.
  const moved = md.split('\n');
  moved.splice(1, 0, 'inserted');
  fs.writeFileSync(path.join(dir, 'docs', 'target.md'), moved.join('\n'));
  const r = run(dir);
  assert.equal(r.status, 1, 'a .md pointer must red when its line moves');
  assert.match(r.stdout, /POINTER DRIFT/);
});

// ---------------------------------------------------------------------------
// F-2197-1 — SURFACES is a CLOSED list, and nothing ever said so. These tests are about
// the BOUNDARY of the scan rather than the pointers inside it. The red path is proven by
// MANUFACTURING the defect (a pre-cure mutant), never by reading a green: a passing guard
// never executes its own declaration path.
// ---------------------------------------------------------------------------

/** Pre-cure mutant: the declaration neutered, everything else byte-identical. */
function mutantWithoutDeclaration(t) {
  const src = fs.readFileSync(SCRIPT, 'utf8');
  const neutered = src.replace('const unscanned = unscannedSurfaces();', 'const unscanned = [];');
  assert.notEqual(neutered, src, 'the mutant must actually differ — otherwise this proves nothing');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gold-rush-law-pointer-mutant-'));
  const p = path.join(dir, 'law-pointer-guard.mjs');
  fs.writeFileSync(p, neutered);
  // s2199: the guard imports ./law-surfaces.mjs (the shared law-surface list, extracted so
  // gate-caller-audit.mjs cannot drift a second copy of it — F-2199-1). A mutant is a COPY of
  // the script, so it needs the script's local dependency beside it or it dies on module
  // resolution and this harness proves nothing about the declaration path it exists to test.
  fs.copyFileSync(path.join(path.dirname(SCRIPT), 'law-surfaces.mjs'), path.join(dir, 'law-surfaces.mjs'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return p;
}

test('BOUNDARY: a NEW law surface outside the closed SURFACES list is NAMED (pre-cure it is invisible)', (t) => {
  const dir = fixture(t, { law: LAW_OK, target: TARGET });
  assert.equal(run(dir, '--update').status, 0);
  // The exact scenario the method predicts: a fourth skill appears, carrying a coordinate
  // nobody is checking. It must not require a fire to notice by eye.
  fs.mkdirSync(path.join(dir, '.claude', 'skills', 'new-ritual'), { recursive: true });
  fs.writeFileSync(
    path.join(dir, '.claude', 'skills', 'new-ritual', 'SKILL.md'),
    'Always confirm the epitaph at `scripts/target.sh:3` before draining.\n',
  );

  const pre = spawnSync('node', [mutantWithoutDeclaration(t), '--root', dir], { encoding: 'utf8' });
  assert.equal(pre.status, 0, pre.stdout);
  assert.doesNotMatch(pre.stdout, /NOT SCANNED/, 'PRE-CURE: the boundary is invisible — this is the defect');
  assert.doesNotMatch(pre.stdout, /new-ritual/, 'PRE-CURE: the unscanned surface is never named');

  const r = run(dir);
  assert.equal(r.status, 0, 'the declaration is ADVISORY — it must not move the exit code');
  assert.match(r.stdout, /NOT SCANNED/);
  assert.match(r.stdout, /new-ritual\/SKILL\.md/, 'the new law surface must be named');
  assert.match(r.stdout, /NONE DECLARED/, 'an undeclared surface WITH citations must say so');
});

test('BOUNDARY: a DECLARED exclusion prints its reason instead of the undeclared prompt', (t) => {
  const dir = fixture(t, { law: LAW_OK, target: TARGET });
  assert.equal(run(dir, '--update').status, 0);
  // STATUS.md is the one named exclusion: live law bullets, frozen handoff archives.
  fs.writeFileSync(path.join(dir, 'STATUS.md'), [
    'Last updated: fixture line-1',
    '- **s9au MIGRATION: the model is set at `scripts/target.sh:1`',
    '- **s2100 handoff (line-1 archive):** we cited `scripts/target.sh:2` back then',
    '',
  ].join('\n'));
  const r = run(dir);
  assert.equal(r.status, 0, 'a declared exclusion must stay exit-neutral');
  assert.match(r.stdout, /STATUS\.md {2}\(2 citation\(s\), 1 in LIVE law bullets\)/, r.stdout);
  assert.match(r.stdout, /RETENTION LAW/, 'the reason must be printed, not merely implied');
  assert.doesNotMatch(r.stdout, /STATUS\.md[\s\S]{0,400}?NONE DECLARED/, 'a declared file must not be prompted for a reason');
});

test('BOUNDARY: the live/frozen split is DERIVED from the file, so a new handoff cannot rot it', (t) => {
  const dir = fixture(t, { law: LAW_OK, target: TARGET });
  assert.equal(run(dir, '--update').status, 0);
  const base = ['Last updated: fixture line-1', '- **s9au LAW: `scripts/target.sh:1`', ''];
  fs.writeFileSync(path.join(dir, 'STATUS.md'), base.join('\n'));
  assert.match(run(dir).stdout, /STATUS\.md {2}\(1 citation\(s\), 1 in LIVE law bullets\)/);
  // Append a handoff archive: total moves, the LIVE count must NOT.
  base.splice(2, 0, '- **s2196 handoff (line-1 archive):** `scripts/target.sh:2` and `scripts/target.sh:3`');
  fs.writeFileSync(path.join(dir, 'STATUS.md'), base.join('\n'));
  assert.match(run(dir).stdout, /STATUS\.md {2}\(3 citation\(s\), 1 in LIVE law bullets\)/, 'frozen archives must not inflate the LIVE count');
});

test('BOUNDARY: a law-surface-shaped file with NO citations is reported as costless, not as a problem', (t) => {
  const dir = fixture(t, { law: LAW_OK, target: TARGET });
  assert.equal(run(dir, '--update').status, 0);
  fs.writeFileSync(path.join(dir, 'NOTES.md'), 'prose with no coordinates at all\n');
  const r = run(dir);
  assert.equal(r.status, 0);
  assert.match(r.stdout, /NOTES\.md {2}\(no citations — exclusion costs nothing\)/);
  assert.doesNotMatch(r.stdout, /NOTES\.md[\s\S]{0,200}?NONE DECLARED/, 'no citations means nothing is owed');
});

test('BOUNDARY: a file already IN SURFACES is never named as unscanned, and a red still reds', (t) => {
  const dir = fixture(t, { law: LAW_OK, target: TARGET });
  assert.equal(run(dir, '--update').status, 0);
  assert.doesNotMatch(run(dir).stdout, /CLAUDE\.md {2}\(/, 'a scanned surface must not appear in the NOT SCANNED list');
  // And the declaration must not mask a genuine pointer red.
  fs.writeFileSync(path.join(dir, 'NOTES.md'), 'prose with no coordinates at all\n');
  fs.writeFileSync(path.join(dir, 'CLAUDE.md'), LAW_OK.replace('target.sh:3', 'target.sh:2'));
  const r = run(dir);
  assert.equal(r.status, 1, 'an advisory block must never suppress a real failure');
  assert.match(r.stdout, /NOT SCANNED/, 'and the boundary is still declared on a failing run');
});

test('GOAL LEDGER ROT: a live non-terminal blockedReason pointer moves -> red names the leaf', (t) => {
  const goals = {
    version: 1,
    goals: [{
      id: 'fixture-goal',
      title: 'fixture',
      subgoals: [{
        id: 'fixture-subgoal',
        title: 'fixture',
        tasks: [{
          id: 'ledger-leaf',
          taskFile: 'fixture.md',
          status: 'planned',
          blockedReason: 'The epitaph lives at scripts/target.sh:3.',
        }],
      }],
    }],
  };
  const dir = fixture(t, { law: 'stub\n', target: TARGET, goals });
  assert.equal(run(dir, '--update').status, 0);
  assert.equal(run(dir).status, 0, 'a baselined ledger pointer must pass');

  const moved = TARGET.split('\n');
  moved.splice(1, 0, 'echo inserted');
  fs.writeFileSync(path.join(dir, 'scripts', 'target.sh'), moved.join('\n'));
  const r = run(dir);
  assert.equal(r.status, 1, 'guard must FAIL when a ledger pointer moves');
  assert.match(r.stdout, /POINTER DRIFT/);
  assert.match(r.stdout, /tasks\/goals\.json\[ledger-leaf\]/);
});

test('BACKLOG COORDINATE BAN: live leaves red, --update cannot bury it, terminal history stays out', (t) => {
  const goals = (blockedReason, status = 'blocked', id = 'backlog-coordinate-leaf') => ({
    version: 1,
    goals: [{
      id: 'fixture-goal',
      title: 'fixture',
      tasks: [{ id, taskFile: 'fixture.md', status, blockedReason }],
    }],
  });

  const full = fixture(t, {
    law: 'stub\n',
    target: TARGET,
    goals: goals('Owner gate at tasks/BACKLOG.md:42.'),
  });
  let r = run(full);
  assert.equal(r.status, 1, 'a live tasks/BACKLOG.md coordinate must fail');
  assert.match(r.stdout, /BACKLOG COORDINATE/);
  assert.match(r.stdout, /tasks\/goals\.json\[backlog-coordinate-leaf\]/);

  r = run(full, '--update');
  assert.equal(r.status, 1, '--update must reject rather than baseline the banned shape');
  assert.equal(run(full).status, 1, 'the banned shape must still fail after --update');

  const bare = fixture(t, {
    law: 'stub\n',
    target: TARGET,
    goals: goals('Owner gate at BACKLOG:42.'),
  });
  r = run(bare);
  assert.equal(r.status, 1, 'a live bare BACKLOG coordinate must fail');
  assert.match(r.stdout, /"BACKLOG:42"/);

  const terminal = fixture(t, {
    law: 'stub\n',
    target: TARGET,
    goals: goals('Historical pointer tasks/BACKLOG.md:42.', 'merged', 'terminal-leaf'),
  });
  r = run(terminal);
  assert.equal(r.status, 0, r.stdout);
});

// s2198 (F-2198-1): a law surface ORDERS fires to run instruments, and names most of them
// WITHOUT a coordinate. Those bare citations were invisible to this guard (POINTER requires
// `:<digits>`) and to gate-caller-audit (law files are outside its edge vocabulary, and its
// subject set is lexical — a script earns a reviewed grandfather entry only if its filename
// happens to contain guard|assert|check|audit|contract|ratchet; 9 of the 23 law-cited
// instruments do not). So a law could name a tool that does not exist and nothing would say
// so — F-1667-1's shape, which excused two guards from the reachability audit for 133 fires
// on the strength of a caller in scripts/fire.md that had never existed.
test('DEAD INSTRUMENT: a law ordering fires to run a tool that does not exist is a red (F-2198-1)', (t) => {
  const dir = fixture(t, {
    law: 'Before any refill, run `node scripts/no-such-tool.mjs <slot>` and read the WORD.\n',
    target: TARGET,
  });
  const r = run(dir);
  assert.equal(r.status, 1, 'a law naming a nonexistent instrument must FAIL, not pass quietly');
  assert.match(r.stdout, /DEAD INSTRUMENT/);
  assert.match(r.stdout, /no-such-tool\.mjs/, 'the red must name the tool that cannot be run');
});

test('a bare citation to a tool that EXISTS resolves and does not red', (t) => {
  const dir = fixture(t, { law: 'Run `bash scripts/target.sh` as the last act.\n', target: TARGET });
  const r = run(dir);
  assert.equal(r.status, 0, r.stdout);
  assert.match(r.stdout, /instruments\s+:\s+1\s+\(resolved 1, dead 0/);
});

// The two arms must not both report one defect: a citation carrying a coordinate is POINTER's,
// and UNRESOLVABLE already covers it. Double-reporting trains readers to skim the red.
test('a citation WITH a coordinate stays POINTER-owned and is not counted as an instrument', (t) => {
  const dir = fixture(t, { law: LAW_OK, target: TARGET });
  assert.equal(run(dir, '--update').status, 0);
  const r = run(dir);
  assert.equal(r.status, 0, r.stdout);
  assert.match(r.stdout, /instruments\s+:\s+0\s+\(resolved 0, dead 0/);
});

// ---------------------------------------------------------------------------
// F-2342-1 — F-2197-1 made the closed SURFACES list visible; its OWN boundary then lived in
// a one-line comment. `NOT SCANNED : 6` reads as a census of the repo when it can only ever
// be a census of three directories. These arms are about the declaration of the SCAN SPACE,
// one level out from the arms above.
// ---------------------------------------------------------------------------

/** Pre-cure mutant: the scan-space declaration removed, everything else byte-identical. */
function mutantWithoutScanSpace(t) {
  const src = fs.readFileSync(SCRIPT, 'utf8');
  const marker = 'const space = scanSpace();';
  assert.ok(src.includes(marker), 'the mutant must find its subject — otherwise this proves nothing');
  // Cut the three CONSUMER lines only. Filtering on `scanSpace()` alone would also delete the
  // function's own `function scanSpace() {` header and leave an orphaned body — the mutant would
  // die on a SyntaxError and the arm would "prove" the declaration is absent because NOTHING ran.
  // A defect arm that crashes is silence wearing a costume; that is what the rc assertion below
  // is for, and it is how this very mutant was caught on its first writing.
  const cut = src.split('\n').filter((l) => (
    !l.includes(marker)
    && !l.includes('scan space    :')
    && !l.includes('invisible to BOTH lists (F-2342-1)')
  )).join('\n');
  assert.notEqual(cut, src, 'the mutant must actually differ');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gold-rush-law-scan-space-mutant-'));
  const p = path.join(dir, 'law-pointer-guard.mjs');
  fs.writeFileSync(p, cut);
  fs.copyFileSync(path.join(path.dirname(SCRIPT), 'law-surfaces.mjs'), path.join(dir, 'law-surfaces.mjs'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return p;
}

test('SCAN SPACE: declared on the HAPPY path too — a declaration that appears only on failure re-creates the ambiguity it removes (F-2208-1)', (t) => {
  const dir = fixture(t, { law: LAW_OK, target: TARGET });
  assert.equal(run(dir, '--update').status, 0);
  const r = run(dir);
  assert.equal(r.status, 0, r.stdout);
  assert.match(r.stdout, /PASS/, 'this fixture is the happy path — the arm must exercise it');
  assert.match(r.stdout, /scan space\s+:\s+\d+ famil\(ies\)/, 'the scan space must be declared even when nothing is unscanned');
  assert.match(r.stdout, /invisible to BOTH lists/, 'and it must say what the edge MEANS');

  const pre = spawnSync('node', [mutantWithoutScanSpace(t), '--root', dir], { encoding: 'utf8' });
  assert.equal(pre.status, 0, pre.stdout);
  assert.ok(pre.stdout.length > 0, 'PRE-CURE arm must really run — a silent control cannot be told from the silence it measures (F-2215-1)');
  assert.doesNotMatch(pre.stdout, /scan space/, 'PRE-CURE: the scan space is undeclared — this is the defect');
});

test('SCAN SPACE: DERIVED from the families it enumerates, never transcribed', (t) => {
  const dir = fixture(t, { law: LAW_OK, target: TARGET });
  assert.equal(run(dir, '--update').status, 0);
  const before = run(dir).stdout.match(/scan space\s+:\s+\d+ famil\(ies\), (\d+) candidate\(s\)/);
  assert.ok(before, 'the declaration must report a candidate count');

  // A fourth skill appears. A DERIVED count moves; a hardcoded string does not.
  fs.mkdirSync(path.join(dir, '.claude', 'skills', 'new-ritual'), { recursive: true });
  fs.writeFileSync(path.join(dir, '.claude', 'skills', 'new-ritual', 'SKILL.md'), 'stub\n');
  const after = run(dir).stdout.match(/scan space\s+:\s+\d+ famil\(ies\), (\d+) candidate\(s\)/);
  assert.ok(after, 'the declaration must survive the new surface');
  assert.equal(Number(after[1]), Number(before[1]) + 1, 'the candidate count must be derived from the real listing');
  assert.match(run(dir).stdout, /\.claude\/skills\/\*\/SKILL\.md \(\d+\)/, 'each family must name itself');
});

// REVERSE CONTROL. The cure is to DECLARE the edge, never to MOVE it. law-surfaces.mjs says
// "Never widen by pattern" and gives the reason: tasks/BACKLOG.md alone carries thousands of
// deliberately-stale coordinates, so scanning it would red forever and be excused into
// uselessness inside a week (F-1460-1). An over-general cure that widened SCAN_FAMILIES to
// docs/ or tasks/ passes both arms above and is caught only here.
test('SCAN SPACE (reverse control): the edge is DECLARED, not widened — a law-shaped .md outside the families stays unscanned', (t) => {
  const dir = fixture(t, { law: LAW_OK, target: TARGET });
  assert.equal(run(dir, '--update').status, 0);
  fs.mkdirSync(path.join(dir, 'docs'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'docs', 'HANDOVER.md'), 'The epitaph is at `scripts/target.sh:3`.\n');
  const r = run(dir);
  assert.equal(r.status, 0, 'widening must not have happened — a docs/ pointer must not be checked, nor red');
  assert.doesNotMatch(r.stdout, /docs\/HANDOVER\.md/, 'a file outside the three families is NOT enumerated — the declaration is what tells you so');
  assert.match(r.stdout, /scan space\s+:/, 'and the declaration is present to say where the edge is');
});

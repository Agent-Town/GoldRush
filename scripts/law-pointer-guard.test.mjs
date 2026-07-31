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

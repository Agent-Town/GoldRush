// attended-land.test.mjs — the node half of scripts/attended/land.sh must keep the laws the landing tool encodes:
// the lock predicate knows all four line-1 shapes, configs refuse the shapes that broke landings, bookkeeping is idempotent and
// never splices text into code, the union/roster resolvers do what the merge policy says, the verdict allows only configured reds.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const lib = require('./attended/land-lib.cjs');

const base = () => ({
  tag: 't1', branch: 'fix/t1', port: 5399, mergeMessage: 'drain: merge fix/t1', hash: 'pin', pinCause: 'a cause.',
  review: { path: 'reviews/t1.md', title: 'Drain review: t1', body: 'body.md' },
  bookkeeping: { taskFile: 't1.md', rowKey: 'T1 LANDED', rowText: 'row text {PIN}', statusPhrase: 'phrase {PIN}' },
});
const withConfig = (obj, fn) => { const d = mkdtempSync(join(tmpdir(), 'land-')); try { const p = join(d, 'c.json'); writeFileSync(p, JSON.stringify(obj)); return fn(p, d); } finally { rmSync(d, { recursive: true, force: true }); } };

test('the lock predicate knows the four STATUS line-1 shapes and nothing else', () => {
  for (const l of ['ACTIVE 2026-09-24T15:38Z (s2668 fire) — x', 'Last updated … s2668 lock ACTIVE — x', '… ACTIVE (s2668 fire) …', '… (s2668 fire) ACTIVE …']) assert.equal(lib.isLockLine(l), true, l);
  for (const l of ['Last updated: 2026-09-25T03:55Z s2676 handoff, lock CLEARED — x', 'the board was ACTIVELY dry', '']) assert.equal(lib.isLockLine(l), false, l);
});

test('a config must carry the fields a landing needs and refuses an F-ID in the STATUS phrase', () => {
  withConfig(base(), (p) => { const c = lib.loadConfig(p); assert.equal(c.hash, 'pin'); assert.equal(c.deploy, true); assert.ok(c.gates.guards.length > 5); assert.equal(c.evidenceDir, 'artifacts/t1'); });
  withConfig({ ...base(), hash: 'unchanged', pinCause: undefined }, (p) => assert.equal(lib.loadConfig(p).hash, 'unchanged'));
  withConfig({ ...base(), pinCause: undefined }, (p) => assert.throws(() => lib.loadConfig(p), /pinCause/));
  withConfig({ ...base(), bookkeeping: { ...base().bookkeeping, statusPhrase: 'see F-RGD-2' } }, (p) => assert.throws(() => lib.loadConfig(p), /F-ID/));
  withConfig({ ...base(), tag: 'Bad Tag' }, (p) => assert.throws(() => lib.loadConfig(p), /tag/));
});

test('the env file is single-quoted and survives apostrophes, spaces and dollar signs', () => {
  withConfig({ ...base(), gates: { specs: ["e2e/a.spec.ts", "e2e/b's.spec.ts"] }, mergeMessage: "the owner's $HOME message" }, (p) => {
    const env = lib.envFile(lib.loadConfig(p));
    assert.match(env, /^TAG='t1'$/m); assert.match(env, /^SPECS='e2e\/a\.spec\.ts e2e\/b'\\''s\.spec\.ts'$/m); assert.match(env, /^HASH_MODE='pin'$/m); assert.match(env, /^DEPLOY='1'$/m);
  });
});

test('union keeps both sides of a conflict block and refuses leftover markers', () => {
  const d = mkdtempSync(join(tmpdir(), 'land-')); const f = join(d, 'x.md');
  writeFileSync(f, 'head\n<<<<<<< ours\nA\n=======\nB\n>>>>>>> theirs\ntail\n'); lib.union(f); assert.equal(readFileSync(f, 'utf8'), 'head\nA\nB\ntail\n');
  writeFileSync(f, 'head\n<<<<<<< ours\nA\n'); assert.throws(() => lib.union(f), /markers remain/); rmSync(d, { recursive: true, force: true });
});

test('the evidence table lists only the gates that ran, last line per gate', () => {
  const t = lib.evidenceTable(['tsc/build/e1: 0 / 0 / 0', 'guards: ℹ pass 10 ℹ fail 0', 'e2e: rc=1 2 failed 40 passed', 'e2e: rc=0 42 passed', 'battery: rc=1 ℹ tests 900 ℹ pass 899 ℹ fail 1'].join('\n'));
  assert.match(t, /\| tsc \/ build \/ e1 \| `0 \/ 0 \/ 0` \|/); assert.match(t, /\| e2e both projects, --workers=1 \| `rc=0 42 passed` \|/); assert.doesNotMatch(t, /null floors/);
});

test('the verdict allows only the configured e2e reds and the known battery classes', () => {
  const gates = ['tsc/build/e1: 0 / 0 / 0', 'law-pointer: rc=0 ok', 'guards: ℹ pass 5 ℹ fail 0', 'null floors: rc=0 83 of 83', 'build:release (strict): rc=0', 'e2e: rc=1 2 failed 40 passed',
    '1) [desktop-chrome] › e2e/menu-safe-params.spec.ts:5:1 › town3dPilot', '2) [mobile-chrome] › e2e/other.spec.ts:9:1 › other', 'battery start 00:00Z', 'battery: rc=1 ℹ tests 9 ℹ pass 8 ℹ fail 1',
    '✖ all 150 scripts/*.test.mjs fixture owners remove their temp directories (1ms)', 'dirt after battery: 0'].join('\n') + '\n';
  const d = mkdtempSync(join(tmpdir(), 'land-')); const gf = join(d, 'g.txt'); writeFileSync(gf, '\n' + gates);
  withConfig({ ...base(), gates: { specs: ['e2e/x.spec.ts'], allowedE2E: ['menu-safe-params\\.spec\\.ts:5:'] } }, (p) => {
    const r = lib.verdict(lib.loadConfig(p), gf); assert.equal(r.length, 1); assert.match(r[0], /other\.spec\.ts/);
  });
  withConfig({ ...base(), gates: { specs: ['e2e/x.spec.ts'], allowedE2E: ['menu-safe-params\\.spec\\.ts:5:', 'other\\.spec\\.ts:9:'] } }, (p) => assert.deepEqual(lib.verdict(lib.loadConfig(p), gf), []));
  rmSync(d, { recursive: true, force: true });
});

test('bookkeeping is idempotent and puts the phrase before the desk header without splicing', () => {
  const d = mkdtempSync(join(tmpdir(), 'land-')); const cwd = process.cwd();
  try {
    mkdirSync(join(d, 'tasks')); mkdirSync(join(d, 'reviews'));
    writeFileSync(join(d, 'tasks/goals.json'), JSON.stringify({ goals: [{ tasks: [{ id: 't1', status: 'queued', taskFile: 't1.md' }] }] }));
    writeFileSync(join(d, 'tasks/BACKLOG.md'), 'first row\n'); writeFileSync(join(d, 'STATUS.md'), "Last updated: x handoff, lock CLEARED — body 🔺 **OWNER'S DESK — 2 awaiting a word.** 🔺 **F-1** — a.\n\n- archive\n");
    process.chdir(d);
    const cfg = withConfig({ ...base(), bookkeeping: { ...base().bookkeeping, statusPhrase: "the owner's phrase {PIN}", rowText: "it's a row {PIN}" } }, (p) => lib.loadConfig(p));
    lib.bookkeep(cfg, 'abcdef1234567890', '#7 `deadbeef`'); lib.bookkeep(cfg, 'abcdef1234567890', '#7 `deadbeef`');
    const g = JSON.parse(readFileSync('tasks/goals.json', 'utf8')); assert.equal(g.goals[0].tasks[0].status, 'merged'); assert.equal(g.goals[0].tasks[0].mergeHash, 'abcdef1234567890');
    const b = readFileSync('tasks/BACKLOG.md', 'utf8'); assert.equal(b.split('T1 LANDED').length, 2); assert.match(b, /it's a row #7 `deadbeef`/);
    const s = readFileSync('STATUS.md', 'utf8').split('\n')[0]; assert.equal(s.split('T1 LANDED').length, 2); assert.ok(s.indexOf('T1 LANDED') < s.indexOf("OWNER'S DESK")); assert.match(s, /the owner's phrase #7 `deadbeef`/);
  } finally { process.chdir(cwd); rmSync(d, { recursive: true, force: true }); }
});

test('bookkeeping works on a chain whose stale line 1 carries a fire lock shape (the live lock is the ff gate, not this file)', () => {
  const d = mkdtempSync(join(tmpdir(), 'land-')); const cwd = process.cwd();
  try {
    mkdirSync(join(d, 'tasks')); writeFileSync(join(d, 'tasks/goals.json'), JSON.stringify({ goals: [{ tasks: [{ id: 't1', status: 'queued', taskFile: 't1.md' }] }] })); writeFileSync(join(d, 'tasks/BACKLOG.md'), ''); writeFileSync(join(d, 'STATUS.md'), "ACTIVE 2026-09-25T09:02Z (s2680 fire) — x 🔺 **OWNER'S DESK — 1 awaiting a word.**\n");
    process.chdir(d); const cfg = withConfig(base(), (p) => lib.loadConfig(p)); lib.bookkeep(cfg, 'abc', '#1');
    const s = readFileSync('STATUS.md', 'utf8').split('\n')[0]; assert.match(s, /^ACTIVE .*T1 LANDED .*OWNER'S DESK/);
  } finally { process.chdir(cwd); rmSync(d, { recursive: true, force: true }); }
});

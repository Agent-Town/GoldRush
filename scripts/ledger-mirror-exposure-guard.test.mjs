/**
 * ledger-mirror-exposure-guard.test.mjs — teeth for F-2353-1.
 *
 * Subject: scripts/ledger-mirror-exposure.mjs, the instrument for LB-01's
 * standing encryption gate ("a plaintext ledger of county standings is fine,
 * account data is not"), plus the denylist's agreement with the source of truth.
 *
 * Every arm below was proven by MANUFACTURING the defect on a scratch copy — a
 * passing guard never executes its violation path, so its green is not evidence
 * about its red (the s1299/s1300 standard). The sweep doubled as a reachability
 * audit (s2226's duty): every arm reds under at least one manufactured variant,
 * so none of them is decoration.
 *
 * The fixtures build REAL sqlite databases rather than placeholder text, because
 * the whole question is what the keys inside one say — a fixture that cannot be
 * opened would exercise only the "could not answer" path and would certify
 * nothing about the classification this tool exists to perform.
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { mkdtempSync, mkdirSync, writeFileSync, cpSync, readFileSync, chmodSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Fixture teardown (F-2383-2). These guards made temp dirs and never removed them: 50 survivors
// per run, invisible while scripts/fixture-teardown.test.mjs still failed fast on an earlier subject.
// keep() only REGISTERS the directory — the mkdtemp literal deliberately stays at its own call site,
// because that auditor extracts prefixes lexically and cannot see through a wrapper (F-2382-4).
const TMP = [];
const keep = (d) => { TMP.push(d); return d; };
process.on('exit', () => {
  for (const d of TMP) rmSync(d, { recursive: true, force: true });
});


const REPO = fileURLToPath(new URL('..', import.meta.url));
const SUBJECT = path.join(REPO, 'scripts', 'ledger-mirror-exposure.mjs');

/** Build a mirror directory holding one sqlite db per {name: [keys]} entry. */
function mirrorDir(spec) {
  const dir = keep(mkdtempSync(path.join(os.tmpdir(), 'gr-exposure-')));
  for (const [name, keys] of Object.entries(spec)) {
    const db = new DatabaseSync(path.join(dir, name));
    db.exec('create table kv (key text primary key, value text)');
    const ins = db.prepare('insert into kv (key, value) values (?, ?)');
    for (const k of keys) ins.run(k, 'x');
    db.close();
  }
  return dir;
}

function mirrorWith(sql) {
  const dir = keep(mkdtempSync(path.join(os.tmpdir(), 'gr-exposure-tables-')));
  const db = new DatabaseSync(path.join(dir, 'ledger-2026-09-03.db'));
  db.exec(sql);
  db.close();
  return dir;
}

function run(dir, extra = [], script = SUBJECT) {
  return spawnSync(process.execPath, [script, '--dir', dir, ...extra], { timeout: 240_000, killSignal: 'SIGKILL', encoding: 'utf8' });
}

/**
 * Run a MANUFACTURED variant and assert it actually executed before believing
 * anything it says. A control whose failure mode is silence cannot be told from
 * the silence it measures (F-2215-1) — and that is not theoretical here: every
 * variant arm below passed vacuously on first writing, because macOS symlinks
 * /tmp to /private/tmp and the subject's module-main check was comparing
 * resolved paths, so main() never ran and every variant exited 0 with 0 B.
 */
function runVariant(script, dir, extra = []) {
  const r = run(dir, extra, script);
  assert.ok(r.stdout.length > 0,
    `control validity: the variant produced NO stdout (rc=${r.status}) — it did not run, ` +
    `so this arm proves nothing. stderr: ${r.stderr.slice(0, 300)}`);
  return r;
}

/** Manufacture a variant of the subject with one edit, asserting the edit matched. */
function variantOf(find, replace) {
  const src = readFileSync(SUBJECT, 'utf8');
  assert.ok(src.includes(find), `variant construction FAILED — anchor absent: ${find.slice(0, 60)}`);
  const dir = keep(mkdtempSync(path.join(os.tmpdir(), 'gr-exposure-variant-')));
  const file = path.join(dir, 'ledger-mirror-exposure.mjs');
  writeFileSync(file, src.replace(find, replace));
  return file;
}

const CLEAN = { 'ledger-2026-08-29.db': ['assay-queue-index', 'standings:s2:alice', 'standings:s2:bob'] };

test('THE DEFECT ARM: an account row in a mirror REFUSES with exit 1 and names the key', () => {
  const dir = mirrorDir({ 'ledger-2026-08-30.db': ['standings:s2:alice', 'session:abc123'] });
  const r = run(dir);
  assert.equal(r.status, 1, 'account data must refuse, not warn');
  assert.match(r.stdout, /ACCOUNT DATA IN A PLAINTEXT MIRROR/);
  assert.match(r.stdout, /session:abc123/, 'the offending key must be named, not just counted');
  assert.match(r.stdout, /DO NOT COMMIT/);
});

test('every account prefix _accounts.ts writes is detected, not just the memorable ones', () => {
  for (const p of ['account:', 'attempts:', 'code:', 'ratelimit:', 'save:', 'session:']) {
    const dir = mirrorDir({ 'ledger-2026-08-30.db': [`${p}whatever`] });
    const r = run(dir);
    assert.equal(r.status, 1, `${p} must be classified account-class`);
  }
});

test('REVERSE CONTROL: a clean mirror is cleared — exit 0 and the CLEAN banner', () => {
  const r = run(mirrorDir(CLEAN));
  assert.equal(r.status, 0);
  assert.match(r.stdout, /✅ CLEAN/);
  assert.doesNotMatch(r.stdout, /ACCOUNT DATA/);
});

test('REVERSE CONTROL: an account token that is not a PREFIX does not refuse', () => {
  // `standings:s2:code:x` merely CONTAINS "code:" — over-matching here would red
  // on lawful county data and get this tool excused into uselessness (F-1460-1).
  const r = run(mirrorDir({ 'ledger-2026-08-30.db': ['standings:s2:code:x'] }));
  assert.equal(r.status, 0, 'substring matching would make this refuse');
  assert.match(r.stdout, /✅ CLEAN/);
});

test('the corpus is DECLARED even on the happy path — "0 account rows" must not look like "I read nothing" (F-2208-1)', () => {
  const r = run(mirrorDir(CLEAN));
  assert.match(r.stdout, /corpus\s+: read \(1 mirror\(s\), 1 read, 0 unreadable\)/);
  assert.match(r.stdout, /keys inspected\s+: 3/);
  assert.match(r.stdout, /account-class rows\s+: 0/);
});

test('an unmapped table without `key` is NAMED as skipped on the happy path', () => {
  const r = run(mirrorWith('create table weather (forecast text); insert into weather values (\'sunny\')'));
  assert.equal(r.status, 0);
  assert.match(r.stdout, /tables inspected\s+: ledger-2026-09-03\.db:weather\[SKIPPED: no declared columns\]/);
  assert.match(r.stdout, /✅ CLEAN/);
});

test('mapped refusals identity columns are declared and catch an exposed account identity', () => {
  const r = run(mirrorWith(`
    create table refusals (anon_id text, profile_name text);
    insert into refusals values ('session:exposed-rider', 'County Rider');
  `));
  assert.equal(r.status, 1);
  assert.match(r.stdout, /refusals\[anon_id,profile_name\]/);
  assert.match(r.stdout, /session:exposed-rider/);
  assert.match(r.stdout, /ACCOUNT DATA IN A PLAINTEXT MIRROR/);
});

test('an UNRECOGNISED key class warns and does NOT refuse by default', () => {
  // Lawful growth: the county adding a new standings-class key is routine.
  const r = run(mirrorDir({ 'ledger-2026-08-30.db': ['weather:tuesday'] }));
  assert.equal(r.status, 0, 'unrecognised must not refuse by default');
  assert.match(r.stdout, /UNRECOGNISED KEY CLASS/);
  assert.match(r.stdout, /weather:tuesday/);
});

test('--strict turns an UNRECOGNISED key into a refusal', () => {
  const r = run(mirrorDir({ 'ledger-2026-08-30.db': ['weather:tuesday'] }), ['--strict']);
  assert.equal(r.status, 1);
});

test('an ABSENT corpus DECLARES and does not refuse — it is lawful, and it answers the question (F-2218-1)', () => {
  // A fresh clone or a worktree older than the mirror series has no such
  // directory; refusing there would red `test:ledger-guards` on ordinary correct
  // work and get this leg excused into uselessness (F-1460-1).
  const r = run(path.join(os.tmpdir(), 'gr-exposure-does-not-exist-' + process.pid));
  assert.equal(r.status, 0, 'absent is lawful and answered — it must not refuse');
  assert.match(r.stdout, /corpus\s+: absent/, 'but it must still be DECLARED, never silent');
  assert.match(r.stdout, /nothing to expose/);
});

test('an UNREADABLE corpus DIRECTORY is "could not answer" (2) — the case absence must not be confused with', () => {
  const dir = mirrorDir(CLEAN);
  chmodSync(dir, 0o000);
  try {
    const r = run(dir);
    if (process.getuid && process.getuid() === 0) return; // root reads anything
    assert.equal(r.status, 2, 'a directory that exists and will not enumerate is an instrument failure');
    assert.doesNotMatch(r.stdout, /✅ CLEAN/);
  } finally {
    chmodSync(dir, 0o755);
  }
});

test('an UNREADABLE member is counted and named, and drives "could not answer"', () => {
  const dir = mirrorDir(CLEAN);
  writeFileSync(path.join(dir, 'ledger-2026-08-30.db'), 'not a sqlite database at all');
  const r = run(dir);
  assert.equal(r.status, 2, 'a hole in the denominator must not read as clean');
  assert.match(r.stdout, /UNREADABLE ledger-2026-08-30\.db/);
  assert.doesNotMatch(r.stdout, /✅ CLEAN/);
});

test('the refusal reaches STDOUT — a caller that classifies stdout reads silence otherwise (F-2211-1)', () => {
  const dir = mirrorDir({ 'ledger-2026-08-30.db': ['session:abc'] });
  const r = run(dir);
  assert.ok(r.stdout.includes('ACCOUNT DATA IN A PLAINTEXT MIRROR'),
    'the verdict must be on stdout, not only stderr');
});

test('--json carries the declaration and the offending keys ALWAYS', () => {
  const clean = JSON.parse(run(mirrorDir(CLEAN), ['--json']).stdout);
  assert.equal(clean.corpus, 'read');
  assert.equal(clean.accountRows, 0);
  assert.equal(clean.keys, 3);

  const dirty = run(mirrorDir({ 'ledger-2026-08-30.db': ['code:zz'] }), ['--json']);
  const parsed = JSON.parse(dirty.stdout);
  assert.equal(parsed.accountRows, 1);
  assert.equal(parsed.account[0].key, 'code:zz');
  assert.equal(dirty.status, 1);
});

test('THE ALARM: the denylist covers every account key class functions/api/_accounts.ts writes', () => {
  // The third implementation of the question (an alarm, not a mirror): re-derive
  // the prefixes FROM the source of truth so a rename or a new key class cannot
  // silently fall outside the denylist. A hardcoded list of what the code already
  // knows is a defect awaiting a rename.
  const src = readFileSync(path.join(REPO, 'functions', 'api', '_accounts.ts'), 'utf8');
  const written = new Set();
  for (const m of src.matchAll(/`([a-zA-Z]+:)\$\{/g)) written.add(m[1]);
  assert.ok(written.size >= 5, `expected several key classes, derived ${written.size}`);

  const declared = readFileSync(SUBJECT, 'utf8')
    .match(/const ACCOUNT_PREFIXES = \[([^\]]*)\]/)[1]
    .match(/'([^']+)'/g).map(s => s.replace(/'/g, ''));

  for (const p of written) {
    assert.ok(declared.includes(p),
      `_accounts.ts writes ${p} keys but ACCOUNT_PREFIXES does not list it — ` +
      `an account key class would reach a committed mirror unclassified`);
  }
});

test('the corpus root is cwd-INVARIANT — the dangerous cwd is the one that still looks like home (F-2220-1)', () => {
  const dir = mirrorDir({ 'ledger-2026-08-30.db': ['session:abc'] });
  const fromRoot = spawnSync(process.execPath, [SUBJECT, '--dir', dir], { encoding: 'utf8', cwd: REPO });
  const fromSub = spawnSync(process.execPath, [SUBJECT, '--dir', dir],
    { encoding: 'utf8', cwd: path.join(REPO, 'scripts') });
  assert.ok(fromRoot.stdout.length > 0, 'control validity: the root arm must have produced output');
  assert.equal(fromRoot.status, fromSub.status);
  assert.equal(fromRoot.stdout, fromSub.stdout);
});

test('the DEFAULT dir is anchored to the script, not to the working directory', () => {
  // Relocating the script must move its default corpus with it — that is what
  // proves the anchor is import.meta.url rather than process.cwd().
  const home = keep(mkdtempSync(path.join(os.tmpdir(), 'gr-exposure-relocated-')));
  mkdirSync(path.join(home, 'scripts'));
  mkdirSync(path.join(home, 'artifacts', 'ledger-backups'), { recursive: true });
  cpSync(SUBJECT, path.join(home, 'scripts', 'ledger-mirror-exposure.mjs'));
  const db = new DatabaseSync(path.join(home, 'artifacts', 'ledger-backups', 'ledger-2026-08-30.db'));
  db.exec('create table kv (key text primary key, value text)');
  db.prepare('insert into kv (key, value) values (?, ?)').run('session:relocated', 'x');
  db.close();

  const r = spawnSync(process.execPath, [path.join(home, 'scripts', 'ledger-mirror-exposure.mjs')],
    { encoding: 'utf8', cwd: REPO });
  assert.equal(r.status, 1, 'the relocated copy must read ITS OWN artifacts dir, not the repo cwd');
  assert.match(r.stdout, /session:relocated/);
});

test('--dir without a path is "could not answer" (2), not a silent default', () => {
  const r = spawnSync(process.execPath, [SUBJECT, '--dir'], { encoding: 'utf8' });
  assert.equal(r.status, 2);
  assert.match(r.stdout, /CANNOT VERIFY/);
});

// ---------------------------------------------------------------------------
// REVERSE CONTROLS ON THE CURE ITSELF — each over-general "fix" must be caught
// by exactly the arm built for it, and by manufacturing rather than by argument.
// ---------------------------------------------------------------------------

test('MANUFACTURED: refusing on UNRECOGNISED unconditionally reds the lawful-growth arm', () => {
  const v = variantOf(
    "  if (args.strict && unrecognised.length) return 1;",
    "  if (unrecognised.length) return 1;");
  const r = runVariant(v, mirrorDir({ 'ledger-2026-08-30.db': ['weather:tuesday'] }));
  assert.equal(r.status, 1, 'the over-general variant must behave differently — else this arm is decoration');
});

test('MANUFACTURED: substring matching instead of prefix matching reds the not-a-prefix control', () => {
  const v = variantOf(
    "  if (ACCOUNT_PREFIXES.some(p => key.startsWith(p))) return 'account';",
    "  if (ACCOUNT_PREFIXES.some(p => key.includes(p))) return 'account';");
  const r = runVariant(v, mirrorDir({ 'ledger-2026-08-30.db': ['standings:s2:code:x'] }));
  assert.equal(r.status, 1, 'substring matching must be detectable — that is what the control asserts');
});

test('MANUFACTURED: treating an unreadable member as clean reds the denominator arm', () => {
  const v = variantOf('  if (unreadable.length) return 2;', '');
  const dir = mirrorDir(CLEAN);
  writeFileSync(path.join(dir, 'ledger-2026-08-30.db'), 'not sqlite');
  const r = runVariant(v, dir);
  assert.equal(r.status, 0, 'the variant must clear a board it could not read — that is the defect');
});

test('MANUFACTURED: dropping the always-on declaration reds the F-2208-1 arm', () => {
  const v = variantOf(
    "    console.log(`  keys inspected          : ${allKeys.length}`);",
    '');
  const r = runVariant(v, mirrorDir(CLEAN));
  assert.doesNotMatch(r.stdout, /keys inspected/,
    'the variant must lose the declaration — else that arm proves nothing');
});

test('MANUFACTURED: removing the refusals map recreates the blind spot', () => {
  const v = variantOf(
    "const TABLE_IDENTITY_COLUMNS = { refusals: ['anon_id', 'profile_name'] };",
    'const TABLE_IDENTITY_COLUMNS = {};');
  const r = runVariant(v, mirrorWith(`
    create table refusals (anon_id text, profile_name text);
    insert into refusals values ('session:exposed-rider', 'County Rider');
  `));
  assert.equal(r.status, 0, 'without the map the exposed identity is missed');
  assert.match(r.stdout, /refusals\[SKIPPED: no declared columns\]/);
});

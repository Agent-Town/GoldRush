/**
 * ledger-mirror-column-class-guard.test.mjs — teeth for F-2573-1.
 *
 * Subject: scripts/ledger-mirror-exposure.mjs, specifically SAFE_TABLE_COLUMNS —
 * the column-level verdict that lets a RELATIONAL column reach a class at all.
 *
 * WHY THIS EXISTS. A key/value namespace encodes its class IN THE VALUE
 * (`session:abc`), so the prefix classifier reaches a verdict on every key. A
 * relational column does not: `refusals.profile_name` is rider-chosen free text
 * and `refusals.anon_id` is a 32-hex digest, so neither can ever carry a prefix.
 * Both sat in UNRECOGNISED forever — and that bucket SHORT-CIRCUITS the ✅ CLEAN
 * verdict the LB-01 duty sends a fire to read before committing a mirror.
 * Measured s2573 on the live series: 250 unrecognised rows, 250 of them these
 * two columns, ZERO from `kv`, growing by 2x(table rows) with every daily
 * mirror. The forward-looking harm is signal burial — a genuinely new key class
 * arrives as line 251 in a block of 250 known-benign lines, exactly when the
 * standing gate arms (F-2353-2).
 *
 * THE DANGEROUS CURE, and the reason arm 3 is the most load-bearing assertion in
 * this file: marking a column safe BEFORE the account denylist would silence an
 * account identity written into that column. The denylist must win, always and
 * first. Arm 3 is that cure's reverse control.
 *
 * Every arm was proven by MANUFACTURING the defect on a scratch copy — a passing
 * guard never executes its violation path, so its green is not evidence about
 * its red (the s1299/s1300 standard). The sweep doubled as a reachability audit
 * (s2226's duty): every arm reds under at least one variant, so none is
 * decoration.
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, cpSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const TMP = [];
const keep = (d) => { TMP.push(d); return d; };
process.on('exit', () => { for (const d of TMP) rmSync(d, { recursive: true, force: true }); });

const REPO = fileURLToPath(new URL('..', import.meta.url));
const SUBJECT = path.join(REPO, 'scripts', 'ledger-mirror-exposure.mjs');

function mirrorWith(sql) {
  const dir = keep(mkdtempSync(path.join(os.tmpdir(), 'gr-colclass-')));
  const db = new DatabaseSync(path.join(dir, 'ledger-2026-09-14.db'));
  db.exec(sql);
  db.close();
  return dir;
}

function run(dir, extra = [], script = SUBJECT) {
  return spawnSync(process.execPath, [script, '--dir', dir, ...extra],
    { timeout: 240_000, killSignal: 'SIGKILL', encoding: 'utf8' });
}

/**
 * Assert a manufactured variant actually executed before believing it. A control
 * whose failure mode is silence cannot be told from the silence it measures
 * (F-2215-1); the sibling guard records that every one of its variant arms
 * passed VACUOUSLY on first writing for exactly this reason.
 */
function runVariant(script, dir, extra = []) {
  const r = run(dir, extra, script);
  assert.ok(r.stdout.length > 0,
    `control validity: the variant produced NO stdout (rc=${r.status}) — it did not run, ` +
    `so this arm proves nothing. stderr: ${r.stderr.slice(0, 300)}`);
  return r;
}

function variantOf(find, replace) {
  const src = readFileSync(SUBJECT, 'utf8');
  assert.ok(src.includes(find), `variant construction FAILED — anchor absent: ${find.slice(0, 80)}`);
  const dir = keep(mkdtempSync(path.join(os.tmpdir(), 'gr-colclass-variant-')));
  const file = path.join(dir, 'ledger-mirror-exposure.mjs');
  writeFileSync(file, src.replace(find, replace));
  // Since s2672 the subject imports the shared destination resolver by relative path
  // (scripts/ledger-mirror-dest.mjs). A variant lifted out of scripts/ must carry it, or
  // every mutation arm here dies on ERR_MODULE_NOT_FOUND — which LOOKS like the mutation
  // being caught and is nothing of the kind. The control-validity assertion in runVariant
  // is what turned that into a visible red rather than a silent vacuous pass.
  cpSync(path.join(REPO, 'scripts', 'ledger-mirror-dest.mjs'), path.join(dir, 'ledger-mirror-dest.mjs'));
  return file;
}

// The live shape of the refusals table, as measured s2573 against the 2026-09-14
// mirror: free-text display names and 32-hex anonymous ids, neither prefixable.
const REFUSALS_FIXTURE = `
  create table refusals (id integer primary key, reason text, contract_id text, anon_id text, profile_name text, refused_at integer);
  insert into refusals (reason, contract_id, anon_id, profile_name, refused_at)
    values ('rate_limited', 'e7-relay-rush', '9677a7e7ba4a1704cafa3f083b74e935', 'Claude Opus 5', 1788641297721);
  insert into refusals (reason, contract_id, anon_id, profile_name, refused_at)
    values ('bad_payload', 'the-claim', '3dab8a9d0000000000000000000000ff', 'sam', 1788783042640);
  create table kv (key text primary key, value text);
  insert into kv values ('standings:s2:alice', 'x');
`;

/**
 * DERIVED FROM THE SUBJECT, never transcribed (the F-2365-1 pattern): if anyone
 * edits the map, this guard starts asking about the NEW map in the same commit.
 * An underivable map REFUSES rather than passing vacuously (F-2217-1) — a loop
 * over nothing registers no assertions and reports success.
 */
async function declaredSafeColumns() {
  // Imported, not regex-scraped: a JS object literal is not JSON (unquoted keys,
  // single quotes), and my first draft of this helper died on exactly that.
  // Importing the subject is safe — its module-main check keeps main() from
  // running — and it is still DERIVED, so a map edit reaches this guard.
  const mod = await import(pathToFileURL(SUBJECT).href);
  assert.equal(typeof mod.safeTableColumns, 'function',
    'the subject no longer exports safeTableColumns() — this guard cannot answer');
  const map = mod.safeTableColumns();
  const pairs = Object.entries(map).flatMap(([t, cols]) => cols.map((c) => `${t}.${c}`));
  assert.ok(pairs.length > 0, 'SAFE_TABLE_COLUMNS is EMPTY — refusing rather than asserting nothing');
  return pairs;
}

// ── arm 1 ───────────────────────────────────────────────────────────────────
test('the column-class verdict is DECLARED on the happy path — a suppression nobody is shown cannot be re-judged (F-2208-1)', async () => {
  const r = run(mirrorWith(REFUSALS_FIXTURE));
  assert.equal(r.status, 0);
  assert.match(r.stdout, /column-class verdicts\s+:/);
  for (const pair of await declaredSafeColumns()) {
    assert.ok(r.stdout.includes(pair),
      `the declaration omits ${pair}, which the subject treats as county-standings by schema`);
  }
});

// ── arm 2 ───────────────────────────────────────────────────────────────────
test('free-text and hex column values reach a CLASS instead of sitting in UNRECOGNISED forever', () => {
  const r = run(mirrorWith(REFUSALS_FIXTURE));
  assert.equal(r.status, 0);
  assert.match(r.stdout, /unrecognised rows\s+: 0/);
  assert.match(r.stdout, /✅ CLEAN/);
  // The corpus must not SHRINK: the cure reclassifies, it does not stop looking.
  // 2 refusals rows x 2 columns + 1 kv key = 5.
  assert.match(r.stdout, /keys inspected\s+: 5/);
});

// ── arm 3 — THE REVERSE CONTROL FOR THE OVER-GENERAL CURE ───────────────────
test('REVERSE CONTROL: an account identity in a safe-classed column is STILL caught — the denylist wins first', () => {
  const r = run(mirrorWith(`
    create table refusals (anon_id text, profile_name text);
    insert into refusals values ('session:exposed-rider', 'County Rider');
  `));
  assert.equal(r.status, 1, 'an account prefix inside a mapped column must still REFUSE');
  assert.match(r.stdout, /ACCOUNT DATA IN A PLAINTEXT MIRROR/);
  assert.match(r.stdout, /session:exposed-rider/);
  assert.match(r.stdout, /account-class rows\s+: 1/);
});

// ── arm 4 ───────────────────────────────────────────────────────────────────
test('the DISCOVERY channel survives: an unknown kv prefix still warns and still suppresses CLEAN', () => {
  const r = run(mirrorWith(`
    create table kv (key text primary key, value text);
    insert into kv values ('wallet:tuesday', 'x');
    create table refusals (anon_id text, profile_name text);
    insert into refusals values ('9677a7e7ba4a1704cafa3f083b74e935', 'sam');
  `));
  assert.equal(r.status, 0, 'an unrecognised class warns, it does not refuse by default');
  assert.match(r.stdout, /unrecognised rows\s+: 1/);
  assert.match(r.stdout, /wallet:tuesday/);
  assert.doesNotMatch(r.stdout, /✅ CLEAN/);
});

// ── arm 5 ───────────────────────────────────────────────────────────────────
test('--strict still reds on a genuinely unrecognised class, and no longer on a permanently-unclearable column', () => {
  const unknown = run(mirrorWith(`
    create table kv (key text primary key, value text);
    insert into kv values ('wallet:tuesday', 'x');
  `), ['--strict']);
  assert.equal(unknown.status, 1, '--strict must still red on a class nobody has judged');

  const columnsOnly = run(mirrorWith(REFUSALS_FIXTURE), ['--strict']);
  assert.equal(columnsOnly.status, 0, '--strict must not red on a column whose class is already decided');
});

// ── arm 6 ───────────────────────────────────────────────────────────────────
test('an unmapped table is still SKIPPED and NAMED — a column-class verdict is not a licence to stop looking', () => {
  const r = run(mirrorWith(`
    create table weather (forecast text);
    insert into weather values ('sunny');
    create table kv (key text primary key, value text);
    insert into kv values ('standings:s2:alice', 'x');
  `));
  assert.equal(r.status, 0);
  assert.match(r.stdout, /weather\[SKIPPED: no declared columns\]/);
  assert.match(r.stdout, /✅ CLEAN/);
});

// ── MANUFACTURED VARIANTS ───────────────────────────────────────────────────

test('MANUFACTURED: the pre-cure classifier buries the column values in UNRECOGNISED and cannot reach CLEAN', () => {
  const v = variantOf(
    '  if (site && (SAFE_TABLE_COLUMNS[site.table] ?? []).includes(site.column)) return \'safe\';\n',
    '');
  const r = runVariant(v, mirrorWith(REFUSALS_FIXTURE));
  assert.match(r.stdout, /unrecognised rows\s+: 4/);
  assert.doesNotMatch(r.stdout, /✅ CLEAN/);
});

test('MANUFACTURED: checking the column verdict BEFORE the denylist silences an exposed account identity', () => {
  const v = variantOf(
    "  if (ACCOUNT_PREFIXES.some(p => key.startsWith(p))) return 'account';\n  if (SAFE_PREFIXES.some(p => key.startsWith(p))) return 'safe';\n",
    "  if (site && (SAFE_TABLE_COLUMNS[site.table] ?? []).includes(site.column)) return 'safe';\n  if (ACCOUNT_PREFIXES.some(p => key.startsWith(p))) return 'account';\n  if (SAFE_PREFIXES.some(p => key.startsWith(p))) return 'safe';\n");
  const r = runVariant(v, mirrorWith(`
    create table refusals (anon_id text, profile_name text);
    insert into refusals values ('session:exposed-rider', 'County Rider');
  `));
  assert.equal(r.status, 0, 'the over-general cure clears an account row — this is the defect arm 3 exists for');
  assert.match(r.stdout, /account-class rows\s+: 0/);
});

test('MANUFACTURED: dropping the declaration hides the suppression while the counts still move', () => {
  const v = variantOf('  column-class verdicts   : ', '  suppressed-quietly      : ');
  const r = runVariant(v, mirrorWith(REFUSALS_FIXTURE));
  assert.doesNotMatch(r.stdout, /column-class verdicts/);
  assert.match(r.stdout, /unrecognised rows\s+: 0/);
});

test('MANUFACTURED: a blanket column-safe rule (any harvested column) swallows the discovery channel', () => {
  const v = variantOf(
    "  if (site && (SAFE_TABLE_COLUMNS[site.table] ?? []).includes(site.column)) return 'safe';",
    "  if (site && site.column) return 'safe';");
  const r = runVariant(v, mirrorWith(`
    create table kv (key text primary key, value text);
    insert into kv values ('wallet:tuesday', 'x');
  `));
  assert.match(r.stdout, /unrecognised rows\s+: 0/,
    'the blanket rule classes an unjudged kv key as safe — arm 4 is its reverse control');
});

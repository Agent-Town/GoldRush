// F-2602-1 — the modified-tracked census attributes EVERY non-SAFE bucket, not the
// desk figure alone.
//
// WHY THIS EXISTS. `modified-tracked-evidence-census.mjs` prints all four buckets "so
// the predicate is visible" (F-2560-1) and, until s2602, applied `isFactorySide()` to the
// AT RISK bucket ONLY. Measured s2602 on the live board, LOCAL-REF-ONLY was 1048 files /
// 1350.9 MB — 3x the desk figure — with no owner printed anywhere, and OWNERSHIP IS THE
// FIELD THAT DECIDES WHETHER A FIRE MAY TOUCH A TREE AT ALL (F-2561-1). A fire reading a
// four-figure pile it cannot attribute either ignores it or reaches into an attended
// tree, which is the Mistake #2 direction F-2489-1 forbids.
//
// SEVERITY, STATED HONESTLY: LATENT. FACTORY-SIDE measured 0 in all three non-SAFE
// buckets when this landed, so nothing was ever mis-attributed and no verdict was wrong.
//
// WHY A FIXTURE AND NOT THE LIVE BOARD. Two measured reasons, not style. (1) COST: run
// against the real registry this guard is ~72 s (127 worktrees, three spawns), and
// F-2159-1 prices a >=30 s battery addition as OWNER policy rather than a fire's
// drive-by; on the fixture it is ~1 s. (2) REACHABILITY, which matters more: FACTORY-SIDE
// is 0 in every non-SAFE bucket on the live board and has been for the tool's whole life,
// so a live-board guard can only ever observe the ALL-CLEAR — it would assert the
// principle exactly where it holds and never where it fails, which is the blind spot
// F-2208-1 names. The fixture manufactures a factory-side row in AT RISK *and* in
// LOCAL-REF-ONLY, so the arm that actually protects a fire is exercised.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));      // anchored, never process.cwd() (F-2220-1)
const SUBJECT = join(HERE, 'modified-tracked-evidence-census.mjs');
const SRC = readFileSync(SUBJECT, 'utf8');
const BUCKETS = ['AT RISK', 'UNREFERENCED', 'LOCAL-REF-ONLY'];

let root;          // has FACTORY-SIDE bytes in AT RISK *and* in LOCAL-REF-ONLY
let rootLocalOnly; // has FACTORY-SIDE bytes in LOCAL-REF-ONLY ONLY — AT RISK is attended
const bases = [];

function run(args = [], at = root) {
  try {
    return { rc: 0, out: execFileSync('node', [SUBJECT, '--root', at, ...args],
      { cwd: at, encoding: 'utf8', maxBuffer: 64 << 20, timeout: 240_000, killSignal: 'SIGKILL' }) };
  } catch (e) { return { rc: e.status, out: String(e.stdout || ''), err: String(e.stderr || '') }; }
}

// factoryAtRisk=false builds the DIVERGENCE case: without it, a fixture carrying factory
// bytes in both buckets makes the correct rule and the over-general one agree, and the
// reverse control below passes while measuring nothing. (Found by the teeth sweep, s2602 —
// it reddened NOTHING against the over-general variant until this second root existed.)
function buildFixture({ factoryAtRisk }) {
  const base = mkdtempSync(join(tmpdir(), 's2602-census-'));
  bases.push(base);
  const r = join(base, 'repo');
  const origin = join(base, 'origin.git');
  const g = (args, opts = {}) =>
    execFileSync('git', args, { cwd: r, encoding: 'utf8', maxBuffer: 64 << 20, ...opts }).trim();
  execFileSync('git', ['init', '--bare', '-q', origin]);
  execFileSync('git', ['init', '-q', '-b', 'main', r]);
  g(['config', 'user.email', 'f@x']); g(['config', 'user.name', 'f']);
  g(['remote', 'add', 'origin', origin]);

  // Tracked, pushed evidence files: their COMMITTED blobs are remote-reachable, so an
  // on-disk modification of them is exactly what this census is about.
  mkdirSync(join(r, 'artifacts'), { recursive: true });
  writeFileSync(join(r, 'artifacts', 'atrisk.log'), 'committed\n');
  writeFileSync(join(r, 'artifacts', 'local.log'), 'committed\n');
  g(['add', 'artifacts/atrisk.log', 'artifacts/local.log']);
  g(['commit', '-qm', 'base']);
  g(['branch', '-q', 'lane-a']);
  g(['push', '-q', 'origin', 'main']);

  // FACTORY-SIDE LOCAL-REF-ONLY: modified on disk, that exact blob held by a LOCAL ref
  // only (a parentless save/* commit — the salvage shape), never pushed. Root is
  // factory-side by isFactorySide's own rule.
  const body = 'held by a local ref only\n';
  writeFileSync(join(r, 'artifacts', 'local.log'), body);
  const blob = g(['hash-object', '-w', '--stdin'], { input: body });
  const idx = join(base, 'tmp-index');
  const env = { ...process.env, GIT_INDEX_FILE: idx };
  g(['update-index', '--add', '--cacheinfo', `100644,${blob},artifacts/local.log`], { env });
  const tree = g(['write-tree'], { env });
  g(['update-ref', 'refs/heads/save/fixture', g(['commit-tree', tree, '-m', 'salvage'], { env })]);

  // An ATTENDED tree: a linked worktree whose path is not worktrees/lane-[a-d].
  const attended = join(base, 'attended-tree');
  g(['worktree', 'add', '-q', attended, 'lane-a']);
  writeFileSync(join(attended, 'artifacts', 'atrisk.log'), 'attended, never hashed\n');

  // AT RISK (in no object database) — factory-side only when asked for.
  if (factoryAtRisk) writeFileSync(join(r, 'artifacts', 'atrisk.log'), 'never hashed anywhere\n');
  return r;
}

before(() => {
  root = buildFixture({ factoryAtRisk: true });
  rootLocalOnly = buildFixture({ factoryAtRisk: false });
});

after(() => { for (const b of bases) { try { rmSync(b, { recursive: true, force: true }); } catch {} } });

test('control: the fixture census really ran and classified subjects', () => {
  const r = run();
  assert.equal(r.rc, 0, `census failed: ${r.err || ''}`);
  assert.ok(r.out.length > 300, `expected a populated census, got ${r.out.length} B`);
  assert.match(r.out, /MODIFIED-TRACKED EVIDENCE CENSUS/);
  // Ground truth asserted BEFORE any verdict is believed (F-2215-1): if the fixture
  // produced no factory-side rows at all, every arm below would pass vacuously.
  const j = JSON.parse(run(['--json']).out);
  assert.ok(j.subjects >= 3, `fixture produced only ${j.subjects} subject(s)`);
  assert.ok(j.factorySideAtRisk >= 1, 'fixture must manufacture a FACTORY-SIDE AT RISK row');
  assert.ok(j.buckets['LOCAL-REF-ONLY'].files >= 1, 'fixture must manufacture a LOCAL-REF-ONLY row');
});

test('the per-bucket ownership section is printed', () => {
  assert.match(run().out, /ownership BY BUCKET/,
    'the census must attribute every non-SAFE bucket, not the desk figure alone');
});

test('every non-SAFE bucket carries its own FACTORY-SIDE/attended split', () => {
  const out = run().out;
  const section = out.slice(out.indexOf('ownership BY BUCKET'));
  for (const b of BUCKETS) {
    const line = section.split('\n').find((l) => l.includes(b) && l.includes('FACTORY-SIDE'));
    assert.ok(line, `bucket ${b} has no ownership line`);
    assert.match(line, /attended/, `bucket ${b}'s ownership line names no attended count`);
  }
});

test('a FACTORY-SIDE LOCAL-REF-ONLY row is NAMED — the arm the live board can never reach', () => {
  const out = run().out;
  const section = out.slice(out.indexOf('ownership BY BUCKET'));
  const local = section.split('\n');
  const i = local.findIndex((l) => l.includes('LOCAL-REF-ONLY'));
  assert.ok(i !== -1);
  assert.doesNotMatch(local[i], /FACTORY-SIDE\s+0 file/,
    'the fixture holds a factory-side LOCAL-REF-ONLY file; a count of 0 means the bucket is not being attributed');
  // and the tree holding it must be NAMED — a count with no path is not actionable.
  const named = local.slice(i + 1).find((l) => l.includes('FACTORY'));
  assert.ok(named && /\/\S+/.test(named),
    `a factory-side bucket must name the tree holding it; got ${JSON.stringify(named)}`);
});

test('the declaration prints on the ALL-CLEAR too, not only when something is wrong (F-2208-1)', () => {
  const out = run().out;
  const section = out.slice(out.indexOf('ownership BY BUCKET'));
  const unref = section.split('\n').find((l) => l.includes('UNREFERENCED'));
  assert.match(unref, /FACTORY-SIDE\s+0 file/,
    'UNREFERENCED is empty in the fixture and its all-clear row must still print; a declaration must not be conditional on failure');
});

test('the section warns that a non-SAFE verdict is not by itself an owed act (F-2570-1/F-2571-1)', () => {
  const section = run().out;
  assert.match(section, /retention transform/,
    'without this, a reader treats LOCAL-REF-ONLY as a durability hole and pushes bytes already on origin');
  assert.match(section, /F-2570-1|F-2571-1/);
});

test('--json carries the same fact, for every non-SAFE bucket', () => {
  const r = run(['--json']);
  assert.equal(r.rc, 0);
  const j = JSON.parse(r.out);
  assert.ok(j.ownershipByBucket, '--json must carry ownershipByBucket');
  for (const b of BUCKETS) {
    assert.ok(j.ownershipByBucket[b], `--json ownershipByBucket lacks ${b}`);
    assert.equal(typeof j.ownershipByBucket[b].factorySide.files, 'number');
    assert.equal(typeof j.ownershipByBucket[b].attended.files, 'number');
  }
  assert.ok(j.ownershipByBucket['LOCAL-REF-ONLY'].factorySide.files >= 1,
    'the fixture\'s factory-side LOCAL-REF-ONLY file must be attributed in --json too');
});

test('--json still carries the pre-existing desk keys (behaviour-neutral, F-1274-2)', () => {
  const j = JSON.parse(run(['--json']).out);
  for (const k of ['deskFigure', 'nonSafe', 'buckets', 'factorySideAtRisk', 'attendedAtRisk'])
    assert.ok(k in j, `the cure dropped the pre-existing key ${k}`);
});

test('REVERSE CONTROL: --strict still keys on FACTORY-SIDE AT RISK alone', () => {
  // The over-general cure — reddening --strict on ANY non-SAFE factory bytes — would red
  // this battery the day an attended tree drifts (F-1460-1, the cross-engine fate).
  // THE DIVERGENCE FIXTURE IS WHAT MAKES THIS ARM REAL: rootLocalOnly has factory bytes in
  // LOCAL-REF-ONLY and NONE in AT RISK, so the correct rule exits 0 there and the
  // over-general one exits 1. Measured on the both-buckets fixture the two rules AGREE,
  // and this arm reddened nothing at all (s2602 teeth sweep).
  const j = JSON.parse(run(['--json'], rootLocalOnly).out);
  assert.equal(j.factorySideAtRisk, 0, 'divergence fixture must have NO factory-side AT RISK');
  assert.ok(j.ownershipByBucket['LOCAL-REF-ONLY'].factorySide.files >= 1,
    'divergence fixture must have factory-side LOCAL-REF-ONLY bytes, else the rules cannot diverge');
  assert.equal(run(['--strict'], rootLocalOnly).rc, 0,
    '--strict must still be decided by FACTORY-SIDE AT RISK and nothing else');

  // and the ordinary direction still bites where it should
  const jBoth = JSON.parse(run(['--json']).out);
  assert.ok(jBoth.factorySideAtRisk >= 1);
  assert.equal(run(['--strict']).rc, 1, '--strict must still red on factory-side AT RISK bytes');
});

test('the ownership predicate is the subject\'s own isFactorySide, not a second copy (F-1261-1)', () => {
  const src = SRC.replace(/\/\/[^\n]*/g, '');     // needle must select the CODE, not the comment
  assert.match(src, /ownershipByBucket/, 'the json field must be built in the subject');
  assert.ok((src.match(/isFactorySide\(/g) || []).length >= 3,
    'the per-bucket read must call the shared isFactorySide, never re-implement the rule');
});

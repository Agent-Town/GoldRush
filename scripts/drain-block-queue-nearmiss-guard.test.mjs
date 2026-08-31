// F-2390-1 (s2390) — THE --queue ARM'S UNKNOWN BRANCH THROWS AWAY A NEAR-MISS IT ALREADY RESOLVED.
//
// scripts/drain-block-check.mjs finds leaves by BIDIRECTIONAL SUBSTRING (:396), so a master renamed
// with a prefix still finds its own leaf. The --queue arm (:679) then demands EXACT normalized
// equality, finds nothing, and falls to "? UNKNOWN — no goal leaf matches" while `hits` holds the
// very leaf that would have refused the dispatch. `normalize` (:383) strips a directory, an
// extension, a run stamp and a slot label — never an arbitrary prefix.
//
// MEASURED LIVE s2390 on the SAME master, byte-identical content (sha256 verified), the ONLY
// variable being the filename; the path was control-isolated and is NOT the cause:
//   lane-d-toolsurface-terrain-edge.md                   -> ⛔ ALREADY SHIPPED  rc=1
//   tasks/lane-d-toolsurface-terrain-edge.md             -> ⛔ ALREADY SHIPPED  rc=1
//   s2382-PARKED-armed-duplicate-dispatch-<same>.md      -> ? UNKNOWN           rc=0
// The parked copy is real and sits in tasks/queue-paused/ — the directory §2E tells a fire to
// re-queue from "once the pile is below 2". So the ACT OF PARKING a master, which is how a fire
// marks it dangerous, is what removes it from the guard that would refuse it.
//
// The cure DECLARES and never refuses, so verdict and exit code are asserted UNCHANGED throughout:
// a declaration that starts blocking drains is a regression, not a stronger guard (F-1460-1).
// EVERY RED ARM IS PROVEN BY MANUFACTURING THE DEFECT on a scratch copy, and each reverse control
// exists to catch one specific over-general cure.
import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SUBJECT = join(HERE, 'drain-block-check.mjs');
const SOURCE = readFileSync(SUBJECT, 'utf8');

const DECLARATION = 'NEAR-MISS';

// F-2393-3 (cured s2394): every board() root is registered and removed in ONE top-level `after`,
// rather than the house `t.after(...)` idiom. Deliberate: board() has ten call sites and takes no
// test context, so a per-site hook is ten chances to forget — and an eleventh test added later
// would leak silently until `fixture-teardown` reds the WHOLE node-guards battery on main, which
// is exactly what this cure is repairing.
const FIXTURE_ROOTS = [];
after(() => {
  for (const root of FIXTURE_ROOTS) rmSync(root, { recursive: true, force: true });
});

function board({ leaves, masters = [] }) {
  const root = mkdtempSync(join(tmpdir(), 's2390-nearmiss-'));
  FIXTURE_ROOTS.push(root);
  mkdirSync(join(root, 'tasks', 'done'), { recursive: true });
  mkdirSync(join(root, 'tasks', 'queue-paused'), { recursive: true });
  for (const m of masters) writeFileSync(join(root, 'tasks', m), `# ${m}\n`);
  writeFileSync(join(root, 'tasks', 'goals.json'), JSON.stringify({ id: 'root', children: leaves }, null, 2));
  return root;
}

// The copy must live in scripts/ so the module-main guard and relative resolution behave; a /tmp
// copy can silently never run (F-2215-1's trap), which looks exactly like the silence under test.
function run(scriptText, root, args) {
  const shadow = join(HERE, `tmp-s2390-shadow-${process.pid}-${Math.abs(hash(scriptText))}.mjs`);
  writeFileSync(shadow, scriptText);
  try {
    const r = spawnSync('node', [shadow, ...args], { cwd: root, encoding: 'utf8' });
    return { out: (r.stdout ?? '') + (r.stderr ?? ''), rc: r.status };
  } finally {
    rmSync(shadow, { force: true });
  }
}
function hash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; }

/** Assert an edit actually matched, so a variant can never pass by editing nothing (s2223). */
function variantOf(find, replace) {
  assert.ok(SOURCE.includes(find), `variant precondition: source must contain ${JSON.stringify(find.slice(0, 60))}`);
  return SOURCE.replace(find, replace);
}

// The defect fixture: a SHIPPED master, parked under a prefixed name. The prefixed name is what a
// fire actually types when it obeys §2E and re-queues from tasks/queue-paused/.
const SHIPPED_LEAF = {
  id: 'toolsurface-terrain-edge',
  taskFile: 'lane-d-toolsurface-terrain-edge.md',
  status: 'merged',
  mergeHash: '0d718cead13908c1f9277e7335d19e75ddf37d90',
};
const PARKED = 's2382-PARKED-armed-duplicate-dispatch-lane-d-toolsurface-terrain-edge.md';
const FIXTURE = { leaves: [SHIPPED_LEAF], masters: ['lane-d-toolsurface-terrain-edge.md'] };

// A subject that matches NOTHING — the 524-master majority case. The declaration must stay silent
// here or it becomes the always-on noise that decays a declaration into a formality (F-2224).
const NO_HITS = { leaves: [{ id: 'unrelated-thing', taskFile: 'lane-a-unrelated-thing.md', status: 'merged', mergeHash: 'b'.repeat(40) }] };

test('1. the parked name declares the near-miss it silently discarded', () => {
  const root = board(FIXTURE);
  const { out } = run(SOURCE, root, ['--queue', PARKED]);
  assert.match(out, /\? UNKNOWN/, 'precondition: this subject must still reach the UNKNOWN branch');
  assert.match(out, new RegExp(DECLARATION), 'the near-miss must be declared, not discarded');
});

test('2. the declaration names the leaf, its status and its merge hash', () => {
  const root = board(FIXTURE);
  const { out } = run(SOURCE, root, ['--queue', PARKED]);
  assert.match(out, /toolsurface-terrain-edge/, 'must name the leaf a fire has to go ask about');
  assert.match(out, /status="merged"/, 'a bare name is not actionable — the STATUS is the warning');
  assert.match(out, /0d718cea/, 'the merge hash is what proves the work already landed');
});

test('3. it DECLARES and does not refuse — verdict and rc are unchanged', () => {
  const root = board(FIXTURE);
  const { out, rc } = run(SOURCE, root, ['--queue', PARKED]);
  assert.equal(rc, 0, 'advisory default must stay 0; refusing here would red lawful unregistered work');
  assert.match(out, /\? UNKNOWN/);
  assert.doesNotMatch(out, /⛔ ALREADY SHIPPED/, 'the verdict must not be upgraded by a declaration');
});

test('4. --strict still separates "could not answer" (2) from "answered and refuses" (1)', () => {
  const root = board(FIXTURE);
  const { rc } = run(SOURCE, root, ['--queue', PARKED, '--strict']);
  assert.equal(rc, 2, 'UNKNOWN under --strict is 2 — the declaration must not change that');
});

test('5. SILENT when nothing matches — the 524-master majority path gains no noise', () => {
  const root = board(NO_HITS);
  const { out, rc } = run(SOURCE, root, ['--queue', 'lane-c-totally-different-subject.md']);
  assert.match(out, /\? UNKNOWN/);
  assert.doesNotMatch(out, new RegExp(DECLARATION), 'a declaration on every UNKNOWN is noise, not signal');
  assert.equal(rc, 0);
});

test('6. the REGISTERED name still refuses, and says nothing about near-misses', () => {
  const root = board(FIXTURE);
  const { out, rc } = run(SOURCE, root, ['--queue', 'lane-d-toolsurface-terrain-edge.md']);
  assert.equal(rc, 1, 'the exact name must still hit the Mistake #8 refusal');
  assert.match(out, /⛔ ALREADY SHIPPED/);
  assert.doesNotMatch(out, new RegExp(DECLARATION), 'a resolved subject has no near-miss to report');
});

test('7. scoped to --queue: a branch-shaped subject gets no near-miss', () => {
  // :656 rules that a branch matching a leaf by substring is "noise, not clearance". Declaring one
  // would advertise exactly the coincidence that comment forbids acting on.
  const root = board(FIXTURE);
  const { out } = run(SOURCE, root, ['lane/toolsurface-terrain-edge']);
  assert.doesNotMatch(out, new RegExp(DECLARATION), 'branch names must not draw a near-miss line');
});

// --- reverse controls: each catches one specific over-general cure -----------------------------

test('8. REVERSE CONTROL — the pre-cure file is silent on the defect fixture', () => {
  const preCure = variantOf('    if (queueTaskFile && hits.length) {', '    if (false && queueTaskFile && hits.length) {');
  const root = board(FIXTURE);
  const { out, rc } = run(preCure, root, ['--queue', PARKED]);
  assert.match(out, /\? UNKNOWN/, 'the pre-cure arm must still RUN — a crash here is not evidence');
  assert.doesNotMatch(out, new RegExp(DECLARATION), 'this is the defect: the near-miss is discarded');
  assert.equal(rc, 0, 'and it clears at rc=0, which is why the label was the only defence');
});

test('9. REVERSE CONTROL — dropping the hits guard makes it fire on every UNKNOWN', () => {
  // The obvious over-general cure. It passes arms 1-4 and 6 and is caught only by the silence arm.
  const overGeneral = variantOf('    if (queueTaskFile && hits.length) {', '    if (queueTaskFile) {');
  const root = board(NO_HITS);
  const { out } = run(overGeneral, root, ['--queue', 'lane-c-totally-different-subject.md']);
  assert.match(out, new RegExp(DECLARATION), 'precondition: this variant really does over-fire');
  // i.e. arm 5 is what stands between the cure and an always-on formality.
});

test('10. REVERSE CONTROL — a cure that REFUSES instead of declaring breaks the advisory default', () => {
  const refusing = variantOf('    process.exit(strict ? 2 : 0);', '    process.exit(hits.length ? 1 : (strict ? 2 : 0));');
  const root = board(FIXTURE);
  const { rc } = run(refusing, root, ['--queue', PARKED]);
  assert.equal(rc, 1, 'precondition: this variant really does refuse');
  // Arms 3 and 4 are what catch it — an unregistered master is lawful and must not red.
});

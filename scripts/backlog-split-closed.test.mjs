/**
 * backlog-split-closed.test.mjs — the split must move only CLOSED rows, keep every byte, and
 * carry the citation ratchet across with it.
 *
 * WHY EACH ARM EXISTS. The reader map measured what a careless split costs
 * (docs/ledger-shape-reader-map-2026-09-24.md): a positional cut would have taken 51 OPEN rows,
 * the single `^OWNER:` row, 416 `GATE:` rows and 47 RULED rows off the live index, and
 * `citation-title-guard` would have redded on 72 of its 74 `tasks/BACKLOG.md::` baseline keys. So
 * the arms below manufacture exactly those defects: an open row that must not move, a desk row
 * that must not move, a baseline key that cannot be placed, an accounting that does not balance.
 *
 * EVERY DESTRUCTIVE ARM RUNS AGAINST A `mkdtemp` FIXTURE AND `--root`. The branch that ships this
 * tool never runs `--apply` on its own `tasks/BACKLOG.md`.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const TOOL = fileURLToPath(new URL('./backlog-split-closed.mjs', import.meta.url));
const DEPS = ['ledger-corpus.mjs', 'findings-state-guard.mjs'];
const SCRIPTS = path.dirname(TOOL);

const TITLE = '# Task backlog — the refill ladder (COMPLETE work ledger)';

/** The board every arm starts from: rows above the title, an open row, a keeper of each class. */
const BOARD = [
  '✅ **F-9100-1 — CLOSED s9100, ABOVE the title and therefore untouchable.**',
  '🔺 **F-9100-2 — OWNER\'S DESK (2026-09-20): a live desk item.**',
  '',
  TITLE,
  '',
  '## 2026-07-27 — a dated wave heading, which is a date and not an epic',
  '- ✅ **F-9101-1 SHIPPED s9101 — `abc1234`.** the bullet-led closure shape, the commonest one',
  '✅ **F-9101-2 CLOSED s9102 — measured, not ruled.**',
  '🟡 **F-9101-3 — OPEN, and open rows never move however old they are.** see `e2e/zz-fixture.spec.ts:7` for the red',
  '✅ **F-9101-4 CLOSED s9103 — GATE: the owner still owes a word on the follow-up.**',
  '✅ **F-9101-5 CLOSED s9104 — RULED by the owner 2026-07-28.**',
  '✅ **F-9101-6 CLOSED s9105 — 🔺 still on the desk for its remainder.**',
  'OWNER: a row the dashboard desk panel greps by its leading token, ✅ CLOSED or not.',
  '',
  '## 🚂 E2 COMPLETION — THE ACTIVE ERA PROGRAM (an epic, so it keeps its own file)',
  '✅ **F-9102-1 CLOSED s9106 — the stamp mill lit.**',
  '',
];

const BASELINE = { grandfathered: { 'tasks/BACKLOG.md::e2e/zz-fixture.spec.ts:7': 1, 'reviews/x.md::e2e/other.spec.ts:1': 2 } };

function fixture(t, lines = BOARD, baseline = BASELINE) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'backlog-split-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.mkdirSync(path.join(dir, 'tasks'));
  fs.mkdirSync(path.join(dir, 'scripts'));
  fs.writeFileSync(path.join(dir, 'tasks', 'BACKLOG.md'), `${lines.join('\n')}\n`);
  if (baseline !== null) {
    fs.writeFileSync(path.join(dir, 'scripts', 'citation-title-baseline.json'), `${JSON.stringify(baseline, null, 2)}\n`);
  }
  return dir;
}

function run(root, args = [], tool = TOOL) {
  const r = spawnSync(process.execPath, [tool, '--root', root, ...args], {
    encoding: 'utf8', timeout: 240_000, killSignal: 'SIGKILL',
  });
  return { rc: r.status, out: String(r.stdout ?? ''), err: String(r.stderr ?? '') };
}

const indexOf = (root) => fs.readFileSync(path.join(root, 'tasks', 'BACKLOG.md'), 'utf8');
const partOf = (root, key) => fs.readFileSync(path.join(root, 'tasks', 'backlog', `${key}.md`), 'utf8');
const partList = (root) => {
  try { return fs.readdirSync(path.join(root, 'tasks', 'backlog')).sort(); } catch { return []; }
};
const baselineOf = (root) =>
  JSON.parse(fs.readFileSync(path.join(root, 'scripts', 'citation-title-baseline.json'), 'utf8')).grandfathered;

// ── 1. DRY-RUN ANSWERS AND WRITES NOTHING ──────────────────────────────────────────────────
test('--dry-run states rows, bytes and keys per destination and leaves the tree untouched', (t) => {
  const root = fixture(t);
  const before = indexOf(root);
  const r = run(root, ['--dry-run']);
  assert.equal(r.rc, 0, r.out + r.err);
  assert.match(r.out, /^BALANCE .*-> BALANCED$/m);
  assert.match(r.out, /tasks\/backlog\/closed-2026-07\.md\s+2 row\(s\)/, 'a dated wave collapses to its month');
  assert.match(r.out, /tasks\/backlog\/e2-completion\.md\s+1 row\(s\)/, 'a named epic keeps its own key');
  assert.equal(indexOf(root), before, 'a dry run that writes is not a dry run');
  assert.deepEqual(partList(root), [], 'and it creates no directory');
});

// ── 2. STATE, NOT POSITION: WHAT MOVES AND WHAT MUST NOT ───────────────────────────────────
test('--apply moves closed rows below the title and keeps open, desk, gate, RULED and OWNER rows', (t) => {
  const root = fixture(t);
  const r = run(root, ['--apply']);
  assert.equal(r.rc, 0, r.out + r.err);
  const index = indexOf(root);

  // MOVED
  for (const id of ['F-9101-1', 'F-9101-2']) {
    assert.ok(!index.includes(id), `${id} is a plain closed row below the title and moves`);
    assert.ok(partOf(root, 'closed-2026-07').includes(id), `${id} landed in its month file`);
  }
  assert.ok(partOf(root, 'e2-completion').includes('F-9102-1'), 'the epic row landed under its epic key');

  // KEPT, each for its own named reason
  assert.ok(index.includes('F-9100-1'), 'a CLOSED row ABOVE the title never moves');
  assert.ok(index.includes('F-9100-2'), 'nor does the desk row above it');
  assert.ok(index.includes('F-9101-3'), 'an OPEN row never moves');
  assert.ok(index.includes('F-9101-4'), 'a GATE: row stays — dashboard-gen.sh greps the blocked panel from it');
  assert.ok(index.includes('F-9101-5'), 'a RULED row stays — ruling-propagation-guard reads it');
  assert.ok(index.includes('F-9101-6'), 'a 🔺 row stays even when its subject is ✅');
  assert.match(index, /^OWNER: a row the dashboard/m, 'the ^OWNER: row stays for the desk panel');
  for (const why of ['1 gate', '1 RULED', '1 desk', '1 OWNER']) {
    assert.ok(r.out.includes(why), `the accounting must name why each keeper was kept — missing "${why}"`);
  }

  // HEADINGS AND THE POINTER
  assert.ok(index.includes(TITLE), 'the H1 stays');
  assert.match(index, /^## 2026-07-27 — a dated wave heading/m, 'the H2 stays');
  assert.match(index, /^→ `tasks\/backlog\/closed-2026-07\.md` — 2 closed row\(s\) moved there/m,
    'and the emptied section carries a pointer, so a reader is never left at a hole');
});

test('every byte that left the index is in a part file, plus the headers and pointers it added', (t) => {
  const root = fixture(t);
  const before = Buffer.byteLength(indexOf(root));
  const r = run(root, ['--apply']);
  assert.equal(r.rc, 0, r.out + r.err);
  const after = Buffer.byteLength(indexOf(root));
  const parts = partList(root).reduce(
    (sum, file) => sum + Buffer.byteLength(fs.readFileSync(path.join(root, 'tasks', 'backlog', file), 'utf8')), 0,
  );
  const headers = Number(r.out.match(/\+ headers (\d+)/)[1]);
  const pointers = Number(r.out.match(/\+ pointers (\d+)/)[1]);
  assert.equal(before + headers + pointers, after + parts, 'bytes in === bytes out plus what it added');
});

// ── 3. IDEMPOTENCE ─────────────────────────────────────────────────────────────────────────
test('a second --apply moves nothing, doubles no pointer and changes no byte', (t) => {
  const root = fixture(t);
  run(root, ['--apply']);
  const index1 = indexOf(root);
  const part1 = partOf(root, 'closed-2026-07');

  const second = run(root, ['--apply']);
  assert.equal(second.rc, 0, second.out + second.err);
  assert.match(second.out, /^moving\s+: 0 row\(s\)/m);
  assert.equal(indexOf(root), index1, 'the index is byte-identical after the second run');
  assert.equal(partOf(root, 'closed-2026-07'), part1, 'and so is the part — no duplicated rows');
  assert.equal((indexOf(root).match(/^→ `tasks\/backlog\/closed-2026-07\.md`/gm) || []).length, 1,
    'exactly one pointer, not one per run');
});

// ── 4. THE CITATION RATCHET CROSSES WITH THE ROWS ──────────────────────────────────────────
test('a baseline key follows the row that carried its citation, and the allowance is not grown', (t) => {
  // The SAME citation, moved off the open row (where the default board keeps it) and onto a
  // closed one, so this arm isolates the travelling case from the staying case.
  const root = fixture(t, BOARD.map((line) => (
    line.startsWith('🟡 **F-9101-3') ? '🟡 **F-9101-3 — OPEN, and open rows never move.**'
      : line.startsWith('✅ **F-9101-2') ? `${line} see \`e2e/zz-fixture.spec.ts:7\` for the red`
        : line)));
  const r = run(root, ['--apply']);
  assert.equal(r.rc, 0, r.out + r.err);
  const after = baselineOf(root);
  assert.equal(after['tasks/backlog/closed-2026-07.md::e2e/zz-fixture.spec.ts:7'], 1,
    'the key moved with the row — 72 of the 74 live keys sit below the title, so this is the common case');
  assert.ok(!('tasks/BACKLOG.md::e2e/zz-fixture.spec.ts:7' in after), 'and it did not stay behind as well');
  assert.equal(after['reviews/x.md::e2e/other.spec.ts:1'], 2, 'a key outside the index is untouched');
  const total = Object.values(after).reduce((a, b) => a + b, 0);
  const wasTotal = Object.values(BASELINE.grandfathered).reduce((a, b) => a + b, 0);
  assert.equal(total, wasTotal, 'the SUM never grows: a split that loosened the ratchet would be a regression');
});

test('GROUND TRUTH — a STRADDLING coordinate is allowed on both sides, and the addition is named', (t) => {
  // THE RED THIS RULE EXISTS FOR, reproduced from the live board. The first draft split a
  // straddling allowance in PROPORTION; on a scratch --apply of the real ledger two keys
  // straddle with one occurrence each side and an allowance of 1, the floor took both shares to
  // 0, the remainder went to the index, and in BOTH cases the OFFENDING occurrence was the one
  // that moved. citation-title-guard came back `FAIL — 2 citation(s)` at `found 1,
  // grandfathered 0`. This tool cannot see which occurrence offends, so it must not pretend to:
  // each side gets min(allowance, occurrences), and the addition is printed.
  const root = fixture(t, BOARD.map((line) => (
    line.startsWith('✅ **F-9101-2') ? line + ' see `e2e/zz-fixture.spec.ts:7` for the red'
      : line)));
  const r = run(root, ['--apply']);
  assert.equal(r.rc, 0, r.out + r.err);
  assert.match(
    r.out,
    /STRADDLE tasks\/BACKLOG\.md::e2e\/zz-fixture\.spec\.ts:7 .*allowance 1 -> 2/,
    'a straddle is never silent: the reader must see which key gained allowance, and by how much',
  );
  const after = baselineOf(root);
  assert.equal(after['tasks/BACKLOG.md::e2e/zz-fixture.spec.ts:7'], 1, 'the open row that stayed keeps its cover');
  assert.equal(after['tasks/backlog/closed-2026-07.md::e2e/zz-fixture.spec.ts:7'], 1, 'and the moved row gets its own');
});
test('MANUFACTURED DEFECT — a baseline key whose citation is nowhere REFUSES and writes nothing', (t) => {
  // The citation is in the baseline and in no row at all — a rotted key. Re-keying it would be a
  // guess, so the tool refuses rather than dropping it or inventing a destination.
  const root = fixture(t, BOARD, { grandfathered: { 'tasks/BACKLOG.md::e2e/vanished.spec.ts:1': 1 } });
  const before = indexOf(root);
  const r = run(root, ['--apply']);
  assert.equal(r.rc, 2, `an unplaceable key must refuse (rc=${r.rc})\n${r.out}${r.err}`);
  assert.match(r.out, /UNPLACEABLE tasks\/BACKLOG\.md::e2e\/vanished\.spec\.ts:1/);
  assert.equal(indexOf(root), before, 'and nothing is written before the refusal');
  assert.deepEqual(partList(root), []);
});

test('REVERSE CONTROL — the same board with a placeable baseline applies cleanly', (t) => {
  const root = fixture(t);
  const r = run(root, ['--apply']);
  assert.equal(r.rc, 0, 'so the arm above proves the KEY, not the board');
  assert.match(r.out, /unplaceable: 0/);
});

test('REFUSES when the baseline is absent — a ratchet without its baseline is not a ratchet', (t) => {
  const root = fixture(t, BOARD, null);
  const r = run(root, ['--apply']);
  assert.equal(r.rc, 2);
  assert.match(r.out, /baseline re-key[\s\S]*UNREADABLE/);
  assert.deepEqual(partList(root), []);
});

// ── 5. THE BALANCE REFUSAL HAS TEETH ───────────────────────────────────────────────────────
/** Copy the tool and its TWO named imports into a scratch `scripts/`, and patch it.
 *  Named files only: `fixture-corpus-copy-guard` forbids making the live `scripts/` tree a
 *  fixture's source, in both the `cpSync` and the readdir-loop spellings (F-2284-1, F-2421-1). */
function variantOf(t, find, replace) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'backlog-split-variant-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.mkdirSync(path.join(dir, 'scripts'));
  for (const dep of DEPS) fs.copyFileSync(path.join(SCRIPTS, dep), path.join(dir, 'scripts', dep));
  const src = fs.readFileSync(TOOL, 'utf8');
  assert.ok(src.includes(find), `variant anchor not found — the tool moved: ${find.slice(0, 60)}`);
  const out = path.join(dir, 'scripts', 'backlog-split-closed.mjs');
  fs.writeFileSync(out, src.replace(find, replace));
  return out;
}

test('MANUFACTURED DEFECT — pointer bytes that go uncounted REFUSE and write nothing', (t) => {
  const root = fixture(t);
  const before = indexOf(root);
  const broken = variantOf(t, 'pointerBytes += bytes(line) + 1;', 'pointerBytes += 0;');
  const r = run(root, ['--apply'], broken);
  assert.equal(r.rc, 2, `an unbalanced plan must refuse, not write (rc=${r.rc})\n${r.out}${r.err}`);
  assert.match(r.out, /OFF BY -?\d+ B/, 'and must say by how much');
  assert.equal(indexOf(root), before, 'the refusal happens BEFORE any write');
  assert.deepEqual(partList(root), []);
});

test('REVERSE CONTROL — the unpatched tool on the same fixture balances and applies', (t) => {
  const root = fixture(t);
  const r = run(root, ['--apply']);
  assert.equal(r.rc, 0, 'without the patch the same input is lawful, so the arm above proves the PATCH');
  assert.match(r.out, /BALANCED/);
});

// ── 6. THE EMPTY AND MISUSE STATES ─────────────────────────────────────────────────────────
test('an index with no # Task backlog title moves nothing and says so', (t) => {
  const root = fixture(t, ['✅ **F-9200-1 CLOSED — but there is no title, so nothing is "below" it.**', ''],
    { grandfathered: {} });
  const r = run(root, ['--dry-run']);
  assert.equal(r.rc, 0, r.out + r.err);
  assert.match(r.out, /H1 : line 0 \(ABSENT/, 'the absence is declared, not silently treated as "everything moves"');
  assert.match(r.out, /^moving\s+: 0 row\(s\)/m);
});

test('neither/both of --dry-run and --apply refuses on both channels', (t) => {
  const root = fixture(t);
  for (const args of [[], ['--dry-run', '--apply']]) {
    const r = run(root, args);
    assert.equal(r.rc, 2, `args ${JSON.stringify(args)} must refuse as misuse`);
    assert.match(r.out, /REFUSING/, 'a caller classifying stdout reads an empty string as silence (F-2211-1)');
    assert.match(r.err, /REFUSING/);
  }
  assert.equal(run(root, ['--dry-run', '--rooot', '/tmp']).rc, 2, 'a typo must not silently take the default root');
});

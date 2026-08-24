// F-2262-1 (s2262) — THE DRAIN ARM ACCEPTS A NEAR-MISS AS AN IDENTITY.
//
// scripts/drain-block-check.mjs resolves a leaf with a bidirectional SUBSTRING match and then takes
// hits[0]. F-1250-1 made an exact match sort first, which fixed the case where the subject HAS a
// leaf. The residue is the case where it does NOT: with no exact match to promote, a neighbouring
// leaf wins on length and answers on the subject's behalf, and the "(N leaves matched)" caveat is
// gated on `hits.length > 1` — so a subject with exactly ONE inexact hit gets a well-formed verdict
// about a different task with no caveat at all.
//
// Measured s2262 on the live board: `--queue e3-fairground.md` -> "? UNKNOWN" (correct: the master
// has no leaf) while the done-move -> "✅ CLEAR — lane-d-e3-fairground-mask-table ... merged".
// 7 live instances, 5 of them silent.
//
// EVERY RED ARM BELOW IS PROVEN BY MANUFACTURING THE DEFECT on a scratch copy, and each reverse
// control exists to catch a specific over-general cure. The cure DECLARES and never refuses, so the
// exit codes are asserted as UNCHANGED throughout — a declaration that starts blocking drains is a
// regression, not a stronger guard (F-1460-1).
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, cpSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SUBJECT = join(HERE, 'drain-block-check.mjs');
const SOURCE = readFileSync(SUBJECT, 'utf8');

/** Build a scratch board. Leaves are given verbatim; masters are created empty. */
function board({ leaves, masters, doneMoves }) {
  const root = mkdtempSync(join(tmpdir(), 's2262-divergence-'));
  mkdirSync(join(root, 'tasks', 'done'), { recursive: true });
  for (const m of masters) writeFileSync(join(root, 'tasks', m), `# ${m}\n`);
  for (const d of doneMoves) writeFileSync(join(root, 'tasks', 'done', d), `# ${d}\n`);
  writeFileSync(
    join(root, 'tasks', 'goals.json'),
    JSON.stringify({ id: 'root', children: leaves }, null, 2),
  );
  return root;
}

/** Run a given script text against a board. Returns {out, rc}. */
function run(scriptText, root, args) {
  // The copy must live in scripts/ so relative imports and the module-main guard behave; a /tmp
  // copy silently never runs (F-2215-1's trap), which would look exactly like the silence we test.
  const shadow = join(HERE, `tmp-s2262-shadow-${process.pid}-${Math.abs(hash(scriptText))}.mjs`);
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

const DECLARATION = 'NEAREST MATCH, NOT YOUR SUBJECT';

// ---------------------------------------------------------------------------
// The defect fixture: subject `lane-boss-healthbar` is a real master with NO leaf; the only leaf
// that matches is its SUCCESSOR `lane-boss-healthbar-steady`. Exactly one hit => no caveat today.
const SILENT = {
  leaves: [{ id: 'e1-boss-healthbar-steady', taskFile: 'lane-boss-healthbar-steady.md', status: 'merged', mergeHash: 'a'.repeat(40) }],
  masters: ['lane-boss-healthbar.md', 'lane-boss-healthbar-steady.md'],
  doneMoves: ['20260719-173834-lane-boss-healthbar.md'],
};
const SILENT_ARGS = ['20260719-173834-lane-boss-healthbar.md'];

test('1. the silent single-hit near-miss is DECLARED (the sharpest case: no caveat exists today)', () => {
  const root = board(SILENT);
  const r = run(SOURCE, root, SILENT_ARGS);
  assert.ok(r.out.length > 0, 'control validity: the subject produced output at all (F-2215-1)');
  assert.match(r.out, new RegExp(DECLARATION));
  assert.match(r.out, /lane-boss-healthbar-steady/, 'names the leaf it actually answered about');
  assert.match(r.out, /lane-boss-healthbar"/, 'names what you asked about');
  rmSync(root, { recursive: true, force: true });
});

test('2. the declaration does NOT refuse — a near-miss stays advisory (rc unchanged)', () => {
  const root = board(SILENT);
  assert.equal(run(SOURCE, root, SILENT_ARGS).rc, 0);
  rmSync(root, { recursive: true, force: true });
});

test('3. the declaration reaches a REFUSAL arm too — it is printed before the verdict branches', () => {
  const root = board({
    ...SILENT,
    leaves: [{ id: 'e1-boss-healthbar-steady', taskFile: 'lane-boss-healthbar-steady.md', status: 'superseded', closureReason: 'carried down by a successor' }],
  });
  const r = run(SOURCE, root, SILENT_ARGS);
  assert.match(r.out, new RegExp(DECLARATION), 'a CLOSED verdict about the wrong subject must say so');
  assert.equal(r.rc, 1, 'the refusal itself is unchanged');
  rmSync(root, { recursive: true, force: true });
});

// --- REVERSE CONTROLS: each catches one over-general cure -------------------

test('4. REVERSE CONTROL — an EXACT match declares NOTHING (identity is the majority path)', () => {
  const root = board({
    leaves: [{ id: 'e1-boss-healthbar-steady', taskFile: 'lane-boss-healthbar-steady.md', status: 'merged', mergeHash: 'a'.repeat(40) }],
    masters: ['lane-boss-healthbar-steady.md'],
    doneMoves: ['20260719-173834-lane-boss-healthbar-steady.md'],
  });
  const r = run(SOURCE, root, ['20260719-173834-lane-boss-healthbar-steady.md']);
  assert.doesNotMatch(r.out, new RegExp(DECLARATION), 'declaring on identity would make this noise on every call');
  assert.equal(r.rc, 0);
  rmSync(root, { recursive: true, force: true });
});

test('5. REVERSE CONTROL — a DECORATED needle declares nothing (23 of 30 inexact hits are this)', () => {
  // `shipped-s1049-<name>-<hash>` CONTAINS the leaf key: inexact, but the leaf IS the subject.
  // Requiring exact equality in the drain arm is the over-general cure; it would break these.
  const root = board({
    leaves: [{ id: 'deploy-honest-and-serialized', taskFile: 'lane-b-deploy-honest-and-serialized.md', status: 'merged', mergeHash: 'b'.repeat(40) }],
    masters: ['lane-b-deploy-honest-and-serialized.md'],
    doneMoves: ['shipped-s1049-lane-b-deploy-honest-and-serialized-ab528c3f.md'],
  });
  const r = run(SOURCE, root, ['shipped-s1049-lane-b-deploy-honest-and-serialized-ab528c3f.md']);
  assert.doesNotMatch(r.out, new RegExp(DECLARATION));
  rmSync(root, { recursive: true, force: true });
});

test('6. REVERSE CONTROL — an ID-KEYED leaf declares nothing (its taskFile points at a successor)', () => {
  // Live shape: gg-03-gazette-panel-swap / f1323-2-charter-fuzz-briefing-undefined. The leaf's id
  // IS the subject, so it genuinely represents it and must not be called a different task.
  const root = board({
    leaves: [{ id: 'gg-03-gazette-panel-swap', taskFile: 'lane-gg-03c-herald-art-dev-path-weight.md', status: 'merged', mergeHash: 'c'.repeat(40) }],
    masters: ['lane-gg-03-gazette-panel-swap.md', 'lane-gg-03c-herald-art-dev-path-weight.md'],
    doneMoves: ['20260729-101734-lane-gg-03-gazette-panel-swap.md'],
  });
  const r = run(SOURCE, root, ['20260729-101734-lane-gg-03-gazette-panel-swap.md']);
  assert.doesNotMatch(r.out, new RegExp(DECLARATION), 'an id-keyed leaf IS about the subject');
  rmSync(root, { recursive: true, force: true });
});

test('7. REVERSE CONTROL — the DECLARED LIMIT: no master on disk means no claim is made', () => {
  const root = board({
    leaves: [{ id: 'e1-boss-healthbar-steady', taskFile: 'lane-boss-healthbar-steady.md', status: 'merged', mergeHash: 'a'.repeat(40) }],
    masters: ['lane-boss-healthbar-steady.md'], // the subject's own master is ABSENT
    doneMoves: ['20260719-173834-lane-boss-healthbar.md'],
  });
  const r = run(SOURCE, root, SILENT_ARGS);
  assert.doesNotMatch(r.out, new RegExp(DECLARATION), 'without the file, a near-miss cannot be told from decoration');
  rmSync(root, { recursive: true, force: true });
});

test('8. REVERSE CONTROL — a subject that DOES own a leaf declares nothing even with neighbours', () => {
  const root = board({
    leaves: [
      { id: 'boss-healthbar', taskFile: 'lane-boss-healthbar.md', status: 'merged', mergeHash: 'd'.repeat(40) },
      { id: 'e1-boss-healthbar-steady', taskFile: 'lane-boss-healthbar-steady.md', status: 'merged', mergeHash: 'a'.repeat(40) },
    ],
    masters: ['lane-boss-healthbar.md', 'lane-boss-healthbar-steady.md'],
    doneMoves: ['20260719-173834-lane-boss-healthbar.md'],
  });
  const r = run(SOURCE, root, SILENT_ARGS);
  assert.doesNotMatch(r.out, new RegExp(DECLARATION));
  rmSync(root, { recursive: true, force: true });
});

// --- MANUFACTURED DEFECTS: prove the arms above can actually go red ---------

test('9. PRE-CURE: removing the call restores the silence, and reds the defect arms only', () => {
  const preCure = variantOf(
    '  const divergence = subjectDivergence(leaf, target, leaves);\n  if (divergence) for (const line of divergence) console.log(line);\n',
    '',
  );
  const root = board(SILENT);
  const r = run(preCure, root, SILENT_ARGS);
  assert.ok(r.out.length > 0, 'control validity: the pre-cure arm really ran (F-2215-1)');
  assert.doesNotMatch(r.out, new RegExp(DECLARATION), 'pre-cure is silent — this is the defect');
  assert.equal(r.rc, 0, 'and it was silent at an affirmative exit code');
  rmSync(root, { recursive: true, force: true });
});

test('10. OVER-GENERAL: gating on hits.length>1 (F-1250-1s condition) misses the silent case', () => {
  // The tempting minimal cure — reuse the existing caveat condition — is exactly what leaves the
  // 5 single-hit instances unreported.
  const variant = variantOf(
    '  const divergence = subjectDivergence(leaf, target, leaves);',
    '  const divergence = hits.length > 1 ? subjectDivergence(leaf, target, leaves) : null;',
  );
  const root = board(SILENT);
  const r = run(variant, root, SILENT_ARGS);
  assert.doesNotMatch(r.out, new RegExp(DECLARATION), 'this variant must fail arm 1');
  rmSync(root, { recursive: true, force: true });
});

test('11. OVER-GENERAL: dropping the master-exists test declares on ordinary decoration', () => {
  const variant = variantOf(
    "  if (!existsSync(join('tasks', `${key}.md`))) return null;",
    '',
  );
  const root = board({
    leaves: [{ id: 'deploy-honest-and-serialized', taskFile: 'lane-b-deploy-honest-and-serialized.md', status: 'merged', mergeHash: 'b'.repeat(40) }],
    masters: ['lane-b-deploy-honest-and-serialized.md'],
    doneMoves: ['shipped-s1049-lane-b-deploy-honest-and-serialized-ab528c3f.md'],
  });
  const r = run(variant, root, ['shipped-s1049-lane-b-deploy-honest-and-serialized-ab528c3f.md']);
  assert.match(r.out, new RegExp(DECLARATION), 'this variant must fail reverse control 5');
  rmSync(root, { recursive: true, force: true });
});

test('12. OVER-GENERAL: dropping the id comparison mislabels an id-keyed leaf', () => {
  const variant = variantOf(
    '  if (id && (id === key || id === stripSlot(key) || stripSlot(id) === stripSlot(key))) return null;',
    '',
  );
  const root = board({
    leaves: [{ id: 'gg-03-gazette-panel-swap', taskFile: 'lane-gg-03c-herald-art-dev-path-weight.md', status: 'merged', mergeHash: 'c'.repeat(40) }],
    masters: ['lane-gg-03-gazette-panel-swap.md', 'lane-gg-03c-herald-art-dev-path-weight.md'],
    doneMoves: ['20260729-101734-lane-gg-03-gazette-panel-swap.md'],
  });
  const r = run(variant, root, ['20260729-101734-lane-gg-03-gazette-panel-swap.md']);
  assert.match(r.out, new RegExp(DECLARATION), 'this variant must fail reverse control 6');
  rmSync(root, { recursive: true, force: true });
});

test('13. OVER-GENERAL: turning the declaration into a refusal reds every lawful near-miss drain', () => {
  const variant = variantOf(
    '  const divergence = subjectDivergence(leaf, target, leaves);\n  if (divergence) for (const line of divergence) console.log(line);',
    '  const divergence = subjectDivergence(leaf, target, leaves);\n  if (divergence) { for (const line of divergence) console.log(line); process.exit(2); }',
  );
  const root = board(SILENT);
  const r = run(variant, root, SILENT_ARGS);
  assert.equal(r.rc, 2, 'the variant does refuse…');
  assert.notEqual(r.rc, run(SOURCE, root, SILENT_ARGS).rc, '…and that is the regression arm 2 catches');
  rmSync(root, { recursive: true, force: true });
});

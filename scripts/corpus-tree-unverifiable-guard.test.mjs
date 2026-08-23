/**
 * F-2243-1 — corpusTree's FAILURE value MUST NOT FALL THROUGH TO PASS.
 *
 * F-2242-1 cured exactly this polarity one line DOWN, on the sibling
 * discriminator, and the line above it kept the defect:
 *
 *     if (corpusTree(root) !== 'linked-worktree') return null;
 *
 * `corpusTree` returns FOUR values — 'main' | 'linked-worktree' | 'no-git' |
 * 'tree-unverifiable'. An inequality against ONE of them sweeps the other three
 * onto the permissive branch, the failure value among them. Note that the
 * docstring's promise — "STRINGS, not booleans ... a careless truthiness test
 * coerces every failure value toward NOTICING" — does NOT hold here: a string
 * protects a TRUTHINESS test, and this is a test against a specific value.
 *
 * PROVEN BY MANUFACTURING, ground truth = a linked worktree whose STATUS.md
 * line-1 is NOT the one main carries, with ONLY corpusTree's probe failing (a
 * PATH shim that fails `--git-common-dir` and passes every other git call — the
 * faithful shape of F-2212-1's documented load/spawn trigger):
 *   pre-cure  -> "PASS — every non-grandfathered desk item has a declaring row."
 *                rc=0, verdict line BYTE-IDENTICAL to a genuinely clean board.
 *   post-cure -> REFUSING, rc=2.
 *
 * ⚠️ THE REVERSE CONTROL THAT MATTERS IS ARM 6. The over-general cure — refusing
 * on anything that is not 'linked-worktree' — passes every defect arm and reds
 * EVERY legacy fixture in this family, all of which build a non-git temp root.
 * Measured s2243: a plain non-git dir AND a path that does not exist both answer
 * git exit 128, i.e. 'no-git', which is LAWFUL and must proceed. Refusing there
 * is how a guard gets excused into uselessness (F-1460-1, the `cross-engine` fate).
 *
 * ⓘ ARM 8 PINS A DELIBERATE BEHAVIOUR CHANGE, not a neutrality: on the MAIN tree
 * with a broken probe the pre-cure code passed and the cured code refuses. That is
 * correct and is the whole point — the probe is the only thing that tells you
 * which tree you are in, so when it fails "I am on main" is not knowable. Pinned
 * so a later reader cannot "restore" the permissive read as a fix.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, appendFileSync, rmSync, readFileSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const roots = [];

function git(cwd, ...args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(args.join(' ') + ': ' + r.stderr);
  return r;
}

/** Run a guard, optionally with the corpusTree probe sabotaged. */
function guard(name, cwd, shimDir) {
  const env = { ...process.env };
  if (shimDir) env.PATH = `${shimDir}:${env.PATH}`;
  const r = spawnSync('node', [path.join(SCRIPTS, name + '.mjs')], { cwd, encoding: 'utf8', env });
  return { rc: r.status, out: r.stdout ?? '', err: r.stderr ?? '', all: (r.stdout ?? '') + (r.stderr ?? '') };
}

/**
 * A git that fails ONLY corpusTree's probe. Faithful to the real trigger: git is
 * present and working, one call does not answer. Resolved from the live PATH
 * rather than hardcoded, so this does not rot on a machine where git moves.
 */
function sabotageDir() {
  const real = spawnSync('sh', ['-c', 'command -v git'], { encoding: 'utf8' }).stdout.trim();
  assert.ok(real, 'cannot resolve a real git to wrap — the shim would be vacuous');
  const dir = mkdtempSync(path.join(tmpdir(), 's2243-shim-'));
  roots.push(dir);
  writeFileSync(
    path.join(dir, 'git'),
    `#!/bin/bash\nfor a in "$@"; do if [ "$a" = "--git-common-dir" ]; then exit 1; fi; done\nexec ${real} "$@"\n`,
  );
  chmodSync(path.join(dir, 'git'), 0o755);
  return dir;
}

const HANDOFF = (n, ids) =>
  `Last updated: 2026-08-23T0${n}:00Z s100${n} handoff, lock CLEARED — work landed. ` +
  `🔺 **OWNER'S DESK — ${ids.length} awaiting a word.** ` + ids.map((i) => `🔺 **${i}**`).join(' · ');

/**
 * Same shape as the F-2242-1 fixture: two handoffs land BEFORE the branch point,
 * because desk-birth-guard's window is [previous handoff .. HEAD] and a
 * one-commit worktree refuses for lack of history — a fixture artifact that would
 * masquerade as the cure working.
 */
function build(scenario) {
  const root = mkdtempSync(path.join(tmpdir(), 's2243-' + scenario + '-'));
  roots.push(root);
  mkdirSync(path.join(root, 'tasks'), { recursive: true });
  git(root, 'init', '-q', '-b', 'main');
  git(root, 'config', 'user.email', 'f@x');
  git(root, 'config', 'user.name', 'f');
  const BL = path.join(root, 'tasks', 'BACKLOG.md');
  const archive = [];
  let prevLine1 = null;
  const status = (t) => {
    if (prevLine1) archive.unshift(`- **s${1000 + archive.length + 1} handoff (line-1 archive):** ${prevLine1}`);
    prevLine1 = t;
    writeFileSync(path.join(root, 'STATUS.md'), [t, ...archive].join('\n') + '\n');
  };

  status(HANDOFF(1, ['F-AAA-1']));
  writeFileSync(BL, '# BACKLOG\n\n🔺 **F-AAA-1 (s1001)** — declared. GATE: none.\n');
  git(root, 'add', '-A'); git(root, 'commit', '-q', '-m', 's1001 handoff: base');
  status(HANDOFF(2, ['F-AAA-1']));
  git(root, 'add', '-A'); git(root, 'commit', '-q', '-m', 's1002 handoff: still clean');

  const wt = path.join(root, 'wt');
  git(root, 'worktree', 'add', '-q', '-b', 'lane', wt);

  if (scenario === 'declaration') status(HANDOFF(3, ['F-AAA-1', 'F-BBB-1']));
  else if (scenario === 'birth') {
    status(HANDOFF(3, ['F-AAA-1']));
    appendFileSync(BL, '\n🔺 **F-BBB-1 (s1003)** — a real fork. GATE: closes on owner ruling.\n');
  } else if (scenario === 'drop') status(HANDOFF(3, []));
  else status(HANDOFF(3, ['F-AAA-1']));
  git(root, 'add', '-A'); git(root, 'commit', '-q', '-m', 's1003 handoff: ' + scenario);
  return { root, wt };
}

test.after(() => { for (const r of roots) rmSync(r, { recursive: true, force: true }); });

const SUBJECTS = [
  ['desk-declaration-guard', 'declaration', /PASS — every non-grandfathered/],
  ['desk-birth-guard', 'birth', /PASS — every owner-gated row/],
  ['desk-carryforward-guard', 'drop', /PASS — every item on the previous desk/],
];

// -------------------------------------------------------- 1-3: the defect arms
for (const [name, scenario, passLine] of SUBJECTS) {
  test(`${name}: an UNIDENTIFIABLE tree must REFUSE, not PASS`, () => {
    const { root, wt } = build(scenario);
    // VALIDITY FIRST (F-2215-1 / s2227): prove the fixture carries the defect and
    // the arm reaches a verdict path, BEFORE reading any verdict from it.
    const onMain = guard(name, root);
    assert.equal(onMain.rc, 1, `fixture carries no defect on main:\n${onMain.all}`);

    const r = guard(name, wt, sabotageDir());
    assert.match(r.all, /tree-unverifiable/, `the probe was not actually sabotaged:\n${r.all}`);
    // The WORD, not merely the exit code: in advisory reading the verdict travels
    // on stdout (F-2210-1), and the pre-cure defect printed exactly this line.
    assert.doesNotMatch(r.out, passLine, `printed PASS from a tree it could not identify:\n${r.all}`);
    assert.equal(r.rc, 2, r.all);
    assert.match(r.all, /REFUSING/, r.all);
  });
}

// ------------------------- 4-5: the refusal names the RIGHT act, and no other
test('the tree refusal is distinct from the COMPARISON refusal — they owe different acts', () => {
  const a = build('declaration');
  const differing = guard('desk-declaration-guard', a.wt);
  assert.match(differing.all, /NOT the one main carries/, differing.all);

  const b = build('declaration');
  const unidentifiable = guard('desk-declaration-guard', b.wt, sabotageDir());
  assert.match(unidentifiable.all, /could not say which tree/, unidentifiable.all);
  // Collapsing the two is the PARTIAL cure: it refuses, so every defect arm goes
  // green, while sending the reader to re-run from main when git is what is broken.
  assert.doesNotMatch(unidentifiable.all, /NOT the one main carries/, unidentifiable.all);
});

test('the tree refusal does not ASSERT a linked worktree it never established', () => {
  const { wt } = build('declaration');
  const r = guard('desk-declaration-guard', wt, sabotageDir());
  // F-2225-1: a declaration must name what the VERDICT came from. Here the tree is
  // precisely the unknown, so claiming it is a linked worktree would be a true-
  // sounding sentence about a corpus the verdict never read.
  assert.doesNotMatch(r.all, /this is a linked worktree/, r.all);
});

// -------------------------------------------------------- 6-8: reverse controls
test("REVERSE CONTROL: a non-git root is LAWFUL and must still PROCEED", () => {
  // The over-general cure — refusing on anything != 'linked-worktree' — passes
  // every defect arm above and reds this. Every legacy fixture in this family
  // builds a non-git temp root, so that cure would red them all.
  const root = mkdtempSync(path.join(tmpdir(), 's2243-nogit-'));
  roots.push(root);
  mkdirSync(path.join(root, 'tasks'), { recursive: true });
  writeFileSync(path.join(root, 'STATUS.md'), HANDOFF(3, ['F-AAA-1']) + '\n');
  writeFileSync(path.join(root, 'tasks', 'BACKLOG.md'), '# BACKLOG\n\n🔺 **F-AAA-1 (s1001)** — declared. GATE: none.\n');
  const r = guard('desk-declaration-guard', root);
  assert.match(r.out, /no-git/, `expected the lawful non-git classification:\n${r.all}`);
  assert.equal(r.rc, 0, r.all);
  assert.match(r.out, /PASS — every non-grandfathered/, r.all);
});

test('REVERSE CONTROL: a genuinely clean MAIN with healthy git still passes', () => {
  const { root } = build('clean');
  const r = guard('desk-declaration-guard', root);
  assert.equal(r.rc, 0, r.all);
  assert.match(r.out, /PASS — every non-grandfathered/, r.all);
});

test('a MAIN tree whose probe FAILED must refuse too — you cannot know it is main', () => {
  const { root } = build('clean');
  const r = guard('desk-declaration-guard', root, sabotageDir());
  assert.match(r.all, /tree-unverifiable/, r.all);
  assert.equal(r.rc, 2, `a broken probe cannot certify ANY tree, main included:\n${r.all}`);
});

// ------------------------------------------------- 9: the re-typing hazard
test('frozenTreeCheck tests the failure value EXPLICITLY, not by inequality alone', () => {
  const src = readFileSync(path.join(SCRIPTS, 'corpus-tree.mjs'), 'utf8');
  // STRIP COMMENTS FIRST. The first draft of this arm did not, and it FAILED on a
  // correctly-cured file: the cure's own comment quotes the pre-cure line, so the
  // ordering test matched prose instead of code. That is s2242's lesson exactly —
  // a check can assert an anchor EXISTS without asserting it landed at the SUBJECT
  // — and here it manufactured a false ALARM rather than false calm.
  const body = src
    .slice(src.indexOf('export function frozenTreeCheck'))
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n').map((l) => l.replace(/\/\/.*$/, '')).join('\n');
  // F-2242-1's lesson is that the DECISION is the condition. A maintainer who
  // collapses these two tests back into the single inequality restores the defect
  // in one keystroke, and every arm above still needs a spawn to notice.
  assert.match(body, /===\s*'tree-unverifiable'/, 'frozenTreeCheck no longer tests the failure value explicitly');
  assert.ok(
    body.indexOf("=== 'tree-unverifiable'") < body.indexOf("!== 'linked-worktree'"),
    'the failure value must be decided BEFORE the permissive inequality, or it falls through again',
  );
});

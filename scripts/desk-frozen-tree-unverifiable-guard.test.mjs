/**
 * F-2242-1 — 'unverifiable' MUST NOT FALL THROUGH TO PASS.
 *
 * s2241 extracted `corpusTree` / `line1MatchesMain` into corpus-tree.mjs citing
 * F-2227-1 — "four independent copies of one predicate is HOW it drifts" — and in
 * the SAME commit hand-wrote the consuming condition at two new call sites as
 *
 *     line1MatchesMain(...) === 'different'
 *
 * while the original site, three lines below its own convention comment, used
 *
 *     cmp !== 'same'
 *
 * So the FUNCTION was unified and the CONDITION was re-typed — with the opposite
 * polarity. `line1MatchesMain` returns 'unverifiable' when `git show main:STATUS.md`
 * cannot answer, and that value is the FAILURE value: under `=== 'different'` it
 * takes the permissive branch and the guard prints PASS, in a chained
 * test:ledger-guards leg, in the default mode.
 *
 * PROVEN BY MANUFACTURING, ground truth = a REAL undeclared desk item on main,
 * with `main` unresolvable from the worktree (the ref renamed, which leaves
 * corpusTree's --git-dir vs --git-common-dir comparison untouched):
 *   pre-cure  -> "PASS — every non-grandfathered desk item has a declaring row."
 *                rc=0, verdict line BYTE-IDENTICAL to a genuinely clean board.
 *   post-cure -> REFUSING, rc=2.
 *
 * THE LESSON, and it is why the cure moved the CONDITION rather than fixing two
 * comparisons: extracting a helper does not unify a decision. The decision IS the
 * condition, so the condition is what has to move. Everything a caller can get
 * wrong now lives on the corpus-tree.mjs side of the import.
 *
 * ⚠️ REVERSE CONTROLS ARE THE POINT (arms 7-9). The over-general cure — refusing
 * in ANY linked worktree — passes every defect arm and reds the drain gate that
 * §3.0b MANDATES be run from a detached worktree, which is how a guard gets
 * excused into uselessness (F-1460-1, the `cross-engine` fate).
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, appendFileSync, rmSync, readFileSync } from 'node:fs';
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

function guard(name, cwd) {
  const r = spawnSync('node', [path.join(SCRIPTS, name + '.mjs')], { timeout: 240_000, killSignal: 'SIGKILL', cwd, encoding: 'utf8' });
  return { rc: r.status, out: r.stdout ?? '', err: r.stderr ?? '', all: (r.stdout ?? '') + (r.stderr ?? '') };
}

const HANDOFF = (n, ids) =>
  `Last updated: 2026-08-23T0${n}:00Z s100${n} handoff, lock CLEARED — work landed. ` +
  `🔺 **OWNER'S DESK — ${ids.length} awaiting a word.** ` + ids.map((i) => `🔺 **${i}**`).join(' · ');

/**
 * scenario 'declaration' -> main gains a desk item with NO declaring row
 * scenario 'birth'       -> main gains an owner-gated row that never reached the desk
 * scenario 'drop'        -> main silently drops a carried desk item
 * scenario 'clean'       -> no defect at all (the reverse control)
 *
 * TWO handoffs land BEFORE the branch point deliberately: desk-birth-guard's
 * window is [previous handoff .. HEAD], so a one-commit worktree refuses for lack
 * of history — a FIXTURE artifact that would masquerade as the cure working.
 */
function build(scenario) {
  const root = mkdtempSync(path.join(tmpdir(), 's2242-' + scenario + '-'));
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

/**
 * Make `git show main:STATUS.md` unable to answer while the tree is STILL a linked
 * worktree. Renaming the ref is the cheapest faithful way: corpusTree compares
 * --git-dir against --git-common-dir and is untouched by it, so the tree still
 * classifies 'linked-worktree' and only the COMPARISON goes unverifiable — which
 * is exactly the state under test.
 */
const unresolvableMain = (root) => git(root, 'branch', '-m', 'main', 'trunk');

test.after(() => { for (const r of roots) rmSync(r, { recursive: true, force: true }); });

const SUBJECTS = [
  ['desk-declaration-guard', 'declaration', /PASS — every non-grandfathered/],
  ['desk-birth-guard', 'birth', /PASS — every owner-gated row/],
  ['desk-carryforward-guard', 'drop', /PASS — every item on the previous desk/],
];

// ------------------------------------------------------- 1-3: the defect arms
for (const [name, scenario, passLine] of SUBJECTS) {
  test(`${name}: an UNVERIFIABLE comparison must REFUSE, not PASS`, () => {
    const { root, wt } = build(scenario);
    // VALIDITY FIRST (F-2215-1 / s2227): prove the fixture really carries the
    // defect and the arm really reaches a verdict path, before reading a verdict.
    const onMain = guard(name, root);
    assert.equal(onMain.rc, 1, `fixture carries no defect on main:\n${onMain.all}`);

    unresolvableMain(root);
    const r = guard(name, wt);
    // The WORD, not merely the exit code — in advisory reading the verdict travels
    // on stdout (F-2210-1), and the pre-cure defect printed exactly this line.
    assert.doesNotMatch(r.out, passLine, `printed PASS from a frozen tree it could not compare:\n${r.all}`);
    assert.equal(r.rc, 2, r.all);
    assert.match(r.all, /REFUSING/);
  });
}

// --------------------------------------- 4-6: the refusal NAMES which answer
for (const [name, scenario] of SUBJECTS) {
  test(`${name}: the refusal distinguishes 'unverifiable' from 'different'`, () => {
    const a = build(scenario);
    const differing = guard(name, a.wt);
    assert.match(differing.all, /NOT the one main carries/, differing.all);

    const b = build(scenario);
    unresolvableMain(b.root);
    const unverifiable = guard(name, b.wt);
    // F-2225-1: a declaration must name what the VERDICT came from. The two
    // refusable answers owe different acts — re-run from main vs investigate git.
    assert.match(unverifiable.all, /not comparable against main/, unverifiable.all);
  });
}

// ------------------------------------------------------ 7-9: reverse controls
for (const [name, , passLine] of SUBJECTS) {
  test(`${name}: a genuinely clean MAIN still passes (reverse control)`, () => {
    const { root } = build('clean');
    const r = guard(name, root);
    assert.equal(r.rc, 0, r.all);
    assert.match(r.out, passLine, r.all);
  });
}

test('a LAWFUL worktree whose line-1 matches main is NOT refused — §3.0b mandates gating there', () => {
  // The over-general cure (refuse in ANY linked worktree) passes every arm above
  // and reds the drain gate the law REQUIRES be run from a detached worktree.
  // A merged gate tree carries main's STATUS.md unchanged, which is what this
  // fixture reproduces: the worktree branches and main never moves after it.
  const root = mkdtempSync(path.join(tmpdir(), 's2242-lawful-'));
  roots.push(root);
  mkdirSync(path.join(root, 'tasks'), { recursive: true });
  git(root, 'init', '-q', '-b', 'main');
  git(root, 'config', 'user.email', 'f@x'); git(root, 'config', 'user.name', 'f');
  const archive = [];
  let prev = null;
  const status = (t) => {
    if (prev) archive.unshift(`- **s${1000 + archive.length + 1} handoff (line-1 archive):** ${prev}`);
    prev = t;
    writeFileSync(path.join(root, 'STATUS.md'), [t, ...archive].join('\n') + '\n');
  };
  status(HANDOFF(1, ['F-AAA-1']));
  writeFileSync(path.join(root, 'tasks', 'BACKLOG.md'), '# BACKLOG\n\n🔺 **F-AAA-1 (s1001)** — declared. GATE: none.\n');
  git(root, 'add', '-A'); git(root, 'commit', '-q', '-m', 's1001 handoff: base');
  status(HANDOFF(2, ['F-AAA-1']));
  git(root, 'add', '-A'); git(root, 'commit', '-q', '-m', 's1002 handoff: clean');
  const wt = path.join(root, 'wt');
  git(root, 'worktree', 'add', '-q', '-b', 'gate', wt);   // branches at main's tip

  for (const [name] of SUBJECTS) {
    const r = guard(name, wt);
    assert.doesNotMatch(r.all, /linked worktree and its STATUS\.md/, `${name} refused a LAWFUL gate worktree:\n${r.all}`);
  }
});

// ------------------------------------------------- 11: ONE decision, not three
test('all three guards share the SAME frozenTreeCheck function object', async () => {
  // s2241's arm-8 pattern, and the reason this suite exists: asserting that three
  // copies AGREE TODAY is not the same as asserting there is one implementation.
  // F-2242-1 is precisely a case where the helper was shared and the CONDITION
  // was not, so identity of the DECISION is what must be pinned.
  const shared = await import(path.join(SCRIPTS, 'corpus-tree.mjs'));
  assert.equal(typeof shared.frozenTreeCheck, 'function');
  const sources = ['desk-declaration-guard', 'desk-birth-guard', 'desk-carryforward-guard']
    .map((n) => spawnSync('node', ['-e',
      `import(${JSON.stringify(path.join(SCRIPTS, n + '.mjs'))}).then(()=>{});`
      + `import(${JSON.stringify(path.join(SCRIPTS, 'corpus-tree.mjs'))})`
      + `.then(m=>console.log(typeof m.frozenTreeCheck));`], { timeout: 240_000, killSignal: 'SIGKILL', encoding: 'utf8' }).stdout.trim());
  for (const s of sources) assert.equal(s, 'function', 'a guard does not reach the shared decision');

  // And no guard may CALL line1MatchesMain itself — the moment a caller reaches
  // for the raw comparison it is re-typing the condition, which is the exact
  // surface F-2242-1 drifted through. Asserting the absence of the CALL rather
  // than of a particular spelling of the comparison is deliberate: the first
  // draft of this arm matched /line1MatchesMain\([^)]*\)\s*===\s*'different'/,
  // whose [^)]* stops at the inner readFileSync(...) paren, so it did not match
  // the very re-typing it was written to catch and the arm stayed GREEN under a
  // manufactured caller-retype. An assertion must land at the SUBJECT, not merely
  // find an anchor (s2241) — and only the reachability sweep revealed it.
  for (const n of ['desk-declaration-guard', 'desk-birth-guard', 'desk-carryforward-guard']) {
    const src = readFileSync(path.join(SCRIPTS, n + '.mjs'), 'utf8');
    assert.doesNotMatch(src, /\bline1MatchesMain\b/,
      `${n} reaches for the raw comparison instead of importing the decision`);
  }
});

/**
 * F-2406-1 (s2406) — AN UNOWNED TREE UNDER worktrees/ MUST DECLARE WHOSE GITDIR
 * IT BORROWS.
 *
 * `art-staging-audit.mjs` names the trees under `worktrees/` that no git worktree
 * owns (F-2196-1) and prints "outside the scan root BY DESIGN". That block is the
 * ONLY thing in the factory that sends anybody to look at those directories, and
 * it read as *harmless, ignore these*.
 *
 * CREDIT: this is not a new sighting. F-2404-1 (s2404) characterised the crossed
 * pointers correctly one fire earlier and priced them INERT on a MEASURED
 * reachability argument — no script, skill or npm leg sends anyone into these
 * trees. That reading is right for READS and its reachability claim is
 * re-verified here. What this guard adds is the WRITE direction, which is not
 * inert, and moving the fact out of a BACKLOG row into the tool that sends people
 * there (the factory's most-repeated finding: a cure with no reader).
 *
 * Measured s2406 on a throwaway fixture — a plain `cp -R` of a linked worktree,
 * which is exactly the shape of the four live `worktrees/lane-*-salvage` trees:
 *
 *   --show-toplevel -> the COPY           (it gets its OWN working tree)
 *   --git-dir       -> the LIVE lane's    (HEAD, index and refs are SHARED)
 *   worktree list   -> the copy is ABSENT (so `lane-usable` cannot see it)
 *
 * and then the write arms:
 *   `git add` inside the copy      -> the LIVE lane reads `MM file.txt` with its
 *                                     own file untouched on disk (shared index);
 *   `git reset --hard HEAD~1`      -> the LIVE lane's HEAD *and the branch ref*
 *                                     move, its disk is NOT rewritten, and
 *                                     `main..lane/x` drops 1 -> 0: an unmerged
 *                                     commit silently leaves the lane's ahead-set.
 *
 * That last one is Mistake #2, the Reset Massacre, reached from a directory
 * invisible to every lane instrument the factory owns.
 *
 * SEVERITY, STATED HONESTLY AND NOT INFLATED: LATENT, realised cost ZERO. All
 * four lanes read ahead=0 / tracked-dirt=0 the day this landed, and no script in
 * scripts/ or ops/ runs git inside these trees. The retention half of the same
 * boundary is genuinely clean — 1554/1554 non-build files are in an object
 * database (F-2404-1's measurement; s2406 reproduces the figure exactly). What
 * earns a cure is the DIRECTION and the fact that the sentence sending readers
 * there said the opposite.
 *
 * Every red arm below was PROVEN BY MANUFACTURING THE DEFECT on a scratch copy,
 * never by reading — a passing guard never executes its violation path, so its
 * green is not evidence about its red (the s1299/s1300 standard).
 *
 * Arms 4-7 are REVERSE CONTROLS against the obvious over-general cure ("any tree
 * with a `.git` file shares a lane"), which would be worse than the defect: it
 * would cry wolf on self-contained trees and get excused into uselessness inside
 * a week (F-1460-1, the `cross-engine` decay). Arm 8 is the reverse control
 * against turning a DECLARATION into a REFUSAL — these trees are LAWFUL, the
 * RETENTION LAW forbids deleting them, and reddening `--strict` would also
 * prejudge F-2159-1, the open OWNER'S DESK question about rooting this audit in
 * `test:ledger-guards`.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// fileURLToPath, not URL.pathname — the repo path contains a space ("Gold Rush")
// and pathname keeps it percent-encoded. The subject's own header warns about it.
const AUDIT = fs.realpathSync(fileURLToPath(new URL('./art-staging-audit.mjs', import.meta.url)));

/**
 * A scratch repo carrying one REGISTERED worktree plus a chosen set of unowned
 * sibling trees. `realpathSync` matters: macOS symlinks /tmp -> /private/tmp, and
 * a path mismatch has silently voided a control in this streak before (F-2215-1).
 */
function fixture({ trees = ['salvage'] } = {}) {
  const repo = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'art-gitdir-')));
  const g = (...a) => execFileSync('git', ['-C', repo, ...a], { encoding: 'utf8' });

  execFileSync('git', ['init', '-b', 'main', repo], { encoding: 'utf8' });
  g('config', 'user.email', 'guard@example.com');
  g('config', 'user.name', 'guard');

  fs.mkdirSync(path.join(repo, 'assets'), { recursive: true });
  fs.mkdirSync(path.join(repo, 'scripts'), { recursive: true });
  fs.mkdirSync(path.join(repo, 'worktrees/art/assets'), { recursive: true });
  // The audit derives REPO from its own import.meta.url, so the copy must live in
  // the fixture's scripts/ dir or it would audit the real tree. RELOCATION is
  // what makes this a genuine control (the F-2351-1 anchor lesson).
  fs.copyFileSync(AUDIT, path.join(repo, 'scripts/art-staging-audit.mjs'));

  fs.writeFileSync(path.join(repo, 'assets/shipped.png'), 'SHIPPED-BYTES');
  g('add', 'assets/shipped.png');
  g('commit', '-m', 'c1', '--no-gpg-sign');

  // the LIVE registered worktree every "shared" tree will borrow from
  const live = path.join(repo, 'worktrees/lane-x');
  g('worktree', 'add', '-q', '-b', 'lane/x', live);

  for (const t of trees) {
    if (t === 'salvage') {
      // the real shape: a plain recursive copy of a linked worktree
      execFileSync('cp', ['-R', live, path.join(repo, 'worktrees/lane-x-salvage')]);
    } else if (t === 'orphan') {
      const d = path.join(repo, 'worktrees/orphan-tree');
      fs.mkdirSync(d, { recursive: true });
      fs.writeFileSync(path.join(d, 'a.txt'), 'x');
      // points at an admin dir that no registered worktree owns
      fs.writeFileSync(path.join(d, '.git'), `gitdir: ${repo}/.git/worktrees/never-existed\n`);
    } else if (t === 'own-repo') {
      const d = path.join(repo, 'worktrees/indep');
      fs.mkdirSync(d, { recursive: true });
      execFileSync('git', ['init', '-q', '-b', 'main', d], { encoding: 'utf8' });
      fs.writeFileSync(path.join(d, 'a.txt'), 'x');
    } else if (t === 'no-git') {
      const d = path.join(repo, 'worktrees/plain-dir');
      fs.mkdirSync(d, { recursive: true });
      fs.writeFileSync(path.join(d, 'a.txt'), 'x');
    } else if (t === 'unverifiable') {
      const d = path.join(repo, 'worktrees/broken-tree');
      fs.mkdirSync(d, { recursive: true });
      fs.writeFileSync(path.join(d, 'a.txt'), 'x');
      fs.writeFileSync(path.join(d, '.git'), 'this is not a gitdir pointer\n');
    }
  }
  return repo;
}

function run(repo, args = []) {
  const r = spawnSync('node', [path.join(repo, 'scripts/art-staging-audit.mjs'), ...args], {
    cwd: repo,
    encoding: 'utf8',
    maxBuffer: 64 << 20,
  });
  return { rc: r.status, out: r.stdout ?? '', err: r.stderr ?? '' };
}

const jsonOf = (repo) => JSON.parse(run(repo, ['--json']).out);
const notAudited = (repo) => jsonOf(repo).notAudited ?? [];
const rowOf = (list, needle) => list.find((d) => d.name.includes(needle));

test('1. a cp -R copy of a linked worktree is classified `shared` and names its owner', () => {
  const repo = fixture({ trees: ['salvage'] });
  const rows = notAudited(repo);
  // F-2217-1: an empty subject set must not pass vacuously.
  assert.ok(rows.length > 0, 'fixture produced no unowned trees — the arm tested nothing');
  const row = rowOf(rows, 'lane-x-salvage');
  assert.ok(row, 'the salvage copy is missing from notAudited entirely');
  assert.equal(row.link, 'shared');
  assert.equal(row.sharesWith, 'worktrees/lane-x');
});

test('2. the human channel names the borrowed lane ON THE ROW, not merely somewhere', () => {
  const repo = fixture({ trees: ['salvage'] });
  const { out } = run(repo);
  const row = out.split('\n').find((l) => l.includes('lane-x-salvage'));
  assert.ok(row, 'no row for the salvage copy on stdout');
  // Assert the OBSERVABLE on the ROW. s2222 paid for this: asserting the words
  // appear SOMEWHERE in stdout passes while the banner names the wrong cause.
  assert.match(row, /SHARES the gitdir of worktrees\/lane-x/);
});

test('3. the hazard paragraph prints when any tree is shared', () => {
  const repo = fixture({ trees: ['salvage'] });
  const { out } = run(repo);
  assert.match(out, /Never run a writing git command inside one/);
  assert.match(out, /F-2406-1/);
});

test('4. REVERSE CONTROL — a self-contained tree with no .git is NOT shared', () => {
  const repo = fixture({ trees: ['no-git'] });
  const rows = notAudited(repo);
  assert.ok(rows.length > 0, 'fixture produced no unowned trees — the arm tested nothing');
  const row = rowOf(rows, 'plain-dir');
  assert.ok(row, 'the plain directory is missing from notAudited');
  assert.equal(row.link, 'no-git');
  assert.equal(row.sharesWith, null);
  assert.doesNotMatch(run(repo).out, /SHARES the gitdir/);
});

test('5. REVERSE CONTROL — a gitdir no registered worktree owns is `orphan`, not `shared`', () => {
  const repo = fixture({ trees: ['orphan'] });
  const rows = notAudited(repo);
  assert.ok(rows.length > 0, 'fixture produced no unowned trees — the arm tested nothing');
  const row = rowOf(rows, 'orphan-tree');
  assert.ok(row, 'the orphan tree is missing from notAudited');
  // This is the arm that catches "any .git file means shared". The tree HAS a
  // well-formed gitdir pointer; it simply points at nothing anyone owns.
  assert.equal(row.link, 'orphan');
  assert.equal(row.sharesWith, null);
  assert.doesNotMatch(run(repo).out, /SHARES the gitdir/);
});

test('6. REVERSE CONTROL — an independent repository is `own-repo`, not `shared`', () => {
  const repo = fixture({ trees: ['own-repo'] });
  const rows = notAudited(repo);
  assert.ok(rows.length > 0, 'fixture produced no unowned trees — the arm tested nothing');
  const row = rowOf(rows, 'indep');
  assert.ok(row, 'the independent repo is missing from notAudited');
  assert.equal(row.link, 'own-repo');
  assert.equal(row.sharesWith, null);
});

test('7. a .git that cannot be parsed is `unverifiable` — declared, never assumed benign', () => {
  const repo = fixture({ trees: ['unverifiable'] });
  const rows = notAudited(repo);
  assert.ok(rows.length > 0, 'fixture produced no unowned trees — the arm tested nothing');
  const row = rowOf(rows, 'broken-tree');
  assert.ok(row, 'the malformed tree is missing from notAudited');
  assert.equal(row.link, 'unverifiable');
  assert.match(run(repo).out, /gitdir UNVERIFIABLE/);
});

test('8. REVERSE CONTROL — it DECLARES and does not REFUSE: a shared tree moves NO exit code', () => {
  // These trees are LAWFUL (RETENTION LAW forbids deleting them). A red here
  // would fire during ordinary correct operation, and would also prejudge
  // F-2159-1 by making the answer to "root this in test:ledger-guards?"
  // permanently red.
  //
  // Stated as a DIFFERENTIAL, not as an absolute code, because measuring found
  // the absolute is not this arm's to pin: a fixture with no `origin` remote
  // already exits 2 from F-2216-1's `mainTreeSource` refusal — correctly, and
  // with NO unowned tree present at all (verified s2406 by isolating it). Pinning
  // rc=0 here would have asserted something about a different cure, and
  // "relaxing until green" without finding the cause is the F-1410-2 antipattern.
  // The claim this arm actually makes is that ADDING a shared tree changes
  // nothing about the verdict.
  const without = fixture({ trees: [] });
  const withShared = fixture({ trees: ['salvage'] });

  // ground truth first (F-2215-1): the two fixtures really do differ in the way
  // this arm depends on, or the comparison below is vacuous.
  assert.equal(notAudited(without).length, 0, 'control fixture unexpectedly has unowned trees');
  assert.ok(
    notAudited(withShared).some((d) => d.link === 'shared'),
    'subject fixture has no shared tree — the arm would compare two identical boards',
  );

  for (const mode of [[], ['--strict'], ['--json']]) {
    const label = mode.length ? mode[0] : 'advisory';
    assert.equal(
      run(withShared, mode).rc,
      run(without, mode).rc,
      `a lawful shared tree moved the exit code in ${label} mode — it must declare, not refuse`,
    );
  }
  assert.equal(run(withShared).rc, 0, 'advisory mode must exit 0');
  assert.doesNotThrow(
    () => JSON.parse(run(withShared, ['--json']).out),
    '--json must stay parseable',
  );
});

test('9. REVERSE CONTROL — a REGISTERED worktree never enters the unowned list at all', () => {
  const repo = fixture({ trees: ['salvage'] });
  const rows = notAudited(repo);
  assert.ok(
    !rows.some((d) => /worktrees\/lane-x$/.test(d.name)),
    'the live registered worktree was reported as unowned — the registry read is broken',
  );
});

test('10. F-2208-1 — the link is declared on EVERY row, including the benign ones', () => {
  const repo = fixture({ trees: ['no-git', 'own-repo'] });
  const { out } = run(repo);
  for (const needle of ['plain-dir', 'indep']) {
    const row = out.split('\n').find((l) => l.includes(needle));
    assert.ok(row, `no row printed for ${needle}`);
    // A declaration that appears only on failure re-creates the ambiguity it
    // removes: a bare row would again read as "nothing worth saying here".
    assert.match(row, /—\s+self-contained/, `${needle} printed no link declaration`);
  }
  // ...and with nothing shared, the hazard paragraph must stay silent.
  assert.doesNotMatch(out, /Never run a writing git command inside one/);
});

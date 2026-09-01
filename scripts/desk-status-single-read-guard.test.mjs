/**
 * F-2271-1 — the desk family reads STATUS.md ONCE per verdict, not twice.
 *
 * WHY THIS EXISTS. F-2265-1 (s2265) cured `authorable-candidates.mjs`, which read
 * `tasks/goals.json` twice per verdict, and named the axis: every declaration this
 * streak has built since s2204 asks WHETHER a corpus could be read (F-2217-1) or
 * WHICH TREE it came from (F-2222-1); none asks WHEN. It then handed the next fire
 * a MEASURED residue — desk-birth-guard.mjs reads STATUS.md at two sites separated
 * by git calls — explicitly marked "UNMEASURED as to harm; test before spending".
 *
 * MEASURED s2271, and the harm half is REFUTED for the prescribed invocation while
 * the structure is real. Both arms manufactured against corpus-tree.mjs directly,
 * with the control varied across the decision boundary (the first attempt was
 * VACUOUS — it never supplied a line-1 equal to main's, so both values landed on
 * the same branch and it wrongly read DISCARDED in both trees):
 *
 *   main worktree    statusText DISCARDED — frozenTreeCheck returns at its
 *                    `tree !== 'linked-worktree'` line BEFORE the argument is used.
 *                    REAL text and GARBAGE text give identical answers.
 *   linked worktree  statusText CONSUMED — main's own line-1 -> PROCEED,
 *                    GARBAGE -> REFUSAL. The answers DIFFER.
 *
 * SEVERITY, STATED HONESTLY AND DELIBERATELY NOT INFLATED: this was never a false
 * green and no verdict was ever wrong. In the prescribed invocation the second
 * read's VALUE is discarded; in a linked worktree it is consumed, but a mid-run
 * rewrite of a frozen tracked checkout is part of no workflow (lane tasks are
 * firewalled from STATUS.md). The window is real in the CODE and unreachable in the
 * WORKFLOW. The unconditional cost is a 12.7 MB read thrown away on every run.
 *
 * THE CURE IS FINISHING A CLASS, NOT A NEW IDEA: desk-carryforward-guard.mjs:341
 * has ALWAYS had the cured structure (`statusText` read once, fed to analyse AND to
 * frozenTreeCheck). Its two siblings did not. For the Nth fire running in this
 * streak, the corpus already held the correct pattern and two files had simply
 * never adopted it — so arm 3 pins the sibling as a REVERSE CONTROL, proving the
 * assertion is not newly invented and cannot be satisfied vacuously.
 *
 * WHY THE COUNTER IS A RUNTIME SHIM AND NOT A SOURCE REGEX. s2265's own note (D)
 * recorded that its lexical "read exactly ONCE" arm did NOT red pre-cure, because
 * the second read hid behind a helper. s2271 then measured BOTH directions of that
 * error on this repo: a token census OVER-admits, because this repo's cure comments
 * QUOTE the code they cure (attended-owed-audit.mjs:122 is a COMMENT reading "the
 * `readFileSync(target)` probe below"), so a lexical sweep systematically accuses
 * the best-documented files; and naive comment-stripping UNDER-admits SILENTLY — a
 * template-literal stripper ate the live code in this very file and made all three
 * real subjects vanish from the census, which is the direction F-2207-1 warns about
 * (make a selector's failure mode over-inclusion). Counting the actual reads at
 * RUNTIME is immune to both, and it asserts the property rather than a proxy for it.
 *
 * F-2273-1 (measured s2273, CURED s2277) — A COUNTER IS ONLY AS COMPLETE AS THE
 * CHANNELS IT OBSERVES, AND THIS ONE OBSERVED ONE CHANNEL WHILE CLAIMING A UNIVERSAL.
 * The shim patched `fs.readFileSync` alone, so a second read of STATUS.md reached
 * through `git show <rev>:STATUS.md` was INVISIBLE: arms 1-3 asserted "exactly ONCE"
 * and stayed GREEN with the double read fully restored. Re-measured s2277 before
 * spending, by manufacturing the regression on desk-birth-guard in a linked worktree:
 *
 *   CURED baseline        fs=1   git revs ["main"]
 *   git-channel variant   fs=1   git revs ["HEAD", "main"]   <- IDENTICAL on fs
 *
 * THE REVERSE CONTROL FORBIDS THE OBVIOUS CURE, and it is measured above rather than
 * argued: all three cured guards ALREADY read `main:STATUS.md` through git exactly
 * once in a linked worktree (corpus-tree.mjs:85, line1MatchesMain — the sanctioned
 * cross-check that keeps a frozen checkout from gating on a stale board). Folding git
 * reads into one "exactly once" TOTAL would therefore red all three CORRECT files.
 * So the discriminator is not a total, it is a REV: `main:STATUS.md` is the sanctioned
 * second board, and any OTHER `<rev>:STATUS.md` is a second board arriving unannounced.
 *
 * The channel denominator is DECLARED in the assertion messages (F-2208-1: a counter
 * that does not say what it watched invites the next reader to assume it watched
 * everything). A channel this instrument does NOT observe is a known hole, not a
 * silent one: reads through a spawned SHELL string (`execSync('git show ...')`) are
 * not attributed, because there are no argv members to key on.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync, rmSync, existsSync, realpathSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const roots = [];

function git(cwd, ...args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(args.join(' ') + ': ' + r.stderr);
  return r;
}

const HANDOFF = (n) =>
  `Last updated: 2026-08-23T0${n}:00Z s100${n} handoff, lock CLEARED — work landed. ` +
  `🔺 **OWNER'S DESK — 1 awaiting a word.** 🔺 **F-AAA-1**`;

/**
 * A CLEAN board plus a linked worktree branched one handoff early. Clean is
 * load-bearing: frozenTreeCheck sits on the PASS path only (F-2241-1), so a fixture
 * carrying a defect FAILS before the second read and the pre-cure arms would count
 * 1 and pass vacuously — the same shape as running these guards while a fire holds
 * the lock, where line-1 is ACTIVE, both guards SKIP, and a before/after comparison
 * comes back "identical" having executed nothing (s2227's trap: a SKIP is not
 * silence, it DEFEATS the agreeing-silences rule by satisfying it).
 */
function build() {
  const root = mkdtempSync(path.join(tmpdir(), 's2271-'));
  roots.push(root);
  mkdirSync(path.join(root, 'tasks'), { recursive: true });
  git(root, 'init', '-q', '-b', 'main');
  git(root, 'config', 'user.email', 'f@x');
  git(root, 'config', 'user.name', 'f');

  const archive = [];
  let prev = null;
  const status = (t) => {
    if (prev) archive.unshift(`- **s${1000 + archive.length + 1} handoff (line-1 archive):** ${prev}`);
    prev = t;
    writeFileSync(path.join(root, 'STATUS.md'), [t, ...archive].join('\n') + '\n');
  };

  status(HANDOFF(1));
  writeFileSync(path.join(root, 'tasks', 'BACKLOG.md'),
    '# BACKLOG\n\n🔺 **F-AAA-1 (s1001)** — declared. GATE: none.\n');
  git(root, 'add', '-A'); git(root, 'commit', '-q', '-m', 's1001 handoff: base');

  // Two handoffs before the branch point: desk-birth-guard's window is
  // [previous handoff .. HEAD] and a one-commit tree refuses for lack of history —
  // a FIXTURE artifact that would masquerade as the property under test.
  status(HANDOFF(2));
  git(root, 'add', '-A'); git(root, 'commit', '-q', '-m', 's1002 handoff: still clean');

  const wt = path.join(root, 'wt');
  git(root, 'worktree', 'add', '-q', '-b', 'lane', wt);

  status(HANDOFF(3));
  git(root, 'add', '-A'); git(root, 'commit', '-q', '-m', 's1003 handoff: clean');
  return { root, wt };
}

/**
 * The sanctioned second board. corpus-tree.mjs's frozenTreeCheck compares a frozen
 * checkout's line-1 against main's, so exactly one `main:STATUS.md` git read is the
 * CURED behaviour of all three subjects. Any other rev is the regression.
 */
const SANCTIONED_REV = 'main';

/** The channels this instrument observes, named so an arm can declare its denominator. */
const CHANNELS =
  'fs read family (readFileSync/readFile/promises.readFile/createReadStream/openSync) ' +
  '+ git <rev>:STATUS.md via spawnSync/execFileSync/spawn/execFile';

/**
 * Patch the CHILD's read surface and tally STATUS.md reads PER CHANNEL.
 *
 * F-2273-1: the fs family is widened because `readFileSync` is one of several ways to
 * read a file, and the git channel is counted SEPARATELY — keyed on the rev — because
 * one git read of `main:STATUS.md` is correct and a total would red it (see header).
 *
 * `node -r` preloads this BEFORE the subject module is instantiated, and node builds a
 * builtin's ESM named exports from the same patched object, so `import { spawnSync }`
 * and `import { readFileSync }` both pick up the patch. That is MEASURED, not assumed:
 * the git revs below arrive from corpus-tree.mjs, which imports spawnSync by name.
 */
function counterShim(dir) {
  const p = path.join(dir, 'counter.cjs');
  writeFileSync(p, [
    "const fs = require('fs');",
    "const path = require('path');",
    "const cp = require('child_process');",
    'let n = 0; const revs = [];',
    "const isStatus = (f) => { try { return typeof f === 'string' && path.basename(f) === 'STATUS.md'; } catch { return false; } };",
    "for (const name of ['readFileSync', 'readFile', 'createReadStream', 'openSync']) {",
    '  const orig = fs[name];',
    "  if (typeof orig !== 'function') continue;",
    '  fs[name] = function (f, ...rest) { if (isStatus(f)) n += 1; return orig.call(this, f, ...rest); };',
    '}',
    'try {',
    '  const origPromise = fs.promises && fs.promises.readFile;',
    "  if (typeof origPromise === 'function') {",
    '    fs.promises.readFile = function (f, ...rest) { if (isStatus(f)) n += 1; return origPromise.call(this, f, ...rest); };',
    '  }',
    '} catch {}',
    // A git pathspec is `<rev>:<path>`; the path half may be repo-relative.
    "const REV = /^([^\\s:]+):(?:.*\\/)?STATUS\\.md$/;",
    'const note = (cmd, args) => {',
    '  try {',
    "    if (path.basename(String(cmd)) !== 'git' || !Array.isArray(args)) return;",
    '    for (const a of args) { const m = REV.exec(String(a)); if (m) revs.push(m[1]); }',
    '  } catch {}',
    '};',
    "for (const name of ['spawnSync', 'execFileSync', 'spawn', 'execFile']) {",
    '  const orig = cp[name];',
    "  if (typeof orig !== 'function') continue;",
    '  cp[name] = function (cmd, args, ...rest) { note(cmd, args); return orig.call(this, cmd, args, ...rest); };',
    '}',
    "process.on('exit', () => {",
    '  try { fs.writeFileSync(process.env.S2271_COUNT_FILE, JSON.stringify({ fs: n, git: revs })); } catch {}',
    '});',
  ].join('\n'));
  return p;
}

/** Run `script` from `cwd` and return how many times it read STATUS.md. */
function reads(scriptPath, cwd, dir) {
  const shim = counterShim(dir);
  const countFile = path.join(dir, 'count.' + path.basename(scriptPath) + '.txt');
  const r = spawnSync('node', ['-r', shim, scriptPath], {
    timeout: 240_000, killSignal: 'SIGKILL',
    cwd, encoding: 'utf8', env: { ...process.env, S2271_COUNT_FILE: countFile },
  });
  const all = (r.stdout ?? '') + (r.stderr ?? '');
  assert.ok(all.length > 0, 'control validity (F-2215-1): the arm produced no output at all — it did not run');
  // F-2215-1's "did it produce anything?" is SATISFIED BY A CRASH — a stack trace is
  // bytes. s2265 named this and it still bit this file: a variant missing a
  // transitive import wrote ERR_MODULE_NOT_FOUND to stderr and read STATUS.md zero
  // times. So assert the arm reached the SUBJECT'S OWN output, not merely output.
  assert.match(r.stdout ?? '', /^=== desk-\w+-guard ===/m,
    `control validity: the run never reached the guard's own banner — it crashed or never started:\n${all.slice(0, 400)}`);
  assert.doesNotMatch(r.stdout ?? '', /SKIP —/,
    'control validity: the guard SKIPped, so it never reached the second read — this arm would pass vacuously');
  assert.ok(existsSync(countFile), 'the counter shim never wrote its tally — the instrument, not the subject, failed');
  const tally = JSON.parse(readFileSync(countFile, 'utf8'));
  const git = tally.git ?? [];
  return {
    n: tally.fs,
    git,
    sanctioned: git.filter((rev) => rev === SANCTIONED_REV),
    unsanctioned: git.filter((rev) => rev !== SANCTIONED_REV),
    rc: r.status,
    all,
  };
}

/**
 * The once-per-verdict property, asserted across EVERY channel this instrument
 * observes — and the denominator declared in every message, so a future reader can
 * tell "I watched these channels and saw one read" from "I watched one channel".
 */
function assertReadsOnce(r, name, why) {
  assert.equal(r.n, 1, `${name}: read STATUS.md ${r.n}x through the fs channel — ${why}. Channels observed: ${CHANNELS}`);
  assert.deepEqual(r.unsanctioned, [],
    `${name}: reached a SECOND board through git (${JSON.stringify(r.unsanctioned)}:STATUS.md) — ` +
    `${why}. Only ${SANCTIONED_REV}:STATUS.md is the sanctioned cross-check (corpus-tree.mjs, frozenTreeCheck). ` +
    `Channels observed: ${CHANNELS}`);
  assert.ok(r.sanctioned.length <= 1,
    `${name}: read ${SANCTIONED_REV}:STATUS.md ${r.sanctioned.length}x — the sanctioned cross-check is ONE read too. ` +
    `Channels observed: ${CHANNELS}`);
}

/**
 * Restore the pre-cure double read on a scratch copy.
 *
 * THE COPY MUST NOT LIVE IN scripts/, AND THE FIRST DRAFT OF THIS FILE PROVED WHY
 * BY REDDING A SIBLING. Writing `.s2271-precure-*.mjs` there made
 * `finding-id-pattern-guard.test.mjs` — which scans scripts/ for private F-ID
 * patterns and runs CONCURRENTLY in the same `node --test` invocation — fail with
 * "a new private F-ID pattern appeared". A guard that drops files into a shared run
 * surface manufactures false reds in whatever else is reading it (F-1665-1: scripts/
 * is a RUN SURFACE, and a fire's scratch belongs outside it).
 *
 * So the variant goes to a temp dir with `corpus-tree.mjs` copied beside it — the
 * only relative import either guard has. Two traps are handled here, both of which
 * make an arm pass for the wrong reason rather than fail:
 *   * s2265 trap (C): the dir is realpathSync'd. macOS symlinks /var/folders (where
 *     mkdtemp lives) into /private, so node's ESM loader resolves import.meta.url to
 *     /private/var/... while pathToFileURL(process.argv[1]) says /var/... — the
 *     module-main guard is then FALSE, main() never runs, and the arm sees 0 reads.
 *   * s2264: a variant that no longer CONSTRUCTS is indistinguishable from a guard
 *     with teeth, so the edit is asserted to have matched AND the result to parse.
 */
const FS_SECOND_READ = "frozenTreeCheck(ROOT, fs.readFileSync(statusPath, 'utf8'), ";
/**
 * The SAME regression reached through git instead of fs (F-2273-1). desk-birth-guard
 * already imports execFileSync at :65, so this variant needs no new import — which is
 * exactly why the channel is not exotic: it is this file family's native idiom for
 * reading a corpus (desk-birth-guard.mjs reads BACKLOG.md by `git diff`).
 */
const GIT_SECOND_READ =
  "frozenTreeCheck(ROOT, execFileSync('git', ['-C', ROOT, 'show', 'HEAD:STATUS.md'], " +
  '{ encoding: \'utf8\', maxBuffer: 64 << 20 }), ';

function preCure(name, replacement = FS_SECOND_READ) {
  const needle = 'frozenTreeCheck(ROOT, statusText, ';
  const src = readFileSync(path.join(SCRIPTS, name + '.mjs'), 'utf8');
  assert.ok(src.includes(needle), `variantOf: the anchor is absent from ${name} — the edit matched NOTHING, so this arm would test a file it never modified (s2264)`);
  const dir = realpathSync(mkdtempSync(path.join(tmpdir(), 's2271-variant-')));
  roots.push(dir);
  // TRANSITIVELY, not just corpus-tree.mjs. desk-birth-guard.mjs also imports
  // ./desk-declaration-guard.mjs, from a second import block far below its header —
  // copying only the one import a `grep` of the first 70 lines showed produced
  // ERR_MODULE_NOT_FOUND. That crash is the trap, not the miss: it wrote a stack
  // trace to stderr, so F-2215-1's "did the arm PRODUCE anything?" was SATISFIED
  // while nothing under test had run, and the arm failed 0 !== 2 for a reason that
  // had nothing to do with reads. Hence the reached-the-real-output assertion below.
  const copied = new Set();
  const copyDeps = (file) => {
    for (const m of readFileSync(file, 'utf8').matchAll(/from\s+'(\.\/[^']+)'/g)) {
      const dep = m[1].slice(2);
      if (copied.has(dep)) continue;
      copied.add(dep);
      copyFileSync(path.join(SCRIPTS, dep), path.join(dir, dep));
      copyDeps(path.join(SCRIPTS, dep));
    }
  };
  copyDeps(path.join(SCRIPTS, name + '.mjs'));
  const out = path.join(dir, name + '.mjs');
  writeFileSync(out, src.replace(needle, replacement));
  // The first draft of this helper replaced the CALL PREFIX rather than the
  // argument, producing `const frozen = fs.readFileSync(...)'desk-birth-guard');`
  // — a SYNTAX ERROR. The variant then read STATUS.md zero times and the arm
  // failed with 0 !== 2. That is s2264's trap ("a variant that no longer
  // CONSTRUCTS is indistinguishable from a guard with teeth") arriving as a wrong
  // COUNT instead of a false pass, and it is why asserting the needle MATCHED is
  // not enough: assert the variant still PARSES AND RUNS.
  const syntax = spawnSync('node', ['--check', out], { timeout: 240_000, killSignal: 'SIGKILL', encoding: 'utf8' });
  assert.equal(syntax.status, 0,
    `the manufactured variant does not parse, so it tests nothing:\n${syntax.stderr}`);
  return out;
}

test.after(() => {
  for (const r of roots) rmSync(r, { recursive: true, force: true });
});

test('1. desk-birth-guard reads STATUS.md exactly ONCE on the path that consumes it', () => {
  const { wt } = build();
  const r = reads(path.join(SCRIPTS, 'desk-birth-guard.mjs'), wt, path.dirname(wt));
  assert.match(r.all, /linked worktree/, 'the fixture must reach frozenTreeCheck, or the count proves nothing');
  assertReadsOnce(r, 'desk-birth-guard', 'the verdict and the freshness check must share one read');
});

test('2. desk-declaration-guard reads STATUS.md exactly ONCE on the path that consumes it', () => {
  const { wt } = build();
  const r = reads(path.join(SCRIPTS, 'desk-declaration-guard.mjs'), wt, path.dirname(wt));
  assert.match(r.all, /linked worktree/, 'the fixture must reach frozenTreeCheck, or the count proves nothing');
  assertReadsOnce(r, 'desk-declaration-guard', 'the desk and the freshness check must share one read');
});

test('3. REVERSE CONTROL — desk-carryforward-guard, which always had the cured structure, still reads ONCE', () => {
  const { wt } = build();
  const r = reads(path.join(SCRIPTS, 'desk-carryforward-guard.mjs'), wt, path.dirname(wt));
  assertReadsOnce(r, 'desk-carryforward-guard', 'the sibling this cure was copied FROM must not regress');
});

test('4. TEETH — the pre-cure desk-birth-guard reads STATUS.md TWICE', () => {
  const { wt } = build();
  const v = preCure('desk-birth-guard');
  const r = reads(v, wt, path.dirname(wt));
  assert.equal(r.n, 2, 'restoring the second read must be VISIBLE to this instrument, or arm 1 is decoration');
});

test('5. TEETH — the pre-cure desk-declaration-guard reads STATUS.md TWICE', () => {
  const { wt } = build();
  const v = preCure('desk-declaration-guard');
  const r = reads(v, wt, path.dirname(wt));
  assert.equal(r.n, 2, 'restoring the second read must be VISIBLE to this instrument, or arm 2 is decoration');
});

test('6. INSTRUMENT VALIDITY — the counter counts, so a 0 cannot be mistaken for a pass', () => {
  const { root, wt } = build();
  const dir = path.dirname(wt);
  const probe = path.join(dir, 'probe.mjs');
  writeFileSync(probe, [
    "import fs from 'node:fs';",
    "import path from 'node:path';",
    "const p = path.join(process.cwd(), 'STATUS.md');",
    'for (let i = 0; i < 3; i += 1) fs.readFileSync(p, "utf8");',
    "console.log('probe read it three times');",
  ].join('\n'));
  const shim = counterShim(dir);
  const countFile = path.join(dir, 'count.probe.txt');
  const r = spawnSync('node', ['-r', shim, probe], {
    timeout: 240_000, killSignal: 'SIGKILL',
    cwd: root, encoding: 'utf8', env: { ...process.env, S2271_COUNT_FILE: countFile },
  });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(JSON.parse(readFileSync(countFile, 'utf8')).fs, 3,
    'the shim under-counted a known number of reads — every other arm in this file is then unsound');
});

test('8. TEETH (F-2273-1) — the SAME double read through `git show HEAD:STATUS.md` must RED', () => {
  const { wt } = build();
  const v = preCure('desk-birth-guard', GIT_SECOND_READ);
  const r = reads(v, wt, path.dirname(wt));
  // The whole finding in one assertion: on the channel the pre-F-2273-1 counter
  // watched, this variant is INDISTINGUISHABLE from the cured baseline. Measured
  // s2277 before the cure was written — cured fs=1 git=["main"], variant fs=1
  // git=["HEAD","main"] — so arms 1-3 stayed green with the double read restored.
  assert.equal(r.n, 1, 'the git-channel regression must remain invisible to the fs counter, or this arm is testing something else');
  assert.deepEqual(r.unsanctioned, ['HEAD'],
    'the git channel must SEE the second board — if this is empty the widened shim is decoration');
  // The regex also pins the DECLARATION (F-2208-1): a counter that does not name the
  // channels it watched invites the next reader to assume it watched everything, which
  // is precisely the assumption F-2273-1 was. Without this clause, dropping the
  // declaration reds no arm at all and it decays into a comment.
  assert.throws(() => assertReadsOnce(r, 'desk-birth-guard', 'x'),
    /SECOND board through git[\s\S]*Channels observed: fs read family[\s\S]*git <rev>:STATUS\.md/,
    'the assertion the real arms use must REJECT this variant, and must DECLARE the channels it watched');
});

test('9. REVERSE CONTROL (F-2273-1) — the sanctioned `main:STATUS.md` read must NOT count as a violation', () => {
  const { wt } = build();
  const r = reads(path.join(SCRIPTS, 'desk-birth-guard.mjs'), wt, path.dirname(wt));
  // This is the arm that catches the over-general cure. Folding git reads into one
  // "exactly once" TOTAL passes arm 8 and reds all three CORRECT guards, because
  // corpus-tree.mjs's frozenTreeCheck legitimately asks main for its line-1.
  assert.deepEqual(r.sanctioned, [SANCTIONED_REV],
    'the cured baseline must actually PERFORM the sanctioned cross-check here, or arms 1-3 prove nothing about the git channel');
  assert.equal(r.n + r.sanctioned.length, 2,
    'the cured baseline reads STATUS.md twice IN TOTAL across channels — one fs read plus one sanctioned main: read. ' +
    'A cure that asserts a total of 1 reds correct code.');
  assertReadsOnce(r, 'desk-birth-guard', 'the sanctioned cross-check is not a violation');
});

test('10. INSTRUMENT VALIDITY — the git counter counts, so an empty rev list cannot be mistaken for a pass', () => {
  const { root, wt } = build();
  const dir = path.dirname(wt);
  const probe = path.join(dir, 'gitprobe.mjs');
  writeFileSync(probe, [
    "import { execFileSync, spawnSync } from 'node:child_process';",
    "execFileSync('git', ['show', 'HEAD:STATUS.md'], { encoding: 'utf8' });",
    "spawnSync('git', ['show', 'main:STATUS.md'], { encoding: 'utf8' });",
    "console.log('probe read two boards');",
  ].join('\n'));
  const shim = counterShim(dir);
  const countFile = path.join(dir, 'count.gitprobe.txt');
  const r = spawnSync('node', ['-r', shim, probe], {
    timeout: 240_000, killSignal: 'SIGKILL',
    cwd: root, encoding: 'utf8', env: { ...process.env, S2271_COUNT_FILE: countFile },
  });
  assert.equal(r.status, 0, r.stderr);
  const tally = JSON.parse(readFileSync(countFile, 'utf8'));
  assert.deepEqual(tally.git, ['HEAD', 'main'],
    'the shim missed a known number of git reads through BOTH spawners — every git assertion in this file is then unsound');
  assert.equal(tally.fs, 0, 'a git read must not also be tallied on the fs channel — the two counts would double-report');
});

test('7. the cure is behaviour-neutral — both guards still REFUSE from a frozen worktree', () => {
  const { wt } = build();
  for (const name of ['desk-birth-guard', 'desk-declaration-guard']) {
    const r = spawnSync('node', [path.join(SCRIPTS, name + '.mjs')], { timeout: 240_000, killSignal: 'SIGKILL', cwd: wt, encoding: 'utf8' });
    const all = (r.stdout ?? '') + (r.stderr ?? '');
    assert.equal(r.status, 2, `${name}: ${all}`);
    assert.match(all, /REFUSING/, name);
    // F-2210-1: assert the WORD, not merely the exit code.
    assert.doesNotMatch(r.stdout ?? '', /PASS —/, name);
  }
});

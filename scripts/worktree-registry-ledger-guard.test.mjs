// Guard for scripts/worktree-registry-ledger.mjs (F-2638-1).
//
// The subject exists because F-2636-1's binding duty — bank the `corpus` COUNT, treat a
// FALL as a finding — could not answer its own question when a fall actually happened
// (s2637 banked 110, s2638 measured 109). A count cannot name a departure, and neither can
// the disk, because de-registration removes the `.git` file that distinguishes a worktree
// from an ordinary directory. So the SET must be banked before the fall.
//
// What these arms defend, in order of how much it would cost to lose:
//   * a REMOVED tree is NAMED, and judged for surviving evidence (the whole point);
//   * a removal is never reported as "unchanged" (the silent direction);
//   * an UNREADABLE baseline REFUSES rather than reading as no-change (F-2212-1 polarity —
//     the failure value must coerce toward noticing);
//   * an ABSENT baseline DECLARES and does NOT refuse (lawful first run; refusing there is
//     the over-general cure that gets excused into uselessness, F-1460-1);
//   * the corpus declaration prints on the HAPPY path too (F-2208-1);
//   * the verdict is cwd-invariant (F-2220-1 — the dangerous cwd is a SUBDIRECTORY, which
//     keeps git healthy and narrows only the corpus);
//   * bytes are labelled DECIMAL (F-2637-1 — four evidence tools print ` MB` and two mean
//     mebibytes, so an unlabelled figure is a 4.9% trap).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SUBJECT = process.env.WT_LEDGER_SUBJECT || join(HERE, 'worktree-registry-ledger.mjs');

// spawnSync reports by RETURN VALUE and never throws (s2216), so a --strict refusal — a
// legitimate VERDICT for this tool, not a crash — is readable as a status rather than
// caught as an exception (F-2212-1).
// `--root` is MANDATORY here and is the difference between a guard and a decoration: the
// subject anchors to its OWN directory, never to cwd, so a fixture that only sets `cwd`
// measures the REAL repo. `cwd` is a separate parameter precisely so arm 13 can vary it
// while holding the root fixed — which is the only way that arm tests anything.
function cli(root, args = [], cwd = root) {
  const r = spawnSync('node', [SUBJECT, '--root', root, ...args], {
    cwd,
    encoding: 'utf8',
    timeout: 240_000,
    killSignal: 'SIGKILL',
  });
  return { status: r.status, out: r.stdout || '', err: r.stderr || '' };
}

function git(cwd, args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', timeout: 240_000, killSignal: 'SIGKILL' });
}

// A fixture must hold ONLY the subject: a base commit that tracked an evidence file would
// put one into EVERY worktree and make the "no evidence" arm unreachable (s2617's paid-for
// lesson, where a fixture's own base commit made a bucket structurally impossible).
function fixture() {
  const dir = mkdtempSync(join(tmpdir(), 'wtreg-'));
  git(dir, ['init', '-q', '-b', 'main']);
  git(dir, ['config', 'user.email', 'f@example.com']);
  git(dir, ['config', 'user.name', 'Fixture']);
  mkdirSync(join(dir, 'logs'), { recursive: true });
  writeFileSync(join(dir, 'README.md'), 'fixture\n');
  git(dir, ['add', 'README.md']);
  git(dir, ['commit', '-qm', 'base']);
  return dir;
}

function baseline(dir, worktrees) {
  writeFileSync(
    join(dir, 'logs', 'worktree-registry.json'),
    JSON.stringify({ measured: '2026-09-19T00:00:00.000Z', session: 's0000', count: worktrees.length, worktrees }, null, 2) + '\n',
  );
}

function liveSet(dir) {
  return git(dir, ['worktree', 'list', '--porcelain'])
    .split('\n')
    .filter((l) => l.startsWith('worktree '))
    .map((l) => l.slice(9))
    .sort();
}

const CLEANUP = [];
process.on('exit', () => {
  for (const d of CLEANUP) {
    try {
      rmSync(d, { recursive: true, force: true });
    } catch {}
  }
});
function fresh() {
  const d = fixture();
  CLEANUP.push(d);
  return d;
}

test('1. a REMOVED tree is named in the output — the whole point of banking a set', () => {
  const dir = fresh();
  const ghost = join(dir, 'departed-tree');
  mkdirSync(join(ghost, 'artifacts'), { recursive: true });
  writeFileSync(join(ghost, 'artifacts', 'tape.json'), 'x'.repeat(1000));
  baseline(dir, [...liveSet(dir), ghost].sort());
  const r = cli(dir);
  assert.ok(r.out.length > 0, 'control: the subject produced output');
  assert.match(r.out, /REMOVED \(1\)/);
  assert.ok(r.out.includes(ghost), 'the departed path is named verbatim');
});

test('2. a removed tree STILL HOLDING evidence is judged, with a file count', () => {
  const dir = fresh();
  const ghost = join(dir, 'holding-tree');
  mkdirSync(join(ghost, 'artifacts', 'nested'), { recursive: true });
  writeFileSync(join(ghost, 'artifacts', 'a.json'), 'x'.repeat(500));
  writeFileSync(join(ghost, 'artifacts', 'nested', 'b.log'), 'y'.repeat(500));
  baseline(dir, [...liveSet(dir), ghost].sort());
  const r = cli(dir);
  assert.match(r.out, /STILL HOLDING EVIDENCE/);
  assert.match(r.out, /2 file\(s\)/);
});

test('3. a removed tree that is GONE FROM DISK says so — it is not conflated with holding', () => {
  const dir = fresh();
  const ghost = join(dir, 'never-existed');
  assert.equal(existsSync(ghost), false, 'control: the fixture path really is absent');
  baseline(dir, [...liveSet(dir), ghost].sort());
  const r = cli(dir);
  assert.match(r.out, /GONE FROM DISK TOO/);
  assert.doesNotMatch(r.out, /STILL HOLDING EVIDENCE/);
});

test('4. bytes are labelled DECIMAL — an unlabelled MB is a 4.9% trap (F-2637-1)', () => {
  const dir = fresh();
  const ghost = join(dir, 'sized-tree');
  mkdirSync(join(ghost, 'artifacts'), { recursive: true });
  writeFileSync(join(ghost, 'artifacts', 'a.bin'), 'x'.repeat(2_000_000));
  baseline(dir, [...liveSet(dir), ghost].sort());
  const r = cli(dir);
  assert.match(r.out, /decimal, F-2637-1/);
  assert.match(r.out, /2\.0 MB/, '2,000,000 bytes is 2.0 DECIMAL MB (it would be 1.9 MiB)');
});

test('5. an ADDED registration is named too', () => {
  const dir = fresh();
  baseline(dir, []);
  const r = cli(dir);
  assert.match(r.out, /ADDED \(1\)/);
  assert.ok(r.out.includes(dir) || r.out.includes(existsSync(dir) ? dir : ''), 'the new path is named');
});

test('6. --strict: a CHANGED set exits 1 (answered, and the answer is a change)', () => {
  const dir = fresh();
  baseline(dir, [...liveSet(dir), join(dir, 'ghost')].sort());
  assert.equal(cli(dir, ['--strict']).status, 1);
});

test('7. an UNCHANGED set exits 0 in both modes and says so — the reverse control', () => {
  const dir = fresh();
  baseline(dir, liveSet(dir));
  const plain = cli(dir);
  const strict = cli(dir, ['--strict']);
  assert.match(plain.out, /✅ UNCHANGED/);
  assert.doesNotMatch(plain.out, /REMOVED/);
  assert.doesNotMatch(plain.out, /ADDED/);
  assert.equal(plain.status, 0);
  assert.equal(strict.status, 0);
});

test('8. the corpus declaration prints on the HAPPY path too (F-2208-1)', () => {
  const dir = fresh();
  baseline(dir, liveSet(dir));
  const r = cli(dir);
  assert.match(r.out, /registry\s+: 1 registered worktree\(s\) \[live\]/);
  assert.match(r.out, /baseline\s+: read/);
});

test('9. an ABSENT baseline DECLARES and does NOT refuse — lawful first run', () => {
  const dir = fresh();
  const r = cli(dir, ['--strict']);
  assert.match(r.out, /NO BASELINE YET/);
  assert.equal(r.status, 0, 'refusing here is the over-general cure (F-1460-1)');
  assert.match(r.out, /--update/, 'the remedy is printed at the site (F-2451-1)');
});

test('10. an UNREADABLE baseline REFUSES with 2 — never read as "no change"', () => {
  const dir = fresh();
  writeFileSync(join(dir, 'logs', 'worktree-registry.json'), '{ this is not json');
  const r = cli(dir, ['--strict']);
  assert.match(r.out, /CANNOT VERIFY/);
  assert.equal(r.status, 2, '2 = could not answer, distinct from 1 = answered-and-refuses');
  assert.doesNotMatch(r.out, /✅ UNCHANGED/);
});

test('11. a reported change carries its runnable remedy (F-2451-1)', () => {
  const dir = fresh();
  baseline(dir, [...liveSet(dir), join(dir, 'ghost')].sort());
  const r = cli(dir);
  assert.match(r.out, /node scripts\/worktree-registry-ledger\.mjs --update/);
  assert.match(r.out, /git add logs\/worktree-registry\.json/);
});

test('12. --update re-banks, and the next run reads UNCHANGED', () => {
  const dir = fresh();
  baseline(dir, [...liveSet(dir), join(dir, 'ghost')].sort());
  const first = cli(dir, ['--update']);
  assert.match(first.out, /BANKED/);
  const second = cli(dir);
  assert.match(second.out, /✅ UNCHANGED/);
});

test('13. the verdict is cwd-invariant at a fixed root — a SUBDIRECTORY is the dangerous cwd (F-2220-1)', () => {
  const dir = fresh();
  const ghost = join(dir, 'ghost-x');
  baseline(dir, [...liveSet(dir), ghost].sort());
  const sub = join(dir, 'logs');
  // Same --root, two different cwds. A `process.cwd()` dependency introduced later would
  // move one of these and not the other; tmpdir is deliberately NOT used as the second cwd,
  // because outside a repo tools tend to fail LOUD and the arm would pass for the wrong
  // reason (F-2220-1's own correction: the dangerous cwd is the one that still looks like home).
  const atRoot = cli(dir, [], dir);
  const atSub = cli(dir, [], sub);
  assert.ok(atRoot.out.length > 0 && atSub.out.length > 0, 'control: both arms really ran');
  assert.match(atSub.out, /REMOVED \(1\)/, 'a subdirectory must not narrow the corpus to silence');
  assert.ok(atSub.out.includes(ghost));
  assert.equal(atRoot.out, atSub.out, 'byte-identical from both cwds');
  assert.equal(atRoot.status, atSub.status);
});

test('14. the live registry is read from git, not from the baseline — a real worktree counts', () => {
  const dir = fresh();
  const wt = join(dir, 'lane-x');
  git(dir, ['worktree', 'add', '-q', '-b', 'lane-x', wt]);
  baseline(dir, liveSet(dir).filter((p) => !p.includes('lane-x')));
  const r = cli(dir);
  assert.match(r.out, /registry\s+: 2 registered worktree\(s\)/);
  assert.match(r.out, /ADDED \(1\)/);
});

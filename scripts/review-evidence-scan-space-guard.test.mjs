/**
 * review-evidence-scan-space-guard — F-2346-1 (s2346)
 *
 * `review-evidence-audit.mjs` decides its ENTIRE corpus at one line: a backticked span
 * becomes a citation only if it starts with an entry of EVIDENCE_PREFIXES. Anything else
 * is `continue`d BEFORE the counter increments, so it lands in no bucket and in no
 * denominator. The tool then prints `ON-DISK-UNTRACKED=0` and `PASS`, which its caller
 * — .claude/skills/drain/SKILL.md §4, every drain — reads as "no cited evidence dies
 * with this disk".
 *
 * That chooser is CORRECT as drawn (measured s2346: all 216 genuinely-untracked excluded
 * spans are .gitignore'd, owner-amended disk-local run logs, or worktrees/art/ which
 * art-staging-audit already covers). What was wrong is that it was SILENT and UNTESTED,
 * while this file had been hardened TWICE on its crash/exit side (F-2215-1). A matcher
 * hardened twice makes a corpus feel examined while its SELECTOR has never been read.
 *
 * So these arms assert BOTH directions, because a declaration alone is decoration and a
 * widening alone is advice that contradicts .gitignore:
 *   - the scan space is DECLARED, on the happy path too (F-2208-1);
 *   - the declaration is DERIVED from the list, so a stale parallel literal reds;
 *   - the predicate ACCEPTS the two real prefixes and REJECTS the measured-excluded
 *     classes, so an over-general widening reds;
 *   - F-2215-1's three exit codes still mean three different things.
 */
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { EVIDENCE_PREFIXES, isEvidenceCitation } from './review-evidence-audit.mjs';

const SCRIPT = path.join(import.meta.dirname, 'review-evidence-audit.mjs');

function fixture(t, files = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'review-evidence-scan-space-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const [file, body] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), body);
  }
  const git = (...args) => execFileSync('git', args, { cwd: root });
  git('init', '-q');
  git('config', 'user.email', 'fixture@example.com');
  git('config', 'user.name', 'fixture');
  git('add', '-A');
  git('commit', '-qm', 'fixture');
  return root;
}

const cli = (root, ...args) =>
  spawnSync(process.execPath, [SCRIPT, '--root', root, ...args], { timeout: 240_000, killSignal: 'SIGKILL', encoding: 'utf8' });

// ---------------------------------------------------------------- the DECLARATION

test('arm 1 — a genuinely clean board STILL names its scan space (F-2208-1)', (t) => {
  const root = fixture(t, {
    'artifacts/x/report.txt': 'proof\n',
    'reviews/subject.md': 'Evidence: `artifacts/x/report.txt`\n',
  });
  const r = cli(root, 'reviews/subject.md');
  assert.equal(r.status, 0);
  assert.match(r.stdout, /ON-DISK-UNTRACKED=0/, 'precondition: this board really is clean');
  assert.match(
    r.stdout,
    /^scan space: /m,
    'a scan space named only when something goes wrong re-creates the ambiguity it removes',
  );
});

test('arm 2 — the declaration is DERIVED: it names every prefix the predicate uses', (t) => {
  const root = fixture(t, {
    'artifacts/x/report.txt': 'proof\n',
    'reviews/subject.md': 'Evidence: `artifacts/x/report.txt`\n',
  });
  const line = cli(root, 'reviews/subject.md').stdout.split('\n').find((l) => l.startsWith('scan space: '));
  assert.ok(line, 'no scan-space line to check');
  for (const prefix of EVIDENCE_PREFIXES) {
    assert.ok(
      line.includes(prefix),
      `the declaration omits ${prefix} — a stale parallel literal reports a corpus the tool does not use`,
    );
  }
});

// ---------------------------------------------------------------- the DECISION itself

test('arm 3 — the predicate ACCEPTS every declared prefix', () => {
  assert.ok(isEvidenceCitation('artifacts/run/report.md'), 'artifacts/ must be in the scan space');
  assert.ok(isEvidenceCitation('reviews/shots-slice/desktop.png'), 'reviews/shots- must be in the scan space');
  assert.ok(EVIDENCE_PREFIXES.length >= 2, 'an over-narrow cure that drops a prefix must red here');
});

test('arm 4 — the predicate REJECTS the measured-excluded classes (an over-general widening reds)', () => {
  // Each of these was measured on-disk-untracked in the live corpus s2346, and each is
  // lawfully excluded: .gitignore'd build/scratch, or the owner's disk-local run logs
  // (RETENTION LAW amendment 2026-08-26, ruling F-2324-1). Counting them would tell a
  // drain to `git add -f` a path .gitignore or an owner ruling forbids.
  for (const excluded of [
    'dist/assets/index.js',
    'node_modules/typescript/bin/tsc',
    'test-results/.last-run.json',
    'tasks/runs/20260810-212739-lane-d.log',
    'tasks/running',
    'worktrees/art/assets/raw',
    'logs/deploy-result.json',
    'src/game/Game.ts',
  ]) {
    assert.equal(
      isEvidenceCitation(excluded),
      false,
      `${excluded} entered the scan space — widening here emits advice contradicting .gitignore or an owner ruling`,
    );
  }
});

test('arm 5 — the regex is DERIVED from the list, not a parallel literal that can drift', () => {
  const derived = new RegExp(
    `^(?:${EVIDENCE_PREFIXES.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\S*$`,
  );
  const corpus = [
    'artifacts/a', 'artifacts', 'reviews/shots-x/y.png', 'reviews/shots-',
    'reviews/other.md', 'dist/x', 'src/a/b.ts', 'artifacts x', '', 'worktrees/art',
  ];
  for (const span of corpus) {
    assert.equal(
      isEvidenceCitation(span),
      derived.test(span),
      `the predicate disagrees with a regex built from EVIDENCE_PREFIXES on ${JSON.stringify(span)} — the literal has drifted from the list`,
    );
  }
});

// ------------------------------------------- from where the CALLER stands (F-2209-1/F-2210-1)

test('arm 6 — an on-disk-untracked citation is still FOUND and NAMED, and still reds --strict', (t) => {
  const root = fixture(t, { 'reviews/subject.md': 'Evidence: `artifacts/live/report.txt`\n' });
  fs.mkdirSync(path.join(root, 'artifacts/live'), { recursive: true });
  fs.writeFileSync(path.join(root, 'artifacts/live/report.txt'), 'dies with the disk\n');

  const advisory = cli(root, 'reviews/subject.md');
  assert.equal(advisory.status, 0, 'the advisory default must never block a drain by its own opinion');
  assert.match(advisory.stdout, /ON-DISK-UNTRACKED\tartifacts\/live\/report\.txt/, 'the caller acts on this line');
  assert.match(advisory.stdout, /^scan space: /m, 'the declaration must survive alongside a real finding');

  const strict = cli(root, 'reviews/subject.md', '--strict');
  assert.equal(strict.status, 1, 'F-2215-1: 1 = answered, and the answer refuses');
});

test('arm 7 — F-2215-1 exit codes still mean three different things', (t) => {
  const root = fixture(t, {
    'artifacts/x/report.txt': 'proof\n',
    'reviews/subject.md': 'Evidence: `artifacts/x/report.txt`\n',
  });
  assert.equal(cli(root, 'reviews/subject.md', '--strict').status, 0, '0 = answered, nothing untracked');
  const crash = cli(root, '--nope', '--strict');
  assert.equal(crash.status, 2, '2 = could not answer — never the same code as a refusal');
  assert.match(crash.stdout, /⛔ CANNOT VERIFY/, 'the banner must reach STDOUT, which is what the caller reads');
});

test('arm 8 — a run that COULD NOT answer must not claim a scan space', (t) => {
  const root = fixture(t, { 'reviews/subject.md': 'x\n' });
  const crash = cli(root, '--nope', '--strict');
  assert.doesNotMatch(
    crash.stdout,
    /^scan space: /m,
    'declaring a corpus on a run that never read one asserts a scan it did not perform',
  );
});

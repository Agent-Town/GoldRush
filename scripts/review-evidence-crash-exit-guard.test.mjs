// F-2215-1 (s2215) — review-evidence-audit must not answer "I could not run"
// with the code and the silence that mean "I ran, and nothing is untracked".
//
// THE DEFECT, measured before it was cured: main()'s catch printed "REFUSING"
// to stderr and set NO exit code, so every crash exited 0 with EMPTY stdout.
// Four arms, subject truth "the audit did not run", all rc=0 against a clean
// control also rc=0: absent review path, --root one directory off, unknown
// option, and advisory mode. The word REFUSING promised a refusal that the
// exit code did not keep.
//
// WHY IT MATTERS ON THE ADVISORY PATH TOO, which is the one that is LIVE:
// .claude/skills/drain/SKILL.md section 4 tells every drain to run this on the
// review it is about to commit and to `git add -f` each ON-DISK-UNTRACKED path
// it prints. The review is being written in that same moment, so an ENOENT on
// the review path is the ordinary order of operations, not an exotic fault.
// Empty stdout there reads as "nothing to add", and the drain commits a review
// citing evidence that exists only on disk -- a Retention Law hole, and the
// exact inversion of this tool's purpose.
//
// The legacy suite (review-evidence-audit.test.mjs) is correct about the
// buckets and could never see this: all six of its tests take the success path.
//
// Every red arm below was proven by restoring the pre-cure catch verbatim on a
// scratch copy. Arms 5 and 6 are REVERSE CONTROLS: an over-general cure that
// answers 2 for every failure, or that prints the banner unconditionally,
// passes every crash arm above and is caught only here.

import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const SCRIPT = path.join(import.meta.dirname, 'review-evidence-audit.mjs');
const BANNER = /⛔ CANNOT VERIFY/;

// A real git repo, because trackedPaths() shells out to `git ls-files`.
function fixture(t, tracked = {}, ignored = '') {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'review-evidence-crash-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const [file, body] of Object.entries({ '.gitignore': ignored, ...tracked })) {
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

function review(root, citation, name = 'subject.md') {
  fs.mkdirSync(path.join(root, 'reviews'), { recursive: true });
  fs.writeFileSync(path.join(root, 'reviews', name), `Evidence: \`${citation}\`\n`);
  return `reviews/${name}`;
}

function cli(...args) {
  return spawnSync(process.execPath, [SCRIPT, ...args], { timeout: 240_000, killSignal: 'SIGKILL', encoding: 'utf8' });
}

test('strict + absent review path: rc=2, not a clearance', (t) => {
  const root = fixture(t, { 'artifacts/x/report.txt': 'proof\n' });
  const result = cli('--root', root, '--strict', 'reviews/never-written.md');
  assert.equal(result.status, 2, 'could-not-answer must not share a code with a clean audit');
  assert.match(result.stdout, BANNER, 'the caller reads stdout — silence there reads as "nothing to add"');
});

test('strict + root outside a git repo: rc=2', (t) => {
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'review-evidence-nogit-'));
  t.after(() => fs.rmSync(outside, { recursive: true, force: true }));
  const result = cli('--root', outside, '--strict', '--all');
  assert.equal(result.status, 2);
  assert.match(result.stdout, BANNER);
});

test('strict + unknown option: rc=2 — strict is parsed OUTSIDE the try', () => {
  // argumentsFor() itself throws here, so a cure that read args.strict from
  // inside the try would fall back to advisory and exit 0.
  const result = cli('--strict', '--no-such-flag');
  assert.equal(result.status, 2);
  assert.match(result.stdout, BANNER);
});

test('advisory + crash: rc stays 0, but stdout SPEAKS (F-2211-1)', (t) => {
  const root = fixture(t, { 'artifacts/x/report.txt': 'proof\n' });
  const result = cli('--root', root, 'reviews/never-written.md');
  assert.equal(result.status, 0, 'an advisory reader must never block a drain by its own absence');
  assert.match(result.stdout, BANNER, 'the crash must be visible on the channel the caller reads');
  assert.doesNotMatch(result.stdout, /PASS —/, 'a crash must never wear the clean verdict');
});

test('REVERSE CONTROL: a real ON-DISK-UNTRACKED finding is rc=1, NOT rc=2', (t) => {
  // An over-general cure -- exitCode = 2 on any failure -- passes every crash
  // arm above while collapsing "the answer refuses" into "there was no answer".
  const root = fixture(t, { 'artifacts/x/keep.txt': 'proof\n' }, 'artifacts/x/log.txt\n');
  fs.writeFileSync(path.join(root, 'artifacts/x/log.txt'), 'untracked\n');
  const result = cli('--root', root, '--strict', review(root, 'artifacts/x/log.txt'));
  assert.equal(result.status, 1, 'answered-and-refuses must stay distinct from could-not-answer');
  assert.match(result.stdout, /ON-DISK-UNTRACKED=1/);
  assert.doesNotMatch(result.stdout, BANNER, 'a run that ANSWERED must not claim it could not verify');
});

test('REVERSE CONTROL: a clean strict run is rc=0 and silent of the banner', (t) => {
  const root = fixture(t, { 'artifacts/x/report.txt': 'proof\n' });
  const result = cli('--root', root, '--strict', review(root, 'artifacts/x/report.txt'));
  assert.equal(result.status, 0);
  assert.match(result.stdout, /PASS —/);
  assert.doesNotMatch(result.stdout, BANNER, 'a cure that always prints the banner makes it worthless');
});

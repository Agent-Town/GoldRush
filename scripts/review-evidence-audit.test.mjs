import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const SCRIPT = path.join(import.meta.dirname, 'review-evidence-audit.mjs');

function fixture(t, tracked = {}, ignored = '') {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'review-evidence-audit-'));
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

function run(root, citation, ...args) {
  fs.mkdirSync(path.join(root, 'reviews'), { recursive: true });
  fs.writeFileSync(path.join(root, 'reviews', 'subject.md'), `Evidence: \`${citation}\`\n`);
  return spawnSync(process.execPath, [SCRIPT, '--root', root, ...args, 'reviews/subject.md'], { encoding: 'utf8' });
}

test('a review citing a tracked file is TRACKED', (t) => {
  const result = run(fixture(t, { 'artifacts/x/report.txt': 'proof\n' }), 'artifacts/x/report.txt');
  assert.equal(result.status, 0);
  assert.match(result.stdout, /TRACKED=1 ON-DISK-UNTRACKED=0 ABSENT=0 SKIPPED=0/);
});

test('274-vs-13 regression: a review citing a tracked directory is TRACKED', (t) => {
  const result = run(fixture(t, { 'artifacts/x/run-01.txt': 'proof\n' }), 'artifacts/x/');
  assert.equal(result.status, 0);
  assert.match(result.stdout, /TRACKED=1 ON-DISK-UNTRACKED=0 ABSENT=0 SKIPPED=0/);
});

test('an ignored on-disk log is ON-DISK-UNTRACKED and strict exits non-zero', (t) => {
  const root = fixture(t, {}, '*.log\n');
  fs.mkdirSync(path.join(root, 'artifacts', 'x'), { recursive: true });
  fs.writeFileSync(path.join(root, 'artifacts', 'x', 'run.log'), 'proof\n');
  const result = run(root, 'artifacts/x/run.log', '--strict');
  assert.equal(result.status, 1);
  assert.match(result.stdout, /^ON-DISK-UNTRACKED\s+artifacts\/x\/run\.log/m);
});

test('a brace range is SKIPPED rather than a violation', (t) => {
  const result = run(fixture(t), 'artifacts/x/run-{01..12}.log');
  assert.equal(result.status, 0);
  assert.match(result.stdout, /TRACKED=0 ON-DISK-UNTRACKED=0 ABSENT=0 SKIPPED=1/);
});

test('a line suffix resolves against the tracked file without it', (t) => {
  const result = run(fixture(t, { 'artifacts/x/report.md': 'proof\n' }), 'artifacts/x/report.md:14');
  assert.equal(result.status, 0);
  assert.match(result.stdout, /TRACKED=1 ON-DISK-UNTRACKED=0 ABSENT=0 SKIPPED=0/);
});

test('default mode exits zero with ON-DISK-UNTRACKED evidence', (t) => {
  const root = fixture(t, {}, '*.log\n');
  fs.mkdirSync(path.join(root, 'artifacts', 'x'), { recursive: true });
  fs.writeFileSync(path.join(root, 'artifacts', 'x', 'run.log'), 'proof\n');
  const result = run(root, 'artifacts/x/run.log');
  assert.equal(result.status, 0);
  assert.match(result.stdout, /ON-DISK-UNTRACKED=1/);
});

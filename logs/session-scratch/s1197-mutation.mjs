// s1197 drain: (A) prove tree-root output is UNCHANGED vs the pre-fix script,
// (B) mutate the SUBJECT (never the test) and prove the new test notices.
import { spawnSync, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const REPO = '/Users/robin/Claude/Projects/Gold Rush';
const SUBJECT = path.join(REPO, 'scripts/suite-red-inventory.mjs');
const FIXTURE = path.join(REPO, 'logs/session-scratch/s1197-f1167-4-fixture.json');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 's1197-'));

// ---------- (A) output-unchanged vs the PRE-FIX subject (main's blob before the merge) ----------
const oldSource = execFileSync('git', ['show', 'bfaabd1c:scripts/suite-red-inventory.mjs'], { cwd: REPO, encoding: 'utf8' });
const oldPath = path.join(dir, 'old-subject.mjs');
fs.writeFileSync(oldPath, oldSource);
// NOTE: the old script must live at scripts/ depth for a fair comparison of the NEW one's ROOT logic;
// the OLD one ignores its own location entirely, so running it from the repo root is its native case.
const oldOut = path.join(dir, 'old.md');
const newOut = path.join(dir, 'new.md');
const oldRun = spawnSync(process.execPath, [oldPath, FIXTURE, oldOut], { cwd: REPO, encoding: 'utf8', timeout: 60_000 });
const newRun = spawnSync(process.execPath, [SUBJECT, FIXTURE, newOut], { cwd: REPO, encoding: 'utf8', timeout: 60_000 });
const unchanged = oldRun.status === 0 && newRun.status === 0
  && fs.readFileSync(oldOut).equals(fs.readFileSync(newOut));
console.log(`(A) tree-root output unchanged vs pre-fix: ${unchanged}  (old exit=${oldRun.status}, new exit=${newRun.status}, ${fs.statSync(newOut).size} B)`);

// ---------- (B) mutation of the SUBJECT ----------
const original = fs.readFileSync(SUBJECT, 'utf8');
const blobBefore = execFileSync('git', ['hash-object', SUBJECT], { cwd: REPO, encoding: 'utf8' }).trim();
const mutated = original.replace(
  "const source = fs.readFileSync(path.join(ROOT, execution.file), 'utf8');",
  "const source = fs.readFileSync(execution.file, 'utf8');",
);
if (mutated === original) throw new Error('MUTATION DID NOT APPLY — the :109 line did not match');
try {
  fs.writeFileSync(SUBJECT, mutated);
  const r = spawnSync(process.execPath, ['--test', 'scripts/suite-red-inventory.test.mjs'], { cwd: REPO, encoding: 'utf8', timeout: 120_000 });
  const failLine = (r.stdout ?? '').split('\n').find((l) => /fail \d/.test(l)) ?? '';
  const why = (r.stdout ?? '').split('\n').find((l) => /ENOENT|not equal|AssertionError/.test(l)) ?? '';
  console.log(`(B) mutated :109 (root-relative read -> cwd-relative): test EXIT=${r.status}  ${failLine.trim()}`);
  console.log(`    first failure detail: ${why.trim().slice(0, 160)}`);
} finally {
  fs.writeFileSync(SUBJECT, original);
}
const blobAfter = execFileSync('git', ['hash-object', SUBJECT], { cwd: REPO, encoding: 'utf8' }).trim();
console.log(`(B) subject restored byte-identical: ${blobBefore === blobAfter}  (${blobBefore.slice(0, 8)})`);
fs.rmSync(dir, { recursive: true, force: true });

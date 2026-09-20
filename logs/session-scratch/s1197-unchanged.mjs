// s1197 drain, retry of (A): the previous attempt ran the OLD script from a temp dir,
// where `import ts from 'typescript'` cannot resolve node_modules -> exit 1 was MY harness, not the subject.
// Fix: place the old source inside scripts/ so module resolution is native, and hold the OUTPUT PATH constant
// (the report embeds nothing path-derived, but keeping it constant removes the variable entirely).
import { spawnSync, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const REPO = '/Users/robin/Claude/Projects/Gold Rush';
const SUBJECT = path.join(REPO, 'scripts/suite-red-inventory.mjs');
const OLD = path.join(REPO, 'scripts/tmp-s1197-old-subject.mjs');
const FIXTURE = path.join(REPO, 'logs/session-scratch/s1197-f1167-4-fixture.json');
const OUT = '/tmp/s1197-unchanged-out.md';

fs.writeFileSync(OLD, execFileSync('git', ['show', 'd8f02e51:scripts/suite-red-inventory.mjs'], { cwd: REPO, encoding: 'utf8' }));
try {
  const oldRun = spawnSync(process.execPath, [OLD, FIXTURE, OUT], { cwd: REPO, encoding: 'utf8', timeout: 60_000 });
  const oldBytes = fs.readFileSync(OUT);
  const newRun = spawnSync(process.execPath, [SUBJECT, FIXTURE, OUT], { cwd: REPO, encoding: 'utf8', timeout: 60_000 });
  const newBytes = fs.readFileSync(OUT);
  console.log(`old: exit=${oldRun.status} ${oldBytes.length} B${oldRun.status ? `\n  stderr: ${oldRun.stderr.trim().split('\n')[0]}` : ''}`);
  console.log(`new: exit=${newRun.status} ${newBytes.length} B`);
  console.log(`TREE-ROOT OUTPUT UNCHANGED: ${oldBytes.equals(newBytes)}`);
} finally {
  fs.rmSync(OLD, { force: true });
}
console.log(`temp subject removed: ${!fs.existsSync(OLD)}`);

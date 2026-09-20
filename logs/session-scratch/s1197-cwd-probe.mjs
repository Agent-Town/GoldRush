// s1197 scratch probe for F-1167-4: does scripts/suite-red-inventory.mjs depend on cwd?
// Runs the REAL reducer as a child process with a chosen cwd, same fixture, absolute in/out paths.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

const REPO = '/Users/robin/Claude/Projects/Gold Rush';
const SCRIPT = `${REPO}/scripts/suite-red-inventory.mjs`;
const FIXTURE = `${REPO}/logs/session-scratch/s1197-f1167-4-fixture.json`;

function arm(label, cwd) {
  const out = `/tmp/s1197-${label}.md`;
  const r = spawnSync(process.execPath, [SCRIPT, FIXTURE, out], { cwd, encoding: 'utf8' });
  const body = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : null;
  console.log(`--- ARM ${label} (cwd=${cwd}) ---`);
  console.log(`exit=${r.status}`);
  if (r.stderr?.trim()) console.log(`stderr(first 3 lines):\n${r.stderr.trim().split('\n').slice(0, 3).join('\n')}`);
  console.log(`output file: ${body === null ? 'NOT WRITTEN' : `${body.length} bytes`}`);
  if (body) {
    const row = body.split('\n').find((l) => l.includes('fixture both-bucket failure'));
    console.log(`row: ${row ? row.slice(0, 160) : '(no failure row found)'}`);
  }
  return { status: r.status, body };
}

const a = arm('repo-root', REPO);
const b = arm('tmp', '/tmp');
const c = arm('lane-d', `${REPO}/worktrees/lane-d`);

console.log('\n=== VERDICT ===');
console.log(`repo-root vs lane-d identical: ${a.body !== null && a.body === c.body}`);
console.log(`repo-root vs tmp identical:    ${a.body !== null && a.body === b.body}`);

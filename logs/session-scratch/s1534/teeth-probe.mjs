#!/usr/bin/env node
/**
 * s1534 — PROVE THE TEETH ON THE REAL DESK, not on a synthetic fixture.
 * A passing guard never executes its violation path, so the green above is not
 * evidence about the red (the s1299/s1300 standard). This builds a fixture root
 * from the LIVE s1533 desk + the LIVE BACKLOG with exactly one alpha-coded
 * declaring row deleted, and asserts the widened guard exits 1 and names it.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync, spawnSync } from 'node:child_process';

const FIX = 'logs/session-scratch/s1534/fixture';
fs.rmSync(FIX, { recursive: true, force: true });
fs.mkdirSync(path.join(FIX, 'tasks'), { recursive: true });

// The live desk (s1533's handoff line-1), as a CLEARED handoff line.
const line1 = execSync('git show HEAD~1:STATUS.md', { maxBuffer: 64e6 }).toString().split('\n')[0];
fs.writeFileSync(path.join(FIX, 'STATUS.md'), line1 + '\n');

const backlog = fs.readFileSync('tasks/BACKLOG.md', 'utf8').split('\n');

function run(label, lines, expectExit, expectName) {
  fs.writeFileSync(path.join(FIX, 'tasks', 'BACKLOG.md'), lines.join('\n'));
  const r = spawnSync('node', ['scripts/desk-declaration-guard.mjs', '--root', FIX], {
    encoding: 'utf8',
  });
  const out = (r.stdout || '') + (r.stderr || '');
  const named = expectName ? out.includes(expectName) : true;
  const ok = r.status === expectExit && named;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
  console.log(`      exit ${r.status} (expected ${expectExit})${expectName ? `, names ${expectName}: ${named}` : ''}`);
  const head = out.split('\n').filter((l) => /undeclared|FAIL|PASS —|desk F-IDs|^  F-/.test(l));
  head.forEach((l) => console.log('      ' + l.trim()));
  return ok;
}

let allOk = true;
// CONTROL: the board as it stands must be green.
allOk = run('CONTROL — live board, all five rows present', backlog, 0) && allOk;

// MANUFACTURED: delete the F-MSD-1 declaring row only.
const cut = backlog.filter((l) => !l.startsWith('🔺 **F-MSD-1 —'));
console.log(`      (removed ${backlog.length - cut.length} line: the F-MSD-1 row)`);
allOk = run('MANUFACTURED — F-MSD-1 row deleted', cut, 1, 'F-MSD-1') && allOk;

// MANUFACTURED: delete the F-ER02-5 row (the id that rides inside another item).
const cut2 = backlog.filter((l) => !l.startsWith('🔺 **F-ER02-5 —'));
allOk = run('MANUFACTURED — F-ER02-5 row deleted (a RIDING id)', cut2, 1, 'F-ER02-5') && allOk;

console.log(allOk ? '\nALL PROBES AS EXPECTED' : '\nSOME PROBE MISBEHAVED');
process.exit(allOk ? 0 : 1);

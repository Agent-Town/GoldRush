// s1250 — prove the shadowing defect by CONSTRUCTION against the current subject, before any fix.
// Shape taken verbatim from the live board: every one of the 4 measured collisions is a predecessor
// whose successor appends a suffix (lane-blocked-storage-boot ⊂ lane-blocked-storage-boot-2).
// The guard's own CLOSED epilogue instructs "retire THIS leaf (superseded) ... when a successor
// landed" — so this fixture is what following that instruction produces.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const SCRIPT = path.resolve('scripts/drain-block-check.mjs');

function fixture(tasks) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gr-shadow-'));
  fs.mkdirSync(path.join(dir, 'tasks'));
  fs.writeFileSync(path.join(dir, 'tasks', 'goals.json'), JSON.stringify({
    version: 1,
    goals: [{ id: 'factory-infra', title: 'Factory Infra', subgoals: [{ id: 'guards', title: 'Guards', tasks }] }],
  }));
  return dir;
}
const run = (dir, ...args) => spawnSync(process.execPath, [SCRIPT, ...args], { cwd: dir, encoding: 'utf8', timeout: 30_000 });

const PRED = { id: 'blocked-storage-boot', title: 'Storage boot, first pass', taskFile: 'lane-blocked-storage-boot.md', status: 'superseded', supersededBy: 'carried down by the -2 successor, which merged' };
const SUCC = { id: 'blocked-storage-boot-2', title: 'Storage boot, second pass', taskFile: 'lane-blocked-storage-boot-2.md', status: 'merged', mergeHash: 'b'.repeat(40) };

const out = [];
function probe(label, tasks, arg) {
  const dir = fixture(tasks);
  const r = run(dir, arg);
  const head = (r.stdout.match(/(⛔ BLOCKED|⛔ CLOSED|✅ CLEAR|\? UNKNOWN)[^\n]*/) || ['(none)'])[0];
  out.push(`${label}\n    input : ${arg}\n    rc=${r.status}  ${head.trim()}`);
  fs.rmSync(dir, { recursive: true, force: true });
  return r;
}

out.push('== A. THE DEFECT: superseded predecessor, shadowed by its longer-named merged successor ==');
const a = probe('A1 ask the SUPERSEDED predecessor by its own taskFile', [PRED, SUCC], PRED.taskFile);
out.push(`    EXPECTED (correct): rc=1 ⛔ CLOSED   ACTUAL: rc=${a.status}`);

out.push('\n== B. CONTROL: the same predecessor ALONE (no successor to shadow it) ==');
const b = probe('B1 one-leaf fixture — proves the status word is refused when nothing shadows it', [PRED], PRED.taskFile);

out.push('\n== C. CONTROL: ask the SUCCESSOR — must stay CLEAR, a lawful drain must not be reddened ==');
const c = probe('C1', [PRED, SUCC], SUCC.taskFile);

out.push('\n== D. CONTROL: blocked predecessor is NOT shadowed (line 220 scans ALL hits) ==');
const d = probe('D1 predecessor blocked instead of superseded', [{ ...PRED, status: 'blocked', blockedReason: 'OWNER FORK.' }, SUCC], PRED.taskFile);

out.push('\n== E. THE REVERSE FALSE POSITIVE: merged successor shadowed by a LONGER-named closed predecessor ==');
const LONGPRED = { id: 'storage-boot-first-pass-with-fixtures', title: 'long predecessor', taskFile: 'lane-storage-boot-2-first-pass-with-fixtures.md', status: 'superseded' };
const SHORTSUCC = { id: 'storage-boot-2', title: 'short successor', taskFile: 'lane-storage-boot-2.md', status: 'merged', mergeHash: 'c'.repeat(40) };
const e = probe('E1 ask the MERGED successor; a longer closed leaf contains its key', [LONGPRED, SHORTSUCC], SHORTSUCC.taskFile);
out.push(`    EXPECTED (correct): rc=0 ✅ CLEAR   ACTUAL: rc=${e.status}`);

const text = out.join('\n');
console.log(text);
fs.writeFileSync('logs/session-scratch/s1250/probe-shadow-result.txt', text + '\n');

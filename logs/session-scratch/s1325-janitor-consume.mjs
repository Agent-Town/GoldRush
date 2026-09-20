// s1325 / F-1324-2 measurement harness.
// Extracts the janitor `for req in ...` block from a given version of lane-runner-v3.sh,
// runs it against a synthetic ROOT, and reports whether the .req survived.
// Measures OLD (HEAD) vs NEW (working tree) across four states.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const REPO = '/Users/robin/Claude/Projects/Gold Rush';
const sh = (cmd, args, opts = {}) =>
  execFileSync(cmd, args, { encoding: 'utf8', cwd: REPO, ...opts });

function extractJanitor(src) {
  const lines = src.split('\n');
  const start = lines.findIndex((l) => l.includes('for req in "$ROOT/tasks/janitor"'));
  if (start < 0) throw new Error('janitor loop not found');
  // the loop body is indented 4; its closing `done` is at indent 2
  for (let i = start + 1; i < lines.length; i++) {
    if (/^ {2}done\s*$/.test(lines[i])) return lines.slice(start, i + 1).join('\n');
  }
  throw new Error('loop end not found');
}

function runCase({ block, worktree, busy, op = 'refresh-lane', arg = 'lane-x' }) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 's1325-'));
  for (const d of ['tasks/janitor', 'tasks/done', 'tasks/running']) {
    fs.mkdirSync(path.join(root, d), { recursive: true });
  }
  if (worktree === 'plain') {
    // a directory that exists but is NOT a git repo — the real shape of worktrees/art
    fs.mkdirSync(path.join(root, 'worktrees', arg), { recursive: true });
  } else if (worktree) {
    const wt = path.join(root, 'worktrees', arg);
    fs.mkdirSync(wt, { recursive: true });
    // a real git repo with a `main` branch, so `git reset --hard main` can genuinely succeed
    sh('git', ['init', '-q', '-b', 'main', wt], { cwd: root });
    fs.writeFileSync(path.join(wt, 'f.txt'), 'base\n');
    sh('git', ['-C', wt, 'add', 'f.txt'], { cwd: root });
    sh('git', ['-C', wt, '-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-qm', 'base'], { cwd: root });
    fs.writeFileSync(path.join(wt, 'f.txt'), 'DIRTY\n'); // reset --hard must revert this
  }
  if (busy) fs.writeFileSync(path.join(root, 'tasks/running', `${arg}.pid`), '999\n');
  const reqPath = path.join(root, 'tasks/janitor', 'probe.req');
  fs.writeFileSync(reqPath, `${op}\n${arg}\n`);

  const script = `set -u\nROOT="${root}"\n${block}\n`;
  const spath = path.join(root, 'probe.sh');
  fs.writeFileSync(spath, script);
  let out = '', rc = 0;
  try { out = sh('bash', [spath], { cwd: root }); } catch (e) { rc = e.status; out = (e.stdout || '') + (e.stderr || ''); }

  const survived = fs.existsSync(reqPath);
  const consumed = fs.readdirSync(path.join(root, 'tasks/done')).length;
  const reverted = worktree === true
    ? fs.readFileSync(path.join(root, 'worktrees', arg, 'f.txt'), 'utf8').trim() === 'base'
    : null;
  fs.rmSync(root, { recursive: true, force: true });
  return { survived, consumed, reverted, rc, out: out.trim() };
}

const versions = {
  OLD: extractJanitor(sh('git', ['show', 'HEAD:scripts/lane-runner-v3.sh'])),
  NEW: extractJanitor(fs.readFileSync(path.join(REPO, 'scripts/lane-runner-v3.sh'), 'utf8')),
};

// syntax check both whole files
for (const [name, ref] of [['HEAD', null], ['WORKTREE', 1]]) {
  const f = path.join(os.tmpdir(), `s1325-syn-${name}.sh`);
  fs.writeFileSync(f, ref ? fs.readFileSync(path.join(REPO, 'scripts/lane-runner-v3.sh'), 'utf8')
                          : sh('git', ['show', 'HEAD:scripts/lane-runner-v3.sh']));
  try { sh('bash', ['-n', f]); console.log(`bash -n ${name}: OK`); }
  catch (e) { console.log(`bash -n ${name}: FAIL ${e.stderr}`); }
}

const cases = [
  { name: 'BUSY lane (the F-1324-2 case)', worktree: true, busy: true, expectSurvive: true },
  { name: 'IDLE lane, refresh succeeds', worktree: true, busy: false, expectSurvive: false },
  { name: 'MISSING worktree', worktree: false, busy: false, expectSurvive: false },
  { name: 'UNKNOWN op', worktree: true, busy: false, op: 'bogus-op', expectSurvive: false },
  { name: 'refresh FAILED (non-git dir)', worktree: 'plain', busy: false, expectSurvive: true },
];

console.log('\nstate                          | OLD survived | NEW survived | NEW expected');
console.log('-------------------------------|--------------|--------------|-------------');
let fails = 0;
for (const c of cases) {
  const o = runCase({ block: versions.OLD, ...c });
  const n = runCase({ block: versions.NEW, ...c });
  const ok = n.survived === c.expectSurvive;
  if (!ok) fails++;
  console.log(
    `${c.name.padEnd(30)} | ${String(o.survived).padEnd(12)} | ${String(n.survived).padEnd(12)} | ${c.expectSurvive} ${ok ? '' : '  <-- MISMATCH'}`
  );
  if (c.worktree && !c.busy && c.op !== 'bogus-op') {
    console.log(`    (NEW actually reverted the dirty worktree: ${n.reverted})`);
  }
  console.log(`    NEW log: ${n.out.split('\n').pop()}`);
}
console.log(fails === 0 ? '\nALL CASES AS SPECIFIED' : `\n${fails} MISMATCH(ES)`);

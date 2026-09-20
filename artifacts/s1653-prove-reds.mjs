// s1653 — prove the runner-restart-recipe guard's RED paths by manufacturing each defect
// on scratch copies. A passing guard never executes its violation path, so its green is no
// evidence about its red (the s1299/s1300/s1651 standard).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 's1653-reds-'));
const helperSrc = fs.readFileSync(ROOT + '/scripts/start-lane-runner.sh', 'utf8');
const healthSrc = fs.readFileSync(ROOT + '/scripts/health-watch.sh', 'utf8');

function run(helper, health) {
  const h = path.join(tmp, 'helper.sh'), w = path.join(tmp, 'health.sh');
  fs.writeFileSync(h, helper); fs.writeFileSync(w, health);
  const r = spawnSync('bash', [ROOT + '/scripts/runner-restart-recipe.test.sh', h, w], { encoding: 'utf8' });
  return { rc: r.status, out: r.stdout || '' };
}

const cases = [
  ['CONTROL (unmodified)', helperSrc, healthSrc, 0],
  ['1. health-watch reverted to a bare nohup', helperSrc,
    healthSrc.replace(/bash scripts\/start-lane-runner\.sh >> logs\/runner-headless\.log 2>&1/,
                      'nohup bash scripts/lane-runner-v3.sh >> logs/runner-headless.log 2>&1 &'), 1],
  ['2. CLAUDECODE left set (playwright pins lanes)', helperSrc.replace('unset CLAUDE_CONFIG_DIR CLAUDECODE', 'unset CLAUDE_CONFIG_DIR'), healthSrc, 1],
  ['3. PATH prepend removed (lane keeps caller node)', helperSrc.replace('export PATH="$CODEX_DIR:$PATH"', 'true'), healthSrc, 1],
  ['4. live-runner refusal removed', helperSrc.replace('REFUSING — a lane runner is already alive', 'starting anyway'), healthSrc, 1],
  ['4b. helper clears the lock by hand', helperSrc.replace('mkdir -p "$ROOT/logs"', 'rmdir "$ROOT/tasks/.runner.lock"\nmkdir -p "$ROOT/logs"'), healthSrc, 1],
  ['5. CODEX_FLOOR drift', helperSrc.replace('CODEX_FLOOR="0.144.1"', 'CODEX_FLOOR="0.100.0"'), healthSrc, 1],
];

let bad = 0;
for (const [name, helper, health, wantRc] of cases) {
  const { rc, out } = run(helper, health);
  const pass = rc === wantRc;
  if (!pass) bad++;
  console.log(`${pass ? 'PROVEN ' : 'BROKEN '} ${name}  → rc=${rc} (wanted ${wantRc})`);
  if (wantRc === 1) {
    const f = out.split('\n').filter(l => l.includes('FAIL')).map(l => l.trim());
    console.log('          ' + (f.length ? f.join('\n          ') : '(no FAIL line — guard is blind here)'));
    if (!f.length) bad++;
  }
}
fs.rmSync(tmp, { recursive: true, force: true });
console.log(bad === 0 ? '\nALL RED PATHS PROVEN' : `\n${bad} PROBLEM(S)`);
process.exit(bad === 0 ? 0 : 1);

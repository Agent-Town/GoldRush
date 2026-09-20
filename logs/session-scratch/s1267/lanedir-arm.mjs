// s1267 — THE UNRUN CONTROL: the FIRE shell, in the LANE's directory.
// Five fires have argued "the fire shell and the lane shell are not the same instrument", but
// every fire-side reading was taken in the repo ROOT and every lane-side reading in
// worktrees/lane-b. SHELL and DIRECTORY have moved together the whole time and were never
// separated. Same command, same spec, same commit content — only cwd changes from the arm above.
//   RED here  => directory refuted, the shell is the variable (F-1264-3's framing survives).
//   GREEN here => it was never the shell; the directory is the instrument.
import { spawnSync } from 'node:child_process';
import { openSync, closeSync, writeFileSync, mkdirSync } from 'node:fs';
import os from 'node:os';

const OUT = 'logs/session-scratch/s1267';
const CWD = 'worktrees/lane-b';
mkdirSync(OUT, { recursive: true });

const RUNS = Number(process.argv[2] || 4);
const meta = [];
for (let i = 1; i <= RUNS; i++) {
  const load = os.loadavg().map((n) => n.toFixed(2)).join(' ');
  const logPath = `${OUT}/lanedir-concurrent-${i}.log`;
  const fd = openSync(logPath, 'w');
  const t0 = process.hrtime.bigint();
  const r = spawnSync(
    'npx',
    [
      'playwright', 'test', 'e2e/gazette-welcome.spec.ts',
      '--project=desktop-chrome', '--project=mobile-chrome',
      '--repeat-each=3', '-g', 'fires once', '--reporter=list',
    ],
    { stdio: ['ignore', fd, fd], cwd: CWD },
  );
  const wall = Number(process.hrtime.bigint() - t0) / 1e9;
  closeSync(fd);
  meta.push({ run: i, arm: 'fire-shell-in-lane-dir', cwd: CWD, loadavgBefore: load, wallSeconds: +wall.toFixed(2), exitCode: r.status, log: logPath });
  writeFileSync(`${OUT}/lanedir-concurrent-meta.json`, JSON.stringify(meta, null, 2));
  console.log(`run ${i}/${RUNS} lanedir: rc=${r.status} wall=${wall.toFixed(2)}s loadavg-before=${load}`);
}

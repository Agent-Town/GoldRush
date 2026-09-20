// s1267 — the FIRE-SHELL arm of the newsie-drift shell divergence, measured as a RATE.
// Mirrors s1264 arm A3 and the lane master's scope-2 command byte-for-byte, in the fire shell,
// in the repo root, on a tree whose subject files are identical to both prior bases.
// Output goes to FILES, never to captured stdout (spawnSync truncates under load).
import { spawnSync } from 'node:child_process';
import { openSync, closeSync, writeFileSync, mkdirSync } from 'node:fs';
import os from 'node:os';

const OUT = 'logs/session-scratch/s1267';
mkdirSync(OUT, { recursive: true });

const RUNS = Number(process.argv[2] || 4);
const EXTRA = process.argv.slice(3); // e.g. --workers=1
const label = EXTRA.length ? 'serial' : 'concurrent';

const meta = [];
for (let i = 1; i <= RUNS; i++) {
  const load = os.loadavg().map((n) => n.toFixed(2)).join(' ');
  const logPath = `${OUT}/fire-${label}-${i}.log`;
  const fd = openSync(logPath, 'w');
  const t0 = process.hrtime.bigint();
  const r = spawnSync(
    'npx',
    [
      'playwright', 'test', 'e2e/gazette-welcome.spec.ts',
      '--project=desktop-chrome', '--project=mobile-chrome',
      '--repeat-each=3', '-g', 'fires once', '--reporter=list',
      ...EXTRA,
    ],
    { stdio: ['ignore', fd, fd] },
  );
  const wall = Number(process.hrtime.bigint() - t0) / 1e9;
  closeSync(fd);
  meta.push({ run: i, arm: label, loadavgBefore: load, wallSeconds: +wall.toFixed(2), exitCode: r.status, log: logPath });
  writeFileSync(`${OUT}/fire-${label}-meta.json`, JSON.stringify(meta, null, 2));
  console.log(`run ${i}/${RUNS} ${label}: rc=${r.status} wall=${wall.toFixed(2)}s loadavg-before=${load}`);
}

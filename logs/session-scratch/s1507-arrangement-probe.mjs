// s1507 / F-1506-1 — reproduce the LANE's arrangement in the FIRE shell.
//
// Refuted so far: node VERSION (the lane's outer run reported `tests 2`, a v24+ signature, and
// /bin/zsh -lc resolves to the same /opt/homebrew/bin/node v26.4.0 the fire uses) and CWD.
// Remaining candidate the lane log actually supports: the tree the guard runs FROM.
//
// This runs the guard standalone in each worktree, exactly as the lane runner did
// (`/bin/zsh -lc 'node --test scripts/node-guards-timeout.test.mjs'`), and reports each tree's
// guard blob so a difference in the FILE can never be mistaken for a difference in the SHELL.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const GUARD = 'scripts/node-guards-timeout.test.mjs';

const trees = [
  ['main   ', ROOT],
  ['lane-a ', join(ROOT, 'worktrees/lane-a')],
  ['lane-b ', join(ROOT, 'worktrees/lane-b')],
  ['lane-c ', join(ROOT, 'worktrees/lane-c')],
  ['lane-d ', join(ROOT, 'worktrees/lane-d')],
];

const env = { ...process.env };
delete env.NODE_TEST_CONTEXT;

console.log(`fire node ${process.version}   guard: ${GUARD}\n`);
console.log('tree    | guard sha256 | rc | tests pass fail | inner granularity');
console.log('--------+--------------+----+-----------------+------------------');

for (const [label, dir] of trees) {
  const path = join(dir, GUARD);
  if (!existsSync(path)) { console.log(`${label} | ABSENT`); continue; }
  const sha = createHash('sha256').update(readFileSync(path)).digest('hex').slice(0, 12);

  const child = spawnSync('/bin/zsh', ['-lc', `node --test ${GUARD}`], {
    cwd: dir, encoding: 'utf8', env,
  });
  const out = `${child.stdout}${child.stderr}`;
  const num = (l) => {
    const m = new RegExp(`^\\u2139 ${l} (\\d+)$`, 'm').exec(out);
    return m ? m[1] : '-';
  };
  // The inner child's granularity is the whole question: `tests 1` = the fixture FILE was
  // cancelled as one unit (neither sibling ran); `tests 2` = per-test bounds applied.
  const innerOne = /^\s*ℹ tests 1$/m.test(out);
  const innerTwo = /✔ explicitly bounded sibling/.test(out);
  const gran = innerTwo ? 'per-test (tests 2)' : innerOne ? 'FILE-LEVEL (tests 1)' : 'unknown';

  console.log(
    `${label} | ${sha} | ${String(child.status).padEnd(2)} | ` +
    `${num('tests').padEnd(5)} ${num('pass').padEnd(4)} ${num('fail').padEnd(4)} | ${gran}`,
  );
}

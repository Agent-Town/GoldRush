// s1481 mutation probe for scripts/gate-battery.mjs (F-1481-1).
// A passing guard never executes its violation path, so its green says nothing about the red.
// This reverts each half of the cure in place, runs the guard, and restores byte-identically.
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const P = 'scripts/gate-battery.mjs';
const orig = readFileSync(P, 'utf8');
const h0 = createHash('sha256').update(orig).digest('hex');

const probes = [
  ['--cwd ignored (pre-cure)', (s) => s.replace('      cwd: workdir,\n', '      cwd: REPO_ROOT,\n')],
  ['--env ignored (pre-cure)', (s) => s.replace('      env: childEnv,\n', '')],
  [
    'VALUE_FLAGS too narrow',
    (s) => s.replace(
      "new Set(['--transcript', '--label', '--cwd', '--env'])",
      "new Set(['--transcript', '--label'])",
    ),
  ],
  [
    'silent fallback instead of fail-closed',
    (s) => s.replace('  if (!existsSync(abs)) return null;\n', ''),
  ],
];

let allBit = true;
for (const [name, mutate] of probes) {
  const mutated = mutate(orig);
  if (mutated === orig) {
    console.log(`PROBE-MISS (pattern never applied — probe proves nothing): ${name}`);
    allBit = false;
    continue;
  }
  writeFileSync(P, mutated);
  const r = spawnSync('node', ['--test', 'scripts/gate-battery.test.mjs'], { encoding: 'utf8' });
  const out = `${r.stdout}${r.stderr}`;
  const fail = (out.match(/^# fail (\d+)/m) || [])[1] ?? '?';
  const named = [...out.matchAll(/^not ok \d+ - (.+)$/gm)].map((m) => m[1]);
  const bit = r.status !== 0;
  if (!bit) allBit = false;
  console.log(`PROBE [${name}] rc=${r.status} fail=${fail} ${bit ? 'GUARD BIT' : 'GUARD BLIND'}`);
  for (const n of named) console.log(`    red: ${n}`);
  writeFileSync(P, orig);
}

const h1 = createHash('sha256').update(readFileSync(P, 'utf8')).digest('hex');
console.log(`restored byte-identical: ${h0 === h1} (${h0.slice(0, 16)})`);
console.log(allBit ? 'ALL PROBES BIT' : 'AT LEAST ONE PROBE DID NOT BITE');

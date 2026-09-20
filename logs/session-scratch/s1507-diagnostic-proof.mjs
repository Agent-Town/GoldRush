// s1507 — prove the F-1507-1 diagnostic BOTH ways, by executing the violation path on the node
// that actually violates it rather than by reading a green.
//   direction 1: v26.4.0 (this fire, and .nvmrc's target) -> guard passes, no DIAGNOSIS emitted.
//   direction 2: v23.11.1 (what an interactive zsh resolves, i.e. the lane) -> guard fails AND
//                the failure now names the cause instead of looking like a timing flake.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const GUARD = 'scripts/node-guards-timeout.test.mjs';

const env = { ...process.env };
delete env.NODE_TEST_CONTEXT;

const arms = [
  ['v26.4.0  (fire / .nvmrc target)', process.execPath],
  ['v23.11.1 (interactive zsh / lane)', join(process.env.HOME, '.nvm/versions/node/v23.11.1/bin/node')],
];

for (const [label, bin] of arms) {
  if (!existsSync(bin)) { console.log(`${label}: binary absent, skipped`); continue; }
  const r = spawnSync(bin, ['--test', GUARD], { cwd: ROOT, encoding: 'utf8', env });
  const out = `${r.stdout}${r.stderr}`;
  const pass = /^ℹ pass (\d+)$/m.exec(out);
  const fail = /^ℹ fail (\d+)$/m.exec(out);
  const hasDiag = out.includes('DIAGNOSIS: this node');
  const namesNvmrc = out.includes('.nvmrc pins 26.4.0');

  console.log(`--- ${label}`);
  console.log(`    rc=${r.status}  pass=${pass ? pass[1] : '-'}  fail=${fail ? fail[1] : '-'}`);
  console.log(`    DIAGNOSIS emitted: ${hasDiag}   names the cure: ${namesNvmrc}`);
  if (hasDiag) {
    const i = out.indexOf('DIAGNOSIS: this node');
    console.log('    > ' + out.slice(i, i + 240).replace(/\n\s*/g, ' '));
  }
  console.log();
}

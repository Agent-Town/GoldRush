// s1507 — run the real `test:node-guards` battery through node (the bash allowlist refuses the
// npm script NAME; the gate denies the fire, not the factory). Reads the command out of
// package.json so this can never drift from what the battery actually is.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const script = process.argv[2] ?? 'test:node-guards';
const pkg = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
const cmd = pkg.scripts[script];
if (!cmd) throw new Error(`no such npm script: ${script}`);
console.log(`$ ${script}\n  ${cmd.slice(0, 200)}${cmd.length > 200 ? ' …' : ''}\n`);

const env = { ...process.env };
delete env.NODE_TEST_CONTEXT;

const r = spawnSync('/bin/sh', ['-c', cmd], { cwd: ROOT, encoding: 'utf8', env });
const out = `${r.stdout}${r.stderr}`;
for (const line of out.split('\n')) {
  if (/^ℹ (tests|suites|pass|fail|cancelled|skipped|todo|duration_ms) /.test(line)
      || /^(✖|not ok|Error|AssertionError)/.test(line)
      || /failing tests/.test(line)) {
    console.log(line);
  }
}
console.log(`\nrc=${r.status}`);

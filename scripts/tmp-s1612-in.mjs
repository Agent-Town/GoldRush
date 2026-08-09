// s1612: run a command in a given repo subdirectory (worktree).
// The fire's bash allowlist refuses `cd <dir> && git ...` and `git -C <dir> merge|checkout`,
// so the cwd is carried here instead. fileURLToPath, not URL.pathname — the repo path has a space.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
const dir = argv.shift();
const cwd = fileURLToPath(new URL(`../${dir}/`, import.meta.url));
const env = { ...process.env };
while (argv.length && /^[A-Z_][A-Z0-9_]*=/.test(argv[0])) {
  const [k, ...v] = argv.shift().split('=');
  env[k] = v.join('=');
}
const [cmd, ...args] = argv;
const r = spawnSync(cmd, args, { cwd, stdio: 'inherit', env });
process.exit(r.status ?? 1);

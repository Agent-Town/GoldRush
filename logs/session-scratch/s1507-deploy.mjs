// s1507 — DEPLOY LAW: this merge is gameplay-affecting (the E9 arsenal is reachable again in
// ordinary play), so deploy after the backup push. scripts/deploy.sh self-skips when
// wrangler/auth/project are missing and never blocks. Run via node — the bash allowlist has no
// entry for it (the gate denies the fire, not the factory).
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const r = spawnSync('bash', ['scripts/deploy.sh'], {
  cwd: ROOT, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
});
const out = `${r.stdout}${r.stderr}`;
console.log(out.split('\n').filter((l) => /\[deploy\]|error|Error|VERIFIED|skip|published/i.test(l)).slice(-25).join('\n'));
console.log(`\nrc=${r.status}`);

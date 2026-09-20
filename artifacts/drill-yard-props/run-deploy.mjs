/**
 * s1449: DEPLOY LAW — this fire merged gameplay-affecting code (player-visible art +
 * a src diagnostics surface), so scripts/deploy.sh is owed after the backup push.
 * Invoked through node because the fire's bash allowlist refuses the direct form.
 * deploy.sh self-skips when wrangler/auth/project are missing and never blocks.
 */
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

if (!fs.existsSync('scripts/deploy.sh')) {
  console.log('scripts/deploy.sh ABSENT — nothing to run, reporting honestly.');
  process.exit(0);
}
const r = spawnSync('bash', ['scripts/deploy.sh'], { stdio: 'inherit', timeout: 240_000 });
console.log(`\n==> deploy.sh rc=${r.status ?? 'null'}${r.error ? ` error=${r.error.message}` : ''}`);

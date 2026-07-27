import { spawnSync } from 'node:child_process';
const r = spawnSync('bash', ['scripts/deploy.sh'], { stdio: 'inherit' });
console.log('\n[deploy] exit code =', r.status);

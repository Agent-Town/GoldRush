import { spawnSync } from 'node:child_process';
const msg = process.argv[2];
const r = spawnSync('git', ['commit', '-q', '-m', msg], { stdio: 'inherit' });
process.exit(r.status ?? 1);

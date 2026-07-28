// s1179 gate runner: playwright against an external scratch-port dev server
// (Mistake #12 — never bind 5188 while a lane runner is live).
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const r = spawnSync('npx', ['playwright', 'test', ...args, '--reporter=line'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    GR_CAPTURE_EXTERNAL_SERVER: '1',
    GR_CAPTURE_BASE_URL: process.env.GR_S1179_URL || 'http://127.0.0.1:5234',
  },
});
console.log('EXIT=' + r.status);
process.exit(r.status ?? 1);

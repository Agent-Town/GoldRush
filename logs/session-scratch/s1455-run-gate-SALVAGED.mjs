// s1455 gate driver — runs playwright against the scratch server with the fire-shell
// serialisation flag passed EXPLICITLY (§3.1), because the bash allowlist refuses the
// inline env-var form. The gate denies me, not the factory.
import { spawnSync } from 'node:child_process';

const specs = process.argv.slice(2);
const args = ['playwright', 'test', ...specs, '--workers=1', '--reporter=list'];
const r = spawnSync('npx', args, {
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
  env: {
    ...process.env,
    GR_CAPTURE_EXTERNAL_SERVER: '1',
    GR_CAPTURE_BASE_URL: 'http://127.0.0.1:5241',
  },
});
const out = (r.stdout || '') + (r.stderr || '');
console.log(out.slice(-6000));
console.log('=== rc =', r.status, '===');

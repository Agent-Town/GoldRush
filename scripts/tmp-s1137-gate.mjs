// s1137 scratch gate runner — scratch port 5237, external server (Mistake #12)
import { spawnSync } from 'node:child_process';

const specs = process.argv.slice(2);
const r = spawnSync(
  'npx',
  ['playwright', 'test', ...specs, '--workers=1', '--reporter=list'],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      GR_CAPTURE_BASE_URL: 'http://127.0.0.1:5237',
      GR_CAPTURE_EXTERNAL_SERVER: '1',
    },
  },
);
console.log('\n[gate] exit code =', r.status);
process.exit(0);

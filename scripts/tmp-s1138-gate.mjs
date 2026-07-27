// s1138 scratch gate runner: external dev server on a scratch port so lane-b's
// live playwright on 5188 is never touched (Mistake #12 / port-collision law).
import { spawnSync } from 'node:child_process';

const port = process.env.S1138_PORT ?? '5241';
const args = process.argv.slice(2);

const res = spawnSync('npx', ['playwright', 'test', ...args], {
  encoding: 'utf8',
  env: {
    ...process.env,
    GR_CAPTURE_EXTERNAL_SERVER: '1',
    GR_CAPTURE_BASE_URL: `http://127.0.0.1:${port}`,
  },
  maxBuffer: 64 * 1024 * 1024,
});

process.stdout.write(res.stdout ?? '');
process.stderr.write(res.stderr ?? '');
console.log(`\n[s1138] playwright exit code: ${res.status}`);
process.exit(res.status ?? 1);

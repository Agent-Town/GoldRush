import { spawnSync } from 'node:child_process';

const specs = process.argv.slice(2);
if (!specs.length) throw new Error('usage: s1467-pw.mjs <spec...>');

const r = spawnSync(
  'npx',
  ['playwright', 'test', ...specs, '--workers=1', '--reporter=line'],
  {
    cwd: 'gate-s1467',
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 128,
    env: {
      ...process.env,
      GR_CAPTURE_EXTERNAL_SERVER: '1',
      GR_CAPTURE_BASE_URL: 'http://127.0.0.1:5231',
    },
  },
);

const out = ((r.stdout || '') + (r.stderr || '')).trim();
console.log(out.split('\n').slice(-30).join('\n'));
console.log('\n=== rc=' + r.status + ' :: ' + specs.join(' ') + ' ===');
process.exitCode = r.status === 0 ? 0 : 1;

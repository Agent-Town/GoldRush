import { execSync } from 'node:child_process';
const script = process.argv[2] || 'test:node-guards';
let out = '', rc = 0;
try {
  out = execSync(`npm run ${script}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 });
} catch (e) {
  rc = e.status ?? 1;
  out = (e.stdout || '') + (e.stderr || '');
}
console.log('rc=' + rc);
console.log('--- RAW TAIL (40) ---');
console.log(out.split('\n').slice(-40).join('\n'));

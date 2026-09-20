import { execSync } from 'node:child_process';
import fs from 'node:fs';

const cwd = process.argv[2];
const pkg = JSON.parse(fs.readFileSync(`${cwd}/package.json`, 'utf8'));
const cmd = pkg.scripts['test:node-guards'];
console.log('=== running test:node-guards ===');
console.log('node', process.version);
let rc = 0;
try {
  const out = execSync(cmd, { cwd, encoding: 'utf8', stdio: 'pipe', maxBuffer: 1024 * 1024 * 64 });
  console.log(out.slice(-6000));
} catch (e) {
  rc = e.status ?? 1;
  console.log((e.stdout || '').slice(-9000));
  console.log('--- stderr tail ---');
  console.log((e.stderr || '').slice(-3000));
}
console.log('NODE_GUARDS_RC=' + rc);

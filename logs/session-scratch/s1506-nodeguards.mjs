import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const cwd = process.argv[2] || 'gate-s1506';
const script = JSON.parse(fs.readFileSync('package.json', 'utf8')).scripts['test:node-guards'];
// take only the first segment (the run-node-guards.mjs invocation)
const first = script.split(' && ')[0];
const args = first.split(' ').slice(1);
try {
  const out = execFileSync('node', args, { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
  console.log(out.split('\n').slice(-30).join('\n'));
  console.log('RC=0');
} catch (e) {
  const txt = (e.stdout || '') + '\n--- stderr ---\n' + (e.stderr || '');
  console.log(txt.split('\n').slice(-60).join('\n'));
  console.log('RC=' + e.status);
}

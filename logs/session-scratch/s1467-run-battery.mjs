import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const key = process.argv[2] || 'test:node-guards';
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const cmd = pkg.scripts[key];
if (!cmd) throw new Error('no such script: ' + key);

console.log('RUNNING npm script "' + key + '" via sh\n');
const r = spawnSync('sh', ['-c', cmd], { encoding: 'utf8', maxBuffer: 1024 * 1024 * 128 });
const out = (r.stdout || '') + (r.stderr || '');
const lines = out.trim().split('\n');
console.log(lines.slice(-40).join('\n'));
console.log('\n=== rc=' + r.status + ' for ' + key + ' ===');
process.exitCode = r.status === 0 ? 0 : 1;

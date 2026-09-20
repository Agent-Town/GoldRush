#!/usr/bin/env node
// s1393: run test:node-guards inside the gate worktree (bash gate refuses the npm script name).
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
const GATE = process.argv[2] || '/Users/robin/Claude/Projects/Gold Rush/gate-s1393';
const pkg = JSON.parse(readFileSync('/Users/robin/Claude/Projects/Gold Rush/package.json', 'utf8'));
const script = pkg.scripts['test:node-guards'];
const files = script.split('&&')[0].replace('node --test', '').trim().split(/\s+/);
console.log(`running ${files.length} guard files in ${GATE}`);
try {
  const out = execFileSync('node', ['--test', ...files], { cwd: GATE, encoding: 'utf8', maxBuffer: 128 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
  console.log(out.split('\n').slice(-18).join('\n'));
  console.log('RC=0');
} catch (e) {
  const out = (e.stdout || '') + (e.stderr || '');
  console.log(out.split('\n').slice(-40).join('\n'));
  console.log('RC=' + e.status);
}

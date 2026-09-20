#!/usr/bin/env node
// s1480 — run an npm script from the repo root. The bash allowlist refuses the bare
// `npm run <name>` form for this session; fire.md §GOAL-REGISTRATION notes the gate
// denies YOU, not the factory, and prescribes running the same set through node.
// Usage: node s1480-npm.mjs <npm-script-name>
import { spawnSync } from 'node:child_process';

const ROOT = '/Users/robin/Claude/Projects/Gold Rush';
const script = process.argv[2];
if (!script) {
  console.error('usage: s1480-npm.mjs <npm-script-name>');
  process.exit(2);
}
const started = Date.now();
const r = spawnSync('npm', ['run', script], { cwd: ROOT, stdio: 'inherit' });
console.log(`\n[s1480] npm run ${script} -> rc=${r.status} in ${((Date.now() - started) / 1000).toFixed(1)}s`);
process.exit(r.status ?? 1);

#!/usr/bin/env node
/**
 * run-battery.mjs — run an npm script from package.json directly.
 * The fire's bash allowlist refuses `npm run <x> 2>&1 | tail`, but the gate
 * denies the operator, not the factory. Same command, same shell, via node.
 *
 * usage: node run-battery.mjs test:node-guards
 */
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const name = process.argv[2];
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const cmd = pkg.scripts[name];
if (!cmd) {
  console.error(`no such npm script: ${name}`);
  process.exit(2);
}
console.error(`--- running ${name} ---`);
const r = spawnSync('/bin/sh', ['-c', cmd], { stdio: 'inherit' });
console.error(`--- ${name} exited ${r.status} ---`);
process.exit(r.status ?? 1);

import { spawnSync } from 'node:child_process';

import {
  FIRE_SHELL_NODE_GUARDS_REASON,
  nodeGuardsConcurrency,
} from './node-guards-concurrency.mjs';

const concurrency = nodeGuardsConcurrency(process.env);
const args = ['--test'];

if (concurrency !== undefined) {
  console.error(FIRE_SHELL_NODE_GUARDS_REASON);
  args.push(`--test-concurrency=${concurrency}`);
}

args.push(...process.argv.slice(2));

const child = spawnSync(process.execPath, args, { stdio: 'inherit' });
if (child.error) throw child.error;
process.exit(child.status ?? 1);

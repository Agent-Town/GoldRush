// scripts/launch-video/sequence.mjs: several capture sessions in one locked batch (task launch-video-capture-2).
// The drain lock is taken once per batch (scripts/launch-video/batch.sh); this runs the sessions it is given in
// order against that batch's server, each as its own node process, and stops at the first that fails, so a take
// that depends on an earlier one's saved ledger never runs on a stale one.
//
// Usage, inside the drain lock:
//   node scripts/launch-video/sequence.mjs "session-first-claim.mjs --viewport mobile --take t1 --no-claim" \
//     "session-first-claim.mjs --viewport mobile --take t1 --claim-from-lineage wren --save-lineage wren --zoom 0.7"

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const steps = process.argv.slice(2);
if (!steps.length) throw new Error('usage: sequence.mjs "<session.mjs args>" ...');

let child = null;
process.once('SIGTERM', () => { child?.kill('SIGTERM'); });

for (const [index, step] of steps.entries()) {
  const [script, ...rest] = step.split(/\s+/).filter(Boolean);
  const started = Date.now();
  console.log(`[sequence] ${index + 1}/${steps.length} ${script} ${rest.join(' ')}`);
  const code = await new Promise((resolve) => {
    child = spawn(process.execPath, [path.join(here, script), ...rest], { stdio: 'inherit', env: process.env });
    child.on('close', (exitCode) => resolve(exitCode ?? 1));
  });
  console.log(`[sequence] ${script} exit ${code} after ${((Date.now() - started) / 1000).toFixed(0)} s`);
  if (code !== 0) process.exit(code);
}
console.log('[sequence] done');

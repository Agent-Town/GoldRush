#!/usr/bin/env node
// Drives probe-throttled.mjs across the arm table in PREDICTIONS.md, serially.
//
// Serial by construction: per F-1270-1 concurrent browser work in a fire shell is what MANUFACTURES
// depressed frame supply, and this probe's whole subject IS frame supply — two arms at once would
// contaminate exactly the quantity being measured, and the control worst of all.
//
// It exists because the bash gate refuses `VAR=x node ...` env-prefixed invocations from a fire
// shell; setting the environment in-process is the same run by a permitted route.
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// fileURLToPath, not URL.pathname: the repo path contains a space ("Gold Rush"), which pathname
// hands back percent-encoded and node then cannot resolve.
const here = path.dirname(fileURLToPath(import.meta.url));
const baseURL = process.env.GR_CAPTURE_BASE_URL ?? 'http://127.0.0.1:5236';
const arms = process.argv.slice(2);
if (arms.length === 0) throw new Error('usage: node run-arms.mjs <rate>[:<label>] ...');

for (const arm of arms) {
  const [rateRaw, label] = arm.split(':');
  const rate = Number(rateRaw);
  const name = label ?? `c${rate}`;
  const out = path.join(here, `arm-${name}.json`);
  process.stdout.write(`\n=== ARM ${name} (cpuThrottlingRate=${rate}) ===\n`);
  const result = spawnSync(
    process.execPath,
    [path.join(here, 'probe-throttled.mjs'), out, String(rate)],
    {
      stdio: 'inherit',
      env: { ...process.env, GR_CAPTURE_EXTERNAL_SERVER: '1', GR_CAPTURE_BASE_URL: baseURL },
    },
  );
  process.stdout.write(`\n--- arm ${name} rc=${result.status} ---\n`);
}

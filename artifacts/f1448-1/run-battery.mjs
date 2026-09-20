#!/usr/bin/env node
// s1450 drain instrument — the F-1448-1 matched battery, run identically on both arms.
// The whole point of F-1448-1 is that a red is only evidence when the SAME composition,
// same shell, same worker count is run on the merged tree and on clean main. This script
// exists so the two arms cannot drift by a flag.
//
// Usage: node artifacts/f1448-1/run-battery.mjs <out-file> [extra playwright args...]
import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const BATTERY = [
  'e2e/task-025-bandits-dont-swim.spec.ts',
  'e2e/064-river-continues.spec.ts',
  'e2e/e1-dry-gulch.spec.ts',
  'e2e/e1-night-shift.spec.ts',
  'e2e/gt-05-water-depth.spec.ts',
  'e2e/lane-crossing-armed.spec.ts',
];

const [out, ...extra] = process.argv.slice(2);
if (!out) {
  console.error('usage: run-battery.mjs <out-file> [extra args]');
  process.exit(2);
}

const args = ['playwright', 'test', '--workers=1', ...BATTERY, '--reporter=list', ...extra];
const started = Date.now();
const r = spawnSync('npx', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const wall = ((Date.now() - started) / 1000).toFixed(1);
const body = `$ npx ${args.join(' ')}\n${r.stdout ?? ''}\n${r.stderr ?? ''}\nEXIT=${r.status}\nWALL=${wall}s\n`;
writeFileSync(out, body);

// Report the reds by NAME, not by count — F-1448-1's whole lesson is that "fewer reds"
// is not a verdict; the two arms must match line for line.
const reds = (r.stdout ?? '')
  .split('\n')
  .filter((l) => /^\s*\d+\)\s/.test(l))
  .map((l) => l.trim());
console.log(`EXIT=${r.status}  WALL=${wall}s  REDS=${reds.length}`);
for (const l of reds) console.log('  ' + l);

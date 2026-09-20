#!/usr/bin/env node
// F-1489-1 probe — runs the `warmed test clip swaps` test of vp-02-sprite-animation
// against a scratch dev server, one project or both, and prints a machine-readable verdict.
//
// WHY A SCRIPT AND NOT A SHELL LINE: this is the bisect predicate. A predicate that is
// retyped each iteration is a predicate that drifts, and F-1489-1's own GATE warns that a
// bisect on a drifting predicate converges on an innocent commit. One file, one meaning.
//
// Usage: node artifacts/f1489-1/probe.mjs --cwd <worktree> --port 5234 [--project desktop-chrome] [--repeat 1]
// Exit: 0 = the test passed on every requested project, 1 = at least one red, 2 = misuse/harness fault.

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

function arg(name, dflt) {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? dflt : process.argv[i + 1];
}

const cwd = resolve(arg('cwd', '.'));
const port = arg('port', '5234');
const project = arg('project', null);
const repeat = Number(arg('repeat', '1'));
// COMPOSITION IS AN ARM, NOT A DETAIL. F-1146-6's "quiet" arm is the single test via -g;
// the drain battery runs it beside two other specs in ONE worker. A control that matches the
// flags but not the spec SET proves nothing about the other arm.
const battery = process.argv.includes('--battery');
const specs = battery
  ? ['e2e/vp-02-sprite-animation.spec.ts', 'e2e/vp-02b-rotation-resolver.spec.ts', 'e2e/run3d-rail-elements.spec.ts']
  : ['e2e/vp-02-sprite-animation.spec.ts'];

for (const s of specs) {
  if (!existsSync(resolve(cwd, s))) {
    console.error(`MISUSE: no ${s} under ${cwd}`);
    process.exit(2);
  }
}

const args = [
  'test',
  ...specs,
  // §3.1 — a correctness requirement of the fire shell, not an optimisation (F-1270-1).
  '--workers=1',
  '--reporter=line',
];
if (!battery) args.push('-g', 'warmed test clip swaps');
if (project) args.push(`--project=${project}`);
if (repeat > 1) args.push(`--repeat-each=${repeat}`);

const res = spawnSync(resolve(cwd, 'node_modules/.bin/playwright'), args, {
  cwd,
  encoding: 'utf8',
  timeout: 15 * 60 * 1000,
  env: {
    ...process.env,
    GR_CAPTURE_EXTERNAL_SERVER: '1',
    GR_CAPTURE_BASE_URL: `http://127.0.0.1:${port}`,
  },
});

const out = `${res.stdout ?? ''}${res.stderr ?? ''}`;

// Pull every assertion pair out, tagged with the line that failed. :461 is the TEXTURE
// assert and :467 the DRAW-CALL assert -- two different quantities, so they are reported
// separately rather than collapsed into one "off-by-one".
const fails = [];
const re = /vp-02-sprite-animation\.spec\.ts:(\d+):\d+/g;
let m;
while ((m = re.exec(out)) !== null) fails.push(m[1]);
const expReceived = [...out.matchAll(/Expected: (\d+)\n\s*Received: (\d+)/g)].map((x) => `${x[1]}->${x[2]}`);
const passed = /(\d+) passed/.exec(out)?.[1] ?? '0';
const failed = /(\d+) failed/.exec(out)?.[1] ?? '0';

// Which PROJECT failed matters: :461 is textures and :467 is draw calls, and the two
// projects have historically failed on different ones. Attribute, do not average.
const failedTitles = [...out.matchAll(/✘.*?\[([^\]]+)\].*?›.*?›\s*(.+?)(?:\s+\(|$)/gm)].map((x) => `${x[1]}:${x[2]}`);

console.log(`PROBE rc=${res.status} passed=${passed} failed=${failed} lines=[${[...new Set(fails)].join(',')}] deltas=[${expReceived.join(',')}] failed=[${failedTitles.join(' | ')}]`);
const logPath = arg('log', null);
if (logPath) {
  const { writeFileSync } = await import('node:fs');
  writeFileSync(logPath, out);
  console.log(`log -> ${logPath}`);
}
if (process.env.GR_PROBE_VERBOSE === '1') console.log(out);
if (res.error) {
  console.error(`HARNESS FAULT: ${res.error.message}`);
  process.exit(2);
}
process.exit(res.status === 0 ? 0 : 1);

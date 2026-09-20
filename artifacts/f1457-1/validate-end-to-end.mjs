#!/usr/bin/env node
// F-1457-1 end-to-end validation — s1463.
//
// scripts/external-server-is-dev.test.mjs proves the CLASSIFIER against vite's measured response
// shapes, using stubs, in 71ms. That is not the same claim as "the guard fires inside a real
// playwright run against a real vite server". This script makes the second claim, against the exact
// spec that F-1457-1 was lost on (e2e/e2-pressure-garden.spec.ts: 2 failed in 129s on preview,
// 2 passed in 18s on dev).
//
// Two arms, both with GR_CAPTURE_EXTERNAL_SERVER=1 so playwright starts no server of its own:
//   PREVIEW arm — expect a fast, loud abort naming the fix, and ZERO tests run.
//   DEV arm     — expect the run to proceed and the spec to pass, proving the guard is not one that
//                 always fires (a guard that aborted both arms would pass a one-armed check while
//                 breaking every capture run in the factory).
//
// Run: node artifacts/f1457-1/validate-end-to-end.mjs
import { spawn } from 'node:child_process';

const SPEC = 'e2e/e2-pressure-garden.spec.ts';
const ARMS = [
  { name: 'PREVIEW (the F-1457-1 mistake)', script: 'preview', port: 5252, expect: 'abort' },
  { name: 'DEV     (the correct instrument)', script: 'dev', port: 5251, expect: 'run' },
];

const children = [];
function startServer(arm) {
  const child = spawn('npm', ['run', arm.script, '--', '--port', String(arm.port), '--strictPort'], {
    cwd: process.cwd(),
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  children.push(child);
  child.stdout.on('data', () => {});
  child.stderr.on('data', () => {});
}

async function waitForListen(port, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      await fetch(`http://127.0.0.1:${port}/`, { signal: AbortSignal.timeout(2000) });
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, 300));
    }
  }
  return false;
}

function runPlaywright(port) {
  return new Promise((resolve) => {
    const started = Date.now();
    const child = spawn(
      'npx',
      ['playwright', 'test', SPEC, '--project=desktop-chrome', '--workers=1', '--reporter=line'],
      {
        cwd: process.cwd(),
        env: {
          ...process.env,
          GR_CAPTURE_EXTERNAL_SERVER: '1',
          GR_CAPTURE_BASE_URL: `http://127.0.0.1:${port}`,
        },
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );
    let out = '';
    child.stdout.on('data', (c) => { out += c; });
    child.stderr.on('data', (c) => { out += c; });
    child.on('close', (code) => resolve({ code, out, seconds: ((Date.now() - started) / 1000).toFixed(1) }));
  });
}

for (const arm of ARMS) startServer(arm);

let allOk = true;
for (const arm of ARMS) {
  const up = await waitForListen(arm.port);
  console.log(`\n=== ${arm.name} — server on ${arm.port} listening=${up} ===`);
  if (!up) { allOk = false; continue; }

  const { code, out, seconds } = await runPlaywright(arm.port);
  const guardFired = /NOT a vite dev server/.test(out);
  const namesFix = /npm run dev/.test(out) && /playwright\.preview\.config\.ts/.test(out);
  const ranTests = /\d+ passed|\d+ failed/.test(out);

  console.log(`  rc=${code}  wall=${seconds}s  guard-fired=${guardFired}  names-fix=${namesFix}  tests-ran=${ranTests}`);

  if (arm.expect === 'abort') {
    const ok = code !== 0 && guardFired && namesFix && !ranTests;
    console.log(`  EXPECT abort-before-any-test => ${ok ? 'PASS' : 'FAIL'}`);
    if (!ok) { allOk = false; console.log(out.slice(0, 1500)); }
  } else {
    const ok = code === 0 && !guardFired && ranTests;
    console.log(`  EXPECT run-and-pass => ${ok ? 'PASS' : 'FAIL'}`);
    if (!ok) { allOk = false; console.log(out.slice(-2000)); }
  }
}

console.log(`\n=== VERDICT: ${allOk ? 'PASS — guard fires on preview, inert on dev' : 'FAIL'} ===`);
for (const child of children) child.kill('SIGTERM');
setTimeout(() => {
  for (const child of children) child.kill('SIGKILL');
  process.exit(allOk ? 0 : 1);
}, 1500);

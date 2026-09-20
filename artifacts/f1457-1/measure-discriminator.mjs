#!/usr/bin/env node
// F-1457-1 measurement — s1463.
//
// QUESTION: when a fire sets GR_CAPTURE_EXTERNAL_SERVER=1, playwright.config.ts skips its
// webServer block entirely and trusts whatever is listening on baseURL. F-1457-1 measured what
// happens when that server is a `vite preview` of the production build instead of the config's
// own `npm run dev`: e2e/e2-pressure-garden.spec.ts went 2 failed in 129s on 60s click timeouts,
// and the same tree on a dev server went 2 passed in 18s. The reds were the instrument's.
//
// This script does NOT assume a discriminator. It stands both server kinds up side by side on
// scratch ports and probes several candidate signals, so the guard is built on a measurement
// rather than on what a dev server is supposed to look like.
//
// Run: node artifacts/f1457-1/measure-discriminator.mjs
import { spawn } from 'node:child_process';

const ARMS = [
  { name: 'dev     (npm run dev)', script: 'dev', port: 5251 },
  { name: 'preview (npm run preview)', script: 'preview', port: 5252 },
];

// Candidate discriminators. Each is a path plus what we record about the response.
const PROBES = ['/@vite/client', '/@id/vite/dist/client/env.mjs', '/'];

const children = [];

function start(arm) {
  const child = spawn(
    'npm',
    ['run', arm.script, '--', '--port', String(arm.port), '--strictPort'],
    { cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'] },
  );
  children.push(child);
  child.stdout.on('data', () => {});
  child.stderr.on('data', () => {});
  return child;
}

async function waitForListen(port, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/`, { signal: AbortSignal.timeout(2000) });
      if (res.status) return true;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  return false;
}

async function probe(port, path) {
  try {
    const res = await fetch(`http://127.0.0.1:${port}${path}`, {
      signal: AbortSignal.timeout(5000),
    });
    const body = await res.text();
    return {
      status: res.status,
      contentType: (res.headers.get('content-type') ?? '').split(';')[0],
      bytes: body.length,
      head: body.slice(0, 60).replace(/\s+/g, ' '),
    };
  } catch (err) {
    return { status: 'ERR', contentType: '-', bytes: 0, head: String(err.message).slice(0, 60) };
  }
}

const results = {};

for (const arm of ARMS) {
  start(arm);
}

for (const arm of ARMS) {
  const up = await waitForListen(arm.port);
  if (!up) {
    console.log(`!! ${arm.name} never listened on ${arm.port}`);
    results[arm.name] = null;
    continue;
  }
  results[arm.name] = {};
  for (const path of PROBES) {
    results[arm.name][path] = await probe(arm.port, path);
  }
}

for (const [armName, byPath] of Object.entries(results)) {
  console.log(`\n=== ${armName} ===`);
  if (!byPath) continue;
  for (const [path, r] of Object.entries(byPath)) {
    console.log(
      `  ${path.padEnd(32)} status=${String(r.status).padEnd(5)} type=${(r.contentType || '-').padEnd(24)} bytes=${String(r.bytes).padEnd(7)} ${r.head}`,
    );
  }
}

// The verdict line: which probes actually separate the two arms?
const [devArm, prevArm] = ARMS.map((a) => results[a.name]);
if (devArm && prevArm) {
  console.log('\n=== DISCRIMINATION ===');
  for (const path of PROBES) {
    const d = devArm[path];
    const p = prevArm[path];
    const separatesByType = d.contentType !== p.contentType;
    const separatesByStatus = d.status !== p.status;
    console.log(
      `  ${path.padEnd(32)} separates-by-status=${separatesByStatus}  separates-by-content-type=${separatesByType}  (dev ${d.status}/${d.contentType} vs preview ${p.status}/${p.contentType})`,
    );
  }
}

for (const child of children) child.kill('SIGTERM');
setTimeout(() => {
  for (const child of children) child.kill('SIGKILL');
  process.exit(0);
}, 1500);

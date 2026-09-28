// boot-probe.mjs (worktree-vite-cache-1): measure a vite dev server boot the way an e2e test meets it,
// and run the two-server (sibling) experiment of the master's scope item 1.
//
// Every server is spawned here as ONE node process running the same vite binary that `npx vite` and
// `npm run dev` exec (`<root>/node_modules/vite/bin/vite.js --host 127.0.0.1 --port N --strictPort`),
// so it is stopped by its own PID and nothing else. Each page probe opens a FRESH browser context (no
// HTTP cache carried between boots) on `/?debug&nowaves` and waits for the predicate the adjacent
// m2-01 spec's `openGame` waits for: `__THREE_GAME_DIAGNOSTICS__.frame > 10`.
//
//   node boot-probe.mjs timing  <label> <root> <port> <outdir> [--force] [--config <vite config file>]
//   node boot-probe.mjs sibling <label> <rootA> <portA> <cacheA> <rootB> <portB> <cacheB> <outdir> [--concurrent]
//
// Output: `<outdir>/<label>.json` (the numbers) and one server log per spawned server, each line
// prefixed with milliseconds since that server's spawn. NO_COLOR keeps the logs plain text.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium } from '@playwright/test';

const BOOT_QUERY = '/?debug&nowaves';
const BOOT_TIMEOUT_MS = 180_000;
const SETTLE_MS = 10_000;

const load1 = () => Number(os.loadavg()[0].toFixed(2));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function spawnVite(root, port, logPath, extraArgs = []) {
  const t0 = Date.now();
  const bin = path.join(root, 'node_modules/vite/bin/vite.js');
  const args = [bin, '--host', '127.0.0.1', '--port', String(port), '--strictPort', ...extraArgs];
  const child = spawn(process.execPath, args, { cwd: root, env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' }, stdio: ['ignore', 'pipe', 'pipe'] });
  const out = fs.createWriteStream(logPath);
  const lines = [];
  out.write(`# spawn ${new Date(t0).toISOString()} pid ${child.pid} cwd ${root}\n# argv node ${args.join(' ')}\n# load1 ${load1()}\n`);
  const sink = (stream) => {
    let buffered = '';
    stream.on('data', (chunk) => {
      buffered += chunk.toString();
      let newline;
      while ((newline = buffered.indexOf('\n')) >= 0) {
        const line = buffered.slice(0, newline);
        buffered = buffered.slice(newline + 1);
        const ms = Date.now() - t0;
        lines.push({ ms, line });
        out.write(`[+${String(ms).padStart(6)}ms] ${line}\n`);
      }
    });
  };
  sink(child.stdout);
  sink(child.stderr);
  const exited = new Promise((resolve) => child.on('exit', (code, signal) => resolve({ code, signal })));
  return {
    t0, pid: child.pid, lines,
    async stop() {
      child.kill('SIGTERM');
      let result = await Promise.race([exited, sleep(10_000).then(() => null)]);
      if (!result) { child.kill('SIGKILL'); result = await exited; }
      out.write(`# stopped ${new Date().toISOString()} exit ${JSON.stringify(result)}\n`);
      await new Promise((resolve) => out.end(resolve));
      return result;
    },
  };
}

async function waitHttp(url, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(2_000) });
      if (res.ok) return Date.now();
    } catch { /* not listening yet */ }
    await sleep(100);
  }
  throw new Error(`no HTTP 200 from ${url} within ${timeoutMs} ms`);
}

async function probePage(browser, base) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const consoleErrors = [];
  const badResponses = [];
  const failedRequests = [];
  let navigations = 0;
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text().slice(0, 300)); });
  page.on('pageerror', (error) => consoleErrors.push(`pageerror: ${String(error.message).slice(0, 300)}`));
  page.on('response', (response) => { if (response.status() >= 400) badResponses.push(`${response.status()} ${response.statusText()} ${response.url().replace(base, '')}`.slice(0, 300)); });
  page.on('requestfailed', (request) => failedRequests.push(`${request.failure()?.errorText ?? 'failed'} ${request.url().replace(base, '')}`.slice(0, 300)));
  page.on('framenavigated', (frame) => { if (frame === page.mainFrame()) navigations += 1; });
  const start = Date.now();
  let bootedAt = null;
  let error = null;
  try {
    await page.goto(`${base}${BOOT_QUERY}`, { waitUntil: 'commit', timeout: BOOT_TIMEOUT_MS });
    await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: BOOT_TIMEOUT_MS, polling: 100 });
    bootedAt = Date.now();
  } catch (caught) {
    error = String(caught?.message ?? caught).split('\n')[0].slice(0, 300);
  }
  const navigationsAtBoot = navigations;
  if (bootedAt) await sleep(SETTLE_MS);
  const result = {
    ok: bootedAt !== null,
    pageStart: start,
    pageMs: bootedAt ? bootedAt - start : null,
    bootedAt,
    error,
    navigationsAtBoot,
    reloadsBeforeBoot: Math.max(0, navigationsAtBoot - 1),
    reloadsInSettle: navigations - navigationsAtBoot,
    consoleErrors: [...new Set(consoleErrors)],
    badResponses: [...new Set(badResponses)],
    failedRequests: [...new Set(failedRequests)],
  };
  await context.close();
  return result;
}

function snapshotDeps(cacheDir) {
  const deps = path.join(cacheDir, 'deps');
  let files = [];
  try { files = fs.readdirSync(deps).sort(); } catch { return { deps, exists: false }; }
  let metadata = null;
  try {
    const m = JSON.parse(fs.readFileSync(path.join(deps, '_metadata.json'), 'utf8'));
    metadata = { hash: m.hash, configHash: m.configHash, browserHash: m.browserHash, optimized: Object.keys(m.optimized ?? {}).length, chunks: Object.keys(m.chunks ?? {}).length };
  } catch { /* no metadata */ }
  const three = path.join(deps, 'three.js');
  let threeMtime = null;
  try { threeMtime = fs.statSync(three).mtime.toISOString(); } catch { /* absent */ }
  let temps = 0;
  try { temps = fs.readdirSync(cacheDir).filter((name) => name.includes('_temp_')).length; } catch { /* absent */ }
  return { deps, exists: true, at: new Date().toISOString(), fileCount: files.length, hasThree: files.includes('three.js'), threeMtime, metadata, tempDirs: temps };
}

function logMarkers(lines) {
  const pick = (re) => lines.filter(({ line }) => re.test(line)).map(({ ms, line }) => `+${ms}ms ${line.trim().slice(0, 220)}`);
  return {
    scanFailed: pick(/Failed to run dependency scan/),
    tsconfigError: pick(/TSCONFIG_ERROR/),
    newDepsOptimized: pick(/new dependencies optimized/),
    reoptimizing: pick(/Re-optimizing dependencies|Forced re-optimization/),
    reloading: pick(/optimized dependencies changed\. reloading/),
    errors: pick(/error while updating dependencies|\berror\b.*\bdep/i),
  };
}

async function timing(label, root, port, outdir, force, configFile) {
  const browser = await chromium.launch({ channel: 'chromium' });
  const loadStart = load1();
  const server = spawnVite(root, port, path.join(outdir, `${label}-${port}.log`), [...(force ? ['--force'] : []), ...(configFile ? ['--config', configFile] : [])]);
  let result;
  try {
    const readyAt = await waitHttp(`http://127.0.0.1:${port}/`, 120_000);
    const page = await probePage(browser, `http://127.0.0.1:${port}`);
    result = {
      label, root, port, force, configFile: configFile ?? null, spawnedAt: new Date(server.t0).toISOString(), pid: server.pid,
      load1AtStart: loadStart, load1AtBoot: load1(),
      readyMs: readyAt - server.t0,
      bootMs: page.bootedAt ? page.bootedAt - server.t0 : null,
      page,
      markers: logMarkers(server.lines),
    };
  } finally {
    result = { ...(result ?? { label, error: 'server did not come up' }), stop: await server.stop() };
    await browser.close();
  }
  fs.writeFileSync(path.join(outdir, `${label}.json`), `${JSON.stringify(result, null, 2)}\n`);
  console.log(`${label}: boot ${result.bootMs ?? 'FAILED'} ms (ready ${result.readyMs} ms) reloads ${result.page?.reloadsBeforeBoot}/${result.page?.reloadsInSettle} load ${result.load1AtStart}->${result.load1AtBoot} scanFailed ${result.markers?.scanFailed.length} newDeps ${result.markers?.newDepsOptimized.length} reoptimizing ${result.markers?.reoptimizing.length}`);
}

async function sibling(label, rootA, portA, cacheA, rootB, portB, cacheB, outdir, concurrent) {
  const browser = await chromium.launch({ channel: 'chromium' });
  const baseA = `http://127.0.0.1:${portA}`;
  const result = { label, concurrent, rootA, portA, cacheA, rootB, portB, cacheB, load1AtStart: load1(), snapshots: {} };
  const a = spawnVite(rootA, portA, path.join(outdir, `${label}-A-${portA}.log`));
  let b = null;
  try {
    result.snapshots.beforeA = snapshotDeps(cacheA);
    const readyA = await waitHttp(`${baseA}/`, 120_000);
    result.readyAMs = readyA - a.t0;
    if (concurrent) {
      // B is spawned while page 1 is loading on A: the race the master names.
      const page1 = probePage(browser, baseA);
      await sleep(1_500);
      b = spawnVite(rootB, portB, path.join(outdir, `${label}-B-${portB}.log`));
      result.bSpawnedAtMsOfA = b.t0 - a.t0;
      result.page1 = await page1;
      await waitHttp(`http://127.0.0.1:${portB}/`, 120_000);
      await sleep(8_000);
      result.snapshots.afterB = { a: snapshotDeps(cacheA), b: snapshotDeps(cacheB) };
    } else {
      result.page1 = await probePage(browser, baseA);
      await sleep(5_000);
      result.snapshots.afterPage1 = { a: snapshotDeps(cacheA), b: snapshotDeps(cacheB) };
      b = spawnVite(rootB, portB, path.join(outdir, `${label}-B-${portB}.log`));
      result.bSpawnedAtMsOfA = b.t0 - a.t0;
      await waitHttp(`http://127.0.0.1:${portB}/`, 120_000);
      await sleep(8_000);
      result.snapshots.afterB = { a: snapshotDeps(cacheA), b: snapshotDeps(cacheB) };
    }
    result.page2 = await probePage(browser, baseA);
    result.snapshots.afterPage2 = { a: snapshotDeps(cacheA), b: snapshotDeps(cacheB) };
  } catch (error) {
    result.error = String(error?.message ?? error).split('\n')[0];
  } finally {
    result.load1AtEnd = load1();
    if (b) { result.markersB = logMarkers(b.lines); result.stopB = await b.stop(); }
    result.markersA = logMarkers(a.lines);
    result.stopA = await a.stop();
    await browser.close();
  }
  fs.writeFileSync(path.join(outdir, `${label}.json`), `${JSON.stringify(result, null, 2)}\n`);
  console.log(`${label}: page1 ${result.page1?.ok ? `booted ${result.page1.pageMs} ms` : `FAILED (${result.page1?.error})`} | page2 ${result.page2?.ok ? `booted ${result.page2.pageMs} ms` : `FAILED (${result.page2?.error})`} | A scanFailed ${result.markersA.scanFailed.length} reloading ${result.markersA.reloading.length} | B reoptimizing ${result.markersB?.reoptimizing.length ?? '-'} scanFailed ${result.markersB?.scanFailed.length ?? '-'}`);
}

const [mode, ...rest] = process.argv.slice(2);
if (mode === 'timing') {
  const [label, root, port, outdir] = rest;
  const configAt = rest.indexOf('--config');
  await timing(label, path.resolve(root), Number(port), path.resolve(outdir), rest.includes('--force'), configAt >= 0 ? rest[configAt + 1] : undefined);
} else if (mode === 'sibling') {
  const [label, rootA, portA, cacheA, rootB, portB, cacheB, outdir] = rest;
  await sibling(label, path.resolve(rootA), Number(portA), cacheA, path.resolve(rootB), Number(portB), cacheB, path.resolve(outdir), rest.includes('--concurrent'));
} else {
  console.error('usage: boot-probe.mjs timing|sibling ...');
  process.exit(2);
}

#!/usr/bin/env node
// F-1592-1 lever proof: can CDP Emulation.setCPUThrottlingRate inflate MAIN-THREAD
// frame time past the 50 ms arm threshold, where external CPU hogs provably cannot?
//
// Derived from artifacts/f1591-1-frame-supply-cliff/probe.mjs (merged c213694c0).
// The ONLY change of substance is the lever: a CDP throttle instead of external hogs.
// Unlike its parent, this probe records the LEVER'S OWN STATE in the artifact (F-1592-2).
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const baseURL = process.env.GR_CAPTURE_BASE_URL;
const output = process.argv[2];
const rate = Number(process.argv[3] ?? '1');
if (process.env.GR_CAPTURE_EXTERNAL_SERVER !== '1' || !baseURL || !output) {
  throw new Error('usage: GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:<port> node probe.mjs <output.json> <throttleRate>');
}

const backgroundLoad = JSON.parse(process.env.GR_PROBE_BACKGROUND_LOAD ?? 'null');
const isAlive = (pid) => {
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};
if (backgroundLoad) backgroundLoad.liveAtProbeStart = isAlive(backgroundLoad.batteryPid);

const browser = await chromium.launch({ channel: 'chromium' });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('console', (message) => message.type() === 'error' && errors.push(`console: ${message.text()}`));
page.on('pageerror', (error) => errors.push(`page: ${error.message}`));

// --- the lever, and its own evidence -------------------------------------
const cdp = await page.context().newCDPSession(page);
let leverApplied = false;
let leverError = null;
try {
  if (rate > 1) {
    await cdp.send('Emulation.setCPUThrottlingRate', { rate });
    leverApplied = true;
  }
} catch (error) {
  leverError = String(error && error.message ? error.message : error);
}

try {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
    const profileKey = 'gr.profile.v2';
    const profileDataKey = (key) => `${profileKey}.robin.${key}`;
    const profile = {
      version: 2,
      activeId: 'robin',
      profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: ['story:first-contract'] }],
    };
    const meta = JSON.stringify({ version: 1, tracks: { territory: 3, science: 0, hero: 0, agent: 0 } });
    localStorage.setItem(profileKey, JSON.stringify(profile));
    localStorage.setItem(profileDataKey('gr.town.name.v1'), 'Quartz Hill');
    localStorage.setItem(profileDataKey('gr.meta.v1'), meta);
    localStorage.setItem(profileDataKey('gr.firstClaim.done.v1'), '1');
    localStorage.setItem('gr.town.name.v1', 'Quartz Hill');
    localStorage.setItem('gr.meta.v1', meta);
    localStorage.setItem('gr.firstClaim.done.v1', '1');
  });

  await page.goto(baseURL);
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 2, undefined, { timeout: 60_000 })
    .catch((error) => { throw new Error('PROBE-ABORT: window.__GR_TOWN_DIAGNOSTICS__ never appeared', { cause: error }); });
  await page.waitForFunction(
    () => (window.__GR_TOWN_DIAGNOSTICS__?.actors ?? []).every((actor) => !actor.visible || actor.loaded),
    undefined,
    { timeout: 60_000 },
  );

  // Independent liveness check of the lever: time a fixed busy-loop in the page.
  // Under a real throttle this must inflate roughly in proportion to `rate`.
  const busyMs = await page.evaluate(() => {
    const t0 = performance.now();
    let x = 0;
    for (let i = 0; i < 3_000_000; i += 1) x += Math.sqrt(i);
    return { ms: performance.now() - t0, sink: x };
  });

  const started = performance.now();
  const samples = [];
  while (performance.now() - started < 30_000) {
    const diagnostic = await page.evaluate(() => {
      const town = window.__GR_TOWN_DIAGNOSTICS__;
      return town ? { frame: town.frame, elapsed: town.elapsed } : null;
    });
    if (!diagnostic) throw new Error('PROBE-ABORT: window.__GR_TOWN_DIAGNOSTICS__ disappeared');
    samples.push({ wallMs: performance.now() - started, ...diagnostic });
    if (diagnostic.elapsed > 4) break;
    await page.waitForTimeout(250);
  }

  if (samples.length === 0) throw new Error('PROBE-ABORT: no samples');
  const intervals = samples.slice(1).map((sample, index) => ({
    frames: sample.frame - samples[index].frame,
    elapsed: sample.elapsed - samples[index].elapsed,
  })).filter(({ frames }) => frames > 0);
  const first = samples[0];
  const last = samples.at(-1);
  const frames = last.frame - first.frame;
  const elapsed = last.elapsed - first.elapsed;
  const wallMs = last.wallMs - first.wallMs;
  const fps = frames / (wallMs / 1000);
  const meanFrameIntervalMs = 1000 / fps;
  if (backgroundLoad) backgroundLoad.liveAtProbeEnd = isAlive(backgroundLoad.batteryPid);
  const result = {
    baseURL,
    startedAt: new Date().toISOString(),
    backgroundLoad,
    lever: {
      kind: 'cdp:Emulation.setCPUThrottlingRate',
      rate,
      applied: leverApplied,
      error: leverError,
      busyLoopMs: busyMs.ms,
    },
    armed: meanFrameIntervalMs > 50,
    samples,
    errors,
    summary: {
      startFrame: first.frame,
      startElapsed: first.elapsed,
      endFrame: last.frame,
      endElapsed: last.elapsed,
      frames,
      elapsed,
      wallMs,
      meanElapsedPerFrame: elapsed / frames,
      maxElapsedPerFrame: Math.max(...intervals.map((interval) => interval.elapsed / interval.frames)),
      fps,
      meanFrameIntervalMs,
      predictedWallSeconds: 81 / fps,
      timedOut: last.elapsed <= 4,
    },
  };
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify({ rate, armed: result.armed, busyLoopMs: busyMs.ms, ...result.summary }));
  process.exitCode = errors.length ? 2 : 0;
} finally {
  await browser.close();
}

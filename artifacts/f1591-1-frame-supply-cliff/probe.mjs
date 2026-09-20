#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const baseURL = process.env.GR_CAPTURE_BASE_URL;
const output = process.argv[2];
if (process.env.GR_CAPTURE_EXTERNAL_SERVER !== '1' || !baseURL || !output) {
  throw new Error('usage: GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:<port> node probe.mjs <output.json>');
}

const browser = await chromium.launch({ channel: 'chromium' });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('console', (message) => message.type() === 'error' && errors.push(`console: ${message.text()}`));
page.on('pageerror', (error) => errors.push(`page: ${error.message}`));

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
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 2, undefined, { timeout: 30_000 })
    .catch((error) => { throw new Error('PROBE-ABORT: window.__GR_TOWN_DIAGNOSTICS__ never appeared', { cause: error }); });
  await page.waitForFunction(
    () => (window.__GR_TOWN_DIAGNOSTICS__?.actors ?? []).every((actor) => !actor.visible || actor.loaded),
    undefined,
    { timeout: 30_000 },
  );

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

  if (samples.length === 0) throw new Error('PROBE-ABORT: window.__GR_TOWN_DIAGNOSTICS__ never appeared');
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
  const result = {
    baseURL,
    startedAt: new Date().toISOString(),
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
      meanFrameIntervalMs: 1000 / fps,
      predictedWallSeconds: 81 / fps,
      timedOut: last.elapsed <= 4,
    },
  };
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify(result.summary));
  process.exitCode = errors.length ? 2 : 0;
} finally {
  await browser.close();
}

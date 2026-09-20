#!/usr/bin/env node
// f2069 — Arm C: depress frame supply with CDP CPU throttling instead of parallel load.
//
// WHY THIS ARM EXISTS (F-1591-1, s1591; Arm 0/A merged 5936ec48e s1592):
//   F-1591-1 derives that `town.elapsed` gains min(frameDelta, 0.05) per PRESENTED frame
//   (src/core/Loop.ts:27 MAX_PRESENTATION_DELTA_SECONDS, :116 clamp, :121 variable-step path
//   feeds the CLAMPED value to update(); src/town/TownScene.ts:686 `this.elapsed += delta`).
//   Therefore `elapsed > 4` costs >= 81 presented frames, i.e. ~81/fps seconds below the 20fps knee.
//   Arm 0 confirmed only the UPPER BOUND, entirely ABOVE the knee where the ratio cannot move.
//   Arm A tried to get below the knee with N=2/4/8/16 parallel loads and COULD NOT ARM
//   (every run stayed ~120fps) — a contention instrument that never bit.
//
// CHANGED PREMISE (fire law §7.5 — a third attempt needs a changed premise, not a retry):
//   CDP Emulation.setCPUThrottlingRate depresses frame supply DETERMINISTICALLY rather than by
//   competing for cores, so it does not depend on winning a scheduling fight against the host.
//
// Throttling is applied AFTER warmup so this measures the STEADY-STATE regime, not a cold boot.
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const baseURL = process.env.GR_CAPTURE_BASE_URL;
const output = process.argv[2];
const rate = Number(process.argv[3] ?? '1');
const capMs = Number(process.env.GR_PROBE_CAP_MS ?? '45000');
if (process.env.GR_CAPTURE_EXTERNAL_SERVER !== '1' || !baseURL || !output) {
  throw new Error('usage: GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:<port> node probe-throttled.mjs <output.json> <cpuThrottleRate>');
}

const browser = await chromium.launch({ channel: 'chromium' });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('console', (message) => message.type() === 'error' && errors.push(`console: ${message.text()}`));
page.on('pageerror', (error) => errors.push(`page: ${error.message}`));

try {
  // Same profile seeding as artifacts/f1591-1-frame-supply-cliff/probe.mjs — kept identical so the
  // control arm here is comparable to Arm 0's numbers rather than a differently-booted town.
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

  // Arm the throttle only now, so warmup cost is not charged to the measured window.
  const cdp = await page.context().newCDPSession(page);
  if (rate > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate });

  // Baseline AFTER arming: the measured window starts from the first post-throttle sample.
  const started = performance.now();
  const samples = [];
  let elapsedAt30s = null;
  // The 120x arm closed its window with NEITHER exit condition apparently met and a total process
  // wall far exceeding the measured window, so the exit is recorded explicitly rather than inferred.
  let exitReason = 'cap';
  while (performance.now() - started < capMs) {
    const diagnostic = await page.evaluate(() => {
      const town = window.__GR_TOWN_DIAGNOSTICS__;
      return town ? { frame: town.frame, elapsed: town.elapsed } : null;
    });
    if (!diagnostic) throw new Error('PROBE-ABORT: window.__GR_TOWN_DIAGNOSTICS__ disappeared');
    const wallMs = performance.now() - started;
    samples.push({ wallMs, ...diagnostic });
    // The e2e predicate is `elapsed > 4` under a 30s cap: record where THIS run stood at 30s so the
    // timeout class (F-1587-2's 41.8s red) is answerable from the same run rather than re-derived.
    if (elapsedAt30s === null && wallMs >= 30_000) elapsedAt30s = diagnostic.elapsed - samples[0].elapsed;
    if (diagnostic.elapsed - samples[0].elapsed > 4) { exitReason = 'reached-elapsed-4'; break; }
    await page.waitForTimeout(250);
  }

  if (samples.length < 2) throw new Error('PROBE-ABORT: too few samples');
  const intervals = samples.slice(1).map((sample, index) => ({
    frames: sample.frame - samples[index].frame,
    elapsed: sample.elapsed - samples[index].elapsed,
    wallMs: sample.wallMs - samples[index].wallMs,
  })).filter(({ frames }) => frames > 0);
  const first = samples[0];
  const last = samples.at(-1);
  const frames = last.frame - first.frame;
  const elapsed = last.elapsed - first.elapsed;
  const wallMs = last.wallMs - first.wallMs;
  const fps = frames / (wallMs / 1000);
  const perFrame = intervals.map((interval) => interval.elapsed / interval.frames);
  const result = {
    baseURL,
    cpuThrottlingRate: rate,
    startedAt: new Date().toISOString(),
    samples,
    errors,
    summary: {
      cpuThrottlingRate: rate,
      frames,
      elapsed,
      wallMs,
      fps,
      meanFrameIntervalMs: 1000 / fps,
      // The whole question: does this pin at exactly MAX_PRESENTATION_DELTA_SECONDS below the knee?
      meanElapsedPerFrame: elapsed / frames,
      minElapsedPerFrame: Math.min(...perFrame),
      maxElapsedPerFrame: Math.max(...perFrame),
      clampEngaged: 1000 / fps > 50,
      predictedWallSecondsFor81Frames: 81 / fps,
      reachedElapsed4: elapsed > 4,
      wallSecondsToElapsed4: elapsed > 4 ? wallMs / 1000 : null,
      elapsedAt30s,
      // Only meaningful when the window actually reached 30s; null elapsedAt30s means NOT MEASURED,
      // which is not the same as "did not time out".
      wouldTimeOutAt30sCap: elapsedAt30s === null ? null : elapsedAt30s <= 4,
      exitReason,
      measuredWindowSeconds: wallMs / 1000,
      capMs,
    },
  };
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify(result.summary));
  process.exitCode = errors.length ? 2 : 0;
} finally {
  await browser.close();
}

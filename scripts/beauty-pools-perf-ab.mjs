#!/usr/bin/env node
// F-1113-4 perf A/B for the pool grade: ONE browser, arms interleaved by reload seconds apart
// (?nopoolgrade holds the seam back while everything else boots identically). Night pressure
// scene shaped like night3d-perf's bootPressure: 60 enemies, 7 relit lanterns, light cap 8, dark.
import { chromium } from 'playwright';
import os from 'node:os';

const BASE = 'http://127.0.0.1:5261';
const ROUNDS = 3;

const browser = await chromium.launch({ channel: 'chromium' });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

async function bootArm(flag) {
  const url = `${BASE}/?debug&contract=e1-night-shift&nowaves&nolevel&nopause&nokill&seed=pool-perf&tier=full${flag ? '&nopoolgrade' : ''}`;
  await page.goto(url);
  await page.waitForFunction(() => Boolean(window.__GR_TEST__));
  const begin = page.getByRole('button', { name: 'Begin' });
  if (await begin.isVisible().catch(() => false)) await begin.click();
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 20);
  await page.evaluate(() => {
    const api = window.__GR_TEST__;
    api.setBalance('render.night.maxDynamicLights', 8);
    api.setBalance('render.night.collapseSeconds', 9999);
    api.setBalance('enemy.contactDamage', 0);
    api.setBalance('waves.aliveCap', 80);
    api.setWave(10);
    for (let index = 0; index < 7; index += 1) api.repair('lantern_post', index);
    for (const count of [12, 24, 24]) api.spawnPack(count, 22, { speedScale: 0.05, hpScale: 999 });
  });
  await page.waitForFunction(() => (window.__GR_TEST__?.enemyPositions().length ?? 0) >= 55);
  await page.waitForFunction(() =>
    document.querySelector('#game-canvas')?.dataset.terrain3dPilotState === 'ready' &&
    document.querySelector('#game-canvas')?.dataset.terrain3dPilotRenderSource === 'glb');
  await page.waitForFunction(() =>
    window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightShift.phase === 'dark' &&
    window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightPools === 8);
  await page.waitForTimeout(350);
}

async function p95() {
  return page.evaluate(async () => {
    const samples = [];
    let previous = performance.now();
    for (let index = 0; index < 180; index += 1) {
      await new Promise((resolve) => requestAnimationFrame(() => resolve()));
      const now = performance.now();
      samples.push(now - previous);
      previous = now;
    }
    samples.sort((a, b) => a - b);
    return samples[Math.floor(samples.length * 0.95)] ?? 0;
  });
}

const results = { on: [], off: [] };
for (let round = 0; round < ROUNDS; round += 1) {
  console.log(`round ${round + 1} loadavg ${os.loadavg().map((n) => n.toFixed(1)).join(' ')}`);
  await bootArm(false);
  const on = await p95();
  results.on.push(+on.toFixed(2));
  console.log(`  grade ON  p95 ${on.toFixed(2)}ms`);
  await bootArm(true);
  const off = await p95();
  results.off.push(+off.toFixed(2));
  console.log(`  grade OFF p95 ${off.toFixed(2)}ms`);
}
const median = (list) => [...list].sort((a, b) => a - b)[Math.floor(list.length / 2)];
console.log(JSON.stringify({
  rounds: results,
  medianOnMs: median(results.on),
  medianOffMs: median(results.off),
  deltaPct: +(((median(results.on) - median(results.off)) / median(results.off)) * 100).toFixed(2),
  loadavg: os.loadavg().map((n) => +n.toFixed(1)),
}, null, 2));
await browser.close();

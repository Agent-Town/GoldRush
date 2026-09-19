import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { PNG } from 'pngjs';

// The perf-r2 camera/seed/pressure matrix and pixel thresholds, with a stronger control:
// render the retained original meshes and their replacement in ONE frozen scene. No
// sprite, camera, light, texture arrival, or story UI can change between these draws.
// Originals are the actual pre-batch objects, not a reconstruction of the old geometry.
const OUT = path.resolve('artifacts/sol/open-findings');
const MAPS = ['e1-night-shift', 'the-claim', 'e1-dry-gulch', 'e1-twin-banks', 'e1-baron'];

function difference(actual: Buffer, expected: Buffer) {
  const a = PNG.sync.read(actual), b = PNG.sync.read(expected);
  expect([a.width, a.height]).toEqual([b.width, b.height]);
  let changed = 0, sum = 0;
  for (let offset = 0; offset < a.data.length; offset += 4) {
    let max = 0;
    for (let channel = 0; channel < 4; channel++) {
      const delta = Math.abs(a.data[offset + channel]! - b.data[offset + channel]!);
      sum += delta;
      max = Math.max(max, delta);
    }
    if (max > 4) changed++;
  }
  return { changed, changedShare: changed / (a.width * a.height), meanChannelDelta: sum / a.data.length, pixels: a.width * a.height };
}

async function boot(page: Page, map: string, pressure: boolean) {
  await page.goto(`/?debug&contract=${map}&nowaves&nolevel&nopause&nokill&tier=full&seed=e1-perf-pixels-${map}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => Boolean(window.__GR_TEST__), null, { timeout: 60_000 });
  await page.evaluate(() => document.querySelector<HTMLButtonElement>('[data-testid="contract-briefing-dismiss"]')?.click());
  await page.waitForFunction(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
    return canvas?.dataset.terrain3dPilotState === 'ready' && canvas.dataset.run3dPilotState === 'ready';
  }, null, { timeout: 60_000 });
  await page.evaluate(({ map, pressure }) => {
    const api = window.__GR_TEST__!;
    if (pressure) {
      api.setWave(map === 'e1-baron' ? 18 : map === 'e1-night-shift' ? 10 : 8);
      api.scriptEnemyAt(-8, 0, 8, 0, 0);
      api.spawnPack(59, 22, { speedScale: 0, hpScale: 999, carriedLantern: false });
    }
    api.setManualSim(true);
    api.advanceSim(1 / 30);
  }, { map, pressure });
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.__GR_TEST__!.driveRenderSchedule(0.5, 60));
  await page.waitForTimeout(400);
  await page.evaluate(() => window.__GR_TEST__!.driveRenderSchedule(0.5, 60));
  if (pressure) expect(await page.evaluate(() => window.__GR_TEST__!.enemyPositions().length)).toBeGreaterThanOrEqual(60);
}

test('opaque props preserve all perf-r2 transparent-order scenes', async ({ page }, info) => {
  test.setTimeout(900_000);
  page.setDefaultTimeout(60_000);
  const errors = { console: [] as string[], page: [] as string[] };
  page.on('console', m => { if (m.type() === 'error') errors.console.push(m.text()); });
  page.on('pageerror', e => errors.page.push(e.message));
  await page.addInitScript(() => {
    // three's documented devtools observation event; no application module replacement.
    const host = window as any;
    host.__THREE_DEVTOOLS__ = new EventTarget();
    host.__THREE_DEVTOOLS__.addEventListener('observe', (event: any) => {
      const renderer = event.detail;
      if (!renderer.isWebGLRenderer) return;
      const render = renderer.render;
      renderer.render = function(scene: any, camera: any) {
        if (scene.isScene && camera.isPerspectiveCamera) host.__ASTRA_RENDER__ = { renderer, scene, camera };
        return render.call(this, scene, camera);
      };
    });
  });
  await mkdir(`${OUT}/_raw/transparency`, { recursive: true });
  const rows: unknown[] = [];
  for (const map of MAPS) for (const pressure of [false, true]) {
    await boot(page, map, pressure);
    const label = `${info.project.name}-${map}${pressure ? '-pressure' : ''}`;
    const captures = await page.evaluate(() => {
      const { scene, renderer } = (window as any).__ASTRA_RENDER__;
      const batches: any[] = [];
      scene.traverse((object: any) => { if (object.userData.opaqueSourceIds) batches.push(object); });
      const originalNow = performance.now.bind(performance);
      const stamp = originalNow();
      Object.defineProperty(performance, 'now', { configurable: true, value: () => stamp });
      const toggle = (batching: boolean) => {
        for (const batch of batches) {
          batch.visible = batching;
          for (const id of batch.userData.opaqueSourceIds) scene.getObjectById(id).visible = !batching;
        }
      };
      const capture = () => {
        const census = window.__GR_TEST__!.drawCallCensus();
        return { png: renderer.domElement.toDataURL('image/png').split(',')[1], calls: census.totalCalls };
      };
      try {
        toggle(false);
        capture(); // settle the original reed callback at the frozen timestamp
        const before = capture();
        const control = capture();
        toggle(true);
        const after = capture();
        return { before, control, after, batches: batches.length, hero: window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.hero'] };
      } finally {
        toggle(true);
        Object.defineProperty(performance, 'now', { configurable: true, value: originalNow });
      }
    });
    expect(captures.batches).toBeGreaterThan(0);
    const before = Buffer.from(captures.before.png, 'base64');
    const control = Buffer.from(captures.control.png, 'base64');
    const after = Buffer.from(captures.after.png, 'base64');
    for (const [arm, buffer] of [['before', before], ['control', control], ['after', after]] as const) {
      await writeFile(`${OUT}/_raw/transparency/${label}-${arm}.png`, buffer);
    }
    const treatment = difference(before, after), noise = difference(before, control);
    rows.push({ label, treatment, control: noise, calls: { before: captures.before.calls, after: captures.after.calls }, hero: captures.hero });
    await writeFile(`${OUT}/pixel-report-${info.project.name}.json`, JSON.stringify({ project: info.project.name, predicate: { channelThreshold: 4, maxChangedShare: 0.01, maxMeanChannelDelta: 0.25 }, rows, errors }, null, 2));
    console.log(`${label}: ${treatment.changed} changed pixels (${(100*treatment.changedShare).toFixed(5)}%), mean ${treatment.meanChannelDelta}; control ${noise.changed}; calls ${captures.before.calls}->${captures.after.calls}`);
    expect.soft(noise.changedShare, `${label}: control stability`).toBeLessThanOrEqual(0.01);
    expect.soft(treatment.changed, label).toBeLessThanOrEqual(Math.max(noise.changed + Math.ceil(noise.pixels * 0.002), Math.ceil(noise.pixels * 0.01)));
    expect.soft(treatment.meanChannelDelta, label).toBeLessThanOrEqual(Math.max(noise.meanChannelDelta * 1.5 + 0.02, 0.25));
  }
  expect(errors).toEqual({ console: [], page: [] });
});

test('town opaque repetitions preserve the frozen color and shadow image', async ({ page }, info) => {
  test.setTimeout(120_000);
  const errors = { console: [] as string[], page: [] as string[] };
  page.on('console', m => { if (m.type() === 'error') errors.console.push(m.text()); });
  page.on('pageerror', e => errors.page.push(e.message));
  await page.addInitScript(() => {
    history.replaceState({ goldRushScene: 'town' }, '', location.href);
    const host = window as any;
    host.__THREE_DEVTOOLS__ = new EventTarget();
    host.__THREE_DEVTOOLS__.addEventListener('observe', (event: any) => {
      const renderer = event.detail;
      if (!renderer.isWebGLRenderer) return;
      const render = renderer.render;
      renderer.render = function(scene: any, camera: any) {
        if (scene.isScene && camera.isPerspectiveCamera) host.__ASTRA_RENDER__ = { renderer, scene, camera };
        return render.call(this, scene, camera);
      };
    });
  });
  await page.goto('/?debug&tier=full&seed=e1-perf-town', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#game-canvas')).toHaveAttribute('data-town3d-plaza-props-state', 'loaded', { timeout: 60_000 });
  await page.waitForTimeout(2000);
  const captures = await page.evaluate(() => {
    const { scene, renderer, camera } = (window as any).__ASTRA_RENDER__;
    const batches: any[] = [];
    scene.traverse((object: any) => { if (object.userData.opaqueSourceIds) batches.push(object); });
    const now = performance.now.bind(performance), stamp = now();
    Object.defineProperty(performance, 'now', { configurable: true, value: () => stamp });
    const toggle = (enabled: boolean) => {
      for (const batch of batches) {
        batch.visible = enabled;
        for (const id of batch.userData.opaqueSourceIds) scene.getObjectById(id).visible = !enabled;
      }
    };
    const draw = () => {
      renderer.info.reset(); renderer.render(scene, camera);
      return { png: renderer.domElement.toDataURL('image/png').split(',')[1], calls: renderer.info.render.calls, triangles: renderer.info.render.triangles };
    };
    try {
      toggle(false); draw(); const before = draw(), control = draw();
      toggle(true); const after = draw();
      return { before, control, after, batches: batches.length };
    } finally {
      toggle(true); Object.defineProperty(performance, 'now', { configurable: true, value: now });
    }
  });
  expect(captures.batches).toBeGreaterThan(0);
  const before = Buffer.from(captures.before.png, 'base64'), control = Buffer.from(captures.control.png, 'base64'), after = Buffer.from(captures.after.png, 'base64');
  await mkdir(`${OUT}/_raw/transparency`, { recursive: true });
  for (const [arm, buffer] of [['before', before], ['control', control], ['after', after]] as const) await writeFile(`${OUT}/_raw/transparency/${info.project.name}-town-${arm}.png`, buffer);
  const treatment = difference(before, after), noise = difference(before, control);
  const result = { project: info.project.name, treatment, control: noise, before: { calls: captures.before.calls, triangles: captures.before.triangles }, after: { calls: captures.after.calls, triangles: captures.after.triangles }, errors };
  await writeFile(`${OUT}/pixel-town-${info.project.name}.json`, JSON.stringify(result, null, 2));
  expect(noise.changed).toBe(0);
  expect(treatment.changedShare).toBeLessThanOrEqual(.01);
  expect(treatment.meanChannelDelta).toBeLessThanOrEqual(.25);
  expect(captures.after.calls).toBeLessThan(captures.before.calls);
  expect(errors).toEqual({ console: [], page: [] });
});

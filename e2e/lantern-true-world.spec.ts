import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import engineEra from '../assets/engine-era.json' with { type: 'json' };

const output = path.resolve('artifacts/lantern-true-world-2');
const fixtures = {
  claim: 'artifacts/eh3-fixture/tape.json',
  signal: 'artifacts/gauntlet-heat11-20260903/rides/e7-relay-rush/opus/work/attempt-1-tape.json',
};
async function openReel(page: Page, kind: keyof typeof fixtures = 'claim', extra = '') {
  const tape = JSON.parse(await readFile(fixtures[kind], 'utf8'));
  tape.meta = { ...tape.meta, engineHash: engineEra.engineHash, era: engineEra.era };
  const errors: string[] = [];
  const requests: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => requests.push(request.url()));
  await page.route('**/api/standings**', (route) => route.fulfill({ json: { ok: true, reel: tape } }));
  await page.goto(`/?watch=${encodeURIComponent(tape.id)}&contract=${tape.contract}&epoch=epoch-1-frontier${extra}`);
  const show = page.getByTestId('lantern-show');
  await expect(show).toHaveAttribute('data-boot', 'independent', { timeout: 60_000 });
  return { tape, errors, requests, show };
}

async function frameP95(page: Page): Promise<number> {
  return page.evaluate(async () => {
    const samples: number[] = [];
    let previous = performance.now();
    for (let index = 0; index < 120; index++) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const now = performance.now(); samples.push(now - previous); previous = now;
    }
    return samples.sort((a, b) => a - b)[114]!;
  });
}

async function pixels(page: Page) {
  // Capture inside the owned render callback; an out-of-frame read of a WebGL canvas may be cleared.
  return page.evaluate(async () => {
    const modulePath = '/src/core/Renderer.ts';
    const { captureNextRenderedFrame } = await import(/* @vite-ignore */ modulePath) as typeof import('../src/core/Renderer');
    return new Promise<{ colors: number; colored: number }>((resolve) => {
      const canvas = document.querySelector<HTMLCanvasElement>('[data-testid="lantern-world-canvas"]')!;
      captureNextRenderedFrame(canvas, (frame) => {
        const copy = document.createElement('canvas'); copy.width = 64; copy.height = 64;
        const context = copy.getContext('2d')!; context.drawImage(frame, 0, 0, 64, 64);
        const { data } = context.getImageData(0, 0, 64, 64);
        const colors = new Set<string>(); let colored = 0;
        for (let i = 0; i < data.length; i += 4) {
          colors.add(`${data[i]! >> 4},${data[i + 1]! >> 4},${data[i + 2]! >> 4}`);
          if (Math.max(data[i]!, data[i + 1]!, data[i + 2]!) - Math.min(data[i]!, data[i + 1]!, data[i + 2]!) > 15) colored++;
        }
        resolve({ colors: colors.size, colored });
      });
    });
  });
}

for (const kind of ['claim', 'signal'] as const) test(`${kind} plain watch draws its contract world with snapshot sprites`, async ({ page }, info) => {
  test.setTimeout(180_000);
  const { tape, errors, requests, show } = await openReel(page, kind);
  const canvas = page.getByTestId('lantern-world-canvas');
  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveAttribute('data-contract', tape.contract);
  await expect(canvas).toHaveAttribute('data-terrain3d-pilot-state', 'ready', { timeout: 90_000 });
  await expect.poll(async () => Number(await canvas.getAttribute('data-rendered-sprites')), { timeout: 60_000 }).toBeGreaterThan(1);
  expect(requests.some((url) => /terrain[^/]*\.glb/.test(url))).toBe(true);
  expect(requests.some((url) => /\/src\/game\/Game\.ts/.test(url))).toBe(false);
  expect(await page.evaluate(() => Boolean(window.__THREE_GAME_DIAGNOSTICS__))).toBe(false);
  expect(JSON.parse((await show.getAttribute('data-true-reel-probe'))!).contract.id).toBe(tape.contract);
  const probe = await pixels(page);
  expect(probe.colors).toBeGreaterThan(10);
  expect(probe.colored).toBeGreaterThan(1000);
  if (info.project.name === 'mobile-chrome') {
    const ratio = await canvas.evaluate((element) => element.getBoundingClientRect().height / innerHeight);
    expect(ratio).toBeGreaterThanOrEqual(.6);
    await expect(page.locator('.lantern-show__title details')).not.toHaveAttribute('open', '');
  }
  await mkdir(output, { recursive: true });
  await page.screenshot({ path: path.join(output, `${info.project.name}-${kind}.png`) });
  if (kind === 'claim') {
    await page.getByTestId('lantern-speed-4').click();
    await expect(show).toHaveAttribute('data-playback', 'complete', { timeout: 90_000 });
    await expect(page.getByTestId('lantern-playback-status')).toContainText('hash matched in this browser');
    await expect(page.getByTestId('lantern-playback-status')).toHaveAttribute('data-hash', tape.eventLogHash);
    await page.getByTestId('lantern-restart').click();
    await expect(show).toHaveAttribute('data-playback', 'playing');
    await page.getByTestId('lantern-pause').click();
    await expect(show).toHaveAttribute('data-playback', 'paused');
    // Let an already-issued worker request settle before asserting the frozen tick.
    await page.waitForTimeout(250);
    const tick = await show.getAttribute('data-tick');
    await page.waitForTimeout(250);
    expect(await show.getAttribute('data-tick')).toBe(tick);
  }
  expect(errors).toEqual([]);
});

for (const mode of ['tactical', 'lite', 'no-webgl'] as const) test(`${mode} opens the labelled tactical reel without returning to the menu`, async ({ page }, info) => {
  test.setTimeout(120_000);
  if (mode === 'no-webgl') await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      if (/webgl/i.test(type)) return null;
      return Reflect.apply(getContext, this, [type, ...args]);
    } as typeof getContext;
  });
  const { show, errors, requests } = await openReel(page, 'claim', mode === 'tactical' ? '&reel=tactical' : mode === 'lite' ? '&tier=lite' : '');
  await expect(page.getByTestId('lantern-reel-label')).toHaveText('Tactical reel');
  await expect(page.getByTestId('lantern-true-world')).toBeVisible();
  await expect(page.getByTestId('start-menu')).toHaveCount(0);
  await expect.poll(() => show.getAttribute('data-true-reel-probe'), { timeout: 60_000 }).not.toBe('');
  if (mode === 'tactical') {
    expect(new URL(page.url()).searchParams.get('reel')).toBe('tactical');
    await expect(page.getByTestId('lantern-share-url')).toHaveValue(page.url());
  }
  if (mode === 'lite') {
    await expect(show).toHaveAttribute('data-world-source', 'painted');
    expect(requests.some((url) => /terrain-bank[^/]*\.png/.test(url))).toBe(true);
    expect(requests.some((url) => /\.glb(?:\?|$)/.test(url))).toBe(false);
  }
  if (mode === 'no-webgl') {
    await expect(show).toHaveAttribute('data-fallback', 'no-webgl');
    await mkdir(output, { recursive: true });
    await page.screenshot({ path: path.join(output, `${info.project.name}-no-webgl.png`) });
    await page.getByTestId('lantern-close').click();
    await expect(page.getByTestId('start-menu')).toBeVisible({ timeout: 30_000 });
    expect(new URL(page.url()).search).toBe('');
  }
  expect(errors).toEqual([]);
});

test('reel frame p95 stays within 115 percent of the mounted game', async ({ page }, info) => {
  test.setTimeout(180_000);
  await page.goto('/?debug&nowaves&nolevel&nokill&nopause&seed=terrain3d-claim');
  const begin = page.getByRole('button', { name: 'Begin' });
  if (await begin.isVisible()) await begin.click();
  await expect(page.locator('#game-canvas')).toHaveAttribute('data-terrain3d-pilot-state', 'ready', { timeout: 90_000 });
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 120);
  const gameP95 = await frameP95(page);
  const { errors } = await openReel(page);
  await expect(page.getByTestId('lantern-world-canvas')).toHaveAttribute('data-terrain3d-pilot-state', 'ready', { timeout: 90_000 });
  await expect.poll(async () => Number(await page.getByTestId('lantern-world-canvas').getAttribute('data-frame')), { timeout: 60_000 }).toBeGreaterThan(120);
  const reelP95 = await frameP95(page);
  const sample = { project: info.project.name, gameP95, reelP95, ratio: reelP95 / gameP95 };
  await mkdir(output, { recursive: true });
  await writeFile(path.join(output, `${info.project.name}-perf.json`), JSON.stringify(sample, null, 2));
  console.log('[lantern-perf]', JSON.stringify(sample));
  expect(reelP95).toBeLessThanOrEqual(gameP95 * 1.15);
  expect(errors).toEqual([]);
});


test('Game uses the shared agent controller and reproduces the recorded hash', async ({ page }) => {
  test.setTimeout(120_000);
  const tape = JSON.parse(await readFile(fixtures.claim, 'utf8'));
  tape.meta = { ...tape.meta, engineHash: engineEra.engineHash, era: engineEra.era };
  await page.addInitScript((recording) => sessionStorage.setItem('gr.assay-replay.v1', JSON.stringify(recording)), tape);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/?debug&assayReplay&contract=the-claim&nolevel&nopause');
  const begin = page.getByRole('button', { name: 'Begin' });
  if (await begin.isVisible()) await begin.click();
  const show = page.getByTestId('lantern-show');
  await expect(show).toBeVisible({ timeout: 45_000 });
  await expect.poll(() => page.evaluate(() => Boolean(window.__THREE_GAME_DIAGNOSTICS__))).toBe(true);
  await page.getByTestId('lantern-speed-4').click();
  await expect(show).toHaveAttribute('data-playback', 'complete', { timeout: 90_000 });
  await expect(page.getByTestId('lantern-playback-status')).toHaveAttribute('data-hash', tape.eventLogHash);
  expect(errors).toEqual([]);
});

test('a stored lite preference survives replay storage isolation', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('gr.performance.tier.v1', 'lite'));
  const { show, errors } = await openReel(page);
  await expect(show).toHaveAttribute('data-tier', 'lite');
  await expect(page.getByTestId('lantern-reel-label')).toHaveText('Tactical reel');
  expect(errors).toEqual([]);
});


test('stationary works keep family identity and Night Shift renders its dark phase', async ({ page }) => {
  test.setTimeout(60_000);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/src/replay/harness.html?debug&contract=e1-night-shift');
  const result = await page.evaluate(async () => {
    const contractPath = '/src/meta/ContractFamilies.ts';
    const contracts = await import(/* @vite-ignore */ contractPath) as typeof import('../src/meta/ContractFamilies');
    contracts.stageReplayContract('e1-night-shift');
    const stagePath = '/src/world/LanternWorldStage.ts';
    const { LanternWorldStage } = await import(/* @vite-ignore */ stagePath) as typeof import('../src/world/LanternWorldStage');
    const stage = new LanternWorldStage();
    stage.canvas.style.cssText = 'width:600px;height:400px';
    document.body.append(stage.canvas);
    const manifest = contracts.loadContract('e1-night-shift');
    const snapshot: import('../src/replay/AgentTapeReplay').AgentTapeReplaySnapshot = {
      contract: { id: manifest.id, tileId: manifest.tileParams.tileId, width: 64, height: 64 },
      tick: 30, wave: 11, timeAlive: 100, gold: 0,
      hero: { x: 0, z: 12, hp: 100, maxHp: 100, alive: true }, rider: null, enemies: [], seams: [], pickups: [{ index: 0, x: -5, z: 12, amount: 7 }],
      works: [
        { id: 'sentry_beacon', index: 0, x: -10, z: 12, hp: 10, maxHp: 10, wrecked: false },
        { id: 'sluice', index: 0, x: 10, z: 12, hp: 10, maxHp: 10, wrecked: false },
        { id: 'lantern_post', index: 0, x: 3, z: 12, hp: 10, maxHp: 10, wrecked: false },
      ],
    };
    stage.update(snapshot);
    stage.render(0, false, 1);
    stage.update({ ...snapshot, tick: 31, pickups: [{ index: 0, x: 5, z: 12, amount: 7 }] });
    stage.render(1 / 60, false, 1);
    const sentries = stage.scene.getObjectByName('Lantern-bld.sentry_beacon')!.children;
    const sluices = stage.scene.getObjectByName('Lantern-bld.portrait.sluice')!.children;
    const sun = stage.scene.getObjectByName('LedgerLowSun') as import('three').DirectionalLight;
    const pickups = stage.scene.getObjectByName('GoldPickupPool')!.children[0] as import('three').InstancedMesh;
    const observed = { sentryX: sentries[0]!.position.x, lanternX: sentries[1]!.position.x, sluiceX: sluices[0]!.position.x,
      pickupX: pickups.instanceMatrix.array[12], pickupFloats: stage.canvas.dataset.pickupFloats,
      darkness: stage.canvas.dataset.darkness, phase: stage.canvas.dataset.lightPhase, lightSources: Number(stage.canvas.dataset.lightSources), sun: sun.intensity };
    stage.dispose();
    return observed;
  });
  expect(result).toEqual({ sentryX: -10, lanternX: 3, sluiceX: 10, pickupX: 0, pickupFloats: '1', darkness: '1', phase: 'dark', lightSources: 3, sun: 0 });
  expect(errors).toEqual([]);
});

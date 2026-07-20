import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { FIRST_CLAIM_DONE_KEY, PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';
import { MEGAPROJECT_STATE_KEY } from '../src/meta/Megaproject';

const ARTIFACT_DIR = path.resolve('artifacts/town3d-dynamo-hall');
const STEAMWORKS = 'epoch-2-steamworks';
type Errors = { console: string[]; page: string[] };

async function seed(page: Page, complete = true): Promise<void> {
  await page.addInitScript(({ keys, steamworks, completeProject }) => {
    localStorage.clear(); sessionStorage.clear();
    const profile: ProfileState = { version: 2, activeId: 'robin', profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }] };
    localStorage.setItem(keys.profile, JSON.stringify(profile));
    localStorage.setItem(keys.town, 'Quartz Hill');
    localStorage.setItem(keys.guide, '1');
    localStorage.setItem(keys.meta, JSON.stringify({ version: 1, tracks: { territory: 3, science: completeProject ? 14 : 0, hero: 0, agent: 0 } }));
    if (completeProject) {
      localStorage.setItem(keys.activeEpoch, steamworks);
      localStorage.setItem(keys.megaproject, JSON.stringify({ version: 1, projects: { 'dynamo-hall': { stage: 3, funded: false, ticksRemaining: 0, hp: 210, delayTicks: 0, defenseWave: 0 } } }));
    }
    const counter = { calls: 0, triangles: 0 };
    Object.defineProperty(window, '__TOWN_V3_WEBGL__', { configurable: true, value: counter });
    for (const Constructor of [globalThis.WebGLRenderingContext, globalThis.WebGL2RenderingContext].filter(Boolean)) {
      const prototype = Constructor.prototype as unknown as Record<string, (...args: number[]) => unknown>;
      for (const name of ['drawArrays', 'drawElements', 'drawArraysInstanced', 'drawElementsInstanced']) {
        const original = prototype[name]; if (typeof original !== 'function' || Reflect.get(original, '__townV3Wrapped')) continue;
        const wrapped = function (this: unknown, ...args: number[]) {
          const count = args[name.startsWith('drawArrays') ? 2 : 1] ?? 0;
          counter.calls += 1; counter.triangles += Math.floor(count / 3) * (name.endsWith('Instanced') ? (args.at(-1) ?? 0) : 1);
          return Reflect.apply(original, this, args);
        };
        Reflect.set(wrapped, '__townV3Wrapped', true); prototype[name] = wrapped;
      }
    }
  }, { completeProject: complete, steamworks: STEAMWORKS, keys: {
    profile: PROFILE_KEY, town: profileDataKey('robin', TOWN_NAME_KEY), guide: profileDataKey('robin', FIRST_CLAIM_DONE_KEY),
    meta: profileDataKey('robin', META_PROGRESS_KEY), activeEpoch: profileDataKey('robin', ACTIVE_EPOCH_KEY), megaproject: profileDataKey('robin', MEGAPROJECT_STATE_KEY),
  } });
}

function errors(page: Page): Errors {
  const found: Errors = { console: [], page: [] };
  page.on('console', message => { if (message.type() === 'error') found.console.push(message.text()); });
  page.on('pageerror', error => found.page.push(error.message));
  return found;
}

async function openTown(page: Page, search = ''): Promise<void> {
  const query = search || '?terrain2d';
  if (await page.evaluate(() => Boolean(window.__GR_TOWN_DIAGNOSTICS__)).catch(() => false)) {
    await page.getByTestId('town-exit').click();
  } else {
    await page.goto('/');
  }
  await page.evaluate(value => history.replaceState(null, '', `/${value}`), query);
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 50);
}

async function sample(page: Page, frames = 180) {
  return page.evaluate(async count => {
    const counter = (window as typeof window & { __TOWN_V3_WEBGL__: { calls: number; triangles: number } }).__TOWN_V3_WEBGL__;
    const start = { ...counter }; const deltas: number[] = [];
    await new Promise<void>(resolve => { let previous = performance.now(); const tick = (now: number) => { deltas.push(now - previous); previous = now; deltas.length < count ? requestAnimationFrame(tick) : resolve(); }; requestAnimationFrame(tick); });
    deltas.sort((a,b) => a-b);
    return { p95Ms: Number(deltas[Math.floor((deltas.length - 1) * .95)]!.toFixed(2)), calls: Number(((counter.calls-start.calls)/count).toFixed(2)), triangles: Math.round((counter.triangles-start.triangles)/count) };
  }, frames);
}

async function shot(page: Page, info: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${info.project.name}-${name}.png`), fullPage: true });
}

async function walkToHall(page: Page): Promise<void> {
  for (const target of [{ x: 6, z: 7 }, { x: 9, z: 7 }]) {
    for (let step = 0; step < 64; step += 1) {
      const diagnostics = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__!);
      if (diagnostics.activePrompt === 'dynamo-hall') return;
      const keys: string[] = [];
      if (Math.abs(target.x - diagnostics.player.x) > 0.5) keys.push(target.x > diagnostics.player.x ? 'KeyD' : 'KeyA');
      if (Math.abs(target.z - diagnostics.player.z) > 0.5) keys.push(target.z > diagnostics.player.z ? 'KeyS' : 'KeyW');
      if (keys.length === 0) break;
      for (const key of keys) await page.keyboard.down(key);
      await page.waitForTimeout(140);
      for (const key of keys.reverse()) await page.keyboard.up(key);
    }
  }
  const diagnostics = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__!);
  expect(diagnostics.activePrompt, `player stopped at ${JSON.stringify(diagnostics.player)}`).toBe('dynamo-hall');
}

test('complete Dynamo Hall loads one bounded painted mesh without changing its interaction', async ({ page }, info) => {
  test.setTimeout(60_000); await seed(page); const found = errors(page); const requests: string[] = [];
  page.on('request', request => { const url = new URL(request.url()); if (url.pathname.includes('dynamo-hall') && url.pathname.endsWith('.glb') && !url.search) requests.push(request.url()); });
  await openTown(page); const before = await sample(page); await shot(page, info, 'before-facade');
  await openTown(page, '?town3dPilot=dynamo_hall&tier=full');
  await page.waitForFunction(() => document.querySelector('canvas')?.dataset.town3dPilotState === 'loaded');
  const canvas = page.locator('canvas');
  await expect(canvas).toHaveAttribute('data-town3d-pilot-render-source', 'glb');
  await expect(canvas).toHaveAttribute('data-town3d-pilot-meshes', '1');
  await expect(canvas).toHaveAttribute('data-town3d-pilot-materials', '1');
  expect(Number(await canvas.getAttribute('data-town3d-pilot-triangles'))).toBeLessThanOrEqual(15_000);
  expect((await canvas.getAttribute('data-town3d-pilot-bounds'))?.split('x').map(Number)).toEqual([5.38, 4.148, 3.239]);
  expect(requests).toHaveLength(1);
  const after = await sample(page); expect(after.p95Ms).toBeLessThanOrEqual(before.p95Ms * 1.15);
  await writeFile(path.join(ARTIFACT_DIR, `renderer-delta-${info.project.name}.json`), JSON.stringify({ before, after, p95Ratio: Number((after.p95Ms/before.p95Ms).toFixed(4)) }, null, 2) + '\n');
  await shot(page, info, 'after-glb'); await walkToHall(page); await expect(page.getByTestId('crank-dynamo')).toBeVisible();
  await page.getByTestId('town-exit').click(); await expect(canvas).toHaveAttribute('data-town3d-pilot-state', 'disposed'); expect(found).toEqual({ console: [], page: [] });
});

test('LITE never requests the Dynamo Hall GLB', async ({ page }, info) => {
  await seed(page); const found = errors(page); const requests: string[] = [];
  page.on('request', request => { const url = new URL(request.url()); if (url.pathname.includes('dynamo-hall') && url.pathname.endsWith('.glb') && !url.search) requests.push(request.url()); });
  await openTown(page, '?town3dPilot=dynamo_hall&tier=lite'); await shot(page, info, 'lite-facade'); expect(requests).toEqual([]);
  expect(found).toEqual({ console: [], page: [] });
});

test('a pre-T2 profile never renders or requests the 3D Dynamo Hall', async ({ page }) => {
  await seed(page, false); const found = errors(page); const requests: string[] = [];
  page.on('request', request => { const url = new URL(request.url()); if (url.pathname.includes('dynamo-hall') && url.pathname.endsWith('.glb') && !url.search) requests.push(request.url()); });
  await openTown(page, '?town3dPilot=dynamo_hall&tier=full'); await page.waitForTimeout(500);
  await expect(page.locator('canvas')).toHaveAttribute('data-town3d-pilot-state', 'off');
  await expect(page.locator('canvas')).toHaveAttribute('data-town3d-pilot-render-source', 'facade');
  expect(await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.dynamoHall.visible)).toBe(false);
  expect(requests).toEqual([]); expect(found).toEqual({ console: [], page: [] });
});

test('a failed Dynamo Hall load preserves the complete-stage visual and crank', async ({ page }, info) => {
  await seed(page); const found = errors(page); await page.route(/dynamo-hall(?:[.-][^/?]+)?\.glb/, route => new URL(route.request().url()).search ? route.continue() : route.fulfill({ body: 'not a glb', contentType: 'model/gltf-binary' }));
  await openTown(page, '?town3dPilot=dynamo_hall&tier=full'); await page.waitForFunction(() => document.querySelector('canvas')?.dataset.town3dPilotState === 'error');
  await expect(page.locator('canvas')).toHaveAttribute('data-town3d-pilot-render-source', 'facade'); await shot(page, info, 'load-failure-facade');
  await walkToHall(page); await expect(page.getByTestId('crank-dynamo')).toBeVisible(); expect(found).toEqual({ console: [], page: [] });
});

test('owner eye shows the complete Dynamo Hall with every registered 3D building', async ({ page }, info) => {
  await seed(page); const found = errors(page); await openTown(page, '?town3dPilot=all&tier=full');
  await page.waitForFunction(() => document.querySelector('canvas')?.dataset.town3dPilotRenderSource === 'glb'); await page.waitForTimeout(800);
  await walkToHall(page); await shot(page, info, 'owner-dynamo-hall-vs-town'); expect(found).toEqual({ console: [], page: [] });
});

test('exiting during lazy pilot load stays disposed', async ({ page }) => {
  await seed(page); const found = errors(page);
  await page.route(/dynamo-hall(?:[.-][^/?]+)?\.glb/, async route => { if (!new URL(route.request().url()).search) await new Promise(resolve => setTimeout(resolve, 1500)); await route.continue(); });
  await openTown(page, '?town3dPilot=dynamo_hall&tier=full'); await page.getByTestId('town-exit').click(); await page.waitForTimeout(800);
  await expect(page.locator('canvas')).toHaveAttribute('data-town3d-pilot-state', 'disposed'); expect(found).toEqual({ console: [], page: [] });
});

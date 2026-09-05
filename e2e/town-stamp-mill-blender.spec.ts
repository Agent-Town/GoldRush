import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { ADVANCE_STREAM_TERMINAL_STATES } from '../src/assets/AdvanceStream';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { FIRST_CLAIM_DONE_KEY, PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { MEGAPROJECT_STATE_KEY } from '../src/meta/Megaproject';

const ARTIFACT_DIR = path.resolve('artifacts/town3d-stamp-mill');
const MODEL_MARKER = 'stamp-mill';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type RenderSample = {
  calls: number;
  geometries: number;
  textures: number;
  webglCallsPerFrame: number;
  trianglesPerFrame: number;
  p95Ms: number;
};

async function installSeedAndWebglCounter(page: Page, complete = true): Promise<void> {
  await page.addInitScript(({ profileKey, townKey, metaKey, guideKey, megaprojectKey, complete }) => {
    localStorage.clear();
    sessionStorage.clear();
    const state: ProfileState = {
      version: 2,
      activeId: 'robin',
      profiles: [{
        id: 'robin',
        name: 'Robin',
        createdAt: 1,
        updatedAt: 1,
        difficultyPreset: 'trail',
        hintsSeen: ['story:town-growth-stamp-mill', 'story:town-growth-chapel', 'story:ledger-page:the_claim'],
      }],
    };
    localStorage.setItem(profileKey, JSON.stringify(state));
    localStorage.setItem(townKey, 'Quartz Hill');
    localStorage.setItem(metaKey, JSON.stringify({ version: 1, tracks: { territory: 3, science: 0, hero: 0, agent: 0 } }));
    localStorage.setItem(guideKey, '1');
    localStorage.setItem(megaprojectKey, JSON.stringify({ version: 1, projects: { 'stamp-mill': { stage: complete ? 3 : 0, funded: false, ticksRemaining: 0, hp: 150, delayTicks: 0, defenseWave: 0 } } }));

    const counter = { calls: 0, triangles: 0 };
    Object.defineProperty(window, '__TOWN_V3_WEBGL__', { configurable: true, value: counter });
    const constructors = [globalThis.WebGLRenderingContext, globalThis.WebGL2RenderingContext].filter(Boolean);
    for (const Constructor of constructors) {
      const prototype = Constructor.prototype as unknown as Record<string, (...args: number[]) => unknown>;
      for (const name of ['drawArrays', 'drawElements', 'drawArraysInstanced', 'drawElementsInstanced']) {
        const original = prototype[name];
        if (typeof original !== 'function' || Reflect.get(original, '__townV3Wrapped')) continue;
        const wrapped = function (this: unknown, ...args: number[]): unknown {
          const vertexCount = args[name.startsWith('drawArrays') ? 2 : 1] ?? 0;
          const instances = name.endsWith('Instanced') ? (args.at(-1) ?? 0) : 1;
          const triangles = args[0] === 4 ? Math.floor(vertexCount / 3) : args[0] === 5 || args[0] === 6 ? Math.max(0, vertexCount - 2) : 0;
          counter.calls += 1;
          counter.triangles += triangles * instances;
          return Reflect.apply(original, this, args);
        };
        Reflect.set(wrapped, '__townV3Wrapped', true);
        prototype[name] = wrapped;
      }
    }
  }, {
    profileKey: PROFILE_KEY,
    townKey: profileDataKey('robin', TOWN_NAME_KEY),
    metaKey: profileDataKey('robin', META_PROGRESS_KEY),
    guideKey: profileDataKey('robin', FIRST_CLAIM_DONE_KEY),
    megaprojectKey: profileDataKey('robin', MEGAPROJECT_STATE_KEY),
    complete,
  });
}

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => { if (message.type() === 'error') bucket.consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openTown(page: Page, search = ''): Promise<void> {
  const query = search || '?terrain2d';
  if (await page.evaluate(() => Boolean(window.__GR_TOWN_DIAGNOSTICS__)).catch(() => false)) {
    await page.getByTestId('town-exit').click();
  } else {
    await page.goto('/');
  }
  await page.evaluate((value) => history.replaceState(null, '', `/${value}`), query);
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 40);
}

async function measure(page: Page, frames = 180): Promise<RenderSample> {
  return page.evaluate(async (sampleFrames) => {
    type Counter = { calls: number; triangles: number };
    const counter = (window as typeof window & { __TOWN_V3_WEBGL__: Counter }).__TOWN_V3_WEBGL__;
    await new Promise<void>((resolve) => {
      let remaining = 10;
      const tick = () => { remaining -= 1; if (remaining > 0) requestAnimationFrame(tick); else resolve(); };
      requestAnimationFrame(tick);
    });
    const start = { ...counter };
    const deltas: number[] = [];
    await new Promise<void>((resolve) => {
      let previous = performance.now();
      const tick = (now: number) => {
        deltas.push(now - previous);
        previous = now;
        if (deltas.length < sampleFrames) requestAnimationFrame(tick); else resolve();
      };
      requestAnimationFrame(tick);
    });
    const renderer = window.__GR_TOWN_DIAGNOSTICS__!.renderer;
    const sorted = [...deltas].sort((a, b) => a - b);
    return {
      ...renderer,
      webglCallsPerFrame: Number(((counter.calls - start.calls) / sampleFrames).toFixed(2)),
      trianglesPerFrame: Math.round((counter.triangles - start.triangles) / sampleFrames),
      p95Ms: Number(sorted[Math.floor((sorted.length - 1) * 0.95)]!.toFixed(2)),
    };
  }, frames);
}

async function walkToMill(page: Page): Promise<void> {
  for (let step = 0; step < 64; step += 1) {
    const diagnostics = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__!);
    if (diagnostics.activePrompt === 'stamp-mill') return;
    const target = { x: 3.45, z: 6.5 };
    const keys: string[] = [];
    if (Math.abs(target.x - diagnostics.player.x) > 0.5) keys.push(target.x > diagnostics.player.x ? 'KeyD' : 'KeyA');
    if (Math.abs(target.z - diagnostics.player.z) > 0.5) keys.push(target.z > diagnostics.player.z ? 'KeyS' : 'KeyW');
    for (const key of keys) await page.keyboard.down(key);
    await page.waitForTimeout(140);
    for (const key of keys.reverse()) await page.keyboard.up(key);
  }
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt), { timeout: 2_000 }).toBe('stamp-mill');
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: true });
}

function assertNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

// THE LAW (bounded-prefetch-town-halls, 2026-09-05): the bulk halls are part of the TOWN's
// priority-1 set on normal connections — they are the town — so the whole town warms before the
// stream moves to its priority-2 destination, and Save Data alone trims them (asserted in
// `advance-stream.spec.ts:75`). Two things changed from the pre-allowance version of this test:
//   1. It no longer waits for `ready`. Since 065252649 the stream may also stop terminally at
//      `allowance`, and waiting for one terminal state hangs whenever the other one happens.
//   2. It stubs prefetch bodies. `AdvanceStream` accounts REAL response bytes, and the dev server
//      ships the pre-diet source GLBs: the era-1 town alone is 18,049,588 B on the dev tree
//      (`town-plate.glb` is 7,904,068 B of it) against 2,614,544 B in the built tree the players
//      get. So on the dev tree the 12,000,000 B mobile allowance is spent six URLs into the town
//      and the halls are never asked for — an artefact of the harness, not of the law. Same house
//      pattern, same reason as `advance-stream.spec.ts:63-66` ("Keep the allowance out of this
//      assertion"). The byte law itself is measured against the BUILT tree, in
//      `artifacts/bounded-prefetch-town-halls/report.md`.
test('normal connections prefetch both bulk town halls inside the town priority-1 set', async ({ page }) => {
  await installSeedAndWebglCounter(page);
  const errors = collectErrors(page);
  const prefetched: string[] = [];
  page.on('request', (request) => {
    if (request.headers()['x-gold-rush-prefetch'] === '1') prefetched.push(new URL(request.url()).pathname);
  });
  // Keep the allowance out of this assertion: only the plan may decide what the town warms.
  await page.route('**/*.glb', (route) => route.request().headers()['x-gold-rush-prefetch'] === '1'
    ? route.fulfill({ contentType: 'model/gltf-binary', body: Buffer.alloc(37) })
    : route.continue());

  await page.goto('/');
  const canvas = page.locator('#game-canvas');
  const terminalState = async (): Promise<string> => {
    const value = await canvas.getAttribute('data-asset-prefetch-state');
    return ADVANCE_STREAM_TERMINAL_STATES.some((state) => state === value) ? 'terminal' : `still-running:${value}`;
  };
  await expect.poll(terminalState, { timeout: 20_000 }).toBe('terminal');
  // Terminal AND complete: every town URL fetched, so the town's set was never truncated.
  await expect(canvas).toHaveAttribute('data-asset-prefetch-state', 'ready');
  await expect(canvas).toHaveAttribute('data-asset-prefetch-town-state', 'ready');

  const townPaths = await page.evaluate(async () => {
    // Indirect specifier: the dev server resolves it, TypeScript must not try to.
    const townPath = '/src/town/TownTavernPilot.ts';
    const { townPrefetchUrls } = await import(townPath);
    return (townPrefetchUrls() as string[]).map((url) => new URL(url, location.href).pathname);
  });
  expect(townPaths.filter((path) => /stamp-mill|dynamo-hall/.test(path))).toEqual(
    expect.arrayContaining([expect.stringContaining('stamp-mill'), expect.stringContaining('dynamo-hall')]),
  );
  expect(prefetched.filter((path) => /stamp-mill|dynamo-hall/.test(path))).toEqual(
    expect.arrayContaining([expect.stringContaining('stamp-mill'), expect.stringContaining('dynamo-hall')]),
  );
  expect(townPaths.filter((path) => !prefetched.includes(path))).toEqual([]);
  // Priority 1 means FIRST: no priority-2 destination URL may be requested before the town is done.
  const lastTownIndex = Math.max(...townPaths.map((path) => prefetched.lastIndexOf(path)));
  const firstDestinationIndex = prefetched.findIndex((path) => !townPaths.includes(path));
  expect(lastTownIndex).toBeGreaterThanOrEqual(0);
  if (firstDestinationIndex >= 0) expect(lastTownIndex).toBeLessThan(firstDestinationIndex);
  assertNoErrors(errors);
});

test('Stamp Mill pilot is lazy, contract-valid, visual-only, and stays inside the frame-time gate', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  await installSeedAndWebglCounter(page);
  const errors = collectErrors(page);
  const modelRequests: string[] = [];
  page.on('request', (request) => { const url = new URL(request.url()); if (!url.search && url.pathname.includes(MODEL_MARKER) && url.pathname.endsWith('.glb')) modelRequests.push(request.url()); });

  await openTown(page);
  expect(await page.locator('canvas').getAttribute('data-town3d-pilot-state')).toBe('off');
  expect(await page.locator('canvas').getAttribute('data-town3d-pilot-render-source')).toBe('facade');
  const before = await measure(page);
  await shot(page, testInfo, 'before-facade');

  await openTown(page, '?town3dPilot=stamp-mill&tier=full');
  await page.waitForFunction(() => document.querySelector('canvas')?.dataset.town3dPilotState === 'loaded');
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 70);
  const canvas = page.locator('canvas');
  expect(await canvas.getAttribute('data-town3d-pilot-render-source')).toBe('glb');
  expect(Number(await canvas.getAttribute('data-town3d-pilot-meshes'))).toBe(1);
  expect(Number(await canvas.getAttribute('data-town3d-pilot-triangles'))).toBeLessThanOrEqual(15_000);
  expect(Number(await canvas.getAttribute('data-town3d-pilot-materials'))).toBe(1);
  expect((await canvas.getAttribute('data-town3d-pilot-bounds'))?.split('x').map(Number)).toEqual([5.953, 4.56, 1.6]);
  expect(new Set(modelRequests).size).toBe(1);
  const after = await measure(page);
  await shot(page, testInfo, 'after-glb');

  const evidence = {
    project: testInfo.project.name,
    camera: 'TS-04 locked Town camera at hero start',
    before,
    after,
    delta: {
      calls: after.calls - before.calls,
      webglCallsPerFrame: Number((after.webglCallsPerFrame - before.webglCallsPerFrame).toFixed(2)),
      trianglesPerFrame: after.trianglesPerFrame - before.trianglesPerFrame,
      p95Percent: Number((((after.p95Ms / before.p95Ms) - 1) * 100).toFixed(2)),
      p95Ratio: Number((after.p95Ms / before.p95Ms).toFixed(4)),
    },
  };
  await writeFile(path.join(ARTIFACT_DIR, `renderer-delta-${testInfo.project.name}.json`), `${JSON.stringify(evidence, null, 2)}\n`);
  expect(after.p95Ms, `p95 regression: ${JSON.stringify(evidence.delta)}`).toBeLessThanOrEqual(before.p95Ms * 1.15);

  await walkToMill(page);
  expect(await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)).toBe('stamp-mill');
  await page.getByTestId('town-exit').click();
  await expect(canvas).toHaveAttribute('data-town3d-pilot-state', 'disposed');
  assertNoErrors(errors);
});

test('LITE tier always keeps the Stamp Mill facade and never mounts the GLB', async ({ page }, testInfo) => {
  await installSeedAndWebglCounter(page);
  const errors = collectErrors(page);
  await openTown(page, '?town3dPilot=stamp-mill&tier=lite');
  await page.waitForTimeout(500);
  expect(await page.locator('canvas').getAttribute('data-town3d-pilot-state')).toBe('lite');
  expect(await page.locator('canvas').getAttribute('data-town3d-pilot-render-source')).toBe('facade');
  await shot(page, testInfo, 'lite-facade');
  assertNoErrors(errors);
});

test('a failed Stamp Mill GLB load preserves its facade and interaction', async ({ page }, testInfo) => {
  await installSeedAndWebglCounter(page);
  const errors = collectErrors(page);
  await page.route(/stamp-mill(?:[.-][^/?]+)?\.glb/, (route) => new URL(route.request().url()).search ? route.continue() : route.fulfill({ body: 'not a glb', contentType: 'model/gltf-binary' }));
  await openTown(page, '?town3dPilot=stamp-mill&tier=full');
  await page.waitForFunction(() => document.querySelector('canvas')?.dataset.town3dPilotState === 'error');
  expect(await page.locator('canvas').getAttribute('data-town3d-pilot-render-source')).toBe('facade');
  await shot(page, testInfo, 'load-failure-facade');
  await walkToMill(page);
  expect(await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)).toBe('stamp-mill');
  assertNoErrors(errors);
});

test('a pre-complete Stamp Mill never mounts its 3D model', async ({ page }) => {
  await installSeedAndWebglCounter(page, false);
  const errors = collectErrors(page);
  await openTown(page, '?town3dPilot=stamp-mill&tier=full');
  await page.waitForTimeout(500);
  expect(await page.locator('canvas').getAttribute('data-town3d-pilot-render-source')).toBe('facade');
  assertNoErrors(errors);
});

test('owner calibration view mounts the Stamp Mill beside the shipped Tavern and 2D cast', async ({ page }, testInfo) => {
  await installSeedAndWebglCounter(page);
  const errors = collectErrors(page);
  await openTown(page, '?town3dPilot=all&tier=full');
  await page.waitForFunction(() => document.querySelector('canvas')?.dataset.town3dPilotRenderSource === 'glb');
  await page.waitForTimeout(800);
  await shot(page, testInfo, 'owner-store-vs-tavern-and-cast');
  assertNoErrors(errors);
});

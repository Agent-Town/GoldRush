import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { FIRST_CLAIM_DONE_KEY, PROFILE_KEY, TOWN_NAME_KEY, profileDataKey } from '../src/game/ProfileStorage';

const ARTIFACT_DIR = path.resolve('artifacts/wire-town-plate');
const MODEL_MARKER = 'town-plate';

async function seedTown(page: Page): Promise<void> {
  await page.addInitScript(({ profile, town, meta, guide }) => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(profile, JSON.stringify({ version: 2, activeId: 'robin', profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }] }));
    localStorage.setItem(town, 'Quartz Hill');
    localStorage.setItem(meta, JSON.stringify({ version: 1, tracks: { territory: 3, science: 0, hero: 0, agent: 0 } }));
    localStorage.setItem(guide, '1');
  }, {
    profile: PROFILE_KEY,
    town: profileDataKey('robin', TOWN_NAME_KEY),
    meta: profileDataKey('robin', META_PROGRESS_KEY),
    guide: profileDataKey('robin', FIRST_CLAIM_DONE_KEY),
  });
  await page.goto('/?terrain2d');
}

async function openTown(page: Page, search = ''): Promise<void> {
  if (await page.evaluate(() => Boolean(window.__GR_TOWN_DIAGNOSTICS__)).catch(() => false)) {
    await page.getByTestId('town-exit').click();
    await page.getByTestId('start-menu-enter-town').waitFor();
  }
  await page.evaluate((value) => history.replaceState(null, '', `/${value}`), search);
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 40);
}

async function frameP95(page: Page): Promise<number> {
  return page.evaluate(() => new Promise<number>((resolve) => {
    const samples: number[] = [];
    let previous = performance.now();
    const tick = (now: number) => {
      samples.push(now - previous);
      previous = now;
      if (samples.length < 180) requestAnimationFrame(tick);
      else resolve(samples.sort((a, b) => a - b)[170]!);
    };
    requestAnimationFrame(tick);
  }));
}

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

test('Town plate is lazy, contract-valid, keeps actors planar, and mounts in the owner all-view', async ({ page }, testInfo: TestInfo) => {
  test.setTimeout(75_000);
  await seedTown(page);
  const errors = collectErrors(page);
  const requests: string[] = [];
  page.on('request', (request) => { if (request.url().includes(MODEL_MARKER) && request.url().includes('.glb')) requests.push(request.url()); });

  await openTown(page);
  const canvas = page.locator('canvas');
  await expect(canvas).toHaveAttribute('data-town3d-pilot-state', 'off');
  await expect(canvas).toHaveAttribute('data-town3d-plate-state', 'off');
  await expect(canvas).toHaveAttribute('data-town3d-plate-ground', 'painted');
  expect(requests).toEqual([]);
  const beforeP95 = await frameP95(page);

  await openTown(page, '?town3dPilot=plate&tier=full');
  await expect(canvas).toHaveAttribute('data-town3d-plate-state', 'loaded', { timeout: 15_000 });
  await expect(canvas).toHaveAttribute('data-town3d-plate-ground', 'glb');
  await expect(canvas).toHaveAttribute('data-town3d-pilot-render-source', 'glb');
  expect(Number(await canvas.getAttribute('data-town3d-pilot-meshes'))).toBe(1);
  expect(Number(await canvas.getAttribute('data-town3d-pilot-triangles'))).toBe(8_192);
  expect(Number(await canvas.getAttribute('data-town3d-pilot-materials'))).toBe(1);
  expect((await canvas.getAttribute('data-town3d-pilot-bounds'))?.split('x').map(Number)).toEqual([44, 2.958, 44]);
  expect(requests).toHaveLength(1);
  const afterP95 = await frameP95(page);
  expect(afterP95).toBeLessThanOrEqual(beforeP95 * 1.15);

  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(path.join(ARTIFACT_DIR, `renderer-delta-${testInfo.project.name}.json`), `${JSON.stringify({ beforeP95, afterP95, ratio: afterP95 / beforeP95 }, null, 2)}\n`);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-plate-only.png`), fullPage: true });

  await openTown(page, '?town3dPilot=all&tier=full');
  await expect(canvas).toHaveAttribute('data-town3d-plate-state', 'loaded', { timeout: 15_000 });
  await expect(canvas).toHaveAttribute('data-town3d-plate-ground', 'glb');
  await expect.poll(() => canvas.getAttribute('data-town3d-pilot-loaded-ids')).toContain('plate');
  const loopSamples: Array<{ elapsed: number; actor: { x: number; z: number } }> = [];
  for (let index = 0; index < 3; index += 1) {
    await page.waitForTimeout(800);
    loopSamples.push(await page.evaluate(() => {
      const diagnostics = window.__GR_TOWN_DIAGNOSTICS__!;
      return { elapsed: diagnostics.elapsed, actor: diagnostics.actors.find((actor) => actor.id === 'newsie')!.position };
    }));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-actor-ground-${index + 1}.png`), fullPage: true });
  }
  expect(new Set(loopSamples.map(({ actor }) => `${actor.x},${actor.z}`)).size).toBe(3);
  await writeFile(path.join(ARTIFACT_DIR, `actor-ground-${testInfo.project.name}.json`), `${JSON.stringify(loopSamples, null, 2)}\n`);

  await page.getByTestId('town-exit').click();
  await expect(canvas).toHaveAttribute('data-town3d-pilot-state', 'disposed');
  await expect(canvas).toHaveAttribute('data-town3d-plate-state', 'disposed');
  await expect(canvas).toHaveAttribute('data-town3d-plate-ground', 'painted');
  await expect(canvas).not.toHaveAttribute('data-town3d-pilot-loaded-ids', /plate/);
  expect(errors).toEqual([]);
});

test('LITE keeps painted ground and never fetches the Town plate', async ({ page }) => {
  await seedTown(page);
  const errors = collectErrors(page);
  const requests: string[] = [];
  page.on('request', (request) => { if (request.url().includes(MODEL_MARKER) && request.url().includes('.glb')) requests.push(request.url()); });
  await openTown(page, '?town3dPilot=plate&tier=lite');
  const canvas = page.locator('canvas');
  await expect(canvas).toHaveAttribute('data-town3d-pilot-state', 'lite');
  await expect(canvas).toHaveAttribute('data-town3d-plate-state', 'lite');
  await expect(canvas).toHaveAttribute('data-town3d-plate-ground', 'painted');
  expect(requests).toEqual([]);
  expect(errors).toEqual([]);
});

test('invalid Town plate bytes restore painted ground and dispose cleanly', async ({ page }) => {
  await seedTown(page);
  const errors = collectErrors(page);
  await page.route(/town-plate(?:-[^/?]+)?\.glb/, (route) => route.fulfill({ body: 'not a glb', contentType: 'model/gltf-binary' }));
  await openTown(page, '?town3dPilot=plate&tier=full');
  const canvas = page.locator('canvas');
  await expect(canvas).toHaveAttribute('data-town3d-pilot-state', 'failed');
  await expect(canvas).toHaveAttribute('data-town3d-plate-state', 'failed');
  await expect(canvas).toHaveAttribute('data-town3d-plate-ground', 'painted');
  await expect(canvas).toHaveAttribute('data-town3d-pilot-render-source', 'painted');
  await page.getByTestId('town-exit').click();
  await expect(canvas).toHaveAttribute('data-town3d-pilot-state', 'disposed');
  await expect(canvas).toHaveAttribute('data-town3d-plate-state', 'disposed');
  await expect(canvas).not.toHaveAttribute('data-town3d-pilot-loaded-ids', /plate/);
  expect(errors).toEqual([]);
});

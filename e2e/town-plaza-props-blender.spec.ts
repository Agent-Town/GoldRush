import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { FIRST_CLAIM_DONE_KEY, PROFILE_KEY, TOWN_NAME_KEY, profileDataKey } from '../src/game/ProfileStorage';
import { townPropRing } from '../src/town/townLayout';

const MODELS = ['covered_wagon', 'water_trough', 'pan_monument'];
const EXPECTED_INSTANCES = townPropRing.props.filter(({ kind }) => kind === 'covered_wagon' || kind === 'water_trough').length + 1;
const ARTIFACT_DIR = path.resolve('artifacts/town3d-plaza-props');

async function openTown(page: Page, search = '') {
  await page.addInitScript(({ profile, town, meta, guide }) => {
    localStorage.clear();
    localStorage.setItem(profile, JSON.stringify({ version: 2, activeId: 'robin', profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }] }));
    localStorage.setItem(town, 'Quartz Hill');
    localStorage.setItem(meta, JSON.stringify({ version: 1, tracks: { territory: 3, science: 0, hero: 0, agent: 0 } }));
    localStorage.setItem(guide, '1');
  }, { profile: PROFILE_KEY, town: profileDataKey('robin', TOWN_NAME_KEY), meta: profileDataKey('robin', META_PROGRESS_KEY), guide: profileDataKey('robin', FIRST_CLAIM_DONE_KEY) });
  await page.goto('/?terrain2d');
  await page.getByTestId('start-menu-enter-town').waitFor();
  if (search) await page.evaluate((value) => history.replaceState(null, '', `/${value}`), search);
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 40);
}

async function frameP95(page: Page) {
  return page.evaluate(() => new Promise<number>((resolve) => {
    const samples: number[] = [];
    let previous = performance.now();
    const tick = (now: number) => {
      samples.push(now - previous);
      previous = now;
      if (samples.length < 90) requestAnimationFrame(tick);
      else resolve(samples.sort((a, b) => a - b)[85]!);
    };
    requestAnimationFrame(tick);
  }));
}

test('plaza props stay lazy by default and mount every layout instance with one fetch per family', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => { if (MODELS.some((model) => request.url().includes(`${model}.glb`))) requests.push(request.url()); });
  await openTown(page);
  await expect(page.locator('canvas')).toHaveAttribute('data-town3d-pilot-state', 'off');
  expect(requests).toEqual([]);
  const beforeP95 = await frameP95(page);

  await page.getByTestId('town-exit').click();
  await page.getByTestId('start-menu-enter-town').waitFor();
  await page.evaluate(() => history.replaceState(null, '', '/?town3dPilot=props&tier=full'));
  await page.getByTestId('start-menu-enter-town').click();
  await expect(page.locator('canvas')).toHaveAttribute('data-town3d-pilot-state', 'loaded');
  await expect(page.locator('canvas')).toHaveAttribute('data-town3d-pilot-instances', String(EXPECTED_INSTANCES));
  expect(await frameP95(page)).toBeLessThanOrEqual(beforeP95 * 1.15);
  expect(requests).toHaveLength(3);
  for (const model of MODELS) expect(requests.filter((url) => url.includes(`${model}.glb`))).toHaveLength(1);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `owner-plaza-${test.info().project.name}.png`), fullPage: true });
});

test('LITE props make no model requests', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => { if (request.url().endsWith('.glb')) requests.push(request.url()); });
  await openTown(page, '?town3dPilot=props&tier=lite');
  await expect(page.locator('canvas')).toHaveAttribute('data-town3d-pilot-state', 'lite');
  expect(requests).toEqual([]);
});

test('invalid prop bytes preserve primitive fallback and disposal is clean', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route(/water_trough\.glb/, (route) => route.fulfill({ body: 'bad glb', contentType: 'model/gltf-binary' }));
  await openTown(page, '?town3dPilot=props&tier=full');
  await expect(page.locator('canvas')).toHaveAttribute('data-town3d-pilot-state', 'error');
  await expect(page.locator('canvas')).toHaveAttribute('data-town3d-pilot-render-source', 'facade');
  await page.getByTestId('town-exit').click();
  await expect(page.locator('canvas')).toHaveAttribute('data-town3d-pilot-state', 'disposed');
  expect(errors).toEqual([]);
});

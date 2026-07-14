import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { FIRST_CLAIM_DONE_KEY, PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';

const ARTIFACT_DIR = path.resolve('artifacts/town-era-switch');
const E2 = 'epoch-2-steamworks';
const E2_MODEL = /\/tavern\.e2\.glb(?:\?.*)?$/;
const BASE_MODEL = /\/town-v3-tavern(?:-[^/.]+)?\.glb(?:\?.*)?$/;

type Errors = { console: string[]; page: string[] };

async function seed(page: Page, epochId?: string): Promise<void> {
  await page.addInitScript(({ profileKey, townKey, metaKey, guideKey, epochKey, epoch }) => {
    Object.defineProperty(window, '__GR_TOWN_VARIANT_URLS__', {
      configurable: true,
      value: { '../../assets/pilots/tavern-3d/tavern.e2.glb': '/assets/pilots/tavern-3d/tavern.e2.glb' },
    });
    if (sessionStorage.getItem('town-era-seeded') === '1') return;
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem('town-era-seeded', '1');
    const state: ProfileState = {
      version: 2,
      activeId: 'robin',
      profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
    };
    localStorage.setItem(profileKey, JSON.stringify(state));
    localStorage.setItem(townKey, 'Quartz Hill');
    localStorage.setItem(metaKey, JSON.stringify({ version: 1, tracks: { territory: 3, science: 0, hero: 0, agent: 0 } }));
    localStorage.setItem(guideKey, '1');
    if (epoch) localStorage.setItem(epochKey, epoch);
  }, {
    profileKey: PROFILE_KEY,
    townKey: profileDataKey('robin', TOWN_NAME_KEY),
    metaKey: profileDataKey('robin', META_PROGRESS_KEY),
    guideKey: profileDataKey('robin', FIRST_CLAIM_DONE_KEY),
    epochKey: profileDataKey('robin', ACTIVE_EPOCH_KEY),
    epoch: epochId,
  });
}

function errors(page: Page): Errors {
  const found: Errors = { console: [], page: [] };
  page.on('console', (message) => { if (message.type() === 'error') found.console.push(message.text()); });
  page.on('pageerror', (error) => found.page.push(error.message));
  return found;
}

async function openTown(page: Page, search: string): Promise<void> {
  await page.goto(`/${search}`);
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => document.querySelector('canvas')?.dataset.town3dPilotState === 'loaded');
}

async function p95(page: Page): Promise<number> {
  return page.evaluate(async () => {
    const deltas: number[] = [];
    await new Promise<void>((resolve) => {
      let previous = performance.now();
      const tick = (now: number) => {
        deltas.push(now - previous);
        previous = now;
        if (deltas.length < 120) requestAnimationFrame(tick); else resolve();
      };
      requestAnimationFrame(tick);
    });
    return deltas.sort((left, right) => left - right)[Math.floor(deltas.length * 0.95)]!;
  });
}

async function fixture(): Promise<Buffer> {
  const encoded = await readFile(path.resolve('e2e/fixtures/town-era-e2.glb.b64'), 'utf8');
  return Buffer.from(encoded.trim(), 'base64');
}

async function shot(page: Page, info: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.locator('canvas').screenshot({ path: path.join(ARTIFACT_DIR, `${info.project.name}-${name}.png`) });
}

test('E1 mounts base only; E2 mounts its variant, shared anchor plumes, and era accent', async ({ page }, info) => {
  test.setTimeout(60_000);
  await seed(page);
  const found = errors(page);
  const requests: string[] = [];
  page.on('request', (request) => { if (request.url().includes('tavern') && request.url().includes('.glb')) requests.push(request.url()); });
  await page.route(E2_MODEL, async (route) => route.fulfill({ body: await fixture(), contentType: 'model/gltf-binary' }));

  await openTown(page, '?town3dPilot=tavern&tier=full');
  const canvas = page.locator('canvas');
  await expect(canvas).toHaveAttribute('data-town3d-pilot-era', '1');
  await expect(canvas).toHaveAttribute('data-town3d-steam-anchors', '0');
  await expect(canvas).toHaveAttribute('data-town-era-accent', '1');
  expect(requests.some((url) => E2_MODEL.test(url))).toBe(false);
  expect(requests.filter((url) => BASE_MODEL.test(url))).toHaveLength(1);
  const e1P95 = await p95(page);
  await shot(page, info, 'e1-town');

  await page.evaluate(({ key, epoch }) => localStorage.setItem(key, epoch), { key: profileDataKey('robin', ACTIVE_EPOCH_KEY), epoch: E2 });
  await openTown(page, '?town3dPilot=tavern&tier=full');
  await expect(canvas).toHaveAttribute('data-town3d-pilot-era', '2');
  await expect(canvas).toHaveAttribute('data-town3d-steam-anchors', '1');
  await expect(canvas).toHaveAttribute('data-town3d-steam-plumes', '2');
  await expect(canvas).toHaveAttribute('data-town-era-accent', '2');
  expect(requests.filter((url) => E2_MODEL.test(url))).toHaveLength(1);
  const e2P95 = await p95(page);
  expect(e2P95).toBeLessThanOrEqual(e1P95 * 1.15);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(path.join(ARTIFACT_DIR, `p95-${info.project.name}.json`), `${JSON.stringify({ e1P95, e2P95, ratio: e2P95 / e1P95 }, null, 2)}\n`);
  await shot(page, info, 'e2-town-steaming');
  expect(found).toEqual({ console: [], page: [] });
});

test('a missing E2 sibling falls back to base without errors', async ({ page }) => {
  await seed(page, E2);
  const found = errors(page);
  const requests: string[] = [];
  page.on('request', (request) => { if (request.url().includes('tavern') && request.url().includes('.glb')) requests.push(request.url()); });
  await page.route(E2_MODEL, (route) => route.fulfill({ body: '', contentType: 'model/gltf-binary' }));
  await openTown(page, '?town3dPilot=tavern&tier=full');
  const canvas = page.locator('canvas');
  await expect(canvas).toHaveAttribute('data-town3d-pilot-era', '1');
  await expect(canvas).toHaveAttribute('data-town3d-steam-anchors', '0');
  expect(requests.map((url) => E2_MODEL.test(url) ? 'e2' : BASE_MODEL.test(url) ? 'base' : 'other')).toEqual(['e2', 'base']);
  expect(found).toEqual({ console: [], page: [] });
});

test('LITE keeps facades and never fetches models or mounts plumes', async ({ page }) => {
  await seed(page, E2);
  const found = errors(page);
  const requests: string[] = [];
  page.on('request', (request) => { if (request.url().includes('.glb')) requests.push(request.url()); });
  await page.goto('/?town3dPilot=tavern&tier=lite');
  await page.getByTestId('start-menu-enter-town').click();
  const canvas = page.locator('canvas');
  await expect(canvas).toHaveAttribute('data-town3d-pilot-state', 'lite');
  await expect(canvas).toHaveAttribute('data-town3d-pilot-render-source', 'facade');
  await expect(canvas).not.toHaveAttribute('data-town3d-steam-plumes', /[1-9]/);
  expect(requests).toEqual([]);
  expect(found).toEqual({ console: [], page: [] });
});

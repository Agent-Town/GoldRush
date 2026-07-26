import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { FIRST_CLAIM_DONE_KEY, PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import {
  HERO_SKIN_STORAGE_KEY,
  HERO_SKINS_OWNED_STORAGE_KEY,
  PROSPECTOR_SKIN_STORAGE_KEY,
  PROSPECTOR_SKINS_OWNED_STORAGE_KEY,
  type ProspectorSkin,
} from '../src/game/ProspectorSkin';

const TOKEN = 'cosmetic-grants-test-token';
const SHOT_DIR = path.resolve('artifacts/cosmetic-grants');
let worker: ChildProcessWithoutNullStreams;
let workerURL: string;

test.describe.configure({ mode: 'serial' });

test.beforeAll(async ({}, workerInfo) => {
  const mobile = workerInfo.project.name === 'mobile-chrome';
  const port = mobile ? 8817 : 8816;
  const inspectorPort = mobile ? 9237 : 9236;
  const persistPath = `test-results/cosmetic-grants-worker-${workerInfo.project.name}`;
  workerURL = `http://127.0.0.1:${port}`;
  await rm(persistPath, { recursive: true, force: true });
  worker = spawn(
    'wrangler',
    [
      'pages',
      'dev',
      'public',
      '--kv',
      'TELEMETRY',
      '--binding',
      `BUG_OFFICE_TOKEN=${TOKEN}`,
      '--port',
      String(port),
      '--inspector-port',
      String(inspectorPort),
      '--ip',
      '127.0.0.1',
      '--persist-to',
      persistPath,
      '--log-level',
      'error',
      '--show-interactive-dev-session=false',
    ],
    { stdio: 'pipe' },
  );
  await waitForWorker(workerURL, worker);
});

test.afterAll(async () => {
  if (!worker || worker.exitCode !== null) return;
  worker.kill('SIGTERM');
  await Promise.race([
    new Promise<void>((resolve) => worker.once('exit', () => resolve())),
    new Promise<void>((resolve) => setTimeout(resolve, 2_000)),
  ]);
});

test("a filed complaint grants, equips, and persists the Reporter's Set", async ({ page }, testInfo) => {
  await seedTown(page);
  const errors = collectErrors(page);
  await page.route('**/api/bug-report', (route) =>
    route.fulfill({ status: 201, contentType: 'application/json', body: '{"ok":true,"id":"coat-42"}' }),
  );

  await openDesk(page);
  await page.getByTestId('complaint-description').fill('The claim marker slipped under the county line.');
  await page.getByTestId('complaint-submit').click();
  await expect(page.getByTestId('complaint-status')).toContainText(
    "The Reporter's Set is yours: the Complainant's Coat and the Claim-Day Neckerchief.",
  );
  await expect.poll(() => selectedSkin(page)).toBe('complainant');
  await expect.poll(() => selectedHeroSkin(page)).toBe('claim-day');
  await shot(page, testInfo, 'grant');

  await page.reload();
  await page.getByTestId('start-menu-settings').click();
  await expect(page.getByTestId('start-menu-prospector-skin')).toHaveCount(0);
  await page.getByTestId('start-menu-settings-close').click();
  await openWardrobe(page);
  const picker = page.getByTestId('wardrobe-prospector-skin');
  await expect(picker).toHaveValue('complainant');
  await expect(picker.locator('option')).toHaveText(['Stock Coat', "The Complainant's Coat"]);
  await expect(page.getByTestId('wardrobe-hero-skin')).toHaveValue('claim-day');
  await expect(page.getByTestId('wardrobe-hero-skin').locator('option')).toHaveText(['Stock Neckerchief', 'Claim-Day Neckerchief']);
  await picker.scrollIntoViewIfNeeded();
  await shot(page, testInfo, 'wardrobe');
  expect(errors).toEqual({ console: [], page: [] });
});

test('a live prize stub grants gilded once through the Wrangler worker', async ({ page }) => {
  const code = `GR-${['A1B2C3', 'D4E5F6', '102938', 'ABCDEF'].join('-')}`;
  const unauthorized = await fetch(`${workerURL}/api/redeem`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ codes: [code] }),
  });
  expect(unauthorized.status).toBe(404);
  const oversized = await fetch(`${workerURL}/api/redeem`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ code, padding: 'x'.repeat(2_048) }),
  });
  expect(oversized.status).toBe(400);
  await expect(oversized.json()).resolves.toMatchObject({ ok: false, error: 'bad_payload' });
  const tooMany = await fetch(`${workerURL}/api/redeem`, {
    method: 'POST',
    headers: { authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json' },
    body: JSON.stringify({ codes: Array.from({ length: 21 }, () => code) }),
  });
  expect(tooMany.status).toBe(400);
  await expect(tooMany.json()).resolves.toMatchObject({ ok: false, error: 'bad_payload' });
  await mint(code);
  await seedTown(page);
  await proxyRedeem(page);
  const errors = collectErrors(page);

  await openDesk(page);
  await page.getByTestId('prize-stub-code').fill(code.toLowerCase());
  await page.getByTestId('prize-stub-redeem').click();
  await expect(page.getByTestId('complaint-status')).toHaveText('The clerk stamps the stub. The Gilded Coat is yours.');
  await expect.poll(() => selectedSkin(page)).toBe('gilded');

  const spent = await fetch(`${workerURL}/api/redeem`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  expect(spent.status).toBe(200);
  await expect(spent.json()).resolves.toMatchObject({ ok: true, skin: 'gilded' });
  expect(errors).toEqual({ console: [], page: [] });
});

test('a bad prize stub is declined in-world', async ({ page }) => {
  await seedTown(page);
  await proxyRedeem(page);
  const errors = collectErrors(page);

  await openDesk(page);
  await page.getByTestId('prize-stub-code').fill('GR-000000-000000-000000-000000');
  await page.getByTestId('prize-stub-redeem').click();
  await expect(page.getByTestId('complaint-status')).toContainText('This one is no county prize.');
  await expect.poll(() => selectedSkin(page)).toBe('stock');
  expect(errors).toEqual({ console: [], page: [] });
});

test('a named coat falls back to the stock sheet while its art is absent', async ({ page }) => {
  await seedTown(page, 'complainant');
  const errors = collectErrors(page);
  await openTown(page);
  await expect.poll(() => page.locator('#game-canvas').getAttribute('data-prospector-skin')).toBe('complainant');
  await expect.poll(() => page.locator('#game-canvas').getAttribute('data-prospector-sheet')).toBe('stock');
  expect(errors).toEqual({ console: [], page: [] });
});

async function seedTown(page: Page, skin?: ProspectorSkin): Promise<void> {
  await page.addInitScript(({ keys, selected }) => {
    if (localStorage.getItem(keys.profile)) return;
    localStorage.clear();
    sessionStorage.clear();
    const state: ProfileState = {
      version: 2,
      activeId: 'robin',
      profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
    };
    localStorage.setItem(keys.profile, JSON.stringify(state));
    localStorage.setItem(keys.town, 'Quartz Hill');
    localStorage.setItem(keys.meta, JSON.stringify({ version: 1, tracks: { territory: 3, science: 0, hero: 0, agent: 0 } }));
    localStorage.setItem(keys.guide, '1');
    if (selected) {
      localStorage.setItem(keys.skin, selected);
      localStorage.setItem(keys.owned, JSON.stringify(['stock', selected]));
    }
  }, {
    keys: {
      profile: PROFILE_KEY,
      town: profileDataKey('robin', TOWN_NAME_KEY),
      meta: profileDataKey('robin', META_PROGRESS_KEY),
      guide: profileDataKey('robin', FIRST_CLAIM_DONE_KEY),
      skin: profileDataKey('robin', PROSPECTOR_SKIN_STORAGE_KEY),
      owned: profileDataKey('robin', PROSPECTOR_SKINS_OWNED_STORAGE_KEY),
      heroSkin: profileDataKey('robin', HERO_SKIN_STORAGE_KEY),
      heroOwned: profileDataKey('robin', HERO_SKINS_OWNED_STORAGE_KEY),
    },
    selected: skin,
  });
}

async function openWardrobe(page: Page): Promise<void> {
  await openTown(page);
  await page.evaluate(() => {
    const town = window.__GR_TOWN_DIAGNOSTICS__!;
    town.teleport(town.tailorWagon.approach.x, town.tailorWagon.approach.z);
  });
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)).toBe('tailor-wagon');
  await page.getByTestId('town-open-wardrobe').click();
  await expect(page.getByTestId('wardrobe-view')).toBeVisible();
}

async function openTown(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 20);
}

async function openDesk(page: Page): Promise<void> {
  await openTown(page);
  await page.evaluate(() => {
    const town = window.__GR_TOWN_DIAGNOSTICS__!;
    const target = town.buildings.find((building) => building.id === 'assay_office')!.approach;
    town.teleport(target.x, target.z);
  });
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)).toBe('assay_office');
  await page.getByTestId('town-open-assay').click();
  await expect(page.getByTestId('complaint-thumbnail')).toHaveAttribute('src', /^data:image\/jpeg;base64,/);
}

async function selectedSkin(page: Page): Promise<string | null> {
  return page.evaluate((key) => localStorage.getItem(key) ?? 'stock', PROSPECTOR_SKIN_STORAGE_KEY);
}

async function selectedHeroSkin(page: Page): Promise<string | null> {
  return page.evaluate((key) => localStorage.getItem(key) ?? 'stock', HERO_SKIN_STORAGE_KEY);
}

async function mint(code: string): Promise<void> {
  const response = await fetch(`${workerURL}/api/redeem`, {
    method: 'POST',
    headers: { authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json' },
    body: JSON.stringify({ codes: [code] }),
  });
  expect(response.status).toBe(201);
}

async function proxyRedeem(page: Page): Promise<void> {
  await page.route('**/api/redeem', async (route) => {
    const request = route.request();
    const response = await fetch(`${workerURL}/api/redeem`, {
      method: request.method(),
      headers: { 'content-type': await request.headerValue('content-type') ?? 'application/json' },
      body: request.postData(),
    });
    await route.fulfill({
      status: response.status,
      contentType: response.headers.get('content-type') ?? 'application/json',
      body: await response.text(),
    });
  });
}

function collectErrors(page: Page): { console: string[]; page: string[] } {
  const errors = { console: [] as string[], page: [] as string[] };
  page.on('console', (message) => { if (message.type() === 'error') errors.console.push(message.text()); });
  page.on('pageerror', (error) => errors.page.push(error.message));
  return errors;
}

async function shot(page: Page, testInfo: TestInfo, state: string): Promise<void> {
  await mkdir(SHOT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(SHOT_DIR, `${testInfo.project.name}-${state}.png`), fullPage: true });
}

async function waitForWorker(origin: string, child: ChildProcessWithoutNullStreams): Promise<void> {
  const deadline = Date.now() + 20_000;
  let output = '';
  child.stdout.on('data', (chunk) => { output += chunk; });
  child.stderr.on('data', (chunk) => { output += chunk; });
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Wrangler exited early (${child.exitCode}).\n${output}`);
    try {
      await fetch(`${origin}/api/redeem`);
      return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  child.kill('SIGTERM');
  throw new Error(`Wrangler did not start.\n${output}`);
}

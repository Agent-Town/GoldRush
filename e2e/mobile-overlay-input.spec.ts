import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { probeOverlayInput, type OverlayProbeRow } from './helpers/mobile-overlay-probe';

const SHOT_DIR = path.resolve('reviews/shots-mobile-overlay');
const SCHOOLHOUSE = { x: -8.2, z: 5.4 };

type Errors = { console: string[]; page: string[] };

function watchErrors(page: Page): Errors {
  const errors: Errors = { console: [], page: [] };
  page.on('console', (message) => message.type() === 'error' && errors.console.push(message.text()));
  page.on('pageerror', (error) => errors.page.push(error.message));
  return errors;
}

async function seedProfile(page: Page, townName?: string): Promise<void> {
  await page.addInitScript(({ profileKey, townKey, name }) => {
    if (sessionStorage.getItem('mobile-overlay-seeded') === '1') return;
    localStorage.clear();
    sessionStorage.clear();
    const state: ProfileState = {
      version: 2,
      activeId: 'robin',
      profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
    };
    localStorage.setItem(profileKey, JSON.stringify(state));
    if (name) localStorage.setItem(townKey, name);
    sessionStorage.setItem('mobile-overlay-seeded', '1');
  }, { profileKey: PROFILE_KEY, townKey: profileDataKey('robin', TOWN_NAME_KEY), name: townName });
}

async function enterTown(page: Page): Promise<void> {
  await page.goto('/?tier=lite');
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
}

async function walkToSchoolhouse(page: Page): Promise<void> {
  for (let step = 0; step < 48; step += 1) {
    if ((await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)) === 'schoolhouse') return;
    const position = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.player ?? { x: 0, z: 0 });
    const keys: string[] = [];
    if (Math.abs(SCHOOLHOUSE.x - position.x) > 0.6) keys.push(SCHOOLHOUSE.x > position.x ? 'KeyD' : 'KeyA');
    if (Math.abs(SCHOOLHOUSE.z - position.z) > 0.6) keys.push(SCHOOLHOUSE.z > position.z ? 'KeyS' : 'KeyW');
    for (const key of keys) await page.keyboard.down(key);
    await page.waitForTimeout(160);
    for (const key of keys.reverse()) await page.keyboard.up(key);
  }
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)).toBe('schoolhouse');
}

async function openRun(page: Page, seed: string, extra = ''): Promise<void> {
  await page.goto(`/?debug&nowaves&seed=${seed}${extra}`);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  if (await page.getByTestId('contract-briefing-dismiss').isVisible()) await page.getByTestId('contract-briefing-dismiss').click();
  await page.evaluate(() => window.__GR_GUI__?.hide());
}

async function openLevelUp(page: Page): Promise<void> {
  for (let press = 0; press < 8; press += 1) {
    await page.keyboard.press('KeyX');
    await page.waitForTimeout(120);
    if ((await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.runState)) === 'levelup') break;
  }
  await expect(page.getByTestId('upgrade-overlay')).toBeVisible();
}

async function forceDeath(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('enemy.contactDamage', 999);
    window.__GR_TEST__?.teleport(0, 12);
    window.__GR_TEST__?.spawnPack(1, 0.1, { speedScale: 0 });
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.runState), { timeout: 8_000 }).toBe('dead');
}

async function shot(page: Page, project: string, name: string): Promise<void> {
  if (project !== 'mobile-chrome') return;
  await mkdir(SHOT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(SHOT_DIR, name), fullPage: false });
}

function assertClean(rows: OverlayProbeRow[], errors: Errors): void {
  const violations = rows.filter((row) => !row.allowed);
  expect(violations, JSON.stringify(rows, null, 2)).toEqual([]);
  expect(errors).toEqual({ console: [], page: [] });
}

test('town overlays leave the world interactive outside their visible cards', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  await seedProfile(page);
  const errors = watchErrors(page);
  const rows: OverlayProbeRow[] = [];

  await enterTown(page);
  await expect(page.getByTestId('town-name-card')).toBeVisible();
  rows.push(...(await probeOverlayInput(page, 'town name-card open')).rows);
  await shot(page, testInfo.project.name, 'town-namecard-390.png');

  const canvasReceivedPointer = await page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
    if (!canvas) return false;
    (window as unknown as { __overlayCanvasPointer?: boolean }).__overlayCanvasPointer = false;
    canvas.addEventListener('pointerdown', () => {
      (window as unknown as { __overlayCanvasPointer?: boolean }).__overlayCanvasPointer = true;
    }, { once: true });
    return true;
  });
  expect(canvasReceivedPointer).toBe(true);
  const viewport = page.viewportSize()!;
  await page.mouse.click(viewport.width * 0.25, viewport.height * 0.25);
  const canvasSmoke = await page.evaluate(() => (window as unknown as { __overlayCanvasPointer?: boolean }).__overlayCanvasPointer);

  await page.getByTestId('town-name-input').fill('Quartz Hill');
  await page.getByTestId('town-name-submit').click();
  await expect(page.getByTestId('town-name-card')).toBeHidden();
  rows.push(...(await probeOverlayInput(page, 'town idle')).rows);

  await walkToSchoolhouse(page);
  await page.getByTestId('town-open-schoolhouse').click();
  await expect(page.getByTestId('research-chart')).toBeVisible();
  rows.push(...(await probeOverlayInput(page, 'research chart open')).rows);

  assertClean(rows, errors);
  expect(canvasSmoke).toBe(true);
});

test('run overlays only own the viewport while their modal is open', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  const errors = watchErrors(page);
  const rows: OverlayProbeRow[] = [];

  await openRun(page, 'mobile-overlay-hud');
  rows.push(...(await probeOverlayInput(page, 'run HUD idle')).rows);
  await shot(page, testInfo.project.name, 'run-hud-390.png');

  await page.getByTestId('hud-build').click();
  await expect(page.getByTestId('hud-build-menu')).toBeVisible();
  rows.push(...(await probeOverlayInput(page, 'build menu open')).rows);
  await page.keyboard.press('Escape');

  await openLevelUp(page);
  rows.push(...(await probeOverlayInput(page, 'level-up choice open', 'upgrade-overlay')).rows);
  await shot(page, testInfo.project.name, 'levelup-390.png');

  await openRun(page, 'mobile-overlay-death', '&nolevel');
  await forceDeath(page);
  await expect(page.getByTestId('death-overlay')).toBeVisible();
  rows.push(...(await probeOverlayInput(page, 'death overlay open', 'death-overlay')).rows);

  await openRun(page, 'mobile-overlay-ledger', '&nolevel');
  await page.route('**/api/stats*', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true,"empty":true}' }));
  await page.evaluate(async () => {
    const ledger = (await Function('return import("/src/encyclopedia/events.ts")')()) as typeof import('../src/encyclopedia/events');
    ledger.requestOpenClaimLedger();
  });
  await expect(page.getByTestId('claim-ledger')).toBeVisible();
  rows.push(...(await probeOverlayInput(page, 'claim ledger open', 'claim-ledger')).rows);

  assertClean(rows, errors);
});

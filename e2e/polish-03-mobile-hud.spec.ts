import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type Rect = { x: number; y: number; width: number; height: number };

const SHOT_DIR = path.resolve('reviews/shots-polish-03');

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openGame(page: Page, seed: string): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.addInitScript((key) => {
    localStorage.setItem(key, JSON.stringify({ version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: 1 } }));
  }, META_PROGRESS_KEY);
  await page.goto(`/?debug&timescale=8&nowaves&nokill&seed=${seed}`);
  await page.addStyleTag({ content: '.lil-gui, .dg.ac { display: none !important; }' });
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const briefingDismiss = page.getByTestId('contract-briefing-dismiss');
  if (await briefingDismiss.isVisible().catch(() => false)) {
    await briefingDismiss.tap();
    await expect(page.getByTestId('contract-briefing')).toBeHidden();
  }
  await page.evaluate(() => window.__GR_TEST__?.grantGold(1_000));
  return errors;
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  mkdirSync(SHOT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(SHOT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: false });
}

function intersects(a: Rect | null, b: Rect | null): boolean {
  if (!a || !b) return false;
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

async function box(locator: Locator): Promise<Rect | null> {
  return locator.boundingBox();
}

async function expectTarget(locator: Locator): Promise<void> {
  const rect = await box(locator);
  expect(rect).not.toBeNull();
  if (!rect) return;
  expect(rect.width).toBeGreaterThanOrEqual(44);
  expect(rect.height).toBeGreaterThanOrEqual(44);
}

async function expectInViewport(page: Page, locator: Locator): Promise<void> {
  const rect = await box(locator);
  const viewport = page.viewportSize();
  expect(rect).not.toBeNull();
  expect(viewport).not.toBeNull();
  if (!rect || !viewport) return;
  expect(rect.x).toBeGreaterThanOrEqual(0);
  expect(rect.y).toBeGreaterThanOrEqual(0);
  expect(rect.x + rect.width).toBeLessThanOrEqual(viewport.width + 1);
  expect(rect.y + rect.height).toBeLessThanOrEqual(viewport.height + 1);
}

async function expectNoOverlap(locators: Locator[]): Promise<void> {
  const rects = await Promise.all(locators.map((locator) => box(locator)));
  for (let i = 0; i < rects.length; i += 1) {
    for (let j = i + 1; j < rects.length; j += 1) {
      expect(intersects(rects[i], rects[j]), `${i} overlaps ${j}`).toBe(false);
    }
  }
}

async function expectClearOf(target: Locator, blockers: Locator[]): Promise<void> {
  const targetBox = await box(target);
  expect(targetBox).not.toBeNull();
  for (const blocker of blockers) {
    expect(intersects(targetBox, await box(blocker))).toBe(false);
  }
}

async function checkViewport(page: Page, testInfo: TestInfo, width: number, height: number): Promise<ErrorBucket> {
  await page.setViewportSize({ width, height });
  const errors = await openGame(page, `polish-03-${width}`);
  await page.evaluate(() => window.__GR_TEST__?.teleport(0, 9));
  const controls = [
    page.getByTestId('hud-build'),
    page.locator('#rotate-button'),
    page.locator('#weapon-toggle-button'),
    page.locator('#confirm-button'),
    page.getByTestId('hud-pause'),
    page.getByTestId('hud-agent'),
  ];

  for (const control of controls) await expectTarget(control);
  await expectNoOverlap([
    page.getByTestId('hud-xp'),
    page.getByTestId('hud-weapon'),
    page.getByTestId('hud-pause'),
    page.getByTestId('hud-build-panel'),
    page.locator('#touch-stick'),
    page.locator('#rotate-button'),
    page.locator('#weapon-toggle-button'),
    page.locator('#confirm-button'),
    page.getByTestId('world-info-note'),
  ]);
  await shot(page, testInfo, `${width}-hud`);

  await page.getByTestId('hud-build').tap();
  await expect(page.getByTestId('hud-build-menu')).toBeVisible();
  await expectClearOf(page.getByTestId('hud-build-menu'), [
    page.getByTestId('hud-xp'),
    page.getByTestId('hud-weapon'),
    page.getByTestId('hud-pause'),
    page.locator('#touch-stick'),
    page.locator('#rotate-button'),
    page.locator('#weapon-toggle-button'),
    page.locator('#confirm-button'),
    page.getByTestId('world-info-note'),
  ]);
  await shot(page, testInfo, `${width}-build-menu`);

  await page.getByTestId('hud-build-tile-palisade').tap();
  const beforeRotation = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostRotationSteps ?? 0);
  await page.locator('#rotate-button').tap();
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostRotationSteps ?? 0)).toBe(
    (beforeRotation + 1) % 4,
  );
  const beforePalisades = await page.evaluate(
    () => window.__THREE_GAME_DIAGNOSTICS__?.build.buildables.find((entry) => entry.id === 'palisade')?.count ?? 0,
  );
  await page.locator('#confirm-button').tap();
  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.buildables.find((entry) => entry.id === 'palisade')?.count ?? 0))
    .toBe(beforePalisades + 1);
  await page.getByTestId('hud-build').tap();
  await expect(page.getByTestId('hud-build-menu')).toBeHidden();

  const beforeWeapon = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.arsenal.active ?? 'rig');
  await page.locator('#weapon-toggle-button').tap();
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.arsenal.active ?? 'rig')).not.toBe(beforeWeapon);

  for (let press = 0; press < 8; press += 1) {
    await page.keyboard.press('KeyX');
    await page.waitForTimeout(120);
    if ((await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.runState)) === 'levelup') break;
  }
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.runState)).toBe('levelup');
  await expect(page.getByTestId('upgrade-overlay')).toBeVisible();
  for (const card of await page.getByTestId('upgrade-overlay').locator('button').all()) await expectInViewport(page, card);
  await shot(page, testInfo, `${width}-upgrade-cards`);
  for (let choice = 0; choice < 8; choice += 1) {
    if ((await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.runState)) === 'playing') break;
    await page.keyboard.press('Digit1');
    await page.waitForTimeout(120);
  }
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.runState)).toBe('playing');
  await expect(page.getByTestId('upgrade-overlay')).toBeHidden();

  await page.getByTestId('hud-pause').tap();
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.paused ?? false)).toBe(true);
  await page.getByTestId('hud-pause').tap();
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.paused ?? true)).toBe(false);

  await page.evaluate(() => {
    window.__GR_AGENT__?.collectGold();
    window.__GR_AGENT__?.panAt('mobile-layout-seam');
  });
  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.agent.stub?.receiptFeed.length ?? 0))
    .toBeGreaterThan(0);
  await page.getByTestId('hud-agent').tap();
  await expect(page.getByTestId('prospector-panel')).toBeVisible();
  const receipts = page.getByTestId('prospector-receipts-wrap');
  await expect(receipts).toBeVisible();
  await expect(receipts).not.toHaveAttribute('open', '');
  await expectTarget(receipts.locator('summary'));
  await receipts.locator('summary').tap();
  await expect(receipts).toHaveAttribute('open', '');
  const receiptCount = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.agent.stub?.receiptFeed.length ?? 0);
  await page.evaluate(() => window.__GR_AGENT__?.panAt('mobile-layout-receipts-open'));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.agent.stub?.receiptFeed.length ?? 0)).toBeGreaterThan(receiptCount);
  await expect(receipts).toHaveAttribute('open', '');
  await expect(receipts.getByTestId('prospector-receipts')).toBeVisible();
  await receipts.scrollIntoViewIfNeeded();
  await shot(page, testInfo, `${width}-receipts-expanded`);
  await page.getByLabel('Close Prospector ledger').tap();
  return errors;
}

test('mobile HUD controls fit, tap, and avoid overlap at 390px and 430px', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chrome', 'mobile HUD layout pass runs on the mobile project');
  test.setTimeout(45_000);

  const errors390 = await checkViewport(page, testInfo, 390, 844);
  expect(errors390.consoleErrors).toEqual([]);
  expect(errors390.pageErrors).toEqual([]);

  const errors430 = await checkViewport(page, testInfo, 430, 932);
  expect(errors430.consoleErrors).toEqual([]);
  expect(errors430.pageErrors).toEqual([]);
});

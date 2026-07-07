import { mkdirSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

test.setTimeout(45_000);

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function setAgentLevel(page: Page, level: number): Promise<void> {
  await page.addInitScript(
    ({ key, agentLevel }) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          version: 1,
          tracks: { territory: 0, science: 0, hero: 0, agent: agentLevel },
        }),
      );
    },
    { key: META_PROGRESS_KEY, agentLevel: level },
  );
}

async function openGame(page: Page, query: string): Promise<ErrorBucket> {
  expect(query).not.toContain('debug');
  const errors = collectErrors(page);
  await page.goto(`/${query}`);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function saveShot(page: Page, name: string): Promise<void> {
  mkdirSync('artifacts/m4-07-panel', { recursive: true });
  await page.screenshot({ path: `artifacts/m4-07-panel/${name}.png`, fullPage: true });
}

async function openPanelWithG(page: Page): Promise<void> {
  await page.keyboard.press('KeyG');
  await expect(page.getByTestId('prospector-panel')).toBeVisible();
  await expect(page.getByTestId('hud-agent')).toHaveAttribute('aria-expanded', 'true');
}

async function receiptCount(page: Page): Promise<number> {
  return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.agent.stub?.receiptCount ?? 0);
}

test('G, Esc, chip, and outside tap control the panel without pausing the run', async ({ page }, testInfo) => {
  await setAgentLevel(page, 1);
  const errors = await openGame(page, '?timescale=4&nolevel&seed=m4-07-panel-open');
  const chip = page.getByTestId('hud-agent');
  const panel = page.getByTestId('prospector-panel');

  await openPanelWithG(page);
  if (testInfo.project.name.includes('desktop')) await saveShot(page, 'panel-open-desktop');
  const atOpen = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0);
  await page.waitForTimeout(450);
  const later = await page.evaluate(() => ({
    timeAlive: window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0,
    paused: window.__THREE_GAME_DIAGNOSTICS__?.paused ?? true,
  }));
  expect(later.timeAlive).toBeGreaterThan(atOpen);
  expect(later.paused).toBe(false);

  await page.keyboard.press('KeyG');
  await expect(panel).toBeHidden();
  await expect(chip).toHaveAttribute('aria-expanded', 'false');

  await chip.click();
  await expect(panel).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.paused ?? true), { timeout: 1_000 })
    .toBe(false);

  await openPanelWithG(page);
  await page.mouse.click(8, 8);
  await expect(panel).toBeHidden();
  await expect(chip).toHaveAttribute('aria-expanded', 'false');
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('ladder renders earned toggles, unearned hints, and current abilities', async ({ page }) => {
  await setAgentLevel(page, 1);
  const errors = await openGame(page, '?nowaves&nolevel&seed=m4-07-ladder');

  await openPanelWithG(page);
  await expect(page.locator('[data-testid^="prospector-rung-"][data-earned]')).toHaveCount(4);
  await expect(page.locator('[data-testid^="prospector-rung-toggle-"]')).toHaveCount(2);
  await expect(page.getByTestId('prospector-rung-2')).toContainText('Earned at agent level 2');
  await expect(page.getByTestId('prospector-rung-3')).toContainText('Claim victories grow the trust track');
  await expect(page.getByTestId('prospector-ability-auto_collect')).toBeVisible();
  await expect(page.getByTestId('prospector-ability-auto_repair')).toHaveCount(0);

  await page.getByTestId('prospector-rung-toggle-1').uncheck();
  await expect(page.getByTestId('prospector-ability-auto_collect').locator('xpath=..')).toHaveAttribute('data-allowed', 'false');
  await expect(page.locator('[data-testid="prospector-rung-toggle-2"]')).toHaveCount(0);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('auto-collect consent halts and resumes behavior, with stacked newest-first receipts', async ({ page }, testInfo) => {
  await setAgentLevel(page, 1);
  const errors = await openGame(page, '?stress=3&timescale=12&nolevel&seed=m4-07-consent');

  await openPanelWithG(page);
  await page.getByTestId('prospector-ability-auto_collect').uncheck();
  if (testInfo.project.name.includes('desktop')) await saveShot(page, 'revoked-ability-state');
  const before = await receiptCount(page);
  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.xpAudit.motesSpawned ?? 0), { timeout: 12_000 })
    .toBeGreaterThan(0);
  await page.waitForTimeout(1_200);
  expect(await receiptCount(page)).toBe(before);

  await page.getByTestId('prospector-ability-auto_collect').check();
  await expect
    .poll(() => receiptCount(page), { timeout: 14_000 })
    .toBeGreaterThan(before);
  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.agent.stub?.lastReceiptTool ?? null), {
      timeout: 2_000,
    })
    .toBe('et.goldrush.collect_xp');
  await expect
    .poll(() => page.getByTestId('prospector-receipts').locator('li').count(), { timeout: 14_000 })
    .toBeGreaterThanOrEqual(2);

  const lines = await page.getByTestId('prospector-receipts').locator('li').allTextContents();
  const times = lines.slice(0, 2).map((line) => {
    const [mm, ss] = line.slice(0, 5).split(':').map(Number);
    return mm * 60 + ss;
  });
  expect(times[0]).toBeGreaterThanOrEqual(times[1]);
  if (testInfo.project.name.includes('desktop')) await saveShot(page, 'receipts-stack');
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('mobile chip tap opens a full-width bottom sheet with a 44px close target', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('mobile'), 'mobile bottom sheet check');
  await setAgentLevel(page, 1);
  const errors = await openGame(page, '?nowaves&nolevel&seed=m4-07-mobile');

  await page.getByTestId('hud-agent').click();
  const panel = page.getByTestId('prospector-panel');
  await expect(panel).toBeVisible();
  await saveShot(page, 'panel-open-mobile');
  const viewport = page.viewportSize();
  const panelBox = await panel.boundingBox();
  const closeBox = await panel.locator('[data-prospector-close]').boundingBox();
  expect(panelBox?.width ?? 0).toBeGreaterThanOrEqual((viewport?.width ?? 390) - 2);
  expect(closeBox?.width ?? 0).toBeGreaterThanOrEqual(44);
  expect(closeBox?.height ?? 0).toBeGreaterThanOrEqual(44);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

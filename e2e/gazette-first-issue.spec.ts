import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

const ARTIFACT_DIR = path.resolve('artifacts/gg-03c-herald-dev-path');
const PANEL_IDS = ['claim-goal', 'seams-gold', 'the-works', 'the-arms', 'freeing-fevered', 'town-serves'] as const;
const PANEL_HEADLINES = [
  'THE CLAIM AND THE GOAL',
  'SEAMS GIVE GOLD',
  'THE WORKS',
  'THE ARMS',
  'FREEING THE FEVERED',
  'THE TOWN SERVES YOU',
] as const;

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

function collectErrors(page: Page): ErrorBucket {
  const errors: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  return errors;
}

async function createProfile(page: Page, name: string): Promise<void> {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.goto('/');
  await page.getByTestId('profile-name-input').fill(name);
  await page.getByTestId('profile-create').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
}

async function expectFirstIssue(page: Page): Promise<void> {
  await expect(page.getByTestId('gazette-first-issue')).toBeVisible();
  await expect(page.getByTestId('gazette-panel')).toHaveCount(6);
  expect(await page.getByTestId('gazette-panel').evaluateAll((panels) => panels.map((panel) => panel.getAttribute('data-panel-id')))).toEqual(PANEL_IDS);
  for (const [index, headline] of PANEL_HEADLINES.entries()) {
    const panel = page.getByTestId('gazette-panel').filter({ has: page.getByRole('heading', { name: headline }) });
    const engraving = panel.getByTestId('gazette-panel-engraving');
    await expect(page.getByRole('heading', { name: headline })).toBeVisible();
    await expect(engraving).toBeVisible();
    expect(await engraving.evaluate((image: HTMLImageElement) => image.src)).toContain(`gazette-panel-${PANEL_IDS[index]}`);
    await expect.poll(() => engraving.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  }
  await expect(page.getByTestId('gazette-first-issue')).toContainText('victims, never villains');
}

async function screenshot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: true });
}

test('fresh profile gets the pinned first issue badge and can reopen it', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  await createProfile(page, 'June');

  const badge = page.getByTestId('town-herald-badge');
  await expect(badge).toBeVisible();
  await expect(badge).toHaveAttribute('data-unread', 'true');
  await screenshot(page, testInfo, 'badge');

  await badge.click();
  await expectFirstIssue(page);
  await expect(badge).toHaveAttribute('data-unread', 'false');
  await screenshot(page, testInfo, 'open-issue');
  if (testInfo.project.name === 'mobile-chrome') await screenshot(page, testInfo, '390px');

  await page.getByTestId('claim-herald-close').click();
  await badge.click();
  await expectFirstIssue(page);
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

test('mandatory welcome opens issue one only on the first town entry', async ({ page }) => {
  const errors = collectErrors(page);
  await createProfile(page, 'Mina');

  await page.getByTestId('town-name-input').fill('Sunrise Bend');
  await page.getByTestId('town-name-submit').click();
  await expect(page.getByTestId('story-beat-card')).toHaveAttribute('data-beat-id', 'founding-welcome');
  await page.mouse.click(6, 6);
  await expect(page.getByTestId('town-bark-card')).toHaveAttribute('data-first-claim', 'true');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-welcome-phase="delivery"]')).toBeVisible();
  await page.getByTestId('town-welcome-take-paper').click();
  await expectFirstIssue(page);
  await page.getByTestId('claim-herald-close').click();
  await page.getByTestId('town-welcome-skip').click();
  await page.getByTestId('town-exit').click();
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);

  await expect(page.getByTestId('claim-herald')).toHaveCount(0);
  await expect(page.getByTestId('town-herald-badge')).toHaveAttribute('data-unread', 'false');
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

const ARTIFACT_DIR = path.resolve('artifacts/gazette-first-issue');
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

async function createProfile(page: Page, greenhorn: boolean): Promise<void> {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.goto('/');
  if (greenhorn) await page.getByLabel('Yes - ease me onto the trail').check();
  await page.getByTestId('profile-name-input').fill(greenhorn ? 'Mina' : 'June');
  await page.getByTestId('profile-create').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
}

async function expectFirstIssue(page: Page): Promise<void> {
  await expect(page.getByTestId('gazette-first-issue')).toBeVisible();
  await expect(page.getByTestId('gazette-panel')).toHaveCount(6);
  expect(await page.getByTestId('gazette-panel').evaluateAll((panels) => panels.map((panel) => panel.getAttribute('data-panel-id')))).toEqual(PANEL_IDS);
  for (const headline of PANEL_HEADLINES) {
    await expect(page.getByRole('heading', { name: headline })).toBeVisible();
  }
  await expect(page.getByTestId('gazette-first-issue')).toContainText('victims, never villains');
}

async function screenshot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: true });
}

test('fresh profile gets the pinned first issue badge and can reopen it', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  await createProfile(page, false);

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

test('greenhorn offer opens issue one only on the first town entry', async ({ page }) => {
  const errors = collectErrors(page);
  await createProfile(page, true);

  await expectFirstIssue(page);
  await page.getByTestId('claim-herald-close').click();
  await page.getByTestId('town-name-input').fill('Sunrise Bend');
  await page.getByTestId('town-name-submit').click();
  await page.getByTestId('town-exit').click();
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);

  await expect(page.getByTestId('claim-herald')).toHaveCount(0);
  await expect(page.getByTestId('town-herald-badge')).toHaveAttribute('data-unread', 'false');
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

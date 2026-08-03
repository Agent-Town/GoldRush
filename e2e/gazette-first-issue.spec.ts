import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { HERO_INPUT_BINDINGS } from '../src/core/InputController';
import { greenhornGazetteControlCopy } from '../src/news/greenhornGazette';

const ARTIFACT_DIR = path.resolve('artifacts/gg-04-gazette-controls');
const PANEL_IDS = ['claim-goal', 'seams-gold', 'the-works', 'the-arms', 'freeing-fevered', 'town-serves', 'prospectors-hands'] as const;
const PANEL_HEADLINES = [
  'THE CLAIM AND THE GOAL',
  'SEAMS GIVE GOLD',
  'THE WORKS',
  'THE ARMS',
  'FREEING THE FEVERED',
  'THE TOWN SERVES YOU',
  "THE PROSPECTOR'S HANDS",
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

async function expectFirstIssue(page: Page, projectName: string): Promise<void> {
  await expect(page.getByTestId('gazette-first-issue')).toBeVisible();
  await expect(page.getByTestId('gazette-panel')).toHaveCount(7);
  expect(await page.getByTestId('gazette-panel').evaluateAll((panels) => panels.map((panel) => panel.getAttribute('data-panel-id')))).toEqual(PANEL_IDS);
  for (const [index, headline] of PANEL_HEADLINES.entries()) {
    const panel = page.getByTestId('gazette-panel').filter({ has: page.getByRole('heading', { name: headline }) });
    const engraving = panel.getByTestId('gazette-panel-engraving');
    await expect(page.getByRole('heading', { name: headline })).toBeVisible();
    await expect(engraving).toBeVisible();
    expect(await engraving.evaluate((image: HTMLImageElement) => image.src)).toContain(`gazette-panel-${PANEL_IDS[index] === 'prospectors-hands' ? 'the-arms' : PANEL_IDS[index]}`);
    await expect.poll(() => engraving.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  }
  await expect(page.getByTestId('gazette-first-issue')).toContainText('victims, never villains');
  const controls = page.locator('[data-panel-id="prospectors-hands"]');
  const arms = page.locator('[data-panel-id="the-arms"]');
  const works = page.locator('[data-panel-id="the-works"]');
  if (projectName === 'mobile-chrome') {
    await expect(page.locator('[data-input-mode="touch"]')).toBeVisible();
    await expect(controls).toContainText('Touch Stick');
    await expect(controls).toContainText('Weapon Toggle');
    await expect(controls).toContainText('Build');
    await expect(controls).not.toContainText(/\bQ\b|\bB\b/);
    await expect(arms).toContainText('Weapon Toggle');
    await expect(works).toContainText('Build');
    await expect(page.getByTestId('gazette-first-issue')).not.toContainText(/\bQ\b|\bB\b/);
  } else {
    await expect(page.locator('[data-input-mode="keyboard"]')).toBeVisible();
    await expect(controls).toContainText(/\bQ\b/);
    await expect(controls).toContainText(/\bB\b/);
    await expect(arms).toContainText(/\bQ\b/);
    await expect(works).toContainText(/\bB\b/);
  }
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
  await expectFirstIssue(page, testInfo.project.name);
  await expect(badge).toHaveAttribute('data-unread', 'false');
  await screenshot(page, testInfo, 'open-issue');
  if (testInfo.project.name === 'mobile-chrome') await screenshot(page, testInfo, '390px');
  await page.locator('[data-panel-id="prospectors-hands"]').scrollIntoViewIfNeeded();
  await screenshot(page, testInfo, 'controls');

  await page.getByTestId('claim-herald-close').click();
  await badge.click();
  await expectFirstIssue(page, testInfo.project.name);
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

test('mandatory welcome opens issue one only on the first town entry', async ({ page }, testInfo) => {
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
  await expectFirstIssue(page, testInfo.project.name);
  await page.getByTestId('claim-herald-close').click();
  await page.getByTestId('town-welcome-skip').click();
  await page.getByTestId('town-exit').click();
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);

  await expect(page.getByTestId('claim-herald')).toHaveCount(0);
  await expect(page.getByTestId('town-herald-badge')).toHaveAttribute('data-unread', 'false');
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

test('control copy follows renamed source bindings', () => {
  const mutableBindings = HERO_INPUT_BINDINGS as unknown as {
    weaponToggle: string[];
    build: string[];
  };
  const originalWeapon = mutableBindings.weaponToggle[0];
  const originalBuild = mutableBindings.build[0];
  mutableBindings.weaponToggle[0] = 'KeyV';
  mutableBindings.build[0] = 'KeyN';
  try {
    const copy = greenhornGazetteControlCopy('keyboard');
    const text = [copy.works, copy.arms, ...copy.hands].join(' ');
    expect(text).toContain('V hurls the Blast Charge');
    expect(text).toContain('N opens Build');
    expect(text).not.toMatch(/\bQ\b|\bB\b/);
  } finally {
    mutableBindings.weaponToggle[0] = originalWeapon;
    mutableBindings.build[0] = originalBuild;
  }
});

import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { PROFILE_KEY, type ProfileState } from '../src/game/ProfileStorage';
import { GAME_API_ORIGIN } from '../src/app/GameApi';
import { TELEMETRY_DEV_SEND_STORAGE_KEY, TELEMETRY_OPT_IN_STORAGE_KEY } from '../src/telemetry/payload';
import { COUNTY_STANDING_RULE } from '../site/standing-rule.js';

const SHOTS = path.resolve('reviews/shots-standing-formula-explained');
const PROFILE: ProfileState = {
  version: 2,
  activeId: 'robin',
  profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'greenhorn', hintsSeen: ['story:first-contract'] }],
};

test('a secured score screen explains the county rank and stays readable at each viewport', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(({ profileKey, profile, optIn, devSend }) => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(profileKey, JSON.stringify(profile));
    localStorage.setItem(optIn, '1');
    localStorage.setItem(devSend, '1');
  }, { profileKey: PROFILE_KEY, profile: PROFILE, optIn: TELEMETRY_OPT_IN_STORAGE_KEY, devSend: TELEMETRY_DEV_SEND_STORAGE_KEY });
  await page.route(`${GAME_API_ORIGIN}/api/standings**`, (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ ok: true, stored: true, rank: 2, decidedBy: 'gold' }),
  }));
  await page.route('**/api/telemetry', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }));

  await page.goto('/?contract=the-claim&timescale=100&nolevel&nokill');
  await expect(page.getByTestId('claim-secured')).toBeVisible({ timeout: 20_000 });
  await page.getByTestId('bank-secured-claim').click();

  const standing = page.getByTestId('county-standing');
  await expect(standing).toBeVisible();
  await expect(page.getByTestId('county-standing-score')).toContainText('Wave 10');
  await expect(page.getByTestId('county-standing-answer')).toHaveText('County rank #2. The row above leads on gold at the goal.');
  await expect(page.getByTestId('county-standing-rule')).toHaveText(COUNTY_STANDING_RULE);
  await expect(standing).toHaveCSS('overflow', 'visible');
  await mkdir(SHOTS, { recursive: true });
  await standing.scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(SHOTS, `${testInfo.project.name}.png`) });
  expect(errors).toEqual([]);
});

test('a secured snapshot survives reload and remains the score-screen standing', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(({ profileKey, profile, optIn, devSend }) => {
    if (sessionStorage.getItem('standing-resume-init')) return;
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem('standing-resume-init', '1');
    localStorage.setItem(profileKey, JSON.stringify(profile));
    localStorage.setItem(optIn, '1');
    localStorage.setItem(devSend, '1');
  }, { profileKey: PROFILE_KEY, profile: PROFILE, optIn: TELEMETRY_OPT_IN_STORAGE_KEY, devSend: TELEMETRY_DEV_SEND_STORAGE_KEY });
  await page.route(`${GAME_API_ORIGIN}/api/standings**`, (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ ok: true, stored: true, rank: null }),
  }));
  await page.route('**/api/telemetry', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }));

  const url = '/?debug&contract=the-claim&timescale=100&nolevel&nokill';
  await page.goto(url);
  await expect(page.getByTestId('claim-secured')).toBeVisible({ timeout: 20_000 });
  const before = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.run.securedSnapshot);
  expect(before).not.toBeNull();
  const saved = await page.evaluate(() => window.__GR_TEST__!.captureSuspend());
  await page.reload();
  await page.waitForFunction(() => window.__GR_TEST__ !== undefined);
  expect(await page.evaluate((snapshot) => window.__GR_TEST__!.restoreSuspend(snapshot), saved)).toBe(true);
  await expect(page.getByTestId('claim-secured')).toBeVisible();
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.run.securedSnapshot)).toEqual(before);
  await page.getByTestId('bank-secured-claim').click();
  await expect(page.getByTestId('county-standing-score')).toContainText(`Wave ${before!.waves} · ${before!.gold} gold`);
  expect(errors).toEqual([]);
});

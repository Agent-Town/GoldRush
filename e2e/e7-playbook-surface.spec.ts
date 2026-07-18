import { expect, test, type Page } from '@playwright/test';
import { Balance } from '../src/game/Balance';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { profileDataKey } from '../src/game/ProfileStorage';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

function collectErrors(page: Page): ErrorBucket {
  const errors: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => message.type() === 'error' && errors.consoleErrors.push(message.text()));
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  return errors;
}

async function open(page: Page, epoch: string): Promise<void> {
  await page.goto(`/?debug&epoch=${epoch}&contract=the-claim&nowaves&nolevel&nopause&seed=e7-playbook-surface`);
  await page.waitForFunction(() => Boolean(window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__));
  const briefing = page.getByTestId('contract-briefing');
  if (await briefing.isVisible()) await page.getByTestId('contract-briefing-dismiss').click();
}

async function setAgentLevel(page: Page, level: number): Promise<void> {
  await page.addInitScript(
    ({ key, agentLevel }) => localStorage.setItem(key, JSON.stringify({
      version: 1,
      tracks: { territory: 0, science: 0, hero: 0, agent: agentLevel },
    })),
    { key: META_PROGRESS_KEY, agentLevel: level },
  );
}

test('the tape drawer arms at the Signal Era and remains inherited afterward', async ({ page }) => {
  const errors = collectErrors(page);
  await page.addInitScript(
    ({ key }) => localStorage.setItem(key, 'epoch-7-signal'),
    { key: profileDataKey('robin', ACTIVE_EPOCH_KEY) },
  );
  await open(page, 'epoch-6-atomic');
  await expect(page.getByTestId('playbook-toggle')).toHaveCount(0);

  await open(page, 'epoch-7-signal');
  await expect(page.getByTestId('playbook-toggle')).toBeVisible();

  await open(page, 'epoch-8-orbital');
  await expect(page.getByTestId('playbook-toggle')).toBeVisible();

  await page.goto('/?contract=the-claim&nowaves&nolevel&nopause');
  await expect(page.getByTestId('playbook-toggle')).toBeVisible();
  expect(await page.evaluate(() => window.__GR_TEST__)).toBeUndefined();
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

test('record, name, shelf, and replay use the profile tape store and the slaved rig actor', async ({ page }) => {
  const errors = collectErrors(page);
  await setAgentLevel(page, Balance.e7Playbook.requiredPermissionLevel);
  await open(page, 'epoch-7-signal');
  await page.getByTestId('playbook-toggle').click();
  await expect(page.getByTestId('playbook-library')).toBeVisible();
  await expect(page.getByTestId('playbook-shelf')).toContainText('The drawer is empty');

  await page.getByTestId('playbook-name').pressSequentially('Morning Round');
  await expect(page.getByTestId('playbook-name')).toHaveValue('Morning Round');
  await page.getByTestId('playbook-record').click();
  await expect(page.getByTestId('playbook-library')).toBeHidden();
  await expect(page.getByTestId('playbook-record')).toHaveText('Save Tape');
  await page.keyboard.down('KeyD');
  await page.waitForTimeout(350);
  await page.keyboard.up('KeyD');
  await page.getByTestId('playbook-toggle').click();
  await expect(page.getByTestId('playbook-message')).toContainText('Recording Morning Round');
  await page.getByTestId('playbook-toggle').click();
  await page.keyboard.press('KeyP');
  await expect(page.locator('#hud')).toHaveAttribute('data-paused', 'true');
  const pausedTicks = await page.evaluate(() => window.__GR_TEST__!.playbook.status().recording!.ticks);
  await page.waitForTimeout(250);
  expect(await page.evaluate(() => window.__GR_TEST__!.playbook.status().recording!.ticks)).toBe(pausedTicks);
  await page.keyboard.press('KeyP');
  await expect(page.locator('#hud')).toHaveAttribute('data-paused', 'false');
  await page.getByTestId('playbook-toggle').click();
  await page.getByTestId('playbook-record').click();

  await expect(page.getByTestId('playbook-shelf')).toContainText('Morning Round');
  await expect(page.getByTestId('playbook-message')).toContainText('shelved');
  const stored = await page.evaluate(() => ({
    tapes: window.__GR_TEST__!.playbook.list(),
    keys: Object.keys(localStorage).filter((key) => key.includes('gr.playbooks.v1')),
  }));
  expect(stored.tapes.some((tape) => tape.name === 'Morning Round' && tape.entries > 0)).toBe(true);
  expect(stored.keys).toHaveLength(1);
  expect(stored.keys[0]).not.toBe('gr.playbooks.v1');
  expect(stored.keys[0]).toContain('gr.profile.v2.');

  await page.getByTestId('playbook-toggle').click();
  await page.getByTestId('hud-agent').click();
  await page.getByTestId('prospector-rung-toggle-2').uncheck();
  await page.keyboard.press('Escape');
  await page.getByTestId('playbook-toggle').click();
  await page.getByTestId('playbook-shelf').getByRole('button', { name: 'Replay' }).click();
  await expect(page.getByTestId('playbook-message')).toContainText('permission-level-2-required');

  await page.getByTestId('playbook-toggle').click();
  await page.getByTestId('hud-agent').click();
  await page.getByTestId('prospector-rung-toggle-2').check();
  await page.keyboard.press('Escape');
  await page.getByTestId('playbook-toggle').click();
  await page.getByTestId('playbook-shelf').getByRole('button', { name: 'Replay' }).click();
  await expect(page.getByTestId('playbook-message')).toContainText('handed to the agent');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e7Arsenal.playbookSlaved)).toBe(true);
  await page.getByTestId('playbook-toggle').click();
  await page.keyboard.press('KeyP');
  await expect(page.locator('#hud')).toHaveAttribute('data-paused', 'true');
  const pausedReplayTick = await page.evaluate(() => window.__GR_TEST__!.playbook.status().replay!.tick);
  await page.waitForTimeout(250);
  expect(await page.evaluate(() => window.__GR_TEST__!.playbook.status().replay!.tick)).toBe(pausedReplayTick);
  await page.keyboard.press('KeyP');
  await expect(page.locator('#hud')).toHaveAttribute('data-paused', 'false');
  await page.getByTestId('hud-agent').click();
  await page.getByTestId('prospector-rung-toggle-2').uncheck();
  await page.keyboard.press('Escape');
  await expect.poll(() => page.evaluate(() => window.__GR_TEST__!.playbook.status().replay!.stopped)).toBe(true);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e7Arsenal.playbookSlaved)).toBe(false);

  expect(stored.tapes.length).toBeLessThanOrEqual(Balance.e7Playbook.shelfCapacity);
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

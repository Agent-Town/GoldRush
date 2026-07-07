import { mkdirSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { Balance } from '../src/game/Balance';
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

async function setAgentTrack(page: Page, agent: number): Promise<void> {
  await page.addInitScript(
    ({ key, agentTrack }) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          version: 1,
          tracks: { territory: 0, science: 0, hero: 0, agent: agentTrack },
        }),
      );
    },
    { key: META_PROGRESS_KEY, agentTrack: agent },
  );
}

async function openGame(page: Page, query: string): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/${query}`);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function openDebugGame(page: Page, query: string): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/${query}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function openPanel(page: Page): Promise<void> {
  await page.keyboard.press('KeyG');
  await expect(page.getByTestId('prospector-panel')).toBeVisible();
}

async function saveShot(page: Page, name: string): Promise<void> {
  mkdirSync('artifacts/agent-rung-clarity', { recursive: true });
  await page.screenshot({ path: `artifacts/agent-rung-clarity/${name}.png`, fullPage: true });
}

async function setBalance(page: Page, path: string, value: number): Promise<void> {
  await expect(page.evaluate(([key, next]) => window.__GR_TEST__?.setBalance(key, next), [path, value] as const)).resolves.toBe(
    true,
  );
}

async function stageSecureRun(page: Page): Promise<void> {
  await setBalance(page, 'enemy.contactDamage', 0);
  await setBalance(page, 'waves.waveInterval', 999);
  await setBalance(page, 'waves.trickleInterval', 9999);
  await setBalance(page, 'waves.pulseBase', 1);
  await setBalance(page, 'waves.pulsePerWave', 0);
  await setBalance(page, 'waves.pulsesPerWave', 1);
  await setBalance(page, 'waves.edgesPerPulse', 1);
  await page.evaluate(() => window.__GR_TEST__?.resetRun());
}

async function triggerSecureWave(page: Page): Promise<void> {
  await setBalance(page, 'waves.waveInterval', 0.1);
  await page.evaluate((wave) => window.__GR_TEST__?.setWave(wave), Balance.run.secureWave - 1);
}

async function forceDeath(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('enemy.contactDamage', 999);
    window.__GR_TEST__?.spawnPack(5, 0.35);
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.runState), { timeout: 12_000 }).toBe('dead');
  await expect(page.getByTestId('death-overlay')).toBeVisible();
}

test('rung 0 panel shows the canonical ladder, progress, and blocked repair reason', async ({ page }, testInfo) => {
  await setAgentTrack(page, 0.6);
  const errors = await openGame(page, '?nowaves&nolevel&seed=agent-rung-0');

  await openPanel(page);
  await expect(page.getByTestId('prospector-autonomy')).toHaveText(
    'Autonomy: 0.6 / 1.0 — secured claims advance the Prospector',
  );
  await expect(page.getByTestId('prospector-rung-0')).toHaveAttribute('data-current', 'true');
  await expect(page.getByTestId('prospector-rung-0')).toContainText('suggest-only');
  await expect(page.getByTestId('prospector-rung-1')).toContainText('approval-required');
  await expect(page.getByTestId('prospector-rung-1')).toContainText('acts with your approval — repairs, pickups');
  await expect(page.getByTestId('prospector-rung-2')).toContainText('trusted-routine');
  await expect(page.getByTestId('prospector-rung-2')).toContainText('routine work unattended');
  await expect(page.getByTestId('prospector-rung-3')).toContainText('autonomous-within-budget');
  await expect(page.getByTestId('prospector-rung-3')).toContainText('spends within a budget');
  await expect(page.getByTestId('prospector-ability-auto_collect')).toContainText('needs approval-required (rung 1)');
  await expect(page.getByTestId('prospector-ability-auto_repair')).toContainText('needs approval-required (rung 1)');
  await expect(page.getByTestId('prospector-ability-auto_pan')).toHaveCount(0);
  await saveShot(page, testInfo.project.name.includes('mobile') ? 'panel-rung0-390' : 'panel-rung0-desktop');

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('rung 1 panel highlights approval-required and keeps earned controls readable', async ({ page }) => {
  await setAgentTrack(page, 1);
  const errors = await openGame(page, '?nowaves&nolevel&seed=agent-rung-1');

  await openPanel(page);
  await expect(page.getByTestId('prospector-autonomy')).toHaveText(
    'Autonomy: 1.0 / 2.0 — secured claims advance the Prospector',
  );
  await expect(page.getByTestId('prospector-rung-0')).toHaveAttribute('data-current', 'false');
  await expect(page.getByTestId('prospector-rung-1')).toHaveAttribute('data-current', 'true');
  await expect(page.getByTestId('prospector-rung-toggle-1')).toBeVisible();
  await expect(page.getByTestId('prospector-ability-auto_collect')).toBeVisible();
  await expect(page.getByTestId('prospector-ability-auto_repair')).toBeVisible();

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('run-only policy slot bonus is named beside base autonomy progress', async ({ page }) => {
  await setAgentTrack(page, 0.6);
  const errors = await openDebugGame(page, '?debug&nowaves&nolevel&seed=agent-rung-schooling');
  await page.evaluate(() => window.__GR_TEST__?.setUpgradeStacks({ prospector_policy_slot: 1 }));
  await expect.poll(() => page.evaluate(() => window.__GR_AGENT__?.state.permissionLevel ?? 0)).toBe(1);
  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.ui?.agent?.policySlotBonus ?? 0))
    .toBe(1);

  await openPanel(page);
  await expect(page.getByTestId('prospector-rung-1')).toHaveAttribute('data-current', 'true');
  await expect(page.getByTestId('prospector-autonomy')).toHaveText(
    'Autonomy: 0.6 / 1.0 (+1 policy slot this run) — secured claims advance the Prospector',
  );

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('run ledger only adds Prospector growth when agent autonomy moved', async ({ page }) => {
  const noMoveErrors = await openDebugGame(page, '?debug&nowaves&nolevel&seed=agent-rung-no-move');
  await forceDeath(page);
  await expect(page.getByTestId('agent-autonomy-ledger')).toHaveCount(0);
  expect(noMoveErrors.consoleErrors).toEqual([]);
  expect(noMoveErrors.pageErrors).toEqual([]);
});

test('secured run ledger names the Prospector autonomy gain', async ({ page }) => {
  await setAgentTrack(page, 0.4);
  const errors = await openDebugGame(page, '?debug&timescale=100&nolevel&seed=agent-rung-ledger');
  await setBalance(page, 'meta.victoryPayout.agent', 0.2);
  await stageSecureRun(page);
  await triggerSecureWave(page);

  await expect(page.getByTestId('claim-office')).toBeVisible({ timeout: 12_000 });
  await page.getByTestId('bank-secured-claim').click();
  await expect(page.getByTestId('stake-again')).toBeVisible();
  await expect(page.getByTestId('agent-autonomy-ledger')).toHaveText('The Prospector grew: autonomy 0.4 → 0.6');

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('secured run ledger does not advertise autonomy past the max rung', async ({ page }) => {
  await setAgentTrack(page, 3.1);
  const errors = await openDebugGame(page, '?debug&timescale=100&nolevel&seed=agent-rung-maxed');
  await setBalance(page, 'meta.victoryPayout.agent', 0.2);
  await stageSecureRun(page);
  await triggerSecureWave(page);

  await expect(page.getByTestId('claim-office')).toBeVisible({ timeout: 12_000 });
  await page.getByTestId('bank-secured-claim').click();
  await expect(page.getByTestId('stake-again')).toBeVisible();
  await expect(page.getByTestId('agent-autonomy-ledger')).toHaveCount(0);

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

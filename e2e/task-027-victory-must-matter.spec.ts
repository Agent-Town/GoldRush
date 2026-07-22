import { expect, test, type Page } from '@playwright/test';
import { Balance } from '../src/game/Balance';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { SCOREBOARD_KEY, profileDataKey } from '../src/game/ProfileStorage';

const META_STORAGE_KEY = profileDataKey('robin', META_PROGRESS_KEY);
const SCORE_STORAGE_KEY = profileDataKey('robin', SCOREBOARD_KEY);

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openGame(page: Page, query: string): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.addInitScript(
    ({ keys }) => {
      for (const key of keys) {
        localStorage.removeItem(key);
      }
    },
    {
      keys: [
        META_PROGRESS_KEY,
        SCOREBOARD_KEY,
        META_STORAGE_KEY,
        SCORE_STORAGE_KEY,
      ],
    },
  );
  await page.goto(`/${query}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 2);
  return errors;
}

async function killHero(page: Page): Promise<void> {
  await setBalance(page, 'enemy.contactDamage', 999);
  await page.evaluate((radius) => {
    window.__GR_TEST__?.spawnPack(1, radius, { speedScale: 0 });
    window.__GR_TEST__?.teleport(0, 12 - radius);
  }, 0.1);
}

async function readJson<T>(page: Page, key: string, fallback: string): Promise<T> {
  return page.evaluate(
    ([storageKey, missing]) => JSON.parse(localStorage.getItem(storageKey) ?? missing),
    [key, fallback] as const,
  ) as Promise<T>;
}

async function finishSecuredLedger(page: Page): Promise<void> {
  await expect(page.getByTestId('stake-again')).toBeVisible();
  await page.getByTestId('run-secondary-action').click();
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.paused ?? true)).toBe(false);
}

async function setBalance(page: Page, path: string, value: number): Promise<void> {
  await expect(page.evaluate(([key, next]) => window.__GR_TEST__?.setBalance(key, next), [path, value] as const)).resolves.toBe(
    true,
  );
}

async function secureClaim(page: Page): Promise<number> {
  await setBalance(page, 'enemy.contactDamage', 0);
  await page.evaluate(() => window.__GR_TEST__?.resetRun());
  const secureWave = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.secureWave ?? 0);
  await page.evaluate((wave) => window.__GR_TEST__?.startWaveForTest(wave), secureWave);
  return secureWave;
}

test('real victory pays meta, opens Claim Office, and tier one changes the next claim', async ({ page }) => {
  const errors = await openGame(page, '?debug&nolevel&seed=task-027-victory');
  const secureWave = await secureClaim(page);

  await expect(page.getByTestId('claim-office')).toBeVisible({ timeout: 12_000 });
  await expect(page.getByTestId('claim-payout-territory')).toContainText('+1');
  await expect(page.getByTestId('claim-payout-science')).toContainText('+1');
  await expect(page.getByTestId('claim-payout-hero')).toContainText('+1');
  await expect(page.getByTestId('claim-payout-agent')).toContainText('+1');
  await expect(page.getByTestId('territory-tier-one')).toContainText('palisade ring');
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'artifacts/task-027-payout.png', fullPage: true });

  const meta = await readJson<{ tracks: Record<string, number> }>(page, META_STORAGE_KEY, 'null');
  expect(meta.tracks).toMatchObject({ territory: 1, science: 1, hero: 1, agent: 1 });
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.run.meta?.tracks.territory ?? 0)).toBeGreaterThan(0);

  await setBalance(page, 'waves.waveInterval', 999);
  await page.getByTestId('bank-secured-claim').click();
  await expect(page.getByTestId('claim-secured')).toBeHidden();
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wave ?? -1)).toBe(0);
  await finishSecuredLedger(page);

  await expect
    .poll(() =>
      page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.hp.filter((entry) => entry.id === 'palisade').length ?? 0),
    )
    .toBe(Balance.meta.territoryRing.length);
  const palisades = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.hp.filter((entry) => entry.id === 'palisade') ?? []);
  for (const palisade of palisades) {
    expect(palisade.hp).toBe(palisade.maxHp);
    expect(palisade.wrecked).toBe(false);
  }

  const scores = await readJson<Array<{ secured?: boolean; waves?: number }>>(page, SCORE_STORAGE_KEY, '[]');
  expect(scores.some((row: { secured?: boolean; waves?: number }) => row.secured === true && row.waves === secureWave)).toBe(
    true,
  );

  await killHero(page);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.runState), { timeout: 8_000 }).toBe('dead');
  await expect(page.getByTestId('best-claim-row').first()).toContainText('SECURED');

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

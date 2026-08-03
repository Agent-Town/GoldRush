import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { Balance } from '../src/game/Balance';
import type { EconomyEvent } from '../src/game/Economy';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { RUN_SUSPEND_KEY } from '../src/game/ProfileStorage';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

const ARTIFACT_DIR = path.resolve('artifacts/territory-kit');
const KIT_SIZE = Balance.meta.territoryRing.length;
const PALISADE_SITES = [
  ...[-6, -3, 0, 3, 6].map((x) => ({ x, z: 12 })),
  ...[-6, -3, 0, 3].map((x) => ({ x, z: 8 })),
];

function collectErrors(page: Page): ErrorBucket {
  const errors: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  return errors;
}

async function dismissBriefing(page: Page): Promise<void> {
  const briefing = page.getByTestId('contract-briefing');
  if (await briefing.isVisible()) await page.getByTestId('contract-briefing-dismiss').click();
  await expect(briefing).toBeHidden();
}

async function openGame(page: Page, territory: number, seed: string): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.addInitScript(
    ({ key, steps, sessionKey }) => {
      if (sessionStorage.getItem(sessionKey)) return;
      localStorage.clear();
      localStorage.setItem(key, JSON.stringify({ version: 1, tracks: { territory: steps, science: 0, hero: 0, agent: 0 } }));
      sessionStorage.setItem(sessionKey, '1');
    },
    { key: META_PROGRESS_KEY, steps: territory, sessionKey: `territory-kit:${seed}` },
  );
  await page.goto(`/?debug&nowaves&nolevel&nopause&seed=${seed}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 4);
  await dismissBriefing(page);
  return errors;
}

async function placePalisade(page: Page, position: { x: number; z: number }): Promise<void> {
  const placed = await page.evaluate(({ x, z }) => {
    window.__GR_TEST__?.teleport(x, z + 2);
    window.__GR_TEST__?.selectBuildable('palisade');
    return window.__GR_TEST__?.confirmBuild(x, z);
  }, position);
  const diagnostics = await page.evaluate(() => window.__GR_TEST__?.confirmBuildDiagnostics());
  expect(placed, JSON.stringify({ position, diagnostics })).toBe(true);
}

async function kitCredits(page: Page): Promise<number> {
  return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.palisadeKitCredits ?? -1);
}

async function palisades(page: Page): Promise<number> {
  return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.palisades ?? -1);
}

async function kitGrantAmounts(page: Page): Promise<number[]> {
  return page.evaluate(() =>
    ((window.__GR_TEST__?.economyLog() ?? []) as EconomyEvent[])
      .filter((event) => event.type === 'palisade_kit_granted')
      .map((event) => event.amount),
  );
}

test('T1 banks the old ring as a run-scoped palisade kit and spends it before gold', async ({ page }, testInfo: TestInfo) => {
  test.setTimeout(45_000);
  const errors = await openGame(page, 1, `territory-kit-${testInfo.project.name}`);

  await expect.poll(() => palisades(page)).toBe(0);
  await expect.poll(() => kitCredits(page)).toBe(KIT_SIZE);
  expect(await kitGrantAmounts(page)).toEqual([KIT_SIZE]);

  await page.keyboard.press('KeyB');
  await expect(page.getByTestId('hud-build-tile-palisade')).toContainText(`Palisade kit: ${KIT_SIZE} free`);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-menu-badge.png`), fullPage: true });
  await page.keyboard.press('Escape');

  await page.evaluate((amount) => window.__GR_TEST__?.grantGold(amount), Balance.palisade.cost);
  await placePalisade(page, PALISADE_SITES[0]!);
  await page.keyboard.press('KeyP');
  await expect(page.getByTestId('pause-meta-territory')).toHaveText('Territory I: palisade kit ready (7 free placements)');
  await page.waitForTimeout(100);
  await page.keyboard.press('KeyP');
  await expect(page.getByTestId('pause-meta-panel')).toBeHidden();
  await page.evaluate(() => window.__GR_TEST__?.startWaveForTest(2));
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key) !== null, RUN_SUSPEND_KEY)).toBe(true);
  await page.reload();
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 4);
  await dismissBriefing(page);
  await expect.poll(() => palisades(page)).toBe(1);
  await expect.poll(() => kitCredits(page)).toBe(KIT_SIZE - 1);
  expect(await kitGrantAmounts(page)).toEqual([KIT_SIZE]);
  for (let index = 1; index < KIT_SIZE; index += 1) await placePalisade(page, PALISADE_SITES[index]!);

  await expect.poll(() => kitCredits(page)).toBe(0);
  await expect(page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold)).resolves.toBe(Balance.palisade.cost);
  const kitEvents = await page.evaluate(() =>
    ((window.__GR_TEST__?.economyLog() ?? []) as EconomyEvent[]).filter(
      (event) => event.type === 'gold_spent' && event.sink === 'build_palisade' && event.kit,
    ),
  );
  expect(kitEvents).toHaveLength(KIT_SIZE);
  expect(kitEvents.every((event) => 'amount' in event && event.amount === 0)).toBe(true);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-kit-placement.png`), fullPage: true });

  await placePalisade(page, PALISADE_SITES[KIT_SIZE]!);
  await expect(page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold)).resolves.toBe(0);
  const paidEvent = await page.evaluate(() =>
    ((window.__GR_TEST__?.economyLog() ?? []) as EconomyEvent[]).filter(
      (event) => event.type === 'gold_spent' && event.sink === 'build_palisade',
    ).at(-1),
  );
  expect(paidEvent).toMatchObject({ type: 'gold_spent', sink: 'build_palisade', amount: Balance.palisade.cost });
  expect(paidEvent).not.toHaveProperty('kit');

  await page.evaluate(() => window.__GR_TEST__?.resetRun());
  await expect.poll(() => palisades(page)).toBe(0);
  await expect.poll(() => kitCredits(page)).toBe(KIT_SIZE);
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

test('T0 keeps ordinary paid palisade placement unchanged', async ({ page }) => {
  const errors = await openGame(page, 0, 'territory-kit-t0');
  await expect.poll(() => palisades(page)).toBe(0);
  await expect.poll(() => kitCredits(page)).toBe(0);
  await expect(page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.logLength)).resolves.toBe(0);
  expect(await kitGrantAmounts(page)).toEqual([]);

  await page.keyboard.press('KeyB');
  await expect(page.getByTestId('hud-build-tile-palisade')).not.toContainText('Palisade kit:');
  await page.keyboard.press('Escape');
  await page.evaluate((amount) => window.__GR_TEST__?.grantGold(amount), Balance.palisade.cost);
  await placePalisade(page, PALISADE_SITES[0]!);

  const spent = await page.evaluate(() =>
    ((window.__GR_TEST__?.economyLog() ?? []) as EconomyEvent[]).filter(
      (event) => event.type === 'gold_spent' && event.sink === 'build_palisade',
    ).at(-1),
  );
  expect(spent).toMatchObject({ amount: Balance.palisade.cost });
  expect(spent).not.toHaveProperty('kit');
  await page.evaluate((wave) => window.__GR_TEST__?.startWaveForTest(wave), Balance.run.secureWave);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.run.meta?.tracks.territory)).toBe(1);
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key) !== null, RUN_SUSPEND_KEY)).toBe(true);
  await page.reload();
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 4);
  await expect.poll(() => kitCredits(page)).toBe(0);
  await expect.poll(() => palisades(page)).toBe(1);
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

import { expect, test, type Page } from '@playwright/test';

async function openGame(page: Page): Promise<void> {
  await page.goto('/?debug&nowaves&nolevel&nopause&nokill&nosteal&seed=building-prompt-flicker');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
}

async function placeTurret(page: Page): Promise<{ index: number; position: { x: number; z: number } }> {
  await page.evaluate(() => {
    window.__GR_TEST__?.grantGold(1_000);
    window.__GR_TEST__?.teleport(0, 14);
    window.__GR_TEST__?.selectBuildable('turret');
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? false)).toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__?.confirmBuild())).resolves.toBe(true);
  return page.evaluate(() => {
    const entries = window.__THREE_GAME_DIAGNOSTICS__?.build.hp.filter((entry) => entry.id === 'turret') ?? [];
    const entry = entries.at(-1)!;
    return { index: entry.index, position: entry.position };
  });
}

test('building card is build-mode-only and stays unchanged through rapid fire and actions', async ({ page }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && consoleErrors.push(message.text()));
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await openGame(page);
  const turret = await placeTurret(page);
  await page.evaluate(({ x, z }) => {
    window.__GR_TEST__?.setBuildMode(false);
    window.__GR_TEST__?.teleport(x, z);
  }, turret.position);

  const prompt = page.getByTestId('building-context-prompt');
  await expect(prompt).toBeHidden();
  await page.waitForTimeout(250);
  await expect(prompt).toBeHidden();

  await page.evaluate(() => window.__GR_TEST__?.setBuildMode(true));
  await expect(prompt).toBeVisible();
  await expect(prompt).toContainText('Signal Turret · Tier 1');
  await page.evaluate(() => {
    const prompt = document.querySelector('[data-testid="building-context-prompt"]')!;
    (window as typeof window & { __buildingPromptMutations?: number }).__buildingPromptMutations = 0;
    new MutationObserver((records) => {
      (window as typeof window & { __buildingPromptMutations?: number }).__buildingPromptMutations! += records.length;
    }).observe(prompt, { attributes: true, childList: true, characterData: true, subtree: true });
    window.__GR_TEST__?.setBalance('sparkRig.fireRate', 60);
    window.__GR_TEST__?.setBalance('enemy.hp', 10_000);
    window.__GR_TEST__?.spawnEnemyAt(0, 8);
  });
  const shotsBefore = await page.evaluate(() => window.__GR_TEST__?.state().combat.shots.bolt ?? 0);
  await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.state().combat.shots.bolt ?? 0), { timeout: 5_000 }).toBeGreaterThanOrEqual(shotsBefore + 10);
  const evidence = await page.evaluate(() => ({
    shots: (window.__GR_TEST__?.state().combat.shots.bolt ?? 0),
    mutations: (window as typeof window & { __buildingPromptMutations?: number }).__buildingPromptMutations ?? -1,
  }));
  expect(evidence.mutations).toBe(0);

  await page.getByTestId('upgrade-confirm').click();
  await expect(prompt).toContainText('Signal Turret · Tier 2');
  await page.getByTestId('demolish-confirm').click();
  await expect
    .poll(() => page.evaluate((index) => window.__THREE_GAME_DIAGNOSTICS__?.build.hp.some((entry) => entry.id === 'turret' && entry.index === index) ?? false, turret.index))
    .toBe(false);
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
  console.log(`building-prompt evidence: ${evidence.shots - shotsBefore} shots, ${evidence.mutations} DOM mutations`);
});

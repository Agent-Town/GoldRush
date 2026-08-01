import { expect, test } from '@playwright/test';
import { Balance } from '../src/game/Balance';
import { expectNoConsoleErrors, watchErrors } from './support/console-watch';

const PLACEMENTS = {
  sluice: [0, 7],
  palisade: [0.8, 12],
  stockpile: [10, 11],
  turret: [4, 16],
} as const satisfies Record<keyof typeof Balance.tiers, readonly [number, number]>;
const UPGRADES = Object.keys(Balance.tiers).map((id) => [id, ...PLACEMENTS[id as keyof typeof PLACEMENTS]] as const);

test('every upgrade and a reused short float report legible rendered bounds', async ({ page }, testInfo) => {
  const errors = watchErrors(page);
  const webGlWarnings: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'warning' && message.text().includes('GL_INVALID_VALUE')) webGlWarnings.push(message.text());
  });
  await page.goto('/?debug=1');
  await page.waitForFunction(() => Boolean(window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__?.vfx));
  await page.getByRole('button', { name: 'Begin' }).click();
  await page.evaluate(() => window.__GR_TEST__!.warmVfx());

  const upgrades = await page.evaluate((placements) => {
    const results = [];
    for (const [id, x, z] of placements) {
      const before = window.__THREE_GAME_DIAGNOSTICS__!.build.hp.filter((entry) => entry.id === id).length;
      if (!window.__GR_TEST__!.placeFree(id, x, z)) throw new Error(`Could not place ${id}`);
      const entries = window.__THREE_GAME_DIAGNOSTICS__!.build.hp.filter((entry) => entry.id === id);
      const placed = entries[before] ?? entries.at(-1);
      if (!placed) throw new Error(`Missing ${id} diagnostics`);
      window.__GR_TEST__!.teleport(placed.position.x, placed.position.z);
      for (let tier = 2; tier <= 3; tier += 1) {
        window.__GR_TEST__!.grantGold(1_000);
        if (!window.__GR_TEST__!.upgradeBuilding(id, placed.index)) throw new Error(`Could not upgrade ${id} to tier ${tier}`);
        results.push(window.__THREE_GAME_DIAGNOSTICS__!.vfx.lastFloatText!);
      }
    }
    return results;
  }, UPGRADES);

  expect(upgrades).toHaveLength(8);
  for (const upgrade of upgrades) {
    expect(upgrade.renderedWidthPx).toBeLessThanOrEqual(upgrade.canvasWidthPx - 20);
    expect(upgrade.fontPx).toBeGreaterThanOrEqual(32);
  }
  await page.screenshot({
    path: `artifacts/f1318-1-float-fit-class-wide/${testInfo.project.name}.png`,
    animations: 'disabled',
  });

  await page.evaluate(() => window.__GR_TEST__!.warmVfx());
  const short = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.vfx.lastFloatText!);
  expect(short.canvasWidthPx).toBe(192);
  expect(short.fontPx).toBe(64);
  expect(webGlWarnings).toEqual([]);
  expectNoConsoleErrors(errors, testInfo.project.name);
});

import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { PROFILE_KEY, profileDataKey } from '../src/game/ProfileStorage';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

const terrainContract = JSON.parse(readFileSync(path.resolve('assets/pilots/map-rebuild-spike/baron-terrain-contract.json'), 'utf8')) as {
  landmarkMounts: Array<{ id: string; position: [number, number, number] }>;
};
const BARON_FORT = terrainContract.landmarkMounts.find(({ id }) => id === 'fortified_far_bank')!.position;

function collectErrors(page: Page): ErrorBucket {
  const errors: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  return errors;
}

async function openBaron(page: Page, waves = true): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.addInitScript(
    ({ profileKey, metaKey }) => {
      localStorage.clear();
      localStorage.setItem(profileKey, JSON.stringify({
        version: 2,
        activeId: 'robin',
        profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
      }));
      localStorage.setItem(metaKey, JSON.stringify({ version: 1, tracks: { territory: 1, science: 6, hero: 0, agent: 2 } }));
    },
    { profileKey: PROFILE_KEY, metaKey: profileDataKey('robin', META_PROGRESS_KEY) },
  );
  await page.goto(`/?debug&contract=e1-baron&timescale=6&nolevel&nosteal&nowreck&seed=lane-baron-north${waves ? '' : '&nowaves'}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

test('Baron boot has no palisade tax and spends no repair gold', async ({ page }) => {
  const errors = await openBaron(page, false);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.hp.filter((entry) => entry.id === 'palisade').length)).toBe(0);
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(180));
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wreck.repairGold)).toBe(0);
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

test('Baron body, motorcade, and arrival card derive their side from the fort', async ({ page }) => {
  const errors = await openBaron(page);
  expect(await page.evaluate(() => window.__GR_TEST__!.activeContract().twist.baron?.spawnEdge)).toBeUndefined();
  expect(await page.evaluate(() => window.__GR_TEST__!.setManualSim(true))).toBe(true);
  await page.evaluate(() => window.__GR_TEST__!.clearEnemies());
  for (const [key, value] of Object.entries({
    'waves.waveInterval': 0.45,
    'waves.trickleInterval': 999,
    'waves.pulseBase': 0,
    'waves.pulsePerWave': 0,
    'waves.pulsesPerWave': 1,
    'waves.edgesPerPulse': 1,
    'waves.aliveCap': 80,
  })) {
    expect(await page.evaluate(([path, next]) => window.__GR_TEST__!.setBalance(path, next), [key, value] as const)).toBe(true);
  }
  await page.evaluate(() => window.__GR_TEST__!.setWave(19));
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(1));
  await expect.poll(() => page.evaluate(() => window.__GR_TEST__!.enemyPositions().find((enemy) => enemy.eliteKind === 'baron')?.edge), { timeout: 10_000 }).toBeTruthy();
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.ui?.announcementEdge), { timeout: 10_000 }).toBeTruthy();
  const announcementEdge = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.ui?.announcementEdge);
  const motorcade = await page.evaluate(() => {
    const enemies = window.__GR_TEST__!.enemyPositions();
    const baron = enemies.find((enemy) => enemy.eliteKind === 'baron')!;
    const escortCount = window.__GR_TEST__!.activeContract().twist.baron!.escortCount;
    return enemies.filter((enemy) => enemy.id >= baron.id - escortCount && enemy.id <= baron.id);
  });
  expect(motorcade).toHaveLength(9);
  expect(motorcade.every((enemy) => enemy.edge === announcementEdge && enemy.x * BARON_FORT[0] + enemy.z * BARON_FORT[2] > 0)).toBe(true);
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

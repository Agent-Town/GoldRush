import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { PROFILE_KEY, TOWN_NAME_KEY, profileDataKey } from '../src/game/ProfileStorage';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';
import { expectNoConsoleErrors, watchErrors } from './support/console-watch';

const SLOT = 'char.e2.rail_tough';
const SHOTS = path.resolve('reviews/shots-e2-rail-tough-only-bind');
const ROWS = { sw: 0, se: 1, nw: 2, ne: 3 } as const;

async function openHillMine(page: Page): Promise<void> {
  await page.goto('/');
  await page.evaluate(({ epochKey, profileKey, townKey }) => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(profileKey, JSON.stringify({
      version: 2,
      activeId: 'robin',
      profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
    }));
    localStorage.setItem(townKey, 'Quartz Hill');
    localStorage.setItem(epochKey, 'epoch-2-steamworks');
  }, {
    epochKey: profileDataKey('robin', ACTIVE_EPOCH_KEY),
    profileKey: PROFILE_KEY,
    townKey: profileDataKey('robin', TOWN_NAME_KEY),
  });
  await page.reload();
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  for (const [key, ms] of [['KeyA', 850], ['KeyW', 850]] as const) {
    await page.keyboard.down(key);
    await page.waitForTimeout(ms);
    await page.keyboard.up(key);
  }
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)).toBe('tavern');
  await page.getByTestId('town-open-board').click();
  await page.getByTestId('contract-chapter-tab-epoch-2-steamworks').click();

  await page.getByTestId('contract-launch-e2-hill-mine').click();
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  // Existing plain-boot e2e seam: tune the live WaveSystem inputs without exposing __GR_TEST__.
  await page.evaluate(async () => {
    const { Balance } = (await Function('return import("/src/game/Balance.ts")')()) as {
      Balance: {
        waves: {
          trickleInterval: number;
        };
        enemy: { contactDamage: number };
        sparkRig: { range: number };
      };
    };
    const { loadContract } = (await Function('return import("/src/meta/ContractFamilies.ts")')()) as typeof import('../src/meta/ContractFamilies');
    Balance.waves.trickleInterval = 999;
    Balance.enemy.contactDamage = 0;
    Balance.sparkRig.range = 0;

    const contract = loadContract('e2-hill-mine') as unknown as {
      tileParams: { lanes: { spawnEdges: string[] } };
      twist: { enemyRoster?: Array<{ id: string; spawnEdges: string[]; spawnGates: Array<{ edge: string; x: number; z: number }> }> };
    };
    const rail = contract.twist.enemyRoster?.find((entry) => entry.id === 'rail_tough') as unknown as
      | { spawnEdges: string[]; spawnGates: Array<{ edge: string; x: number; z: number }> }
      | undefined;
    if (!rail) throw new Error('Hill Mine Rail Tough roster entry is missing');
    contract.tileParams.lanes.spawnEdges = ['west'];
    Object.assign(rail, {
      spawnEdges: ['west'],
      spawnGates: [{ edge: 'west', x: -8, z: 4 }],
    });
  });
  const begin = page.getByRole('button', { name: 'Begin' });
  if (await begin.isVisible()) await begin.click();
  if (await page.getByTestId('story-beat-card').isVisible().catch(() => false)) await page.mouse.click(6, 6);
}

test('plain Steamworks boot renders Rail Tough diagonal cells instead of cardinal aliases', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  const watch = watchErrors(page);
  await openHillMine(page);
  expect(new URL(page.url()).searchParams.has('debug')).toBe(false);
  const proof = await (await page.waitForFunction((slot) => {
    const animation = window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations[slot];
    const rendered = window.__THREE_GAME_DIAGNOSTICS__?.assetSprites[slot] ?? 0;
    if (!/^(?:sw|se|nw|ne):char-railtough-sheet-walkdiag4-a-r[0-3]c[0-3]\.png$/.test(
      `${animation?.direction ?? 'none'}:${animation?.frameKey ?? 'none'}`,
    ) || rendered <= 0) return null;
    return {
      contract: window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId,
      rendered,
      animation,
    };
  }, SLOT, { timeout: 30_000 })).jsonValue();
  if (!proof) throw new Error('Rail Tough never resolved a diagonal cell');
  expect(proof.contract).toBe('e2-hill-mine');
  expect(proof.rendered).toBeGreaterThan(0);
  expect(proof.animation?.direction).toBeTruthy();
  expect(Object.hasOwn(ROWS, proof.animation!.direction!)).toBe(true);
  const row = ROWS[proof.animation!.direction as keyof typeof ROWS];
  expect(proof.animation!.frameKey).toMatch(new RegExp(`^char-railtough-sheet-walkdiag4-a-r${row}c[0-3]\\.png$`));
  expect(proof.animation!.mirrored).not.toBe(true);

  if (await page.getByTestId('story-beat-card').isVisible().catch(() => false)) await page.mouse.click(6, 6);
  await mkdir(SHOTS, { recursive: true });
  await page.screenshot({ path: path.join(SHOTS, `${testInfo.project.name}-plain-boot.png`), fullPage: false });
  expectNoConsoleErrors(watch);
});

import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { PROFILE_KEY, TOWN_NAME_KEY, profileDataKey } from '../src/game/ProfileStorage';

const artifactDir = path.resolve('artifacts/cast-motion-wiring-e2e');

async function bootTown(page: Page): Promise<void> {
  await page.goto('/');
  await page.evaluate(
    ({ profileKey, townKey, metaKey }) => {
      localStorage.clear();
      localStorage.setItem(profileKey, JSON.stringify({
        version: 2,
        activeId: 'cast',
        profiles: [{ id: 'cast', name: 'Cast', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
      }));
      localStorage.setItem(townKey, 'Full Body Fork');
      localStorage.setItem(metaKey, JSON.stringify({ version: 1, tracks: { territory: 3, science: 0, hero: 0, agent: 0 } }));
    },
    {
      profileKey: PROFILE_KEY,
      townKey: profileDataKey('cast', TOWN_NAME_KEY),
      metaKey: profileDataKey('cast', META_PROGRESS_KEY),
    },
  );
  await page.reload();
  await page.getByTestId('start-menu-enter-town').click();
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.actors.filter((actor) => actor.visible).every((actor) => actor.loaded && actor.spriteAspect > 0 && actor.spriteAspect <= 1.6))).toBe(true);
}

test('the whole visible plaza cast is full-body and three motion sheets advance', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await bootTown(page);

  const before = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__!.actors.filter((actor) => actor.visible));
  expect(before).toHaveLength(10);
  expect(before.every((actor) => actor.spriteAspect >= 0.7 && actor.spriteAspect <= 1.6)).toBe(true); // natural cell aspect — >=1.8 was the codified stretch (owner finding 2026-07-12)
  await page.waitForTimeout(500);
  const after = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__!.actors.filter((actor) => actor.visible));
  for (const id of ['tavernkeeper', 'elder', 'newsie'] as const) {
    expect(after.find((actor) => actor.id === id)?.frameKey).not.toBe(before.find((actor) => actor.id === id)?.frameKey);
  }

  await mkdir(artifactDir, { recursive: true });
  await page.locator('#game-canvas').screenshot({ path: path.join(artifactDir, `${testInfo.project.name}-plaza-cast.png`) });
  await page.getByTestId('town-exit').click();
  await page.getByTestId('start-menu-enter-town').click();
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.actors.filter((actor) => actor.visible).every((actor) => actor.loaded && actor.spriteAspect > 0 && actor.spriteAspect <= 1.6))).toBe(true);
  expect(errors).toEqual([]);
});

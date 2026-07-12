import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { PROFILE_KEY, TOWN_NAME_KEY, profileDataKey } from '../src/game/ProfileStorage';
import { TOWN_CAST_METROLOGY } from '../src/town/townsfolk';

const artifactDir = path.resolve('artifacts/cast-metrology');

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

test('the plaza cast stands, walks, and faces truthfully without borrowed sheets', async ({ page }, testInfo) => {
  test.setTimeout(75_000);
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await bootTown(page);

  const before = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__!.actors.filter((actor) => actor.visible));
  expect(before).toHaveLength(10);
  expect(before.every((actor) => actor.spriteAspect >= 0.7 && actor.spriteAspect <= 1.6)).toBe(true);
  expect(before.every((actor) => !actor.fullBodyStandIn)).toBe(true);
  const height = (id: string) => before.find((actor) => actor.id === id)!.spriteHeight / TOWN_CAST_METROLOGY.worldUnitsPerHero;
  expect(height('tavernkeeper')).toBeCloseTo(TOWN_CAST_METROLOGY.tallAdult, 2);
  expect(height('elder')).toBeCloseTo(TOWN_CAST_METROLOGY.elder, 2);
  expect(height('youngster_a')).toBeCloseTo(TOWN_CAST_METROLOGY.child, 2);
  expect(height('prospector')).toBeCloseTo(TOWN_CAST_METROLOGY.prospector, 2);
  for (const id of ['preacher', 'schoolteacher', 'assay_clerk'] as const) {
    expect(before.find((actor) => actor.id === id)?.presentation).toBe('portrait_post');
  }
  expect(before.find((actor) => actor.id === 'assay_clerk')?.position).toEqual({ x: 6.6, z: 2.4 });
  const presentations = before
    .filter((actor) => actor.id !== 'prospector')
    .map((actor) => actor.frameKey.replace(/-r\d+c\d+\.png$/, ''));
  expect(new Set(presentations).size).toBe(presentations.length);
  await expect.poll(async () => {
    const newsie = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__!.actors.find((actor) => actor.id === 'newsie'));
    return newsie && !newsie.moving ? newsie.frameKey : '';
  }, { timeout: 40_000 }).toMatch(/c0\.png$/); // Mei's loop is ~19s with one pause; give a full cycle + margin

  await page.waitForTimeout(500);
  const after = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__!.actors.filter((actor) => actor.visible));
  for (const id of ['tavernkeeper', 'elder'] as const) {
    expect(after.find((actor) => actor.id === id)?.frameKey).toBe(before.find((actor) => actor.id === id)?.frameKey);
    expect(after.find((actor) => actor.id === id)?.frameKey).toMatch(/c0\.png$/);
  }
  expect(after.find((actor) => actor.id === 'preacher')?.frameKey).toBe('portrait:preacher');
  expect(after.find((actor) => actor.id === 'schoolteacher')?.frameKey).toBe('portrait:schoolteacher');
  expect(after.find((actor) => actor.id === 'assay_clerk')?.frameKey).toBe('portrait:assay_clerk');

  await expect.poll(async () => {
    const actors = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__!.actors);
    return actors.some(
      (actor) => actor.visible && actor.moving && actor.motion.z > Math.abs(actor.motion.x) && /-r0c[1-7]\.png$/.test(actor.frameKey),
    );
  }, { timeout: 20_000 }).toBe(true);

  await page.waitForTimeout(10_000);
  await mkdir(artifactDir, { recursive: true });
  await page.locator('#game-canvas').screenshot({ path: path.join(artifactDir, `${testInfo.project.name}-plaza-after.png`) });
  await page.getByTestId('town-exit').click();
  await page.getByTestId('start-menu-enter-town').click();
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.actors.filter((actor) => actor.visible).every((actor) => actor.loaded && actor.spriteAspect > 0 && actor.spriteAspect <= 1.6))).toBe(true);
  expect(errors).toEqual([]);
});

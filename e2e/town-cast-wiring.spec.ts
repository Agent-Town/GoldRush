import fs from 'node:fs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { PNG } from 'pngjs';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { PROFILE_KEY, TOWN_NAME_KEY, profileDataKey } from '../src/game/ProfileStorage';
import { TOWN_CAST_METROLOGY } from '../src/town/townsfolk';

const shotDir = path.resolve('reviews/shots-town-cast');
const ids = ['tavernkeeper', 'storekeeper'] as const;

test('town cast contracts name every shipped direction cell', () => {
  const contract = JSON.parse(fs.readFileSync('assets/layer-contracts/characters.v2.json', 'utf8')) as {
    slots: Array<{ slot: string; walk8?: { directions?: Record<string, { frames?: { files?: string[] } }> } }>;
  };
  for (const id of ids) {
    const walk8 = contract.slots.find(({ slot }) => slot === `char.town.${id}`)?.walk8;
    expect(Object.keys(walk8?.directions ?? {}).sort()).toEqual(['e', 'n', 'ne', 'nw', 's', 'se', 'sw', 'w']);
    for (const files of Object.values(walk8!.directions!)) {
      expect(files.frames?.files).toHaveLength(8);
      expect(files.frames?.files?.every((file) => fs.existsSync(path.join('assets/processed', file)))).toBe(true);
    }
  }
});

test('plain town boot shows the tavernkeeper and storekeeper walking on anchored feet', async ({ page }, testInfo) => {
  test.setTimeout(45_000);
  const errors = collectErrors(page);
  await seedTown(page);
  await page.getByTestId('start-menu-enter-town').click();
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.actors
    .filter((actor) => actor.id === 'tavernkeeper' || actor.id === 'storekeeper')
    .every((actor) => actor.visible && actor.loaded && actor.loop && actor.footY !== null && Math.abs(actor.footY - 0.02) < 1e-6))).toBe(true);
  expect(await page.evaluate(() => window.__GR_TEST__)).toBeUndefined();

  for (const id of ids) {
    await expect.poll(() => page.evaluate((actorId) => {
      const actor = window.__GR_TOWN_DIAGNOSTICS__?.actors.find(({ id: candidate }) => candidate === actorId);
      return actor?.moving ? actor.frameKey : '';
    }, id), { timeout: 20_000 }).toMatch(new RegExp(`^char-${id}-sheet-walk8-r[0-3]c[1-7]\\.png$`));
  }

  const diagnostics = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__!);
  const tavernkeeper = diagnostics.actors.find(({ id }) => id === 'tavernkeeper')!;
  const storekeeper = diagnostics.actors.find(({ id }) => id === 'storekeeper')!;
  for (const actor of [tavernkeeper, storekeeper]) {
    const png = PNG.sync.read(fs.readFileSync(path.join('assets/processed', actor.frameKey)));
    let bottom = 0;
    for (let y = 0; y < png.height; y += 1) {
      for (let x = 0; x < png.width; x += 1) {
        if (png.data[(y * png.width + x) * 4 + 3] > 8) bottom = y + 1;
      }
    }
    const renderedFootY = actor.spriteY - actor.spriteHeight / 2 + actor.spriteHeight * (1 - bottom / png.height);
    expect(renderedFootY, `${actor.id} rendered foot contact`).toBeCloseTo(0.02, 2);
  }
  expect(tavernkeeper.spriteHeight).toBeCloseTo(TOWN_CAST_METROLOGY.worldUnitsPerHero * TOWN_CAST_METROLOGY.tallAdult, 3);
  expect(storekeeper.spriteHeight).toBeCloseTo(TOWN_CAST_METROLOGY.worldUnitsPerHero * TOWN_CAST_METROLOGY.adult, 3);
  expect(diagnostics.renderer.calls).toBeLessThanOrEqual(55); // pre-wire plain-town baseline: 45
  expect(errors).toEqual([]);

  await page.evaluate(() => {
    window.__GR_TOWN_DIAGNOSTICS__!.teleport(-2.75, -1);
    window.__GR_TOWN_DIAGNOSTICS__!.camera.setZoom(1.5);
  });
  await page.waitForTimeout(500);
  await mkdir(shotDir, { recursive: true });
  await page.locator('#game-canvas').screenshot({ path: path.join(shotDir, `${testInfo.project.name}.png`) });
});

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

async function seedTown(page: Page): Promise<void> {
  await page.goto('/');
  await page.evaluate(({ profileKey, townKey, metaKey }) => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(profileKey, JSON.stringify({
      version: 2,
      activeId: 'cast',
      profiles: [{ id: 'cast', name: 'Cast', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
    }));
    localStorage.setItem(townKey, 'Cast Town');
    localStorage.setItem(metaKey, JSON.stringify({ version: 1, tracks: { territory: 3, science: 0, hero: 0, agent: 0 } }));
  }, {
    profileKey: PROFILE_KEY,
    townKey: profileDataKey('cast', TOWN_NAME_KEY),
    metaKey: profileDataKey('cast', META_PROGRESS_KEY),
  });
  await page.reload();
}

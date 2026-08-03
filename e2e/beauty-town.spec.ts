import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { FIRST_CLAIM_DONE_KEY, PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';

// THE TOWN BEAUTY SHIFT's plain-boot door (docs/beauty/town-brief.md; Mistake #10: "where does
// the PLAYER see this, in a plain boot?"). Every visual U1-U8 added is counted from
// __GR_TOWN_DIAGNOSTICS__ after an ordinary Enter Town — no ?debug, no test-only gate. The
// screenshots that judge how it LOOKS live in the capture rig (e2e/beauty-town.rig.ts); this
// spec only defends that the things exist, on both viewports, with a clean console.

test('the day town boots with ground contact, wear and parcel dressing — and no night dressing', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const errors = collectErrors(page);
  await seedProfile(page);
  await enterTown(page);

  const town = await snapshot(page);
  await saveEraLightShot(page, testInfo.project.name, 'day');
  expect(town.dressing.mood).toBe('day');

  // U1: one blob per visible townsperson plus the player.
  const visibleActors = town.actors.filter((actor) => actor.visible).length;
  expect(visibleActors).toBeGreaterThanOrEqual(8);
  expect(town.contact.blobShadows).toBe(visibleActors + 1);

  // U2: the sun's shadow camera is AIMED (three.js defaults to +/-5, a 10x10 patch of a 30x30
  // town), and one contact skirt stands under every earned building.
  expect(town.contact.sunShadow.enabled).toBe(true);
  expect(town.contact.sunShadow.extent).toBe(17);
  expect(town.contact.sunShadow.mapSize).toBeGreaterThanOrEqual(1024);
  const visibleBuildings = town.buildings.filter((building) => building.visible).length;
  expect(visibleBuildings).toBe(6);
  expect(town.contact.skirts).toBeGreaterThanOrEqual(visibleBuildings);

  // U3: dwell wear only where the town is really earned — an approach whose building is still a
  // survey plot gets none, so the count tracks the earned slots, never the whole layout.
  expect(town.dressing.wearDecals).toBeGreaterThanOrEqual(visibleBuildings + 2);
  expect(town.dressing.wearDecals).toBeLessThanOrEqual(town.plaza.slots.length + town.actors.length + 4);

  // U4: three to four pieces per parcel, instanced into two meshes.
  expect(town.dressing.parcelPieces).toBeGreaterThanOrEqual(visibleBuildings * 3);

  // U7/U8: day boot is unchanged — no window glow, no lantern lights. The strings hang unlit.
  expect(town.dressing.windowGlow).toBe(0);
  expect(town.dressing.lanternLights).toBe(0);
  expect(town.dressing.lanternBeads).toBeGreaterThan(0);
  expect(town.dressing.lightGrammar).toMatchObject({
    eraOrder: 1,
    family: 'flame',
    lit: false,
    fixtureColor: '#b97a3d',
    coolWhiteEmissiveFixtures: 0,
    uninspectableFixtures: 0,
    flickerScale: 1,
  });

  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

test('?townDusk reaches the town from a plain URL and lights windows, strings and lanterns', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const errors = collectErrors(page);
  await seedProfile(page);

  // THE DOOR ITSELF. Before this shift main.ts MENU_SAFE_PARAMS was {town3dPilot, run3dPilot,
  // tier}: any other search key fell through to startWithProfiles and booted a CONTRACT RUN, so
  // /?townNight — shipped in TownScene since the town shipped — could not be reached at all.
  // Landing on the start menu (not a run) is the assertion that the flag has a door.
  await page.goto('/?townDusk');
  await expect(page.getByTestId('start-menu-enter-town')).toBeVisible();
  await enterTown(page, { alreadyLoaded: true });

  const town = await snapshot(page);
  await saveEraLightShot(page, testInfo.project.name, 'dusk');
  expect(town.dressing.mood).toBe('dusk');
  expect(town.dressing.windowGlow).toBeGreaterThanOrEqual(town.buildings.filter((building) => building.visible).length * 2);
  expect(town.dressing.lanternLights).toBeGreaterThan(0);
  expect(town.dressing.lanternLights).toBeLessThanOrEqual(6);
  expect(town.dressing.lanternBeads).toBeGreaterThan(0);
  expect(town.dressing.lightGrammar).toMatchObject({
    eraOrder: 1,
    family: 'flame',
    lit: true,
    fixtureColor: '#ffb45c',
    windowColor: '#ffb45c',
    coolWhiteEmissiveFixtures: 0,
    uninspectableFixtures: 0,
    flickerDepth: 0.055,
  });
  const flicker = await page.evaluate(async () => {
    let min = Infinity;
    let max = -Infinity;
    const startedAt = performance.now();
    await new Promise<void>((resolve) => {
      const sample = (now: number) => {
        const scale = window.__GR_TOWN_DIAGNOSTICS__?.dressing.lightGrammar.flickerScale ?? 1;
        min = Math.min(min, scale);
        max = Math.max(max, scale);
        if (now - startedAt < 1_250) requestAnimationFrame(sample); else resolve();
      };
      requestAnimationFrame(sample);
    });
    return { min, max };
  });
  expect(flicker.max - flicker.min).toBeGreaterThan(0.02);
  // Contact survives the mood: the same blobs, skirts and aimed shadow camera.
  expect(town.contact.sunShadow.enabled).toBe(true);
  expect(town.contact.skirts).toBeGreaterThan(0);

  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

test('Voltage town earns a cooler, steady arc-light accent from the era table', async ({ page }) => {
  const errors = collectErrors(page);
  await seedProfile(page, 'epoch-3-voltage');
  await page.goto('/?townDusk&tier=lite');
  await enterTown(page, { alreadyLoaded: true });

  expect((await snapshot(page)).dressing.lightGrammar).toMatchObject({
    eraOrder: 3,
    family: 'arc',
    lit: true,
    fixtureColor: '#bfe8ff',
    windowColor: '#d5efff',
    pointColor: '#a9ddff',
    flickerDepth: 0,
    flickerScale: 1,
  });
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

async function seedProfile(page: Page, epoch?: string): Promise<void> {
  await page.addInitScript(({ profileKey, townKey, metaKey, guideKey, epochKey, flatMetaKey, flatTownKey, flatGuideKey, flatEpochKey, activeEpoch }) => {
    localStorage.clear();
    sessionStorage.clear();
    const profile: ProfileState = {
      version: 2,
      activeId: 'robin',
      profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: ['story:first-contract'] }],
    };
    localStorage.setItem(profileKey, JSON.stringify(profile));
    localStorage.setItem(townKey, 'Quartz Hill');
    localStorage.setItem(guideKey, '1');
    const meta = JSON.stringify({ version: 1, tracks: { territory: 3, science: 0, hero: 0, agent: 0 } });
    localStorage.setItem(metaKey, meta);
    localStorage.setItem(flatMetaKey, meta);
    localStorage.setItem(flatTownKey, 'Quartz Hill');
    localStorage.setItem(flatGuideKey, '1');
    if (activeEpoch) {
      localStorage.setItem(epochKey, activeEpoch);
      localStorage.setItem(flatEpochKey, activeEpoch);
    }
  }, {
    profileKey: PROFILE_KEY,
    townKey: profileDataKey('robin', TOWN_NAME_KEY),
    metaKey: profileDataKey('robin', META_PROGRESS_KEY),
    guideKey: profileDataKey('robin', FIRST_CLAIM_DONE_KEY),
    epochKey: profileDataKey('robin', ACTIVE_EPOCH_KEY),
    flatMetaKey: META_PROGRESS_KEY,
    flatTownKey: TOWN_NAME_KEY,
    flatGuideKey: FIRST_CLAIM_DONE_KEY,
    flatEpochKey: ACTIVE_EPOCH_KEY,
    activeEpoch: epoch,
  });
}

async function enterTown(page: Page, options: { alreadyLoaded?: boolean } = {}): Promise<void> {
  if (!options.alreadyLoaded) await page.goto('/');
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 2);
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.actors ?? []).every((actor) => !actor.visible || actor.loaded), undefined, { timeout: 30_000 });
}

async function snapshot(page: Page) {
  return page.evaluate(() => {
    const town = window.__GR_TOWN_DIAGNOSTICS__!;
    return {
      contact: town.contact,
      dressing: town.dressing,
      actors: town.actors.map((actor) => ({ visible: actor.visible })),
      buildings: town.buildings.map((building) => ({ visible: building.visible })),
      plaza: { slots: town.plaza.slots.map((slot) => ({ id: slot.id })) },
    };
  });
}

function collectErrors(page: Page): { consoleErrors: string[]; pageErrors: string[] } {
  const errors = { consoleErrors: [] as string[], pageErrors: [] as string[] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  return errors;
}

async function saveEraLightShot(page: Page, project: string, mood: 'day' | 'dusk'): Promise<void> {
  await page.waitForFunction(() => {
    const town = window.__GR_TOWN_DIAGNOSTICS__;
    return (town?.elapsed ?? 0) > 4;
  }, undefined, { timeout: 30_000 });
  const directory = path.resolve('artifacts/era-lights', process.env.GR_ERA_LIGHT_PHASE ?? 'after');
  await mkdir(directory, { recursive: true });
  await page.locator('canvas').screenshot({ path: path.join(directory, `${project}-${mood}.png`) });
}

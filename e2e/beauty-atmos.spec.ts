import { expect, test, type Page } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { FIRST_CLAIM_DONE_KEY, PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';

// THE ATMOSPHERICS SHIFT's plain-boot door (Mistake #10: "where does the PLAYER see this, in a
// plain boot?"). Three sky variants live behind ?townSky=a|b|c; this spec defends four things
// the boards cannot: the flag reaches the town by URL without launching a contract run, each
// variant builds and is PARENTED to the scene, the default boot is untouched, and the cone
// arithmetic the whole shift rests on is published rather than argued.
// How it LOOKS is judged in e2e/beauty-atmos.rig.ts and reviews/beauty-atmos.md.

const PLAZA = { x: 0, z: 2 };
const NORTH_GATE = { x: 0, z: -13 };

test('the default town boot is untouched by the sky work', async ({ page }) => {
  test.setTimeout(90_000);
  const errors = collectErrors(page);
  await seedProfile(page);
  await enterTown(page, '');
  const town = await snapshot(page);
  expect(town.sky.variant).toBe('off');
  expect(town.sky.objects).toBe(0);
  expect(town.sky.triangles).toBe(0);
  expect(town.sky.background).toBe('flat');
  expect(town.lighting.background).toMatch(/^#/);
  expectClean(errors);
});

for (const variant of ['a', 'b', 'c'] as const) {
  test(`?townSky=${variant} is menu-safe, builds, and reaches the scene graph`, async ({ page }) => {
    test.setTimeout(90_000);
    const errors = collectErrors(page);
    await seedProfile(page);
    // F-BT-1's lesson: a search key that is not in MENU_SAFE_PARAMS falls through to
    // startWithProfiles() and launches a contract run. Going straight to the URL proves the door.
    await page.goto(`/?townSky=${variant}`);
    await expect(page.getByTestId('start-menu-enter-town')).toBeVisible();
    await page.getByTestId('start-menu-enter-town').click();
    await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 2);

    const town = await snapshot(page);
    expect(town.sky.variant).toBe(variant);
    // 'c' is the no-geometry variant; 'a' and 'b' each add exactly one object, and `objects`
    // counts only what is PARENTED to the scene — a built-but-unmounted belt reads 0.
    expect(town.sky.objects).toBe(variant === 'c' ? 0 : 1);
    if (variant === 'c') expect(town.sky.triangles).toBe(0);
    else expect(town.sky.triangles).toBeGreaterThan(0);
    // 'b' carries its own sky in the ring's paint and must NOT also pay for a background ramp.
    expect(town.sky.background).toBe(variant === 'b' ? 'flat' : 'ramp');
    expectClean(errors);
  });
}

test('the cone the shift rests on is published: the top of frame is always below horizontal, and only the north half reaches past the plate', async ({ page }) => {
  test.setTimeout(90_000);
  const errors = collectErrors(page);
  await seedProfile(page);
  await enterTown(page, '');

  await frameCamera(page, PLAZA, 0.85);
  const plaza = await snapshot(page);
  // The whole reason none of the three is a sky DOME.
  expect(plaza.sky.topEdgePitchDeg).toBeLessThan(0);
  // F-BT-2, reproduced as a gate: from the plaza the frame cannot contain anything past the
  // plate, so a sky there is worth exactly zero pixels. That is where round one measured.
  expect(plaza.sky.beyondPlate).toBe(false);

  await frameCamera(page, NORTH_GATE, 0.85);
  const north = await snapshot(page);
  expect(north.sky.topEdgePitchDeg).toBeLessThan(0);
  // ...and from the north gate it emphatically does. Same camera, same zoom, 15 units of walking.
  expect(north.sky.beyondPlate).toBe(true);
  expect(north.sky.topEdgeGroundZ).toBeLessThan(-22);
  expectClean(errors);
});

async function frameCamera(page: Page, at: { x: number; z: number }, zoom: number): Promise<void> {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    await page.evaluate(({ x, z, scale }) => {
      const town = window.__GR_TOWN_DIAGNOSTICS__!;
      town.teleport(x, z);
      town.camera.setZoom(scale);
    }, { ...at, scale: zoom });
    await page.waitForTimeout(700);
    const player = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__!.player);
    if (Math.abs(player.x - at.x) < 0.3 && Math.abs(player.z - at.z) < 0.3) break;
  }
  await page.waitForFunction(
    ({ x, z, scale }) => {
      const town = window.__GR_TOWN_DIAGNOSTICS__;
      if (!town) return false;
      return Math.abs(town.player.x - x) < 0.3 && Math.abs(town.player.z - z) < 0.3
        && Math.abs(town.camera.framingDistanceScale - scale) < 0.01
        && Math.abs(town.camera.actualDistance - town.camera.targetDistance) < 0.05;
    },
    { ...at, scale: zoom },
    { timeout: 30_000 },
  );
}

async function snapshot(page: Page) {
  return page.evaluate(() => {
    const town = window.__GR_TOWN_DIAGNOSTICS__!;
    return { sky: town.sky, lighting: town.lighting, player: town.player };
  });
}

async function enterTown(page: Page, query: string): Promise<void> {
  await page.goto(`/${query}`);
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 2);
}

async function seedProfile(page: Page): Promise<void> {
  await page.addInitScript(({ profileKey, townKey, metaKey, guideKey, flatMetaKey, flatTownKey, flatGuideKey }) => {
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
  }, {
    profileKey: PROFILE_KEY,
    townKey: profileDataKey('robin', TOWN_NAME_KEY),
    metaKey: profileDataKey('robin', META_PROGRESS_KEY),
    guideKey: profileDataKey('robin', FIRST_CLAIM_DONE_KEY),
    flatMetaKey: META_PROGRESS_KEY,
    flatTownKey: TOWN_NAME_KEY,
    flatGuideKey: FIRST_CLAIM_DONE_KEY,
  });
}

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

function collectErrors(page: Page): ErrorBucket {
  const errors: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  return errors;
}

function expectClean(errors: ErrorBucket): void {
  // A GLB texture blob can be revoked mid-load when a reload races an in-flight loader; that is
  // a pre-existing loader race, not a sky regression, and it must not be able to hide one either
  // — so it is named exactly rather than filtered by a wildcard.
  const unexpected = errors.consoleErrors.filter((line) => !line.includes("GLTFLoader: Couldn't load texture blob:"));
  expect(unexpected).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

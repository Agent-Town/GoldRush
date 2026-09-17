import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { PROFILE_KEY, TOWN_NAME_KEY, profileDataKey } from '../src/game/ProfileStorage';
import { TOWN_ACTORS, TOWN_CAST_METROLOGY, type TownActorDefinition } from '../src/town/townsfolk';
import { townBuildings, townPlazaLayout, townPlazaSlot } from '../src/town/townLayout';

const artifactDir = path.resolve('artifacts/cast-metrology');
const assayArtifactDir = path.resolve('artifacts/town-zoom');
const MIN_BUILDING_CLEARANCE = 0.3;

test('every authored town actor post clears every visual building footprint', () => {
  for (const actor of TOWN_ACTORS) {
    for (const point of actor.loop?.points ?? [actorPost(actor)]) {
      const nearest = Math.min(...townBuildings.map((building) => visualFootprintClearance(point, building)));
      expect(nearest, `${actor.id} post (${point.x.toFixed(2)}, ${point.z.toFixed(2)})`).toBeGreaterThanOrEqual(MIN_BUILDING_CLEARANCE);
    }
  }
});

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
  expect(height('preacher')).toBeCloseTo(TOWN_CAST_METROLOGY.tallAdult, 2);
  for (const id of ['schoolteacher', 'assay_clerk'] as const) expect(height(id)).toBeCloseTo(TOWN_CAST_METROLOGY.adult, 2);
  expect(before.find((actor) => actor.id === 'assay_clerk')?.position).toEqual({ x: 7, z: 3.4 });
  await page.waitForFunction(() => document.querySelector('canvas')?.dataset.town3dPilotLoadedIds?.split(',').includes('assay_office'));
  await focusAssayOffice(page);
  await setEvidenceUi(page, true);
  await mkdir(assayArtifactDir, { recursive: true });
  await assayShot(page, testInfo.project.name, 'default');
  await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__!.camera.setZoom(0.36));
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__!.camera.framingDistanceScale)).toBeCloseTo(0.36, 2);
  await assayShot(page, testInfo.project.name, 'close');
  await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__!.camera.setZoom(0.85));
  await setEvidenceUi(page, false);
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
  // THE ELDER LEFT THIS PAIR 2026-09-17, owner ruling A13 ("A13 - sounds good", 2026-09-14;
  // tasks/town-cast-rulings-a13-a17.md): she is granted the tavernkeeper's patrol cycle, so her cell
  // is no longer stable between two samples taken ~40 s apart — she is walking for 8 of every 41
  // seconds and the sheet advances while she does. Her standing contract moved to
  // e2e/elder-walk8-woman.spec.ts (one of HER sheets, feet anchored) and her motion contract to
  // e2e/town-t5-townsfolk.spec.ts ("a plain boot walks the Elder off her schoolhouse post").
  // The tavernkeeper stays: this pair's subject is a cast member whose cell the scene holds steady.
  for (const id of ['tavernkeeper'] as const) {
    expect(after.find((actor) => actor.id === id)?.frameKey).toBe(before.find((actor) => actor.id === id)?.frameKey);
    expect(after.find((actor) => actor.id === id)?.frameKey).toMatch(/c0\.png$/);
  }
  for (const id of ['preacher', 'schoolteacher', 'assay_clerk'] as const) {
    expect(after.find((actor) => actor.id === id)?.presentation).toBe('full_body');
    expect(after.find((actor) => actor.id === id)?.frameKey).toMatch(new RegExp(`char-${id.replace('_', '-')}-sheet-walk8-a-r\\d+c\\d+\\.png$`));
  }

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

function actorPost(actor: TownActorDefinition): { x: number; z: number } {
  const offset = actor.portraitPost?.offset ?? townPlazaLayout.actorOffsets[actor.id as keyof typeof townPlazaLayout.actorOffsets];
  const anchor = townBuildings.find((building) => building.id === actor.anchor);
  return offset && anchor
    ? { x: anchor.position.x + offset.x, z: anchor.position.z + offset.z }
    : actor.position;
}

function visualFootprintClearance(
  point: { x: number; z: number },
  building: (typeof townBuildings)[number],
): number {
  const approach = townPlazaSlot(building.id).approach;
  const yaw = Math.atan2(approach.x - building.position.x, approach.z - building.position.z);
  const dx = point.x - building.position.x;
  const dz = point.z - building.position.z;
  const outsideX = Math.abs(Math.cos(yaw) * dx - Math.sin(yaw) * dz) - building.footprint.w / 2;
  const outsideZ = Math.abs(Math.sin(yaw) * dx + Math.cos(yaw) * dz) - building.footprint.d / 2;
  return outsideX <= 0 && outsideZ <= 0
    ? -Math.min(-outsideX, -outsideZ)
    : Math.hypot(Math.max(0, outsideX), Math.max(0, outsideZ));
}

async function focusAssayOffice(page: Page): Promise<void> {
  const target = await page.evaluate(() => innerWidth <= 500 ? { x: 6.4, z: 7.4 } : { x: 4.8, z: 6.2 });
  await page.evaluate(({ x, z }) => window.__GR_TOWN_DIAGNOSTICS__!.teleport(x, z), target);
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__!.player)).toEqual(target);
  await page.waitForTimeout(400);
}

async function setEvidenceUi(page: Page, hidden: boolean): Promise<void> {
  for (const testId of ['town-approach-prompt', 'world-info-note', 'town-bark-card', 'story-beat-layer']) {
    await page.getByTestId(testId).evaluate((element, hide) => { element.style.visibility = hide ? 'hidden' : ''; }, hidden);
  }
}

async function assayShot(page: Page, project: string, zoom: string): Promise<void> {
  await page.screenshot({ path: path.join(assayArtifactDir, `${project}-assay-${zoom}.png`) });
}

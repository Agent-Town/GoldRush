import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { FIRST_CLAIM_DONE_KEY, PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { townTrail, type TownTrailPoint } from '../src/town/townLayout';
import type { TownActorId } from '../src/town/townsfolk';

const ARTIFACT_DIR = path.resolve('artifacts/ts-04-living-pass');
const PROFILE_ID = 'robin';
const MOVING_ACTORS = ['youngster_a', 'youngster_b', 'newsie', 'prospector'] as const satisfies readonly TownActorId[];

type Sample = { elapsed: number; actors: Partial<Record<TownActorId, { x: number; z: number; trailId: string | null }>> };

async function seedTown(page: Page): Promise<void> {
  await page.goto('/');
  await page.evaluate(({ profileKey, townKey, metaKey, guideKey }) => {
    localStorage.clear();
    sessionStorage.clear();
    const state: ProfileState = {
      version: 2,
      activeId: 'robin',
      profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
    };
    localStorage.setItem(profileKey, JSON.stringify(state));
    localStorage.setItem(townKey, 'Quartz Hill');
    localStorage.setItem(metaKey, JSON.stringify({ version: 1, tracks: { territory: 3, science: 0, hero: 0, agent: 0 } }));
    localStorage.setItem(guideKey, '1');
  }, {
    profileKey: PROFILE_KEY,
    townKey: profileDataKey(PROFILE_ID, TOWN_NAME_KEY),
    metaKey: profileDataKey(PROFILE_ID, META_PROGRESS_KEY),
    guideKey: profileDataKey(PROFILE_ID, FIRST_CLAIM_DONE_KEY),
  });
  await page.reload();
}

async function openTown(page: Page, tier: 'full' | 'lite'): Promise<void> {
  await page.evaluate((value) => history.replaceState(null, '', `/?tier=${value}`), tier);
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 24);
}

function distanceToRoute(point: TownTrailPoint, trailId: string): number {
  const route = townTrail(trailId);
  let nearest = Number.POSITIVE_INFINITY;
  const segmentCount = route.closed ? route.points.length : route.points.length - 1;
  for (let index = 0; index < segmentCount; index += 1) {
    const start = route.points[index]!;
    const end = route.points[(index + 1) % route.points.length]!;
    const dx = end.x - start.x;
    const dz = end.z - start.z;
    const lengthSq = dx * dx + dz * dz;
    const t = lengthSq > 0 ? Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.z - start.z) * dz) / lengthSq)) : 0;
    nearest = Math.min(nearest, Math.hypot(point.x - (start.x + dx * t), point.z - (start.z + dz * t)));
  }
  return nearest;
}

test('TS-04 actors follow baked trails for a 30s scene capture with no storage or sim writes', async ({ page }, testInfo: TestInfo) => {
  test.setTimeout(75_000);
  await seedTown(page);
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await openTown(page, 'full');
  const storageBefore = await page.evaluate(() => JSON.stringify({ ...localStorage }));
  const samples: Sample[] = [];

  for (let index = 0; index < 60; index += 1) {
    samples.push(await page.evaluate((actorIds) => {
      const diagnostics = window.__GR_TOWN_DIAGNOSTICS__!;
      return {
        elapsed: diagnostics.elapsed,
        actors: Object.fromEntries(actorIds.map((id) => {
          const actor = diagnostics.actors.find((entry) => entry.id === id)!;
          return [id, { ...actor.position, trailId: actor.trailId }];
        })),
      };
    }, MOVING_ACTORS));
    await page.waitForTimeout(500);
  }

  for (const sample of samples) {
    for (const id of MOVING_ACTORS) {
      const actor = sample.actors[id]!;
      expect(actor.trailId).not.toBeNull();
      expect(distanceToRoute(actor, actor.trailId!)).toBeLessThanOrEqual(0.03);
    }
  }
  expect(samples.some((sample) => Math.hypot(sample.actors.prospector!.x, sample.actors.prospector!.z) < 1.5)).toBe(true);
  const tavernPatch = townTrail('tavern').points.at(-1)!;
  expect(samples.some((sample) => Math.hypot(sample.actors.newsie!.x - tavernPatch.x, sample.actors.newsie!.z - tavernPatch.z) < 0.2)).toBe(true);

  const diagnostics = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__!);
  expect(diagnostics.actors.find((actor) => actor.id === 'newsie')).toMatchObject({ name: 'Chen Mei', trailId: 'tavern' });
  expect(diagnostics.ambientDust).toMatchObject({ enabled: true, tier: 'full', count: 48, drawCalls: 1 });
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__ ?? null)).toBeNull();
  expect(await page.evaluate(() => JSON.stringify({ ...localStorage }))).toBe(storageBefore);
  expect(errors).toEqual([]);

  await mkdir(ARTIFACT_DIR, { recursive: true });
  await Promise.all([
    writeFile(path.join(ARTIFACT_DIR, `${testInfo.project.name}-trail-adherence.json`), JSON.stringify(samples, null, 2)),
    page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-30s-living-town.png`), fullPage: true }),
  ]);
});

test('TS-04 ambient dust is tier-gated off on LITE', async ({ page }) => {
  await seedTown(page);
  await openTown(page, 'lite');
  expect(await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.ambientDust)).toMatchObject({ enabled: false, tier: 'lite', count: 0, drawCalls: 0 });
});

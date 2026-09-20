// @ts-nocheck
import { expect, test } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { MEDALS_KEY, profileDataKey } from '../../../src/game/ProfileStorage';
import { researchStateKey } from '../../../src/meta/ResearchTree';

const QUERY = '?debug&epoch=epoch-2-steamworks&contract=e2-hill-mine&nowaves&nolevel&nopause&nosteal&nowreck&timescale=8';
const candidates = [
  { label: 'rejected-old-coordinate', x: 0, z: 10 },
  { label: 'chosen-open-coordinate', x: 10, z: 12 },
];

test('measures the rejected and chosen F-1281-2 turret coordinates', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(
    ({ e1Research, e2Research, medals }) => {
      localStorage.setItem(e1Research, JSON.stringify({
        version: 1,
        steps: 4,
        taken: ['beacon_cadence', 'brass_coil_standards', 'powder_math', 'sky_rocket_battery'],
        proposalSalt: 0,
        pinnedTarget: null,
      }));
      localStorage.setItem(e2Research, JSON.stringify({
        version: 1,
        steps: 3,
        taken: ['boiler_lance', 'pressure_mortar', 'boiler_battery'],
        proposalSalt: 0,
        pinnedTarget: null,
      }));
      localStorage.setItem(medals, JSON.stringify({ version: 1, baronBeaten: true, rocketCartCaptured: true }));
    },
    {
      e1Research: profileDataKey('robin', researchStateKey('epoch-1-frontier')),
      e2Research: profileDataKey('robin', researchStateKey('epoch-2-steamworks')),
      medals: profileDataKey('robin', MEDALS_KEY),
    },
  );
  await page.goto(`${QUERY}&seed=e2-arsenal-${testInfo.project.name}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 16);
  const begin = page.getByRole('button', { name: 'Begin' });
  if (await begin.isVisible()) await begin.click();
  await page.evaluate(() => {
    window.__GR_TEST__?.setUpgradeStacks({ auto_pan: 1 });
    window.__GR_TEST__?.grantPressure(50);
    const seam = window.__THREE_GAME_DIAGNOSTICS__?.harvest.activeNodes.find((node) => node.active);
    if (seam) window.__GR_TEST__?.teleport(seam.position.x, seam.position.z);
    window.__GR_TEST__?.advanceSim(1.5);
  });

  const result = await page.evaluate(async (points) => {
    const [{ BuildSystem }, { getBuildableDef }, Terrain, TileHeight, LandmarkCollision, { Balance }] =
      await Promise.all([
        import('/src/systems/BuildSystem.ts'),
        import('/src/game/buildables.ts'),
        import('/src/world/Terrain.ts'),
        import('/src/sim/TileHeight.ts'),
        import('/src/world/LandmarkCollision.ts'),
        import('/src/game/Balance.ts'),
      ]);
    const prototype = BuildSystem.prototype as any;
    const originalPlaceFree = prototype.placeFree;
    const originalSnap = prototype.snap;
    const buildZones = window.__GR_TEST__!.activeContract().tileParams.buildZones ?? [];
    const collisionPad = Balance.hero.radius + 0.08;
    const measured = [];

    for (const point of points) {
      let doors: any = null;
      let buildSystem: any = null;
      prototype.placeFree = function (...args: any[]) {
        buildSystem = this;
        return originalPlaceFree.apply(this, args);
      };
      prototype.snap = function (target: any) {
        const value = originalSnap.call(this, target);
        if (!doors && buildSystem) {
          const def = getBuildableDef('turret');
          if (!def) throw new Error('turret definition missing');
          doors = {
            definitionPresent: true,
            enabled: buildSystem.isBuildableEnabled(def.id),
            countFor: buildSystem.countFor(def.id),
            maxCountFor: buildSystem.maxCountFor(def),
            snappedTarget: { x: target.x, y: target.y, z: target.z },
            matchesPlacement: buildSystem.matchesPlacement(def, target),
            overlapsExisting: buildSystem.overlapsExisting(def.id, target),
            placementKind: def.placement,
          };
        }
        return value;
      };

      let placeResult: boolean;
      try {
        placeResult = window.__GR_TEST__!.placeFree('turret', point.x, point.z);
      } finally {
        prototype.placeFree = originalPlaceFree;
        prototype.snap = originalSnap;
      }
      if (!doors) throw new Error('placement doors were not captured');

      const target = doors.snappedTarget;
      const blockerMeasurements = Terrain.landmarkBlockers().map((blocker: any) => {
        const dx = Math.abs(target.x - blocker.x);
        const dz = Math.abs(target.z - blocker.z);
        const paddedHalfX = blocker.halfX + collisionPad;
        const paddedHalfZ = blocker.halfZ + collisionPad;
        const containsPadded = LandmarkCollision.blockerContains(blocker, target.x, target.z, collisionPad);
        const clearance = containsPadded
          ? -Math.min(paddedHalfX - dx, paddedHalfZ - dz)
          : Math.hypot(Math.max(0, dx - paddedHalfX), Math.max(0, dz - paddedHalfZ));
        return {
          ...blocker,
          containsUnpadded: LandmarkCollision.blockerContains(blocker, target.x, target.z),
          containsPadded,
          paddedEdgeClearance: clearance,
        };
      });

      measured.push({
        ...point,
        placeResult,
        ...doors,
        terrain: Terrain.sample(target.x, target.z),
        terrainBuildable: Terrain.isBuildable(target.x, target.z),
        tileTraversable: TileHeight.isTraversable(target.x, target.z),
        buildZoneMatches: buildZones.filter(
          (zone: any) =>
            target.x >= zone.minX && target.x <= zone.maxX &&
            target.z >= zone.minZ && target.z <= zone.maxZ,
        ),
        collisionPad,
        blockerMeasurements,
      });
    }
    return measured;
  }, candidates);

  await writeFile(
    path.join('logs/session-scratch/s1286-lane-a', `candidate-probe-${testInfo.project.name}.json`),
    `${JSON.stringify(result, null, 2)}\n`,
  );
  console.log(`CANDIDATE_PROBE ${testInfo.project.name} ${JSON.stringify(result)}`);
  expect(result[0].placeResult).toBe(false);
  expect(result[1].placeResult).toBe(true);
  expect(errors).toEqual([]);
});

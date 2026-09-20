// @ts-nocheck
import { expect, test } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { MEDALS_KEY, profileDataKey } from '../../../src/game/ProfileStorage';
import { researchStateKey } from '../../../src/meta/ResearchTree';

const QUERY = '?debug&epoch=epoch-2-steamworks&contract=e2-hill-mine&nowaves&nolevel&nopause&nosteal&nowreck&timescale=8';

test('measures every placeFree door for the stale turret coordinate', async ({ page }, testInfo) => {
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

  const result = await page.evaluate(async () => {
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
    let buildSystem: any = null;
    let target: any = null;
    prototype.placeFree = function (...args: any[]) {
      buildSystem = this;
      return originalPlaceFree.apply(this, args);
    };
    prototype.snap = function (position: any) {
      const result = originalSnap.call(this, position);
      target = position;
      return result;
    };
    let placeResult: boolean;
    try {
      placeResult = window.__GR_TEST__!.placeFree('turret', 0, 10);
    } finally {
      prototype.placeFree = originalPlaceFree;
      prototype.snap = originalSnap;
    }
    if (!buildSystem) throw new Error('BuildSystem instance was not captured');
    if (!target) throw new Error('snapped target was not captured');

    const def = getBuildableDef('turret');
    if (!def) throw new Error('turret definition missing');
    const terrain = Terrain.sample(target.x, target.z);
    const blockers = Terrain.landmarkBlockers();
    const collisionPad = Balance.hero.radius + 0.08;
    const blockingLandmarks = blockers
      .filter((blocker: any) => LandmarkCollision.blockerContains(blocker, target.x, target.z, collisionPad))
      .map((blocker: any) => ({
        ...blocker,
        containsUnpadded: LandmarkCollision.blockerContains(blocker, target.x, target.z),
      }));
    const buildZones = window.__GR_TEST__!.activeContract().tileParams.buildZones ?? [];

    return {
      placeResult,
      definitionPresent: true,
      enabled: buildSystem.isBuildableEnabled(def.id),
      countFor: buildSystem.countFor(def.id),
      maxCountFor: buildSystem.maxCountFor(def),
      snappedTarget: { x: target.x, y: target.y, z: target.z },
      matchesPlacement: buildSystem.matchesPlacement(def, target),
      overlapsExisting: buildSystem.overlapsExisting(def.id, target),
      placementKind: def.placement,
      terrain,
      terrainBuildable: Terrain.isBuildable(target.x, target.z),
      tileTraversable: TileHeight.isTraversable(target.x, target.z),
      terrainSim: TileHeight.terrainSimSample(target.x, target.z),
      buildZoneMatches: buildZones.filter(
        (zone: any) =>
          target.x >= zone.minX && target.x <= zone.maxX &&
          target.z >= zone.minZ && target.z <= zone.maxZ,
      ),
      collisionPad,
      blockingLandmarks,
    };
  });

  await writeFile(
    path.join('logs/session-scratch/s1284-lane-d', `door-probe-${testInfo.project.name}.json`),
    `${JSON.stringify(result, null, 2)}\n`,
  );
  console.log(`DOOR_PROBE ${testInfo.project.name} ${JSON.stringify(result)}`);
  expect(result.placeResult).toBe(false);
  expect(errors).toEqual([]);
});

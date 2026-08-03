import { expect, test, type Page } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { watchErrors, expectNoConsoleErrors } from './support/console-watch';

const ARTIFACT_DIR = path.resolve('artifacts/shore-truth');
const EPSILON = 0.001;

async function boot(page: Page, contract: string): Promise<void> {
  await page.goto(`/?debug&contract=${contract}&nowaves&nolevel&nopause&seed=shore-truth-${contract}`);
  const begin = page.getByRole('button', { name: 'Begin' });
  if (await begin.isVisible()) await begin.click();
  await page.waitForFunction(() =>
    Boolean(window.__GR_TEST__) &&
    (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10 &&
    document.querySelector('canvas')?.dataset.terrain3dPilotState === 'ready',
  );
}

test('live water shores match sim truth and the first dry shore cell accepts a sluice', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const errors = watchErrors(page);
  await boot(page, 'e1-dry-gulch');
  const pond = await page.evaluate(async () => {
    const terrain = await Function('return import("/src/world/Terrain.ts")')() as typeof import('../src/world/Terrain');
    const source = terrain.waterSources()[0]!;
    const canvas = document.querySelector('canvas')!;
    return {
      simRadius: source.radius,
      visualRadii: JSON.parse(canvas.dataset.terrain3dPilotSpringPondWaterRadii ?? '[]') as number[],
      dampGroundRadii: JSON.parse(canvas.dataset.terrain3dPilotSpringPondDampGroundRadii ?? '[]') as number[],
      inside: terrain.sample(source.x, source.z + source.radius - 0.001).zone,
      outside: terrain.sample(source.x, source.z + source.radius + 0.001).zone,
      firstBuildCenter: {
        x: source.x,
        z: source.z + 3,
        zone: terrain.sample(source.x, source.z + 3).zone,
        adjacent: terrain.isWaterSourceAdjacent(source.x, source.z + 3, 2),
      },
    };
  });
  expect(pond.visualRadii).toHaveLength(1);
  expect(Math.abs(pond.visualRadii[0]! - pond.simRadius)).toBeLessThanOrEqual(EPSILON);
  expect(pond.dampGroundRadii[0]).toBeGreaterThan(pond.simRadius);
  expect(pond.inside).toBe('shallows');
  expect(pond.outside).toBe('bank');
  expect(pond.firstBuildCenter).toMatchObject({ x: -18, z: -15, zone: 'bank', adjacent: true });

  await page.evaluate(() => {
    window.__GR_TEST__!.grantGold(120);
    window.__GR_TEST__!.teleport(-18, -13);
    window.__GR_TEST__!.selectBuildable('sluice');
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostPos)).toEqual({ x: -18, z: -15 });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid)).toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__!.confirmBuild())).resolves.toBe(true);
  await page.evaluate(() => window.__GR_TEST__!.teleport(-18, -15));
  let previous = await page.evaluate(() => window.__GR_TEST__!.screenPoint(-18, -15, 0));
  await expect.poll(async () => {
    await page.waitForTimeout(100);
    const next = await page.evaluate(() => window.__GR_TEST__!.screenPoint(-18, -15, 0));
    const movement = Math.hypot(next.x - previous.x, next.y - previous.y);
    previous = next;
    return movement;
  }, { timeout: 10_000 }).toBeLessThan(0.1);

  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `after-${testInfo.project.name}.png`) });

  await boot(page, 'the-claim');
  const claim = await page.evaluate(async () => {
    const terrain = await Function('return import("/src/world/Terrain.ts")')() as typeof import('../src/world/Terrain');
    const halfWidth = terrain.visualWaterHalfWidth();
    return {
      simHalfWidth: halfWidth,
      visualHalfWidth: Number(document.querySelector('canvas')?.dataset.terrain3dPilotSculptWaterHalfWidth),
      inside: terrain.sample(12, halfWidth - 0.001).zone,
      outside: terrain.sample(12, halfWidth + 0.001).zone,
    };
  });
  expect(Math.abs(claim.visualHalfWidth - claim.simHalfWidth)).toBeLessThanOrEqual(EPSILON);
  expect(claim.inside).toBe('shallows');
  expect(claim.outside).toBe('bank');

  await boot(page, 'e1-twin-banks');
  const twinBanks = await page.evaluate(async () => {
    const terrain = await Function('return import("/src/world/Terrain.ts")')() as typeof import('../src/world/Terrain');
    const visualHalfWidths = (JSON.parse(document.querySelector('canvas')?.dataset.terrain3dPilotChannelWaterHalfWidths ?? '[]') as number[])
      .sort((a, b) => a - b);
    return { simHalfWidth: terrain.visualWaterHalfWidth(), visualHalfWidths };
  });
  const twinContract = JSON.parse(await readFile(path.resolve('assets/pilots/map-rebuild-spike/twin-banks-terrain-contract.json'), 'utf8')) as {
    maskTruth: { waterMask: { regions: Array<{ kind: string; zone: string; halfWidth?: number }> } };
  };
  const maskHalfWidths = twinContract.maskTruth.waterMask.regions
    .filter((region) => region.kind === 'polyline_band' && region.zone === 'river')
    .map((region) => region.halfWidth!)
    .sort((a, b) => a - b);
  expect(twinBanks.visualHalfWidths).toHaveLength(2);
  twinBanks.visualHalfWidths.forEach((width, index) => {
    expect(Math.abs(width - maskHalfWidths[index]!)).toBeLessThanOrEqual(EPSILON);
    expect(width).toBeLessThanOrEqual(twinBanks.simHalfWidth + EPSILON);
  });

  await writeFile(path.join(ARTIFACT_DIR, `audit-${testInfo.project.name}.json`), `${JSON.stringify({ pond, claim, twinBanks: { ...twinBanks, maskHalfWidths } }, null, 2)}\n`);
  expectNoConsoleErrors(errors);
});

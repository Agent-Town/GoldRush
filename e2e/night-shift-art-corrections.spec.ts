import { expect, test } from '@playwright/test';
import { PNG } from 'pngjs';

test('Night Shift water preserves the ford and the opaque yard receives only live pool light', async ({ page }) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  const luminance: number[] = [];
  for (const pools of [false, true]) {
    // Negative control removes only the yard's pool hookup, keeping its diffuse
    // grade and all real gameplay lights identical to the production arm.
    await page.route('**/src/world/Terrain3dClaimPilot.ts*', async route => {
      const response = await route.fetch();
      const body = await response.text();
      const hookup = 'applyNightTerrainPools(model, host, true);';
      expect(body.split(hookup)).toHaveLength(2);
      await route.fulfill({ response, body: pools ? body : body.replace(hookup, '') });
    });
    await page.goto('/?debug&contract=e1-night-shift&seed=night-art-pools&nowaves&nolevel&nokill&nopause&tier=full');
    await page.waitForFunction(() => window.__GR_TEST__ && document.querySelector<HTMLCanvasElement>('#game-canvas')?.dataset.terrain3dPilotLandmarkLoadState === 'mounted');
    if (await page.getByTestId('contract-briefing-dismiss').isVisible()) await page.getByTestId('contract-briefing-dismiss').click();
    await page.evaluate(() => {
      window.__GR_TEST__!.setManualSim(true);
      window.__GR_TEST__!.setWave(10);
      window.__GR_TEST__!.teleport(8, 23);
    });
    await page.waitForTimeout(500);
    const state = await page.evaluate(() => {
      const ds = document.querySelector<HTMLCanvasElement>('#game-canvas')!.dataset;
      return {
        water: ds.terrain3dPilotSculptWater,
        width: Number(ds.terrain3dPilotSculptWaterHalfWidth),
        declaredWidth: Number(ds.terrain3dPilotSculptWaterSimHalfWidth),
        fords: ds.terrain3dPilotSculptWaterFords,
        lanterns: window.__THREE_GAME_DIAGNOSTICS__!.build.hp.filter(b => b.id === 'lantern_post'),
        yard: JSON.parse(ds.terrain3dPilotLandmarkMaterials!).find((m: { id: string }) => m.id === 'lampworks_yard'),
        point: window.__GR_TEST__!.screenPoint(8, 20, 2),
      };
    });
    expect(state.water).toBe('living-water-quad');
    expect(state.width).toBeLessThanOrEqual(state.declaredWidth);
    expect(state.fords).toBe('center-ford@0');
    expect(state.lanterns).toHaveLength(7);
    expect(state.lanterns.every(l => l.wrecked)).toBe(true);
    expect(state.yard).toMatchObject({ transparent: 0, depthWriteDisabled: 0, authoredEmissive: [] });
    expect(state.point.inView).toBe(true);
    const png = PNG.sync.read(await page.screenshot());
    const box = await page.locator('#game-canvas').boundingBox();
    expect(box).not.toBeNull();
    const x = Math.round(state.point.x * png.width / box!.width);
    const y = Math.round(state.point.y * png.height / box!.height);
    const samples: number[] = [];
    for (let py = y - 5; py <= y + 5; py++) for (let px = x - 5; px <= x + 5; px++) {
      const i = (py * png.width + px) * 4;
      samples.push((png.data[i]! * .2126 + png.data[i + 1]! * .7152 + png.data[i + 2]! * .0722) / 255);
    }
    samples.sort((a, b) => a - b);
    luminance.push(samples[Math.floor(samples.length / 2)]!);
    await page.unroute('**/src/world/Terrain3dClaimPilot.ts*');
  }
  expect(luminance[1]! - luminance[0]!).toBeGreaterThan(.01);
  expect(errors).toEqual([]);
});

import { expect, test } from '@playwright/test';

for (const contract of ['e5-deepwater-claim', 'e5-regatta', 'e5-stillwater', 'e5-flotilla']) {
  test(`${contract}: sea apron preserves geometry and hull contact loads without render errors`, async ({ page }) => {
    test.setTimeout(90_000);
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto(`/?debug&contract=${contract}&epoch=epoch-5-deepwater&nowaves&nolevel&nopause`);
    await page.waitForFunction(() => window.__GR_TEST__, null, { timeout: 60_000 });
    await page.evaluate(() => window.__GR_TEST__!.setManualSim(true));
    const count = contract === 'e5-flotilla' ? 3 : 1;
    await expect.poll(async () => page.locator('#game-canvas').evaluate(canvas => {
      const rows = JSON.parse((canvas as HTMLCanvasElement).dataset.terrain3dPilotHullWaterlines ?? '[]');
      return rows.length;
    }), { timeout: 60_000 }).toBe(count);
    const canvas = page.locator('#game-canvas');
    await expect(canvas).toHaveAttribute('data-terrain3d-pilot-sea-apron-triangles', '768');
    await expect(canvas).toHaveAttribute('data-terrain3d-pilot-panorama-triangles', '2704');
    await expect(canvas).toHaveAttribute('data-terrain3d-pilot-sculpt-water-y', '0.0000');
    const contacts = await canvas.evaluate(element => JSON.parse((element as HTMLCanvasElement).dataset.terrain3dPilotHullWaterlines!)) as Array<{ hull: string; triangles: number }>;
    expect(contacts.every(row => row.triangles > 0 && row.triangles <= 2000)).toBe(true);
    expect(contacts.map(row => row.hull).sort()).toEqual(contract === 'e5-flotilla'
      ? ['kitchen-scow', 'still-room-barge', 'turret-raft'] : ['ClaimBoatView']);
    await page.waitForTimeout(500);
    expect(errors).toEqual([]);
  });
}

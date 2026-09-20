import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';

/**
 * THE OWNER'S ACCEPTANCE TEST, shot for tomorrow. His report, 2026-08-21, verbatim: *"I was not
 * able to ever obtain coal or use the pressure weapons when I played maps in E2"*.
 *
 * What the measurement found (`coal-visual-probe.spec.ts`) is that the coal was never BURIED — every
 * lump is flush to 0.000 m and drawing — and never unobtainable: standing on one for 0.8 s yields
 * its 4 coal. What was missing was any way to learn it existed. The Hill Mine's briefing named the
 * terraces, the switchbacks and the flooded gallery and **never mentioned coal**, while
 * `e2-pressure-garden`'s briefing had said *"The coal seams cluster on the highest terrace above the
 * boiler beds"* all along. The cure is that missing sentence, in the same voice, on the three maps
 * that lacked it.
 *
 * These three frames are the acceptance evidence, in the order a player meets them:
 *   1. `briefing`   — the card he reads on Begin, now telling him where the coal is.
 *   2. `coal-seen`  — the lump on screen, unharvested, on the ground he walks on.
 *   3. `coal-cut`   — the +4 coal the moment a body has stood on it long enough.
 */

const ARTIFACT_DIR = path.resolve('artifacts/e2-pressure-line/coal-shots');
const CONTRACT = 'e2-hill-mine';

test('a player can find the Hill Mine coal, and cut it', async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  const problems: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') problems.push(`${message.type()}: ${message.text()}`);
  });
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
  await mkdir(ARTIFACT_DIR, { recursive: true });

  await page.goto(`/?debug&contract=${CONTRACT}&nowaves&nolevel&nopause&nosteal&seed=coal-acceptance`);
  await page.waitForFunction(() => Boolean(window.__GR_TEST__) && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 20, undefined, { timeout: 60_000 });

  // 1. THE BRIEFING — the sentence that was missing.
  const briefing = page.getByTestId('contract-briefing-dismiss');
  if (await briefing.isVisible()) {
    await expect(page.getByText('Coal seams lie at the mine mouth')).toBeVisible();
    await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-acceptance-1-briefing.png`) });
    await briefing.evaluate((button: HTMLButtonElement) => button.click());
  }
  await page.waitForFunction(
    () => document.querySelector('canvas')?.dataset.terrain3dPilotTerrainLoadState === 'mounted',
    undefined,
    { timeout: 90_000 },
  );

  // 2. THE SEAM ON SCREEN, still uncut. Stand just outside `coalHarvestRange` (1.35) so the lump is
  // framed and intact — this is the frame that answers "is there anything there at all".
  const seam = (await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.pressure!.seams[0]!));
  expect(seam.spriteVisible).toBe(true);
  await page.evaluate(([x, z]) => window.__GR_TEST__!.teleport(x as number, (z as number) - 3), [seam.x, seam.z]);
  await page.waitForTimeout(900);
  const onScreen = await page.evaluate(
    ([x, y, z]) => window.__GR_TEST__!.screenPoint(x as number, z as number, y as number),
    [seam.x, seam.visualY, seam.z],
  );
  expect(onScreen.inView, 'the coal is where the player is looking').toBe(true);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.pressure!.coal)).toBe(0);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-acceptance-2-coal-seen.png`) });

  // 3. THE CUT. Walk the last 3 m onto it and hold: `coalHarvestSeconds` is 0.8.
  await page.evaluate(([x, z]) => window.__GR_TEST__!.teleport(x as number, z as number), [seam.x, seam.z]);
  await page.waitForTimeout(1_100);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-acceptance-3-coal-cut.png`) });
  const after = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.pressure!);
  expect(after.coal, 'the coal is in the bunker').toBeGreaterThan(0);
  expect(after.seams[0]!.harvested, 'that seam is spent').toBe(true);
  console.log(`${testInfo.project.name} ACCEPTANCE: coal=${after.coal} seam0 harvested=${after.seams[0]!.harvested}`
    + ` seamSource=${after.seamSource} inView=${onScreen.inView}`);

  expect(problems).toEqual([]);
});

import { expect, test, type Page } from '@playwright/test';
import { PNG } from 'pngjs';

/**
 * THE SEAM MUST STAND ON THE GROUND THE PLAYER WALKS ON.
 *
 * Owner, 2026-08-20, playing e9-seed-run: "There is not gold to be collected." The sim was
 * perfect — seams placed, tooltip firing, the pan banking gold — and the ground was bare. The
 * seams were being placed the instant the run was built, which is long before a sculpted map's
 * GLB has loaded and called `installVisualHeightSource` (`src/world/Terrain3dClaimPilot.ts`).
 * Until that moment `visualY` answers with the LEGACY painted heightfield, and
 * `Game.resampleVisualHeights()` — the hook that re-lifts everything else placed early — did not
 * know about the seams. Measured in-engine at every authored anchor of all 33 seam-bearing
 * sculpted maps: 21 sat BELOW their sculpt (worst: e3-blackout-ridge at 6.18 m under), 8 floated
 * ABOVE it (worst: e5-deepwater-claim at 5.63 m up), 4 happened to be flush. A buried ground-decal
 * sprite is, in play, no seam at all.
 *
 * This is the class's regression pin, and it asserts the VISUAL, not the tooltip:
 *   1. every live seam's sprite is actually drawing, and
 *   2. its visual is standing on the CURRENT terrain height (the pre-fix defect was a metres-wide
 *      gap between those two numbers), and
 *   3. the seam's screen position is really in the player's view, and
 *   4. those pixels really are the seam: draining it to nothing changes that patch of screen far
 *      more than the same interval changes bare ground beside it.
 *
 * (1)-(3) run on a PLAIN boot of The Claim — no `?debug`, Mistake #10 — because The Claim is the
 * map every player starts on. (4) needs the sim clock, so it carries `?debug` and runs on
 * e9-seed-run, the map the owner reported.
 */

const SEAM_LIFT = 0.05; // GoldNode.place / GoldNodeVisualBatch.show
const FLUSH_TOLERANCE = 0.01;

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

test.setTimeout(180_000);

test.beforeEach(async ({ page }, testInfo) => page.addInitScript((key) => {
  if (!sessionStorage.getItem(key)) {
    localStorage.clear();
    sessionStorage.setItem(key, '1');
  }
}, `seam-visual-${testInfo.testId}`));

function collectErrors(page: Page): ErrorBucket {
  const errors: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => message.type() === 'error' && errors.consoleErrors.push(message.text()));
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  return errors;
}

async function bootSculpted(page: Page, contract: string, debug: boolean): Promise<void> {
  await page.goto(`/?contract=${contract}&nolevel&nopause&seed=sr01${debug ? '&debug' : ''}`);
  await page.waitForFunction((id) => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === id, contract, { timeout: 60_000 });
  if (debug) await page.waitForFunction(() => Boolean(window.__GR_TEST__), { timeout: 60_000 });
  const dismiss = page.getByTestId('contract-briefing-dismiss');
  if (await dismiss.isVisible()) await dismiss.evaluate((button: HTMLButtonElement) => button.click());
  // The whole defect lives on the far side of this wait: the sculpt's height source is installed
  // when the GLB mounts, and only then can a stale seam be told apart from a correct one.
  await page.waitForFunction(
    () => document.querySelector('canvas')?.dataset.terrain3dPilotTerrainLoadState === 'mounted',
    undefined,
    { timeout: 90_000 },
  );
  await page.waitForFunction(
    () => (window.__THREE_GAME_DIAGNOSTICS__?.harvestVisuals?.seams.length ?? 0) > 0,
    undefined,
    { timeout: 30_000 },
  );
}

const seams = (page: Page) => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.harvestVisuals!.seams);

test('a live seam stands on the sculpted ground, drawing, in a plain boot', async ({ page }) => {
  const errors = collectErrors(page);
  await bootSculpted(page, 'the-claim', false);

  const live = await seams(page);
  expect(live.length).toBeGreaterThan(0);
  for (const seam of live) {
    expect(seam.spriteVisible, `${seam.id} sprite drawing`).toBe(true);
    expect(Number.isFinite(seam.visualY), `${seam.id} has a placed visual Y`).toBe(true);
    // THE PIN. Pre-fix this gap was the sculpt's whole relief — up to 6.18 m on some maps.
    expect(Math.abs(seam.visualY - (seam.groundY + SEAM_LIFT)), `${seam.id} flush with terrain`).toBeLessThanOrEqual(FLUSH_TOLERANCE);
  }

  expect(errors.pageErrors).toEqual([]);
  expect(errors.consoleErrors).toEqual([]);
});

test('the seam the owner could not see is on the ground and in view', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  await bootSculpted(page, 'e9-seed-run', true);

  const live = await seams(page);
  expect(live.length).toBeGreaterThan(0);
  for (const seam of live) {
    expect(seam.spriteVisible, `${seam.id} sprite drawing`).toBe(true);
    expect(Math.abs(seam.visualY - (seam.groundY + SEAM_LIFT)), `${seam.id} flush with terrain`).toBeLessThanOrEqual(FLUSH_TOLERANCE);
  }

  const target = live[0]!;
  await page.evaluate(([x, z]) => window.__GR_TEST__!.teleport(x as number, (z as number) + 3), [target.x, target.z]);
  await page.waitForTimeout(600);
  const onScreen = await page.evaluate(
    ([x, y, z]) => window.__GR_TEST__!.screenPoint(x as number, z as number, y as number),
    [target.x, target.visualY, target.z],
  );
  expect(onScreen.inView, 'the seam is where the player is looking').toBe(true);

  await testInfo.attach('seam-in-view', { body: await page.screenshot(), contentType: 'image/png' });
  expect(errors.pageErrors).toEqual([]);
  expect(errors.consoleErrors).toEqual([]);
});

/**
 * THE COAL IS A SEAM TOO, AND NOTHING WAS MEASURING IT (owner playtest 2026-08-21, verbatim: "I was
 * not able to ever obtain coal or use the pressure weapons when I played maps in E2").
 *
 * The suspicion was this file's own class: `PressureSystem` is NOT on `Game.resampleVisualHeights()`
 * — the hook whose omission buried the gold. MEASURED: coal is NOT buried, and the reason is a real
 * difference worth pinning rather than a lucky escape. `GoldNode` places its sprite ONCE at spawn,
 * so it needs the hook; `PressureSystem.syncSeams()` recomputes `Terrain.visualAnchorY` EVERY FRAME
 * inside `update()`, so a late-mounting sculpt is picked up on the next tick and the lump is
 * self-healing by construction. **Do not "fix" PressureSystem by adding it to that list — its
 * absence is correct.** This pin is what makes that safe to rely on: if the per-frame resync is ever
 * refactored into a one-shot, these numbers go red instead of the owner finding it in play.
 */
test('the coal seam stands on the sculpted ground too', async ({ page }) => {
  const errors = collectErrors(page);
  await bootSculpted(page, 'e2-hill-mine', true);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.pressure?.seams.length ?? 0) > 0, undefined, { timeout: 30_000 });

  const pressure = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.pressure);
  expect(pressure.enabled, 'the Hill Mine runs a pressure line').toBe(true);
  expect(pressure.seams.length).toBeGreaterThan(0);
  // `PressureSystem.SEAM_LIFT` — the lift `syncSeams` stands a coal lump on.
  const COAL_LIFT = 0.32;
  for (const seam of pressure.seams) {
    expect(seam.spriteVisible, `coal (${seam.x},${seam.z}) drawing`).toBe(true);
    expect(Number.isFinite(seam.visualY), `coal (${seam.x},${seam.z}) has a placed visual Y`).toBe(true);
    expect(
      Math.abs(seam.visualY - (seam.groundY + COAL_LIFT)),
      `coal (${seam.x},${seam.z}) flush with terrain`,
    ).toBeLessThanOrEqual(FLUSH_TOLERANCE);
  }

  expect(errors.pageErrors).toEqual([]);
  expect(errors.consoleErrors).toEqual([]);
});

test('those pixels are the seam: draining it clears that patch of screen', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome', 'one viewport is enough for a pixel identity proof');
  const errors = collectErrors(page);
  await bootSculpted(page, 'e9-seed-run', true);

  await page.evaluate(() => {
    window.__GR_TEST__!.setManualSim(true);
    window.__GR_TEST__!.setBalance('enemy.contactDamage', 0);
  });

  const target = (await seams(page))[0]!;
  // Inside Balance.goldSeam.channelRange (1.6) so the pan runs, and far enough down-screen that
  // the hero's own sprite is not what the crop is measuring.
  await page.evaluate(([x, z]) => window.__GR_TEST__!.teleport(x as number, (z as number) + 1.4), [target.x, target.z]);
  await page.waitForTimeout(600);

  const point = await page.evaluate(
    ([x, y, z]) => window.__GR_TEST__!.screenPoint(x as number, z as number, y as number),
    [target.x, target.visualY, target.z],
  );
  const clip = { x: Math.round(point.x - 34), y: Math.round(point.y - 40), width: 68, height: 34 };
  // Bare ground 8 m west of the seam, framed by the same camera: the control for whatever the
  // clock does to the light while the pan runs.
  const controlPoint = await page.evaluate(
    ([x, y, z]) => window.__GR_TEST__!.screenPoint(x as number, z as number, y as number),
    [target.x - 8, target.visualY, target.z],
  );
  const controlClip = { x: Math.round(controlPoint.x - 34), y: Math.round(controlPoint.y - 40), width: 68, height: 34 };

  const seamBefore = await page.screenshot({ clip });
  const controlBefore = await page.screenshot({ clip: controlClip });

  // Balance.goldSeam: 30 capacity at 5 gold per 1.5 s tick = 9 s of panning to exhaust it.
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(14));
  await page.waitForFunction(
    (id) => window.__THREE_GAME_DIAGNOSTICS__!.harvestVisuals!.seams.every((seam) => seam.id !== id),
    target.id,
    { timeout: 30_000 },
  );
  await page.waitForTimeout(400);

  const seamAfter = await page.screenshot({ clip });
  const controlAfter = await page.screenshot({ clip: controlClip });
  const seamChanged = changedFraction(seamBefore, seamAfter);
  const controlChanged = changedFraction(controlBefore, controlAfter);

  await testInfo.attach('seam-before', { body: seamBefore, contentType: 'image/png' });
  await testInfo.attach('seam-after', { body: seamAfter, contentType: 'image/png' });
  console.log(`seam pixels changed: ${(seamChanged * 100).toFixed(1)}%  control: ${(controlChanged * 100).toFixed(1)}%`);

  expect(seamChanged, 'the seam owned these pixels').toBeGreaterThan(0.2);
  expect(seamChanged, 'and it was the seam, not the light').toBeGreaterThan(controlChanged * 4 + 0.05);
  expect(errors.pageErrors).toEqual([]);
  expect(errors.consoleErrors).toEqual([]);
});

/** Fraction of pixels whose colour moved by more than a compression/dither noise floor. */
function changedFraction(before: Buffer, after: Buffer): number {
  const a = PNG.sync.read(before);
  const b = PNG.sync.read(after);
  if (a.width !== b.width || a.height !== b.height) return 1;
  let changed = 0;
  for (let index = 0; index < a.data.length; index += 4) {
    const delta = Math.max(
      Math.abs(a.data[index]! - b.data[index]!),
      Math.abs(a.data[index + 1]! - b.data[index + 1]!),
      Math.abs(a.data[index + 2]! - b.data[index + 2]!),
    );
    if (delta > 12) changed += 1;
  }
  return changed / (a.width * a.height);
}

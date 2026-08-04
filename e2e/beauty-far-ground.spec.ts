import { readFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { PNG } from 'pngjs';

// THE FAR GROUND — the door, and the guard on the finding that funded it.
//
// Two beauty briefs (the-claim U4, twin-banks U5) asked for a repainted sky, and the panorama ring
// is not on camera: measured 0.00% of frame at 56 pose x viewport samples, and 0.00% again with the
// terrain and apron HIDDEN, while the probe's receipt proved the ring was flat magenta the whole
// time (reviews/beauty-far-ground.md section 1). The horizon a player sees is the far GROUND.
//
// EVERY ASSERT HERE IS MACHINE-INDEPENDENT BY CODE PATH, not by luck — the F-1440-2 cure. Nothing
// compares against a number recorded on another host: the geometry test is pure projection maths,
// the draw-call test is an equality between two arms of the SAME page, and the band test is a diff
// between two arms captured seconds apart in one browser. The only cross-run comparison lives
// behind GR_FAR_GROUND_COMPARE, and with the flag off the baseline file is structurally unread.
const COMPARE_BASELINE = process.env.GR_FAR_GROUND_COMPARE === '1';

const MAPS = [
  { contract: 'the-claim', art: 'the-claim' },
  { contract: 'e1-dry-gulch', art: 'dry-gulch' },
  { contract: 'e1-twin-banks', art: 'twin-banks' },
  { contract: 'e1-baron', art: 'baron' },
] as const;

type Errors = { console: string[]; page: string[] };

/** The ring's own numbers, read from its shipped contract — never hardcoded into the assert. */
function ring(art: string): { footRadius: number; footY: number } {
  const file = path.resolve(`assets/pilots/map-rebuild-spike/${art}-panorama-contract.json`);
  const contract = JSON.parse(readFileSync(file, 'utf8')) as {
    projection: { ridgeFootRadiusMeters: number; skyBottomMeters: number };
  };
  return { footRadius: contract.projection.ridgeFootRadiusMeters, footY: contract.projection.skyBottomMeters };
}

test.describe('the far ground', () => {
  for (const { contract, art } of MAPS) {
    test(`${contract}: the panorama's foot is above the top edge of the frame, and the apron is painted`, async ({ page }) => {
      test.setTimeout(120_000);
      const errors = collectErrors(page);
      await bootRun(page, contract, 'door');
      const canvas = page.locator('#game-canvas');

      // THE FINDING, AS A GUARD. A point at the ring's foot radius and the ring's foot height
      // projects ABOVE the top of the canvas (screen y < 0), so no part of the ring can be on
      // screen. This is projection arithmetic through the real camera matrix: no GPU, no timing,
      // no host. It goes red the day someone lifts the camera — which is exactly the day the
      // shelved sky briefs become fundable again, and the day this file should be re-read.
      const { footRadius, footY } = ring(art);
      const foot = await page.evaluate(
        ([r, y]) => window.__GR_TEST__!.screenPoint(0, -r, y),
        [footRadius, footY] as const,
      );
      expect(foot.y, `${contract}: ring foot at r=${footRadius} y=${footY} must sit above the frame`).toBeLessThan(0);

      // Mistake #10: where does the player see this, in a plain boot? On the ground, with no flag.
      await expect(canvas).toHaveAttribute('data-terrain3d-pilot-continuation', 'sculpt-edge-continuation');
      await expect(canvas).toHaveAttribute('data-terrain3d-pilot-horizon-apron', 'painted');
      expect(errors).toEqual({ console: [], page: [] });
    });
  }

  test('the apron costs zero draw calls, and ?horizonApron=off is a real A/B', async ({ page }) => {
    test.setTimeout(180_000);
    const errors = collectErrors(page);
    for (const { contract } of MAPS) {
      // ONE VARIABLE. Both arms carry the SAME seed: scatter placement is seeded, so `calls-on` vs
      // `calls-off` as seeds was itself the difference — it moved twin-banks by 24 triangles on
      // desktop and 36 the other way on mobile, which is a sign flip, i.e. never a shader cost.
      await bootRun(page, contract, 'calls');
      await page.evaluate(() => window.__GR_TEST__!.teleport(0, -30));
      const on = await settleAndRead(page);
      await bootRun(page, contract, 'calls', '&horizonApron=off');
      await expect(page.locator('#game-canvas')).toHaveAttribute('data-terrain3d-pilot-horizon-apron', 'plain');
      await page.evaluate(() => window.__GR_TEST__!.teleport(0, -30));
      const off = await settleAndRead(page);
      // Equality between two arms of the same browser, same frame budget, seconds apart: a shader
      // block on one existing material clone cannot add a draw call or a triangle, and if it ever
      // does, this is the line that says so on any machine.
      expect(on.drawCalls, `${contract} draw calls`).toBe(off.drawCalls);
      expect(on.triangles, `${contract} triangles`).toBe(off.triangles);
    }
    expect(errors).toEqual({ console: [], page: [] });
  });

  test('the far band actually changes, at the pose where the apron is on camera', async ({ page }) => {
    test.setTimeout(180_000);
    const errors = collectErrors(page);
    const measured: Record<string, number> = {};
    for (const { contract } of MAPS) {
      await bootRun(page, contract, 'band', '&horizonApron=off');
      await page.evaluate(() => window.__GR_TEST__!.teleport(0, -30));
      await settleAndRead(page);
      const before = topBandLuma(await page.locator('#game-canvas').screenshot());
      await bootRun(page, contract, 'band');
      await page.evaluate(() => window.__GR_TEST__!.teleport(0, -30));
      await settleAndRead(page);
      const after = topBandLuma(await page.locator('#game-canvas').screenshot());
      // At z=-30 the apron is 55% of the frame on every map and both viewports (the probe census),
      // so the top quarter is apron end to end. A paint that moves it by less than a luma unit is
      // a paint that is not there — this is the assert that would have caught the atmospherics
      // shift's first cut, whose ramp played out entirely beyond the reachable radius.
      measured[contract] = +Math.abs(after - before).toFixed(2);
      expect(measured[contract], `${contract} top-band luma delta`).toBeGreaterThan(1);
    }
    expect(errors).toEqual({ console: [], page: [] });

    if (COMPARE_BASELINE) {
      // OPT-IN ONLY. The default path above never reads this file, so a host that did not record
      // the baseline cannot go red on another host's numbers (F-1440-2).
      const baseline = JSON.parse(
        readFileSync(path.resolve('artifacts/beauty-far-ground/band-baseline.json'), 'utf8'),
      ) as Record<string, number>;
      for (const { contract } of MAPS) {
        expect(measured[contract], `${contract} vs recorded baseline`).toBeGreaterThan(baseline[contract] * 0.5);
      }
    }
  });

  test('the far-ground probe still reports which surfaces it repainted', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = collectErrors(page);
    // The instrument's own guard. Two prior reviews rest on "the panorama is 0.00% of the frame",
    // and that reading is only worth anything while the probe provably reaches the ring's material.
    await bootRun(page, 'e1-baron', 'probe', '&farGroundProbe');
    await expect(page.locator('#game-canvas'))
      .toHaveAttribute('data-terrain3d-pilot-far-ground-probe', 'on:panorama=1,apron=1,terrain=1');
    await bootRun(page, 'e1-baron', 'probe-off');
    await expect(page.locator('#game-canvas')).toHaveAttribute('data-terrain3d-pilot-far-ground-probe', 'off');
    expect(errors).toEqual({ console: [], page: [] });
  });
});

async function bootRun(page: Page, contract: string, seed: string, extra = ''): Promise<void> {
  await page.goto(`/?debug&contract=${contract}&nowaves&nolevel&nokill&nopause&nosteal&nowreck&tier=full&seed=far-ground-${seed}${extra}`);
  await page.waitForFunction(() => Boolean(window.__GR_TEST__) && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await expect(page.locator('#game-canvas')).toHaveAttribute('data-terrain3d-pilot-state', 'ready');
  await expect(page.locator('#game-canvas')).toHaveAttribute('data-terrain3d-pilot-render-source', 'glb');
  const briefing = page.getByTestId('contract-briefing-dismiss');
  if (await briefing.isVisible().catch(() => false)) await briefing.click();
}

/**
 * Read draw calls and triangles only once they have STOPPED MOVING.
 *
 * A fixed wait is not enough and this was measured, not guessed: on `e1-twin-banks` at z=-30, with
 * byte-identical code and no flag change, ten consecutive reads in ONE arm gave
 * calls 67,67,67,69,69,69,69,69,69,69 and triangles 126096 x3 then 126100 x7 — the scene is still
 * streaming for several seconds after a teleport. A paired A/B that samples on either side of that
 * step reports a phantom "+2 draw calls, +24 triangles" for a shader-only change that cannot move
 * geometry at all. Poll until the pair repeats three times, then trust it.
 */
async function settleAndRead(page: Page): Promise<{ drawCalls: number; triangles: number }> {
  let stable = 0;
  let last = '';
  let reading = { drawCalls: -1, triangles: -1 };
  for (let attempt = 0; attempt < 25 && stable < 3; attempt += 1) {
    const from = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.frame);
    await page.waitForFunction((start) => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > start + 45, from);
    reading = await page.evaluate(() => ({
      drawCalls: window.__THREE_GAME_DIAGNOSTICS__!.renderer.calls,
      triangles: window.__THREE_GAME_DIAGNOSTICS__!.renderer.triangles,
    }));
    const key = `${reading.drawCalls}/${reading.triangles}`;
    stable = key === last ? stable + 1 : 0;
    last = key;
  }
  expect(stable, 'renderer counters never settled').toBeGreaterThanOrEqual(3);
  return reading;
}

function topBandLuma(buffer: Buffer): number {
  const png = PNG.sync.read(buffer);
  const rows = Math.max(1, Math.round(png.height * 0.25));
  let sum = 0;
  let count = 0;
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < png.width; x += 2) {
      const offset = (y * png.width + x) * 4;
      sum += 0.2126 * png.data[offset] + 0.7152 * png.data[offset + 1] + 0.0722 * png.data[offset + 2];
      count += 1;
    }
  }
  return sum / count;
}

function collectErrors(page: Page): Errors {
  const errors: Errors = { console: [], page: [] };
  page.on('console', (message) => { if (message.type() === 'error') errors.console.push(message.text()); });
  page.on('pageerror', (error) => errors.page.push(error.message));
  return errors;
}

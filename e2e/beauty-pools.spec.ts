import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { PNG } from 'pngjs';
import { Balance } from '../src/game/Balance';

// Pool exposure treatment measurement rig (F-BEAUTY-2, TASK.md beauty2/pools).
// Turns "does the lantern pool core read AMBER at full dark" into numbers: it samples the FINAL
// canvas pixels along a west→east transect across the first relit lantern pool and reports
// rgb / luma / saturation / hue per world-space distance, plus the two exact sample points
// e1-night-shift.spec.ts:435 gates on (lantern.x+2 inside, lantern.x+11 outside).
// Rendering-only: drives the shipped debug harness, changes no sim byte, asserts nothing beyond
// "booted the 3D path at true dark with zero console errors".
//   node /tmp/gr-beauty2-run.mjs <tag> [project]
const TAG = process.env.GR_BEAUTY_TAG ?? 'current';
const SHOT_DIR = path.resolve('reviews/shots-beauty-pools', TAG);

// The :435 lantern: first COLD_LANTERN_POSITIONS entry of e1-night-shift.spec.ts.
const LANTERN: readonly [number, number] = [0, 16];
// d/r 0.29 is the :435 inside point (x+2); 11 is its desktop outside point. The core band the
// terrain shader tints specially is d/r < 0.5 (smoothstep in Terrain3dClaimPilot), i.e. d < 3.5.
const TRANSECT_DISTANCES = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4.5, 5.5, 6.5, 8.25, 11] as const;
const SAMPLE_FRAMES = 5;

type TransectPoint = {
  d: number;
  x: number;
  z: number;
  rgb: [number, number, number];
  luma: number;
  sat: number;
  hueDeg: number;
  lumaSpread: number;
  inView: boolean;
};

type Arm = {
  arm: string;
  points: TransectPoint[];
};

function hueDeg([r, g, b]: readonly [number, number, number]): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return 0;
  const c = max - min;
  let hue: number;
  if (max === r) hue = ((g - b) / c) % 6;
  else if (max === g) hue = (b - r) / c + 2;
  else hue = (r - g) / c + 4;
  return Math.round(((hue * 60 + 360) % 360) * 10) / 10;
}

async function boot(page: Page, seed: string): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`/?debug&contract=e1-night-shift&nowaves&nolevel&nopause&nokill&seed=${seed}&tier=full`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const briefing = page.getByTestId('contract-briefing');
  if (await briefing.isVisible().catch(() => false)) await page.getByTestId('contract-briefing-dismiss').click();
  await page.waitForFunction(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
    return canvas?.dataset.terrain3dPilotState === 'ready' && canvas.dataset.terrain3dPilotRenderSource === 'glb';
  });
  return errors;
}

async function setCanvasOnly(page: Page, enabled: boolean): Promise<void> {
  await page.evaluate((hide) => {
    const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
    if (!canvas) return;
    for (const element of document.querySelectorAll<HTMLElement>('body *')) {
      if (element === canvas || element.contains(canvas) || canvas.contains(element)) continue;
      element.style.visibility = hide ? 'hidden' : '';
    }
  }, enabled);
}

/**
 * Median-of-9x9 per channel at each transect world point, then a per-channel median across
 * SAMPLE_FRAMES frames ~150ms apart — the lantern intensity swings 2.5x frame to frame on
 * unchanged code (reviews/beauty-night-shift.md F-5b), so any single-frame sample is a coin toss.
 */
async function transect(page: Page, arm: string, distances: readonly number[] = TRANSECT_DISTANCES): Promise<Arm> {
  const screenPoints = await page.evaluate(({ lantern, distances: list }) => {
    const api = window.__GR_TEST__!;
    return list.map((d) => {
      const x = lantern[0]! + d;
      const z = lantern[1]!;
      const point = api.screenPoint(x, z, api.terrainVisualY(x, z, 0.03));
      return { d, x, z, screenX: point.x, screenY: point.y, inView: point.inView };
    });
  }, { lantern: LANTERN, distances: [...distances] });

  const canvas = page.locator('#game-canvas');
  const box = await canvas.boundingBox();
  expect(box).toBeTruthy();
  const frames: PNG[] = [];
  for (let index = 0; index < SAMPLE_FRAMES; index += 1) {
    frames.push(PNG.sync.read(await canvas.screenshot()));
    await page.waitForTimeout(150);
  }

  const points = screenPoints.map((point) => {
    const perFrame: Array<[number, number, number]> = frames.map((png) => {
      const centerX = Math.round(point.screenX * png.width / box!.width);
      const centerY = Math.round(point.screenY * png.height / box!.height);
      const reds: number[] = []; const greens: number[] = []; const blues: number[] = [];
      for (let py = centerY - 4; py <= centerY + 4; py += 1) {
        for (let px = centerX - 4; px <= centerX + 4; px += 1) {
          if (px < 0 || py < 0 || px >= png.width || py >= png.height) continue;
          const offset = (py * png.width + px) * 4;
          reds.push(png.data[offset]!); greens.push(png.data[offset + 1]!); blues.push(png.data[offset + 2]!);
        }
      }
      const mid = (list: number[]) => list.sort((a, b) => a - b)[Math.floor(list.length / 2)] ?? 0;
      return [mid(reds), mid(greens), mid(blues)];
    });
    const channel = (index: 0 | 1 | 2) => {
      const values = perFrame.map((rgb) => rgb[index]).sort((a, b) => a - b);
      return values[Math.floor(values.length / 2)] ?? 0;
    };
    const rgb: [number, number, number] = [channel(0), channel(1), channel(2)];
    const lumaOf = ([r, g, b]: readonly [number, number, number]) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    const lumas = perFrame.map(lumaOf);
    const max = Math.max(...rgb);
    return {
      d: point.d,
      x: point.x,
      z: point.z,
      rgb,
      luma: +lumaOf(rgb).toFixed(4),
      sat: max === 0 ? 0 : +(((max - Math.min(...rgb)) / max)).toFixed(3),
      hueDeg: hueDeg(rgb),
      lumaSpread: +(Math.max(...lumas) - Math.min(...lumas)).toFixed(4),
      inView: point.inView,
    };
  });
  return { arm, points };
}

async function relightPostZero(page: Page): Promise<void> {
  await page.evaluate(() => {
    const api = window.__GR_TEST__!;
    api.grantGold(50);
    api.teleport(0, 16);
    api.repair('lantern_post', 0);
  });
  await expect.poll(() => page.evaluate(() =>
    window.__THREE_GAME_DIAGNOSTICS__?.build.hp.find((entry) => entry.id === 'lantern_post' && entry.index === 0)?.wrecked,
  )).toBe(false);
}

async function shotAt(page: Page, name: string, project: string): Promise<void> {
  await mkdir(SHOT_DIR, { recursive: true });
  await page.locator('#game-canvas').screenshot({ path: path.join(SHOT_DIR, `${project}-${name}.png`) });
}

test('pool core transect at true dark', async ({ page }, testInfo) => {
  test.setTimeout(300_000);
  const project = testInfo.project.name;
  const errors = await boot(page, 'beauty-pools');
  const arms: Arm[] = [];

  // ---- DUSK first (waves only run forward): darkness 0.62, sun still up. The over-range case —
  // sun + pool light + emissive summing past ACES's chroma survival is the review's stated
  // mechanism, and dusk is where that sum is largest. Isolated (hero light off) so the read is
  // pure pool physics.
  await page.evaluate(() => window.__GR_TEST__!.setWave(8));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightShift.phase)).toBe('dusk');
  await relightPostZero(page);
  await page.evaluate(([x, z]) => window.__GR_TEST__!.teleport(x! + 1, z! + 1), LANTERN);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightPools ?? 0)).toBeGreaterThanOrEqual(2);
  await page.evaluate(() => window.__GR_TEST__!.setBalance('contracts.nightShift.heroLightRadius', 0));
  await page.waitForTimeout(400);
  await setCanvasOnly(page, true);
  arms.push(await transect(page, 'dusk-isolated'));
  await shotAt(page, 'dusk-pool-isolated', project);
  await page.evaluate((hero) => window.__GR_TEST__!.setBalance('contracts.nightShift.heroLightRadius', hero), Balance.contracts.nightShift.heroLightRadius);
  await setCanvasOnly(page, false);

  // ---- TRUE DARK: the exact :435 recipe (wave 10, hero at x+1, z+1).
  await page.evaluate(() => window.__GR_TEST__!.setWave(10));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightShift.phase)).toBe('dark');
  await page.evaluate(([x, z]) => window.__GR_TEST__!.teleport(x! + 1, z! + 1), LANTERN);
  await page.waitForTimeout(400);
  await setCanvasOnly(page, true);

  // Arm — what :435 gates on: hero pool overlapping the lantern pool.
  arms.push(await transect(page, 'as-gated'));
  await shotAt(page, 'dark-pool-435', project);

  // Arm — the lantern pool in isolation: the truth spec's own trick (heroLightRadius 0)
  // removes the hero's cool pool without moving the camera.
  await page.evaluate(() => window.__GR_TEST__!.setBalance('contracts.nightShift.heroLightRadius', 0));
  await page.waitForTimeout(250);
  arms.push(await transect(page, 'isolated'));
  await shotAt(page, 'dark-pool-isolated', project);

  // Arm — emissive term only: with the dynamic light at intensity 0, what remains on the ground
  // is the terrain shader's pool emissive (plus fog). This is the number that decides whether
  // Route B (emissive-side shaping) can ever fix the core.
  await page.evaluate(() => window.__GR_TEST__!.setBalance('contracts.nightShift.lanternRenderIntensity', 0));
  await page.waitForTimeout(250);
  arms.push(await transect(page, 'emissive-only'));
  await shotAt(page, 'dark-pool-emissive-only', project);
  await page.evaluate(({ hero, lantern }) => {
    window.__GR_TEST__!.setBalance('contracts.nightShift.heroLightRadius', hero);
    window.__GR_TEST__!.setBalance('contracts.nightShift.lanternRenderIntensity', lantern);
  }, {
    hero: Balance.contracts.nightShift.heroLightRadius,
    lantern: Balance.contracts.nightShift.lanternRenderIntensity,
  });

  // Arm — WARM+WARM overlap: a second post ~5 wu east so two intensity-34 lights and two emissive
  // discs sum on the ground between them. Placement collides with props at some offsets, so try a
  // few; the transect midline crosses whichever landed.
  const placedAt = await page.evaluate(([x, z]) => {
    const api = window.__GR_TEST__!;
    api.grantGold(5_000);
    for (const dx of [5, 4.5, 5.5, 6, 4, 6.5, 7, 3.5, 8, -5, -4.5, -5.5, -6, -6.5, -7]) {
      if (api.placeFree('lantern_post', x! + dx, z!)) return dx;
    }
    return 0;
  }, LANTERN);
  if (placedAt !== 0) {
    // Sample the line THROUGH both posts: centre, overlap saddle, second core, far rim.
    const sign = Math.sign(placedAt);
    const overlap = [0, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6.5, 8.25, 11].map((d) => d * sign);
    await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightPools ?? 0)).toBeGreaterThanOrEqual(3);
    await page.evaluate(() => window.__GR_TEST__!.setBalance('contracts.nightShift.heroLightRadius', 0));
    await page.waitForTimeout(400);
    arms.push(await transect(page, `two-warm-dx${placedAt}`, overlap));
    await shotAt(page, 'dark-two-warm', project);
    await page.evaluate((hero) => window.__GR_TEST__!.setBalance('contracts.nightShift.heroLightRadius', hero), Balance.contracts.nightShift.heroLightRadius);
    await page.waitForTimeout(250);
    // Same two-pool scene as the player sees it: hero light back on, standing between the posts.
    arms.push(await transect(page, `two-warm-hero-dx${placedAt}`, overlap));
    await shotAt(page, 'dark-two-warm-hero', project);
  }
  await setCanvasOnly(page, false);

  const lighting = await page.evaluate(() => ({
    nightPools: window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightPools,
    darkness: window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightShift.darkness,
    shaderSources: Number(document.querySelector<HTMLCanvasElement>('#game-canvas')?.dataset.terrain3dPilotNightPoolSources ?? 0),
  }));
  expect(lighting.darkness).toBe(1);
  expect(lighting.shaderSources).toBeGreaterThan(0);

  await writeFile(
    path.join(SHOT_DIR, `transect-${project}.json`),
    `${JSON.stringify({ tag: TAG, project, lighting, placedAt, arms }, null, 2)}\n`,
  );
  expect(errors).toEqual([]);
});

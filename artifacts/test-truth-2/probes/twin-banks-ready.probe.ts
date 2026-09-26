/**
 * test-truth-2 probe, F-SEF2-5c: when does the hero's visual y move, relative to the mounted
 * pilot's published readiness? Replays e2e/e1-twin-banks.spec.ts "seeded Twin Banks diagnostics
 * are stable" (two boots, same seed) with a per-frame recorder of every readiness field the pilot
 * publishes on the canvas dataset, and records where the old snapshot (frame > 12) fell.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { test, type Page } from '@playwright/test';

const OUT = path.resolve(import.meta.dirname, 'out');
const QUERY = '?debug&contract=e1-twin-banks&timescale=3&nolevel&nowaves&seed=e1-twin-stable';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
    const w = window as unknown as { __tt2Timeline?: unknown[] };
    const timeline: Array<Record<string, unknown>> = [];
    w.__tt2Timeline = timeline;
    let last = '';
    const tick = () => {
      const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
      const d = window.__THREE_GAME_DIAGNOSTICS__;
      const row = {
        pilotState: canvas?.dataset.terrain3dPilotState ?? null,
        renderSource: canvas?.dataset.terrain3dPilotRenderSource ?? null,
        heightSource: canvas?.dataset.terrain3dPilotHeightSource ?? null,
        terrainLoad: canvas?.dataset.terrain3dPilotTerrainLoadState ?? null,
        landmarkLoad: canvas?.dataset.terrain3dPilotLandmarkLoadState ?? null,
        heroY: d?.heroPos ? +d.heroPos.y.toFixed(6) : null,
      };
      const key = JSON.stringify(row);
      if (key !== last) {
        last = key;
        timeline.push({ t: Math.round(performance.now()), frame: d?.frame ?? null, ...row });
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
});

async function boot(page: Page) {
  await page.goto(`/${QUERY}`);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  // The old determinismSnapshot's only wait.
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 12);
  const atOldSnapshot = await page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
    return { t: Math.round(performance.now()), frame: window.__THREE_GAME_DIAGNOSTICS__?.frame, heroY: window.__THREE_GAME_DIAGNOSTICS__?.heroPos.y, pilotState: canvas?.dataset.terrain3dPilotState };
  });
  const readyWaitStart = Date.now();
  await page.waitForFunction(() => document.querySelector<HTMLCanvasElement>('#game-canvas')?.dataset.terrain3dPilotState !== 'loading', undefined, { timeout: 90_000 });
  const readyAfterMs = Date.now() - readyWaitStart;
  const settleFrom = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0);
  await page.waitForFunction((from) => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) >= from + 2, settleFrom);
  await page.waitForTimeout(1500);
  const after = await page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
    return { t: Math.round(performance.now()), frame: window.__THREE_GAME_DIAGNOSTICS__?.frame, heroY: window.__THREE_GAME_DIAGNOSTICS__?.heroPos.y, pilotState: canvas?.dataset.terrain3dPilotState, heightSource: canvas?.dataset.terrain3dPilotHeightSource };
  });
  const timeline = await page.evaluate(() => (window as unknown as { __tt2Timeline?: unknown[] }).__tt2Timeline ?? []);
  return { atOldSnapshot, readyAfterMs, after, timeline };
}

test('probe: Twin Banks hero visual y against the pilot readiness fields, two boots', async ({ page }, testInfo) => {
  test.setTimeout(240_000);
  await mkdir(OUT, { recursive: true });
  const first = await boot(page);
  const second = await boot(page);
  await writeFile(
    path.join(OUT, `${testInfo.project.name}-twin-ready-r${testInfo.repeatEachIndex}.json`),
    `${JSON.stringify({ project: testInfo.project.name, first, second }, null, 2)}\n`,
  );
});

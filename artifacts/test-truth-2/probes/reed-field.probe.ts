/**
 * test-truth-2 probe, F-E1T-1: what does the Twin Banks bank do in a still frame since the riparian
 * cards (8207be490)? Replays e2e/beauty-twin-banks.spec.ts "the reed field is alive in a still
 * frame" (same boot, run camera, hidden chrome, two frames 600 ms apart) and adds: the scatter
 * census per class (which classes carry the reed sway, how many cards), where the swaying cards
 * project in that frame, and how many moved pixels fall inside and outside their footprints.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { PNG } from 'pngjs';

const OUT = path.resolve(import.meta.dirname, 'out');
const QUERY = '?debug&contract=e1-twin-banks&timescale=1&nolevel&nowaves&nokill&seed=beauty-twin-banks';
const RUN_CAMERA = { x: 0, z: 12 };

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
});

async function boot(page: Page): Promise<void> {
  await page.goto(`/${QUERY}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 12, undefined, { timeout: 60_000 });
  await expect(page.locator('canvas')).toHaveAttribute('data-terrain3d-pilot-state', 'ready', { timeout: 60_000 });
  await page.evaluate(() => window.__GR_TEST__?.setBalance('camera.lag', 0.012));
  await page.evaluate(() => document.querySelector<HTMLElement>('.lil-gui')?.style.setProperty('display', 'none'));
}

type Census = {
  classes: Array<{ id: string; card: string | null; sways: boolean; instances: number; batched: boolean }>;
  swaying: Array<{ x: number; y: number; z: number; scale: number }>;
};

async function census(page: Page): Promise<Census> {
  return page.evaluate(async () => {
    const { DetailScatter } = await Function('return import("/src/world/Scatter.ts")')();
    const scatter = new DetailScatter();
    type Entry = { profile: { id: string; material: { userData: { riparianCard?: string; reedTime?: unknown } } }; instances: Array<{ x: number; y: number; z: number; scale: number }>; mesh: { visible: boolean } };
    const classes = (scatter.classes as Entry[]).map((entry) => ({
      id: entry.profile.id,
      card: entry.profile.material.userData.riparianCard ?? null,
      sways: Boolean(entry.profile.material.userData.reedTime),
      instances: entry.instances.length,
      batched: entry.mesh.visible === false,
    }));
    const swaying = (scatter.classes as Entry[])
      .filter((entry) => entry.profile.material.userData.reedTime)
      .flatMap((entry) => entry.instances.map((d) => ({ x: d.x, y: d.y, z: d.z, scale: d.scale })));
    scatter.dispose();
    return { classes, swaying };
  });
}

function movedMask(a: PNG, b: PNG): Uint8Array {
  const mask = new Uint8Array(a.width * a.height);
  for (let i = 0; i < mask.length; i += 1) {
    const o = i * 4;
    const delta = Math.abs(a.data[o]! - b.data[o]!) + Math.abs(a.data[o + 1]! - b.data[o + 1]!) + Math.abs(a.data[o + 2]! - b.data[o + 2]!);
    mask[i] = delta > 18 ? 1 : 0;
  }
  return mask;
}

type Box = { x0: number; x1: number; y0: number; y1: number };

function paint(mask: Uint8Array, width: number, height: number, box: Box): void {
  for (let y = Math.max(0, Math.floor(box.y0)); y < Math.min(height, Math.ceil(box.y1)); y += 1) {
    for (let x = Math.max(0, Math.floor(box.x0)); x < Math.min(width, Math.ceil(box.x1)); x += 1) mask[y * width + x] = 1;
  }
}

test('probe: Twin Banks reed field census and motion, three poses', async ({ page }, testInfo) => {
  test.setTimeout(240_000);
  await mkdir(OUT, { recursive: true });
  const project = testInfo.project.name;
  await boot(page);
  const counted = await census(page);
  const live = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.terrain.detailScatter ?? null);
  const viewport = page.viewportSize()!;
  const heroBox = { x0: viewport.width * 0.4, x1: viewport.width * 0.6, y0: viewport.height * 0.45, y1: viewport.height * 0.72 };
  const poses: Record<string, unknown> = {};
  for (const [label, pose] of [['run-camera', RUN_CAMERA], ['plait', { x: 0, z: 0 }], ['south-stake', { x: 0, z: -12 }]] as const) {
    await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z), pose);
    await page.waitForTimeout(700);
    await page.evaluate(() => {
      for (const selector of ['.lil-gui', '#hud', '#touch-controls']) document.querySelector<HTMLElement>(selector)?.style.setProperty('display', 'none');
    });
    const projected = [];
    for (const reed of counted.swaying) {
      const base = await page.evaluate((p) => window.__GR_TEST__?.screenPoint(p.x, p.z, p.y) ?? null, reed);
      const top = await page.evaluate((p) => window.__GR_TEST__?.screenPoint(p.x, p.z, p.y + 1.25 * p.scale) ?? null, reed);
      const side = await page.evaluate((p) => window.__GR_TEST__?.screenPoint(p.x + 0.7 * p.scale, p.z, p.y + 0.6 * p.scale) ?? null, reed);
      const mid = await page.evaluate((p) => window.__GR_TEST__?.screenPoint(p.x, p.z, p.y + 0.6 * p.scale) ?? null, reed);
      const shifted = await page.evaluate((p) => ({
        base: window.__GR_TEST__?.screenPoint(p.x + 2.5, p.z, p.y) ?? null,
        top: window.__GR_TEST__?.screenPoint(p.x + 2.5, p.z, p.y + 1.25 * p.scale) ?? null,
      }), reed);
      if (!base || !top || !side || !mid) continue;
      const halfW = Math.max(3, Math.abs(side.x - mid.x));
      const inView = base.inView || top.inView;
      const inRegion = inView && base.y >= viewport.height * 0.45 && !(base.x > heroBox.x0 && base.x < heroBox.x1 && base.y > heroBox.y0 && base.y < heroBox.y1);
      projected.push({
        ...reed,
        zone: await page.evaluate((p) => window.__GR_TEST__?.terrainSample(p.x, p.z - 1.2)?.zone ?? null, reed),
        box: { x0: Math.min(base.x, top.x) - halfW, x1: Math.max(base.x, top.x) + halfW, y0: top.y - 2, y1: base.y + 2 },
        control: shifted.base && shifted.top ? { x0: Math.min(shifted.base.x, shifted.top.x) - halfW, x1: Math.max(shifted.base.x, shifted.top.x) + halfW, y0: shifted.top.y - 2, y1: shifted.base.y + 2 } : null,
        inView,
        inRegion,
      });
    }
    const results: Record<string, unknown> = {};
    for (const gap of [600, 1200]) {
      const first = PNG.sync.read(await page.screenshot());
      await page.waitForTimeout(gap);
      const second = PNG.sync.read(await page.screenshot());
      const mask = movedMask(first, second);
      const sx = first.width / viewport.width, sy = first.height / viewport.height;
      const reedMask = new Uint8Array(mask.length), controlMask = new Uint8Array(mask.length);
      const scaleBox = (b: Box): Box => ({ x0: b.x0 * sx, x1: b.x1 * sx, y0: b.y0 * sy, y1: b.y1 * sy });
      for (const reed of projected.filter((r) => r.inView)) paint(reedMask, first.width, first.height, scaleBox(reed.box));
      for (const reed of projected.filter((r) => r.inView && r.control)) paint(controlMask, first.width, first.height, scaleBox(reed.control!));
      let oldRegion = 0, anywhere = 0, inReed = 0, reedArea = 0, inControl = 0, controlArea = 0;
      for (let y = 0; y < first.height; y += 1) {
        for (let x = 0; x < first.width; x += 1) {
          const i = y * first.width + x;
          const reed = reedMask[i] === 1, control = controlMask[i] === 1 && !reed;
          if (reed) reedArea += 1;
          if (control) controlArea += 1;
          if (!mask[i]) continue;
          anywhere += 1;
          if (reed) inReed += 1;
          if (control) inControl += 1;
          const vx = x / sx, vy = y / sy;
          if (y >= Math.round(first.height * 0.45) && !(vx > heroBox.x0 && vx < heroBox.x1 && vy > heroBox.y0 && vy < heroBox.y1)) oldRegion += 1;
        }
      }
      results[`gap${gap}`] = { oldRegion, anywhere, inReed, reedArea, reedDensity: reedArea ? +(inReed / reedArea).toFixed(5) : null, inControl, controlArea, controlDensity: controlArea ? +(inControl / controlArea).toFixed(5) : null };
      const diff = new PNG({ width: first.width, height: first.height });
      for (let i = 0; i < mask.length; i += 1) {
        const o = i * 4;
        diff.data[o] = mask[i] ? 255 : Math.round(first.data[o]! * 0.35);
        diff.data[o + 1] = reedMask[i] ? 200 : Math.round(first.data[o + 1]! * 0.35);
        diff.data[o + 2] = controlMask[i] ? 200 : Math.round(first.data[o + 2]! * 0.35);
        diff.data[o + 3] = 255;
      }
      await writeFile(path.join(OUT, `${project}-reed-${label}-diff-${gap}.png`), PNG.sync.write(diff));
      if (gap === 600) await writeFile(path.join(OUT, `${project}-reed-${label}-first.png`), PNG.sync.write(first));
    }
    poses[label] = {
      pose,
      swayingInView: projected.filter((r) => r.inView).length,
      swayingInOldRegion: projected.filter((r) => r.inRegion).length,
      projected: projected.filter((r) => r.inView),
      results,
    };
  }
  await writeFile(path.join(OUT, `${project}-reed.json`), `${JSON.stringify({ project, viewport, live, census: counted.classes, swayingTotal: counted.swaying.length, poses }, null, 2)}\n`);
});

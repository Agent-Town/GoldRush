/**
 * test-truth-2 probe, F-SEF2-5b: what does a screen-pixel read of Night Shift's sprites measure,
 * per project, per height, per colour space? Replays the two named tests' own flows
 * (e2e/e1-night-shift.spec.ts "loads Night Shift contract data and ramps full, dusk, dark, dawn
 * lighting" and "lantern post is Night Shift gated and relights a true-dark light ring") and
 * records numbers instead of asserting them. Output: ./out/<project>-night-*.json and crops.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { PNG } from 'pngjs';
import { Balance } from '../../../src/game/Balance';
import { crop, oldHelperValue, patchStats, type Overlay } from './pixels';

const OUT = path.resolve(import.meta.dirname, 'out');
const NIGHT_QUERY = '?debug&contract=e1-night-shift&timescale=8&nolevel&nowaves&seed=e1-night-shift';
const LANTERN = { x: 0, z: 16 };
const HEIGHTS = [0.3, 0.6, 0.9, 1.1, 1.3, 1.5, 1.7, 2.0, 2.4];

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
});

async function openGame(page: Page, query = NIGHT_QUERY): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`/${query}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const briefing = page.getByTestId('contract-briefing');
  if (await briefing.isVisible().catch(() => false)) await page.getByTestId('contract-briefing-dismiss').click();
  await expect(briefing).toBeHidden();
  return errors;
}

async function setWave(page: Page, wave: number): Promise<void> {
  await page.evaluate((next) => window.__GR_TEST__?.setWave(next), wave);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wave ?? 0)).toBe(wave);
}

async function context(page: Page) {
  return page.evaluate(() => {
    const d = window.__THREE_GAME_DIAGNOSTICS__!;
    const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas')!;
    const rect = canvas.getBoundingClientRect();
    return {
      dpr: window.devicePixelRatio,
      inner: { w: window.innerWidth, h: window.innerHeight },
      rect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
      backing: { w: canvas.width, h: canvas.height },
      hero: d.heroPos,
      lighting: d.lighting,
      pilotState: canvas.dataset.terrain3dPilotState,
      heightSource: canvas.dataset.terrain3dPilotHeightSource,
    };
  });
}

async function screen(page: Page, x: number, z: number, y: number) {
  return page.evaluate((p) => window.__GR_TEST__?.screenPoint(p.x, p.z, p.y) ?? null, { x, z, y });
}

async function topElements(page: Page, x: number, y: number) {
  return page.evaluate((p) => {
    const canvas = document.querySelector('#game-canvas')!;
    const r = canvas.getBoundingClientRect();
    return document.elementsFromPoint(r.x + p.x, r.y + p.y).slice(0, 4).map((el) => `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${el.getAttribute('data-testid') ? `[${el.getAttribute('data-testid')}]` : ''}.${String(el.className).slice(0, 40)}`);
  }, { x, y });
}

async function shoot(page: Page) {
  const canvas = page.locator('#game-canvas');
  const [box, buffer] = await Promise.all([canvas.boundingBox(), canvas.screenshot()]);
  return { box: box!, png: PNG.sync.read(buffer), buffer };
}

type Point = { x: number; y: number; z: number };

async function profile(page: Page, label: string, body: Point, overlay: Overlay, project: string, save: boolean) {
  const shot = await shoot(page);
  const scale = shot.png.width / shot.box.width;
  const rows = [];
  for (const h of HEIGHTS) {
    const s = await screen(page, body.x, body.z, body.y + h);
    if (!s) continue;
    const cx = s.x * scale, cy = s.y * scale;
    rows.push({
      h,
      screenCss: { x: +s.x.toFixed(1), y: +s.y.toFixed(1), inView: s.inView },
      cssPatch: patchStats(shot.png, cx, cy, 6 * scale, 8 * scale, overlay, Balance.render.exposure),
      smallCssPatch: patchStats(shot.png, cx, cy, 3 * scale, 4 * scale, overlay, Balance.render.exposure),
      fixedPxPatch: patchStats(shot.png, cx, cy, 6, 8, overlay, Balance.render.exposure),
    });
  }
  const up1 = await screen(page, body.x, body.z, body.y + 1.2);
  const up2 = await screen(page, body.x, body.z, body.y + 2.2);
  const side = await screen(page, body.x + 1, body.z, body.y + 1.2);
  const centre = await screen(page, body.x, body.z, body.y + 1.3);
  if (save && centre) {
    await writeFile(path.join(OUT, `${project}-night-${label}-crop.png`), crop(shot.png, centre.x * scale, centre.y * scale, 60 * scale, 90 * scale));
    await writeFile(path.join(OUT, `${project}-night-${label}-full.png`), shot.buffer);
  }
  return {
    label,
    body,
    scale,
    png: { w: shot.png.width, h: shot.png.height },
    box: shot.box,
    cssPerMetre: up1 && up2 && side ? { vertical: +Math.abs(up1.y - up2.y).toFixed(2), horizontal: +Math.abs(side.x - up1.x).toFixed(2) } : null,
    overlayAtCentre: centre ? await topElements(page, centre.x, centre.y) : [],
    rows,
  };
}

test('probe: Night Shift hero luminance, day and dark, per height and space', async ({ page }, testInfo) => {
  await mkdir(OUT, { recursive: true });
  const project = testInfo.project.name;
  const errors = await openGame(page);
  const ctx0 = await context(page);
  const overlay: Overlay = { enabled: ctx0.lighting?.postEnabled === true, warmth: Balance.world.postWarmth, vignette: Balance.world.postVignette };

  const phases: Record<string, unknown> = {};
  for (const [label, wave] of [['day', 4], ['dark', 10]] as const) {
    await setWave(page, wave);
    if (wave === 4) await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightShift.darkness ?? 1)).toBeLessThan(0.001);
    else await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightShift)).toMatchObject({ phase: 'dark', darkness: 1 });
    await page.waitForTimeout(80);
    const ctx = await context(page);
    const hero = ctx.hero as Point;
    const frames = [];
    for (let i = 0; i < 3; i += 1) {
      frames.push(await profile(page, `${label}-${i}`, hero, overlay, project, i === 0));
      await page.waitForTimeout(150);
    }
    // The old helper's own reading, exactly as the spec computes it today.
    const oldShot = await shoot(page);
    const oldScreen = await screen(page, 0, 0, 1.25);
    const oldScale = oldShot.png.width / oldShot.box.width;
    phases[label] = {
      wave,
      lighting: ctx.lighting,
      hero,
      pilotState: ctx.pilotState,
      heightSource: ctx.heightSource,
      frames,
      oldHelperAtOrigin: oldScreen ? {
        screenCss: oldScreen,
        value: oldHelperValue(oldShot.png, Math.round(oldScreen.x * oldScale), Math.round(oldScreen.y * oldScale)),
        overlay: await topElements(page, oldScreen.x, oldScreen.y),
      } : null,
    };
    if (oldScreen) await writeFile(path.join(OUT, `${project}-night-${label}-origin-crop.png`), crop(oldShot.png, oldScreen.x * oldScale, oldScreen.y * oldScale, 40 * oldScale, 40 * oldScale));
  }
  await writeFile(path.join(OUT, `${project}-night-hero.json`), `${JSON.stringify({ project, context: ctx0, overlay, exposure: Balance.render.exposure, phases, errors }, null, 2)}\n`);
});

test('probe: Night Shift lantern ring, in and out of radius, per height and space', async ({ page }, testInfo) => {
  await mkdir(OUT, { recursive: true });
  const project = testInfo.project.name;
  const errors = await openGame(page);
  await page.evaluate(() => window.__GR_TEST__?.setBalance('enemy.hp', 500));
  await page.evaluate(() => window.__GR_TEST__?.setBalance('enemy.speed', 0));
  await setWave(page, 10);
  await page.evaluate(() => window.__GR_TEST__?.selectBuildable('lantern_post'));
  await page.evaluate(() => window.__GR_TEST__?.setBuildMode(false));
  await page.evaluate((value) => window.__GR_TEST__?.grantGold(value), 20);
  await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z), LANTERN);
  await page.evaluate(() => window.__GR_TEST__?.repair('lantern_post', 0));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.hp.filter((e) => e.id === 'lantern_post')[0]?.wrecked)).toBe(false);
  const inRadius = { x: LANTERN.x + 4, z: LANTERN.z };
  const outOfRadius = { x: LANTERN.x + 12, z: LANTERN.z };
  await page.evaluate((pos) => window.__GR_TEST__?.spawnEnemyAt(pos.x, pos.z), inRadius);
  await page.evaluate((pos) => window.__GR_TEST__?.spawnEnemyAt(pos.x, pos.z), outOfRadius);
  await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.enemyPositions().length ?? 0)).toBe(2);
  await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z), { x: (inRadius.x + outOfRadius.x) / 2, z: LANTERN.z + 8 });
  await page.waitForTimeout(180);
  const ctx = await context(page);
  const overlay: Overlay = { enabled: ctx.lighting?.postEnabled === true, warmth: Balance.world.postWarmth, vignette: Balance.world.postVignette };
  const enemies = await page.evaluate(() => window.__GR_TEST__?.enemyPositions().map((e) => ({ x: e.x, y: e.y, z: e.z, light: e.light ?? 1 })) ?? []);
  const readings: Record<string, unknown> = {};
  for (const [label, target] of [['in', inRadius], ['out', outOfRadius]] as const) {
    const enemy = enemies.slice().sort((a, b) => Math.hypot(a.x - target.x, a.z - target.z) - Math.hypot(b.x - target.x, b.z - target.z))[0]!;
    const oldShot = await shoot(page);
    const oldScreen = await screen(page, target.x, target.z, 1.25);
    const oldScale = oldShot.png.width / oldShot.box.width;
    readings[label] = {
      target,
      enemy,
      oldHelper: oldScreen ? oldHelperValue(oldShot.png, Math.round(oldScreen.x * oldScale), Math.round(oldScreen.y * oldScale)) : null,
      oldHelperCssPatchAbsolute125: oldScreen ? patchStats(oldShot.png, oldScreen.x * oldScale, oldScreen.y * oldScale, 6 * oldScale, 8 * oldScale, overlay, Balance.render.exposure) : null,
      profile: await profile(page, `lantern-${label}`, { x: enemy.x, y: enemy.y, z: enemy.z }, overlay, project, true),
    };
  }
  await writeFile(path.join(OUT, `${project}-night-lantern.json`), `${JSON.stringify({ project, context: ctx, overlay, enemies, readings, errors }, null, 2)}\n`);
});

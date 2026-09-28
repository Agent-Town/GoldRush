import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PNG } from 'pngjs';
import { Balance } from '../src/game/Balance';
import { RUN_SUSPEND_KEY } from '../src/game/ProfileStorage';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type SavedNightSuspend = {
  wave: number;
  buildings: {
    id: string;
    index: number;
    wrecked: boolean;
    repairCostOverride?: number;
    position: { x: number; z: number };
    rotationSteps: number;
  }[];
};

const ARTIFACT_DIR = path.resolve('artifacts/night-bite');
const LANTERN_ARTIFACT_DIR = path.resolve('artifacts/night-lanterns');
const DUSK_ARTIFACT_DIR = path.resolve('artifacts/night-dusk');
const NIGHT_QUERY = '?debug&contract=e1-night-shift&timescale=8&nolevel&nowaves&seed=e1-night-shift';
const RELIGHT_COST = Math.ceil(Balance.lanternPost.cost / 2);
const COLD_LANTERNS = [
  { id: 'lantern_post', x: 0, z: 16, rotationSteps: 0, wrecked: true, relightCost: RELIGHT_COST },
  { id: 'lantern_post', x: -16, z: 18, rotationSteps: 1, wrecked: true, relightCost: RELIGHT_COST },
  { id: 'lantern_post', x: 16, z: 18, rotationSteps: 3, wrecked: true, relightCost: RELIGHT_COST },
  { id: 'lantern_post', x: -22, z: -12, rotationSteps: 1, wrecked: true, relightCost: RELIGHT_COST },
  { id: 'lantern_post', x: 22, z: -12, rotationSteps: 3, wrecked: true, relightCost: RELIGHT_COST },
  { id: 'lantern_post', x: -10, z: -24, rotationSteps: 2, wrecked: true, relightCost: RELIGHT_COST },
  { id: 'lantern_post', x: 10, z: -24, rotationSteps: 2, wrecked: true, relightCost: RELIGHT_COST },
] as const;
const COLD_LANTERN_POSITIONS = COLD_LANTERNS.map(({ x, z }) => ({ x, z }));
const VISIBLE_LIGHT = 0.35;
const DARK_LIGHT = 0.06;
/**
 * The ceiling for a SCREEN-PIXEL read at an unlit point, which is not the same measurement as the
 * enemy-light one above it: `spriteLuminance` samples the framebuffer, so out of every lantern radius
 * it measures the night GROUND and FOG, not a sprite. Zeroing the sprite fill leaves the number
 * bit-identical. `67e7d0af4` (2026-08-03, "night visibility") lifted the dark keyframe off pure black
 * on purpose - background #000000 -> #080a0f, fog #000000 -> #14141a, fill #28324a -> #384862, ground
 * #000000 -> #17120f - and on the 390 px viewport that floor lands at a p95 of 0.0605..0.0607 (three
 * mobile boots, F-SEF2-5) against 0.0437 on desktop, so mobile alone has no headroom under 0.06.
 * Mobile therefore gets a ceiling of 0.065 with both measurements recorded beside it; desktop keeps
 * DARK_LIGHT, and every ENEMY-light assertion - which measures the dimming system and not the palette
 * - keeps DARK_LIGHT on both projects.
 */
const DARK_SPRITE_LIGHT = (): number => (test.info().project.name === 'mobile-chrome' ? 0.065 : DARK_LIGHT);

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
});

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openGame(page: Page, query = NIGHT_QUERY): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await gotoGame(page, query);
  return errors;
}

async function gotoGame(page: Page, query: string): Promise<void> {
  await page.goto(`/${query}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await dismissBriefing(page);
}

async function dismissBriefing(page: Page): Promise<void> {
  const briefing = page.getByTestId('contract-briefing');
  if (await briefing.isVisible().catch(() => false)) await page.getByTestId('contract-briefing-dismiss').click();
  await expect(briefing).toBeHidden();
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: false });
}

async function captureDuskStrip(page: Page, testInfo: TestInfo): Promise<void> {
  await mkdir(DUSK_ARTIFACT_DIR, { recursive: true });
  const frames: PNG[] = [];
  for (const [name, wave] of [['day', 4], ['golden', 7], ['dusk', 8], ['dark', 10]] as const) {
    await setWave(page, wave);
    await page.waitForTimeout(80);
    const buffer = await page.locator('#game-canvas').screenshot();
    await writeFile(path.join(DUSK_ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), buffer);
    frames.push(PNG.sync.read(buffer));
  }
  const width = frames[0]!.width;
  const height = frames[0]!.height;
  const strip = new PNG({ width: width * frames.length, height });
  for (const [index, frame] of frames.entries()) {
    for (let y = 0; y < height; y += 1) {
      frame.data.copy(strip.data, (y * strip.width + index * width) * 4, y * width * 4, (y + 1) * width * 4);
    }
  }
  await writeFile(path.join(DUSK_ARTIFACT_DIR, `${testInfo.project.name}-day-golden-dusk-dark-strip.png`), PNG.sync.write(strip));
}

async function setBalance(page: Page, key: string, value: number | boolean): Promise<void> {
  await expect(
    page.evaluate(([pathKey, next]) => window.__GR_TEST__?.setBalance(pathKey, next), [key, value] as const),
  ).resolves.toBe(true);
}

async function setWave(page: Page, wave: number): Promise<void> {
  await page.evaluate((next) => window.__GR_TEST__?.setWave(next), wave);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wave ?? 0)).toBe(wave);
}

async function grantGold(page: Page, amount: number): Promise<void> {
  await page.evaluate((value) => window.__GR_TEST__?.grantGold(value), amount);
}

async function teleport(page: Page, x: number, z: number): Promise<void> {
  await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z), { x, z });
}

async function selectBuildable(page: Page, id: string): Promise<boolean> {
  return page.evaluate((buildableId) => window.__GR_TEST__?.selectBuildable(buildableId) ?? false, id);
}

async function aimBuildAt(page: Page, point: { x: number; z: number }, tolerance = 1): Promise<void> {
  const screen = await page.evaluate((target) => window.__GR_TEST__?.screenPoint(target.x, target.z, 0.03) ?? null, point);
  expect(screen?.inView).toBe(true);
  await page.mouse.move(screen!.x, screen!.y);
  await expect.poll(() => page.evaluate((target) => {
    const ghost = window.__THREE_GAME_DIAGNOSTICS__?.build.ghostPos;
    return ghost ? Math.hypot(ghost.x - target.x, ghost.z - target.z) : Number.POSITIVE_INFINITY;
  }, point)).toBeLessThan(tolerance);
}

async function lanternHp(page: Page) {
  return page.evaluate(() =>
    window.__THREE_GAME_DIAGNOSTICS__?.build.hp
      .filter((entry) => entry.id === 'lantern_post')
      .map((entry) => ({
        index: entry.index,
        hp: entry.hp,
        maxHp: entry.maxHp,
        wrecked: entry.wrecked,
        repairCost: entry.repairCost,
        position: entry.position,
      })) ?? [],
  );
}

async function relightLantern(page: Page, index = 0): Promise<unknown> {
  const target = COLD_LANTERN_POSITIONS[index]!;
  await grantGold(page, 20);
  await teleport(page, target.x, target.z);
  const result = await page.evaluate((targetIndex) => window.__GR_TEST__?.repair('lantern_post', targetIndex), index);
  await expect.poll(() => lanternHp(page).then((entries) => entries[index]?.wrecked)).toBe(false);
  return result;
}

async function spawnAssault(page: Page): Promise<void> {
  const lantern = COLD_LANTERN_POSITIONS[0]!;
  for (const point of [
    { x: lantern.x - 2, z: lantern.z },
    { x: lantern.x, z: lantern.z + 2 },
    { x: lantern.x + 4, z: lantern.z },
    { x: lantern.x + 9, z: lantern.z },
  ]) {
    await expect(page.evaluate((pos) => window.__GR_TEST__?.spawnEnemyAt(pos.x, pos.z), point)).resolves.toBe(true);
  }
  await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.enemyPositions().length ?? 0)).toBe(4);
}

async function enemyLights(page: Page): Promise<number[]> {
  return page.evaluate(() => window.__GR_TEST__?.enemyPositions().map((enemy) => enemy.light ?? 1).sort((a, b) => a - b) ?? []);
}

async function waitForSavedNightWave(page: Page, wave: number): Promise<SavedNightSuspend> {
  await page.waitForFunction(
    ([key, wanted]) => {
      const raw = localStorage.getItem(key);
      if (!raw) return false;
      try {
        return (JSON.parse(raw) as { wave?: number }).wave === wanted;
      } catch {
        return false;
      }
    },
    [RUN_SUSPEND_KEY, wave] as const,
    { timeout: 15_000 },
  );
  const raw = await page.evaluate((key) => localStorage.getItem(key), RUN_SUSPEND_KEY);
  expect(raw).toBeTruthy();
  return JSON.parse(raw!) as SavedNightSuspend;
}

async function enemyLightNear(page: Page, point: { x: number; z: number }): Promise<number> {
  const light = await page.evaluate((target) => {
    const enemies = window.__GR_TEST__?.enemyPositions() ?? [];
    let best = null as { distanceSq: number; light: number } | null;
    for (const enemy of enemies) {
      const dx = enemy.x - target.x;
      const dz = enemy.z - target.z;
      const distanceSq = dx * dx + dz * dz;
      if (!best || distanceSq < best.distanceSq) best = { distanceSq, light: enemy.light ?? 1 };
    }
    return best;
  }, point);
  expect(light).toBeTruthy();
  expect(light!.distanceSq).toBeLessThan(1);
  return light!.light;
}

/**
 * THE SPRITE PROBE, REBUILT (F-SEF2-5b, test-truth-2, 2026-09-25).
 *
 * The helper this replaces read one fixed world point and was a desktop-shaped instrument, measured
 * four ways wrong in `artifacts/e1-spec-truth-1/report.md` (section F-SEF2-5b):
 *  1. the ramp test aimed it at world (0, 0) while the Night Shift hero starts at (0, 12)
 *     (`contractHeroStart` in src/game/Game.ts; this contract declares no stake), so "dayHero" and
 *     "darkHero" were river and ground, never the hero;
 *  2. it returned a p95 of sRGB-ENCODED luma, and the ramp compared a ratio of two of those with a
 *     LINEAR tint luminance;
 *  3. on mobile it read 0.93262 in day and in dark alike, lighting-invariant: (0, 0) sits under a
 *     parchment tip card on the 390 px layout, and an element screenshot is the PAGE clipped to the
 *     canvas box, so the card was what it read (crop: artifacts/test-truth-2/probes/out/
 *     mobile-chrome-night-day-origin-crop.png; with the card gone the same point reads 0.05655 dark);
 *  4. its patch was +-6 x +-8 PNG pixels: +-6 x +-8 CSS px on desktop (DPR 1) but a third of that on the
 *     Pixel 5 profile (DPR 2.75), a different piece of the world on each project.
 *
 * NOW the caller names a BODY, never a point. The hero is read at `diagnostics.heroPos`, an enemy at
 * the `enemyPositions()` entry nearest the point it was spawned at (it must be within 1 m), each at its
 * sprite's torso height above its own feet (`SPRITE_TORSO_Y`); the shot is the canvas as the renderer
 * drew it (`CANVAS_ONLY_STYLE` hides every DOM layer for the duration of the screenshot); the patch is
 * +-6 x +-8 CSS px scaled by the screenshot's own device-pixel ratio (PNG width over box width); and
 * every reading comes back in three stated spaces, from the same pixels:
 *  - `luma`: Rec. 709 weights on the sRGB-ENCODED channels. Display brightness, the space the
 *    VISIBLE_LIGHT and DARK_SPRITE_LIGHT screen floors are written in, and exactly what the old helper
 *    returned (so a luma reading at the old point reproduces the old number).
 *  - `linear`: the same pixels after the sRGB decode. Display light.
 *  - `scene`: scene-linear light. The ledger post overlay undone (`LedgerPostPass` in
 *    src/world/LightRig.ts: a warm quad at alpha `(1 - edge) * postWarmth + edge * postVignette`, paper
 *    grain taken as 0), the sRGB decode, then three.js's `ACESFilmicToneMapping` inverted at the game's
 *    exposure (`Balance.render.exposure`; the two ACES matrices and the RRT/ODT fit are copied from
 *    node_modules/three/src/renderers/shaders/ShaderChunk/tonemapping_pars_fragment.glsl.js). This is
 *    the space `setWorldSpriteTint` multiplies a sprite's colour in, so the ratio of two `scene`
 *    readings of one sprite is directly comparable with a tint's linear luminance, which a ratio of
 *    display readings is not: ACES bends it by texel brightness (a grey texel under the full-dark
 *    sprite multiplier reads 0.42 to 0.75 of its day value in display light, and the multiplier's own
 *    0.587 in scene light).
 * Each is the p95 over the patch, as before.
 */
type SpriteBody = { hero: true } | { enemyNear: { x: number; z: number } };
type SpriteReading = {
  body: { x: number; y: number; z: number };
  screen: { x: number; y: number };
  devicePixelsPerCss: number;
  samples: number;
  luma: number;
  linear: number;
  scene: number;
};

const HERO: SpriteBody = { hero: true };
/**
 * Torso height above the body's own feet, MEASURED: a height profile of each sprite on both projects
 * (artifacts/test-truth-2/probes/out/*-night-hero.json, *-night-lantern.json). The hero's scene-light
 * day/dark ratio sits on the sprite's plateau from 1.1 to 2.4 m (0.582..0.610 desktop, 0.586..0.589
 * mobile) and leaves it below 0.9 m (0.80 at 0.6 m, 1.24 at 0.3 m on desktop: ground, not sprite); a
 * lit bandit reads its plateau from 0.9 to 1.3 m (luma 0.81 desktop, 0.79 mobile) and legs and ground
 * below 0.6 m. The old absolute y 1.25 was only 0.6 m above a bandit standing on the mounted sculpt at
 * y 0.65, which is the mobile 0.237 the lantern test read on main.
 */
const SPRITE_TORSO_Y = { hero: 1.2, enemy: 1.1 } as const;
/** The canvas as the renderer drew it: every DOM layer over it is hidden while the shot is taken. */
const CANVAS_ONLY_STYLE = 'body *:not(#game-canvas):not(:has(#game-canvas)) { visibility: hidden !important; }';
const SPRITE_PATCH_CSS = { halfWidth: 6, halfHeight: 8 } as const;
const ACES_IN_COLUMNS = [[0.59719, 0.076, 0.0284], [0.35458, 0.90834, 0.13383], [0.04823, 0.01566, 0.83777]];
const ACES_OUT_COLUMNS = [[1.60475, -0.10208, -0.00327], [-0.53108, 1.10813, -0.07276], [-0.07367, -0.00605, 1.07602]];

function mulColumns(columns: number[][], v: readonly number[]): number[] {
  return [0, 1, 2].map((row) => columns[0]![row]! * v[0]! + columns[1]![row]! * v[1]! + columns[2]![row]! * v[2]!);
}

function invertColumns(columns: number[][]): number[][] {
  const m = [0, 1, 2].map((row) => [0, 1, 2].map((column) => columns[column]![row]!));
  const [a, b, c] = m[0]!;
  const [d, e, f] = m[1]!;
  const [g, h, i] = m[2]!;
  const A = e! * i! - f! * h!;
  const B = -(d! * i! - f! * g!);
  const C = d! * h! - e! * g!;
  const det = a! * A + b! * B + c! * C;
  const rows = [
    [A / det, -(b! * i! - c! * h!) / det, (b! * f! - c! * e!) / det],
    [B / det, (a! * i! - c! * g!) / det, -(a! * f! - c! * d!) / det],
    [C / det, -(a! * h! - b! * g!) / det, (a! * e! - b! * d!) / det],
  ];
  return [0, 1, 2].map((column) => [0, 1, 2].map((row) => rows[row]![column]!));
}

const ACES_IN_INVERSE = invertColumns(ACES_IN_COLUMNS);
const ACES_OUT_INVERSE = invertColumns(ACES_OUT_COLUMNS);

/** The inverse of `RRTAndODTFit`, per channel: the positive root of its rational quadratic. */
function rrtOdtInverse(y: number): number {
  const a = 0.983729 * y - 1;
  const b = 0.432951 * y - 0.0245786;
  const c = 0.238081 * y + 0.000090537;
  if (Math.abs(a) < 1e-9) return -c / b;
  return (-b - Math.sqrt(Math.max(0, b * b - 4 * a * c))) / (2 * a);
}

const srgbToLinear = (channel: number): number =>
  channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
const rec709 = (rgb: readonly number[]): number => 0.2126 * rgb[0]! + 0.7152 * rgb[1]! + 0.0722 * rgb[2]!;

/** One screenshot pixel in scene-linear light: overlay off, sRGB decoded, ACES inverted. */
function sceneLinear(encoded: readonly number[], u: number, v: number, postEnabled: boolean): number[] {
  let clean = encoded;
  if (postEnabled) {
    const t = Math.min(1, Math.max(0, (Math.hypot(u - 0.5, v - 0.5) * 1.42 - 0.28) / (0.74 - 0.28)));
    const edge = t * t * (3 - 2 * t);
    const ink = [1 - 0.78 * edge, 0.82 - 0.69 * edge, 0.5 - 0.43 * edge];
    const alpha = Math.min(0.24, (1 - edge) * Balance.world.postWarmth + edge * Balance.world.postVignette);
    clean = encoded.map((channel, index) => Math.min(1, Math.max(0, (channel - alpha * ink[index]!) / (1 - alpha))));
  }
  const fitted = mulColumns(ACES_OUT_INVERSE, clean.map(srgbToLinear)).map(rrtOdtInverse);
  return mulColumns(ACES_IN_INVERSE, fitted).map((channel) => (channel * 0.6) / Balance.render.exposure);
}

async function spriteLuminance(page: Page, body: SpriteBody): Promise<SpriteReading> {
  const found = await page.evaluate((wanted) => {
    if ('hero' in wanted) {
      const hero = window.__THREE_GAME_DIAGNOSTICS__?.heroPos;
      return hero ? { x: hero.x, y: hero.y, z: hero.z, gap: 0 } : null;
    }
    let best = null as { x: number; y: number; z: number; gap: number } | null;
    for (const enemy of window.__GR_TEST__?.enemyPositions() ?? []) {
      const gap = Math.hypot(enemy.x - wanted.enemyNear.x, enemy.z - wanted.enemyNear.z);
      if (!best || gap < best.gap) best = { x: enemy.x, y: enemy.y, z: enemy.z, gap };
    }
    return best;
  }, body);
  expect(found, `no sprite body for ${JSON.stringify(body)}`).toBeTruthy();
  expect(found!.gap).toBeLessThan(1);
  const torso = { x: found!.x, z: found!.z, y: found!.y + ('hero' in body ? SPRITE_TORSO_Y.hero : SPRITE_TORSO_Y.enemy) };
  const screenOf = () => page.evaluate((pos) => window.__GR_TEST__?.screenPoint(pos.x, pos.z, pos.y) ?? null, torso);
  // A STILL FRAME: the camera trails a teleport (`camera.lag`), and the lantern test reads 180 ms after
  // one. Measured, that shot caught the camera still travelling (the out-of-radius bandit 10 to 18 CSS
  // px from where it settles, on both projects), and on mobile it read 0.0644 where a settled shot of
  // the same bandit reads 0.0607, against a 0.065 ceiling. So the shot waits until the body's screen
  // point holds within half a CSS pixel for 120 ms.
  let screen = await screenOf();
  for (let settle = 0; settle < 30 && screen; settle += 1) {
    await page.waitForTimeout(120);
    const next = await screenOf();
    if (!next) break;
    const moved = Math.hypot(next.x - screen.x, next.y - screen.y);
    screen = next;
    if (moved < 0.5) break;
  }
  expect(screen).toBeTruthy();
  expect(screen!.inView).toBe(true);
  const postEnabled = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.postEnabled === true);

  const canvas = page.locator('#game-canvas');
  const [box, buffer] = await Promise.all([canvas.boundingBox(), canvas.screenshot({ style: CANVAS_ONLY_STYLE })]);
  expect(box).toBeTruthy();
  const png = PNG.sync.read(buffer);
  const devicePixelsPerCss = png.width / box!.width;
  const centerX = Math.round(screen!.x * devicePixelsPerCss);
  const centerY = Math.round(screen!.y * (png.height / box!.height));
  const halfWidth = Math.round(SPRITE_PATCH_CSS.halfWidth * devicePixelsPerCss);
  const halfHeight = Math.round(SPRITE_PATCH_CSS.halfHeight * devicePixelsPerCss);
  const luma: number[] = [];
  const linear: number[] = [];
  const scene: number[] = [];

  for (let y = centerY - halfHeight; y <= centerY + halfHeight; y += 1) {
    if (y < 0 || y >= png.height) continue;
    for (let x = centerX - halfWidth; x <= centerX + halfWidth; x += 1) {
      if (x < 0 || x >= png.width) continue;
      const offset = (y * png.width + x) * 4;
      if (png.data[offset + 3]! < 64) continue;
      const encoded = [png.data[offset]! / 255, png.data[offset + 1]! / 255, png.data[offset + 2]! / 255];
      luma.push(rec709(encoded));
      linear.push(rec709(encoded.map(srgbToLinear)));
      scene.push(rec709(sceneLinear(encoded, (x + 0.5) / png.width, 1 - (y + 0.5) / png.height, postEnabled)));
    }
  }

  expect(luma.length).toBeGreaterThan(0);
  const p95 = (values: number[]): number => values.sort((a, b) => a - b)[Math.floor(values.length * 0.95)] ?? 0;
  return {
    body: { x: found!.x, y: found!.y, z: found!.z },
    screen: { x: screen!.x, y: screen!.y },
    devicePixelsPerCss,
    samples: luma.length,
    luma: p95(luma),
    linear: p95(linear),
    scene: p95(scene),
  };
}

async function groundLuminances(page: Page, points: readonly { x: number; z: number }[]): Promise<number[]> {
  const screen = await page.evaluate((worldPoints) => worldPoints.map((point) => window.__GR_TEST__?.screenPoint(point.x, point.z, 0.03) ?? null), points);
  expect(screen.every((point) => point?.inView)).toBe(true);
  const canvas = page.locator('#game-canvas');
  const [box, buffer] = await Promise.all([canvas.boundingBox(), canvas.screenshot()]);
  expect(box).toBeTruthy();
  const png = PNG.sync.read(buffer);

  return screen.map((point) => {
    const centerX = Math.round(point!.x * png.width / box!.width);
    const centerY = Math.round(point!.y * png.height / box!.height);
    const samples: number[] = [];
    for (let y = centerY - 4; y <= centerY + 4; y += 1) {
      for (let x = centerX - 4; x <= centerX + 4; x += 1) {
        const offset = (y * png.width + x) * 4;
        samples.push((0.2126 * png.data[offset]! + 0.7152 * png.data[offset + 1]! + 0.0722 * png.data[offset + 2]!) / 255);
      }
    }
    samples.sort((a, b) => a - b);
    return samples[Math.floor(samples.length / 2)] ?? 0;
  });
}

function visibleThreats(lights: readonly number[]): number {
  return lights.filter((light) => light >= VISIBLE_LIGHT).length;
}

async function expectClean(errors: ErrorBucket): Promise<void> {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

test('loads Night Shift contract data and ramps full, dusk, dark, dawn lighting', async ({ page }, testInfo) => {
  const errors = await openGame(page);
  const snapshot = await page.evaluate(() => ({
    diagnostics: window.__THREE_GAME_DIAGNOSTICS__?.contract,
    registry: window.__GR_CONTRACT_REGISTRY__?.loadContract('e1-night-shift'),
    active: window.__GR_TEST__?.activeContract(),
    simTile: window.__THREE_GAME_DIAGNOSTICS__?.terrain.sim.tile,
    menuIds: window.__THREE_GAME_DIAGNOSTICS__?.ui?.buildables.map((entry) => entry.id),
    lighting: window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightShift,
  }));

  expect(snapshot.diagnostics?.activeId).toBe('e1-night-shift');
  expect(snapshot.active?.id).toBe('e1-night-shift');
  expect(snapshot.simTile).toBe('frontier-river-claim');
  expect(snapshot.menuIds).toContain('lantern_post');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.lanternPosts)).toBe(COLD_LANTERNS.length);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.lanternPostPositions)).toEqual(COLD_LANTERN_POSITIONS);
  expect(await lanternHp(page)).toEqual(
    COLD_LANTERNS.map(({ x, z }, index) => ({
      index,
      hp: 0,
      maxHp: 35,
      wrecked: true,
      repairCost: RELIGHT_COST,
      position: { x, z },
    })),
  );
  expect(snapshot.registry).toMatchObject({
    name: 'Night Shift',
    tileParams: {
      tileId: 'frontier-river-claim',
      river: true,
      ford: true,
      prePlacedBuildables: COLD_LANTERNS,
    },
    twist: {
      secureWave: 25,
      lightRamp: { duskWave: 5, darkWave: 10, dawnWave: 25 },
    },
    boardRow: {
      name: 'Night Shift',
      tags: ['vein-hunter'],
      unlock: 'science≥3',
    },
  });
  expect(snapshot.registry?.twist.lightRamp?.keyframes?.map((keyframe) => keyframe.phase)).toEqual([
    'full',
    'golden',
    'dusk',
    'dark',
  ]);
  expect(snapshot.diagnostics?.secureWave).toBe(25);
  expect(snapshot.lighting).toMatchObject({ enabled: true, phase: 'full', darkness: 0 });

  await setWave(page, 5);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightShift.darkness ?? 1)).toBeLessThan(0.03);

  await setWave(page, 7);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightShift.darkness ?? 0)).toBeGreaterThan(0.25);

  await setWave(page, 8);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightShift.darkness ?? 0)).toBeGreaterThan(0.6);

  await setWave(page, 10);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightShift)).toMatchObject({
    phase: 'dark',
    darkness: 1,
  });
  // RE-PINNED 2026-09-24 (F-SEF2-5, task e1-spec-truth-1). WAS `fogNear: 18, fogFar: 42`, which were
  // not measurements at all: they were the LERP TARGETS `src/world/LightRig.ts` carried until
  // `7c2744e5a` (2026-09-12, Astra's campaign committed "not yet gated"), whose diff replaced
  //   fogNear = lerp(baseFogNear, 18, darkness)
  //   fogFar  = max(fogNear + 8, lerp(baseFogFar, 42, darkness))
  // with
  //   fogNear = baseFogNear + fogOffset
  //   fogFar  = max(fogNear + 8, lerp(baseFogFar, 58, darkness) + fogOffset)
  // and while Night Shift is enabled `baseFogNear` is 34 and `baseFogFar` 72, so darkness 1 reads
  // 34 / 58 with fogOffset 0 (the hero focus sits inside the 34 m near plane on both viewports).
  // Measured on desktop-chrome and mobile-chrome; numbers in artifacts/e1-spec-truth-1/report.md.
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting)).toMatchObject({
    fogNear: 34,
    fogFar: 58,
  });

  // THE HERO-BRIGHTNESS BAND, RE-AIMED (F-SEF2-5b, test-truth-2, 2026-09-25). The probe reads the HERO
  // now (see `spriteLuminance`), and each read waits for the lighting state it names instead of 80 ms.
  await setWave(page, 4);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightShift.darkness ?? 1)).toBeLessThan(0.001);
  await page.waitForTimeout(80);
  const dayHero = await spriteLuminance(page, HERO);
  await setWave(page, 10);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightShift)).toMatchObject({
    phase: 'dark',
    darkness: 1,
  });
  await page.waitForTimeout(80);
  const darkHero = await spriteLuminance(page, HERO);
  const darkTint = snapshot.registry?.twist.lightRamp?.keyframes?.find((keyframe) => keyframe.phase === 'dark')?.spriteTint;
  // RE-PINNED 2026-09-24 (F-SEF2-5, task e1-spec-truth-1). WAS `#34405a`; the dark keyframe's
  // `spriteTint` in assets/contracts/epoch-1-frontier/contracts.json has been `#44516b` since
  // `67e7d0af4` (2026-08-03, "night visibility: the dark keeps its fear, the ground keeps its shape"),
  // the only commit ever to touch that value. The hero-brightness band below DERIVES from this
  // constant, so its three channels move with it.
  expect(darkTint).toBe('#44516b');
  const linear = (channel: number): number => {
    const srgb = channel / 255;
    return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  };
  // WHAT THE RENDERER MULTIPLIES THE HERO BY AT FULL DARK. Since `7c2744e5a` (2026-09-12)
  // `LightRig.applyPalette` does not pass the keyframe's tint straight through: it lifts it,
  // `tint * (1 - fill) + fill` with `fill = darkness * 0.55` ("Sprites do not receive point lights;
  // preserve readable color under their carried lights"), so at darkness 1 every channel is
  // 0.45 * linear(tint) + 0.55. The old band (tintLuminance 0.0819 +- 0.04) was derived from the raw tint
  // before that lift, which no probe on the hero can read: the lifted multiplier is 0.576 / 0.587 / 0.616
  // per channel, luminance 0.587.
  const SPRITE_FILL_AT_DARK = 0.55;
  const spriteMultiplier = [0x44, 0x51, 0x6b].map((channel) => linear(channel) * (1 - SPRITE_FILL_AT_DARK) + SPRITE_FILL_AT_DARK);
  const tintLuminance = 0.2126 * spriteMultiplier[0]! + 0.7152 * spriteMultiplier[1]! + 0.0722 * spriteMultiplier[2]!;
  const heroRatio = darkHero.scene / Math.max(dayHero.scene, 1e-6);
  const evidence = JSON.stringify({ dayHero, darkHero, heroRatio, tintLuminance, spriteMultiplier });
  // FIRST, PROVE THE PROBE SEES THE NIGHT, on both projects, before the band reads it. At full dark the
  // hero passes at most 0.616 of its day light (the multiplier's largest channel), so a probe that is on
  // the sprite must fall by at least 38%; the stated margin is 25%, clear of frame-to-frame noise, and a
  // lighting-invariant read (the old mobile 0.93262 / 0.93262, ratio 1.0) fails it outright.
  const HERO_PROBE_MIN_DIMMING = 0.25;
  expect(darkHero.scene, evidence).toBeLessThan(dayHero.scene * (1 - HERO_PROBE_MIN_DIMMING));
  // THEN THE BAND, in scene light: a sprite texel t lit by multiplier m reads sum(w t m) / sum(w t) of
  // its day value, which lies between the smallest and the largest channel of m whatever t is; the
  // tolerance covers 8-bit quantisation through the inverse tone curve and the idle animation moving
  // the texels between the two frames.
  const HERO_BAND_TOLERANCE = 0.05;
  expect(heroRatio, evidence).toBeGreaterThan(Math.min(...spriteMultiplier) - HERO_BAND_TOLERANCE);
  expect(heroRatio, evidence).toBeLessThan(Math.max(...spriteMultiplier) + HERO_BAND_TOLERANCE);
  await captureDuskStrip(page, testInfo);
  await writeFile(
    path.join(DUSK_ARTIFACT_DIR, `${testInfo.project.name}-hero-brightness.json`),
    JSON.stringify({ dayHero, darkHero, heroRatio, tintLuminance, spriteMultiplier }, null, 2),
  );

  await setWave(page, 25);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightShift.phase)).toBe('dawn');
  await shot(page, testInfo, 'dawn-wave-25');
  await expectClean(errors);
});

test('lantern post is Night Shift gated and relights a true-dark light ring', async ({ page }, testInfo) => {
  const defaultErrors = await openGame(page, '?debug&timescale=3&nolevel&nowaves&seed=e1-night-default');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.ui?.buildables.map((entry) => entry.id))).not.toContain(
    'lantern_post',
  );
  await expect(selectBuildable(page, 'lantern_post')).resolves.toBe(false);
  await expectClean(defaultErrors);

  const errors = await openGame(page);
  await setBalance(page, 'enemy.hp', 500);
  await setBalance(page, 'enemy.speed', 0);
  await setWave(page, 10);
  await expect(selectBuildable(page, 'lantern_post')).resolves.toBe(true);
  await page.evaluate(() => window.__GR_TEST__?.setBuildMode(false));
  const repair = await relightLantern(page, 0);
  expect(repair).toMatchObject({ id: 'lantern_post', index: 0, cost: RELIGHT_COST });

  const lantern = COLD_LANTERN_POSITIONS[0]!;
  const inRadius = { x: lantern.x + 4, z: lantern.z };
  const outOfRadius = { x: lantern.x + 12, z: lantern.z };
  await expect(page.evaluate((pos) => window.__GR_TEST__?.spawnEnemyAt(pos.x, pos.z), inRadius)).resolves.toBe(true);
  await expect(page.evaluate((pos) => window.__GR_TEST__?.spawnEnemyAt(pos.x, pos.z), outOfRadius)).resolves.toBe(true);
  await expect
    .poll(() => enemyLights(page))
    .toEqual(expect.arrayContaining([expect.any(Number), expect.any(Number)]));
  const light = await enemyLights(page);
  expect(light[0]).toBeLessThanOrEqual(DARK_LIGHT);
  expect(light.at(-1)).toBeGreaterThanOrEqual(VISIBLE_LIGHT);

  await teleport(page, (inRadius.x + outOfRadius.x) / 2, lantern.z + 8);
  await page.waitForTimeout(180);
  expect(await enemyLightNear(page, outOfRadius)).toBeLessThanOrEqual(DARK_LIGHT);
  expect(await enemyLightNear(page, inRadius)).toBeGreaterThanOrEqual(VISIBLE_LIGHT);
  // RE-AIMED (F-SEF2-5b, test-truth-2, 2026-09-25): each read is now the spawned ENEMY's own sprite,
  // found through `enemyPositions()` and read at its torso over a DPR-normalised patch, and it is
  // compared in display luma, the space these two screen floors are written in (see `spriteLuminance`).
  const outOfRadiusSprite = await spriteLuminance(page, { enemyNear: outOfRadius });
  const inRadiusSprite = await spriteLuminance(page, { enemyNear: inRadius });
  const spriteEvidence = JSON.stringify({ outOfRadiusSprite, inRadiusSprite });
  await mkdir(LANTERN_ARTIFACT_DIR, { recursive: true });
  await writeFile(path.join(LANTERN_ARTIFACT_DIR, `${testInfo.project.name}-sprite-luminance.json`), `${spriteEvidence}\n`);
  expect(outOfRadiusSprite.luma, spriteEvidence).toBeLessThanOrEqual(DARK_SPRITE_LIGHT());
  expect(inRadiusSprite.luma, spriteEvidence).toBeGreaterThanOrEqual(VISIBLE_LIGHT);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.enemyDimming.sources)).toBeGreaterThanOrEqual(2);
  await shot(page, testInfo, 'true-dark-lantern-ring');

  await expectClean(errors);
});

test('lantern coverage is necessary for threat visibility', async ({ page }) => {
  const errors = await openGame(page, '?debug&contract=e1-night-shift&timescale=8&nolevel&nowaves&seed=e1-night-necessity');
  await setBalance(page, 'enemy.hp', 500);
  await setBalance(page, 'enemy.speed', 0);
  await setWave(page, 10);
  await teleport(page, 28, -28);
  await spawnAssault(page);
  const coldLights = await enemyLights(page);
  const coldVisible = visibleThreats(coldLights);
  expect(Math.max(...coldLights)).toBeLessThanOrEqual(DARK_LIGHT);

  await page.evaluate(() => window.__GR_TEST__?.clearEnemies());
  await relightLantern(page, 0);
  await teleport(page, 28, -28);
  await spawnAssault(page);
  const litLights = await enemyLights(page);
  const litVisible = visibleThreats(litLights);
  expect(litVisible - coldVisible).toBeGreaterThanOrEqual(3);
  expect(litVisible).toBeGreaterThanOrEqual(3);
  await expectClean(errors);
});

test('a lantern pool makes only its build island readable at true dark', async ({ page }, testInfo) => {
  const errors = await openGame(page, '?debug&contract=e1-night-shift&timescale=3&nolevel&nowaves&seed=e1-night-pool');
  await setWave(page, 10);
  await relightLantern(page, 0);
  const lantern = COLD_LANTERN_POSITIONS[0]!;
  await teleport(page, lantern.x + 1, lantern.z + 1);
  await page.waitForTimeout(180);

  const [inside, outside] = await groundLuminances(page, [
    { x: lantern.x + 2, z: lantern.z },
    testInfo.project.name === 'mobile-chrome'
      ? { x: lantern.x, z: lantern.z + 8 }
      : { x: lantern.x + 11, z: lantern.z },
  ]);
  const ratio = inside / Math.max(outside, 0.001);
  expect(ratio, JSON.stringify({ inside, outside })).toBeGreaterThanOrEqual(3);
  expect(outside).toBeLessThanOrEqual(0.06);

  await teleport(page, lantern.x, lantern.z - 5);
  await grantGold(page, 100);
  await expect(selectBuildable(page, 'palisade')).resolves.toBe(true);
  await page.waitForTimeout(180);
  await aimBuildAt(page, { x: lantern.x, z: lantern.z + 1 });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostLight ?? 0)).toBeGreaterThan(0.2);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightPools ?? 0)).toBeGreaterThanOrEqual(2);

  await mkdir(LANTERN_ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(LANTERN_ARTIFACT_DIR, `${testInfo.project.name}-lit-build-island.png`) });
  await writeFile(
    path.join(LANTERN_ARTIFACT_DIR, `${testInfo.project.name}-brightness.json`),
    JSON.stringify({ inside, outside, ratio }, null, 2),
  );
  await testInfo.attach('lantern-brightness', {
    body: JSON.stringify({ inside, outside, ratio }, null, 2),
    contentType: 'application/json',
  });
  await teleport(page, 20, -20);
  await page.waitForTimeout(180);
  await aimBuildAt(page, { x: 20, z: -14 }, 3);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostLight ?? 1)).toBeLessThan(0.05);
  await expectClean(errors);
});

test('cold lantern relight costs survive run suspend and continue', async ({ page, context }) => {
  const errors = await openGame(page, '?debug&contract=e1-night-shift&timescale=40&nokill&nolevel&nosteal&nowreck&seed=e1-night-suspend');
  const saved = await waitForSavedNightWave(page, 1);
  // DE-RACED 2026-09-24 (F-SEF2-5, task e1-spec-truth-1). This test asserts `restoredWave === 1` after
  // a round trip, and the suspend record is REWRITTEN on every `wave_started`: `RunManager` calls
  // `RunSuspendController.captureBoundary(event.wave)`, which stores `wave - 1`, so storage reads 1
  // only between the start of wave 2 and the start of wave 3. At timescale 40 with waveInterval 30
  // that window is about 750 ms of wall time, and everything below (four page round trips, the close,
  // the second boot) had to fit inside it. 5 of 5 green alone, red under a full battery; 5.1 percent
  // in the 2026-08-11 inventory.
  //
  // The interval alone CANNOT freeze it: `WaveSystem.planDueWaves` fixes the next wave's `spawnAt`
  // into `plannedPulses` one telegraph lead ahead, so raising `waves.waveInterval` after wave 2 has
  // started moves wave 4, not wave 3. The harness's own wave reset is what retracts the planned pulse
  // (`setWaveForTest` clears `plannedPulses` and re-derives `nextWaveAt` from the interval it reads at
  // that moment), so the interval is raised FIRST and the reset applied second. Nothing else writes
  // the record: `setWave` emits no `wave_started` (Game.ts, the harness handle), and page-hide flushes
  // the LAST snapshot rather than capturing a new one.
  await setBalance(page, 'waves.waveInterval', 9999);
  await setWave(page, 1);
  expect(
    saved.buildings
      .filter((entry) => entry.id === 'lantern_post')
      .map((entry) => ({
        index: entry.index,
        wrecked: entry.wrecked,
        repairCostOverride: entry.repairCostOverride,
        position: entry.position,
        rotationSteps: entry.rotationSteps,
      })),
  ).toEqual(
    COLD_LANTERNS.map(({ x, z, rotationSteps }, index) => ({
      index,
      wrecked: true,
      repairCostOverride: RELIGHT_COST,
      position: { x, z },
      rotationSteps,
    })),
  );
  await expectClean(errors);
  await page.close();

  const restoredPage = await context.newPage();
  const restoredErrors = await openGame(
    restoredPage,
    '?debug&contract=e1-night-shift&timescale=1&nolevel&nowaves&seed=e1-night-suspend',
  );
  await restoredPage.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.run.suspend.restored === true);
  await expect(restoredPage.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.run.suspend.restoredWave)).resolves.toBe(1);
  await expect(
    restoredPage.evaluate(() => (window.__THREE_GAME_DIAGNOSTICS__?.build as unknown as { lanternPostRotations: number[] }).lanternPostRotations),
  ).resolves.toEqual(COLD_LANTERNS.map(({ rotationSteps }) => rotationSteps));
  await shot(restoredPage, test.info(), 'authored-lantern-rotations-after-restore');
  await expect.poll(() => lanternHp(restoredPage).then((entries) => entries[0]?.repairCost)).toBe(RELIGHT_COST);
  expect(await relightLantern(restoredPage, 0)).toMatchObject({ id: 'lantern_post', index: 0, cost: RELIGHT_COST });
  await expectClean(restoredErrors);
  await restoredPage.close();
});

test('pre-placed lanterns leave the full player build cap available', async ({ page }, testInfo) => {
  const errors = await openGame(page, '?debug&contract=e1-night-shift&timescale=1&nolevel&nowaves&seed=e1-night-player-cap');
  const placed = await page.evaluate((maxCount) => {
    const game = window.__GR_TEST__!;
    let count = 0;
    for (let x = -28; x <= 28 && count < maxCount; x += 7) {
      if (game.placeFree('lantern_post', x, 28)) count += 1;
    }
    return count;
  }, Balance.lanternPost.maxCount);

  expect(placed).toBe(Balance.lanternPost.maxCount);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.lanternPosts)).toBe(
    COLD_LANTERNS.length + Balance.lanternPost.maxCount,
  );
  expect(
    await page.evaluate(() =>
      window.__THREE_GAME_DIAGNOSTICS__?.ui?.buildables.find((entry) => entry.id === 'lantern_post')?.count,
    ),
  ).toBe(Balance.lanternPost.maxCount);
  const ownership = await page.evaluate(() => {
    const game = window.__GR_TEST__!;
    const snapshot = game.captureSuspend();
    const before = snapshot.buildings.filter((entry) => entry.id === 'lantern_post').map((entry) => entry.preplaced === true);
    const restored = game.restoreSuspend(snapshot);
    const after = game.captureSuspend().buildings.filter((entry) => entry.id === 'lantern_post').map((entry) => entry.preplaced === true);
    return { before, restored, after };
  });
  expect(ownership.restored).toBe(true);
  expect(ownership.before).toEqual([...Array(COLD_LANTERNS.length).fill(true), ...Array(Balance.lanternPost.maxCount).fill(false)]);
  expect(ownership.after).toEqual(ownership.before);
  await shot(page, testInfo, 'full-player-lantern-cap');
  await expectClean(errors);
});

test('render dimming does not stop turret acquisition or damage', async ({ page }) => {
  const errors = await openGame(
    page,
    '?debug&contract=e1-night-shift&timescale=8&nolevel&nowaves&nosteal&nowreck&seed=e1-night-combat',
  );
  await setBalance(page, 'enemy.hp', 400);
  await setBalance(page, 'enemy.speed', 0);
  await setBalance(page, 'turret.range', 20);
  await setWave(page, 10);
  await grantGold(page, 120);
  await teleport(page, 4, 12);
  await expect(selectBuildable(page, 'turret')).resolves.toBe(true);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? false)).toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__?.confirmBuild())).resolves.toBe(true);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.turrets ?? 0)).toBe(1);
  await expect(page.evaluate(() => window.__GR_TEST__?.spawnEnemyAt(0, -4))).resolves.toBe(true);

  await expect
    .poll(() => page.evaluate(() => window.__GR_TEST__?.enemyPositions()[0]?.light ?? 1), { timeout: 8_000 })
    .toBeLessThanOrEqual(DARK_LIGHT);
  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.damageByOwner.turrets ?? 0), { timeout: 8_000 })
    .toBeGreaterThan(0);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.enemiesAlive)).toBe(1);
  await expectClean(errors);
});

test('wave 25 secures the claim through the dawn victory path', async ({ page }) => {
  const errors = await openGame(
    page,
    '?debug&contract=e1-night-shift&timescale=20&nolevel&nokill&nosteal&nowreck&seed=e1-night-victory',
  );
  await setBalance(page, 'enemy.speed', 0);
  await setBalance(page, 'waves.graceSeconds', 0.05);
  await setBalance(page, 'waves.waveInterval', 0.25);
  await setBalance(page, 'waves.trickleInterval', 999);
  await setBalance(page, 'waves.pulseBase', 0);
  await setBalance(page, 'waves.pulsePerWave', 0);
  await setBalance(page, 'waves.pulsesPerWave', 1);
  await page.evaluate(() => window.__GR_TEST__?.setWave(24));

  await expect
    .poll(
      () =>
        page.evaluate(() => ({
          wave: window.__THREE_GAME_DIAGNOSTICS__?.wave ?? 0,
          secured: window.__THREE_GAME_DIAGNOSTICS__?.run.secured ?? false,
          phase: window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightShift.phase,
        })),
      { timeout: 10_000 },
    )
    .toMatchObject({ wave: 25, secured: true, phase: 'dawn' });
  await expect(page.getByTestId('claim-secured')).toBeVisible();
  await expectClean(errors);
});

test('seeded Night Shift diagnostics and dark render budget are stable', async ({ page }) => {
  const errors = await openGame(page, '?debug&contract=e1-night-shift&timescale=3&nolevel&nowaves&seed=e1-night-stable');
  await setWave(page, 10);
  const first = await determinismSnapshot(page);
  await gotoGame(page, '?debug&contract=e1-night-shift&timescale=3&nolevel&nowaves&seed=e1-night-stable');
  await setWave(page, 10);
  const second = await determinismSnapshot(page);
  expect(second).toEqual(first);

  await gotoGame(page, '?debug&contract=e1-night-shift&timescale=3&nolevel&nowaves&stress=80&seed=e1-night-perf');
  await setWave(page, 10);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.frameMs.sampleCount ?? 0)).toBeGreaterThan(60);
  const perf = await page.evaluate(() => ({
    p95: window.__THREE_GAME_DIAGNOSTICS__?.frameMs.p95 ?? 0,
    calls: window.__THREE_GAME_DIAGNOSTICS__?.renderer.calls ?? 0,
  }));
  expect(perf.p95).toBeLessThanOrEqual(140);
  expect(perf.calls).toBeLessThanOrEqual(220);
  await expectClean(errors);
});

async function determinismSnapshot(page: Page): Promise<unknown> {
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 12);
  return page.evaluate(() => {
    const diagnostics = window.__THREE_GAME_DIAGNOSTICS__!;
    return {
      contract: diagnostics.contract.activeId,
      secureWave: diagnostics.contract.secureWave,
      lightRamp: diagnostics.contract.lightRamp,
      nightShift: diagnostics.lighting?.nightShift,
      tile: diagnostics.terrain.sim.tile,
      water: diagnostics.terrain.water
        ? {
            material: diagnostics.terrain.water.material,
            riverPresent: diagnostics.terrain.water.riverPresent,
            fordPresent: diagnostics.terrain.water.fordPresent,
            quality: diagnostics.terrain.water.quality,
            mobile: diagnostics.terrain.water.mobile,
            foam: diagnostics.terrain.water.foam,
            glints: diagnostics.terrain.water.glints,
            fordStones: diagnostics.terrain.water.fordStones,
            springPonds: diagnostics.terrain.water.springPonds,
            waterPhaseVariance: diagnostics.terrain.water.waterPhaseVariance,
          }
        : null,
      height: diagnostics.terrain.height.probes,
      scatter: diagnostics.terrain.detailScatter?.signature ?? null,
      harvest: diagnostics.harvest.activeNodes.map((node) => ({
        active: node.active,
        anchorIndex: node.anchorIndex,
        position: node.position,
        remaining: node.remaining,
      })),
      samples: [
        window.__GR_TEST__?.terrainSample(0, 0),
        window.__GR_TEST__?.terrainSample(-12, 0),
        window.__GR_TEST__?.terrainSample(12, 12),
      ],
    };
  });
}

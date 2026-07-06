import { expect, test, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

type SpriteSnapshot = {
  clip: string;
  frame: number;
  frameKey: string;
  frameCount: number;
  fps: number;
  loaded: boolean;
  direction?: string;
  mirrored?: boolean;
};

type ErrorBucket = {
  consoleErrors: string[];
  pageErrors: string[];
};

const shotDir = path.resolve('reviews/shots-008-rotation');
const directions = [
  ['s', { x: 0, y: 1 }, ['char-hero-sheet-rotation-r0c0.png', 'char-hero-sheet-rotation-r0c1.png'], false],
  ['se', { x: 1, y: 1 }, ['char-hero-sheet-rotation-r0c2.png', 'char-hero-sheet-rotation-r0c3.png'], false],
  ['e', { x: 1, y: 0 }, ['char-hero-sheet-rotation2-r0c2.png', 'char-hero-sheet-rotation2-r0c3.png'], false],
  ['ne', { x: 1, y: -1 }, ['char-hero-sheet-rotation-r1c2.png', 'char-hero-sheet-rotation-r1c3.png'], false],
  ['n', { x: 0, y: -1 }, ['char-hero-sheet-rotation-r2c0.png', 'char-hero-sheet-rotation-r2c1.png'], false],
  ['nw', { x: -1, y: -1 }, ['char-hero-sheet-rotation2-r1c0.png', 'char-hero-sheet-rotation2-r1c1.png'], false],
  ['w', { x: -1, y: 0 }, ['char-hero-sheet-rotation-r1c0.png', 'char-hero-sheet-rotation-r1c1.png'], false],
  ['sw', { x: -1, y: 1 }, ['char-hero-sheet-rotation2-r0c0.png', 'char-hero-sheet-rotation2-r0c1.png'], false],
] as const;

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openGame(page: Page, seed: string): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/?debug&nowaves&nolevel&seed=${seed}`);
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.addStyleTag({ content: '#touch-controls { display: flex !important; } .lil-gui, .dg.ac { display: none !important; }' });
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.hero']?.loaded === true);
  return errors;
}

const MOVE_KEYS = ['KeyW', 'KeyA', 'KeyS', 'KeyD'] as const;

async function pressMoveKeys(page: Page, x: number, y: number): Promise<void> {
  const absX = Math.abs(x);
  const absY = Math.abs(y);
  const diagonal = absX > 0.3 && absY > 0.3 && Math.min(absX, absY) / Math.max(absX, absY) >= 0.55;
  if (absY > 0.3 && (diagonal || absY >= absX)) await page.keyboard.down(y > 0 ? 'KeyS' : 'KeyW');
  if (absX > 0.3 && (diagonal || absX >= absY)) await page.keyboard.down(x > 0 ? 'KeyD' : 'KeyA');
}

async function releaseMoveKeys(page: Page): Promise<void> {
  for (const key of MOVE_KEYS) await page.keyboard.up(key);
}

async function moveStick(page: Page, x: number, y: number, steps = 4): Promise<void> {
  const box = await page.locator('#touch-stick').boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;
  const length = Math.hypot(x, y) || 1;
  const radius = box.width * 0.36;
  await page.mouse.move(box.x + box.width / 2 + (x / length) * radius, box.y + box.height / 2 + (y / length) * radius, { steps });
  await releaseMoveKeys(page);
  await pressMoveKeys(page, x, y);
}

async function startStick(page: Page, x: number, y: number): Promise<void> {
  const box = await page.locator('#touch-stick').boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await moveStick(page, x, y);
}

async function releaseStick(page: Page): Promise<void> {
  await page.mouse.up();
  await releaseMoveKeys(page);
}

async function waitForHero(page: Page, direction: string, clip = 'walk'): Promise<SpriteSnapshot> {
  await page.waitForFunction(
    ({ direction: expectedDirection, clip: expectedClip }) => {
      const snapshot = window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.hero'] as SpriteSnapshot | undefined;
      return snapshot?.loaded === true && snapshot.clip === expectedClip && snapshot.direction === expectedDirection;
    },
    { direction, clip },
  );
  return latestHero(page);
}

async function latestHero(page: Page): Promise<SpriteSnapshot> {
  return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.hero'] as SpriteSnapshot);
}

function vectorFromDegrees(degrees: number): { x: number; y: number } {
  const radians = (degrees * Math.PI) / 180;
  return { x: Math.sin(radians), y: Math.cos(radians) };
}

test('hero locomotion resolves all 8 contract directions', async ({ page }) => {
  const errors = await openGame(page, 'vp-02b-directions');
  await startStick(page, directions[0][1].x, directions[0][1].y);

  for (const [direction, vector, expectedFrames, mirrored] of directions) {
    await moveStick(page, vector.x, vector.y);
    const snapshot = await waitForHero(page, direction);
    expect(expectedFrames).toContain(snapshot.frameKey);
    expect(snapshot.mirrored).toBe(mirrored);
  }
  await releaseStick(page);

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('resolver hysteresis holds across small boundary oscillation', async ({ page }) => {
  const errors = await openGame(page, 'vp-02b-hysteresis');
  const low = vectorFromDegrees(107.5);
  const high = vectorFromDegrees(117.5);
  await startStick(page, low.x, low.y);
  await waitForHero(page, 'e');

  const sampled: string[] = [];
  for (let i = 0; i < 12; i += 1) {
    const vector = i % 2 === 0 ? high : low;
    await moveStick(page, vector.x, vector.y, 2);
    await page.waitForTimeout(70);
    sampled.push((await latestHero(page)).direction ?? '');
  }
  await releaseStick(page);

  expect(new Set(sampled)).toEqual(new Set(['e']));
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('idle snaps to rotation idle hemispheres after movement', async ({ page }) => {
  const errors = await openGame(page, 'vp-02b-idle');

  await startStick(page, 1, 0);
  await waitForHero(page, 'e');
  await releaseStick(page);
  await waitForHero(page, 's', 'idle');
  expect(await latestHero(page)).toMatchObject({
    frameKey: 'char-hero-sheet-rotation-r2c2.png',
    mirrored: false,
  });

  await startStick(page, 1, -1);
  await waitForHero(page, 'ne');
  await releaseStick(page);
  await waitForHero(page, 'n', 'idle');
  expect(await latestHero(page)).toMatchObject({
    frameKey: 'char-hero-sheet-rotation-r2c3.png',
    mirrored: false,
  });

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('action clips stay on coarse orientation cells and jumper diagnostics stay old shape', async ({ page }) => {
  const errors = await openGame(page, 'vp-02b-actions');
  await page.keyboard.press('KeyP');
  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.paused ?? false)).toBe(true);

  const actionSamples = await page.evaluate(async () => {
    const modulePath = '/src/assets/SpriteAnimator.ts';
    const mod = (await import(modulePath)) as {
      SpriteAnimator: new (slotId: string, material: { map: unknown; needsUpdate: boolean }, sprite: { scale: { x: number } }) => {
        update: (delta: number, clip: string, orientation: string) => void;
        dispose: () => void;
      };
      spriteAnimationDiagnostics: () => Partial<Record<string, SpriteSnapshot>>;
    };

    async function sample(clip: string, orientation: string): Promise<SpriteSnapshot & { scaleX: number }> {
      const material = { map: null as unknown, needsUpdate: false };
      const sprite = { scale: { x: 1 } };
      const animator = new mod.SpriteAnimator('char.hero', material, sprite);
      const deadline = performance.now() + 5000;
      while (performance.now() < deadline) {
        animator.update(1 / 60, clip, orientation);
        const snapshot = mod.spriteAnimationDiagnostics()['char.hero'];
        if (snapshot?.loaded === true && snapshot.clip === clip) {
          animator.dispose();
          return { ...snapshot, scaleX: sprite.scale.x };
        }
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      }
      const snapshot = mod.spriteAnimationDiagnostics()['char.hero'];
      animator.dispose();
      return { ...(snapshot as SpriteSnapshot), scaleX: sprite.scale.x };
    }

    return {
      panEast: await sample('pan', 'e'),
      aimSouth: await sample('aim', 's'),
    };
  });

  expect(['char-hero-sheet-side-actions-r0c0.png', 'char-hero-sheet-side-actions-r0c1.png']).toContain(actionSamples.panEast.frameKey);
  expect(actionSamples.panEast.direction).toBe('e');
  expect(actionSamples.panEast.mirrored).toBe(false);
  expect(actionSamples.panEast.scaleX).toBeGreaterThan(0);
  expect(actionSamples.aimSouth.frameKey).toBe('char-hero-sheet-front-r1c2.png');

  await page.evaluate(() => window.__GR_TEST__?.spawnPack(1, 5));
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.claim_jumper']?.loaded === true);
  const jumper = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.claim_jumper'] as SpriteSnapshot);
  expect(Object.keys(jumper).sort()).toEqual(['clip', 'fps', 'frame', 'frameCount', 'frameKey', 'loaded'].sort());

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('captures rotation scale-pulse review shots', async ({ page }, testInfo) => {
  // s23 retro-gate (s17 timeout-bump pattern): 12 canvas screenshots + 8 frameKey waits
  // legitimately exceed 30s on slow sandbox VMs; passes in seconds on real hardware.
  test.setTimeout(60_000);
  const errors = await openGame(page, `vp-02b-shots-${testInfo.project.name}`);
  fs.mkdirSync(shotDir, { recursive: true });

  await startStick(page, -1, 0);
  await waitForHero(page, 'w');
  for (const frameKey of ['char-hero-sheet-rotation-r1c0.png', 'char-hero-sheet-rotation-r1c1.png']) {
    await page.waitForFunction((key) => window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.hero']?.frameKey === key, frameKey);
    await page.locator('#game-canvas').screenshot({ path: path.join(shotDir, `w-${path.basename(frameKey, '.png')}.png`) });
  }

  await moveStick(page, 1, -1);
  await waitForHero(page, 'ne');
  for (const frameKey of ['char-hero-sheet-rotation-r1c2.png', 'char-hero-sheet-rotation-r1c3.png']) {
    await page.waitForFunction((key) => window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.hero']?.frameKey === key, frameKey);
    await page.locator('#game-canvas').screenshot({ path: path.join(shotDir, `ne-${path.basename(frameKey, '.png')}.png`) });
  }

  if (testInfo.project.name.includes('mobile')) {
    await page.screenshot({ fullPage: false, path: path.join(shotDir, '390px-frame.png') });
  } else {
    const crops: PNG[] = [];
    for (const [direction, vector] of directions) {
      await moveStick(page, vector.x, vector.y);
      await waitForHero(page, direction);
      crops.push(centerCrop(PNG.sync.read(await page.locator('#game-canvas').screenshot()), 240, 240));
    }
    fs.writeFileSync(path.join(shotDir, '8-direction-contact-strip.png'), PNG.sync.write(stitchHorizontal(crops)));
  }
  await releaseStick(page);

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

function centerCrop(source: PNG, width: number, height: number): PNG {
  const crop = new PNG({ width, height });
  const startX = Math.max(0, Math.floor((source.width - width) / 2));
  const startY = Math.max(0, Math.floor((source.height - height) / 2));
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const sourceOffset = ((startY + y) * source.width + startX + x) * 4;
      const targetOffset = (y * width + x) * 4;
      source.data.copy(crop.data, targetOffset, sourceOffset, sourceOffset + 4);
    }
  }
  return crop;
}

function stitchHorizontal(images: PNG[]): PNG {
  const width = images.reduce((sum, image) => sum + image.width, 0);
  const height = Math.max(...images.map((image) => image.height));
  const strip = new PNG({ width, height });
  let offsetX = 0;
  for (const image of images) {
    for (let y = 0; y < image.height; y += 1) {
      const sourceStart = y * image.width * 4;
      const targetStart = (y * width + offsetX) * 4;
      image.data.copy(strip.data, targetStart, sourceStart, sourceStart + image.width * 4);
    }
    offsetX += image.width;
  }
  return strip;
}

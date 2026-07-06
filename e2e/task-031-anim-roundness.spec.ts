import { expect, test, type Page } from '@playwright/test';

type ErrorBucket = {
  consoleErrors: string[];
  pageErrors: string[];
};

type SpriteSampleSummary = {
  sawFrameBlend: boolean;
  maxFrameBlendWindow: number;
  maxFadeWindow: number;
  maxBob: number;
  maxLean: number;
  fps: number;
  frameCount: number;
  frames: string[];
};

type SpriteSnapshot = {
  clip?: string;
  fadeActive?: boolean;
  frameBlendActive?: boolean;
  frameBlendMsRemaining?: number;
  frameBlendWindow?: number;
};

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('net::ERR_INSUFFICIENT_RESOURCES')) bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openGame(page: Page, seed: string): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/?debug&nowaves&nolevel&seed=${seed}`);
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function setBalance(page: Page, path: string, value: number): Promise<void> {
  await expect(page.evaluate(([key, next]) => window.__GR_TEST__?.setBalance(key, next), [path, value] as const)).resolves.toBe(
    true,
  );
}

async function showTouchStick(page: Page): Promise<void> {
  await page.addStyleTag({ content: '#touch-controls { display: flex !important; } .lil-gui, .dg.ac { display: none !important; }' });
}

async function moveStick(page: Page, x: number, y: number, steps = 4): Promise<void> {
  const box = await page.locator('#touch-stick').boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;
  const length = Math.hypot(x, y) || 1;
  const radius = box.width * 0.36;
  await page.mouse.move(box.x + box.width / 2 + (x / length) * radius, box.y + box.height / 2 + (y / length) * radius, { steps });
}

const MOVE_KEYS = ['KeyW', 'KeyA', 'KeyS', 'KeyD'] as const;

// The touch stick is driven by pointer events; Playwright's page.mouse drives
// those on desktop but not on the touch-emulated mobile project, so the hero
// never walks there. Keyboard movement (readMovement adds keyVector + pointer)
// is viewport-independent, so we hold the matching WASD keys too — the gait
// assertions only need the hero locomoting, not the specific input source.
async function pressMoveKeys(page: Page, x: number, y: number): Promise<void> {
  if (y > 0.3) await page.keyboard.down('KeyS');
  if (y < -0.3) await page.keyboard.down('KeyW');
  if (x > 0.3) await page.keyboard.down('KeyD');
  if (x < -0.3) await page.keyboard.down('KeyA');
}

async function releaseMoveKeys(page: Page): Promise<void> {
  for (const key of MOVE_KEYS) await page.keyboard.up(key);
}

async function startStick(page: Page, x: number, y: number): Promise<void> {
  const box = await page.locator('#touch-stick').boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await moveStick(page, x, y);
  await pressMoveKeys(page, x, y);
}

async function releaseStick(page: Page): Promise<void> {
  await page.mouse.up();
  await releaseMoveKeys(page);
}

async function waitForSprite(page: Page, slot: string, frameCount = 2): Promise<void> {
  await page.waitForFunction(
    ({ wantedSlot, wantedFrames }) => {
      const snapshot = window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations[wantedSlot] as
        | { loaded?: boolean; frameCount?: number }
        | undefined;
      return snapshot?.loaded === true && (snapshot.frameCount ?? 0) >= wantedFrames;
    },
    { wantedSlot: slot, wantedFrames: frameCount },
  );
}

async function collectSpriteSamples(page: Page, slot: string, durationMs: number): Promise<SpriteSampleSummary> {
  return page.evaluate(
    async ({ wantedSlot, duration }) => {
      const frames: string[] = [];
      let lastFrame = '';
      let sawFrameBlend = false;
      let maxFrameBlendWindow = 0;
      let maxFadeWindow = 0;
      let maxBob = 0;
      let maxLean = 0;
      let fps = 0;
      let frameCount = 0;
      const start = performance.now();
      while (performance.now() - start < duration) {
        const snapshot = window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations[wantedSlot] as
          | {
              frameKey?: string;
              frameBlendActive?: boolean;
              frameBlendWindow?: number;
              fadeWindow?: number;
              bobOffset?: number;
              leanDeg?: number;
              fps?: number;
              frameCount?: number;
            }
          | undefined;
        if (snapshot) {
          if (snapshot.frameKey && snapshot.frameKey !== lastFrame) {
            frames.push(snapshot.frameKey);
            lastFrame = snapshot.frameKey;
          }
          sawFrameBlend ||= snapshot.frameBlendActive === true;
          maxFrameBlendWindow = Math.max(maxFrameBlendWindow, snapshot.frameBlendWindow ?? 0);
          maxFadeWindow = Math.max(maxFadeWindow, snapshot.fadeWindow ?? 0);
          maxBob = Math.max(maxBob, Math.abs(snapshot.bobOffset ?? 0));
          maxLean = Math.max(maxLean, Math.abs(snapshot.leanDeg ?? 0));
          fps = snapshot.fps ?? fps;
          frameCount = snapshot.frameCount ?? frameCount;
        }
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      }
      return { sawFrameBlend, maxFrameBlendWindow, maxFadeWindow, maxBob, maxLean, fps, frameCount, frames };
    },
    { wantedSlot: slot, duration: durationMs },
  );
}

async function readSprite(page: Page, slot: string): Promise<SpriteSnapshot> {
  return page.evaluate((wantedSlot) => {
    const snapshot = window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations[wantedSlot] as SpriteSnapshot | undefined;
    return {
      clip: snapshot?.clip,
      fadeActive: snapshot?.fadeActive,
      frameBlendActive: snapshot?.frameBlendActive,
    };
  }, slot);
}

function expectCycleOrder(frames: string[], cycle: readonly string[]): void {
  expect(new Set(frames)).toEqual(new Set(cycle));
  for (let i = 1; i < frames.length; i += 1) {
    const previous = cycle.indexOf(frames[i - 1]!);
    const current = cycle.indexOf(frames[i]!);
    expect(current).toBe((previous + 1) % cycle.length);
  }
}

test('default frame blending and gait motion are active for hero and bandits', async ({ page }) => {
  const errors = await openGame(page, 'task-031-defaults');
  await setBalance(page, 'enemy.hp', 999);
  await setBalance(page, 'enemy.contactDamage', 0);

  await showTouchStick(page);
  await startStick(page, 0, 1);
  await waitForSprite(page, 'char.hero');
  const hero = await collectSpriteSamples(page, 'char.hero', 1_100);
  const serializedHeroBlend = await page.evaluate(async () => {
    const deadline = performance.now() + 2_000;
    while (performance.now() < deadline) {
      const snapshot = window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.hero'];
      if (snapshot?.frameBlendActive === true) return snapshot;
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    }
    throw new Error('Timed out waiting for serialized hero frame blend');
  });
  expect(serializedHeroBlend.frameBlendActive).toBe(true);
  expect(serializedHeroBlend.frameBlendMsRemaining).toBeGreaterThan(0);
  expect(serializedHeroBlend.frameBlendWindow).toBeGreaterThan(0);
  await releaseStick(page);
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.hero']?.clip === 'idle');
  const idleHero = await readSprite(page, 'char.hero');
  expect(idleHero.frameBlendActive).toBe(false);
  expect(idleHero.fadeActive).toBe(false);

  expect(hero.frameCount).toBeGreaterThanOrEqual(2);
  expect(hero.fps).toBeCloseTo(5.5, 1);
  expect(hero.sawFrameBlend).toBe(true);
  expect(hero.maxBob).toBeGreaterThan(0.015);
  expect(hero.maxLean).toBeGreaterThan(1);

  await expect(page.evaluate(() => window.__GR_TEST__?.scriptEnemyAt(-8, 7, 8, 7, 4))).resolves.toBe(true);
  await waitForSprite(page, 'char.claim_jumper');
  const enemy = await collectSpriteSamples(page, 'char.claim_jumper', 1_100);
  expect(enemy.frameCount).toBeGreaterThanOrEqual(2);
  expect(enemy.fps).toBeCloseTo(5.5, 1);
  expect(enemy.sawFrameBlend).toBe(true);
  expect(enemy.maxBob).toBeGreaterThan(0.015);
  expect(enemy.maxLean).toBeGreaterThan(1);

  const beforeFadeWindow = enemy.maxFadeWindow;
  await page.evaluate(() => {
    window.__GR_TEST__?.clearEnemies();
    window.__GR_TEST__?.scriptEnemyAt(0, 8, 0, -8, 4);
  });
  const enemyTurn = await collectSpriteSamples(page, 'char.claim_jumper', 500);
  expect(enemyTurn.maxFadeWindow).toBeGreaterThan(beforeFadeWindow);

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('zeroed animation knobs preserve hard frameKey cycling', async ({ page }) => {
  const errors = await openGame(page, 'task-031-zero-knobs');
  await setBalance(page, 'anim.frameBlendMs', 0);
  await setBalance(page, 'anim.walkFps', 0);
  await setBalance(page, 'anim.bobAmp', 0);
  await setBalance(page, 'anim.leanDeg', 0);
  const testFrames = ['#111111', '#333333', '#777777', '#bbbbbb'];
  await page.evaluate((frames) => window.__GR_TEST__?.setTestClip('char.hero', frames, 4), testFrames);
  await waitForSprite(page, 'char.hero', 4);

  await showTouchStick(page);
  await startStick(page, 0, 1);
  const hero = await collectSpriteSamples(page, 'char.hero', 1_250);
  await releaseStick(page);

  expect(hero.fps).toBe(4);
  expect(hero.sawFrameBlend).toBe(false);
  expect(hero.maxFrameBlendWindow).toBe(0);
  expect(hero.maxBob).toBe(0);
  expect(hero.maxLean).toBe(0);
  expectCycleOrder(hero.frames, testFrames);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

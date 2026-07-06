import { mkdirSync } from 'node:fs';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { OrientationResolver } from '../src/assets/OrientationResolver';
import { Balance } from '../src/game/Balance';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type Point = { x: number; z: number };
type SpriteSnapshot = {
  clip: string;
  frame: number;
  frameKey: string;
  frameCount: number;
  fps: number;
  loaded: boolean;
  direction?: string;
};

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openGame(page: Page, query: string): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/${query}`);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function setAgentLevel(page: Page, level: number): Promise<void> {
  await page.addInitScript((agentLevel) => {
    localStorage.setItem(
      'gr.meta.v1',
      JSON.stringify({
        version: 1,
        tracks: { territory: 0, science: 0, hero: 0, agent: agentLevel },
      }),
    );
  }, level);
}

async function saveShot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  mkdirSync('artifacts/m4-re-land', { recursive: true });
  await page.screenshot({ path: `artifacts/m4-re-land/${testInfo.project.name}-${name}.png`, fullPage: true });
}

async function saveM407Shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  mkdirSync('artifacts/m4-07', { recursive: true });
  await page.screenshot({ path: `artifacts/m4-07/${testInfo.project.name}-${name}.png`, fullPage: true });
}

async function hideDebugGui(page: Page): Promise<void> {
  await page.evaluate(() => {
    const gui = document.querySelector<HTMLElement>('.lil-gui');
    if (gui) gui.style.display = 'none';
  });
}

async function companion(page: Page): Promise<{
  visible: boolean;
  moving: boolean;
  working: boolean;
  receiptCount: number;
  lastLine: string | null;
  position: { x: number; y: number; z: number };
  target: Point;
}> {
  return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.agent.embodiment);
}

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

async function waitForProspectorSprite(page: Page): Promise<SpriteSnapshot> {
  await page.waitForFunction(() => {
    const snapshot = window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.prospector_agent'];
    return (
      snapshot?.loaded === true &&
      snapshot.frameCount === 4 &&
      snapshot.frameKey.startsWith('char-prospector-sheet-hover4-')
    );
  });
  return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.spriteAnimations['char.prospector_agent'] as SpriteSnapshot);
}

async function sampleProspectorFrameAdvances(page: Page, sampleMs: number): Promise<{ advances: number; samples: number }> {
  return page.evaluate(async (durationMs) => {
    const frames: number[] = [];
    const deadline = performance.now() + durationMs;
    await new Promise<void>((resolve) => {
      const tick = () => {
        const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
        const sprite = diagnostics?.spriteAnimations['char.prospector_agent'];
        if (diagnostics?.agent.embodiment.moving && sprite?.clip === 'walk') frames.push(sprite.frame);
        if (performance.now() >= deadline || diagnostics?.agent.embodiment.moving !== true) {
          resolve();
          return;
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    const advances = frames.reduce((count, frame, index) => count + (index > 0 && frame !== frames[index - 1] ? 1 : 0), 0);
    return { advances, samples: frames.length };
  }, sampleMs);
}

function expectedDirection(dx: number, dz: number): string {
  return new OrientationResolver().resolve(dx, dz);
}

test('plain boot renders the Prospector near the claim with no debug gate', async ({ page }, testInfo) => {
  const errors = await openGame(page, '?nowaves&nolevel&seed=m4-06-plain');

  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.agent.embodiment.visible ?? false), {
      timeout: 6_000,
    })
    .toBe(true);
  const snap = await companion(page);
  expect(distance(snap.position, { x: Balance.agent.homeX, z: Balance.agent.homeZ })).toBeLessThan(0.35);
  expect(snap.moving).toBe(false);
  expect(snap.receiptCount).toBeGreaterThanOrEqual(1);
  await expect(page.getByTestId('hud-agent')).toContainText('L0');
  await expect(page.getByTestId('hud-agent')).toContainText('suggest-only');

  await saveShot(page, testInfo, 'idle');
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('real Prospector sprite loads and faces pan movement', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  await page.goto('/?nowaves&nolevel&seed=m4-07-plain-sprite');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);

  const idle = await waitForProspectorSprite(page);
  expect(idle.clip).toBe('idle');
  expect(idle.fps).toBe(4);
  expect(idle.frameKey).not.toContain('createProspectorTexture');
  await saveM407Shot(page, testInfo, 'idle');

  await page.evaluate((agentLevel) => {
    localStorage.setItem(
      'gr.meta.v1',
      JSON.stringify({
        version: 1,
        tracks: { territory: 0, science: 0, hero: 0, agent: agentLevel },
      }),
    );
  }, 2);
  await page.goto('/?debug&timescale=4&nowaves&nolevel&seed=m4-07-drive-sprite');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.waitForFunction(() => Boolean(window.__GR_AGENT__));
  await hideDebugGui(page);
  await waitForProspectorSprite(page);

  const routes = await page.evaluate(() => {
    const start = window.__THREE_GAME_DIAGNOSTICS__!.agent.embodiment.position;
    const nodes = window.__THREE_GAME_DIAGNOSTICS__!.harvest.activeNodes.filter((node) => node.active);
    return nodes
      .map((node) => {
        const dx = node.position.x - start.x;
        const dz = node.position.z - start.z;
        return {
          id: node.id,
          position: node.position,
          distance: Math.hypot(dx, dz),
          dx,
          dz,
        };
      })
      .sort((a, b) => b.distance - a.distance);
  });
  const route = routes.find((node) => node.distance > 1 && expectedDirection(node.dx, node.dz) !== 's') ?? null;
  if (!route) throw new Error('No active pan node can exercise non-south Prospector facing.');
  const direction = expectedDirection(route.dx, route.dz);

  const receipt = await page.evaluate((nodeId) => window.__GR_AGENT__?.panAt(nodeId), route.id);
  expect((receipt as { tool?: string } | undefined)?.tool).toBe('et.goldrush.pan_at');
  await page.waitForFunction(
    (direction) => {
      const sprite = window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.prospector_agent'];
      const body = window.__THREE_GAME_DIAGNOSTICS__?.agent.embodiment;
      return (
        body?.moving === true &&
        sprite?.loaded === true &&
        sprite.clip === 'walk' &&
        sprite.direction === direction &&
        sprite.frameKey.startsWith('char-prospector-sheet-hover4-')
      );
    },
    direction,
  );
  const rate = await sampleProspectorFrameAdvances(page, 950);
  expect(rate.samples).toBeGreaterThan(8);
  expect(rate.advances).toBeGreaterThanOrEqual(2);
  expect(rate.advances).toBeLessThanOrEqual(5);
  await saveM407Shot(page, testInfo, 'mid-action');

  const moving = await companion(page);
  expect(distance(moving.target, route.position)).toBeLessThan(0.01);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('debug receipt moves the Prospector toward a panning target and floats ledger voice', async ({ page }, testInfo) => {
  await setAgentLevel(page, 2);
  const errors = await openGame(page, '?debug&timescale=4&nowaves&nolevel&seed=m4-06-pan');
  await page.waitForFunction(() => Boolean(window.__GR_AGENT__));
  await hideDebugGui(page);

  await expect(page.getByTestId('hud-agent')).toContainText('L2');
  await expect(page.getByTestId('hud-agent')).toContainText('trusted-routine');

  const before = await companion(page);
  const node = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.harvest.activeNodes.find((entry) => entry.active));
  expect(node).toBeTruthy();
  const beforeFloats = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.vfx.activeFloatTexts ?? 0);
  const receipt = await page.evaluate((nodeId) => window.__GR_AGENT__?.panAt(nodeId), node!.id);
  expect((receipt as { tool?: string } | undefined)?.tool).toBe('et.goldrush.pan_at');

  await expect
    .poll(() => companion(page).then((snap) => distance(snap.position, before.position)), { timeout: 8_000 })
    .toBeGreaterThan(0.3);
  const mid = await companion(page);
  expect(distance(mid.target, node!.position)).toBeLessThan(0.01);
  expect(mid.lastLine).toBe('pan...');
  await expect(page.getByTestId('hud-agent-feed')).toContainText('Pan');
  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.vfx.activeFloatTexts ?? 0), { timeout: 2_000 })
    .toBeGreaterThan(beforeFloats);

  await saveShot(page, testInfo, 'mid-action');
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('permission-denied receipts do not move the Prospector', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=4&nowaves&nolevel&seed=m4-06-denied');
  await page.waitForFunction(() => Boolean(window.__GR_AGENT__));
  const before = await companion(page);
  const node = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.harvest.activeNodes.find((entry) => entry.active));
  expect(node).toBeTruthy();

  const receipt = await page.evaluate((nodeId) => window.__GR_AGENT__?.panAt(nodeId), node!.id);
  expect((receipt as { outcome?: { ok?: boolean; reason?: string } } | undefined)?.outcome).toMatchObject({
    ok: false,
    reason: 'PERMISSION_DENIED',
  });
  await page.waitForTimeout(350);
  const after = await companion(page);

  expect(distance(after.position, before.position)).toBeLessThan(0.08);
  expect(distance(after.target, before.target)).toBeLessThan(0.01);
  expect(distance(after.target, node!.position)).toBeGreaterThan(0.5);
  expect(['held', 'ask me', 'no trust']).toContain(after.lastLine);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('the Prospector has no collider for scripted enemy movement', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=6&nowaves&nokill&nolevel&seed=m4-06-collider');
  await page.waitForFunction(() => Boolean(window.__GR_TEST__));
  await page.evaluate(() => window.__GR_TEST__?.teleport(12, 12));
  const snap = await companion(page);
  const start = { x: snap.position.x - 4, z: snap.position.z };
  const target = { x: snap.position.x + 4, z: snap.position.z };

  await expect(
    page.evaluate(
      ({ x, z, tx, tz }) => window.__GR_TEST__?.scriptEnemyAt(x, z, tx, tz, 3),
      { x: start.x, z: start.z, tx: target.x, tz: target.z },
    ),
  ).resolves.toBe(true);

  await page.evaluate(
    ({ companionPoint, targetPoint }) => {
      const w = window as unknown as {
        __M4_06_PATH__?: { reached: boolean; samples: number; minCompanionDistance: number; maxZDeviation: number };
      };
      w.__M4_06_PATH__ = {
        reached: false,
        samples: 0,
        minCompanionDistance: Number.POSITIVE_INFINITY,
        maxZDeviation: 0,
      };
      const tick = () => {
        const track = w.__M4_06_PATH__!;
        const enemy = window.__GR_TEST__?.enemyPositions()[0];
        if (enemy) {
          track.samples += 1;
          track.minCompanionDistance = Math.min(
            track.minCompanionDistance,
            Math.hypot(enemy.x - companionPoint.x, enemy.z - companionPoint.z),
          );
          track.maxZDeviation = Math.max(track.maxZDeviation, Math.abs(enemy.z - companionPoint.z));
          if (Math.hypot(enemy.x - targetPoint.x, enemy.z - targetPoint.z) < 0.45) track.reached = true;
        }
        if (!track.reached) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    },
    { companionPoint: snap.position, targetPoint: target },
  );

  await expect
    .poll(() => page.evaluate(() => (window as unknown as { __M4_06_PATH__?: { reached: boolean } }).__M4_06_PATH__?.reached ?? false), {
      timeout: 10_000,
    })
    .toBe(true);
  const path = await page.evaluate(() =>
    (window as unknown as {
      __M4_06_PATH__?: { samples: number; minCompanionDistance: number; maxZDeviation: number };
    }).__M4_06_PATH__
  );
  expect(path?.samples ?? 0).toBeGreaterThan(0);
  expect(path?.minCompanionDistance ?? 99).toBeLessThan(0.35);
  expect(path?.maxZDeviation ?? 99).toBeLessThan(0.2);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
